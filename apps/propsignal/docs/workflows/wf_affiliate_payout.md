# wf_affiliate_payout — affiliate conversion tracking

**Objective:** attribute report-footer CTA clicks to partner conversions and queue commission records.

**Inputs:** `affiliate.click` ops events (referral ID, partner, report ID), partner-reported conversions (webhook or weekly CSV), commission schedule per partner.

**Tools (in order):**
1. Weekly cron (Mon 09:00 UTC, documented only).
2. Join clicks ↔ partner conversions on referral ID within a 30-day attribution window.
3. Write commission rows (partner, amount_cents, converted_at) — ledger table ships in build phase 3.
4. `referral.attributed` ops event per match.
5. Monthly summary email to Moses (payouts are manual — Payoneer/wire; no automated money movement).

**Outputs:** commission ledger rows, attribution ops events, monthly summary.

**Edge cases:**
- **Partner reports conversion with no matching click:** log unmatched, do not invoice; review monthly.
- **Duplicate conversion webhooks:** dedupe on (partner, conversion ID).
- **Window disputes:** ledger stores both click and conversion timestamps; the 30-day window is code, not negotiation.
