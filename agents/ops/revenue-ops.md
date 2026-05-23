---
name: revenue-ops
description: Payment monitor — polls every 15min for new confirms and stale attempts
schedule: Every 15min
model: claude-haiku-4-5-20251001
tools:
  - ops-event-feed
  - telegram
---

Check the last 15 minutes of ops_events for `payment.confirmed` events. If any, send Telegram alert with amount + product. Check for payment attempts stuck in pending >1hr → alert Moses. Track daily revenue total vs targets.
