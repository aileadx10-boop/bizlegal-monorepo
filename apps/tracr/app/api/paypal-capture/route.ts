import { NextRequest, NextResponse } from 'next/server'
import { capturePayPalOrder } from '@/lib/paypal'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { token, reportId } = await req.json()  // token = PayPal order ID from redirect

    if (!token || !reportId) {
      return NextResponse.json({ error: 'Missing token or reportId' }, { status: 400 })
    }

    // Capture payment
    const capture = await capturePayPalOrder(token)
    const captureStatus = capture.status
    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id

    if (captureStatus !== 'COMPLETED') {
      return NextResponse.json({ error: `Payment not completed: ${captureStatus}` }, { status: 402 })
    }

    // Update order
    await supabaseAdmin.from('tracr_orders')
      .update({
        status:           'paid',
        paypal_capture_id: captureId ?? null,
        paid_at:          new Date().toISOString(),
        payment_provider: 'paypal',
      })
      .eq('report_id', reportId)

    // Trigger async report generation
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? ''
    fetch(`${site}/api/generate-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.NOWPAYMENTS_IPN_SECRET ?? '',
      },
      body: JSON.stringify({ reportId }),
    }).catch(console.error)

    return NextResponse.json({ success: true, reportId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Capture failed'
    console.error('[paypal-capture]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
