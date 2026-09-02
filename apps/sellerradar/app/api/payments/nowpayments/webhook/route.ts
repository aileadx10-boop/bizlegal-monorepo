import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { fulfillPaidOrder } from '@/lib/fulfill'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/payments/nowpayments/webhook — IPN fulfillment (fleet pattern).
 * NOWPayments signs the sorted-JSON body with HMAC-SHA512 hex against
 * NOWPAYMENTS_IPN_SECRET, delivered in `x-nowpayments-sig`.
 */

function sortedJsonString(obj: Record<string, unknown>): string {
  const sorted = Object.keys(obj)
    .sort()
    .reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = obj[k]
      return acc
    }, {})
  return JSON.stringify(sorted)
}

function verifyIpnSignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const parsed = JSON.parse(rawBody) as Record<string, unknown>
    const expected = crypto.createHmac('sha512', secret).update(sortedJsonString(parsed)).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'))
  } catch {
    return false
  }
}

interface NowPaymentsIpn {
  payment_id: string
  payment_status: string
  price_amount?: number
  price_currency?: string
  order_id?: string
  order_description?: string
  invoice_id?: string
}

const TERMINAL_PAID = ['finished', 'confirmed', 'sending']
const TERMINAL_FAILED = ['failed', 'expired']
const TERMINAL_REFUNDED = ['refunded']

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.NOWPAYMENTS_IPN_SECRET
    if (!secret) {
      console.error('[nowpayments/webhook] NOWPAYMENTS_IPN_SECRET missing')
      return NextResponse.json({ error: 'webhook secret not configured' }, { status: 500 })
    }

    const signature = req.headers.get('x-nowpayments-sig') ?? ''
    if (!signature) {
      return NextResponse.json({ error: 'missing signature' }, { status: 401 })
    }

    const rawBody = await req.text()
    if (!verifyIpnSignature(rawBody, signature, secret)) {
      console.warn('[nowpayments/webhook] HMAC verify failed')
      return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
    }

    const ipn = JSON.parse(rawBody) as NowPaymentsIpn
    if (!ipn.order_id) {
      return NextResponse.json({ error: 'missing order_id' }, { status: 400 })
    }

    const { data: order } = await supabaseAdmin
      .from('sellerradar_orders')
      .select('id, report_id, analysis_id, email, tier, status')
      .eq('report_id', ipn.order_id)
      .maybeSingle()

    if (!order) {
      console.warn('[nowpayments/webhook] order not found', ipn.order_id)
      return NextResponse.json({ error: 'order not found' }, { status: 404 })
    }

    if (TERMINAL_PAID.includes(ipn.payment_status)) {
      // Idempotent: fulfillPaidOrder's paid_at gate short-circuits a replay.
      await supabaseAdmin
        .from('sellerradar_orders')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', order.id)
      await fulfillPaidOrder(order)
      return NextResponse.json({ ok: true, status: 'paid' })
    }

    if (TERMINAL_FAILED.includes(ipn.payment_status)) {
      await supabaseAdmin.from('sellerradar_orders').update({ status: 'failed' }).eq('id', order.id)
      return NextResponse.json({ ok: true, status: 'failed' })
    }

    if (TERMINAL_REFUNDED.includes(ipn.payment_status)) {
      await supabaseAdmin.from('sellerradar_orders').update({ status: 'refunded' }).eq('id', order.id)
      return NextResponse.json({ ok: true, status: 'refunded' })
    }

    // Intermediate status (waiting/confirming) — acknowledge so IPN stops retrying.
    return NextResponse.json({ ok: true, status: ipn.payment_status })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[nowpayments/webhook]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
