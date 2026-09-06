/* ─── Scan runner — shared by the free check and the paid full battery ─────
   Flow: build prompt battery → run 4-engine probes (graceful degradation)
   → heuristic triage → Claude grades flagged items (paid battery only)
   → insert hash-anchored evidence rows → update the scan row. */

import { supabaseAdmin } from './supabase'
import { buildPromptBattery, FREE_PROMPT_COUNT } from './prompts'
import { runBattery, engineStatusMatrix, ENGINE_IDS, BatteryItem } from './engines'
import { heuristicFlag, combineResults } from './triage'
import { evidenceHash } from './evidence'
import { logEventAsync } from './ops/log'
import { emitMarketingEventAsync } from './marketing'

export interface ScanRow {
  id: string
  scan_ref: string
  entity: string
  entity_url: string | null
  email: string | null
  tier: string
  status: string
}

export interface RunScanResult {
  ok: boolean
  score: number
  flagsCount: number
  probedCount: number
  engines: ReturnType<typeof engineStatusMatrix>
  error?: string
}

/** Cap on Claude grading calls per battery — cost control. */
const MAX_GRADED_FLAGS = 5

/**
 * Claude grades a flagged item for confidence + writes the narrative.
 * Language guard (liability shrinker): the prompt forbids legal
 * conclusions — output is "appears factually inaccurate because…",
 * never "this is defamation".
 */
async function gradeFlag(item: BatteryItem, entity: string): Promise<{ confidence: string; narrative: string } | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key || !item.response) return null
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_GRADING_MODEL ?? 'claude-3-5-haiku-20241022',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: [
            `An AI answer engine was asked: "${item.prompt}"`,
            `It answered about "${entity}":`,
            `"""${item.response.slice(0, 2000)}"""`,
            ``,
            `This answer was flagged by a heuristic as a suspected falsehood about the named entity.`,
            `Respond with exactly two lines:`,
            `CONFIDENCE: low|medium|high`,
            `NARRATIVE: One or two sentences stating what the answer claims and why it appears factually inaccurate or unverifiable. Never use legal conclusions (never "defamation", "libel", "liable"); write "this claim appears factually inaccurate because …" style only.`,
          ].join('\n'),
        }],
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const text: string = (data?.content ?? [])
      .filter((b: { type?: string }) => b?.type === 'text')
      .map((b: { text?: string }) => b.text ?? '')
      .join('\n')
    const confidence = /confidence:\s*(low|medium|high)/i.exec(text)?.[1]?.toLowerCase() ?? 'low'
    const narrative = /narrative:\s*([\s\S]+)/i.exec(text)?.[1]?.trim() ?? ''
    if (!narrative) return null
    return { confidence, narrative: narrative.slice(0, 1000) }
  } catch (err) {
    console.warn('[run-scan] grading failed:', err instanceof Error ? err.message : err)
    return null
  }
}

export async function executeScan(scan: ScanRow, mode: 'free' | 'full'): Promise<RunScanResult> {
  const engines = engineStatusMatrix()
  const battery = buildPromptBattery(scan.entity, scan.entity_url)
  const prompts = mode === 'free' ? battery.slice(0, FREE_PROMPT_COUNT) : battery

  await supabaseAdmin.from('falseecho_scans').update({ status: 'running' }).eq('id', scan.id)

  const items = await runBattery(prompts, scan.entity)

  // Grade flagged items (paid battery only, capped, graceful without a key)
  const graded = new Map<number, { confidence: string; narrative: string }>()
  if (mode === 'full') {
    const flagged = items.filter((i) => i.status === 'ok' && i.response && heuristicFlag(i.response, scan.entity).flagged)
    for (const item of flagged.slice(0, MAX_GRADED_FLAGS)) {
      const g = await gradeFlag(item, scan.entity)
      if (g) graded.set(item.seq, g)
    }
  }

  // Evidence rows — each hash-anchored (SHA-256 + UTC timestamp + seq)
  const rows = []
  for (const item of items) {
    const scannedAt = new Date().toISOString()
    const response = item.response ?? ''
    const flag = item.status === 'ok' ? heuristicFlag(response, scan.entity) : { flagged: false, terms: [] as string[] }
    const g = graded.get(item.seq)
    rows.push({
      scan_id: scan.id,
      entity: scan.entity,
      engine: item.engine,
      prompt: item.prompt,
      response: item.status === 'ok' ? response : null,
      status: item.status,
      sha256: evidenceHash({
        scanId: scan.id,
        engine: item.engine,
        seq: item.seq,
        prompt: item.prompt,
        response,
        scannedAt,
      }),
      seq: item.seq,
      flagged: flag.flagged,
      flag_terms: flag.terms,
      confidence: g?.confidence ?? null,
      narrative: g?.narrative ?? null,
      scanned_at: scannedAt,
    })
  }

  const { error: insErr } = await supabaseAdmin.from('falseecho_evidence').insert(rows)
  if (insErr) {
    console.error('[run-scan] evidence insert failed:', insErr.message)
    await supabaseAdmin.from('falseecho_scans').update({ status: 'failed' }).eq('id', scan.id)
    return { ok: false, score: 0, flagsCount: 0, probedCount: 0, engines, error: 'evidence_insert_failed' }
  }

  const scoring = combineResults(
    rows.map((r) => ({ engine: r.engine, status: r.status as 'ok' | 'unavailable' | 'error', flagged: r.flagged })),
    ENGINE_IDS,
  )

  await supabaseAdmin
    .from('falseecho_scans')
    .update({
      status: mode === 'free' ? 'free_complete' : 'delivered',
      score: scoring.score,
      flags_count: scoring.flagsCount,
      engines: engines,
      completed_at: new Date().toISOString(),
    })
    .eq('id', scan.id)

  logEventAsync({
    type: 'report.generated',
    source: 'falseecho',
    ref_id: scan.scan_ref,
    email: scan.email ?? undefined,
    status: 'ok',
    metadata: {
      mode,
      score: scoring.score,
      flags: scoring.flagsCount,
      probed: scoring.probedCount,
      unavailable_engines: scoring.unavailableEngines,
    },
  })

  // Marketing hook (goal M.3): hand flagged evidence to the hub content
  // queue as falsehood_detected events. Fire-and-forget, capped per scan —
  // marketing must never break or delay a scan. No-op without
  // MARKETING_TRIGGER_URL configured.
  const MAX_MARKETING_EVENTS = 3
  for (const row of rows.filter((r) => r.flagged).slice(0, MAX_MARKETING_EVENTS)) {
    emitMarketingEventAsync({
      product: 'falseecho',
      event_type: 'falsehood_detected',
      payload: {
        entity: scan.entity,
        engine: row.engine,
        false_claim: (row.response ?? '').slice(0, 500),
        actual_fact: row.narrative ?? null,
        confidence: row.confidence ?? null,
        evidence_hash: row.sha256,
      },
    })
  }

  return {
    ok: true,
    score: scoring.score,
    flagsCount: scoring.flagsCount,
    probedCount: scoring.probedCount,
    engines,
  }
}
