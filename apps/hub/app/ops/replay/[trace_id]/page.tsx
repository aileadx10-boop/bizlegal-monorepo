import { createClient } from '@supabase/supabase-js'
import ReplayClient from './ReplayClient'

export const dynamic = 'force-dynamic'

/**
 * /ops/replay/[trace_id]
 *
 * Phase 4 of PLATFORM-BUILD-2026-07-02 — debugger layer.
 *
 * Server component: auth-checks the token, fetches trace events from
 * agent_heartbeats (with mock fallback), then passes them to ReplayClient
 * for interactive replay animation.
 */

export interface TraceEvent {
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

async function fetchTraceEvents(traceId: string): Promise<{ events: TraceEvent[]; isMock: boolean }> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('agent_heartbeats')
      .select('service, status, last_action, pinged_at, metadata')
      .eq('trace_id', traceId)
      .order('pinged_at', { ascending: true })
      .limit(200)

    if (error) {
      return { events: buildMockEvents(traceId), isMock: true }
    }

    const rows = (data ?? []) as Array<{
      service: string
      status: string | null
      last_action: string | null
      pinged_at: string
      metadata: Record<string, unknown> | null
    }>

    if (rows.length === 0) {
      return { events: buildMockEvents(traceId), isMock: true }
    }

    return {
      events: rows.map((r) => ({
        service: r.service,
        status: r.status ?? 'unknown',
        last_action: r.last_action ?? null,
        pinged_at: r.pinged_at,
        metadata: r.metadata ?? {},
      })),
      isMock: false,
    }
  } catch {
    return { events: buildMockEvents(traceId), isMock: true }
  }
}

const DARK = {
  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  background: '#0a0a0a',
  color: '#e5e5e5',
  minHeight: '100vh',
} as const

export default async function Page({
  params,
  searchParams,
}: {
  params: { trace_id: string }
  searchParams: { t?: string }
}) {
  const token = searchParams.t ?? ''
  const expected = process.env.OPS_DASHBOARD_TOKEN

  if (!token || !expected || token !== expected) {
    return (
      <main style={{ ...DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1>🔒 /ops/replay</h1>
          <p>
            Append <code>?t=&lt;OPS_DASHBOARD_TOKEN&gt;</code> to your URL.
          </p>
        </div>
      </main>
    )
  }

  const { trace_id } = params
  const { events, isMock } = await fetchTraceEvents(trace_id)

  return (
    <main style={{ ...DARK, padding: 24 }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: '1px solid #262626',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            🔁 Trace Replay
          </h1>
          <div style={{ marginTop: 4, fontSize: 12, color: '#6b7280' }}>
            <code style={{ color: '#a78bfa' }}>{trace_id}</code>
            {isMock && (
              <span
                style={{
                  marginLeft: 10,
                  background: '#1c1917',
                  border: '1px solid #44403c',
                  color: '#a8a29e',
                  padding: '1px 6px',
                  borderRadius: 4,
                  fontSize: 11,
                }}
              >
                demo data — table pending migration
              </span>
            )}
          </div>
        </div>
        <a
          href={`/ops/live?t=${token}`}
          style={{ color: '#60a5fa', textDecoration: 'none', fontSize: 13 }}
        >
          ← Live
        </a>
      </header>

      <ReplayClient events={events} />
    </main>
  )
}
