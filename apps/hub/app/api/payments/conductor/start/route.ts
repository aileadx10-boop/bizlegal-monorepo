import { NextRequest, NextResponse } from 'next/server'
import { getProduct, type ProductId } from '@bizlegal/payment'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST/GET /api/payments/conductor/start
 *
 * Dedicated AI-Conductor checkout entry. Unlike the generic /checkout flow,
 * the price is DERIVED SERVER-SIDE from the @bizlegal/payment registry — the
 * client never supplies the amount, so a $999 Firm plan can't be bought for
 * $1 by editing a query string.
 *
 * It then delegates to the proven gateway start routes
 * (/api/payments/{nowpayments,paypal}/start) which insert the payment_orders
 * row and set the gateway custom_id/order_id the webhooks reconcile on. The
 * row carries product='conductor', so the webhook write-through
 * (grantConductorTier) lifts the user's tier on payment.confirmed.
 *
 * POST body : { tier, interval?, email, name?, gateway? } -> { ok, checkout_url }
 * GET query : ?tier=&interval=&email=&gateway=  -> 302 redirect to the gateway
 *
 * Recurring card billing needs PAYPAL_PLAN_ID_CONDUCTOR_<TIER>_<INTERVAL>;
 * until those exist the card path 503s and the caller should use crypto.
 */

const TIERS = ['solo', 'team', 'firm'] as const
const INTERVALS = ['monthly', 'yearly'] as const

type Tier = (typeof TIERS)[number]
type Interval = (typeof INTERVALS)[number]
type Gateway = 'crypto' | 'card'

interface ResolvedOrder {
  tier: Tier
  interval: Interval
  gateway: Gateway
  email: string
  name?: string
  amountCents: number
}

interface ResolveError {
  error: string
}

function resolve(params: {
  tier?: string | null
  interval?: string | null
  email?: string | null
  name?: string | null
  gateway?: string | null
}): ResolvedOrder | ResolveError {
  const tier = params.tier ?? ''
  const interval = params.interval ?? 'monthly'
  const gateway = params.gateway ?? 'crypto'
  if (!TIERS.includes(tier as Tier)) return { error: 'tier must be solo|team|firm' }
  if (!INTERVALS.includes(interval as Interval)) return { error: 'interval must be monthly|yearly' }
  if (!params.email || !params.email.includes('@')) return { error: 'valid email required' }
  if (gateway !== 'crypto' && gateway !== 'card') return { error: 'gateway must be crypto|card' }

  const productId = `conductor_${tier}_${interval}` as ProductId
  let amountCents: number
  try {
    amountCents = getProduct(productId).amount_cents
  } catch {
    return { error: `unknown product ${productId}` }
  }
  return {
    tier: tier as Tier,
    interval: interval as Interval,
    gateway,
    email: params.email,
    name: params.name ?? undefined,
    amountCents,
  }
}

interface GatewayResult {
  ok: boolean
  status: number
  checkoutUrl?: string
  orderId?: string
  error?: string
}

async function startGateway(req: NextRequest, order: ResolvedOrder): Promise<GatewayResult> {
  const origin = new URL(req.url).origin
  const startPath = order.gateway === 'crypto'
    ? '/api/payments/nowpayments/start'
    : '/api/payments/paypal/start'

  const res = await fetch(`${origin}${startPath}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      // Forward cookies so first-touch affiliate attribution survives.
      cookie: req.headers.get('cookie') ?? '',
    },
    body: JSON.stringify({
      product: 'conductor',
      tier: order.tier,
      interval: order.interval,
      amount_cents: order.amountCents,
      email: order.email,
      name: order.name,
      source: 'conductor_upgrade',
    }),
  })

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  const checkoutUrl =
    (data.invoice_url as string | undefined) ??
    (data.approve_url as string | undefined) ??
    (data.checkout_url as string | undefined)

  if (!res.ok || !checkoutUrl) {
    return {
      ok: false,
      status: res.ok ? 502 : res.status,
      error: typeof data.error === 'string' ? data.error : 'checkout_failed',
    }
  }
  return { ok: true, status: 200, checkoutUrl, orderId: data.order_id as string | undefined }
}

export async function POST(req: NextRequest) {
  let raw: Record<string, unknown>
  try {
    raw = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }
  const resolved = resolve({
    tier: raw.tier as string,
    interval: raw.interval as string,
    email: raw.email as string,
    name: raw.name as string,
    gateway: raw.gateway as string,
  })
  if ('error' in resolved) {
    return NextResponse.json({ ok: false, error: resolved.error }, { status: 400 })
  }

  const result = await startGateway(req, resolved)
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status })
  }
  return NextResponse.json({
    ok: true,
    gateway: resolved.gateway,
    checkout_url: result.checkoutUrl,
    order_id: result.orderId,
    amount_cents: resolved.amountCents,
  })
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams
  const resolved = resolve({
    tier: sp.get('tier'),
    interval: sp.get('interval'),
    email: sp.get('email'),
    name: sp.get('name'),
    gateway: sp.get('gateway'),
  })
  if ('error' in resolved) {
    return NextResponse.json({ ok: false, error: resolved.error }, { status: 400 })
  }

  const result = await startGateway(req, resolved)
  if (!result.ok || !result.checkoutUrl) {
    // Bounce back to the upgrade page with an error flag rather than dead-ending.
    const back = new URL('/dashboard/upgrade', 'https://docai.bizlegal-ai.com')
    back.searchParams.set('error', result.error ?? 'checkout_failed')
    return NextResponse.redirect(back.toString(), { status: 303 })
  }
  return NextResponse.redirect(result.checkoutUrl, { status: 303 })
}
