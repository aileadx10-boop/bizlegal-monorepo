import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'MiCA Compliance Software — EU Crypto Regulation Monitoring | BizLegal AI',
  description:
    'Real-time MiCA compliance monitoring for CASPs, crypto exchanges, and token issuers. Track MiCA Article 45 obligations, ESMA guidance updates, and authorization timelines automatically.',
  alternates: { canonical: 'https://bizlegal-ai.com/use-cases/mica-compliance' },
  openGraph: {
    title: 'MiCA Compliance Software — Automate EU Crypto Regulation Monitoring',
    description:
      'BizLegal Hub Pro monitors MiCA regulatory updates across 50+ EU jurisdictions. CASP authorization checklists, whitepaper obligations, and ESMA guidance alerts.',
    url: 'https://bizlegal-ai.com/use-cases/mica-compliance',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is MiCA and when does it apply?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MiCA (Markets in Crypto-Assets Regulation, EU 2023/1114) is the EU\'s comprehensive regulatory framework for crypto assets, fully in force since December 30, 2024. It applies to any entity issuing crypto-assets to EU residents, operating a crypto-asset trading platform, providing custody, exchange, or advisory services for crypto-assets in the EU, or providing transfer services for crypto-assets within the EU.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is MiCA Article 45 and why does it matter for exchanges?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MiCA Article 45 governs the obligations of Crypto-Asset Service Providers (CASPs) operating trading platforms. It requires fair and transparent order execution, conflict-of-interest policies, pre- and post-trade transparency reporting, and resilience requirements. Exchanges must comply with Article 45 to maintain their CASP authorization and avoid sanctions from national competent authorities.',
      },
    },
    {
      '@type': 'Question',
      name: 'What MiCA authorization do I need to operate a crypto exchange in the EU?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Operating a crypto-asset trading platform in the EU requires a CASP (Crypto-Asset Service Provider) authorization under MiCA Title V. The authorization process involves: (1) submitting an application to the national competent authority (NCA) in your EU member state of establishment, (2) demonstrating minimum capital requirements (€150K for most CASPs, €350K for custody and trading platforms), (3) submitting a business plan, AML/KYC policies, IT security assessment, and governance documentation, (4) completing NCA review within 40 business days. Existing e-money institutions and credit institutions have separate grandfathering provisions.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do non-EU crypto companies need to comply with MiCA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, if they offer crypto-asset services to EU residents. MiCA has extraterritorial reach similar to GDPR. Third-country CASPs can only serve EU clients by reverse solicitation (client initiated the contact without any solicitation) or by establishing an EU presence and obtaining a CASP authorization. The reverse solicitation exemption is narrow and ESMA has issued strict guidance limiting its use.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does BizLegal Hub Pro help with MiCA compliance monitoring?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hub Pro monitors MiCA regulatory developments daily across ESMA, EBA, and 27 EU national competent authorities. It tracks: new ESMA guidance documents and Q&As, NCA enforcement actions and license decisions, MiCA implementing technical standards (ITS) updates, whitepaper requirement changes, and DORA requirements overlapping with MiCA. You receive weekly regulatory digests and real-time alerts on material changes. The system covers 50+ frameworks simultaneously — no manual monitoring required.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the penalties for non-compliance with MiCA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MiCA penalties vary by member state but the regulation requires NCAs to have the power to impose: (1) fines up to €700K or twice the profit gained for CASPs (natural persons), (2) fines up to €5M or 3% of total annual turnover for CASP entities, (3) withdrawal of CASP authorization, (4) public warnings (naming and shaming). Some member states have implemented higher maximum fines. Operating without authorization is a criminal offense in several jurisdictions.',
      },
    },
  ],
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
    { '@type': 'ListItem', position: 2, name: 'Use Cases', item: 'https://bizlegal-ai.com/use-cases' },
    { '@type': 'ListItem', position: 3, name: 'MiCA Compliance', item: 'https://bizlegal-ai.com/use-cases/mica-compliance' },
  ],
}

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'BizLegal Hub Pro — MiCA Compliance Monitoring',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://bizlegal-ai.com/pricing',
  description:
    'Real-time MiCA compliance monitoring and regulatory intelligence for EU crypto companies. Tracks ESMA guidance, NCA enforcement, and MiCA authorization requirements across 27 EU member states.',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '149',
    highPrice: '499',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
}

const MICA_MODULES = [
  { title: 'CASP Authorization Tracker', desc: 'Status of your MiCA authorization application with deadline alerts' },
  { title: 'Whitepaper Obligation Monitor', desc: 'Track mandatory disclosures and publication requirements' },
  { title: 'ESMA Q&A Feed', desc: 'Real-time alerts when ESMA publishes new MiCA interpretive guidance' },
  { title: 'NCA Enforcement Tracker', desc: 'Monitor national regulator decisions affecting your license category' },
  { title: 'Article 45 Compliance Checklist', desc: 'Trading platform operational requirements with status tracking' },
  { title: 'Capital Requirements Dashboard', desc: 'Monitor own funds levels against MiCA minimum thresholds' },
  { title: 'AML/KYC Framework Sync', desc: 'Track AMLD6 and FATF Travel Rule requirements as they evolve' },
  { title: 'DORA Overlap Analysis', desc: 'Identify where MiCA and DORA requirements intersect for ICT risk' },
]

export default function MicaCompliancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingTop: '36px' }}>
        {/* Nav */}
        <div style={{ background: 'rgba(7,9,26,0.95)', borderBottom: '1px solid rgba(125,211,252,0.08)' }}>
          <div className="container" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" className="nav-logo" style={{ marginRight: 'auto' }}>BizLegal<em>AI</em></Link>
            <a href="https://brai.bizlegal-ai.com" className="btn-ghost" style={{ fontSize: '12px' }}>Free MiCA Scan</a>
            <a href="/pricing" className="btn-primary" style={{ fontSize: '12px' }}>Hub Pro $149/mo →</a>
          </div>
        </div>

        {/* Hero */}
        <div style={{ padding: '80px 24px 60px', maxWidth: '900px', margin: '0 auto' }}>
          <nav style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '24px' }}>
            <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Home</Link>
            {' / '}
            <Link href="/use-cases" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Use Cases</Link>
            {' / '}
            <span style={{ color: 'var(--text)' }}>MiCA Compliance</span>
          </nav>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(125,211,252,0.2)', background: 'rgba(125,211,252,0.05)', fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: 'var(--sky)', marginBottom: '28px' }}>
            🇪🇺 MiCA — EU 2023/1114 — Full force since December 2024
          </div>
          <h1 style={{ fontFamily: 'Gloock, serif', fontSize: 'clamp(32px, 5vw, 56px)', color: 'var(--white)', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
            MiCA Compliance Software:<br />
            <em style={{ fontStyle: 'italic', color: 'var(--sky)' }}>Monitor 27 NCAs, Zero Manual Work</em>
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--muted)', lineHeight: 1.8, maxWidth: '680px', marginBottom: '36px' }}>
            MiCA is fully in force. ESMA publishes guidance weekly. 27 national competent authorities each interpret provisions differently. BizLegal Hub Pro monitors all of it — CASP authorization requirements, whitepaper obligations, Article 45 trading rules, DORA overlaps — and sends you only what changed and why it matters.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="/pricing" className="lx-btn-p">Start Hub Pro $149/mo →</a>
            <Link href="/mica-regulation-2025" className="lx-btn-g">Full MiCA Guide</Link>
          </div>
        </div>

        {/* Alert banner */}
        <div style={{ background: 'rgba(251,191,36,0.06)', borderTop: '1px solid rgba(251,191,36,0.2)', borderBottom: '1px solid rgba(251,191,36,0.2)', padding: '20px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>
              <span style={{ fontSize: '14px', color: '#fbbf24', fontWeight: 600 }}>MiCA enforcement is live. </span>
              <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Operating as a CASP without authorization exposes you to fines up to €5M or 3% of annual turnover per violation. NCAs began accepting authorization applications in December 2024.</span>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '40px' }}>
            What Hub Pro Monitors for MiCA
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {MICA_MODULES.map((m) => (
              <div key={m.title} style={{ padding: '24px', border: '1px solid rgba(125,211,252,0.1)', borderRadius: '12px', background: 'rgba(125,211,252,0.02)' }}>
                <h3 style={{ fontSize: '15px', color: 'var(--white)', marginBottom: '8px', fontWeight: 600 }}>{m.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage table */}
        <div style={{ background: 'rgba(7,9,26,0.6)', padding: '60px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '32px' }}>
              MiCA Token Classification — What Applies to You
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(125,211,252,0.2)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--muted)', fontWeight: 500 }}>Token Type</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--muted)', fontWeight: 500 }}>MiCA Title</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--muted)', fontWeight: 500 }}>Key Obligation</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--muted)', fontWeight: 500 }}>Capital Req.</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Asset-Referenced Token (ART)', 'Title III', 'NCA authorization + reserve asset management', '€350K min'],
                    ['E-Money Token (EMT)', 'Title IV', 'Issued by credit institution or EMI only', '€350K min'],
                    ['Utility Token', 'Title II', 'Whitepaper + pass-on requirement', 'None (whitepaper only)'],
                    ['Other Crypto-Asset', 'Title II', 'Whitepaper (with exemptions)', 'None (whitepaper only)'],
                    ['CASP (exchange/custody)', 'Title V', 'CASP authorization + ongoing obligations', '€150K–€350K'],
                  ].map(([t, title, ob, cap]) => (
                    <tr key={t} style={{ borderBottom: '1px solid rgba(125,211,252,0.06)' }}>
                      <td style={{ padding: '14px 16px', color: 'var(--white)', fontWeight: 500 }}>{t}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--sky)', fontFamily: 'Geist Mono, monospace', fontSize: '12px' }}>{title}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>{ob}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>{cap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '40px' }}>
            MiCA Compliance — Common Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {faqSchema.mainEntity.map((faq) => (
              <div key={faq.name} style={{ padding: '24px', border: '1px solid rgba(125,211,252,0.1)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '16px', color: 'var(--white)', marginBottom: '10px', fontWeight: 600 }}>{faq.name}</h3>
                <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'rgba(125,211,252,0.04)', borderTop: '1px solid rgba(125,211,252,0.12)', padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '36px', color: 'var(--white)', marginBottom: '16px' }}>
            Stop tracking MiCA manually.
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--muted)', marginBottom: '36px', maxWidth: '520px', margin: '0 auto 36px' }}>
            ESMA guidance, 27 NCA decisions, whitepaper updates, DORA overlaps — Hub Pro monitors all of it and alerts you only on what matters. $149/mo.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/pricing" className="lx-btn-p" style={{ fontSize: '15px', padding: '14px 32px' }}>
              Hub Pro $149/mo →
            </a>
            <a href="https://brai.bizlegal-ai.com" className="lx-btn-g" style={{ fontSize: '15px', padding: '14px 32px' }}>
              Free MiCA Risk Scan
            </a>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '16px' }}>Cancel anytime · Not legal advice · Regulatory intelligence tool</p>
        </div>
      </div>
    </>
  )
}
