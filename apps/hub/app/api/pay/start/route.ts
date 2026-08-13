import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'
import { readAffiliateCode } from '@/lib/affiliate'
import {
  startCheckout,
  getProduct,
  PRODUCTS,
  type ProductId,
  type GatewayPreference,
  type CheckoutResult,
} from '@bizlegal/payment'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/pay/start
 *
 * Universal checkout entry. Replaces every NEXT_PUBLIC_NOWPAYMENTS_*_URL
 * and NEXT_PUBLIC_PAYPAL_*_URL env constant — gateway URL is generated
 * on the fly via @bizlegal/payment.
 *
 * Body: { product_id: ProductId; user_email: string; gateway: 'crypto' | 'card' }
 * Returns: { ok: true; checkout_url: string; provider: 'nowpayments'|'paypal'|... }
 *       or 4xx/503 with { ok: false; error: string }
 *
 * Fires:
 *   - agent.checkout (intent — when checkout_url created)
 *   - payment.intent (with metadata.provider, amount_cents, product_id)
 *
 * Webhook (provider IPN) hits the legacy /api/payments/{nowpayments,paypal}/webhook
 * routes, which then fire payment.confirmed. That contract is unchanged.
 *
 * A pending `payment_orders` row is created BEFORE the gateway call and its
 * UUID is handed to the gateway as the order id. Both webhooks resolve the
 * order with `.eq('id', <gateway order id>)`, so without this row the IPN
 * 404s and every fulfillment grant (CASP bundle, AI policy, OFAC watch)
 * silently never fires. `product` is stored as the ProductId because the
 * grant helpers in lib/payments/* branch on that exact string.
 */

interface StartBody {
  product_id?: string
  user_email?: string
  user_name?: string
  gateway?: GatewayPreference
  source?: string
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function isValid(body: unknown): body is Required<Pick<StartBody, 'product_id' | 'user_email' | 'gateway'>> & StartBody {
  if (!body || typeof body !== 'object') return false
  const o = body as StartBody
  if (typeof o.product_id !== 'string') return false
  if (!(o.product_id in PRODUCTS)) return false
  if (typeof o.user_email !== 'string' || !o.user_email.includes('@')) return false
  if (o.gateway !== 'crypto' && o.gateway !== 'card') return false
  return true
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }
  if (!isValid(body)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'product_id (must match a known ProductId), user_email, gateway (crypto|card) required',
        valid_product_ids: Object.keys(PRODUCTS),
      },
      { status: 400 },
    )
  }

  const productId = body.product_id as ProductId
  const product = getProduct(productId)
  const preference: GatewayPreference = body.gateway

  // Fire intent BEFORE the gateway call so we count attempts even when
  // the gateway 503s.
  logEventAsync({
    type: 'agent.checkout',
    source: 'hub',
    email: body.user_email,
    amount_cents: product.amount_cents,
    status: 'pending',
    metadata: {
      product_id: productId,
      product_family: product.product_family,
      billing_interval: product.billing_interval,
      gateway: preference,
    },
  })

  const email = body.user_email.toLowerCase()
  const gatewayName = preference === 'crypto' ? 'nowpayments' : 'paypal'

  const supabase = getSupabase()
  if (!supabase) {
    console.error('[pay/start] Supabase env not configured — refusing to mint an unfulfillable checkout')
    return NextResponse.json({ ok: false, error: 'order_store_unavailable' }, { status: 500 })
  }

  const { data: order, error: insertErr } = await supabase
    .from('payment_orders')
    .insert({
      user_email: email,
      user_name: body.user_name ?? null,
      product: productId,
      tier: product.product_family,
      billing_interval: product.billing_interval,
      amount_cents: product.amount_cents,
      currency: product.currency,
      gateway: gatewayName,
      status: 'pending',
      source: body.source ?? 'pay_start',
      affiliate_code: readAffiliateCode(req.headers.get('cookie')),
    })
    .select('id')
    .single()

  if (insertErr || !order) {
    console.error('[pay/start] payment_orders insert failed', insertErr)
    return NextResponse.json({ ok: false, error: 'order_creation_failed' }, { status: 500 })
  }

  const orderId = String(order.id)

  const result: CheckoutResult = await startCheckout(
    {
      product_id: productId,
      user_email: email,
      user_name: body.user_name,
      origin: req.headers.get('origin') ?? undefined,
      order_id: orderId,
    },
    preference,
  )

  if (!result.ok) {
    await supabase
      .from('payment_orders')
      .update({ status: 'failed', metadata: { checkout_error: result.error, provider: result.provider } })
      .eq('id', orderId)

    logEventAsync({
      type: 'payment.failed',
      source: 'hub',
      ref_id: orderId,
      email: body.user_email,
      amount_cents: product.amount_cents,
      status: 'failed',
      metadata: {
        product_id: productId,
        gateway: preference,
        provider: result.provider,
        provider_error: result.error,
      },
    })
    return NextResponse.json(
      { ok: false, provider: result.provider, error: result.error },
      { status: result.status_code },
    )
  }

  // The card path falls back LemonSqueezy → Paddle → PayPal, so the serving
  // provider can differ from the gateway guessed at insert time.
  const { error: linkErr } = await supabase
    .from('payment_orders')
    .update({ gateway: result.provider, gateway_invoice_id: result.provider_invoice_id })
    .eq('id', orderId)
  if (linkErr) {
    console.warn('[pay/start] gateway link update failed', linkErr.message)
  }

  logEventAsync({
    type: 'payment.intent',
    source: 'hub',
    ref_id: orderId,
    email: body.user_email,
    amount_cents: result.amount_cents,
    status: 'pending',
    metadata: {
      product_id: productId,
      product_family: product.product_family,
      billing_interval: product.billing_interval,
      gateway: preference,
      provider: result.provider,
      provider_invoice_id: result.provider_invoice_id,
    },
  })

  return NextResponse.json({
    ok: true,
    provider: result.provider,
    checkout_url: result.checkout_url,
    provider_invoice_id: result.provider_invoice_id,
    order_id: orderId,
    product_id: productId,
    amount_cents: result.amount_cents,
  })
}

export const GET = () =>
  NextResponse.json({ error: 'POST only' }, { status: 405 })
