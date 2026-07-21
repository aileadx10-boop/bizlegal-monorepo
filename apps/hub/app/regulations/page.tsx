import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Regulatory Intelligence Hubs — SEC, MiCA, VARA, GDPR, AML',
  description: 'Comprehensive regulatory intelligence for SEC, MiCA, VARA, GDPR, and AML compliance. Enforcement analysis, penalty calculators, and compliance guides.',
}

const HUBS = [
  { slug: 'sec', tag: 'US Securities Law', title: 'SEC Compliance Hub', desc: 'U.S. Securities and Exchange Commission enforcement, Howey Test precedent, and digital asset regulatory framework.' },
  { slug: 'mica', tag: 'EU Crypto-Asset Markets', title: 'MiCA Framework Hub', desc: 'Markets in Crypto-Assets Regulation — the EU\'s comprehensive framework for token issuers and crypto-asset service providers.' },
  { slug: 'vara', tag: 'UAE Virtual Assets', title: 'VARA Compliance Hub', desc: 'Dubai Virtual Assets Regulatory Authority licensing, VASP requirements, and UAE crypto regulatory framework.' },
  { slug: 'gdpr', tag: 'EU Data Privacy', title: 'GDPR Compliance Hub', desc: 'EU General Data Protection Regulation — data processing obligations, DPO requirements, and cross-border transfer mechanisms.' },
  { slug: 'aml', tag: 'Global Financial Crime', title: 'AML & KYC Hub', desc: 'Anti-money laundering and know-your-customer frameworks under FATF Recommendations and jurisdiction-specific AML regimes.' },
]

export default function RegulationsPage() {
  const itemListLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: 'Regulatory Intelligence Hubs',
        description: 'Institutional-grade compliance intelligence covering the world\'s primary digital asset and data protection regulatory frameworks.',
        url: 'https://bizlegal-ai.com/regulations',
        numberOfItems: HUBS.length,
        itemListElement: HUBS.map((hub, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: hub.title,
          description: hub.desc,
          url: `https://bizlegal-ai.com/regulations/${hub.slug}`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
          { '@type': 'ListItem', position: 2, name: 'Regulations', item: 'https://bizlegal-ai.com/regulations' },
        ],
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
    <div style={{ padding: '64px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <span className="section-label">Regulatory Intelligence</span>
        <h1 style={{ marginBottom: 8 }}>Five Regulatory Regimes</h1>
        <p style={{ color: 'var(--on-surface-var)', marginBottom: 48, fontSize: 15 }}>
          Institutional-grade compliance intelligence covering the world's primary digital asset and data protection regulatory frameworks.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 1 }}>
          {HUBS.map(hub => (
            <Link key={hub.slug} href={`/regulations/${hub.slug}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ height: '100%' }}>
                <span className="tag" style={{ display: 'block', marginBottom: 10 }}>{hub.tag}</span>
                <h2 style={{ fontSize: 20, marginBottom: 12 }}>{hub.title}</h2>
                <p style={{ fontSize: 13, color: 'var(--on-surface-var)', lineHeight: 1.65 }}>{hub.desc}</p>
                <div style={{ marginTop: 20, color: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>Explore Hub →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}
