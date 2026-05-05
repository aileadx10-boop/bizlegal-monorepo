import type { Metadata } from 'next'
import ComplianceMonitorDecisionTree from '@/components/ComplianceMonitorDecisionTree'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Compliance Monitoring Decision Tree | LexAudit',
  description:
    'Find out in 60 seconds whether your business needs continuous compliance monitoring or a one-off baseline audit. Free, no signup until the result.',
  openGraph: {
    title: 'Compliance Monitoring Decision Tree | LexAudit',
    description:
      'Free 60-second compliance-cadence screen. Real preliminary signal across regulator attention, jurisdiction, and materiality. Email-gated full breakdown.',
    url: 'https://lexaudit.bizlegal-ai.com/decision-tree',
  },
}

export default function DecisionTreePage(): JSX.Element {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'When does continuous compliance monitoring make sense vs a one-off audit?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Continuous monitoring is warranted when your regulator footprint touches multiple jurisdictions or agencies, your vertical sees frequent guidance updates (fintech, crypto, healthtech, AI/ML), and one missed update could materially harm the business. A one-off audit + quarterly review is proportionate when the regulator footprint is contained and rule cadence is stable.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is regulatory drift?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Regulatory drift is the gradual accumulation of small changes — new agency guidance, FAQ updates, no-action letters, enforcement themes — that individually look minor but collectively shift what compliance actually requires. The risk is discovering drift during an enforcement action rather than during a routine monitoring cycle.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does LexAudit detect drift?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Daily semantic-diff against tracked compliance frameworks: when a regulator publishes new guidance, FAQ, advisory, or enforcement action, LexAudit detects the change, classifies its impact relative to your scenario, and flags items that meaningfully shift your obligations.',
        },
      },
      {
        '@type': 'Question',
        name: 'How fast does new agency guidance typically take to land in enforcement?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Variable, but a useful proxy: financial regulators (SEC, CFPB, FinCEN) typically lag 6-18 months between guidance and enforcement. State AGs are faster (3-9 months). Privacy regulators in EU/CA are getting faster, with some authorities now opening investigations within weeks of guidance updates.',
        },
      },
    ],
  }

  return (
    <main style={{ minHeight: '100vh', background: '#050509' }}>
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
            color: '#c9a84c',
            fontWeight: 700,
            marginBottom: 12,
          }}>
            Free tool · 60 seconds
          </span>
          <h1 className="font-serif" style={{
            fontSize: 48,
            fontWeight: 700,
            color: '#f7f3e8',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: 16,
          }}>
            Continuous monitoring or a baseline audit?
          </h1>
          <p style={{
            fontSize: 17,
            color: '#cbd5e1',
            lineHeight: 1.7,
            maxWidth: 540,
            margin: '0 auto',
          }}>
            Five questions. Real preliminary signal across regulator attention, jurisdiction, and
            materiality — not a marketing quiz. Email-gated only after you see the answer.
          </p>
        </header>

        <ComplianceMonitorDecisionTree />

        <footer style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#7a7a7a', lineHeight: 1.6 }}>
            LexAudit tracks regulatory drift across SEC, CFPB, FinCEN, FTC, state AGs, EU and UK
            regulators, and OFAC sanctions lists. We are software, not a law firm — outcomes
            depend on your specific facts.
          </p>
        </footer>
      </div>
    </main>
  )
}
