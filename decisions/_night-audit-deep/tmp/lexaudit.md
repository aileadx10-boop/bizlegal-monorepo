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
