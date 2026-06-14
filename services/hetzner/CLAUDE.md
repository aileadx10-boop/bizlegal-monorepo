# services/hetzner — Hetzner curator pipeline

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

Long-running Python services on the Hetzner CX33: scout (RSS poll + Ollama rank, daily 06:00 UTC), bot (Telegram BIZLEGALFORGEBOT pick/deploy/regen/reject gates, long-poll), publisher (FastAPI on :8082 commits MDX to bizlegal-ea + dual-deploys Forge-affinity content). Plus `firecrawl_enrich.py` — local httpx + trafilatura enrichment (replaced Firecrawl API 2026-06-14; no API key needed).

**Files:**
- `scout.py` — daily 06:00 UTC RSS feeds → Ollama filter+rank → top-3 to Supabase
- `brain.py` — Sonnet 4.6 long-form MDX draft (called from bot.py callback)
- `publisher.py` — FastAPI HTTP service for deploy/regen/reject; numeric-claim verification before commit
- `bot.py` — long-running Telegram callback handler; heartbeats every 5min
- `firecrawl_enrich.py` — URL content enrichment via httpx + trafilatura (no API key; same interface)
- `auto_pick.py` — daily 10:00 UTC fallback picker when Moses doesn't pick within 4h of scout
- `ops_log.py` — Python sibling of @bizlegal/ops-log
- `systemd/` — service + timer units
- `supabase/` — daily_gaps + forge_url migrations

**Critical envs (in `/opt/bizlegal/curator/.env`, mirrored from canonical vault):**

`TELEGRAM_CURATOR_BOT_TOKEN` (=`BIZLEGALFORGEBOT`), `TELEGRAM_CHAT_ID`, `SUPABASE_URL`, `SUPABASE_SECRET`, `OLLAMA_TUNNEL_URL`, `OLLAMA_TUNNEL_TOKEN`, `OLLAMA_FILTER_MODEL`, `OLLAMA_RANK_MODEL` (both set to `mistral-nemo`), `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `NEW_OPENAI_KEY`, `OPENAI_IMAGE_MODEL`, `GITHUB_TOKEN`, `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME`, `GITHUB_DEFAULT_BRANCH`, `VERCEL_DEPLOY_HOOK_HUB`, `VERCEL_DEPLOY_HOOK_FORGE`, `FORGE_REPO_OWNER`, `FORGE_REPO_NAME`, `FORGE_CONTENT_PATH_PREFIX`, `BIZLEGAL_INBOUND_SECRET`, `OPS_LOG_URL`, `PUBLISHER_HTTP_PORT`, `DISCLAIMER_VERSION`.

**Deploy (IMPORTANT — /opt/bizlegal is NOT a git repo):**

```bash
# There is no git clone on the box. Deploy by SCP'ing changed files.
scp -i ~/.ssh/id_ed25519 services/hetzner/<file>.py root@204.168.209.235:/opt/bizlegal/curator/<file>.py

# Then restart the affected services:
ssh root@204.168.209.235 "systemctl restart curator-bot curator-publisher"

# Containers (n8n + marimo) are managed by docker compose separately:
ssh root@204.168.209.235 "cd /opt/bizlegal && docker compose up -d"
```

**Migration notes (Z1.C 2026-05-02):** tree-copy from `C:/Users/Moshe Dor/Downloads/SKOOL-NATE/executive assistant/projects/hetzner-curator/`. .venv + __pycache__ + drafts/ excluded. systemd unit paths will need updating from `/opt/bizlegal/curator` to `/opt/bizlegal-monorepo/services/hetzner` when Hetzner is re-deployed (out of scope for this commit; Moses task).
