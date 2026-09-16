import type { FactorScores, OpportunityStatus } from '@bizlegal/scoring'

/**
 * The one view-model every BrainX surface renders.
 *
 * Two producers map into it — `lib/fixtures/sample.ts` (the public sample
 * radar, hand-researched) and `lib/radar/map.ts::fromNeon` (a subscriber's
 * radar, written by `tools/ingest-radar.ts`). Components never read a Neon
 * row or a fixture directly, so the sample and the paid product are the same
 * product with a different `origin` stamp.
 *
 * Invariants the mappers enforce (and `lib/radar/map.test.ts` checks):
 *   - `evidence.length >= 3` — no evidence, no opportunity.
 *   - `score.factors` carries all seven dimensions. `@bizlegal/scoring`
 *     multiplies plain numbers; a missing factor is `NaN`, and `NaN` scores
 *     `ignore`. That is why "missing evidence is scored low, never omitted".
 *   - `score.total === weightedScore(score.factors)` — recomputed on read.
 */

export type Vertical = 'real_estate' | 'legal_compliance' | 'ai_fintech_regulation'

export const VERTICAL_LABEL: Readonly<Record<Vertical, string>> = {
  real_estate: 'Real estate',
  legal_compliance: 'Legal & compliance',
  ai_fintech_regulation: 'AI & fintech regulation',
}

/** Mirrors `signals.signal_type` for the four evidence feeds the prompts define. */
export type EvidenceKind = 'demand' | 'voice' | 'competitor' | 'regulatory'

export const EVIDENCE_KIND_LABEL: Readonly<Record<EvidenceKind, string>> = {
  demand: 'Market signal',
  voice: 'Customer voice',
  competitor: 'Competitor signal',
  regulatory: 'Regulatory signal',
}

export interface EvidenceItem {
  /** `signals.id` for radar rows; `ev-NN` for fixtures. */
  readonly id: string
  readonly kind: EvidenceKind
  readonly title: string
  /** https, not a bare origin, resolved at `verified_at`. */
  readonly url: string
  /** Who published it — 'FinCEN', 'Federal Register', 'r/RealEstate'. */
  readonly publisher: string
  /** ISO date when the source itself was published, if known. */
  readonly published_at: string | null
  /** Verbatim, ≤ 40 words (the customer-voice rule); null when the source is a document, not a quote. */
  readonly excerpt: string | null
  /** `evidence_links.weight`, 0..1. */
  readonly weight: number
  /** `evidence_links.note` — why this source supports the opportunity. */
  readonly note: string | null
  /** ISO timestamp of the last successful URL resolution. */
  readonly verified_at: string
}

export interface DecisionScore {
  readonly version: 'v1'
  /** `weightedScore(factors)`, 0..100 with two decimals. */
  readonly total: number
  /** `statusFor(total)` — build ≥ 80, validate ≥ 65, watch ≥ 50, else ignore. */
  readonly status: OpportunityStatus
  readonly factors: FactorScores
  /** `WEIGHTS` from `@bizlegal/scoring`, rendered next to each bar, never hard-coded in UI. */
  readonly weights: FactorScores
}

export interface ProposedPricing {
  readonly initial?: number
  readonly recurring?: number
  readonly recurring_period?: 'month' | 'year'
}

export interface OpportunityVM {
  readonly id: string
  readonly slug: string
  readonly origin: 'sample' | 'radar'
  readonly vertical: Vertical
  readonly market_name: string
  readonly name: string
  readonly problem: string
  readonly target_customer: string | null
  readonly proposed_product: string | null
  readonly proposed_pricing: ProposedPricing | null
  readonly gtm_channels: readonly string[]
  /** One line each: what changed and why it matters now. */
  readonly why_now: readonly string[]
  readonly score: DecisionScore
  /** Length ≥ 3, invariant. */
  readonly evidence: readonly EvidenceItem[]
  readonly status_reason: string | null
  /** 0..1, the analyst's confidence in the synthesis. */
  readonly confidence: number | null
  /** ISO timestamp the opportunity first appeared. */
  readonly first_seen: string
  readonly last_scored_at: string | null
  /** The `research_runs` row that produced it; both null for the sample. */
  readonly run: { readonly id: string | null; readonly finished_at: string | null }
  /** BUILD THIS state for the viewing subscriber; `requestable` is always false on the sample. */
  readonly build: { readonly requestable: boolean; readonly existing_request_id: string | null }
}

export const FACTOR_LABEL: Readonly<Record<keyof FactorScores, string>> = {
  demand: 'Market demand',
  pain: 'Customer pain',
  wtp: 'Willingness to pay',
  competition: 'Competition gap',
  legal: 'Regulatory pull',
  automation: 'Automation fit',
  acquisition: 'Buyer accessibility',
}

export const FACTOR_ORDER: readonly (keyof FactorScores)[] = [
  'demand',
  'pain',
  'wtp',
  'competition',
  'legal',
  'automation',
  'acquisition',
]

export type BriefStatus = 'requested' | 'in_progress' | 'ready' | 'delivered' | 'cancelled'

export interface BriefSection {
  readonly text: string
  /** Evidence ids (from the opportunity's own vault) this section relies on. */
  readonly evidence_ids: readonly string[]
}

/** The nine BUILD THIS sections, matching `products` columns one-to-one. */
export interface Brief {
  readonly offer: BriefSection
  readonly buyer: BriefSection
  readonly deliverable: BriefSection
  /** Labelled "pricing hypothesis — not market-confirmed pricing" in the UI. */
  readonly pricing_hypothesis: BriefSection
  readonly sales_angle: BriefSection
  readonly landing_page_brief: BriefSection
  readonly delivery_workflow: BriefSection
  readonly evidence_pack: BriefSection
  readonly next_actions: BriefSection
}

export interface BriefVM {
  readonly id: string
  readonly opportunity_id: string
  readonly opportunity_slug: string
  readonly opportunity_name: string
  readonly status: BriefStatus
  readonly requested_at: string
  readonly ready_at: string | null
  readonly turnaround_note: string
  readonly brief: Brief | null
  /** Moses's written review, when the Radar + Build tier escalated it. */
  readonly review: { readonly text: string; readonly reviewed_at: string } | null
}
