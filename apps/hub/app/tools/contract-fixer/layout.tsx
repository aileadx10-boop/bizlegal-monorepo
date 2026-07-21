import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Freelancer Contract Fixer — AI Clause Rewriter | BizLegal AI',
  description: 'Paste your freelance contract and our AI identifies clauses exposing you to non-payment, scope creep, and IP loss — then rewrites them to protect you. Multi-jurisdiction.',
  openGraph: {
    title: 'Freelancer Contract Fixer — AI Clause Rewriter',
    description: 'Free AI tool to scan and fix freelance contracts. Get a protection score, rewritten clauses, and payment/IP risk analysis across 9 jurisdictions.',
    url: 'https://bizlegal-ai.com/tools/contract-fixer',
  },
  alternates: { canonical: 'https://bizlegal-ai.com/tools/contract-fixer' },
}

const LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Freelancer Contract Fixer',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://bizlegal-ai.com/tools/contract-fixer',
      description: 'AI-powered freelancer contract fixer. Paste your service agreement to receive a 0-100 protection score, rewritten high/medium/low risk clauses, payment risk analysis, IP ownership risks, and missing standard protections. Supports UK, US-Delaware, US-California, EU, UAE, Singapore, Australia, Brazil, and international contracts.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      provider: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What freelance contract clauses should I always negotiate?',
          acceptedAnswer: { '@type': 'Answer', text: 'Always negotiate: (1) IP ownership — ensure work-for-hire language only covers deliverables, not pre-existing IP; (2) kill fee — minimum 25-50% of total project value if client cancels; (3) scope change process — written approval required for any additions; (4) payment milestones — never deliver final work before final payment; (5) late payment interest — UK standard is 8% above base rate; (6) termination notice — minimum 30 days written notice.' },
        },
        {
          '@type': 'Question',
          name: 'Which jurisdiction\'s law should govern my freelance contract?',
          acceptedAnswer: { '@type': 'Answer', text: 'As the freelancer, negotiate for your home jurisdiction\'s law to govern the contract wherever possible. If contracting with a UK client, English law is generally favorable for freelancers. Delaware law is common in US contracts for its predictability. Avoid client-imposed jurisdictions where you have no legal presence or practical ability to enforce claims.' },
        },
        {
          '@type': 'Question',
          name: 'Is my contract text stored or shared?',
          acceptedAnswer: { '@type': 'Answer', text: 'No. Contract text is processed transiently for analysis only. It is not stored, indexed, or used for AI training. The tool displays a confirmation that text is not stored.' },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://bizlegal-ai.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Contract Fixer', item: 'https://bizlegal-ai.com/tools/contract-fixer' },
      ],
    },
  ],
}

export default function ContractFixerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
      {children}
    </>
  )
}
