/**
 * Bench deterministic rubric engine — the core IP.
 *
 * Five dimensions, each scored 0-5 by an evaluator (AI-prescored or expert):
 *   jurisdictional · correctness · completeness · reasoning · hallucination
 * (hallucination is scored as SAFETY: 5 = no fabrication risk, 0 = fabricated
 * authority presented as real.)
 *
 * Everything downstream of the raw scores is pure arithmetic in this file, so
 * every number in a delivered report is reproducible from the evaluation rows:
 *   accuracy      = mean(total/25) across scored items
 *   hallucination = share of items tagged 'hallucinated_authority' OR scoring ≤2 on the hallucination dimension
 *   critical      = share of items with severity 'critical'
 *   citation      = 1 − share tagged 'unreliable_citation' or 'hallucinated_authority'
 *   missing-law   = share tagged 'omission'
 * Same inputs always produce the same report — no model calls, no randomness.
 */

export const RUBRIC_DIMENSIONS = [
  'jurisdictional',
  'correctness',
  'completeness',
  'reasoning',
  'hallucination',
] as const

export type RubricDimension = (typeof RUBRIC_DIMENSIONS)[number]

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'none'

export type TaxonomyTag =
  | 'hallucinated_authority' // fabricated statute, case, or regulator guidance
  | 'misstatement'           // real law, wrongly stated
  | 'omission'               // legally required element missing
  | 'wrong_jurisdiction'     // answered under another jurisdiction's law
  | 'bad_reasoning'          // right sources, unsound application
  | 'unreliable_citation'    // real authority cited for the wrong proposition

export interface ScoredEvaluation {
  readonly itemId: string
  /** 0-5 per dimension. */
  readonly scores: Readonly<Record<RubricDimension, number>>
  readonly severity: Severity
  readonly taxonomy: readonly TaxonomyTag[]
  /** Practice-area tag from the benchmark item, for the jurisdictional breakdown. */
  readonly practiceArea: string
}

export interface DimensionSummary {
  readonly dimension: RubricDimension
  /** Mean 0-5 across items, rounded to 2 dp. */
  readonly mean: number
}

export interface PracticeAreaSummary {
  readonly practiceArea: string
  readonly items: number
  /** Mean total (0-25) for this slice, rounded to 1 dp. */
  readonly meanTotal: number
}

export interface EngagementMetrics {
  readonly itemsScored: number
  /** Mean total score, 0-25, rounded to 1 dp. */
  readonly meanTotal: number
  /** meanTotal / 25 as a 0-100 percentage, rounded to whole. */
  readonly accuracyPct: number
  /** % of items exhibiting hallucination (tag or dimension ≤ 2). */
  readonly hallucinationRatePct: number
  /** % of items with severity 'critical'. */
  readonly criticalErrorRatePct: number
  /** % of items whose cited authorities are real, relevant, correctly used. */
  readonly citationReliabilityPct: number
  /** % of items omitting a legally required element. */
  readonly missingLawRatePct: number
  readonly dimensions: readonly DimensionSummary[]
  readonly byPracticeArea: readonly PracticeAreaSummary[]
  /** Item counts per taxonomy tag, descending. */
  readonly taxonomyHistogram: ReadonlyArray<{ readonly tag: TaxonomyTag; readonly count: number }>
  readonly severityHistogram: ReadonlyArray<{ readonly severity: Severity; readonly count: number }>
}

export const MAX_DIMENSION_SCORE = 5
export const MAX_TOTAL_SCORE = MAX_DIMENSION_SCORE * RUBRIC_DIMENSIONS.length // 25
/** A hallucination-dimension score at or below this counts as a hallucination event. */
export const HALLUCINATION_SCORE_THRESHOLD = 2

function clampScore(v: number): number {
  if (Number.isNaN(v)) return 0
  return Math.min(Math.max(Math.round(v), 0), MAX_DIMENSION_SCORE)
}

export function totalScore(e: ScoredEvaluation): number {
  return RUBRIC_DIMENSIONS.reduce((sum, d) => sum + clampScore(e.scores[d]), 0)
}

function round(v: number, dp: number): number {
  const f = 10 ** dp
  return Math.round(v * f) / f
}

function pct(numerator: number, denominator: number): number {
  if (denominator === 0) return 0
  return Math.round((numerator / denominator) * 100)
}

function isHallucination(e: ScoredEvaluation): boolean {
  return (
    e.taxonomy.includes('hallucinated_authority') ||
    clampScore(e.scores.hallucination) <= HALLUCINATION_SCORE_THRESHOLD
  )
}

function hasUnreliableCitation(e: ScoredEvaluation): boolean {
  return (
    e.taxonomy.includes('unreliable_citation') ||
    e.taxonomy.includes('hallucinated_authority')
  )
}

export function computeEngagementMetrics(
  evaluations: readonly ScoredEvaluation[],
): EngagementMetrics {
  const n = evaluations.length
  const totals = evaluations.map(totalScore)
  const meanTotal = n === 0 ? 0 : round(totals.reduce((a, b) => a + b, 0) / n, 1)

  const dimensions: DimensionSummary[] = RUBRIC_DIMENSIONS.map((dimension) => ({
    dimension,
    mean:
      n === 0
        ? 0
        : round(
            evaluations.reduce((sum, e) => sum + clampScore(e.scores[dimension]), 0) / n,
            2,
          ),
  }))

  const areaMap = new Map<string, { items: number; totalSum: number }>()
  for (const e of evaluations) {
    const slot = areaMap.get(e.practiceArea) ?? { items: 0, totalSum: 0 }
    areaMap.set(e.practiceArea, { items: slot.items + 1, totalSum: slot.totalSum + totalScore(e) })
  }
  const byPracticeArea: PracticeAreaSummary[] = [...areaMap.entries()]
    .map(([practiceArea, { items, totalSum }]) => ({
      practiceArea,
      items,
      meanTotal: round(totalSum / items, 1),
    }))
    .sort((a, b) => a.practiceArea.localeCompare(b.practiceArea))

  const tagCounts = new Map<TaxonomyTag, number>()
  for (const e of evaluations) {
    for (const tag of e.taxonomy) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
  }
  const taxonomyHistogram = [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))

  const sevCounts = new Map<Severity, number>()
  for (const e of evaluations) sevCounts.set(e.severity, (sevCounts.get(e.severity) ?? 0) + 1)
  const severityOrder: readonly Severity[] = ['critical', 'high', 'medium', 'low', 'none']
  const severityHistogram = severityOrder
    .filter((s) => sevCounts.has(s))
    .map((severity) => ({ severity, count: sevCounts.get(severity) ?? 0 }))

  return {
    itemsScored: n,
    meanTotal,
    accuracyPct: n === 0 ? 0 : Math.round((meanTotal / MAX_TOTAL_SCORE) * 100),
    hallucinationRatePct: pct(evaluations.filter(isHallucination).length, n),
    criticalErrorRatePct: pct(evaluations.filter((e) => e.severity === 'critical').length, n),
    citationReliabilityPct: n === 0 ? 0 : 100 - pct(evaluations.filter(hasUnreliableCitation).length, n),
    missingLawRatePct: pct(evaluations.filter((e) => e.taxonomy.includes('omission')).length, n),
    dimensions,
    byPracticeArea,
    taxonomyHistogram,
    severityHistogram,
  }
}
