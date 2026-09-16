import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, clientIpFromHeaders } from '@bizlegal/rate-limit'
import { logEventAsync } from '@/lib/ops/log'

/**
 * POST /api/checkout/start — the buyer picks a tier + interval + gateway.
 *
 * Two rails, deliberately not one:
 *   - card  → hub's legacy `/api/payments/paypal/start` (a real PayPal
 *     Subscription, `product:'brainx', tier, interval`). The universal
 *     `/api/pay/start` only builds PayPal Orders v2 (one-time) — routing a
 *     monthly SKU through it would silently bill once and then never again
 *     (decisions/REVENUE-MACHINE-PLAN-V3-2026-09-14.md defect A).
 *   - crypto → hub's universal `/api/pay/start`, YEARLY ONLY. A NOWPayments
 *     invoice is one charge; there is no crypto-subscriptions rail in this
 *     fleet. Monthly + crypto is refused here rather than silently sold as
 *     a one-time charge that then runs forever.
 *
 * Both hops exist because `/api/pay/start` and `/api/payments/paypal/start`
 * set no CORS headers — a browser POST from brainx.bizlegal-ai.com to
 * bizlegal-ai.com is blocked before it leaves the page. Same shape as
 * apps/deal44/app/api/checkout/start/route.ts.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const HUB_PAYPAL_START = 'https://bizlegal-ai.com/api/payments/paypal/start'
const HUB_PAY_START = 'https://bizlegal-ai.com/api/pay/start'

type Tier = 'radar' | 'radar_build'
type Interval = 'monthly' | 'yearly'
type Gateway = 'card' | 'crypto'

const TIERS: readonly Tier[] = ['radar', 'radar_build']
const INTERVALS: readonly Interval[] = ['monthly', 'yearly']

// Crypto yearly-only product ids (the honest, one-invoice-per-year rail).
const CRYPTO_YEARLY_PRODUCT: Readonly<Record<Tier, string>> = {
  radar: 'brainx_opportunity_radar_yearly',
  radar_build: 'brainx_radar_build_yearly',
}

interface StartBody {
  tier?: unknown
  interval?: unknown
  gateway?: unknown
  user_email?: unknown
}

function isTier(v: unknown): v is Tier {
  return typeof v === 'string' && (TIERS as readonly string[]).includes(v)
}
function isInterval(v: unknown): v is Interval {
  return typeof v === 'string' && (INTERVALS as readonly string[]).includes(v)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = clientIpFromHeaders(req.headers)
  const limit = rateLimit('brainx-checkout', ip ?? 'unknown', { limit: 8, windowMs: 60_000 })
  if (!limit.ok) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })

  let body: StartBody
  try {
    body = (await req.json()) as StartBody
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const tier = body.tier
  const interval = body.interval
  const gateway: Gateway = body.gateway === 'crypto' ? 'crypto' : 'card'
  const email = typeof body.user_email === 'string' ? body.user_email.trim().toLowerCase() : ''

  if (!isTier(tier) || !isInterval(interval) || !email.includes('@')) {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 })
  }

  if (gateway === 'crypto' && interval === 'monthly') {
    // Not a refusal to sell — the monthly rail is card-only by design.
    return NextResponse.json(
      { ok: false, error: 'recurring_requires_card', message: 'Monthly billing runs on card (PayPal subscription). Choose yearly for crypto, or switch to card.' },
      { status: 400 },
    )
  }

  logEventAsync({
    type: 'agent.checkout',
    source: 'brainx',
    email,
    status: 'pending',
    metadata: { step: 'checkout_start', tier, interval, gateway },
  })

  try {
    if (gateway === 'card') {
      const res = await fetch(HUB_PAYPAL_START, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'user-agent': 'bizlegal-agent/1.0' },
        body: JSON.stringify({ product: 'brainx', tier, interval, email, source: 'brainx_pricing' }),
        cache: 'no-store',
      })
      const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>
      if (!res.ok) return NextResponse.json({ ok: false, error: payload.error ?? 'checkout_unavailable' }, { status: res.status })
      return NextResponse.json({ ok: true, checkout_url: payload.approve_url ?? null, order_id: payload.order_id ?? null })
    }

    // crypto + yearly
    const productId = CRYPTO_YEARLY_PRODUCT[tier]
    const res = await fetch(HUB_PAY_START, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'user-agent': 'bizlegal-agent/1.0' },
      body: JSON.stringify({ product_id: productId, user_email: email, gateway: 'crypto', source: 'brainx_pricing' }),
      cache: 'no-store',
    })
    const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>
    return NextResponse.json(payload, { status: res.status })
  } catch (err) {
    console.warn('[brainx/checkout] hub unreachable:', err instanceof Error ? err.message : err)
    logEventAsync({ type: 'error', source: 'brainx', email, status: 'failed', metadata: { step: 'checkout_start', reason: 'hub_unreachable' } })
    return NextResponse.json({ ok: false, error: 'checkout_unavailable' }, { status: 502 })
  }
}
