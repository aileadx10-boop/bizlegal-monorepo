import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

interface StartBody {
  product: string
  tier: string
  interval: 'one-time' | 'monthly' | 'yearly'
  amount_cents: number
  email: string
  name?: string
  source?: string
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

// PayPal API base — sandbox vs live based on PAYPAL_ENV.
function paypalBase(): string {
  return process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

async function getAccessToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!id || !secret) throw new Error('PayPal credentials not configured')
  const auth = Buffer.from(`${id}:${secret}`).toString('base64')
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status}`)
  }
  const json = (await res.json()) as { access_token: string }
  return json.access_token
}

// Map our (product, tier, interval) → PayPal Plan ID env var name.
// Plan IDs are created in PayPal dashboard. Until then, env var is empty
// and we return 503 with a helpful message — graceful degradation, no
// invented behaviour.
function paypalPlanIdFor(product: string, tier: string, interval: 'monthly' | 'yearly'): string | undefined {
  const k = `PAYPAL_PLAN_ID_${product.toUpperCase()}_${tier.toUpperCase()}_${interval.toUpperCase()}`
  return (process.env as Record<string, string | undefined>)[k]
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<StartBody>

    if (!body.product || !body.tier || !body.interval || !body.amount_cents || !body.email) {
      return NextResponse.json(
        { error: 'product, tier, interval, amount_cents, email required' },
        { status: 400 },
      )
    }

    const supabase = getSupabase()

    const { data: order, error: insertErr } = await supabase
      .from('payment_orders')
      .insert({
        user_email: body.email,
        user_name: body.name ?? null,
        product: body.product,
        tier: body.tier,
        billing_interval: body.interval,
        amount_cents: body.amount_cents,
        gateway: 'paypal',
        status: 'pending',
        source: body.source ?? 'hub_pricing',
      })
      .select('id')
      .single()

    if (insertErr || !order) {
      console.error('[paypal/start] supabase insert failed', insertErr)
      return NextResponse.json({ error: 'order creation failed' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bizlegal-ai.com'

    // ─────────────────────────────────────────────────────────
    // ONE-TIME: PayPal Orders API
    // ─────────────────────────────────────────────────────────
    if (body.interval === 'one-time') {
      const token = await getAccessToken()
      const orderRes = await fetch(`${paypalBase()}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: order.id,
              description: `${body.product} ${body.tier} one-time`,
              amount: {
                currency_code: 'USD',
                value: (body.amount_cents / 100).toFixed(2),
              },
            },
          ],
          application_context: {
            return_url: `${baseUrl}/payment/paypal/return?order=${order.id}`,
            cancel_url: `${baseUrl}/payment/cancelled?order=${order.id}`,
          },
        }),
      })
      if (!orderRes.ok) {
        const txt = await orderRes.text().catch(() => '')
        console.error('[paypal/start] order create failed', orderRes.status, txt)
        await supabase.from('payment_orders').update({ status: 'failed' }).eq('id', order.id)
        return NextResponse.json({ error: 'PayPal order creation failed' }, { status: 502 })
      }
      const ppOrder = (await orderRes.json()) as {
        id: string
        links: Array<{ rel: string; href: string }>
      }
      const approveUrl = ppOrder.links.find((l) => l.rel === 'approve')?.href
      await supabase
        .from('payment_orders')
        .update({ gateway_subscription_id: ppOrder.id })
        .eq('id', order.id)
      logEventAsync({
        type: 'payment.intent',
        source: 'docai',
        ref_id: String(order.id),
        email: body.email,
        amount_cents: body.amount_cents,
        status: 'pending',
        metadata: {
          gateway: 'paypal',
          product: body.product,
          tier: body.tier,
          interval: body.interval,
          paypal_order_id: ppOrder.id,
          order_source: body.source,
        },
      })
      return NextResponse.json({ order_id: order.id, approve_url: approveUrl })
    }

    // ─────────────────────────────────────────────────────────
    // RECURRING: PayPal Subscriptions API (requires Plan ID in env)
    // ─────────────────────────────────────────────────────────
    const planId = paypalPlanIdFor(body.product, body.tier, body.interval)
    if (!planId) {
      const envName = `PAYPAL_PLAN_ID_${body.product.toUpperCase()}_${body.tier.toUpperCase()}_${body.interval.toUpperCase()}`
      return NextResponse.json(
        {
          error: `PayPal Plan ID not configured. Create the plan in the PayPal dashboard, then set ${envName} in Vercel env.`,
        },
        { status: 503 },
      )
    }

    const token = await getAccessToken()
    const subRes = await fetch(`${paypalBase()}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: order.id,
        subscriber: {
          email_address: body.email,
          name: body.name ? { given_name: body.name } : undefined,
        },
        application_context: {
          return_url: `${baseUrl}/payment/paypal/return?order=${order.id}`,
          cancel_url: `${baseUrl}/payment/cancelled?order=${order.id}`,
        },
      }),
    })

    if (!subRes.ok) {
      const txt = await subRes.text().catch(() => '')
      console.error('[paypal/start] subscription create failed', subRes.status, txt)
      await supabase.from('payment_orders').update({ status: 'failed' }).eq('id', order.id)
      return NextResponse.json({ error: 'PayPal subscription creation failed' }, { status: 502 })
    }
    const sub = (await subRes.json()) as {
      id: string
      links: Array<{ rel: string; href: string }>
    }
    const approveUrl = sub.links.find((l) => l.rel === 'approve')?.href

    await supabase
      .from('payment_orders')
      .update({ gateway_subscription_id: sub.id })
      .eq('id', order.id)

    logEventAsync({
      type: 'payment.intent',
      source: 'docai',
      ref_id: String(order.id),
      email: body.email,
      amount_cents: body.amount_cents,
      status: 'pending',
      metadata: {
        gateway: 'paypal',
        product: body.product,
        tier: body.tier,
        interval: body.interval,
        paypal_subscription_id: sub.id,
        plan_id: planId,
        order_source: body.source,
      },
    })

    return NextResponse.json({ order_id: order.id, subscription_id: sub.id, approve_url: approveUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[paypal/start]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
