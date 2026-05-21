'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Shared per-surface dashboard. Used by /ops/{main,subdomains,oci,  */
/*  hetzner}. Pulls /api/ops/feed?source=<sources> + /api/ops/health  */
/*  and renders a surface-scoped subset of the master dashboard.      */
/* ------------------------------------------------------------------ */

export interface ProbeResult {
  readonly name: string
  readonly source: string
  readonly url: string
  readonly status: number | null
  readonly ok: boolean
  readonly duration_ms: number
  readonly error?: string
}

interface OpsEvent {
  readonly id: number
  readonly event_type: string
  readonly source: string
  readonly ref_id: string | null
  readonly ref_email: string | null
  readonly amount_cents: number | null
  readonly status: string | null
  readonly metadata: Record<string, unknown>
  readonly created_at: string
}

interface FeedResponse {
  readonly generated_at: string
  readonly summary: {
    readonly events_24h: number
    readonly confirmed_revenue_cents_24h: number
    readonly payment_intents_24h: number
    readonly payment_confirmed_24h: number
    readonly active_subs_total: number
  }
  readonly summary_by_type: ReadonlyArray<{ readonly label: string; readonly value: number }>
  readonly events: ReadonlyArray<OpsEvent>
}

interface HealthResponse {
  readonly generated_at: string
  readonly probes: ReadonlyArray<ProbeResult>
  readonly hmac: { readonly attempted: boolean; readonly ok: boolean; readonly status: number | null; readonly reason?: string }
  readonly envs: ReadonlyArray<{ readonly name: string; readonly set: boolean; readonly critical: boolean; readonly reason: string }>
}

export interface SurfaceDashboardProps {
  readonly token: string
  readonly surfaceId: 'main' | 'subdomains' | 'oci' | 'hetzner'
  readonly title: string
  readonly subtitle: string
  /** Single source or comma-separated list passed to /api/ops/feed?source=… */
  readonly sources: ReadonlyArray<string>
  /** Optional list of probe `source` values to filter the health card by. */
  readonly probeSources?: ReadonlyArray<string>
  /** Static registry of services/crons/bots to render in the surface's right rail. */
  readonly registry: ReadonlyArray<{
    readonly id: string
    readonly label: string
    readonly note?: string
    readonly url?: string
  }>
}

const POLL_INTERVAL_MS = 30_000

export function SurfaceDashboard({ token, surfaceId, title, subtitle, sources, probeSources, registry }: SurfaceDashboardProps) {
  const [feed, setFeed] = useState<FeedResponse | null>(null)
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const timerRef = useRef<number | null>(null)

  const sourceParam = sources.join(',')

  const fetchAll = useCallback(async () => {
    setRefreshing(true)
    try {
      const params = new URLSearchParams({ token })
      if (sourceParam) params.set('source', sourceParam)
      const [feedRes, healthRes] = await Promise.all([
        fetch(`/api/ops/feed?${params.toString()}`, { cache: 'no-store' }),
        fetch(`/api/ops/health?token=${encodeURIComponent(token)}`, { cache: 'no-store' }),
      ])
      if (!feedRes.ok) throw new Error(`feed ${feedRes.status}`)
      if (!healthRes.ok) throw new Error(`health ${healthRes.status}`)
      const [feedJson, healthJson] = await Promise.all([feedRes.json(), healthRes.json()])
      setFeed(feedJson as FeedResponse)
      setHealth(healthJson as HealthResponse)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'fetch failed')
    } finally {
      setRefreshing(false)
    }
  }, [token, sourceParam])

  useEffect(() => {
    void fetchAll()
    timerRef.current = window.setInterval(() => void fetchAll(), POLL_INTERVAL_MS)
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current)
    }
  }, [fetchAll])

  const filteredProbes = useMemo(() => {
    if (!health) return []
    if (!probeSources || probeSources.length === 0) return health.probes
    const allowed = new Set(probeSources)
    return health.probes.filter((p) => allowed.has(p.source))
  }, [health, probeSources])

  const probeOk = filteredProbes.filter((p) => p.ok).length
  const probeTotal = filteredProbes.length
  const allGreen = probeTotal > 0 && probeOk === probeTotal && (health?.hmac.ok ?? true)

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bl-bg)', color: 'var(--bl-text)', padding: '2rem 1.5rem 4rem' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gap: 24 }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--bl-font-mono)', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--bl-text-muted)' }}>
              Surface · {surfaceId}
            </div>
            <h1 style={{ fontFamily: 'var(--bl-font-display)', fontSize: 'clamp(2rem, 1.5rem + 1.5vw, 2.75rem)', fontWeight: 800, margin: '6px 0 4px', letterSpacing: '-0.025em' }}>
              {title}
            </h1>
            <p style={{ color: 'var(--bl-text-muted)', margin: 0, fontSize: 14 }}>{subtitle}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NavLink href={`/ops/main?t=${encodeURIComponent(token)}`} active={surfaceId === 'main'}>Main</NavLink>
            <NavLink href={`/ops/subdomains?t=${encodeURIComponent(token)}`} active={surfaceId === 'subdomains'}>Subdomains</NavLink>
            <NavLink href={`/ops/oci?t=${encodeURIComponent(token)}`} active={surfaceId === 'oci'}>OCI</NavLink>
            <NavLink href={`/ops/hetzner?t=${encodeURIComponent(token)}`} active={surfaceId === 'hetzner'}>Hetzner</NavLink>
            <button
              onClick={() => void fetchAll()}
              disabled={refreshing}
              style={{
                padding: '8px 14px',
                background: 'var(--bl-surface)',
                border: '1px solid var(--bl-border)',
                borderRadius: 'var(--bl-radius-sm)',
                color: 'var(--bl-text)',
                fontFamily: 'var(--bl-font-mono)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: refreshing ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {refreshing ? <Loader2 size={12} className="spin" /> : <RefreshCw size={12} />}
              Refresh
            </button>
          </div>
        </header>

        {error && (
          <div style={{ padding: 12, background: 'color-mix(in oklab, var(--bl-danger) 12%, transparent)', border: '1px solid var(--bl-danger)', borderRadius: 8, color: 'var(--bl-danger)', fontSize: 13 }}>
            <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {error}
          </div>
        )}

        {/* Stat strip */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <StatCard
            icon={<DollarSign size={16} />}
            label="Revenue 24h"
            value={feed ? `$${(feed.summary.confirmed_revenue_cents_24h / 100).toFixed(2)}` : '—'}
            tone={feed && feed.summary.confirmed_revenue_cents_24h > 0 ? 'success' : 'muted'}
          />
          <StatCard
            icon={<Activity size={16} />}
            label="Events 24h"
            value={feed ? String(feed.summary.events_24h) : '—'}
            tone="muted"
          />
          <StatCard
            icon={<CheckCircle size={16} />}
            label="Active Subs"
            value={feed ? String(feed.summary.active_subs_total) : '—'}
            tone={feed && feed.summary.active_subs_total > 0 ? 'success' : 'muted'}
          />
          <StatCard
            icon={<Activity size={16} />}
            label="Health"
            value={probeTotal > 0 ? `${probeOk}/${probeTotal}` : '—'}
            tone={allGreen ? 'success' : 'danger'}
          />
        </section>

        {/* Two-column body */}
        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 16, alignItems: 'start' }}>
          {/* Left: Recent events tape */}
          <Card title={`Events — ${feed ? feed.events.length : 0} recent`} icon={<Clock size={14} />}>
            {feed && feed.events.length > 0 ? (
              <div style={{ display: 'grid', gap: 8, maxHeight: 480, overflowY: 'auto' }}>
                {feed.events.slice(0, 40).map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
              </div>
            ) : (
              <Empty>No events in the last 24h for this surface.</Empty>
            )}
          </Card>

          {/* Right: Health probes + Registry */}
          <div style={{ display: 'grid', gap: 16 }}>
            <Card title="Health probes" icon={<Activity size={14} />}>
              {filteredProbes.length > 0 ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  {filteredProbes.map((p) => (
                    <ProbeRow key={p.name} probe={p} />
                  ))}
                </div>
              ) : (
                <Empty>No probes scoped to this surface.</Empty>
              )}
            </Card>

            <Card title="Components" icon={<ExternalLink size={14} />}>
              <div style={{ display: 'grid', gap: 8 }}>
                {registry.map((item) => (
                  <div key={item.id} style={{ padding: 10, background: 'var(--bl-surface)', border: '1px solid var(--bl-divider)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                      <div style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 12, fontWeight: 700 }}>{item.label}</div>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: 'var(--bl-text-muted)', textDecoration: 'none' }}>
                          open ↗
                        </a>
                      )}
                    </div>
                    {item.note && (
                      <div style={{ marginTop: 4, fontSize: 11, color: 'var(--bl-text-muted)', lineHeight: 1.5 }}>{item.note}</div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {feed && feed.summary_by_type.length > 0 && (
          <Card title="Event mix (24h)" icon={<Activity size={14} />}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {feed.summary_by_type.slice(0, 12).map((row) => (
                <div key={row.label} style={{ padding: '6px 10px', background: 'var(--bl-surface)', border: '1px solid var(--bl-divider)', borderRadius: 999, fontFamily: 'var(--bl-font-mono)', fontSize: 11 }}>
                  <span style={{ color: 'var(--bl-text-muted)' }}>{row.label}</span>
                  <span style={{ marginLeft: 6, fontWeight: 700 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <footer style={{ fontSize: 11, color: 'var(--bl-text-subtle)', fontFamily: 'var(--bl-font-mono)', textAlign: 'center', marginTop: 24 }}>
          generated {feed?.generated_at ?? '—'} · auto-refresh every 30s
        </footer>
      </div>
      <style>{`.spin{animation:spin 0.9s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )
}

/* ----------------------------- subcomponents ----------------------------- */

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        padding: '6px 10px',
        borderRadius: 'var(--bl-radius-sm)',
        background: active ? 'color-mix(in oklab, var(--bl-accent) 18%, transparent)' : 'transparent',
        color: active ? 'var(--bl-accent)' : 'var(--bl-text-muted)',
        border: `1px solid ${active ? 'var(--bl-accent)' : 'var(--bl-divider)'}`,
        fontFamily: 'var(--bl-font-mono)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        textDecoration: 'none',
      }}
    >
      {children}
    </Link>
  )
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'success' | 'danger' | 'muted' }) {
  const color = tone === 'success' ? 'var(--bl-success)' : tone === 'danger' ? 'var(--bl-danger)' : 'var(--bl-text)'
  return (
    <div style={{ padding: 14, background: 'var(--bl-surface)', border: '1px solid var(--bl-divider)', borderRadius: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--bl-text-muted)', fontSize: 11, fontFamily: 'var(--bl-font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {icon}
        {label}
      </div>
      <div style={{ marginTop: 6, fontFamily: 'var(--bl-font-display)', fontSize: 24, fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  )
}

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ padding: 16, background: 'var(--bl-surface)', border: '1px solid var(--bl-divider)', borderRadius: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--bl-text-muted)', fontSize: 11, fontFamily: 'var(--bl-font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
        {icon}
        {title}
      </div>
      {children}
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: 12, color: 'var(--bl-text-muted)', fontSize: 12 }}>{children}</div>
}

function EventRow({ event }: { event: OpsEvent }) {
  const time = new Date(event.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const amount = typeof event.amount_cents === 'number' ? `$${(event.amount_cents / 100).toFixed(2)}` : null
  const isPayment = event.event_type.startsWith('payment.')
  const isError = event.event_type === 'error' || event.status === 'failed'
  return (
    <div
      style={{
        padding: 8,
        background: isError ? 'color-mix(in oklab, var(--bl-danger) 8%, transparent)' : 'var(--bl-bg)',
        border: '1px solid var(--bl-divider)',
        borderRadius: 8,
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) auto',
        gap: 8,
        alignItems: 'center',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 11, fontWeight: 700, color: isPayment ? 'var(--bl-success)' : isError ? 'var(--bl-danger)' : 'var(--bl-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {event.event_type}
          <span style={{ marginLeft: 8, color: 'var(--bl-text-muted)', fontWeight: 500 }}>·</span>
          <span style={{ marginLeft: 8, color: 'var(--bl-text-muted)', fontWeight: 500 }}>{event.source}</span>
        </div>
        {event.ref_id && (
          <div style={{ fontSize: 10, color: 'var(--bl-text-subtle)', fontFamily: 'var(--bl-font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            ref: {event.ref_id}
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {amount && <div style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--bl-success)' }}>{amount}</div>}
        <div style={{ fontSize: 9, color: 'var(--bl-text-subtle)', fontFamily: 'var(--bl-font-mono)' }}>{time}</div>
      </div>
    </div>
  )
}

function ProbeRow({ probe }: { probe: ProbeResult }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', gap: 8, alignItems: 'center', padding: '6px 8px', background: 'var(--bl-bg)', border: '1px solid var(--bl-divider)', borderRadius: 8 }}>
      <span style={{ display: 'inline-flex', width: 8, height: 8, borderRadius: 999, background: probe.ok ? 'var(--bl-success)' : 'var(--bl-danger)' }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 11, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{probe.name}</div>
        <div style={{ fontSize: 10, color: 'var(--bl-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{probe.url}</div>
      </div>
      <div style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 10, color: probe.ok ? 'var(--bl-success)' : 'var(--bl-danger)', textAlign: 'right' }}>
        {probe.status ?? 'ERR'}
        <div style={{ color: 'var(--bl-text-subtle)' }}>{probe.duration_ms}ms</div>
      </div>
    </div>
  )
}
