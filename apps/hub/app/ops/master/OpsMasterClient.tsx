'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Bell,
  Bot,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  RefreshCw,
  Server,
  Shield,
  ShoppingCart,
  Terminal,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Component registry — static truth about every piece of the fleet  */
/* ------------------------------------------------------------------ */

const SUBDOMAINS = [
  { name: 'hub',       url: 'https://bizlegal-ai.com',           role: 'Brain — ops, crons, agents, checkout' },
  { name: 'brai',      url: 'https://brai.bizlegal-ai.com',      role: 'Regulatory risk reports $149-1,999' },
  { name: 'tracr',     url: 'https://tracr.bizlegal-ai.com',     role: 'Wallet forensics $29-799' },
  { name: 'lexaudit',  url: 'https://lexaudit.bizlegal-ai.com',  role: 'Compliance monitor $49-599/mo' },
  { name: 'docai',     url: 'https://docai.bizlegal-ai.com',     role: 'SQA + DPA $29-199/mo' },
  { name: 'forge',     url: 'https://forge.bizlegal-ai.com',     role: 'BOI kit $149, Passport $297' },
  { name: 'leadforge', url: 'https://leadforge.bizlegal-ai.com', role: 'Lead gen surface (no paid products)' },
  { name: 'blog',      url: 'https://blog.bizlegal-ai.com',      role: 'Content marketing (CF Pages)' },
] as const

const GATEWAYS = [
  { id: 'nowpayments', label: 'NOWPayments', type: 'Crypto', status: 'live' as const, env: 'NOWPAYMENTS_API_KEY', note: 'BTC/ETH/USDT — LIVE' },
  { id: 'paypal',      label: 'PayPal',      type: 'Card',   status: 'live' as const, env: 'PAYPAL_CLIENT_ID',  note: 'Sandbox (test cards land in sandbox)' },
  { id: 'wire_usd',    label: 'Wire USD',     type: 'Wire',   status: 'live' as const, env: 'BANK_USD_ACCOUNT_NUMBER', note: 'Citibank SWIFT/ACH ≥$500' },
  { id: 'wire_eur',    label: 'Wire EUR',     type: 'Wire',   status: 'live' as const, env: 'BANK_EUR_IBAN',    note: 'Banking Circle SEPA ≥$500' },
  { id: 'paddle',      label: 'Paddle',       type: 'Card',   status: 'stub' as const, env: 'PADDLE_API_KEY',   note: '503 stub — pending approval' },
  { id: 'lemonsqueezy',label: 'LemonSqueezy', type: 'Card',   status: 'stub' as const, env: 'LEMONSQUEEZY_API_KEY', note: '503 stub — pending approval' },
] as const

const SERVICES = [
  { id: 'oci',     label: 'OCI Deal Router',    type: 'FastAPI', host: 'Oracle Cloud il-jerusalem-1',            url: 'https://router.bizlegal-ai.com/health', role: 'Real-estate lead routing to partners' },
  { id: 'hetzner', label: 'Hetzner Curator',    type: 'Python',  host: 'Hetzner CX32 (204.168.209.235)',           url: null,                                        role: 'Scout → Brain → Publisher pipeline' },
  { id: 'worker',  label: 'CF Lead Intake',     type: 'Worker',  host: 'Cloudflare Workers',                       url: 'https://bizlegal-lead-intake.bizlegal-ai.workers.dev/health', role: 'Landing form → classify → route → nurture' },
  { id: 'funnel',  label: 'Funnel MVP',         type: 'Fastify', host: 'Not deployed',                             url: null,                                        role: '$97 contract risk report (not deployed)' },
  { id: 'blog-cf', label: 'Blog CF Pages',     type: 'Pages',   host: 'Cloudflare Pages',                         url: 'https://blog.bizlegal-ai.com',             role: 'Content site (not in monorepo)' },
] as const

const BOTS = [
  { id: 'ops-bot',      label: '@Bizlegalbot',       platform: 'Telegram', status: 'live' as const, role: 'Ops alerts from hub cron (ops-alerts every 15min)' },
  { id: 'forge-bot',    label: '@BIZLEGALFORGEBOT',  platform: 'Telegram', status: 'live' as const, role: 'Curator pipeline — pick/deploy/regen/reject gates' },
  { id: 'hub-bot',      label: '@BizlegalHubBot',    platform: 'Telegram', status: 'pending' as const, role: 'Customer FAQ bot (Z4.2 — needs webhook registration)' },
] as const

const CRONS = [
  { id: 'smoke',          label: 'Smoke test',          schedule: '09:00 UTC daily',      env: 'CRON_SECRET' },
  { id: 'ops-alerts',     label: 'Ops alerts',          schedule: 'Every 15 min',         env: 'CRON_SECRET' },
  { id: 'billing',        label: 'Charge due',          schedule: '07:00 UTC daily',      env: 'CRON_SECRET' },
  { id: 'boi-check',      label: 'BOI check',           schedule: '14:00 UTC daily',      env: 'CRON_SECRET' },
  { id: 'policy-refresh', label: 'Policy refresh',      schedule: '12:00 UTC daily',      env: 'CRON_SECRET' },
  { id: 'ai-act-monitor', label: 'AI Act monitor',      schedule: '11:00 UTC daily',      env: 'CRON_SECRET' },
] as const

/* ------------------------------------------------------------------ */
/*  Types                                                            */
/* ------------------------------------------------------------------ */

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

interface FeedResponse {
  generated_at: string
  summary: {
    events_24h: number
    confirmed_revenue_cents_24h: number
    active_subs_total: number
  }
  events: OpsEvent[]
}

interface ProbeResult {
  name: string
  url: string
  ok: boolean
  status: number | null
  duration_ms: number
  error?: string
}

interface HmacSelfTest {
  attempted: boolean
  ok: boolean
  status: number | null
  reason?: string
  error?: string
}

interface EnvRow {
  name: string
  set: boolean
  critical: boolean
  reason: string
}

interface HealthResponse {
  generated_at: string
  probes: ProbeResult[]
  hmac: HmacSelfTest
  envs: EnvRow[]
  summary: {
    subdomains_total: number
    subdomains_reachable: number
    chain_healthy: boolean
    critical_missing: string[]
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                          */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Main component                                                   */
/* ------------------------------------------------------------------ */

export function OpsMasterClient({ token }: { token: string }) {
  const [feed, setFeed] = useState<FeedResponse | null>(null)
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState(0)
  const [tick, setTick] = useState(0)

  const fetchAll = useCallback(async () => {
    try {
      setError(null)
      const [feedRes, healthRes] = await Promise.all([
        fetch(`/api/ops/feed?token=${encodeURIComponent(token)}`, { cache: 'no-store' }),
        fetch(`/api/ops/health?token=${encodeURIComponent(token)}`, { cache: 'no-store' }),
      ])
      if (!feedRes.ok) { setError(`feed: HTTP ${feedRes.status}`); return }
      if (!healthRes.ok) { setError(`health: HTTP ${healthRes.status}`); return }
      setFeed(await feedRes.json() as FeedResponse)
      setHealth(await healthRes.json() as HealthResponse)
      setLastFetched(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'network error')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { void fetchAll() }, [fetchAll])
  useEffect(() => {
    const id = setInterval(() => void fetchAll(), 30_000)
    return () => clearInterval(id)
  }, [fetchAll])
  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  /* Derive cron last-run times from ops events */
  const cronLastRun = useMemo(() => {
    if (!feed) return new Map<string, string>()
    const map = new Map<string, string>()
    const cronPatterns: Record<string, string> = {
      'smoke': 'cron.fired',
      'ops-alerts': 'cron.completed',
      'billing': 'cron.completed',
      'boi-check': 'cron.completed',
      'policy-refresh': 'cron.completed',
      'ai-act-monitor': 'cron.completed',
    }
    for (const cronId of Object.keys(cronPatterns)) {
      const match = feed.events.find(e => e.ref_id === `cron/${cronId}` || e.metadata?.cron === cronId)
      if (match) map.set(cronId, match.created_at)
    }
    /* fallback: look for any cron events */
    for (const cronId of Object.keys(cronPatterns)) {
      if (map.has(cronId)) continue
      const match = feed.events.find(e => e.event_type.startsWith('cron.'))
      if (match) map.set(cronId, match.created_at)
    }
    return map
  }, [feed])

  /* Last gateway activity from events */
  const gatewayActivity = useMemo(() => {
    if (!feed) return new Map<string, string>()
    const map = new Map<string, string>()
    for (const gw of GATEWAYS) {
      const match = feed.events.find(e =>
        e.event_type === 'payment.confirmed' &&
        (e.source === gw.id || e.metadata?.gateway === gw.id)
      )
      if (match) map.set(gw.id, match.created_at)
    }
    /* also check intents */
    for (const gw of ['nowpayments', 'paypal'] as const) {
      if (map.has(gw)) continue
      const match = feed.events.find(e =>
        e.event_type === 'payment.intent' && e.source === gw
      )
      if (match) map.set(gw, match.created_at)
    }
    return map
  }, [feed])

  /* Env check for gateways */
  const gatewayEnvs = useMemo(() => {
    if (!health) return new Map<string, boolean>()
    const map = new Map<string, boolean>()
    for (const gw of GATEWAYS) {
      const env = health.envs.find(e => e.name === gw.env)
      map.set(gw.id, env?.set ?? false)
    }
    return map
  }, [health])

  if (loading && !feed) {
    return (
      <main style={pageStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--bl-text-muted)' }}>
          <Loader2 size={16} className="ops-spin" /> Loading ecosystem status…
        </div>
        <style>{spinKeyframes}</style>
      </main>
    )
  }

  return (
    <main style={pageStyle}>
      {/* ── Header ── */}
      <header style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{
              fontFamily: 'var(--bl-font-mono)', fontSize: 11, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--bl-accent)', marginBottom: 6,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                background: health?.summary.chain_healthy ? 'var(--bl-success)' : 'var(--bl-warning)',
                animation: 'ops-pulse 2s ease-in-out infinite',
              }} />
              Ecosystem Master · BizLegal AI
            </div>
            <h1 style={{
              fontFamily: 'var(--bl-font-display)', fontSize: 'clamp(1.5rem, 1.25rem + 1vw, 2rem)',
              fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--bl-text)', margin: 0,
            }}>
              Every component. Every service. Every move.
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => void fetchAll()} style={{
              padding: '8px 14px', background: 'var(--bl-surface)',
              border: '1px solid var(--bl-border)', borderRadius: 'var(--bl-radius-pill)',
              color: 'var(--bl-text)', fontSize: 12, fontFamily: 'var(--bl-font-mono)',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <RefreshCw size={12} /> Refresh all
            </button>
            <span style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 10, color: 'var(--bl-text-subtle)' }} key={tick}>
              {lastFetched > 0 ? `${Math.max(0, Math.floor((Date.now() - lastFetched) / 1000))}s ago` : ''}
            </span>
            <a href={`/ops?t=${encodeURIComponent(token)}`} style={{
              fontFamily: 'var(--bl-font-mono)', fontSize: 11, color: 'var(--bl-accent)',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              Event tape <ExternalLink size={10} />
            </a>
            <a href={`/ops/health?t=${encodeURIComponent(token)}`} style={{
              fontFamily: 'var(--bl-font-mono)', fontSize: 11, color: 'var(--bl-accent)',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              Health <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </header>

      {/* ── Quick stats row ── */}
      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 28,
      }}>
        <StatCard icon={<DollarSign size={14} />} label="Revenue 24h"
          value={formatUsd(feed?.summary.confirmed_revenue_cents_24h ?? 0)}
          color={feed?.summary.confirmed_revenue_cents_24h ? 'var(--bl-success)' : 'var(--bl-text-subtle)'} />
        <StatCard icon={<CreditCard size={14} />} label="Active subs"
          value={String(feed?.summary.active_subs_total ?? 0)} />
        <StatCard icon={<Activity size={14} />} label="Events 24h"
          value={String(feed?.summary.events_24h ?? 0)} />
        <StatCard icon={<Globe size={14} />} label="Subdomains up"
          value={`${health?.summary.subdomains_reachable ?? '?'}/${health?.summary.subdomains_total ?? '?'}`}
          color={health && health.summary.subdomains_reachable === health.summary.subdomains_total ? 'var(--bl-success)' : 'var(--bl-warning)'} />
        <StatCard icon={<CheckCircle size={14} />} label="Chain health"
          value={health?.summary.chain_healthy ? 'GREEN' : health ? 'DEGRADED' : '?'}
          color={health?.summary.chain_healthy ? 'var(--bl-success)' : 'var(--bl-danger)'} />
        <StatCard icon={<AlertTriangle size={14} />} label="Critical gaps"
          value={String(health?.summary.critical_missing.length ?? 0)}
          color={(health?.summary.critical_missing.length ?? 0) > 0 ? 'var(--bl-danger)' : 'var(--bl-text-subtle)'} />
      </section>

      {/* ── Column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 18 }}>
        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Subdomains */}
          <Card title="Subdomains" icon={<Globe size={14} />}>
            <div style={{ display: 'grid', gap: 6 }}>
              {SUBDOMAINS.map(sd => {
                const probe = health?.probes.find(p => p.name === sd.name)
                const ok = probe?.ok ?? false
                return (
                  <div key={sd.name} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 'var(--bl-radius-md)',
                    background: ok ? 'color-mix(in oklab, var(--bl-success) 5%, transparent)' : 'color-mix(in oklab, var(--bl-text) 3%, transparent)',
                    border: `1px solid ${ok ? 'color-mix(in oklab, var(--bl-success) 20%, transparent)' : 'var(--bl-divider)'}`,
                  }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                      background: ok ? 'var(--bl-success)' : 'var(--bl-danger)',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--bl-text)' }}>
                        {sd.name}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--bl-text-muted)', marginTop: 1 }}>{sd.role}</div>
                    </div>
                    <a href={sd.url} target="_blank" rel="noopener noreferrer" style={{
                      fontFamily: 'var(--bl-font-mono)', fontSize: 10, color: 'var(--bl-accent)',
                      textDecoration: 'none', flexShrink: 0,
                    }}>
                      {probe ? `${probe.status} · ${probe.duration_ms}ms` : 'no probe'} ↗
                    </a>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Services */}
          <Card title="Services" icon={<Server size={14} />}>
            <div style={{ display: 'grid', gap: 6 }}>
              {SERVICES.map(svc => {
                const reachable = svc.url
                  ? health?.probes.find(p => p.url === svc.url)?.ok ?? false
                  : null
                const isDeployed = svc.id !== 'funnel'
                return (
                  <div key={svc.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 'var(--bl-radius-md)',
                    background: isDeployed ? 'color-mix(in oklab, var(--bl-success) 5%, transparent)' : 'color-mix(in oklab, var(--bl-warning) 6%, transparent)',
                    border: `1px solid ${isDeployed ? 'color-mix(in oklab, var(--bl-success) 20%, transparent)' : 'color-mix(in oklab, var(--bl-warning) 25%, transparent)'}`,
                    opacity: isDeployed ? 1 : 0.7,
                  }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                      background: reachable === false ? 'var(--bl-danger)' : isDeployed ? 'var(--bl-success)' : 'var(--bl-warning)',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--bl-text)' }}>
                        {svc.label}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--bl-text-muted)', marginTop: 1 }}>
                        {svc.host} · {svc.type}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--bl-text-subtle)', marginTop: 1 }}>{svc.role}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Bots */}
          <Card title="Telegram Bots" icon={<Bot size={14} />}>
            <div style={{ display: 'grid', gap: 6 }}>
              {BOTS.map(bot => (
                <div key={bot.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 'var(--bl-radius-md)',
                  background: bot.status === 'live' ? 'color-mix(in oklab, var(--bl-success) 5%, transparent)' : 'color-mix(in oklab, var(--bl-warning) 6%, transparent)',
                  border: `1px solid ${bot.status === 'live' ? 'color-mix(in oklab, var(--bl-success) 20%, transparent)' : 'color-mix(in oklab, var(--bl-warning) 25%, transparent)'}`,
                }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: bot.status === 'live' ? 'var(--bl-success)' : 'var(--bl-warning)',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--bl-text)' }}>
                      {bot.label}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--bl-text-muted)', marginTop: 1 }}>
                      {bot.platform} · <span style={{ color: bot.status === 'live' ? 'var(--bl-success)' : 'var(--bl-warning)' }}>
                        {bot.status === 'live' ? 'LIVE' : 'PENDING'}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--bl-text-subtle)', marginTop: 1 }}>{bot.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Gateways */}
          <Card title="Payment Gateways" icon={<CreditCard size={14} />}>
            <div style={{ display: 'grid', gap: 6 }}>
              {GATEWAYS.map(gw => {
                const envSet = gatewayEnvs.get(gw.id)
                const last = gatewayActivity.get(gw.id)
                return (
                  <div key={gw.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 'var(--bl-radius-md)',
                    background: gw.status === 'live' ? 'color-mix(in oklab, var(--bl-success) 5%, transparent)' : 'color-mix(in oklab, var(--bl-text) 3%, transparent)',
                    border: `1px solid ${gw.status === 'live' ? 'color-mix(in oklab, var(--bl-success) 20%, transparent)' : 'var(--bl-divider)'}`,
                    opacity: gw.status === 'live' ? 1 : 0.6,
                  }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                      background: gw.status === 'live' ? 'var(--bl-success)' : 'var(--bl-text-subtle)',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--bl-text)' }}>
                        {gw.label}
                        <span style={{
                          marginLeft: 6, fontSize: 9, padding: '1px 5px', borderRadius: 3,
                          background: gw.status === 'live' ? 'color-mix(in oklab, var(--bl-success) 15%, transparent)' : 'color-mix(in oklab, var(--bl-text) 8%, transparent)',
                          color: gw.status === 'live' ? 'var(--bl-success)' : 'var(--bl-text-muted)',
                          fontFamily: 'var(--bl-font-mono)', letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}>
                          {gw.status === 'live' ? 'LIVE' : 'STUB'}
                        </span>
                        <span style={{
                          marginLeft: 4, fontSize: 9, padding: '1px 5px', borderRadius: 3,
                          background: envSet ? 'color-mix(in oklab, var(--bl-success) 12%, transparent)' : 'color-mix(in oklab, var(--bl-danger) 10%, transparent)',
                          color: envSet ? 'var(--bl-success)' : 'var(--bl-danger)',
                          fontFamily: 'var(--bl-font-mono)',
                        }}>
                          {gw.env}
                        </span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--bl-text-muted)', marginTop: 1 }}>
                        {gw.type} · {gw.note}
                      </div>
                      {last && (
                        <div style={{ fontSize: 10, color: 'var(--bl-text-subtle)', fontFamily: 'var(--bl-font-mono)' }}>
                          Last activity: {formatRelative(last)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Cron jobs */}
          <Card title="Cron Jobs" icon={<Clock size={14} />}>
            <div style={{ display: 'grid', gap: 6 }}>
              {CRONS.map(cron => {
                const lastRun = cronLastRun.get(cron.id)
                return (
                  <div key={cron.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 'var(--bl-radius-md)',
                    background: lastRun ? 'color-mix(in oklab, var(--bl-success) 5%, transparent)' : 'color-mix(in oklab, var(--bl-text) 3%, transparent)',
                    border: `1px solid ${lastRun ? 'color-mix(in oklab, var(--bl-success) 20%, transparent)' : 'var(--bl-divider)'}`,
                  }}>
                    <Zap size={14} style={{ color: lastRun ? 'var(--bl-success)' : 'var(--bl-text-subtle)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--bl-text)' }}>
                        {cron.label}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--bl-text-muted)', marginTop: 1 }}>
                        {cron.schedule} · {cron.env}
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 10, color: lastRun ? 'var(--bl-text-subtle)' : 'var(--bl-text-subtle)' }}>
                      {lastRun ? formatRelative(lastRun) : 'no event'}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* HMAC Chain */}
          <Card title="HMAC Chain" icon={<Shield size={14} />}>
            <div style={{
              padding: 12,
              background: health?.hmac.ok
                ? 'color-mix(in oklab, var(--bl-success) 8%, transparent)'
                : 'color-mix(in oklab, var(--bl-warning) 8%, transparent)',
              border: `1px solid ${health?.hmac.ok ? 'color-mix(in oklab, var(--bl-success) 30%, transparent)' : 'color-mix(in oklab, var(--bl-warning) 30%, transparent)'}`,
              borderRadius: 'var(--bl-radius-md)',
              fontFamily: 'var(--bl-font-mono)', fontSize: 11,
            }}>
              <div style={{ fontWeight: 700, color: health?.hmac.ok ? 'var(--bl-success)' : 'var(--bl-warning)' }}>
                {health?.hmac.attempted ? (health.hmac.ok ? '✓ Self-loop OK' : '⚠ Chain broken') : '⚠ Secret unset'}
              </div>
              <div style={{ marginTop: 4, color: 'var(--bl-text-muted)' }}>
                {health?.hmac.reason ?? health?.hmac.error ?? 'No detail'}
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{
                fontFamily: 'var(--bl-font-mono)', fontSize: 10, color: 'var(--bl-text-subtle)',
                display: 'flex', justifyContent: 'space-between', padding: '4px 0',
              }}>
                <span>BIZLEGAL_INBOUND_SECRET</span>
                <span style={{ color: health?.envs.find(e => e.name === 'BIZLEGAL_INBOUND_SECRET')?.set ? 'var(--bl-success)' : 'var(--bl-danger)' }}>
                  {health?.envs.find(e => e.name === 'BIZLEGAL_INBOUND_SECRET')?.set ? '✓ set' : '✗ missing'}
                </span>
              </div>
              <div style={{
                fontFamily: 'var(--bl-font-mono)', fontSize: 10, color: 'var(--bl-text-subtle)',
                display: 'flex', justifyContent: 'space-between', padding: '4px 0',
              }}>
                <span>OPS_DASHBOARD_TOKEN</span>
                <span style={{ color: health?.envs.find(e => e.name === 'OPS_DASHBOARD_TOKEN')?.set ? 'var(--bl-success)' : 'var(--bl-danger)' }}>
                  {health?.envs.find(e => e.name === 'OPS_DASHBOARD_TOKEN')?.set ? '✓ set' : '✗ missing'}
                </span>
              </div>
              <div style={{
                fontFamily: 'var(--bl-font-mono)', fontSize: 10, color: 'var(--bl-text-subtle)',
                display: 'flex', justifyContent: 'space-between', padding: '4px 0',
              }}>
                <span>CRON_SECRET</span>
                <span style={{ color: health?.envs.find(e => e.name === 'CRON_SECRET')?.set ? 'var(--bl-success)' : 'var(--bl-danger)' }}>
                  {health?.envs.find(e => e.name === 'CRON_SECRET')?.set ? '✓ set' : '✗ missing'}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick actions */}
          <Card title="Quick Actions" icon={<Terminal size={14} />}>
            <div style={{ display: 'grid', gap: 6 }}>
              <QuickAction href={`/ops/main?t=${encodeURIComponent(token)}`} label="Main ops" desc="Hub-only events + crons + payments" />
              <QuickAction href={`/ops/subdomains?t=${encodeURIComponent(token)}`} label="Subdomains ops" desc="7 product subs + blog" />
              <QuickAction href={`/ops/oci?t=${encodeURIComponent(token)}`} label="OCI ops" desc="Deal-router + referral pipeline" />
              <QuickAction href={`/ops/hetzner?t=${encodeURIComponent(token)}`} label="Hetzner ops" desc="Curator pipeline + content engine" />
              <QuickAction href={`/ops?t=${encodeURIComponent(token)}`} label="Event tape" desc="Live ops events, filters" />
              <QuickAction href={`/ops/health?t=${encodeURIComponent(token)}`} label="Health audit" desc="Subdomain probes, env matrix" />
              <QuickAction href={`https://bizlegal-ai.com/checkout?product=hub&tier=pro&interval=monthly&amount=14900&name=BizLegal%20Hub%20Pro`} label="Hub Pro checkout" desc="Send to a prospect" />
              <QuickAction href={`/api/ops/feed?token=${encodeURIComponent(token)}`} label="Feed API (JSON)" desc="Raw feed data" />
              <QuickAction href={`/api/ops/health?token=${encodeURIComponent(token)}`} label="Health API (JSON)" desc="Raw health data" />
            </div>
          </Card>

          {/* Revenue-ready products */}
          <Card title="Revenue — Ready to Sell Now" icon={<ShoppingCart size={14} />}>
            <div style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 10, color: 'var(--bl-text-subtle)', marginBottom: 8 }}>
              Wire (≥$500) + Crypto (any) take real money TODAY.
            </div>
            <div style={{ display: 'grid', gap: 4 }}>
              {[
                { product: 'Forge BOI Kit', price: '$149', url: `https://bizlegal-ai.com/checkout?product=forge&tier=boi-kit&interval=one-time&amount=14900&name=Forge%20BOI%20Kit` },
                { product: 'Hub Pro', price: '$149/mo', url: `https://bizlegal-ai.com/checkout?product=hub&tier=pro&interval=monthly&amount=14900&name=BizLegal%20Hub%20Pro` },
                { product: 'LexAudit Monitor', price: '$99/mo', url: `https://bizlegal-ai.com/checkout?product=lexaudit&tier=monitor&interval=monthly&amount=9900&name=LexAudit%20Monitor` },
                // BRAI removed 2026-09-02 — stop-sold (no fulfillment code); slug fails closed in price-map
              ].map(item => (
                <a key={item.product} href={item.url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 8px', borderRadius: 'var(--bl-radius-md)',
                  background: 'color-mix(in oklab, var(--bl-accent) 6%, transparent)',
                  border: '1px solid color-mix(in oklab, var(--bl-accent) 15%, transparent)',
                  textDecoration: 'none', fontFamily: 'var(--bl-font-mono)', fontSize: 11,
                }}>
                  <span style={{ color: 'var(--bl-text)' }}>{item.product}</span>
                  <span style={{ color: 'var(--bl-success)', fontWeight: 700 }}>{item.price}</span>
                </a>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          marginTop: 16, padding: 10,
          background: 'rgba(220,38,38,0.08)', color: 'var(--bl-danger)',
          borderRadius: 8, fontSize: 12, fontFamily: 'var(--bl-font-mono)',
        }}>
          Refresh failed: {error} (showing previous data)
        </div>
      )}

      <footer style={{ marginTop: 28, fontFamily: 'var(--bl-font-mono)', fontSize: 10, color: 'var(--bl-text-subtle)' }}>
        Auto-refreshes every 30s · Last generated: {feed?.generated_at ? new Date(feed.generated_at).toLocaleTimeString() : '—'}
      </footer>

      <style>{spinKeyframes}</style>
    </main>
  )
}

/* ── Sub-components ── */

function Card({ title, icon, children }: { title: string; icon: JSX.Element; children: React.ReactNode }) {
  return (
    <section style={{
      background: 'var(--bl-surface)',
      border: '1px solid var(--bl-border)',
      borderRadius: 'var(--bl-radius-lg)',
      padding: 16,
    }}>
      <h3 style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: 'var(--bl-font-display)', fontSize: '0.95rem', fontWeight: 700,
        color: 'var(--bl-text)', margin: '0 0 10px',
      }}>
        {icon}
        {title}
      </h3>
      {children}
    </section>
  )
}

function StatCard({ icon, label, value, color }: { icon: JSX.Element; label: string; value: string; color?: string }) {
  return (
    <div style={{
      background: 'var(--bl-surface)', border: '1px solid var(--bl-border)',
      borderRadius: 'var(--bl-radius-lg)', padding: 12,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: 'var(--bl-font-mono)', fontSize: 10, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'var(--bl-text-muted)', marginBottom: 6,
      }}>
        {icon}{label}
      </div>
      <div style={{
        fontFamily: 'var(--bl-font-display)', fontSize: 'clamp(1.2rem, 0.9rem + 0.8vw, 1.5rem)',
        fontWeight: 700, color: color ?? 'var(--bl-text)', letterSpacing: '-0.02em',
      }}>
        {value}
      </div>
    </div>
  )
}

function QuickAction({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '7px 10px', borderRadius: 'var(--bl-radius-md)',
      background: 'color-mix(in oklab, var(--bl-text) 3%, transparent)',
      border: '1px solid var(--bl-divider)',
      textDecoration: 'none',
    }}>
      <div>
        <div style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--bl-text)' }}>
          {label}
        </div>
        <div style={{ fontSize: 10, color: 'var(--bl-text-subtle)', marginTop: 1 }}>{desc}</div>
      </div>
      <ExternalLink size={11} style={{ color: 'var(--bl-accent)', flexShrink: 0 }} />
    </a>
  )
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
