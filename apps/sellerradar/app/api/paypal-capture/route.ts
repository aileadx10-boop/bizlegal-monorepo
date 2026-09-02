import { NextRequest, NextResponse } from 'next/server'
import { capturePayPalOrder } from '@/lib/paypal'
import { supabaseAdmin } from '@/lib/supabase'
import { fulfillPaidOrder } from '@/lib/fulfill'

export const dynamic = 'force-dynamic'

/**
 * POST /api/paypal-capture — capture-on-return (fleet pattern, mirrors
 * FalseEcho /api/paypal-capture). The /success page calls this with the
 * PayPal order token after the buyer returns from approval.
 */
export async function POST(req: NextRequest) {
  try {
    const { token, reportId } = await req.json() // token = PayPal order ID from redirect

    if (!token || !reportId) {
      return NextResponse.json({ error: 'Missing token or reportId' }, { status: 400 })
    }

    const capture = await capturePayPalOrder(token)
    const captureStatus = capture.status
    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id

    if (captureStatus !== 'COMPLETED') {
      return NextResponse.json({ error: `Payment not completed: ${captureStatus}` }, { status: 402 })
    }

    const { data: order } = await supabaseAdmin
      .from('sellerradar_orders')
      .update({
        status: 'paid',
        paypal_capture_id: captureId ?? null,
        paid_at: new Date().toISOString(),
        payment_provider: 'paypal',
      })
      .eq('report_id', reportId)
      .select('id, report_id, analysis_id, email, tier')
      .single()

    if (!order) {
      console.error('[paypal-capture] order not found after capture', reportId)
      return NextResponse.json({ error: 'order not found' }, { status: 404 })
    }

    const reportRef = await fulfillPaidOrder(order)

    return NextResponse.json({ success: true, reportId, reportRef })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Capture failed'
    console.error('[paypal-capture]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
