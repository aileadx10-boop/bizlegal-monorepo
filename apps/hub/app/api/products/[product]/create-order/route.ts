import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const PRICING: Record<string, Record<string, number>> = {
  brai:      { free: 0, scan: 0 },
  tracr:     { standard: 149, priority: 249, litigation: 500, enterprise: 2000 },
  lexaudit:  { starter: 49, pro: 199, enterprise: 499 },
  docai:     { free: 0, standard: 29, enterprise: 99 },
  forge:     { starter: 199, pro: 499 },
  leadforge: { starter: 99, pro: 299, enterprise: 499 },
}

export async function POST(
  request: NextRequest,
  { params }: { params: { product: string } }
) {
  try {
    const { tier, email, paymentMethod } = await request.json()
    const product = params.product.toLowerCase()
    const amount = PRICING[product]?.[tier]

    if (amount === undefined) {
      return NextResponse.json({ error: 'Invalid product or tier' }, { status: 400 })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert([{ product, tier, amount, email, payment_method: paymentMethod, status: 'pending' }])
      .select()
      .single()

    if (error) throw error

    // Free tier — instant complete
    if (amount === 0) {
      await supabase.from('orders').update({ status: 'completed' }).eq('id', order.id)
      return NextResponse.json({ success: true, order })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    // NOWPayments (crypto)
    if (paymentMethod === 'nowpayments') {
      const res = await fetch('https://api.nowpayments.io/v1/invoice', {
        method: 'POST',
        headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY!, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price_amount: amount,
          price_currency: 'usd',
          order_id: order.id.toString(),
          ipn_callback_url: `${appUrl}/api/products/${product}/webhook`,
          success_url: `${appUrl}/success?order=${order.id}`,
          cancel_url: `${appUrl}/${product}`,
        }),
      })
      const invoice = await res.json()
      if (!res.ok) throw new Error(invoice.message ?? 'NOWPayments error')

      await supabase.from('orders').update({ payment_url: invoice.invoice_url }).eq('id', order.id)
      return NextResponse.json({ success: true, order, paymentUrl: invoice.invoice_url })
    }

    // PayPal
    if (paymentMethod === 'paypal') {
      // Get PayPal access token
      const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      })
      const { access_token } = await tokenRes.json()

      // Create PayPal order
      const ppRes = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: order.id.toString(),
            amount: { currency_code: 'USD', value: amount.toFixed(2) },
            description: `BizLegal-AI ${product} — ${tier}`,
          }],
          application_context: {
            return_url: `${appUrl}/success?order=${order.id}`,
            cancel_url: `${appUrl}/${product}`,
          },
        }),
      })
      const ppOrder = await ppRes.json()
      const approvalUrl = ppOrder.links?.find((l: { rel: string }) => l.rel === 'approve')?.href

      await supabase.from('orders').update({ payment_url: approvalUrl, payment_id: ppOrder.id }).eq('id', order.id)
      return NextResponse.json({ success: true, order, paymentUrl: approvalUrl })
    }

    return NextResponse.json({ success: true, order })
  } catch (err) {
    console.error('[create-order]', err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
