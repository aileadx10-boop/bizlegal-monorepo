/* ─── Paid-order fulfillment — shared by PayPal capture + NOWPayments IPN ──
   Marks the linked scan paid, fires the full battery (async), provisions
   the monitor row for the monitor tier, and logs the payment.confirmed
   ops event. Idempotent at the scan level: /api/scan/run short-circuits on
   status 'delivered'. */

import { supabaseAdmin } from './supabase'
import { logEventAsync } from './ops/log'
import { TIER_PRICES_USD } from './tiers'

export interface PaidOrderShape {
  id: string
  report_id: string
  scan_id: string | null
  email: string | null
  tier: string
}

export async function fulfillPaidOrder(order: PaidOrderShape): Promise<string | null> {
  let scanRef: string | null = null

  if (order.scan_id) {
    const { data: scan } = await supabaseAdmin
      .from('falseecho_scans')
      .update({ paid_at: new Date().toISOString(), tier: order.tier })
      .eq('id', order.scan_id)
      .select('scan_ref, entity, email')
      .single()
    scanRef = scan?.scan_ref ?? null

    // Monitor tier → provision the daily-scan row.
    if (order.tier === 'monitor' && scan) {
      const next = new Date()
      next.setUTCDate(next.getUTCDate() + 1)
      await supabaseAdmin.from('falseecho_monitors').insert({
        email: order.email ?? scan.email,
        entity: scan.entity,
        scan_id: order.scan_id,
        status: 'active',
        next_scan_at: next.toISOString(),
      })
    }

    // Fire the full 25-prompt battery (fire-and-forget; report page polls).
    if (scanRef) {
      const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falseecho.bizlegal-ai.com'
      fetch(`${site}/api/scan/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': process.env.BIZLEGAL_INBOUND_SECRET ?? '',
        },
        body: JSON.stringify({ scanRef }),
      }).catch((err) => console.warn('[fulfill] scan/run trigger failed:', err))
    }
  }

  logEventAsync({
    type: 'payment.confirmed',
    source: 'falseecho',
    ref_id: order.report_id,
    email: order.email ?? undefined,
    amount_cents: (TIER_PRICES_USD[order.tier] ?? 0) * 100,
    status: 'ok',
    metadata: { tier: order.tier, scanRef },
  })

  return scanRef
}
