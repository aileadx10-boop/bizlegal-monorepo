import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MiCA Regulation 2025 — EU Crypto Asset Compliance Guide | BizLegal AI',
  description: 'Complete MiCA regulation guide 2025. Markets in Crypto-Assets Regulation (MiCA) requirements, CASP license, token classification, EU passporting. AI-assisted MiCA compliance by BizLegal AI.',
  keywords: 'MiCA regulation 2025, MiCA compliance EU, crypto asset regulation Europe, CASP license MiCA, MiCA token classification, EU crypto law, MiCA ESMA',
  alternates: { canonical: 'https://bizlegal-ai.com/mica-regulation-2025' },
  openGraph: {
    title: 'MiCA Regulation 2025 — EU Crypto Asset Compliance | BizLegal AI',
    description: 'Complete MiCA regulation guide. CASP licensing, token classification, EU passporting. AI-assisted compliance analysis.',
    url: 'https://bizlegal-ai.com/mica-regulation-2025',
  },
}

const TOKEN_TYPES = [
  { type: 'Asset-Referenced Token (ART)', desc: 'Maintains stable value by referencing multiple assets (currencies, commodities). Requires ART authorization from national competent authority.', color: 'var(--sky)' },
  { type: 'E-Money Token (EMT)', desc: 'Maintains stable value by referencing a single fiat currency. Must be issued by authorized credit institution or e-money institution.', color: 'var(--teal)' },
  { type: 'Utility Token', desc: 'Provides access to goods/services on a DLT platform. Lighter regulatory framework, but detailed white paper required.', color: 'var(--indigo)' },
  { type: 'Other Crypto-Assets', desc: 'All crypto-assets not fitting ART or EMT categories (e.g. BTC, ETH). White paper required unless exemptions apply.', color: '#fbbf24' },
]

export default function MiCAPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingTop: '36px' }}>
      <div style={{ background: 'rgba(7,9,26,0.95)', borderBottom: '1px solid rgba(125,211,252,0.08)' }}>
        <div className="container" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" className="nav-logo" style={{ marginRight: 'auto' }}>DOR<em>INNOVATIONS</em></Link>
          <a href="https://brai.bizlegal-ai.com" className="btn-ghost" style={{ fontSize: '12px' }}>Free Scan</a>
          <a href="https://docstack.bizlegal-ai.com" className="btn-primary" style={{ fontSize: '12px' }}>Templates →</a>
        </div>
      </div>

      <div style={{ padding: '80px 24px 60px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(125,211,252,0.2)', background: 'rgba(125,211,252,0.05)', fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: 'var(--sky)', marginBottom: '28px' }}>
          🇪🇺 EU MiCA Regulation 2025
        </div>
        <h1 style={{ fontFamily: 'Gloock, serif', fontSize: 'clamp(36px, 5vw, 60px)', color: 'var(--white)', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
          MiCA Regulation 2025 —<br /><em style={{ fontStyle: 'italic', color: 'var(--sky)' }}>EU Crypto Asset Compliance Guide</em>
        </h1>
        <p style={{ fontSize: '17px', color: 'var(--muted)', lineHeight: 1.8, maxWidth: '680px', marginBottom: '36px' }}>
          The Markets in Crypto-Assets Regulation (MiCA) is the EU's comprehensive regulatory framework for crypto assets, fully in force since December 2024. This guide covers MiCA's token classification, CASP licensing, white paper requirements, and what it means for your digital asset venture.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="https://brai.bizlegal-ai.com" className="lx-btn-p">Free MiCA Compliance Scan →</a>
          <a href="https://docstack.bizlegal-ai.com" className="lx-btn-g">MiCA Document Templates</a>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* MiCA Overview */}
        <div style={{ padding: '40px', borderRadius: '20px', border: '1px solid rgba(125,211,252,0.1)', background: 'rgba(7,9,26,0.7)', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '26px', color: 'var(--white)', marginBottom: '20px' }}>MiCA at a Glance</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              ['Effective Date', 'December 30, 2024 (full application)'],
              ['Scope', 'All crypto-asset service providers operating in or into the EU'],
              ['Regulator', 'National Competent Authorities + ESMA (cross-border)'],
              ['Passporting', 'Single EU license — valid in all 27 member states'],
              ['White Paper', 'Required for most token issuances (with limited exemptions)'],
              ['Penalties', 'Up to 5% annual global turnover for serious violations'],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: 'var(--teal)', marginBottom: '4px' }}>{k}</div>
                <div style={{ fontSize: '14px', color: 'var(--white)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Token Classification */}
        <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '24px' }}>MiCA Token Classification</h2>
        <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
          {TOKEN_TYPES.map(t => (
            <div key={t.type} style={{ padding: '24px', borderRadius: '14px', border: `1px solid ${t.color}25`, background: 'rgba(7,9,26,0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.color, boxShadow: `0 0 8px ${t.color}`, marginTop: '8px', flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontFamily: 'Gloock, serif', fontSize: '17px', color: 'var(--white)', marginBottom: '8px' }}>{t.type}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>{t.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CASP Requirements */}
        <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '24px' }}>CASP License Requirements</h2>
        <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '24px' }}>
          Crypto-Asset Service Providers (CASPs) under MiCA must obtain authorization from the national competent authority (NCA) of their home member state before operating in the EU.
        </p>
        <div style={{ display: 'grid', gap: '12px', marginBottom: '40px' }}>
          {[
            ['Legal Entity', 'CASPs must be a legal entity established in the EU. Third-country CASPs face additional requirements.'],
            ['Governance', 'Robust governance arrangements, including a management body with sufficient knowledge and experience.'],
            ['Prudential Requirements', 'Capital requirements ranging from €50,000 to €150,000 depending on services offered, plus 25% of fixed overheads.'],
            ['AML/CFT', 'Full compliance with EU AML Directive 6 requirements. Must appoint an MLCO and implement robust due diligence.'],
            ['White Paper', 'Mandatory crypto-asset white paper for token issuances, to be notified to the NCA and published.'],
            ['EU Passporting', 'Once licensed, CASPs can passport their services across all 27 EU member states with simplified notification procedure.'],
          ].map(([title, desc]) => (
            <div key={title} style={{ padding: '20px 24px', borderRadius: '12px', border: '1px solid rgba(125,211,252,0.08)', background: 'rgba(7,9,26,0.5)', display: 'flex', gap: '16px' }}>
              <span style={{ color: 'var(--teal)', fontSize: '14px', marginTop: '1px', flexShrink: 0 }}>✓</span>
              <div>
                <strong style={{ color: 'var(--white)', fontSize: '14px', display: 'block', marginBottom: '4px' }}>{title}</strong>
                <span style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65 }}>{desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* BizLegal AI CTA */}
        <div style={{ padding: '48px', borderRadius: '20px', background: 'radial-gradient(ellipse at 50% 0%, rgba(125,211,252,0.07) 0%, rgba(7,9,26,0.9) 60%)', border: '1px solid rgba(125,211,252,0.12)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '12px' }}>
            MiCA-Ready with BizLegal AI
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '28px', lineHeight: 1.75 }}>
            AI-assisted MiCA compliance analysis. Token classification, CASP license requirements, and EU passporting strategy — in under 60 seconds.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://brai.bizlegal-ai.com" className="lx-btn-p">Free MiCA Compliance Scan →</a>
            <Link href="/guides/european-union/mica-casp-license-guide-eu" className="lx-btn-g">MiCA CASP License Guide →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
