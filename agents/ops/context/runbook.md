# Daily Runbook

Extracted from `decisions/DAILY-RUNBOOK-2026-05-21.md`.

## Morning (already automated)
- 08:00 UTC — `daily-revenue-digest` EA agent → Telegram
- 08:55 UTC — `smoke` cron probes all 8 surfaces
- 09:00 UTC — `ops-alerts` runs (and every 15min after)
- 09:30 UTC — `daily-content-pick-suggestion` EA agent → Telegram

## Daily automation
- 10:00 UTC — `daily-affiliate-followup` EA agent
- 11:00 UTC — `daily-cold-pitch-suggestion` EA agent
- 11:00 UTC — `ai-act-monitor` cron
- 12:00 UTC — `policy-refresh` cron
- 14:00 UTC — `boi/check` cron

## Weekly
- Mon 09:00 UTC — `weekly-mrr-review` EA agent (Sonnet)
- Wed 10:00 UTC — Partner/OCI reconciliation (manual)
- Fri 10:30 UTC — `affiliate-reconcile` cron
- Fri 17:00 UTC — `friday-retrospective` EA agent (Sonnet)

## Monthly
- 1st 09:00 UTC — `monthly-vertical-scorecard` EA agent (Sonnet)

## What Moses still does manually
| Task | When | Why still manual |
|------|------|------------------|
| Social token setup | One-time | API keys need Moses accounts |
| Plausible signup | One-time | Needs Moses credit card |
| GSC service account | One-time | Needs GCP console |
| Hetzner publisher patch | One-time | SSH + env var check |
| PayPal LIVE flip | One-time | Needs PayPal developer dashboard |
