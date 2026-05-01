import type { Metadata } from 'next'

import { SiteFooter } from '@/app/components/SiteFooter'
import { SiteHeader } from '@/app/components/SiteHeader'
import { faqItems, productLinks } from '@/app/lib/site-content'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Common questions about BizLegal AI products, SEO publishing cadence, and legal boundaries.',
}

export default function FaqPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <>
      <SiteHeader ctaHref={productLinks.docai} ctaLabel="Launch DocAI" />
      <main className="page-hero">
        <section className="container">
          <div className="section-heading">
            <span className="eyebrow">FAQ</span>
            <h2>Commercial clarity and legal clarity, in one place.</h2>
            <p>
              These answers are designed to remove hesitation for serious buyers while making the
              product boundaries explicit.
            </p>
          </div>
          <div className="faq-grid">
            {faqItems.map((item) => (
              <article key={item.question} className="faq-card">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  )
}
