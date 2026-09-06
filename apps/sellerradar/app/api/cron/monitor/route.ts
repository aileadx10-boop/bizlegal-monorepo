import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { analyzeStoredCatalog, StoredSkuInput } from '@/lib/margin'
import { getCurrentSchedule, getPreviousSchedule, listSchedules } from '@/lib/schedules'
import type { FeeSchedule, SizeTier } from '@/lib/fees'
import { sendMonitorAlert } from '@/lib/email'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET/POST /api/cron/monitor — monitor-tier weekly re-scan (spec §4).
 *
 * For each active monitor whose next_scan_at is due: reload the stored SKU
 * set from its origin report, re-run the pure fee/margin engines
 * (lib/fees.ts + lib/margin.ts) from the monitor's last-known schedule
 * version to the CURRENT fixture, and diff the recomputed totals against
 * the last-known summary on the monitor row. On change: write a new
 * sellerradar_reports row (paid_at carried over — subscribers own their
 * re-scans) linked via monitor_id, and email the subscriber. No change:
 * just bump last_scanned_at / next_scan_at.
 *
 * Cadence: weekly — next_scan_at is set +7 days after every scan
 * (fulfill.ts seeds the first one at purchase + 7d).
 *
 * Batch cap: 25 monitors per run, least-recently-scanned first. Each
 * monitor costs several Supabase round-trips plus a Resend send; the cap
 * keeps a run inside maxDuration on the Hobby plan, and the oldest-first
 * ordering guarantees starved monitors drain across consecutive runs.
 *
 * Graceful degradation: missing Supabase/Resend env → log + skip, still
 * exit 200 with the summary so Vercel cron doesn't retry-storm.
 */

// Kept in sync with 20260907_sellerradar_monitor_scan_state.sql.
interface MonitorRow {
  id: string
  email: string
  report_id: string | null
  next_scan_at: string | null
  last_schedule_version: string | null
  last_monthly_impact: number | null
  last_annual_impact: number | null
  last_changed_fee_types: string[] | null
}

interface OriginReportRow {
  id: string
  email: string | null
  paid_at: string | null
  schedule_to: string | null
  monthly_impact: number | null
  annual_impact: number | null
  changed_fee_types: string[] | null
}

interface SkuRow {
  sku: string
  asin: string | null
  category: string
  price: number
  cogs: number
  monthly_units: number
  size_tier: string | null
  fees_old: { storage?: number; sizeTier?: string } | null
}

const VALID_TIERS: readonly SizeTier[] = ['small_standard', 'large_standard', 'large_bulky', 'oversize']

function asSizeTier(raw: string | null | undefined): SizeTier {
  return (VALID_TIERS as readonly string[]).includes(raw ?? '') ? (raw as SizeTier) : 'large_standard'
}

/** Storage rate (per cu ft / month) a tier pays under a schedule. */
function storageRate(schedule: FeeSchedule, tier: SizeTier): number {
  return tier === 'oversize' || tier === 'large_bulky'
    ? schedule.storage_per_cuft_monthly.oversize
    : schedule.storage_per_cuft_monthly.standard
}

/**
 * sellerradar_skus doesn't persist raw dimensions — recover per-unit volume
 * from the stored storage fee (fees_old.storage = round2(cuft × old rate)).
 * The round2 means the recovered volume is ±half a cent of rate, which can
 * shift a recomputed storage fee by a cent; harmless in practice because a
 * recompute only happens when the schedule version changed (i.e. a real
 * diff is expected anyway).
 */
function toStoredSkuInput(row: SkuRow, baseline: FeeSchedule): StoredSkuInput {
  const sizeTier = asSizeTier(row.size_tier ?? row.fees_old?.sizeTier)
  const storedStorage = typeof row.fees_old?.storage === 'number' ? row.fees_old.storage : 0
  const rate = storageRate(baseline, sizeTier)
  const volumeCuFt = storedStorage > 0 && rate > 0 ? storedStorage / rate : 0
  return {
    sku: row.sku,
    asin: row.asin,
    category: row.category,
    price: Number(row.price),
    cogs: Number(row.cogs),
    monthlyUnits: Number(row.monthly_units),
    sizeTier,
    volumeCuFt,
  }
}

function nextWeekIso(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + 7)
  return d.toISOString()
}

function scheduleByVersion(version: string | null): FeeSchedule {
  const found = version ? listSchedules().find((s) => s.version === version) : undefined
  if (found) return found
  // The version the monitor baselined against has rotated out of the
  // fixture list (admin refresh) — fall back to the previous fixture so the
  // diff still runs against something sane.
  console.warn(`[cron/monitor] schedule version "${version}" not in fixtures — falling back to previous`)
  return getPreviousSchedule()
}

async function handle(req: NextRequest) {
  const token =
    req.headers.get('authorization')?.replace(/^Bearer /i, '') ??
    new URL(req.url).searchParams.get('token') ??
    ''
  const expected = process.env.CRON_SECRET ?? process.env.OPS_DASHBOARD_TOKEN ?? ''
  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const summary = { processed: 0, changed: 0, emailed: 0, errors: 0 }

  // ── Graceful degradation: no Supabase env → nothing to scan ──
  const supabaseConfigured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (!supabaseConfigured) {
    console.warn('[cron/monitor] Supabase env missing — skipping run')
    logEventAsync({
      type: 'cron.fired',
      source: 'sellerradar',
      status: 'ok',
      metadata: { cron: 'monitor', skipped: 'missing supabase env' },
    })
    return NextResponse.json({ ok: true, skipped: 'missing supabase env', ...summary })
  }
  const emailConfigured = Boolean(process.env.RESEND_API_KEY)
  if (!emailConfigured) {
    console.warn('[cron/monitor] RESEND_API_KEY missing — alerts will be skipped')
  }

  logEventAsync({ type: 'cron.fired', source: 'sellerradar', status: 'ok', metadata: { cron: 'monitor' } })

  const nowIso = new Date().toISOString()
  const { data: monitors, error: monErr } = await supabaseAdmin
    .from('sellerradar_monitors')
    .select(
      'id, email, report_id, next_scan_at, last_schedule_version, last_monthly_impact, last_annual_impact, last_changed_fee_types',
    )
    .eq('status', 'active')
    .or(`next_scan_at.is.null,next_scan_at.lte.${nowIso}`)
    .order('next_scan_at', { ascending: true, nullsFirst: true })
    .limit(25)

  if (monErr) {
    console.error('[cron/monitor] monitor query failed:', monErr)
    return NextResponse.json({ ok: false, ...summary, errors: 1, error: 'monitor query failed' })
  }

  const current = getCurrentSchedule()

  for (const monitor of (monitors ?? []) as MonitorRow[]) {
    try {
      summary.processed++
      await scanMonitor(monitor, current, emailConfigured, summary)
    } catch (err) {
      summary.errors++
      console.error(`[cron/monitor] monitor ${monitor.id} failed:`, err instanceof Error ? err.message : err)
    }
  }

  logEventAsync({
    type: 'cron.completed',
    source: 'sellerradar',
    status: summary.errors > 0 ? 'failed' : 'ok',
    metadata: { cron: 'monitor', ...summary },
  })

  return NextResponse.json({ ok: true, ...summary })
}

async function scanMonitor(
  monitor: MonitorRow,
  current: FeeSchedule,
  emailConfigured: boolean,
  summary: { processed: number; changed: number; emailed: number; errors: number },
) {
  const nowIso = new Date().toISOString()
  const bumpScanned = (scheduleVersion: string) =>
    supabaseAdmin
      .from('sellerradar_monitors')
      .update({ last_scanned_at: nowIso, last_schedule_version: scheduleVersion, next_scan_at: nextWeekIso() })
      .eq('id', monitor.id)

  if (!monitor.report_id) {
    console.warn(`[cron/monitor] monitor ${monitor.id} has no origin report — rescheduling`)
    await bumpScanned(monitor.last_schedule_version ?? current.version)
    return
  }

  // ── Origin report (baseline fallback) + stored SKU set ──
  const { data: origin, error: originErr } = await supabaseAdmin
    .from('sellerradar_reports')
    .select('id, email, paid_at, schedule_to, monthly_impact, annual_impact, changed_fee_types')
    .eq('id', monitor.report_id)
    .maybeSingle()
  if (originErr || !origin) {
    console.warn(`[cron/monitor] origin report ${monitor.report_id} missing — rescheduling`)
    await bumpScanned(monitor.last_schedule_version ?? current.version)
    return
  }
  const originReport = origin as OriginReportRow

  const baselineVersion = monitor.last_schedule_version ?? originReport.schedule_to
  const lastKnown = {
    monthly: monitor.last_monthly_impact ?? originReport.monthly_impact ?? 0,
    annual: monitor.last_annual_impact ?? originReport.annual_impact ?? 0,
    feeTypes: monitor.last_changed_fee_types ?? originReport.changed_fee_types ?? [],
  }

  // ── No-change fast path: engines are pure, so an unchanged schedule
  // version can only reproduce the stored numbers. Skip the recompute. ──
  if (baselineVersion === current.version) {
    await bumpScanned(current.version)
    return
  }

  const baseline = scheduleByVersion(baselineVersion)

  const { data: skuRows, error: skuErr } = await supabaseAdmin
    .from('sellerradar_skus')
    .select('sku, asin, category, price, cogs, monthly_units, size_tier, fees_old')
    .eq('report_id', originReport.id)
  if (skuErr || !skuRows || skuRows.length === 0) {
    console.warn(`[cron/monitor] no SKUs for report ${originReport.id} — rescheduling`)
    await bumpScanned(current.version)
    return
  }

  const impact = analyzeStoredCatalog(
    (skuRows as SkuRow[]).map((row) => toStoredSkuInput(row, baseline)),
    baseline,
    current,
  )

  const impactChanged =
    Number(lastKnown.monthly) !== impact.totals.monthlyImpact ||
    Number(lastKnown.annual) !== impact.totals.annualImpact ||
    JSON.stringify([...lastKnown.feeTypes].sort()) !== JSON.stringify([...impact.changedFeeTypes].sort())

  // Brief: a new schedule version OR a changed impact both count as change.
  const changed = baselineVersion !== current.version || impactChanged

  if (!changed) {
    await supabaseAdmin
      .from('sellerradar_monitors')
      .update({
        last_scanned_at: nowIso,
        last_schedule_version: current.version,
        next_scan_at: nextWeekIso(),
      })
      .eq('id', monitor.id)
    return
  }

  // ── Change: write the re-scan report (subscriber owns it — paid_at
  // carried over from the origin report) + per-SKU detail rows. ──
  summary.changed++
  const createdAt = new Date().toISOString()
  const reportRef = 'SR-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 90000) + 10000)

  const { data: report, error: reportErr } = await supabaseAdmin
    .from('sellerradar_reports')
    .insert({
      report_ref: reportRef,
      email: monitor.email ?? originReport.email,
      tier: 'monitor',
      status: 'delivered',
      sku_count: impact.totals.skuCount,
      affected_count: impact.totals.affectedCount,
      monthly_impact: impact.totals.monthlyImpact,
      annual_impact: impact.totals.annualImpact,
      avg_margin_delta_pct: impact.totals.avgMarginDeltaPct,
      changed_fee_types: impact.changedFeeTypes,
      schedule_from: impact.scheduleFrom.version,
      schedule_to: impact.scheduleTo.version,
      warnings: [],
      paid_at: originReport.paid_at,
      completed_at: createdAt,
      monitor_id: monitor.id,
    })
    .select('id, report_ref')
    .single()

  if (reportErr || !report) {
    throw new Error(`re-scan report insert failed: ${reportErr?.message ?? 'no row returned'}`)
  }

  const { error: skuInsertErr } = await supabaseAdmin.from('sellerradar_skus').insert(
    impact.perSku.map((s) => ({
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
    })),
  )
  if (skuInsertErr) {
    await supabaseAdmin.from('sellerradar_reports').delete().eq('id', report.id)
    throw new Error(`re-scan SKU insert failed: ${skuInsertErr.message}`)
  }

  // New totals become the monitor's last-known baseline.
  await supabaseAdmin
    .from('sellerradar_monitors')
    .update({
      last_scanned_at: nowIso,
      last_schedule_version: current.version,
      last_monthly_impact: impact.totals.monthlyImpact,
      last_annual_impact: impact.totals.annualImpact,
      last_changed_fee_types: impact.changedFeeTypes,
      next_scan_at: nextWeekIso(),
    })
    .eq('id', monitor.id)

  // ── Alert email — failure must not fail the run ──
  const to = monitor.email ?? originReport.email
  if (emailConfigured && to) {
    try {
      await sendMonitorAlert({
        to,
        reportRef: report.report_ref,
        oldMonthlyImpact: Number(lastKnown.monthly),
        oldAnnualImpact: Number(lastKnown.annual),
        newMonthlyImpact: impact.totals.monthlyImpact,
        newAnnualImpact: impact.totals.annualImpact,
        changedFeeTypes: impact.changedFeeTypes,
        scheduleTo: current.version,
      })
      summary.emailed++
      logEventAsync({
        type: 'email.sent',
        source: 'sellerradar',
        ref_id: report.report_ref,
        email: to,
        status: 'ok',
        metadata: { kind: 'monitor_alert', scheduleTo: current.version },
      })
    } catch (err) {
      console.warn(`[cron/monitor] alert email failed for monitor ${monitor.id}:`, err instanceof Error ? err.message : err)
      logEventAsync({
        type: 'email.failed',
        source: 'sellerradar',
        ref_id: report.report_ref,
        email: to,
        status: 'failed',
        metadata: { kind: 'monitor_alert' },
      })
    }
  }

  logEventAsync({
    type: 'report.generated',
    source: 'sellerradar',
    ref_id: report.report_ref,
    email: to ?? undefined,
    status: 'ok',
    metadata: {
      kind: 'monitor_rescan',
      monitorId: monitor.id,
      monthlyImpact: impact.totals.monthlyImpact,
      annualImpact: impact.totals.annualImpact,
    },
  })
}

export async function GET(req: NextRequest) {
  return handle(req)
}

export async function POST(req: NextRequest) {
  return handle(req)
}
