import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

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
async function verifyPayPalWebhook(req: NextRequest, rawBody: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) {
    console.warn('[paypal/webhook] PAYPAL_WEBHOOK_ID missing — verification skipped')
    return process.env.NODE_ENV !== 'production'  // allow in dev for testing
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
      return NextResponse.json({ error: 'webhook verification failed' }, { status: 401 })
    }

    const event = JSON.parse(rawBody) as PayPalEvent
    const supabase = getSupabase()

    // PayPal Subscriptions: custom_id we set during start() ties back to our order.id
    const orderId =
      event.resource.custom_id ??
      ((event.resource as { custom_id?: string }).custom_id as string | undefined)

    if (!orderId) {
      // Some events (refunds via /v2/payments/captures/...) reference the
      // capture only — fall back to gateway_subscription_id lookup if we
      // wired that earlier. For now, log + ack.
      console.warn('[paypal/webhook] no custom_id on event', event.event_type)
      return NextResponse.json({ ok: true, ignored: true })
    }

    const updates: Record<string, unknown> = {
      metadata: { last_event: event },
    }

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

    const { error: updateErr } = await supabase
      .from('payment_orders')
      .update(updates)
      .eq('id', orderId)

    if (updateErr) {
      console.error('[paypal/webhook] update failed', updateErr)
      return NextResponse.json({ error: 'update failed' }, { status: 500 })
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
        const { data: orderRow } = await supabase
          .from('payment_orders')
          .select('user_email, amount_cents, product, tier, billing_interval, source')
          .eq('id', orderId)
          .maybeSingle()
        logEventAsync({
          type: opsType,
          source: 'docai',
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
      }
    }

    return NextResponse.json({ ok: true, status: updates.status })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[paypal/webhook]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
