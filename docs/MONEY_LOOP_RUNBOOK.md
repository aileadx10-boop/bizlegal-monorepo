# Money-Loop Runbook

**Companion to `docs/MONEY_LOOP_STATUS.md` (the audit). This file is the operational one: how money actually flows per rail, where failures surface, and how to unstick an order.**

Last verified against code on `feat/revenue-marathon` (2026-09-06). All paths are hub-side unless noted.

---

## The three rails

### 1. Hub card (PayPal, capture-on-return)

```
/checkout or pricing CTA
  → /api/payments/{paypal}/start        (server-side price from lib/payments/price-map.ts; client amount ignored)
    → creates payment_orders row (status='pending'), logs payment.intent
    → PayPal order, intent=CAPTURE, return_url=/payment/paypal/return?order=<id>
  → buyer approves at PayPal
  → /payment/paypal/return              (app/payment/paypal/return/route.ts)
    → lib/payments/paypal-capture.ts captureHubPayPalOrder({source:'return'})
    → idempotent, token-bound capture → redirect /payment/success or /payment/cancelled?reason=capture_failed
  → webhook PAYMENT.CAPTURE.COMPLETED   (app/api/payments/paypal/webhook/route.ts)
    → verify-webhook-signature (PAYPAL_WEBHOOK_ID required; missing = reject)
    → claimWebhookEvent idempotency (PayPal redelivers up to 25h)
    → amount cross-check vs payment_orders.amount_cents (mismatch = flagged, no grants)
    → status='active', logs payment.confirmed
    → grants: conductor / casp-bundle / ai-policy / practice-kit / ofac-watch / falseecho / sellerradar
    → markNurturePaid + sendPaymentConfirmationEmail (honest copy for non-auto-fulfilled SKUs)
```

Key invariant: **`CHECKOUT.ORDER.APPROVED` is NOT a paid event.** The webhook defensively captures on APPROVED (buyer closed the tab before the return redirect) but grants nothing. Grants fire only on `PAYMENT.CAPTURE.COMPLETED` (one-time) or `BILLING.SUBSCRIPTION.ACTIVATED` (subs).

Terminal-state guard: `cancelled`/`expired`/`refunded` rows refuse stale transitions (refund may overwrite cancelled; refunded is final).

### 2. App-native PayPal capture-on-return (tracr, docai, falseecho, sellerradar)

Same pattern, in the app's own repo dir: start route creates a one-time order → return route captures → paid-gated fulfillment in the same app (`apps/docai/web/app/api/payment/paypal/return/route.ts` is the reference implementation). These apps also write their own order tables (`tracr_orders`, scan/report rows) and only unlock the deliverable when the row is `paid`.

### 3. NOWPayments IPN (crypto, all apps)

```
/api/payments/nowpayments/start  → invoice → logs payment.intent
NOWPayments IPN  → /api/payments/nowpayments/webhook
  → HMAC-SHA512 hex of *sorted* JSON body, header x-nowpayments-sig, secret NOWPAYMENTS_IPN_SECRET
  → idempotency claim on (payment_id:payment_status) — IPNs redeliver per state transition
  → 'finished' → status='active' (+ activated_at) → payment.confirmed → same grants as card
  → failed/expired/refunded map to matching statuses
```

F6 fixed (2026-09-08): all IPN handlers now fail closed — forge/tracr's old `if (secret && sig)` verify-only-when-configured hole is gone. `NOWPAYMENTS_IPN_SECRET` is **mandatory in every crypto app's Vercel project**: unset secret → 503 `ipn_secret_not_configured` (NOWPayments retries; no fulfillment), missing/mismatched signature → 401.

---

## Where failures surface

All meaningful events land in the `ops_events` table via `logEventAsync` (`packages/ops-log/src/index.ts`, hub shim `apps/hub/lib/ops/log.ts`). Watch these event types:

- `payment.intent` — order/invoice created (start routes).
- `payment.confirmed` — money actually captured (`status='active'`).
- `payment.failed` — capture failure at return (metadata: `gateway`, `stage:'capture'`, `error`), or `past_due` subscription.
- `payment.refunded` — refund processed.
- `error` — generic route failures; the last one is surfaced on `/ops/snapshot`.

Live dashboards (all token-gated by `OPS_DASHBOARD_TOKEN`, bare 404 on mismatch):

- `/ops/snapshot` — captured $, real customers, human-vs-machine events, last error.
- `/ops/metrics` — master metrics: captured vs pending 30d, per-product/gateway/status totals, per-day histogram.
- `/ops/content` — content pipeline state.

Also: Vercel function logs carry `[paypal/webhook]`, `[paypal/return]`, `[nowpayments/webhook]` prefixes. `payment_orders.metadata` accumulates evidence: `last_event`, `approved_capture_attempt`, `paypal_capture_id`, `granted_capture_id`, `amount_mismatch`.

---

## Reconciling a stuck order

An order stuck at `status='pending'` means: created, never confirmed. Diagnose by rail:

**Card (hub or app-native):**

1. Read the row: `select id, product, status, amount_cents, metadata, created_at from payment_orders where id = '<id>'`.
2. `metadata.approved_capture_attempt = 'failed'` → capture was tried and failed. `metadata.approved_capture_error` says why (usually PayPal declined/expired). Nothing to do — money never moved; buyer landed on `/payment/cancelled`.
3. `metadata.last_event.event_type = 'CHECKOUT.ORDER.APPROVED'` but no capture id → buyer approved; both capture paths failed or never ran. **Manually capture**: call PayPal `POST /v2/checkout/orders/{paypalOrderId}/capture` with the app's credentials, then confirm `PAYMENT.CAPTURE.COMPLETED` arrives via webhook (it drives status + grants). If the PayPal order is older than ~3h after approval, it can't be captured — contact the buyer.
4. No `last_event` at all → buyer never approved at PayPal. Abandoned checkout, not a bug. The "Pending intent" figure on `/ops/snapshot` is exactly this bucket.

**Crypto (NOWPayments):**

1. Check the invoice in the NOWPayments dashboard — `waiting`/`confirming` = blockchain in flight, normal.
2. `partially_paid` → underpayment; NOWPayments holds it, order stays pending. Resolve with the buyer or refund from the dashboard.
3. Invoice `finished` in the dashboard but hub row still `pending` → IPN delivery failed or signature rejected (check function logs for `[nowpayments/webhook]`; an unset/mismatched `NOWPAYMENTS_IPN_SECRET` rejects all IPNs). Fix the secret, then resend the IPN from the NOWPayments dashboard.

**Amount mismatch:** `metadata.amount_mismatch` present, status stays `pending` by design (tampering or stale row) — verify against the PayPal/NOWPayments dashboard before touching anything.

**Duplicate webhook worry:** don't. Idempotency claims (`webhook-idempotency.ts`) and `granted_capture_id` make replays safe.

---

## Known open defects (from MONEY_LOOP_STATUS, still true)

- **F3** — subscription CTAs whose `PAYPAL_PLAN_ID_*` env is missing 503 at checkout (tracr all tiers, docai starter/yearly, lexaudit solo, coguard yearly…). Fix is PayPal dashboard plan creation, not code.
- **F5** — monthly SKUs via `/api/pay/start` charge **once** (PayPal Orders API, not Subscriptions). `bench_managed_monthly` is the big one.
- **F4 residual** — tracr/docai/lexaudit/forge/bench bought *via hub* get an honest "what happens next" email but **manual delivery**. Someone must watch ops log / confirmation emails and fulfill.
