import { WEIGHTS, weightedScore, statusFor, type FactorScores } from '@bizlegal/scoring'
import type { DecisionScore, EvidenceItem, OpportunityVM, Vertical, EvidenceKind } from './types'

/**
 * The only two places an `OpportunityVM` is ever constructed. Both recompute
 * `total` from `factors` instead of trusting a stored number — a stale
 * `opportunity_score` (scored under a different SCORING_VERSION, or hand-
 * edited) must never silently disagree with what the bars on screen say.
 *
 * `@bizlegal/scoring` multiplies plain numbers: a missing factor is
 * `undefined * weight` = `NaN`, and `statusFor(NaN)` returns `'ignore'`
 * (every comparison against NaN is false, so every `>=` branch falls
 * through). That is the enforcement mechanism behind "all seven dimensions
 * are scored on every opportunity" — there is no code path that produces a
 * VM with a partial score.
 */

function buildScore(factors: FactorScores): DecisionScore {
  for (const k of Object.keys(WEIGHTS) as (keyof FactorScores)[]) {
    const v = factors[k]
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new Error(`buildScore: factor "${k}" is not a finite number (got ${String(v)})`)
    }
  }
  const total = weightedScore(factors)
  return { version: 'v1', total, status: statusFor(total), factors, weights: WEIGHTS }
}

// ── Fixtures ────────────────────────────────────────────────────────────

export interface FixtureEvidence {
  readonly id: string
  readonly kind: EvidenceKind
  readonly title: string
  readonly url: string
  readonly publisher: string
  readonly published_at: string | null
  readonly excerpt: string | null
  readonly weight: number
  readonly note: string | null
  readonly verified_at: string
}

export interface SampleOpportunity {
  readonly id: string
  readonly slug: string
  readonly vertical: Vertical
  readonly market_name: string
  readonly name: string
  readonly problem: string
  readonly target_customer: string | null
  readonly proposed_product: string | null
  readonly proposed_pricing: OpportunityVM['proposed_pricing']
  readonly gtm_channels: readonly string[]
  readonly why_now: readonly string[]
  readonly factors: FactorScores
  readonly status_reason: string
  readonly confidence: number
  readonly first_seen: string
  readonly evidence: readonly FixtureEvidence[]
}

export function fromFixture(f: SampleOpportunity): OpportunityVM {
  if (f.evidence.length < 3) throw new Error(`fromFixture: ${f.slug} has < 3 evidence items`)
  return {
    id: f.id,
    slug: f.slug,
    origin: 'sample',
    vertical: f.vertical,
    market_name: f.market_name,
    name: f.name,
    problem: f.problem,
    target_customer: f.target_customer,
    proposed_product: f.proposed_product,
    proposed_pricing: f.proposed_pricing,
    gtm_channels: f.gtm_channels,
    why_now: f.why_now,
    score: buildScore(f.factors),
    evidence: f.evidence as readonly EvidenceItem[],
    status_reason: f.status_reason,
    confidence: f.confidence,
    first_seen: f.first_seen,
    last_scored_at: f.first_seen,
    run: { id: null, finished_at: null },
    build: { requestable: false, existing_request_id: null },
  }
}

// ── Neon rows ───────────────────────────────────────────────────────────

export interface OpportunityRow {
  id: string
  slug: string | null
  market_id: string
  market_vertical: Vertical
  market_name: string
  name: string
  problem: string
  target_customer: string | null
  proposed_product: string | null
  proposed_pricing: OpportunityVM['proposed_pricing']
  gtm_channels: readonly string[] | null
  why_now: readonly string[] | null
  demand_score: number
  pain_score: number
  wtp_score: number
  competition_score: number
  legal_score: number
  automation_score: number
  acquisition_score: number
  status_reason: string | null
  confidence: number | null
  created_at: string
  last_scored_at: string | null
}

export interface EvidenceRow {
  id: string
  kind: EvidenceKind
  title: string
  url: string
  publisher: string | null
  published_at: string | null
  excerpt: string | null
  weight: number
  note: string | null
  url_verified_at: string | null
}

export interface RunRow {
  id: string
  finished_at: string | null
}

export interface BuildRequestRow {
  id: string
  opportunity_id: string
}

export function fromNeon(
  row: OpportunityRow,
  evidence: readonly EvidenceRow[],
  run: RunRow | null,
  subscriberBuildRequest: BuildRequestRow | null,
  canRequestBuild: boolean,
): OpportunityVM {
  const factors: FactorScores = {
    demand: row.demand_score,
    pain: row.pain_score,
    wtp: row.wtp_score,
    competition: row.competition_score,
    legal: row.legal_score,
    automation: row.automation_score,
    acquisition: row.acquisition_score,
  }
  const mappedEvidence: EvidenceItem[] = evidence.map((e) => ({
    id: e.id,
    kind: e.kind,
    title: e.title,
    url: e.url,
    publisher: e.publisher ?? 'Unknown',
    published_at: e.published_at,
    excerpt: e.excerpt,
    weight: e.weight,
    note: e.note,
    verified_at: e.url_verified_at ?? row.created_at,
  }))
  if (mappedEvidence.length < 3) {
    throw new Error(`fromNeon: opportunity ${row.id} has < 3 evidence rows — evidence_gate() should have blocked this`)
  }
  return {
    id: row.id,
    slug: row.slug ?? row.id,
    origin: 'radar',
    vertical: row.market_vertical,
    market_name: row.market_name,
    name: row.name,
    problem: row.problem,
    target_customer: row.target_customer,
    proposed_product: row.proposed_product,
    proposed_pricing: row.proposed_pricing,
    gtm_channels: row.gtm_channels ?? [],
    why_now: row.why_now ?? [],
    score: buildScore(factors),
    evidence: mappedEvidence,
    status_reason: row.status_reason,
    confidence: row.confidence,
    first_seen: row.created_at,
    last_scored_at: row.last_scored_at,
    run: { id: run?.id ?? null, finished_at: run?.finished_at ?? null },
    build: {
      requestable: canRequestBuild && !subscriberBuildRequest,
      existing_request_id: subscriberBuildRequest?.id ?? null,
    },
  }
}
