# services/hunt — Outbound Enrichment Pipeline

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

Phase 5 (PLATFORM-BUILD-2026-07-02): enriches leads and generates warm intro messages for outbound outreach.

## Scripts

- `apollo_enrich.py` — enriches `leadforge_leads` rows with Apollo.io company/person data
- `intent_signals.py` — scores `lead_outreach` rows by reply rate, visit signals, and recency
- `warm_intro.py` — generates warm intro messages for high-intent signals via Anthropic
- `hunt_orchestrator.py` — runs the 3 steps in sequence; entry point for cron

All support `--dry-run` flag.

## Deploy

SCP to Hetzner:

```bash
scp -i ~/.ssh/id_ed25519 services/hunt/*.py root@204.168.209.235:/opt/bizlegal/curator/services/hunt/
```

## Envs required

`SUPABASE_URL`, `SUPABASE_SECRET`, `ANTHROPIC_API_KEY`, `BIZLEGAL_INBOUND_SECRET`

## Cron (pending — add after first dry-run passes)

```bash
crontab -l > /tmp/c && echo '30 10 * * * cd /opt/bizlegal/curator && set -a && . ./.env && set +a && python3 /opt/bizlegal/curator/services/hunt/hunt_orchestrator.py >> /opt/bizlegal/logs/hunt.log 2>&1' >> /tmp/c && crontab /tmp/c
```
