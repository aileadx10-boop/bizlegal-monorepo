import type { Metadata } from 'next'
import ProductFinder from '@/components/conversion/ProductFinder'

export const metadata: Metadata = {
  title: 'Find the Right Compliance Tool — 30-Second Product Finder | BizLegal AI',
  description: 'Answer 3 quick questions and we’ll point you to the right BizLegal AI product, tool, or guide — contract scan, compliance monitor, BOI filing, crypto forensics, or a free guide. No email required to see your match.',
  alternates: { canonical: 'https://bizlegal-ai.com/find' },
  openGraph: {
    title: 'Find the Right Compliance Tool — BizLegal AI',
    description: 'Three questions, one recommendation. No email required to see your match.',
    url: 'https://bizlegal-ai.com/find',
    type: 'website',
  },
}

export default function FindPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'Find Your Tool', item: 'https://bizlegal-ai.com/find' },
    ],
  }

  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'BizLegal AI Product Finder',
    description: 'Answer 3 questions to get matched to the right compliance product, tool, or guide.',
    url: 'https://bizlegal-ai.com/find',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <nav style={{ fontSize: '0.8rem', opacity: 0.55, marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'inherit' }}>Home</a>
          {' → '}
          Find Your Tool
        </nav>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0 0 1rem' }}>
          Not sure what you need?
        </h1>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.7, opacity: 0.8, marginBottom: '2.5rem' }}>
          Answer three quick questions and we&rsquo;ll point you to the right tool, product, or free guide for your situation. No email required to see your match.
        </p>

        <ProductFinder />
      </main>
    </>
  )
}
