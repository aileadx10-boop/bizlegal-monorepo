import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * GET /api/ops/replay/[trace_id]
 *
 * Phase 4 of PLATFORM-BUILD-2026-07-02 — debugger layer.
 *
 * Returns all heartbeats that share a trace_id, ordered by pinged_at.
 * If the agent_heartbeats table does not exist, falls back to mock data
 * so the replay UI still renders during early setup.
 *
 * Auth: ?t=OPS_DASHBOARD_TOKEN
 *
 * Response:
 *   {
 *     trace_id: string
 *     events: Array<{ service, status, last_action, pinged_at, metadata }>
 *     replay_url: string
 *   }
 */

interface HeartbeatRow {
  service: string
  status: string | null
  last_action: string | null
  pinged_at: string
  metadata: Record<string, unknown> | null
}

interface TraceEvent {
  service: string
  status: string
  last_action: string | null
  pinged_at: string
  metadata: Record<string, unknown>
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

function isTableNotFoundError(err: unknown): boolean {
  if (err instanceof Error) {
    return err.message.includes('does not exist') || err.message.includes('relation')
  }
  if (typeof err === 'object' && err !== null) {
    const code = (err as Record<string, unknown>).code
    // PostgreSQL "undefined_table" error code
    return code === '42P01'
  }
  return false
}

function buildMockEvents(traceId: string): TraceEvent[] {
  const base = Date.now() - 90_000
  return [
    {
      service: 'hetzner/headhunter',
      status: 'alive',
      last_action: 'starting lead crawl',
      pinged_at: new Date(base).toISOString(),
      metadata: { trace_id: traceId, step: 1 },
    },
    {
      service: 'hetzner/headhunter',
      status: 'alive',
      last_action: 'crawled 42 leads',
      pinged_at: new Date(base + 30_000).toISOString(),
      metadata: { trace_id: traceId, step: 2, leads: 42 },
    },
    {
      service: 'hetzner/brain',
      status: 'alive',
      last_action: 'scoring leads',
      pinged_at: new Date(base + 60_000).toISOString(),
      metadata: { trace_id: traceId, step: 3 },
    },
    {
      service: 'hetzner/brain',
      status: 'alive',
      last_action: 'scored 38 / 42 leads',
      pinged_at: new Date(base + 90_000).toISOString(),
      metadata: { trace_id: traceId, step: 4, scored: 38, total: 42 },
    },
  ]
}

export async function GET(
  req: NextRequest,
  { params }: { params: { trace_id: string } },
) {
  const token = req.nextUrl.searchParams.get('t')
  const expected = process.env.OPS_DASHBOARD_TOKEN
  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const { trace_id } = params
  if (!trace_id) {
    return NextResponse.json({ error: 'trace_id required' }, { status: 400 })
  }

  const replayUrl = `/ops/replay/${encodeURIComponent(trace_id)}?t=${token}`

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('agent_heartbeats')
      .select('service, status, last_action, pinged_at, metadata')
      .eq('trace_id', trace_id)
      .order('pinged_at', { ascending: true })
      .limit(200)

    if (error) {
      // Table doesn't exist yet — return demo data so the UI is usable
      if (isTableNotFoundError(error)) {
        return NextResponse.json(
          {
            trace_id,
            events: buildMockEvents(trace_id),
            replay_url: replayUrl,
            _mock: true,
          },
          { headers: { 'Cache-Control': 'no-store' } },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const events: TraceEvent[] = (data as HeartbeatRow[]).map((row) => ({
      service: row.service,
      status: row.status ?? 'unknown',
      last_action: row.last_action ?? null,
      pinged_at: row.pinged_at,
      metadata: row.metadata ?? {},
    }))

    // If no events found for this trace_id, return demo data
    const payload =
      events.length > 0
        ? { trace_id, events, replay_url: replayUrl }
        : { trace_id, events: buildMockEvents(trace_id), replay_url: replayUrl, _mock: true }

    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    if (isTableNotFoundError(err)) {
      return NextResponse.json(
        { trace_id, events: buildMockEvents(trace_id), replay_url: replayUrl, _mock: true },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    }
    const msg = err instanceof Error ? err.message : 'unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
