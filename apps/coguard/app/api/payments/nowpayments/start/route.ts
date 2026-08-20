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
    if (!spec) {
      return NextResponse.json({ error: 'unknown product_id' }, { status: 400 })
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'payment not configured' }, { status: 500 })
    }

    const supabase = getSupabase()
    const { data: order, error: insertErr } = await supabase
      .from('payment_orders')
      .insert({
        user_email: email || null,
        product: 'coguard',
        tier: productId,
        billing_interval: spec.billing_interval,
        amount_cents: spec.amount_cents,
        gateway: 'nowpayments',
        status: 'pending',
        source: 'coguard_pricing',
      })
      .select('id')
      .single()

    if (insertErr || !order) {
      return NextResponse.json({ error: 'order creation failed' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_COGUARD_SITE_URL ?? 'https://coguard.bizlegal-ai.com'
    const ipnBase = 'https://coguard.bizlegal-ai.com'

    const invoiceRes = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        price_amount: spec.amount_cents / 100,
        price_currency: 'usd',
        order_id: order.id,
        order_description: `CoGuard ${productId}`,
        success_url: `${baseUrl}/payment/success?order=${order.id}`,
        cancel_url: `${baseUrl}/pricing`,
        ipn_callback_url: `${ipnBase}/api/payments/nowpayments/webhook`,
      }),
    })

    if (!invoiceRes.ok) {
      const errText = await invoiceRes.text().catch(() => '')
      await supabase.from('payment_orders').update({ status: 'failed' }).eq('id', order.id)
      return NextResponse.json({ error: 'invoice creation failed' }, { status: 502 })
    }

    const invoice = (await invoiceRes.json()) as { id: string; invoice_url: string }
    await supabase.from('payment_orders').update({ gateway_invoice_id: invoice.id }).eq('id', order.id)

    logEventAsync({ type: 'payment.intent', source: 'coguard', ref_id: String(order.id), email: email || undefined, amount_cents: spec.amount_cents, status: 'pending', metadata: { gateway: 'nowpayments', product_id: productId } })

    return NextResponse.redirect(invoice.invoice_url)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
  }
}
