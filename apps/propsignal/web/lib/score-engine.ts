/**
 * PropSignal deterministic risk-scoring engine — the core IP.
 *
 * Formula (documented so the score is defensible and reproducible):
 *   score = clamp(100 - Σ deduction(signal), 0, 100)
 *   deduction(signal) = SEVERITY_DEDUCTION[severity] * signal.weight
 *
 * 100 = lowest observable risk (no adverse public-data signals).
 * Same inputs always produce the same score — no model calls, no randomness.
 * "Drivers" are the largest individual deductions, surfaced so the report
 * narrative can explain WHY the score is what it is.
 */

export type SignalSource = 'fema' | 'epa' | 'socrata' | 'research'

export type Severity = 'none' | 'low' | 'medium' | 'high'

export interface RiskSignal {
  readonly source: SignalSource
  /** Stable identifier, e.g. 'flood_zone_ae', 'superfund_within_1mi'. */
  readonly key: string
  /** Human-readable label used in the report narrative. */
  readonly label: string
  readonly severity: Severity
  /** Relative importance multiplier, 0–1. 1 = full deduction for its severity. */
  readonly weight: number
}

export interface RiskScoreResult {
  /** 0–100; 100 = lowest observable risk. */
  readonly score: number
  readonly grade: 'A' | 'B' | 'C' | 'D' | 'F'
  /** Signals responsible for the largest deductions, highest first. */
  readonly drivers: readonly RiskSignal[]
}

/** Points deducted from 100 for a full-weight signal at each severity. */
export const SCORE_WEIGHTS: Readonly<Record<Severity, number>> = {
  none: 0,
  low: 5,
  medium: 15,
  high: 30,
}

const GRADE_THRESHOLDS: ReadonlyArray<{ min: number; grade: RiskScoreResult['grade'] }> = [
  { min: 90, grade: 'A' },
  { min: 75, grade: 'B' },
  { min: 60, grade: 'C' },
  { min: 40, grade: 'D' },
  { min: 0, grade: 'F' },
]

const MAX_DRIVERS = 5

function deductionFor(signal: RiskSignal): number {
  const clampedWeight = Math.min(Math.max(signal.weight, 0), 1)
  return SCORE_WEIGHTS[signal.severity] * clampedWeight
}

export function computeRiskScore(signals: readonly RiskSignal[]): RiskScoreResult {
  const totalDeduction = signals.reduce((sum, s) => sum + deductionFor(s), 0)
  const score = Math.round(Math.min(Math.max(100 - totalDeduction, 0), 100))

  const grade =
    GRADE_THRESHOLDS.find((t) => score >= t.min)?.grade ?? 'F'

  const drivers = [...signals]
    .filter((s) => deductionFor(s) > 0)
    .sort((a, b) => deductionFor(b) - deductionFor(a))
    .slice(0, MAX_DRIVERS)

  return { score, grade, drivers }
}
