# sellerradar — CLAUDE.md

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md) — vault rule (§4), operating-book discipline (§5), hard rules (§6). This file covers only what is specific to SellerRadar.

**Purpose:** Amazon fee-change impact reports. A seller uploads a catalog CSV; the app diffs it against the curated fee-schedule fixtures in `data/fee-schedules/` and computes the per-SKU dollar impact (referral, FBA fulfillment, storage) with before/after margin. Free top-line check → $49 one-time audit → $99/mo monitor (weekly re-scan when a schedule changes).

**Status (2026-09-15, B1):** payable end to end in code; **no Vercel project yet — not deployed**. Nothing here is live until the project, domain and env are created.

## Routes

`/` · `/analyze` (free check + in-app checkout) · `/pricing` (links to the hub apex checkout) · `/report/[report_ref]` · `/success` · `/seo/[slug]` · `/robots.txt` · `/llms.txt` · `/sitemap.xml`

API: `/api/analyze` · `/api/create-order` (PayPal) · `/api/paypal-capture` · `/api/payments/paypal/webhook` (**recurring rail**) · `/api/payments/nowpayments/{start,webhook}` · `/api/fulfillment` (hub apex grant, HMAC) · `/api/inbound-lead` · `/api/lead` · `/api/digest` · `/api/cron/monitor` (Mon 06:00 UTC) · `/api/ops/health`

## Invariants

1. **`next.config.mjs` must keep `experimental.outputFileTracingRoot` pointed at the monorepo root.** Without it the Vercel tracer roots at `apps/sellerradar`, omits every pnpm-hoisted workspace package, and each API lambda throws `MODULE_NOT_FOUND` on its first request — a green build over a dead runtime. This is the leadforge lesson. Vercel **Root Directory = `apps/sellerradar`**.
2. **Email goes through `@bizlegal/email` only**, `kind: 'transactional'`, with the written justification at the top of `lib/email.ts`. The app called Resend directly until 2026-09-15, which put suppression and consent in the caller. No `skipConsent`, ever.
3. **`fulfillPaidOrder` delivers the report.** Before 2026-09-15 it set `paid_at` and sent nothing — the only report email in the app fired at *analyse* time, so a buyer paid $49 and got silence. The paid send is `sendReportReady({ paid: true })` and says so in the subject.
4. **Fulfilment is idempotent through a claimed gate**, not a comment: `UPDATE sellerradar_reports … WHERE paid_at IS NULL`. A replayed IPN or a re-delivered PayPal webhook returns no row and neither re-provisions the monitor nor re-sends the email.
5. **A monthly tier is a PayPal subscription, never a one-time order.** `/api/create-order` branches on `TIER_INTERVALS`; `monitor` requires `PAYPAL_PLAN_ID_SELLERRADAR_MONITOR_MONTHLY` and returns **503 naming the env var** when it is unset. It must never fall back to a single $99 charge on a service that then runs forever.
6. **Crypto cannot bill monthly.** `/api/payments/nowpayments/start` refuses a monthly tier with `recurring_requires_card` (400). A NOWPayments invoice is one charge.
7. **Both webhooks fail closed.** NOWPayments: no `NOWPAYMENTS_IPN_SECRET` → 503, bad HMAC → 401. PayPal: no `PAYPAL_WEBHOOK_ID` → 503, verification not `SUCCESS` → 401. There is deliberately no "skip verification in preview" branch.
8. **`robots.ts` and `llms.txt` read their lists from `@bizlegal/themes`** (`packages/themes/src/seo.ts`). Do not re-inline the crawler allow/block lists; a copy is a list that drifts.
9. **No outcome claims in copy.** Every figure is an estimate from published fee schedules plus the seller's own uploaded unit economics. No savings are promised; not financial or tax advice.

## Known open items

- `robots.ts` disallows `/analyze` while `sitemap.ts` advertises it at priority 0.95. Pre-existing contradiction, left as found — decide which one is right before the first GSC submission.
- `PAYPAL_PLAN_ID_SELLERRADAR_MONITOR_MONTHLY` is in the vault as an empty name. Create the plan (`scripts/paypal-provision-plans.mjs`) and set the value, plus a PayPal webhook for this project (`PAYPAL_WEBHOOK_ID`), before selling the monitor tier.

## Envs (names only; values in the canonical vault)

`NEXT_PUBLIC_SITE_URL` · `NEXT_PUBLIC_SUPABASE_URL` · `SUPABASE_SERVICE_ROLE_KEY` · `BIZLEGAL_INBOUND_SECRET` · `OPS_DASHBOARD_TOKEN` · `OPS_LOG_URL` · `CRON_SECRET` · `RESEND_API_KEY` · `RESEND_FROM` · `PAYPAL_CLIENT_ID` · `PAYPAL_CLIENT_SECRET` · `PAYPAL_ENV` · `PAYPAL_WEBHOOK_ID` · `PAYPAL_PLAN_ID_SELLERRADAR_MONITOR_MONTHLY` · `NOWPAYMENTS_API_KEY` · `NOWPAYMENTS_IPN_SECRET` · `SELLERRADAR_FULFILL_URL` (read by the hub grant) · `MARKETING_TRIGGER_URL` · `TURNSTILE_SECRET_KEY`

`/api/ops/health?token=…` returns the presence matrix — names and booleans, never values.

## Tables

`sellerradar_reports` · `sellerradar_skus` · `sellerradar_orders` · `sellerradar_monitors` · `sellerradar_leads` · `fee_schedules`, from `supabase/migrations/20260902_sellerradar_mvp.sql` and `20260907_sellerradar_monitor_scan_state.sql`.

## Build

```bash
cd apps/sellerradar
../../node_modules/.bin/tsc --noEmit -p tsconfig.json
VERCEL=1 CI=1 ../../node_modules/.bin/next build
```

Run the `node_modules/.bin` binaries directly — pnpm scripts can false-green in this shell.
