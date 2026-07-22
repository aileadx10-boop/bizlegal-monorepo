import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'India DPDPA Compliance Guide for B2B SaaS (2025) | BizLegal AI',
  description:
    'The Digital Personal Data Protection Act 2023 applies to any company processing data of India-resident users — with no minimum threshold. Fines reach ₹250 crore (~$30M USD). This guide covers notice requirements, consent obligations, DPO thresholds, Significant Data Fiduciary criteria, and what to do before late-2026 enforcement.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/india-dpdpa-compliance-guide' },
  openGraph: {
    title: 'India DPDPA Compliance Guide — BizLegal AI',
    description: 'Practical guide for B2B SaaS companies with India users. DPDPA notice, consent, DPO, Significant Data Fiduciary — all covered.',
    url: 'https://bizlegal-ai.com/guides/india-dpdpa-compliance-guide',
    type: 'article',
  },
}

const APPLICABILITY_GRID = [
  { scenario: 'US SaaS with a free tier accessible from India', applies: true },
  { scenario: 'B2B software sold to Indian companies processing user data on your platform', applies: true },
  { scenario: 'Marketing emails sent to India-based contacts', applies: true },
  { scenario: 'India CDN endpoint loading JS from a US server', applies: true },
  { scenario: 'Non-personal or fully anonymised data only', applies: false },
  { scenario: 'Processing data of non-India residents only', applies: false },
  { scenario: 'Data processing for personal or domestic purposes', applies: false },
]

const CONSENT_REQUIREMENTS = [
  { requirement: 'Notice must precede consent', detail: 'Section 5: notice must be given BEFORE seeking consent. Notice then consent — never the reverse.' },
  { requirement: 'Notice contents (Section 5)', detail: 'Personal data to be collected; purpose of processing; how to withdraw consent and access/correct/erase data; contact details for Data Protection Officer (if applicable) or grievance mechanism.' },
  { requirement: 'Consent language', detail: 'Section 6: free, specific, informed, unconditional, and unambiguous. A single affirmative act. No pre-ticked boxes. No consent bundled into terms of service.' },
  { requirement: 'Consent for each purpose', detail: 'Processing for purposes beyond what was disclosed at consent is not permitted without fresh notice + consent. This matters for secondary analytics use cases.' },
  { requirement: 'Withdrawal mechanism', detail: 'Must be as easy as giving consent. If consent is given by email, withdrawal cannot require a legal process. A single "withdraw consent" link is the minimum.' },
  { requirement: 'Legitimate uses without consent', detail: 'Section 7 creates narrow exceptions: state functions, medical emergencies, public health, employment law obligations, court orders. These do not apply to typical SaaS products.' },
]

const DATA_PRINCIPAL_RIGHTS = [
  { right: 'Right to access (Section 11)', detail: 'Summary of personal data being processed and information about the entities to whom it was disclosed in the preceding 12 months. Must be provided on request.' },
  { right: 'Right to correction and erasure (Section 12)', detail: 'Correct inaccurate or misleading personal data; update data that is out of date; erase data no longer necessary for the purpose it was collected for (subject to retention obligations under other laws).' },
  { right: 'Right to grievance redress (Section 13)', detail: 'Each Data Fiduciary must have a grievance mechanism. Data principals can escalate to the Data Protection Board if the grievance is not resolved in a reasonable time.' },
  { right: 'Right to nominate (Section 14)', detail: 'A data principal can nominate another individual to exercise their rights in the event of death or incapacity. This is unique to DPDPA — no equivalent in GDPR or CCPA.' },
]

const SDF_CRITERIA = [
  'Volume of personal data processed',
  'Sensitivity of personal data (health, financial, children\'s data)',
  'Risk to national security or public order',
  'Risk to electoral democracy or fundamental rights',
  'Potential impact on sovereignty, integrity, or security of India',
  'Risk to individual data principals',
]

const SDF_OBLIGATIONS = [
  { obligation: 'Data Protection Officer (DPO)', detail: 'Must appoint a DPO based in India (or accessible from India). Contact details published. DPO must be a person, not just an email address.' },
  { obligation: 'Data Protection Impact Assessment', detail: 'Periodic DPIAs on the processing that led to the SDF designation. Assessment must cover the risk to data principals and the mitigating measures in place.' },
  { obligation: 'Independent audit', detail: 'Periodic independent audits of processing activities and compliance posture. Audit reports provided to Data Protection Board on request.' },
  { obligation: 'Data localisation (if notified)', detail: 'Government may notify specific SDF categories for mandatory data localisation. Not yet in force for general SaaS — watch this space.' },
]

const FINE_SCHEDULE = [
  { breach: 'Failure to safeguard personal data (data breach resulting from non-implementation of reasonable security)', fine: '₹250 crore (~$30M USD)' },
  { breach: 'Failure to notify Data Protection Board and affected data principals of a personal data breach', fine: '₹200 crore (~$24M USD)' },
  { breach: 'Breach of obligations applicable to Significant Data Fiduciaries', fine: '₹150 crore (~$18M USD)' },
  { breach: 'Failure to comply with data principal rights (access, correction, erasure, grievance, nomination)', fine: '₹50 crore (~$6M USD)' },
  { breach: 'Failure to observe obligations for processing children\'s data (no parental consent)', fine: '₹200 crore (~$24M USD)' },
]

const FAQ = [
  {
    q: 'Does DPDPA apply to a US company with no employees in India?',
    a: 'Yes. Section 3 of the DPDPA applies to the processing of digital personal data of data principals within India — regardless of where the data fiduciary (you) is located. If any of your users are India-resident individuals, and you process their personal data in digital form, the DPDPA applies. There is no minimum number of Indian users, no revenue threshold, and no "substantial nexus to India" requirement.',
  },
  {
    q: 'When does DPDPA enforcement actually begin?',
    a: 'The Digital Personal Data Protection Act, 2023 received Presidential assent on 11 August 2023. The Data Protection Board and the implementing rules were finalized in 2025. Enforcement (including fines) is expected to begin in late 2026 once the Board is fully operational. This timeline is consistent with government statements, but no exact date has been gazette-notified as of July 2025.',
  },
  {
    q: 'What is the difference between a Data Fiduciary and a Data Processor under DPDPA?',
    a: 'A Data Fiduciary determines the purpose and means of processing personal data — that is you (the SaaS company) when you collect and use customer data for your product. A Data Processor processes personal data on behalf of a Data Fiduciary — that is your subprocessors (AWS, Stripe, Intercom, etc.) when they handle customer data under your instructions. The primary obligations under DPDPA rest with the Data Fiduciary. Processors have limited obligations set by contract.',
  },
  {
    q: 'How is DPDPA consent different from GDPR consent?',
    a: 'Both require specific, informed, unambiguous consent for processing beyond legitimate use. Key DPDPA differences: (1) DPDPA requires notice first, consent second — in strict sequence; (2) DPDPA requires a "right to nominate" (unique to India); (3) GDPR has 6 lawful bases; DPDPA has consent plus narrow legitimate-use exemptions in Section 7 (state functions, emergencies, employment law) — there is no "legitimate interests" basis in DPDPA. For most B2B SaaS, DPDPA essentially requires consent for everything that GDPR might rely on legitimate interests for.',
  },
  {
    q: 'My product is B2B — do I still need to worry about data principal rights?',
    a: 'Yes. Even in B2B SaaS, if you process personal data of your customers\' employees (names, emails, usage logs), those individuals are data principals with rights under DPDPA. Your enterprise customer (the direct business) is also a data principal if they are a sole trader or partnership. You need a mechanism for data principals to exercise their access, correction, erasure, and grievance rights — not just for individual consumers.',
  },
]

export default function IndiaDpdpaGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'India DPDPA Compliance Guide for B2B SaaS (2025)',
    description: 'Practical DPDPA compliance for SaaS companies with India users. Notice, consent, DPO, Significant Data Fiduciary, fines.',
    url: 'https://bizlegal-ai.com/guides/india-dpdpa-compliance-guide',
    datePublished: '2025-07-22',
    dateModified: '2025-07-22',
    author: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    publisher: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://bizlegal-ai.com/guides/india-dpdpa-compliance-guide' },
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://bizlegal-ai.com/guides' },
      { '@type': 'ListItem', position: 3, name: 'India DPDPA Compliance Guide', item: 'https://bizlegal-ai.com/guides/india-dpdpa-compliance-guide' },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main style={{ maxWidth: '780px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        <nav style={{ fontSize: '0.8rem', opacity: 0.55, marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'inherit' }}>Home</a>
          {' → '}
          <a href="/guides" style={{ color: 'inherit' }}>Guides</a>
          {' → '}
          India DPDPA Compliance Guide
        </nav>

        <span style={{ display: 'inline-block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, opacity: 0.5, marginBottom: '0.75rem' }}>
          Privacy Law · India · DPDPA
        </span>

        <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem', marginTop: 0, letterSpacing: '-0.025em' }}>
          India DPDPA Compliance Guide for B2B SaaS (2025)
        </h1>

        <p style={{ fontSize: '1.1rem', lineHeight: 1.75, opacity: 0.8, marginBottom: '0.5rem' }}>
          The Digital Personal Data Protection Act, 2023 (DPDPA) applies extraterritorially — one India-resident user is enough to trigger it. Enforcement by the Data Protection Board is expected late 2026. Fines reach <strong>₹250 crore (~$30M USD) per failure</strong>. This guide covers who is in scope, what notice and consent require, data principal rights, Significant Data Fiduciary obligations, and the fine schedule.
        </p>

        <div style={{ fontSize: '0.85rem', opacity: 0.55, marginBottom: '2.5rem' }}>
          Decision-support only. Not a legal opinion. For binding DPDPA interpretation, retain India-licensed privacy counsel.
        </div>

        {/* Section 1: Applicability */}
        <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.015em' }}>
          1. Does DPDPA Apply to You?
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: '1.5rem' }}>
          DPDPA applies to processing of <em>digital personal data</em> of <em>data principals within India</em>. There is no minimum user count, no revenue threshold, and no requirement to have a local entity. Check each scenario:
        </p>
        <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '2rem' }}>
          {APPLICABILITY_GRID.map((row) => (
            <div key={row.scenario} style={{ display: 'grid', gridTemplateColumns: '2rem 1fr', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border, #e5e7eb)', alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem', textAlign: 'center' }}>{row.applies ? '✓' : '✗'}</span>
              <span style={{ fontSize: '0.875rem', lineHeight: 1.5, color: row.applies ? 'inherit' : 'var(--color-text-muted, #6b7280)' }}>{row.scenario}</span>
            </div>
          ))}
        </div>

        {/* Section 2: Notice + Consent */}
        <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.015em' }}>
          2. Notice and Consent Requirements (Sections 5-7)
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: '1.5rem' }}>
          The consent framework under DPDPA is more prescriptive than GDPR. Section 5 mandates a specific notice structure; Section 6 defines valid consent; Section 7 enumerates the narrow categories of processing that can proceed without consent. The sequence is fixed: <strong>notice first, consent second</strong>.
        </p>
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          {CONSENT_REQUIREMENTS.map((item) => (
            <div key={item.requirement} style={{ border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '10px', padding: '1.1rem' }}>
              <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.4rem' }}>{item.requirement}</strong>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.65, margin: 0, opacity: 0.8 }}>{item.detail}</p>
            </div>
          ))}
        </div>

        {/* Section 3: Data Principal Rights */}
        <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.015em' }}>
          3. Data Principal Rights (Sections 11-14)
        </h2>
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          {DATA_PRINCIPAL_RIGHTS.map((item) => (
            <div key={item.right} style={{ border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '10px', padding: '1.1rem' }}>
              <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.4rem' }}>{item.right}</strong>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.65, margin: 0, opacity: 0.8 }}>{item.detail}</p>
            </div>
          ))}
        </div>

        {/* Section 4: Significant Data Fiduciary */}
        <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.015em' }}>
          4. Significant Data Fiduciary (SDF) — Section 10
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
          The Data Protection Board may designate any Data Fiduciary as a &quot;Significant Data Fiduciary&quot; based on the following criteria. SDF designation brings four additional obligations on top of the standard framework:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {SDF_CRITERIA.map((c) => (
            <div key={c} style={{ padding: '0.6rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', lineHeight: 1.5 }}>{c}</div>
          ))}
        </div>
        <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}><strong>Additional SDF obligations:</strong></p>
        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '2rem' }}>
          {SDF_OBLIGATIONS.map((item) => (
            <div key={item.obligation} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem', padding: '0.9rem 1rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '8px', alignItems: 'start' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary, #1a56db)' }}>+</span>
              <div>
                <strong style={{ fontSize: '0.9rem' }}>{item.obligation}</strong>
                <p style={{ fontSize: '0.83rem', lineHeight: 1.55, margin: '0.25rem 0 0', opacity: 0.7 }}>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Section 5: Fine Schedule */}
        <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.015em' }}>
          5. DPDPA Fine Schedule (Section 33)
        </h2>
        <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border, #e5e7eb)' }}>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 700 }}>Breach</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>Max fine</th>
              </tr>
            </thead>
            <tbody>
              {FINE_SCHEDULE.map((row) => (
                <tr key={row.breach} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <td style={{ padding: '0.7rem 0.75rem', lineHeight: 1.5 }}>{row.breach}</td>
                  <td style={{ padding: '0.7rem 0.75rem', textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap', color: '#dc2626' }}>{row.fine}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div style={{ marginTop: '2.5rem', padding: '1.75rem 2rem', background: 'var(--primary, #1a56db)', borderRadius: '12px', color: '#fff' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            Get your DPDPA gap audit — $19 one-time
          </h3>
          <p style={{ margin: '0 0 1.25rem', opacity: 0.9, lineHeight: 1.6, fontSize: '0.95rem' }}>
            Section-by-section mapping of your current posture to DPDPA notice, consent, data principal rights, DPO appointment, and Significant Data Fiduciary criteria. Includes a DPO appointment letter template. PDF delivered within 24 hours.
          </p>
          <a
            href="https://bizlegal-ai.com/agents/india-dpdpa"
            style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#fff', color: 'var(--primary, #1a56db)', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}
          >
            Get DPDPA Gap Audit — $19 →
          </a>
        </div>

        {/* FAQ */}
        <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', fontWeight: 700, marginTop: '3rem', marginBottom: '1rem', letterSpacing: '-0.015em' }}>
          Frequently asked questions
        </h2>
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          {FAQ.map((item) => (
            <div key={item.q} style={{ border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '10px', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.6rem' }}>{item.q}</h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.7, margin: 0, opacity: 0.8 }}>{item.a}</p>
            </div>
          ))}
        </div>

        {/* Cross-links */}
        <div style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '2rem', marginTop: '2rem' }}>
          <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1rem' }}>Related compliance resources</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link href="/regulations/dpdpa" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>
              India DPDPA Compliance Hub →
            </Link>
            <Link href="/guides/gdpr-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>
              GDPR Compliance Checklist →
            </Link>
            <Link href="/agents/policy-refresh" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>
              Privacy Policy Auto-Refresh →
            </Link>
            <Link href="/guides/compliance-health-score-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>
              Compliance Health Score →
            </Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>
              All Compliance Guides →
            </Link>
          </div>
        </div>

      </main>
    </>
  )
}
