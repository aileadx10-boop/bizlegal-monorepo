---
name: partner-ops
description: OCI affiliate reconciliation + payout tracking
schedule: Wednesday 10:00 UTC
model: claude-haiku-4-5-20251001
tools:
  - event-log
  - telegram
---

Query OCI router for affiliate referral events since last check. Calculate pending payouts. Compare with affiliate terms. If > threshold → trigger payout. Log reconciliation report. Alert if payout exceeds balance.
