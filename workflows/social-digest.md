# Workflow: Social Digest

## Purpose
Produce a daily ready-to-post digest for the operator (Moses) via Resend email (Telegram fallback).

## Environment
- `RESEND_API_KEY` — required for live email send
- `RESEND_FROM` — required for live email send
- `TELEGRAM_HUB_TOKEN` — fallback channel (canonical token name per fleet ruling)

Local mode: if env missing, write digest to `out/daily-digest.txt` and log to stdout. Never send secrets.

## Output
- Email/Telegram-ready digest containing, per platform:
  - Hook/body
  - Source URL
  - Tags
- AEO snippet section appended.

## Steps
1. Read today's queue items.
2. Format per platform (copy-paste friendly).
3. Send via Resend if env present; else Telegram if env present; else local file.
