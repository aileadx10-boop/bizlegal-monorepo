import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GDPR 72-Hour Breach Timer — Article 33 Notification Countdown | BizLegal AI',
  description: 'Count down GDPR\'s mandatory 72-hour data breach notification deadline. Includes contacts for all 27 EU supervisory authorities for immediate Article 33 reporting.',
  openGraph: {
    title: 'GDPR 72-Hour Breach Timer — Article 33 Countdown',
    description: 'Track the GDPR 72-hour breach notification deadline in real time. All 27 EU data protection authority contacts included.',
    url: 'https://bizlegal-ai.com/tools/gdpr-breach-timer',
  },
  alternates: { canonical: 'https://bizlegal-ai.com/tools/gdpr-breach-timer' },
}

const LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'GDPR 72-Hour Breach Notification Timer',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://bizlegal-ai.com/tools/gdpr-breach-timer',
      description: 'Real-time countdown to GDPR Article 33 72-hour data breach notification deadline. Enter discovery date and time to track remaining hours. Includes all 27 EU supervisory authority contacts and website links.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      provider: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What does GDPR Article 33 require for data breaches?',
          acceptedAnswer: { '@type': 'Answer', text: 'Article 33 GDPR requires data controllers to notify the competent supervisory authority of a personal data breach within 72 hours of becoming aware of it, where feasible. The notification must include the nature of the breach, categories and approximate number of data subjects affected, likely consequences, and measures taken or proposed to address the breach.' },
        },
        {
          '@type': 'Question',
          name: 'When does the 72-hour GDPR clock start?',
          acceptedAnswer: { '@type': 'Answer', text: 'The 72-hour clock starts when the controller "becomes aware" of a personal data breach — meaning when the controller has a reasonable degree of certainty that a security incident has occurred that has led to personal data being compromised. Investigating an incident delays awareness; once confirmed, the 72-hour window begins.' },
        },
        {
          '@type': 'Question',
          name: 'What happens if I miss the GDPR 72-hour deadline?',
          acceptedAnswer: { '@type': 'Answer', text: 'Missing the 72-hour notification deadline is itself a GDPR violation subject to Article 83(4) fines of up to €10 million or 2% of global annual turnover. Late notifications must include reasons for the delay. Supervisory authorities consider timeliness of notification as a mitigating or aggravating factor in fine calculations.' },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://bizlegal-ai.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'GDPR Breach Timer', item: 'https://bizlegal-ai.com/tools/gdpr-breach-timer' },
      ],
    },
  ],
}

export default function GdprBreachTimerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
      {children}
    </>
  )
}
