import type { Metadata } from 'next'
import QualifierChat from '@/components/conversion/QualifierChat'

export const metadata: Metadata = {
  title: 'Intelligence Reports | BizLegal AI',
  description: 'Premium compliance research packaged as digital products. Updated quarterly. Written by a 20-year international commercial lawyer.',
  alternates: { canonical: 'https://bizlegal-ai.com/products/intelligence' },
}

const REPORTS = [
  {
    id: 'eu-compliance-gap-2026',
    title: '2026 EU Compliance Gap Analysis',
    desc: 'GDPR, DMA, AI Act, and DSA across 10 jurisdictions. 300+ pages of actionable gap analysis sourced from live regulatory data.',
    price: '$49',
    pages: '300+',
    updated: 'April 2026',
    tags: ['EU', 'GDPR', 'AI Act', 'DMA', 'DSA'],
    format: 'PDF + EPUB',
  },
  {
    id: 'blockchain-arbitrage-2026',
    title: 'Blockchain Regulatory Arbitrage Report',
    desc: 'Monthly report on regulatory gaps between US, EU, and Asia. Where legal gray areas exist and how to navigate them compliantly.',
    price: '$99',
    pages: '80+',
    updated: 'Monthly',
    tags: ['Blockchain', 'US', 'EU', 'Asia', 'DeFi'],
    format: 'PDF',
  },
  {
    id: 'contract-audit-kit',
    title: 'Contract Compliance Audit Kit',
    desc: 'Audit checklist for contracts across US, EU, UK, Singapore, and UAE. Interactive PDF with embedded regulatory references.',
    price: '$79',
    pages: '120+',
    updated: 'Quarterly',
    tags: ['Contracts', 'Multi-jurisdiction', 'Audit'],
    format: 'Interactive PDF',
  },
  {
    id: 'reg-intel-db',
    title: 'Regulatory Intelligence Database',
    desc: 'Daily feed of regulatory changes. Alerts for your jurisdiction. Historical archive. API access for legal tech integrations.',
    price: '$199/mo',
    pages: 'Live feed',
    updated: 'Daily',
    tags: ['Live data', 'All jurisdictions', 'API'],
    format: 'Web + API',
  },
  {
    id: 'due-diligence-pack',
    title: 'Due Diligence Starter Pack',
    desc: 'M&A due diligence checklist. Blockchain-specific compliance. Data privacy audit framework. 100 regulation citations.',
    price: '$199',
    pages: '200+',
    updated: 'Quarterly',
    tags: ['M&A', 'Blockchain', 'Data Privacy'],
    format: 'PDF + Checklist',
  },
]

export default function IntelligencePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <section style={{ padding: '80px 32px 64px', maxWidth: 1100, margin: '0 auto' }}>
        <span className="section-label">Librarian Intelligence Products</span>
        <h1 style={{ marginBottom: 20 }}>Premium Compliance Research.<br />Packaged. Cited. Updated.</h1>
        <p style={{ fontSize: 16, lineHeight: 1.8, maxWidth: 600, marginBottom: 32 }}>
          Each report is sourced from live regulatory data, validated against official databases,
          and written to read like research from a 20-year practitioner — not a chatbot.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="trust-badge">LLB + LLM Authored</div>
          <div className="trust-badge">AI-Validated</div>
          <div className="trust-badge">Regulation-Cited</div>
          <div className="trust-badge">Quarterly Updates</div>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {REPORTS.map(r => (
            <div key={r.id} className="glass-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>{r.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.7 }}>{r.desc}</p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {r.tags.map(t => (
                  <span key={t} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--secondary)', background: 'rgba(233,195,73,0.08)', border: '0.5px solid rgba(233,195,73,0.2)', padding: '2px 8px' }}>{t}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                {[['Pages', r.pages], ['Format', r.format], ['Updated', r.updated]].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{l}</div>
                    <div style={{ fontSize: 13, color: 'var(--on-surface)', fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '0.5px solid var(--outline-var)' }}>
                <span style={{ fontFamily: 'Newsreader, serif', fontSize: 24, fontWeight: 700, color: 'var(--on-surface)' }}>{r.price}</span>
                <a href={`mailto:team@bizlegal-ai.com?subject=Intelligence Report: ${r.title}`} className="btn-cta" style={{ fontSize: 12, padding: '8px 16px' }}>Buy Now →</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: 'var(--bg-low)', borderTop: '0.5px solid var(--outline-var)', padding: '64px 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="ai-disclosure">
            <span style={{ flexShrink: 0, fontSize: 16 }}>📋</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--on-surface)', marginBottom: 4 }}>Content Standards</div>
              All intelligence reports are sourced from official regulatory databases, validated for accuracy,
              and reviewed by an LLB + LLM qualified attorney before publication.
              Each report states its AI disclosure, confidence level, and all citations.
              Reports are updated when regulations change.
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '64px 32px', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ marginBottom: 16 }}>Need a custom intelligence report?</h2>
        <p style={{ marginBottom: 28 }}>We produce bespoke compliance research for enterprise clients. Jurisdiction-specific. Regulation-current. Practitioner-vetted.</p>
        <a href="mailto:team@bizlegal-ai.com?subject=Custom Intelligence Report" className="btn-primary">Request Custom Report →</a>
        <div style={{ marginTop: 40, textAlign: 'left', display: 'flex', justifyContent: 'center' }}>
          <QualifierChat context="custom-build" />
        </div>
      </section>
    </div>
  )
}
