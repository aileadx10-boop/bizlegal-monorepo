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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<StartBody>

    if (!body.product || !body.tier || !body.interval || !body.amount_cents || !body.email) {
      return NextResponse.json(
        { error: 'product, tier, interval, amount_cents, email required' },
        { status: 400 },
      )
    }
    if (!['one-time', 'monthly', 'yearly'].includes(body.interval)) {
      return NextResponse.json({ error: 'invalid interval' }, { status: 400 })
    }
    if (body.amount_cents < 50 || body.amount_cents > 100000_00) {
      return NextResponse.json({ error: 'amount out of range' }, { status: 400 })
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'NOWPAYMENTS_API_KEY env var not configured on this deployment' },
        { status: 500 },
      )
    }

    const supabase = getSupabase()

    // Insert pending order so we can track regardless of webhook race.
    const { data: order, error: insertErr } = await supabase
      .from('payment_orders')
      .insert({
        user_email: body.email,
        user_name: body.name ?? null,
        product: body.product,
        tier: body.tier,
        billing_interval: body.interval,
        amount_cents: body.amount_cents,
        gateway: 'nowpayments',
        status: 'pending',
        source: body.source ?? 'hub_pricing',
      })
      .select('id')
      .single()

    if (insertErr || !order) {
      console.error('[nowpayments/start] supabase insert failed', insertErr)
      return NextResponse.json({ error: 'order creation failed' }, { status: 500 })
    }

    // NOWPayments invoice
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bizlegal-ai.com'
    const invoiceRes = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: body.amount_cents / 100,
        price_currency: 'usd',
        order_id: order.id,
        order_description: `${body.product} ${body.tier} ${body.interval}`,
        success_url: `${baseUrl}/payment/success?order=${order.id}`,
        cancel_url: `${baseUrl}/payment/cancelled?order=${order.id}`,
        ipn_callback_url: `${baseUrl}/api/payments/nowpayments/webhook`,
      }),
    })

    if (!invoiceRes.ok) {
      const errText = await invoiceRes.text().catch(() => '')
      console.error('[nowpayments/start] invoice failed', invoiceRes.status, errText)
      await supabase
        .from('payment_orders')
        .update({ status: 'failed', metadata: { invoice_error: errText } })
        .eq('id', order.id)
      return NextResponse.json(
        { error: 'NOWPayments invoice creation failed' },
        { status: 502 },
      )
    }

    const invoice = (await invoiceRes.json()) as { id: string; invoice_url: string }

    await supabase
      .from('payment_orders')
      .update({ gateway_invoice_id: invoice.id })
      .eq('id', order.id)

    logEventAsync({
      type: 'payment.intent',
      source: 'docai',
      ref_id: String(order.id),
      email: body.email,
      amount_cents: body.amount_cents,
      status: 'pending',
      metadata: {
        gateway: 'nowpayments',
        product: body.product,
        tier: body.tier,
        interval: body.interval,
        invoice_id: invoice.id,
        order_source: body.source,
      },
    })

    return NextResponse.json({
      order_id: order.id,
      invoice_id: invoice.id,
      invoice_url: invoice.invoice_url,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[nowpayments/start]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
