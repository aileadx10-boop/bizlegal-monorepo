# services/seo-agents — CLAUDE.md

**Purpose:** the Hetzner SEO/curator pipeline — ~15 Python jobs (brain, quality_gate, content writer, OG images, internal linker, affiliate funnel, geo citation, IndexNow pinger, blog publisher, EA report, analytics dashboard, cold-email drafts (dry-run only), headhunter, lead nurture). Schedules: `crontab.txt` + `daily-orchestrator.crontab`; logs `/var/log/seo-agents.log`.

**Deploy:** Hetzner CX33 — no git on box; SCP to `/opt/bizlegal/curator/services/seo-agents/` per `decisions/DEPLOYMENT_MAP.md`.

**Envs:** `CURATOR_DIR`, `PYTHON`, `BLOG_HOST`, `BLOG_PREFIX`, `INDEXNOW_STATE_PATH`, `GITHUB_TOKEN`, `BING_WEBMASTER_API_KEY`, `GSC_ACCESS_TOKEN`, `BUFFER_LINKEDIN_PROFILE`, `TELEGRAM_HUB_TOKEN` (canonical, ruling made 2026-09-09 — old `TG_BOT_TOKEN`/`BIZLEGAL_HERMES_BOT_TOKEN_X`/`BIZLEGAL_TELEGRAM_BOT_SECRET_TOKEN_VALUE` sprawl renamed), `SUPABASE_KEY`, `VAULT_PATH`, `OPS_ALERT_STALE_SECONDS`. Vaulted 2026-09-09 (O-022); values live in the Hetzner `.env`.

**Outbound:** `cold_email_outreach.py` stays dry-run until Moses explicitly flips live mode — and any future live send must go through the rule-7-v2 engine, not this script.
