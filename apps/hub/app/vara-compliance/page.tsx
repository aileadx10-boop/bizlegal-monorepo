import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VARA Compliance Guide UAE 2025 — Digital Asset Regulatory Intelligence | BizLegal AI',
  description: 'Complete VARA compliance guide for UAE digital asset ventures 2025. VARA licensing requirements, MVL, MPI, MSC licenses, DIFC regulatory framework. AI-assisted compliance analysis by BizLegal AI.',
  keywords: 'VARA compliance UAE, VARA license 2025, digital asset regulation UAE, VARA MVL license, DIFC crypto compliance, UAE virtual asset regulation, VARA DFSA',
  alternates: { canonical: 'https://bizlegal-ai.com/vara-compliance' },
  openGraph: {
    title: 'VARA Compliance Guide UAE 2025 | BizLegal AI',
    description: 'Complete VARA compliance guide for UAE digital asset ventures. MVL, MPI, MSC licenses. AI-assisted regulatory analysis.',
    url: 'https://bizlegal-ai.com/vara-compliance',
  },
}

const VARA_LICENSES = [
  { code: 'MVL', name: 'Virtual Asset Broker-Dealer', desc: 'Allows operating a VA broker or dealer, facilitating transactions between buyers and sellers.', capital: '$250,000' },
  { code: 'MPI', name: 'Virtual Asset Management & Investment', desc: 'Covers portfolio management and investment advice for virtual asset clients.', capital: '$150,000' },
  { code: 'MSC', name: 'Virtual Asset Exchange', desc: 'Operating a platform for trading virtual assets against fiat or other virtual assets.', capital: '$2,000,000' },
  { code: 'MRS', name: 'Virtual Asset Transfer & Settlement', desc: 'Transfer and settlement of virtual assets on behalf of other persons.', capital: '$500,000' },
]

const TIMELINE = [
  { step: 'Entity Registration', weeks: '1–2', detail: 'Register UAE mainland or free zone entity (DIFC, ADGM)' },
  { step: 'Pre-Application Consultation', weeks: '2–4', detail: 'Initial VARA/DFSA engagement, regulatory mapping' },
  { step: 'VARA Application Filing', weeks: '4–6', detail: 'Full application with business plan, AML/CFT policies, technology audit' },
  { step: 'VARA Review Period', weeks: '8–16', detail: 'Regulator review, queries, due diligence on key persons' },
  { step: 'In-Principle Approval', weeks: '2–4', detail: 'Conditional approval, final requirements satisfied' },
  { step: 'License Issued', weeks: '1–2', detail: 'Full license granted, operations may commence' },
]

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'VARA Compliance Guide UAE 2025',
  description: 'Complete guide to VARA compliance for UAE digital asset ventures — licensing, requirements, and regulatory framework.',
  author: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
  publisher: { '@type': 'Organization', name: 'BizLegal AI' },
  dateModified: '2025-03-01',
  mainEntityOfPage: 'https://bizlegal-ai.com/vara-compliance',
}

export default function VARACompliancePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingTop: '36px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      {/* Nav */}
      <div style={{ background: 'rgba(7,9,26,0.95)', borderBottom: '1px solid rgba(125,211,252,0.08)' }}>
        <div className="container" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" className="nav-logo" style={{ marginRight: 'auto' }}>DOR<em>INNOVATIONS</em></Link>
          <a href="https://brai.bizlegal-ai.com" className="btn-ghost" style={{ fontSize: '12px' }}>Free Scan</a>
          <a href="https://docstack.bizlegal-ai.com" className="btn-primary" style={{ fontSize: '12px' }}>Templates →</a>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: '80px 24px 60px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(125,211,252,0.2)', background: 'rgba(125,211,252,0.05)', fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: 'var(--sky)', marginBottom: '28px' }}>
          🇦🇪 UAE VARA Compliance 2025
        </div>
        <h1 style={{ fontFamily: 'Gloock, serif', fontSize: 'clamp(36px, 5vw, 60px)', color: 'var(--white)', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
          VARA Compliance Guide —<br /><em style={{ fontStyle: 'italic', color: 'var(--sky)' }}>UAE Digital Asset Ventures 2025</em>
        </h1>
        <p style={{ fontSize: '17px', color: 'var(--muted)', lineHeight: 1.8, maxWidth: '680px', marginBottom: '36px' }}>
          The Virtual Assets Regulatory Authority (VARA) is the world's first purpose-built digital asset regulator. This guide covers VARA licensing requirements, application timelines, capital requirements, and compliance obligations for digital asset ventures operating in UAE and DIFC.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="https://brai.bizlegal-ai.com" className="lx-btn-p">Free VARA Compliance Scan →</a>
          <a href="https://docstack.bizlegal-ai.com" className="lx-btn-g">VARA Document Templates</a>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Overview */}
        <div style={{ padding: '40px', borderRadius: '20px', border: '1px solid rgba(125,211,252,0.1)', background: 'rgba(7,9,26,0.7)', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '26px', color: 'var(--white)', marginBottom: '20px' }}>What Is VARA?</h2>
          <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '16px' }}>
            VARA — the Virtual Assets Regulatory Authority — was established in Dubai, UAE in 2022 as the world's first standalone regulator dedicated exclusively to virtual assets. VARA operates under Law No. (4) of 2022 and regulates virtual asset service providers (VASPs) operating in or from Dubai (excluding DIFC, which falls under DFSA jurisdiction).
          </p>
          <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.8 }}>
            VARA's mandate covers virtual asset issuance, exchange, brokerage, investment management, custody, and transfer services. All entities wishing to operate a virtual asset business in Dubai must obtain a VARA license before commencing activities.
          </p>
        </div>

        {/* License Types */}
        <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '24px' }}>VARA License Types</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
          {VARA_LICENSES.map(lic => (
            <div key={lic.code} style={{ padding: '28px', borderRadius: '16px', border: '1px solid rgba(125,211,252,0.1)', background: 'rgba(7,9,26,0.6)' }}>
              <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '12px', color: 'var(--sky)', fontWeight: 700, marginBottom: '8px' }}>{lic.code}</div>
              <h3 style={{ fontFamily: 'Gloock, serif', fontSize: '17px', color: 'var(--white)', marginBottom: '10px' }}>{lic.name}</h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '12px' }}>{lic.desc}</p>
              <div style={{ fontSize: '12px', fontFamily: 'Geist Mono, monospace', color: 'var(--teal)' }}>Min capital: {lic.capital}</div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '24px' }}>Licensing Timeline</h2>
        <div style={{ marginBottom: '40px' }}>
          {TIMELINE.map((t, i) => (
            <div key={t.step} style={{ display: 'flex', gap: '20px', paddingBottom: '24px', position: 'relative' }}>
              {i < TIMELINE.length - 1 && (
                <div style={{ position: 'absolute', left: '20px', top: '44px', bottom: 0, width: '1px', background: 'rgba(125,211,252,0.1)' }} />
              )}
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, background: 'rgba(125,211,252,0.08)', border: '1px solid rgba(125,211,252,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: 'var(--sky)', fontWeight: 700 }}>{i + 1}</div>
              <div style={{ paddingTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'Gloock, serif', fontSize: '16px', color: 'var(--white)' }}>{t.step}</span>
                  <span style={{ fontSize: '10px', fontFamily: 'Geist Mono, monospace', color: 'var(--teal)', background: 'rgba(94,234,212,0.08)', padding: '2px 8px', borderRadius: '4px' }}>{t.weeks} wks</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>{t.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Key Requirements */}
        <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '24px' }}>Key VARA Compliance Requirements</h2>
        <div style={{ display: 'grid', gap: '12px', marginBottom: '40px' }}>
          {[
            ['AML/CFT Programme', 'Anti-money laundering and counter-terrorism financing policies, procedures, and controls. VARA requires a dedicated MLRO (Money Laundering Reporting Officer).'],
            ['Technology Governance', 'Robust IT security, cybersecurity framework, disaster recovery, and system audit requirements. Third-party audits may be required.'],
            ['Fit & Proper Assessment', 'All senior management and directors must pass VARA fit-and-proper assessments. This includes background checks, qualifications, and UAE residency requirements.'],
            ['Capital Adequacy', 'Minimum capital requirements vary by license type ($150k–$2M). Capital must be maintained on an ongoing basis.'],
            ['Custody & Safeguarding', 'Client virtual assets must be held separately from company assets. Approved custody arrangements required for exchanges and brokers.'],
            ['Disclosure & Transparency', 'Regular reporting to VARA, including financial statements, suspicious transaction reports, and material change notifications.'],
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

        {/* CTA */}
        <div style={{ padding: '48px', borderRadius: '20px', background: 'radial-gradient(ellipse at 50% 0%, rgba(125,211,252,0.07) 0%, rgba(7,9,26,0.9) 60%)', border: '1px solid rgba(125,211,252,0.12)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '12px' }}>
            Get VARA-Ready with BizLegal AI
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '28px', lineHeight: 1.75 }}>
            AI-assisted VARA compliance analysis. Identify your exposure before applying. Commercial attorney depth, AI speed.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://brai.bizlegal-ai.com" className="lx-btn-p">Free VARA Compliance Scan →</a>
            <a href="https://docstack.bizlegal-ai.com" className="lx-btn-g">VARA Document Templates</a>
          </div>
        </div>
      </div>
    </div>
  )
}
