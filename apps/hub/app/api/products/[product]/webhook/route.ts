import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// NOWPayments webhook
async function handleNOWPayments(body: Record<string, string>) {
  if (body.payment_status !== 'finished') return

  await supabase
    .from('orders')
    .update({ status: 'completed', payment_id: body.pay_id, updated_at: new Date().toISOString() })
    .eq('id', body.order_id)
}

// PayPal webhook
async function handlePayPal(body: { event_type: string; resource: { id: string; purchase_units?: Array<{ reference_id: string }> } }) {
  if (body.event_type !== 'CHECKOUT.ORDER.COMPLETED') return

  const orderId = body.resource?.purchase_units?.[0]?.reference_id
  if (!orderId) return

  await supabase
    .from('orders')
    .update({ status: 'completed', payment_id: body.resource.id, updated_at: new Date().toISOString() })
    .eq('id', orderId)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { product: string } }
) {
  try {
    const body = await request.json()

    // Detect provider by payload shape
    if ('payment_status' in body)  await handleNOWPayments(body)
    if ('event_type'     in body)  await handlePayPal(body)

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[webhook]', params.product, err)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 })
  }
}
