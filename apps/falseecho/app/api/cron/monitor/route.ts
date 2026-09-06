import { NextRequest, NextResponse } from 'next/server'
import { runMonitorSweep } from '@/lib/monitor'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
// Each due monitor is a full probe battery; the 25-monitor cap inside
// runMonitorSweep keeps the run within this function-duration budget.
export const maxDuration = 300

/**
 * GET/POST /api/cron/monitor — monitor-tier daily re-scan cron (wired in
 * vercel.json "crons"). Token-gated on CRON_SECRET.
 *
 * Per due monitor (falseecho_monitors, next_scan_at <= now): full probe
 * battery via executeScan → new falseecho_scans row (tier 'monitor') with
 * hash-anchored evidence → diff flagged items vs the monitor's previous
 * scan → alert email on new flags. Always exits 200 with a
 * {scanned, alerted, skipped, errors} summary; missing Supabase/Resend env
 * degrades to log + skip, never a 5xx.
 */
async function handle(req: NextRequest) {
  const token =
    req.headers.get('authorization')?.replace(/^Bearer /i, '') ??
    new URL(req.url).searchParams.get('token') ??
    ''
  const expected = process.env.CRON_SECRET ?? process.env.OPS_DASHBOARD_TOKEN ?? ''
  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  logEventAsync({
    type: 'cron.fired',
    source: 'falseecho',
    status: 'ok',
    metadata: { cron: 'monitor' },
  })

  const summary = await runMonitorSweep()

  logEventAsync({
    type: 'cron.completed',
    source: 'falseecho',
    status: summary.errors.length > 0 ? 'failed' : 'ok',
    metadata: { cron: 'monitor', ...summary },
  })

  return NextResponse.json({ ok: true, ...summary })
}

export async function GET(req: NextRequest) {
  return handle(req)
}

export async function POST(req: NextRequest) {
  return handle(req)
}
