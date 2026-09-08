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
