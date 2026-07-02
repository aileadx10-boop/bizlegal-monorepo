import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 60
// SSE responses need Node runtime (not edge) so the long-lived stream works
export const runtime = 'nodejs'

/**
 * GET /api/ops/live/stream
 *
 * Phase 1 of PLATFORM-BUILD-2026-07-02 — live process inspection.
 *
 * Server-Sent Events stream of the same data as /api/ops/live.
 * Updates every 5s. The /ops/live operator UI consumes this.
 *
 * Query params:
 *   t=TOKEN          required (OPS_DASHBOARD_TOKEN)
 *
 * Events:
 *   data: { ...full live payload... }\n\n
 *   :heartbeat\n\n   (every 5s keepalive so proxies don't kill the stream)
 *
 * Closes after 5 minutes; clients should reconnect.
 */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

async function fetchLiveSnapshot(staleSeconds: number) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('agent_heartbeats')
    .select('*')
    .order('pinged_at', { ascending: false })
    .limit(500)
  if (error) throw error

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

  return {
    generated_at: new Date().toISOString(),
    services: services.sort((a, b) => (a.age_seconds as number) - (b.age_seconds as number)),
    summary: {
      total: services.length, ...statusCounts, stale,
      oldest_ping_seconds: ages.length ? Math.max(...ages) : null,
      newest_ping_seconds: ages.length ? Math.min(...ages) : null,
    },
    cron_alerts: cronAlerts,
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t')
  const expected = process.env.OPS_DASHBOARD_TOKEN
  if (!expected || token !== expected) {
    return new Response('not found', { status: 404 })
  }

  const staleSeconds = Number(req.nextUrl.searchParams.get('stale_seconds') ?? '900')
  const encoder = new TextEncoder()
  const start = Date.now()
  const maxDuration = 5 * 60 * 1000 // 5 minutes

  const stream = new ReadableStream({
    async start(controller) {
      const safeEnqueue = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk))
        } catch {
          // Controller closed (client disconnected) — swallow.
        }
      }

      // Initial snapshot
      try {
        const snap = await fetchLiveSnapshot(staleSeconds)
        safeEnqueue(`data: ${JSON.stringify(snap)}\n\n`)
      } catch (err) {
        safeEnqueue(
          `data: ${JSON.stringify({ error: err instanceof Error ? err.message : 'unknown' })}\n\n`,
        )
      }

      // Loop: every 5s, fetch + emit
      const interval = setInterval(async () => {
        if (Date.now() - start > maxDuration) {
          clearInterval(interval)
          safeEnqueue(`data: ${JSON.stringify({ _close: 'max_duration_reached' })}\n\n`)
          try { controller.close() } catch {}
          return
        }
        try {
          const snap = await fetchLiveSnapshot(staleSeconds)
          safeEnqueue(`data: ${JSON.stringify(snap)}\n\n`)
        } catch (err) {
          safeEnqueue(
            `data: ${JSON.stringify({ error: err instanceof Error ? err.message : 'unknown' })}\n\n`,
          )
        }
      }, 5000)

      // Keepalive comment every 15s so Cloudflare / nginx don't drop the stream
      const keepalive = setInterval(() => safeEnqueue(`: keepalive\n\n`), 15_000)

      // Cleanup on cancel
      const cleanup = () => {
        clearInterval(interval)
        clearInterval(keepalive)
        try { controller.close() } catch {}
      }
      req.signal?.addEventListener?.('abort', cleanup)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
