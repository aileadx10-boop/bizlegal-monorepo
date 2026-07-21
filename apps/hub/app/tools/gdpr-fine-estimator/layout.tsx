import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GDPR Fine Estimator — Article 83 Penalty Calculator | BizLegal AI',
  description: 'Calculate GDPR fine exposure under Article 83(4) and 83(5). Real-time EU penalty estimate based on annual revenue, violation severity tier, and records affected.',
  openGraph: {
    title: 'GDPR Fine Estimator — Article 83 Penalty Calculator',
    description: 'Estimate your GDPR fine exposure in real time. Enter revenue and violation tier to see your Article 83 penalty range.',
    url: 'https://bizlegal-ai.com/tools/gdpr-fine-estimator',
  },
  alternates: { canonical: 'https://bizlegal-ai.com/tools/gdpr-fine-estimator' },
}

const LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'GDPR Fine Estimator',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://bizlegal-ai.com/tools/gdpr-fine-estimator',
      description: 'Real-time GDPR Article 83 penalty calculator. Enter annual revenue and breach severity to see lower-tier (2%/€10M) and upper-tier (4%/€20M) fine exposure.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      provider: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What are the two GDPR fine tiers under Article 83?',
          acceptedAnswer: { '@type': 'Answer', text: 'Article 83(4) covers lower-tier violations (e.g. processor obligations, children\'s consent): up to €10 million or 2% of global annual turnover, whichever is higher. Article 83(5) covers upper-tier violations (e.g. basic processing principles, data subject rights): up to €20 million or 4% of global annual turnover, whichever is higher.' },
        },
        {
          '@type': 'Question',
          name: 'What is the largest GDPR fine ever issued?',
          acceptedAnswer: { '@type': 'Answer', text: 'Meta Platforms Ireland received a €1.2 billion fine from Ireland\'s DPC in 2023 for unlawful EU-US personal data transfers under Standard Contractual Clauses. Amazon (Luxembourg) received a €746 million fine in 2021 for unlawful behavioural advertising.' },
        },
        {
          '@type': 'Question',
          name: 'Which authority do I notify for a GDPR data breach?',
          acceptedAnswer: { '@type': 'Answer', text: 'You must notify the supervisory authority of your EU establishment within 72 hours of becoming aware of a personal data breach (Article 33 GDPR). The lead supervisory authority is determined by your main EU establishment. Use our GDPR Breach Timer to countdown the deadline and find all 27 EU DPA contacts.' },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://bizlegal-ai.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'GDPR Fine Estimator', item: 'https://bizlegal-ai.com/tools/gdpr-fine-estimator' },
      ],
    },
  ],
}

export default function GdprFineEstimatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
      {children}
    </>
  )
}
