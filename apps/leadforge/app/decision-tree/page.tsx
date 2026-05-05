import type { Metadata } from 'next'
import LeadGenDecisionTree from '@/components/LeadGenDecisionTree'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'TCPA / Lead-Gen Decision Tree | LeadForge',
  description:
    'Find out in 60 seconds whether your outbound campaigns carry TCPA / CAN-SPAM exposure. Free, no signup until the result.',
  openGraph: {
    title: 'TCPA / Lead-Gen Decision Tree | LeadForge',
    description:
      'Free 60-second TCPA / CAN-SPAM exposure screen. Real preliminary signal across consent, suppression, and autodialer use. Email-gated full breakdown.',
    url: 'https://leadforge.bizlegal-ai.com/decision-tree',
  },
}

export default function DecisionTreePage(): JSX.Element {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What are the statutory damages under TCPA?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TCPA establishes statutory damages of $500 per violation, trebled to $1,500 for willful or knowing violations. There is also a private right of action — plaintiffs can sue without showing actual damages, and class actions aggregate to multi-million-dollar settlements rapidly.',
        },
      },
      {
        '@type': 'Question',
        name: 'What counts as adequate prior express written consent?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Per FCC rules, consent must be in writing, signed (electronic signature acceptable), include the specific phone number being authorized, identify the seller and the purpose, and not be required as a condition of purchase. The defense burden is on the sender to produce the signed consent record at the time of the message.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the National Do Not Call Registry?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The National DNC Registry, maintained by the FTC, lists phone numbers consumers have requested not to receive telemarketing calls. Telemarketers must scrub their lists against the DNC every 31 days under FCC rules. Calling a registered number is a separate violation under both TCPA and the Telemarketing Sales Rule.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does TCPA apply to email and text messaging?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TCPA applies to text messaging — courts have consistently held SMS is a "call" for TCPA purposes. Email is governed primarily by CAN-SPAM, which has different (generally lower) damages but parallel consent and opt-out requirements. Many enforcement matters cite both regimes.',
        },
      },
    ],
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--lead-ink, #07111f)' }}>
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
            color: 'var(--lead-accent-soft, #82e7bf)',
            fontWeight: 700,
            marginBottom: 12,
          }}>
            Free tool · 60 seconds
          </span>
          <h1 style={{
            fontSize: 44,
            fontWeight: 800,
            color: 'var(--lead-sand, #f7f4ec)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: 16,
          }}>
            Are your outbound campaigns at TCPA risk?
          </h1>
          <p style={{
            fontSize: 17,
            color: '#cbd5e1',
            lineHeight: 1.7,
            maxWidth: 540,
            margin: '0 auto',
          }}>
            Five questions. Real preliminary signal across consent, suppression, and autodialer
            exposure — not a marketing quiz. Email-gated only after you see the answer.
          </p>
        </header>

        <LeadGenDecisionTree />

        <footer style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#8a98ad', lineHeight: 1.6 }}>
            Built on the Telephone Consumer Protection Act (47 U.S.C. § 227), the CAN-SPAM Act
            (15 U.S.C. § 7701 et seq.), the Telemarketing Sales Rule, and the FCC&apos;s 2023-2024
            consent-revocation rule updates. LeadForge is software, not a law firm — outcomes
            depend on your specific facts.
          </p>
        </footer>
      </div>
    </main>
  )
}
