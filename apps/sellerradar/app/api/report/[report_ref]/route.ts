import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/report/[report_ref] — report-page data. Unauthenticated (fleet
 * pattern: the report_ref is the bearer secret, same as FalseEcho's report
 * page).
 *
 * Paid-gated (spec §4): unpaid reports return the top-line totals (SKU
 * count, affected count, monthly/annual impact, changed fee types) but
 * NEVER the per-SKU rows. Per-SKU detail only ships for paid reports.
 * Buyer email is never served here; checkout resolves it server-side.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { report_ref: string } },
) {
  try {
    const { data: report, error } = await supabaseAdmin
      .from('sellerradar_reports')
      .select('id, report_ref, tier, status, sku_count, affected_count, monthly_impact, annual_impact, avg_margin_delta_pct, changed_fee_types, schedule_from, schedule_to, warnings, created_at, completed_at, paid_at')
      .eq('report_ref', params.report_ref)
      .maybeSingle()

    if (error || !report) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    // Paid gate is the paid_at column alone — tier and status can never be
    // the gate because they are writable earlier in the flow.
    const paid = Boolean(report.paid_at)

    const summary = {
      report_ref: report.report_ref,
      tier: report.tier,
      status: report.status,
      sku_count: report.sku_count,
      affected_count: report.affected_count,
      monthly_impact: report.monthly_impact,
      annual_impact: report.annual_impact,
      avg_margin_delta_pct: report.avg_margin_delta_pct,
      changed_fee_types: report.changed_fee_types,
      schedule_from: report.schedule_from,
      schedule_to: report.schedule_to,
      warnings: report.warnings,
      created_at: report.created_at,
      completed_at: report.completed_at,
    }

    if (!paid) {
      return NextResponse.json({ report: summary, skus: null, paid: false })
    }

    const { data: skus } = await supabaseAdmin
      .from('sellerradar_skus')
      .select('sku, asin, category, price, cogs, monthly_units, size_tier, fees_old, fees_new, fee_delta_per_unit, monthly_impact, annual_impact, margin_old_pct, margin_new_pct')
      .eq('report_id', report.id)
      .order('annual_impact', { ascending: false })

    return NextResponse.json({ report: summary, skus: skus ?? [], paid: true })
  } catch (err) {
    console.error('[report]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
