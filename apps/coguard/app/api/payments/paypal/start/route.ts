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

async function getAccessToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!id || !secret) throw new Error('PayPal credentials not configured')
  const auth = Buffer.from(`${id}:${secret}`).toString('base64')
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`)
  return ((await res.json()) as { access_token: string }).access_token
}

const VALID_PRODUCTS: Record<string, { amount_cents: number; billing_interval: string }> = {
  coguard_solo_monthly:       { amount_cents: 1499, billing_interval: 'monthly' },
  coguard_solo_yearly:        { amount_cents: 12900, billing_interval: 'yearly' },
  coguard_litigation_monthly: { amount_cents: 2999, billing_interval: 'monthly' },
  coguard_litigation_yearly:  { amount_cents: 24900, billing_interval: 'yearly' },
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('product_id') ?? ''
    const email = searchParams.get('email') ?? ''

    const spec = VALID_PRODUCTS[productId]
    if (!spec) return NextResponse.json({ error: 'unknown product_id' }, { status: 400 })

    const supabase = getSupabase()
    const { data: order, error: insertErr } = await supabase
      .from('payment_orders')
      .insert({ user_email: email || null, product: 'coguard', tier: productId, billing_interval: spec.billing_interval, amount_cents: spec.amount_cents, gateway: 'paypal', status: 'pending', source: 'coguard_pricing' })
      .select('id')
      .single()

    if (insertErr || !order) return NextResponse.json({ error: 'order creation failed' }, { status: 500 })

    const baseUrl = process.env.NEXT_PUBLIC_COGUARD_SITE_URL ?? 'https://coguard.bizlegal-ai.com'

    // Look up PayPal plan ID from env
    const planEnvKey = `PAYPAL_PLAN_ID_${productId.toUpperCase()}`
    const planId = (process.env as Record<string, string | undefined>)[planEnvKey]

    if (!planId) {
      return NextResponse.json({ error: `PayPal plan not configured. Set ${planEnvKey} in env.` }, { status: 503 })
    }

    const token = await getAccessToken()
    const subRes = await fetch(`${paypalBase()}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: order.id,
        subscriber: email ? { email_address: email } : undefined,
        application_context: {
          return_url: `${baseUrl}/payment/paypal/return?order=${order.id}`,
          cancel_url: `${baseUrl}/pricing`,
        },
      }),
    })

    if (!subRes.ok) {
      const txt = await subRes.text().catch(() => '')
      await supabase.from('payment_orders').update({ status: 'failed' }).eq('id', order.id)
      return NextResponse.json({ error: 'PayPal subscription creation failed' }, { status: 502 })
    }

    const sub = (await subRes.json()) as { id: string; links: Array<{ rel: string; href: string }> }
    const approveUrl = sub.links.find(l => l.rel === 'approve')?.href

    await supabase.from('payment_orders').update({ gateway_subscription_id: sub.id }).eq('id', order.id)

    logEventAsync({ type: 'payment.intent', source: 'coguard', ref_id: String(order.id), email: email || undefined, amount_cents: spec.amount_cents, status: 'pending', metadata: { gateway: 'paypal', product_id: productId, paypal_subscription_id: sub.id } })

    if (approveUrl) return NextResponse.redirect(approveUrl)
    return NextResponse.json({ order_id: order.id, subscription_id: sub.id, approve_url: approveUrl })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
  }
}
