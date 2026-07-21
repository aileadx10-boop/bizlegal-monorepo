import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Website Compliance Checker — GDPR, CCPA, ADA Scanner | BizLegal AI',
  description: 'Scan any website for GDPR, CCPA, ADA/WCAG, cookie, and privacy policy compliance issues. Get a 0-100 compliance score with prioritised fixes — free AI tool.',
  openGraph: {
    title: 'Website Compliance Checker — GDPR, CCPA, ADA Scanner',
    description: 'Free AI website compliance scanner. Enter any URL to check GDPR, CCPA, ADA accessibility, cookie consent, and privacy policy compliance.',
    url: 'https://bizlegal-ai.com/tools/website-compliance',
  },
  alternates: { canonical: 'https://bizlegal-ai.com/tools/website-compliance' },
}

const LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'AI Website Compliance Checker',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://bizlegal-ai.com/tools/website-compliance',
      description: 'AI-powered website compliance scanner covering GDPR (EU), CCPA (California), ADA/WCAG accessibility, ePrivacy cookie consent, and privacy policy gaps. Returns a 0-100 compliance score per dimension with actionable fixes and estimated fine risk exposure.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      provider: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What compliance regulations does this website scanner check?',
          acceptedAnswer: { '@type': 'Answer', text: 'The scanner checks: GDPR (EU General Data Protection Regulation) for lawful basis, consent management, and data subject rights; CCPA/CPRA (California Consumer Privacy Act) for opt-out rights and notice at collection; ADA/WCAG 2.1 AA for accessibility; ePrivacy Directive for cookie consent; and Privacy Policy completeness for data processing disclosures.' },
        },
        {
          '@type': 'Question',
          name: 'Do I need a cookie banner for my website?',
          acceptedAnswer: { '@type': 'Answer', text: 'If your website uses non-essential cookies (analytics, advertising, social sharing) and has EU visitors, GDPR and the ePrivacy Directive require prior informed consent via a cookie banner before setting those cookies. CCPA requires a "Do Not Sell My Personal Information" opt-out for California residents if you sell data. Most B2B SaaS websites serving international audiences need both mechanisms.' },
        },
        {
          '@type': 'Question',
          name: 'How accurate is the AI compliance score?',
          acceptedAnswer: { '@type': 'Answer', text: 'The score is based on AI analysis of publicly accessible page content, privacy policies, and disclosed practices. It is a directional assessment, not a legal audit. Actual compliance requires a detailed review of backend data flows, sub-processor agreements, and technical controls. Use this tool for initial triage — then engage a compliance professional for a formal audit.' },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://bizlegal-ai.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Website Compliance', item: 'https://bizlegal-ai.com/tools/website-compliance' },
      ],
    },
  ],
}

export default function WebsiteComplianceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
      {children}
    </>
  )
}
