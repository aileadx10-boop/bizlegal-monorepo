import type { Metadata } from 'next'
import SanctionsDecisionTree from '@/components/SanctionsDecisionTree'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Sanctions Screening Decision Tree | BRAI',
  description:
    'Find out in 60 seconds whether your business needs an OFAC / EU / UK sanctions scan or periodic screening. Free, no signup until the result.',
  openGraph: {
    title: 'Sanctions Screening Decision Tree | BRAI',
    description:
      'Free 60-second sanctions-exposure screen — preliminary signal across OFAC, EU, UK, and on-chain risk. Email-gated full breakdown.',
    url: 'https://brai.bizlegal-ai.com/decision-tree',
  },
}

export default function DecisionTreePage(): JSX.Element {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'When does OFAC apply to me?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'OFAC sanctions apply to all US persons (citizens, permanent residents, entities organized under US law, and anyone physically present in the US) regardless of where the transaction takes place. They also apply extraterritorially to non-US persons engaging in transactions involving US persons, US-origin goods/services, or US dollars.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is strict-liability sanctions exposure?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'OFAC enforcement operates on a strict-liability basis: intent does not matter. If you transact with a sanctioned party — even unknowingly — civil penalties of up to $381,000 per transaction (or twice the value, whichever is greater) apply. Documented screening is the primary defense.',
        },
      },
      {
        '@type': 'Question',
        name: 'How often do sanctions lists update?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'OFAC publishes SDN list updates daily. EU consolidated lists update on a comparable cadence. UK OFSI publishes updates weekly with intraday additions during active enforcement periods. A clean scan from last quarter is not a defense for a transaction this week.',
        },
      },
      {
        '@type': 'Question',
        name: 'What about on-chain / crypto sanctions screening?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'OFAC has designated specific crypto wallet addresses (Tornado Cash, Lazarus Group, etc.) and any interaction with them — direct or indirect through mixers — creates strict-liability exposure. On-chain screening checks counterparty addresses against OFAC SDN, plus transitive exposure via known mixer/sanctioned-cluster heuristics.',
        },
      },
    ],
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg, #0d1626)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
        <header style={{ marginBottom: 40, textAlign: 'center' }}>
          <span style={{
            display: 'inline-block',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: 'var(--accent, #00e5a0)',
            fontWeight: 700,
            marginBottom: 12,
          }}>
            Free tool · 60 seconds
          </span>
          <h1 style={{
            fontSize: 44,
            fontWeight: 800,
            color: 'var(--on-surface, #ddeeff)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: 16,
            fontFamily: 'var(--font-display)',
          }}>
            Do you need a sanctions scan?
          </h1>
          <p style={{
            fontSize: 17,
            color: 'var(--on-surface-var, #9fb6cc)',
            lineHeight: 1.7,
            maxWidth: 540,
            margin: '0 auto',
          }}>
            Five questions. Real preliminary signal across OFAC, EU consolidated lists, UK OFSI,
            and on-chain risk — not a marketing quiz. Email-gated only after you see the answer.
          </p>
        </header>

        <SanctionsDecisionTree />

        <footer style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--muted, #4a6a88)', lineHeight: 1.6 }}>
            BRAI screens against OFAC SDN (31 CFR Chapter V), EU Council consolidated list, UK
            OFSI consolidated list, and UN Security Council sanctions. We are software, not a law
            firm — outcomes depend on your specific facts.
          </p>
        </footer>
      </div>
    </main>
  )
}
