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

/**
 * Alert Moses when an IPN arrives for an order we have no record of.
 *
 * Uses plain text (not MarkdownV2) so no payload value can break parsing and
 * swallow the alert. Fails soft: an alerting failure must never turn into a
 * non-2xx, or the gateway starts a retry storm on top of the original problem.
 */
async function alertUnrecordedPayment(ipn: NowPaymentsIpn): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const text = [
    '🚨 UNRECORDED PAYMENT',
    '',
    'A NOWPayments IPN referenced an order that does not exist in payment_orders.',
    'A customer may have paid with no record.',
    '',
    `order_id: ${ipn.order_id}`,
    `payment_id: ${ipn.payment_id}`,
    `status: ${ipn.payment_status}`,
    `amount: ${ipn.price_amount ?? '?'} ${ipn.price_currency ?? ''}`,
    '',
    'Likely cause: the invoice was created by a /start route that did not insert',
    'a payment_orders row first (e.g. /api/pay/start). Reconcile manually in the',
    'NOWPayments dashboard.',
  ].join('\n')

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    })
  } catch (err: unknown) {
    console.error('[nowpayments/webhook] telegram alert failed', err)
  }
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

    const supabase = getSupabase()

    // Find the order.
    //
    // 2026-07-30: this lookup MUST happen before the idempotency claim.
    // `order_id` is expected to be a `payment_orders.id` uuid — that is the
    // contract `/api/payments/{nowpayments,paypal,wire}/start` upholds by
    // inserting the row first and passing its id to the gateway. A malformed
    // or unknown order_id therefore means the money arrived through a path
    // that never recorded it (see the `/api/pay/start` 503 in that route).
    const { data: order } = await supabase
      .from('payment_orders')
      .select('id, billing_interval, status, user_email, user_name, amount_cents, product, tier, source')
      .eq('id', ipn.order_id)
      .single()

    if (!order) {
      // Scream, then ACK. Two deliberate choices:
      //
      // 1. We return 200, not 404. NOWPayments retries non-2xx for ~25h, and
      //    a retry storm neither finds the missing row nor alerts anyone.
      // 2. We alert loudly, because this branch means a customer may have
      //    paid with no order record. That is the worst failure this service
      //    has, and it used to be a silent console.warn.
      console.error('[nowpayments/webhook] ORDER NOT FOUND — possible unrecorded payment', {
        order_id: ipn.order_id,
        payment_id: ipn.payment_id,
        payment_status: ipn.payment_status,
        price_amount: ipn.price_amount,
      })
      logEventAsync({
        type: 'error',
        source: 'hub',
        ref_id: String(ipn.payment_id ?? ipn.order_id),
        status: 'failed',
        metadata: {
          scope: 'nowpayments_webhook',
          reason: 'order_not_found',
          order_id: ipn.order_id,
          payment_id: ipn.payment_id,
          payment_status: ipn.payment_status,
          price_amount: ipn.price_amount,
          hint: 'order_id is not a payment_orders.id uuid — check which /start route created this invoice',
        },
      })
      await alertUnrecordedPayment(ipn)
      return NextResponse.json({ ok: true, order_not_found: true, alerted: true })
    }

    // 2026-05-11 idempotency claim (CODE-REVIEW-W5 H-01 + SECURITY-W5 S-C1).
    // NOWPayments retries IPN deliveries until they see 2xx. Without a
    // claim, multiple retries for the same payment_id duplicate the
    // payment.confirmed event and double-fire markNurturePaid.
    //
    // We claim on (payment_id, payment_status) so transitions through
    // multiple statuses (waiting → confirming → finished) each get
    // processed once, but the SAME status delivered twice is deduped.
    //
    // Claiming AFTER the order lookup is deliberate: claiming first meant a
    // transient lookup failure permanently burned the event, so every
    // subsequent retry deduped to 200 and the order never reconciled.
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

      // On payment failure/refund, queue for dunning recovery (3-stage email cadence).
      if ((newStatus === 'failed' || newStatus === 'refunded') && order.user_email) {
        void supabase
          .from('dunning_queue')
          .insert({
            email: order.user_email,
            name: order.user_name ?? null,
            product: order.product ?? 'hub',
            amount_usd: (order.amount_cents ?? 0) / 100,
            payment_initiated_at: new Date().toISOString(),
            last_stage_sent: 0,
          })
          .then(({ error }) => {
            if (error) console.warn('[nowpayments/webhook] dunning insert failed:', error)
          })
      }

      // Phase AA V3 — stop the nurture sequence the moment a customer
      // pays. One user can have multiple nurture rows across verticals;
      // mark them all paid so they don't get last_call upsells. Skipped
      // for refunded/failed because the cadence might still convert
      // them on a future visit.
      if (newStatus === 'active' && order.user_email) {
        // Auto-subscribe paying customers so they receive product emails.
        void supabase
          .from('subscribers')
          .upsert(
            {
              email: order.user_email,
              source: 'checkout_success',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'email', ignoreDuplicates: false },
          )
          .then(({ error }) => {
            if (error) console.warn('[nowpayments/webhook] subscriber upsert failed:', error)
          })

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
