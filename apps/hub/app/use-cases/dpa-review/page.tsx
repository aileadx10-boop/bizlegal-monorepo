import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'DPA Review Automation for Fintech — DocAI | BizLegal AI',
  description:
    'Review and negotiate Data Processing Agreements in 15 minutes instead of 3 days. AI-powered DPA analysis for fintech, SaaS, and crypto companies handling EU personal data.',
  alternates: { canonical: 'https://bizlegal-ai.com/use-cases/dpa-review' },
  openGraph: {
    title: 'DPA Review Automation — From 3-Day Legal Review to 15 Minutes',
    description:
      'DocAI automates DPA review and redlining for GDPR Article 28 compliance. Purpose limitation, sub-processor clauses, and transfer mechanism analysis in minutes.',
    url: 'https://bizlegal-ai.com/use-cases/dpa-review',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a Data Processing Agreement (DPA) and when do I need one?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Data Processing Agreement (DPA) is a contract required by GDPR Article 28 whenever a data controller (you) uses a data processor (a vendor who processes EU personal data on your behalf). You need a DPA with every SaaS tool, cloud provider, or API that processes your EU users\' personal data. Failure to have a DPA exposes you to fines up to €10M or 2% of global annual revenue.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does DocAI check when reviewing a DPA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DocAI checks: (1) Whether required GDPR Article 28(3) clauses are present — purpose limitation, processing instructions, confidentiality, security measures, sub-processor restrictions, deletion obligations, audit rights, and assistance obligations. (2) Whether Standard Contractual Clauses (SCCs) or BCRs are included for international data transfers. (3) Sub-processor list completeness and notification requirements. (4) Data breach notification timelines. (5) Any unusual clauses that expand processor rights beyond what GDPR permits.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is DocAI DPA review different from sending a DPA to a lawyer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DocAI takes 15 minutes and costs $69/month (or $97 per scan). A lawyer reviewing a DPA typically takes 2-5 business days and bills 3-8 hours at $250-450/hour ($750-3,600 per DPA). DocAI identifies missing clauses, flags risky provisions, and suggests specific redlines in the same time it takes to schedule a lawyer call. Use DocAI for the analysis, and only engage a lawyer for the final negotiation on high-value agreements.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can DocAI help me negotiate DPA terms with a vendor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. DocAI identifies the specific clauses that need redlining and explains why, allowing you to send targeted redlines to the vendor instead of a general "our legal team needs to review this" response. DocAI\'s output includes negotiating rationale for each flag — helping your team hold the position without a lawyer on every email.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does DocAI support DPAs for US-EU data transfers (SCCs)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. DocAI checks whether the DPA includes the 2021 EU Standard Contractual Clauses (SCCs) for international transfers, verifies the correct module is selected (Controller-to-Processor or Controller-to-Controller), and flags if the transfer impact assessment (TIA) requirement is addressed. It also notes if the UK IDTA addendum is needed for UK-specific transfers.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many DPAs can I review per month with the $69/mo plan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The $69/month DocAI plan covers unlimited DPA reviews with no per-document fee. The $97 one-time scan covers a single DPA review session with export. Most companies onboarding new SaaS vendors or starting EU enterprise deals review 3-10 DPAs per month — the monthly plan pays for itself after the first agreement.',
      },
    },
  ],
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
    { '@type': 'ListItem', position: 2, name: 'Use Cases', item: 'https://bizlegal-ai.com/use-cases' },
    { '@type': 'ListItem', position: 3, name: 'DPA Review Automation', item: 'https://bizlegal-ai.com/use-cases/dpa-review' },
  ],
}

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'DocAI DPA Review — Data Processing Agreement Analysis',
  applicationCategory: 'LegalApplication',
  operatingSystem: 'Web',
  url: 'https://docai.bizlegal-ai.com',
  description:
    'AI-powered DPA review and negotiation support. Checks GDPR Article 28 compliance, SCC validity, sub-processor clauses, and transfer mechanisms in 15 minutes.',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '69',
    highPrice: '97',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
}

const CLAUSE_CHECKS = [
  'Purpose limitation and documented processing instructions',
  'Confidentiality obligations on processor personnel',
  'Security measures (Art. 32) — technical and organisational',
  'Sub-processor authorisation and notification requirements',
  'Audit rights and information provision obligations',
  'Data subject rights assistance timeline',
  'Deletion or return of data at contract end',
  'Breach notification within 72-hour window',
  'SCCs for US-EU transfers (Module 2 or Module 4)',
  'UK IDTA addendum for UK-specific flows',
  'Transfer Impact Assessment (TIA) reference',
  'Data retention limits and review schedule',
]

export default function DpaReviewPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingTop: '36px' }}>
        {/* Nav */}
        <div style={{ background: 'rgba(7,9,26,0.95)', borderBottom: '1px solid rgba(125,211,252,0.08)' }}>
          <div className="container" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" className="nav-logo" style={{ marginRight: 'auto' }}>BizLegal<em>AI</em></Link>
            <a href="https://docai.bizlegal-ai.com" className="btn-ghost" style={{ fontSize: '12px' }}>Free DPA Scan</a>
            <a href="https://docai.bizlegal-ai.com" className="btn-primary" style={{ fontSize: '12px' }}>Start $69/mo →</a>
          </div>
        </div>

        {/* Hero */}
        <div style={{ padding: '80px 24px 60px', maxWidth: '900px', margin: '0 auto' }}>
          <nav style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '24px' }}>
            <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Home</Link>
            {' / '}
            <Link href="/use-cases" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Use Cases</Link>
            {' / '}
            <span style={{ color: 'var(--text)' }}>DPA Review</span>
          </nav>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(125,211,252,0.2)', background: 'rgba(125,211,252,0.05)', fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: 'var(--sky)', marginBottom: '28px' }}>
            DocAI — GDPR Article 28 DPA Analysis
          </div>
          <h1 style={{ fontFamily: 'Gloock, serif', fontSize: 'clamp(32px, 5vw, 56px)', color: 'var(--white)', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
            DPA Review Automation:<br />
            <em style={{ fontStyle: 'italic', color: 'var(--sky)' }}>15 Minutes, Not 3 Days</em>
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--muted)', lineHeight: 1.8, maxWidth: '680px', marginBottom: '36px' }}>
            Every time an EU enterprise buyer signs up, they send you their Data Processing Agreement. GDPR Article 28 requires you to review it — not just sign it. DocAI reads the DPA, checks all 12 required Article 28(3) clauses, flags missing sub-processor provisions, and identifies risky transfer mechanisms. In 15 minutes.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="https://docai.bizlegal-ai.com" className="lx-btn-p">Free DPA Scan →</a>
            <a href="/regulations/gdpr" className="lx-btn-g">GDPR Guide</a>
          </div>
        </div>

        {/* Clause checklist */}
        <div style={{ background: 'rgba(7,9,26,0.6)', padding: '60px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '8px' }}>
              What DocAI Checks in Every DPA
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '32px' }}>
              Based on GDPR Article 28(3) mandatory provisions + EDPB transfer mechanism guidance
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {CLAUSE_CHECKS.map((c) => (
                <div key={c} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', border: '1px solid rgba(125,211,252,0.08)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--sky)', fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✓</span>
                  <span style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROI comparison */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '40px' }}>
            DocAI vs. Outside Legal Counsel
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(125,211,252,0.2)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--muted)', fontWeight: 500 }}>Factor</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--sky)' }}>DocAI</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--muted)' }}>Outside Counsel</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Review time', '15 minutes', '2-5 business days'],
                  ['Cost per DPA', '$0 (included in $69/mo)', '$750-3,600'],
                  ['Availability', 'Instant, 24/7', 'Business hours, with scheduling'],
                  ['Coverage', '12 Art. 28 clauses + SCCs + IDTA', 'Variable by firm'],
                  ['Redline output', 'Specific clause-by-clause flags', 'Track-changes Word doc'],
                  ['SCC module check', 'Automatic', 'Billed separately'],
                  ['Sub-processor analysis', 'Full list review', 'Often excluded'],
                ].map(([f, d, l]) => (
                  <tr key={f} style={{ borderBottom: '1px solid rgba(125,211,252,0.06)' }}>
                    <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>{f}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--white)', fontWeight: 500 }}>{d}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>{l}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ background: 'rgba(7,9,26,0.4)', padding: '60px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '40px' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {faqSchema.mainEntity.map((faq) => (
                <div key={faq.name} style={{ padding: '24px', border: '1px solid rgba(125,211,252,0.1)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '16px', color: 'var(--white)', marginBottom: '10px', fontWeight: 600 }}>{faq.name}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'rgba(125,211,252,0.04)', borderTop: '1px solid rgba(125,211,252,0.12)', padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '36px', color: 'var(--white)', marginBottom: '16px' }}>
            Stop delaying EU deals for DPA review.
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--muted)', marginBottom: '36px', maxWidth: '500px', margin: '0 auto 36px' }}>
            Upload any DPA. Get a full Article 28 compliance audit, SCC check, and negotiating redlines in 15 minutes. Free preview — no credit card.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://docai.bizlegal-ai.com" className="lx-btn-p" style={{ fontSize: '15px', padding: '14px 32px' }}>
              Free DPA Scan →
            </a>
            <Link href="/pricing" className="lx-btn-g" style={{ fontSize: '15px', padding: '14px 32px' }}>
              $69/mo Plan
            </Link>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '16px' }}>$69/mo · $97 one-time · Not legal advice — GDPR Article 28 compliance tool</p>
        </div>
      </div>
    </>
  )
}
