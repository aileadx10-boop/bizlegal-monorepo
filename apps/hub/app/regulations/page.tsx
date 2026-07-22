import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Regulatory Intelligence Hubs — SEC, MiCA, VARA, GDPR, AML, EU AI Act, BOI, DORA, CCPA, SOC 2',
  description: 'Comprehensive regulatory intelligence for SEC, MiCA, VARA, GDPR, AML, EU AI Act, BOI/CTA, DORA, CCPA/CPRA, and SOC 2 compliance. Enforcement analysis, penalty frameworks, and compliance guides.',
}

const HUBS = [
  { slug: 'sec', tag: 'US Securities Law', title: 'SEC Compliance Hub', desc: 'U.S. Securities and Exchange Commission enforcement, Howey Test precedent, and digital asset regulatory framework.' },
  { slug: 'mica', tag: 'EU Crypto-Asset Markets', title: 'MiCA Framework Hub', desc: 'Markets in Crypto-Assets Regulation — the EU\'s comprehensive framework for token issuers and crypto-asset service providers.' },
  { slug: 'vara', tag: 'UAE Virtual Assets', title: 'VARA Compliance Hub', desc: 'Dubai Virtual Assets Regulatory Authority licensing, VASP requirements, and UAE crypto regulatory framework.' },
  { slug: 'gdpr', tag: 'EU Data Privacy', title: 'GDPR Compliance Hub', desc: 'EU General Data Protection Regulation — data processing obligations, DPO requirements, and cross-border transfer mechanisms.' },
  { slug: 'aml', tag: 'Global Financial Crime', title: 'AML & KYC Hub', desc: 'Anti-money laundering and know-your-customer frameworks under FATF Recommendations and jurisdiction-specific AML regimes.' },
  { slug: 'ai-act', tag: 'EU AI Act', title: 'EU AI Act Compliance Hub', desc: 'EU Artificial Intelligence Act — risk-based framework for high-risk AI systems, GPAI model obligations, and €35M penalty regime effective 2025–2026.' },
  { slug: 'boi', tag: 'FinCEN CTA / BOI', title: 'BOI / CTA Compliance Hub', desc: 'FinCEN Beneficial Ownership Information reporting under the Corporate Transparency Act — who must file, 23 exemptions, and $591/day penalties.' },
  { slug: 'dora', tag: 'EU Digital Operational Resilience', title: 'DORA Compliance Hub', desc: 'EU Digital Operational Resilience Act — ICT risk management, major incident reporting, and third-party oversight for EU financial entities and their SaaS vendors.' },
  { slug: 'ccpa', tag: 'California Privacy Law', title: 'CCPA / CPRA Compliance Hub', desc: 'California Consumer Privacy Act & Privacy Rights Act — US privacy compliance for businesses with California customers, including GPC signal requirements.' },
  { slug: 'soc2', tag: 'AICPA Trust Services', title: 'SOC 2 Compliance Hub', desc: 'System and Organization Controls 2 — the de facto enterprise SaaS security audit standard, covering Type I vs Type II, Trust Service Criteria, and auditor selection.' },
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
        <h1 style={{ marginBottom: 8 }}>Ten Regulatory Regimes</h1>
        <p style={{ color: 'var(--on-surface-var)', marginBottom: 48, fontSize: 15 }}>
          Institutional-grade compliance intelligence covering the world's primary digital asset, AI, and data protection regulatory frameworks.
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
