---
name: content-ops
description: Publish curator content to blog + syndicate across social channels
schedule: Daily 09:30 UTC
model: claude-haiku-4-5-20251001
tools:
  - event-log
---

Check curator bot for new content picks. If new → format for blog. Publish via GH content push. Cross-post to LinkedIn/socials via syndication pipeline. Log to event tape.
