import type { Metadata } from 'next'
import DecisionTree from '@/components/DecisionTree'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'BOI Filing Decision Tree | BizLegal Forge',
  description:
    'Find out in 60 seconds whether your US entity needs to file a Beneficial Ownership Information report under FinCEN\'s Corporate Transparency Act. Free, no signup until the result.',
  openGraph: {
    title: 'BOI Filing Decision Tree | BizLegal Forge',
    description:
      'Free 60-second BOI filing screen. Real preliminary signal, not a marketing quiz. Email-gated full breakdown.',
    url: 'https://forge.bizlegal-ai.com/decision-tree',
  },
}

export default function DecisionTreePage(): JSX.Element {
  // FAQ schema.org so the decision-tree page can pick up
  // search-rich-results without needing a blog article behind it.
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Who has to file a BOI report?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Any LLC, corporation, or limited partnership formed by filing a document with a US state or tribe must file a Beneficial Ownership Information report with FinCEN, unless it qualifies for one of the 23 statutory exemptions under the Corporate Transparency Act.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the large operating company exemption?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'An entity is exempt if it has more than 20 US-based full-time employees, more than $5 million in US gross receipts on its prior-year tax return, AND a physical office in the United States. All three conditions must be met.',
        },
      },
      {
        '@type': 'Question',
        name: 'When are BOI reports due?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Entities formed before January 1, 2024 had until January 1, 2025 to file the initial report. Entities formed during 2024 had 90 days from formation; entities formed in or after 2025 have 30 days. Material changes to beneficial-ownership info must be re-filed within 30 days.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the penalties for not filing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'FinCEN\'s civil penalty is up to $591 per day (adjusted annually for inflation) for willful failure to file. Criminal penalties of up to $10,000 in fines and 2 years imprisonment apply for willful violation or providing false information.',
        },
      },
    ],
  }

  return (
    <main className="min-h-screen bg-forge-bg text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <header className="mb-10 text-center">
          <span className="inline-block text-xs uppercase tracking-widest text-forge-accent font-semibold mb-3">
            Free tool · 60 seconds
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            Do you need to file a BOI report?
          </h1>
          <p className="text-base md:text-lg text-forge-text-secondary leading-relaxed max-w-lg mx-auto">
            Five questions. Real preliminary signal — not a marketing quiz. Email-gated only after
            you see the answer.
          </p>
        </header>

        <DecisionTree />

        <footer className="mt-12 text-center">
          <p className="text-xs text-forge-muted leading-relaxed">
            Built on FinCEN&apos;s 31 CFR § 1010.380 and the Corporate Transparency Act (Pub. L. 116-283).
            BizLegal-AI is software, not a law firm — outcomes depend on your specific facts.
          </p>
        </footer>
      </div>
    </main>
  )
}
