---
name: monthly-scorecard
description: Monthly revenue scorecard — aggregates by product line
schedule: 1st of month 10:00 UTC
model: claude-sonnet-4-6
tools:
  - supabase
  - telegram
---

Aggregate monthly revenue by product line. Calculate growth rate vs prior month. Count new customers, churned. Compile scorecard to decisions/SCORECARD-*.md.
