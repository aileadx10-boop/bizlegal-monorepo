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
