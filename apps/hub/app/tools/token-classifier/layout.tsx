import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Token Securities Classifier — Howey Test Analysis | BizLegal AI',
  description: 'Interactive Howey Test for crypto tokens. Adjust all four prongs in real time to estimate your token\'s SEC securities classification probability.',
  openGraph: {
    title: 'Token Securities Classifier — Howey Test Analysis',
    description: 'Apply the SEC Howey Test interactively to determine if your crypto token is a security. Real-time four-prong analysis.',
    url: 'https://bizlegal-ai.com/tools/token-classifier',
  },
  alternates: { canonical: 'https://bizlegal-ai.com/tools/token-classifier' },
}

const LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Token Securities Classifier (Howey Test)',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://bizlegal-ai.com/tools/token-classifier',
      description: 'Interactive four-prong Howey Test tool for crypto token SEC securities classification. Adjust each prong from 1-10 and get real-time probability score.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      provider: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is the Howey Test for crypto tokens?',
          acceptedAnswer: { '@type': 'Answer', text: 'The Howey Test is a four-prong SEC framework to determine if an asset is a security: (1) investment of money, (2) in a common enterprise, (3) with expectation of profits, (4) from the efforts of others. Tokens that satisfy all four prongs are likely securities subject to SEC registration.' },
        },
        {
          '@type': 'Question',
          name: 'What happens if my token is classified as a security?',
          acceptedAnswer: { '@type': 'Answer', text: 'If classified as a security, your token offering must comply with SEC registration requirements or qualify for an exemption (Reg D, Reg A+, Reg S). Unregistered securities offerings can result in SEC enforcement actions, fines, and disgorgement of proceeds.' },
        },
        {
          '@type': 'Question',
          name: 'Is this tool a substitute for legal advice?',
          acceptedAnswer: { '@type': 'Answer', text: 'No. This tool provides regulatory intelligence for educational purposes only. Obtaining a formal legal opinion from a securities attorney is required before any token offering. The SEC conducts fact-specific analysis — this tool gives indicative guidance only.' },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://bizlegal-ai.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Token Classifier', item: 'https://bizlegal-ai.com/tools/token-classifier' },
      ],
    },
  ],
}

export default function TokenClassifierLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
      {children}
    </>
  )
}
