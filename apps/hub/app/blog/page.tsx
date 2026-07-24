import type { Metadata } from 'next'
import { GUIDES } from '@/lib/guides'
import BlogGrid from './BlogGrid'

export const metadata: Metadata = {
  title: 'Blog — Compliance Intelligence for SaaS, Fintech & Crypto Startups | BizLegal AI',
  description: 'Regulatory analysis and compliance intelligence for founders and compliance teams. BOI, GDPR, MiCA, EU AI Act, DORA, HIPAA, SEC crypto, SOC 2, AML/KYC, VARA licensing, OFAC sanctions, and more.',
  alternates: { canonical: 'https://bizlegal-ai.com/blog' },
  openGraph: {
    title: 'Blog — BizLegal AI',
    description: 'Regulatory analysis and compliance intelligence, written by practicing attorneys.',
    url: 'https://bizlegal-ai.com/blog',
    type: 'website',
  },
}

export default function BlogIndexPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://bizlegal-ai.com/blog' },
    ],
  }

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'BizLegal AI Blog',
    description: 'Regulatory analysis and compliance intelligence for SaaS, fintech, and crypto startups',
    url: 'https://bizlegal-ai.com/blog',
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
          Blog
        </nav>

        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' }}>
          Blog
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.8, marginBottom: '2rem' }}>
          Regulatory analysis and compliance intelligence for founders and compliance teams — BOI, GDPR, MiCA, crypto forensics, and compliance program structure, written by practicing attorneys.
        </p>

        <BlogGrid guides={GUIDES} />

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
            Need compliance support beyond what a post can provide?
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
