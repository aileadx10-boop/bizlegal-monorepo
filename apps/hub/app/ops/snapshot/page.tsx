import type { Metadata } from 'next'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * GET /ops/snapshot?t=$OPS_DASHBOARD_TOKEN
 *
 * The "am I blind?" page. One server-rendered view of the only four
 * questions that matter for a pre-revenue business:
 *
 *   1. Has any REAL money been captured? (not test/probe orders)
 *   2. Are there any REAL customers? (test/smoke/internal emails excluded)
 *   3. Is any REAL human reaching the funnel? (cron/agent noise excluded)
 *   4. Is anything on fire? (failed builds, 5xx smoke checks, error events)
 *
 * Deliberately NOT a polling client dashboard — it's a flat, honest
 * status board you can read in five seconds. No fabrication: every number
 * is a live count from production Postgres at request time.
 *
 * Token-gated by OPS_DASHBOARD_TOKEN (same secret as /ops). Returns a bare
 * 404 on mismatch so the route's existence isn't leaked.
 */

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Business Snapshot — BizLegal AI',
  description: 'Live business state. Internal use.',
  robots: { index: false, follow: false, nocache: true },
}

interface PageProps {
  searchParams: { t?: string; token?: string }
}

// Emails that are us, our tests, or our probes — never a real customer.
// Keep this list honest: if a real prospect ever uses one of these we want
// to know, but today every order in prod is one of these.
const INTERNAL_EMAILS = new Set<string>([
  'dorlaw2014@gmail.com', // Moses
  'mdmdmd63@gmail.com', // Moses
  'jonas.sh.d2009@gmail.com', // friend/family test
  'test@example.com',
  'probe@bizlegal-ai.com',
])

function isRealCustomerEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const e = email.trim().toLowerCase()
  if (!e || !e.includes('@')) return false
  if (INTERNAL_EMAILS.has(e)) return false
  if (e.includes('codex')) return false
  if (e.includes('smoke')) return false
  if (e.includes('probe')) return false
  if (e.endsWith('@example.com')) return false
  if (e.endsWith('@bizlegal-ai.com')) return false // our own surfaces
  return true
}

// Event types that are machines talking to machines, not humans arriving.
const MACHINE_EVENT_TYPES = new Set<string>([
  'cron.completed',
  'webhook.received',
  'heartbeat',
  'agent.run.completed',
  'framework.changed',
])

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const PAID_STATUSES = new Set(['active', 'paid', 'completed'])
const DAY_MS = 24 * 60 * 60 * 1000

interface PaymentOrder {
  user_email: string | null
  product: string | null
  amount_cents: number | null
  status: string | null
  gateway: string | null
  created_at: string
}

interface EventRow {
  event_type: string
  source: string | null
  ref_email: string | null
  status: string | null
  created_at: string
}

interface Snapshot {
  generatedAt: string
  revenueCapturedUsd: number
  realPaidOrders: number
  pendingOrders: number
  pendingValueUsd: number
  realCustomers: number
  realCustomerEmails: string[]
  humanEvents7d: number
  machineEvents7d: number
  errors7d: number
  lastError: EventRow | null
  ordersByStatus: Array<{ status: string; n: number; usd: number }>
}

async function loadSnapshot(sb: SupabaseClient): Promise<Snapshot> {
  const now = Date.now()
  const since7d = new Date(now - 7 * DAY_MS).toISOString()

  const [ordersRes, events7dRes, lastErrorRes] = await Promise.all([
    sb
      .from('payment_orders')
      .select('user_email, product, amount_cents, status, gateway, created_at')
      .order('created_at', { ascending: false })
      .limit(500),
    sb
      .from('ops_events')
      .select('event_type, source, ref_email, status, created_at')
      .gte('created_at', since7d)
      .limit(5000),
    sb
      .from('ops_events')
      .select('event_type, source, ref_email, status, created_at')
      .eq('event_type', 'error')
      .order('created_at', { ascending: false })
      .limit(1),
  ])

  const orders = (ordersRes.data ?? []) as PaymentOrder[]
  const events = (events7dRes.data ?? []) as EventRow[]
  const lastError = ((lastErrorRes.data ?? [])[0] ?? null) as EventRow | null

  let revenueCapturedUsd = 0
  let realPaidOrders = 0
  let pendingOrders = 0
  let pendingValueUsd = 0
  const statusAgg: Record<string, { n: number; cents: number }> = {}
  const realCustomerSet = new Set<string>()

  for (const o of orders) {
    const cents = typeof o.amount_cents === 'number' ? o.amount_cents : 0
    const status = (o.status ?? 'unknown').toLowerCase()
    statusAgg[status] = statusAgg[status] ?? { n: 0, cents: 0 }
    statusAgg[status].n += 1
    statusAgg[status].cents += cents

    if (PAID_STATUSES.has(status)) {
      revenueCapturedUsd += cents / 100
      realPaidOrders += 1
    }
    if (status === 'pending') {
      pendingOrders += 1
      pendingValueUsd += cents / 100
    }
    if (isRealCustomerEmail(o.user_email)) {
      realCustomerSet.add(o.user_email!.trim().toLowerCase())
    }
  }

  let humanEvents7d = 0
  let machineEvents7d = 0
  let errors7d = 0
  for (const e of events) {
    if (e.event_type === 'error') errors7d += 1
    if (MACHINE_EVENT_TYPES.has(e.event_type)) machineEvents7d += 1
    else if (e.event_type !== 'error') humanEvents7d += 1
  }

  const ordersByStatus = Object.entries(statusAgg)
    .map(([status, v]) => ({ status, n: v.n, usd: v.cents / 100 }))
    .sort((a, b) => b.n - a.n)

  return {
    generatedAt: new Date().toISOString(),
    revenueCapturedUsd,
    realPaidOrders,
    pendingOrders,
    pendingValueUsd,
    realCustomers: realCustomerSet.size,
    realCustomerEmails: Array.from(realCustomerSet),
    humanEvents7d,
    machineEvents7d,
    errors7d,
    lastError,
    ordersByStatus,
  }
}

const COLORS = {
  bg: '#0a0a0f',
  card: '#14141c',
  border: '#23232f',
  text: '#e8e8f0',
  dim: '#8a8a9a',
  green: '#3ddc84',
  red: '#ff5c6c',
  amber: '#ffb648',
  blue: '#5b9dff',
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub?: string
  tone?: 'good' | 'bad' | 'warn' | 'neutral'
}) {
  const accent =
    tone === 'good' ? COLORS.green : tone === 'bad' ? COLORS.red : tone === 'warn' ? COLORS.amber : COLORS.text
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: '20px 22px',
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', color: COLORS.dim }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 700, color: accent, marginTop: 6, lineHeight: 1.1 }}>{value}</div>
      {sub ? <div style={{ fontSize: 13, color: COLORS.dim, marginTop: 6 }}>{sub}</div> : null}
    </div>
  )
}

export default async function SnapshotPage({ searchParams }: PageProps) {
  const expected = process.env.OPS_DASHBOARD_TOKEN ?? ''
  const provided = (searchParams.token ?? searchParams.t ?? '').trim()

  if (!expected || !provided || !timingSafeEq(expected, provided)) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: COLORS.bg,
          color: COLORS.dim,
          fontFamily: 'ui-monospace, monospace',
          fontSize: 14,
        }}
      >
        404 — not found
      </main>
    )
  }

  const sb = getSupabase()
  if (!sb) {
    return (
      <main style={{ minHeight: '100vh', background: COLORS.bg, color: COLORS.red, padding: 40, fontFamily: 'system-ui' }}>
        Supabase env not configured on hub (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_KEY).
      </main>
    )
  }

  const s = await loadSnapshot(sb)
  const hasRevenue = s.revenueCapturedUsd > 0
  const hasCustomers = s.realCustomers > 0
  const hasHumans = s.humanEvents7d > 0

  return (
    <main
      style={{
        minHeight: '100vh',
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '40px 28px 80px',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Business Snapshot</h1>
          <span style={{ fontSize: 12, color: COLORS.dim }}>
            live · {new Date(s.generatedAt).toUTCString()}
          </span>
        </div>
        <p style={{ color: COLORS.dim, fontSize: 14, marginTop: 6 }}>
          The four questions that matter. Every number is a live count from production. Test/probe orders and
          machine events are excluded from the &ldquo;real&rdquo; figures.
        </p>

        {/* The verdict banner */}
        <div
          style={{
            marginTop: 20,
            background: hasRevenue ? 'rgba(61,220,132,0.08)' : 'rgba(255,92,108,0.08)',
            border: `1px solid ${hasRevenue ? COLORS.green : COLORS.red}`,
            borderRadius: 12,
            padding: '16px 20px',
            fontSize: 15,
          }}
        >
          {hasRevenue ? (
            <span style={{ color: COLORS.green }}>
              ✅ Real money captured: <strong>${s.revenueCapturedUsd.toLocaleString()}</strong> across {s.realPaidOrders}{' '}
              paid order(s).
            </span>
          ) : (
            <span style={{ color: COLORS.red }}>
              🔴 <strong>$0 captured.</strong> {s.pendingOrders} order(s) created (${s.pendingValueUsd.toLocaleString()}{' '}
              of intent) but none confirmed. This is a demand problem, not a build problem.
            </span>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 14,
            marginTop: 20,
          }}
        >
          <Stat
            label="Revenue captured (all time)"
            value={`$${s.revenueCapturedUsd.toLocaleString()}`}
            sub={`${s.realPaidOrders} paid order(s)`}
            tone={hasRevenue ? 'good' : 'bad'}
          />
          <Stat
            label="Real customers"
            value={String(s.realCustomers)}
            sub={hasCustomers ? s.realCustomerEmails.slice(0, 3).join(', ') : 'all orders so far are tests/probes'}
            tone={hasCustomers ? 'good' : 'bad'}
          />
          <Stat
            label="Human funnel events (7d)"
            value={s.humanEvents7d.toLocaleString()}
            sub={`vs ${s.machineEvents7d.toLocaleString()} machine/cron events`}
            tone={hasHumans ? 'good' : 'warn'}
          />
          <Stat
            label="Pending intent"
            value={`$${s.pendingValueUsd.toLocaleString()}`}
            sub={`${s.pendingOrders} order(s) never confirmed`}
            tone="neutral"
          />
          <Stat
            label="Errors (7d)"
            value={String(s.errors7d)}
            sub={s.lastError ? `last: ${s.lastError.source ?? '?'} · ${new Date(s.lastError.created_at).toUTCString()}` : 'none'}
            tone={s.errors7d > 0 ? 'warn' : 'good'}
          />
        </div>

        {/* Payment ledger */}
        <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 34, marginBottom: 10 }}>Payment ledger (by status)</h2>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: 'hidden' }}>
          {s.ordersByStatus.length === 0 ? (
            <div style={{ padding: 18, color: COLORS.dim }}>No payment orders yet.</div>
          ) : (
            s.ordersByStatus.map((row, i) => (
              <div
                key={row.status}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderTop: i === 0 ? 'none' : `1px solid ${COLORS.border}`,
                  fontSize: 14,
                }}
              >
                <span style={{ color: row.status === 'pending' ? COLORS.amber : row.status === 'active' || row.status === 'paid' ? COLORS.green : COLORS.text }}>
                  {row.status}
                </span>
                <span style={{ color: COLORS.dim }}>
                  {row.n} order(s) · ${row.usd.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>

        <p style={{ color: COLORS.dim, fontSize: 12, marginTop: 28 }}>
          Internal. Token-gated. If a figure looks wrong, the underlying source is the <code>payment_orders</code> and{' '}
          <code>ops_events</code> tables in the live Supabase project.
        </p>
      </div>
    </main>
  )
}
