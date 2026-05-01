import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UAE & DIFC Crypto Regulation 2025 — Digital Asset Legal Framework | BizLegal AI',
  description: 'Complete guide to UAE and DIFC crypto regulation 2025. VARA, DFSA, ADGM, free zone digital asset frameworks, licensing options, tax advantages. Expert analysis by BizLegal AI.',
  keywords: 'UAE crypto regulation 2025, DIFC digital asset regulation, UAE blockchain regulation, DFSA crypto license, ADGM digital assets, UAE virtual asset law, Dubai crypto regulation',
  alternates: { canonical: 'https://bizlegal-ai.com/uae-difc-crypto-regulation' },
  openGraph: {
    title: 'UAE & DIFC Crypto Regulation 2025 | BizLegal AI',
    description: 'Complete UAE and DIFC digital asset regulatory framework guide. VARA, DFSA, ADGM. Expert compliance analysis.',
    url: 'https://bizlegal-ai.com/uae-difc-crypto-regulation',
  },
}

export default function UAEDIFCPage() {
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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.05)', fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: '#fbbf24', marginBottom: '28px' }}>
          🇦🇪 UAE / DIFC Digital Asset Regulation
        </div>
        <h1 style={{ fontFamily: 'Gloock, serif', fontSize: 'clamp(36px, 5vw, 60px)', color: 'var(--white)', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
          UAE & DIFC Crypto Regulation 2025 —<br /><em style={{ fontStyle: 'italic', color: '#fbbf24' }}>Complete Legal Framework Guide</em>
        </h1>
        <p style={{ fontSize: '17px', color: 'var(--muted)', lineHeight: 1.8, maxWidth: '700px', marginBottom: '36px' }}>
          The UAE is the world's leading digital asset jurisdiction. From VARA's comprehensive licensing framework in Dubai to DFSA regulation in DIFC and ADGM oversight in Abu Dhabi — this guide covers the full UAE digital asset regulatory landscape for founders and investors.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="https://brai.bizlegal-ai.com" className="lx-btn-p">Free UAE Compliance Scan →</a>
          <Link href="/vara-compliance" className="lx-btn-g">VARA Compliance Guide</Link>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Three UAE Frameworks */}
        <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '24px' }}>Three Regulatory Frameworks</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '48px' }}>
          {[
            { name: 'VARA / Dubai', icon: '🏙️', color: '#fbbf24', desc: 'Dubai mainland and most free zones (ex-DIFC). VARA is the world\'s first standalone virtual asset regulator. Covers brokers, exchanges, custody, and investment managers.', link: '/vara-compliance', cta: 'VARA Guide →' },
            { name: 'DFSA / DIFC', icon: '⚖️', color: 'var(--sky)', desc: 'Dubai International Financial Centre. DFSA regulates Investment Token activities. Common law jurisdiction, zero tax, global financial hub. Institutional-grade framework.', link: '/vara-compliance', cta: 'DFSA Guide →' },
            { name: 'FSRA / ADGM', icon: '🏛️', color: 'var(--teal)', desc: 'Abu Dhabi Global Market. FSRA\'s comprehensive virtual asset framework. Strong regulatory clarity and proactive innovation sandbox. Growing institutional presence.', link: '/vara-compliance', cta: 'ADGM Guide →' },
          ].map(f => (
            <div key={f.name} style={{ padding: '28px', borderRadius: '16px', border: `1px solid ${f.color}25`, background: 'rgba(7,9,26,0.7)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Gloock, serif', fontSize: '18px', color: 'var(--white)', marginBottom: '10px' }}>{f.name}</h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65, flex: 1, marginBottom: '16px' }}>{f.desc}</p>
              <Link href={f.link} style={{ fontSize: '12px', color: f.color, fontFamily: 'Geist Mono, monospace', fontWeight: 700, textDecoration: 'none' }}>{f.cta}</Link>
            </div>
          ))}
        </div>

        {/* Why UAE */}
        <div style={{ padding: '40px', borderRadius: '20px', border: '1px solid rgba(251,191,36,0.15)', background: 'rgba(251,191,36,0.03)', marginBottom: '48px' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '26px', color: 'var(--white)', marginBottom: '20px' }}>Why UAE for Digital Assets?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              ['0% Corporate Tax (DIFC/ADGM)', 'Free zone entities operating within DIFC and ADGM benefit from zero corporate income tax.'],
              ['Purpose-Built Regulation', 'VARA is the world\'s only standalone digital asset regulator — framework built for crypto, not retrofitted.'],
              ['Common Law Courts (DIFC)', 'DIFC Courts apply English common law. Court judgments are enforceable globally. Strong investor protection.'],
              ['Strategic Location', 'Timezone bridge between Asia and Europe. Access to GCC, MENA, South Asian markets simultaneously.'],
              ['Regulatory Clarity', 'Licensing pathways are defined and predictable. VARA engages proactively with applicants.'],
              ['Talent & Capital Access', 'UAE is home to a rapidly growing digital asset talent pool and institutional investment capital.'],
            ].map(([title, desc]) => (
              <div key={title}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#fbbf24', marginTop: '2px', flexShrink: 0 }}>✓</span>
                  <div>
                    <strong style={{ fontSize: '13px', color: 'var(--white)', display: 'block', marginBottom: '4px' }}>{title}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65 }}>{desc}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Links */}
        <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '24px' }}>UAE Regulatory Intelligence</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '48px' }}>
          {[
            { title: 'VARA Compliance Guide', desc: 'Full VARA licensing requirements, timelines, and compliance framework.', href: '/vara-compliance' },
            { title: 'VARA MVL License Guide', desc: 'Virtual Asset Broker-Dealer license — requirements and application process.', href: '/vara-mvl-license' },
            { title: 'VARA Token Distribution Agreement', desc: 'VARA-compliant template for UAE token distribution deals.', href: '/guides/uae/vara-token-distribution-agreement-uae' },
            { title: 'UAE Joint Venture Agreement', desc: 'JV agreement template for UAE digital asset and real estate ventures.', href: '/guides/uae/joint-venture-agreement-real-estate-uae' },
          ].map(l => (
            <Link key={l.title} href={l.href} style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(125,211,252,0.08)', background: 'rgba(7,9,26,0.5)', textDecoration: 'none', display: 'block', transition: 'all 0.2s' }}>
              <div style={{ fontFamily: 'Gloock, serif', fontSize: '15px', color: 'var(--white)', marginBottom: '6px' }}>{l.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '10px' }}>{l.desc}</div>
              <div style={{ fontSize: '11px', color: 'var(--sky)', fontFamily: 'Geist Mono, monospace' }}>Read guide →</div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: '48px', borderRadius: '20px', background: 'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.06) 0%, rgba(7,9,26,0.9) 60%)', border: '1px solid rgba(251,191,36,0.12)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '12px' }}>
            Get UAE-Ready with BizLegal AI
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '28px', lineHeight: 1.75 }}>
            BizLegal AI specialises in UAE / DIFC digital asset regulatory intelligence. Free BRAI scan for VARA compliance analysis.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://brai.bizlegal-ai.com" className="lx-btn-p">Free UAE Compliance Scan →</a>
            <a href="https://docstack.bizlegal-ai.com" className="lx-btn-g">VARA Document Templates</a>
          </div>
        </div>
      </div>
    </div>
  )
}
