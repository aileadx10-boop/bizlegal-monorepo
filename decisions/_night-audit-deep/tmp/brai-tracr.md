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
