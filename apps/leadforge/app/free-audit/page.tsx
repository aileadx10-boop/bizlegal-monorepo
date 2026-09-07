import type { Metadata } from 'next'
import FreeAudit from '@/components/FreeAudit'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Free Consent & Suppression Audit | LeadForge',
  description:
    'A free 10-point self-audit of your outbound campaign consent records, suppression-list hygiene, and sending practices. Instant score and prioritized fix list — no signup until results are ready.',
  alternates: { canonical: 'https://leadforge.bizlegal-ai.com/free-audit' },
  openGraph: {
    title: 'Free Consent & Suppression Audit | LeadForge',
    description:
      'Ten checks across consent capture, suppression & opt-outs, sending practices, and recordkeeping. Get a 0–100 score and a prioritized fix list in about two minutes.',
    url: 'https://leadforge.bizlegal-ai.com/free-audit',
  },
}

export default function FreeAuditPage(): JSX.Element {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What does the free audit check?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ten self-reported checks across four areas: consent capture (per-lead records, written-consent elements, revocation handling), suppression and opt-outs (National DNC scrubs, internal do-not-contact lists, purchased-lead consent scope), sending practices (autodialer disclosures, quiet hours, CAN-SPAM basics), and recordkeeping (evidence retention, named compliance owner).',
        },
      },
      {
        '@type': 'Question',
        name: 'How is the audit score calculated?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Each check is answered Yes, Partially, or No and scored by a deterministic engine weighted by severity — critical controls count more than medium ones. Area scores are severity-weighted averages; the overall score is the weighted ratio normalised to 0–100.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the free audit legal advice?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The audit summarises your own answers about your practices. It is a preliminary signal — not legal advice, not an audit in the assurance sense, and not a compliance certification. TCPA and CAN-SPAM outcomes are fact-specific; confirm your specific situation with qualified legal counsel.',
        },
      },
      {
        '@type': 'Question',
        name: 'What do I get at the end?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A 0–100 posture score, per-area breakdowns, and a prioritized fix list for every control you marked partial or unmet — shown on-page and emailed to you. Where a gap calls for evidence-grade tooling, we point you to the relevant paid BizLegal product.',
        },
      },
    ],
  }

  const toolLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LeadForge Free Consent & Suppression Audit',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Free 10-point self-audit of outbound campaign consent records, suppression-list hygiene, sending practices, and recordkeeping. Produces a 0–100 posture score with per-area aggregates and a prioritized fix list.',
    url: 'https://leadforge.bizlegal-ai.com/free-audit',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
    provider: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'LeadForge', item: 'https://leadforge.bizlegal-ai.com' },
      { '@type': 'ListItem', position: 3, name: 'Free Audit', item: 'https://leadforge.bizlegal-ai.com/free-audit' },
    ],
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--lead-ink, #07111f)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

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
            Free audit · 10 checks · 2 minutes
          </span>
          <h1 style={{
            fontSize: 44,
            fontWeight: 800,
            color: 'var(--lead-sand, #f7f4ec)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: 16,
          }}>
            Audit your consent and suppression posture
          </h1>
          <p style={{
            fontSize: 17,
            color: '#cbd5e1',
            lineHeight: 1.7,
            maxWidth: 560,
            margin: '0 auto',
          }}>
            Ten checks across consent capture, suppression lists, sending practices, and
            recordkeeping — the controls a TCPA complaint actually probes. Instant score and a
            prioritized fix list. Email-gated only after you answer.
          </p>
        </header>

        <div style={{ marginBottom: 28, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Consent capture', 'Suppression & opt-outs', 'Sending practices', 'Recordkeeping'].map((area) => (
            <span key={area} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, background: 'var(--lead-panel, #0f1a2c)', border: '1px solid rgba(247, 244, 236, 0.08)', color: '#8a98ad' }}>
              {area}
            </span>
          ))}
        </div>

        <FreeAudit />

        <footer style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#8a98ad', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
            The free audit summarises self-reported practices across a 10-point checklist. It is a
            preliminary signal — not legal advice, not an audit in the assurance sense, and not a
            compliance certification. Built on the Telephone Consumer Protection Act (47 U.S.C.
            § 227), the CAN-SPAM Act (15 U.S.C. § 7701 et seq.), and the FCC&apos;s consent and
            revocation rules. Confirm your specific situation with qualified counsel.{' '}
            <a href="/decision-tree" style={{ color: 'var(--lead-accent-soft, #82e7bf)', textDecoration: 'none' }}>
              Want a faster screen? Take the 60-second decision tree →
            </a>
          </p>
        </footer>
      </div>
    </main>
  )
}
