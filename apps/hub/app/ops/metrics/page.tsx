import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'BizLegal AI — Platform Metrics',
  description: 'Live platform metrics. Access via ops token.',
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

// Static platform facts — updated manually when significant milestones land
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

export default function MetricsPage({ searchParams }: PageProps) {
  const expected = process.env.OPS_DASHBOARD_TOKEN ?? ''
  const provided = (searchParams.token ?? searchParams.t ?? '').trim()

  if (!expected || !provided || !timingSafeEq(expected, provided)) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 14 }}>
        404 — not found
      </main>
    )
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'var(--bl-font-mono, monospace)', fontSize: '0.875rem', lineHeight: 1.65 }}>

      {/* Header */}
      <section style={{ borderBottom: '1px solid #333', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
        <p style={{ opacity: 0.5, marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>BizLegal AI — Platform Metrics</p>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Built for compliance-as-a-service. 2026 baseline.</h1>
        <p style={{ opacity: 0.7, margin: 0 }}>{PLATFORM.mission}</p>
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

      {/* Revenue live link */}
      <section style={{ marginBottom: '2rem', borderTop: '1px solid #333', paddingTop: '1.5rem' }}>
        <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5, marginBottom: '0.5rem' }}>Live revenue snapshot</h2>
        <p style={{ margin: '0 0 0.75rem', opacity: 0.7 }}>
          Real-time payment_orders, subscriber count, and traffic breakdown:
        </p>
        <a
          href={`/ops/snapshot?t=${provided}`}
          style={{ display: 'inline-block', padding: '0.5rem 1rem', border: '1px solid #555', borderRadius: '6px', textDecoration: 'none', color: 'inherit', fontSize: '0.85rem' }}
        >
          → View ops/snapshot
        </a>
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
        Generated: 2026-07-17 — BizLegal AI / DOR INNOVATIONS LTD
      </p>
    </main>
  )
}
