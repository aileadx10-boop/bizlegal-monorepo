import { NextRequest, NextResponse } from 'next/server'
import {
  createPayPalOrder,
  createPayPalSubscription,
  paypalPlanId,
  planEnvName,
} from '@/lib/paypal'
import { supabaseAdmin } from '@/lib/supabase'
import { TIER_PRICES_USD, TIER_INTERVALS } from '@/lib/tiers'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'

/**
 * POST /api/create-order — PayPal checkout. Price AND billing interval are
 * resolved server-side from lib/tiers.ts; the client never sends either.
 *
 * 2026-09-15: a monthly tier (monitor, $99/mo) now goes through the PayPal
 * Subscriptions API. It used to go through the one-time Orders API, which
 * charged $99 once and then ran the weekly re-scan forever — the customer
 * under-paid and we under-billed, silently, on both sides. A monthly tier
 * with no plan id configured returns 503 naming the env var rather than
 * falling back to a one-time charge.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const tier = typeof body.tier === 'string' ? body.tier : 'audit'
    const reportRef = typeof body.reportRef === 'string' ? body.reportRef : ''

    // Link to the analysis if the client passed a report reference. The
    // buyer's email is resolved server-side from the report row when the
    // client does not send one — the report API no longer serves email.
    let analysisId: string | null = null
    if (reportRef) {
      const { data: report } = await supabaseAdmin
        .from('sellerradar_reports')
        .select('id, email')
        .eq('report_ref', reportRef)
        .maybeSingle()
      analysisId = report?.id ?? null
      if (!email && report?.email) email = report.email
    }

    if (!email || !tier || !TIER_PRICES_USD[tier]) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const amount = TIER_PRICES_USD[tier]
    const interval = TIER_INTERVALS[tier] ?? 'one-time'

    // Resolve the plan BEFORE inserting the order row: a missing plan id must
    // not leave a stray pending order behind.
    const planId = interval === 'monthly' ? paypalPlanId(tier, interval) : undefined
    if (interval === 'monthly' && !planId) {
      return NextResponse.json(
        {
          error:
            `Recurring card checkout is not configured yet. Create the plan in the PayPal ` +
            `dashboard (scripts/paypal-provision-plans.mjs), then set ${planEnvName(tier, interval)} ` +
            `in this project's Vercel env.`,
        },
        { status: 503 },
      )
    }

    const reportId = 'SR-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 90000) + 10000)

    const { error: dbErr } = await supabaseAdmin.from('sellerradar_orders').insert({
      report_id: reportId,
      analysis_id: analysisId,
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

    // ── Recurring: PayPal Subscriptions ──────────────────────────────────
    if (planId) {
      const { subscriptionId, approvalUrl } = await createPayPalSubscription({
        planId,
        customId: reportId,
        email,
      })

      await supabaseAdmin.from('sellerradar_orders')
        .update({ paypal_order_id: subscriptionId })
        .eq('report_id', reportId)

      logEventAsync({
        type: 'payment.intent',
        source: 'sellerradar',
        ref_id: reportId,
        email,
        amount_cents: amount * 100,
        status: 'pending',
        metadata: {
          gateway: 'paypal',
          mode: 'subscription',
          tier,
          interval,
          paypal_subscription_id: subscriptionId,
          reportRef: reportRef || null,
        },
      })

      return NextResponse.json({ approvalUrl, reportId, subscriptionId })
    }

    // ── One-time: PayPal Orders ──────────────────────────────────────────
    const description = 'SellerRadar Audit — per-SKU Amazon fee-change impact report'

    const { orderId, approvalUrl } = await createPayPalOrder(amount, reportId, description)

    await supabaseAdmin.from('sellerradar_orders')
      .update({ paypal_order_id: orderId })
      .eq('report_id', reportId)

    logEventAsync({
      type: 'payment.intent',
      source: 'sellerradar',
      ref_id: reportId,
      email,
      amount_cents: amount * 100,
      status: 'pending',
      metadata: { gateway: 'paypal', mode: 'one-time', tier, interval, reportRef: reportRef || null },
    })

    return NextResponse.json({ approvalUrl, reportId, orderId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    console.error('[create-order]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
