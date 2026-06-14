# ENVIRONMENT-ACTION-MAP

**Last updated:** 2026-06-14  
**Owner:** Claude Code (auto-maintained)  
**Purpose:** Single-page map of every automated cron, agent, service, and endpoint — when it fires, what it does, and what revenue it drives. The Telegram daily-to-do bot reads this document conceptually to rank actions.

---

## 1 — Vercel Crons (apps/hub)

All crons require `Authorization: Bearer $CRON_SECRET`.

| Schedule (UTC) | Path | What it does | Revenue link |
|---|---|---|---|
| `0 6 * * *` | `/api/cron/daily-todo` | Pulls Supabase signals → Claude Haiku ranks blockers → posts ranked to-do to Telegram | Indirectly: keeps Moses on the revenue-first action each morning |
| `0 7 * * *` | `/api/cron/billing/charge-due` | Charges overdue subscriptions via PayPal/NOWPayments | Direct: captures subscription renewals |
| `0 8 * * *` | `/api/agents/run?task=daily-revenue-digest` | Summarises yesterday's payment_orders + ops_events | Visibility only |
| `30 8 * * *` | `/api/agents/run?task=daily-vertical-classifier-audit` | Audits lead classifier accuracy | Upstream of qualified leads |
| `30 9 * * *` | `/api/agents/run?task=daily-content-pick-suggestion` | Suggests next content picks for curator | Upstream of SEO |
| `0 9 * * *` | `/api/cron/smoke` | End-to-end smoke test across 8 surfaces | Uptime / catch payment breaks |
| `0 10 * * *` | `/api/agents/run?task=daily-affiliate-followup` | Follows up on pending affiliate referrals | Direct: closed referrals → revenue |
| `0 11 * * *` | `/api/cron/ai-act-monitor` | Monitors EU AI Act regulatory changes | Content + compliance signal |
| `0 11 * * *` | `/api/agents/run?task=daily-cold-pitch-suggestion` | Suggests 5 DocAI cold-pitch targets for today | Direct: outreach → first revenue |
| `0 12 * * *` | `/api/cron/policy-refresh` | Refreshes 7-framework policy registry (Firecrawl + Sonnet diff) | LexAudit monitor feature |
| `0 14 * * *` | `/api/cron/boi/check` | Checks BOI filing deadlines for subscribed users | Retention: keeps BOI tracker subscribers |
| `*/15 * * * *` | `/api/cron/ops-alerts` | Fires Telegram alert on big payment or error burst | Emergency awareness |
| `*/30 * * * *` | `/api/cron/social-queue` | Drains social post queue to Twitter/LinkedIn | Audience building |
| `0 9 * * 1` | `/api/agents/run?task=weekly-mrr-review` | Weekly MRR review email to Moses | Accountability |
| `0 17 * * 5` | `/api/agents/run?task=friday-retrospective` | Friday retro digest | Accountability |
| `30 10 * * 5` | `/api/cron/affiliate-reconcile` | Reconciles affiliate payouts | Financial integrity |
| `0 9 1 * *` | `/api/agents/run?task=monthly-vertical-scorecard` | Monthly product scorecard | Strategy |

---

## 2 — Hetzner Services (services/hetzner)

SSH: Hetzner CX32 (~$8/mo). Services managed via systemd.

| Service | Cadence | What it does | Revenue link |
|---|---|---|---|
| `curator-scout` | Daily (systemd timer) | `scout.py`: scrapes RSS + regulatory feeds via Hermes (Ollama/gemma4:e2b filter) | Upstream of SEO: feeds content pipeline |
| `curator-brain` | Daily (systemd timer) | `brain.py`: 6-gate quality check (source → diagram → humanize → citations → schema → visual) | SEO quality: articles Google indexes |
| `curator-publisher` | Daily (systemd timer) | `publisher.py`: publishes approved articles to blog.bizlegal-ai.com CF Pages + Supabase daily_gaps | Direct SEO: content hits the web |
| `curator-bot` | Webhook listener | Telegram bot for manual curator control | Ops only |

**Hermes models** (confirm via `ssh hetzner ollama list`):  
- Filter stage: `OLLAMA_FILTER_MODEL` (default: `gemma4:e2b`)  
- Rank stage: `OLLAMA_RANK_MODEL` (default: `gemma4:latest`)  
- Confirmed installed: `mistral-nemo` — set envs to this if gemma4 models are absent.

**Curator health check:** `HETZNER_PUBLISHER_HEALTH_URL` in vault.  
**Fix if stalled:** `sudo systemctl restart curator-brain curator-publisher`

---

## 3 — Cloudflare Workers (services/)

| Worker | Trigger | What it does | Revenue link |
|---|---|---|---|
| `worker` (bizlegal-lead-intake) | HTTP POST from EA forms | HMAC-signs lead → routes to correct subdomain `/api/inbound-lead` | Top of funnel: leads reach products |
| `telegram-hub` (@BizlegalHubBot) | Telegram message | Customer FAQ bot | Support / conversion |
| `gsc-bot` | Weekly (Cloudflare cron) | Resubmits sitemaps to GSC for all 8 surfaces | SEO: keeps sitemap fresh in Google |

---

## 4 — OCI Deal-Router (services/oci)

| Endpoint | Trigger | What it does | Revenue link |
|---|---|---|---|
| FastAPI on OCI free tier | HTTP from hub `/api/realestate-intake` | Routes cross-border real-estate deals to partner network | $500–2000 placement fee per close |
| `Caddy + Cloudflare Tunnel` | Always-on | TLS termination, proxies to FastAPI | Infrastructure |

**Status (2026-06-14):** 0 real partners (1 placeholder). No revenue yet.

---

## 5 — Primary Revenue Surfaces

| Surface | URL | Products | Payment path | Status |
|---|---|---|---|---|
| DocAI | docai.bizlegal-ai.com | $97 contract scan, $69/mo Team, $199/mo Firm | NOWPayments (crypto) + PayPal (card) | Live — $0 captured, PayPal 401 fixed 2026-06-14 |
| Forge | forge.bizlegal-ai.com | BOI Kit $149, Regulatory Passport $297, scan $97 | NOWPayments + PayPal | Live — $0 captured |
| Hub | bizlegal-ai.com | All agent subscriptions ($29–$149/mo) | `/api/pay/start` → NOWPayments / PayPal | Live — PayPal creds added 2026-06-14 |
| BRAI | brai.bizlegal-ai.com | Compliance posture report $49 | NOWPayments | Live — $0 captured |
| TRACR | tracr.bizlegal-ai.com | Wallet forensics $149–$299 | NOWPayments + PayPal | Live — $0 captured |
| LexAudit | lexaudit.bizlegal-ai.com | Compliance monitor $99/mo | NOWPayments | Live — $0 captured |

**All surfaces share:** `BIZLEGAL_INBOUND_SECRET` (HMAC) · `SUPABASE_SERVICE_KEY` → `bizlegal-ai` project (ap-southeast-2, ACTIVE_HEALTHY).

---

## 6 — What blocks first revenue (ranked 2026-06-14)

1. **$0 ever captured** — No real human has completed a payment. The crypto loop is code-correct but untested with real money. [HUMAN: run one $97 payment on docai.bizlegal-ai.com to prove it]
2. **PayPal 401 fixed** ✅ — `PAYPAL_API_URL` patched to live on docai Vercel. `NEXT_PUBLIC_PAYPAL_SCAN_ENABLED=true` added. Hub PayPal vars added. Redeploy to activate.
3. **Curator stalled** — `daily_gaps` shows <1 published/day. SSH Hetzner: check `ollama list`, set `OLLAMA_FILTER_MODEL=mistral-nemo`, restart services.
4. **GSC not verified** — 8 domains not verified in Google Search Console → pages not indexed. Add Cloudflare TXT records + submit sitemap-index. [HUMAN: 1 Google OAuth click]
5. **Cold outreach never sent** — 8 revenue agents built, zero emails sent. Set up Instantly/Smartlead ($30/mo), build target list, fire first batch.
6. **AdSense pending** — `NEXT_PUBLIC_ADSENSE_CLIENT` not set anywhere. [HUMAN: AdSense account approval, then set CF Pages env]

---

## 7 — Env names → project mapping

| Env name | hub | docai | forge | brai | tracr | lexaudit | leadforge |
|---|---|---|---|---|---|---|---|
| `BIZLEGAL_INBOUND_SECRET` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `ANTHROPIC_API_KEY` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `NOWPAYMENTS_API_KEY` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| `PAYPAL_CLIENT_ID` | ✓ (added 2026-06-14) | ✓ | ✓ | — | ✓ | — | — |
| `PAYPAL_API_URL` | ✓ live | ✓ live (fixed 2026-06-14) | default live | — | — | — | — |
| `TELEGRAM_BOT_TOKEN` | ✓ | — | — | — | — | — | — |
| `TELEGRAM_CHAT_ID` | ✓ | — | — | — | — | — | — |
| `CRON_SECRET` | ✓ | — | — | — | ✓ | ✓ | — |
| `OPS_DASHBOARD_TOKEN` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

Canonical source for all values: `C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt`
