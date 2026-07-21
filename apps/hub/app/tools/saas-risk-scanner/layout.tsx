import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SaaS Contract Risk Scanner — AI Terms & Agreement Analysis | BizLegal AI',
  description: 'Paste any SaaS contract or subscription agreement. Get a 0-100 risk score, red flag clauses, negotiation points, and missing protections — powered by Claude AI.',
  openGraph: {
    title: 'SaaS Contract Risk Scanner — AI Terms Analysis',
    description: 'Free AI tool to scan SaaS contracts for risk. Get a risk score, red flags, and actionable negotiation points in 2-5 minutes.',
    url: 'https://bizlegal-ai.com/tools/saas-risk-scanner',
  },
  alternates: { canonical: 'https://bizlegal-ai.com/tools/saas-risk-scanner' },
}

const LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'SaaS Terms Risk Scanner',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://bizlegal-ai.com/tools/saas-risk-scanner',
      description: 'AI-powered SaaS contract risk scanner. Paste any SaaS terms of service or vendor agreement to receive a 0-100 risk score, high/medium/low severity red flags, negotiation leverage points, positive protections found, and missing standard clauses. Powered by Claude Sonnet.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      provider: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What SaaS contract clauses are most commonly risky?',
          acceptedAnswer: { '@type': 'Answer', text: 'The highest-risk clauses in SaaS contracts are: (1) unilateral price change provisions, (2) overbroad IP assignment or license-back clauses, (3) unlimited liability carve-outs for the vendor, (4) auto-renewal with insufficient notice periods, (5) data portability and deletion obligations on termination, and (6) unilateral right to modify terms of service.' },
        },
        {
          '@type': 'Question',
          name: 'Is my contract text stored or shared?',
          acceptedAnswer: { '@type': 'Answer', text: 'No. Contract text submitted to the SaaS Risk Scanner is processed transiently for analysis only. Text is not stored, indexed, or used for training. Each scan is ephemeral and cleared after the result is returned.' },
        },
        {
          '@type': 'Question',
          name: 'What languages does the scanner support?',
          acceptedAnswer: { '@type': 'Answer', text: 'The SaaS Risk Scanner supports English, Portuguese (PT), and Spanish (ES). Select your preferred language using the language toggle before scanning. The analysis and output will be returned in the selected language.' },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://bizlegal-ai.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'SaaS Risk Scanner', item: 'https://bizlegal-ai.com/tools/saas-risk-scanner' },
      ],
    },
  ],
}

export default function SaasRiskScannerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
      {children}
    </>
  )
}
