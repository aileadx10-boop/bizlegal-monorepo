import { NextRequest, NextResponse } from 'next/server'
import { createPayPalOrder } from '@/lib/paypal'
import { supabaseAdmin } from '@/lib/supabase'
import { TIER_PRICES_USD, TIER_INTERVALS } from '@/lib/tiers'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'

/**
 * POST /api/create-order — PayPal one-time order (fleet pattern, mirrors
 * TRACR /api/create-order). Price is resolved server-side from lib/tiers.ts;
 * the client never sends an amount.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const tier = typeof body.tier === 'string' ? body.tier : 'audit'
    const scanRef = typeof body.scanRef === 'string' ? body.scanRef : ''

    // Link to the scan if the client passed a scan reference. The buyer's
    // email is resolved server-side from the scan row when the client does
    // not send one — the report API no longer serves email to browsers.
    let scanId: string | null = null
    if (scanRef) {
      const { data: scan } = await supabaseAdmin
        .from('falseecho_scans')
        .select('id, email')
        .eq('scan_ref', scanRef)
        .maybeSingle()
      scanId = scan?.id ?? null
      if (!email && scan?.email) email = scan.email
    }

    if (!email || !tier || !TIER_PRICES_USD[tier]) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const amount = TIER_PRICES_USD[tier]
    const interval = TIER_INTERVALS[tier] ?? 'one-time'
    const reportId = 'FE-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 90000) + 10000)

    const { error: dbErr } = await supabaseAdmin.from('falseecho_orders').insert({
      report_id: reportId,
      scan_id: scanId,
      email,
      tier,
      amount,
      interval,
      status: 'pending',
      payment_method: 'paypal',
      payment_provider: 'paypal',
    })

    if (dbErr) {
      console.error('[create-order] DB error:', dbErr)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    const description =
      tier === 'monitor'
        ? 'FalseEcho Monitor — daily AI falsehood monitoring (monthly)'
        : 'FalseEcho Audit — 4-engine AI falsehood evidence pack'

    const { orderId, approvalUrl } = await createPayPalOrder(amount, reportId, description)

    await supabaseAdmin.from('falseecho_orders')
      .update({ paypal_order_id: orderId })
      .eq('report_id', reportId)

    logEventAsync({
      type: 'payment.intent',
      source: 'falseecho',
      ref_id: reportId,
      email,
      amount_cents: amount * 100,
      status: 'pending',
      metadata: { gateway: 'paypal', tier, interval, scanRef: scanRef ?? null },
    })

    return NextResponse.json({ approvalUrl, reportId, orderId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    console.error('[create-order]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
