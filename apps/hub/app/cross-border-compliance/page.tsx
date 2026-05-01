import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cross-Border Digital Asset Compliance — Multi-Jurisdiction Analysis | BizLegal AI',
  description: 'Cross-border digital asset compliance analysis. UAE to EU to US regulatory structuring for digital asset ventures. VARA, MiCA, SEC, MAS multi-jurisdiction strategy by BizLegal AI.',
  keywords: 'cross-border digital asset compliance, multi-jurisdiction crypto regulation, UAE EU US digital asset structuring, international crypto compliance, digital asset cross-border regulatory',
  alternates: { canonical: 'https://bizlegal-ai.com/cross-border-compliance' },
  openGraph: {
    title: 'Cross-Border Digital Asset Compliance | BizLegal AI',
    description: 'Multi-jurisdiction digital asset regulatory strategy. UAE → EU → US → Singapore. One intelligence layer.',
    url: 'https://bizlegal-ai.com/cross-border-compliance',
  },
}

const JURISDICTION_MATRIX = [
  { country: 'UAE / DIFC', flag: '🇦🇪', regulator: 'VARA / DFSA', strength: 'Most progressive digital asset framework. Full DAO, DeFi, and NFT regulation. Zero corporate tax in DIFC.', setup: '4–8 wks', color: '#fbbf24' },
  { country: 'European Union', flag: '🇪🇺', regulator: 'MiCA / ESMA', strength: 'Single passport — one license covers all 27 EU member states. Comprehensive ART/EMT/utility token framework.', setup: '12–20 wks', color: 'var(--sky)' },
  { country: 'United States', flag: '🇺🇸', regulator: 'SEC / CFTC', strength: 'Largest investor market. Howey Test complexity, Reg D pathway for fundraising. Delaware LLC preferred structure.', setup: '6–12 wks', color: 'var(--teal)' },
  { country: 'Singapore', flag: '🇸🇬', regulator: 'MAS', strength: 'Asia-Pacific gateway. Payment Services Act DPT license. Common law jurisdiction with crypto-friendly courts.', setup: '8–14 wks', color: 'var(--indigo)' },
  { country: 'United Kingdom', flag: '🇬🇧', regulator: 'FCA', strength: 'Post-MiCA regulatory framework. Strong institutional finance ecosystem. FCA cryptoasset registration pathway.', setup: '10–16 wks', color: '#38bdf8' },
  { country: 'Canada', flag: '🇨🇦', regulator: 'CSA / FINTRAC', strength: 'FINTRAC MSB registration for crypto businesses. Provincial securities regulator oversight for token offerings.', setup: '4–8 wks', color: '#fb7185' },
]

export default function CrossBorderCompliancePage() {
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
          🌍 Multi-Jurisdiction Compliance
        </div>
        <h1 style={{ fontFamily: 'Gloock, serif', fontSize: 'clamp(36px, 5vw, 60px)', color: 'var(--white)', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
          Cross-Border Digital Asset<br /><em style={{ fontStyle: 'italic', color: 'var(--sky)' }}>Compliance Strategy</em>
        </h1>
        <p style={{ fontSize: '17px', color: 'var(--muted)', lineHeight: 1.8, maxWidth: '680px', marginBottom: '36px' }}>
          Digital asset ventures don't operate within a single jurisdiction. BizLegal AI provides multi-jurisdiction regulatory structuring — identifying the optimal compliance pathway across UAE, EU, US, UK, Singapore, and Canada simultaneously.
        </p>
        <a href="https://brai.bizlegal-ai.com" className="lx-btn-p">Multi-Jurisdiction Scan →</a>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Why it matters */}
        <div style={{ padding: '36px', borderRadius: '18px', border: '1px solid rgba(125,211,252,0.1)', background: 'rgba(7,9,26,0.7)', marginBottom: '48px' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '24px', color: 'var(--white)', marginBottom: '16px' }}>Why Cross-Border Compliance Matters</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '16px' }}>
            The blockchain is borderless. Your users, investors, and counterparties are distributed globally. Multiple regulators — SEC, VARA, FCA, MAS — can simultaneously claim jurisdiction over the same digital asset activity. Ignorance of cross-border exposure is not a defense.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8 }}>
            BizLegal AI maps your specific venture structure against all six major digital asset jurisdictions in a single analysis — identifying where you need licenses, where you're at risk, and the most efficient compliance pathway.
          </p>
        </div>

        {/* Jurisdiction Matrix */}
        <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '24px' }}>6-Jurisdiction Regulatory Matrix</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '48px' }}>
          {JURISDICTION_MATRIX.map(j => (
            <div key={j.country} style={{ padding: '24px', borderRadius: '14px', border: `1px solid ${j.color}20`, background: 'rgba(7,9,26,0.6)', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '20px', alignItems: 'center' }}>
              <span style={{ fontSize: '32px' }}>{j.flag}</span>
              <div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <strong style={{ fontFamily: 'Gloock, serif', fontSize: '16px', color: 'var(--white)' }}>{j.country}</strong>
                  <span style={{ fontSize: '10px', fontFamily: 'Geist Mono, monospace', color: j.color, background: `${j.color}10`, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${j.color}20` }}>{j.regulator}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{j.strength}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '10px', color: 'var(--dim)', fontFamily: 'Geist Mono, monospace', marginBottom: '2px' }}>Setup time</div>
                <div style={{ fontSize: '13px', color: j.color, fontFamily: 'Geist Mono, monospace', fontWeight: 700 }}>{j.setup}</div>
              </div>
            </div>
          ))}
        </div>

        {/* UAE Primary */}
        <div style={{ padding: '32px', borderRadius: '18px', border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.03)', marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '28px' }}>🇦🇪</span>
            <div>
              <h3 style={{ fontFamily: 'Gloock, serif', fontSize: '20px', color: 'var(--white)', marginBottom: '10px' }}>UAE / DIFC — BizLegal AI Primary Focus</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8 }}>
                The UAE remains the world's most progressive digital asset jurisdiction. VARA's comprehensive framework covers every aspect of the digital asset lifecycle — from issuance to exchange to custody. DIFC offers zero corporate tax, common law courts, and direct DFSA oversight for institutional-grade ventures. BizLegal AI has deep expertise in VARA/DFSA regulatory strategy as its primary focus.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '60px', borderRadius: '20px', background: 'radial-gradient(ellipse at 50% 0%, rgba(125,211,252,0.07) 0%, rgba(7,9,26,0.9) 60%)', border: '1px solid rgba(125,211,252,0.12)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '32px', color: 'var(--white)', marginBottom: '12px' }}>
            Map your cross-border exposure
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '28px', lineHeight: 1.75 }}>
            One BRAI scan covers all 6 jurisdictions. Free in under 60 seconds.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://brai.bizlegal-ai.com" className="lx-btn-p" style={{ fontSize: '15px', padding: '16px 40px' }}>Run Multi-Jurisdiction Scan →</a>
            <Link href="/about" className="lx-btn-g">About BizLegal AI</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
