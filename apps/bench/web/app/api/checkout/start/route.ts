import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'

/**
 * POST /api/checkout/start — LIVE (2026-08-23). Forwards the validated body to
 * hub /api/pay/start, which builds the gateway URL via @bizlegal/payment
 * (products bench_audit_2500 / bench_managed_monthly are already registered).
 */

const CHECKOUT_LIVE = true as boolean

const BENCH_PRODUCTS = new Set(['bench_audit_2500', 'bench_managed_monthly'])
const HUB_PAY_START = 'https://bizlegal-ai.com/api/pay/start'

interface StartBody {
  product_id?: string
  user_email?: string
  gateway?: string
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: StartBody
  try {
    body = (await req.json()) as StartBody
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const productId = typeof body.product_id === 'string' ? body.product_id : ''
  const email = typeof body.user_email === 'string' ? body.user_email.trim().toLowerCase() : ''
  const gateway = body.gateway === 'card' || body.gateway === 'crypto' ? body.gateway : null

  if (!BENCH_PRODUCTS.has(productId) || !email.includes('@') || !gateway) {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 })
  }

  // Record intent either way — demand for a dark checkout is a launch signal.
  logEventAsync({
    type: 'agent.checkout',
    source: 'bench',
    email,
    status: 'pending',
    metadata: { product_id: productId, gateway, live: CHECKOUT_LIVE },
  })

  if (!CHECKOUT_LIVE) {
    return NextResponse.json({ ok: false, error: 'checkout_not_live' }, { status: 503 })
  }

  const res = await fetch(HUB_PAY_START, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'user-agent': 'bizlegal-agent/1.0' },
    body: JSON.stringify({ product_id: productId, user_email: email, gateway }),
  })
  const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>
  return NextResponse.json(payload, { status: res.status })
}

export function GET(): NextResponse {
  return NextResponse.json({
    ok: true,
    service: 'bench',
    endpoint: 'checkout/start',
    live: CHECKOUT_LIVE,
  })
}
