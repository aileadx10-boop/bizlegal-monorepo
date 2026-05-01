import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products | BizLegal AI',
  description: 'Six regulatory intelligence surfaces built by a 20-year international commercial lawyer. Wallet & transaction intelligence, counterparty risk, compliance health score, contract & questionnaire intelligence, gap scanner, and lead intelligence.',
  alternates: { canonical: 'https://bizlegal-ai.com/products' },
}

const PRODUCTS = [
  {
    id: 'brai',
    name: 'BRAI',
    tagline: 'Counterparty Risk Intelligence',
    description: 'Scan any blockchain wallet. Surfaces risky patterns, counterparty exposure, and sanctions-list matches. Delivered in 2–5 minutes.',
    href: '/brai',
    cta: 'Scan a Wallet',
    free: 'Free scan — no sign-up',
    features: ['Multi-chain analysis', 'Sanctions screening', 'Composite signal 0–100', 'Counterparty mapping'],
    accent: 'var(--teal)',
  },
  {
    id: 'tracr',
    name: 'TRACR',
    tagline: 'Wallet & Transaction Intelligence',
    description: 'Structured on-chain intelligence reports for disputes counsel and asset-recovery teams. Audit-ready format, sourced from public chain data.',
    href: '/tracr',
    cta: 'Generate Report',
    free: 'Free summary report',
    features: ['Audit-ready format', 'Practitioner review option', 'Transaction tracing', 'Sources footer per report'],
    accent: 'var(--sky)',
  },
  {
    id: 'lexaudit',
    name: 'LexAudit',
    tagline: 'Compliance Health Score',
    description: 'Continuous monthly Compliance Health Score across SEC, MiCA, VARA, GDPR, HIPAA, DPDP — 60 signal checks. An indicator, not a certification.',
    href: '/lexaudit',
    cta: 'View Health Score',
    free: 'Free preview check',
    features: ['60-signal composite', 'SOC 2 / ISO / GDPR', 'Buyer-shareable page', 'Monthly refresh'],
    accent: 'var(--indigo)',
  },
  {
    id: 'docai',
    name: 'DocAI',
    tagline: 'Contract & SQA Intelligence',
    description: 'Generates jurisdiction-aware contracts and answers vendor security questionnaires from your documented controls. Vetted clauses for UAE, EU, US, UK, Singapore.',
    href: '/docai',
    cta: 'Generate Contract',
    free: 'Free template preview',
    features: ['100+ vetted templates', 'Multi-jurisdiction', 'SQA engine (SOC 2 / CAIQ / SIG)', 'PDF download'],
    accent: 'var(--purple)',
  },
  {
    id: 'forge',
    name: 'Forge',
    tagline: 'Compliance Scanner',
    description: 'Fifteen regulatory modules in one scanner — GDPR, AML/KYC, MiCA, VARA, SEC, data privacy, employment, contract law. You submit; we publish the gap analysis.',
    href: '/forge',
    cta: 'Start Compliance Scan',
    free: 'Free 2-module scan',
    features: ['15 regulatory modules', 'Gap analysis report', 'Remediation roadmap', 'Multi-jurisdiction'],
    accent: 'var(--secondary)',
  },
  {
    id: 'leadforge',
    name: 'LeadForge',
    tagline: 'Legal Lead Intelligence',
    description: 'Compliance buyer-intent signals — companies showing fresh compliance pain, surfaced from SEC filings, enforcement actions, FOIA, and job postings.',
    href: '/leadforge',
    cta: 'Browse Signals',
    free: '5 free sample signals',
    features: ['Buyer-intent signals', 'Jurisdiction-filtered', 'Practice-area targeting', 'CRM-ready export'],
    accent: '#FF5A1F',
  },
]

export default function ProductsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <section style={{ padding: '80px 32px 64px', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <span className="section-label">Six Products. One System.</span>
        <h1 style={{ marginBottom: 20 }}>Legal Intelligence,<br />Engineered for Scale</h1>
        <p style={{ maxWidth: 600, margin: '0 auto 40px', fontSize: 16, lineHeight: 1.8 }}>
          Built by a LLB, LLM-qualified international commercial lawyer, notary, and arbitrator with 20 years of practice.
          Not a startup. Not a clone. An authority system.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <div className="trust-badge">LLB + LLM Qualified</div>
          <div className="trust-badge">20 Years Legal Practice</div>
          <div className="trust-badge">Notary &amp; Arbitrator</div>
          <div className="trust-badge">International Commercial Law</div>
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '0.5px solid var(--outline-var)', maxWidth: 1200, margin: '0 auto 64px' }} />

      {/* Product grid */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
          {PRODUCTS.map(p => (
            <div
              key={p.id}
              className="glass-card"
              style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: 24, fontWeight: 700, color: p.accent }}>{p.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>{p.tagline}</span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--on-surface-var)' }}>{p.description}</p>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {p.features.map(f => (
                  <li key={f} className="feature-check">{f}</li>
                ))}
              </ul>
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link href={p.href} className="btn-cta" style={{ justifyContent: 'center' }}>
                  {p.cta} →
                </Link>
                <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {p.free}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Intelligence CTA */}
      <section style={{ background: 'var(--bg-low)', borderTop: '0.5px solid var(--outline-var)', padding: '64px 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <span className="section-label">Also Available</span>
          <h2 style={{ marginBottom: 16 }}>Intelligence Reports</h2>
          <p style={{ marginBottom: 32, fontSize: 15 }}>
            Premium compliance research packaged as digital products. Updated quarterly as regulations change.
          </p>
          <Link href="/products/intelligence" className="btn-primary">Browse Intelligence Reports →</Link>
        </div>
      </section>
    </div>
  )
}
