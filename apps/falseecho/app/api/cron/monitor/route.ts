import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * GET/POST /api/cron/monitor — monitor-tier daily scan cron.
 *
 * ⚠ MVP STUB (spec §4 lists the daily scan + diff + alert + weekly PDF as
 * monitor-tier scope; the marathon task defers the cron implementation).
 * What exists: the falseecho_monitors table (rows provisioned on monitor
 * payment), this token-gated endpoint that logs cron.fired, and the report
 * page that renders scan history per entity.
 *
 * What's missing by design (post-MVP): iterating active monitors, running
 * executeScan per entity, diffing flags vs the previous scan, alert emails,
 * weekly summary PDF. Wire a Vercel cron (vercel.json "crons") to this
 * route when implementing.
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
    metadata: { cron: 'monitor', stub: true },
  })

  return NextResponse.json({
    ok: true,
    stub: true,
    note: 'Monitor daily-scan cron is a post-MVP stub: monitors are provisioned on payment but not yet re-scanned.',
  })
}

export async function GET(req: NextRequest) {
  return handle(req)
}

export async function POST(req: NextRequest) {
  return handle(req)
}
