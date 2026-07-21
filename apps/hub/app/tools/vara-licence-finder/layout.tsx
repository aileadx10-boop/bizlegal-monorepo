import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VARA Licence Finder — Dubai Crypto Licensing & Fees 2026 | BizLegal AI',
  description: 'Find the right VARA licence for your Dubai crypto business. Compare Category 1-4 requirements, 2026 application fees, annual licence fees, and capital minimums.',
  openGraph: {
    title: 'VARA Licence Finder — Dubai Crypto Licensing Guide 2026',
    description: 'Select your crypto business activity to find the required VARA licence category and 2026 fee schedule. Exchange, broker-dealer, asset management, advisory.',
    url: 'https://bizlegal-ai.com/tools/vara-licence-finder',
  },
  alternates: { canonical: 'https://bizlegal-ai.com/tools/vara-licence-finder' },
}

const LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'VARA Licence Finder',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://bizlegal-ai.com/tools/vara-licence-finder',
      description: 'Dubai VARA licence finder. Select your primary crypto business activity (exchange, broker-dealer, asset management, advisory) to identify required licence category, 2026 application fees, annual fees, compliance bond, and minimum paid-up capital.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      provider: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is VARA and who does it regulate?',
          acceptedAnswer: { '@type': 'Answer', text: 'VARA (Virtual Assets Regulatory Authority) is Dubai\'s dedicated virtual asset regulator established under Law No. 4 of 2022. It regulates virtual asset service providers (VASPs) operating in or from Dubai, excluding the DIFC and ADGM free zones which have their own regulators (DFSA and FSRA respectively).' },
        },
        {
          '@type': 'Question',
          name: 'What are the four VARA licence categories?',
          acceptedAnswer: { '@type': 'Answer', text: 'VARA issues four licence categories: Category 1 (Exchange Services — spot trading, order books, market making), Category 2 (Broker-Dealer Services — order execution, agency/principal trading), Category 3 (Asset Management — fund management, portfolio management, investment advice), Category 4 (Advisory Services — investment advisory, custody advisory, compliance consulting). Each category has distinct minimum capital and fee requirements.' },
        },
        {
          '@type': 'Question',
          name: 'How long does VARA licensing take?',
          acceptedAnswer: { '@type': 'Answer', text: 'VARA licensing typically takes 3-6 months from application submission to approval, subject to completeness of documentation, business plan quality, AML/CFT compliance framework, and fit-and-proper assessment of key persons. Applicants should expect a minimum 90-day review period after submitting a complete application.' },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://bizlegal-ai.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'VARA Licence Finder', item: 'https://bizlegal-ai.com/tools/vara-licence-finder' },
      ],
    },
  ],
}

export default function VaraLicenceFinderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
      {children}
    </>
  )
}
