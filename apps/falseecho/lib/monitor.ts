/* ─── Monitor-tier daily sweep — re-scan + diff + alert ─────────────────────
   Called by /api/cron/monitor (Vercel cron, daily). For each active monitor
   due for a re-scan (falseecho_monitors.next_scan_at <= now): run the full
   probe battery via executeScan — the same machinery as the paid scan flow,
   nothing duplicated — storing results as a new falseecho_scans row so
   hash-anchored evidence accumulates per day. Flagged items are diffed
   against the monitor's previous scan; newly flagged (engine, prompt) pairs
   trigger the subscriber alert email. Per-monitor failures are isolated:
   one bad monitor never fails the run. */

import { supabaseAdmin } from './supabase'
import { executeScan, ScanRow } from './run-scan'
import { scanHash } from './evidence'
import { sendMonitorAlert } from './email'
import { logEventAsync } from './ops/log'

/**
 * Hard cap on monitors processed per invocation. Each monitor costs a full
 * 25-prompt × 4-engine battery, so this keeps the run inside Vercel function
 * duration limits; due monitors beyond the cap stay due and are picked up
 * first (least-recently-scanned ordering) on the next run.
 */
const MONITORS_PER_RUN = 25

export interface MonitorSweepSummary {
  scanned: number
  alerted: number
  /** Due monitors left unprocessed because of MONITORS_PER_RUN. */
  skipped: number
  errors: string[]
}

interface MonitorRow {
  id: string
  email: string
  entity: string
  scan_id: string | null
  next_scan_at: string | null
}

function nextDay(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString()
}

export async function runMonitorSweep(): Promise<MonitorSweepSummary> {
  const summary: MonitorSweepSummary = { scanned: 0, alerted: 0, skipped: 0, errors: [] }

  // Graceful degradation: no Supabase env → log + exit clean (cron exits 200).
  const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !serviceKey) {
    console.warn('[cron/monitor] Supabase env not configured — skipping sweep')
    summary.errors.push('supabase_not_configured')
    return summary
  }

  const now = new Date().toISOString()

  // Least-recently-scanned first; one extra row detects backlog past the cap.
  const { data: dueRows, error: dueErr } = await supabaseAdmin
    .from('falseecho_monitors')
    .select('id, email, entity, scan_id, next_scan_at')
    .eq('status', 'active')
    .lte('next_scan_at', now)
    .order('next_scan_at', { ascending: true })
    .limit(MONITORS_PER_RUN + 1)

  if (dueErr) {
    console.error('[cron/monitor] due-monitor query failed:', dueErr.message)
    summary.errors.push(`due_query: ${dueErr.message}`)
    return summary
  }

  const due = (dueRows ?? []) as MonitorRow[]
  const batch = due.slice(0, MONITORS_PER_RUN)
  summary.skipped = due.length - batch.length

  // Sequential on purpose: batteries are already internally concurrent, and
  // serial monitors keep peak runtime/memory inside the function budget.
  for (const monitor of batch) {
    try {
      await processMonitor(monitor, summary)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[cron/monitor] monitor ${monitor.id} (${monitor.entity}) failed:`, msg)
      summary.errors.push(`${monitor.entity}: ${msg}`)
    }
  }

  return summary
}

async function processMonitor(monitor: MonitorRow, summary: MonitorSweepSummary): Promise<void> {
  // Diff baseline: (engine, prompt) pairs flagged by the previous scan.
  const prevFlags = new Set<string>()
  let entityUrl: string | null = null
  if (monitor.scan_id) {
    const { data: prevEvidence } = await supabaseAdmin
      .from('falseecho_evidence')
      .select('engine, prompt')
      .eq('scan_id', monitor.scan_id)
      .eq('flagged', true)
    for (const row of (prevEvidence ?? []) as Array<{ engine: string; prompt: string }>) {
      prevFlags.add(`${row.engine}::${row.prompt}`)
    }

    const { data: prevScan } = await supabaseAdmin
      .from('falseecho_scans')
      .select('entity_url')
      .eq('id', monitor.scan_id)
      .maybeSingle()
    entityUrl = (prevScan as { entity_url: string | null } | null)?.entity_url ?? null
  }

  // New scan row — daily evidence accumulates, hash-anchored. paid_at is set
  // because monitor is a paid tier (the report page paywalls on paid_at).
  const scanRef =
    'FE-' + new Date().getUTCFullYear() + '-' + String(Math.floor(Math.random() * 90000) + 10000)
  const { data: scan, error: scanErr } = await supabaseAdmin
    .from('falseecho_scans')
    .insert({
      scan_ref: scanRef,
      entity: monitor.entity,
      entity_url: entityUrl,
      email: monitor.email,
      tier: 'monitor',
      status: 'pending',
      paid_at: new Date().toISOString(),
    })
    .select('id, scan_ref, entity, entity_url, email, tier, status')
    .single()

  if (scanErr || !scan) throw new Error(`scan insert failed: ${scanErr?.message ?? 'no row returned'}`)

  const result = await executeScan(scan as ScanRow, 'full')

  if (!result.ok) {
    // Advance the schedule even on failure — a broken monitor must not
    // hot-loop every cron tick.
    await supabaseAdmin
      .from('falseecho_monitors')
      .update({ next_scan_at: nextDay() })
      .eq('id', monitor.id)
    throw new Error(result.error ?? 'scan_failed')
  }

  // Scan-level anchor: SHA-256 over the ordered evidence hashes (same as
  // /api/scan/run) so the scan row commits to its evidence set.
  const { data: hashes } = await supabaseAdmin
    .from('falseecho_evidence')
    .select('sha256')
    .eq('scan_id', scan.id)
    .order('seq', { ascending: true })
  await supabaseAdmin
    .from('falseecho_scans')
    .update({ scan_sha256: scanHash((hashes ?? []).map((h: { sha256: string }) => h.sha256)) })
    .eq('id', scan.id)

  // Diff: newly flagged (engine, prompt) pairs vs the previous scan.
  const { data: flagged } = await supabaseAdmin
    .from('falseecho_evidence')
    .select('engine, prompt, narrative, flag_terms, sha256')
    .eq('scan_id', scan.id)
    .eq('flagged', true)
  const newFlags = (
    (flagged ?? []) as Array<{
      engine: string
      prompt: string
      narrative: string | null
      flag_terms: string[] | null
      sha256: string
    }>
  ).filter((f) => !prevFlags.has(`${f.engine}::${f.prompt}`))

  // Link the monitor to the fresh scan and schedule the next daily run.
  await supabaseAdmin
    .from('falseecho_monitors')
    .update({ scan_id: scan.id, next_scan_at: nextDay() })
    .eq('id', monitor.id)

  summary.scanned++

  if (newFlags.length === 0) return

  if (!process.env.RESEND_API_KEY) {
    console.warn(
      `[cron/monitor] RESEND_API_KEY missing — alert for ${monitor.entity} not emailed (${newFlags.length} new flags, ref ${scanRef})`,
    )
    return
  }

  try {
    await sendMonitorAlert({
      to: monitor.email,
      entity: monitor.entity,
      scanRef,
      score: result.score,
      newFlags,
    })
    summary.alerted++
    logEventAsync({
      type: 'email.sent',
      source: 'falseecho',
      ref_id: scanRef,
      email: monitor.email,
      status: 'ok',
      metadata: { kind: 'monitor_alert', new_flags: newFlags.length },
    })
  } catch (err) {
    // Email failure must not fail the cron run.
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[cron/monitor] alert email failed:', msg)
    logEventAsync({
      type: 'email.failed',
      source: 'falseecho',
      ref_id: scanRef,
      email: monitor.email,
      status: 'failed',
      metadata: { kind: 'monitor_alert', error: msg },
    })
    summary.errors.push(`email ${monitor.entity}: ${msg}`)
  }
}
