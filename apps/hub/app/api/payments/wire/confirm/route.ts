/**
 * /api/payments/wire/confirm — Moses-only reconciliation endpoint.
 *
 * Called manually when a wire lands in the Banking Circle / Citibank
 * receiving account. Flips the order status from `pending_wire` -> `active`
 * (or `partial_paid` if amount mismatch), and fires the same `payment.confirmed`
 * event that other gateways fire — so downstream (markNurturePaid, ops feed)
 * behaves identically.
 *
 * Auth: `x-admin-token` header must match WIRE_ADMIN_TOKEN env. Set this
 * in Vercel to a long random string and use it via:
 *
 *   curl -s -X POST https://bizlegal-ai.com/api/payments/wire/confirm \
 *     -H "x-admin-token: $WIRE_ADMIN_TOKEN" \
 *     -H "Content-Type: application/json" \
 *     -d '{"order_id":"<uuid>","received_cents":499000,"received_at":"2026-05-21T08:00:00Z"}'
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'
import { markNurturePaid } from '@/lib/nurture-state'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

interface ConfirmBody {
  order_id: string
  received_cents: number
  received_at?: string
  note?: string
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const expected = process.env.WIRE_ADMIN_TOKEN
  if (!expected || expected.length < 20) {
    return NextResponse.json(
      { error: 'WIRE_ADMIN_TOKEN not configured on this deployment' },
      { status: 503 },
    )
  }
  const got = req.headers.get('x-admin-token') || ''
  if (!timingSafeEqual(got, expected)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: Partial<ConfirmBody>
  try {
    body = (await req.json()) as Partial<ConfirmBody>
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }
  if (!body.order_id || !body.received_cents) {
    return NextResponse.json({ error: 'order_id + received_cents required' }, { status: 400 })
  }
  const orderId = body.order_id
  const receivedCents = Number(body.received_cents)
  if (!Number.isFinite(receivedCents) || receivedCents < 1) {
    return NextResponse.json({ error: 'received_cents invalid' }, { status: 400 })
  }

  const supabase = getSupabase()
  const { data: row, error: getErr } = await supabase
    .from('payment_orders')
    .select('id, status, amount_cents, user_email, product, tier, billing_interval, source')
    .eq('id', orderId)
    .eq('gateway', 'wire')
    .maybeSingle()

  if (getErr) {
    // eslint-disable-next-line no-console
    console.error('[wire/confirm] lookup failed', getErr.message)
    return NextResponse.json({ error: 'lookup_failed' }, { status: 500 })
  }
  if (!row) {
    return NextResponse.json({ error: 'order_not_found' }, { status: 404 })
  }
  if (row.status === 'active') {
    return NextResponse.json({ ok: true, already_active: true })
  }

  const ordered = typeof row.amount_cents === 'number' ? row.amount_cents : 0
  const matchesAmount = ordered === receivedCents
  const newStatus = matchesAmount ? 'active' : 'partial_paid'
  const receivedAt = body.received_at ?? new Date().toISOString()

  const { error: updErr } = await supabase
    .from('payment_orders')
    .update({
      status: newStatus,
      activated_at: matchesAmount ? receivedAt : null,
      last_charge_at: receivedAt,
      metadata: {
        wire_received_cents: receivedCents,
        wire_received_at: receivedAt,
        wire_note: body.note ?? null,
      },
    })
    .eq('id', orderId)

  if (updErr) {
    // eslint-disable-next-line no-console
    console.error('[wire/confirm] update failed', updErr.message)
    return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  }

  logEventAsync({
    type: matchesAmount ? 'payment.confirmed' : 'payment.failed',
    source: 'hub',
    ref_id: String(orderId),
    email: row.user_email ?? undefined,
    amount_cents: receivedCents,
    status: matchesAmount ? 'ok' : 'failed',
    metadata: {
      gateway: 'wire',
      product: row.product,
      tier: row.tier,
      interval: row.billing_interval,
      order_source: row.source,
      expected_cents: ordered,
      received_cents: receivedCents,
    },
  })

  if (matchesAmount && row.user_email) {
    void markNurturePaid(row.user_email).catch((err) =>
      // eslint-disable-next-line no-console
      console.warn('[wire/confirm] markNurturePaid failed', err),
    )
  }

  return NextResponse.json({
    ok: true,
    order_id: orderId,
    status: newStatus,
    matched: matchesAmount,
    expected_cents: ordered,
    received_cents: receivedCents,
  })
}
