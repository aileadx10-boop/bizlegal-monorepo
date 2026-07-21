import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Debt Collection Letter Generator — Multi-Jurisdiction | BizLegal AI',
  description: 'Generate professional, jurisdiction-compliant debt collection letters in seconds. From friendly first reminders to pre-litigation demands — in English, Spanish, and Portuguese.',
  openGraph: {
    title: 'Debt Collection Letter Generator — Multi-Jurisdiction',
    description: 'Free AI tool to generate debt collection letters for 12+ jurisdictions. First reminder through pre-legal notice in 3 languages.',
    url: 'https://bizlegal-ai.com/tools/debt-collection',
  },
  alternates: { canonical: 'https://bizlegal-ai.com/tools/debt-collection' },
}

const LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Debt Collection Letter Generator',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://bizlegal-ai.com/tools/debt-collection',
      description: 'AI-powered debt collection letter generator for 12+ jurisdictions including UK, US, EU, UAE, Singapore, Australia, Canada, and Brazil. Generates four letter types: first reminder, second notice, final demand, and pre-legal notice — in English, Portuguese, and Spanish. Includes recommended deadlines, escalation paths, and jurisdiction-specific legal notes.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      provider: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What should a debt collection letter include?',
          acceptedAnswer: { '@type': 'Answer', text: 'A professional debt collection letter should include: (1) creditor and debtor full legal names and addresses, (2) invoice reference number and original due date, (3) amount owed with currency, (4) clear demand for payment by a specific deadline (typically 7-14 days), (5) consequences of non-payment (late interest, legal action), (6) preferred payment method, and (7) contact details for dispute or payment queries.' },
        },
        {
          '@type': 'Question',
          name: 'What is the difference between a final demand and a pre-legal notice?',
          acceptedAnswer: { '@type': 'Answer', text: 'A final demand is the last communication before formal escalation, giving the debtor a final opportunity to pay. A pre-legal notice (also called a letter before action) is a formal letter required by court rules in many jurisdictions (e.g., UK Practice Direction on Pre-Action Conduct) before commencing litigation. Pre-legal notices must state intention to sue, claim amount, and a reasonable response deadline — typically 14-30 days depending on jurisdiction.' },
        },
        {
          '@type': 'Question',
          name: 'How long before I can take legal action for non-payment?',
          acceptedAnswer: { '@type': 'Answer', text: 'Timelines vary by jurisdiction. In the UK, you can issue a claim in the Small Claims Court after sending a letter before action and waiting 14 days. In the US (Delaware), the typical pre-litigation period is 30 days. In the EU, cross-border debt recovery via the European Payment Order procedure requires 30 days\' notice. UAE civil courts generally expect documented prior demand evidence before accepting a claim.' },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://bizlegal-ai.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Debt Collection', item: 'https://bizlegal-ai.com/tools/debt-collection' },
      ],
    },
  ],
}

export default function DebtCollectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
      {children}
    </>
  )
}
