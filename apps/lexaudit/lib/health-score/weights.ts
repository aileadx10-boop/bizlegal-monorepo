/**
 * LexAudit — Signal weights + scoring.
 *
 * Weights translate evidence status into a numeric score per signal.
 * Framework scores are weighted averages of their signals. Overall
 * health-score is the unweighted mean of framework scores (frameworks
 * are weighted equally by default; customers may override per report).
 *
 * Scoring is deterministic given evidence. Missing evidence does NOT
 * default to zero — it is carried as "insufficient_evidence" and
 * surfaced in the report so the human reviewer decides whether to
 * chase it or accept the gap.
 *
 * Severity-derived base weights ensure critical signals dominate the
 * score. Tweaking these values bumps the disclosure version.
 */

import type { FrameworkId, Severity } from "./signals"
import { SIGNALS } from "./signals"

export type EvidenceStatus = "met" | "partial" | "not_met" | "insufficient_evidence"

const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

const STATUS_SCORE: Record<EvidenceStatus, number | null> = {
  met: 1,
  partial: 0.5,
  not_met: 0,
  // null = excluded from the denominator when insufficient evidence exists.
  insufficient_evidence: null,
}

export function signalWeight(severity: Severity): number {
  return SEVERITY_WEIGHT[severity]
}

export function statusScore(status: EvidenceStatus): number | null {
  return STATUS_SCORE[status]
}

export interface SignalEvaluation {
  signal_id: string
  status: EvidenceStatus
  reviewer_note?: string
}

export interface FrameworkScore {
  framework: FrameworkId
  score: number
  max: number
  ratio: number
  signals_scored: number
  signals_insufficient: number
}

/**
 * Score a framework from the submitted signal evaluations.
 *
 * Signals with `insufficient_evidence` are excluded from the
 * denominator (so they do not silently penalize the customer) but
 * are counted and surfaced. The reviewer decides whether to chase
 * the evidence or accept the gap.
 */
export function scoreFramework(
  framework: FrameworkId,
  evaluations: SignalEvaluation[],
): FrameworkScore {
  const frameworkSignals = SIGNALS.filter((s) => s.framework === framework)
  const evalById = new Map(evaluations.map((e) => [e.signal_id, e]))

  let score = 0
  let max = 0
  let signalsScored = 0
  let signalsInsufficient = 0

  for (const signal of frameworkSignals) {
    const evaluation = evalById.get(signal.id)
    const weight = signalWeight(signal.severity)
    if (!evaluation || evaluation.status === "insufficient_evidence") {
      signalsInsufficient += 1
      continue
    }
    const s = statusScore(evaluation.status)
    if (s === null) {
      signalsInsufficient += 1
      continue
    }
    score += s * weight
    max += weight
    signalsScored += 1
  }

  const ratio = max > 0 ? score / max : 0
  return { framework, score, max, ratio, signals_scored: signalsScored, signals_insufficient: signalsInsufficient }
}

export interface OverallScore {
  per_framework: FrameworkScore[]
  overall_ratio: number
}

/**
 * Compose a fleet-wide score across frameworks. Frameworks with no
 * signals evaluated are omitted from the overall ratio.
 */
export function scoreOverall(frameworks: FrameworkScore[]): OverallScore {
  const evaluated = frameworks.filter((f) => f.signals_scored > 0)
  const overall =
    evaluated.length > 0
      ? evaluated.reduce((sum, f) => sum + f.ratio, 0) / evaluated.length
      : 0
  return { per_framework: frameworks, overall_ratio: overall }
}
