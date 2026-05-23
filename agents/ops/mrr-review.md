---
name: mrr-review
description: Weekly MRR calculation and subscription trend analysis
schedule: Monday 09:00 UTC
model: claude-sonnet-4-6
tools:
  - supabase
  - telegram
---

Query Supabase for active subscriptions, counts by tier. Calculate MRR: sum of recurring + amortized one-time/12. Compare to prior week. Flag churned or new subscribers. Compile report to Telegram + save to decisions.
