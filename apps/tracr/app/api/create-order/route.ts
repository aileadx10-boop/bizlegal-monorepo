import { NextRequest, NextResponse } from 'next/server'
import { createPayPalOrder } from '@/lib/paypal'
import { supabaseAdmin } from '@/lib/supabase'

const TIER_PRICES: Record<string, number> = {
  regulatory:   29,
  standard:    149,
  priority:    249,
  litigation:  500,
  enterprise:  799,
}

export async function POST(req: NextRequest) {
  try {
    const {
      email, firstName, lastName, wallet,
      network = 'ethereum', tier = 'standard',
      role, caseContext,
    } = await req.json()

    if (!email || !tier || !TIER_PRICES[tier]) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const amount = TIER_PRICES[tier]
    const reportId = 'TR-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 90000) + 10000)
    const walletAddr = wallet?.trim() || `REG-SCAN-${Date.now()}`

    // Save pending order to DB
    const { error: dbErr } = await supabaseAdmin.from('tracr_orders').insert({
      report_id:      reportId,
      email,
      first_name:     firstName ?? null,
      last_name:      lastName  ?? null,
      role:           role      ?? null,
      wallet_address: walletAddr,
      network,
      tier,
      amount,
      status:           'pending',
      payment_method:   'paypal',
      payment_provider: 'paypal',
      case_context:     caseContext ?? null,
    })

    if (dbErr) {
      console.error('[create-order] DB error:', dbErr)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create PayPal order
    const description = tier === 'regulatory'
      ? 'TRACR Regulatory Risk Report'
      : `TRACR ${tier.charAt(0).toUpperCase() + tier.slice(1)} Forensic Report`

    const { orderId, approvalUrl } = await createPayPalOrder(amount, reportId, description)

    // Store PayPal order ID
    await supabaseAdmin.from('tracr_orders')
      .update({ paypal_order_id: orderId })
      .eq('report_id', reportId)

    return NextResponse.json({ approvalUrl, reportId, orderId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    console.error('[create-order]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
