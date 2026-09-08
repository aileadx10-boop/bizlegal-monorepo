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
