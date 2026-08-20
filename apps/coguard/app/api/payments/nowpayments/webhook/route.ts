import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

function sortedJsonString(obj: Record<string, unknown>): string {
  const sorted = Object.keys(obj).sort().reduce<Record<string, unknown>>((acc, k) => { acc[k] = obj[k]; return acc }, {})
  return JSON.stringify(sorted)
}

function verifyIpnSignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const parsed = JSON.parse(rawBody) as Record<string, unknown>
    const expected = crypto.createHmac('sha512', secret).update(sortedJsonString(parsed)).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'))
  } catch { return false }
}

interface NowPaymentsIpn {
  payment_id: string
  payment_status: string
  order_id?: string
}

const TERMINAL_PAID = ['finished', 'confirmed', 'sending']
const TERMINAL_FAILED = ['failed', 'expired']

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.NOWPAYMENTS_IPN_SECRET
    if (!secret) return NextResponse.json({ error: 'not configured' }, { status: 500 })

    const signature = req.headers.get('x-nowpayments-sig') ?? ''
    if (!signature) return NextResponse.json({ error: 'missing signature' }, { status: 401 })

    const rawBody = await req.text()
    if (!verifyIpnSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
    }

    const ipn = JSON.parse(rawBody) as NowPaymentsIpn
    if (!ipn.order_id) return NextResponse.json({ error: 'missing order_id' }, { status: 400 })

    const supabase = getSupabase()
    const { data: order } = await supabase
      .from('payment_orders')
      .select('id, billing_interval, status, user_email, amount_cents, tier')
      .eq('id', ipn.order_id)
      .single()

    if (!order) return NextResponse.json({ error: 'order not found' }, { status: 404 })

    let newStatus: string | null = null
    const updateBody: Record<string, unknown> = { metadata: { last_ipn: ipn }, last_charge_at: new Date().toISOString() }

    if (TERMINAL_PAID.includes(ipn.payment_status)) {
      newStatus = 'active'
      updateBody.status = 'active'
      updateBody.activated_at = new Date().toISOString()
      if (order.billing_interval === 'monthly') {
        const next = new Date(); next.setUTCDate(next.getUTCDate() + 30)
        updateBody.next_charge_at = next.toISOString()
      } else if (order.billing_interval === 'yearly') {
        const next = new Date(); next.setUTCDate(next.getUTCDate() + 365)
        updateBody.next_charge_at = next.toISOString()
      }
    } else if (TERMINAL_FAILED.includes(ipn.payment_status)) {
      newStatus = 'failed'
      updateBody.status = 'failed'
    }

    await supabase.from('payment_orders').update(updateBody).eq('id', order.id)

    if (newStatus === 'active') {
      logEventAsync({ type: 'payment.confirmed', source: 'coguard', ref_id: String(order.id), email: order.user_email ?? undefined, amount_cents: order.amount_cents, status: 'ok', metadata: { gateway: 'nowpayments', tier: order.tier, payment_status: ipn.payment_status } })

      // Fire provision endpoint to assign inbox alias + reply address
      const provisionBase = 'https://coguard.bizlegal-ai.com'
      const internalSecret = process.env.COGUARD_INTERNAL_SECRET
      if (internalSecret) {
        fetch(`${provisionBase}/api/provision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-internal-secret': internalSecret },
          body: JSON.stringify({ payment_order_id: order.id, email: order.user_email, tier: order.tier }),
        }).catch(err => console.warn('[nowpayments/webhook] provision failed', err))
      }
    } else if (newStatus === 'failed') {
      logEventAsync({ type: 'payment.failed', source: 'coguard', ref_id: String(order.id), email: order.user_email ?? undefined, status: 'failed', metadata: { gateway: 'nowpayments', payment_status: ipn.payment_status } })
    }

    return NextResponse.json({ ok: true, status: newStatus ?? ipn.payment_status })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
  }
}
