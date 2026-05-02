/**
 * LexAudit — Health-score report generator.
 *
 * Produces a HealthScoreReport from a set of signal evaluations.
 * Every report carries the active DISCLAIMER_VERSION stamp plus the
 * issued_at timestamp, so if an assertion is ever challenged the
 * version in force is reproducible.
 *
 * A report is intelligence, not a compliance finding. It attests to
 * the evidence submitted and the process documented; it does not
 * certify the customer as compliant with any framework. The Trust
 * and Methodology pages carry the full posture.
 */

import { DISCLAIMER_VERSION, disclaimerStamp } from "@/lib/legal/disclaimer"
import {
  FRAMEWORK_LABELS,
  type FrameworkId,
  SIGNALS,
  type Signal,
} from "./signals"
import {
  type EvidenceStatus,
  type FrameworkScore,
  type OverallScore,
  type SignalEvaluation,
  scoreFramework,
  scoreOverall,
  signalWeight,
} from "./weights"

export interface EvaluatedSignal {
  signal: Signal
  status: EvidenceStatus
  weight: number
  reviewer_note?: string
}

export interface ReviewerSignoff {
  reviewer_id: string
  signed_at: string
  note?: string
}

export interface HealthScoreReport {
  report_id: string
  customer_id: string
  frameworks_evaluated: FrameworkId[]
  evaluated_signals: EvaluatedSignal[]
  framework_scores: FrameworkScore[]
  overall: OverallScore
  reviewer: ReviewerSignoff
  disclaimer_version: string
  issued_at: string
  posture_summary: string
}

export interface GenerateReportInput {
  report_id: string
  customer_id: string
  frameworks: FrameworkId[]
  evaluations: SignalEvaluation[]
  reviewer: ReviewerSignoff
}

/**
 * Generate a report. The reviewer signoff is required — no output
 * ships without a named reviewer, per the liability firewall.
 */
export function generateReport(input: GenerateReportInput): HealthScoreReport {
  if (!input.reviewer?.reviewer_id) {
    throw new Error("Reviewer signoff is required before a health-score report can be generated.")
  }

  const stamp = disclaimerStamp()
  const evalById = new Map(input.evaluations.map((e) => [e.signal_id, e]))

  const relevantSignals = SIGNALS.filter((s) => input.frameworks.includes(s.framework))
  const evaluated: EvaluatedSignal[] = relevantSignals.map((signal) => {
    const evaluation = evalById.get(signal.id)
    return {
      signal,
      status: evaluation?.status ?? "insufficient_evidence",
      weight: signalWeight(signal.severity),
      reviewer_note: evaluation?.reviewer_note,
    }
  })

  const framework_scores = input.frameworks.map((fw) =>
    scoreFramework(fw, input.evaluations),
  )
  const overall = scoreOverall(framework_scores)

  return {
    report_id: input.report_id,
    customer_id: input.customer_id,
    frameworks_evaluated: input.frameworks,
    evaluated_signals: evaluated,
    framework_scores,
    overall,
    reviewer: input.reviewer,
    disclaimer_version: stamp.disclaimer_version,
    issued_at: stamp.issued_at,
    posture_summary: postureSummary(overall),
  }
}

/**
 * Map the overall ratio to a short, conservative posture label.
 * The label is intelligence — it does not certify compliance.
 */
export function postureSummary(overall: OverallScore): string {
  const r = overall.overall_ratio
  if (overall.per_framework.every((f) => f.signals_scored === 0)) {
    return "Insufficient evidence submitted. No posture can be characterised without reviewed signals."
  }
  if (r >= 0.9) return "Strong evidence across the evaluated frameworks. Minor gaps flagged in the per-signal detail."
  if (r >= 0.75) return "Solid posture with specific gaps. Review the per-signal detail for priority remediation."
  if (r >= 0.5) return "Mixed posture. Multiple high-severity signals either partial or not met. Prioritised remediation is advised."
  if (r > 0) return "Early-stage posture. Substantial gaps across frameworks. Remediation plan and reviewer consultation advised."
  return "No signals met or partially met in the evaluated frameworks. Treat this report as a baseline for a remediation plan."
}

export interface ReportHeader {
  report_id: string
  customer_id: string
  disclaimer_version: string
  issued_at: string
  reviewer_id: string
  frameworks: { id: FrameworkId; label: string }[]
}

export function reportHeader(report: HealthScoreReport): ReportHeader {
  return {
    report_id: report.report_id,
    customer_id: report.customer_id,
    disclaimer_version: report.disclaimer_version,
    issued_at: report.issued_at,
    reviewer_id: report.reviewer.reviewer_id,
    frameworks: report.frameworks_evaluated.map((id) => ({
      id,
      label: FRAMEWORK_LABELS[id],
    })),
  }
}

/** Serialise a report to a disclosure-stamped JSON string. */
export function serializeReport(report: HealthScoreReport): string {
  return JSON.stringify(
    {
      ...report,
      _stamp: { disclaimer_version: DISCLAIMER_VERSION, schema: "lexaudit.health-score.v1" },
    },
    null,
    2,
  )
}
