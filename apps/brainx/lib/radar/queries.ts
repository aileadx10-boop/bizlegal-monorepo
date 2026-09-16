import { sql } from '@/lib/neon'
import { fromNeon, type OpportunityRow, type EvidenceRow, type RunRow, type BuildRequestRow } from './map'
import type { OpportunityVM, Vertical } from './types'
import { quotaFor } from '@/lib/build-this/metering'

/**
 * All Neon reads for the subscriber radar. Every query is `force-dynamic`
 * from the caller (page-level) — a subscriber's radar must never come from
 * a cached build.
 *
 * `@neondatabase/serverless` has no `.unsafe()` fragment helper (unlike
 * postgres.js), so a query whose shape varies (the optional vertical filter)
 * uses the driver's "ordinary function" form — `sql(text, params)` — rather
 * than the tagged-template form. Still fully parameterized: only the WHERE
 * clause differs, the values are always bound as $1/$2, never interpolated.
 */

const OPPORTUNITY_COLUMNS = `
  o.id, o.slug, o.market_id, m.vertical as market_vertical, m.name as market_name,
  o.name, o.problem, o.target_customer, o.proposed_product, o.proposed_pricing,
  o.gtm_channels, o.why_now,
  o.demand_score, o.pain_score, o.wtp_score, o.competition_score, o.legal_score,
  o.automation_score, o.acquisition_score,
  o.status_reason, o.confidence, o.created_at, o.last_scored_at
`

async function latestRun(): Promise<RunRow | null> {
  const rows = (await sql()`
    select id, finished_at from research_runs where status = 'completed' order by finished_at desc limit 1
  `) as unknown as RunRow[]
  return rows?.[0] ?? null
}

async function evidenceFor(opportunityIds: readonly string[]): Promise<Map<string, EvidenceRow[]>> {
  if (opportunityIds.length === 0) return new Map()
  const rows = (await sql()`
    select el.opportunity_id, s.id, s.signal_type as kind, s.title, s.url, s.publisher,
           s.detected_at as published_at, s.excerpt, el.weight, el.note, s.url_verified_at
    from evidence_links el
    join signals s on s.id = el.entity_id and el.entity_type = 'signal'
    where el.opportunity_id = any(${opportunityIds}::uuid[])
    order by el.weight desc
  `) as unknown as Array<EvidenceRow & { opportunity_id: string }>
  const out = new Map<string, EvidenceRow[]>()
  for (const r of rows) {
    const list = out.get(r.opportunity_id) ?? []
    list.push(r)
    out.set(r.opportunity_id, list)
  }
  return out
}

async function buildRequestsFor(subscriberId: string, opportunityIds: readonly string[]): Promise<Map<string, BuildRequestRow>> {
  if (opportunityIds.length === 0) return new Map()
  const rows = (await sql()`
    select id, opportunity_id from products
    where subscriber_id = ${subscriberId}::uuid
      and opportunity_id = any(${opportunityIds}::uuid[])
      and status in ('requested','in_progress','ready')
  `) as unknown as BuildRequestRow[]
  return new Map(rows.map((r) => [r.opportunity_id, r]))
}

async function selectOpportunities(vertical?: Vertical): Promise<OpportunityRow[]> {
  const where = vertical
    ? `o.status in ('build','validate','watch') and m.vertical = $1`
    : `o.status in ('build','validate','watch')`
  const params = vertical ? [vertical] : []
  const text = `
    select ${OPPORTUNITY_COLUMNS}
    from opportunities o join markets m on m.id = o.market_id
    where ${where}
    order by o.opportunity_score desc
  `
  return (await sql()(text, params)) as unknown as OpportunityRow[]
}

export async function listOpportunities(params: {
  subscriberId: string
  tier: 'radar' | 'radar_build'
  vertical?: Vertical
}): Promise<{ opportunities: OpportunityVM[]; run: RunRow | null }> {
  const rows = await selectOpportunities(params.vertical)

  const ids = rows.map((r) => r.id)
  const [run, evidenceMap, requestMap] = await Promise.all([
    latestRun(),
    evidenceFor(ids),
    buildRequestsFor(params.subscriberId, ids),
  ])
  const canRequestBuild = quotaFor(params.tier) !== 0

  const opportunities = rows
    .map((row) => {
      const evidence = evidenceMap.get(row.id) ?? []
      if (evidence.length < 3) return null // evidence_gate() should prevent this; defensive skip
      return fromNeon(row, evidence, run, requestMap.get(row.id) ?? null, canRequestBuild)
    })
    .filter((x): x is OpportunityVM => x !== null)

  return { opportunities, run }
}

export async function getOpportunityBySlug(params: {
  subscriberId: string
  tier: 'radar' | 'radar_build'
  slug: string
}): Promise<OpportunityVM | null> {
  const text = `
    select ${OPPORTUNITY_COLUMNS}
    from opportunities o join markets m on m.id = o.market_id
    where o.slug = $1 or o.id::text = $1
    limit 1
  `
  const rows = (await sql()(text, [params.slug])) as unknown as OpportunityRow[]
  const row = rows?.[0]
  if (!row) return null

  const [run, evidenceMap, requestMap] = await Promise.all([
    latestRun(),
    evidenceFor([row.id]),
    buildRequestsFor(params.subscriberId, [row.id]),
  ])
  const evidence = evidenceMap.get(row.id) ?? []
  if (evidence.length < 3) return null
  return fromNeon(row, evidence, run, requestMap.get(row.id) ?? null, quotaFor(params.tier) !== 0)
}
