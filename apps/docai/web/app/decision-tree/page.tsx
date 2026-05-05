import type { Metadata } from 'next'
import PrivacyScanDecisionTree from '@/components/PrivacyScanDecisionTree'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Privacy Scan Decision Tree | DocAI',
  description:
    'Find out in 60 seconds whether your business needs a DSAR process, GDPR/CCPA inventory, or DPIA. Free, no signup until the result.',
  openGraph: {
    title: 'Privacy Scan Decision Tree | DocAI',
    description:
      'Free 60-second privacy-exposure screen — preliminary signal across GDPR, CCPA, and US state privacy laws. Email-gated full breakdown.',
    url: 'https://docai.bizlegal-ai.com/decision-tree',
  },
}

export default function DecisionTreePage(): JSX.Element {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'When does GDPR apply to me?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'GDPR (and the parallel UK GDPR) applies whenever you process personal data of individuals located in the EU/EEA or UK, regardless of where your company is based. There is no minimum-volume threshold — one EU subject is enough to attach the regulation.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a Data Subject Access Request (DSAR) and how fast must I respond?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A DSAR is a formal request from an individual asking what personal data you hold about them, why, and demanding correction or deletion. Under GDPR you have 30 days (extendable to 90 in complex cases). Under CCPA you have 45 days (extendable to 90). Failure to respond exposes you to administrative fines and private right of action.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need a DPIA?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A Data Protection Impact Assessment (DPIA) is required under GDPR Article 35 for processing likely to result in a high risk to individuals — including large-scale processing of sensitive categories (health, biometric, criminal records), systematic monitoring, or automated decisions with legal effect. Many US state laws (Colorado, Virginia, Connecticut) mirror these triggers.',
        },
      },
      {
        '@type': 'Question',
        name: 'What sensitive categories trigger heightened obligations?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Under GDPR Article 9 and CCPA-CPRA: health and medical data, biometric data, racial or ethnic origin, religious beliefs, sexual orientation, government IDs (SSN, driver\'s license, passport), precise geolocation, and data of children under 13 (COPPA also applies in the US).',
        },
      },
    ],
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg, #020408)' }}>
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
            color: 'var(--cyan, #00c8ff)',
            fontWeight: 700,
            marginBottom: 12,
          }}>
            Free tool · 60 seconds
          </span>
          <h1 style={{
            fontSize: 44,
            fontWeight: 800,
            color: 'var(--ink, #e8f4ff)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: 16,
          }}>
            Does your business need a privacy scan?
          </h1>
          <p style={{
            fontSize: 17,
            color: 'var(--ink-soft, #c7d8eb)',
            lineHeight: 1.6,
            maxWidth: 520,
            margin: '0 auto',
          }}>
            Five questions. Real preliminary signal across GDPR, CCPA, and US state privacy laws —
            not a marketing quiz. Email-gated only after you see the answer.
          </p>
        </header>

        <PrivacyScanDecisionTree />

        <footer style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--muted, #6f86a5)', lineHeight: 1.6 }}>
            Built on GDPR (Reg. (EU) 2016/679), the UK Data Protection Act 2018, CCPA-CPRA
            (Cal. Civ. Code § 1798.100 et seq.), and the multi-state privacy framework. DocAI is
            software, not a law firm — outcomes depend on your specific facts.
          </p>
        </footer>
      </div>
    </main>
  )
}
