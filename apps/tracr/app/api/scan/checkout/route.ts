import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const TIER_PRICES: Record<string, { crypto: number; fiat: number }> = {
  regulatory:   { crypto: 29,  fiat: 29  },
  standard:     { crypto: 149, fiat: 169 },
  professional: { crypto: 349, fiat: 389 },
  enterprise:   { crypto: 799, fiat: 879 },
}

export async function POST(req: NextRequest) {
  try {
    const { email, wallet_address, network, tier, case_context } = await req.json()

    if (!email || !tier || !TIER_PRICES[tier]) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const report_id = 'TR-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 90000 + 10000)
    const price = TIER_PRICES[tier]
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tracr.bizlegal-ai.com'
    const nowKey = process.env.NOWPAYMENTS_API_KEY
    if (!nowKey) return NextResponse.json({ error: 'Payment service unavailable' }, { status: 503 })

    // Insert order
    const { error: dbError } = await supabaseAdmin
      .from('tracr_orders')
      .insert({
        report_id,
        email,
        wallet_address,
        network: network ?? 'ethereum',
        amount: price.crypto,
        tier,
        status: 'pending',
        payment_provider: 'nowpayments',
        case_context: case_context ?? null,
      })

    if (dbError) {
      console.error('[scan/checkout] DB error:', dbError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create NOWPayments invoice
    const invoiceRes = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: { 'x-api-key': nowKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_amount: price.crypto,
        price_currency: 'usd',
        order_id: report_id,
        order_description: tier === 'regulatory' ? 'TRACR Regulatory Risk Report' : `TRCR ${tier} forensic report`,
        ipn_callback_url: `${siteUrl}/api/payment/webhook`,
        success_url: `${siteUrl}/report/${report_id}`,
        cancel_url: `${siteUrl}/scan`,
      }),
    })

    if (!invoiceRes.ok) {
      const err = await invoiceRes.text()
      console.error('[scan/checkout] NOWPayments error:', err)
      return NextResponse.json({ error: 'Payment service error' }, { status: 502 })
    }

    const invoice = await invoiceRes.json()

    await supabaseAdmin
      .from('tracr_orders')
      .update({ nowpayments_order_id: invoice.id })
      .eq('report_id', report_id)

    return NextResponse.json({ invoice_url: invoice.invoice_url, report_id })
  } catch (err) {
    console.error('[scan/checkout]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
