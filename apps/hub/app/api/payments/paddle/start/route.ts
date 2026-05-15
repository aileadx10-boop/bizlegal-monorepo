import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'
import { createPaddleTransaction, priceIdForTier } from '@/lib/payments/paddle'

/**
 * Paddle Billing transaction-start route.
 *
 * 2026-05-11 build (per Moses's W5 ask: "make it ready to Paddle").
 *
 * Flow:
 *   1. Validate body (product/tier/interval/amount/email).
 *   2. Resolve PADDLE_PRICE_<APP>_<TIER>_<INTERVAL> env var → Paddle price ID.
 *      If unset, return 503 with `paddle_tier_not_configured`. Moses creates
 *      the prices in the Paddle dashboard and sets the env vars before flipping
 *      the switch.
 *   3. Insert `payment_orders` row with gateway='paddle', status='pending'.
 *   4. Call Paddle /transactions to create the checkout. The internal
 *      order ID flows back to us on webhook via `custom_data.order_id`.
 *   5. Return the Paddle checkout URL — caller (pricing page form) sends
 *      the user there via 303 or window.location.
 *
 * Errors are sanitised to opaque codes (CODE-REVIEW-W5 H-02 pattern).
 * Full detail stays in server logs.
 *
 * Rate limit: NOT applied here yet (SECURITY-W5 S-H2 deferred). Add
 * `@bizlegal/rate-limit` on the public POST when Moses enables.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 30

interface StartBody {
  product: string
  tier: string
  interval: 'one-time' | 'monthly' | 'yearly'
  amount_cents: number
  email: string
  name?: string
  source?: string
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

function clampAmount(cents: number): boolean {
  // Match the NOWPayments range; PayPal allows wider but Paddle has its own
  // server-side validation. We clamp at our boundary so the order row + log
  // can't be polluted by cents-vs-dollars frontend bugs.
  return cents >= 50 && cents <= 100_000_00
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: Partial<StartBody>
  try {
    body = (await req.json()) as Partial<StartBody>
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  if (
    !body.product ||
    !body.tier ||
    !body.interval ||
    typeof body.amount_cents !== 'number' ||
    !body.email
  ) {
    return NextResponse.json(
      { error: 'missing_required_fields' },
      { status: 400 },
    )
  }

  if (!clampAmount(body.amount_cents)) {
    return NextResponse.json({ error: 'amount_out_of_range' }, { status: 400 })
  }

  const email = body.email.trim().toLowerCase()
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  // Resolve Paddle price ID. `interval=one-time` is treated as the
  // default tier price (Paddle handles one-time vs recurring at the
  // price level, so we don't need separate Paddle products — just
  // separate price IDs).
  const tierKey =
    body.interval === 'one-time'
      ? `${body.product}_${body.tier}`
      : `${body.product}_${body.tier}_${body.interval}`
  const priceId = priceIdForTier(tierKey)
  if (!priceId) {
    // eslint-disable-next-line no-console
    console.warn(`[paddle/start] no price id configured for tierKey=${tierKey}`)
    return NextResponse.json(
      { error: 'paddle_tier_not_configured', tierKey },
      { status: 503 },
    )
  }

  let orderId: string
  try {
    const supabase = getSupabase()
    const { data: order, error: insertErr } = await supabase
      .from('payment_orders')
      .insert({
        user_email: email,
        user_name: body.name ?? null,
        product: body.product,
        tier: body.tier,
        billing_interval: body.interval,
        amount_cents: body.amount_cents,
        gateway: 'paddle',
        status: 'pending',
        source: body.source ?? 'hub_pricing',
      })
      .select('id')
      .single()

    if (insertErr || !order) {
      // eslint-disable-next-line no-console
      console.error('[paddle/start] order insert failed', insertErr?.message)
      return NextResponse.json({ error: 'order_creation_failed' }, { status: 500 })
    }
    orderId = String(order.id)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[paddle/start] supabase error:', err)
    return NextResponse.json({ error: 'order_creation_failed' }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bizlegal-ai.com'
  const successUrl = new URL('/pricing/thank-you', baseUrl)
  successUrl.searchParams.set('order', orderId)
  successUrl.searchParams.set('gateway', 'paddle')

  try {
    const { transactionId, checkoutUrl } = await createPaddleTransaction({
      priceId,
      customerEmail: email,
      orderId,
      successUrl: successUrl.toString(),
    })

    // Persist Paddle transaction id back to the order row.
    const supabase = getSupabase()
    await supabase
      .from('payment_orders')
      .update({
        gateway_invoice_id: transactionId,
        metadata: { paddle: { transaction_id: transactionId, price_id: priceId } },
      })
      .eq('id', orderId)

    logEventAsync({
      type: 'payment.intent',
      source: 'hub',
      ref_id: orderId,
      email,
      amount_cents: body.amount_cents,
      status: 'pending',
      metadata: {
        gateway: 'paddle',
        product: body.product,
        tier: body.tier,
        interval: body.interval,
        transaction_id: transactionId,
      },
    })

    return NextResponse.json({ ok: true, order_id: orderId, checkout_url: checkoutUrl })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[paddle/start] paddle transaction failed:', err)
    logEventAsync({
      type: 'error',
      source: 'hub',
      ref_id: orderId,
      email,
      status: 'failed',
      metadata: {
        stage: 'paddle_create_transaction',
        err: err instanceof Error ? err.message : String(err),
        product: body.product,
        tier: body.tier,
        interval: body.interval,
      },
    })
    return NextResponse.json({ error: 'paddle_init_failed' }, { status: 502 })
  }
}
