import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db'
import { activateSchema } from '@/lib/rooms/schemas'
import { recordEvent } from '@/lib/rooms/create'
import { logEventAsync } from '@/lib/ops/log'

/**
 * POST /api/admin/rooms/[id]/activate — link a paid order to a room.
 *
 * Phase 0 money does not go through the hub checkout: root hard rule 5 blocks
 * real money there until Z7 is green, and no gateway in the fleet is confirmed
 * to settle ILS. Moses invoices in shekels under his own name, and the payment
 * is recorded as a manual `payment_orders` row — the O-018 precedent.
 *
 * This route does the last step: it verifies such a row exists, is active, and
 * belongs to a deal44 product, then stamps the room. It never creates the order
 * itself, so a room cannot mark itself paid.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 15

function authorised(req: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET ?? ''
  if (!secret) return false
  return req.headers.get('x-internal-secret') === secret
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  if (!authorised(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = activateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid_input' }, { status: 400 })

  const db = getServiceClient()

  const { data: order, error: orderErr } = await db
    .from('payment_orders')
    .select('id, product, status, amount_cents, currency, user_email')
    .eq('id', parsed.data.order_id)
    .maybeSingle()

  if (orderErr || !order) return NextResponse.json({ error: 'order_not_found' }, { status: 404 })
  if (!String(order.product ?? '').startsWith('deal44_')) {
    return NextResponse.json({ error: 'wrong_product', detail: order.product }, { status: 400 })
  }
  if (!['active', 'paid'].includes(String(order.status))) {
    return NextResponse.json({ error: 'order_not_active', detail: order.status }, { status: 409 })
  }

  const { error: updateErr } = await db
    .from('deals')
    .update({ paid_order_id: order.id, activated_at: new Date().toISOString() })
    .eq('id', params.id)

  if (updateErr) return NextResponse.json({ error: 'db_error' }, { status: 500 })

  await recordEvent(params.id, null, 'moses', 'room.activated', {
    order_id: order.id,
    product: order.product,
  })

  logEventAsync({
    type: 'payment.confirmed',
    source: 'deal44',
    ref_id: params.id,
    email: order.user_email ?? undefined,
    amount_cents: typeof order.amount_cents === 'number' ? order.amount_cents : undefined,
    status: 'ok',
    metadata: { product: order.product, currency: order.currency, source: 'manual_invoice' },
  })

  return NextResponse.json({ ok: true, deal_id: params.id, order_id: order.id })
}
