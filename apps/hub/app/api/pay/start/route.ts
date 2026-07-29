import { NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/pay/start — DISABLED 2026-07-30. DO NOT RE-ENABLE AS-IS.
 *
 * ┌─ WHY THIS RETURNS 503 ──────────────────────────────────────────────────┐
 * │ This route took money and left no record. Two compounding defects:      │
 * │                                                                        │
 * │ 1. It never INSERTs a `payment_orders` row. The gateway `order_id` came │
 * │    from `makeOrderId()` in @bizlegal/payment, which emits              │
 * │    `bz_<product>_<email>_<minute>_<nonce>`.                            │
 * │ 2. `/api/payments/nowpayments/webhook` reconciles via                  │
 * │    `.eq('id', ipn.order_id)` against `payment_orders.id`, a **uuid**.   │
 * │    A `bz_…` string can never match, so the IPN found no order.         │
 * │                                                                        │
 * │ Net effect: customer pays → no order row → no entitlement → no receipt.│
 * │ (The webhook's claim-before-lookup ordering also burned the event so    │
 * │ every retry deduped to 200. That half is now fixed in the webhook.)     │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * USE INSTEAD — the only reconcilable money path:
 *   pricing page
 *     → https://bizlegal-ai.com/checkout?product=&tier=&interval=&amount=&name=
 *     → /api/payments/{nowpayments,paypal,wire}/start   (INSERTs the row first,
 *        then passes that row's uuid to the gateway as order_id)
 *     → /api/payments/nowpayments/webhook               (reconciles on it)
 *
 * TO FIX PROPERLY (then delete this block):
 *   1. Extract the insert from `/api/payments/nowpayments/start` into
 *      `apps/hub/lib/payments/create-order.ts`, shared by all start routes.
 *   2. Change `createNowPaymentsInvoice` in @bizlegal/payment to accept an
 *      INJECTED order_id instead of calling `makeOrderId()`. Keep
 *      `makeOrderId` only for PayPal's `PayPal-Request-Id` header.
 *   3. Re-point this route at that helper, then verify with
 *      `gateway='simulated'` end to end before removing the 503.
 */
const DISABLED_REASON =
  'pay_start_disabled_use_apex_checkout: this route did not create a payment_orders row, ' +
  'so payments through it could not be reconciled. Use ' +
  'https://bizlegal-ai.com/checkout or POST /api/payments/{nowpayments,paypal,wire}/start.'

export async function POST() {
  // Fail closed before doing anything else. See DISABLED_REASON above.
  logEventAsync({
    type: 'error',
    source: 'hub',
    status: 'failed',
    metadata: {
      scope: 'pay_start_disabled',
      reason: 'route_disabled_unreconcilable',
      hint: 'caller should use /checkout or /api/payments/{nowpayments,paypal,wire}/start',
    },
  })
  return NextResponse.json(
    { ok: false, error: DISABLED_REASON, use_instead: 'https://bizlegal-ai.com/checkout' },
    { status: 503 },
  )
}

export const GET = () =>
  NextResponse.json({ error: 'POST only' }, { status: 405 })
