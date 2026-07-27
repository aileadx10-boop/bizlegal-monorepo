# wf_track_deadlines — Daily deadline scan + reminder dispatch

**Objective:** Every active transaction gets the right reminder at the right time, escalating as deadlines approach — with zero human touch.

**Inputs:** all `closeflow_transactions` where `status = 'active'`; current UTC date.

**Tools:**
1. `web/lib/date-calculator.ts` → `daysUntil(dueDate)` per open task.
2. Reminder tiers: 7d (info), 3d (action), 1d (urgent), overdue (escalate + cc counterpart).
3. Resend email templates per tier; affiliate CTA slot filled by Partner Agent logic (task type + zip).
4. `logEventAsync({ type: 'cron.completed', source: 'closeflow' })` with counts.

**Outputs:** reminder emails; `alerts` rows recording what was sent (dedup key: transaction_id + task_key + tier).

**Edge cases:**
- Already-sent tier for a task → skip (dedup on alerts table).
- Task completed after reminder queued → suppress at send time.
- Closing date moved → recompute all due dates first, then evaluate tiers.
- Email bounce → mark contact unreachable, surface in weekly summary instead of retry-spamming.
