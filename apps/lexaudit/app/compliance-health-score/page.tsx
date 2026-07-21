import type { Metadata } from 'next'
import ComplianceHealthScore from '@/components/ComplianceHealthScore'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Free Compliance Health Score — 40-Question Self-Assessment | LexAudit',
  description:
    'Score your compliance posture across 8 domains in under 10 minutes. Free. No signup until you see your results. Email-gated breakdown reveals your top 3 priority gaps.',
  alternates: { canonical: 'https://lexaudit.bizlegal-ai.com/compliance-health-score' },
  openGraph: {
    title: 'Free Compliance Health Score | LexAudit',
    description:
      '40-question self-assessment across data inventory, consent, vendor management, incident response, and 4 more domains. Get your 0-100 score and top gaps in under 10 minutes.',
    url: 'https://lexaudit.bizlegal-ai.com/compliance-health-score',
  },
}

export default function ComplianceHealthScorePage(): JSX.Element {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a Compliance Health Score?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A Compliance Health Score is a structured 0-100 rating of your organization\'s regulatory posture across eight compliance domains: data inventory, consent and disclosure, data subject rights, vendor management, security controls, incident response, regulatory awareness, and governance. It surfaces gaps before they become enforcement issues.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is the score calculated?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Each of 40 questions across 8 categories is scored: Yes = 2 points, Partially = 1 point, No = 0 points. The maximum raw score is 80 points, normalized to a 0–100 scale. Category scores are shown separately in the full breakdown — emailed to you after the assessment.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is this a legal opinion or a certified audit?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The Compliance Health Score is a self-assessment tool that surfaces likely gaps based on your answers. It is not legal advice, a SOC 2 certification, a GDPR audit, or any other formal attestation. Use it as a starting point — confirm your specific situation with qualified legal counsel.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which privacy and compliance laws does this cover?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The assessment draws on principles from GDPR, CCPA/CPRA, HIPAA, SOC 2, ISO 27001, FinCEN AML requirements, and NIST 800-53. Questions are designed to surface gaps that are relevant across most modern data-handling businesses — not just regulated industries.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does LexAudit do after I complete the assessment?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'After you enter your email, we send your full category breakdown and your top 3 priority gaps — the specific areas where your score indicates the highest regulatory exposure. We also show you how LexAudit Monitor can track regulatory drift in those areas on a continuous basis.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is this different from the compliance monitoring decision tree?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The 5-question decision tree at /decision-tree screens whether continuous monitoring or a one-off audit is appropriate for your situation. This 40-question assessment goes deeper — it maps your actual posture across 8 compliance domains and identifies where specific gaps exist, regardless of which monitoring cadence is right for you.',
        },
      },
    ],
  }

  const toolLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LexAudit Compliance Health Score',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'Free 40-question compliance self-assessment across 8 domains. Produces a 0–100 health score with a prioritized gap report.',
    url: 'https://lexaudit.bizlegal-ai.com/compliance-health-score',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
    provider: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'LexAudit', item: 'https://lexaudit.bizlegal-ai.com' },
      { '@type': 'ListItem', position: 3, name: 'Compliance Health Score', item: 'https://lexaudit.bizlegal-ai.com/compliance-health-score' },
    ],
  }

  return (
    <main style={{ minHeight: '100vh', background: '#050509' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
        <header style={{ marginBottom: 40, textAlign: 'center' }}>
          <span style={{ display: 'inline-block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#c9a84c', fontWeight: 700, marginBottom: 12 }}>
            Free tool · 40 questions · 8 categories
          </span>
          <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 1.2rem + 3vw, 3rem)', fontWeight: 700, color: '#f7f3e8', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 16 }}>
            What is your compliance health score?
          </h1>
          <p style={{ fontSize: 17, color: '#cbd5e1', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
            A 40-question self-assessment across data inventory, consent, vendor management, incident response, and four more domains. Get your 0–100 score instantly — category breakdown and top gaps sent by email.
          </p>
        </header>

        <div style={{ marginBottom: 28, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Data Inventory', 'Consent', 'DSRs', 'Vendors', 'Security', 'Incident Response', 'Regulatory Awareness', 'Governance'].map(cat => (
            <span key={cat} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, background: '#0d0d18', border: '1px solid #2a2418', color: '#7a7a7a' }}>
              {cat}
            </span>
          ))}
        </div>

        <ComplianceHealthScore />

        <footer style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#7a7a7a', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
            This is a preliminary self-assessment, not legal advice, a SOC 2 attestation, or a GDPR audit. Results depend on the accuracy of your answers. Final compliance determinations should be confirmed with qualified legal counsel.{' '}
            <a href="/decision-tree" style={{ color: '#c9a84c', textDecoration: 'none' }}>Not sure whether you need continuous monitoring? Take the 60-second decision tree →</a>
          </p>
        </footer>
      </div>
    </main>
  )
}
