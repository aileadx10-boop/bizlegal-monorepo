'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle,
  CreditCard,
  Database,
  DollarSign,
  Download,
  FileText,
  Filter,
  Globe,
  Loader2,
  Mail,
  MoveRight,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

interface OpsEvent {
  id: number
  event_type: string
  source: string
  ref_id: string | null
  ref_email: string | null
  amount_cents: number | null
  status: string | null
  metadata: Record<string, unknown>
  created_at: string
}

interface PaymentOrderRow {
  id: number
  user_email: string | null
  product: string | null
  tier: string | null
  billing_interval: string | null
  amount_cents: number | null
  status: string | null
  gateway: string | null
  source: string | null
  created_at: string
}

interface BoiSubRow {
  id: number
  user_email: string
  tier: string
  status: string
  entity_legal_name: string
  created_at: string
}

interface FrameworkRow {
  framework_id: string
  source_url: string
  source_version: string | null
  fetched_at: string
  is_change: boolean
}

interface FeedResponse {
  generated_at: string
  window: string
  summary: {
    events_24h: number
    confirmed_revenue_cents_24h: number
    payment_intents_24h: number
    payment_confirmed_24h: number
    checkout_conversion_pct: number
    active_subs_total: number
    boi_active_subs: number
    framework_changes_recent: number
  }
  summary_by_type: Array<{ label: string; value: number }>
  events: OpsEvent[]
  payment_orders_recent: PaymentOrderRow[]
  subs_by_product: Record<string, { active: number; mrr_cents: number }>
  boi_subs_recent: BoiSubRow[]
  frameworks_recent: FrameworkRow[]
  referrals?: {
    received_30d: number
    routed_30d: number
    responded_30d: number
    closed_30d: number
    paid_30d: number
    committed_revenue_cents_30d: number
    paid_revenue_cents_30d: number
    unmatched_30d: number
    top_partners: Array<{ partner_id: string; closes: number }>
    window_days: number
  }
  source_filter?: string | null
}

const REFRESH_MS = 15_000

const TYPE_ICONS: Record<string, JSX.Element> = {
  'payment.intent': <CreditCard size={14} />,
  'payment.confirmed': <CheckCircle size={14} />,
  'payment.failed': <AlertTriangle size={14} />,
  'subscription.created': <Users size={14} />,
  'subscription.renewed': <RefreshCw size={14} />,
  'subscription.cancelled': <AlertTriangle size={14} />,
  'lead.inbound': <Bell size={14} />,
  'lead.qualified': <CheckCircle size={14} />,
  // Phase AA V3 nurture (D11 dashboard mapping fix)
  'nurture.email.sent': <Mail size={14} />,
  'nurture.opt_out': <AlertTriangle size={14} />,
  // OCI referral pillar
  'referral.received': <Bell size={14} />,
  'referral.routed': <MoveRight size={14} />,
  'referral.responded': <Mail size={14} />,
  'referral.closed': <CheckCircle size={14} />,
  'referral.paid': <CreditCard size={14} />,
  'referral.alert': <AlertTriangle size={14} />,
  'referral.contract_email': <Mail size={14} />,
  'email.sent': <Mail size={14} />,
  'email.failed': <Mail size={14} />,
  'cron.fired': <Zap size={14} />,
  'cron.completed': <Zap size={14} />,
  'sqa.draft': <FileText size={14} />,
  'dpa.negotiation': <FileText size={14} />,
  'psp.audit': <ShieldAlert size={14} />,
  'risk.analysis': <Activity size={14} />,
  'risk.assessment': <Activity size={14} />,
  'jurisdiction.compare': <Globe size={14} />,
  'snapshot.generated': <FileText size={14} />,
  'cert.released': <CheckCircle size={14} />,
  'kb.uploaded': <Database size={14} />,
  'framework.changed': <AlertTriangle size={14} />,
  'boi.subscribed': <Users size={14} />,
  'boi.alert.sent': <Bell size={14} />,
  'download.report': <Download size={14} />,
  'agent.checkout': <CreditCard size={14} />,
  'webhook.received': <MoveRight size={14} />,
  'error': <AlertTriangle size={14} />,
}

const TYPE_COLORS: Record<string, string> = {
  'payment.intent': 'var(--bl-warning)',
  'payment.confirmed': 'var(--bl-success)',
  'payment.failed': 'var(--bl-danger)',
  'subscription.created': 'var(--bl-success)',
  'subscription.cancelled': 'var(--bl-danger)',
  'lead.inbound': 'var(--bl-accent)',
  'lead.qualified': 'var(--bl-success)',
  // Phase AA V3 nurture
  'nurture.email.sent': 'var(--bl-info)',
  'nurture.opt_out': 'var(--bl-warning)',
  // OCI referral pillar
  'referral.received': 'var(--bl-accent)',
  'referral.routed': 'var(--bl-info)',
  'referral.responded': 'var(--bl-info)',
  'referral.closed': 'var(--bl-success)',
  'referral.paid': 'var(--bl-success)',
  'referral.alert': 'var(--bl-warning)',
  'referral.contract_email': 'var(--bl-info)',
  'email.sent': 'var(--bl-info)',
  'email.failed': 'var(--bl-danger)',
  'cron.fired': 'var(--bl-text-muted)',
  'cron.completed': 'var(--bl-text-muted)',
  'sqa.draft': 'var(--bl-accent)',
  'dpa.negotiation': 'var(--bl-accent)',
  'psp.audit': 'var(--bl-warning)',
  'risk.analysis': 'var(--bl-accent)',
  'risk.assessment': 'var(--bl-text-muted)',
  'jurisdiction.compare': 'var(--bl-accent)',
  'snapshot.generated': 'var(--bl-info)',
  'cert.released': 'var(--bl-success)',
  'kb.uploaded': 'var(--bl-accent)',
  'framework.changed': 'var(--bl-warning)',
  'boi.subscribed': 'var(--bl-success)',
  'boi.alert.sent': 'var(--bl-info)',
  'download.report': 'var(--bl-info)',
  'agent.checkout': 'var(--bl-warning)',
  'webhook.received': 'var(--bl-text-muted)',
  'error': 'var(--bl-danger)',
}

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, now - t)
  const sec = Math.floor(diff / 1000)
  if (sec < 5) return 'just now'
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  return `${day}d ago`
}

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function emailMask(email: string | null | undefined): string {
  if (!email) return '—'
  const [local, domain] = email.split('@')
  if (!domain) return email
  const lo = local.length <= 2 ? local : `${local.slice(0, 2)}…`
  return `${lo}@${domain}`
}

export function OpsDashboardClient({ token }: { token: string }) {
  const [data, setData] = useState<FeedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastFetched, setLastFetched] = useState<number>(0)
  const [tick, setTick] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchFeed = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch(`/api/ops/feed?token=${encodeURIComponent(token)}`, {
        cache: 'no-store',
      })
      if (!res.ok) {
        const msg = res.status === 404 ? 'token rejected' : `HTTP ${res.status}`
        setError(msg)
        return
      }
      const json = (await res.json()) as FeedResponse
      setData(json)
      setLastFetched(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'network error')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void fetchFeed()
  }, [fetchFeed])

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        void fetchFeed()
      }, REFRESH_MS)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoRefresh, fetchFeed])

  // Re-render once a second so "12s ago" labels stay current
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const filteredEvents = useMemo(() => {
    if (!data) return []
    if (filter === 'all') return data.events
    return data.events.filter((e) => e.event_type.startsWith(filter) || e.source === filter)
  }, [data, filter])

  const eventTypeFilters = useMemo(() => {
    if (!data) return []
    const set = new Set<string>()
    for (const e of data.events) {
      const root = e.event_type.split('.')[0]
      set.add(root)
    }
    return Array.from(set).sort()
  }, [data])

  if (loading && !data) {
    return (
      <main style={pageStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--bl-text-muted)' }}>
          <Loader2 size={16} className="ops-spin" /> Loading ops feed…
        </div>
        <style>{spinKeyframes}</style>
      </main>
    )
  }

  if (error && !data) {
    return (
      <main style={pageStyle}>
        <div style={{ color: 'var(--bl-danger)' }}>Failed to load feed: {error}</div>
        <style>{spinKeyframes}</style>
      </main>
    )
  }

  if (!data) return null

  return (
    <main style={pageStyle}>
      {/* Header */}
      <header style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--bl-font-mono)',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--bl-accent)',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--bl-success)',
                  animation: 'ops-pulse 2s ease-in-out infinite',
                }}
              />
              Live Ops · BizLegal AI
            </div>
            <h1
              style={{
                fontFamily: 'var(--bl-font-display)',
                fontSize: 'clamp(1.75rem, 1.5rem + 1vw, 2.25rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--bl-text)',
                margin: 0,
              }}
            >
              Every trigger. Every payment. Every signal.
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'var(--bl-font-mono)',
                fontSize: 11,
                color: 'var(--bl-text-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                style={{ margin: 0 }}
              />
              Auto-refresh 15s
            </label>
            <button
              type="button"
              onClick={() => void fetchFeed()}
              style={{
                padding: '8px 14px',
                background: 'var(--bl-surface)',
                border: '1px solid var(--bl-border)',
                borderRadius: 'var(--bl-radius-pill)',
                color: 'var(--bl-text)',
                fontSize: 12,
                fontFamily: 'var(--bl-font-mono)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <RefreshCw size={12} /> Refresh now
            </button>
            <span
              style={{
                fontFamily: 'var(--bl-font-mono)',
                fontSize: 10,
                color: 'var(--bl-text-subtle)',
                letterSpacing: '0.08em',
              }}
              key={tick}
            >
              {lastFetched > 0
                ? `Updated ${Math.max(0, Math.floor((Date.now() - lastFetched) / 1000))}s ago`
                : 'Never updated'}
            </span>
          </div>
        </div>
      </header>

      {/* Summary cards */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 28,
        }}
      >
        <SummaryCard
          icon={<DollarSign size={16} />}
          label="Confirmed revenue · 24h"
          value={formatUsd(data.summary.confirmed_revenue_cents_24h)}
          tone="success"
        />
        <SummaryCard
          icon={<TrendingUp size={16} />}
          label="Active subscriptions"
          value={data.summary.active_subs_total.toLocaleString()}
          meta={`MRR proxy: ${formatUsd(
            Object.values(data.subs_by_product).reduce((s, x) => s + x.mrr_cents, 0),
          )}`}
        />
        <SummaryCard
          icon={<CreditCard size={16} />}
          label="Checkouts · 24h"
          value={data.summary.payment_confirmed_24h.toLocaleString()}
          meta={`${data.summary.payment_intents_24h} pending · ${data.summary.checkout_conversion_pct}% conv`}
        />
        <SummaryCard
          icon={<Activity size={16} />}
          label="Total events · 24h"
          value={data.summary.events_24h.toLocaleString()}
        />
        <SummaryCard
          icon={<Users size={16} />}
          label="BOI subscribers"
          value={data.summary.boi_active_subs.toLocaleString()}
          meta="Active on CTA-2024 tracker"
        />
        <SummaryCard
          icon={<AlertTriangle size={16} />}
          label="Framework changes"
          value={data.summary.framework_changes_recent.toLocaleString()}
          meta="Last 30 hashes"
          tone={data.summary.framework_changes_recent > 0 ? 'warning' : 'default'}
        />
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: 18,
        }}
      >
        {/* Live event tape */}
        <section
          style={{
            background: 'var(--bl-surface)',
            border: '1px solid var(--bl-border)',
            borderRadius: 'var(--bl-radius-lg)',
            padding: '18px 18px 8px',
            minHeight: 400,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--bl-font-display)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--bl-text)',
                margin: 0,
              }}
            >
              Live event tape
            </h2>
            <div
              style={{
                display: 'flex',
                gap: 6,
                alignItems: 'center',
                fontFamily: 'var(--bl-font-mono)',
                fontSize: 10,
                color: 'var(--bl-text-muted)',
                flexWrap: 'wrap',
              }}
            >
              <Filter size={11} />
              <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>
                all
              </FilterPill>
              {eventTypeFilters.map((f) => (
                <FilterPill key={f} active={filter === f} onClick={() => setFilter(f)}>
                  {f}
                </FilterPill>
              ))}
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div
              style={{
                color: 'var(--bl-text-subtle)',
                fontSize: 13,
                padding: '40px 0',
                textAlign: 'center',
              }}
            >
              No events yet. They&apos;ll stream in here as soon as the routes start firing.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {filteredEvents.map((e) => (
                <li
                  key={e.id}
                  style={{
                    padding: '10px 0',
                    borderBottom: '1px solid var(--bl-divider)',
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    gap: 12,
                    alignItems: 'center',
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: 'var(--bl-surface-soft)',
                      border: `1px solid ${TYPE_COLORS[e.event_type] ?? 'var(--bl-border)'}`,
                      color: TYPE_COLORS[e.event_type] ?? 'var(--bl-text)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {TYPE_ICONS[e.event_type] ?? <Activity size={14} />}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                      <strong style={{ color: 'var(--bl-text)', fontFamily: 'var(--bl-font-mono)' }}>
                        {e.event_type}
                      </strong>
                      <span
                        style={{
                          fontFamily: 'var(--bl-font-mono)',
                          fontSize: 10,
                          padding: '2px 6px',
                          background: 'var(--bl-surface-soft)',
                          color: 'var(--bl-text-muted)',
                          borderRadius: 4,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {e.source}
                      </span>
                      {e.status && (
                        <span
                          style={{
                            fontFamily: 'var(--bl-font-mono)',
                            fontSize: 10,
                            color:
                              e.status === 'ok' || e.status === 'pending'
                                ? 'var(--bl-text-muted)'
                                : 'var(--bl-danger)',
                          }}
                        >
                          {e.status}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        marginTop: 2,
                        color: 'var(--bl-text-muted)',
                        fontSize: 11,
                        fontFamily: 'var(--bl-font-mono)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {e.ref_email && <span>{emailMask(e.ref_email)} · </span>}
                      {e.ref_id && <span>ref:{e.ref_id} · </span>}
                      {e.amount_cents != null && (
                        <strong style={{ color: 'var(--bl-success)' }}>{formatUsd(e.amount_cents)}</strong>
                      )}
                      {!e.ref_email && !e.ref_id && e.amount_cents == null && (
                        <span>{summarizeMetadata(e.metadata)}</span>
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--bl-font-mono)',
                      fontSize: 10,
                      color: 'var(--bl-text-subtle)',
                      whiteSpace: 'nowrap',
                    }}
                    key={tick}
                  >
                    {formatRelative(e.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Right column: referrals (asymmetric pillar) + subs + frameworks + recent payments */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {data.referrals && (
            <div
              style={{
                background: 'linear-gradient(135deg, var(--bl-surface) 0%, color-mix(in oklab, var(--bl-accent) 8%, var(--bl-surface)) 100%)',
                border: '1px solid color-mix(in oklab, var(--bl-accent) 30%, var(--bl-border))',
                borderRadius: 'var(--bl-radius-lg)',
                padding: 18,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--bl-font-display)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--bl-text)',
                    margin: 0,
                  }}
                >
                  Referrals pipeline
                </h3>
                <span
                  style={{
                    fontFamily: 'var(--bl-font-mono)',
                    fontSize: 9,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--bl-accent)',
                    background: 'color-mix(in oklab, var(--bl-accent) 12%, transparent)',
                    padding: '2px 8px',
                    borderRadius: 'var(--bl-radius-pill)',
                  }}
                >
                  {data.referrals.window_days}d · OCI
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'var(--bl-font-mono)',
                  fontSize: 10,
                  color: 'var(--bl-text-subtle)',
                  margin: '0 0 12px',
                  letterSpacing: '0.04em',
                }}
              >
                Asymmetric pillar — finder-fee deal flow.
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                {[
                  { label: 'received', value: data.referrals.received_30d },
                  { label: 'routed', value: data.referrals.routed_30d },
                  { label: 'reply', value: data.referrals.responded_30d },
                  { label: 'closed', value: data.referrals.closed_30d },
                  { label: 'paid', value: data.referrals.paid_30d },
                ].map((stage) => (
                  <div
                    key={stage.label}
                    style={{
                      textAlign: 'center',
                      padding: '8px 4px',
                      background: 'color-mix(in oklab, var(--bl-text) 4%, transparent)',
                      borderRadius: 'var(--bl-radius-md)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--bl-font-display)',
                        fontSize: 18,
                        fontWeight: 800,
                        color: stage.value > 0 ? 'var(--bl-text)' : 'var(--bl-text-subtle)',
                        lineHeight: 1,
                      }}
                    >
                      {stage.value}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--bl-font-mono)',
                        fontSize: 9,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: 'var(--bl-text-muted)',
                        marginTop: 4,
                      }}
                    >
                      {stage.label}
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  marginBottom: data.referrals.top_partners.length > 0 ? 12 : 0,
                }}
              >
                <div
                  style={{
                    padding: 10,
                    background: 'var(--bl-surface)',
                    border: '1px solid var(--bl-divider)',
                    borderRadius: 'var(--bl-radius-md)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--bl-font-mono)',
                      fontSize: 9,
                      color: 'var(--bl-text-muted)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Committed
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--bl-font-display)',
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--bl-warning)',
                      marginTop: 2,
                    }}
                  >
                    {formatUsd(data.referrals.committed_revenue_cents_30d)}
                  </div>
                </div>
                <div
                  style={{
                    padding: 10,
                    background: 'var(--bl-surface)',
                    border: '1px solid var(--bl-divider)',
                    borderRadius: 'var(--bl-radius-md)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--bl-font-mono)',
                      fontSize: 9,
                      color: 'var(--bl-text-muted)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Paid
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--bl-font-display)',
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--bl-success)',
                      marginTop: 2,
                    }}
                  >
                    {formatUsd(data.referrals.paid_revenue_cents_30d)}
                  </div>
                </div>
              </div>
              {data.referrals.top_partners.length > 0 && (
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--bl-font-mono)',
                      fontSize: 9,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--bl-text-muted)',
                      marginBottom: 6,
                    }}
                  >
                    Top partners by closes
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {data.referrals.top_partners.map((p) => (
                      <li
                        key={p.partner_id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '4px 0',
                          fontSize: 11,
                          fontFamily: 'var(--bl-font-mono)',
                        }}
                      >
                        <span style={{ color: 'var(--bl-text)' }}>{p.partner_id}</span>
                        <span style={{ color: 'var(--bl-text-muted)' }}>{p.closes} closes</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {data.referrals.unmatched_30d > 0 && (
                <div
                  style={{
                    marginTop: 10,
                    padding: '6px 10px',
                    background: 'color-mix(in oklab, var(--bl-warning) 12%, transparent)',
                    border: '1px solid color-mix(in oklab, var(--bl-warning) 30%, transparent)',
                    borderRadius: 'var(--bl-radius-md)',
                    fontFamily: 'var(--bl-font-mono)',
                    fontSize: 10,
                    color: 'var(--bl-warning)',
                  }}
                >
                  {data.referrals.unmatched_30d} unmatched lead{data.referrals.unmatched_30d === 1 ? '' : 's'} —
                  add partner capacity for the routed jurisdictions.
                </div>
              )}
            </div>
          )}

          <div
            style={{
              background: 'var(--bl-surface)',
              border: '1px solid var(--bl-border)',
              borderRadius: 'var(--bl-radius-lg)',
              padding: 18,
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--bl-font-display)',
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--bl-text)',
                margin: '0 0 10px',
              }}
            >
              Subscriptions by product
            </h3>
            {Object.keys(data.subs_by_product).length === 0 ? (
              <div style={{ color: 'var(--bl-text-subtle)', fontSize: 12 }}>
                No active subscriptions yet.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {Object.entries(data.subs_by_product)
                  .sort((a, b) => b[1].active - a[1].active)
                  .map(([product, info]) => (
                    <li
                      key={product}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 8,
                        padding: '6px 0',
                        borderBottom: '1px solid var(--bl-divider)',
                        fontSize: 12,
                      }}
                    >
                      <span style={{ fontFamily: 'var(--bl-font-mono)', color: 'var(--bl-text)' }}>
                        {product}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--bl-font-mono)',
                          color: 'var(--bl-text-muted)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {info.active} ·{' '}
                        <strong style={{ color: 'var(--bl-success)' }}>
                          {formatUsd(info.mrr_cents)}
                        </strong>
                        /mo
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div
            style={{
              background: 'var(--bl-surface)',
              border: '1px solid var(--bl-border)',
              borderRadius: 'var(--bl-radius-lg)',
              padding: 18,
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--bl-font-display)',
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--bl-text)',
                margin: '0 0 10px',
              }}
            >
              Compliance frameworks · last 30 hashes
            </h3>
            {data.frameworks_recent.length === 0 ? (
              <div style={{ color: 'var(--bl-text-subtle)', fontSize: 12 }}>
                No framework hashes yet — cron has not fired.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {data.frameworks_recent.slice(0, 12).map((f) => (
                  <li
                    key={`${f.framework_id}-${f.fetched_at}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 8,
                      padding: '6px 0',
                      borderBottom: '1px solid var(--bl-divider)',
                      fontSize: 11,
                      fontFamily: 'var(--bl-font-mono)',
                    }}
                  >
                    <span style={{ color: f.is_change ? 'var(--bl-warning)' : 'var(--bl-text-muted)' }}>
                      {f.is_change ? '⚠ ' : '· '}
                      {f.framework_id}
                    </span>
                    <span style={{ color: 'var(--bl-text-subtle)', whiteSpace: 'nowrap' }} key={tick}>
                      {formatRelative(f.fetched_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            style={{
              background: 'var(--bl-surface)',
              border: '1px solid var(--bl-border)',
              borderRadius: 'var(--bl-radius-lg)',
              padding: 18,
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--bl-font-display)',
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--bl-text)',
                margin: '0 0 10px',
              }}
            >
              Recent payment_orders
            </h3>
            {data.payment_orders_recent.length === 0 ? (
              <div style={{ color: 'var(--bl-text-subtle)', fontSize: 12 }}>
                No payment orders yet.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {data.payment_orders_recent.slice(0, 12).map((p) => (
                  <li
                    key={p.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: 8,
                      padding: '6px 0',
                      borderBottom: '1px solid var(--bl-divider)',
                      fontSize: 11,
                      fontFamily: 'var(--bl-font-mono)',
                    }}
                  >
                    <span style={{ color: 'var(--bl-text)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <strong>{p.product ?? '?'}</strong> · {p.tier ?? '—'} · {p.billing_interval ?? '—'} ·{' '}
                      <span style={{ color: 'var(--bl-text-muted)' }}>{emailMask(p.user_email)}</span>
                    </span>
                    <span
                      style={{
                        color:
                          p.status === 'active' || p.status === 'paid'
                            ? 'var(--bl-success)'
                            : p.status === 'pending'
                              ? 'var(--bl-warning)'
                              : 'var(--bl-text-muted)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {p.status ?? '?'} · {p.amount_cents != null ? formatUsd(p.amount_cents) : '—'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 10,
            background: 'rgba(220,38,38,0.08)',
            color: 'var(--bl-danger)',
            borderRadius: 8,
            fontSize: 12,
          }}
        >
          Last refresh failed: {error} (showing previous data).
        </div>
      )}

      <style>{spinKeyframes}</style>
    </main>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  meta,
  tone = 'default',
}: {
  icon: JSX.Element
  label: string
  value: string
  meta?: string
  tone?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const valueColor =
    tone === 'success'
      ? 'var(--bl-success)'
      : tone === 'warning'
        ? 'var(--bl-warning)'
        : tone === 'danger'
          ? 'var(--bl-danger)'
          : 'var(--bl-text)'
  return (
    <div
      style={{
        background: 'var(--bl-surface)',
        border: '1px solid var(--bl-border)',
        borderRadius: 'var(--bl-radius-lg)',
        padding: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--bl-font-mono)',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--bl-text-muted)',
          marginBottom: 8,
        }}
      >
        {icon}
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--bl-font-display)',
          fontSize: 'clamp(1.4rem, 1rem + 1vw, 1.75rem)',
          fontWeight: 700,
          color: valueColor,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      {meta && (
        <div
          style={{
            fontFamily: 'var(--bl-font-mono)',
            fontSize: 10,
            color: 'var(--bl-text-subtle)',
            marginTop: 4,
          }}
        >
          {meta}
        </div>
      )}
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '3px 8px',
        background: active ? 'var(--bl-accent)' : 'transparent',
        color: active ? 'var(--bl-text-on-accent)' : 'var(--bl-text-muted)',
        border: '1px solid var(--bl-border)',
        borderRadius: 'var(--bl-radius-pill)',
        fontFamily: 'var(--bl-font-mono)',
        fontSize: 10,
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      {children}
    </button>
  )
}

function summarizeMetadata(metadata: Record<string, unknown>): string {
  const entries = Object.entries(metadata).slice(0, 3)
  if (entries.length === 0) return ''
  return entries
    .map(([k, v]) => `${k}=${typeof v === 'string' ? v.slice(0, 40) : JSON.stringify(v).slice(0, 40)}`)
    .join(' · ')
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--bl-bg)',
  color: 'var(--bl-text)',
  fontFamily: 'var(--bl-font-body)',
  padding: 'clamp(16px, 1rem + 1vw, 28px)',
  maxWidth: 1400,
  margin: '0 auto',
}

const spinKeyframes = `
@keyframes ops-spin { to { transform: rotate(360deg); } }
.ops-spin { animation: ops-spin 0.9s linear infinite; }
@keyframes ops-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
`
