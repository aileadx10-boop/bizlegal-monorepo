/**
 * Inter-rater agreement — the calibration number published on /methodology.
 *
 * Two experts double-score the same items. If they cannot agree, the "accuracy
 * score" is noise — so the agreement stat is computed by code and published,
 * not asserted. Two standard measures for ordinal 0-5 rubric scores:
 *
 *   exact agreement    — identical score on a dimension
 *   adjacent agreement — within ±1 (the conventional tolerance for 6-point
 *                        ordinal rubrics; disagreements >1 trigger the
 *                        disagreement-resolution protocol in wf_diagnostic_audit)
 *
 * Deterministic: same pairs in → same stats out.
 */

import { RUBRIC_DIMENSIONS, type RubricDimension, type ScoredEvaluation } from './rubric-engine'

export interface CalibrationPair {
  readonly itemId: string
  readonly a: ScoredEvaluation
  readonly b: ScoredEvaluation
}

export interface DimensionAgreement {
  readonly dimension: RubricDimension
  readonly exactPct: number
  readonly adjacentPct: number
  /** Mean absolute score difference, rounded to 2 dp. */
  readonly meanAbsDelta: number
}

export interface InterRaterReport {
  readonly pairs: number
  readonly comparisons: number
  /** Across all dimensions of all pairs. */
  readonly exactPct: number
  readonly adjacentPct: number
  readonly byDimension: readonly DimensionAgreement[]
  /** Pairs containing at least one dimension delta > 1 — must go to resolution. */
  readonly pairsNeedingResolution: readonly string[]
}

function clamp05(v: number): number {
  if (Number.isNaN(v)) return 0
  return Math.min(Math.max(Math.round(v), 0), 5)
}

function pctRound(numerator: number, denominator: number): number {
  if (denominator === 0) return 0
  return Math.round((numerator / denominator) * 100)
}

export function computeInterRater(pairs: readonly CalibrationPair[]): InterRaterReport {
  let exact = 0
  let adjacent = 0
  const total = pairs.length * RUBRIC_DIMENSIONS.length

  const perDim = new Map<RubricDimension, { exact: number; adjacent: number; deltaSum: number }>()
  for (const d of RUBRIC_DIMENSIONS) perDim.set(d, { exact: 0, adjacent: 0, deltaSum: 0 })

  const needsResolution: string[] = []

  for (const pair of pairs) {
    let pairDisagrees = false
    for (const d of RUBRIC_DIMENSIONS) {
      const delta = Math.abs(clamp05(pair.a.scores[d]) - clamp05(pair.b.scores[d]))
      const slot = perDim.get(d)
      if (!slot) continue
      slot.deltaSum += delta
      if (delta === 0) {
        exact += 1
        adjacent += 1
        slot.exact += 1
        slot.adjacent += 1
      } else if (delta === 1) {
        adjacent += 1
        slot.adjacent += 1
      } else {
        pairDisagrees = true
      }
    }
    if (pairDisagrees) needsResolution.push(pair.itemId)
  }

  const byDimension: DimensionAgreement[] = RUBRIC_DIMENSIONS.map((dimension) => {
    const slot = perDim.get(dimension) ?? { exact: 0, adjacent: 0, deltaSum: 0 }
    return {
      dimension,
      exactPct: pctRound(slot.exact, pairs.length),
      adjacentPct: pctRound(slot.adjacent, pairs.length),
      meanAbsDelta: pairs.length === 0 ? 0 : Math.round((slot.deltaSum / pairs.length) * 100) / 100,
    }
  })

  return {
    pairs: pairs.length,
    comparisons: total,
    exactPct: pctRound(exact, total),
    adjacentPct: pctRound(adjacent, total),
    byDimension,
    pairsNeedingResolution: needsResolution,
  }
}
