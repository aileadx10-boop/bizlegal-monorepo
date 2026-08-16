# wf_expert_onboarding — application → active expert

**Objective:** admit only experts whose scores agree with the bench, without calls or video, with a human making every admission decision.

**Inputs:** `bench_expert_applications` row (status `received`).

**Tools (in order):**
1. Human screen (Moses): credentials vs open capacity → status `reviewed` or `declined` (decline email is transactional, kind and final).
2. Test task: email 5 sample items + rubric (from a retired/training set, never live held-out items). $100 flat, 72-hour window. Status `test_task_sent`.
3. Score the test: AI pre-check for completeness, then Moses (or a senior expert) reviews substance → `assessment_score` (0–5).
4. Calibration: double-score 5 items against an active expert (or Moses initially); `web/lib/inter-rater.ts` computes agreement; pairs with any dimension delta >1 discussed async.
5. Admission decision — HUMAN ONLY. Create `bench_experts` row (credential_class, rate, `sampling_rate=100`), status `active`. AI produces reports; humans decide (AI-hiring compliance).
6. Payment for test task via Wise/bank within 7 days regardless of outcome. No crypto payroll.

**Outputs:** active expert with calibration record, or documented decline; updated capacity map (jurisdiction × practice area).

**Edge cases:**
- **Great credentials, poor calibration:** decline or one re-calibration round — never admit on résumé alone; the score is the product.
- **Applicant asks for a call:** politely decline; async-only is structural, not personal.
- **Capacity full:** status `reviewed` + waitlist email (transactional); revisit when demand justifies (add experts only when demand exists — v5.0 rule).
- **Sampling-rate progression:** 100% → 20% after 3 tasks with qa_score >4.0 → exception-only after 10 tasks >4.5. Regression on QA failure.
