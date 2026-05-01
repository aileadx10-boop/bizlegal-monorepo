import Link from 'next/link'

const HUBS = [
  {
    tag: 'US Securities Law',
    slug: 'sec',
    title: 'SEC Compliance Hub',
    desc: 'Navigate U.S. securities enforcement for digital assets, token offerings, and broker-dealer obligations under Howey Test precedent.',
    facts: [
      { label: 'Max Fine', value: 'Disgorgement + civil penalties' },
      { label: 'Jurisdiction', value: 'United States' },
      { label: 'Authority', value: 'Securities & Exchange Commission' },
    ],
  },
  {
    tag: 'EU Crypto-Asset Markets',
    slug: 'mica',
    title: 'MiCA Framework Hub',
    desc: 'Markets in Crypto-Assets Regulation — the EU\'s comprehensive framework for token issuers, ARTs, EMTs, and CASPs from 2024.',
    facts: [
      { label: 'Max Fine', value: '€5M or 3% global turnover' },
      { label: 'Jurisdiction', value: 'European Union' },
      { label: 'Authority', value: 'ESMA + National Competent Authorities' },
    ],
  },
  {
    tag: 'UAE Virtual Assets',
    slug: 'vara',
    title: 'VARA Compliance Hub',
    desc: 'Dubai\'s Virtual Assets Regulatory Authority framework covering VASP licensing, custody, and operational requirements for UAE operations.',
    facts: [
      { label: 'Max Fine', value: 'Business suspension + prosecution' },
      { label: 'Jurisdiction', value: 'Dubai, UAE' },
      { label: 'Authority', value: 'Virtual Assets Regulatory Authority' },
    ],
  },
  {
    tag: 'EU Data Privacy',
    slug: 'gdpr',
    title: 'GDPR Compliance Hub',
    desc: 'EU General Data Protection Regulation — comprehensive obligations for data processing, DPO appointment, and cross-border transfer mechanisms.',
    facts: [
      { label: 'Max Fine', value: '€20M or 4% global turnover' },
      { label: 'Jurisdiction', value: 'European Union + EEA' },
      { label: 'Authority', value: 'National Data Protection Authorities' },
    ],
  },
  {
    tag: 'Global Financial Crime',
    slug: 'aml',
    title: 'AML & KYC Hub',
    desc: 'Anti-money laundering and know-your-customer frameworks under FATF Recommendations, 6AMLD, and jurisdiction-specific regimes.',
    facts: [
      { label: 'Max Fine', value: 'Unlimited (jurisdiction-dependent)' },
      { label: 'Jurisdiction', value: 'Global (FATF Members)' },
      { label: 'Authority', value: 'FATF + National FIUs' },
    ],
  },
]

export default function RegGrid() {
  return (
    <section style={{ padding: '64px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <span className="section-label">Regulatory Intelligence</span>
        <h2 style={{ marginBottom: 32 }}>Five Regulatory Hubs</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1 }}>
          {HUBS.map(hub => (
            <Link
              key={hub.slug}
              href={`/regulations/${hub.slug}`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div
                className="card hover-reveal"
                style={{ height: '100%', transition: 'border-left 0.15s' }}
              >
                <span className="tag" style={{ display: 'block', marginBottom: 10 }}>{hub.tag}</span>
                <h3 style={{ fontSize: 18, marginBottom: 10, color: 'var(--on-surface)' }}>{hub.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--on-surface-var)', marginBottom: 16, lineHeight: 1.6 }}>{hub.desc}</p>
                <ul style={{ listStyle: 'none', borderTop: '0.5px solid var(--outline-var)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {hub.facts.map(f => (
                    <li key={f.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--outline)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10 }}>{f.label}</span>
                      <span style={{ color: 'var(--on-surface-var)' }}>{f.value}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 16, color: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>
                  Explore Hub →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
