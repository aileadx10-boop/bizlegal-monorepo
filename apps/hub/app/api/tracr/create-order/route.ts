import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const PRICES: Record<string, number> = {
  standard: 149,
  priority: 249,
  litigation: 500,
  'litigation-enterprise': 2000,
}

function generateReportId(): string {
  const year = new Date().getFullYear()
  const num = String(Math.floor(Math.random() * 90000) + 10000)
  return `TR-${year}-${num}`
}

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName, wallet, network, context, tier = 'standard', role } = await req.json()

    if (!email || !wallet) {
      return NextResponse.json({ error: 'Email and wallet are required' }, { status: 400 })
    }

    const reportId = generateReportId()
    const amount = PRICES[tier] || 149

    // Save pending order
    await supabase.from('tracr_orders').insert({
      report_id: reportId,
      email,
      first_name: firstName,
      last_name: lastName,
      role,
      wallet_address: wallet,
      network: network || 'ethereum',
      case_context: context,
      amount,
      tier,
      status: 'pending',
      payment_method: 'crypto',
    })

    // Create NOWPayments invoice
    const nowRes = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        order_id: reportId,
        order_description: `TRACR ${tier} Forensic Report — ${wallet.slice(0, 10)}…`,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/tracr/webhook`,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tracr/success?report=${reportId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tracr#order`,
      }),
    })

    if (!nowRes.ok) {
      const errText = await nowRes.text()
      console.error('[NOWPayments]', errText)
      return NextResponse.json({ error: 'Payment provider error' }, { status: 502 })
    }

    const invoice = await nowRes.json()

    // Save invoice ID
    await supabase.from('tracr_orders')
      .update({ nowpayments_order_id: invoice.id })
      .eq('report_id', reportId)

    logEventAsync({
      type: 'agent.checkout',
      source: 'tracr',
      ref_id: reportId,
      email,
      amount_cents: amount * 100,
      status: 'pending',
      metadata: {
        product: 'tracr_forensic_report',
        tier,
        gateway: 'nowpayments',
        wallet,
        network: network || 'ethereum',
        invoice_id: invoice.id,
      },
    })
    logEventAsync({
      type: 'payment.intent',
      source: 'tracr',
      ref_id: reportId,
      email,
      amount_cents: amount * 100,
      status: 'pending',
      metadata: {
        product: 'tracr_forensic_report',
        tier,
        gateway: 'nowpayments',
        invoice_id: invoice.id,
      },
    })

    return NextResponse.json({
      reportId,
      paymentUrl: invoice.invoice_url,
      amount,
      tier,
    })
  } catch (err: any) {
    console.error('[TRACR create-order]', err)
    return NextResponse.json({ error: err.message || 'Order creation failed' }, { status: 500 })
  }
}
