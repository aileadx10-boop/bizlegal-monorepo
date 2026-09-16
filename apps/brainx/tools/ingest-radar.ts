#!/usr/bin/env tsx
/**
 * tools/ingest-radar.ts --file content/runs/<date>.json [--dry-run] [--upsert]
 *
 * The only path an opportunity enters Neon. Validates a radar-run file
 * (zod schema + static rules in lib/radar/ingest-schema.ts, then network URL
 * resolution here) and, on success, writes research_runs → sources →
 * signals → opportunities (status 'watch') → evidence_links →
 * opportunity_scores → UPDATE opportunities.status (fires evidence_gate()).
 *
 * Written by a Claude Code session following agents/brainx/radar-run/SOP.md
 * — the operator-run weekly radar. Zero LLM API cost: the analysis already
 * happened in the session that produced the JSON file; this tool only
 * validates and persists it.
 *
 * Exit codes: 0 ok · 2 schema/static validation failed · 3 URL resolution
 * failed · 4 database error.
 */
import { readFileSync } from 'node:fs'
import { runFile as runFileSchema, staticViolations, splitViolations, normalizeUrl, urlProblems } from '../lib/radar/ingest-schema'
import { weightedScore, statusFor, SCORING_VERSION, type FactorScores } from '@bizlegal/scoring'
import { sql } from '../lib/neon'
import { logEvent } from '../lib/ops/log'
import crypto from 'node:crypto'

const TIMEOUT_MS = 10_000

async function urlResolves(url: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'BrainXIngest/1.0 (+https://brainx.bizlegal-ai.com)' } })
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'BrainXIngest/1.0 (+https://brainx.bizlegal-ai.com)' } })
    }
    return { ok: res.status >= 200 && res.status < 400, status: res.status }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  } finally {
    clearTimeout(timer)
  }
}

function sha256(s: string): string {
  return crypto.createHash('sha256').update(s).digest('hex')
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const fileIdx = args.indexOf('--file')
  if (fileIdx === -1 || !args[fileIdx + 1]) {
    console.error('Usage: tsx tools/ingest-radar.ts --file content/runs/<date>.json [--dry-run] [--upsert]')
    process.exit(2)
  }
  const dryRun = args.includes('--dry-run')
  const upsert = args.includes('--upsert')
  const path = args[fileIdx + 1]!

  const raw = JSON.parse(readFileSync(path, 'utf8'))
  const parsed = runFileSchema.safeParse(raw)
  if (!parsed.success) {
    console.error('SCHEMA VALIDATION FAILED:')
    for (const issue of parsed.error.issues) console.error(`  ${issue.path.join('.')}: ${issue.message}`)
    process.exit(2)
  }
  const file = parsed.data

  const { errors, warnings } = splitViolations(staticViolations(file))
  for (const w of warnings) console.warn(`WARN [${w.rule}] ${w.where}: ${w.message}`)
  if (errors.length > 0) {
    console.error('STATIC RULE VIOLATIONS:')
    for (const e of errors) console.error(`  [${e.rule}] ${e.where}: ${e.message}`)
    process.exit(2)
  }

  console.log(`Resolving ${file.evidence.length} evidence URLs...`)
  const urlResults = new Map<string, { ok: boolean; status?: number; error?: string }>()
  for (const ev of file.evidence) {
    const result = await urlResolves(ev.url)
    urlResults.set(ev.key, result)
    console.log(`  ${result.ok ? 'OK  ' : 'FAIL'} ${result.status ?? result.error}  ${ev.key}  ${ev.url}`)
  }
  const failed = [...urlResults.entries()].filter(([, r]) => !r.ok)
  if (failed.length > 0) {
    console.error(`${failed.length} evidence URL(s) failed to resolve — fix or remove before ingesting.`)
    process.exit(3)
  }

  // Compute + cross-check every opportunity's score before touching the DB.
  for (const op of file.opportunities) {
    const total = weightedScore(op.factor_scores as FactorScores)
    const computed = statusFor(total)
    if (op.expected_status && op.expected_status !== computed) {
      console.error(`${op.slug}: expected_status ${op.expected_status} but computed ${computed} (total ${total})`)
      process.exit(2)
    }
  }

  if (dryRun) {
    console.log(`DRY RUN OK — ${file.opportunities.length} opportunities, ${file.evidence.length} evidence, market ${file.market_slug}. Re-run with --upsert (or without --dry-run) to write.`)
    process.exit(0)
  }

  try {
    await ingest(file, urlResults, upsert)
    console.log('INGEST OK')
    process.exit(0)
  } catch (err) {
    console.error('DB ERROR:', err instanceof Error ? err.message : err)
    process.exit(4)
  }
}

async function ingest(
  file: ReturnType<typeof runFileSchema.parse>,
  urlResults: Map<string, { status?: number }>,
  upsert: boolean,
): Promise<void> {
  const db = sql()

  const marketRows = (await db`select id from markets where slug = ${file.market_slug} limit 1`) as unknown as Array<{ id: string }>
  const marketId = marketRows?.[0]?.id
  if (!marketId) throw new Error(`unknown market_slug: ${file.market_slug}`)

  const runRows = (await db`
    insert into research_runs (workflow, market_id, status, started_at)
    values ('radar_weekly', ${marketId}::uuid, 'running', now())
    returning id
  `) as unknown as Array<{ id: string }>
  const runId = runRows[0]!.id

  const sourceRows = (await db`
    insert into sources (market_id, source_type, source_name)
    values (${marketId}::uuid, 'operator', 'operator-radar')
    on conflict do nothing
    returning id
  `) as unknown as Array<{ id: string }>
  let sourceId = sourceRows[0]?.id
  if (!sourceId) {
    const existing = (await db`select id from sources where market_id = ${marketId}::uuid and source_name = 'operator-radar' limit 1`) as unknown as Array<{ id: string }>
    sourceId = existing[0]?.id
  }

  const evidenceIdByKey = new Map<string, string>()
  let itemsNew = 0
  for (const ev of file.evidence) {
    const normalized = normalizeUrl(ev.url)
    if (urlProblems(ev.url)) throw new Error(`evidence ${ev.key}: url failed static check at ingest time`)
    const contentHash = sha256(normalized)
    const rows = (await db`
      insert into signals (market_id, source_id, signal_type, title, url, publisher, excerpt, content_hash, detected_at, url_verified_at)
      values (${marketId}::uuid, ${sourceId ?? null}, ${ev.kind}, ${ev.title}, ${ev.url}, ${ev.publisher}, ${ev.excerpt}, ${contentHash}, ${ev.published_at ?? new Date().toISOString()}, now())
      on conflict (market_id, source_id, content_hash) do update set url_verified_at = now()
      returning id
    `) as unknown as Array<{ id: string }>
    evidenceIdByKey.set(ev.key, rows[0]!.id)
    itemsNew += 1
  }

  let opportunitiesWritten = 0
  for (const op of file.opportunities) {
    const factors = op.factor_scores as FactorScores
    const total = weightedScore(factors)
    const status = statusFor(total)

    let opRows: Array<{ id: string }>
    if (upsert) {
      opRows = (await db`
        insert into opportunities (
          market_id, slug, name, problem, target_customer, proposed_product, proposed_pricing,
          gtm_channels, why_now, demand_score, pain_score, wtp_score, competition_score, legal_score,
          automation_score, acquisition_score, opportunity_score, status_reason, confidence, status
        ) values (
          ${marketId}::uuid, ${op.slug}, ${op.name}, ${op.problem}, ${op.target_customer}, ${op.proposed_product}, ${op.proposed_pricing ? JSON.stringify(op.proposed_pricing) : null}::jsonb,
          ${op.gtm_channels}, ${op.why_now}, ${factors.demand}, ${factors.pain}, ${factors.wtp}, ${factors.competition}, ${factors.legal},
          ${factors.automation}, ${factors.acquisition}, ${total}, ${op.status_reason}, ${op.confidence}, 'watch'
        )
        on conflict (slug) do update set
          name = excluded.name, problem = excluded.problem, target_customer = excluded.target_customer,
          proposed_product = excluded.proposed_product, proposed_pricing = excluded.proposed_pricing,
          gtm_channels = excluded.gtm_channels, why_now = excluded.why_now,
          demand_score = excluded.demand_score, pain_score = excluded.pain_score, wtp_score = excluded.wtp_score,
          competition_score = excluded.competition_score, legal_score = excluded.legal_score,
          automation_score = excluded.automation_score, acquisition_score = excluded.acquisition_score,
          opportunity_score = excluded.opportunity_score, status_reason = excluded.status_reason,
          confidence = excluded.confidence, updated_at = now()
        returning id
      `) as unknown as Array<{ id: string }>
    } else {
      opRows = (await db`
        insert into opportunities (
          market_id, slug, name, problem, target_customer, proposed_product, proposed_pricing,
          gtm_channels, why_now, demand_score, pain_score, wtp_score, competition_score, legal_score,
          automation_score, acquisition_score, opportunity_score, status_reason, confidence, status
        ) values (
          ${marketId}::uuid, ${op.slug}, ${op.name}, ${op.problem}, ${op.target_customer}, ${op.proposed_product}, ${op.proposed_pricing ? JSON.stringify(op.proposed_pricing) : null}::jsonb,
          ${op.gtm_channels}, ${op.why_now}, ${factors.demand}, ${factors.pain}, ${factors.wtp}, ${factors.competition}, ${factors.legal},
          ${factors.automation}, ${factors.acquisition}, ${total}, ${op.status_reason}, ${op.confidence}, 'watch'
        )
        returning id
      `) as unknown as Array<{ id: string }>
    }
    const opportunityId = opRows[0]!.id

    for (const ref of op.evidence) {
      const signalId = evidenceIdByKey.get(ref.key)
      if (!signalId) throw new Error(`${op.slug}: evidence key ${ref.key} not ingested`)
      await db`
        insert into evidence_links (opportunity_id, entity_type, entity_id, weight, note)
        values (${opportunityId}::uuid, 'signal', ${signalId}::uuid, ${ref.weight}, ${ref.note})
        on conflict (opportunity_id, entity_type, entity_id) do update set weight = excluded.weight, note = excluded.note
      `
    }

    await db`
      insert into opportunity_scores (opportunity_id, demand, pain, wtp, competition, legal, automation, acquisition, total, scoring_version)
      values (${opportunityId}::uuid, ${factors.demand}, ${factors.pain}, ${factors.wtp}, ${factors.competition}, ${factors.legal}, ${factors.automation}, ${factors.acquisition}, ${total}, ${SCORING_VERSION})
    `

    // Separate UPDATE so the evidence_gate() trigger (fires on status
    // transition, not on INSERT) actually runs and re-checks evidence count.
    await db`update opportunities set status = ${status}, last_scored_at = now() where id = ${opportunityId}::uuid`
    opportunitiesWritten += 1
  }

  await db`
    update research_runs set status = 'completed', finished_at = now(), items_collected = ${file.evidence.length}, items_new = ${itemsNew}, cost_usd = 0
    where id = ${runId}::uuid
  `

  console.log(`Run ${runId}: ${opportunitiesWritten} opportunities, ${itemsNew} signals.`)
  await logEvent({ type: 'cron.completed', source: 'brainx', ref_id: runId, status: 'ok', metadata: { workflow: 'radar_weekly', market: file.market_slug, opportunities: opportunitiesWritten, signals: itemsNew } })
}

void main()
