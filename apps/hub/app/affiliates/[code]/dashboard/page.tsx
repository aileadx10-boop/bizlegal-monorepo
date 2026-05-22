import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAffiliate } from '@/lib/affiliate'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Affiliate Dashboard — BizLegal AI',
  robots: { index: false, follow: false, nocache: true },
}

interface PageProps {
  params: { code: string }
}

interface RecentSale {
  product: string | null
  tier: string | null
  billing_interval: string | null
  amount_cents: number | null
  status: string | null
  activated_at: string | null
  created_at: string
}

async function fetchRecentSales(code: string): Promise<ReadonlyArray<RecentSale>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return []
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data } = await supabase
    .from('payment_orders')
    .select('product, tier, billing_interval, amount_cents, status, activated_at, created_at')
    .eq('affiliate_code', code)
    .order('created_at', { ascending: false })
    .limit(25)
  return (data ?? []) as RecentSale[]
}

export default async function AffiliateDashboardPage({ params }: PageProps) {
  const code = (params.code ?? '').toLowerCase()
  if (!/^[a-z0-9]{8}$/.test(code)) notFound()

  const aff = await getAffiliate(code)
  if (!aff) notFound()

  const sales = await fetchRecentSales(code)
  const totalAttributedCents = sales.reduce((s, x) => s + (x.amount_cents ?? 0), 0)
  const activeSubsCount = sales.filter((s) => s.status === 'active').length
  const oneTimeCount = sales.filter((s) => s.billing_interval === 'one-time' && (s.status === 'active' || s.status === 'paid')).length

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bl-bg)', color: 'var(--bl-text)', padding: '2rem 1.5rem 4rem' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gap: 24 }}>
        <header>
          <div style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 11, color: 'var(--bl-text-muted)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            Affiliate · {aff.code}
          </div>
          <h1 style={{ fontFamily: 'var(--bl-font-display)', fontSize: 'clamp(2rem, 1.5rem + 1.5vw, 2.75rem)', fontWeight: 800, margin: '6px 0', letterSpacing: '-0.025em' }}>
            {aff.display_name ?? aff.email}
          </h1>
          <p style={{ color: 'var(--bl-text-muted)', margin: 0, fontSize: 14 }}>
            Member since {new Date(aff.created_at).toLocaleDateString()} · status <span style={{ color: aff.status === 'active' ? 'var(--bl-success)' : 'var(--bl-danger)' }}>{aff.status}</span>
          </p>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <Stat label="Pending balance" value={`$${(aff.balance_cents / 100).toFixed(2)}`} tone="accent" />
          <Stat label="Lifetime paid out" value={`$${(aff.lifetime_paid_cents / 100).toFixed(2)}`} tone="muted" />
          <Stat label="Active subs attributed" value={String(activeSubsCount)} tone="success" />
          <Stat label="One-time sales" value={String(oneTimeCount)} tone="success" />
        </section>

        <section className="bl-card">
          <h2 style={{ fontFamily: 'var(--bl-font-display)', fontSize: 18, fontWeight: 800, margin: '0 0 12px' }}>Your share link</h2>
          <code style={{ display: 'block', padding: 12, background: 'var(--bl-surface)', border: '1px solid var(--bl-divider)', borderRadius: 8, fontFamily: 'var(--bl-font-mono)', fontSize: 13, wordBreak: 'break-all' }}>
            https://bizlegal-ai.com/api/affiliates/track/{aff.code}?to=/agents
          </code>
          <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--bl-text-muted)', lineHeight: 1.5 }}>
            Send any prospect to this URL. We set a 90-day first-touch cookie + redirect to <code>/agents</code>. Any paid order from that browser inside the window credits your account.
          </p>
        </section>

        <section className="bl-card">
          <h2 style={{ fontFamily: 'var(--bl-font-display)', fontSize: 18, fontWeight: 800, margin: '0 0 12px' }}>Rate card</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              <tr><td style={tdLabel}>First-month MRR</td><td style={tdValue}>{aff.rate_pct_first_mo}%</td></tr>
              <tr><td style={tdLabel}>Recurring (months 2–12)</td><td style={tdValue}>{aff.rate_pct_recurring}%</td></tr>
              <tr><td style={tdLabel}>One-time products</td><td style={tdValue}>{aff.rate_pct_onetime}%</td></tr>
            </tbody>
          </table>
        </section>

        <section className="bl-card">
          <h2 style={{ fontFamily: 'var(--bl-font-display)', fontSize: 18, fontWeight: 800, margin: '0 0 12px' }}>
            Recent attributed orders ({sales.length})
          </h2>
          {sales.length === 0 ? (
            <p style={{ color: 'var(--bl-text-muted)', margin: 0, fontSize: 13 }}>
              No attributed orders yet. Send your share link to a prospect to get started.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {sales.map((s, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, padding: 10, background: 'var(--bl-surface)', border: '1px solid var(--bl-divider)', borderRadius: 8, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 12, fontWeight: 700 }}>{s.product} · {s.tier}</div>
                    <div style={{ fontSize: 11, color: 'var(--bl-text-muted)' }}>{s.billing_interval} · {new Date(s.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--bl-font-mono)', color: s.status === 'active' || s.status === 'paid' ? 'var(--bl-success)' : 'var(--bl-text-muted)' }}>{s.status}</div>
                  <div style={{ fontFamily: 'var(--bl-font-mono)', fontWeight: 700, color: 'var(--bl-success)' }}>${((s.amount_cents ?? 0) / 100).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer style={{ fontSize: 11, color: 'var(--bl-text-subtle)', fontFamily: 'var(--bl-font-mono)', textAlign: 'center', marginTop: 16 }}>
          Total attributed lifetime: ${(totalAttributedCents / 100).toFixed(2)} · Reconciliation: every Fri 10:30 UTC
        </footer>
      </div>
    </main>
  )
}

const tdLabel: React.CSSProperties = { padding: '8px 0', color: 'var(--bl-text-muted)', borderBottom: '1px solid var(--bl-divider)' }
const tdValue: React.CSSProperties = { padding: '8px 0', fontFamily: 'var(--bl-font-mono)', fontWeight: 700, color: 'var(--bl-accent)', borderBottom: '1px solid var(--bl-divider)', textAlign: 'right' }

function Stat({ label, value, tone }: { label: string; value: string; tone: 'accent' | 'success' | 'muted' }) {
  const color = tone === 'accent' ? 'var(--bl-accent)' : tone === 'success' ? 'var(--bl-success)' : 'var(--bl-text)'
  return (
    <div style={{ padding: 14, background: 'var(--bl-surface)', border: '1px solid var(--bl-divider)', borderRadius: 12 }}>
      <div style={{ fontSize: 11, fontFamily: 'var(--bl-font-mono)', color: 'var(--bl-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ marginTop: 6, fontFamily: 'var(--bl-font-display)', fontSize: 22, fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  )
}
