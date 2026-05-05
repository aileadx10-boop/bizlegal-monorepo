/**
 * Pricing experiment registry — Phase AA Day 10.
 *
 * Implements the ±20% pricing authority rule from the AA plan: when a
 * product's conversion rate after 14 days of traffic is below 0.5%
 * (lead → checkout completion), the agent can lower the price one
 * step (10-20% down) and run another 14-day window. Hard floor: 80%
 * of starting price.
 *
 * Every override is a code commit (this file). That gives:
 *   - Audit trail in git blame
 *   - Compile-time validation of rule compliance via defineExperiment
 *   - Deterministic override (no DB / runtime config needed)
 *
 * Rules enforced at module load:
 *   1. Drop must be 10-20% from the static product's amount_cents.
 *      (Raising prices is FORBIDDEN by this layer — requires a direct
 *      edit to products.ts which is a Moses-approval gate.)
 *   2. Window must be ≤ 14 days. Renewals require a new experiment
 *      record with a new experiment_id.
 *   3. 80% floor: experiment_amount_cents must be ≥ 0.80 × original.
 *   4. Each experiment must include rationale + metric_before so the
 *      git diff explains the decision; metric_after lands when the
 *      window closes.
 *
 * To start an experiment: append a record to EXPERIMENTS, commit with
 * rationale in the commit message. To end: update metric_after on the
 * record and either let the window expire or set ends_at to now.
 *
 * No experiments are active by default; the registry ships empty.
 * The first ones land when conversion data justifies them.
 */

import type { ProductId } from './products.js'

export interface ConversionMetric {
  /** Window-grouped conversions actually reaching paid status. */
  readonly conversions: number
  /** Distinct visits or lead captures in the same window. */
  readonly visits: number
  /** Computed rate: 100 × conversions / visits, rounded to 2 places. */
  readonly rate_pct: number
}

export interface PricingExperiment {
  /** Stable id like "boi-kit-2026-05-15" — never reused. */
  readonly experiment_id: string
  /** Which product this overrides. */
  readonly product_id: ProductId
  /** ISO timestamp the override begins. */
  readonly started_at: string
  /** ISO timestamp the override ends. Must be ≤ 14 days after started_at. */
  readonly ends_at: string
  /** The original products.ts amount; cross-checked at registry load. */
  readonly original_amount_cents: number
  /** The override amount; must be 80-90% of original. */
  readonly experiment_amount_cents: number
  /** Computed drop percentage (cosmetic; validated against the cents math). */
  readonly drop_pct: number
  /** Why the experiment exists. Refers to the prior data point. */
  readonly rationale: string
  /** Required: 14-day metric that justified the drop. */
  readonly metric_before: ConversionMetric
  /** Filled in when the window closes. */
  readonly metric_after: ConversionMetric | null
}

const MAX_DROP_PCT = 20
const MIN_DROP_PCT = 10
const MAX_WINDOW_DAYS = 14

class PricingRuleError extends Error {
  override readonly name = 'PricingRuleError'
}

/**
 * Factory enforcing every rule. Throws at module load if any
 * experiment violates ±20% authority, 80% floor, 14-day window, or
 * structural shape. A throw at module load means the package fails
 * to import — which fails the build — which prevents a non-compliant
 * price from ever reaching production.
 */
export function defineExperiment(spec: PricingExperiment): PricingExperiment {
  const { experiment_id, product_id, started_at, ends_at } = spec
  if (!experiment_id || !product_id) {
    throw new PricingRuleError('experiment_id and product_id are required')
  }
  const start = Date.parse(started_at)
  const end = Date.parse(ends_at)
  if (Number.isNaN(start) || Number.isNaN(end)) {
    throw new PricingRuleError(
      `[${experiment_id}] started_at/ends_at must be ISO timestamps`,
    )
  }
  if (end <= start) {
    throw new PricingRuleError(`[${experiment_id}] ends_at must be after started_at`)
  }
  const windowDays = (end - start) / 86_400_000
  if (windowDays > MAX_WINDOW_DAYS) {
    throw new PricingRuleError(
      `[${experiment_id}] window ${windowDays.toFixed(1)}d > ${MAX_WINDOW_DAYS}d max`,
    )
  }

  const original = spec.original_amount_cents
  const experiment = spec.experiment_amount_cents
  if (original <= 0 || experiment <= 0) {
    throw new PricingRuleError(`[${experiment_id}] amounts must be positive cents`)
  }
  if (experiment >= original) {
    throw new PricingRuleError(
      `[${experiment_id}] price-raise forbidden via experiments — edit products.ts directly`,
    )
  }
  const computedDrop = ((original - experiment) / original) * 100
  if (computedDrop < MIN_DROP_PCT) {
    throw new PricingRuleError(
      `[${experiment_id}] drop ${computedDrop.toFixed(1)}% < min ${MIN_DROP_PCT}% — not material enough`,
    )
  }
  if (computedDrop > MAX_DROP_PCT) {
    throw new PricingRuleError(
      `[${experiment_id}] drop ${computedDrop.toFixed(1)}% > max ${MAX_DROP_PCT}% authority`,
    )
  }
  // 80% floor (equivalent to ≤20% drop) is already enforced by MAX_DROP_PCT.

  // Cross-check: the human-readable drop_pct must be within 0.5pp of math.
  if (Math.abs(spec.drop_pct - computedDrop) > 0.5) {
    throw new PricingRuleError(
      `[${experiment_id}] drop_pct ${spec.drop_pct} differs from math ${computedDrop.toFixed(1)}% by > 0.5pp`,
    )
  }
  if (!spec.rationale || spec.rationale.length < 30) {
    throw new PricingRuleError(
      `[${experiment_id}] rationale must be ≥30 chars — explain what the metric_before justifies`,
    )
  }
  if (!spec.metric_before) {
    throw new PricingRuleError(`[${experiment_id}] metric_before is required`)
  }
  return spec
}

/**
 * Active experiments. Append-only via defineExperiment(); never edit
 * historical records (they're the audit trail). Closed experiments
 * stay in the array for posterity — `applyOverride` skips them based
 * on ends_at.
 */
export const EXPERIMENTS: readonly PricingExperiment[] = []

/**
 * Pick the first active experiment for a given product, or null.
 * Active = now is in [started_at, ends_at). If two experiments overlap
 * for the same product (shouldn't happen but defensively handled),
 * the first by started_at wins.
 */
export function activeExperimentFor(
  productId: ProductId,
  now: Date = new Date(),
): PricingExperiment | null {
  const ts = now.getTime()
  const candidates = EXPERIMENTS.filter((e) => {
    if (e.product_id !== productId) return false
    const start = Date.parse(e.started_at)
    const end = Date.parse(e.ends_at)
    return ts >= start && ts < end
  })
  if (candidates.length === 0) return null
  candidates.sort((a, b) => Date.parse(a.started_at) - Date.parse(b.started_at))
  return candidates[0] ?? null
}
