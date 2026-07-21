import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CTA/BOI Report Filing — $149 | Forge Compliance Engine',
  description: 'File your Corporate Transparency Act Beneficial Ownership Information report with FinCEN. Reduce $500/day exposure. Guided process, delivered in 2–5 minutes, practitioner-reviewed.',
  keywords: 'BOI report, CTA compliance, FinCEN filing, beneficial ownership, Corporate Transparency Act, $500 penalty',
  openGraph: {
    title: 'File Your BOI Report Before $500/Day Penalties Stack Up',
    description: 'Corporate Transparency Act compliance. FinCEN Form 1 generation, ownership analysis, and annual reminders. $149 flat fee.',
    url: 'https://forge.bizlegal-ai.com/boi',
    siteName: 'Forge Compliance Engine',
    type: 'website',
  },
  alternates: { canonical: 'https://forge.bizlegal-ai.com/boi' },
}

export default function BOILayout({ children }: { children: React.ReactNode }) {
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
                name: 'BOI/CTA Compliance Report Kit',
                url: 'https://forge.bizlegal-ai.com/boi',
                description: 'Guided FinCEN Beneficial Ownership Information (BOI) report filing kit. CTA compliance for LLCs, corporations, and partnerships. Practitioner-reviewed output in 2–5 minutes. $149 flat fee.',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                offers: {
                  '@type': 'Offer',
                  price: '149',
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                  url: 'https://forge.bizlegal-ai.com/boi',
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
                    name: 'What is the BOI/CTA Compliance Kit?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'The BOI/CTA Compliance Kit walks you through filing a FinCEN Beneficial Ownership Information (BOI) report under the Corporate Transparency Act. It generates your completed report, identifies which individuals qualify as beneficial owners, and delivers a practitioner-reviewed filing package.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Who needs to file a BOI report?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Most US LLCs, corporations, and similar entities with fewer than 20 employees and under $5M in annual revenue must file. There are 23 exemption categories — the kit determines your exemption status before you proceed.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What is the penalty for not filing a BOI report?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'FinCEN can impose civil penalties of $500 per day for each day a violation continues, plus potential criminal penalties of up to $10,000 and 2 years imprisonment for willful violations.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What information is needed to file a BOI report?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'For each beneficial owner (those owning 25%+ or exercising substantial control): full legal name, date of birth, current residential address, and a copy of a government-issued ID (passport or driver\'s license). The kit guides you through each requirement.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Does the $149 kit include annual reminders?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Yes. The kit includes annual CTA compliance reminders so you know when to update your BOI report if beneficial ownership changes — a requirement for any change within 30 days.',
                    },
                  },
                ],
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://forge.bizlegal-ai.com' },
                  { '@type': 'ListItem', position: 2, name: 'BOI Report', item: 'https://forge.bizlegal-ai.com/boi' },
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
