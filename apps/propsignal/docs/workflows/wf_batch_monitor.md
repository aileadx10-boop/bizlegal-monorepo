# wf_batch_monitor — portfolio monitoring

**Objective:** detect NEW risk signals on subscriber-monitored addresses and alert by email.

**Inputs:** all `propsignal_reports` rows with `monitoring = true` (subscriber addresses), yesterday's signal snapshot per address.

**Tools (in order):**
1. Daily cron (06:00 UTC, documented only — not yet installed).
2. Re-run source clients per monitored address (FEMA/EPA rarely change — cache 30 days; Socrata daily).
3. Diff today's `RiskSignal[]` vs stored snapshot (pure set-difference on `key`).
4. New signal at severity ≥ medium → alert email via Resend with affiliate CTA appropriate to the signal type.
5. `email.sent` ops event per alert.

**Outputs:** alert emails, updated snapshots, ops events.

**Edge cases:**
- **Source downtime:** skip diff for that source (never alert on missing data), retry next run.
- **Alert storm (city bulk-publishes violations):** cap at 1 digest email per user per day.
- **Cancelled subscriber:** monitoring flag flips off at subscription.cancelled; cron must filter on active status, not payment history.
