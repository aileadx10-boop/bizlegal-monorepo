# wf_portfolio_monitor — Alert on upcoming critical dates

**Objective:** Scan every subscriber's stored abstracts daily and send tiered alerts for approaching critical dates (renewal notices, kick-outs, breakpoints, expirations).

**Inputs:** all `leaseparse_leases` rows with `critical_dates`, current date.

**Tools, in order:**
1. `date-engine.ts` `deriveCriticalDates(abstract, now)` → `UpcomingAlert[]` with tier 90|60|30|7.
2. Filter to alerts whose tier boundary is crossed today (fire once per tier, tracked in an `alerts` sent-log).
3. Alert generator (build phase 2) renders the email; include a CloseFlow cross-sell block when the property has no active transaction.
4. Send via Resend; log `email.sent` / `email.failed` ops events.

**Outputs:** tiered alert emails, sent-log rows, ops events.

**Edge cases:**
- **Notice window already missed** (date - notice_window_days < today): send an "overdue notice window" alert once, marked high severity — never pretend there is still time.
- **Duplicate abstracts for one property:** alert on the newest parse only.
- **Cancelled subscription:** exclude before rendering; never email churned users.
- **Timezone:** all math in UTC; display dates without time-of-day to avoid off-by-one confusion.
