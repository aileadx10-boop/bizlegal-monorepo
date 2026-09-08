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
