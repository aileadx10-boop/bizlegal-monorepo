# tools/social-autopilot

O-027 fleet social autopilot v1: a deterministic collector → scheduler → daily digest over the hub's `social_drafts` table (442 rows on 2026-09-15) and the blog index. Zero LLM calls in the run path, no auto-posting to any platform — it produces a digest a human reads and posts by hand. Run `node tools/social-autopilot/src/run-daily.cjs` (wraps `cli.mjs`, writes to `out/daily/`). `cli.mjs` imports `load-env.mjs` first so the gitignored `.env` is loaded before `live.ts` reads it. Source auto-detects: `hasLiveEnv()` reads `social_drafts` from Supabase when Supabase env is set, otherwise falls back to `fixtures/drafts.json`; the run's `source` field in `five-numbers.json` records which path ran. Digest channels: email through the hub relay `/api/internal/send-email` (HMAC with `BIZLEGAL_INBOUND_SECRET`, the fleet's one email path — never raw Resend), then Telegram, then a local `daily-digest-<date>.txt` file (proof mode).

## Envs
`NEXT_PUBLIC_SUPABASE_URL` · `SUPABASE_SERVICE_KEY` / `SUPABASE_SERVICE_ROLE_KEY` · `SOCIAL_DIGEST_TO_EMAIL` (must be an allow-listed operator address) · `BIZLEGAL_INBOUND_SECRET` · `NEXT_PUBLIC_HUB_URL` · `TELEGRAM_HUB_TOKEN` · `TELEGRAM_CHAT_ID`

## Run / Deploy
Hetzner cron `30 5 * * *` under `/opt/bizlegal/curator/tools/social-autopilot` (installed by `scripts/hetzner-relight-2026-09-15.sh`; the box's `curator/.env` supplies the names above). No Vercel project. Workflow: `workflows/social-daily-cron.md`.

## Rules
No LLM in the run path, no new vendors, no auto-posting, no direct gateway/email transport. `tools/social-autopilot/.env` is gitignored.

## See
`workflows/social-collect.md`, `social-schedule.md`, `social-digest.md`, `social-verify.md`, `social-daily-cron.md`; order `C:/Users/Moshe Dor/orders/O-027-fleet-social-autopilot.md`
