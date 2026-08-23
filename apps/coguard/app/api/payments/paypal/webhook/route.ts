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

function paypalBase() {
  return process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
}

async function verifyPayPalWebhook(req: NextRequest, rawBody: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_COGUARD_WEBHOOK_ID ?? process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) {
    console.warn('[coguard/paypal/webhook] PAYPAL_COGUARD_WEBHOOK_ID missing')
    return process.env.NODE_ENV !== 'production'
  }
  const id = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!id || !secret) return false
  const auth = Buffer.from(`${id}:${secret}`).toString('base64')
  const tokenRes = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })
  if (!tokenRes.ok) return false
  const { access_token } = (await tokenRes.json()) as { access_token: string }
  const verifyRes = await fetch(`${paypalBase()}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ auth_algo: req.headers.get('paypal-auth-algo'), cert_url: req.headers.get('paypal-cert-url'), transmission_id: req.headers.get('paypal-transmission-id'), transmission_sig: req.headers.get('paypal-transmission-sig'), transmission_time: req.headers.get('paypal-transmission-time'), webhook_id: webhookId, webhook_event: JSON.parse(rawBody) }),
  })
  if (!verifyRes.ok) return false
  const out = (await verifyRes.json()) as { verification_status: string }
  return out.verification_status === 'SUCCESS'
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const verified = await verifyPayPalWebhook(req, rawBody)
    if (!verified) return NextResponse.json({ error: 'webhook verification failed' }, { status: 401 })

    const event = JSON.parse(rawBody) as { event_type: string; resource: { custom_id?: string; id?: string } }
    const orderId = event.resource.custom_id
    if (!orderId) return NextResponse.json({ ok: true, ignored: true })

    const supabase = getSupabase()
    const updates: Record<string, unknown> = { metadata: { last_event: event } }

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'PAYMENT.CAPTURE.COMPLETED':
        updates.status = 'active'
        updates.activated_at = new Date().toISOString()
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
        return NextResponse.json({ ok: true, ignored: true })
    }

    await supabase.from('payment_orders').update(updates).eq('id', orderId)

    const { data: order } = await supabase.from('payment_orders').select('user_email, amount_cents, tier').eq('id', orderId).maybeSingle()

    if (updates.status === 'active') {
      logEventAsync({ type: 'payment.confirmed', source: 'coguard', ref_id: String(orderId), email: order?.user_email ?? undefined, amount_cents: order?.amount_cents, status: 'ok', metadata: { gateway: 'paypal', event_type: event.event_type, tier: order?.tier } })

      const internalSecret = process.env.COGUARD_INTERNAL_SECRET
      if (internalSecret && order?.user_email) {
        fetch('https://coguard.bizlegal-ai.com/api/provision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-internal-secret': internalSecret },
          body: JSON.stringify({ payment_order_id: orderId, email: order.user_email, tier: order.tier }),
        }).catch(err => console.warn('[paypal/webhook] provision failed', err))
      }
    }

    return NextResponse.json({ ok: true, status: updates.status })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
  }
}
