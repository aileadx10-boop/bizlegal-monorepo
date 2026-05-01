import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Digital Asset Risk Analysis — AI Regulatory Intelligence | BizLegal AI',
  description: 'AI-powered digital asset risk analysis. Identify regulatory exposure across VARA, MiCA, SEC, MAS before launch. Structured risk intelligence for digital asset ventures by BizLegal AI.',
  keywords: 'digital asset risk analysis, crypto regulatory risk, blockchain venture risk assessment, digital asset compliance analysis, regulatory risk intelligence UAE, AI risk analysis crypto',
  alternates: { canonical: 'https://bizlegal-ai.com/digital-asset-risk-analysis' },
  openGraph: {
    title: 'Digital Asset Risk Analysis — AI Regulatory Intelligence | BizLegal AI',
    description: 'AI-powered digital asset regulatory risk analysis. VARA, MiCA, SEC, MAS. Identify exposure before launch.',
    url: 'https://bizlegal-ai.com/digital-asset-risk-analysis',
  },
}

const RISK_CATEGORIES = [
  { category: 'Token Classification Risk', level: 'High', desc: 'Does your token structure trigger securities laws? The Howey Test (US), MiCA classification, and VARA categories must all be analysed before token issuance.', color: '#f87171' },
  { category: 'Licensing Exposure', level: 'High', desc: 'Operating without required licenses is a primary regulatory risk. VARA, MAS, SEC, and FCA all require specific authorisations for digital asset service providers.', color: '#f87171' },
  { category: 'AML/KYC Compliance Gap', level: 'Medium', desc: 'Inadequate AML/CFT programmes are a leading cause of enforcement actions. FATF Travel Rule, VARA AML regulations, and EU AMLD6 all impose specific requirements.', color: '#fbbf24' },
  { category: 'Cross-Border Jurisdiction Overlap', level: 'Medium', desc: 'Digital assets inherently cross borders. Regulatory arbitrage is scrutinised — multiple jurisdictions may simultaneously claim authority over your venture.', color: '#fbbf24' },
  { category: 'Smart Contract Legal Risk', level: 'Medium', desc: 'Smart contract bugs, rug-pull allegations, and investor protection claims create significant legal risk. Code audits and legal review are both required.', color: '#fbbf24' },
  { category: 'Custody & Safeguarding Risk', level: 'Medium', desc: 'Mishandling client assets — including failure to properly segregate — is a critical compliance risk under VARA, MiCA, and MAS regulations.', color: '#fbbf24' },
]

export default function DigitalAssetRiskPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingTop: '36px' }}>
      <div style={{ background: 'rgba(7,9,26,0.95)', borderBottom: '1px solid rgba(125,211,252,0.08)' }}>
        <div className="container" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" className="nav-logo" style={{ marginRight: 'auto' }}>DOR<em>INNOVATIONS</em></Link>
          <a href="https://brai.bizlegal-ai.com" className="btn-ghost" style={{ fontSize: '12px' }}>Free Risk Scan</a>
          <a href="https://docstack.bizlegal-ai.com" className="btn-primary" style={{ fontSize: '12px' }}>Templates →</a>
        </div>
      </div>

      <div style={{ padding: '80px 24px 60px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(125,211,252,0.2)', background: 'rgba(125,211,252,0.05)', fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: 'var(--sky)', marginBottom: '28px' }}>
          🔍 Regulatory Risk Intelligence
        </div>
        <h1 style={{ fontFamily: 'Gloock, serif', fontSize: 'clamp(36px, 5vw, 60px)', color: 'var(--white)', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
          Digital Asset Risk Analysis —<br /><em style={{ fontStyle: 'italic', color: 'var(--sky)' }}>Identify Exposure Before It Crystallises</em>
        </h1>
        <p style={{ fontSize: '17px', color: 'var(--muted)', lineHeight: 1.8, maxWidth: '680px', marginBottom: '36px' }}>
          Regulatory risk is the primary existential threat to digital asset ventures. BizLegal AI provides structured AI-assisted risk analysis across all major digital asset jurisdictions — identifying your specific exposure profile before launch, fundraising, or market expansion.
        </p>
        <a href="https://brai.bizlegal-ai.com" className="lx-btn-p">Free Risk Analysis →</a>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* DOR Approach */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '60px' }}>
          <div style={{ padding: '36px', borderRadius: '18px', border: '1px solid rgba(125,211,252,0.1)', background: 'rgba(7,9,26,0.7)', gridColumn: '1 / -1' }}>
            <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '26px', color: 'var(--white)', marginBottom: '16px' }}>The BizLegal AI Risk Framework</h2>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '16px' }}>
              Traditional compliance is reactive — it fixes problems after they emerge. BizLegal AI operates on a proactive intelligence model: identify and map regulatory exposure across all relevant jurisdictions before you launch, raise capital, or expand.
            </p>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8 }}>
              Our risk analysis combines commercial attorney judgment (20+ years, $100M+ in transactions) with Claude AI's regulatory analysis capability — delivering structured risk intelligence that matches the depth of a traditional law firm at a fraction of the time and cost.
            </p>
          </div>
          {[
            { icon: '⚡', title: 'Speed', desc: 'AI-assisted analysis in under 60 seconds — not weeks of back-and-forth.' },
            { icon: '🔍', title: 'Depth', desc: 'Commercial attorney depth. Not surface-level automated checks.' },
            { icon: '🌍', title: 'Coverage', desc: '6 jurisdictions simultaneously — UAE, EU, US, UK, Singapore, Canada.' },
            { icon: '🎯', title: 'Specificity', desc: 'Venture-specific analysis, not generic regulatory summaries.' },
          ].map(f => (
            <div key={f.title} style={{ padding: '24px', borderRadius: '14px', border: '1px solid rgba(125,211,252,0.08)', background: 'rgba(7,9,26,0.5)' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>{f.icon}</div>
              <div style={{ fontFamily: 'Gloock, serif', fontSize: '16px', color: 'var(--white)', marginBottom: '6px' }}>{f.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Risk Categories */}
        <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '24px' }}>Key Digital Asset Risk Categories</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '48px' }}>
          {RISK_CATEGORIES.map(r => (
            <div key={r.category} style={{ padding: '20px 24px', borderRadius: '12px', border: `1px solid ${r.color}18`, background: 'rgba(7,9,26,0.5)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, marginTop: '2px' }}>
                <div style={{ fontSize: '9px', fontFamily: 'Geist Mono, monospace', fontWeight: 700, color: r.color, background: `${r.color}15`, padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>{r.level}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--white)', fontSize: '14px', display: 'block', marginBottom: '4px' }}>{r.category}</strong>
                <span style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65 }}>{r.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: '60px', borderRadius: '20px', background: 'radial-gradient(ellipse at 50% 0%, rgba(125,211,252,0.07) 0%, rgba(7,9,26,0.9) 60%)', border: '1px solid rgba(125,211,252,0.12)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '32px', color: 'var(--white)', marginBottom: '12px' }}>
            Know your risk profile
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '28px', lineHeight: 1.75 }}>
            Free BRAI scan — AI-assisted risk analysis across 6 jurisdictions in under 60 seconds. No signup required.
          </p>
          <a href="https://brai.bizlegal-ai.com" className="lx-btn-p" style={{ fontSize: '15px', padding: '16px 40px' }}>
            Run Free Risk Analysis →
          </a>
        </div>
      </div>
    </div>
  )
}
