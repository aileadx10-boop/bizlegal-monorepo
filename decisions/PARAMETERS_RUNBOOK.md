# PARAMETERS_RUNBOOK — Disaster recovery for every environment

**Version:** v1 (covers Phase O–T + Phase V0+V1+V2+Y)
**Audience:** Moses
**Rule #1:** This doc is committed to git. **No secret values appear here, ever.** Every entry tells you the env var NAME, where it must be SET, and how to REGENERATE the value if lost.

---

## How to use this doc

If a project / VM / Vercel deploy is wiped and you need to rebuild from scratch:

1. Look up the env names in the relevant section below.
2. **Read the value from the canonical local vault — see Section 0** — never from this committed runbook.
3. Paste the recovered value into the new project's env settings.
4. Deploy → run the verification check at the bottom of this doc.

If a value is missing from the canonical vault (newly generated secret, just-rotated key), follow the "regenerate from" instruction in Section 1 (Anthropic console, NOWPayments dashboard, `openssl rand`, etc.), then **add it back to the canonical vault** so it stays the single source of truth.

---

## Section 0 — The canonical vault file (single source of truth)

> **`C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt`** is the only place that holds actual secret VALUES across the entire BizLegal AI fleet.

**Rules:**

- This file is local-only. **Never** commit it to git. **Never** print its contents in chat.
- Every Vercel project, every subdomain, every wrangler secret, every `/opt/bizlegal/curator/.env`, every `/opt/oci-deal-router/.env` reads from / pastes into this file.
- When you generate a fresh secret (e.g., `openssl rand -hex 32` for `BIZLEGAL_INBOUND_SECRET`), record it in this file FIRST, then paste to Vercel / Hetzner / OCI / Worker. Never let the new value live only in one location.
- Backup target: 1Password (or equivalent encrypted vault) for the canonical content; encrypted offsite copy weekly per Section 9.
- Other historical files (`.env.CANONICAL.txt`, `.env.bizlegal.txt`, `.env.allprojects.txt`, `.bizlegal/webhook-secret.env`) are LEGACY / partial copies. Treat them as archival only — do not write to them. If something is in those files but not in `env-hub-bizlegal-ai.txt`, copy it forward to the canonical file and remove the legacy duplicate after verification.

**Quick verification commands (no values printed to terminal):**

```bash
# Confirm a secret is set in the canonical vault (returns 1 if present, 0 if missing):
grep -c "^BIZLEGAL_INBOUND_SECRET=" "C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt"

# List every var name in the canonical vault (names only, no values):
awk -F= '/^[A-Z_]+=/{print $1}' "C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt" | sort -u

# Count how many critical envs are present (sanity check):
awk -F= '/^[A-Z_]+=/{print $1}' "C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt" | sort -u | wc -l
# Expect: ~180+ unique names
```

If a value is missing from this file: regenerate per Section 1, paste into the file, AND paste into the corresponding Vercel/Hetzner/OCI location. Both the file and the live env must agree.

---

## Section 1 — Universal source-of-truth table

| Secret | Type | Regenerate from |
|---|---|---|
| `BIZLEGAL_INBOUND_SECRET` | symmetric HMAC, hex 32 | `openssl rand -hex 32` — write down once, paste everywhere |
| `OPS_DASHBOARD_TOKEN` | symmetric token, hex 32 | `openssl rand -hex 32` — same pattern |
| `WEBHOOK_SHARED_SECRET` (Worker) | same hex as `BIZLEGAL_INBOUND_SECRET` | reuse the BIZLEGAL_INBOUND_SECRET hex |
| `CRON_SECRET` | symmetric token, hex 32 | `openssl rand -hex 32` |
| `ANTHROPIC_API_KEY` | API key | console.anthropic.com → API Keys → Create |
| `NEW_OPENAI_KEY` / `OPENAI_API_KEY` | API key | platform.openai.com → API Keys |
| `GEMINI_API_KEY` | API key | aistudio.google.com → Get API key |
| `RESEND_API_KEY` | API key | resend.com → API Keys |
| `RESEND_FROM` / `RESEND_FROM_EMAIL` | email | constant `intelligence@intelligence.bizlegal-ai.com` |
| `RESEND_REPLY_TO` | email | constant `team@bizlegal-ai.com` |
| `NOWPAYMENTS_API_KEY` | API key | account.nowpayments.io → Settings → API |
| `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` | OAuth pair | developer.paypal.com → Apps & Credentials → Live |
| `PAYPAL_API_URL` | URL | constant `https://api-m.paypal.com` (or `-sandbox` for test) |
| `TELEGRAM_BOT_TOKEN` (BIZLEGALFORGEBOT / Bizlegalbot) | bot token | @BotFather → /token → revoke + reissue if lost |
| `TELEGRAM_CHAT_ID` | numeric | Moses's Telegram user id (constant: `989097520`) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL | Supabase project → Settings → API |
| `SUPABASE_SERVICE_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | service-role JWT | Supabase project → Settings → API → service_role secret |
| `SUPABASE_SECRET` (curator + OCI) | same as SUPABASE_SERVICE_KEY | reuse |
| `GITHUB_TOKEN` (curator + Worker) | fine-grained PAT | github.com/settings/tokens?type=beta — scope: contents:write on `aileadx10-boop/bizlegal-ea` + `aileadx10-boop/forge` |
| `FIRECRAWL_API_KEY` | API key | firecrawl.dev/account — **rotate the leaked `fc-a46c...` first** |
| `OLLAMA_TUNNEL_URL` + `OLLAMA_TUNNEL_TOKEN` | CF tunnel | one.dash.cloudflare.com → Zero Trust → Service Tokens |
| `VERCEL_DEPLOY_HOOK_HUB` | webhook URL | Vercel → bizlegal-ai → Settings → Git → Deploy Hooks |
| `VERCEL_DEPLOY_HOOK_FORGE` | webhook URL | Vercel → forge → Settings → Git → Deploy Hooks |
| `CF_PAGES_DEPLOY_HOOK` (blog) | webhook URL | Cloudflare → Pages → blog → Settings → Deploy hooks |
| `OCI_ROUTER_URL` | constant | `https://router.bizlegal-ai.com/lead` |
| `LEXAUDIT_MONITOR_URL` | constant | `https://lexaudit.bizlegal-ai.com` |
| `NEXT_PUBLIC_APP_URL` | constant | `https://bizlegal-ai.com` |
| `ROUTER_ADMIN_SECRET` (OCI) | symmetric | `python -c "import secrets;print(secrets.token_urlsafe(32))"` |
| `REDIS_URL` (OCI) | URL | constant `redis://redis:6379` (in Docker compose) |
| `DISCLAIMER_VERSION` | constant | `v1.0.0-p4` |

Payment-product URLs (NEXT_PUBLIC_NOWPAYMENTS_*, NEXT_PUBLIC_PAYPAL_*) live in **`PAYMENT_URLS_VAULT.md`** — separate doc.

---

## Section 2 — Per-environment env list

For each project, this is the canonical env-var list. Compare to your live Vercel UI / .env files via `/api/ops/health` audit (one-line per project below).

### 2.1 — bizlegal-ai (hub) · Vercel

Critical: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `BIZLEGAL_INBOUND_SECRET`, `CRON_SECRET`, `OPS_DASHBOARD_TOKEN`, `RESEND_API_KEY`, `NOWPAYMENTS_API_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `ANTHROPIC_API_KEY`.

Optional: `PAYPAL_API_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `NEXT_PUBLIC_APP_URL`, `LEXAUDIT_MONITOR_URL`, `FIRECRAWL_API_KEY`, `OCI_ROUTER_URL`.

Plus 14+ payment URL constants — see PAYMENT_URLS_VAULT.md.

Live audit: `curl -s "https://bizlegal-ai.com/api/ops/health?t=$OPS_DASHBOARD_TOKEN" | jq '.envs[] | select(.set == false)'` → returns rows that need to be set.

### 2.2 — tracr (frontend Next.js) · Vercel

Critical: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `BIZLEGAL_INBOUND_SECRET`, `OPS_DASHBOARD_TOKEN`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `NOWPAYMENTS_API_KEY`.

Optional: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `TRACR_BLOCKSCOUT_API_KEY`, `TRACR_ETHERSCAN_API_KEY`.

Live audit: `curl -s "https://tracr.bizlegal-ai.com/api/ops/health?t=$OPS_DASHBOARD_TOKEN"` (only works after Phase A6 alias + Phase A3 token).

### 2.3 — brai (frontend-next/) · Vercel

Critical: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `BIZLEGAL_INBOUND_SECRET`, `OPS_DASHBOARD_TOKEN`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `NOWPAYMENTS_API_KEY`.

Optional: `CHAINALYSIS_API_KEY`, `OFAC_SDN_FEED_URL`, PayPal pair.

### 2.4 — lexaudit · Vercel

Critical: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `BIZLEGAL_INBOUND_SECRET`, `OPS_DASHBOARD_TOKEN`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `NOWPAYMENTS_API_KEY`, `CRON_SECRET`.

Optional: `FIRECRAWL_API_KEY`, PayPal pair.

### 2.5 — docai · Vercel

Critical: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `BIZLEGAL_INBOUND_SECRET`, `OPS_DASHBOARD_TOKEN`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `NOWPAYMENTS_API_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`.

Optional: `OPENAI_EMBEDDING_KEY` (Firm-tier KB).

### 2.6 — leadforge · Vercel

Critical: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `BIZLEGAL_INBOUND_SECRET`, `OPS_DASHBOARD_TOKEN`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`.

Optional: `NOWPAYMENTS_API_KEY`, PayPal pair, `APIFY_TOKEN`.

### 2.7 — forge (apps/web/) · Vercel

Critical: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `BIZLEGAL_INBOUND_SECRET`, `OPS_DASHBOARD_TOKEN`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `NOWPAYMENTS_API_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`.

Optional: `STRIPE_SECRET_KEY`.

### 2.8 — bizlegal-lead-intake (Cloudflare Worker)

Set via `wrangler secret put <NAME>` against the Worker:

Critical: `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`, `WEBHOOK_SHARED_SECRET` (= `BIZLEGAL_INBOUND_SECRET`).

Optional: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_REPLY_TO`, `PUBLIC_SNAPSHOT_ENABLED`, `OPS_LOG_URL`.

Non-secret vars (in `wrangler.toml`): `PIPELINE_VERSION`, `GITHUB_REPO_OWNER` = `aileadx10-boop`, `GITHUB_REPO_NAME` = `bizlegal-ea`, `GITHUB_DEFAULT_BRANCH` = `main`, `HAIKU_MODEL_ID` = `claude-haiku-4-5`, `SONNET_ESCALATION_MODEL_ID` = `claude-sonnet-4-6`, `MIN_CONFIDENCE_THRESHOLD` = `0.80`, `NOTIFY_SCORE_THRESHOLD` = `7`.

KV bindings: `DIGEST_KV` id `f56bcfd5fd4d46468da269070a7ad323`.

Crons (in wrangler.toml): `0 6 * * *` (daily digest), `0 9 * * *` (smoke test).

### 2.9 — Hetzner curator (`/opt/bizlegal/curator/.env`)

Required:
- `TELEGRAM_CURATOR_BOT_TOKEN` (BIZLEGALFORGEBOT)
- `TELEGRAM_CHAT_ID` (Moses)
- `SUPABASE_URL` + `SUPABASE_SECRET`
- `OLLAMA_TUNNEL_URL` + `OLLAMA_TUNNEL_TOKEN`
- `OLLAMA_FILTER_MODEL` (default `llama3.2:3b`) + `OLLAMA_RANK_MODEL` (default `qwen2.5:7b-instruct-q4_K_M`)
- `ANTHROPIC_API_KEY` + `ANTHROPIC_MODEL` (default `claude-sonnet-4-6`)
- `NEW_OPENAI_KEY` (or `OPENAI_API_KEY`) + `OPENAI_IMAGE_MODEL` (default `gpt-image-1`)
- `GITHUB_TOKEN` + `GITHUB_REPO_OWNER` (default `aileadx10-boop`) + `GITHUB_REPO_NAME` (default `bizlegal-ea`) + `GITHUB_DEFAULT_BRANCH` (default `main`)
- `VERCEL_DEPLOY_HOOK_HUB`
- `VERCEL_DEPLOY_HOOK_FORGE` (R4 — Forge dual-deploy)
- `FORGE_REPO_OWNER` (default `aileadx10-boop`) + `FORGE_REPO_NAME` (default `forge`) + `FORGE_CONTENT_PATH_PREFIX` (default `apps/web/content/blog`)
- `BIZLEGAL_INBOUND_SECRET` + `OPS_LOG_URL` (default `https://bizlegal-ai.com/api/ops/log`)
- `FIRECRAWL_API_KEY` + optional `FIRECRAWL_BASE_URL`
- `PUBLISHER_HTTP_PORT` = `8082`
- `DISCLAIMER_VERSION` = `v1.0.0-p4`

Systemd units: `curator-scout.service` + `.timer`, `curator-bot.service`, `curator-publisher.service`.

After change: `sudo systemctl restart curator-bot curator-publisher`.

### 2.10 — OCI deal-router (`/opt/oci-deal-router/.env`)

Required:
- `ANTHROPIC_API_KEY`, `NEW_OPENAI_KEY`, `GEMINI_API_KEY` (+ optional `GEMINI_API_CONTENT_1` / `_2`)
- `SUPABASE_URL` + `SUPABASE_SECRET` (note: OCI may use a different Supabase project than hub)
- `BIZLEGAL_INBOUND_SECRET` + optional `OPS_LOG_URL`
- `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` (= `989097520`)
- `RESEND_API_KEY` + `RESEND_FROM` + `RESEND_REPLY_TO`
- `ROUTER_ADMIN_SECRET`
- `LOG_LEVEL` = `INFO`
- `REDIS_URL` = `redis://redis:6379`
- `DISCLAIMER_VERSION` = `v1.0.0-p4`

Systemd units: `deal-router.service`, `payout-report.service` + `.timer`, `payout-reconciler.service` + `.timer` (Fri 10:00 UTC).

After change: `sudo systemctl restart deal-router payout-reconciler`.

---

## Section 3 — HMAC chain map

Who signs what, who verifies what. If any of these break, /ops events stop flowing for that source.

```
         ┌───────────────────────────────────────────────────────────────┐
         │  BIZLEGAL_INBOUND_SECRET — same hex on all 11 surfaces below  │
         └───────────────────────────────────────────────────────────────┘
                                       │
   ┌───────────────────────┬──────────────────────────┬──────────────────────────┐
   │                       │                          │                          │
[Hub]                    [Worker]                  [Curator]                  [OCI]
bizlegal-ai              CF Worker                 Hetzner                    OCI VM
/api/ops/log             /intake                   ops_log.py                 ops_log.py
   │                       │                          │                          │
   │ verifies               │ signs out → hub /api/ops/log
   │ all inbound POSTs      │ signs out → product /api/inbound-lead (HMAC pair, same secret)
   │                       │
   ├──[6 subdomain] /api/ops/health → token-gated by OPS_DASHBOARD_TOKEN, audited by hub
   └──[6 subdomain] /api/inbound-lead → verifies x-bizlegal-signature against BIZLEGAL_INBOUND_SECRET
```

Self-test: `/api/ops/health` HMAC self-loop card on `/ops/health?t=$OPS_DASHBOARD_TOKEN`. Green = chain OK. 401 = mismatch (reread Phase A1 + A3 of MOSES_OPS_HANDOFF.md).

---

## Section 4 — Vercel projects + domain aliases

| Project | Vercel project ID source | Domain alias to set |
|---|---|---|
| bizlegal-ai | `.vercel/project.json` in repo root | `bizlegal-ai.com` (apex) |
| tracr | `.vercel/project.json` in `trcr/` | `tracr.bizlegal-ai.com` |
| brai | `.vercel/project.json` in `BRAI/frontend-next/` (re-init if missing) | `brai.bizlegal-ai.com` |
| lexaudit | `.vercel/project.json` | `lexaudit.bizlegal-ai.com` |
| docai | `.vercel/project.json` in `docai-monorepo/web/` | `docai.bizlegal-ai.com` |
| leadforge | `.vercel/project.json` in `leadforge-ai/frontend/` | `leadforge.bizlegal-ai.com` |
| forge | `.vercel/project.json` in `BIZLEGAL PROJECTS/forge/apps/web/` | `forge.bizlegal-ai.com` |
| blog (bizlegal-seo-site) | Cloudflare Pages | `blog.bizlegal-ai.com` |

If a project is recreated: re-link with `vercel link`, then add the domain alias via UI. The `.vercel/project.json` file gets auto-written.

---

## Section 5 — Cron entries

Master inventory across the fleet.

### Hub Vercel (`vercel.json`):
- `/api/cron/billing/charge-due` — `0 7 * * *`
- `/api/cron/boi/check` — `0 14 * * *`
- `/api/cron/ops-alerts` — `*/15 * * * *`
- `/api/cron/smoke` — `0 9 * * *`
- `/api/cron/ai-act-monitor` — `0 11 * * *`
- `/api/cron/policy-refresh` — `0 12 * * *`

### LexAudit Vercel:
- `/api/cron/monitor/diff` — `0 6 * * *` (compliance framework monitor)

### Cloudflare Worker (`wrangler.toml [triggers]`):
- `0 6 * * *` — daily digest aggregator
- `0 9 * * *` — daily smoke test (snapshot pipeline)

### Hetzner systemd timers:
- `curator-scout.timer` — Mon/Wed/Fri 06:00 UTC
- (curator-bot, curator-publisher are long-running, not cron'd)

### OCI systemd timers:
- `payout-report.timer` — daily 03:00 UTC
- `payout-reconciler.timer` — Fri 10:00 UTC

### n8n (Hetzner, optional):
- `legal-gap-scout.json` — workflow that triggers scout.py if the systemd timer is offline

If a cron is silent for >24h: check `/api/ops/health` for `cron.completed` events tagged with that ref_id. Most cron failures show up as `error` events on `/ops`.

---

## Section 6 — Webhooks + deploy hooks

| Hook | Set on | Triggered by |
|---|---|---|
| `VERCEL_DEPLOY_HOOK_HUB` | Hetzner curator `.env` | publisher.py after blog commit (target=hub|both) |
| `VERCEL_DEPLOY_HOOK_FORGE` | Hetzner curator `.env` | publisher.py after Forge-affinity dual-deploy |
| `CF_PAGES_DEPLOY_HOOK` | GitHub secrets `aileadx10-boop/bizlegal-ea` | Conditional in `seo-cron.yml` workflow |
| NOWPayments IPN URL | NOWPayments dashboard per product | webhook endpoint per surface (e.g., `/api/payments/nowpayments/webhook` on hub, `/api/tracr/webhook` on hub for TRACR products) |
| PayPal webhook URL | PayPal dashboard per app | `/api/payments/paypal/webhook` etc. |

To rotate: regenerate the hook URL from the source (Vercel/CF/NOW/PayPal), paste into the consumer location, restart the consumer.

---

## Section 7 — Recovery procedures

### "Hub Vercel project deleted"
1. `cd C:/Users/Moshe Dor/bizlegal-ai && vercel link` → pick "Create new project"
2. Add domain alias `bizlegal-ai.com` (apex).
3. Set every env var from Section 2.1 (use 1Password / your local `.env` / regenerate from source per Section 1).
4. `vercel deploy --prod`.
5. Verify via Section 8 below.

### "Cloudflare Worker deleted"
1. `cd "C:/Users/Moshe Dor/Downloads/SKOOL-NATE/executive assistant/projects/bizlegal-lead-intake"`
2. `wrangler login` → `wrangler deploy --env production`
3. Re-create KV namespace: `wrangler kv namespace create DIGEST_KV` → paste new id into `wrangler.toml`.
4. `wrangler secret put` for each secret in Section 2.8.
5. Verify cron triggers fire (`wrangler tail bizlegal-lead-intake`).

### "Hetzner VM wiped"
1. New Hetzner instance + provision Docker / Python 3.12 / systemd.
2. `git clone https://github.com/aileadx10-boop/bizlegal-ea` → `cd projects/hetzner-curator`.
3. `python -m venv /opt/bizlegal/venv && /opt/bizlegal/venv/bin/pip install -r requirements.txt`.
4. Copy `/opt/bizlegal/curator/.env` from your local backup OR rebuild from Section 2.9.
5. `sudo cp systemd/*.service systemd/*.timer /etc/systemd/system/ && sudo systemctl daemon-reload`.
6. `sudo systemctl enable --now curator-scout.timer curator-bot.service curator-publisher.service`.
7. Re-establish Cloudflare Tunnel `curator-gpu` to laptop Ollama.
8. Verify heartbeat events arrive on `/ops` within 10 min.

### Caddy Cloudflare DNS challenge (Let's Encrypt)

The OCI router uses Caddy with Cloudflare DNS challenge for `router.bizlegal-ai.com` TLS. Caddy needs Cloudflare API credentials in its environment:

```bash
# SSH into OCI VM, then:
sudo nano /etc/caddy/Caddyfile
# Ensure the global section has:
# {
#     acme_dns cloudflare {env.CLOUDFLARE_API_TOKEN}
# }

# Add CLOUDFLARE env vars to caddy service.
# DO NOT inline the token here — read it from the canonical vault
# (CLOUDFLARE_AUTH_EMAIL + CLOUDFLARE_API_TOKEN entries) and paste
# into the systemd override:
sudo systemctl edit caddy
# Add:
# [Service]
# Environment=CLOUDFLARE_AUTH_EMAIL=<from vault: CLOUDFLARE_AUTH_EMAIL>
# Environment=CLOUDFLARE_API_TOKEN=<from vault: CLOUDFLARE_API_TOKEN>
#
# Vault path: C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt
# If the token has been rotated, the vault is the source of truth.

sudo systemctl daemon-reload
sudo systemctl reload caddy
# Verify:
curl -s https://router.bizlegal-ai.com/health
# Expect: 200 OK (not 401/502)
```

### "OCI VM wiped"
1. New OCI instance + Docker compose.
2. `git clone https://github.com/aileadx10-boop/bizlegal-ea` → `cd projects/oci-deal-router`.
3. Copy `/opt/oci-deal-router/.env` from local backup OR rebuild from Section 2.10.
4. `docker compose up -d` (deal-router + redis containers).
5. `sudo cp systemd/*.service systemd/*.timer /etc/systemd/system/ && sudo systemctl daemon-reload`.
6. `sudo systemctl enable --now payout-report.timer payout-reconciler.timer`.
7. Re-add Caddyfile route + LE certificate for `router.bizlegal-ai.com`.
8. Verify `referral.received` flows on next test `/lead` POST.

### "Supabase project wiped"
1. Apply ALL migrations in chronological order from each repo's `supabase/migrations/`:
   - `bizlegal-ai/supabase/migrations/*.sql` (~13 migrations)
   - `lexaudit/supabase/migrations/*.sql` (~3)
   - `executive assistant/projects/hetzner-curator/supabase/*.sql` (~3)
   - `executive assistant/projects/oci-deal-router/supabase/*.sql` (varies)
2. Apply via Supabase dashboard SQL Editor (idempotent migrations safe to re-run).
3. Restore RLS policies (every migration creates them, so step 1 covers this).
4. **Data restore:** if you have a `pg_dump` backup, restore via dashboard or `psql`. If not, the operational tables (`ops_events`, `boi_subscriptions`, etc.) repopulate themselves; user data (`payment_orders`, `tracr_wallet_leads`) cannot be recovered without backup.

### "All Vercel envs lost on a project"
- **First:** open the canonical vault `C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt`. Filter to just the env names that project needs (per Section 2 above). Paste each line into Vercel UI.
- If a key is missing from the vault: rebuild from Sections 1+2. The HMAC secret + CRON_SECRET + OPS_DASHBOARD_TOKEN are the only things you can't recover from a 3rd-party console — they live ONLY in the vault. If the vault is also lost, regenerate fresh and propagate to all consumers per Section 3 (HMAC chain map).

---

## Section 8 — Verification

After any recovery, run this matrix:

```bash
# 1. Hub HMAC chain green
curl -s "https://bizlegal-ai.com/api/ops/health?t=$OPS_DASHBOARD_TOKEN" | jq '.summary'
# Expect: chain_healthy: true, subdomains_reachable: 8

# 2. Each subdomain self-audit
for s in tracr brai lexaudit docai leadforge forge; do
  curl -s "https://${s}.bizlegal-ai.com/api/ops/health?t=$OPS_DASHBOARD_TOKEN" | jq -r '"\(.source): \(.summary.healthy) (\(.summary.critical_missing | length) critical missing)"'
done
# Expect 6 lines: "<source>: true (0 critical missing)"

# 3. OCI router live
curl -s https://router.bizlegal-ai.com/health
# Expect: {ok: true, redis: up, supabase: up}

# 4. Curator services live
curl -s "https://bizlegal-ai.com/api/ops/feed?token=$OPS_DASHBOARD_TOKEN" \
  | jq '.events | map(select(.event_type == "heartbeat" and .ref_id | startswith("curator/"))) | length'
# Expect: > 0 within 10 min

# 5. Worker live
curl -s https://bizlegal-lead-intake.bizlegal-ai.workers.dev/health
# Expect: {ok: true, service: bizlegal-lead-intake, ...}
```

---

## Section 9 — Backup cadence

Recommended (Moses):
- **Weekly:** `pg_dump` of hub Supabase (set as Supabase scheduled backup → S3 bucket).
- **Weekly:** encrypt the canonical vault and copy offsite:
  ```bash
  gpg --symmetric --cipher-algo AES256 "C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt"
  # → produces env-hub-bizlegal-ai.txt.gpg → upload to encrypted offsite (1Password / iCloud Drive / encrypted S3)
  # Do NOT delete the unencrypted local copy; you need it for daily ops.
  ```
- **Weekly (verification, not replacement):** export Vercel envs per project to a tmp file, diff the names against the canonical vault to catch drift:
  ```bash
  # Per-project (keep names only, never compare values to chat):
  vercel env pull --environment=production .env.tmp.bizlegal-ai
  comm -23 \
    <(grep -oE '^[A-Z_]+' .env.tmp.bizlegal-ai | sort -u) \
    <(awk -F= '/^[A-Z_]+=/{print $1}' "C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt" | sort -u)
  # Output = vars in Vercel that are missing from the canonical vault.
  # Either copy them forward into the vault, or delete from Vercel if no longer used.
  rm .env.tmp.bizlegal-ai
  ```
- **Monthly:** `git clone --mirror` of all 7 source repos → encrypted offsite backup. (Phase U monorepo consolidation makes this 1 mirror instead of 7.)
- **On rotation:** when you rotate `BIZLEGAL_INBOUND_SECRET` or any API key, update the value in the canonical vault FIRST, then paste to Vercel/Hetzner/OCI/Worker. Note the rotation date + first/last 4 chars in 1Password so you can verify the active version on any project.

---

## Section 10 — What this doc does NOT cover

- Actual values of any secret (read from `C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt` per Section 0).
- Per-product NOWPayments product IDs / PayPal Plan IDs (sensitive — see PAYMENT_URLS_VAULT.md for the public URL constants only).
- DNS records (managed via Namecheap / Cloudflare DNS — separate Namecheap export).
- GitHub branch protection rules, CODEOWNERS, required reviewers (set in repo settings).
- Anthropic / OpenAI / Gemini billing alerts (configure in their respective consoles).

If this doc is missing a parameter you need, add it here as a follow-up commit. Keeping it current is the deal.
