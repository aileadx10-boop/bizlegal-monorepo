import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { sendIntakeEmail } from '@/lib/email'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'

/**
 * POST /api/fulfillment — hub apex-checkout grant callback.
 *
 * When a buyer pays for product=falseecho via bizlegal-ai.com/checkout, the
 * hub webhook's falseecho-grant helper POSTs here (HMAC-SHA256 over the raw
 * body with BIZLEGAL_INBOUND_SECRET, same protocol as /api/inbound-lead).
 * The apex checkout knows the buyer's email + tier but not the entity, so
 * we record the paid order as an unclaimed credit and email the intake link.
 */

interface FulfillmentPayload {
  email: string
  tier: string
  interval: string
  orderId: string
  amount_cents?: number
}

function timingSafeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'))
}

export async function POST(req: NextRequest) {
  const secret = process.env.BIZLEGAL_INBOUND_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'fulfillment_not_configured' }, { status: 503 })
  }
  const signature = req.headers.get('x-bizlegal-signature')
  if (!signature) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 401 })
  }
  const rawBody = await req.text()
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  if (!timingSafeHexEqual(expected, signature)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
  }

  let payload: FulfillmentPayload
  try {
    payload = JSON.parse(rawBody) as FulfillmentPayload
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  if (!payload.email || !payload.tier || !payload.orderId) {
    return NextResponse.json({ error: 'email, tier, orderId required' }, { status: 400 })
  }

  // Idempotent credit record — hub order id is the report_id.
  const { error: upsertErr } = await supabaseAdmin
    .from('falseecho_orders')
    .upsert(
      {
        report_id: payload.orderId,
        email: payload.email,
        tier: payload.tier,
        amount: (payload.amount_cents ?? 0) / 100,
        interval: payload.interval ?? 'one-time',
        status: 'paid',
        payment_provider: 'hub_apex',
        paid_at: new Date().toISOString(),
      },
      { onConflict: 'report_id' },
    )

  if (upsertErr) {
    console.error('[fulfillment] order upsert failed:', upsertErr.message)
    return NextResponse.json({ error: 'order record failed' }, { status: 500 })
  }

  await sendIntakeEmail({ to: payload.email, tier: payload.tier, orderId: payload.orderId })
    .catch((err) => console.warn('[fulfillment] intake email failed:', err))

  logEventAsync({
    type: 'payment.confirmed',
    source: 'falseecho',
    ref_id: payload.orderId,
    email: payload.email,
    amount_cents: payload.amount_cents,
    status: 'ok',
    metadata: { gateway: 'hub_apex', tier: payload.tier, interval: payload.interval },
  })

  return NextResponse.json({ ok: true, credited: true })
}
