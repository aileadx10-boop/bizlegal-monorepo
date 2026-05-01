import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'
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
 */

interface StartBody {
  product_id?: string
  user_email?: string
  user_name?: string
  gateway?: GatewayPreference
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

  const result: CheckoutResult = await startCheckout(
    {
      product_id: productId,
      user_email: body.user_email.toLowerCase(),
      user_name: body.user_name,
      origin: req.headers.get('origin') ?? undefined,
    },
    preference,
  )

  if (!result.ok) {
    logEventAsync({
      type: 'payment.failed',
      source: 'hub',
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

  logEventAsync({
    type: 'payment.intent',
    source: 'hub',
    ref_id: result.provider_invoice_id,
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
    product_id: productId,
    amount_cents: result.amount_cents,
  })
}

export const GET = () =>
  NextResponse.json({ error: 'POST only' }, { status: 405 })
