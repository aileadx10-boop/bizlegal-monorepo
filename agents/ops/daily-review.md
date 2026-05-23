---
name: daily-review
purpose: Generate daily status report, save to Google Drive + agents/ops/reviews/
schedule: Daily 23:55 UTC
model: haiku-4.5
triggers:
  - cron: "55 23 * * *"
---

# Daily Review Agent

## Entrypoint
```bash
cd /opt/bizlegal-monorepo && node scripts/daily-status-review.mjs
```

## What it does
1. Probes all 9 surfaces (Hub + 7 subdomains + DocAI funnel) — confirm 200
2. Checks revenue gate status (DocAI crypto, PayPal, affiliate, social)
3. Reports critical env gaps still empty in vault
4. Saves markdown to `agents/ops/reviews/daily-YYYY-MM-DD.md`
5. Uploads to Google Drive `BizLegal Daily Reviews/` folder

## Failure mode
If any surface returns non-200, append to report as DEGRADED. Do not suppress.
If Drive upload fails, log to stderr but keep the local file.
