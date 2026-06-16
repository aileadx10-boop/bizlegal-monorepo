import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'
import { logEventAsync } from '@/lib/ops/log'
import { markNurturePaid } from '@/lib/nurture-state'
import { claimWebhookEvent } from '@/lib/payments/webhook-idempotency'
import { grantConductorTier } from '@/lib/payments/conductor-grant'
import { sendPaymentConfirmationEmail } from '@/lib/resend'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

// NOWPayments IPN signature is a HMAC-SHA512 hex of the *sorted* JSON of
// the request body, signed with NOWPAYMENTS_IPN_SECRET. Header name:
// `x-nowpayments-sig`. See https://documenter.getpostman.com/view/7907941/S1a32n38
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
    const sortedString = sortedJsonString(parsed)
    const expected = crypto.createHmac('sha512', secret).update(sortedString).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'))
  } catch {
    return false
  }
}

interface NowPaymentsIpn {
  payment_id: string
  payment_status: string  // 'waiting' | 'confirming' | 'confirmed' | 'sending' | 'partially_paid' | 'finished' | 'failed' | 'refunded' | 'expired'
  pay_address?: string
  price_amount?: number
  price_currency?: string
  pay_amount?: number
  actually_paid?: number
  pay_currency?: string
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
      return NextResponse.json({ error: 'missing_order_id' }, { status: 400 })
    }

    // 2026-05-11 idempotency claim (CODE-REVIEW-W5 H-01 + SECURITY-W5 S-C1).
    // NOWPayments retries IPN deliveries until they see 2xx. Without a
    // claim, multiple retries for the same payment_id duplicate the
    // payment.confirmed event and double-fire markNurturePaid.
    //
    // We claim on (payment_id, payment_status) so transitions through
    // multiple statuses (waiting → confirming → finished) each get
    // processed once, but the SAME status delivered twice is deduped.
    const npEventId = `${ipn.payment_id}:${ipn.payment_status}`
    const claim = await claimWebhookEvent({
      gateway: 'nowpayments',
      eventId: npEventId,
      eventType: ipn.payment_status,
    })
    if (claim === 'duplicate') {
      return NextResponse.json({ ok: true, deduped: true })
    }
    if (claim === 'error') {
      return NextResponse.json(
        { error: 'idempotency_storage_failed' },
        { status: 500 },
      )
    }

    const supabase = getSupabase()

    // Find the order
    const { data: order } = await supabase
      .from('payment_orders')
      .select('id, billing_interval, status, user_email, amount_cents, product, tier, source')
      .eq('id', ipn.order_id)
      .single()

    if (!order) {
      console.warn('[nowpayments/webhook] order not found', ipn.order_id)
      return NextResponse.json({ error: 'order not found' }, { status: 404 })
    }

    let newStatus: string | null = null
    let nextCharge: string | null = null
    let activatedAt: string | null = null
    let refundedAt: string | null = null

    if (TERMINAL_PAID.includes(ipn.payment_status)) {
      newStatus = 'active'
      activatedAt = order.status === 'active' ? null : new Date().toISOString()
      // For recurring intervals, schedule the next charge.
      if (order.billing_interval === 'monthly') {
        const next = new Date()
        next.setUTCDate(next.getUTCDate() + 30)
        nextCharge = next.toISOString()
      } else if (order.billing_interval === 'yearly') {
        const next = new Date()
        next.setUTCDate(next.getUTCDate() + 365)
        nextCharge = next.toISOString()
      }
    } else if (TERMINAL_FAILED.includes(ipn.payment_status)) {
      newStatus = 'failed'
    } else if (TERMINAL_REFUNDED.includes(ipn.payment_status)) {
      newStatus = 'refunded'
      refundedAt = new Date().toISOString()
    }

    const updateBody: Record<string, unknown> = {
      metadata: { last_ipn: ipn },
      last_charge_at: new Date().toISOString(),
    }
    if (newStatus) updateBody.status = newStatus
    if (nextCharge) updateBody.next_charge_at = nextCharge
    if (activatedAt) updateBody.activated_at = activatedAt
    if (refundedAt) updateBody.refunded_at = refundedAt

    const { error: updateErr } = await supabase
      .from('payment_orders')
      .update(updateBody)
      .eq('id', order.id)

    if (updateErr) {
      console.error('[nowpayments/webhook] update failed', updateErr)
      return NextResponse.json({ error: 'update failed' }, { status: 500 })
    }

    if (newStatus === 'active' || newStatus === 'failed' || newStatus === 'refunded') {
      logEventAsync({
        type:
          newStatus === 'active'
            ? 'payment.confirmed'
            : newStatus === 'refunded'
              ? 'payment.refunded'
              : 'payment.failed',
        source: 'hub',
        ref_id: String(order.id),
        email: order.user_email ?? undefined,
        amount_cents: order.amount_cents,
        status: newStatus === 'active' ? 'ok' : 'failed',
        metadata: {
          gateway: 'nowpayments',
          product: order.product,
          tier: order.tier,
          interval: order.billing_interval,
          payment_status: ipn.payment_status,
          order_source: order.source,
        },
      })

      // Phase AA V3 — stop the nurture sequence the moment a customer
      // pays. One user can have multiple nurture rows across verticals;
      // mark them all paid so they don't get last_call upsells. Skipped
      // for refunded/failed because the cadence might still convert
      // them on a future visit.
      if (newStatus === 'active' && order.user_email) {
        void markNurturePaid(order.user_email).catch((err) =>
          console.warn('[nowpayments/webhook] mark-paid failed:', err),
        )
        // Conductor entitlement write-through (no-op for other products).
        await grantConductorTier(supabase, order)
        // Send payment confirmation email to customer (non-blocking).
        void sendPaymentConfirmationEmail(
          order.user_email,
          order.product ?? 'your product',
          order.amount_cents ?? 0,
          order.billing_interval ?? null,
        ).catch((err) =>
          console.warn('[nowpayments/webhook] confirmation email failed:', err),
        )
      }
    }

    return NextResponse.json({ ok: true, status: newStatus ?? ipn.payment_status })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[nowpayments/webhook]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
