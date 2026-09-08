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
