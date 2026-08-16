/**
 * Typed report structure — what /report/[id] renders and bench_reports.metrics
 * stores (jsonb). Self-contained deliverable, reserve-report pattern: own
 * table, own token gate, no dependency on the shared payments webhook.
 */

import type { EngagementMetrics } from './rubric-engine'

export interface ExpertCredentialLine {
  /** Displayed exactly as stored — credential class only, never a name. */
  readonly credentialClass: string
}

export interface BenchReport {
  readonly id: string
  readonly engagementId: string
  /** e.g. 'MiCA-Bench' */
  readonly benchmarkName: string
  readonly benchmarkVersion: string
  readonly jurisdiction: string
  readonly practiceArea: string
  /** Client's own identifier for the system under test. */
  readonly targetSystem: string
  readonly metrics: EngagementMetrics
  /** Findings + remediation memo, markdown-ish prose rendered as paragraphs. */
  readonly narrative: string
  readonly expertCredentials: readonly ExpertCredentialLine[]
  readonly deliveredAt: string | null
}

/** Shape of a bench_reports row joined with its engagement (PostgREST select). */
export interface BenchReportRow {
  readonly id: string
  readonly engagement_id: string
  readonly access_token: string
  readonly metrics: EngagementMetrics
  readonly narrative: string | null
  readonly expert_credentials: ReadonlyArray<{ credentialClass?: string }>
  readonly delivered_at: string | null
  readonly bench_engagements: {
    readonly benchmark_slug: string | null
    readonly benchmark_version: string | null
    readonly jurisdiction: string
    readonly practice_area: string
    readonly target_system: string | null
  } | null
}
