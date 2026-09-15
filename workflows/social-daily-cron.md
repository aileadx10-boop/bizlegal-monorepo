# Workflow: Social Daily Cron

## Command (local-first)
```bash
cd "C:/Users/Moshe Dor/bizlegal-monorepo"
node tools/social-autopilot/src/run-daily.cjs
```

## Notes
- Writes digest + five-numbers to `tools/social-autopilot/out/daily/`.
- Use env `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_KEY` for live reads.
- Use env `RESEND_API_KEY` + `RESEND_FROM` + `SOCIAL_DIGEST_TO_EMAIL` for email; `TELEGRAM_HUB_TOKEN` + `TELEGRAM_CHAT_ID` for Telegram fallback.
- If no send env, writes digest to local file (proof mode).

## Cron entry (when authorized)
```
# every day 05:30 UTC
30 5 * * * cd /path/to/bizlegal-monorepo && node tools/social-autopilot/src/run-daily.cjs >> logs/autopilot.log 2>&1
```
