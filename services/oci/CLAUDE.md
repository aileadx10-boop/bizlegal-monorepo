# services/oci — OCI deal-router

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

FastAPI service on Oracle Cloud (il-jerusalem-1 region). Routes real-estate-vertical leads to vetted partners via finder-fee splits — the asymmetric pillar (one $25K close = months of $29-99/mo subscriptions).

**Routes (in `router/main.py`):**
- `POST /lead` — HMAC-verified inbound from EA Worker classifier or hub `realestate-intake` proxy. Fires referral.received → routed.
- `GET /health` — liveness + redis + supabase status (token-gated through Caddy via Cloudflare DNS-01)
- `GET /partners`, `POST /feedback`, `GET /payouts` — admin (X-Admin-Secret)

**Files:**
- `router/main.py` — FastAPI app
- `router/storage.py` — Supabase + Redis adapters
- `router/partners.py` — partner selection logic
- `router/llm.py` — Sonnet classifier
- `router/notify.py` — Telegram + Resend dispatch (mirrors HOT alerts to ops_log)
- `router/payout_reconciler.py` — fires referral.paid weekly (Fri 10:00 UTC)
- `router/ops_log.py` — Python sibling of @bizlegal/ops-log
- `Dockerfile`, `docker-compose.yml`, `Caddyfile` — deploy infra
- `systemd/` — payout-report.timer + payout-reconciler.timer
- `supabase/` — partners + deal_router_leads + payouts migrations

**Critical envs (in `/opt/oci-deal-router/.env`):**

`ANTHROPIC_API_KEY`, `NEW_OPENAI_KEY`, `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SECRET`, `BIZLEGAL_INBOUND_SECRET`, `OPS_LOG_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_REPLY_TO`, `ROUTER_ADMIN_SECRET`, `LOG_LEVEL`, `REDIS_URL`, `DISCLAIMER_VERSION`.

Plus Caddy needs `CLOUDFLARE_AUTH_EMAIL` + `CLOUDFLARE_API_KEY` for DNS-01 challenge (per Z0.7 audit).

**Deploy:**

```bash
ssh oci
cd /opt/oci-deal-router  # or /opt/bizlegal-monorepo/services/oci after monorepo cutover
docker compose up -d --build
sudo systemctl reload caddy
```

**Migration notes (Z1.C 2026-05-02):** tree-copy from `C:/Users/Moshe Dor/Downloads/SKOOL-NATE/executive assistant/projects/oci-deal-router/`. .venv + __pycache__ + .cache excluded. systemd path updates deferred to Moses re-deploy.
