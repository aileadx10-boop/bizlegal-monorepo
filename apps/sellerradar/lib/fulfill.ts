/* ─── Paid-order fulfillment — shared by PayPal capture + PayPal subscription
   webhook + NOWPayments IPN ────────────────────────────────────────────────
   Marks the linked report paid, provisions the monitor row for the monitor
   tier, and — since 2026-09-15 — actually delivers the report the buyer paid
   for. Until that date this function marked `paid_at` and sent nothing: the
   only report email in the app fired at analyse time (the free preview), so a
   buyer paid $49 and got silence.

   Idempotent at the report level: the paid_at gate is claimed with a
   conditional UPDATE (`.is('paid_at', null)`), so a replayed IPN or a
   re-delivered PayPal webhook returns no row and neither re-provisions the
   monitor nor re-sends the email. The old code carried that claim in a
   comment only. */

import { supabaseAdmin } from './supabase'
import { logEventAsync } from './ops/log'
import { TIER_PRICES_USD } from './tiers'
import { sendReportReady } from './email'

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
    // Claim the report: only the first fulfilment of this analysis wins.
    const { data: claimed } = await supabaseAdmin
      .from('sellerradar_reports')
      .update({ paid_at: new Date().toISOString(), tier: order.tier })
      .eq('id', order.analysis_id)
      .is('paid_at', null)
      .select('report_ref, email, sku_count, affected_count, annual_impact')
      .maybeSingle()

    if (claimed) {
      reportRef = claimed.report_ref ?? null

      // Monitor tier → provision the weekly re-scan row.
      if (order.tier === 'monitor') {
        const next = new Date()
        next.setUTCDate(next.getUTCDate() + 7)
        await supabaseAdmin.from('sellerradar_monitors').insert({
          email: order.email ?? claimed.email,
          report_id: order.analysis_id,
          status: 'active',
          next_scan_at: next.toISOString(),
        })
      }

      // Deliver the thing they bought.
      const to = order.email ?? claimed.email
      if (to && reportRef) {
        await sendReportReady({
          to,
          reportRef,
          skuCount: claimed.sku_count ?? 0,
          affectedCount: claimed.affected_count ?? 0,
          annualImpact: Number(claimed.annual_impact ?? 0),
          paid: true,
        }).catch((err) => console.warn('[fulfill] report email failed:', err))

        logEventAsync({
          type: 'email.sent',
          source: 'sellerradar',
          ref_id: reportRef,
          email: to,
          status: 'ok',
          metadata: { kind: 'impact_report', tier: order.tier },
        })
      }
    } else {
      // Replay (already paid) or a missing analysis row — resolve the ref for
      // the caller without touching anything.
      const { data: existing } = await supabaseAdmin
        .from('sellerradar_reports')
        .select('report_ref')
        .eq('id', order.analysis_id)
        .maybeSingle()
      reportRef = existing?.report_ref ?? null
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
