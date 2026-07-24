import type { Metadata } from 'next'
import { GUIDES } from '@/lib/guides'

export const metadata: Metadata = {
  title: 'Compliance Guides for SaaS, Fintech & Crypto Startups | BizLegal AI',
  description: 'Practitioner-written compliance guides for founders. BOI, GDPR, MiCA, EU AI Act, DORA, HIPAA, SEC crypto, India DPDPA, SOC 2, AML/KYC, VARA licensing, privacy policy monitoring, marketplace 1099-K, AI governance frameworks, and more.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides' },
  openGraph: {
    title: 'Compliance Guides — BizLegal AI',
    description: 'Step-by-step compliance guides written by practicing attorneys. BOI, GDPR, MiCA, CCO vs retainer, forensic wallet analysis, and more.',
    url: 'https://bizlegal-ai.com/guides',
    type: 'website',
  },
}

export default function GuidesIndexPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://bizlegal-ai.com/guides' },
    ],
  }

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'BizLegal AI Compliance Guides',
    description: 'Practitioner-written compliance guides for SaaS, fintech, and crypto startups',
    url: 'https://bizlegal-ai.com/guides',
    numberOfItems: GUIDES.length,
    itemListElement: GUIDES.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: g.title,
      url: `https://bizlegal-ai.com${g.href}`,
      description: g.description,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        <nav style={{ fontSize: '0.8rem', opacity: 0.55, marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'inherit' }}>Home</a>
          {' → '}
          Guides
        </nav>

        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' }}>
          Compliance Guides
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.8, marginBottom: '3rem' }}>
          Practical, practitioner-written guides for founders and compliance teams navigating BOI filing, GDPR, MiCA, crypto forensics, and compliance program structure. No jargon without explanation. No advice without context.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          {GUIDES.map((guide) => (
            <a
              key={guide.href}
              href={guide.href}
              style={{
                display: 'block',
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: '12px',
                padding: '1.5rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.15s',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                  opacity: 0.5,
                  marginBottom: '0.6rem',
                }}
              >
                {guide.tag}
              </span>
              <h2
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  lineHeight: 1.4,
                  marginBottom: '0.6rem',
                  marginTop: 0,
                }}
              >
                {guide.title}
              </h2>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.65, opacity: 0.7, margin: 0 }}>
                {guide.description}
              </p>
            </a>
          ))}
        </div>

        <div
          style={{
            borderTop: '1px solid var(--color-border, #e5e7eb)',
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <p style={{ margin: 0, opacity: 0.65, fontSize: '0.9rem' }}>
            Need compliance support beyond what a guide can provide?
          </p>
          <a
            href="https://docai.bizlegal-ai.com"
            style={{
              padding: '0.65rem 1.5rem',
              background: 'var(--primary, #1a56db)',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
            }}
          >
            Scan a Contract — $97
          </a>
        </div>
      </main>
    </>
  )
}
