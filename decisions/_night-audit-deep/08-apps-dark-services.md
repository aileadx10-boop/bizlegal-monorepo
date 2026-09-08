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
