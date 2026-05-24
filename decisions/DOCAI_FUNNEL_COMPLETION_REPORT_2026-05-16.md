# DocAI Funnel Completion Report — 2026-05-16

## Executive Status
DocAI's revenue path is code-ready for a production deploy once the DocAI Vercel app has the critical envs synced from the canonical vault and the payment gateways are tested live/sandbox end-to-end.

Validated locally:
- `next build` for `apps/docai/web` passes.
- Repo vault audit passes.
- Repo operating-book audit passes.
- No stale `NEXT_PUBLIC_NOWPAYMENTS_DOCAI_*` / `NEXT_PUBLIC_PAYPAL_DOCAI_*` static checkout URL dependencies remain in DocAI.
- No `next/font/google` dependency remains in DocAI build-critical files.

## Completed Funnel
1. Visitor uploads a contract from DocAI or the LexAudit secondary CTA.
2. `/api/documents/upload` extracts document text.
3. `/api/documents/scan` runs grounded analysis and inserts a `contract_scans` row.
4. `/report?scan_id=...` shows a free preview with two supported evidence-cited findings and locked severity counts.
5. Customer can pay `$97` by:
   - NOWPayments crypto through `/api/payment/checkout` + `/api/payment/webhook`.
   - PayPal/card through `/api/payment/paypal/checkout` + `/api/payment/paypal/return`.
6. Successful payment marks `contract_scans.paid=true` and unlocks the full report.
7. Full report separates supported findings from unsupported “Needs Human Review” items and includes evidence basis.
8. `/pricing` no longer depends on prebuilt public checkout URLs; paid tiers now use dynamic `/api/payments/{nowpayments,paypal}/start` routes.

## Anti-Hallucination / Trust Controls
- Main red flags require `evidence_refs` with quote + location.
- Unsupported claims are removed from main findings and moved to `Needs Human Review` without severity badges.
- Preview and paid report include “This is not legal advice.”
- Paywall copy positions the report as evidence-cited and attorney-action formatted.
- Refund promise is visible: unsupported cited issue → refund request within 7 days.

## Payment-Critical Env Status
Canonical vault status after merge from the FIXED hub file:

| Env | Status | Blocks |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Set | Must be `https://docai.bizlegal-ai.com` in DocAI deployment for payment returns/webhooks. |
| `NEXT_PUBLIC_SUPABASE_URL` | Set | Required for scan/report/payment DB access. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Set | Required for client-safe Supabase surfaces. |
| `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_KEY` | Set | Required to insert scans and mark paid. |
| `ANTHROPIC_API_KEY` | Set | Required for primary document analysis. |
| `OPENAI_API_KEY` | Set | Fallback if Anthropic fails. |
| `NOWPAYMENTS_API_KEY` | Set | Required for crypto invoice creation. |
| `NOWPAYMENTS_IPN_SECRET` | Set | Required for crypto webhook verification/unlock. |
| `PAYPAL_CLIENT_ID` | Set | Required for card/PayPal checkout. |
| `PAYPAL_CLIENT_SECRET` | Set | Required for PayPal capture. |
| `PAYPAL_ENV` | Set | Must be `live` before real payments; `sandbox` for tests. |
| `BIZLEGAL_INBOUND_SECRET` | Set | Required for ops event HMAC. |
| `OPS_DASHBOARD_TOKEN` | Set | Required for `/api/ops/health`. |

## Non-Critical / Follow-Up Env Gaps
| Env | Current status | Impact |
| --- | --- | --- |
| `PAYPAL_WEBHOOK_ID` | Empty | PayPal subscription webhook verification is not production-ready. The `$97` scan flow still captures on return, but subscription/tier webhook reliability needs this. |
| `PAYONEER_DOCAI_LINK` | Empty | Manual hosted-card backup is hidden/unavailable. Not needed now that PayPal card fallback exists. |
| `OPS_LOG_URL` | Empty | Ops logging falls back to `https://bizlegal-ai.com/api/ops/log`; set explicitly if hub URL changes. |
| `OPENAI_MODEL` | Empty | Uses code default `gpt-4.1-mini`; not a launch blocker. |
| `OPENAI_EMBEDDING_KEY` | Empty | Firm-tier KB embeddings may be degraded; not a `$97` scan blocker. |

## App / Deployment Blockers
These must be verified in the deployed DocAI Vercel project, not only in the local vault:

1. **Env sync:** DocAI Vercel app must contain all critical envs above. Local `.env.local` currently only has `VERCEL_OIDC_TOKEN`, so local runtime smoke tests require env import first.
2. **Supabase schema:** production DB must include `contract_scans` columns used by the funnel: `id`, `email`, `filename`, `contract_type`, `score`, `red_flags`, `total_risks`, `ai_content`, `paid`, `payment_provider`, `nowpayments_order_id`; and a `leads` table for best-effort lead capture.
3. **Pricing tiers:** dynamic pricing checkout uses `payment_orders`. If that table is absent or mismatched, pricing subscriptions fail even though `$97` scan checkout works.
4. **NOWPayments:** verify invoice creation and IPN callback to `https://docai.bizlegal-ai.com/api/payment/webhook` with the same `NOWPAYMENTS_IPN_SECRET` as the dashboard.
5. **PayPal:** set `PAYPAL_ENV=live` for production and run one real/sandbox capture through `/api/payment/paypal/return` before traffic.
6. **Domain canonical:** `NEXT_PUBLIC_SITE_URL` must be DocAI's domain, not hub or localhost, or payment redirects will land on the wrong app.

## Validation Commands Run
- `cmd /c "node_modules\.bin\next.cmd build"` in `apps/docai/web` — passed.
- `cmd /c "node scripts\audit-vault.mjs"` — passed.
- `cmd /c "node scripts\audit-operating-book.mjs"` — passed.
- `rg "NEXT_PUBLIC_(NOWPAYMENTS|PAYPAL)_DOCAI|Checkout coming soon|next/font/google" apps/docai/web` — no matches after cleanup.

## Go-Live Test Order
1. Sync envs into DocAI Vercel from the canonical vault.
2. Confirm `/api/ops/health?t=<OPS_DASHBOARD_TOKEN>` returns healthy on DocAI production.
3. Upload a fixture contract and confirm `/api/documents/scan` returns `scan_id`.
4. Confirm free preview shows exactly two supported evidence-cited findings plus locked counts.
5. Pay via NOWPayments sandbox/live and verify `paid=true` unlocks report.
6. Pay via PayPal sandbox/live and verify return capture unlocks report.
7. Test `/pricing` dynamic checkout for one monthly PayPal order and one NOWPayments order.
8. Send traffic only after both `$97` scan payment paths unlock reports.

## Auto-Mode Continuation — 2026-05-17

### Additional Work Completed
- Synced `apps/docai/web/.env.local` from the canonical vault for local launch checks. The file is gitignored and was not committed.
- Added `scripts/docai-launch-check.mjs` for repeatable DocAI env/schema readiness checks.
- Added `apps/docai/web/SUPABASE_DOCAI_FUNNEL_SCHEMA.sql` as additive SQL guardrails for required funnel tables/columns.
- Updated `apps/docai/web/SUPABASE_SETUP.md` with launch-schema instructions.
- Added root scripts:
  - `npm run check:docai`
  - `npm run check:docai:db`
- Added `scripts/sync-docai-vercel-env.ps1` to sync canonical vault values into the linked DocAI Vercel project once local Node TLS trust is fixed.

### Latest Validation Results
- `apps/docai/web` production build: PASS.
- `node scripts/audit-vault.mjs`: PASS.
- `node scripts/audit-operating-book.mjs`: PASS.
- `node scripts/docai-launch-check.mjs`: PASS, ready for payment smoke tests.
- `node scripts/docai-launch-check.mjs --db --insecure-tls`: PASS, confirming Supabase has:
  - `contract_scans`
  - `leads`
  - `payment_orders`

`--insecure-tls` was required only because local Node on this Windows machine cannot verify the current certificate chain. Do not use this flag for real secret upload or production traffic.

### Vercel Production Blocker
The linked DocAI Vercel project exists, but production env listing returned:

> No Environment Variables found

This means the local code and database are ready, but the deployed DocAI app will fail until Vercel envs are synced.

A dry run of `scripts/sync-docai-vercel-env.ps1 -Environment production -DryRun` shows the script would add all critical production envs from the canonical vault. Real sync was intentionally NOT run because the Vercel CLI is currently failing normal TLS verification on this machine. Uploading secrets with `NODE_TLS_REJECT_UNAUTHORIZED=0` is blocked by the script and should not be done.

### Exact Remaining Launch Actions
1. Fix Windows/Node TLS trust so `vercel env list production --no-color` works without `NODE_TLS_REJECT_UNAUTHORIZED=0`.
2. Run:
   ```powershell
   pwsh -File scripts/sync-docai-vercel-env.ps1 -Environment production
   ```
3. Optionally repeat for preview/development:
   ```powershell
   pwsh -File scripts/sync-docai-vercel-env.ps1 -Environment preview
   pwsh -File scripts/sync-docai-vercel-env.ps1 -Environment development
   ```
4. Deploy DocAI.
5. Hit production health:
   ```text
   https://docai.bizlegal-ai.com/api/ops/health?t=<OPS_DASHBOARD_TOKEN>
   ```
6. Run one upload → scan → preview fixture.
7. Run one NOWPayments payment smoke test and confirm `contract_scans.paid=true`.
8. Run one PayPal/card payment smoke test and confirm `contract_scans.paid=true`.
9. Only then send bot/CTA traffic.

### Current Revenue Gate
DocAI is locally ready for payment smoke tests, not yet production-ready for traffic because Vercel production has no env vars configured.

## Final Auto-Mode Launch Pass — 2026-05-23

### Production Status
DocAI is deployed and live on the Vercel production alias:

- Production alias: `https://web-eight-blue-44.vercel.app`
- Latest deployment URL: `https://web-po9x9bqos-aileadx10-5415s-projects.vercel.app`
- Vercel deployment id: `dpl_9dmijN4wyzrBAJTBAr1cEBStTBpr`
- Production envs are synced into the linked DocAI Vercel project.
- `NEXT_PUBLIC_SITE_URL` is now set to `https://web-eight-blue-44.vercel.app` so report links and payment callbacks return to DocAI, not the hub homepage.

### Code / Infra Changes Added
- Added `vercel.docai.json` and `scripts/deploy-docai-vercel.ps1` so DocAI deploys from the monorepo root with workspace packages included.
- Added `scripts/sync-docai-vercel-env.ps1` with safe system-CA usage and DocAI site-url override.
- Added `scripts/set-docai-vercel-env.ps1` for one-off Vercel env updates/adds.
- Added production smoke scripts:
  - `scripts/check-docai-prod-health.ps1`
  - `scripts/smoke-docai-prod-scan.ps1`
  - `scripts/smoke-docai-prod-checkout.ps1`
  - `scripts/check-docai-report-paywall.ps1`
- Upgraded DocAI/root Next.js from `14.2.29` to `14.2.35`.
- Added `NEXT_PUBLIC_PAYPAL_SCAN_ENABLED=false` and gated PayPal/card CTAs so the broken PayPal path is not shown to buyers.

### Final Validation Results
- Local production build: PASS on Next.js `14.2.35`.
- `node scripts/docai-launch-check.mjs`: PASS.
- `node scripts/docai-launch-check.mjs --db`: PASS.
- Production health on alias: PASS, `healthy=true`, `critical_missing=[]`.
- Production scan fixture: PASS.
  - Smoke `scan_id`: `d266cf84-983d-408f-a748-d451f15c5aef`
  - Risk level: `high`
  - Risk score: `75`
  - Preview count: `2`
- NOWPayments checkout intent: PASS.
  - `/api/payment/checkout` returns `303`.
  - Redirect host is `nowpayments.io`.
- Live report paywall: PASS.
  - Crypto CTA visible.
  - PayPal/card CTA hidden.
  - Refund promise visible.

### Remaining Payment Blockers
| Gate | Status | Launch impact |
| --- | --- | --- |
| NOWPayments invoice creation | Green | This is the active `$97` revenue path. |
| NOWPayments real payment + IPN unlock | Not real-money tested | Must run one controlled live/sandbox payment before paid traffic. |
| PayPal/card checkout | Blocked | Vercel runtime logs show `PayPal auth failed: 401`; likely invalid credential/environment mismatch. Hidden behind `NEXT_PUBLIC_PAYPAL_SCAN_ENABLED=false`. |
| `PAYPAL_WEBHOOK_ID` | Empty | Blocks reliable PayPal subscription webhook verification; not needed while PayPal is hidden. |
| Payoneer hosted-card backup | Empty | No manual card backup shown. |
| Canonical custom domain | Not configured for DocAI | Current working launch URL is the Vercel alias. Add a DocAI custom domain later, then update `NEXT_PUBLIC_SITE_URL`. |

### Revenue Gate Now
The funnel is ready for controlled acquisition traffic only through the crypto checkout path:

1. Run one real/sandbox NOWPayments payment.
2. Confirm `/api/payment/webhook` marks `contract_scans.paid=true`.
3. Confirm the same `scan_id` unlocks the full report.
4. Then send the first consent-based bot/CTA traffic to `https://web-eight-blue-44.vercel.app`.

Do not show PayPal/card again until PayPal OAuth succeeds and a return-capture unlock test passes.
