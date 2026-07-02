# services/spy — Competitor Intelligence Crawlers

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

Phase 5 (PLATFORM-BUILD-2026-07-02): scrapes competitors and writes intel to `spy_intel` Supabase table.

## Scripts

- `competitor_pricing.py` — scrapes vanta/drata/sprinto/chainalysis pricing pages via Anthropic extraction
- `competitor_content.py` — tracks competitor blog/docs for content gaps
- `competitor_backlinks.py` — finds backlink opportunities via competitor link profiles
- `competitor_social.py` — monitors competitor LinkedIn/Twitter signals

All support `--dry-run` flag (prints JSON, no Supabase write).

## Deploy

SCP to Hetzner — path TBD (not yet on cron; run manually first to verify).

```bash
scp -i ~/.ssh/id_ed25519 services/spy/*.py root@204.168.209.235:/opt/bizlegal/curator/services/spy/
```

## Envs required

`SUPABASE_URL`, `SUPABASE_SECRET`, `ANTHROPIC_API_KEY`, `BIZLEGAL_INBOUND_SECRET`

## Output

Writes to `spy_intel` table — migration: `apps/hub/supabase/migrations/20260703_spy_intel.sql`.
Dashboard: `https://bizlegal-ai.com/ops/spy?t=$OPS_DASHBOARD_TOKEN`
