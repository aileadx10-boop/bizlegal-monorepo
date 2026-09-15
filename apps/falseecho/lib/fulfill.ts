/* ─── Paid-order fulfillment — shared by PayPal capture + PayPal subscription
   webhook + NOWPayments IPN ────────────────────────────────────────────────
   Marks the linked scan paid, provisions the monitor row for the monitor
   tier, fires the full battery, and logs payment.confirmed.

   Idempotent at the scan level: the paid_at gate is claimed with a
   conditional UPDATE (`.is('paid_at', null)`), so a replayed IPN or a
   re-delivered PayPal webhook neither re-provisions the monitor nor re-fires
   the battery. /api/scan/run additionally short-circuits on status
   'delivered'.

   Engine pre-flight (B2, 2026-09-15): a paid battery is worth nothing if the
   engine keys are absent — the adapters degrade to status 'unavailable' and
   the buyer receives an evidence pack that probed nothing. So before firing
   the battery we check that all four engines report configured. If any does
   not, the order is HELD (`pending_engine`) instead of run, an ops event
   records which engines are missing, and the webhook still returns 200 — a
   held order is an operations problem, not a reason to make PayPal or
   NOWPayments retry a payment they already took. paid_at stays set, because
   the buyer did pay; once the keys are in place the operator re-fires
   POST /api/scan/run (internal-key gated) with the scanRef below. */

import { supabaseAdmin } from './supabase'
import { logEventAsync } from './ops/log'
import { TIER_PRICES_USD } from './tiers'
import { engineStatusMatrix } from './engines'

export interface PaidOrderShape {
  id: string
  report_id: string
  scan_id: string | null
  email: string | null
  tier: string
}

/** Engine ids whose API key is absent. Names only — no value ever read out. */
function unconfiguredEngines(): string[] {
  return engineStatusMatrix()
    .filter((e) => !e.configured)
    .map((e) => e.id)
}

export async function fulfillPaidOrder(order: PaidOrderShape): Promise<string | null> {
  let scanRef: string | null = null

  if (order.scan_id) {
    // Claim the scan: only the first fulfilment of this scan wins.
    const { data: claimed } = await supabaseAdmin
      .from('falseecho_scans')
      .update({ paid_at: new Date().toISOString(), tier: order.tier })
      .eq('id', order.scan_id)
      .is('paid_at', null)
      .select('scan_ref, entity, email')
      .maybeSingle()

    if (claimed) {
      scanRef = claimed.scan_ref ?? null

      // Monitor tier → provision the daily-scan row.
      if (order.tier === 'monitor') {
        const next = new Date()
        next.setUTCDate(next.getUTCDate() + 1)
        await supabaseAdmin.from('falseecho_monitors').insert({
          email: order.email ?? claimed.email,
          entity: claimed.entity,
          scan_id: order.scan_id,
          status: 'active',
          next_scan_at: next.toISOString(),
        })
      }

      const missing = unconfiguredEngines()

      if (missing.length > 0) {
        // HOLD — do not spend the buyer's order on a battery that cannot probe.
        // The status value needs migration 20260915_falseecho_pending_engine_status;
        // until that is applied the CHECK rejects it, so the write is
        // best-effort and the ops event is the durable record either way.
        const { error: holdErr } = await supabaseAdmin
          .from('falseecho_orders')
          .update({ status: 'pending_engine' })
          .eq('id', order.id)
        if (holdErr) {
          console.warn(
            `[fulfill] could not mark order ${order.report_id} pending_engine (${holdErr.message}) — ` +
              'apply supabase/migrations/20260915_falseecho_pending_engine_status.sql',
          )
        }

        logEventAsync({
          type: 'error',
          source: 'falseecho',
          ref_id: order.report_id,
          email: order.email ?? undefined,
          status: 'pending',
          metadata: {
            step: 'engine_preflight',
            held: 'pending_engine',
            missing_engines: missing,
            scanRef,
            status_write_failed: Boolean(holdErr),
          },
        })
      } else if (scanRef) {
        // Fire the full 25-prompt battery (fire-and-forget; report page polls).
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
    } else {
      // Replay (already paid) or a missing scan row — resolve the ref for the
      // caller without touching anything.
      const { data: existing } = await supabaseAdmin
        .from('falseecho_scans')
        .select('scan_ref')
        .eq('id', order.scan_id)
        .maybeSingle()
      scanRef = existing?.scan_ref ?? null
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
