import type { Metadata } from 'next'
import DecisionTree from '@/components/DecisionTree'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'State Transparency Duty Screen | BizLegal Forge',
  description:
    'Find out in 60 seconds whether enacted or proposed state transparency laws (e.g. New York\'s LLC Transparency Act) create disclosure duties for your US entity. Free, no signup until the result.',
  openGraph: {
    title: 'State Transparency Duty Screen | BizLegal Forge',
    description:
      'Free 60-second state transparency screen. Real preliminary signal, not a marketing quiz. Email-gated full breakdown.',
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
        name: 'Is federal BOI filing still required for US companies?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. FinCEN\'s interim final rule (March 2025) removed US domestic companies from the Corporate Transparency Act\'s beneficial-ownership reporting requirement; only certain foreign companies remain in scope. State-level transparency laws are a separate matter.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which states have transparency disclosure laws?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'New York\'s LLC Transparency Act (NY LLC Law § 1106) is enacted — effective January 1, 2026 for newly formed LLCs and January 1, 2027 for existing ones. Similar disclosure bills have been proposed in other states but are not enacted law.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does a state transparency disclosure typically require?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'State acts generally follow the beneficial-ownership model: for each individual owning 25%+ or exercising substantial control, expect to disclose name, address, and identifying details. Exact requirements and exemptions vary by state.',
        },
      },
      {
        '@type': 'Question',
        name: 'What happens if a state disclosure duty applies and I miss it?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Consequences vary by state. Under New York\'s LLC Transparency Act, non-compliant LLCs can be flagged as delinquent and face enforcement by the state Attorney General. The kit cites the controlling statute for each duty so you can verify.',
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
            Do state transparency laws apply to your LLC?
          </h1>
          <p className="text-base md:text-lg text-forge-text-secondary leading-relaxed max-w-lg mx-auto">
            Five questions. Real preliminary signal — not a marketing quiz. Email-gated only after
            you see the answer.
          </p>
        </header>

        <DecisionTree />

        <footer className="mt-12 text-center">
          <p className="text-xs text-forge-muted leading-relaxed">
            Tracks enacted and proposed state transparency acts — including New York&apos;s LLC
            Transparency Act (NY LLC Law § 1106).
            BizLegal-AI is software, not a law firm — outcomes depend on your specific facts.
          </p>
        </footer>
      </div>
    </main>
  )
}
