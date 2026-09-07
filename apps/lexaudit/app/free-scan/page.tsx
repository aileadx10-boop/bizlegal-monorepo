import type { Metadata } from 'next'
import FreeScan from '@/components/FreeScan'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Free Compliance Scan — 10-Point Signal Check | LexAudit',
  description:
    'Run a free 10-check compliance scan across SOC 2, ISO 27001, GDPR, HIPAA, and DPDP in under two minutes. Instant summary score and gap counts — no signup until results are ready.',
  alternates: { canonical: 'https://lexaudit.bizlegal-ai.com/free-scan' },
  openGraph: {
    title: 'Free Compliance Scan | LexAudit',
    description:
      'A 10-point signal check drawn from the LexAudit 60-signal registry. Get a 0–100 summary score, per-framework aggregates, and your high-severity gap count in under two minutes.',
    url: 'https://lexaudit.bizlegal-ai.com/free-scan',
  },
}

export default function FreeScanPage(): JSX.Element {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What does the free compliance scan check?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ten self-attestation checks — two per framework across SOC 2, ISO/IEC 27001:2022, GDPR, the HIPAA Security Rule, and the DPDP Act 2023. Each check maps to a specific published control in the LexAudit signal registry, so results are comparable to the full 60-signal assessment.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is the free scan score calculated?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Each check is answered Yes, Partially, or No and scored by the same deterministic engine that powers the paid assessment, weighted by control severity. Framework scores are severity-weighted averages; the overall score is the mean of framework scores, normalised to 0–100.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the free scan legal advice or a certification?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The free scan summarises self-reported signals. It is regulatory intelligence — not legal advice, not an audit, and not a SOC 2, GDPR, HIPAA, or any other certification. Confirm your specific situation with qualified legal counsel.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between the free scan and LexAudit Monitor?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The free scan is a one-time snapshot of ten checks. LexAudit Monitor ($99/mo) runs a daily semantic-diff against tracked regulators and frameworks — SEC, CFPB, FinCEN, state AGs and more — and emails you an impact note the moment guidance shifts, plus one human-reviewed brief per quarter.',
        },
      },
    ],
  }

  const toolLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LexAudit Free Compliance Scan',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'Free 10-check compliance signal scan across SOC 2, ISO 27001, GDPR, HIPAA, and DPDP. Produces a 0–100 summary score with per-framework aggregates and gap counts.',
    url: 'https://lexaudit.bizlegal-ai.com/free-scan',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
    provider: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'LexAudit', item: 'https://lexaudit.bizlegal-ai.com' },
      { '@type': 'ListItem', position: 3, name: 'Free Compliance Scan', item: 'https://lexaudit.bizlegal-ai.com/free-scan' },
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
            Free scan · 10 checks · 2 minutes
          </span>
          <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 1.2rem + 3vw, 3rem)', fontWeight: 700, color: '#f7f3e8', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 16 }}>
            Scan your compliance posture in two minutes
          </h1>
          <p style={{ fontSize: 17, color: '#cbd5e1', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
            Ten checks drawn from the same 60-signal registry that powers the paid LexAudit assessment — two each across SOC 2, ISO 27001, GDPR, HIPAA, and DPDP. Instant summary score, no signup until your results are ready.
          </p>
        </header>

        <div style={{ marginBottom: 28, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['SOC 2', 'ISO 27001', 'GDPR', 'HIPAA', 'DPDP'].map(fw => (
            <span key={fw} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, background: '#0d0d18', border: '1px solid #2a2418', color: '#7a7a7a' }}>
              {fw}
            </span>
          ))}
        </div>

        <FreeScan />

        <footer style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#7a7a7a', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
            The free scan summarises self-reported signals across a 10-check subset. It is regulatory intelligence — not legal advice, an audit, or a certification. Results depend on the accuracy of your answers; confirm your specific situation with qualified legal counsel.{' '}
            <a href="/compliance-health-score" style={{ color: '#c9a84c', textDecoration: 'none' }}>Want all 40 questions? Take the full assessment →</a>
          </p>
        </footer>
      </div>
    </main>
  )
}
