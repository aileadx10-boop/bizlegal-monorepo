---
name: pitch-ops
description: Cold pitch generation and sending via Gmail
schedule: Daily 11:00 UTC
model: claude-haiku-4-5-20251001
tools:
  - gmail
  - event-log
---

Load latest pitch queue from `decisions/COLD-PITCH-QUEUE-*.md`. Select 3-5 recipients. Generate personalized pitch per product. Send via Gmail API. Log to event tape. Update queue doc marking sent items.
