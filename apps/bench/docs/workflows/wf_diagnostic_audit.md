# wf_diagnostic_audit — one paid measurement engagement

**Objective:** turn an agreed scoping into a delivered measurement report in ~3 business days, with every number reproducible.

**Inputs:** `bench_intake` row with status `scoping`, agreed benchmark + version, planned eval count (25–30), payment confirmation (or Moses-approved invoice for pre-checkout engagements), client model outputs (upload) or access mode.

**Tools (in order):**
1. Create `bench_clients` + `bench_engagements` rows (status `evaluating`).
2. Select items from the held-out pool (never released items; never previously used items for the same client).
3. Collect model outputs (client upload, API run, or public interface) → `bench_evaluations` rows, mode per delivery-economics mix in `docs/PLAN.md`.
4. AI pre-score `ai_prescored` rows (Claude, rubric prompt) — scores are DRAFTS.
5. Assign expert verification sample (≥50% for pilots) + all `expert_full` items to a matching expert (`bench_experts`, jurisdiction + practice area).
6. QA per expert's `sampling_rate`; disagreement >1 on any dimension → second expert, resolution recorded.
7. `web/lib/rubric-engine.ts` → metrics; compile narrative + remediation memo (Claude drafts, Moses signs off).
8. Insert `bench_reports` (metrics jsonb, credentials classes, access_token) → deliver link `bench.bizlegal-ai.com/report/<id>?t=<token>` by transactional email → `report.generated` + `legal.cite_audit` ops events.

**Outputs:** delivered report row, scored evaluations (the data moat), follow-up note scheduled (satisfaction + managed-tier offer — sent only as reply to their engagement thread).

**Edge cases:**
- **Client outputs incomplete:** evaluate what was submitted; report states coverage explicitly. Never pad with generated outputs.
- **Expert misses 72h window:** reassign; expert's qa_score unaffected first time, flagged if repeated.
- **Unresolvable expert disagreement:** report the item as "contested" with both rationales — honesty beats false precision.
- **Client disputes a score:** methodology-shield applies; offer one re-review by a second expert at no charge; outcome is final.
- **Payment absent (pre-checkout era):** work starts only after Moses confirms payment received via invoice — no exceptions.
