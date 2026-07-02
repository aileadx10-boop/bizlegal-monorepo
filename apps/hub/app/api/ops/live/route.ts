import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * GET /api/ops/live
 *
 * Phase 1 of PLATFORM-BUILD-2026-07-02 — live process inspection.
 *
 * Returns the most recent heartbeat per service + a summary of system health.
 * Token-gated by OPS_DASHBOARD_TOKEN (same pattern as /api/ops/health).
 *
 * Query params:
 *   t=TOKEN              required, 404 on mismatch
 *   stale_seconds=N      override default 900 (15 min)
 *
 * Response:
 *   {
 *     generated_at: ISO,
 *     services: [
 *       { service, status, last_action, last_action_status, pinged_at,
 *         age_seconds, queue_depth, is_stale, hostname, pid, version, ... }
 *     ],
 *     summary: {
 *       total, alive, degraded, dead, starting, stopping, stale,
 *       oldest_ping_seconds, newest_ping_seconds
 *     },
 *     cron_alerts: [ { service, last_ping, age_seconds } ]  // services silent >15min
 *   }
 */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t')
  const expected = process.env.OPS_DASHBOARD_TOKEN
  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const staleSeconds = Number(req.nextUrl.searchParams.get('stale_seconds') ?? '900')

  try {
    const supabase = getSupabase()

    // Read the last 200 heartbeats (covers ~3 services/min * many services)
    const { data, error } = await supabase
      .from('agent_heartbeats')
      .select('*')
      .order('pinged_at', { ascending: false })
      .limit(500)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Dedupe by service: keep the most recent per service name
    const byService = new Map<string, Record<string, unknown>>()
    for (const hb of data ?? []) {
      const key = String(hb.service)
      if (!byService.has(key)) byService.set(key, hb)
    }

    const now = Date.now()
    const services: Array<Record<string, unknown>> = Array.from(
      byService.values() as Iterable<Record<string, unknown>>,
    ).map((hb) => {
      const pingedMs = new Date(String(hb.pinged_at)).getTime()
      const age = Math.max(0, Math.floor((now - pingedMs) / 1000))
      return { ...hb, age_seconds: age, is_stale: age > staleSeconds }
    })

    const statusCounts = { alive: 0, degraded: 0, dead: 0, starting: 0, stopping: 0 }
    let stale = 0
    for (const s of services) {
      const st = String(s.status ?? 'unknown')
      if (st in statusCounts) (statusCounts as Record<string, number>)[st] += 1
      if (s.is_stale) stale += 1
    }

    const ages = services.map((s) => s.age_seconds as number)
    const summary = {
      total: services.length,
      ...statusCounts,
      stale,
      oldest_ping_seconds: ages.length ? Math.max(...ages) : null,
      newest_ping_seconds: ages.length ? Math.min(...ages) : null,
    }
    const cronAlerts = services.filter((s) => s.is_stale).map((s) => ({
      service: s.service, last_ping: s.pinged_at, age_seconds: s.age_seconds, last_action: s.last_action,
    }))

    return NextResponse.json(
      {
        generated_at: new Date().toISOString(),
        services: services.sort((a, b) => (a.age_seconds as number) - (b.age_seconds as number)),
        summary,
        cron_alerts: cronAlerts,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
