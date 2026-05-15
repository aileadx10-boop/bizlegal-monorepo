import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'
import { markNurturePaid } from '@/lib/nurture-state'
import { claimWebhookEvent } from '@/lib/payments/webhook-idempotency'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// Terminal states — once we've moved to one of these, a stale earlier
// event (e.g. out-of-order ACTIVATED arriving after CANCELLED) must NOT
// rewind state. Closes CODE-REVIEW-W5 H-01 second half. See lookup in
// the switch below.
const TERMINAL_STATES = new Set(['cancelled', 'expired', 'refunded'])

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

function paypalBase(): string {
  return process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

interface PayPalEvent {
  id: string
  event_type: string
  resource: Record<string, unknown> & {
    custom_id?: string
    id?: string
    status?: string
  }
}

// Verify webhook via PayPal's verify-webhook-signature endpoint.
// Requires PAYPAL_WEBHOOK_ID env var.
//
// D10 SECURITY-V3 H-3 fix: previously this function returned `true`
// in any non-production env when PAYPAL_WEBHOOK_ID was unset, which
// meant a Vercel preview deployment effectively accepted UNSIGNED
// PayPal webhooks. Closed: missing env var now always rejects (return
// false). Use a real test webhook ID in preview/staging if you need
// to exercise this code path.
async function verifyPayPalWebhook(req: NextRequest, rawBody: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) {
    console.warn('[paypal/webhook] PAYPAL_WEBHOOK_ID missing — rejecting')
    return false
  }

  const id = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!id || !secret) return false

  const auth = Buffer.from(`${id}:${secret}`).toString('base64')
  const tokenRes = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!tokenRes.ok) return false
  const { access_token } = (await tokenRes.json()) as { access_token: string }

  const verifyRes = await fetch(`${paypalBase()}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: req.headers.get('paypal-auth-algo'),
      cert_url: req.headers.get('paypal-cert-url'),
      transmission_id: req.headers.get('paypal-transmission-id'),
      transmission_sig: req.headers.get('paypal-transmission-sig'),
      transmission_time: req.headers.get('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  })
  if (!verifyRes.ok) return false
  const out = (await verifyRes.json()) as { verification_status: string }
  return out.verification_status === 'SUCCESS'
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const verified = await verifyPayPalWebhook(req, rawBody)
    if (!verified) {
      return NextResponse.json({ error: 'webhook_verification_failed' }, { status: 401 })
    }

    const event = JSON.parse(rawBody) as PayPalEvent & { create_time?: string }
    const supabase = getSupabase()

    // 2026-05-11 idempotency claim (CODE-REVIEW-W5 H-01 + SECURITY-W5 S-C1):
    // PayPal re-delivers any event for up to 25h. Without this claim,
    // a replayed ACTIVATED arriving after CANCELLED revives a cancelled
    // sub. Claim before processing; duplicates 200-fast.
    const claim = await claimWebhookEvent({
      gateway: 'paypal',
      eventId: event.id,
      eventType: event.event_type,
      eventReceivedAt: event.create_time ?? null,
    })
    if (claim === 'duplicate') {
      return NextResponse.json({ ok: true, deduped: true })
    }
    if (claim === 'error') {
      // Storage layer down → 500 so PayPal retries with backoff.
      return NextResponse.json(
        { error: 'idempotency_storage_failed' },
        { status: 500 },
      )
    }

    // PayPal Subscriptions: custom_id we set during start() ties back to our order.id
    const orderId = event.resource.custom_id

    if (!orderId) {
      console.warn('[paypal/webhook] no custom_id on event', event.event_type)
      return NextResponse.json({ ok: true, ignored: true })
    }

    const updates: Record<string, unknown> = {
      metadata: { last_event: event },
    }

    // Terminal-state guard: read the row's current status BEFORE applying
    // the transition. If we've already moved to cancelled/expired/refunded,
    // a stale earlier event must not rewind state. Closes CODE-REVIEW-W5
    // H-01 second half (out-of-order delivery).
    const { data: currentRow } = await supabase
      .from('payment_orders')
      .select('status')
      .eq('id', orderId)
      .maybeSingle()
    const currentStatus = typeof currentRow?.status === 'string' ? currentRow.status : null
    const isTerminal = currentStatus !== null && TERMINAL_STATES.has(currentStatus)

    // Map PayPal event_type → our status
    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
      case 'PAYMENT.CAPTURE.COMPLETED':
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        updates.status = 'active'
        updates.activated_at = new Date().toISOString()
        updates.last_charge_at = new Date().toISOString()
        break
      case 'BILLING.SUBSCRIPTION.RENEWED':
        updates.last_charge_at = new Date().toISOString()
        break
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        updates.status = 'past_due'
        break
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        updates.status = 'cancelled'
        updates.cancelled_at = new Date().toISOString()
        break
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        updates.status = 'expired'
        break
      case 'PAYMENT.CAPTURE.REFUNDED':
        updates.status = 'refunded'
        updates.refunded_at = new Date().toISOString()
        break
      default:
        console.log('[paypal/webhook] ignored event', event.event_type)
        return NextResponse.json({ ok: true, ignored: true })
    }

    // Terminal-state guard: if the row is already cancelled/expired/refunded,
    // ONLY allow updates that don't transition status back. Refunds are
    // allowed to overwrite cancelled (a cancelled-then-refunded path is real).
    if (isTerminal && typeof updates.status === 'string') {
      const incoming = updates.status as string
      const allowedFromTerminal: Record<string, ReadonlyArray<string>> = {
        cancelled: ['refunded'],
        expired: ['refunded'],
        refunded: [],  // refunded is final
      }
      const permitted = currentStatus ? allowedFromTerminal[currentStatus] ?? [] : []
      if (!permitted.includes(incoming)) {
        console.warn(
          `[paypal/webhook] refused stale transition order=${orderId} current=${currentStatus} incoming=${incoming} event=${event.event_type}`,
        )
        return NextResponse.json({ ok: true, refused_stale_transition: true })
      }
    }

    const { error: updateErr } = await supabase
      .from('payment_orders')
      .update(updates)
      .eq('id', orderId)

    if (updateErr) {
      console.error('[paypal/webhook] update failed', updateErr.message)
      return NextResponse.json({ error: 'update_failed' }, { status: 500 })
    }

    if (typeof updates.status === 'string') {
      const opsType =
        updates.status === 'active'
          ? 'payment.confirmed'
          : updates.status === 'refunded'
            ? 'payment.refunded'
            : updates.status === 'cancelled' || updates.status === 'expired'
              ? 'subscription.cancelled'
              : updates.status === 'past_due'
                ? 'payment.failed'
                : null
      if (opsType) {
        // Look up order for amount + email metadata (best-effort)
        const { data: orderRow } = await supabase
          .from('payment_orders')
          .select('user_email, amount_cents, product, tier, billing_interval, source')
          .eq('id', orderId)
          .maybeSingle()
        logEventAsync({
          type: opsType,
          source: 'hub',
          ref_id: String(orderId),
          email: orderRow?.user_email ?? undefined,
          amount_cents: orderRow?.amount_cents ?? undefined,
          status: updates.status === 'active' ? 'ok' : 'failed',
          metadata: {
            gateway: 'paypal',
            event_type: event.event_type,
            product: orderRow?.product,
            tier: orderRow?.tier,
            interval: orderRow?.billing_interval,
            order_source: orderRow?.source,
          },
        })

        // Phase AA V3 — stop nurture cadence on confirmed payment.
        if (opsType === 'payment.confirmed' && orderRow?.user_email) {
          void markNurturePaid(orderRow.user_email).catch((err) =>
            console.warn('[paypal/webhook] mark-paid failed:', err),
          )
        }
      }
    }

    return NextResponse.json({ ok: true, status: updates.status })
  } catch (err) {
    // H-02 fix: opaque code to client; full detail stays server-side
    console.error('[paypal/webhook]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'webhook_processing_failed' }, { status: 500 })
  }
}
