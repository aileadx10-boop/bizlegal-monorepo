---
name: morning-ops
description: Daily health check + event digest + Telegram summary
schedule: Daily 08:55 UTC
model: claude-sonnet-4-6
tools:
  - ops-health-check
  - ops-event-feed
  - telegram
---

Run the morning ops check. Call `/api/ops/health` for fleet status. Call `/api/ops/feed` for 24h events. Compile a 3-paragraph digest: health status, revenue events overnight, any red items. Send to Telegram via `sendToTelegram`. If anything is RED, include the fix action from the runbook escalation table.
