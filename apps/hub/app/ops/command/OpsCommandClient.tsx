'use client'

/**
 * /ops/command — WP6 of REVENUE-MACHINE-24-7-2026-07-04.
 *
 * Every move, one screen. Six tiles:
 *   Revenue · Funnel · Outreach · Content · Agents · Next Moses Actions
 *
 * Polls /api/ops/command every 30s for the business aggregate and rides the
 * existing /api/ops/live/stream SSE (same hookup as OpsLiveClient) for a
 * compact one-row agent heartbeat strip.
 *
 * Token-gated by OPS_DASHBOARD_TOKEN, supplied via ?t= query param.
 * Every figure renders "—" when its section is null (e.g. a table that the
 * parallel funnel migration hasn't created yet).
 */

import { useCallback, useEffect, useState } from 'react'

interface CommandRevenue {
  today_confirmed_usd: number
  today_confirmed_count: number
  mrr_estimate_usd: number
  last_7d_usd: number
  last_7d_count: number
}

interface CommandStatusBucket {
  total: number
  by_status: Record<string, number>
}

interface CommandDealRooms extends CommandStatusBucket {
  open_value_usd: number
}

interface CommandOutreach {
  sent_7d: number | null
  replies_7d: number | null
  bounced_total: number | null
}

interface CommandContent {
  published_7d: number | null
  citations: {
    citation_rate_pct: number | null
    queries_polled: number | null
    gap_count: number | null
    polled_at: string | null
  } | null
  note: string | null
}

interface CommandAgents {
  total: number
  fresh: number
  stale: number
  alive: number
  degraded: number
  dead: number
  starting: number
  stopping: number
  alerts: Array<{ service: string; last_ping: string; age_seconds: number; last_action: string | null }>
}

interface CommandPayload {
  generated_at: string
  revenue: CommandRevenue | null
  funnel: {
    qualifier_sessions: CommandStatusBucket | null
    deal_rooms: CommandDealRooms | null
    leadforge_new_7d: number | null
  } | null
  outreach: CommandOutreach | null
  content: CommandContent | null
  agents: CommandAgents | null
  next_actions: { source: string; items: string[] }
}

interface StreamHeartbeat {
  service: string
  status: string
  age_seconds: number
  is_stale: boolean
}

interface StreamSnapshot {
  generated_at: string
  services: StreamHeartbeat[]
  summary: { total: number; alive: number; degraded: number; dead: number; stale: number }
  _close?: string
}

const C = {
  bg: '#0a0a0a',
  card: '#171717',
  border: '#262626',
  text: '#e5e5e5',
  bright: '#f5f5f5',
  dim: '#9ca3af',
  dimmer: '#6b7280',
  green: '#10b981',
  red: '#ef4444',
  amber: '#f59e0b',
  blue: '#60a5fa',
  gray: '#6b7280',
}

const EM_DASH = '—'

function usd(n: number | null | undefined): string {
  if (n == null) return EM_DASH
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function num(n: number | null | undefined): string {
  if (n == null) return EM_DASH
  return n.toLocaleString()
}

function fmtAge(sec: number): string {
  if (sec < 60) return `${sec}s`
  if (sec < 3600) return `${Math.floor(sec / 60)}m`
  return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`
}

function dotColor(hb: StreamHeartbeat): string {
  if (hb.status === 'dead' || hb.is_stale) return C.red
  if (hb.status === 'degraded') return C.amber
  if (hb.status === 'starting' || hb.status === 'stopping') return C.gray
  if (hb.age_seconds < 300) return C.green
  return '#eab308'
}

export default function OpsCommandClient({ token }: { token: string }) {
  const [data, setData] = useState<CommandPayload | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [stream, setStream] = useState<StreamSnapshot | null>(null)
  const [streamConnected, setStreamConnected] = useState(false)

  const fetchCommand = useCallback(async () => {
    try {
      const res = await fetch(`/api/ops/command?t=${encodeURIComponent(token)}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData((await res.json()) as CommandPayload)
      setErr(null)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'fetch failed')
    }
  }, [token])

  // Aggregate JSON: fetch now + every 30s.
  useEffect(() => {
    void fetchCommand()
    const iv = setInterval(() => void fetchCommand(), 30_000)
    return () => clearInterval(iv)
  }, [fetchCommand])

  // Agent heartbeat strip: same SSE hookup as OpsLiveClient.
  useEffect(() => {
    const es = new EventSource(`/api/ops/live/stream?t=${token}`)
    es.onopen = () => setStreamConnected(true)
    es.onerror = () => setStreamConnected(false)
    es.onmessage = (e) => {
      try {
        const snap: StreamSnapshot = JSON.parse(e.data)
        if (snap._close) {
          es.close()
          return
        }
        if (snap.services) setStream(snap)
      } catch {
        // ignore parse errors on keepalives
      }
    }
    return () => es.close()
  }, [token])

  const funnel = data?.funnel ?? null
  const qs = funnel?.qualifier_sessions ?? null
  const rooms = funnel?.deal_rooms ?? null
  const paidRooms = rooms?.by_status?.paid ?? null

  return (
    <main style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', background: C.bg, color: C.text, minHeight: '100vh', padding: 24 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: 1 }}>
          🎛️ COMMAND
          <span style={{ marginLeft: 12, fontSize: 12, fontWeight: 400, color: streamConnected ? C.green : C.dimmer }}>
            ● {streamConnected ? 'live' : 'polling'}
          </span>
        </h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href={`/ops/live?t=${encodeURIComponent(token)}`} style={{ color: C.blue, textDecoration: 'none', fontSize: 13 }}>Live →</a>
          <a href={`/ops/snapshot?t=${encodeURIComponent(token)}`} style={{ color: C.blue, textDecoration: 'none', fontSize: 13 }}>Snapshot →</a>
          <a href={`/ops/main?t=${encodeURIComponent(token)}`} style={{ color: C.blue, textDecoration: 'none', fontSize: 13 }}>Main →</a>
        </div>
      </header>

      {err && (
        <div style={{ background: '#7f1d1d', color: '#fecaca', padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
          /api/ops/command: {err} (retrying every 30s)
        </div>
      )}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {/* ── Revenue ── */}
        <Tile title="💰 Revenue">
          <div style={{ fontSize: 40, fontWeight: 800, color: (data?.revenue?.today_confirmed_usd ?? 0) > 0 ? C.green : C.red, lineHeight: 1.1 }}>
            {usd(data?.revenue?.today_confirmed_usd)}
          </div>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>
            today · {num(data?.revenue?.today_confirmed_count)} confirmed order(s)
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 14 }}>
            <SubStat label="MRR est." value={usd(data?.revenue?.mrr_estimate_usd)} color={C.blue} />
            <SubStat label="Last 7d" value={usd(data?.revenue?.last_7d_usd)} color={C.text} sub={`${num(data?.revenue?.last_7d_count)} order(s)`} />
          </div>
        </Tile>

        {/* ── Funnel ── */}
        <Tile title="🌀 Funnel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <PipeStage label="Sessions" value={num(qs?.total)} color={C.blue} />
            <span style={{ color: C.dimmer }}>→</span>
            <PipeStage label="Deal rooms" value={num(rooms?.total)} color={C.amber} />
            <span style={{ color: C.dimmer }}>→</span>
            <PipeStage label="Paid" value={num(paidRooms)} color={C.green} />
          </div>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 12 }}>
            Open room value: <span style={{ color: C.amber, fontWeight: 700 }}>{usd(rooms?.open_value_usd)}</span>
          </div>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>
            LeadForge new (7d): <span style={{ color: C.text, fontWeight: 700 }}>{num(funnel?.leadforge_new_7d)}</span>
          </div>
          {qs?.by_status && Object.keys(qs.by_status).length > 0 && (
            <div style={{ fontSize: 11, color: C.dimmer, marginTop: 8 }}>
              sessions: {Object.entries(qs.by_status).map(([k, v]) => `${k} ${v}`).join(' · ')}
            </div>
          )}
        </Tile>

        {/* ── Outreach ── */}
        <Tile title="📧 Outreach">
          <div style={{ display: 'flex', gap: 24 }}>
            <SubStat label="Sent 7d" value={num(data?.outreach?.sent_7d)} color={C.blue} big />
            <SubStat label="Replies 7d" value={num(data?.outreach?.replies_7d)} color={C.green} big />
            <SubStat
              label="Bounced"
              value={num(data?.outreach?.bounced_total)}
              color={(data?.outreach?.bounced_total ?? 0) > 0 ? C.red : C.dim}
              big
            />
          </div>
          <div style={{ fontSize: 11, color: C.dimmer, marginTop: 12 }}>
            lead_outreach sends/replies · bounces via nurture-state webhook flag
          </div>
        </Tile>

        {/* ── Content ── */}
        <Tile title="📝 Content">
          <div style={{ display: 'flex', gap: 24 }}>
            <SubStat label="Published 7d" value={num(data?.content?.published_7d)} color={C.green} big />
            <SubStat
              label="AI citation rate"
              value={data?.content?.citations?.citation_rate_pct != null ? `${data.content.citations.citation_rate_pct}%` : EM_DASH}
              color={C.blue}
              big
              sub={
                data?.content?.citations
                  ? `${num(data.content.citations.gap_count)} gap(s) · ${num(data.content.citations.queries_polled)} queries`
                  : undefined
              }
            />
          </div>
          {data?.content?.note && (
            <div style={{ fontSize: 11, color: C.dimmer, marginTop: 12 }}>{data.content.note}</div>
          )}
        </Tile>

        {/* ── Agents (compact heartbeat strip via SSE) ── */}
        <Tile title="🤖 Agents">
          {stream ? (
            <>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: C.dim, marginBottom: 10 }}>
                <span><span style={{ color: C.green, fontWeight: 700 }}>{stream.summary.alive}</span> alive</span>
                <span><span style={{ color: C.amber, fontWeight: 700 }}>{stream.summary.degraded}</span> degraded</span>
                <span><span style={{ color: C.red, fontWeight: 700 }}>{stream.summary.dead + stream.summary.stale}</span> dead/stale</span>
                <span><span style={{ color: C.text, fontWeight: 700 }}>{stream.summary.total}</span> total</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {stream.services.map((s) => (
                  <span
                    key={s.service}
                    title={`${s.service} · ${s.status} · ${fmtAge(s.age_seconds)} ago`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      borderRadius: 999,
                      padding: '3px 8px',
                      fontSize: 11,
                      color: C.dim,
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: 4, background: dotColor(s), display: 'inline-block' }} />
                    {s.service}
                  </span>
                ))}
              </div>
            </>
          ) : data?.agents ? (
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: C.dim }}>
              <span><span style={{ color: C.green, fontWeight: 700 }}>{data.agents.fresh}</span> fresh</span>
              <span><span style={{ color: C.red, fontWeight: 700 }}>{data.agents.stale}</span> stale</span>
              <span><span style={{ color: C.text, fontWeight: 700 }}>{data.agents.total}</span> total</span>
            </div>
          ) : (
            <div style={{ fontSize: 20, color: C.dim }}>{EM_DASH}</div>
          )}
        </Tile>

        {/* ── Next Moses Actions ── */}
        <Tile title="🎯 Next Moses Actions">
          {data?.next_actions?.items?.length ? (
            <ol style={{ margin: 0, padding: '0 0 0 18px', display: 'grid', gap: 8 }}>
              {data.next_actions.items.map((item) => (
                <li key={item} style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{item}</li>
              ))}
            </ol>
          ) : (
            <div style={{ fontSize: 20, color: C.dim }}>{EM_DASH}</div>
          )}
          {data?.next_actions?.source === 'static' && (
            <div style={{ fontSize: 11, color: C.dimmer, marginTop: 10 }}>
              Week-1 first-dollar gate · decisions/MRR-40K-90-DAY-PLAN-2026-07-02.md
            </div>
          )}
        </Tile>
      </section>

      <footer style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${C.border}`, color: C.dimmer, fontSize: 11 }}>
        {data ? `Generated ${new Date(data.generated_at).toLocaleString()}` : 'Loading…'} · aggregate refreshes every 30s · agent strip via SSE
      </footer>
    </main>
  )
}

function Tile({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 18 }}>
      <div style={{ fontSize: 12, color: C.dim, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700, marginBottom: 12 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function SubStat({ label, value, color, sub, big }: { label: string; value: string; color: string; sub?: string; big?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: big ? 28 : 20, fontWeight: 700, color, marginTop: 2 }}>{value}</div>
      {sub ? <div style={{ fontSize: 11, color: C.dimmer, marginTop: 2 }}>{sub}</div> : null}
    </div>
  )
}

function PipeStage({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 12px', textAlign: 'center', minWidth: 76 }}>
      <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 10, color: C.dim, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{label}</div>
    </div>
  )
}
