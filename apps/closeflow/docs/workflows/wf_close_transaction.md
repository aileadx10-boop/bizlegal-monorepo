# wf_close_transaction — Archive + closing summary

**Objective:** When a transaction completes, deliver a clean closing-summary artifact and archive the record, then trigger the post-closing follow-up loop.

**Inputs:** transaction ID with all critical-path tasks completed (or closing date passed + user confirms closed).

**Tools:**
1. Summary generator (planned): checklist JSONB → HTML → PDF (timeline, completed tasks, document inventory).
2. Supabase update `closeflow_transactions.status = 'closed'`, stamp `closed_at`.
3. Resend delivery of summary PDF to payer + optional parties.
4. Post-closing follow-up cron (+7d): review request + cross-sell (LeaseParse if lease docs present, PropSignal risk report for the next acquisition).
5. `logEventAsync({ type: 'download.report', source: 'closeflow' })`.

**Outputs:** summary PDF, archived transaction, scheduled follow-up.

**Edge cases:**
- Open tasks remain at close → summary lists them under "outstanding at closing" (never silently drop).
- User closes early (deal died) → `status = 'cancelled'`, no summary, no follow-up sell.
- Re-open request within 30d → flip back to active, deadlines recomputed.
