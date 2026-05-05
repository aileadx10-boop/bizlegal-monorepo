# Pricing Experiments Ledger

> Append-only audit trail for `packages/payment/src/pricing-experiments.ts`. Every entry corresponds to one record in the `EXPERIMENTS` array, plus the commit that landed it. Closed experiments stay listed for posterity.

## Authority + rules (per Phase AA plan)

The agent (this codebase's automation) has **±20% pricing authority** under these constraints:

| Rule | Enforced where |
|---|---|
| Drop only — never raise via this layer | `defineExperiment()` throws if `experiment_amount_cents >= original_amount_cents` |
| 10–20% drop (must be material) | Throws if `drop_pct < 10` or `> 20` |
| 80% floor | Implicit via the 20% max-drop ceiling |
| 14-day window max | Throws if `(ends_at - started_at) > 14 days` |
| Required rationale (≥30 chars) | Throws if missing |
| Required `metric_before` (the data that justified the drop) | Throws if missing |
| Renewals require a new `experiment_id` | Convention; not auto-enforced |

Raising prices, dropping below 80% floor, or running > 14 days requires Moses-approval and a direct edit to `products.ts` (or a documented dispensation in this ledger).

---

## Active experiments

_(none — registry ships empty as of Phase AA D10)_

---

## How to start an experiment

1. Confirm the prerequisite: the product has had ≥14 days of traffic AND conversion rate < 0.5% on the static price.
2. Compute the experiment price (10-20% drop). Round to a clean dollar value where possible (e.g. $149 → $129, $97 → $79).
3. Append a `defineExperiment({...})` record to `EXPERIMENTS` in `pricing-experiments.ts` with:
   - `experiment_id`: `<product>-<yyyy-mm-dd>` slug
   - `original_amount_cents`: must match the static value in `products.ts`
   - `experiment_amount_cents`: the new price
   - `drop_pct`: cosmetic, validated to within 0.5pp of math
   - `started_at` / `ends_at`: ISO timestamps, ≤ 14 days apart
   - `rationale`: ≥30 chars, references the metric_before
   - `metric_before`: `{ conversions, visits, rate_pct }` from the prior window
   - `metric_after`: `null` (filled when the window closes)
4. Commit with message `feat(pricing): experiment <experiment_id> — <one-line rationale>`. The commit message becomes part of the audit trail; git blame on this file always recovers it.
5. Ship.

## How to close an experiment

1. After `ends_at`, gather the post-experiment conversion data.
2. Update `metric_after` on the existing record (do NOT delete the record).
3. Add a `# Closed` entry to this file with the verdict (kept / reverted / extended via new experiment).
4. Commit.

## Closed experiments

_(none yet)_
