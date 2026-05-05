import type { Metadata } from 'next'
import WalletTraceDecisionTree from '@/components/WalletTraceDecisionTree'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Crypto Reporting Decision Tree | TRACR',
  description:
    'Find out in 60 seconds whether your crypto activity needs an FBAR, IRS digital-asset disclosure, or AML scan. Free, no signup until the result.',
  openGraph: {
    title: 'Crypto Reporting Decision Tree | TRACR',
    description:
      'Free 60-second wallet-trace exposure screen — preliminary signal across IRS, FinCEN MSB, and OFAC. Email-gated full breakdown.',
    url: 'https://tracr.bizlegal-ai.com/decision-tree',
  },
}

export default function DecisionTreePage(): JSX.Element {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do I need to disclose crypto on my US tax return?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Every Form 1040 since 2020 asks whether you received, sold, exchanged, or disposed of digital assets. You answer yes if you traded, swapped, sold, received as payment, or were paid in crypto during the year. Mere holding does not trigger the question.',
        },
      },
      {
        '@type': 'Question',
        name: 'When does FinCEN Travel Rule apply to me?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Travel Rule applies to qualifying transactions ≥ $3,000 between Money Services Businesses (MSBs). If you are an MSB or interact with one — including most centralized crypto exchanges — counterparty info must be transmitted with the funds.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is FBAR for crypto?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'US persons with foreign financial accounts aggregating > $10,000 at any point during the year must file FinCEN Form 114 (FBAR). The IRS has signaled it intends to extend FBAR to crypto held on non-US exchanges; until the final rule lands, the conservative answer is to report.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why does counterparty risk matter for compliance?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Receiving crypto from a sanctioned address, a mixer, or a counterparty later linked to enforcement action can trigger OFAC strict-liability exposure (up to $381,000 per transaction or twice the value, whichever is greater) regardless of intent. Provenance evidence is your defense.',
        },
      },
    ],
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <header className="mb-10 text-center">
          <span className="inline-block text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3">
            Free tool · 60 seconds
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
            Does your crypto activity need a compliance scan?
          </h1>
          <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-lg mx-auto">
            Five questions. Real preliminary signal across IRS, FinCEN, and OFAC — not a marketing
            quiz. Email-gated only after you see the answer.
          </p>
        </header>

        <WalletTraceDecisionTree />

        <footer className="mt-12 text-center">
          <p className="text-xs text-slate-500 leading-relaxed">
            Built on FinCEN&apos;s Travel Rule (31 CFR § 1010.410), the IRS digital-asset reporting
            framework (Notice 2014-21 + Form 1040 Question), and OFAC sanctions guidance. TRACR is
            software, not a law firm — outcomes depend on your specific facts.
          </p>
        </footer>
      </div>
    </main>
  )
}
