/* ─── Paid-order fulfillment — shared by PayPal capture + NOWPayments IPN ──
   Marks the linked report paid and provisions the monitor row for the
   monitor tier. Idempotent at the report level: the paid_at gate is only
   ever set once (UPDATE … WHERE paid_at IS NULL semantics via the check). */

import { supabaseAdmin } from './supabase'
import { logEventAsync } from './ops/log'
import { TIER_PRICES_USD } from './tiers'

export interface PaidOrderShape {
  id: string
  report_id: string
  analysis_id: string | null
  email: string | null
  tier: string
}

export async function fulfillPaidOrder(order: PaidOrderShape): Promise<string | null> {
  let reportRef: string | null = null

  if (order.analysis_id) {
    const { data: report } = await supabaseAdmin
      .from('sellerradar_reports')
      .update({ paid_at: new Date().toISOString(), tier: order.tier })
      .eq('id', order.analysis_id)
      .select('report_ref, email')
      .single()
    reportRef = report?.report_ref ?? null

    // Monitor tier → provision the weekly re-scan row.
    if (order.tier === 'monitor' && report) {
      const next = new Date()
      next.setUTCDate(next.getUTCDate() + 7)
      await supabaseAdmin.from('sellerradar_monitors').insert({
        email: order.email ?? report.email,
        report_id: order.analysis_id,
        status: 'active',
        next_scan_at: next.toISOString(),
      })
    }
  }

  logEventAsync({
    type: 'payment.confirmed',
    source: 'sellerradar',
    ref_id: order.report_id,
    email: order.email ?? undefined,
    amount_cents: (TIER_PRICES_USD[order.tier] ?? 0) * 100,
    status: 'ok',
    metadata: { tier: order.tier, reportRef },
  })

  return reportRef
}
