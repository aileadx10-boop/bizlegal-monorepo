import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Regulatory Passport — $297 | Forge Compliance Engine',
  description: 'Multi-jurisdiction compliance snapshot for B2B SaaS and fintech expanding globally. Know your regulatory obligations across US, EU, UK, APAC, and UAE before you ship. Practitioner-reviewed.',
  keywords: 'regulatory compliance passport, multi-jurisdiction compliance, fintech regulation snapshot, B2B SaaS compliance, EU US UK compliance check',
  openGraph: {
    title: 'Regulatory Passport — Know Your Obligations Before You Expand',
    description: 'Multi-jurisdiction compliance snapshot. GDPR, SEC, MiCA, VARA, APAC — mapped to your product, entity, and revenue stage. $297 one-time.',
    url: 'https://forge.bizlegal-ai.com/passport',
    siteName: 'Forge Compliance Engine',
    type: 'website',
  },
  alternates: { canonical: 'https://forge.bizlegal-ai.com/passport' },
}

export default function PassportLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'SoftwareApplication',
                name: 'Regulatory Passport',
                url: 'https://forge.bizlegal-ai.com/passport',
                description: 'Multi-jurisdiction compliance snapshot for B2B SaaS and fintech. Maps your product, entity, and markets to applicable regulations — GDPR, SEC, MiCA, VARA, AML, and more. Practitioner-reviewed output.',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                offers: {
                  '@type': 'Offer',
                  price: '297',
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                  url: 'https://forge.bizlegal-ai.com/passport',
                },
                provider: {
                  '@type': 'Organization',
                  name: 'BizLegal AI',
                  url: 'https://bizlegal-ai.com',
                },
              },
              {
                '@type': 'FAQPage',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: 'What is a Regulatory Passport?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'A Regulatory Passport is a tailored compliance snapshot that maps your company\'s product, entity structure, and target markets to the regulations that apply to you — covering GDPR, SEC, MiCA, VARA, AML, and jurisdiction-specific requirements across up to 3 markets.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Who is the Regulatory Passport for?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'B2B SaaS founders and fintech operators expanding into new jurisdictions who need to understand their regulatory exposure before launch — without paying $500/hour for a scoping call with outside counsel.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Which jurisdictions does the Regulatory Passport cover?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'The Regulatory Passport covers up to 3 markets from: US, EU, UK, Singapore, Australia, Canada, Germany, Netherlands, Switzerland, UAE, Japan, and Hong Kong. Each passport is scoped to your actual expansion plan.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What do I receive after completing the Regulatory Passport intake?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'You receive a practitioner-reviewed compliance snapshot identifying which regulatory frameworks apply to your product and entity, what specific obligations exist in each jurisdiction, and which frameworks require immediate action before market entry.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Is the Regulatory Passport legal advice?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'The Regulatory Passport provides regulatory intelligence and compliance mapping, not legal advice. It identifies applicable frameworks and obligations. For legal advice on specific actions, a licensed attorney consultation is required.',
                    },
                  },
                ],
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://forge.bizlegal-ai.com' },
                  { '@type': 'ListItem', position: 2, name: 'Regulatory Passport', item: 'https://forge.bizlegal-ai.com/passport' },
                ],
              },
            ],
          }),
        }}
      />
      {children}
    </>
  )
}
