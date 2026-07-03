'use client'

/**
 * /ops/live — Phase 1 operator dashboard.
 *
 * Real-time view of every BizLegal service heartbeat.
 * Connects to /api/ops/live/stream (SSE) and updates every 5s.
 * Token-gated by OPS_DASHBOARD_TOKEN, supplied via ?t= query param.
 *
 * Color coding:
 *   green:   alive, fresh (< 5 min)
 *   yellow:  alive but stale (5-15 min) or degraded
 *   red:     dead or stale > 15 min
 *   gray:    starting / stopping
 */

import { useEffect, useState } from 'react'

interface Heartbeat {
  service: string
  status: 'alive' | 'degraded' | 'dead' | 'starting' | 'stopping' | string
  last_action: string | null
  last_action_status: 'ok' | 'error' | 'warning' | null
  pinged_at: string
  age_seconds: number
  is_stale: boolean
  queue_depth?: number
  hostname?: string
  pid?: number
  version?: string
  parent_service?: string | null
  trace_id?: string | null
}

interface LiveSnapshot {
  generated_at: string
  services: Heartbeat[]
  summary: {
    total: number
    alive: number
    degraded: number
    dead: number
    starting: number
    stopping: number
    stale: number
    oldest_ping_seconds: number | null
    newest_ping_seconds: number | null
  }
  cron_alerts: Array<{ service: string; last_ping: string; age_seconds: number; last_action: string | null }>
  _close?: string
}

function fmtAge(sec: number): string {
  if (sec < 60) return `${sec}s`
  if (sec < 3600) return `${Math.floor(sec / 60)}m ${sec % 60}s`
  return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`
}

function statusColor(hb: Heartbeat): string {
  if (hb.status === 'dead' || hb.is_stale) return '#ef4444' // red-500
  if (hb.status === 'degraded') return '#f59e0b' // amber-500
  if (hb.status === 'starting' || hb.status === 'stopping') return '#6b7280' // gray-500
  if (hb.age_seconds < 300) return '#10b981' // emerald-500
  return '#eab308' // yellow-500
}

export default function OpsLiveClient({ token }: { token: string }) {
  const [snap, setSnap] = useState<LiveSnapshot | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const es = new EventSource(`/api/ops/live/stream?t=${token}`)
    es.onopen = () => {
      setConnected(true)
      setErr(null)
    }
    es.onerror = (e) => {
      setConnected(false)
      setErr('stream disconnected (retrying in 5s)')
    }
    es.onmessage = (e) => {
      try {
        const data: LiveSnapshot = JSON.parse(e.data)
        if (data._close) {
          es.close()
          return
        }
        setSnap(data)
      } catch {
        // ignore parse errors on keepalives
      }
    }
    return () => es.close()
  }, [token, paused])

  return (
    <main style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh', padding: 24 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #262626' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
          ⚡ BizLegal Live
          <span style={{ marginLeft: 12, fontSize: 12, fontWeight: 400, color: connected ? '#10b981' : '#ef4444' }}>
            ● {connected ? 'connected' : 'disconnected'}
          </span>
        </h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={() => setPaused(!paused)}
            style={{ background: '#1f2937', color: '#e5e5e5', border: '1px solid #374151', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
          >
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <a href="/ops/snapshot?t={token}" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: 13 }}>Snapshot →</a>
          <a href="/ops/health?t={token}" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: 13 }}>Health →</a>
        </div>
      </header>

      {err && (
        <div style={{ background: '#7f1d1d', color: '#fecaca', padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
          {err}
        </div>
      )}

      {snap && (
        <>
          {/* Summary chips */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 24 }}>
            <Stat label="Total" value={snap.summary.total} color="#3b82f6" />
            <Stat label="Alive" value={snap.summary.alive} color="#10b981" />
            <Stat label="Degraded" value={snap.summary.degraded} color="#f59e0b" />
            <Stat label="Dead" value={snap.summary.dead} color="#ef4444" />
            <Stat label="Stale > 15m" value={snap.summary.stale} color="#dc2626" />
            <Stat label="Oldest" value={snap.summary.oldest_ping_seconds != null ? fmtAge(snap.summary.oldest_ping_seconds) : '—'} color="#9ca3af" />
          </section>

          {/* Alerts (services silent > 15 min) */}
          {snap.cron_alerts.length > 0 && (
            <section style={{ background: '#7f1d1d', padding: 16, borderRadius: 8, marginBottom: 24, border: '1px solid #991b1b' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: 16, color: '#fecaca' }}>🚨 Stale Services ({snap.cron_alerts.length})</h2>
              <ul style={{ margin: 0, padding: '0 0 0 20px', color: '#fee2e2' }}>
                {snap.cron_alerts.map((a) => (
                  <li key={a.service} style={{ fontSize: 13, marginBottom: 4 }}>
                    <code style={{ color: '#fca5a5' }}>{a.service}</code> — silent {fmtAge(a.age_seconds)}{' '}
                    {a.last_action && <span style={{ color: '#fecaca', opacity: 0.7 }}>(last: {a.last_action})</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Service list */}
          <section>
            <h2 style={{ margin: '0 0 12px 0', fontSize: 16, color: '#d4d4d4' }}>Services ({snap.services.length})</h2>
            <div style={{ display: 'grid', gap: 8 }}>
              {snap.services.map((s) => (
                <div
                  key={s.service}
                  style={{
                    background: '#171717',
                    border: '1px solid #262626',
                    borderLeft: `4px solid ${statusColor(s)}`,
                    padding: 12,
                    borderRadius: 6,
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: statusColor(s) }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#f5f5f5' }}>
                      {s.service}
                      {s.parent_service && (
                        <span style={{ marginLeft: 8, fontSize: 11, color: '#6b7280', fontWeight: 400 }}>
                          ⊆ {s.parent_service}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                      {s.last_action || <em style={{ opacity: 0.5 }}>idle</em>}
                      {s.last_action_status && (
                        <span
                          style={{
                            marginLeft: 8,
                            color: s.last_action_status === 'ok' ? '#10b981' : s.last_action_status === 'error' ? '#ef4444' : '#f59e0b',
                          }}
                        >
                          [{s.last_action_status}]
                        </span>
                      )}
                      {s.queue_depth != null && s.queue_depth > 0 && (
                        <span style={{ marginLeft: 8, color: '#60a5fa' }}>queue: {s.queue_depth}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 12, color: '#9ca3af' }}>
                    <div>{fmtAge(s.age_seconds)} ago</div>
                    {s.hostname && <div style={{ fontSize: 10, opacity: 0.6 }}>{s.hostname}{s.pid ? `:${s.pid}` : ''}</div>}
                    {s.trace_id && <div style={{ fontSize: 10, opacity: 0.6 }}>trace: {s.trace_id.slice(0, 8)}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #262626', color: '#6b7280', fontSize: 11 }}>
            Generated {new Date(snap.generated_at).toLocaleString()} · Next refresh via SSE · 5s keepalive
          </footer>
        </>
      )}
    </main>
  )
}

function Stat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{ background: '#171717', border: '1px solid #262626', padding: 12, borderRadius: 6 }}>
      <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    </div>
  )
}
