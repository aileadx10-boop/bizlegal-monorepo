import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'

// POST /api/brai/invoice
// Creates a NOWPayments invoice for BRAI full report ($49)
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    const { email, leadId } = await req.json()

    if (!email || !leadId) {
      return NextResponse.json({ error: 'Missing email or leadId' }, { status: 400 })
    }

    const nowKey = process.env.NOWPAYMENTS_API_KEY
    if (!nowKey) {
      return NextResponse.json({ error: 'Payment service unavailable' }, { status: 503 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bizlegal-ai.com'

    const invoiceRes = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': nowKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: 49,
        price_currency: 'usd',
        pay_currency: 'usdtbsc',
        order_id: `brai_${leadId}`,
        order_description: 'BRAI Full Blockchain Regulatory Report',
        ipn_callback_url: `${appUrl}/api/brai/webhook`,
        success_url: `${appUrl}/blockchain-report?payment=success&lead=${leadId}`,
        cancel_url: `${appUrl}/blockchain-report?payment=cancelled`,
      }),
    })

    if (!invoiceRes.ok) {
      const err = await invoiceRes.text()
      console.error('[brai/invoice] NOWPayments error:', err)
      return NextResponse.json({ error: 'Payment service error' }, { status: 502 })
    }

    const invoice = await invoiceRes.json()

    // Store invoice ID against the lead
    await supabase
      .from('tracr_wallet_leads')
      .update({ invoice_id: invoice.id, updated_at: new Date().toISOString() })
      .eq('id', leadId)

    logEventAsync({
      type: 'payment.intent',
      source: 'brai',
      ref_id: String(leadId),
      email,
      amount_cents: 4900,
      status: 'pending',
      metadata: {
        product: 'brai_report',
        gateway: 'nowpayments',
        invoice_id: invoice.id,
      },
    })

    return NextResponse.json({
      invoiceId: invoice.id,
      invoiceUrl: invoice.invoice_url,
    })
  } catch (err) {
    console.error('[brai/invoice] unexpected:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
