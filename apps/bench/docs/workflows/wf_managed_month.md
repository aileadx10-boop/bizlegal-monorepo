# wf_managed_month — one monthly cycle of a Managed Evaluation Program

**Objective:** deliver a monthly accuracy-tracking cycle (100–150 evals) that stays inside the delivery-economics margin and surfaces regressions.

**Inputs:** active `bench_engagements` row (tier `managed_monthly`), subscription payment confirmed for the month, client's current model/version identifier, pinned benchmark version.

**Tools (in order):**
1. Item selection: rotate held-out items; re-use a fixed 20% "tracking core" month-over-month so trends are apples-to-apples; never reveal which items repeat.
2. Collect outputs (API run preferred for managed tier).
3. Eval mix per `docs/PLAN.md`: ~80% `ai_prescored` (30% expert-verified), ~20% `expert_full`.
4. Rubric engine → monthly metrics; diff vs prior months → regression flags (any headline metric worse by >5 points, or new critical errors, leads the report).
5. Compile trend report + remediation delta (what improved after last month's memo, what didn't) → `bench_reports` row → transactional delivery.
6. Ops: `report.generated`; margin check — expert spend for the cycle logged against the $2,300–2,900 budget line.

**Outputs:** monthly report with trend section, updated longitudinal dataset (the retention moat: only we hold the client's accuracy history).

**Edge cases:**
- **Client shipped a new model mid-cycle:** measure the version that is live at collection time; name it in the report; never average across versions.
- **Expert capacity short:** shrink the cycle to what experts can verify honestly and say so — never relax the sampling rate silently.
- **Subscription lapses mid-cycle:** finish the cycle, deliver, pause the next; dunning is hub's problem, not the report's.
- **Metrics flat for 3+ months:** propose benchmark version bump or harder difficulty band — flat can mean "solved", or "test too easy".
