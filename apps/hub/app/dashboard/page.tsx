import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Operations Dashboard | BizLegal',
  robots: { index: false, follow: false },
}

// ── Auth guard ──────────────────────────────────────────────────────────────
async function requireAuth() {
  const jar = await cookies()
  const session = jar.get('ops_session')?.value
  if (session !== 'authenticated') {
    redirect('/dashboard/login')
  }
}

// ── DB A: bizlegal (subscribers, leads) ─────────────────────────────────────
// Article counts removed — content moved to blog.bizlegal-ai.com
async function getBizlegalStats() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return { subscribers: 0, leads: 0, recentLeads: [] }
  try {
    const sb = createClient(url, key)
    const [{ count: subscribers }, { count: leads }, { data: recentLeads }] = await Promise.all([
      sb.from('subscribers').select('*', { count: 'exact', head: true }),
      sb.from('leads').select('*', { count: 'exact', head: true }),
      sb.from('leads').select('email,created_at,source').order('created_at', { ascending: false }).limit(5),
    ])
    return { subscribers: subscribers ?? 0, leads: leads ?? 0, recentLeads: recentLeads ?? [] }
  } catch {
    return { subscribers: 0, leads: 0, recentLeads: [] }
  }
}

// ── DB B: compliance (forge scans, brai leads, lexaudit matters, trcr) ──────
async function getComplianceStats() {
  const url = process.env.COMPLIANCE_SUPABASE_URL
  const key = process.env.COMPLIANCE_SUPABASE_SERVICE_KEY
  if (!url || !key) return { forgeScans: 0, braiLeads: 0, lexMatters: 0, trcrReports: 0 }
  try {
    const sb = createClient(url, key)
    const [
      { count: forgeScans },
      { count: braiLeads },
      { count: lexMatters },
      { count: trcrReports },
    ] = await Promise.all([
      sb.from('scans').select('*', { count: 'exact', head: true }),
      sb.from('tracr_wallet_leads').select('*', { count: 'exact', head: true }),
      sb.from('matters').select('*', { count: 'exact', head: true }),
      sb.from('tracr_reports').select('*', { count: 'exact', head: true }),
    ])
    return {
      forgeScans: forgeScans ?? 0,
      braiLeads: braiLeads ?? 0,
      lexMatters: lexMatters ?? 0,
      trcrReports: trcrReports ?? 0,
    }
  } catch {
    return { forgeScans: 0, braiLeads: 0, lexMatters: 0, trcrReports: 0 }
  }
}

// ── Product health pings ─────────────────────────────────────────────────────
type HealthResult = { name: string; url: string; status: 'up' | 'down' | 'unknown'; ms: number }

async function pingProduct(name: string, url: string): Promise<HealthResult> {
  const start = Date.now()
  try {
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(5000) })
    return { name, url, status: res.ok ? 'up' : 'down', ms: Date.now() - start }
  } catch {
    return { name, url, status: 'down', ms: Date.now() - start }
  }
}

async function getProductHealth(): Promise<HealthResult[]> {
  const products = [
    { name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    { name: 'BRAI', url: 'https://brai.bizlegal-ai.com/health' },
    { name: 'Forge', url: 'https://forge.bizlegal-ai.com' },
    { name: 'LexAudit', url: 'https://lexaudit.bizlegal-ai.com' },
    { name: 'TRACR', url: 'https://tracr.bizlegal-ai.com' },
  ]
  return Promise.all(products.map(p => pingProduct(p.name, p.url)))
}

// ── Styles ───────────────────────────────────────────────────────────────────
const card = {
  background: '#080810',
  border: '1px solid #1a1a2e',
  borderRadius: '12px',
  padding: '20px 24px',
} as const

const label = {
  fontSize: '11px',
  letterSpacing: '1.5px',
  color: '#475569',
  textTransform: 'uppercase' as const,
  marginBottom: '6px',
}

const bigNum = {
  fontFamily: 'Georgia, serif',
  fontSize: '32px',
  fontWeight: 700,
  color: '#e2e8f0',
  lineHeight: 1,
}

export default async function DashboardPage() {
  await requireAuth()
  const [biz, comp, health] = await Promise.all([
    getBizlegalStats(),
    getComplianceStats(),
    getProductHealth(),
  ])

  const allUp = health.every(h => h.status === 'up')

  return (
    <div style={{ minHeight: '100vh', background: '#050509', fontFamily: "'DM Sans', sans-serif", color: '#e2e8f0' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap')`}</style>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #0f172a', padding: '0 40px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '15px' }}>BizLegal · Ops</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: allUp ? '#22c55e' : '#f87171' }}>
            {allUp ? '● All systems operational' : '● Degraded'}
          </span>
          <Link href="/" style={{ color: '#475569', textDecoration: 'none', fontSize: '12px' }}>← Site</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px' }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 700, margin: '0 0 6px' }}>Operations Dashboard</h1>
          <p style={{ color: '#475569', fontSize: '13px', margin: 0 }}>Live metrics across both Supabase instances — refreshed on load</p>
        </div>

        {/* Product Health */}
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '13px', letterSpacing: '1px', color: '#64748b', textTransform: 'uppercase', marginBottom: '14px' }}>Product Health</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {health.map(h => (
              <div key={h.name} style={{ ...card, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{h.name}</span>
                  <span style={{ fontSize: '10px', color: h.status === 'up' ? '#22c55e' : '#f87171' }}>
                    {h.status === 'up' ? '●' : '●'}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#334155' }}>{h.ms}ms</div>
              </div>
            ))}
          </div>
        </section>

        {/* DB A: bizlegal */}
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '13px', letterSpacing: '1px', color: '#64748b', textTransform: 'uppercase', marginBottom: '14px' }}>DB A — BizLegal (subscribers · leads)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={card}>
              <div style={label}>Newsletter Subscribers</div>
              <div style={bigNum}>{biz.subscribers}</div>
            </div>
            <div style={card}>
              <div style={label}>Total Leads</div>
              <div style={bigNum}>{biz.leads}</div>
            </div>
            <div style={{ ...card, gridColumn: 'span 1' }}>
              <div style={label}>Recent Leads</div>
              {biz.recentLeads.length === 0 ? (
                <div style={{ color: '#334155', fontSize: '13px' }}>None</div>
              ) : (
                biz.recentLeads.map((l: any, i: number) => (
                  <div key={i} style={{ fontSize: '12px', color: '#94a3b8', borderBottom: '1px solid #0f172a', padding: '5px 0', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{l.email}</span>
                    <span style={{ color: '#334155' }}>{new Date(l.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* DB B: compliance */}
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '13px', letterSpacing: '1px', color: '#64748b', textTransform: 'uppercase', marginBottom: '14px' }}>DB B — Compliance (forge · brai · lexaudit · tracr)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { label: 'Forge Scans', value: comp.forgeScans },
              { label: 'BRAI Leads', value: comp.braiLeads },
              { label: 'LexAudit Matters', value: comp.lexMatters },
              { label: 'TRACR Reports', value: comp.trcrReports },
            ].map(m => (
              <div key={m.label} style={card}>
                <div style={label}>{m.label}</div>
                <div style={bigNum}>{m.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick links */}
        <section>
          <h2 style={{ fontSize: '13px', letterSpacing: '1px', color: '#64748b', textTransform: 'uppercase', marginBottom: '14px' }}>Quick Links</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              ['Vercel Dashboard', 'https://vercel.com/aileadx10-5415s-projects'],
              ['Supabase A', 'https://supabase.com/dashboard/project/ydghhcuuopqzgqcicubg'],
              ['Supabase B', 'https://supabase.com/dashboard/project/rgbwlaifhfvlxgamwcnz'],
              ['GitHub Org', 'https://github.com/aileadx10-boop'],
            ].map(([name, href]) => (
              <a key={name} href={href} target="_blank" rel="noopener noreferrer"
                style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 16px', color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>
                {name} ↗
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
