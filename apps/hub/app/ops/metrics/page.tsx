import type { Metadata } from 'next'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * GET /ops/metrics?t=$OPS_DASHBOARD_TOKEN
 *
 * Marathon master metrics dashboard. Two layers:
 *
 *   1. LIVE revenue section — real reads from `payment_orders` in the hub
 *      Supabase project: captured vs pending (last 30d), per-product and
 *      per-status totals, per-day capture histogram. Empty/error states
 *      degrade gracefully when env or the table is missing.
 *   2. Static platform facts (surfaces, lineup, stack) — kept from the
 *      original investor-facing pass; update the PLATFORM/PRODUCTS consts
 *      manually when milestones land.
 *
 * Token-gated by OPS_DASHBOARD_TOKEN (same secret as /ops, /ops/snapshot,
 * /ops/content). Returns a bare 404 on mismatch so the route's existence
 * isn't leaked.
 */

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'BizLegal AI — Platform Metrics',
  description: 'Live revenue + platform metrics. Access via ops token.',
  robots: { index: false, follow: false, nocache: true },
}

interface PageProps {
  searchParams: { t?: string; token?: string }
}

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

// ---- Live revenue data ------------------------------------------------

const PAID_STATUSES = new Set(['active', 'paid', 'completed'])
const DAY_MS = 24 * 60 * 60 * 1000

interface OrderRow {
  product: string | null
  amount_cents: number | null
  status: string | null
  gateway: string | null
  created_at: string
}

interface RevenueSnapshot {
  generatedAt: string
  error: string | null
  captured30dUsd: number
  captured30dCount: number
  pending30dUsd: number
  pending30dCount: number
  capturedAllTimeUsd: number
  paidAllTimeCount: number
  byProduct30d: Array<{ key: string; n: number; usd: number }>
  byStatus30d: Array<{ key: string; n: number; usd: number }>
  byGateway30d: Array<{ key: string; n: number; usd: number }>
  byDay: Array<{ day: string; usd: number; n: number }>
}

function emptyRevenue(error: string | null): RevenueSnapshot {
  const now = Date.now()
  const byDay: RevenueSnapshot['byDay'] = []
  for (let i = 29; i >= 0; i--) {
    byDay.push({ day: new Date(now - i * DAY_MS).toISOString().slice(0, 10), usd: 0, n: 0 })
  }
  return {
    generatedAt: new Date().toISOString(),
    error,
    captured30dUsd: 0,
    captured30dCount: 0,
    pending30dUsd: 0,
    pending30dCount: 0,
    capturedAllTimeUsd: 0,
    paidAllTimeCount: 0,
    byProduct30d: [],
    byStatus30d: [],
    byGateway30d: [],
    byDay,
  }
}

async function loadRevenue(sb: SupabaseClient): Promise<RevenueSnapshot> {
  const now = Date.now()
  const since30d = new Date(now - 30 * DAY_MS).toISOString()

  const [recentRes, allTimeRes] = await Promise.all([
    sb
      .from('payment_orders')
      .select('product, amount_cents, status, gateway, created_at')
      .gte('created_at', since30d)
      .order('created_at', { ascending: false })
      .limit(5000),
    sb
      .from('payment_orders')
      .select('amount_cents, status')
      .limit(10000),
  ])

  if (recentRes.error) {
    return emptyRevenue(recentRes.error.message)
  }

  const rows = (recentRes.data ?? []) as OrderRow[]
  const allTime = (allTimeRes.data ?? []) as Array<Pick<OrderRow, 'amount_cents' | 'status'>>

  const rev = emptyRevenue(null)

  const dayAgg: Record<string, { usd: number; n: number }> = {}
  for (const d of rev.byDay) dayAgg[d.day] = { usd: 0, n: 0 }

  const productAgg: Record<string, { n: number; usd: number }> = {}
  const statusAgg: Record<string, { n: number; usd: number }> = {}
  const gatewayAgg: Record<string, { n: number; usd: number }> = {}

  const bump = (agg: Record<string, { n: number; usd: number }>, key: string, usd: number) => {
    agg[key] = agg[key] ?? { n: 0, usd: 0 }
    agg[key].n += 1
    agg[key].usd += usd
  }

  for (const o of rows) {
    const cents = typeof o.amount_cents === 'number' ? o.amount_cents : 0
    const usd = cents / 100
    const status = (o.status ?? 'unknown').toLowerCase()
    const isPaid = PAID_STATUSES.has(status)

    bump(statusAgg, status, usd)
    if (isPaid) {
      rev.captured30dUsd += usd
      rev.captured30dCount += 1
      bump(productAgg, o.product ?? 'unknown', usd)
      bump(gatewayAgg, (o.gateway ?? 'unknown').toLowerCase(), usd)
      const day = (o.created_at ?? '').slice(0, 10)
      if (day in dayAgg) {
        dayAgg[day].usd += usd
        dayAgg[day].n += 1
      }
    } else if (status === 'pending') {
      rev.pending30dUsd += usd
      rev.pending30dCount += 1
    }
  }

  for (const o of allTime) {
    const status = (o.status ?? 'unknown').toLowerCase()
    if (PAID_STATUSES.has(status)) {
      rev.capturedAllTimeUsd += (typeof o.amount_cents === 'number' ? o.amount_cents : 0) / 100
      rev.paidAllTimeCount += 1
    }
  }

  const toSorted = (agg: Record<string, { n: number; usd: number }>) =>
    Object.entries(agg)
      .map(([key, v]) => ({ key, n: v.n, usd: v.usd }))
      .sort((a, b) => b.usd - a.usd || b.n - a.n)

  rev.byProduct30d = toSorted(productAgg)
  rev.byStatus30d = toSorted(statusAgg)
  rev.byGateway30d = toSorted(gatewayAgg)
  rev.byDay = rev.byDay.map((d) => ({ day: d.day, usd: dayAgg[d.day].usd, n: dayAgg[d.day].n }))
  return rev
}

const fmtUsd = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// ---- Static platform facts — updated manually when milestones land ----

const PLATFORM = {
  founded: '2026',
  mission: 'Compliance-as-a-service for B2B SaaS, fintech, DAOs, and real-estate cross-border deals',
  founder: 'Moses (practicing commercial attorney)',
  surfaces: 7,
  surfaceList: ['hub (bizlegal-ai.com)', 'DocAI', 'Tracr', 'BRAI', 'LexAudit', 'Forge', 'LeadForge'],
  jurisdictions: 20,
  jurisdictionList: ['EU (MiCA/GDPR/AI Act)', 'US (FinCEN/BOI/OFAC/SEC)', 'UAE/VARA', 'Singapore/MAS', 'UK/FCA', 'Hong Kong', 'Japan/FSA', 'Switzerland/FINMA', 'Canada/CSA', 'Australia/ASIC'],
  agents: 47,
  agentPurpose: 'Regulatory monitoring, content generation, lead qualification, outreach drafting, payment handling',
  contentPerDay: 1,
  contentNote: 'Source-cited compliance brief published daily to blog.bizlegal-ai.com',
  pricingFloor: '$29/mo',
  pricingCeiling: '$2,500/mo retainer',
  checkoutProviders: ['NOWPayments (crypto)', 'PayPal (card/bank)'],
  techStack: ['Next.js 14 (App Router)', 'Supabase (Postgres + Auth)', 'Python 3.11 (Hetzner agents)', 'Cloudflare (DNS + WAF + Workers)', 'Vercel (7 deploys, auto CI)'],
  deployedAt: 'Vercel (Next.js apps) + Hetzner CX33 (Python agents)',
}

const PRODUCTS = [
  { name: 'Compliance Ops Retainer', sku: 'compliance_ops_retainer', price: '$5,000 setup + $2,500/mo', type: 'Service' },
  { name: 'DocAI — Contract Risk Scanner', sku: 'docai_*', price: '$29–$99/mo + $97 one-time', type: 'SaaS' },
  { name: 'LexAudit — Compliance Health Score', sku: 'lexaudit_*', price: '$49–$99/mo', type: 'SaaS' },
  { name: 'Tracr — Wallet Forensics', sku: 'tracr_*', price: '$149–$299 one-time', type: 'Data product' },
  { name: 'BRAI — Counterparty Risk', sku: 'brai_*', price: '$49–$99/mo', type: 'SaaS' },
  { name: 'Forge — BOI/CTA Kit', sku: 'forge_*', price: '$149 one-time', type: 'Document product' },
  { name: 'Hub Pro / Scale', sku: 'hub_*', price: '$149–$499/mo', type: 'SaaS' },
]

// ---- Small presentational helpers (match the page's mono style) -------

function StatBox({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'good' | 'bad' | 'warn' | 'neutral' }) {
  const color = tone === 'good' ? '#2fbf71' : tone === 'bad' ? '#e5484d' : tone === 'warn' ? '#d9930d' : 'inherit'
  return (
    <div style={{ border: '1px solid #333', borderRadius: '6px', padding: '0.875rem', background: 'var(--bl-surface, rgba(255,255,255,0.03))' }}>
      <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.5, margin: '0 0 0.25rem' }}>{label}</p>
      <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color }}>{value}</p>
      {sub ? <p style={{ fontSize: '0.75rem', opacity: 0.55, margin: '0.25rem 0 0' }}>{sub}</p> : null}
    </div>
  )
}

function BarRow({ rows, empty, money }: { rows: Array<{ key: string; n: number; usd: number }>; empty: string; money: boolean }) {
  if (rows.length === 0) return <p style={{ opacity: 0.55, margin: 0 }}>{empty}</p>
  const max = Math.max(...rows.map((r) => r.usd), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {rows.map((row) => (
        <div key={row.key} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.8rem' }}>
          <span style={{ width: '12rem', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.key}</span>
          <div style={{ flex: 1, background: 'rgba(128,128,128,0.15)', borderRadius: '4px', height: '12px', overflow: 'hidden' }}>
            <div style={{ width: `${(row.usd / max) * 100}%`, height: '100%', background: '#2fbf71', borderRadius: '4px' }} />
          </div>
          <span style={{ width: '8.5rem', textAlign: 'right', opacity: 0.6, fontVariantNumeric: 'tabular-nums' }}>
            {money ? fmtUsd(row.usd) : `${row.n}`} · {row.n} order(s)
          </span>
        </div>
      ))}
    </div>
  )
}

export default async function MetricsPage({ searchParams }: PageProps) {
  const expected = process.env.OPS_DASHBOARD_TOKEN ?? ''
  const provided = (searchParams.token ?? searchParams.t ?? '').trim()

  if (!expected || !provided || !timingSafeEq(expected, provided)) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 14 }}>
        404 — not found
      </main>
    )
  }

  const sb = getSupabase()
  const revenue = sb ? await loadRevenue(sb) : emptyRevenue(null)

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'var(--bl-font-mono, monospace)', fontSize: '0.875rem', lineHeight: 1.65 }}>

      {/* Header */}
      <section style={{ borderBottom: '1px solid #333', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
        <p style={{ opacity: 0.5, marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>BizLegal AI — Master Metrics</p>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Revenue first. Everything else is a vanity metric.</h1>
        <p style={{ opacity: 0.7, margin: 0 }}>{PLATFORM.mission}</p>
      </section>

      {/* LIVE revenue — real reads from payment_orders */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.6, margin: 0 }}>Revenue — live (payment_orders)</h2>
          <span style={{ fontSize: '0.7rem', opacity: 0.45 }}>live · {new Date(revenue.generatedAt).toUTCString()}</span>
        </div>

        {!sb ? (
          <div style={{ border: '1px solid #d9930d', borderRadius: '6px', padding: '0.875rem', background: 'rgba(217,147,13,0.08)', fontSize: '0.825rem' }}>
            Supabase env not configured on hub (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_KEY). Live revenue figures unavailable.
          </div>
        ) : revenue.error ? (
          <div style={{ border: '1px solid #d9930d', borderRadius: '6px', padding: '0.875rem', background: 'rgba(217,147,13,0.08)', fontSize: '0.825rem' }}>
            Table <code>payment_orders</code> is not queryable — check migrations and redeploy.
            <div style={{ marginTop: '0.375rem', fontSize: '0.75rem', opacity: 0.6 }}>Supabase said: {revenue.error}</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <StatBox label="Captured (30d)" value={fmtUsd(revenue.captured30dUsd)} sub={`${revenue.captured30dCount} paid order(s)`} tone={revenue.captured30dUsd > 0 ? 'good' : 'bad'} />
              <StatBox label="Pending (30d)" value={fmtUsd(revenue.pending30dUsd)} sub={`${revenue.pending30dCount} order(s) never confirmed`} tone={revenue.pending30dUsd > 0 ? 'warn' : 'neutral'} />
              <StatBox label="Captured (all time)" value={fmtUsd(revenue.capturedAllTimeUsd)} sub={`${revenue.paidAllTimeCount} paid order(s)`} tone={revenue.capturedAllTimeUsd > 0 ? 'good' : 'bad'} />
            </div>

            {/* Per-day captured histogram, 30 slots */}
            <div style={{ border: '1px solid #333', borderRadius: '6px', padding: '0.875rem', marginBottom: '1.25rem', background: 'var(--bl-surface, rgba(255,255,255,0.03))' }}>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.5, margin: '0 0 0.5rem' }}>Captured per day (last 30 days)</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '70px' }}>
                {(() => {
                  const max = Math.max(...revenue.byDay.map((d) => d.usd), 1)
                  return revenue.byDay.map((d) => (
                    <div
                      key={d.day}
                      title={`${d.day}: ${fmtUsd(d.usd)} (${d.n} order(s))`}
                      style={{
                        flex: 1,
                        height: `${Math.max((d.usd / max) * 100, d.usd > 0 ? 6 : 2)}%`,
                        background: d.usd > 0 ? '#2fbf71' : 'rgba(128,128,128,0.2)',
                        borderRadius: '2px',
                      }}
                    />
                  ))
                })()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', opacity: 0.45, marginTop: '0.375rem' }}>
                <span>{revenue.byDay[0]?.day}</span>
                <span>{revenue.byDay[revenue.byDay.length - 1]?.day}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ border: '1px solid #333', borderRadius: '6px', padding: '0.875rem', background: 'var(--bl-surface, rgba(255,255,255,0.03))' }}>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.5, margin: '0 0 0.5rem' }}>Captured by product (30d)</p>
                <BarRow rows={revenue.byProduct30d} empty="No paid orders in the last 30 days." money />
              </div>
              <div style={{ border: '1px solid #333', borderRadius: '6px', padding: '0.875rem', background: 'var(--bl-surface, rgba(255,255,255,0.03))' }}>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.5, margin: '0 0 0.5rem' }}>Captured by gateway (30d)</p>
                <BarRow rows={revenue.byGateway30d} empty="No paid orders in the last 30 days." money />
              </div>
            </div>

            <div style={{ border: '1px solid #333', borderRadius: '6px', padding: '0.875rem', background: 'var(--bl-surface, rgba(255,255,255,0.03))' }}>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.5, margin: '0 0 0.5rem' }}>Orders by status (30d, all statuses)</p>
              <BarRow rows={revenue.byStatus30d} empty="No orders in the last 30 days." money />
            </div>
          </>
        )}
      </section>

      {/* Overview grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Deployed surfaces', value: String(PLATFORM.surfaces) },
          { label: 'Hetzner agents', value: String(PLATFORM.agents) },
          { label: 'Jurisdictions tracked', value: String(PLATFORM.jurisdictions) + '+' },
          { label: 'Content/day', value: String(PLATFORM.contentPerDay) + ' brief' },
          { label: 'Pricing floor', value: PLATFORM.pricingFloor },
          { label: 'Pricing ceiling', value: PLATFORM.pricingCeiling },
        ].map(({ label, value }) => (
          <div key={label} style={{ border: '1px solid #333', borderRadius: '6px', padding: '0.875rem', background: 'var(--bl-surface, rgba(255,255,255,0.03))' }}>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.5, margin: '0 0 0.25rem' }}>{label}</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{value}</p>
          </div>
        ))}
      </section>

      {/* Products */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.6, marginBottom: '0.75rem' }}>Product lineup ({PRODUCTS.length} SKUs)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              {['Product', 'Type', 'Pricing'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0.4rem 0.75rem', opacity: 0.5, fontSize: '0.75rem', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map(p => (
              <tr key={p.sku} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ padding: '0.5rem 0.75rem' }}>{p.name}</td>
                <td style={{ padding: '0.5rem 0.75rem', opacity: 0.6 }}>{p.type}</td>
                <td style={{ padding: '0.5rem 0.75rem', fontVariantNumeric: 'tabular-nums' }}>{p.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Infrastructure */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5, marginBottom: '0.5rem' }}>Tech stack</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {PLATFORM.techStack.map(s => <li key={s} style={{ opacity: 0.8 }}>— {s}</li>)}
          </ul>
        </div>
        <div>
          <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5, marginBottom: '0.5rem' }}>Jurisdictions covered</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {PLATFORM.jurisdictionList.map(j => <li key={j} style={{ opacity: 0.8 }}>— {j}</li>)}
          </ul>
        </div>
      </section>

      {/* Surfaces */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5, marginBottom: '0.5rem' }}>Deployed surfaces</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {PLATFORM.surfaceList.map(s => (
            <span key={s} style={{ border: '1px solid #444', borderRadius: '4px', padding: '0.2rem 0.6rem', fontSize: '0.8rem', opacity: 0.8 }}>{s}</span>
          ))}
        </div>
      </section>

      {/* Agent ops */}
      <section style={{ marginBottom: '2rem', border: '1px solid #333', borderRadius: '8px', padding: '1.25rem' }}>
        <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5, marginBottom: '0.5rem' }}>Autonomous agent ops</h2>
        <p style={{ margin: '0 0 0.5rem', opacity: 0.85 }}>
          {PLATFORM.agents} Python agents running on Hetzner CX33 — {PLATFORM.agentPurpose}.
        </p>
        <p style={{ margin: 0, opacity: 0.65 }}>
          Content pipeline: {PLATFORM.contentNote}.
        </p>
      </section>

      {/* Related ops views */}
      <section style={{ marginBottom: '2rem', borderTop: '1px solid #333', paddingTop: '1.5rem' }}>
        <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5, marginBottom: '0.5rem' }}>Related live views</h2>
        <p style={{ margin: '0 0 0.75rem', opacity: 0.7 }}>
          Real-time customer/funnel verdicts and content pipeline state:
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a
            href={`/ops/snapshot?t=${provided}`}
            style={{ display: 'inline-block', padding: '0.5rem 1rem', border: '1px solid #555', borderRadius: '6px', textDecoration: 'none', color: 'inherit', fontSize: '0.85rem' }}
          >
            → ops/snapshot (business verdicts)
          </a>
          <a
            href={`/ops/content?t=${provided}`}
            style={{ display: 'inline-block', padding: '0.5rem 1rem', border: '1px solid #555', borderRadius: '6px', textDecoration: 'none', color: 'inherit', fontSize: '0.85rem' }}
          >
            → ops/content (content pipeline)
          </a>
        </div>
      </section>

      {/* Data room CTA */}
      <section style={{ background: 'rgba(26,86,219,0.08)', border: '1px solid rgba(26,86,219,0.3)', borderRadius: '10px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Investor / acquirer data room</h2>
        <p style={{ margin: '0 0 1rem', opacity: 0.8 }}>
          For access to revenue figures, customer records, full agent architecture, and legal documentation, email below.
          We respond within 24 hours to qualified parties.
        </p>
        <a
          href="mailto:moses@bizlegal-ai.com?subject=BizLegal AI data room request"
          style={{ display: 'inline-block', padding: '0.625rem 1.25rem', background: 'rgba(26,86,219,0.8)', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}
        >
          Request data room — moses@bizlegal-ai.com
        </a>
      </section>

      <p style={{ marginTop: '2rem', opacity: 0.3, fontSize: '0.75rem' }}>
        Live section: <code>payment_orders</code> in the hub Supabase project at request time. Static sections updated manually — last edit 2026-09-06 · BizLegal AI / DOR INNOVATIONS LTD
      </p>
    </main>
  )
}
