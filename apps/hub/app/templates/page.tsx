import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal Template Gallery — 38+ Digital Asset Contract Templates | BizLegal AI',
  description: 'Browse 38+ commercial attorney-drafted digital asset legal templates. VARA, MiCA, SEC, FCA, MAS jurisdiction-ready. JV agreements, token agreements, NDAs, capital call. From $49.',
  keywords: 'digital asset legal templates, VARA contract templates, MiCA token agreement, crypto legal documents, UAE legal templates, digital asset JV agreement, BizLegal AI templates',
  alternates: { canonical: 'https://bizlegal-ai.com/templates' },
  openGraph: {
    title: 'Legal Template Gallery | BizLegal AI',
    description: '38+ digital asset legal templates. VARA, MiCA, SEC ready. DOCX + PDF download. From $49.',
    url: 'https://bizlegal-ai.com/templates',
  },
}

const FILTERS = ['All', '🇦🇪 UAE / VARA', '🇪🇺 EU / MiCA', '🇺🇸 US / SEC', '🇸🇬 Singapore', '🇬🇧 UK / FCA', '🌍 Multi-Jurisdiction']

const TEMPLATES = [
  // UAE / VARA
  { id: 1, name: 'VARA Token Distribution Agreement', juri: 'UAE / DIFC', cat: '🇦🇪 UAE / VARA', price: '$49', tag: 'POPULAR', tagColor: '#fbbf24', desc: 'VARA-compliant token distribution for UAE digital asset ventures. Covers DFSA and DIFC regulatory requirements, virtual asset transfer obligations.', docs: ['DOCX', 'PDF'], time: '~60 sec' },
  { id: 2, name: 'VARA Capital Call Agreement', juri: 'UAE / DIFC', cat: '🇦🇪 UAE / VARA', price: '$49', tag: 'NEW', tagColor: 'var(--teal)', desc: 'Capital call agreement structured for VARA-compliant UAE digital asset funds. Includes DIFC regulatory schedules and investor protection provisions.', docs: ['DOCX', 'PDF'], time: '~60 sec' },
  { id: 3, name: 'UAE Digital Asset Joint Venture Agreement', juri: 'UAE / DIFC', cat: '🇦🇪 UAE / VARA', price: '$69', tag: '', tagColor: '', desc: 'Joint venture agreement for UAE digital asset ventures. VARA compliance schedules, profit distribution, governance, and exit provisions.', docs: ['DOCX', 'PDF'], time: '~90 sec' },
  { id: 4, name: 'NDA — UAE Digital Asset Ventures', juri: 'UAE', cat: '🇦🇪 UAE / VARA', price: '$29', tag: '', tagColor: '', desc: 'Mutual NDA covering IP, tokenomics, and proprietary technology for UAE digital asset deals. Jurisdiction-specific enforcement provisions.', docs: ['DOCX', 'PDF'], time: '~45 sec' },
  { id: 5, name: 'VARA MVL License Application Pack', juri: 'UAE / VARA', cat: '🇦🇪 UAE / VARA', price: '$149', tag: 'BUNDLE', tagColor: 'var(--indigo)', desc: 'Complete documentation bundle for VARA MVL broker-dealer license application. AML policy template, governance docs, business plan structure.', docs: ['DOCX', 'PDF', 'Bundle'], time: '~3 min' },
  { id: 6, name: 'UAE Real Estate JV Agreement', juri: 'UAE', cat: '🇦🇪 UAE / VARA', price: '$49', tag: '', tagColor: '', desc: 'Joint venture agreement for UAE real estate investment. Local regulatory compliance, profit sharing, management rights, exit mechanisms.', docs: ['DOCX', 'PDF'], time: '~60 sec' },

  // EU / MiCA
  { id: 7, name: 'MiCA Token Sale Agreement', juri: 'EU', cat: '🇪🇺 EU / MiCA', price: '$49', tag: 'POPULAR', tagColor: '#fbbf24', desc: 'MiCA-compliant token sale agreement. Covers white paper obligations, cooling-off period, investor rights, and EU passporting provisions.', docs: ['DOCX', 'PDF'], time: '~60 sec' },
  { id: 8, name: 'MiCA CASP Service Agreement', juri: 'EU', cat: '🇪🇺 EU / MiCA', price: '$59', tag: '', tagColor: '', desc: 'Customer service agreement for MiCA-licensed Crypto-Asset Service Providers. Client onboarding, AML obligations, complaint handling.', docs: ['DOCX', 'PDF'], time: '~75 sec' },
  { id: 9, name: 'MiCA ART Issuance Agreement', juri: 'EU', cat: '🇪🇺 EU / MiCA', price: '$79', tag: 'NEW', tagColor: 'var(--teal)', desc: 'Asset-Referenced Token issuance agreement under MiCA Title III. Reserve asset management, redemption rights, supervisory requirements.', docs: ['DOCX', 'PDF'], time: '~90 sec' },
  { id: 10, name: 'EU Digital Asset NDA', juri: 'EU', cat: '🇪🇺 EU / MiCA', price: '$29', tag: '', tagColor: '', desc: 'GDPR-compliant NDA for EU digital asset and blockchain technology deals. Trade secret protection, IP ownership, enforcement provisions.', docs: ['DOCX', 'PDF'], time: '~45 sec' },

  // US / SEC
  { id: 11, name: 'Reg D 506(b) Private Placement Memorandum', juri: 'United States', cat: '🇺🇸 US / SEC', price: '$99', tag: 'POPULAR', tagColor: '#fbbf24', desc: 'Reg D 506(b) PPM for US private placements. Accredited investor requirements, risk factors, subscription agreement included.', docs: ['DOCX', 'PDF'], time: '~2 min' },
  { id: 12, name: 'LLC Operating Agreement — Digital Asset', juri: 'United States', cat: '🇺🇸 US / SEC', price: '$49', tag: '', tagColor: '', desc: 'Delaware or Wyoming LLC operating agreement for digital asset ventures. Token equity provisions, governance, management rights.', docs: ['DOCX', 'PDF'], time: '~60 sec' },
  { id: 13, name: 'Digital Asset SAFT Agreement', juri: 'United States', cat: '🇺🇸 US / SEC', price: '$69', tag: '', tagColor: '', desc: 'Simple Agreement for Future Tokens (SAFT) for US digital asset presales. SEC compliance, accredited investor protections, vesting provisions.', docs: ['DOCX', 'PDF'], time: '~75 sec' },
  { id: 14, name: 'US Capital Call Agreement', juri: 'United States', cat: '🇺🇸 US / SEC', price: '$49', tag: '', tagColor: '', desc: 'Capital call agreement for US digital asset fund structures. Reg D compliance, partner obligations, default provisions.', docs: ['DOCX', 'PDF'], time: '~60 sec' },

  // Singapore
  { id: 15, name: 'MAS DPT Services Agreement', juri: 'Singapore', cat: '🇸🇬 Singapore', price: '$59', tag: 'NEW', tagColor: 'var(--teal)', desc: 'Digital Payment Token services agreement under MAS Payment Services Act. Customer due diligence, transaction limits, reporting obligations.', docs: ['DOCX', 'PDF'], time: '~75 sec' },
  { id: 16, name: 'Singapore Capital Call Agreement', juri: 'Singapore', cat: '🇸🇬 Singapore', price: '$49', tag: '', tagColor: '', desc: 'Capital call agreement for Singapore digital asset funds and VC structures. MAS framework compliance, limited partner obligations.', docs: ['DOCX', 'PDF'], time: '~60 sec' },

  // Multi-Jurisdiction
  { id: 17, name: 'Cross-Border Digital Asset JV', juri: 'UAE / EU / US', cat: '🌍 Multi-Jurisdiction', price: '$99', tag: 'BUNDLE', tagColor: 'var(--indigo)', desc: 'Cross-border joint venture agreement for digital asset ventures operating across UAE, EU, and US. Jurisdiction-specific compliance annexures included.', docs: ['DOCX', 'PDF', '3 Annexures'], time: '~3 min' },
  { id: 18, name: 'Global NDA — Digital Assets', juri: 'Multi-Jurisdiction', cat: '🌍 Multi-Jurisdiction', price: '$39', tag: '', tagColor: '', desc: 'Multi-jurisdiction NDA for international digital asset transactions. Choice of law provisions for UAE, EU, US, UK, and Singapore.', docs: ['DOCX', 'PDF'], time: '~60 sec' },
]

export default function TemplatesPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Nav */}
      <div style={{ background: 'rgba(7,9,26,0.95)', borderBottom: '1px solid rgba(125,211,252,0.08)', position: 'sticky', top: 0, zIndex: 200 }}>
        <div className="container" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" className="nav-logo" style={{ marginRight: 'auto' }}>DOR<em>INNOVATIONS</em></Link>
          <Link href="/blog" style={{ fontSize: '12px', color: 'var(--muted)', textDecoration: 'none', fontFamily: 'Geist Mono, monospace' }}>Blog</Link>
          <a href="https://brai.bizlegal-ai.com" className="btn-ghost" style={{ fontSize: '12px' }}>Free Scan</a>
          <a href="https://docstack.bizlegal-ai.com" className="btn-primary" style={{ fontSize: '12px' }}>Generate Contract →</a>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: '80px 24px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ maxWidth: '720px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(125,211,252,0.2)', background: 'rgba(125,211,252,0.05)', fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: 'var(--sky)', marginBottom: '24px' }}>
            38+ Templates &middot; 6 Jurisdictions &middot; DOCX + PDF
          </div>
          <h1 style={{ fontFamily: 'Gloock, serif', fontSize: 'clamp(36px, 5vw, 60px)', color: 'var(--white)', lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-0.02em' }}>
            Digital Asset Legal<br /><em style={{ fontStyle: 'italic', color: 'var(--sky)' }}>Template Gallery</em>
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '32px' }}>
            Commercial attorney-drafted contracts for every digital asset scenario. VARA, MiCA, SEC, FCA, MAS regulatory context auto-applied. DOCX + PDF in 60 seconds. From $49.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="https://docstack.bizlegal-ai.com" className="lx-btn-p">Browse & Generate on DocStack →</a>
            <a href="https://brai.bizlegal-ai.com" className="lx-btn-g">Free Compliance Scan First</a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(125,211,252,0.08)', marginBottom: '48px' }}>
          {[['38+','Templates'], ['6','Jurisdictions'], ['~60s','Generation Time'], ['Cancel','Anytime']].map(([v, l]) => (
            <div key={l} style={{ padding: '28px 24px', background: 'rgba(7,9,26,0.6)', textAlign: 'center', borderRight: '1px solid rgba(125,211,252,0.06)' }}>
              <div style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '6px' }}>{v}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'Geist Mono, monospace' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {FILTERS.map((f, i) => (
            <div key={f} style={{ padding: '7px 16px', borderRadius: '100px', border: '1px solid rgba(125,211,252,0.12)', background: i === 0 ? 'rgba(125,211,252,0.1)' : 'rgba(7,9,26,0.5)', fontSize: '12px', fontFamily: 'Geist Mono, monospace', color: i === 0 ? 'var(--sky)' : 'var(--muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {f}
            </div>
          ))}
        </div>

        {/* Template Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '60px' }}>
          {TEMPLATES.map(t => (
            <a key={t.id} href="https://docstack.bizlegal-ai.com" className="tmpl-card" target="_blank" rel="noreferrer">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: 'var(--sky)', background: 'rgba(125,211,252,0.07)', padding: '3px 10px', borderRadius: '4px', border: '1px solid rgba(125,211,252,0.15)' }}>{t.juri}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {t.tag && <span style={{ fontSize: '9px', fontFamily: 'Geist Mono, monospace', fontWeight: 700, color: t.tagColor, background: `${t.tagColor}15`, padding: '2px 7px', borderRadius: '4px', border: `1px solid ${t.tagColor}25` }}>{t.tag}</span>}
                  <span style={{ fontFamily: 'Gloock, serif', fontSize: '20px', color: 'var(--teal)' }}>{t.price}</span>
                </div>
              </div>
              <h3 style={{ fontFamily: 'Gloock, serif', fontSize: '16px', color: 'var(--white)', lineHeight: 1.35, marginBottom: '10px' }}>{t.name}</h3>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '16px', flex: 1 }}>{t.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid rgba(125,211,252,0.06)' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {t.docs.map(d => <span key={d} style={{ fontSize: '10px', fontFamily: 'Geist Mono, monospace', color: 'var(--dim)', background: 'rgba(125,211,252,0.04)', padding: '2px 7px', borderRadius: '3px', border: '1px solid rgba(125,211,252,0.08)' }}>{d}</span>)}
                </div>
                <span style={{ fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: 'var(--teal)' }}>⚡ {t.time}</span>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: '60px', borderRadius: '20px', background: 'radial-gradient(ellipse at 50% 0%, rgba(125,211,252,0.07) 0%, rgba(7,9,26,0.9) 60%)', border: '1px solid rgba(125,211,252,0.12)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '32px', color: 'var(--white)', marginBottom: '12px' }}>Need a custom template?</h2>
          <p style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '28px', lineHeight: 1.75, maxWidth: '500px', margin: '0 auto 28px' }}>
            Not seeing your jurisdiction or document type? Run a free BRAI scan first — it identifies exactly which documents your venture needs.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://docstack.bizlegal-ai.com" className="lx-btn-p">Open DocStack Template Library →</a>
            <a href="https://brai.bizlegal-ai.com" className="lx-btn-g">Free Compliance Scan</a>
          </div>
        </div>
      </div>
    </div>
  )
}
