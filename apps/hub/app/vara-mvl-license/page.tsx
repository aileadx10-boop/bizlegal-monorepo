import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VARA MVL License Guide UAE 2025 — Virtual Asset Broker-Dealer | BizLegal AI',
  description: 'Complete guide to the VARA MVL (Virtual Asset Broker-Dealer) license in UAE 2025. Requirements, application process, capital requirements, AML obligations. AI-assisted by BizLegal AI.',
  keywords: 'VARA MVL license, VARA broker-dealer license UAE, virtual asset broker UAE, MVL license requirements, VARA application UAE, Dubai crypto broker license',
  alternates: { canonical: 'https://bizlegal-ai.com/vara-mvl-license' },
  openGraph: {
    title: 'VARA MVL License Guide UAE 2025 | BizLegal AI',
    description: 'Complete VARA MVL broker-dealer license guide. Requirements, timeline, capital. AI-assisted compliance analysis.',
    url: 'https://bizlegal-ai.com/vara-mvl-license',
  },
}

export default function VARAMVLPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingTop: '36px' }}>
      <div style={{ background: 'rgba(7,9,26,0.95)', borderBottom: '1px solid rgba(125,211,252,0.08)' }}>
        <div className="container" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" className="nav-logo" style={{ marginRight: 'auto' }}>DOR<em>INNOVATIONS</em></Link>
          <a href="https://brai.bizlegal-ai.com" className="btn-ghost" style={{ fontSize: '12px' }}>Free Scan</a>
          <a href="https://docstack.bizlegal-ai.com" className="btn-primary" style={{ fontSize: '12px' }}>Templates →</a>
        </div>
      </div>

      <div style={{ padding: '80px 24px 60px', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <Link href="/vara-compliance" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', border: '1px solid rgba(125,211,252,0.15)', fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: 'var(--muted)', textDecoration: 'none' }}>← VARA Compliance</Link>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.05)', fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: '#fbbf24' }}>🇦🇪 VARA MVL License</div>
        </div>
        <h1 style={{ fontFamily: 'Gloock, serif', fontSize: 'clamp(32px, 5vw, 56px)', color: 'var(--white)', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
          VARA MVL License —<br /><em style={{ fontStyle: 'italic', color: '#fbbf24' }}>Virtual Asset Broker-Dealer UAE 2025</em>
        </h1>
        <p style={{ fontSize: '17px', color: 'var(--muted)', lineHeight: 1.8, maxWidth: '680px', marginBottom: '36px' }}>
          The VARA MVL (Market-Making and Virtual Asset Broker-Dealer) license is the primary route to operating a virtual asset brokerage in Dubai, UAE. This guide covers the full MVL license application process, requirements, capital obligations, and compliance framework.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="https://brai.bizlegal-ai.com" className="lx-btn-p">Free MVL Compliance Analysis →</a>
          <a href="https://docstack.bizlegal-ai.com" className="lx-btn-g">VARA Document Templates</a>
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* What is MVL */}
        <div style={{ padding: '36px', borderRadius: '18px', border: '1px solid rgba(251,191,36,0.15)', background: 'rgba(251,191,36,0.03)', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '24px', color: 'var(--white)', marginBottom: '16px' }}>What is the VARA MVL License?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '16px' }}>
            The VARA MVL (Virtual Asset Broker-Dealer) license authorises the holder to operate as a virtual asset broker or dealer in Dubai — facilitating the purchase, sale, and exchange of virtual assets between buyers and sellers as principal or agent.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8 }}>
            The MVL license is distinct from the MSC (exchange) license. MVL holders act as intermediaries rather than operating a centralised order book. This makes MVL the appropriate license for OTC desks, digital asset brokerage firms, and B2B virtual asset transaction facilitators.
          </p>
        </div>

        {/* Requirements */}
        <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '24px' }}>MVL License Requirements</h2>
        <div style={{ display: 'grid', gap: '12px', marginBottom: '40px' }}>
          {[
            ['Legal Entity', 'UAE mainland or Dubai free zone entity required. ADGM and DIFC entities may operate under DFSA regulation.', '$0'],
            ['Minimum Capital', 'AED 2,000,000 (~$545,000 USD) minimum paid-up capital.', 'AED 2M'],
            ['Management Team', 'Senior management including CEO and Compliance Officer must be fit-and-proper assessed by VARA.', 'Required'],
            ['AML/CFT Programme', 'Comprehensive AML/CFT policies, MLRO appointment, KYC/KYB procedures, transaction monitoring system.', 'Mandatory'],
            ['Technology Audit', 'Independent technology and cybersecurity audit of trading and operational systems.', 'Required'],
            ['Business Plan', 'Detailed 3-year business plan including financial projections, revenue model, and regulatory compliance roadmap.', 'Required'],
            ['Professional Indemnity Insurance', 'PI insurance coverage appropriate to the scale of operations.', 'Required'],
          ].map(([req, desc, tag]) => (
            <div key={req} style={{ padding: '20px 24px', borderRadius: '12px', border: '1px solid rgba(125,211,252,0.08)', background: 'rgba(7,9,26,0.5)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--teal)', fontSize: '14px', marginTop: '1px', flexShrink: 0 }}>✓</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <strong style={{ color: 'var(--white)', fontSize: '14px' }}>{req}</strong>
                  <span style={{ fontSize: '10px', fontFamily: 'Geist Mono, monospace', color: '#fbbf24', background: 'rgba(251,191,36,0.08)', padding: '1px 7px', borderRadius: '4px', border: '1px solid rgba(251,191,36,0.15)' }}>{tag}</span>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65 }}>{desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Application Steps */}
        <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '24px' }}>MVL Application Process</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '40px' }}>
          {[
            ['Pre-Application', 'Engage VARA for initial regulatory consultation. Assess licensing requirements against your business model.', '2–4 wks'],
            ['Entity Formation', 'Incorporate UAE entity. Establish corporate structure, ownership, and governance documentation.', '2–4 wks'],
            ['Document Preparation', 'Prepare business plan, policies and procedures, AML/CFT programme, technology audit, financial projections.', '6–10 wks'],
            ['VARA Application Submission', 'Submit full application via VARA portal with all supporting documentation and application fee.', '1 wk'],
            ['VARA Review', 'VARA reviews application, may request additional information or clarifications. Fit-and-proper assessments.', '8–16 wks'],
            ['In-Principle Approval', 'VARA issues in-principle approval with conditions. Remaining requirements satisfied.', '2–4 wks'],
            ['License Issuance', 'Full MVL license issued. Virtual asset brokerage operations may commence.', '1–2 wks'],
          ].map(([step, detail, timeline], i, arr) => (
            <div key={step} style={{ display: 'flex', gap: '20px', paddingBottom: '20px', position: 'relative' }}>
              {i < arr.length - 1 && <div style={{ position: 'absolute', left: '20px', top: '44px', bottom: 0, width: '1px', background: 'rgba(251,191,36,0.1)' }} />}
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontFamily: 'Geist Mono, monospace', color: '#fbbf24', fontWeight: 700 }}>{i + 1}</div>
              <div style={{ paddingTop: '8px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'Gloock, serif', fontSize: '15px', color: 'var(--white)' }}>{step}</span>
                  <span style={{ fontSize: '10px', fontFamily: 'Geist Mono, monospace', color: 'var(--teal)', background: 'rgba(94,234,212,0.08)', padding: '2px 8px', borderRadius: '4px' }}>{timeline}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>{detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: '48px', borderRadius: '20px', background: 'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.05) 0%, rgba(7,9,26,0.9) 60%)', border: '1px solid rgba(251,191,36,0.12)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '12px' }}>
            Planning your VARA MVL application?
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '28px', lineHeight: 1.75 }}>
            BizLegal AI provides AI-assisted VARA compliance analysis and jurisdiction-ready documentation for MVL applicants. Commercial attorney depth, AI speed.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://brai.bizlegal-ai.com" className="lx-btn-p">Free VARA MVL Analysis →</a>
            <Link href="/guides/uae/vara-mvl-license-guide-uae" className="lx-btn-g">Full VARA MVL Guide →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
