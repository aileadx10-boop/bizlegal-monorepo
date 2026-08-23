/**
 * Deterministic lease risk scorer.
 *
 * Modelled on apps/propsignal/web/lib/score-engine.ts: a pure function over
 * already-extracted signals, severity-weighted deductions from 100, an A–F
 * grade, and a short list of top drivers. No LLM is involved — the model's job
 * ended when it produced the RiskFlag list; turning flags into a score must be
 * reproducible, explainable to a customer who disputes it, and identical on
 * every re-run of the same abstract.
 *
 * Higher score = safer lease. 100 means no risk clause was flagged at all.
 */

import type { LeaseAbstract, RiskClause, RiskFlag, RiskSeverity } from '../extract/types'

export type LeaseGrade = 'A' | 'B' | 'C' | 'D' | 'F'

/** Base points removed for a flag, before the clause multiplier. */
export const SEVERITY_WEIGHTS: Readonly<Record<RiskSeverity, number>> = {
  info: 5,
  warn: 15,
  high: 30,
}

/**
 * Per-clause multiplier (0–1) reflecting how much leverage the clause hands the
 * landlord. Relocation and demolition can end the tenancy outright, so they
 * carry full weight; an exclusive-use provision is usually a negotiated benefit
 * whose risk is narrower.
 */
export const CLAUSE_WEIGHTS: Readonly<Record<RiskClause, number>> = {
  demolition: 1.0,
  relocation: 1.0,
  co_tenancy: 0.9,
  go_dark: 0.8,
  assignment_restriction: 0.7,
  exclusive_use: 0.5,
}

export const CLAUSE_LABELS: Readonly<Record<RiskClause, string>> = {
  co_tenancy: 'Co-tenancy condition',
  go_dark: 'Go-dark / continuous operation',
  assignment_restriction: 'Assignment & subletting restriction',
  exclusive_use: 'Exclusive use provision',
  relocation: 'Landlord relocation right',
  demolition: 'Demolition / termination right',
}

const GRADE_THRESHOLDS: readonly { readonly min: number; readonly grade: LeaseGrade }[] = [
  { min: 90, grade: 'A' },
  { min: 75, grade: 'B' },
  { min: 60, grade: 'C' },
  { min: 40, grade: 'D' },
  { min: 0, grade: 'F' },
]

const MAX_DRIVERS = 5

export interface LeaseRiskDriver {
  readonly clause: RiskClause
  readonly label: string
  readonly severity: RiskSeverity
  /** Points this clause removed from the 100-point base. */
  readonly deduction: number
  readonly excerpt: string
}

export interface LeaseRiskResult {
  /** 0–100; 100 = no flagged risk clauses. */
  readonly score: number
  readonly grade: LeaseGrade
  /** Highest-impact clauses first, capped at MAX_DRIVERS. */
  readonly drivers: readonly LeaseRiskDriver[]
  readonly flagged_clause_count: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function deductionFor(flag: RiskFlag): number {
  const severityWeight = SEVERITY_WEIGHTS[flag.severity] ?? 0
  const clauseWeight = CLAUSE_WEIGHTS[flag.clause] ?? 0
  return severityWeight * clauseWeight
}

export function gradeFor(score: number): LeaseGrade {
  return GRADE_THRESHOLDS.find(t => score >= t.min)?.grade ?? 'F'
}

/**
 * Score a set of risk flags. Duplicate clauses are collapsed to their worst
 * occurrence so a model that emits the same clause three times cannot inflate
 * the deduction.
 */
export function scoreRiskFlags(flags: readonly RiskFlag[]): LeaseRiskResult {
  const worstByClause = new Map<RiskClause, { flag: RiskFlag; deduction: number }>()

  for (const flag of flags) {
    const deduction = deductionFor(flag)
    if (deduction <= 0) continue
    const existing = worstByClause.get(flag.clause)
    if (!existing || deduction > existing.deduction) {
      worstByClause.set(flag.clause, { flag, deduction })
    }
  }

  const scored = [...worstByClause.values()]
  const total = scored.reduce((sum, entry) => sum + entry.deduction, 0)
  const score = Math.round(clamp(100 - total, 0, 100))

  const drivers: LeaseRiskDriver[] = scored
    .slice()
    .sort((a, b) => b.deduction - a.deduction)
    .slice(0, MAX_DRIVERS)
    .map(({ flag, deduction }) => ({
      clause: flag.clause,
      label: CLAUSE_LABELS[flag.clause],
      severity: flag.severity,
      deduction: Math.round(deduction),
      excerpt: flag.excerpt,
    }))

  return {
    score,
    grade: gradeFor(score),
    drivers,
    flagged_clause_count: scored.length,
  }
}

/** Convenience wrapper for the pipeline, which holds a whole abstract. */
export function scoreLeaseRisk(abstract: LeaseAbstract): LeaseRiskResult {
  return scoreRiskFlags(abstract.risk_flags)
}
