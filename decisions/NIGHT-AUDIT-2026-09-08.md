# Night Audit — End-to-End Fleet State — 2026-09-08

**Scope:** every app, service, agent, cron, API key, email path, payment rail, domain, and revenue path in BizLegal AI + FirmCited. Read-only audit (4 parallel agents + live probes). All facts verified against live systems, not the (stale) operating book.

**Headline: 11 surfaces serve HTTP 200, but $0 in real revenue has ever been captured. Production is 31 commits behind work that shipped 2026-09-01→07. Two of three "money loop" engines are built-and-dark, not deployed.**

---

## 1. What is BUILT vs what is FUNCTIONING

### Live surfaces (functioning, HTTP 200)
| Surface | Role | Payments wired? |
|---|---|---|
| bizlegal-ai.com (hub) | brain; /sales, /ops, checkout, /api/pay/start | NOWPayments + PayPal (live) |
| docai.bizlegal-ai.com | canonical contract-risk funnel ($97 scan) | NOWPayments + PayPal (live) |
| forge.bizlegal-ai.com | BOI Kit $149 / Passport $297 / scan | NOWPayments + PayPal |
| brai.bizlegal-ai.com | regulatory risk reports | **STOP-SOLD** (no longer purchasable) |
| lexaudit.bizlegal-ai.com | compliance health $99/mo monitor | needs PayPal plan (monitor) |
| tracr.bizlegal-ai.com | forensic wallet reports $149-299 | NOWPayments |
| leadforge.bizlegal-ai.com | lead-gen surface | — |
| bench.bizlegal-ai.com | evaluation lab: $2,500 audits / $5K-mo | checkout live (PayPal) |
| cited.bizlegal-ai.com (FirmCited) | AEO agency: $490 audit (temp $20), Monitor $299/mo, retainer $2K/mo, /grok-bot | PayPal LIVE + NOWPayments + wire |
| blog.bizlegal-ai.com | content engine | — (**stale since 2026-07-27**) |
| router.bizlegal-ai.com | OCI deal router | health OK, `redis:up, supabase:up` |

### Built but NOT deployed (needs Vercel project + DNS + deploy)
| App | What | Build state |
|---|---|---|
| falseecho | financial false claims monitor (MVP, cron) | builds; migration applied |
| sellerradar | seller risk monitor (MVP, cron) | builds; migration applied |
| deal44 | Hebrew RTL property deal rooms ₪2,500/₪349 | gates open, E2E verified; **deals table empty, /api/pay/start 503s non-USD** |
| coguard | co-parenting communication $14.99-29.99/mo | 15 API routes + 7 pages + 5 migrations (more than a scaffold) |
| leaseparse | lease abstracting $59 | built, checkout dark, migrations unapplied |
| closeflow | closing checklists $39 | SCAFFOLD ONLY (07-28) |
| propsignal | property risk $49 | SCAFFOLD ONLY (07-28) |
| caseaudit | — | fixtures only, no source (dead) |

### Tombstoned / dead
`dealdesk` (source gutted, stale .next), `funnel-mvp` (both copies), `brai` stop-sell.

## 2. Services
- **Hetzner curator (scout/bot/publisher): RUNNING but content-DEAD.** Scout relevance filter calls `curator.bizlegal-ai.com/api/chat` → **404 (Cloudflare Access blocks the tunnel)**, and the model the filter wants (gemma) exists nowhere reliable → last scout `0/12 passed; exiting`. Blog stale → **content flywheel down**. n8n + marimo docker up 4 months. cloudflared `curator-gpu` tunnel active.
- **OCI deal router: RUNNING** (health 200). B1-B8 done; B9 (Domain B) blocked on DNS.
- **CF Workers: DEPLOYED** — intake (health OK at `*.workers.dev`, **no custom domain yet** — wrangler route commented), telegram-hub, gsc-bot, coguard-email-worker.
- **marketing trigger.dev: RUNNING** (M.1/M.6/M.7).
- **seo-agents hetzner crontab: RUNNING**.
- Outbound dispatch cron: RUNNING but **fail-closed** — sends nothing while `OUTBOUND_AUTOSEND` unset.

## 3. Vercel / domains / deploy state
- **8 monorepo projects + firmcited deployed, READY, all custom domains verified.** Last batch deploy sha `3aa2a336` (2026-08-23 06:41). GitHub shows **zero Production deployment records** (CLI/deploy-hook deploys); recent preview `9a635f7` (Sep 7) **FAILED build**.
- **31 commits unmerged** on `feat/deal44-phase0` (63 uncommitted files on it), `feat/revenue-marathon`, et al. → O-018/020/021 features return 404 on prod.
- Dead Vercel projects (orphaned `*.vercel.app`, no custom domain): `hub`, `web`, `leadforge` (ERROR deploys May 2026), `vercel-trcr` (never deployed). Clutter only.
- Docai/forge `.vercel/project.json` point at a stale shared `web` projectId — local-link bug, not a deploy bug.

## 4. APIs / keys / email / payments (env vault presence; 42% of 309 vars not-wired)
- **Fully wired:** Vercel, Supabase core, NOWPayments (⚠️ IPN secret is a duplicate literal of `BLOCKCHAIN_SECRET`), PayPal near-live (missing webhook secret + 2 CoGuard plan IDs), Resend (`intelligence.bizlegal-ai.com` verified), SendGrid, Anthropic, OpenAI, Ollama.
- **NOT wired / absent:** Stripe (0 vars — deferred until US LLC), LemonSqueezy (0), Paddle (partial), **Instantly (0)**, **ZeroBounce (0)**, Twilio (0), GSC service account, social API tokens (LinkedIn/X/etc.), observability (Sentry).
- **Outbound domain `notes.bizlegal-ai.com` is specified in vault + commit 1400bf9 but is NXDOMAIN** — no DNS. Sending domain must be created before outbound can run.
- **OPS_DASHBOARD_TOKEN vault ↔ Vercel prod MISMATCH** → `/ops` + `/api/ops/health` locked (404). HMAC chain cannot be verified live until resynced.

## 5. Revenue readiness (what gates the first dollar)
| Gate | Status |
|---|---|
| First real-money buy | **NOT MET — $0 lifetime revenue** (payment_orders 264 rows, all self-test `dorlaw2014@`) |
| Z7 verification (24h green) | NOT MET; /ops health locked by token mismatch |
| Test purchase | O-017 P0: $20 FirmCited buy → revert to $490; DocAI $97; then revert |
| NOWPayments key rotation | Still open (most urgent per JULY10) |
| Anthropic credits | At $0 every LLM agent fails silently — **top up now** |
| Outbound engine | Built + dark; needs domain + mailboxes + Instantly + ZeroBounce + Clay (≤$150/mo) + campaign approve + OUTBOUND_AUTOSEND=1 |
| Practice Revenue $99 / AI review $200 / kit $49 | Built, **not deployed** (branch unmerged; next preview build failed) |
| PayPal plan IDs | 17 present; missing webhook secret + 2 CoGuard plans |
| Supabase zero tables telling the story | deals=0, subscriptions=0, email_send_log=0, product_orders=0, boi_orders=0, bench_intake=0, sales_outreach=0, fc_subscriptions=0; healthy: agent_runs=8,220, social_drafts=432, leadforge_leads=340, lead_outreach=63, daily_gaps=43, fc_orders=10 |

## 6. Manual ops needed (Moses) — in priority order
1. **Top up Anthropic credits** (kills all LLM agents when $0).
2. **Resync OPS_DASHBOARD_TOKEN** vault ↔ Vercel `bizlegal-ai` env → redeploy (unlocks /ops + HMAC verification).
3. **Gate 1 test buy:** $20 at cited.bizlegal-ai.com/audit, then `git revert 4ccce6a` + `npx vercel deploy --prod` (restore $490).
4. **Commit + push 31 unmerged commits:** fix failing preview build `9a635f7` first, then merge revenue-marathon + deal44-phase0 (63 uncommitted files on the latter) → O-018/020/021 go live together.
5. **Rotate NOWPayments_API_KEY + IPN_SECRET** (duplicate-secret + highest-risk vault item).
6. **O-018:** approve article, fill byline placeholders, push.
7. **O-020:** verify Clio 2025 figures (38/88/93), fill own-practice numbers, one $99 test buy.
8. **O-021 outbound:** create `notes.bizlegal-ai.com` DNS → 2 mailboxes + SPF/DKIM/DMARC → Instantly account (warm-up) + campaign id → ZeroBounce → vault+Vercel values → approve campaign #1 → set OUTBOUND_AUTOSEND=1. ~2-4 week warm-up is the critical path.
9. **Fix curator content pipeline:** unblock `curator.bizlegal-ai.com/api/chat` behind CF Zero Trust (allow Service Auth) + ensure a working gemma model on Hetzner/local Ollama → blog regen resumes.
10. **Deploy built-but-dark apps:** create Vercel projects (Root Directory = `apps/<x>`) + CNAME for falseecho, sellerradar, deal44, coguard, leaseparse. Deal44 additionally needs an ILS (₪) payment rail — `/api/pay/start` currently 503s non-USD.
11. **Intake worker custom domain:** uncomment wrangler route → `intake.bizlegal-ai.com`.
12. **PayPal webhook secret** + 2 missing CoGuard plan IDs.
13. Optional: delete 4 dead Vercel projects (hub/web/leadforge/vercel-trcr), remove `NEXT_PUBLIC_CALENDLY_URL`.
14. Clean up audit artifacts in the home dir (see cleanup item).

## 7. Budget / API subscriptions to open (to monetize ALL paths)
| Item | Cost | Needed for | Gate |
|---|---|---|---|
| Anthropic API credits | top-up now | every LLM agent + product | IMMEDIATE |
| Instantly + mailboxes | ~$37-97 + ~$14/mo | cold outbound engine (O-021) | after domain |
| ZeroBounce (PAYG) | small | email-list hygiene | after domain |
| Clay credits | small | outbound enrichment | after domain |
| PayPal plan IDs (recurring) | free | lexaudit $99/mo, docai tiers, Monitor/retainer | create |
| Stripe (real keys) | free | card subs after US LLC | deferred |
| LemonSqueezy/Paddle | ~$0 fees-only | EU/global cards (gated on Z7) | after first revenue |
| SendGrid/Resend credits | per-send | transactional + newsletter | present |
| Plausible (optional) | ~$9/mo ×7 | traffic visibility | optional |
| NOWPayments | fees-only | crypto | present |

**Fleet caps** already decided: paid tools ≤ $500/mo (MRR plan); outbound engine ≤ $150/mo; total fleet ≤ $350/mo (O-021).

## 8. What needs to be INSTALLED (deploy/setup surface, not code)
- None of the CLI toolchain (vercel 50.39, wrangler 4.73, supabase 2.109, pnpm, node 22, gh) — all present. No OS/app installs required.
- Vercel projects + DNS records for 5 built apps (as above).
- `notes.bizlegal-ai.com` mail domain + record set + Instantly mailboxes.
- gemma working model for the curator filter (Hetzner or local Ollama).
- Optionally Plausible project(s).

## Recommended "first dollar" sequence (fastest path)
Fix preview build → merge revenue-marathon (O-018/020/021 code) → deploy hub (practice revenue $99, review $200, kit $49 become sellable) → resync ops token → Gate 1 test buy (FirmCited $20) → top up Anthropic → rotate NOWPayments → start Instantly warm-up (long pole) → then the rest.

---
*Audit performed 2026-09-08 by Claude Code night session (4 parallel read-only agents + live probes + Hetzner SSH). Stale operating-book claims are superseded by this file.*

---

# PART 2 — DEEP MECHANISM INVENTORY (every stone, verified live)

> Nine parallel read-only agents (live SSH + HTTP probes + repo reads + wrangler). Each section below is the full inventory for one mechanism domain. All facts verified against live systems on 2026-09-08. Section files: `decisions/_night-audit-deep/01-…09-…md`.


---

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

---

# Night Audit — OCI Deal Router (read-only inventory)

Audit date: 2026-09-08 (UTC). Host `151.145.81.139` (`dev-instance-1`, OCI il-jerusalem-1, VM.Standard.E2.1.Micro). Evidence collected live via SSH + HTTP probes + local repo reads. No secrets reproduced in this file.

**Headline: LIVE and healthy, but a test dummy.** Router reached `router.bizlegal-ai.com`, `/health` returns `redis:up supabase:up`, both containers up 3 months, Caddy active. But every row in its four tables was written 2026-04-26 by the end-to-end test — **no real lead has ever been routed**. B9 (first real lead) still blocked: Domain-B hostnames NXDOMAIN.

## 1. Host + deployment

| Item | Value |
|---|---|
| Deploy path | `/opt/oci-deal-router` (compose project `oci-deal-router`; stale `oci-deal-router_router` image 2026-04-26 also present) |
| Running container | `deal-router` — image `oci-deal-router-router:latest` sha `6d452dddb131`, built **2026-05-09 18:40**, created 2026-05-23, Up 3 months, healthy |
| Base image | `python:3.12-slim`, uvicorn 1 worker, `0.0.0.0:8000`, mem cap 256m, non-root uid 1001 |
| Redis | `redis:7-alpine` container `deal-router-redis`, mem cap 96m, `--maxmemory 80mb --allkeys-lru`, Up 3 months |
| Process supervision | systemd `deal-router.service` (oneshot, `docker compose up -d --remove-orphans`, **enabled**); Caddy active on 80/443 |
| Listening ports | 80/443 (Caddy; iptables accepts 80/443/22); 8000 bound `127.0.0.1` only; redis on compose network only |
| Deployed-vs-repo delta | Deployed image = monorepo state at ~2026-05-05/09. **NOT in container:** coguard mount (commit c51b431 2026-08-20), W4.3 `partners_coverage_check.py` (2026-05-11), payout_report Telegram-noise suppression (2026-06-22), Resend UA fixes (2026-07-07) |

## 2. Route map (`router/main.py` + mounted routers)

All routes behind Caddy DNS-01 TLS. HMAC = `x-bizlegal-signature` raw hex over body, shared `BIZLEGAL_INBOUND_SECRET`.

| Method Path | Verdict | Notes (live-probed) |
|---|---|---|
| `GET /` | ✅ 200 | Caddy default → `"BizLegal-AI Deal Router"` |
| `GET /health` | ✅ 200 | `{"ok":true,"version":"v1.0.0-p1","redis":"up","supabase":"up"}` |
| `POST /lead` | ✅ live | Full pipeline: HMAC→Redis dedupe (24h)→Haiku classify (+Sonnet escalate→Gemini→gpt-4o-mini fallback)→`select_partner`→store→`referral.received`→lead_nurture enqueue (D7, idempotent)→partner email + referral-contract email (D5) + `store_payout_pending`→`referral.routed`. Unmatched → `referral.received` status=failed. `POST` w/o signature → **401** (probed) |
| `GET /partners` | ✅ live | Admin `X-Admin-Secret` |
| `POST /feedback` | ✅ live | outcome won/lost/no_show/pending; on `won` patches payouts commission + fires `referral.closed` |
| `GET /payouts` | ✅ live | Admin; reads `payouts_open` view |
| `POST /coguard/*` (classify/biff/process) | ❌ DEAD | Mounted in monorepo `main.py` only; **not in deployed container**; Caddy has no `/coguard` route (probe → default 200, not proxied); DB tables `coguard_messages`/`coguard_subscribers` **404 (don't exist in prod)**. CoGuard entirely un-deployed |

## 3. Timers / schedulers

| Timer | Schedule | On box? | Last run | Behaviour |
|---|---|---|---|---|
| `payout-report.timer` → `payout-report.service` | daily 03:00 UTC | **enabled** | 2026-09-07 03:03 UTC | Nightly summary via `docker exec deal-router python /app/payout_report.py` → `yesterday_summary` + RPC `anonymize_old_leads` + Telegram. **Sep-07 run posted all-zero Telegram** (`leads_yesterday:0 hot:0 routed:0 open_payouts:1`) → deployed image lacks the Jun-22 `has_activity` suppression → spams Telegram nightly |
| `payout-reconciler.timer` (Fri 10:00 UTC, `payout_reconciler.py` — weekly referral.paid + digest, Redis dedupe 1yr) | — | **NOT installed** (`systemctl list-timers` shows no payout-reconciler; unit absent) | — | Deployed-file-only; not live |
| cron | — | none observed | — | systemd timers only |

## 4. DNS / domains

| Host | Status | Evidence |
|---|---|---|
| `router.bizlegal-ai.com` | ✅ LIVE → `151.145.81.139` | nslookup resolves; `GET /` 200; `/health` 200; Caddy TLS up |
| `deals.bizlegal-ai.com` (Domain B, README curl example) | ❌ **NXDOMAIN** | nslookup "Non-existent domain" — B9 blocker |
| `oci.bizlegal-ai.com` (Domain B, oci_close.py example) | ❌ **NXDOMAIN** | nslookup "Non-existent domain" — B9 blocker |

## 5. Supabase tables (project `ydghhcuuopqzgqcicubg`, router owns 4)

| Table | Rows | Facts |
|---|---|---|
| `partners` | **1** | Placeholder row (`type=placeholder`, tier 5, weekly_cap 100, active, `current_week_count` 1). No real partner |
| `deal_router_leads` | **2** | Both `TEST-WORKER-*`, `source=ea_worker`, UAE_REAL_ESTATE, HOT, ROUTE_PARTNER, `outcome=pending`, `received_at` **2026-04-26**. Only test leads ever written |
| `payouts` | **1** | Pending, `commission_usd=0.0`, earned 2026-04-26 (ties to TEST-WORKER-003 → placeholder partner). `open_payouts` view = 1 |
| `lead_nurture_state` | **0** | Table exists; D7 nurture enqueue never persisted (fires only when a real /lead carries contact_email) |
| `coguard_messages` / `coguard_subscribers` | **404 err** | Tables do NOT exist in production — CoGuard fully un-deployed |
| `oci_partners` | **404 err** | Never existed (correct name is `partners`) — matches prior audit note |
| `deals`, `deal_rooms`, `deal_parties` | 0 / 0 / 0 | Shared hub/DEAL44 tables; router does not write them (no DEAL44 wiring on the router — it writes only the four above) |
| `payment_orders` | 264 | Hub-owned shared table (not router's) |

## 6. Env / vault presence (NAMES ONLY — never values)

Present (canonical env + box `.env`): `ANTHROPIC_API_KEY(+ENRICH)`, `NEW_OPENAI_KEY`, `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SECRET`, `BIZLEGAL_INBOUND_SECRET`, `OPS_LOG_URL` + `OPS_DASHBOARD_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_REPLY_TO`, `ROUTER_ADMIN_SECRET`, `ROUTER_BASE_URL`, `REDIS_URL`, `LOG_LEVEL`, `DISCLAIMER_VERSION`, `CLOUDFLARE_AUTH_EMAIL`, `CLOUDFLARE_API_TOKEN`, `OCI_PARTNER_CC`, `OCI_REFERRAL_CC`, `OCI_ROUTER_URL`, `OCI_ROUTER_LEAD_URL`, `DEAL44_TOKEN_KEY`.

Absent / doc mismatches: `OCI_OPT_OUT_BASE` (code default `https://bizlegal-ai.com/api/oci/optout?lead_id=` used), `RESEND_REFERRAL_FROM` (falls back to `RESEND_FROM`), `CLOUDFLARE_API_KEY` — **CLAUDE.md says `CLOUDFLARE_API_KEY`, vault has `CLOUDFLARE_API_TOKEN`** (doc-vs-vault inconsistency); no `DEAL_ROUTER_*` names anywhere.

**Minor security finding:** live Telegram bot token + Supabase project URL appear in plaintext in `journalctl` output on the box (and a local run logged `api_resend_key` in storage logs). Flag, don't remediate (read-only).

## 7. Integration wiring (verified)

| Integration | Direction | State |
|---|---|---|
| Hub `/api/realestate-intake` proxy → router `POST /lead` | hub→router | Wired: `route.ts` HMAC-signs with `BIZLEGAL_INBOUND_SECRET`, fires own `referral.received` (source hub), 502 on router error |
| Referral-contract opt-out | email→hub `/api/oci/optout?lead_id=` | Wired; patches `deal_router_leads` outcome=no_show + nulls contact_email; no auth (UUID-regex gated) |
| `ops_log.py` → hub `/api/ops/log` | router→hub | Wired; ALLOWED_TYPES = referral.received/routed/responded/closed/paid/alert/contract_email, error. **CoGuard event types NOT allowed → coguard log calls silently drop** |
| Redis dedupe | internal | lead 24h; coguard 48h (unused); payout-paid 1yr (reconciler-only) |

## 8. Stream-B workstream status (B1-B9)

Source: memory `stream-b-status.md` + README + migration files. Per-item definitions for B4-B8 not recovered in repo — statuses are from the memory assertion "B1-B8 complete 2026-04-26".

| Item | What | Status |
|---|---|---|
| B1 | OCI host provisioning / deploy infra (`b1-verify.sh`, docker, ports) | ✅ done |
| B2 | Supabase schema: `partners`, `deal_router_leads`, `payouts` + RLS + views + `anonymize_old_leads` RPC | ✅ done |
| B3 | Partner seed (placeholder row) + tier/round-robin selection | ✅ done |
| B4-B8 | Per-item definitions UNKNOWN from repo; memory asserts DONE 2026-04-26 | ✅ per memory (definitions UNKNOWN) |
| B9 | First end-to-end REAL lead | ❌ **BLOCKED on DNS** (`deals.bizlegal-ai.com` / `oci.bizlegal-ai.com` NXDOMAIN; `router.bizlegal-ai.com` itself now LIVE). Also needs EA Worker deployed w/ `WEBHOOK_SHARED_SECRET` + real partner onboarding before any lead would route to a human |

## 9. RUNNING vs DEAD + gaps

**RUNNING (live & serving):** router app, Caddy, Redis, `/lead` ingress (HMAC 401 gate confirmed), 4 owned tables, `payout-report` daily timer, hub intake proxying, contract opt-out.

**DEAD / not deployed:** CoGuard scaffold end-to-end (app not in image, no Caddy route, no DB tables — **and, as checked-in in the monorepo, `main.py` importing `coguard.py` would crash the app on boot**: `from storage import get_supabase` doesn't exist in `storage.py`, and `verify_signature(request, body_bytes)` mismatches `hmac_verify(body: bytes, header: str)`); `payout-reconciler.timer` (unit never installed); Telegram-noise-suppression fix (absent from deployed image); Domain B DNS.

**Gaps marked UNKNOWN:** B4-B8 item definitions (not in repo); exact CoGuard intent/status (dashboard not probed); whether hub `/api/oci` proxy route is exercised; `partners_coverage_check` / eval never run on live data.

**Biggest blockers (manual ops):** (1) B9 DNS — create `deals.bizlegal-ai.com` (and/or `oci.bizlegal-ai.com`) A/CF records → `151.145.81.139`; (2) redeploy to pick up 3+ months of fixes — **but the checked-in `main.py` + `coguard.py` ImportError must be fixed first or the next `docker compose up -d --build` will break production**; (3) decide CoGuard go/no-go (needs DB migration + Caddy route + worker); (4) real partner onboarding (only a placeholder exists) before any lead produces revenue; (5) install payout-reconciler timer; (6) fix payout_report Telegram spam (deploy suppression).

---

# 03 — SEO Status Audit (read-only, 2026-09-08)

Live probes + vault name-presence + migrations + supabase REST counts. No secret values printed.

## 1. Per-host sitemap / robots / AI-crawler matrix (all live probes 2026-09-08)

| Host | sitemap.xml | URLs | sitemap lastmod | robots.txt | AI crawlers (GPT/Claude/Perpl/OAI) | llms.txt |
|---|---|---|---|---|---|---|
| bizlegal-ai.com | 200 | 137 | 2026-08-23 | 200 (65 ln) | **ALLOWED** | 200 |
| docai.bizlegal-ai.com | 200 | 14 | 2026-08-23 | 200 (60 ln) | **ALLOWED** | 200 |
| forge.bizlegal-ai.com | 200 | 8 | 2026-08-23 | 200 (60 ln) | **ALLOWED** | 200 |
| tracr.bizlegal-ai.com | 200 | 10 | 2026-08-23 | 200 (72 ln) | **ALLOWED** | 200 |
| lexaudit.bizlegal-ai.com | 200 | 13 | 2026-08-23 | 200 (68 ln) | **ALLOWED** | 200 |
| brai.bizlegal-ai.com | 200 | 13 | 2026-08-23 | 200 (60 ln) | **ALLOWED** | 200 |
| leadforge.bizlegal-ai.com | 200 | 3 | 2026-08-23 | 200 (60 ln) | **ALLOWED** | 200 |
| bench.bizlegal-ai.com | 200 | 12 | — (none) | 200 (6 ln, minimal) | ALLOWED (default) | 200 |
| blog.bizlegal-ai.com | 200 | 429 | **2026-07-27 (STALE, ~43d)** | 200 (19 ln) | **ALLOWED** | 200 |
| router.bizlegal-ai.com | 200 text/plain, 0 urls | 0 | — | 200 (1 ln) | N/A | 200 |
| cited.bizlegal-ai.com | 200 | 52 | 2026-07-07 | 200 (37 ln) | explicit GPTBot/ClaudeBot/PerplexityBot **Allow: /** | 200 |
| propsignal / leaseparse / closeflow / coguard | ERR | — | — | ERR | — | ERR (not deployed) |

**Robots interpretation (important):** Next.js fleet robots is AI-friendly — `User-Agent:*` + a large allow-list of Googlebot/Bing/GPTBot/ClaudeBot/anthropic-ai/PerplexityBot/OAI-SearchBot/etc. all get `Allow: /` (only /api/, /_next/, /ops disallowed). Only scraper bots (Bytespider, CCBot, Diffbot, SemrushBot, AhrefsBot, MJ12, DotBot, BLEXBot, Imagesift, Petal) are `Disallow: /`. Blog blocks only 4 scrapers. Cited has per-bot `Allow`. **AI crawlers are NOT blocked anywhere deployed.** Crawl-delay:1 on hub/docai.

## 2. GSC wiring state

| Item | State |
|---|---|
| GSC_SERVICE_ACCOUNT_JSON (vault) | **EMPTY/UNSET** → no programmatic GSC API, no auto sitemap submission, no URL-inspection automation |
| GSC_BOT_ADMIN_TOKEN (vault) | EMPTY/UNSET |
| INDEXNOW_KEY (vault) | SET (32 chars) |
| GSC property add/verify (8 listed in GSC-SETUP doc) | MANUAL, UNKNOWN (Moses step, no automation evidence) |
| Sitemaps submitted to GSC per property | UNKNOWN (manual; docs list 8 sitemap URLs to paste) |
| Google Indexing API | NOT set up (no service account) |
| IndexNow submission evidence | done 2026-06-22 (22 URLs, HTTP 200 per prior doc) |

**GSC is effectively NOT wired.** 60-80% of benefit claimed via IndexNow→Bing path only. This is the #1 indexing blocker — agents cannot see impressions/clicks or push re-indexing.

## 3. seo-agents inventory (services/seo-agents/)

| Script | Function | Schedule (crontab.txt) | Outputs / DB writes |
|---|---|---|---|
| daily_autonomous_seo.py | Master orchestrator S1–S8: audit→enrich→publish→IndexNow→discover→headhunt→OCI→Telegram | 07:00 UTC | decisions/DAILY-AUTONOMOUS-<date>.md; streams |
| page_audit.py | Scores 53 pages / 8 surfaces on SEO+GEO+AEO; grade A–F | 06:00 UTC | /opt/bizlegal/decisions/SEO-AUDIT-<date>.md + supabase **seo_pages** (INSERT "audit/…" row per page) |
| seo_content_writer.py | 40-post engine; 1500-word posts w/ FAQ+Article schema, product links from SEO-KEYWORD-CALENDAR.json | content pipeline (02:00 in crontab.txt comment) | .mdx → content/blog |
| keyword_calendar.py | 365-post calendar: 8 pillars × ~46, weekend=comparisons, day-of-year rotation | — | SEO-KEYWORD-CALENDAR.json |
| internal_linker.py | Injects internal cross-links into .mdx (keyword matching) | — | .mdx edits |
| gsc_indexnow_pinger.py | IndexNow (+ Bing WMC, Telegram) on new .mdx; stdlib only | 13:00 (via seo_watchdog) | api.indexnow.org pings |
| seo_watchdog.py | Consolidate daily crawlers, fire IndexNow, Telegram alert on regressions (reads agent_runs) | 13:00 UTC | agent_runs reads, alerts |
| publish_blog.py | Syncs .mdx → bizlegal-ea GitHub (Contents API) → CF Pages blog | — | GitHub commit → blog deploy |
| daily_orchestrator.py | Hourly cron wrapper tasks 04/05/06/19 | 04,05,06,19 UTC | /var/log/seo-agents.log |
| crawlers/* (site_health 08, backlinks 09, competitors 10, ai_checks 11, index_status 12, sales 15, leads 16, customer_q 17) | Per-hour crawl jobs | as listed | agent_runs + supabase |
| enrich_page.py, geo_citation.py, affiliate_funnel.py, content_distribution.py, newsletter.py, conversion_tracker.py, revenue_attribution.py, analytics_dashboard.py, comparison_generator.py, infographic_generator.py, og_image_generator.py, visual_assets.py, lead_magnet.py, ea_agent.py, discovery_scraper.py, ops_alerts.py, telegram_bot/heartbeat.py, cleanup.py | Support pipeline (enrich, citations, affiliates, reports) | per crontab | mixed |

Hetzner crontab "RUNNING" is prior-audit evidence; **installation not verifiable from this box** → UNKNOWN. Local artifacts: none under services/seo-agents (outputs intended for /opt/bizlegal on Hetzner).

**Key defect:** page_audit.py docstring claims a `seo_audits` table; it actually writes to `seo_pages` (also in code), and **seo_audits does not exist in DB (REST 404)** — stale doc.

## 4. Keyword strategy → content coverage

Pillars from SEO-SUBSCRIPTION-10K-MRR-PLAN §4 (8 pillars):

| Pillar (target kws) | Content in content/blog |
|---|---|
| 1. BOI/FinCEN (diy vs automated, llc checklist) | YES — boi-filing-2026-diy-vs-automated.mdx, fincen-boi-reporting-2026-llc-checklist.mdx, 2026-07/boi-certifying-officer-liability-llcs.md |
| 2. VARA/UAE crypto | PARTIAL — mica-vs-vara-vs-fca-crypto-licensing.mdx |
| 3. SOC 2 / compliance automation | YES — soc2-vs-iso27001-vs-hipaa-compliance.mdx, how-to-respond-to-security-questionnaire-fast.mdx |
| 4. GDPR / DPA | YES — gdpr-vs-ccpa-vs-lgpd-data-privacy.mdx |
| 5. Crypto tax / wallet forensics | PARTIAL — wallet-forensics-court-admissibility-2026.mdx, travel-rule-compliance-vasps-crypto-exchanges.mdx |
| 6. PSP / payment licensing | NO post |
| 7. Singapore PSA/MAS | NO post |
| 8. India DPDPA | NO post |
| (bonus) MiCA cluster | WELL COVERED — mica-article-68, mica-dora-vara-benchmark, eu-ai-act, 2026-07/mica-article-23, 2026-07/mica-casp-which-member-state (NOT one of the 8 pillars) |
| (bonus) Comparisons cluster | 5 posts — docai-vs-luminance, firmcited-vs-ai, gdpr-vs-ccpa-vs-lgpd, mica-vs-vara-vs-fca, soc2-vs-iso27001-vs-hipaa |

Gaps: pillars 6/7/8 have zero content; pillar calendar (365) vs actual (20) = 94% un-written.

## 5. Indexation evidence / content fleet

- content/blog in monorepo: **20 posts** (16 .mdx + 4 .md in 2026-07/). Newest dated **2026-09-06/07** (i-ran-revenue-leak-report, boi-filing, comparisons batch).
- Live blog (blog.bizlegal-ai.com): sitemap **429 urls, lastmod 2026-07-27** → stale **~43 days**.
- Live probe: `/posts/{mica-vs-vara-vs-fca-crypto-licensing, soc2-vs-iso27001-vs-hipaa-compliance, boi-filing-2026-diy-vs-automated, i-ran-revenue-leak-report}` → **all 404**. The freshly-written posts are NOT deployed.
- Root cause: live blog is a separate CF-Pages app in **bizlegal-ea repo** (209 posts per CLAUDE.md); monorepo `content/blog` is NOT the deploy source. publish_blog.py (the bridge) not producing deploys since ~2026-07-27 → **content pipeline dead**.

## 6. SEO tables (supabase)

| Table | Exists? | Evidence |
|---|---|---|
| daily_gaps | EXISTS (migration 20260617) | REST count 400/UNKNOWN (prior audit: 43 rows) |
| seo_citation_log | EXISTS (migration 20260716_revenue_agent_tables.sql) | rows=\*/\* (exists; count uncountable via range) |
| seo_pages | EXISTS | rows=0-0/\* (≥1) |
| seo_audits | **MISSING (REST 404)** | script docstring is stale |
| page_enrichments | EXISTS | \*/\* |
| content_queue | **MISSING (REST 404)** | migration 20260906_content_queue.sql NOT applied |
| published_content | **MISSING (REST 404)** | same migration not applied |

## 7. SILO / internal-link inventory (apps/hub)

- Hub sitemap (137 urls) includes SILO surfaces: **/guides 68, /regulations 13, /tools 10, /learn 7** → hubs generated + sitemapped. /learn track+lesson urls present.
- /blog has **1** hub entry (index only; posts live on blog subdomain).
- **noindex (index:false) inventory** — deliberate hygiene, all private/transient:
  - hub: /dashboard, /docs, /kit, /deal/[token], /report/[id], /contact/thank-you, /affiliates/[code]/dashboard, **/learn/[track]/[lesson]** (lessons; track hubs indexed)
  - ops/* (all), api helpers
  - app-specific: bench/web/app/report/[id], docai/web/app/sqa/kb, deal44 app/r/[token]
- robots.ts present in: hub, brai, docai, forge, leadforge, lexaudit, bench, deal44, falseecho, sellerradar.

## WORKING vs BROKEN vs NOT-WIRED

**WORKING:** sitemaps+robots live on all **deployed** subdomains; AI crawlers allowed everywhere (GEO-friendly); llms.txt live everywhere; hub SILO hubs generated; IndexNow key present & previously used; noindex hygiene correct; robots.ts per-app.

**BROKEN:** blog content pipeline (0 new posts live in 43 days; freshly-written posts 404); blog sitemap lastmod frozen since 2026-07-27; content_queue/published_content migrations unapplied; seo_audits referenced but missing; keyword calendar 94% unfulfilled; pillars 6/7/8 empty.

**NOT-WIRED:** GSC (no service account, no Indexing API, no per-property verification evidence) → indexing feedback & re-index automation absent; blog source split (monorepo content/blog ≠ live blog source).

**UNKNOWN:** exact GSC property verification/submission per property; whether Hetzner crontab daemon actually running (prior audit: RUNNING); daily_gaps exact row count (REST 400); per-page live audit scores (requires running page_audit.py); router.bizlegal-ai.com purpose.

---

# 04 — Blog + content-generation pipeline audit

> Night audit 2026-09-08. Read-only. No secrets printed. Walls marked UNKNOWN.

## Blog surface facts

| Surface | URL | Backend | Source of truth | Last content |
|---|---|---|---|---|
| Hub canonical blog | bizlegal-ai.com/blog | apps/hub (Next.js) | monorepo `content/blog/` (`apps/hub/lib/blog.ts` walks `../../content/blog`) | local posts dated 2026-09-06/07 |
| Live blog (CF Pages) | blog.bizlegal-ai.com (root 308 → /blog/) | Cloudflare Pages from GitHub `aileadx10-boop/bizlegal-ea` | `projects/bizlegal-seo-site/content/blog/` (what publisher.py + publish_blog.py write) | sitemap lastmod 2026-07-27; last post 2026-07-20 |
| Sitemap | blog.bizlegal-ai.com/sitemap.xml | CF Pages | — | **429 URLs**; blog tags/categories include case-duplicate category paths (`/blog/category/Compliance/` vs `/blog/category/compliance/`) |

Discrepancy: canonical hub blog renders NEWER content; live CF Pages site is ~7 weeks stale.

## Local post inventory — monorepo `content/blog/` (NEWER than live)

| File | Date | Status | Notes |
|---|---|---|---|
| checks-before-an-ai-agent-touches-your-inbox.mdx | 2026-09-06 | published:true | Moses Dor Adv., legal-AI |
| boi-filing-2026-diy-vs-automated.mdx | 2026-09-06 | published:true | Editorial Team |
| what-is-a-contract-risk-assessment.mdx | 2026-09-06 | published:true | — |
| mica-dora-vara-compliance-benchmark-2026.mdx | 2026-09-06 | published:true | — |
| how-to-respond-to-security-questionnaire-fast.mdx | 2026-06-22 | published:true | pillar 3, docai (commit d7b8839) |
| eu-ai-act-fines-non-compliance-2025.mdx | 2026-07-01 | published:true | canonical blog URL |
| travel-rule-compliance-vasps-crypto-exchanges.mdx | 2026-07-01 | published:true | TRACR |
| fincen-boi-reporting-2026-llc-checklist.mdx | 2026-07-13 | published:false | placeholder byline "Moses [Last Name], J.D." |
| i-ran-a-revenue-leak-report-on-my-own-practice.mdx | placeholder `[YYYY-MM-DD]` | published:false | bracket placeholder date + numbers |
| mica-article-68-2026-casp-authorization-withdrawal.mdx | 2026-07-13 | placeholder | products LexAudit/BRAI/Tracr |
| wallet-forensics-court-admissibility-2026.mdx | 2026-07-13 | placeholder | Tracr |
| comparisons/ | docai-vs-luminance, firmcited-vs-ai (2026-09-06, published); gdpr-vs-ccpa-vs-lgpd, mica-vs-vara-vs-fca, soc2-vs-iso27001-vs-hipaa (2026-07-13) | mixed | |
| 2026-07/ | EMPTY | — | |

## Curator pipeline map (Hetzner CX33 204.168.209.235, /opt/bizlegal/curator)

Step flow: **RSS → scout → daily_gaps → bot/auto_pick → brain → publisher → bizlegal-ea (CF Pages)** — plus downstream seo-agents cron suite and n8n.

| Step | File | Trigger | Status (2026-09-08) | Evidence |
|---|---|---|---|---|
| 1. RSS poll + Ollama filter/rank | scout.py | curator-scout.timer daily 06:00 UTC | **DEAD** | Last run Sep 07 06:46: `0/12 items passed filter` — every item dropped with `404 Not Found for url 'https://curator.bizlegal-ai.com/api/chat'`. Models in .env (mistral-nemo) DO exist locally. |
| 2. Supabase state machine | daily_gaps | scout upserts pending_pick | DEAD (no new rows) | Counts: published **25**, picked **10**, archived **7**, rejected_quality **1**, pending_pick **0**. |
| 3. Telegram pick gate | bot.py | curator-bot.service (long-poll) | **RUNNING** | active; heartbeats every 5min. But nothing to pick (no pending_pick). |
| 4. Fallback auto-pick | auto_pick.py | curator-auto-pick.timer daily 10:00 UTC | INERT (active, no-op) | Fires but no pending_pick rows with score ≥ 14 (scout dead). |
| 5. Draft (Sonnet 4.6 + gates) | brain.py | **NO systemd unit / no timer / no cron** — only spawned by bot.py pick | RUNNING-ON-DEMAND | brain_run7.log (Jun 17 19:59): 2 picked → drafted, quality gate ok, humanize ok, factual review ok (3–4 sources, 0 invented). **10 'picked' rows are STUCK — nothing triggers brain autonomously.** |
| 6. Publish (FastAPI :8082) | publisher.py | curator-publisher.service | **RUNNING but STALE BUILD** | Box file = 9132 B dated **Apr 26**; local = 18216 B dated Jun 11. Box missing forge-affinity dual-commit, numeric-claim verification, `/api/content/syndicate` HMAC POST. Endpoints present on box: /deploy /regen /reject /health. |
| 7. Social distribution copy | distributor.py | no schedule | **DEAD/never run** | socials dir EMPTY on box; writes to /opt/bizlegal/curator/social. |
| 8. Enrichment | firecrawl_enrich.py | no cron | INACTIVE | httpx+trafilatura, no API key needed. |
| 9. Ops telemetry | ops_log.py | bot heartbeat loop | RUNNING | POSTs to https://bizlegal-ai.com/api/ops/log w/ HMAC; failures swallowed. |
| 10. n8n workflow | "My workflow" | docker; ACTIVE daily 03:00 UTC | **DEAD** | Ollama nodes call `https://associates-hardwood-click-jesus.trycloudflare.com/api/generate` (ephemeral trycloudflare tunnel — also dead) AND legacy tunnel; writes to `gap_pages` (different table from daily_gaps), then Vercel deploy hook + Telegram. "Temp Env Reader" inactive. |
| 11. marimo | ghcr.io/marimo-team/marimo | docker | RUNNING (container up 4 mo) | volume /opt/bizlegal/marimo EMPTY. |

### Ollama on box

Local `127.0.0.1:11434 /api/chat` **WORKS** with mistral-nemo (23s OK). Scout/brain/n8n point at `curator.bizlegal-ai.com/api/chat` → 404 (route not configured / dropped at tunnel — likely CF Access or missing api/chat location). Repointing .env `OLLAMA_TUNNEL_URL=http://127.0.0.1:11434` is a zero-code-change unblock.

### Downstream content consumers (box cron, all RUNNING)

| Cron (UTC) | Script | Output |
|---|---|---|
| 02:00 daily | seo-agents/seo_content_writer.py --pillar N | 40 `.mdx` (12–13 KB) in `seo-agents/blog_content/` (adgm-crypto-framework, beneficial-owner-definition-fincen, …) — latest file Jul 27 |
| 03:00 daily | seo-agents/og_image_generator.py | og PNGs |
| 14:30 daily | seo-agents/publish_blog.py | **"published 40/40" on 2026-09-07** → git commits to `aileadx10-boop/bizlegal-ea` (HEAD dc0deaa "feat(blog): --all-pending (pillar 3)", 306cb0b, 1385c6f) |
| 10–21:00 | competitors/ai_checks/index_status/sales/leads/customer_q/seo_watchdog/newsletter | /var/log/seo-agents.log (revenue_alerter `fired:0`) |
| 14:00 | gsc_indexnow_pinger --input seo-agents/blog_content | IndexNow ping with prefix `https://blog.bizlegal-ai.com/posts` — **MISMATCHED prefix** (live site uses `/blog/…`, verified 308 on /blog) |

`/opt/bizlegal/curator/content/blog/` also holds dated stub `.md` files (20 in 2026-08, 7 in 2026-09; 36–37 bytes each, filename-only) — NOT real content, not the publish source.

### Live-site verification

- `https://blog.bizlegal-ai.com/blog/adgm-crypto-framework` → **404**; `.../how-to-respond-to-security-questionnaire-fast` → **404**; `.../checks-before-an-ai-agent-touches-your-inbox` → **404**. → The 40 pushed posts and all local 2026-09 posts are NOT live. **CF Pages deploy stalled since 2026-07-27** despite bizlegal-ea main receiving 40 posts (publish_blog reports success; repo clone at /opt/bizlegal/bizlegal-ea has the commits).

## Blockers to content regeneration

1. **Ollama tunnel dead (scout + n8n)** — `curator.bizlegal-ai.com/api/chat` → 404. Blocks step 1–2; no new daily_gaps rows since ~Sep; 10 rows stuck `picked` because brain has no trigger.
2. **no brain scheduler** — brain.py runs only via Telegram pick callback; auto_pick marks picked but nothing drafts. 10 `picked` rows orphaned.
3. **publisher.py stale on box** (Apr 26 build vs local Jun 11) — no numeric verification, no forge-affinity dual-commit, no syndicate call.
4. **CF Pages deploy stalled** — bizlegal-ea has 40 pending posts (incl. all pillar posts) that 404 live; lastmod 2026-07-27. Blog surface stale even though content pipeline downstream is producing.
5. **n8n "My workflow"** targets ephemeral trycloudflare tunnel + writes to `gap_pages` (wrong table) — dead parallel path, not wired to daily_gags.
6. Local monorepo content (2026-09-06/07) never deployed to live CF Pages site; placeholder bylines (`Moses [Last Name], J.D.`) and bracket date/numbers in unpublished drafts block clean regen of 2+ posts.

## Manual ops queue

| # | Op | Box command (copy-paste) |
|---|---|---|
| 1 | Repoint Ollama to local (or fix CF Access on tunnel route) | `sed -i 's|OLLAMA_TUNNEL_URL=.*|OLLAMA_TUNNEL_URL=http://127.0.0.1:11434|' /opt/bizlegal/curator/.env && systemctl restart curator-bot curator-publisher` |
| 2 | Re-SCP fresh publisher.py to box | `scp -i ~/.ssh/id_ed25519 services/hetzner/publisher.py root@204.168.209.235:/opt/bizlegal/curator/publisher.py && ssh root@204.168.209.235 "systemctl restart curator-publisher"` |
| 3 | Add brain timer/service so picked rows draft autonomously | `scp services/hetzner/systemd/curator-brain.* root@204.168.209.235:/etc/systemd/system/ && ssh root@204.168.209.235 "systemctl daemon-reload && systemctl enable --now curator-brain.timer"` |
| 4 | Verify/fix CF Pages build on bizlegal-ea repo (40 posts stuck) | CF dashboard → Pages project → latest build of `aileadx10-boop/bizlegal-ea`; last success 2026-07-27 |
| 5 | Deactivate or rewire n8n "My workflow" (dead tunnel, wrong table) | n8n UI `:5678` — deactivate "My workflow"; point Ollama nodes at localhost |
| 6 | Fix gsc_indexnow prefix `/posts` → `/blog` | `sed -i 's|https://blog.bizlegal-ai.com/posts|https://blog.bizlegal-ai.com/blog|' /opt/bizlegal/curator/services/seo-agents/gsc_indexnow_pinger.py` |

## UNKNOWN gaps

- Whether **CF Pages build failed** (auth, content hash, branch) or is simply not triggered — dashboard access not automated; root cause UNKNOWN.
- Whether hub canonical blog (bizlegal-ai.com/blog) got the Sep content deployed — hub deploy source is monorepo `apps/hub`, commit d7b8839 present; live hub URL not verified.
- Full listing of bizlegal-ea `projects/bizlegal-seo-site/content/blog` (GitHub API auth failed — "Bad credentials"); live-file inventory UNKNOWN.
- Exact CF Access setup on `curator.bizlegal-ai.com` route (service token vs email OTP) — 404 root cause asserted, config UNKNOWN.
- Telegram bot reachable/hidden state (no live poll captured).
- Where `content/blog/2026-08|09` stub `.md` files come from (writer script UNKNOWN).
- Whether `daily_orchestrator.py --task=04/19` and other seo-agents cron scripts succeed end-to-end (revenue_alerter shows `ok:true fired:0`; others unverified).

---

# 05 — Cloudflare Surface Inventory (read-only, 2026-09-08)

Method: `nslookup` + curl probes from the Windows box + local config reads. Wrangler auth BROKEN (`whoami` → 400 `Not logged in`); NO CF API token in shell env → dashboard/API-backed data (full zone records, exact Access app config, cron execution logs) marked **UNKNOWN**.

## 1. Worker projects (`bizlegal-monorepo/services/*`)

| Project | wrangler name | Purpose | Routes / custom domain | Cron | KV / bindings | Vars (names) | Secrets (names) | Live @ workers.dev |
|---|---|---|---|---|---|---|---|---|
| `worker/` | `bizlegal-lead-intake` | Lead intake + snapshot pipeline + product-digest aggregator + lead-nurture cron | **workers.dev ONLY** — `intake.bizlegal-ai.com` route COMMENTED OUT; intake DNS NXDOMAIN. HTTP: /intake, /report/snapshot, /report/snapshot-public, /digest/aggregate, /digest/latest, /health | `0 6 * * *`, `0 9 * * *`, `*/5 * * * *` | KV `DIGEST_KV` (id in toml) | PIPELINE_VERSION, GITHUB_REPO_OWNER, GITHUB_REPO_NAME, GITHUB_DEFAULT_BRANCH, HAIKU_MODEL_ID, SONNET_ESCALATION_MODEL_ID, MIN_CONFIDENCE_THRESHOLD, NOTIFY_SCORE_THRESHOLD | ANTHROPIC_API_KEY, GITHUB_TOKEN, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, WEBHOOK_SHARED_SECRET, GEMINI_API_KEY (opt) | **✅ 200** — /health returns config JSON; proper 404 JSON elsewhere |
| `telegram-hub/` | `bizlegal-telegram-hub` | Telegram FAQ/intake bot (webhook @BizlegalHubBot) | workers.dev /webhook only; no custom domain | none | none | — | BIZLEGALHUBBOT, TELEGRAM_WEBHOOK_SECRET, WEBHOOK_SHARED_SECRET, HUB_BASE_URL | ❌ `error code: 1042` on ALL paths (= no worker at this subdomain) |
| `gsc-bot/` | `bizlegal-gsc-bot` | Weekly GSC sitemap submission (8 sites) | workers.dev /health, /run; no custom domain | `0 2 * * 1` | none | SITES (8 site|sitemap pairs) | GSC_SERVICE_ACCOUNT_JSON, BIZLEGAL_INBOUND_SECRET, OPS_LOG_URL, ADMIN_TOKEN | ❌ `error code: 1042` on ALL paths |
| `coguard-worker/` | `coguard-email-worker` | CF Email Routing → alias→subscriber_id lookup → OCI /coguard/process | email-triggered (`{uuid}@inbox.coguard.bizlegal-ai.com`); no HTTP route, no custom domain | none | KV `COGUARD_ALIASES` (**id = ""** in toml — never bound) | OCI_BASE_URL | WEBHOOK_SHARED_SECRET, CF_COGUARD_ROUTING_TOKEN | ❌ `error code: 1042` on ALL paths |

> KEY FINDING: only **lead-intake** is reachable. A control probe against a fake `*.bizlegal-ai.workers.dev` name ALSO returns `error code: 1042` (HTTP 404) — so 1042 = "no worker at this subdomain". telegram-hub, gsc-bot, coguard-email-worker are therefore either deployed under a DIFFERENT account/subdomain or never deployed on this account. Repo code for all four is healthy (gsc-bot `/health` returns `{ok:true}` in code — unreachable live). Root cause UNKNOWN without dashboard (deploy status / actual subdomain).

## 2. DNS map (bizlegal-ai.com, A-record resolution 2026-09-08)

All Cloudflare-proxied hosts resolve to CF edge `104.21.36.152 / 172.67.196.116`. Non-CF hosts listed separately.

| Host | Resolves? | Points to | Live HTTP | Behind CF? |
|---|---|---|---|---|
| bizlegal-ai.com (apex=hub) | ✅ | CF edge (proxied) | 200, server=cloudflare, DYNAMIC | ✅ |
| www.bizlegal-ai.com | ✅ | CF edge (proxied) | 200 | ✅ |
| hub.bizlegal-ai.com | ❌ NXDOMAIN | — | — | — (hub is served at apex) |
| docai / forge / tracr / lexaudit / brai / leadforge / blog | ✅ | CF edge | all 200, cloudflare, DYNAMIC | ✅ |
| bench.bizlegal-ai.com | ✅ | 216.150.1.1 / 216.150.16.1 | 200, server=Vercel | ❌ direct-to-Vercel |
| cited.bizlegal-ai.com | ✅ | 66.33.60.193 / 76.76.21.241 | 200, server=Vercel | ❌ direct-to-Vercel |
| router.bizlegal-ai.com | ✅ | 151.145.81.139 | 200, server=Caddy (Hetzner VM) | ❌ direct | 
| curator | curator-gpu | ✅ | CF edge | 302→Access login / 403 (see below) | ✅ (behind Access) |
| intake | notes | oci | coguard | inbox.coguard | ollama | ❌ NXDOMAIN (all dead) | — | — | — |

> Full record set (CNAME/MX/TXT; which records are proxied vs DNS-only) requires the CF API — **UNKNOWN** (no token).

## 3. Zero Trust / Access map (probe-derived)

| Hostname | Status | Evidence |
|---|---|---|
| curator.bizlegal-ai.com | 🟢 Access-PROTECTED | 302 → `bizlegal.cloudflareaccess.com` login; `service_token_status:false`, `auth_status:NONE` in JWT meta |
| curator-gpu.bizlegal-ai.com | 🟢 Access-PROTECTED | 403 Forbidden (block page), no anonymous access |
| all other proxied hosts | Open (200, no challenge) | served without Access |

Local Access artifacts: `.cloudflared/config.yml` (below); service-token var names in env file: `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`, `OLLAMA_TUNNEL_TOKEN`. Access team domain: `bizlegal.cloudflareaccess.com`. Exact policy/app config: UNKNOWN (no API).

## 4. Tunnels

| Tunnel / host | Location | State |
|---|---|---|
| Tunnel `d8f42728-b85a-4e69-b165-981791eacb86` serving `curator.bizlegal-ai.com` AND `curator-gpu.bizlegal-ai.com` → `http://localhost:11434` (Windows Ollama) | **Windows box** (this machine) | cloudflared.exe running as Service PID 5124; cert.pem + credential JSON present. Hostnames reach CF but Access DENIES (service_token_status:false) → Ollama unreachable through tunnel |
| Hetzner 204.168.209.235 | checked via SSH | **NO Cloudflare-related tunnel**: no cloudflared systemd unit, no /etc/cloudflared, no /root/.cloudflared. (Hetzner runs only Caddy/router + curator agents per 01-hetzner.md) |

> Memory note "cloudflared tunnels on Hetzner" is **outdated** — the Ollama tunnel is the local Windows cloudflared.

## 5. workers.dev / pages.dev surfaces

- workers.dev: `bizlegal-lead-intake.bizlegal-ai.workers.dev` **LIVE (200)**. telegram-hub, gsc-bot, coguard-email-worker → 1042 (unreachable at that subdomain).
- pages.dev: **none referenced anywhere in repo**; probing without a dashboard list is not possible → UNKNOWN whether any exist.

## 6. Cache / WAF / rate limits (header-observable only)

- All proxied surfaces: `cf-cache-status: DYNAMIC`, no cached assets observed → no meaningful CF cache/edge cache in play for HTML.
- No 429 / 403 block pages observed on any open surface (except curator-gpu Access block). WAF rules unknown without API.

## WORKING vs BROKEN vs BLOCKED

**WORKING**: lead-intake worker (crons configured in toml, execution unverifiable); all proxied Vercel/Caddy surfaces (apex, docai, forge, tracr, lexaudit, brai, leadforge, blog, bench, cited, router) return 200; curator/curator-gpu correctly Access-gated.

**BROKEN**: telegram-hub, gsc-bot, coguard-email-worker — no reachable deployment at their workers.dev URLs (1042); their crons/email-routing therefore dead. gsc-bot GSC-sitemap cron and coguard Email Routing silently not firing.

**BLOCKED**: intake custom domain (route commented + DNS NXDOMAIN — fix = uncomment route, add DNS record); curator/curator-gpu Ollama tunnel — Access `service_token_status:false`, so the local cloudflared→Ollama path is denied (RED-2 in runbook).

## Gaps marked UNKNOWN
- CF API / dashboard data (zone record set, exact Access app + service tokens, deployment list, live cron runs) — no token in shell.
- Whether telegram/gsc/coguard are deployed under a different account subdomain.
- pages.dev assets (none found locally).
- Cloudflare analytics, WAF rules, rate-limit rules.

---

# 06 — AEO / GEO Status Audit (read-only, 2026-09-08)

Scope: the "get cited by ChatGPT/Claude/Perplexity/Google AI" layer. Sources: decisions GEO-EXECUTION-REPORT-2026-06-19, AEO-AUSTIN-ARMSTRONG-2026-07-02, SEO-SUBSCRIPTION-10K-MRR-PLAN, AI-TEAMMATES-FOUR-CS-2026-09-06, HEADHUNTER-REPORT-2026-06-23; FirmCited repo (vertical.config.ts, audit-engine, monitor, visibility-index, /grok-bot); apps/hub SILO; services/agents; live probes. No secret values printed.

## 1. Plan → Implemented (AEO/GEO mechanisms)

| # | Mechanism (plan source) | Planned | Implemented | Evidence |
|---|---|---|---|---|
| 1 | llms.txt catalog on all product surfaces (GEO-EXEC §1, AEO-ARM §5) | YES | **LIVE** | HTTP 200 on 8/8 surfaces (hub 3924B, brai, tracr, lexaudit, forge, leadforge, docai/web, blog) |
| 2 | AI-bot allowlist robots.ts (36 agents) + scrape blocklist (GEO-EXEC §2A) | YES | **LIVE** | robots.txt 200 all surfaces; GPTBot/ClaudeBot/PerplexityBot ALLOWED; no CF block (AI Crawl Control + Managed robots OFF at edge) |
| 3 | Homepage + product JSON-LD (SoftwareApplication/ItemList/FAQPage/Org) (GEO-EXEC §1) | YES | **LIVE** | 5 blocks in hub SSR HTML; guide/learn pages carry Article/FAQ/Breadcrumb/ItemList + canonical |
| 4 | Hub SILO hubs: /guides /regulations /tools /learn (plan §4) | YES | **LIVE** | sitemap counts guides 68 / regulations 13 / tools 10 / learn 7; tracks indexed, lessons noindexed |
| 5 | 90-day AEO calendar, 39 posts, 5 pillar pages, correct-the-AI pages (AEO-ARM §4/§10) | YES | **NO — 0/39 published live** | live blog stale since 2026-07-27; freshly-written posts 404; pillars 2/5 partial, 6/7/8 empty |
| 6 | 365-post keyword calendar / 8-pillar SERP plan (SEO-SUB §4) | YES | **PARTIAL (~6%)** | 20 posts exist in monorepo content/blog vs 365; blog sitemap frozen 2026-07-27 |
| 7 | Citation tracking → seo_citation_log (aeo_revenue_agent Stage 2; SEO-SUB) | YES | **DARK** | table EXISTS (migration 20260716_revenue_agent_tables) but **zero writers**; aeo_revenue_agent only READS it (docstring claims "updates") |
| 8 | Citation/SoV measurement via SERP tooling (4 engine callers) | YES | **LIVE in audit engine** | Firmcited engines.ts: OpenAI Responses + web_search, Anthropic web_search tool, Perplexity sonar, SerpAPI ai_overview; graceful skip when unkeyed |
| 9 | Visibility index (~15 prompts × 4 engines), publish gate (Firmcited visibility-index) | YES | **PARTIAL — no cron** | migration 0008 exists; stages draft→reviewed→published→killed; vercel.json has **no** visibility-index cron; publish is human-gated |
| 10 | Monthly Monitor $299 scan (recurring audits) | YES | **LIVE** | monitor-runner.ts sweep + IN_FLIGHT guard + PayPal sub; fc_subscriptions=0 |
| 11 | GSC programmatic submission (gsc-bot worker, SEO-SUB §5) | YES | **NOT-WIRED** | worker + service-account code exists, but GSC_SERVICE_ACCOUNT_JSON EMPTY/UNSET in vault; per-property verification UNKNOWN |
| 12 | IndexNow ping per publish (SEO-SUB §5) | YES | **PARTIAL** | INDEXNOW_KEY SET (32ch); last use 2026-06-22; no live publish pipeline to ping |
| 13 | Blog deploy bridge (monorepo content → CF Pages via publish_blog.py) | YES | **DARK** | blog live app stale 43d; monorepo content/blog NOT the deploy source |
| 14 | Grok Bot offer (vertical.config grokbot) | YES (FirmCited) | **LIVE + CONFLICT** | /grok-bot page sells $490 audit ladder; contradicts decision O-018 (see §6) |

## 2. FirmCited AEO stack status

| Component | Status | Notes |
|---|---|---|
| $490 AI Visibility Audit (temp $20) | LIVE (build+checkout) | runner.ts orchestrator; inspectFirmSite checks FAQPage/Attorney/LegalService schema + intake; MIN_ENGINES=2; PDF + email delivery |
| Engine callers (ChatGPT/Claude/Perplexity/Google AI Overview) | LIVE | SerpAPI empty-text = meaningful "no AI Overview"; unkeyed engines skipped, not fatal |
| Monitor $299/mo recurring | LIVE | 27-day recur; IN_FLIGHT_STATUSES guard; PayPal subscription (fc_subscriptions=0 rows) |
| Visibility Index (~15 prompts) | BUILT, not scheduled | 'draft' stage hard-gated; refuses to rank when runsOk < half; needs manual run + publish |
| Citation tracking (post-delivery) | ABSENT | audit delivers one-time report; no follow-up SoV/citation-log write anywhere |
| /grok-bot page | LIVE | 4-rung ladder; client-owned Grok sub pass-through ($20-30/mo) |

## 3. Hub GEO content inventory

| Surface | URLs | JSON-LD | Status |
|---|---|---|---|
| /guides | 68 | Article+FAQ+Breadcrumb (+canonical alternates) on representative pages | LIVE |
| /regulations | 13 | standard (ItemList) | LIVE |
| /tools | 10 | standard | LIVE |
| /learn | 7 tracks (lessons noindexed) | canonical+ItemList+Breadcrumb on tracks | LIVE |
| /blog | 1 (index only) | — | posts live on blog subdomain, not hub |
| blog.bizlegal-ai.com (CF Pages) | 429 | — | **STALE 2026-07-27 (~43d)**; fresh posts 404 |
| monorepo content/blog | 20 (16 mdx + 4 md) | FAQ+Article on writer engine | NOT the live deploy source |

## 4. AI-crawler robots / llms.txt matrix (live probes 2026-09-08)

| Host | robots.txt | AI crawlers (GPT/Claude/Perpl/OAI) | llms.txt |
|---|---|---|---|
| bizlegal-ai.com | 200 | ALLOWED | 200 |
| docai/forge/tracr/lexaudit/brai/leadforge | 200 | ALLOWED | 200 |
| bench | 200 (minimal) | allowed (default) | 200 |
| blog | 200 | ALLOWED (4 scrapers blocked) | 200 |
| cited (FirmCited) | 200 | explicit per-bot Allow:/ | 200 |
| router | 200 (1 ln) | N/A | 200 |
| propsignal/leaseparse/closeflow/coguard | ERR | — | ERR (not deployed) |

Cloudflare AI Crawl Control + Managed robots.txt confirmed OFF (no CF block served) — the 2026-06-19 blocker is resolved.

## 5. Measurement tooling presence (vault/secret NAMES only)

| Key | Presence |
|---|---|
| PERPLEXITY_API_KEY | name in vault + Firmcited .env.local; prod-Vercel wiring UNKNOWN |
| SERPAPI_API_KEY | same |
| INDEXNOW_KEY | SET (32 chars) |
| GSC_SERVICE_ACCOUNT_JSON | EMPTY/UNSET |
| GOOGLE_API_KEY / APIFY_API_TOKEN | names present; wiring UNKNOWN |
| OPS_DASHBOARD_TOKEN | vault ↔ Vercel MISMATCH (ops locked) |
| seo_citation_log rows | table exists; live row count UNKNOWN (REST range uncountable); zero writers confirmed |

## 6. Grok Bot status — CONFLICT

- cited.bizlegal-ai.com/grok-bot **LIVE**, sells $490 opportunity audit (shared checkout) + ladder.
- Decision O-018 (AI-TEAMMATES-FOUR-CS-2026-09-06) rejects Grok Bot setups for BizLegal; re-open gates = G1 passed + business ToS/DPA + spend cap + sub inside engagement price. Live page's guardrails transfer compliance responsibility to buyer and do not claim a DPA/spend-cap — does not satisfy the gates. **Unresolved human call: does O-018 bind FirmCited? Flag for Moses.**

## 7. LIVE / PLANNED / DARK summary

**LIVE:** robots allowlists + llms.txt 8/8; hub SILO hubs + JSON-LD; FirmCited audit+monitor engines with 4 engine callers; IndexNow key.
**PLANNED (never delivered):** 90-day/39-post AEO calendar; 5 pillar + correct-the-AI pages; 365-post calendar (94% unwritten); visibility-index cron + publish gate; GSC service account.
**DARK:** seo_citation_log writes (0 writers); blog publish bridge (43d stale; fresh posts 404); curator content flywheel (scout 0/12 — /api/chat 404 behind CF Access + no gemma); GSC automation; llms.txt regeneration (llms_generator.py NOT on cron — catalogs stale after content changes).

**UNKNOWN:** prod presence of PERPLEXITY/SERPAPI keys in Hub+FirmCited Vercel envs; whether aeo_revenue_agent actually fires (Hetzner cron daemon unverifiable from this box; box content-dead though agent targets Supabase+Anthropic directly); GSC per-property verification; seo_citation_log live counts; Monitor subscriber count (fc_subscriptions=0); FirmCited free-check / diy-audit pages (not read).

---

# LIVE BizLegal AI — Per-App Mechanism Map (2026-09-08)

> OUT-OF-SCOPE (exist under apps/ but NOT in this audit's coverage): falseecho (20 src files, `FALSEECHO_FULFILL_URL` fulfillment), sellerradar (18, `SELLERRADAR_FULFILL_URL`), deal44 (7), coguard (2), closeflow (1), leaseparse (1), propsignal (1), caseaudit (0), dealdesk (0), funnel-mvp (0 — duplicate of docai, reverted per memory). Marked OUT-OF-SCOPE/UNKNOWN.

> Canonical deploy source: `bizlegal-monorepo/apps/*` on `main`. Hub = root domain `bizlegal-ai.com` (NOT `hub.bizlegal-ai.com` — that subdomain is NXDOMAIN). Prod build may lag `main` by commits (see NIGHT-AUDIT).
> Live probe results (2026-09-08): root `200`, blog/brai/tracr/lexaudit/docai/leadforge/forge/bench/router all `200`; hub.bizlegal-ai.com, publisher/safe/storage DNS `000`.

## HUB (apps/hub) — served at bizlegal-ai.com

- **121 API route files / 137 handlers** · **195 pages** · **10 layouts** · **23 Vercel crons** · **~72 lib modules** · **86 env vars referenced**
- Shared workspace packages: `@bizlegal/{deal-engine, ops-log, email, payment, themes, turnstile-widget, rate-limit}`
- Security: `middleware.ts` sets CSP (script-src includes `'unsafe-inline' 'unsafe-eval'` + supabase/stripe), security headers, per-IP rate buckets; `lib/ops/log.ts` re-exports `@bizlegal/ops-log` (HMAC-signed event write, secret `BIZLEGAL_INBOUND_SECRET`).
- OpenAPI registry: `lib/openapi/registry.ts` (documents `/api/openapi.json`), trace via `lib/openapi/trace.ts`.

### Hub API surface (by group; M=method)

| Route | M | Purpose | Env | Status |
|---|---|---|---|---|
| /api/pay/start | POST,GET | Universal checkout (gateway-agnostic), creates `payment_orders` row before gateway call; fires `agent.checkout` / `payment.intent` | PAYPAL_*, NOWPAYMENTS_*, NEXT_PUBLIC_APP_URL | **LIVE** (probed: returns product_id validation error + `valid_product_ids`) |
| /api/payments/nowpayments/{start,webhook} | POST | NOWPayments checkout / IPN | NOWPAYMENTS_API_KEY, IPN_SECRET | live |
| /api/payments/paypal/{start,webhook} | POST | PayPal checkout / IPN | PAYPAL_CLIENT_ID/SECRET, PAYPAL_ENV, PAYPAL_WEBHOOK_ID | live |
| /api/payments/paddle/{start,webhook} | POST,GET | Paddle checkout/webhook | PADDLE_API_KEY, PADDLE_ENV, PADDLE_WEBHOOK_SECRET | live |
| /api/payments/wire/{start,confirm} | POST | Bank-wire payments (USD/EUR bank arrays in lib/payments.ts) | BANK_USD_*, BANK_EUR_*, WIRE_ADMIN_TOKEN | live |
| /api/payments/conductor/start | POST,GET | "Conductor" checkout | — | live |
| /api/payments/lemonsqueezy | POST,GET | LemonSqueezy webhook | LEMONSQUEEZY_WEBHOOK_SECRET | live |
| /api/payments/price | GET | Price map lookup | — | live |
| /api/products/[product]/{create-order,webhook} | POST | Generic product order + webhook | — | live |
| /api/products/… grant fulfillment | — | `lib/payments/*-grant.ts`: ai-policy, casp-bundle, conductor, falseecho, ofac-watch, practice, practice-revenue, sellerradar | — | live |
| /api/ops/log | POST | HMAC ingress: any surface writes to `ops_events` | BIZLEGAL_INBOUND_SECRET | **405 on live GET probe** (POST-only expected; probed) |
| /api/ops/heartbeat | POST | Upsert `agent_heartbeats` per service | HMAC | live |
| /api/ops/live, /api/ops/live/stream | GET | Service state + SSE heartbeat stream | OPS_DASHBOARD_TOKEN | live |
| /api/ops/health | GET | Env+HMAC+subdomain audit | token | **404 on live** (route behind in prod deploy) |
| /api/ops/feed | GET | Paginated ops_events tape | token | live |
| /api/ops/command, /api/ops/process-tree, /api/ops/replay/[trace_id], /api/ops/audit/verify, /api/ops/breakpoint, /api/ops/mock/[surface] | GET,POST | Ops tooling (run commands, process tree, event replay, audit-chain verify) | token | live |
| /api/agents/run?task=… | GET | Agent runner (EA tasks); 7 cron-triggered tasks | ANTHROPIC_API_KEY, TELEGRAM_*, OPS_DASHBOARD_TOKEN | live |
| /api/agents/enrich-pages | GET | Weekly page-enrichment agent | ANTHROPIC_API_KEY | live (cron Sun 04:00) |
| /api/inbound-lead | POST | Newsletter/lead intake from cross-origin surfaces (no HMAC per docblock) | — | live |
| /api/leads | POST | Lead capture (open) | — | live |
| /api/contact, /api/subscribe, /api/subscribers, /api/newsletter{,+confirm,+unsubscribe}, /api/email/unsubscribe, /api/extension/capture | POST/GET | Form + newsletter stack | RESEND_*, NEXT_PUBLIC_SUPABASE_* | live |
| /api/newsletter/send | GET | Weekly newsletter send (cron Mon 13:00) | RESEND_AUDIENCE_ID, RESEND_API_KEY | live |
| /api/webhooks/outbound | POST,GET | Cold sender feedback: bounces/unsubscribes→`email_suppression_list`, replies→`sales_reply` | OUTBOUND_SENDING_DOMAIN, INSTANTLY_* | live |
| /api/webhooks/resend | POST | Resend inbound webhooks | RESEND_WEBHOOK_SECRET | live |
| /api/tracr/* (analyze, create-order, generate-report, paypal-order, paypal-capture, verify-eth, webhook) | POST | Tracr product proxy (wallet risk analysis on hub) | TRACR_WEBHOOK_SECRET, TRACR_ETH_ADDRESS, ETHERSCAN_API_KEY, PAYPAL_* | live |
| /api/brai/{leads,invoice,webhook} | POST | BRAI proxy (lead capture, invoicing, webhook) | SUPABASE_SERVICE_KEY | live |
| /api/risk-assessment, /api/risk-engine/deep-analysis | POST | Compliance risk scores (lib/riskEngine.ts) | ANTHROPIC_API_KEY | live |
| /api/ai-act/classify | POST | EU AI Act risk-tier classifier | ANTHROPIC_KEY | live |
| /api/psp-risk/audit | POST | Payment-service-provider AUP risk | — | live |
| /api/policy-refresh/audit + /api/cron/policy-refresh | POST/GET | Policy refresh audits (NIST, ISO, etc. — lib/policy-refresh/frameworks.ts) | — | live |
| /api/compliance-snapshot{,+checkout} | POST,GET | Compliance snapshot report + checkout | — | live |
| /api/risk-snapshot/generate | POST,GET | Risk snapshot product | — | live |
| /api/reserve-report/{generate,webhook} | POST | Reserve-report analyzer (lib/reserve-report.ts) | SUPABASE_SERVICE_KEY | live |
| /api/practice-revenue/{analyze,report/[ref]} | POST,GET | Law-firm revenue leak analysis (lib/practice-revenue/*) | — | live |
| /api/blockchain-report | POST | Blockchain risk report | — | live |
| /api/deals/audit | POST,GET | Deal audit (lib/deal-audit/audit.ts, sha256 chain in lib/audit-chain.ts) | — | live |
| /api/dashboard/auth | POST | Dashboard login | DASHBOARD_PASSWORD | live |
| /api/realestate-intake | POST,GET | Real-estate intake → proxied to OCI deal-router with HMAC | OCI_ROUTER_URL, OCI_ROUTER_LEAD_URL | live |
| /api/oci/optout | GET,POST | OCI opt-out | — | live |
| /api/find/recommend | POST | Product finder (lib/product-finder/routing.ts) | — | live |
| /api/qualify | POST | Lead qualification | — | live |
| /api/jurisdictions/compare | POST | Jurisdiction comparison (marketConfig.ts) | ALPHA_VANTAGE_API_KEY | live |
| /api/markets, /api/market-data | GET | Market data | ALPHA_VANTAGE_API_KEY | live |
| /api/digest, /api/today-brief | GET | Regulatory digest / today's brief | UNKNOWN | live |
| /api/tools/contract-fixer, debt-collection, saas-scanner, website-compliance, obligation-extractor, stablecoin-classifier, wallet-screener, ofac-watcher/watch, ai-policy-generator{,+download} | POST/GET | Interactive compliance tools (SAAS scanner, wallet forensics, policy generator w/ grant) | ANTHROPIC_API_KEY, OPENAI_API_KEY, ETHERSCAN_API_KEY | live |
| /api/affiliates/signup, /api/affiliates/track/[code] | POST/GET | Affiliate program + tracking redirect (lib/affiliate.ts, readAffiliateCode) | BIZLEGAL_AFFILIATE_* | live |
| /api/content/syndicate | POST | Content syndication (lib/social/syndicate.ts) | — | live |
| /api/social/approve/[token] | GET | Social approval review (lib/social.ts, channels.ts) | BUFFER_ACCESS_TOKEN, REDDIT_ACCESS_TOKEN, X_BEARER_TOKEN | live |
| /api/sales/{pipeline,campaigns,drafts} | GET,POST | Sales pipeline/campaigns/drafts | — | live |
| /api/marketing/{trigger,callback} | POST | Marketing automation | — | live |
| /api/kit/download | GET | AI Teammate Kit download (lib/kit/ai-teammate-kit.ts) | — | live |
| /api/boi/subscribe | POST | BOI tracker signup | — | live |
| /api/mica-deadlines/subscribe, /api/mica-readiness | POST | MiCA deadlines + readiness (lib/mica-deadlines.ts) | — | live |
| /api/og/route.tsx | GET | Dynamic OG images | — | live |
| /api/indexnow | POST,GET | IndexNow ping (cron-secured) | INDEXNOW_KEY | **403 live probe (no key)** |
| /api/test/{checklist,payment-flow,payment-zero} | GET/POST | Test endpoints | — | live |
| /api/cron/* (chain/delivery, guide-social, ofac-watch, mica-deadlines, boi/check, billing/charge-due, daily-todo, invoices, social-queue, outbound-dispatch, ops-alerts, smoke, ai-act-monitor) | GET | Cron workers (see cron table) | CRON_SECRET / OPS_DASHBOARD_TOKEN | live |

### Hub crons (vercel.json — 23)

| Path | Schedule (UTC) | Purpose |
|---|---|---|
| /api/cron/billing/charge-due | 0 7 * * * | Charge due recurring bills |
| /api/cron/boi/check | 0 14 * * * | BOI filing deadline checker |
| /api/cron/ops-alerts | */15 * * * * | Ops alert sweep (every 15min) |
| /api/cron/smoke | 0 9 * * * | Smoke test |
| /api/cron/ai-act-monitor | 0 11 * * * | Monitor AI-Act-relevant signals |
| /api/cron/policy-refresh | 0 12 * * * | Policy refresh worker |
| /api/agents/run?task=daily-revenue-digest | 0 8 * * * | Revenue digest agent |
| /api/agents/run?task=daily-vertical-classifier-audit | 30 8 * * * | Vertical classifier audit |
| /api/agents/run?task=daily-content-pick-suggestion | 30 9 * * * | Content pick suggestions |
| /api/agents/run?task=daily-affiliate-followup | 0 10 * * * | Affiliate followup |
| /api/agents/run?task=weekly-mrr-review | 0 9 * * 1 | Weekly MRR review |
| /api/agents/run?task=friday-retrospective | 0 17 * * 5 | Friday retrospective |
| /api/agents/run?task=monthly-vertical-scorecard | 0 9 1 * * | Monthly vertical scorecard |
| /api/cron/affiliate-reconcile | 30 10 * * 5 | Affiliate reconciliation |
| /api/cron/social-queue | */30 * * * * | Social queue dispatch |
| /api/cron/daily-todo | 0 6 * * * | Daily todo |
| /api/cron/invoices | 0 10 * * * | Invoice generation |
| /api/agents/enrich-pages | 0 4 * * 0 | Page enrichment (weekly) |
| /api/newsletter/send | 0 13 * * 1 | Newsletter send |
| /api/cron/guide-social | 30 5 * * * | Guide social posts |
| /api/cron/mica-deadlines | 17 15 * * * | MiCA deadline watch |
| /api/cron/ofac-watch | 23 6 * * * | OFAC list watch (OFAC_LIST_URL, UN_SANCTIONS_URL, EU_SANCTIONS_URL) |
| /api/cron/outbound-dispatch | */30 * * * * | Cold-outbound dispatch engine (lib/outbound/*: icp, campaign, lawful-basis, verify) |

### Hub pages (195) — by area

- **Marketing/SEO**: `/` (home), `/pricing{+,all}`, `/about`, `/contact{+,thank-you}`, `/faq`, `/testimonials`, `/case-studies`, `/trust`, `/privacy`, `/terms`, `/acceptable-use`, `/accessibility`, `/disclaimer`, `/refund`, `/stance`, `/data-sources`, `/methodology`, `/methodology-library`, `/newsletter`, `/snapshot`
- **Products**: `/products`, `/products/intelligence`, `/products/risk-snapshot`, `/blockchain-report`, `/compliance-monitor`, `/compliance-snapshot`, `/risk-engine`, `/reserve-report`, `/psp-risk`, `/mica-readiness`, `/mica-deadlines`, `/mica-regulation-2025`, `/regulatory-clock`, `/scan`, `/triage`, `/checkout`, `/payment/{success,cancelled}`, `/report/[id]`, `/practice-revenue{+,/report/[ref]}`, `/ai-practice-review`, `/digital-asset-risk-analysis`, `/digital-asset-regulatory-intelligence`, `/uae-difc-crypto-regulation`, `/vara-compliance`, `/vara-mvl-license`, `/cross-border-compliance`, `/realestate`, `/marketplace`
- **Agents**: `/agents` + `/agents/{ai-act,ai-governance,boi-tracker,casp-bundle,india-dpdpa,marketplace-shield,policy-refresh}` — agent landing pages w/ metadata; backend rows in `supabase/migrations/20260702_agent_alerts_log.sql` + `..._agent_heartbeats.sql`
- **Guides (94)**: `/guides` + `/guides/[slug]` (~93 indexed guide pages); `/blog` + `/blog/[slug]` (served from `content/blog` mdx via `lib/blog.ts`); `/regulations` + `/regulations/[slug]`; `/use-cases/*` (boi-filing, dpa-review, mica-compliance, soc2-questionnaire)
- **Tools**: `/tools` + `/tools/[slug]` landing, plus named tools: contract-fixer, debt-collection, gdpr-breach-timer, gdpr-fine-estimator, mica-asset-classifier, sai-risk-scanner, token-classifier, vara-licence-finder, website-compliance, wallet-screener, stablecoin-classifier, ai-policy-generator, ofac-watcher, obligation-extractor, fixed-fee-pricing-calculator
- **Education/lead-gen**: `/learn` + `/learn/[track]` + `/learn/[track]/[lesson]` (academy — `lib/academy/tracks.ts` founders + real-estate tracks), `/find` (product finder), `/calculators`, `/templates`, `/docai`, `/forge`, `/brai`, `/tracr`, `/lexaudit`, `/leadforge`, `/kit`
- **Affiliate**: `/affiliates`, `/affiliates/[code]/dashboard`
- **Dashboard**: `/dashboard`, `/dashboard/login`
- **Ops**: `/ops` + /ops/{audit,chain,command,content,health,hetzner,live,main,master,metrics,oci,replay/[trace_id],snapshot,spy,subdomains}
- **Deals**: `/deal/[token]`, `/deals/audit`
- **Misc**: `/about` links, `/payment/paypal/return` (GET route), `/docs`, `/sitemap-index.xml` (200), `/robots.txt` (200)

### Hub lib modules (key mechanisms)

| Module | Exports / role |
|---|---|
| lib/ops/log.ts | re-export of `@bizlegal/ops-log` → HMAC logEvent |
| lib/payments.ts, lib/payments/price-map.ts | PAYMENT_GATEWAYS, BANK_ACCOUNTS, PAYONEER; CHECKOUT_PRICE_MAP, resolveCheckoutPrice |
| lib/payments/*-grant.ts (7) | Post-payment entitlement grants (ai-policy, casp-bundle, conductor, falseecho, ofac-watch, practice, practice-revenue, sellerradar) |
| lib/payments/webhook-idempotency.ts | Dedupe IPNs |
| lib/agents/ea-runner.ts | runEaTask (EA→Anthropic), sendToTelegram |
| lib/agents/chain/{lead-commander,deal-closer,newsletter-engine,types}.ts | Outbound nurturing chain, draftColdPitch, NURTURE_TEMPLATES |
| lib/agents/context-fetcher.ts, prompts.ts | fetchOpsContext, findTask |
| lib/outbound/{icp,campaign,lawful-basis,verify}.ts | ICP schema+parse, campaigns, GDPR lawful basis, suppression verify |
| lib/academy/tracks.ts | TRACKS (founders, real-estate), getTrack/getLesson/freeLessons |
| lib/product-finder/routing.ts | recommend(answers) |
| lib/blog.ts | getAllPosts/getPostBySlug/… (mdx, content/blog) |
| lib/reserve-report.ts | validateReserveInput/analyzeReserve/orderEmailKey/renderReportHtml |
| lib/riskEngine.ts | calculateRisk |
| lib/deal-audit/audit.ts + lib/audit-chain.ts | sha256 + hashRunPayload + writeAuditRun + verifyChain |
| lib/practice-revenue/* | engine.ts (leak analysis), benchmarks, csv, drafts, normalise, pseudonymise |
| lib/policy-refresh/frameworks.ts | Framework matrix for policy refresh |
| lib/firecrawl/scrape.ts | FIRECRAWL_API_KEY scraping |
| lib/social/{channels,syndicate}.ts, social.ts, social-accounts.ts | Buffer/Reddit/X posting + approval |
| lib/stablecoin-classifier.ts, lib/wallet-screener.ts | Tool engines |
| lib/psp-risk/aup-corpus.ts | AUP corpus for PSP risk |
| lib/affiliate.ts | readAffiliateCode |
| lib/librarian.ts | humanScore, extractCitations, packageProduct, validateForPublishing |
| lib/mica-deadlines.ts, lib/mica-readiness.ts | MiCA engines |
| lib/newsletter-{optin,token}.ts, lib/nurture-state.ts | Email state |
| lib/openapi/{registry,trace}.ts | OpenAPI manifest + trace |
| lib/hallucination-guard.ts, lib/gemini.ts, lib/resend.ts, lib/supabase.ts | Cross-cutting |

### Hub integration points (who calls hub)

- All subdomain surfaces log via `POST https://bizlegal-ai.com/api/ops/log` w/ HMAC `BIZLEGAL_INBOUND_SECRET`
- Checkouts via `/api/pay/start`; webhooks → `/api/products/[product]/webhook`
- Leads via `/api/inbound-lead` (blog newsletter) and `/api/leads`
- OCI deal router: `OCI_ROUTER_URL` (router.bizlegal-ai.com, probed 200) via `/api/realestate-intake` + contact
- Outbound: Instantly + suppression; `SELLERRADAR_FULFILL_URL`, `FALSEECHO_FULFILL_URL`, `LEXAUDIT_MONITOR_URL`, `HETZNER_PUBLISHER_HEALTH_URL`, `TRACR_*` self-proxies

---

# DocAI (apps/docai/web)

Canonical contract-risk + compliance surface at docai.bizlegal-ai.com. Next.js 14.2.35 (App Router + legacy `pages/report` hybrid). Root directory `apps/docai/web`. Per app CLAUDE.md the surface stack is: `/free-kb`, `/sqa`, `/dpa`, `/pricing`, `/api/free-kb/ask`, `/api/digest`, `/api/inbound-lead`, `/api/ops/health`. Actual code has grown beyond: 33 API routes, 35 pages.

Deploy: `vercel.docai.json` at monorepo root (outputDirectory `apps/docai/web/.next`); in-app `vercel.json` runs `pnpm turbo build --filter=@bizlegal/docai...` from monorepo root. No crons/scheduled functions anywhere (package.json scripts = dev/build/start only; no `cron` in Vercel configs).

## Routes (33)

Path under `web/app/api/` (all are `route.ts` unless noted).

| Endpoint | Method | Purpose | Env needs | Status |
|---|---|---|---|---|
| `/agents/analyze` | POST | Generic contract risk analysis via `lib/contract-analysis` (Anthropic) | ANTHROPIC_API_KEY (+ANTHROPIC_MODEL) | LIVE, no auth |
| `/agents/draft` | POST | Draft contract from description via `draftContract` | ANTHROPIC_API_KEY | LIVE, no auth |
| `/agents/generate` | POST | Generate contract from template_key + key_terms (`generateContract`) | ANTHROPIC_API_KEY | LIVE, no auth |
| `/agents/review` | POST | Review contract text (`reviewContract`) | ANTHROPIC_API_KEY | LIVE, no auth |
| `/auth/callback` | GET | Supabase OTP magic-link exchange + `ensureProfile`; redirects to /login or /dashboard | NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SITE_URL | LIVE |
| `/auth/login` | POST | Send Supabase magic link (email OTP) | same as callback | LIVE |
| `/auth/session` | GET | Return current session + profile | supabase envs | LIVE |
| `/decision-tree/lead` | POST | Lead capture for the privacy decision tree: validate email+verdict, `enqueueNurture('docai')`, log `lead.qualified`; Turnstile + rate-limit | BIZLEGAL_INBOUND_SECRET (via ops/log HMAC), SUPABASE via nurture | LIVE (comment: Turnstile/origin-allowlist follow-up noted pre-launch) |
| `/digest` | GET | Daily product activity digest for hub aggregator | none | PLACEHOLDER — hardcoded "quiet day" score=0; TODO says not wired to real logs |
| `/documents/scan` | POST | $97-scan core: `analyzeContractDocument` + insert into `contract_scans` + ops log | ANTHROPIC_API_KEY, SUPABASE_SERVICE_KEY | LIVE (no payment gate here; gate is downstream) |
| `/documents/upload` | POST | multipart file → text extraction (mammoth/pdf-parse) + contract-type inference | none | LIVE |
| `/dpa/negotiate` | POST | DPA Negotiator: redline vs your DPA → 3-column delta classification, retrieval over `DPA_CLAUSES` KB | ANTHROPIC_API_KEY | LIVE |
| `/free-kb/ask` | POST | Free SQA demo: 3 q/day/IP in-memory rate limit + Turnstile, seed-KB retrieval + compose, lead capture + nurture enqueue | ANTHROPIC_API_KEY | LIVE |
| `/inbound-lead` | POST, GET | HMAC-verified lead intake (called BY the CF Worker `bizlegal-lead-intake`); `enqueueNurture`; GET returns config probe | BIZLEGAL_INBOUND_SECRET | LIVE (HMAC fail-closed 503 if secret unset) |
| `/ops/health` | GET | Env-presence audit (names only), `?token=` gated, returns 404 on mismatch | OPS_DASHBOARD_TOKEN | LIVE — checks 16 envs |
| `/payment/checkout` | POST | $97 crypto checkout: `createNOWPaymentsInvoice`, writes `nowpayments_order_id`, redirects to `/report?scan_id` (origin-allowlisted) | NOWPAYMENTS_API_KEY, SUPABASE_SERVICE_KEY, NEXT_PUBLIC_SITE_URL | LIVE |
| `/payment/invoice` | POST | Create NOWPayments invoice for an existing scan_id | NOWPAYMENTS_API_KEY, SUPABASE_SERVICE_KEY | LIVE |
| `/payment/paypal/checkout` | POST | $97 PayPal fallback: create scan order (form POST) + redirect | PAYPAL_CLIENT_ID/SECRET, PAYPAL_ENV | LIVE |
| `/payment/paypal/return` | GET | PayPal capture + paid-unlock, redirect `/report?scan_id` | PAYPAL + SUPABASE_SERVICE_KEY | LIVE |
| `/payment/webhook` | POST | NOWPayments IPN webhook: `verifyNOWPaymentsSignature` (HMAC), strict id match, paid-unlock update | NOWPAYMENTS_IPN_SECRET, SUPABASE_SERVICE_KEY | LIVE (fail-closed 503 without secret) |
| `/payments/nowpayments/start` | POST | Generic product/tier NOWPayments checkout start (amount_cents 50..10,000,000) | NOWPAYMENTS_API_KEY, SUPABASE_SERVICE_KEY | LIVE (parallel generic path to /payment/*) |
| `/payments/nowpayments/webhook` | POST | NOWPayments IPN HMAC-SHA512 (sorted JSON) verification + ops log + unlock | NOWPAYMENTS_IPN_SECRET | LIVE |
| `/payments/paypal/start` | POST | Generic product/tier PayPal order create (OAuth token, sandbox/live by PAYPAL_ENV) | PAYPAL_* | LIVE |
| `/payments/paypal/webhook` | POST | PayPal webhook-signature verify | PAYPAL_WEBHOOK_ID (if missing → warn + skip verify in dev only) | LIVE |
| `/review/action` | POST | Approve/reject attorney review on `conductor_reviews`, bumps `conductor_reports` status | Supabase session + `requireTier('team')` | LIVE, auth-gated |
| `/review/flag` | POST | Create review request (`conductor_reviews`) for a report | Supabase session + tier | LIVE, auth-gated |
| `/sqa/draft` | POST | SQA draft (SOC2/CAIQ/SIG/SIG-lite/NIST): seed + Firm KB retrieval + compose + confidence | ANTHROPIC_API_KEY | LIVE |
| `/sqa/kb/delete` | POST | Delete Firm-tier KB item (email-identity paywall `isFirmTierActive`) | SUPABASE | LIVE |
| `/sqa/kb/list` | GET | List Firm-tier KB items (email query param, no session) | SUPABASE | LIVE — email-as-identity design note |
| `/sqa/kb/upload` | POST | Upsert Firm KB items, max 200 (email paywall) | SUPABASE | LIVE |
| `/verticals/ai-act/scan` | POST | EU AI Act scan: auth + tier `scan` limit, `classifyAiSystem`/`analyzeAiActDocument` → `conductor_reports` | ANTHROPIC_API_KEY | LIVE, auth-gated |
| `/verticals/immigration/draft` | POST | Immigration petition draft (I-129-style), auth + tier `draft` limit | ANTHROPIC_API_KEY | LIVE, auth-gated |
| `/verticals/tech-transfer/generate` | POST | Tech-transfer template generation, auth + tier `draft` limit | ANTHROPIC_API_KEY | LIVE, auth-gated |

## Pages (35)

Auth gate: `middleware.ts` (Supabase SSR, edge) redirects `/dashboard/*` → `/login` when no session, `/login` → `/dashboard` when session exists. Matcher: `/dashboard/:path*`, `/login`.

| Path | Purpose | SEO |
|---|---|---|
| `/` (app/page.tsx) | Home | indexed (canonical https://docai.bizlegal-ai.com) |
| `/about` | About | indexed (in sitemap) |
| `/contact` | Contact | indexed (sitemap) |
| `/methodology` | Methodology | indexed (sitemap) |
| `/trust` | Trust | indexed (sitemap) |
| `/pricing` | Pricing (Team $69 / Firm $199) | indexed (sitemap) |
| `/decision-tree` | 60s privacy-exposure screen, email-gated | indexed (sitemap), FAQPage schema |
| `/free-kb` | Free KB Q&A demo → Team funnel | indexed (sitemap) |
| `/sqa` | SOC 2 Questionnaire Assistant | indexed (sitemap) |
| `/dpa` | DPA Negotiator | indexed (sitemap) |
| `/terms` `/privacy` `/refund` `/disclaimer` `/acceptable-use` | Legal pages | indexed (sitemap) |
| `/services` | Services hub | indexed |
| `/services/compliance-ops-retainer` | Retainer landing → hub `/api/pay/start?product=compliance_ops_retainer&amount_cents=250000` | indexed |
| `/login` | Auth (magic link) | indexed (redirects to dashboard when authed) |
| `/dashboard` + 11 children (`/ai-act`, `/contract`, `/contract/dpa`, `/contract/scan`, `/contract/sqa`, `/immigration`, `/reports`, `/review-queue`, `/settings`, `/tech-transfer`, `/upgrade`) | Post-login tooling | NOT noindexed (crawlers redirected to /login; content needs session) |
| `/sqa/kb` | Firm-tier KB manager | **noindex** (only page with robots/noindex) |
| `/payment/success` `/payment/cancelled` | Purchase result landing | indexed |
| `/report` (pages/report/index.tsx, **legacy Pages Router**) | $97 report + payment fallback surface (PayPal error / Payoneer link) | indexed — fetchScanReport reads `contract_scans` |

Legacy `pages/report/[scan_id].tsx` → 302 redirect to `/report?scan_id=`. `robots.ts` allows the AI-crawler family (Google, ClaudeBot, OAI, xAI, etc.), blocks Bytespider/CCBot/Semrush/Ahrefs/etc., disallows `/api/` + `/_next/`. `sitemap.ts` emits 15 URLs, referenced from apex `bizlegal-ai.com/sitemap-index.xml`.

## lib modules (web/lib) — exports (one line each)

- `agent-recommendations.ts` — `getRecommendations(reports)` → agent suggestions from report summaries.
- `anthropic.ts` — `parseJsonFromText`, `callClaudeText`, `callClaudeJson`, `callClaudeStream`; OpenAI chat-completions fallback path (`OPENAI_API_KEY`/`OPENAI_MODEL`).
- `auth.ts` — `createServerClient`, `getSession`, `requireSession`, `getUserProfile`, `ensureProfile` (Supabase SSR + profiles).
- `contract-analysis.ts` — `analyzeContractDocument`, `generateContract`, `reviewContract`, `draftContract`, `enrichAnalyzeResult`; types AnalyzeResult/ReviewResult/DraftResult/GenerateResult.
- `document-catalog.ts` — VERTICALS/DOCS_BY_VERTICAL/BUNDLES catalog; `findTemplateByKey`, `inferDocStackTemplateKey`, `buildDocStackHref`, `inferPartiesFromKeyTerms`.
- `document-upload.ts` — `extractDocumentText(file)` (docx via mammoth, pdf via pdf-parse), `inferContractType`.
- `dpa/dpa-clauses.ts` — `DPA_CLAUSES` knowledge base.
- `legal/conductor-shield.ts` — `buildShield(vertical, consentTimestamp)` liability shield.
- `legal/disclaimer.ts` — `DISCLAIMER_VERSION` (NEXT_PUBLIC_DISCLAIMER_VERSION default v1.0.0-p1), `disclaimerStamp()`.
- `legal/shield-clauses.ts` — `SEVEN_CLAUSES[ShieldClause]`, `DISCLAIMER_FOOTER_LINE`.
- `nurture-enqueue.ts` — re-export of `enqueueNurture` from `@bizlegal/nurture-enqueue`.
- `ops/log.ts` — LOCAL ops logger: `logEvent`, `logEventAsync` → POSTs HMAC-signed event to `OPS_LOG_URL` default `https://bizlegal-ai.com/api/ops/log` (not the shared `@bizlegal/ops-log` package).
- `payments.ts` — `createNOWPaymentsInvoice`, `verifyNOWPaymentsSignature`.
- `paypal-scan.ts` — `createPayPalScanOrder`, `capturePayPalScanOrder`, `getPayPalCaptureId`, `getPayPalScanReference` (scan funnel only).
- `report-data.ts` — `fetchScanReport(scanId)`, `parseStoredAnalysis`, `buildFallbackAnalysis` (report page data layer).
- `sqa/confidence-score.ts` — `computeConfidence`; AUTO_DELIVER_THRESHOLD 0.75, HUMAN_REVIEW_THRESHOLD 0.45.
- `sqa/draft.ts` — `compose(query, context)` → SqaDraft with citations; `serializeDraft`.
- `sqa/firm-kb.ts` — `isFirmTierActive`, `listFirmKb`, `upsertFirmKb`, `deleteFirmKbItem`.
- `sqa/index.ts` — barrel re-exports (retrieval + draft).
- `sqa/knowledge-base.ts` — `InMemoryKnowledgeStore`, `knowledgeStoreFromManifest`; Jurisdiction/US/EU/UK/IN/CA/AU/SG/OTHER.
- `sqa/retrieval.ts` — `retrieve(query, store)`, `RETRIEVAL_MIN_RELEVANCE`.
- `sqa/seed-kb.ts` — `SEED_KB`, `MAX_QUESTION_LEN=4000`, `buildGenerator()`.
- `supabase.ts` — `getSupabase` (anon client), `getSupabaseAdmin` (service key; accepts SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY), lazy `supabase`/`supabaseAdmin`.
- `tier-gate.ts` — `TIER_LIMITS`, `checkTierAccess`, `incrementUsage`, `requireTier`, `resetMonthlyUsage`.
- `verticals/ai-act/*` — `classifyAiSystem`, `analyzeAiActDocument`, `classifyRiskTier(questionnaire)` (unacceptable/high/limited/minimal), AI_ACT_KB.
- `verticals/immigration/*` — `draftImmigrationPetition`, `VISA_TYPES`, `findVisaType`, IMMIGRATION_KB.
- `verticals/tech-transfer/*` — `generateTemplate(input)`, TECH_TRANSFER_KB.

No files in `apps/docai/lib/` (sibling to web/) — that dir holds `brand/` only; no shared lib there.

## Env vars referenced (23; presence-checked in ops/health, see that route for criticality)

`ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `BIZLEGAL_INBOUND_SECRET`, `NEXT_PUBLIC_DISCLAIMER_VERSION`, `NEXT_PUBLIC_GSC_VERIFICATION`, `NEXT_PUBLIC_PAYPAL_SCAN_ENABLED`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NODE_ENV`, `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPS_DASHBOARD_TOKEN`, `OPS_LOG_URL`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV`, `PAYPAL_WEBHOOK_ID`, `SUPABASE_SERVICE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Presence-checked in `/api/ops/health` but NOT referenced in app code: `RESEND_API_KEY`, `OPENAI_EMBEDDING_KEY`. `PAYONEER_DOCAI_LINK` used only by legacy `pages/report`. `NEXT_PUBLIC_PAYPAL_SCAN_ENABLED` is the PayPal feature flag.

## Integration points

- → **Hub** `/api/ops/log`: the spine — local `lib/ops/log.ts` HMAC-SHA256 signs each event with `BIZLEGAL_INBOUND_SECRET` and POSTs to `OPS_LOG_URL` (default `https://bizlegal-ai.com/api/ops/log`). Used by ~12 routes (documents/scan, decision-tree/lead, free-kb/ask, dpa/negotiate, payment/*, payments/*, sqa/draft, sqa/kb/upload, verticals/*).
- → **Hub** `/api/payments/conductor/start`: hardcoded URL in `/dashboard/upgrade`.
- → **Hub** `/api/pay/start?product=compliance_ops_retainer&...`: hardcoded URL in `/services/compliance-ops-retainer`.
- ← **CF Worker** `services/worker` (bizlegal-lead-intake): POSTs to `/api/inbound-lead` with `x-bizlegal-signature` HMAC.
- **Nurture**: `enqueueNurture('docai')` writes `lead_nurture_state` (shared Supabase, schema 20260505) → CF Worker runs 4-step welcome cadence; used by decision-tree/lead, free-kb/ask, inbound-lead.
- **External services**: Anthropic API (all LLM), OpenAI API (fallback path in lib/anthropic), NOWPayments API + IPN, PayPal REST (orders/capture/webhook-verify), Supabase (`contract_scans`, `conductor_reports`, `conductor_reviews`, `lead_nurture_state`, profiles, firm KB), Cloudflare Turnstile (`@bizlegal/turnstile-verify`/`-widget`).
- **Shared packages**: `@bizlegal/themes` (SiteShell + FOUC), `@bizlegal/turnstile-verify`, `@bizlegal/turnstile-widget`, `@bizlegal/rate-limit` (in-memory per-instance), `@bizlegal/nurture-enqueue`.
- **Same-app**: `pages/report` (Pages Router) is the payment redirect landing for both /payment/checkout and /payment/paypal/return.

## Notes / potential issues

- **Duplicate payment paths**: `payment/*` ($97 scan funnel) and `payments/*` (generic product/tier checkout, uses lib/payments + lib/paypal-scan) coexist; both live.
- **Dead config**: `next.config.mjs` transpiles `@bizlegal/payment` and `@bizlegal/ops-log`, but neither package is imported anywhere in app code (DocAI has its own `lib/ops/log.ts` and `lib/payments.ts`).
- **/api/digest** is a hardcoded placeholder (score=0 always) — aggregator-facing, not wired to contract/SQA logs (self-documented TODO).
- **/sqa/kb/** and `isFirmTierActive` use email as identity (no session token) — an emailed firm tier check is a weak auth boundary.
- PayPal webhook verification is skipped with a warning when `PAYPAL_WEBHOOK_ID` is missing (dev-only tolerance shipped to prod).
- Dashboard pages are auth-gated but not `noindex`ed (only `/sqa/kb` is).
- `robots.ts` blocks AhrefsBot and SemrushBot outright (SEO-data tradeoff decision).
- No crons/scheduled functions on this app.

## Summary of counts
- Routes: 33 (all POST/GET; no PATCH/DELETE).
- Pages: 35 App Router + 2 legacy Pages Router (`/report`, `/report/[scan_id]`).
- lib modules: 30 files under web/lib (33 exports summarized). apps/docai/lib = brand assets only.
- Env vars referenced: 23 names; 25 presence-checked in ops/health.

---

# Forge (apps/forge)

**Surface:** forge.bizlegal-ai.com — LIVE revenue subdomain. Products: State Transparency Report Kit ($149), Regulatory Passport ($297), compliance scanner ($97/vertical), gap-page lead magnets. Own subtree with nested `apps/web/` (Next.js 14 app router). Vercel Root Directory = `apps/forge/apps/web`.

**Key finding:** No `/scan` page exists despite CLAUDE.md/`/api/ops/health` docs — the scanner UI is **`/audit`** (posts `/api/scan`). `/boi` reuses `/api/scan` with `vertical=boi`. Docs stale vs code.

---

## Routes (`apps/web/app/api/`) — 19 files

| Path | Method | Purpose |
|---|---|---|
| `/api/scan` | POST | Free scan: Turnstile → rate-limit → Supabase `scans` insert → Apify actor scan OR mock → `runModule` (Claude JSON) → save preview (first 2 findings behind paywall) → enqueue nurture (`forge:free-scan`) + `lead.qualified` ops event. Zod schema, 11 verticals. |
| `/api/scan/checkout` | POST | Returns payment options for a scan: NOWPayments invoice via `@bizlegal/payment` + static Payoneer link. Per-vertical price map (crypto/card). |
| `/api/scan/report` | POST | Internal (x-internal-secret, `INTERNAL_API_SECRET`??`INTERNAL_SECRET`): generates full report (Claude), uploads to Supabase Storage `reports/scans/<id>/report.md`, sets `fix_delivered`, emails buyer via Resend. Called by webhook. |
| `/api/payment/crypto` | POST | NOWPayments invoice for passport or scan via `@bizlegal/payment` (per-vertical/`PRICES.local`). IPN URL = `/api/payment/webhook`. |
| `/api/payment/webhook` | POST | NOWPayments IPN. **Fail-closed**: 503 if `NOWPAYMENTS_IPN_SECRET` unset; HMAC-SHA512 (sorted keys). Dispatches: `passport_*` → mark paid + fire `/api/passport/process`; `scan_*` → mark paid + fire `/api/scan/report`; `boi_*` → idempotent claim (status=pending guard) → fire `/api/boi-order`. Logs `payment.confirmed`/`webhook.received`. |
| `/api/payment/status` | GET | Poll payment status for scan or passport by `reference_id`+`reference_type`. |
| `/api/boi-order` | POST | Internal (x-internal-secret). Inserts `boi_orders` (idempotent on `nowpayments_payment_id`), emails order confirmation via Resend, Telegram alert, logs `payment.confirmed` ($149). |
| `/api/passport` | POST | Passport intake form → insert `passport_assessments` (status=queued, pending) → NOWPayments invoice + Payoneer link back. |
| `/api/passport/process` | POST | Internal. Gate paid → Claude `runPassportAssessment` → HTML report via `generateAndUploadPassportReport` → Supabase update → Resend delivery. |
| `/api/inbound-lead` | POST+GET | HMAC-SHA256 verified ingress (x-bizlegal-signature vs `BIZLEGAL_INBOUND_SECRET`) from EA Worker classifier; product must be `forge`; logs `lead.inbound` + enqueue nurture. GET = configured? probe. |
| `/api/decision-tree/lead` | POST | BOI decision-tree capture: rate-limit → Turnstile → `leads` upsert → nurture (vertical=boi, `forge-decision-tree-boi-<email>`) → `lead.qualified`. Verdict allow-list. |
| `/api/lead-magnet` | POST | Gap-page email capture: rate-limit → formData → `leads` upsert → Resend magnet (C-2 fix: server-side allow-list `SAFE_LEAD_MAGNET_URLS`, never user URL) → Telegram → redirect `/thank-you`. |
| `/api/newsletter` | POST | `newsletter_subscribers` upsert + Resend welcome. |
| `/api/surplus/qualify` | POST | Surplus-funds case intake → `qualified_cases` insert → Claude `qualifyCase('surplus_funds')` → if qualified assign to matching attorney in `executors` (state+specialty). |
| `/api/scout` | POST | Keyed by `x-api-key` === `INTERNAL_API_SECRET` (no fallback). Upserts `gap_pages` from curator (W3.2 enrichment fields: category/tags/faqs/E-E-A-T). Returns gap page URL. |
| `/api/digest` | GET | Hub-facing daily product activity feed. **Stub** — hardcoded quiet-day payload, real scan-completion store not wired (TODO in code). s-maxage=300. |
| `/api/ops/health` | GET | Token-gated (`OPS_DASHBOARD_TOKEN`, timingSafeEq, 404 on mismatch) env-presence audit. 10 keys, critical list. Aggregated by hub `/ops/health`. |

**No cron / scheduled functions** — both `vercel.json` files (root + app) contain no `crons` field. No `api/cron/*` routes.

---

## Pages (`apps/web/app/`) — 28 files

| Path | Purpose | SEO |
|---|---|---|
| `/` (`page.tsx`) | Home / product landing (Phase D8 "Direction C v2", framer-motion) | metadataBase forge, index:true/follow:true globally |
| `/audit` | **Free compliance scanner UI** — 10 verticals, posts `/api/scan` then `/api/scan/checkout` | — |
| `/audit/success` | Post-scan-checkout success + payment poll | — |
| `/boi` | State Transparency Kit intake (posts `/api/scan` with vertical=boi) | — |
| `/boi/success` | Order confirmed + **cross-sell to hub `/agents/boi-tracker`** (invariant #2) | metadata "Order Confirmed" |
| `/campaign/boi` | Ad campaign landing (LLC transparency act) | — |
| `/campaign/passport` | Ad campaign landing (Regulatory Passport) | — |
| `/decision-tree` | BOI duty screen (4–5 questions) → `/api/decision-tree/lead` | metadata + likely openGraph |
| `/gap` | Gap monitor index ("coming soon") | metadata |
| `/gap/[jurisdiction]/[slug]` | SEO gap pages generated from `gap_pages` (dynamic, service-role). Cross-domain CTAs with UTM params (`utm_source=forge_gap`); cross-sell to tracr/brai/docai/lexaudit/leadforge + forge. `generateMetadata`. | dynamic metadata title/desc |
| `/passport` | Regulatory Passport ($297) intake → `/api/passport` | — |
| `/passport/success` | Post-payment success + poll | — |
| `/passport/cancel` | Cancelled | — |
| `/payment/cancelled` | Generic payment cancelled | — |
| `/payment/processed` | Payment processed/pending | — |
| `/pricing` | Pricing (kit $149, passport $297, scan $99) | metadata |
| `/surplus` | Surplus funds intake → `/api/surplus/qualify` | — |
| `/thank-you` | Magnet-sent confirmation | metadata |
| `/terms`, `/privacy`, `/refund`, `/disclaimer`, `/acceptable-use`, `/faq` | Legal/liability pages (shield clauses) | — (indexed; robots.ts blocks only `/api/`, `/_next/`) |

**Robots/GEO:** `app/robots.ts` — allowlist 38 AI/search bots (incl. ClaudeBot, OAI-SearchBot, GPTBot), blocklist Bytespider/CCBot/Diffbot/Semrush/Ahrefs/MJ12; crawlDelay 1; sitemap `/sitemap.xml`. `/robots.txt` + JSON-LD (`structured-data.tsx`: Organization/WebSite/SoftwareApplication). `NEXT_PUBLIC_GSC_VERIFICATION` renders GSC meta when set. `.env*` URLs 404 via next.config rewrites.

---

## Lib / Modules

**Modules (`apps/forge/modules/`)**: pure data — **7 config.json files only** (no code, **no OCI Deal Router** present):
`boi` (CTA report filer, $149), `cipa` (§631 scanner, $999/monitor $199), `iso27001` (readiness, $999), `passport-uk` (UK FCA passport, $1500), `sms` (10DLC, $149), `surplus` (surplus funds case flow, $800), `tdpsa` (Texas DP Act, $299). Each: statute, detection_type (web_scan/intake_form/case_intake), ICP, detection_signals, high_risk_domains, fix_deliverables, enforcement_cases.

**`apps/web/lib/` (1290 lines total):**
- `claude/index.ts` (624) — lazy Anthropic client (build-safe). 14 prompt modules (`VERB_PROMPTS`): noncompete, phantom_1099, surplus_funds, gdpr, boi, sms, tdpsa, cipa, gpc, mhmda, iso27001, gipa, edtech, surplus. Exports `runModule`/`runPassportAssessment`/`qualifyCase`/`generateReport` — all call `claude-opus-4-5(20241120)`, strict JSON, max_tokens 1024–4096.
- `payments/index.ts` (26) — `PRICES` (scan $97/$119, passport $297/$347, boi $149) + `getPayoneerLink`. NOWPayments creation intentionally NOT here (pushed to `@bizlegal/payment`).
- `resend/index.ts` (112) — `sendScanDelivery`, `sendPassportDelivery`.
- `fulfillment/passport-pdf.ts` (138) — `generateAndUploadPassportReport` (HTML→Supabase Storage).
- `supabase/server.ts` — service-role client (bypasses RLS, server-only).
- `ops/log.ts` (93) — `logEventAsync` HMAC-SHA256 POST to hub `/api/ops/log` (`OPS_LOG_URL` default); silently no-ops without secret.
- `nurture-enqueue.ts` (11) — re-export of `@bizlegal/nurture-enqueue`.
- `rate-limit.ts` (55) — Upstash sliding-window, per-prefix cached; **null = bypass** when envs missing.
- `stripe/index.ts` (12) — **DEPRECATED** stub (Stripe replaced by PayPal+ETH).
- `legal/shield-clauses.ts`, `legal/disclaimer.ts` — liability text.
- `types/gap-page.ts` (124) — GapPage type + `gapPageUrl`/`isFaqEntry`.

**components/**: `AuthorBio`, `DecisionTree`, `MermaidDiagram`, `TurnstileWidget`, `layout/`. Uses `@bizlegal/themes` shell, `@radix-ui`, `framer-motion`, `lucide-react`.

**Scripts:** `scripts/seed.js` (gap-page seeder). `infra/`: `HEARTBEAT.md`, `schema.sql`, `gap_pages_table.sql`, `n8n/`, `supabase/`, `site-config.ts` (vertical-replication template, unused by app).

---

## Env vars referenced (names only)

`ANTHROPIC_API_KEY`, `APIFY_TOKEN`, `APIFY_ACTOR_<VERTICAL>` (dynamic), `BIZLEGAL_INBOUND_SECRET`, `INTERNAL_API_SECRET`/`INTERNAL_SECRET` (legacy alias), `NEXT_PUBLIC_DISCLAIMER_VERSION`, `NEXT_PUBLIC_GSC_VERIFICATION`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NOWPAYMENTS_IPN_SECRET`, `NOWPAYMENTS_API_KEY` (via `@bizlegal/payment`), `OPS_DASHBOARD_TOKEN`, `OPS_LOG_URL`, `PAYONEER_PASSPORT_LINK`, `PAYONEER_SCAN_LINK`, `RESEND_API_KEY`, `RESEND_FROM`, `STRIPE_SECRET_KEY` (deprecated), `SUPABASE_SERVICE_KEY`/`SUPABASE_SERVICE_ROLE_KEY` (aliases), `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `UPSTASH_REDIS_REST_TOKEN`, `UPSTASH_REDIS_REST_URL`, `TURNSTILE_SECRET_KEY` (in `@bizlegal/turnstile-verify`), `PAYPAL_CLIENT_ID`/`PAYPAL_CLIENT_SECRET` (checked by `/api/ops/health` contract only — live routes use NOWPayments).

---

## Integration points

- **Hub `/api/ops/log`** — every payment/lead event via `lib/ops/log` (HMAC-SHA256, `BIZLEGAL_INBOUND_SECRET`).
- **Hub `/ops/health`** — aggregates Forge `/api/ops/health`.
- **Hub `/agents/boi-tracker`** — cross-sell from `/boi/success` (conversion bridge).
- **EA Worker classifier** → `/api/inbound-lead` (HMAC-SHA256).
- **`@bizlegal/nurture-enqueue`** — decision-tree, scan, inbound-lead all enqueue nurture (worker = separate delivery).
- **`@bizlegal/payment`** — shared NOWPayments invoice client (scan/passport crypto).
- **`@bizlegal/rate-limit`** (Upstash), **`@bizlegal/turnstile-verify/widget`**, **`@bizlegal/themes`**, **`@bizlegal/ops-log`**.
- **Hetzner curator** (`services/hetzner`) → `/api/scout` populates `gap_pages`; CLAUDE.md claims content MDX dual-deploy to `apps/web/content/blog/{slug}.mdx` but **no `content/` dir exists** (stale invariant).
- **External:** Resend (transactional email), Telegram bot alerts, NOWPayments IPN, Apify actors (scan data), Anthropic Claude (analysis), Supabase (DB + Storage `reports` bucket).

---

## Notable mechanisms

1. **Fail-closed payments** — webhook 503s without IPN secret; HMAC-SHA512 sorted-key verification; idempotent claim gate (`payment_status='pending'`) prevents double-fulfillment.
2. **Internal fulfillment chain** — webhook → internal `/api/scan/report`|`/api/passport/process`|`/api/boi-order`, all guarded by `INTERNAL_API_SECRET` (dual-name alias).
3. **Paywall preview** — `/api/scan` returns first 2 findings only; full report only generated post-paid.
4. **C-2 phishing-relay fix** — `/api/lead-magnet` derives magnet URL from server-side slug allow-list.
5. **Vertical replication via JSON config** — 7 modules pure config; Claude prompt engines keyed off same IDs.
6. **Stale docs flagged** — `/scan` page doesn't exist (it's `/audit`); curator MDX path dead; `/api/digest` is a stub; PayPal checked as critical env but smart buttons not integrated.

---

# LexAudit (apps/lexaudit)

**Surface:** `lexaudit.bizlegal-ai.com` — Next.js 14.2.5 (App Router) + Tailwind + Supabase + Vercel.
**Identity:** Compliance Health Score (per-firm AI-use audit trail, certificates $24 crypto / $29 card) + Compliance Monitor ($99/mo, 7-framework source-diff alerts). Also hosts 4 marketing conversion funnels (free-scan, decision-tree, health-score, matter/certificate).
**Deploy:** Vercel project `lexaudit`, Root Directory `apps/lexaudit`, pnpm turbo build via monorepo. Cron via `vercel.json`.
**Auth-gated:** `/login`, `/dashboard`, `/matter/[id]`, `/certificate/[id]` (Supabase Auth client-side; RLS server-side).

---

## 1 — API routes (`app/api/**/route.ts`) — 16 route files, 18 handlers

All are `force-dynamic`. Payment/cert webhook paths hardcode prod IPN base `https://lexaudit.bizlegal-ai.com`.

| Route | Method(s) | Purpose |
|---|---|---|
| `/api/free-scan` | POST | Free 10-check signal scan (FREE_SCAN_CHECKS subset). IP rate-limit (5/min) + Turnstile → deterministic scorer → trimmed result (overall%, posture band, framework aggregates, gap counts). Never returns per-signal detail. Enqueues nurture `vertical=lexaudit`, emits `lead.qualified`. |
| `/api/generate-certificate` | POST | Old inline cert-rationale generator (pre-webhook path). Redacts PII (`lib/safe/redact`), calls Anthropic Sonnet (model `claude-sonnet-4-20250514`, max 500 tokens), returns rationale + `certId`; graceful fallback text on failure. Does NOT persist payment. |
| `/api/inbound-lead` | POST + GET | POST: HMAC-SHA256 verified (`x-bizlegal-signature`, `BIZLEGAL_INBOUND_SECRET`), product gate `lexaudit`, then `enqueueNurture` fire-and-forget. 503 if secret unset. GET: presence probe. TODO in code: no Supabase persistence of the lead. |
| `/api/monitor/check` | GET + POST | Framework-index snapshots feed for hub `/compliance-monitor`: last snapshot + 7-day change count per framework from `compliance_framework_index`. GET: public (source URLs + SHA-256 hashes only). POST: HMAC-signed inter-service variant. `maxDuration 30`. |
| `/api/ops/health` | GET | Token-gated (`OPS_DASHBOARD_TOKEN`, 404 on mismatch) env-name+presence audit of 11 envs. Consumed by hub `/api/ops/health` fleet matrix. `maxDuration 15`. |
| `/api/digest` | GET | Daily product-digest feed (06:00 UTC, fetched by bizlegal-lead-intake Worker) for hub "Today's Brief". Real counters from `compliance_subs` (active) + `compliance_framework_index` (24h changes); quiet-day placeholder, never fabricates. Cache `s-maxage=300`. |
| `/api/payments/paypal/start` | POST | Generic PayPal checkout: inserts `payment_orders` (gateway=paypal), then one-time Orders API OR recurring Subscriptions API (`PAYPAL_PLAN_ID_{PRODUCT}_{TIER}_{INTERVAL}`; 503 graceful if plan unset). Emits `payment.intent`. `maxDuration 30`. |
| `/api/payments/paypal/webhook` | POST | PayPal webhook: verify-webhook-signature (skipped if `PAYPAL_WEBHOOK_ID` unset and non-prod — **in prod, missing webhook id → 401 reject**). Maps event→status on `payment_orders` (active/past_due/cancelled/expired/refunded). Emits payment events. `maxDuration 30`. |
| `/api/payments/nowpayments/start` | POST | Generic NOWPayments invoice checkout: inserts `payment_orders`, amount range check ($0.50–$100,000), creates invoice with IPN pinned to prod. Emits `payment.intent`. `maxDuration 30`. |
| `/api/payments/nowpayments/webhook` | POST | IPN HMAC-SHA512 (`x-nowpayments-sig`, `NOWPAYMENTS_IPN_SECRET`; **fail-closed — 503 if secret unset**). Updates `payment_orders`, and on activation upserts `compliance_subs` (6 frameworks, channel email, next_charge_at ±30/365d). Emits payment events. `maxDuration 30`. |
| `/api/decision-tree/lead` | POST | Compliance Monitor decision-tree lead capture: valid verdict set incl. `home_capture` sentinel; rate-limit 10/min + Turnstile → nurture enqueue + `lead.qualified`. |
| `/api/health-score/lead` | POST | 40-question health-score lead capture: rate-limit 10/min + Turnstile → nurture enqueue + `lead.qualified` (score_pct/label/category_scores). |
| `/api/certificates/pay` | POST | **Certificate payment intent creator** (canonical cert funnel): requires `matter_id` + `form.lawyer/prompt`; inserts `cert_payment_intents` (order_id=`{matter_id}-{ts}`, pre-gen certId `LA-XXXXXX`). NOWPayments invoice ($24, usdtbsc) → `ipn_callback_url=/api/certificates/webhook`; or PayPal Orders ($29) → `return_url=/api/certificates/paypal/capture`. |
| `/api/certificates/webhook` | POST | NOWPayments IPN for certs: HMAC-SHA512 verify (secret+header present → verify, else skips — NOT fail-closed), only `finished`/`confirmed` proceed, idempotent on intent `payment_status=paid`. Calls `generateCertificateFromIntent` (Sonnet rationale → `certificates` insert → matter `attested` → cert intent `paid` → Resend cert-ready email). `maxDuration 60`. |
| `/api/certificates/paypal/capture` | GET | PayPal return-url handler: captures order via `{paypal}/v2/checkout/orders/{token}/capture`, COMPLETED → `generateCertificateFromIntent`, redirects to `/certificate/{certId}`. Error → redirect `/ ?error=...`. `maxDuration 60`. |
| `/api/cron/monitor/diff` | GET | **Vercel cron `0 6 * * *`** (Bearer `CRON_SECRET`). Scrapes 6 canonical regulator sources (SOC2, ISO27001, GDPR, HIPAA, DPDP, NIST 800-53). Firecrawl markdown → SHA-256 preferred, raw-HTML hash fallback. Inserts `compliance_framework_index` snapshot every run (audit trail). Sonnet semantic-diff (`summariseChange`) suppresses cosmetic-only notifications. Emails active `compliance_subs` subscribers via Resend (source/intelligence domain default); no-op if `RESEND_API_KEY` unset. Emits `framework.changed`, `cron.completed`. `maxDuration 60`. |

**Notable:** two payment stacks coexist — generic `/api/payments/*` (hub-style `payment_orders`) and cert-specific `/api/certificates/*` (`cert_payment_intents`). Certificates carry **no expiry/renewal**; `compliance_subs` provisioning exists only in the generic NOWPayments webhook, not the cert stack.

---

## 2 — Pages (`app/**/page.tsx`) — 19 pages

### Public marketing / conversion (15)

| Route | Purpose | SEO / noindex |
|---|---|---|
| `/` | Landing (client component; `landing-content.tsx` content) | Indexed, canonical `/` |
| `/free-scan` | Free Compliance Scan — 10-point signal check (FreeScan.tsx) | `force-static`, indexed, sitemap 0.95 |
| `/decision-tree` | Compliance Monitoring Decision Tree (ComplianceMonitorDecisionTree.tsx) | `force-static`, indexed, sitemap 0.95 |
| `/compliance-health-score` | 40-question self-assessment (ComplianceHealthScore.tsx), email-gated breakdown | `force-static`, indexed, sitemap (not listed — 0.95 class) |
| `/pricing` | Pricing tiers: Solo $49/mo, Boutique $199/mo, Mid-Market $599/mo | `force-dynamic`, indexed, sitemap 0.9 |
| `/about` | About page | indexed, 0.7 |
| `/contact` | Contact | indexed, 0.7 |
| `/methodology` | Methodology (has JSON-LD schema.org) | indexed, 0.7 |
| `/security` | Security & privacy claims (PII redaction, RLS, no doc storage). **No `metadata` export** — inherits root metadata | indexed, 0.7 |
| `/trust` | Trust page | indexed, 0.7 |
| `/terms` | Terms | indexed, 0.4 |
| `/privacy` | Privacy | indexed, 0.4 |
| `/refund` | Refunds (subscriptions cancellable; certs non-refundable once produced) | indexed, 0.3 |
| `/disclaimer` | Disclaimer | indexed, 0.3 |
| `/acceptable-use` | Acceptable Use | indexed, 0.3 |

### Auth-gated app (4)

| Route | Purpose | SEO |
|---|---|---|
| `/login` | Supabase auth (login/signup) | No noindex in code — blocked for crawlers via `robots.ts` PRIVATE |
| `/dashboard` | Matter list; create matter (AI_TOOLS list: Harvey/Legora/ChatGPT/Co-Pilot/CoCounsel/Other); checks `hasActiveSub` | robots PRIVATE |
| `/matter/[id]` | AI log + step wizard + cert generation + payment options | robots PRIVATE |
| `/certificate/[id]` | Printable/tamper-evident certificate (fetches `certificates` via browser client) | robots PRIVATE |

**SEO mechanism:** no `noindex` meta anywhere in code. Exclusion is via `app/robots.ts`: `/api/`, `/_next/`, `/dashboard`, `/login`, `/matter/`, `/certificate/` disallowed for all crawlers + a blocklist (Bytespider, CCBot, AhrefsBot, SemrushBot, etc.) and allowlist (Google/Bing/GPTBot/ClaudeBot/Perplexity/xAI/Grok etc.). Sitemap covers the 15 public routes; referenced from apex `bizlegal-ai.com/sitemap-index.xml`. Root layout: GSC verification via `NEXT_PUBLIC_GSC_VERIFICATION`, Plausible snippet gated on `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, theme FOUC script, CookieConsent, LegalShield, StructuredData.

---

## 3 — Build / schedule

**package.json** (`@bizlegal/lexaudit` 0.1.0): scripts `dev` / `build` (`next build`) / `start`. Deps: `next@14.2.5`, `@supabase/supabase-js`, `@supabase/ssr`, `@anthropic-ai/sdk`, `crypto`, `lucide-react`, plus workspace pkgs `@bizlegal/nurture-enqueue`, `@bizlegal/rate-limit`, `@bizlegal/themes`, `@bizlegal/turnstile-verify`, `@bizlegal/turnstile-widget`, `@bizlegal/ops-log`, `@bizlegal/payment`.

**vercel.json**: framework nextjs; functions maxDuration 60 (`cron/monitor/diff`) and 30 (`monitor/check`); **cron**: `/api/cron/monitor/diff` on `0 6 * * *` (daily 06:00 UTC). No other scheduled functions.

---

## 4 — lib/ modules & exports

| Module | Exports | Notes |
|---|---|---|
| `lib/supabase.ts` | `createClient()` | Browser Supabase client (`NEXT_PUBLIC_*` anon) — used by dashboard/matter/cert pages |
| `lib/supabase-server.ts` | `createServerSupabase()` | Server client (`NEXT_PUBLIC_*` anon; cert webhooks) |
| `lib/nurture-enqueue.ts` | re-export `enqueueNurture`, type | From `@bizlegal/nurture-enqueue` |
| `lib/ops/log.ts` | `logEvent`, `logEventAsync`, types `OpsEventType`/`OpsSource` | HMAC-SHA256 POST to hub `/api/ops/log` (`OPS_LOG_URL` default `https://bizlegal-ai.com/api/ops/log`); swallows failures |
| `lib/cert/generate.ts` | `generateCertificateFromIntent` (+ interfaces) | Shared by both cert webhooks: Sonnet rationale (redacted) → `certificates` insert → matter `attested` → intent `paid` → Resend cert-ready email → `cert.released`/`email.sent` events |
| `lib/safe/redact.ts` | `redactPii`, `redactFields`, `summariseRedaction` | PII categories incl. email, SSN, EIN, phone, CC, IBAN, Aadhaar, EU national IDs, postcodes, IPv4 → `[PII:X]` tokens |
| `lib/email/index.ts` / `resend.ts` | `sendEmail`, `certReadyHtml` | Resend REST (no SDK); default from `intelligence@intelligence.bizlegal-ai.com`, reply `team@bizlegal-ai.com` |
| `lib/firecrawl/scrape.ts` | `isConfigured`, `scrapeMarkdown`, `summariseChange` | Firecrawl base `FIRECRAWL_BASE_URL` default api.firecrawl.dev; Sonnet model `ANTHROPIC_MODEL` default `claude-sonnet-4-6` |
| `lib/legal/disclaimer.ts` | `DISCLAIMER_VERSION`, `disclaimerStamp()` | `NEXT_PUBLIC_DISCLAIMER_VERSION` default `v1.0.0-p1`; email footer uses plain `DISCLAIMER_VERSION` default `v1.0.0-p4` (split defaults) |
| `lib/legal/shield-clauses.ts` | `SEVEN_CLAUSES`, `DISCLAIMER_FOOTER_LINE` | Liability-shield boilerplate |
| `lib/health-score/signals.ts` | `SIGNALS`, `signalsByFramework`, `signalById`, `FRAMEWORK_LABELS`, types | 5 frameworks in registry (soc2, iso27001, gdpr, hipaa, dpdp) — **NIST 800-53 has NO registry signals** (`signalCountFor` returns 0) despite cron tracking it |
| `lib/health-score/weights.ts` | `signalWeight`, `statusScore`, `scoreFramework`, `scoreOverall`, types | deterministic engine |
| `lib/health-score/report.ts` | `generateReport` (requires `reviewerSignoff`), `postureSummary`, `reportHeader`, `serializeReport` | Full report gated behind reviewer sign-off |
| `lib/health-score/free-scan.ts` | `FREE_SCAN_CHECKS` (10), `FREE_SCAN_FRAMEWORKS`, `isFreeScanSignalId` | Free tier subset |
| `lib/brand/` | `TEMPLATE` ('white'), `bizlegalPurple`/`bizlegalWhite` presets+tokens | Theme tokens |
| `components/` | `ComplianceHealthScore.tsx`, `ComplianceMonitorDecisionTree.tsx`, `FreeScan.tsx`, `TurnstileWidget.tsx`, `conversion/*` (LeadMagnetForm, DataStat, MethodologyBadge, ScarcityBanner), `layout/*` (LegalPage, LegalShield) | Conversion components |

---

## 5 — Env var names referenced (`process.env.*`)

Critical (fail-closed / required): `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (alias `SUPABASE_SERVICE_ROLE_KEY`), `BIZLEGAL_INBOUND_SECRET`, `OPS_DASHBOARD_TOKEN`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`, `CRON_SECRET`.

Gateway (optional / fallback): `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV` (sandbox/live), `PAYPAL_API_URL`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_PLAN_ID_{PRODUCT}_{TIER}_{INTERVAL}` (dynamic).

Other: `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_GSC_VERIFICATION`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `NEXT_PUBLIC_DISCLAIMER_VERSION`, `DISCLAIMER_VERSION`, `FIRECRAWL_API_KEY`, `FIRECRAWL_BASE_URL`, `ANTHROPIC_MODEL`, `OPS_LOG_URL`, `RESEND_FROM_EMAIL`, `RESEND_REPLY_TO`, `NODE_ENV`.

(Values never printed — presence only.)

---

## 6 — Integration points

| Direction | Mechanism |
|---|---|
| Hub ops spine | `lib/ops/log.ts` → HMAC-SHA256 POST `https://bizlegal-ai.com/api/ops/log` (event types emitted: `lead.qualified`, `payment.intent`, `payment.confirmed/failed/refunded`, `subscription.cancelled`, `email.sent`, `cert.released`, `framework.changed`, `cron.completed`) |
| Hub fleet health | `/api/ops/health` consumed by hub `/api/ops/health` → `/ops/health` env matrix |
| Hub `/compliance-monitor` | `/api/monitor/check` (GET public / POST HMAC) feeds live change feed |
| Hub daily digest | `/api/digest` polled 06:00 UTC by `bizlegal-lead-intake.bizlegal-ai.workers.dev` |
| Inbound leads | `/api/inbound-lead` from hub EA Worker after vertical classification (HMAC) |
| Nurture | `@bizlegal/nurture-enqueue` → `lead_nurture_state` (vertical=lexaudit) from free-scan / decision-tree / health-score / inbound-lead |
| Payments | NOWPayments invoices+IPN (crypto $24 cert, generic orders) and PayPal Orders/Subscriptions+webhook (card $29 cert) → `payment_orders`, `cert_payment_intents`, `compliance_subs`, `certificates` |
| Cron | Vercel cron `0 6 * * *` → `/api/cron/monitor/diff` (Bearer CRON_SECRET) |
| Email | Resend REST — cert-ready (customers) + monitor change alerts (subscribers) |
| Cloudflare Turnstile | `@bizlegal/turnstile-verify` server-side + widget on all 4 funnel leads (skip-if-unconfigured) |
| Rate limit | `@bizlegal/rate-limit` Redis-backed (5/min free-scan, 10/min decision-tree & health-score) |

**DB tables referenced (Supabase):** `payment_orders`, `cert_payment_intents`, `certificates`, `matters`, `compliance_subs`, `compliance_framework_index`, `lead_nurture_state` (via pkg). Migrations: `apps/lexaudit/supabase/migrations/20260429_compliance_subs.sql`, `20260430_compliance_extracted_content.sql`; root `apps/lexaudit/supabase-cert-payments.sql` (cert stack). **UNKNOWN:** live migration-application state on prod DB.

---

## 7 — Notable / broken

1. **BROKEN: generic payment return/success/cancel pages do not exist.** `/api/payments/paypal/start` returns `return_url=${baseUrl}/payment/paypal/return` and `/payment/cancelled`; `/api/payments/nowpayments/start` returns `/payment/success` and `/payment/cancelled`. **There is no `app/payment/` directory** — those URLs 404 on the live surface. The cert stack (`/api/certificates/pay`) routes correctly (success→`/certificate/:id`).
2. **Inconsistent IPN verify semantics:** cert webhook (`/api/certificates/webhook`) *skips* HMAC when secret/header missing; generic NOWPayments webhook is fail-closed (503). PayPal webhook skips verification in dev only, 401 in prod without `PAYPAL_WEBHOOK_ID`.
3. **NIST 800-53 tracked in cron but NOT in the LexAudit signals registry** — `signalCountFor('nist-800-53')` returns 0, `affected_signal_ids` empty.
4. `security/page.tsx` has **no route metadata** (others do) — inherits root metadata (acceptable but inconsistent).
5. Duplicate env-name defaults: `DISCLAIMER_VERSION` default `v1.0.0-p4` (email) vs `NEXT_PUBLIC_DISCLAIMER_VERSION` default `v1.0.0-p1` (lib) — same concept, two envs, two defaults.
6. `generateCertificateFromIntent` writes `email_sent`/`email_error` + emits ops events but returns ok even when email fails (non-fatal by design).
7. `/api/generate-certificate` (legacy inline generator) is still shipped alongside the cert-payment stack and does not itself charge or persist — potential bypass surface for a "certificate" without payment.
8. Two payment stacks (`payment_orders` vs `cert_payment_intents`) with no shared ledger; only the generic NOWPayments webhook provisions `compliance_subs` — cert buyers never become monitor subscribers.
9. `monitor/check` POST HMAC verification uses a **non-timing-safe** string compare (`sig === expected`), unlike `inbound-lead` (timing-safe).

---

# LeadForge (apps/leadforge)

Live at https://leadforge.bizlegal-ai.com. Next.js 15.5 App Router. Lead-generation surface, no paid tier of its own — fleet cross-sell is the conversion path. Daybreak-only theme, no login surfaces. Build: `pnpm -F @bizlegal/leadforge build`. Vercel project: `leadforge`, root `apps/leadforge`.

**Doc drift flagged:** app CLAUDE.md lists `/api/inbound-lead` as a primary surface — **no such route exists in code** (5 route files only). CLAUDE.md also says `BIZLEGAL_INBOUND_SECRET` is used for "inbound HMAC"; nothing inbound exists — the secret is used only for outbound (signing ops events).

---

## 1. API routes (`app/api/**/route.ts`)

| Route | Methods | Purpose |
|---|---|---|
| `/api/generate-report` | POST | Deterministic demo output — generates 3 fake "deals" (leadforge) or 3 fake "funds" (pipeforge) from a `location` string. No I/O, no DB, no LLM. Feeds the ChatBot surface. |
| `/api/free-audit` | POST | Free 10-point consent & suppression audit. Validates email, IP rate-limit (`leadforge-free-audit`, 5/min), Turnstile, deterministic scorer `lib/free-audit.ts` → on-page result. Fire-and-forget nurture enqueue (vertical=`leadforge`) + `lead.qualified` ops event. Returns `legal_notice` disclaimer. |
| `/api/decision-tree/lead` | POST | TCPA decision-tree lead capture. Validates email + verdict (allowlist of 4), rate-limit (`leadforge-decision-tree-lead`, 10/min), Turnstile (skip-if-unconfigured), nurture enqueue vertical=`leadforge`, `lead.qualified` ops event. |
| `/api/ops/health` | GET | Token-gated env-presence audit (9 keys; critical + reason each). 404 on token mismatch via timing-safe compare. Aggregated by hub `/api/ops/health` into fleet env matrix. `maxDuration=15`. |
| `/api/digest` | GET | Daily product digest for hub aggregator — hardcoded "quiet day" score 0, 2 bullets, 1 link. Honest anti-hallucination stub; no DB read. `s-maxage=300`. |

Note: `/api/generate-report` returns fabricated deal/fund previews as if real (no disclaimer, no LLM, no persistence) — a UX-honesty liability if presented as live data. `/api/digest` is a static zero-score stub, not real telemetry.

## 2. Pages (`app/**`, non-API)

| Route | Purpose | SEO / indexability |
|---|---|---|
| `/` | Homepage: `LeadForgeLanding` (vendored) + pre-banner + `StickyLeadBadge` → /decision-tree | Indexable. Default metadata from layout (`LeadForge` → `[page] \| LeadForge`). No page-level metadata export. |
| `/decision-tree` | TCPA / lead-gen exposure tree. `force-static`. FAQ + tool JSON-LD in-page. | Indexable. Full metadata + canonical (decision-tree page sets its own: title "TCPA / Lead-Gen Decision Tree \| LeadForge", og:url). |
| `/free-audit` | 10-point consent & suppression self-audit client flow. `force-static`. FAQ + tool JSON-LD. | Indexable. Full metadata + canonical. |
| `/pipe` | Pipeforge unclaimed-funds upsell page (renders `PipeforgeUpsell`). No metadata export. | Indexable by default (no noindex), in sitemap. |
| `/robots.txt` (`robots.ts`) | AI-crawler allowlist (36 bots), semantic blocklist (10), `/api/` + `/_next/` private. `crawlDelay: 1`. | — |
| `/sitemap.xml` (`sitemap.ts`) | 4 URLs: `/`, `/decision-tree`, `/free-audit`, `/pipe`. Referenced from apex sitemap-index. | — |
| `layout.tsx` | Root layout: SiteShell, Daybreak-only ThemeProvider + FOUC, 3-block JSON-LD head (`structured-data.tsx`), GSC verification (env-conditional), Plausible (env-conditional), sticky CrossLinkBanner → `https://hub.bizlegal-ai.com/services/compliance-ops` ("24/7 ops, $2,500/mo"). | — |

**Note:** `public/robots.txt` still exists on disk with a *different* policy (disallows `/clients`, `/orders`, `/pipeforge`; allows `/pipeforge` per-app differs). `app/robots.ts` shadows it in Next 15, but the stale static file is a foot-gun if the app route is ever removed.

## 3. Cron / scheduled functions

**None.** `vercel.json` has no `crons`. Only framework/build config:
- `framework: nextjs`, `outputDirectory: .next`
- Root-level install + `turbo build --filter=@bizlegal/leadforge...`

## 4. package.json scripts

| Script | Command |
|---|---|
| dev | `next dev` |
| build | `next build` |
| start | `next start` |
| typecheck | `tsc --noEmit` |

No lint, no test scripts. Workspace deps: `@bizlegal/nurture-enqueue`, `@bizlegal/rate-limit`, `@bizlegal/themes`, `@bizlegal/turnstile-verify`, `@bizlegal/turnstile-widget`, `@supabase/ssr`, `@supabase/supabase-js`. `next.config.mjs` transpiles 7 `@bizlegal/*` packages (incl. unused `@bizlegal/ops-log` and `@bizlegal/payment`).

## 5. lib/ modules

| Module | Exports |
|---|---|
| `lib/free-audit.ts` | `FREE_AUDIT_CHECKS` (10 checks, 4 areas, severity-weighted), `AUDIT_AREA_LABELS`, `evaluationsFromRaw`, `scoreAudit`, `postureFor` (5 posture bands), types `AuditAnswer` / `AuditArea` / `AuditCheck` / `AuditEvaluation` / `AuditScore` / `PostureBand`. Pure, no I/O. |
| `lib/nurture-enqueue.ts` | Re-export only: `enqueueNurture`, `NurtureVertical`, `EnqueueArgs`, `SubdomainEnqueueArgs` from `@bizlegal/nurture-enqueue`. |
| `lib/ops/log.ts` | `logEvent` (HMAC-SHA256 POST to `OPS_LOG_URL` default `https://bizlegal-ai.com/api/ops/log`, 5s abort, failures swallowed), `logEventAsync` (fire-and-forget), `LogEventInput`, `OpsEventType` (8 types). |
| `lib/supabase/client.ts` | `createBrowserSupabaseClient` (anon). |
| `lib/supabase/server.ts` | `createServerSupabaseClient` (service role `SUPABASE_SERVICE_ROLE_KEY`, falls back to anon key). |
| `lib/supabase/index.ts` | Re-exports both supabase clients. |
| `lib/apify/actors.ts` | Static config only: `APIFY_ACTORS` (3 verticals: commercial/employment/real-estate), `PIPEFORGE_FUNDS_SIGNALS`. **No runtime Apify calls anywhere in app.** |
| `lib/utils.ts` | `cn` (clsx+twMerge), `formatCurrency`. |

Components: `FreeAudit.tsx` (client scorer flow + `crossSellFor('leadforge')`), `LeadGenDecisionTree.tsx` (TCPA tree), `ChatBot.tsx` (→ `/api/generate-report`), `TurnstileWidget.tsx`, `LandingPreBanner.tsx`, `leadforge/LeadForgeLanding.tsx` + `content.ts`, `pipeforge/PipeforgeUpsell.tsx`, `templates/EmailWelcomeTemplate.tsx` + `PdfReportTemplate.tsx` + `TemplateShowcase.tsx` + `index.ts`.

## 6. `process.env.*` references (names only, no values)

| Name | Used in |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/*` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/{client,server}.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase/server.ts` |
| `SUPABASE_SERVICE_KEY` | **presence-checked only** in `/api/ops/health` — **name mismatch with actual read `SUPABASE_SERVICE_ROLE_KEY`** |
| `BIZLEGAL_INBOUND_SECRET` | `lib/ops/log.ts` (HMAC signer) |
| `OPS_LOG_URL` | `lib/ops/log.ts` (default `https://bizlegal-ai.com/api/ops/log`) |
| `OPS_DASHBOARD_TOKEN` | `/api/ops/health` gate |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `FreeAudit.tsx`, `LeadGenDecisionTree.tsx` (widget) |
| `NEXT_PUBLIC_GSC_VERIFICATION` | `layout.tsx` (Google verification meta) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | `layout.tsx` (Plausible script) |
| `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `NOWPAYMENTS_API_KEY`, `PAYPAL_CLIENT_ID`, `APIFY_TOKEN` | **presence-checked only** in `/api/ops/health`; not read anywhere else |

No secrets printed. Anon key `getEnv` throws at runtime if unset (browser client).

## 7. Integration points

| Point | Direction | Mechanism |
|---|---|---|
| Hub `/api/ops/log` | Outbound | `lib/ops/log.ts` HMAC-SHA256 POST, header `x-bizlegal-signature`, body `{type, source:'leadforge', ...}`. Events fired: `lead.qualified` (free-audit, decision-tree). |
| Hub `/api/ops/health` fleet matrix | Outbound (aggregation) | Subdomain `/api/ops/health` is token-gated and polled by hub. |
| Hub nurture engine | Outbound | `@bizlegal/nurture-enqueue` vertical=`leadforge`, sources `leadforge:free-audit` / `leadforge:decision-tree`. Cross-sell via `crossSellFor('leadforge')` in FreeAudit result. |
| Hub landing pages | Outbound link | Sticky `CrossLinkBanner` → `hub.bizlegal-ai.com/services/compliance-ops`. Footer SiteShell. |
| Supabase | Read/Write (latent) | Supabase clients exist (`lib/supabase/*`) + `public/dashboard.html` static dashboard queries Supabase REST directly (in-browser `apikey`/Bearer). **No current app route uses the supabase clients.** App API routes are pure/hardcoded. |
| `public/llms.txt` | Outbound | LLM-instruction file (free tier $0 / Pro $99/mo claim — pricing not reflected in code; no checkout). |

**Inbound HMAC (`/api/inbound-lead`):** absent despite CLAUDE.md claim — this app consumes no HMAC-signed inbound traffic; it only signs outbound.

## Key findings

1. **No real data paths.** Every API route is either deterministic demo generation (`/api/generate-report`), score-only (`/api/free-audit`), or lead capture (`/api/decision-tree/lead`). Supabase clients unused by routes.
2. **`/api/generate-report` and ChatBot present fabricated deals/funds as credible output** with no disclaimer and no persistence — top-of-funnel demo liability.
3. **Env-name mismatch:** `/api/ops/health` checks `SUPABASE_SERVICE_KEY`; `lib/supabase/server.ts` reads `SUPABASE_SERVICE_ROLE_KEY` — health can report a service key missing while one exists (and vice-versa). Same for `PAYPAL_CLIENT_ID`/`NOWPAYMENTS_API_KEY` presence claims vs. `@bizlegal/payment` reality (never read here).
4. **`/api/digest` is a hardcoded zero-score stub** — hub's activity feed for leadforge will always show "quiet day" until wired to real tables.
5. **Stale `public/robots.txt`** shadows-risk: app-route robots.ts differs (esp. `/pipeforge` and `/clients`, `/orders` disallows).
6. No lint/test scripts; no crons; no middleware.

---

# Bench (apps/bench/web)

Surface: `bench.bizlegal-ai.com` — evaluation lab for legal AI (measurement, not advice). Next.js 14.2.35 App Router at `apps/bench/web` (Vercel Root Directory = `apps/bench/web`). Status: Gates 3+5 closed 2026-08-23 (legal review + live checkout); migration apply, Vercel project/CNAME, self-benchmark and test purchase still open per `apps/bench/CLAUDE.md`.

## API routes (`apps/bench/web/app/api/`)

| Route | Method | Purpose |
|---|---|---|
| `/api/audit/request` | POST | Client intake ingress (acquisition). Validates + rate-limits, writes `bench_intake`, fires `lead.inbound` + `email.sent` ops events, sends ONE transactional ack via `@bizlegal/email`. Rule-7-only path. Rate limit: 5 / 10 min per client key (in-memory). |
| `/api/audit/request` | GET | Status probe (`{ok, service, endpoint, method}`). |
| `/api/checkout/start` | POST | **LIVE (2026-08-23).** Validates body against `BENCH_PRODUCTS` set (`bench_audit_2500`, `bench_managed_monthly`) + email + gateway (`card`/`crypto`), logs `agent.checkout` intent, forwards to hub `https://bizlegal-ai.com/api/pay/start` which builds the gateway URL via `@bizlegal/payment`. Returns `checkout_url` or 503 when not live. |
| `/api/checkout/start` | GET | Status probe — reports `live: true/false` (`CHECKOUT_LIVE = true` hardcoded). |
| `/api/experts/apply` | POST | Talent-side intake. Rate-limited, validates (jurisdiction ∈ EU/UK/UAE/Other, PQE 0–60), writes `bench_expert_applications`, sends transactional ack, `email.sent` event. Admission is human (`wf_expert_onboarding`). |
| `/api/experts/apply` | GET | Status probe. |
| `/api/inbound-lead` | POST | HMAC ingress (fleet protocol). Verifies `x-bizlegal-signature` HMAC-SHA256 over raw body vs `BIZLEGAL_INBOUND_SECRET` (timing-safe). Rejects unless `classification.product === 'bench'`. Writes `bench_intake` if email, fires `lead.inbound`. |
| `/api/inbound-lead` | GET | Status probe — reports `configured: Boolean(BIZLEGAL_INBOUND_SECRET)`. |
| `/llms.txt` | GET | AEO surface for AI crawlers — static generated text from `BENCHMARKS` (fleet convention). |

## Pages (`apps/bench/web/app/`)

| Path | Purpose | SEO / noindex |
|---|---|---|
| `/` | Landing — research-lab positioning, registry-derived numbers only (no fabricated client metrics). JSON-LD ProfessionalService. | Indexed (default; no page-level metadata, inherits layout). Sitemap priority 1. |
| `/benchmarks` | Benchmark registry index (MiCA/DPA/VARA). | Indexed; `metadata` present. Sitemap. |
| `/benchmarks/[slug]` | Per-benchmark detail (claims, item counts, held-out counts, jurisdiction). `generateMetadata`. | Indexed; sitemap priority 0.8. |
| `/methodology` | Five-dimension rubric, error taxonomy, calibration, inter-rater, versioning. | Indexed; metadata present. |
| `/sample` | Worked sample report. | Indexed. |
| `/pricing` | Diagnostic Audit $2,500 one-time; Managed Evaluation Program $5,000/mo; Dedicated Intelligence $12,500/mo (from llms.txt). `CheckoutButton` posts to `/api/checkout/start`. | Indexed. |
| `/audit/request` | Client request form (intake). `request-form.tsx` → POST `/api/audit/request`. | Indexed; metadata present ("Request an audit"). |
| `/experts` | Talent funnel ("For experts"). `apply-form.tsx` → POST `/api/experts/apply`. | Indexed. |
| `/report/[id]` | Token-gated measurement report (`?t=` UUID). Queries `bench_reports` joined `bench_engagements` via PostgREST; logs `download.report`. **`robots: { index:false, follow:false }`.** | **noindex.** Disallowed in robots.txt. UUID_RE enforced on both id and token. |
| `/legal/terms` | Client service terms. | Indexed. |
| `/legal/dpa` | Data processing addendum. | Indexed. |
| `robots.ts` | `Allow: /`, `Disallow: /report/, /api/`, sitemap `https://bench.bizlegal-ai.com/sitemap.xml`. | — |
| `sitemap.ts` | Static pages + per-benchmark URLs | — |

Layout metadata: default title "Bench — The Evaluation Lab for Legal AI", template "%s · Bench", OpenGraph, canonical `/`. Global disclaimer: measurement only, not legal advice.

## Build / infra

- `package.json`: scripts `dev|build|start|typecheck` (`next build`, `tsc --noEmit`). Deps: `next 14.2.35`, `react 18.3.1`, `@bizlegal/email` (workspace); dev: typescript. Node 22.x engine.
- `vercel.json`: Next.js framework, root-trace build `pnpm turbo build --filter=@bizlegal/bench...` from monorepo root. **No crons defined** (no scheduled webhooks on bench itself).
- `next.config.mjs`: `transpilePackages: ["@bizlegal/email"]`; `outputFileTracingRoot` = monorepo root (workspace-hoisted `styled-jsx` fix).

## lib/ modules (`apps/bench/web/lib/`) — exported functions

| Module | Exports |
|---|---|
| `benchmarks.ts` | `BENCHMARKS` (readonly registry), `getBenchmark(slug)`, `releasedItems(b)`, `heldOutCount(b)`. `Benchmark`/`BenchmarkItem` interfaces. Data: `web/data/benchmarks/v1/{mica,dpa,vara}-bench.json` (git-versioned; v1.0.0-draft; status active). |
| `db.ts` | `dbInsert(table, row)`, `dbSelect<T>(pathWithQuery)` — raw PostgREST fetch, service-role only, UA `bizlegal-agent/1.0`, never throws (false/null on failure). No supabase-js. |
| `inter-rater.ts` | `computeInterRater(pairs)` → `InterRaterReport`; `CalibrationPair`/`DimensionAgreement` types. |
| `ops/log.ts` | `logEvent`, `logEventAsync` — HMAC-signed POST to hub `/api/ops/log` (default `https://bizlegal-ai.com/api/ops/log`), swallows failures. Local copy of propsignal pattern, **no new event types** (subset: `agent.checkout`, `lead.inbound`, `email.sent`, `email.failed`, `legal.cite_audit`, `report.generated`, `download.report`, payment.*, `error`). |
| `rate-limit.ts` | `isRateLimited(key)`, `clientKey(req)` — in-memory per-lambda bucket, 5 req / 10 min default. |
| `report-model.ts` | `BenchReportRow`, `BenchReport`, `ExpertCredentialLine` types. |
| `rubric-engine.ts` | `RUBRIC_DIMENSIONS`, `totalScore`, `computeEngagementMetrics`, `MAX_DIMENSION_SCORE=5` (×5 = 25), `HALLUCINATION_SCORE_THRESHOLD=2`; `Severity`/`TaxonomyTag`/`ScoredEvaluation`/`DimensionSummary`/`PracticeAreaSummary` types. |

## Env vars used (names only — values in canonical vault)

`BIZLEGAL_INBOUND_SECRET` · `OPS_LOG_URL` (defaulted) · `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL` (fallback) · `SUPABASE_SERVICE_KEY` / `SUPABASE_SERVICE_ROLE_KEY` (fallback). Auto-generated / framework: `NEXT_OTEL_*`, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, `__NEXT_BUILD_ID`. Matches `apps/bench/CLAUDE.md` zero-new-env rule (no `RESEND*`/`ANTHROPIC` referenced directly by web code in this pass — sendEmail/acquisition is `@bizlegal/email`-internal; ANTHROPIC per CLAUDE.md doc only).

## Integration points

| Point | Mechanism | Status |
|---|---|---|
| Hub `/api/pay/start` | POST forward from `/api/checkout/start`; `@bizlegal/payment` products registered. | LIVE (flag) |
| Ops chain | `lib/ops/log.ts` → hub `/api/ops/log` HMAC. | Wired |
| Supabase | PostgREST service-role to `bench_intake` / `bench_expert_applications` / `bench_reports` / `bench_engagements` (RLS, no anon). Migration `supabase/migrations/20260816_bench_schema.sql`. | Migration apply — UNKNOWN (per CLAUDE.md, still pending) |
| Email | `@bizlegal/email` workspace pkg; transactional acks only (`audit_request_ack`, `expert_apply_ack`). | Wired |
| Inbound lead protocol | `/api/inbound-lead` HMAC (fleet Worker → subdomain). | Wired |
| Vercel project/CNAME | UNKNOWN — listed as remaining in CLAUDE.md (not code-verifiable here). | UNKNOWN |

---

# Blog (content/blog + services/seo-agents + hub served)

Two pipelines share similar content, different consumers:
- **Hub-served blog** — `bizlegal-ai.com/blog` from `apps/hub/app/blog/` reading monorepo `content/blog` via `apps/hub/lib/blog.ts`.
- **CF Pages blog** — `blog.bizlegal-ai.com` from the separate `bizlegal-ea` repo, fed by `services/seo-agents/publish_blog.py` (NOT this monorepo's deploy path).

## Content inventory (`content/blog/`, 20 files: 16 `.mdx` + 4 `.md`)

**Rendered on hub blog (`published: true`, 11 posts):**

| File | Title |
|---|---|
| `boi-filing-2026-diy-vs-automated.mdx` | BOI Filing 2026: Do You Still Need to File? (DIY vs Automated) |
| `checks-before-an-ai-agent-touches-your-inbox.mdx` | The Checks I Run Before an AI Agent Touches My Inbox |
| `comparisons/docai-vs-luminance-robin-ai-contract-review.mdx` | DocAI vs Luminance vs Robin AI: AI Contract Review Compared (2026) |
| `comparisons/firmcited-vs-ai-citation-checking-tools.mdx` | AI Citation Checking for Law Firms: FirmCited vs Churci, Ascero, and KeyCite (2026) |
| `comparisons/gdpr-vs-ccpa-vs-lgpd-data-privacy.mdx` | GDPR vs CCPA vs LGPD: Comparing the World's Three Major Data Privacy Regimes |
| `comparisons/mica-vs-vara-vs-fca-crypto-licensing.mdx` | MiCA vs VARA vs FCA: Which Crypto Licensing Regime Is Best for Your Company? |
| `comparisons/soc2-vs-iso27001-vs-hipaa-compliance.mdx` | SOC 2 vs ISO 27001 vs HIPAA: Which Compliance Framework Do You Need? |
| `fincen-boi-reporting-2026-llc-checklist.mdx` | FinCEN BOI Reporting in 2026: The 23-Question Test for LLCs |
| `i-ran-a-revenue-leak-report-on-my-own-practice.mdx` | I Ran a Revenue-Leak Report on My Own Practice |
| `mica-dora-vara-compliance-benchmark-2026.mdx` | MiCA, DORA, and VARA in 2026: What a Compliance Team Actually Needs to Prove |
| `what-is-a-contract-risk-assessment.mdx` | What Is a Contract Risk Assessment? (And What a Lawyer Actually Checks) |

**NOT rendered by hub (`published` front matter absent → `readPost` returns null silently, 9 files):**

| File | Title | NOTE |
|---|---|---|
| `2026-07/boi-certifying-officer-liability-llcs.md` | BOI Filing: Who Bears Liability When the Certifying Officer Gets It Wrong? | `.md`, front matter uses `tags`/`slug`, author Moses, no `published` |
| `2026-07/compliance-ops-retainer-vs-in-house-cco.md` | Compliance Ops Retainer vs. In-House CCO: What Early-Stage Fintechs Actually Need | same |
| `2026-07/mica-article-23-casp-application-for-eu-crypto-iss.md` | MiCA Article 68: What EU Crypto-Asset Service Providers Must Do Before the Transitional Period Ends | same |
| `2026-07/mica-casp-which-eu-member-state-to-file-in.md` | MiCA CASP Authorization: Which EU Member State Should You File In? | same |
| `eu-ai-act-fines-non-compliance-2025.mdx` | EU AI Act Fines for Non-Compliance 2025: Actual Penalties and Risk Tiers | no `published` in front matter |
| `how-to-respond-to-security-questionnaire-fast.mdx` | How To Respond To Security Questionnaire Fast (2024 Guide) | **most recent blog commit (d7b8839) — NOT published**; front matter also uses `pillar`/`product`/`keyword`/`category` (CF-pipeline format) instead of hub `tag`/`readTime`/`keywords`/`jurisdiction` |
| `mica-article-68-2026-casp-authorization-withdrawal.mdx` | MiCA Article 68 in 2026: What Compliance Teams Need to Know About CASP Authorization Withdrawal | no `published` |
| `travel-rule-compliance-vasps-crypto-exchanges.mdx` | Travel Rule Compliance for VASPs & Crypto Exchanges: 2026 Buyer's Guide | no `published` |
| `wallet-forensics-court-admissibility-2026.mdx` | Wallet Forensics in Court: How Admissible is Blockchain Evidence in 2026? | no `published` |

## Publish pipeline scripts (`services/seo-agents/`, role from docstring)

| Script | Role |
|---|---|
| `publish_blog.py` | Bridge into `bizlegal-ea` clone: syncs `.mdx` file set via GitHub Contents API (commit+push). CF Pages serves `bizlegal-ea`, not this monorepo. |
| `seo_content_writer.py` | 40-post SEO engine for `blog.bizlegal-ai.com`: reads keyword calendar (`decisions/SEO-KEYWORD-CALENDAR.json`), writes 1500+ word MDX with H1–H3, internal links, FAQ, JSON-LD (Article + FAQPage + BreadcrumbList). |
| `og_image_generator.py` | Renders 1200×630 OG PNGs per MDX (Pillow, dark-navy/gold design language). |
| `internal_linker.py` | Scans MDX dir, auto-injects internal product links by keyword (link table from `decisions/SEO-SUBSCRIPTION-10K-MRR-PLAN.md`); idempotent, stdlib only. |
| `gsc_indexnow_pinger.py` | Pings IndexNow (optionally Bing WMC + Telegram) on new content; state JSON; stdlib urllib. |

Other present scripts (out of scope for this inventory): `comparison_generator`, `keyword_calendar`, `lead_magnet`, `newsletter`, `revenue_attribution`, `conversion_tracker`, `analytics_dashboard`, `seo_watchdog`, `daily_orchestrator`, crawlers etc. — not inventoried here.

## Hub service layer (`apps/hub/lib/blog.ts`)

Single source of truth for the hub blog; reads **monorepo-root `content/blog`** (resolve: `process.cwd()+"/../../content/blog"` then `content/blog`; `process.cwd()` = `apps/hub` on Vercel). Recursively globs `\.mdx?$`. Requires `title`, `date`, **`published` truthy** else the file is silently skipped.

| Function | Purpose |
|---|---|
| `getAllPosts()` | Published, de-duplicated (root beats subdir on slug clash), date-desc, strips `content` → `BlogPostMeta[]`. |
| `getPostBySlug(slug)` | Full `BlogPost` incl. content (basename-slug match, md/mdx). |
| `getFeaturedPosts(limit=2)` | Featured-filtered slice. |
| `getPostsByTag(tag)` / `getPostsByJurisdiction(jurisdiction)` | Faceted queries on front matter. |
| `getAllTags()` | Unique tag set. |
| `getSurroundingPosts(slug)` | Prev/next nav. |

Hub pages: `apps/hub/app/blog/page.tsx` (metadata "Blog — Compliance Intelligence for SaaS, Fintech & Crypto Startups", uses `getAllPosts` + `GUIDES` + `BlogGrid`/`BlogPostGrid`) and `apps/hub/app/blog/[slug]/page.tsx` (`generateStaticParams` from `getAllPosts`, `getPostBySlug`, `notFound`, `permanentRedirect`, `BlogPostView`, `Markdown`). Cross-reference: full hub route inventory lives in the hub surface section of the mechanism map — blog pages are hub-served, plus a separate `content_distribution.py`/CF-Pages blog for `blog.bizlegal-ai.com`.

## Notable findings

1. **`how-to-respond-to-security-questionnaire-fast.mdx` (commit d7b8839, newest blog post) has no `published:` — it will NOT render on the hub blog** and its front matter (`pillar`/`product`/`keyword`/`category`) is the CF-pipeline format, not hub's. Likely intended for `blog.bizlegal-ai.com` via `publish_blog.py`; on the hub side it's a silent no-op.
2. **9 of 20 content files render nothing on the hub** (5 mdx missing `published`, 4 `.md` using CF format) — silent drops, no warning.
3. Bench has no crons; all GETs are status probes; `CHECKOUT_LIVE` is a hardcoded boolean now `true`.
4. Bench DB access is raw PostgREST with service-role fallback chain (`NEXT_PUBLIC_SUPABASE_URL`→`SUPABASE_URL`; `SUPABASE_SERVICE_KEY`→`SUPABASE_SERVICE_ROLE_KEY`).

---

# BRAI

**App:** `bizlegal-monorepo/apps/brai` · domain `brai.bizlegal-ai.com` · Vercel project `brai` · Next.js 14.2.29 (App Router) · shared `@bizlegal/themes`
**Build:** `pnpm -F @bizlegal/brai build` (`next build`). **Caveat:** `CLAUDE.md` surface list is STALE — names `/api/leads`, `/api/invoice`, `/api/webhook`, `/api/inbound-lead`; none of these files exist. Actual API surface below. `CLAUDE.md` also cites `CHAINALYSIS_API_KEY`/`OFAC_SDN_FEED_URL` and "$49 one-time" — not present in code; pricing is stop-sold (see Notes).

## API routes (all under `app/api/`, 9 files / 10 endpoints)

| Route | Methods | Purpose |
|---|---|---|
| `/api/decision-tree/lead` | POST | Lead capture from decision-tree + home hero. Validates email+verdict (valid verdicts: `critical_screen`/`periodic_screen`/`low_priority`/`home_capture`), Cloudflare Turnstile verify (~skip-if-not-configured), `@bizlegal/rate-limit`, `enqueueNurture` vertical=`brai`, logs `lead.qualified` op event. |
| `/api/digest` | GET | Daily product digest for hub aggregator (`brai` chip). Anti-hallucination placeholder: score=0, "Regulatory intelligence — quiet day.", returns real headline/bullets/links, `s-maxage=300`. Probed by hub `/api/cron/smoke` + `/api/ops/health`. |
| `/api/network/intake` | POST | Verified Intelligence Network intake (from `/network` page). Requires email+organisation+use_case. Resend email to `NETWORK_INTAKE_EMAIL` (default `network@bizlegal-ai.com`) + `enqueueNurture` lead_id `brai-<email>-<product>`. 202 when Resend unset (payload logged only). No payment. |
| `/api/ops/health` | GET | Env-presence audit, token-gated by `OPS_DASHBOARD_TOKEN` (timing-safe; 404 on mismatch). Returns name+presence for 11 declared env keys. Aggregated by hub `/api/ops/health` Fleet matrix. Note: declares `CHAINALYSIS_API_KEY`/`OFAC_SDN_FEED_URL` which code never reads (see env list). |
| `/api/payments/nowpayments/start` | POST | Generic AgentCheckoutButton path: validates product/tier/interval/amount_cents/email, inserts pending `payment_orders` row, creates NOWPayments invoice (uses `NOWPAYMENTS_API_KEY`). |
| `/api/payments/nowpayments/webhook` | POST | NOWPayments IPN. HMAC-SHA512 over sorted JSON verified with `NOWPAYMENTS_IPN_SECRET` (fails closed if secret missing). Marks `payment_orders` paid/failed/refunded from `TERMINAL_PAID`/`TERMINAL_FAILED`/`TERMINAL_REFUNDED` sets. |
| `/api/payments/paypal/start` | POST | PayPal Orders v2 one-time + subscriptions. OAuth2 token (`PAYPAL_ENV` sandbox/live), `payment_orders` row, PayPal order/plan creation (plan id from `PAYPAL_PLAN_ID_*` env; 503 graceful if absent). |
| `/api/payments/paypal/webhook` | POST | PayPal webhook signature verification via `/v1/notifications/verify-webhook-signature` (needs `PAYPAL_WEBHOOK_ID`; skips verification in non-prod if absent). Updates `payment_orders`. |
| `/api/sanctions/refresh` | POST + GET | Cron (06:00 UTC, vercel.json). POST gated `Bearer CRON_SECRET` → `refreshSanctions()` writes OFAC/UN/EU lists into Supabase `sanctions_cache` via REST (survives cold starts). GET (`?t=OPS_DASHBOARD_TOKEN`) returns cache status for ops probes. |

External calls: NOWPayments API (`api.nowpayments.io`), PayPal API (`api-m.{sandbox,}paypal.com`), Supabase (JS client + raw PostgREST REST for `sanctions_cache`), Treasury/UN/EU sanctions XML feeds, `@bizlegal/nurture-enqueue` (worker), hub `/api/ops/log` (HMAC).

## Pages (`app/*/page.tsx`, 13 files, all public + indexable)

| Path | Purpose / SEO |
|---|---|
| `/` | Home — shared `LandingV2` (`BRAI_CONTENT`), royal-dark/light themes. Hero lead → POST `/api/decision-tree/lead` verdict `home_capture`. No own metadata (layout metadata only). |
| `/decision-tree` | Sanctions screening decision tree (OFAC/EU/UK) — free conversion funnel → `/api/decision-tree/lead`. Has metadata. |
| `/network` | Verified Intelligence Network intake form → POST `/api/network/intake`. No metadata export (inherits layout). |
| `/pricing` | Stop-sold. `checkoutUrls: {}` — cards disabled, waitlist CTA. JSON-LD offers stale: $249/report, $1990 retainer, $99 monitor (does not match CLAUDE.md "$49"). Has metadata. |
| `/about`, `/contact`, `/methodology`, `/trust`, `/terms`, `/privacy`, `/refund`, `/disclaimer`, `/acceptable-use` | Static marketing/legal/methodology pages, each with metadata title+description. |
| — | No `/scan`, `/report`, `/analyze`, `/blockchain-report` in this app (the report gate lives on the HUB — `hub/app/blockchain-report/page.tsx` + `hub/app/api/blockchain-report`). |

**SEO:** `app/robots.ts` single source (public/robots.txt shadowed) — allows `*` + explicit AI/LLM agent allowlist (Googlebot…ClaudeBot…DeepSeekBot…), blocks Bytespider/CCBot/AhrefsBot/SemrushBot etc, disallows `/api/` `/ _next/`. `app/sitemap.ts` = 13 marketing URLs, referenced from apex `bizlegal-ai.com/sitemap-index.xml`. `public/llms.txt` + `public/dashboard.html` present.

## package.json / vercel.json

- scripts: `dev`, `build` (`next build`), `start`, `typecheck`.
- deps: `@bizlegal/nurture-enqueue`, `@bizlegal/rate-limit`, `@bizlegal/themes`, `@bizlegal/turnstile-verify`, `@bizlegal/turnstile-widget`, `@supabase/supabase-js`, `lucide-react`, `next@14.2.29`, `react`.
- vercel.json: **cron** `{ path: "/api/sanctions/refresh", schedule: "0 6 * * *" }`. No `functions`/headers config.
- next.config.mjs: `reactStrictMode`, transpile of themes/turnstile/nurture/rate-limit/**ops-log**/**payment**.

## lib modules (13 files)

| Module | Exports (one-line each) |
|---|---|
| `lib/chain/goldrush.ts` | `fetchGoldRushHit(options)` → on-chain tx/balance via GoldRush (needs `GOLDRUSH_API_KEY`). |
| `lib/chain/alchemy.ts` | `fetchAlchemyHit(options)` → tx history via Alchemy (needs `ALCHEMY_API_KEY`). |
| `lib/chain/covalent.ts` | `fetchCovalentHit(options)` → tx history via Covalent (needs `COVALENT_API_KEY`). |
| `lib/chain/composite-score.ts` | `scoreAddress(inputs)` + `DEFAULT_COMPOSITE_WEIGHTS` → 0-100 composite risk score from chain + sanctions hits. |
| `lib/chain/intelligence.ts` | `buildSnapshot(inputs)` + `serializeSnapshot(snap)` → full wallet intel snapshot (sanctions/mixer/counterparty/jurisdiction hits). |
| `lib/chain/sanctions.ts` | `refreshSanctions()`, `getCachedListsFromSupabase()`, `screenAddress(address)`, `screenAddressSync(_addr)`, `__seedSanctionsCacheForTest` — OFAC/UN/EU feeds (env URLs w/ defaults) cached in Supabase `sanctions_cache` via REST; sync fn is a stub. |
| `lib/chain/types.ts` | `isAddress`, `requireAddress` + chain/provider/sanctions types (`ChainId`, `Provider`, `WalletAddress`, hits…). |
| `lib/chain/index.ts` | Barrel re-exporting the above. |
| `lib/legal/disclaimer.ts` | `disclaimerStamp()` + `DISCLAIMER_VERSION` (env `NEXT_PUBLIC_DISCLAIMER_VERSION`, default `v1.0.0-p1`). |
| `lib/legal/shield-clauses.ts` | `SEVEN_CLAUSES` + `DISCLAIMER_FOOTER_LINE` — liability shield/citation clauses. |
| `lib/legal/vin-terms.ts` | `VIN_TERMS_PARAGRAPH` — VIN/verification-intent terms text. |
| `lib/nurture-enqueue.ts` | Re-export `enqueueNurture` from `@bizlegal/nurture-enqueue` (worker 4-step cadence). |
| `lib/ops/log.ts` | `logEvent()`, `logEventAsync()` → POSTs HMAC-SHA256 body (`x-bizlegal-signature`, key `BIZLEGAL_INBOUND_SECRET`) to hub `/api/ops/log` (default `https://bizlegal-ai.com/api/ops/log`); failures swallowed. |

Components: `components/SanctionsDecisionTree.tsx`, `components/TurnstileWidget.tsx`, `components/conversion/*` (LeadMagnetForm, DataStat, MethodologyBadge, ScarcityBanner), `components/layout/*` (LegalPage, LegalShield), plus `app/components/ui-v2/*` (Hero, IntelligenceCard, PricingTierCard, ThemeToggle, **AgentCheckoutButton** — defined but imported by NO page = dead/unused).

## Env vars referenced (names only; brai = 29)

`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (fallback), `BIZLEGAL_INBOUND_SECRET`, `OPS_DASHBOARD_TOKEN`, `OPS_LOG_URL`, `ANTHROPIC_API_KEY` (in ops/health list only — no code path found using it on brai), `RESEND_API_KEY`, `RESEND_FROM`, `NETWORK_INTAKE_EMAIL`, `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`, `CRON_SECRET`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_PLAN_ID_*` (dynamic), `ALCHEMY_API_KEY`, `COVALENT_API_KEY`, `GOLDRUSH_API_KEY`, `OFAC_LIST_URL`, `UN_SANCTIONS_URL`, `EU_SANCTIONS_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_DISCLAIMER_VERSION`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GSC_VERIFICATION`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `NODE_ENV`.

## Integration points

- **Hub `/api/brai/*` are NOT forwarding proxies** — they are self-contained hub routes that mirror brai's legacy surface and write via hub Supabase:
  - `/api/brai/leads` (POST) — captures scan lead into `tracr_wallet_leads` (`product='brai_report'`), logs `lead.inbound`.
  - `/api/brai/webhook` (POST) — NOWPayments IPN for BRAI full-report delivery; kept live to log/fulfil legacy invoices.
  - `/api/brai/invoice` (POST) — **STOP-SOLD 2026-09-02** (fleet finding F4/brai): brai has no report-generation/fulfillment code; route refuses with 410 `brai_checkout_paused`; the `/blockchain-report` gate on hub captures a waitlist.
- **Hub probes brai:** `/api/cron/smoke` and `/api/ops/health` GET `https://brai.bizlegal-ai.com/api/digest` and `https://brai.bizlegal-ai.com/api/ops/health`.
- **brai → hub outbound:** `lib/ops/log` POSTs to `https://bizlegal-ai.com/api/ops/log` (HMAC `BIZLEGAL_INBOUND_SECRET`). No `lib/payment` usage — brai's `/api/payments/*` are hand-rolled copies of the generic pattern, and **are unused by any page** (dead checkouts; AgentCheckoutButton unimported). Payments effectively disabled app-wide.
- **Nurture:** `enqueueNurture` (worker) fired from decision-tree/lead + network/intake.

---

# TRACR

**App:** `bizlegal-monorepo/apps/tracr` · domain `tracr.bizlegal-ai.com` · Vercel project `tracr` · Next.js 14.2.35 (App Router) · shared `@bizlegal/themes`
**Build:** `pnpm -F @bizlegal/tracr build` (`next build && node scripts/fix-manifests.mjs`).
`CLAUDE.md` pricing is STALE (says Bronze $149 / Silver $299; actual `lib/tiers.ts` = regulatory $29 / standard $149 / professional $349 / enterprise $799). `CLAUDE.md` also lists `TRACR_BLOCKSCOUT_API_KEY`/`TRACR_ETHERSCAN_API_KEY` — code uses `GOLDRUSH_API_KEY` + `ETHERSCAN_API_KEY` instead; the ops/health ENV_KEYS declarations are stale.

## API routes (all under `app/api/`, 21 files / 26 endpoints)

| Route | Methods | Purpose |
|---|---|---|
| `/api/activities` | GET, POST | CRM activity feed: list `trcr_activities` (optional `?deal_id=`), create note/email/call/etc. |
| `/api/analyze` | POST | Free wallet scan: `getTransactions` (Covalent/GoldRush) → `calculateRisk` → `generatePreview` (Anthropic). Saves `tracr_wallet_leads` + fire-and-forget `sendLeadCapture`. Returns partial result (full report gated on payment). `maxDuration` 30. |
| `/api/clients` | GET, POST | List / create `trcr_clients`. |
| `/api/clients/[id]` | GET, PATCH, DELETE | Read / update / delete client. |
| `/api/deals` | GET, POST | List (join client) / create `trcr_deals`. |
| `/api/deals/[id]` | GET, PATCH, DELETE | Read / update / delete deal. |
| `/api/decision-tree/lead` | POST | Conversion-machine lead capture (FBAR/IRS compliance tree). Email+verdict, Turnstile verify + rateLimit, `enqueueNurture` vertical=`tracr`, `lead.qualified` op event. Verdicts: `high_priority`/`standard_review`/`casual_use`/`home_capture`. |
| `/api/digest` | GET | Daily digest for hub aggregator — placeholder score=0 "Quiet day" (TODO: wire to real report log). Probed by hub cron/smoke + ops/health. |
| `/api/generate-report` | POST | Post-payment report generation (invoked internally by paypal-capture). Auth via `x-internal-key` == `NOWPAYMENTS_IPN_SECRET`. Loads order, must be `paid`; REG-SCAN tier → `generateRegulatoryReport(case_context)`; else blockchain `generateFullReport`. Sends `sendReportReady` email. `maxDuration` 60. |
| `/api/inbound-lead` | POST, GET | HMAC-SHA256 inbound lead endpoint (`x-bizlegal-signature` vs `BIZLEGAL_INBOUND_SECRET`, timing-safe, fails 503 if secret unconfigured). Requires `classification.product === 'tracr'`. `enqueueNurture`. GET = ops probe shape. |
| `/api/ops/health` | GET | Token-gated env-presence audit (same pattern as brai; 11 declared keys). Probe target for hub fleet matrix. |
| `/api/payment/webhook` | POST | **Legacy NOWPayments IPN for tracr-specific orders** (HMAC-SHA512, fails closed). Marks `tracr_orders` paid (`finished`/`confirmed`) with `nowpayments_payment_id`; used by scan/checkout `ipn_callback_url`. |
| `/api/payments/nowpayments/start` | POST | Generic checkout path → pending `payment_orders` row + NOWPayments invoice. Hand-rolled copy (same as brai). |
| `/api/payments/nowpayments/webhook` | POST | Generic IPN → `payment_orders` lifecycle. |
| `/api/payments/paypal/start` | POST | Generic PayPal order/subscription → `payment_orders`. |
| `/api/payments/paypal/webhook` | POST | Generic PayPal webhook verify → `payment_orders`. |
| `/api/paypal-capture` | POST | PayPal redirect capture for tracr flow: captures PayPal order, marks `tracr_orders` paid (`paypal_capture_id`), then `fetch`s own `/api/generate-report` (x-internal-key). |
| `/api/report/[report_id]` | GET | Report page data — unauthenticated (report_id = bearer secret). Minimized response (email never leaves server; `ai_content` only for `paid`/`delivered`/`processing`). Uses `tracr_orders`. |
| `/api/scan/checkout` | POST | Scan form checkout: inserts `tracr_orders` (pending, provider nowpayments), creates NOWPayments **invoice** with `ipn_callback_url` = `https://tracr.bizlegal-ai.com/api/payment/webhook`, success_url `/report/<report_id>`, prices from `TIER_PRICES_USD`. |
| `/api/scan/report` | POST | Fulfillment for scan flow: order must be `paid`/`processing`, returns cached `ai_content` or generates `generateFullReport` → marks `delivered`. `maxDuration` 60. |

External calls: NOWPayments API, PayPal API, Supabase (anon + service-role), Anthropic (`generatePreview`/`generateFullReport`/`generateRegulatoryReport`), GoldRush/Covalent/Etherscan for chain data, Resend (`sendReportReady`/`sendLeadCapture`), `@bizlegal/nurture-enqueue` worker, hub `/api/ops/log` (HMAC).

## Pages (20 `page.tsx` files)

**Public marketing/conversion (indexable):**
| Path | Purpose / SEO |
|---|---|
| `/` | Home — `LandingV2` (`TRACR_CONTENT`). Lead → decision-tree/lead (`home_capture`)? — home lead badge handled by SiteShell layout. |
| `/decision-tree` | Free FBAR/IRS digital-asset disclosure decision tree → `/api/decision-tree/lead`. Has metadata. |
| `/analyze` | Free wallet scan UI → POST `/api/analyze`. Client-side, no metadata export. |
| `/scan` | Compliance-scan flow (`hero→form→scanning→email→results`): `/api/scan/checkout` + `/api/scan/report` + `/api/create-order`. No metadata export. |
| `/success` | PayPal/NOWPayments return handling: reads `report`/`token`/`method` params → `/api/paypal-capture`; `crossSellFor` from `@bizlegal/nurture-enqueue/cross-sell`. No metadata. |
| `/report/[report_id]` | Paid report viewer (Shape A generateFullReport / Shape B regulatory) → `/api/report/[id]`. No metadata. |
| `/pricing` | Tiers; **checkout links point to HUB**: `https://bizlegal-ai.com/checkout?product=tracr&tier=…&interval=…&amount=<cents>&label=…`. Has metadata. |
| `/methodology`, `/terms`, `/privacy`, `/refund`, `/disclaimer`, `/acceptable-use` | Public/legal pages, each with metadata title+description. |

**Authenticated workspace `app/(app)/` (route group; CRM), blocked in robots.ts:**
| Path | Purpose |
|---|---|
| `/ (app)` | CRM dashboard — stat tiles (deals, clients, activities) over `trcr_deals`/`trcr_clients`. |
| `/clients`, `/clients/new`, `/clients/[id]` | Client list / create / detail. |
| `/deals`, `/deals/new`, `/deals/[id]` | Deal list / create / detail. |
| `/pipeline` | Pipeline board grouped by stage (`StageSelector`, `DealCard`). |
- `app/(app)/layout.tsx` = `dynamic = 'force-dynamic'` + Sidebar shell. No auth guard found in layout (data exposure risk — workspaces render server-side from Supabase directly).

**SEO:** `app/robots.ts` — AI allowlist + blocks, disallows `/api/`, `/_next/`, **`/clients`, `/deals`, `/pipeline`, `/report/`, `/scan`, `/success`**. `app/sitemap.ts` = 10 public URLs. `public/llms.txt` + `public/dashboard.html`. vercel.json adds X-Frame-Options DENY / nosniff / Referrer-Policy security headers.

## package.json / vercel.json

- scripts: `dev`, `build` (`next build && node scripts/fix-manifests.mjs`), `start`, `lint` (`next lint`). `scripts/fix-manifests.mjs` post-build.
- deps incl. `@anthropic-ai/sdk@0.80`, `@supabase/ssr`, `@supabase/supabase-js@2.99`, `resend@6.9.4`, `@bizlegal/themes`, `turnstile-*`, `nurture-enqueue`, `rate-limit`.
- vercel.json: `functions` `app/api/generate-report/route.ts` maxDuration **60**, `app/api/analyze/route.ts` maxDuration **30**; security headers; **no crons**.
- next.config.mjs: transpile packages + `webpack` alias `@` → app dir.

## lib modules (11 files)

| Module | Exports (one-line each) |
|---|---|
| `lib/ai-prompts.ts` | `generateFullReport(wallet, txs, risk)` and `generatePreview(wallet, risk)` (Anthropic; 4-stage pipeline), `ReportContent` type; also `generateRegulatoryReport` (internal, from case_context). |
| `lib/covalent.ts` | `getTransactions(wallet, network)` and `getTokenBalances(wallet, network)` — GoldRush w/ Etherscan fallback (`GOLDRUSH_API_KEY`, `ETHERSCAN_API_KEY`). |
| `lib/crm-helpers.ts` | `STAGES`, `PRIORITY_CONFIG`, `stageConfig`, `formatCurrency`, `daysUntil` + Client/Deal/Activity/Document types. |
| `lib/email.ts` | `sendReportReady(order)` and `sendLeadCapture(lead)` via Resend. |
| `lib/nurture-enqueue.ts` | Re-export `enqueueNurture` from package. |
| `lib/ops/log.ts` | `logEvent()` / `logEventAsync()` → hub `/api/ops/log`, HMAC-signed (same module as brai). |
| `lib/paypal.ts` | `createPayPalOrder(amount, reportId, description)`, `capturePayPalOrder(orderId)`, `verifyWebhookSignature(...)` (PayPal Orders v2 + webhook verify). |
| `lib/risk-engine.ts` | `calculateRisk(txs)` → `RiskResult` (score/level/flags/metrics). |
| `lib/supabase.ts` | `getSupabase()` (anon, `NEXT_PUBLIC_SUPABASE_ANON_KEY`), `getSupabaseAdmin()` (**`SUPABASE_SERVICE_ROLE_KEY`**), + `supabase`/`supabaseAdmin` lazy singletons; re-exports crm-helpers. |
| `lib/tiers.ts` | `TIER_PRICES_USD` = {regulatory:29, standard:149, professional:349, enterprise:799}, `isValidTier(tier)` — single price source. |
| — | `lib/tiers.ts` prices differ from CLAUDE.md (BRONZE/SILVER). |

Components: `components/` (ActivityFeed, DealCard, NewClientForm, NewDealForm, PriorityDot, Sidebar, StageBadge, StageSelector, TopBar, TurnstileWidget, WalletTraceDecisionTree) + `app/components/ui-v2/` (Hero, IntelligenceCard, PricingTierCard, ThemeToggle, AgentCheckoutButton — **unimported, dead**) + `app/components/CookieConsent.tsx`.

## Env vars referenced (names only; tracr = 22)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `BIZLEGAL_INBOUND_SECRET`, `OPS_DASHBOARD_TOKEN`, `OPS_LOG_URL`, `RESEND_API_KEY`, `RESEND_FROM`, `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV`, `PAYPAL_WEBHOOK_ID`, `GOLDRUSH_API_KEY`, `ETHERSCAN_API_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GSC_VERIFICATION`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `NODE_ENV`.

Supabase tables: `trcr_clients`, `trcr_deals`, `trcr_activities`, `trcr_documents` (typed, no route), `tracr_orders`, `tracr_wallet_leads`, `payment_orders`.

## Integration points

- **Hub probes tracr:** `/api/cron/smoke` and `/api/ops/health` GET `https://tracr.bizlegal-ai.com/api/digest` + `/api/ops/health`.
- **Hub /checkout:** tracr `/pricing` builds `https://bizlegal-ai.com/checkout?product=tracr&…` URLs (hub resolves real price via `/api/payments/price`). So tracr has **two parallel payment stacks**: (a) app-native `/scan` flow (NOWPayments via scan/checkout+payment/webhook, PayPal via create-order+paypal-capture+generate-report) AND (b) generic `/api/payments/*` (shared pattern, writes `payment_orders`) — which **no page calls** (dead unless hit directly).
- **tracr → hub outbound:** `lib/ops/log` → `https://bizlegal-ai.com/api/ops/log` (HMAC `BIZLEGAL_INBOUND_SECRET`).
- **Inbound:** `/api/inbound-lead` accepts HMAC-signed lead routing from the hub Worker; `/api/generate-report` accepts `x-internal-key` (=`NOWPAYMENTS_IPN_SECRET`) self-calls.
- **Nurture:** decision-tree/lead + inbound-lead → `enqueueNurture` vertical=`tracr`; success page cross-sell via `@bizlegal/nurture-enqueue/cross-sell`.

## Notable / broken (both apps)

1. **BRAI is effectively lead-gen only.** No report generation/fulfillment code exists (`hub/app/api/brai/invoice` = STOP-SOLD 410 since 2026-09-02; hub `/blockchain-report` gate = waitlist). brai's own `/api/payments/*` routes still deployed but unused.
2. **Stale docs/env declarations.** Both CLAUDE.md surface lists mismatch actual routes. brai ops/health declares `CHAINALYSIS_API_KEY`/`OFAC_SDN_FEED_URL` (never read; real: `OFAC_LIST_URL`/`UN_SANCTIONS_URL`/`EU_SANCTIONS_URL`). tracr declares `TRACR_BLOCKSCOUT_API_KEY`/`TRACR_ETHERSCAN_API_KEY` (never read; real: `GOLDRUSH_API_KEY`/`ETHERSCAN_API_KEY`). tracr tiers/brai prices stale vs docs.
3. **Tracr `(app)` workspace has no auth guard** in layout — CRM pages render Supabase client data directly (`force-dynamic`); `/clients`, `/deals`, `/pipeline` are only fenced by robots.txt, not credentials.
4. **Brai `app/page.tsx` has no local metadata** (only root layout); `/` title comes from layout.
5. **Unused generic payment routes** (`/api/payments/*`) and unimported `AgentCheckoutButton` exist in both apps — dead surface still callable by anyone who guesses it.
6. **Two NOWPayments webhook listeners on tracr** (`/api/payment/webhook` for tracr_orders, `/api/payments/nowpayments/webhook` for payment_orders) — order book split across two tables.
7. `scripts/fix-manifests.mjs` runs post-build on tracr (manifest patching) — reason not audited.

---

## Summary table

| App | Routes | Pages | Crons | Key mechanisms | Broken / 404ing (probed or code) |
|---|---|---|---|---|---|
| **hub** | 121 (137 hdlrs) | 195 | 23 | Universal pay/start, HMAC ops spine, EA agents, outbound dispatch, affiliate/CRM/tools | /api/ops/health 404 on live; openapi.json 404; hub.bizlegal-ai.com NXDOMAIN (root is canonical) |
| **docai** | 33 | 35 | 0 | $97 scan funnel (NOWPayPal+PayPal HMAC IPN), Supabase tier-gate, Firm KB paywall | /api/digest hardcoded placeholder; PayPal webhook skip-verify; unused @bizlegal/payment+ops-log transpile |
| **forge** | 19 | 28 | 0 | Fail-closed HMAC-SHA512 IPN + idempotent claim gate, x-internal-secret fulfillment, paywalled preview, C-2 allow-list, Claude 14-vertical engine | No OCI Deal Router code; curator content path dead; /scan doc drift (/audit real); digest stub |
| **lexaudit** | 16 (18 hdlrs) | 19 | 1 | Monitor/diff cron 06:00, NIST signals, cert-specific payments | **Generic PayPal/NOWPayments checkout → /payment/* pages 404**; cert webhook HMAC skippable; legacy unguarded /api/generate-certificate |
| **leadforge** | 5 | 4 | 0 | Demo-generator/score-only/capture routes | No real data paths; Supabase clients unused; docs list /api/inbound-lead which doesn't exist; stale robots.txt |
| **bench** | 4 | 11 | 0 | Raw PostgREST, hub-pay integration, eval-lab | Supabase migration apply + CNAME unverified |
| **blog** | (hub-served) | 11 posts | 0 | 5-role publish pipeline → bizlegal-ea (CF Pages) | Newest post lacks `published:` → silently unserved; 9 files silent no-ops |
| **brai** | 9 (10 ep) | 13 | 1 (sanctions 06:00) | Lead-gen only; sanctions cache refresh | **Payments stop-sold — hub 410 since 2026-09-02**; no fulfillment code; /api/digest placeholder |
| **tracr** | 21 (26 ep) | 20 | 0 | Two parallel payment stacks, wallet forensics | **`(app)` CRM workspace has no auth**; /api/payments/* + AgentCheckoutButton dead-but-deployed |

> Total: **229 API routes / ~258 handlers · ~335 pages · 25 crons** across live surfaces (hub + 8). Payments fully stop-sold on brai; lexaudit generic checkout 404; blog publishes silently.

---

# 08 — Dark half of the fleet: per-app mechanism inventory

Companion to `decisions/NIGHT-AUDIT-2026-09-08.md` (headline state) — this is the exhaustive per-app route/page/migration/cron/payment/env/readiness inventory of the BUILT-NOT-DEPLOYED apps + non-audited shared services + the agents layer + Trigger.dev marketing.

## Scope A — Dark apps (`apps/`)

### A1. deal44 (`apps/deal44`) — deal44.bizlegal-ai.com
**Verdict: READY-TO-DEPLOY** (gates open, E2E verified 2026-09-07/08, real DB, both languages). Only blockers: no Vercel project/DNS + ILS rail.
- Pages: `/` (Hebrew, RTL), `/en` (twin), `/start`+`/en/start` (async intake), `/pricing` (amounts pulled from `@bizlegal/payment`), `/privacy` `/terms` `/disclaimer`, `/admin` (Phase-0 internal only, `INTERNAL_API_SECRET`-gated, to delete in Phase 1), `/r/[token]` (**the product** — party room, BrokerPanel/RoomView), `/sitemap.ts` `/robots.ts`.
- API: `POST /api/admin/rooms` (returns raw party links once), `POST /api/admin/rooms/[id]/activate` (links a **paid `payment_orders` row** to a room; verifies `product LIKE 'deal44_%'`, status active/paid), `GET|PATCH /api/r/[token]` (read room / tick task), `POST /api/r/[token]/tasks`, `/parties`, `/anchors` (re-dates template tasks only), `GET /api/cron/alerts` (daily digest 05:00 UTC, `?dry=1`).
- Payment: **does NOT call hub `/api/pay/start`.** Phase-0 money = manual shekel invoices recorded as `payment_orders` `gateway='manual'` (O-018 precedent); USD SKUs card+crypto. SKUs in registry: `deal44_room_setup_ils/usd`, `deal44_broker_monthly_ils/usd`. Night audit: `/api/pay/start` 503s non-USD (PayPal can't settle ILS) → shekel card sales invoiced manually.
- Migrations (applied): `20260908_deal44_rooms.sql` (`deal_parties`, `deal_tasks`, `deal_alerts`, `deal_events`, alters `deals`), `20260908_deal44_party_can_manage.sql` (`can_manage`), `20260908_deal44_task_source_and_provenance.sql` (`source`+`provenance`). Base `deal_rooms` from `20260704_deal_rooms.sql`. **`deals` row count = 0.**
- Cron: `vercel.json` → `/api/cron/alerts` `0 5 * * *` (maxDuration 60) + security headers (`/r/*` → `no-referrer`, `noindex`).
- Env: `NEXT_PUBLIC_DEAL44_SITE_URL`, `DEAL44_TOKEN_KEY` (32-byte hex — digest link cipher), `DEAL44_INTAKE_EMAIL`, `INTERNAL_API_SECRET`, `CRON_SECRET`, + shared (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`/`_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_REPLY_TO`, `BIZLEGAL_INBOUND_SECRET`, `OPS_LOG_URL`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`).
- Gaps: (1) no Vercel project/DNS; (2) ILS payment rail — 503 non-USD on `/api/pay/start`, manual-invoice fallback; (3) `deals` empty (first real room pending).

### A2. coguard (`apps/coguard`) — coguard.bizlegal-ai.com
**Verdict: READY-TO-DEPLOY** (real product: 7 pages + 15 API routes + 5 migrations). Gaps: missing 2 PayPal plan IDs + webhook secret; binder service not confirmed up.
- Pages: `/` (landing, BIFF demo), `/pricing` (Solo Shield $14.99/mo, Litigation $29.99/mo; yearly $129/$249), `/login`, `/dashboard` (compose + feed + hostility badges), `/dashboard/binders`, `/dashboard/settings`, `/attorney/[code]` (public code-gated read-only timeline).
- API: `POST /api/auth/login` + `/api/auth/callback` (Supabase SSR), `POST /api/messages/draft` (classify→BIFF→side-by-side), `POST /api/messages/send` (**writes `body_sha256` before Resend call**; append-only), `POST /api/provision` (x-internal-secret: inbox_alias+reply_address+CF KV), `GET|POST /api/binder/generate` (fire-and-forget to Hetzner `:8083`), `GET /api/binder/status/[id]`, `GET /api/digest` (OPS_DASHBOARD_TOKEN), `POST /api/inbound-lead`, `GET /api/ops/health`, `POST /api/attorney/verify`.
- Payment: **in-app**, NOT hub `/api/pay/start`. PayPal start/webhook + NOWPayments start/webhook. Prices hardcoded in start routes (`coguard_solo_monthly|yearly`, `coguard_litigation_monthly|yearly`) == registry SKUs. IPN base URL hardcoded `https://coguard.bizlegal-ai.com`.
- Migrations: `20260816_coguard_{subscribers,drafts,messages,binders,attorney_access}.sql` → tables `coguard_subscribers`, `coguard_drafts`, `coguard_messages` (append-only, no UPDATE/soft-delete policies), `coguard_binders`, `coguard_attorney_access`. Applied-status UNKNOWN (not stated in CLAUDE.md; night audit counts the 5).
- Cron: none (no crons array; digest is manual/token-gated).
- Env: `COGUARD_INTERNAL_SECRET`, `CF_COGUARD_ROUTING_TOKEN`, `CF_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `CF_COGUARD_KV_NAMESPACE_ID`, `COGUARD_BINDER_URL` (default `http://204.168.209.235:8083`), `NEXT_PUBLIC_COGUARD_SITE_URL`, `PAYPAL_PLAN_ID_COGUARD_SOLO_MONTHLY`, `PAYPAL_PLAN_ID_COGUARD_LITIGATION_MONTHLY` (**2 missing per audit**), `PAYPAL_CLIENT_ID`/`SECRET`/`ENV`/`WEBHOOK_ID`, `PAYPAL_COGUARD_WEBHOOK_ID`, `NOWPAYMENTS_API_KEY`/`IPN_SECRET`, `OPS_DASHBOARD_TOKEN`, `OCI_BASE_URL`, `NEXT_PUBLIC_SUPABASE_{URL,ANON_KEY}`, `SUPABASE_SERVICE_KEY`/`_ROLE_KEY`, `RESEND_API_KEY`, `BIZLEGAL_INBOUND_SECRET`, `OPS_LOG_URL`.
- Gaps: (1) no Vercel project/DNS; (2) PayPal Monitor plan IDs + webhook secret; (3) `coguard_binder.py` systemd on Hetzner (see B6).

### A3. falseecho (`apps/falseecho`) — falseecho.bizlegal-ai.com
**Verdict: READY-TO-DEPLOY** (builds, MVP migration applied, cron wired). Gaps: no Vercel project/DNS; PayPal Monitor plan; 4 engine keys.
- Pages: `/`, `/pricing` (Audit $29 one-time, Monitor $149/mo — `lib/tiers.ts`), `/scan`, `/report/[scan_ref]`, `/seo/[engine]/[entity]/[hash]` (programmatic SEO — one indexable page per SHA-256 evidence row), `/success`, `/contact`, `/disclaimer` `/privacy` `/terms`, `/sitemap.ts` `/robots.ts`.
- API: `POST /api/scan` (free=3-prompt sync probe; paid=`orderId` claims paid order + async 25-prompt battery), `POST /api/scan/run`, `GET /api/report/[scan_ref]`, `POST /api/create-order` (in-app PayPal), `POST /api/paypal-capture`, `GET/POST /api/payments/nowpayments/start` + `/webhook`, `GET|POST /api/fulfillment` (hub apex order claim), `GET /api/digest`, `POST /api/inbound-lead`, `GET /api/lead`, `GET /api/ops/health`, `GET /api/cron/monitor` (daily 06:00 UTC, CRON_SECRET-gated; ≤25 monitors).
- Payment: **in-app** PayPal + NOWPayments (NOT hub `/api/pay/start`). `TIER_PRICES_USD {audit:29, monitor:149}` single source shared with pricing page + hub price-map. Engines: openai/anthropic/perplexity/serpapi (`lib/engines/`), absent key degrades engine not 500.
- Migrations (applied): `20260901_falseecho_mvp.sql` → `falseecho_scans`, `falseecho_evidence`, `falseecho_orders`, `falseecho_monitors`, `falseecho_leads`.
- Cron: `vercel.json` → `/api/cron/monitor` `0 6 * * *` (maxDuration 300).
- Env: `.env.example` present; no local `.env`. `PAYPAL_PLAN_ID_FALSEECHO_MONITOR_MONTHLY` (dashboard action), `MARKETING_TRIGGER_URL` (M.3 emit), Turnstile, Plausible, GSC verification.
- Gaps: (1) no Vercel project/DNS; (2) PayPal Monitor plan id; (3) engine/email keys + verified test purchase.

### A4. sellerradar (`apps/sellerradar`) — sellerradar.bizlegal-ai.com
**Verdict: READY-TO-DEPLOY** (builds, both migrations applied, cron wired). Gaps: no Vercel project/DNS; PayPal Monitor plan; fixture fee-schedules only.
- Pages: `/`, `/pricing` (Audit $49, Monitor $99/mo — `lib/tiers.ts`), `/analyze`, `/report/[report_ref]`, `/seo/[slug]`, `/success`, `/contact`, `/disclaimer` `/privacy` `/terms`, sitemap/robots.
- API: `POST /api/analyze` (CSV ≤MAX_ROWS → fee-parse → margin/impact diff; free=top-line, paid=per-SKU), `GET /api/report/[report_ref]`, `POST /api/create-order`, `POST /api/paypal-capture`, `GET/POST /api/payments/nowpayments/start`+`/webhook`, `GET|POST /api/fulfillment`, `GET /api/digest`, `POST /api/inbound-lead`, `GET /api/lead`, `GET /api/ops/health`, `GET /api/cron/monitor` (weekly Mon 06:00 UTC; fee-schedule re-scan + impact diff).
- Payment: **in-app** PayPal + NOWPayments. Fees v1 from repo fixtures `data/fee-schedules/amazon-2025.json`/`amazon-2026.json` (`lib/schedules.ts`, `fee_schedules` table reserved for v2 live path).
- Migrations (applied): `20260902_sellerradar_mvp.sql` (`fee_schedules`, `sellerradar_reports`, `sellerradar_skus`, `sellerradar_orders`, `sellerradar_monitors`, `sellerradar_leads`), `20260907_sellerradar_monitor_scan_state.sql`.
- Cron: `vercel.json` → `/api/cron/monitor` `0 6 * * 1` (maxDuration 60).
- Env: `.env.example`; `PAYPAL_PLAN_ID_SELLERRADAR_MONITOR_MONTHLY`, `CRON_SECRET`, `MARKETING_TRIGGER_URL` (M.4), Turnstile/Plausible/GSC.
- Gaps: (1) no Vercel project/DNS; (2) PayPal Monitor plan; (3) live fee-schedule ingestion deferred (v1 fixtures).

### A5. leaseparse (`apps/leaseparse/web`) — leaseparse.bizlegal-ai.com
**Verdict: NEEDS-WORK** — code complete + typechecks + 22 tests, but migrations unapplied, buckets missing, checkout gated off.
- Pages: `/` (landing), `/dashboard`, `/dashboard/leases/[id]`, `/dashboard/closings/[id]`.
- API: `POST /api/parse/start` (**hub `/api/pay/start` bridge**, product `leaseparse_abstract_59`, gateway crypto|card, gate `LEASEPARSE_CHECKOUT_LIVE` → else 503), `POST /api/leases/upload-url` (signed upload), `POST /api/leases/ingest` (pipeline), `GET/PATCH /api/leases/[id]`, `GET/POST /api/properties`, `GET/PATCH /api/closings[/[id]]`, `POST /api/inbound-lead`.
- Pipeline: `pdf-text` (text-layer guard; scanned → auto-refund) → `hermes-first` (Ollama $0) → `coerce` (typed `LeaseAbstract`) → `claude-fallback` ONLY <0.85 confidence (`CONFIDENCE_FLOOR`) → `date-engine` + `risk/score-engine` (pure) → `leaseparse_leases` → `report/deliver` (HTML → `reports` bucket + link email).
- Payment: hub `/api/pay/start`; single SKU **$59** — scope fixed.
- Migrations (**unapplied per CLAUDE.md 2026-08-20**): `20260728_leaseparse_leases.sql`, `20260728_trio_properties.sql` (+ `20260728_closeflow_transactions.sql` shared). Buckets `lease-documents` (private) + `reports` (public) not created.
- Cron: none. Env: `BIZLEGAL_INBOUND_SECRET`, `OPS_LOG_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ANTHROPIC_API_KEY`, `OLLAMA_BASE_URL`, `RESEND_API_KEY`, `HUB_BASE_URL`, `LEASEPARSE_CHECKOUT_LIVE`.
- Gaps: (1) apply 4 migrations; (2) create 2 buckets; (3) set envs + flip gate + verified test purchase.

### A6. closeflow (`apps/closeflow/web`) — closeflow.bizlegal-ai.com
**Verdict: SCAFFOLD-ONLY** (2026-07-28).
- Pages: `/` landing only.
- API: `POST /api/transaction/start` (checkout **stub → 503 `checkout_not_live`**; validation live; intended hub `/api/pay/start` product `closeflow_transaction_39` $39), `POST /api/inbound-lead`.
- Uses `@bizlegal/closing-engine` packages (checklist templates + date calculator). Migration `20260728_closeflow_transactions.sql` unapplied. Env: `BIZLEGAL_INBOUND_SECRET`, `OPS_LOG_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `RESEND_API_KEY`.

### A7. propsignal (`apps/propsignal/web`) — propsignal.bizlegal-ai.com
**Verdict: SCAFFOLD-ONLY** (2026-07-28; build order = trio phase 3).
- Pages: `/` landing, `/report/[id]` (viewer stub).
- API: `POST /api/report/start` (**stub → 503 `checkout_not_live`**; intended hub `/api/pay/start` product `propsignal_report_49` $49), `POST /api/inbound-lead`.
- `lib/sources/{fema,epa,socrata,perplexity}.ts` (FREE-only data, ≤$30/mo Perplexity cap) + `score-engine.ts`. Migrations `20260728_propsignal_reports.sql` + `trio_properties.sql` unapplied. Env: `BIZLEGAL_INBOUND_SECRET`, `OPS_LOG_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `PERPLEXITY_API_KEY`, `RESEND_API_KEY`.

### A8. caseaudit (`apps/caseaudit`) — **DEAD**
No source at all — only `fixtures/{en-out,es-out}/` (report.json, engine-check.json, cost.json, chronology.docx, case-audit.pdf). No package.json, no routes. Night audit concurs: "fixtures only, no source (dead)".

### Other apps/ tombstones (one-line)
- `dealdesk` — docs + stale `.next` artifacts only, **source gutted** (DEAD).
- `apps/funnel-mvp` — node_modules + tsconfig.tsbuildinfo only; reverted 2026-05-24 (canonical = DocAI).
- `brai` — STOP-SOLD (no longer purchasable).

---

## Scope B — Shared services (`services/`, non-audited set)

| Item | Path | Purpose | Schedule/Trigger | Status |
|---|---|---|---|---|
| marketing (Trigger.dev) | `services/marketing/` | M.1/M.6-lite tasks; M.7 = hub dashboard (not here) | see Scope D | RUNNING (per night audit); placeholder project id |
| outreach | `services/outreach/` (4 py + config) | OCI deal router (`oci_funnel.py` daily 08:00, `oci_deal_closer.py` auto invoice, `partner_onboarding.py` targets DIFC/SG/US) + O-015 `stage_outreach.py` 30→10→3→1 **DRAFT-ONLY** (post-ef3d90e hard gates: suppression + consent) | cron: not present in `cron_jobs.txt` | BUILT, DARK |
| funnel-mvp | `services/funnel-mvp/` | Tombstone — original Fastify contract funnel replaced by apps/docai/web 2026-05-23 | n/a | **DEAD** (documented; delete after 30d DocAI revenue) |
| browser-extension | `services/browser-extension/` | MV3 (Chrome+FF) capture ext → hub `POST /api/extension/capture` → `extension_captures` (migration `apps/hub/supabase/migrations/20260703_extension_captures.sql`) | on-demand (context menu / 4-button popup) | BUILT, UNDISTRIBUTED (no Web Store, icons placeholder) |
| spy | `services/spy/` (4 py) | competitor intel: `competitor_pricing` (Anthropic extraction), `competitor_content` (keyword gaps), `competitor_backlinks` (Common Crawl CDX), `competitor_social` (HN/Reddit) → `spy_intel` (`apps/hub/…/20260703_spy_intel.sql`; ops dash `/ops/spy`) | manual first; **not on cron** | BUILT, DARK |
| systemd | `infrastructure/systemd/coguard-binder.service` | runs `/opt/bizlegal/curator/coguard_binder.py` (CoGuard court-binder) on :8083, env from curator `.env` | systemd (always) | config present; deploy UNKNOWN |
| apply_pending_migrations.py | `services/apply_pending_migrations.py` | idempotent runner over `supabase/migrations/*.sql` via `SUPABASE_DB_URL` + `schema_migrations` ledger | manual | tool |
| cron_jobs.txt | `services/cron_jobs.txt` | authoritative Hetzner curator crontab (28 live entries): aeo_loop, marketing_copy, daily_digest, env_audit, weekly_health, marketing_revenue, self_heal (*/5m), code_fixer (*/30m), content_enricher (+v2), aeo_loop_v2, index_watchdog, seo_dispatcher (00/12), revenue_alerter (*/1m), daily_revenue_summary, aeo_revenue_agent (07:00), conversion_funnel_agent (08:00), enterprise_closer_agent (09:00), growth_agent, growth_measure, distributor (15:30), dunning (09:30) | crontab on `root@204.168.209.235` | RUNNING; **cold outbound, opt_in_outreach, engaged_monetization REMOVED/disabled 2026-07-10/08-16** |
| cron_installer | `services/cron_installer.py` | regenerates cron_jobs.txt | manual | tool |
| vercel_env_{lister,paster} | `services/` | read-only env inventory / bulk env write across `[hub,docai,tracr,lexaudit,brai,leadforge,forge]` (note: dark-app projects absent) | manual | tool |

---

## Scope C — Agents (`agents/`)

| Agent layer | Path | Contents | Trigger / consumer | Target tables | Status |
|---|---|---|---|---|---|
| EA brain | `agents/ea/` | `EA-CLAUDE.md`, `EA-AGENTS.md`, `INITIALIZE_PROMPT.txt`, ~8 prompts (post-generate/enrich, lead-extract/critique/score/summary, oci-referral-contract, email-welcome), schemas, templates, context/, decisions/log.md (log = Apr-2026 historical, ends at test leads) | CF Worker `services/worker` lead-intake + hub ea-runner (Worker currently inlines copies of lead prompts; sync debt outstanding post-Z7) | lead profiles, reports | ALIVE (as reference; consumed via Worker copies) |
| Ops agents | `agents/ops/` | CLAUDE.md + 17 agent specs (morning/revenue/health/pitch/content/partner ops, mrr-review, friday-retro, monthly-scorecard, writer, crawler, contact, invoice, thank-you, cold-email, sqa-demo, stripe-atlas) + canonical-vars/runbook/revenue/fleet-registry/contacts context + decisions/log.md (only 2 rows, 2026-05-23) | claims Daily 08:55 / every-15m / hourly etc. — **executed by curator machine**, not these files; split brain with `services/agents/*` | ops events, revenue | DOCUMENTED-ONLY (decision log ~empty; executor is services/agents) |
| Outbound v2 | `agents/outbound/` | `ROUTINE-headhunter.md` (cloud routine `bizlegal-outbound-headhunter`: load campaigns → Clay source → digest → draft → classify replies → learn), templates `us-solo-revenue-report.md` (campaign #1) + `partners-bookkeepers.md` (campaign #2) | weekly cloud Claude routine; deterministic sender = hub `POST /api/cron/outbound-dispatch` (only sender, fail-closed `OUTBOUND_AUTOSEND`), feedback = hub `/api/webhooks/outbound`, approval = hub `/api/sales/campaigns`; invariants in `packages/email/src/outbound.ts` + `apps/hub/lib/outbound/{lawful-basis,icp}.ts` | `sales_campaign`, `sales_lead`, `sales_outreach`, `sales_reply`, `email_suppression_list` | **BUILT + DARK** (needs `notes.bizlegal-ai.com` DNS/mail, Instantly, ZeroBounce; `OUTBOUND_AUTOSEND` unset → dispatch sends nothing) |
| Socials | `agents/socials/` | CLAUDE.md, README, output contract, 4 phase plans (buffer→substack/x→instagram→tiktok/youtube), 20+ `SKILL.md` specs (buffer-publisher, carousel-brief, content-series-planner, thread-adapter, newsletter-adapter, engagement-triage, etc.) | mapped to curator `services/agents/socials_agent.py`/`growth_agent` + Blotato | `social_drafts` (432 rows), `social_experiments` | DOCUMENTED-ONLY (skills library; needs BLOTATO_API_KEY) |
| REVENUE-AGENTS-MAP | `agents/REVENUE-AGENTS-MAP.md` | intended map: 5 revenue circles (DocAI SQA / Reddit organic / OCI referral / Forge / Enterprise) + agent registry + model stack + revenue blockers | plan doc | — | STALE (2026-06-09; superseded by night audit) |
| Curator machine | `services/agents/` (39 py + orchestrator.py + registry.py + _env.py) | executor half — aeo_loop(+v2), growth_agent/measure, conversion_funnel_agent, enterprise_closer_agent, marketing_copy/revenue, self_heal, code_fixer, content_enricher(+v2), index_watchdog, seo_dispatcher, revenue_alerter, salesperson, monetization, lead_capture, newsletter, socials, daily_revenue_summary + 9 disabled/removed (cold outbound / opt_in / engaged_monetization) | Hetzner crontab (cron_jobs.txt) | daily_gaps, seo_pages, sales_outreach, email_suppression_list, agent_runs (8,220) | RUNNING (LIVE) but LLM-reliant — Anthropic $0 kills every agent silently |

**AGENTS.md** (2026-09-06, `agents/AGENTS.md`) is the authoritative index — matches the above; lists Vercel hub crons (11) + product crons (falseecho/sellerradar monitor) + CF Workers (intake/telegram-hub/gsc-bot).

---

## Scope D — Trigger.dev marketing tasks

Config `services/marketing/trigger.config.ts`: `project: process.env.TRIGGER_PROJECT_REF ?? "proj_replace_me"` — **placeholder `proj_replace_me` CONFIRMED present** (a real project id must be supplied via env/`--project` at deploy; night audit reports M.1/M.6/M.7 running, so deployed with `TRIGGER_PROJECT_REF` set — the placeholder only guards a blind deploy). Runtime `node`, maxDuration 300, dirs `["trigger"]`.

| Task id | File | Cron | Does | Status |
|---|---|---|---|---|
| `process-content-queue` (M.1) | `services/marketing/trigger/process-content-queue.ts` | `0 */6 * * *` UTC | drain `content_queue` pending → claim `processing` → POST to n8n `N8N_MARKETING_WEBHOOK_URL` with `callback_url https://bizlegal-ai.com/api/marketing/callback`; missing webhook → clean skip; failed row returns to `pending` | BUILT; n8n side (M.2) external/unprovisioned → run currently skips |
| `weekly-newsletter` (M.6-lite) | `services/marketing/trigger/weekly-newsletter.ts` | `0 13 * * 1` UTC (Mon) | pull `published_content` last-7d → HTML grouped by product → Resend to `FOUNDER_EMAIL`; missing email env → log + clean exit; full M.6 (milestone case-studies, comparison posts) deferred | BUILT; sends only when Resend env present |

M.7 is **not** a trigger task — it is the hub `/ops/content` dashboard (docs/MARATHON-STATUS-2026-09-06.md).

---

## Readiness summary

**Dark apps (Scope A):**
| App | Verdict | Specific gaps |
|---|---|---|
| deal44 | READY-TO-DEPLOY | Vercel project+DNS; ILS rail (/api/pay/start 503 non-USD → manual-invoice); `deals`=0 |
| coguard | READY-TO-DEPLOY | Vercel project+DNS; 2 PayPal plan IDs + webhook secret; binder service up? |
| falseecho | READY-TO-DEPLOY | Vercel project+DNS; PayPal Monitor plan; engine keys + test buy |
| sellerradar | READY-TO-DEPLOY | Vercel project+DNS; PayPal Monitor plan; live fee-schedule deferred |
| leaseparse | NEEDS-WORK | 4 migrations unapplied; 2 buckets; gate env + test buy |
| closeflow | SCAFFOLD-ONLY | no code beyond landing + 2 stub routes |
| propsignal | SCAFFOLD-ONLY | no code beyond landing + 2 stub routes |
| caseaudit | DEAD | fixtures only, no source |
| dealdesk / apps/funnel-mvp | DEAD | source gutted / reverted |

**Services (Scope B):** RUNNING → marketing trigger tasks, curator crontab (cron_jobs.txt), systemd binder config. DARK/BUILT-NOT-RUNNING → outreach (draft-only), spy (manual), browser-extension (undistributed). DEAD → funnel-mvp (tombstone).

**Agents (Scope C):** ALIVE/deployed → curator `services/agents` machine (39 scripts; LLM-dependent — Anthropic credits $0 = silent failure). DOCUMENTED-ONLY → agents/ea, agents/ops, agents/socials (skills). BUILT+DARK → agents/outbound (v2 engine; needs DNS + Instantly + ZeroBounce + `OUTBOUND_AUTOSEND=1`). STALE → REVENUE-AGENTS-MAP.

**Manual ops (carried from night audit, unchanged relevant to this scope):** deploy 5 built apps (deal44/coguard/falseecho/sellerradar/leaseparse) — Vercel project Root Directories `apps/deal44`, `apps/coguard`, `apps/falseecho`, `apps/sellerradar`, `apps/leaseparse/web`; apply leaseparse/trio migrations + buckets; create 2 PayPal monitor/recurring plan IDs; verify coguard binder service; outbound domain + mailboxes before `OUTBOUND_AUTOSEND`.

---

# Night Audit Deep — Bug Ledger (2026-09-08 sweep)

Methods: marker grep (apps/services/packages/agents, no node_modules/.next), incident-doc extraction, env-vault↔code cross-check (names/state only), payment-path trace, `@bizlegal/hub` typecheck (PASS, exit 0, <300s). Deduped across all sources.

## Bug table

| # | Bug | Where | Sev | Status | Impact | Fix needed | Owner |
|---|---|---|---|---|---|---|---|
| 1 | **Prod is 31 commits behind** main (current branch `feat/deal44-phase0` HEAD `1400bf9`, prod `3aa2a33`, +45 staged files on the branch). All revenue work (Practice Revenue $99, AI review $200, kit $49, outbound engine, deal44, falseecho, sellerradar, docai `/payment/cancelled` fix) returns 404 on prod | entire fleet | CRITICAL | OPEN | $0 revenue; O-018/020/021 features invisible | fix preview build → merge revenue-marathon + deal44-phase0 → deploy | Moses (push/merge) + code |
| 2 | **Preview build `9a635f7` FAILED** (Sep 7). Blocks merge. Branch typecheck now PASSES at HEAD+staged, so cause is likely `next build` prerender/lint/env-at-build, not tsc. Root cause not visible from repo alone | vercel preview | CRITICAL | OPEN/UNKNOWN | no deploy path | run `next build` locally on branch to capture the first error; fix+commit | code |
| 3 | **compliance-snapshot checkout logic inverted**: if `STRIPE_SECRET_KEY` present → 503; if ABSENT → returns `{unlocked:true}` (free unlock). Today Stripe is absent ⇒ the $9/$19 report unlocks client-side for free | `apps/hub/app/api/compliance-snapshot/checkout/route.ts:26-37` | CRITICAL | OPEN | revenue bypass; every "unlock" is free | flip: no key ⇒ 503; key ⇒ real Stripe intent | code |
| 4 | **NOWPAYMENTS_IPN_SECRET is a verbatim duplicate of BLOCKCHAIN_SECRET** (vault: equal literals) | vault | CRITICAL | OPEN | shared secret across unrelated rails; a leak compromises both | rotate both independently | Moses |
| 5 | **OPS_DASHBOARD_TOKEN vault↔Vercel prod MISMATCH** → `/ops`, `/api/ops/health`, HMAC chain lock out (404) | hub ops | CRITICAL | OPEN | Z7 verification impossible; ops dark | resync value in Vercel env + redeploy | Moses |
| 6 | **Outbound engine fail-closed but 6 prerequisites missing**: OUTBOUND_SENDING_DOMAIN=notes.bizlegal-ai.com **NXDOMAIN** (no DNS), OUTBOUND_POSTAL_ADDRESS EMPTY, OUTBOUND_AUTOSEND EMPTY, INSTANTLY_API_KEY EMPTY, INSTANTLY_WEBHOOK_SECRET EMPTY, ZEROBOUNCE_API_KEY EMPTY | vault + DNS | CRITICAL | OPEN | engine can never send; $0 from O-021 | DNS+mailboxes+Instantly+ZeroBounce, POSTAL_ADDRESS, A AUTOSEND=1 | Moses |
| 7 | Anthropic API credits at $0 (night audit) — every LLM agent + product fails silently | account | CRITICAL | OPEN | all LLM paths dead | top up | Moses |
| 8 | **Stripe keys invalid/stub**: STRIPE_SECRET_KEY short (`sk_live_…` 401 per API-AUDIT), STRIPE_WEBHOOK_SECRET short `whsec_…`; Stripe 0 vars wired to Vercel; deferred to US LLC | vault | HIGH | OPEN | no card rail; compliance-snapshot free-unlocks (see #3) | rotate real keys or remove the free-unlock stub | Moses |
| 9 | **LexAudit PayPal webhook does NOT insert `compliance_subs`** — only the nowpayments webhook provisions. PayPal-purchased $99/mo monitor produces no subscription row | `apps/lexaudit/app/api/payments/paypal/webhook/route.ts` | HIGH | OPEN | PayPal buyers = no monitor = no recurring product | port provisioning block to paypal webhook | code |
| 10 | **wire/start inserts `gateway:'wire'`** which the `payment_orders` CHECK rejects → every wire order insert fails; fix only exists in unmerged migration `20260908_deal44_rooms.sql` (drop+re-add constraint) | `apps/hub/app/api/payments/wire/start/route.ts:119,169` + migration | HIGH | OPEN | wire payments can never complete | apply migration on prod after merge | code+Moses |
| 11 | **All four `/api/digest` endpoints are static "quiet day" stubs** — hub, lexaudit, docai, forge. Anti-hallucination contract is honored (never fabricate) but real signals never wired | hub `apps/hub/app/api/digest/route.ts:19`; lexaudit `apps/lexaudit/app/api/digest/route.ts:29`; docai `apps/docai/web/app/api/digest/route.ts:10`; forge `apps/forge/apps/web/app/api/digest/route.ts:9` | HIGH | OPEN | Today's Brief shows fabricated-empty; aggregator validates shape only | wire to real tables (score-update pipeline land) | code |
| 12 | **Vault carries prod-broken/stale values**: NEXT_PUBLIC_API_URL=`http://localhost:8000`; APP_ENV=`development`; APP_URL=`https://github-blockchain.vercel.app` (stray); REDIS_URL=`redis://localhost:6379` (no password, localhost); NEXT_PUBLIC_DEAL44_SITE_URL EMPTY | vault | HIGH | OPEN | localhost env leaks into any surface that consumes it; deal44 links broken | fix/delete stale entries | Moses (vault) |
| 13 | **OPS_LOG_URL is EMPTY in vault** (HUB_BASE_URL EMPTY, HUB_URL ABSENT) — gsc-bot worker skips ops-log (`if (!env.OPS_LOG_URL) return`); Hetzner `ops_log.py` falls back to the default URL | vault | HIGH | OPEN | ops log telemetry silently missing from worker paths | set OPS_LOG_URL/HUB_BASE_URL | Moses |
| 14 | **Curator content flywheel down**: scout calls `OLLAMA_TUNNEL_URL/api/chat` → curator.bizlegal-ai.com **404** (CF Zero Trust blocks tunnel) and wants filter model `gemma4:e2b` which exists nowhere reliable → last scout `0/12 passed` | `services/hetzner/scout.py:68,175` | HIGH | OPEN | blog stale since 2026-07-27; content engine dead | allow Service Auth on tunnel route; stand up gemma | code+Moses |
| 15 | **GSC-bot worker unauthenticated**: GSC_SERVICE_ACCOUNT_JSON EMPTY, GSC_BOT_ADMIN_TOKEN EMPTY → weekly cron (Mon 02:00, wrangler.toml) `getAccessToken` fails | `services/gsc-bot/src/index.ts:112` | HIGH | OPEN | no sitemap re-submission across 8 surfaces | add service account + admin token to Vercel/worker | Moses |
| 16 | **CoGuard worker KV dead**: CF_COGUARD_KV_NAMESPACE_ID EMPTY, CF_COGUARD_ROUTING_TOKEN EMPTY, CF_ACCOUNT_ID ABSENT, COGUARD_ALIASES KV binding not declared → email→subscriber routing can't run | `services/coguard-worker/src/index.ts:113` | HIGH | OPEN | co-parenting inbound flow dark | create KV `COGUARD_ALIASES` + bind + set tokens | Moses |
| 17 | **PayPal webhook not verifiable**: PAYPAL_WEBHOOK_ID present (17ch) but webhook secret / transmission verification asset missing per night-audit → IPN on PayPal can't be trusted/verified | lexaudit/docai/tracr/hub paypal webhooks | HIGH | OPEN | PayPal-purchased orders may not reconcile | set webhook secret; verify transmissions | Moses |
| 18 | **Deal44 ILS card rail**: `/api/pay/start` 503s non-USD on card (by design; PayPal can't receive ILS). Current staged branch opens crypto for ILS; prod main still 503s all non-USD. Deal44 not deployed anyway | `apps/hub/app/api/pay/start/route.ts:99-108` | HIGH | OPEN (deliberate) | ₪2500 SKU only invoiceable, not checkoutable | ILS rail or ship manual-invoice phase‑0 | code/Moses |
| 19 | **Migration gaps (prod DB)**: `20260906_content_queue.sql`, `20260728_*` trio, `20260908_*` deal44 migration set unapplied → deals=0, content queue empty, outbound/sellerradar tables missing | supabase/migrations | HIGH | OPEN | features built on those tables no-op on prod | apply pending migrations after merge | code+Moses |
| 20 | **`catch {}` silent fail-OPEN in sanctions screening**: brai screenAddress/sanctions cache reads swallow every error and return "no hits" | `apps/brai/lib/chain/sanctions.ts:110,149` | MEDIUM | OPEN | cache outage reports a clean screen — false-negative liability on an OFAC/UN/EU check | log failure + surface "screen unavailable" state | code |
| 21 | **closeflow `/api/transaction/start` is a stub** → checkout_stub, permanent 503 `checkout_not_live` | `apps/closeflow/web/app/api/transaction/start/route.ts:6,86` | MEDIUM | OPEN (scaffold) | $39 product unpurchasable | real checkout or delist | code |
| 22 | **blog 404s / stale**: deployed CF-Pages blog stale since 07-27; `content/blog/` MDX in this repo is not the deploy source (separate bizlegal-ea repo) → new MDX never serves | content/blog + blog.bizlegal-ai.com | MEDIUM | OPEN | content flywheel invisible; links 404 | sync deploy source; publish path | code/Moses |
| 23 | **Fetch-cache deadline-cron staleness bug (deal44) FIXED on branch only** (`cache:'no-store'` + test, `apps/deal44/lib/db.ts`); every other app constructing supabase client in a route handler (leaseparse closings, coguard messages) is un-audited for the same silent-stale-read shape | various | MEDIUM | OPEN on prod | reminder cron reading cached DB state | port pattern check fleet-wide | code |
| 24 | **FirmCited price-flip pending**: temp $20 audit keyed by commit `4ccce6a`; needs `git revert 4ccce6a` + deploy to restore $490 (Gate 1 test-buy first) | FirmCited repo | MEDIUM | OPEN | underpriced product in prod | do Gate-1 buy then revert+deploy | Moses |
| 25 | **ops_alerts 403-spam every 5 min** (reported by night audit agents; not independently re-verified in this sweep) | ops_alerts service | MEDIUM | OPEN(verify) | alert noise; token mismatch (see #5) likely | verify + sync token | Moses |
| 26 | **monetization log 199k lines, no logrotate** (reported); Hetzner systemd units present, no logrotate found in infra | Hetzner | LOW | OPEN(verify) | disk growth; log flood | add logrotate for curator/systemd logs | code |
| 27 | **Dead Vercel projects clutter**: orphaned `hub/web/leadforge` (ERROR deploys May 2026), `vercel-trcr` (never deployed) | Vercel | LOW | OPEN | confusion, no cost | delete | Moses |
| 28 | **Docai/forge `.vercel/project.json` point at stale shared `web` projectId** (local-link bug, not deploy bug) | apps/{docai,forge}/.vercel | LOW | OPEN | local `vercel` deploys target wrong project | fix projectId per app or drop file | code |
| 29 | **Legacy April report items (mostly superseded, verify)**: `/guides/*` route mismatch, footer hardcoded Dor-Innovations socials, tools listing non-functional slugs, enterprise page duplication | hub | LOW | LEGACY | stale links/branding | verify against current app | code |

## Fix-ready now (code) vs Moses-blocked

**Code-fixable this week:** #3 (compliance-snapshot gate flip), #9 (lexaudit paypal→compliance_subs), #11 (digest stubs stay honest but can be wired), #20 (sanctions fail-open logging), #23 (fleet fetch-cache audit), #28 (project.json), #2 (local `next build` to capture preview failure).

**Moses-blocked (env/DNS/merge/accounts):** #1/2 (merge+deploy), #4/5/8/17 (secret rotation + token resync), #6 (domain+mailboxes+Instantly+ZeroBounce), #7 (top up Anthropic), #12/13 (vault hygiene), #15/16 (GSC/CoGuard credentials), #19 (apply migrations), #24 (FirmCited revert), #25/26/27 (ops/DNS/Vercel housekeeping).

---

# PART 3 — CONCLUSIVE SYNTHESIS (2026-09-08)

## The one-line verdict
**The fleet is infrastructure-rich and revenue-empty: 11 surfaces serve HTTP 200 and every mechanism has been built, but $0 has ever been captured, the content flywheel is dead at its first hop, prod is 31 commits behind, and 29 bugs (7 CRITICAL) sit in the ledger — most of them fixable in a single focused session.**

## Quadrant map — every mechanism, one of four states

### 🟢 LIVE & WORKING
- 11 HTTP-200 surfaces (hub, docai, forge, tracr, lexaudit, brai[stop-sold], leadforge, bench, blog[stale], router, cited) + www→308.
- Payments: NOWPayments + PayPal live on hub/docai/forge/tracr/bench/cited; FirmCited Monitor $299 + retainer $2K sellable.
- Infra: Hetzner box up 144d (curator-bot, publisher :8082, ollama, redis, nginx, netdata, self-heal, 56 root crons firing); OCI router `/health` redis:up supabase:up; docker n8n+marimo up 4mo; lead-intake worker live (3 crons); marketing trigger.dev M.1/M.6 running; seo-agents cron suite alive (publish_blog pushed 40/40 on 09-07); hub typecheck PASSES.
- SEO/AEO plumbing: sitemaps + robots + **llms.txt on all 10 hosts**, AI crawlers (GPTBot/ClaudeBot/PerplexityBot/OAI-SearchBot) explicitly allowed, hub SILO hubs (68 guides/13 regs/10 tools/7 learn) with JSON-LD, FirmCited audit/monitor engines fire live against OpenAI/Anthropic/Perplexity/SerpAPI.

### 🔴 BROKEN (built, not functioning)
- **Content flywheel dead at hop 1:** scout→`curator.bizlegal-ai.com/api/chat` 404 — the route exists NOWHERE (old publisher has no /api/chat; cloudflared is NOT on the box; the tunnel runs on the Windows box → localhost:11434) AND CF Access denies the service token (`service_token_status:false`). Last scout `0/12 passed; exiting`. No gemma anywhere (box has mistral-nemo + llama3.2:3b only).
- **Blog never reaches readers:** CF Pages deploy stalled ~7 weeks; 40 posts pushed 09-07 + newest pillar post all **404 live**; newest post also lacks `published:` frontmatter (silent no-op).
- **n8n "My workflow":** 283/288 runs error (Ollama host + Telegram creds broken), 0 webhooks, writes wrong table (`gap_pages`).
- **brain.py idle since Jun 17** (no scheduler; Telegram-pick only); 10 daily_gaps rows stuck `picked`.
- **OCI is a test dummy:** every row in all 4 owned tables is the 2026-04-26 E2E test; **no real lead ever routed**; deployed image 3+ months behind; `payout-reconciler.timer` never installed → nightly zero-value Telegram spam.
- **Workers:** telegram-hub, gsc-bot, coguard-email-worker all return CF `1042` (not deployed to this account); gsc-bot cron + coguard Email Routing (KV blank) dead.
- **GSC unwired** (empty service account) → no indexation feedback; keyword plan **94% unwritten** (pillars 6/7/8 = PSP, Singapore MAS, India DPDPA = zero content).
- **AEO/GEO measurement is a lie:** `seo_citation_log` has **zero writers**; visibility index has no cron + human publish gate; 0/39 AEO-calendar posts live; 94% of the 365-post calendar unwritten.
- **LexAudit:** PayPal/NOWPayments checkout → `/payment/*` pages **404**; cert webhook HMAC skippable; legacy unguarded `/api/generate-certificate`; PayPal webhook never writes `compliance_subs`.
- **TRACR `(app)` CRM has NO auth** (any visitor). **BRAI** 410 stop-sold since 09-02 with no fulfillment code. **hub.bizlegal-ai.com NXDOMAIN** (apex only). **Forge** has no OCI Deal Router code despite docs.
- **certbot** broken (pyOpenSSL); **pm2** failed (no dump); **bizlegal crons** MODULE_NOT_FOUND; **ops_alerts** 403-spams every 5 min; **monetization log** 199k lines (no logrotate); **openclaw-gateway** 1.5GB RAM.

### 🟡 BLOCKED-ON-MOSES (needs a human action, then works)
1. **Anthropic credits $0** — every LLM agent fails silently. TOP UP NOW.
2. **Prod 31 commits behind** (`main 3aa2a336`; branch HEAD `1400bf9` +45 staged) — every revenue feature 404s on prod. Fix preview `9a635f7` (next-build/env, NOT tsc) → merge → deploy.
3. **OPS_DASHBOARD_TOKEN** vault↔Vercel mismatch → /ops + health 404.
4. **NOWPAYMENTS_IPN_SECRET == BLOCKCHAIN_SECRET** (duplicate literal) — rotate.
5. **Outbound engine 6 prereqs missing:** `notes.bizlegal-ai.com` NXDOMAIN, POSTAL_ADDRESS/AUTOSEND/INSTANTLY/ZEROBOUNCE empty.
6. **Gate 1 test buy** (FirmCited $20 → revert to $490).
7. **OCI:** fix coguard import (`from storage import get_supabase` — ImportError at boot) BEFORE any rebuild; B9 DNS (`deals`/`oci` NXDOMAIN); install reconciler timer; **rotate Telegram token (plaintext in journalctl)**.
8. **Deploy 5 dark apps** (deal44, coguard, falseecho, sellerradar READY; leaseparse needs migrations+buckets) + DNS; 2 PayPal plan IDs + webhook secret.
9. **Wire GSC service account + IndexNow** (`/posts`→`/blog` prefix fix).
10. **Resolve Grok Bot conflict:** O-018 rejected Grok Bot setups, but cited.bizlegal-ai.com/grok-bot is LIVE selling them — does that decision bind FirmCited?

### 🔧 FIX-READY (code fixes Claude can apply in one session)
- `compliance-snapshot/checkout` **inverted logic** — no Stripe key ⇒ free `unlocked:true` (revenue bypass); key present ⇒ 503. (`apps/hub/app/api/compliance-snapshot/checkout/route.ts:26`)
- LexAudit PayPal webhook → write `compliance_subs`; `wire/start` gateway mismatch (CHECK rejects `'wire'`); sanctions `catch{}` fail-open; fetch-cache staleness (deal44 fixed on branch only); `.vercel` projectId stale; TRACR auth; LexAudit `/payment/*` pages; blog `published:` frontmatter; hub `hub.` CNAME; capture next-build error for `9a635f7`.

## Consolidated manual-ops queue (Moses) — priority order
1. Top up Anthropic credits.
2. Resync OPS_DASHBOARD_TOKEN → redeploy.
3. Fix preview build → merge 31 commits → deploy hub (O-018/020/021 go live).
4. Gate 1 test buy (FirmCited $20 → $490).
5. Rotate NOWPayments + IPN secret.
6. Fix curator: repoint `OLLAMA_TUNNEL_URL`→localhost:11434 (one-config) + CF Access service token + gemma; re-SCP publisher.py; add brain timer → blog regen.
7. Fix CF Pages deploy (40 posts pending) + blog frontmatter.
8. Outbound: notes domain + mailboxes + Instantly + ZeroBounce + OUTBOUND_AUTOSEND=1.
9. OCI: fix coguard import, B9 DNS, reconciler timer, rotate Telegram token.
10. Deploy 5 dark apps + DNS + PayPal plan IDs/webhook.
11. Wire GSC + IndexNow.
12. Apply code fixes (FIX-READY list) — Claude can do these.
13. Cleanup: dead Vercel projects, logrotate, ops_alerts HUB_URL, n8n workflow, dead crons.

## First-dollar sequence (updated with deep findings)
Top up Anthropic → fix preview build → merge + deploy (revenue features live) → resync ops token → Gate-1 test buy → rotate NOWPayments → **fix curator one-config (localhost tunnel) + CF Pages deploy** (blog regen = SEO/AEO fuel) → start Instantly warm-up (long pole) → deploy dark apps → wire GSC. The 29-bug ledger is the work list; ~6 of the 7 CRITICALs are Moses-blocked, the rest are code-fixable in one session.

---
*Conclusive audit 2026-09-08 — 9 parallel agents, live probes, SSH, wrangler. Part 1 = fleet status; Part 2 = deep mechanism inventory (01-09); Part 3 = this synthesis. Stale operating-book claims superseded.*
