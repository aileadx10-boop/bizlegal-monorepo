# Night Audit — Hetzner box `compliance-arbitrage` (read-only inventory)

Audit date: 2026-09-07/08 (UTC). Host `204.168.209.235`. All evidence collected live via SSH, 2026-09-07 22:1x–22:3x UTC.

## 1. System

| Item | Value |
|---|---|
| OS | Ubuntu 24.04.4 LTS (Noble), kernel 6.8.0-107-generic x86_64 |
| Uptime | 144 days (20 wks 4 d) — no reboot since ~Apr 16 |
| Load avg | 3.43 → 1.66 → 0.85 (spike; falling) |
| RAM | 7.6 GiB total, 2.9 used, 4.7 available (buff/cache 4.3) |
| Swap | 6.0 GiB total — **used swings 0.4 GiB → 3.0 GiB within 30 min** (memory pressure) |
| Disk | 75 G, 34 G used (47%) on `/` |
| Other | netdata running (port 19999), unattended-upgrades active |

Top processes: **openclaw-gateway** (bizlegal, 1.5 GB RSS, 16.9% CPU, since Aug 30), dockerd, containerd, `curl`-confirmed n8n/marimo containers, `bot.py` (root), `uvicorn publisher:app :8082` (root), ollama serve, redis, marimo + n8n node processes, netdata.

## 2. `/opt/bizlegal` layout

```
/opt/bizlegal/
├── .env                    (0 bytes, EMPTY)
├── docker-compose.yml      (n8n + marimo; N8N_BASIC_AUTH + ENCRYPTION_KEY set; WEBHOOK_URL=http://204.168.209.235:5678/)
├── start.sh
├── bizlegal-ea/            (EA workspace: 19 dirs incl. MySocialsAssistant, digests, lead_profiles, outputs — 59 M)
├── cache, gaps, prompts, queue, reports, skills (top-level stub dirs)
├── curator/                (see below)
├── decisions/              (cron outputs: DAILY-REPORT, EA-DAILY-REPORT, recovery-drafts, sales/leads json, DISCOVERY, distribution…)
├── logs/                   (pipeline.log [Node crash], keepalive.log, ops_alerts.log [1.05 M, 403 spam])
├── marimo/                 (EMPTY — no notebooks)
├── n8n/                    (bind-mount data: database.sqlite + WAL + n8nEventLog.log)
├── scripts/                (only fix-hetzner-inbound-secret.sh — run-pipeline.js / keepalive.js MISSING)
├── venv/                   (python3.12 venv; has fastapi, httpx, dotenv, courlan, htmldate, markdown-it…)
├── worker/                 (Cloudflare Worker project `bizlegal-lead-intake`, src/inbound-lead.ts etc., 255 M w/ node_modules; no routes in wrangler.toml)
```

`/opt/bizlegal/curator/` — expected curator stack **all present**: `scout.py brain.py publisher.py bot.py auto_pick.py firecrawl_enrich.py dunning.py distributor.py factual_review.py humanize.py quality_gate.py ops_log.py` + `_env.py apply_pending_migrations.py test_factual_review.py`, `brain_run*.log` (last = run7, Jun 17), `services/` (~60 scripts incl. agents/, seo-agents/, outreach/, hunt/, spy/), `drafts/` (60 entries, 29 M), `content/`, `social/`, `systemd/`. **Missing vs mirror: `coguard_binder.py`, `requirements.txt`.** Not a git repo.

## 3. systemd

Running: `curator-bot`, `curator-publisher`, `ollama`, `docker`, `nginx`, `redis-server`, `netdata`, `cron`, `atd`, ssh etc. (28 running units).

| Unit | State | Notes |
|---|---|---|
| curator-bot.service | **active running** (since Sep 02, 74 M, CPU 3m42s) | Telegram long-poll; last entry Sep 07 16:14 httpx.ReadError (transient) |
| curator-publisher.service | **active running** (since Sep 02, uvicorn 127.0.0.1:8082) | `/health` probed locally every 30 min → 200 |
| curator-scout.service | oneshot, **inactive dead** — timer fires daily 06:00 | **fails output: 0/12 relevance → exit** (see §6) |
| curator-auto-pick.service | oneshot, **inactive dead** — timer fires daily 10:00 | picks 0 rows (no candidates exist) |
| curator-scout.timer / curator-auto-pick.timer | **active waiting**, daily 06:00 / 10:00 UTC, Persistent=true | |
| ollama.service | active (since Jul 29) | |
| certbot.service | **FAILED** | `AttributeError: module 'lib' has no attribute 'GEN_EMAIL'` (pyOpenSSL 23.2.0 vs certbot 2.9.0 incompat); nginx has no TLS |
| pm2-bizlegal.service | **FAILED** | `ExecStart=pm2 resurrect`, no `/home/bizlegal/.pm2/dump.pm2` exists |
| openclaw-gateway.service | running as **bizlegal user unit** (`/home/bizlegal/.config/systemd/user/`, v2026.4.2) | process verified (PID 1391565); user-bus status unreachable via su → see UNKNOWN |
| certbot.timer | active | keeps failing every 12 h |

## 4. Docker

| Item | State |
|---|---|
| n8n (`n8nio/n8n:latest`) | Up 4 months, restart=always, `0.0.0.0:5678` → basic auth |
| marimo (`ghcr.io/marimo-team/marimo:latest`) | Up 4 months, `0.0.0.0:8080`, password auth; logs show repeated "Invalid password" + server-token warnings |
| Volumes | none — all bind-mounts |
| compose project `bizlegal` | running(1) |

## 5. Crontab (root = 56 ACTIVE + 13 HALTED; bizlegal = 3)

Root categories (56 active lines):

| Category | Entries | Schedule | Script |
|---|---|---|---|
| SEO crawlers | 8 | 10–17:00 mostly, 08/09:00 | crawlers/{competitors,ai_checks,index_status,sales,leads,customer_q,backlinks,site_health}.py |
| SEO ops | 10 | hourly/30-min | seo_watchdog, gsc_indexnow_pinger, geo_citation, internal_linker, og_image_generator, enrich_page, infographic_generator, discovery_scraper, content_distribution, analytics_dashboard |
| Content gen/publish | 7 | 02–06:00 + 14:30 | seo_content_writer(–pillar), publish_blog, content_enricher_v2, aeo_loop_v2, newsletter(20:00), cleanup, ea_agent(19:30) |
| Orchestrator agents | 9 | 00:15, 02, 06, 08(Tue), 09, 13, 14, 18 + monetization `*/15` | orchestrator.py {content,socials×3,newsletter,enrichment×2,code,monetization} |
| Revenue/ops alerting | 5 | `*/1`, `*/5`, 22:30, 23:00, 07:00/08:00/09:00 | revenue_alerter, ops_alerts, conversion_tracker, aeo_revenue_agent, conversion_funnel_agent, enterprise_closer_agent, daily_digest, env_audit, weekly_health |
| Self-heal | 4 | `*/5`, `*/30`, `*/30`, 04:00 | self_heal, code_fixer, recovery_active, index_watchdog |
| Outreach | 4 | 01, 06, 07, 10:00 | signal_scout, salesperson_agent, marketing_copy, marketing_outreach |
| HALTED (commented Jul 10) | 13 | — | marketing_outreach (dup), headhunter, cold_email*, lead_nurture×3, queue/reddit/oci outreach, daily_autonomous_seo |
| Other cron | — | — | certbot `/etc/cron.d` (breaks), sysstat, e2scrub |

**Conflict noted:** `signal_scout` and `marketing_outreach` were HALTED by comment, but the `cron_installer.py` "bizlegal-managed" block re-added BOTH → they run daily (logs confirm).

bizlegal user crontab (all 3 BROKEN):
1. `0 3 * * * node scripts/run-pipeline.js` → **MODULE_NOT_FOUND** (script file absent)
2. `0 2 * * 0 node scripts/keepalive.js` → **MODULE_NOT_FOUND**
3. `@reboot pm2 resurrect` → no dump file → no-op

## 6. Services actually running vs dead

| Service | Evidence | Verdict |
|---|---|---|
| scout | Sep 07 06:22 "fetched 12 items across 5 feeds"; every item "filter pass dropped … Client error '404 Not Found' for url 'https://curator.bizlegal-ai.com/api/chat'"; then **"0/12 items passed filter" → "no items passed filter; exiting"** | RUNS, OUTPUT DEAD (relevance filter blocked) |
| auto_pick | daily 10:00 "picked 0 row(s)"; also "python-dotenv could not parse … line 67/68" (bank-account dict lines) | RUNS, OUTPUT DEAD (no candidates) |
| bot | active 5 days; Telegram 200s; one httpx.ReadError Sep 07 | RUNNING |
| publisher (:8082) | `/health` 200 every 30 min; only routes: `POST /deploy`, `POST /regen`, `POST /reject`, `GET /health` — **NO `/api/chat`** | RUNNING but cannot serve scout's filter call |
| n8n "My workflow" | DB: **283 `production_error`** runs vs 5 `production_success` (Apr 21); daily 07:00 trigger fails on node *"Ollama Scout (mistral-nemo)"*: "connection cannot be established … incorrect host", then *Telegram — Error Alert*: "Authorization failed - please check your credentials" | EFFECTIVELY DEAD |
| cron content | content.log head `ModuleNotFoundError: No module named 'services'`; latest run (Sep 07 06:04) "1/1 agents ok, 241s" produced video JSON | PARTIAL (improved) |
| monetization | every 15 min "1/1 agents ok, 1013ms", 0 signals; log = 199,360 lines / 5.4 M | RUNNING (log bloat) |
| socials | drafts written (drafts/socials … Sep 07) but posts fail: **"no BLOTATO_API_KEY"** (12 errors) | DRAFTS OK, POSTING DEAD |
| ops_alerts | every 5 min: "get_live failed: HTTP Error 403: Forbidden" (HUB_URL `/api/ops/live` 403) — 1.05 M log | RUNNING, ERRORING |
| signal_scout | daily, "drafted []" | RUNNING, 0 output |
| marketing_outreach | daily, "drafted 0, from_leads 10" | RUNNING, 0 output |
| brain.py | last brain_run7.log Jun 17 (successful: processed 2 rows); not cron/systemd-scheduled | IDLE (manual) |
| self-heal / code-fixer / recovery_active | logs written continuously; self-heal reports "socials: 400 Bad Request", "code: timed out after 60s" | RUNNING, noisy |

## 7. Ollama

| Location | Models |
|---|---|
| **Box** (127.0.0.1:11434, all interfaces) | `mistral-nemo:latest` (7.07 GB), `llama3.2:3b` (2.02 GB). **NO gemma.** Nothing loaded in memory (`/api/ps` empty). `/v1/chat/completions` → 200 OK (llama3.2 worked); native `POST /api/chat` returned empty in test. |
| **Windows local (via MCP)** | gemma4:latest (8B), gemma4:12b, gemma4:e2b, glm-5.2:cloud, kimi-k2.7-code:cloud, kimi-k3:cloud, deepseek-coder:33b, qwen2.5:7b, llama3.2:3b, hermes3:latest, deepseek-v4-flash:cloud, glm4 |

`.env` has `OLLAMA_FILTER_MODEL=mistral-nemo`, `OLLAMA_RANK_MODEL=mistral-nemo`, `OLLAMA_TUNNEL_URL=https://curator.bizlegal-ai.com` (token present, masked).

## 8. cloudflared

**NOT installed** — no binary, no `/etc/cloudflared/`, no service, no container. Tunnel for `curator.bizlegal-ai.com` is hosted elsewhere (UNKNOWN where). DNS resolves to Cloudflare anycast (IPv6 shown). Box-side `curl https://curator.bizlegal-ai.com/api/chat` → **302** (CF Access login); with the Access service tokens scout reaches a backend that returns **404** (no box service answers `/api/chat`).

## 9. n8n + marimo

- n8n DB (`/opt/bizlegal/n8n/database.sqlite`): 2 workflows — **"My workflow"** (active=1, 283 prod errors) and **"Temp Env Reader"** (inactive). `webhook_entity` count = **0**. No active webhooks anywhere. `n8nEventLog.log` 1.4 M, growing each 07:00 failure.
- marimo: `/opt/bizlegal/marimo` **empty** (zero notebooks); auth enabled; logs show failed-login attempts and missing server-token warnings.

## 10. `.env` — `/opt/bizlegal/curator/.env` (70 lines)

VAR NAMES ONLY (values not printed): `ANTHROPIC_API_KEY ANTHROPIC_API_KEY_ENRICH ANTHROPIC_MODEL APIFY_ACTOR_CIPA APIFY_ACTOR_GPC APIFY_ACTOR_SURPLUS APIFY_API_TOKEN BIZLEGALBOT_TOKEN BIZLEGALFORGEBOT BIZLEGALHUBBOT BIZLEGAL_BANK_ACCOUNT_1 BIZLEGAL_BANK_ACCOUNT_2 BIZLEGAL_INBOUND_SECRET CF_ACCESS_CLIENT_ID CF_ACCESS_CLIENT_SECRET CF_TOKEN CLOUDFLARE_API_TOKEN CLOUDFLARE_AUTH_EMAIL DISCLAIMER_VERSION FIRECRAWL_API_KEY GITHUB_DEFAULT_BRANCH GITHUB_REPO_NAME GITHUB_REPO_OWNER GITHUB_TOKEN GOOGLE_API_KEY HETZNER_SERVER_IP INDEXNOW_KEY MUAPI_KEY NEW_OPENAI_KEY NOWPAYMENTS_API_KEY NOWPAYMENTS_IPN_SECRET OCI_INSTANCE_IP OCI_ROUTER_URL OLLAMA_FILTER_MODEL OLLAMA_RANK_MODEL OLLAMA_TUNNEL_TOKEN OLLAMA_TUNNEL_URL OPENAI_API_KEY OPENAI_IMAGE_MODEL OPS_DASHBOARD_TOKEN PAYPAL_CLIENT_ID PAYPAL_CLIENT_SECRET PAYPAL_ENV PUBLISHER_HTTP_PORT REDIS_URL RESEND_API_KEY RESEND_AUDIENCE_ID RESEND_FROM RESEND_FROM_EMAIL SERPAPI_API_KEY STRIPE_SECRET_KEY SUPABASE_SECRET SUPABASE_SERVICE_KEY SUPABASE_URL SUPABASE_USERNAME TELEGRAM_BOT_TOKEN TELEGRAM_CHAT_ID TELEGRAM_CURATOR_BOT_TOKEN UPSTASH_REDIS_REST_TOKEN UPSTASH_REDIS_REST_URL VERCEL_DEPLOY_HOOK_FORGE VERCEL_DEPLOY_HOOK_HUB`

**Absent but required** (error evidence): `BLOTATO_API_KEY` (social posts), `HUB_URL` (ops_alerts). `REDIS_URL=redis://localhost:6379` has **no password** while the box Redis `requirepass` is set → auth mismatch. Lines 67–68 (bank-account dicts) fail python-dotenv parsing — harmless warning, values are placeholder/TBD. `/opt/bizlegal/.env` is 0 bytes.

## 11. Redis / DBs / ports

| Port | Proc |
|---|---|
| 5678, 8080 | n8n, marimo (docker, all ifaces) |
| 80 | nginx → `127.0.0.1:18789` (openclaw-gateway); `/netdata/`, `/redis-health` |
| 8082 | uvicorn publisher (127.0.0.1 only) |
| 18789, 18791 | openclaw-gateway (127.0.0.1) |
| 11434 | ollama (**\*:11434 — public**, no visible auth at TCP level) |
| 6379 | redis-server (127.0.0.1, requirepass; **no active connections**) |
| 19999 | netdata (`0.0.0.0`) |
| 4317 | netdata otel-plugin (127.0.0.1) |

No MySQL/Postgres. Redis is the only DB; contents UNKNOWN (auth). `UPSTASH_REDIS_*` set in .env.

## 12. Network paths (box-perspective)

- `https://curator.bizlegal-ai.com/api/chat` → **302** (CF Access) unauth; **404** with tokens.
- `https://blog.bizlegal-ai.com`, `bizlegal-ai.com`, `cited.bizlegal-ai.com` → 200 (those are Vercel/CF-hosted, not this box).
- Local: publisher `/health` 200; n8n :5678 200 (auth); ollama :11434 200 (GET).
- `POST` to :8082/api/chat, :18789/api/chat, :11434/api/chat → all fail/404/empty → **nothing on the box serves scout's relevance endpoint.**

## 13. pm2 / supervisors

- pm2 v6.0.14 daemons for root AND bizlegal running; **both list 0 apps**; no dump.pm2 files → resurrect is a no-op. `pm2-bizlegal.service` FAILED (no dump). openclaw-gateway is a systemd user service, not pm2. No supervisorctl.

## 14. Drift: remote `/opt/bizlegal/curator` vs mirror `services/hetzner`

| File | Remote MD5 | Local MD5 | Drift |
|---|---|---|---|
| scout.py | 4d135ef7 | 4d135ef7 | identical |
| brain.py | 3dff639c | 3dff639c | identical |
| bot.py | bf927874 | bf927874 | identical |
| auto_pick.py | 2498949d | 2498949d | identical |
| firecrawl_enrich.py | 7412750c | 7412750c | identical |
| dunning.py | a00c36fc | a00c36fc | identical |
| distributor.py | fb6a8732 | fb6a8732 | identical |
| factual_review.py | 31e07fed | 31e07fed | identical |
| humanize.py | 74d6096d | 74d6096d | identical |
| quality_gate.py | b62c0b7f | b62c0b7f | identical |
| **publisher.py** | c42a7b5e (9,132 B, **Apr 26**) | 6ae64117 (18,216 B, Jun 11) | **box runs OLD publisher** (no /api/chat in either, so not the filter fix; still stale) |
| **ops_log.py** | 687f61b5 (3,249 B, Jul 7) | 581441b4 (3,244 B, Aug 23) | minor drift |
| coguard_binder.py | **absent** | present | **not deployed on box** |
| requirements.txt | **absent** | present | **not on box** |
| curator-scout.service | a0453863 | 3914a66f | remote is newer (TimeoutStartSec 5400, PYTHONUNBUFFERED) — box ahead of mirror |
| auto-pick/bot/publisher services | cb19b901/e7791e10/3774acb5 | same | identical |
| scout.timer | (schedule verified equal) | — | matches mirror |

Everything core that matters (scout/brain/bot/auto_pick pipeline) is byte-identical to the mirror; no git repo on the box.

---

## RUNNING vs DEAD summary

**RUNNING (healthy):** curator-bot, curator-publisher(/health), ollama (2 models), docker (n8n, marimo containers up 4 mo), redis, nginx, openclaw-gateway (1.5 GB), sshd, cron (56 root jobs firing), netdata, marimo/n8n node processes, self-heal machinery.

**TIMER-FIRED ONESHOTS (fire daily, produce zero):** curator-scout (0/12 → exit), curator-auto-pick (0 rows).

**EFFECTIVELY DEAD / FAILED:** certbot (pyOpenSSL break), pm2-bizlegal (no dump), n8n "My workflow" (283/288 runs error; Ollama host + Telegram creds broken; 0 webhooks), bizlegal `run-pipeline` + `keepalive` cron (MODULE_NOT_FOUND), social POSTING (no BLOTATO_API_KEY), brain.py (idle since Jun 17), marimo (no notebooks).

**ERRORING but alive:** ops_alerts (403 spam), monetization (OK but 5.4 MB/day log), self-heal/seo-agents logs at 8–10 MB.

**Pipeline root-cause chain:** scout fetches 12 real items daily → relevance filter POSTs `https://curator.bizlegal-ai.com/api/chat` → **404** (no box service serves it; tunnel is off-box) → 0/12 → auto_pick has nothing → no drafts → brain never runs automatically.

## Manual ops needed
1. Stand up a working `/api/chat` endpoint behind `curator.bizlegal-ai.com` (tunnel → local ollama, or an ollama proxy on publisher:8082) OR point `OLLAMA_TUNNEL_URL` at a reachable Ollama — this unblocks the entire content pipeline.
2. Fix certbot (upgrade python3-openssl or remove certbot; nginx has no TLS anyway).
3. Fix or disable bizlegal `run-pipeline`/`keepalive` crons (scripts/ files missing).
4. Fix n8n "My workflow": valid Ollama host + Telegram error-alert credentials, or deactivate it (283 error runs).
5. Add `BLOTATO_API_KEY` to enable social posting.
6. Reconcile `REDIS_URL` (no pw) with Redis `requirepass`, or remove requirepass.
7. Fix `ops_alerts` HUB_URL 403 (or mute).
8. Memory: openclaw-gateway 1.5 GB + swap swings 0.4→3.0 GB; consider MemoryMax on openclaw and logrotate for monetization/self-heal/seo-agents logs.
9. Deploy drift: publisher.py (old), coguard_binder.py + requirements.txt absent on box.

## UNKNOWN (not verifiable from this box)
- Which host terminates the `curator.bizlegal-ai.com` Cloudflare tunnel (cloudflared absent here).
- Redis contents/password (auth-locked, no active connections).
- .env secret VALUES (never read).
- openclaw-gateway user-bus exact state (process verified running; `systemctl --user` unreachable via `su` — would need bizlegal session).
- Source of `HUB_URL` for ops_alerts (not in .env; 403 persists).
- Whether `bizlegal-lead-intake` worker is deployed anywhere live.
