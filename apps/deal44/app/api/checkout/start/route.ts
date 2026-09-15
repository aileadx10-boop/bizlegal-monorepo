import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, clientIpFromHeaders } from '@bizlegal/rate-limit'
import { logEventAsync } from '@/lib/ops/log'
import { isDeal44Currency, isGateway, optionFor, railAllowed } from '@/lib/checkout/rails'

/**
 * POST /api/checkout/start — the buyer picks a currency, we open checkout.
 *
 * Forwards to the hub's universal `/api/pay/start`, which is the only place a
 * gateway URL is ever built (root hard rule 2 — no payment URL constants). The
 * hop through this route exists because `/api/pay/start` sets no CORS headers,
 * so a browser POST from deal44.bizlegal-ai.com to bizlegal-ai.com would be
 * blocked before it left the page. Same shape as `apps/bench/web/app/api/
 * checkout/start`.
 *
 * The currency → rail rule is enforced here AND in the hub. Two layers on
 * purpose: this one keeps a dead button off the screen, the hub's keeps an
 * unsettleable order out of the database even if someone posts here directly.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const HUB_PAY_START = 'https://bizlegal-ai.com/api/pay/start'

interface StartBody {
  currency?: unknown
  user_email?: unknown
  gateway?: unknown
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = clientIpFromHeaders(req.headers)
  const limit = rateLimit('deal44-checkout', ip ?? 'unknown', { limit: 8, windowMs: 60_000 })
  if (!limit.ok) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })

  let body: StartBody
  try {
    body = (await req.json()) as StartBody
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const currency = body.currency
  const gateway = body.gateway
  const email =
    typeof body.user_email === 'string' ? body.user_email.trim().toLowerCase() : ''

  if (!isDeal44Currency(currency) || !isGateway(gateway) || !email.includes('@')) {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 })
  }

  if (!railAllowed(currency, gateway)) {
    // Not a refusal to sell: the shekel sale happens by invoice instead.
    return NextResponse.json(
      { ok: false, error: 'currency_not_supported_by_gateway', currency, gateway },
      { status: 503 },
    )
  }

  const option = optionFor(currency)

  logEventAsync({
    type: 'agent.checkout',
    source: 'deal44',
    email,
    status: 'pending',
    metadata: { step: 'checkout_start', product_id: option.productId, gateway, currency },
  })

  let res: Response
  try {
    res = await fetch(HUB_PAY_START, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'user-agent': 'bizlegal-agent/1.0' },
      body: JSON.stringify({
        product_id: option.productId,
        user_email: email,
        gateway,
        // Read back by the hub's deal44 grant, and the only thing that marks an
        // order as having come from this page rather than a manual invoice.
        source: 'deal44_start',
      }),
      cache: 'no-store',
    })
  } catch (err) {
    console.warn('[deal44/checkout] hub unreachable:', err instanceof Error ? err.message : err)
    logEventAsync({
      type: 'error',
      source: 'deal44',
      email,
      status: 'failed',
      metadata: { step: 'checkout_start', product_id: option.productId, reason: 'hub_unreachable' },
    })
    return NextResponse.json({ ok: false, error: 'checkout_unavailable' }, { status: 502 })
  }

  const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>
  return NextResponse.json(payload, { status: res.status })
}

export function GET(): NextResponse {
  return NextResponse.json({ ok: true, service: 'deal44', endpoint: 'checkout/start' })
}
