import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { TIER_PRICES_USD, TIER_INTERVALS } from '@/lib/tiers'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/payments/nowpayments/start — crypto checkout (fleet pattern).
 * Amount is resolved server-side from lib/tiers.ts; the client never sends
 * one. Creates a pending sellerradar_orders row, then a NOWPayments invoice
 * whose IPN callback lands on /api/payments/nowpayments/webhook.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const tier = typeof body.tier === 'string' ? body.tier : ''
    const reportRef = typeof body.reportRef === 'string' ? body.reportRef : ''

    if (!TIER_PRICES_USD[tier]) {
      return NextResponse.json({ error: 'email and a valid tier are required' }, { status: 400 })
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'NOWPAYMENTS_API_KEY env var not configured on this deployment' },
        { status: 500 },
      )
    }

    const amount = TIER_PRICES_USD[tier]
    const interval = TIER_INTERVALS[tier] ?? 'one-time'
    const reportId = 'SR-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 90000) + 10000)

    // Link to the analysis; resolve the buyer email server-side from the
    // report row when the client does not send one (report API no longer
    // serves it).
    let analysisId: string | null = null
    if (reportRef) {
      const { data: report } = await supabaseAdmin
        .from('sellerradar_reports')
        .select('id, email')
        .eq('report_ref', reportRef)
        .maybeSingle()
      analysisId = report?.id ?? null
      if (!email && report?.email) email = report.email.trim().toLowerCase()
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'email and a valid tier are required' }, { status: 400 })
    }

    const { data: order, error: insertErr } = await supabaseAdmin
      .from('sellerradar_orders')
      .insert({
        report_id: reportId,
        analysis_id: analysisId,
        email,
        tier,
        amount,
        interval,
        status: 'pending',
        payment_method: 'crypto',
        payment_provider: 'nowpayments',
      })
      .select('id')
      .single()

    if (insertErr || !order) {
      console.error('[nowpayments/start] insert failed', insertErr)
      return NextResponse.json({ error: 'order creation failed' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sellerradar.bizlegal-ai.com'
    const invoiceRes = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        order_id: reportId,
        order_description: `SellerRadar ${tier} ${interval}`,
        success_url: `${baseUrl}/success?report=${reportId}&method=crypto`,
        cancel_url: `${baseUrl}/analyze`,
        ipn_callback_url: `${baseUrl}/api/payments/nowpayments/webhook`,
      }),
    })

    if (!invoiceRes.ok) {
      const errText = await invoiceRes.text().catch(() => '')
      console.error('[nowpayments/start] invoice failed', invoiceRes.status, errText)
      await supabaseAdmin.from('sellerradar_orders').update({ status: 'failed' }).eq('id', order.id)
      return NextResponse.json({ error: 'NOWPayments invoice creation failed' }, { status: 502 })
    }

    const invoice = (await invoiceRes.json()) as { id: string; invoice_url: string }

    await supabaseAdmin
      .from('sellerradar_orders')
      .update({ gateway_invoice_id: invoice.id })
      .eq('id', order.id)

    logEventAsync({
      type: 'payment.intent',
      source: 'sellerradar',
      ref_id: reportId,
      email,
      amount_cents: amount * 100,
      status: 'pending',
      metadata: { gateway: 'nowpayments', tier, interval, reportRef: reportRef || null },
    })

    return NextResponse.json({ reportId, invoice_id: invoice.id, invoice_url: invoice.invoice_url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[nowpayments/start]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
