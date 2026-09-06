import { NextRequest, NextResponse } from 'next/server'
import { verifyTurnstile } from '@bizlegal/turnstile-verify'
import { supabaseAdmin } from '@/lib/supabase'
import { parseSellerCsv, MAX_CSV_ROWS } from '@/lib/csv'
import { analyzeCatalog } from '@/lib/margin'
import { getPreviousSchedule, getCurrentSchedule } from '@/lib/schedules'
import { logEventAsync } from '@/lib/ops/log'
import { sendReportReady } from '@/lib/email'
import { emitMarketingEventAsync } from '@/lib/marketing'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/analyze — CSV upload → fee parse → margin impact (spec §4 core
 * flow). The parser and diff engine are pure functions in lib/; this route
 * only does auth, persistence, and gating.
 *
 * Two modes:
 *   free (default) — parses the CSV, computes the catalog-level impact, and
 *     returns top-line totals. Per-SKU detail stays gated behind the $49
 *     audit (the report page paywalls it).
 *   paid (orderId present) — claims a paid order (hub apex fulfillment
 *     credit or in-app order), links it to the new report, and unlocks the
 *     full per-SKU breakdown immediately.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const csv = typeof body.csv === 'string' ? body.csv : ''
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : ''

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'valid email required' }, { status: 400 })
    }
    if (!csv) {
      return NextResponse.json({ error: 'csv content required' }, { status: 400 })
    }
    if (csv.length > 4 * 1024 * 1024) {
      return NextResponse.json({ error: `csv too large — max ${MAX_CSV_ROWS} rows / ~2 MB` }, { status: 413 })
    }

    const turnstile = await verifyTurnstile({ token: body.turnstile_token })
    if (!turnstile.ok) {
      return NextResponse.json({ error: 'turnstile verification failed' }, { status: 403 })
    }

    // ── Parse + compute (pure functions; garbage CSVs fail readable) ──
    const parsed = parseSellerCsv(csv)
    if (!parsed.ok) {
      return NextResponse.json(
        { error: 'CSV could not be parsed', errors: parsed.errors.map((e) => e.message) },
        { status: 422 },
      )
    }

    const prev = getPreviousSchedule()
    const curr = getCurrentSchedule()
    const impact = analyzeCatalog(parsed.rows, prev, curr)

    // ── Paid mode: claim a paid order ──
    let tier: 'free' | 'audit' | 'monitor' = 'free'
    let linkedOrder: { id: string; tier: string } | null = null
    if (orderId) {
      const { data: order, error: orderErr } = await supabaseAdmin
        .from('sellerradar_orders')
        .select('id, tier, status, analysis_id')
        .eq('report_id', orderId)
        .maybeSingle()
      if (orderErr || !order) {
        return NextResponse.json({ error: 'order not found' }, { status: 404 })
      }
      if (order.status !== 'paid') {
        return NextResponse.json({ error: 'order is not paid yet' }, { status: 402 })
      }
      if (order.analysis_id) {
        return NextResponse.json({ error: 'order already claimed by another report' }, { status: 409 })
      }
      linkedOrder = { id: order.id, tier: order.tier }
      tier = order.tier === 'monitor' ? 'monitor' : 'audit'
    }

    const reportRef = 'SR-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 90000) + 10000)
    const createdAt = new Date().toISOString()

    const { data: report, error: reportErr } = await supabaseAdmin
      .from('sellerradar_reports')
      .insert({
        report_ref: reportRef,
        email,
        tier,
        status: 'delivered',
        sku_count: impact.totals.skuCount,
        affected_count: impact.totals.affectedCount,
        monthly_impact: impact.totals.monthlyImpact,
        annual_impact: impact.totals.annualImpact,
        avg_margin_delta_pct: impact.totals.avgMarginDeltaPct,
        changed_fee_types: impact.changedFeeTypes,
        schedule_from: impact.scheduleFrom.version,
        schedule_to: impact.scheduleTo.version,
        warnings: parsed.warnings.map((w) => w.message),
        paid_at: linkedOrder ? createdAt : null,
        completed_at: createdAt,
      })
      .select('id, report_ref')
      .single()

    if (reportErr || !report) {
      console.error('[analyze] report insert failed:', reportErr)
      return NextResponse.json({ error: 'could not create report' }, { status: 500 })
    }

    // Per-SKU rows — the paid detail. Inserted for all tiers (free rows are
    // gated at read time by /api/report), so paying later just unlocks.
    const skuRows = impact.perSku.map((s) => ({
      report_id: report.id,
      sku: s.sku,
      asin: s.asin,
      category: s.category,
      price: s.price,
      cogs: s.cogs,
      monthly_units: s.monthlyUnits,
      size_tier: s.sizeTier,
      fees_old: s.feesOld,
      fees_new: s.feesNew,
      fee_delta_per_unit: s.feeDeltaPerUnit,
      monthly_impact: s.monthlyImpact,
      annual_impact: s.annualImpact,
      margin_old_pct: s.marginOldPct,
      margin_new_pct: s.marginNewPct,
    }))
    const { error: skuErr } = await supabaseAdmin.from('sellerradar_skus').insert(skuRows)
    if (skuErr) {
      console.error('[analyze] sku insert failed:', skuErr)
      await supabaseAdmin.from('sellerradar_reports').delete().eq('id', report.id)
      return NextResponse.json({ error: 'could not store analysis' }, { status: 500 })
    }

    if (linkedOrder) {
      await supabaseAdmin.from('sellerradar_orders').update({ analysis_id: report.id }).eq('id', linkedOrder.id)
      if (tier === 'monitor') {
        const next = new Date()
        next.setUTCDate(next.getUTCDate() + 7)
        await supabaseAdmin.from('sellerradar_monitors').insert({
          email,
          report_id: report.id,
          status: 'active',
          next_scan_at: next.toISOString(),
        })
      }
    }

    logEventAsync({
      type: 'lead.qualified',
      source: 'sellerradar',
      ref_id: reportRef,
      email,
      status: 'ok',
      metadata: {
        tier,
        skuCount: impact.totals.skuCount,
        affectedCount: impact.totals.affectedCount,
        annualImpact: impact.totals.annualImpact,
      },
    })

    sendReportReady({
      to: email,
      reportRef,
      skuCount: impact.totals.skuCount,
      affectedCount: impact.totals.affectedCount,
      annualImpact: impact.totals.annualImpact,
    }).catch((err) => console.warn('[analyze] report email failed:', err))

    // Marketing hook (goal M.4): when this analysis surfaced fee changes,
    // hand each changed fee type to the hub content queue as a
    // fee_change_detected event. Wired here — the analyze flow — because the
    // monitor cron (/api/cron/monitor) runs on stored catalogs and this is
    // where a fee diff meets a fresh upload (giving a real impact_estimate). Fire-and-forget;
    // no-op without MARKETING_TRIGGER_URL configured.
    for (const feeType of impact.changedFeeTypes) {
      const rates =
        feeType === 'referral'
          ? { old_rate: prev.referral_pct.default, new_rate: curr.referral_pct.default, category: 'default' }
          : feeType === 'fba_fulfillment'
            ? {
                old_rate: prev.fba_fulfillment.large_standard,
                new_rate: curr.fba_fulfillment.large_standard,
                category: 'large_standard',
              }
            : {
                old_rate: prev.storage_per_cuft_monthly.standard,
                new_rate: curr.storage_per_cuft_monthly.standard,
                category: 'standard',
              }
      emitMarketingEventAsync({
        product: 'sellerradar',
        event_type: 'fee_change_detected',
        payload: {
          fee_type: feeType,
          old_rate: rates.old_rate,
          new_rate: rates.new_rate,
          effective_date: curr.effective_date,
          category: rates.category,
          impact_estimate: impact.totals.annualImpact,
        },
      })
    }

    return NextResponse.json({
      ok: true,
      reportRef,
      tier,
      totals: impact.totals,
      changedFeeTypes: impact.changedFeeTypes,
      scheduleFrom: impact.scheduleFrom,
      scheduleTo: impact.scheduleTo,
      warnings: parsed.warnings.map((w) => w.message),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[analyze]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
