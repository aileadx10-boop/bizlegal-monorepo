import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ISO 27001 vs SOC 2: Which Does Your SaaS Startup Need? (2025) | BizLegal AI',
  description:
    'ISO 27001 takes 9-18 months and costs $40-80K. SOC 2 takes 4-9 months and costs $20-50K. Which one enterprise customers actually require — and when you need both.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/iso-27001-vs-soc2-guide' },
  openGraph: {
    title: 'ISO 27001 vs SOC 2: Which Does Your SaaS Startup Need? (2025)',
    description:
      'ISO 27001 vs SOC 2: timeline, cost, geographic recognition, and which standard your enterprise customers actually require.',
    url: 'https://bizlegal-ai.com/guides/iso-27001-vs-soc2-guide',
    type: 'article',
  },
}

const COMPARISON_MATRIX = [
  {
    dimension: 'Standard body / origin',
    iso: 'ISO/IEC (international)',
    soc: 'AICPA (United States)',
  },
  {
    dimension: 'Geographic recognition',
    iso: 'Global — preferred in EU, Asia, and government procurement',
    soc: 'Primarily North America; increasingly accepted globally',
  },
  {
    dimension: 'Type',
    iso: 'Management system standard (ISMS)',
    soc: 'Audit report (attestation by a CPA firm)',
  },
  {
    dimension: 'Output',
    iso: 'Certificate — 3-year validity with annual surveillance audits',
    soc: 'Type I report (point-in-time) or Type II report (6-12 month period)',
  },
  {
    dimension: 'Time to first certification / report',
    iso: '9–18 months',
    soc: '4–9 months (Type I: 2–4 months)',
  },
  {
    dimension: 'Year-1 cost',
    iso: '$40,000–$80,000',
    soc: '$20,000–$50,000',
  },
  {
    dimension: 'Ongoing maintenance',
    iso: 'Annual surveillance audits + 3-year recertification',
    soc: 'Annual renewal recommended; most enterprise customers require annual Type II',
  },
  {
    dimension: 'Controls framework',
    iso: '93 controls across 4 Annex A themes',
    soc: '5 Trust Service Criteria (Security mandatory + 4 optional)',
  },
  {
    dimension: 'Scope definition',
    iso: 'Defined ISMS scope — can be narrow (e.g., one product line)',
    soc: 'Service boundary of the system being audited',
  },
  {
    dimension: 'Primary customer demand',
    iso: 'EU enterprise, financial services, healthcare, government vendors',
    soc: 'US enterprise, SaaS procurement, AWS/Azure Marketplace listings',
  },
  {
    dimension: 'Regulatory mapping',
    iso: 'Maps to GDPR Art. 25 & 32, NIS2, DORA',
    soc: 'Maps to HIPAA, CCPA, FedRAMP',
  },
  {
    dimension: 'When you need both',
    iso: 'EU enterprise requires ISO 27001',
    soc: 'US enterprise requires SOC 2 — do SOC 2 first (faster), then ISO 27001 adds ISMS layer',
  },
]

const SOC2_TRUST_CRITERIA = [
  {
    name: 'Security (CC)',
    required: true,
    label: 'Required for all',
    desc: 'Access controls, encryption, availability SLAs, incident response, and vendor management. Every SOC 2 report must include this criterion.',
  },
  {
    name: 'Availability (A)',
    required: false,
    label: 'Optional but common',
    desc: 'Service uptime commitments. Required if customers rely on your system 24/7 and SLAs appear in contracts.',
  },
  {
    name: 'Confidentiality (C)',
    required: false,
    label: 'Optional but common',
    desc: 'Customer data confidentiality. Required if you handle confidential customer information beyond personal data (trade secrets, legal documents, financial data).',
  },
  {
    name: 'Privacy (P)',
    required: false,
    label: 'Optional',
    desc: 'Personal data lifecycle — collection, use, retention, and disclosure. Required if you process personal information in regulated contexts (separate from GDPR).',
  },
  {
    name: 'Processing Integrity (PI)',
    required: false,
    label: 'Optional',
    desc: 'System processes data completely and accurately. Required for financial, healthcare, and payroll SaaS where input-to-output accuracy is critical.',
  },
]

const ISO_ANNEX_A_THEMES = [
  {
    theme: 'Organizational controls',
    count: 37,
    examples: 'Policies, supplier relationships, threat intelligence, ICT readiness, business continuity',
  },
  {
    theme: 'People controls',
    count: 8,
    examples: 'Screening, onboarding, disciplinary process, remote working, security awareness',
  },
  {
    theme: 'Physical controls',
    count: 14,
    examples: 'Physical perimeter, clear desk/screen, visitor controls, off-site working, equipment disposal',
  },
  {
    theme: 'Technological controls',
    count: 34,
    examples: 'Authentication, access rights, malware protection, network filtering, encryption, development security',
  },
]

const DECISION_MATRIX = [
  {
    scenario: 'US-only SaaS, B2B enterprise customers, Series A',
    recommendation: 'SOC 2 Type II first',
    rationale: 'US enterprise procurement teams universally recognize SOC 2. Fastest path to unblocking enterprise deals.',
    highlight: true,
  },
  {
    scenario: 'EU/UK enterprise customers or regulated financial data',
    recommendation: 'ISO 27001 first',
    rationale: 'EU enterprise, especially financial services and public sector, frequently requires ISO 27001 and may not accept a SOC 2 report as a substitute.',
    highlight: false,
  },
  {
    scenario: 'Both US and EU enterprise customers',
    recommendation: 'SOC 2 first, then ISO 27001',
    rationale: 'SOC 2 is faster and cheaper. Start there to unblock US revenue. Begin ISO 27001 ISMS implementation in parallel — the controls overlap significantly.',
    highlight: false,
  },
  {
    scenario: 'AWS or Azure Marketplace listing required',
    recommendation: 'SOC 2 Type II',
    rationale: 'AWS and Azure Marketplace security requirements are typically satisfied by SOC 2 Type II. Check your specific marketplace listing requirements.',
    highlight: false,
  },
  {
    scenario: 'Government or defense sector vendor',
    recommendation: 'ISO 27001 preferred; FedRAMP for US federal',
    rationale: 'Government procurement often requires ISO 27001. For US federal contracts, FedRAMP authorization supersedes both SOC 2 and ISO 27001.',
    highlight: false,
  },
]

const COST_BREAKDOWN = {
  soc2: [
    { item: 'Readiness assessment', cost: '$5,000–$15,000' },
    { item: 'Audit fee (licensed CPA firm)', cost: '$10,000–$30,000/year' },
    { item: 'Tooling (continuous monitoring)', cost: '$5,000–$20,000/year' },
    { item: 'Internal staff time', cost: '200–400 hours (gap remediation + evidence collection)' },
    { item: 'Legal review (trust services description)', cost: '$2,000–$5,000' },
    { item: 'Total year-1', cost: '$20,000–$50,000', highlight: true },
  ],
  iso: [
    { item: 'Gap assessment', cost: '$10,000–$25,000' },
    { item: 'Implementation consulting', cost: '$15,000–$40,000' },
    { item: 'Certification audit (certification body fees)', cost: '$8,000–$20,000' },
    { item: 'Internal staff time', cost: '500–1,000 hours (ISMS build)' },
    { item: 'Surveillance audits (years 2-3)', cost: '$5,000–$10,000/year' },
    { item: 'Total year-1', cost: '$40,000–$80,000', highlight: true },
  ],
}

const FAQS = [
  {
    q: 'Can a SOC 2 Type II report substitute for ISO 27001 certification?',
    a: 'In US enterprise procurement, SOC 2 Type II is often sufficient. In EU enterprise sales — especially financial services, healthcare, or public sector — ISO 27001 certification is frequently required and a SOC 2 report may not be accepted as a substitute. For US federal procurement, FedRAMP authorization supersedes both.',
  },
  {
    q: 'Which should I do first if I need both?',
    a: 'SOC 2 first. It is faster (4-9 months vs 9-18 months), cheaper ($20-50K vs $40-80K), and more immediately recognized by US enterprise customers who generate most early-stage SaaS revenue. The controls you implement for SOC 2 — access management, encryption, incident response — map directly to ISO 27001 Annex A requirements, so the work is additive, not duplicative.',
  },
  {
    q: 'What is the difference between SOC 2 Type I and Type II?',
    a: 'Type I is a point-in-time report attesting that your controls are designed appropriately. Type II covers a 6-12 month observation period attesting that controls operated effectively. Enterprise procurement teams increasingly require Type II — Type I is often only accepted for initial vendor qualification. Budget 6-12 additional months after Type I to get your Type II.',
  },
  {
    q: 'Does ISO 27001 certification prove GDPR compliance?',
    a: 'No. ISO 27001 is a security management standard, not a privacy compliance framework. However, it is explicitly referenced in GDPR Article 25 (data protection by design) and Article 32 (security of processing) as evidence of appropriate security measures. Combined with a GDPR gap assessment, ISO 27001 certification is strong evidence of GDPR compliance posture.',
  },
  {
    q: 'How does LexAudit help with SOC 2 or ISO 27001 preparation?',
    a: "LexAudit's 60-signal compliance health score maps your current controls against SOC 2 Trust Service Criteria and ISO 27001 Annex A requirements. It identifies gaps before your audit begins, so you enter the formal process knowing exactly what to fix — rather than discovering gaps during a $20K-$80K audit engagement.",
  },
]

export default function ISO27001VsSOC2GuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'ISO 27001 vs SOC 2: Which Does Your SaaS Startup Need? (2025)',
    description:
      'ISO 27001 takes 9-18 months and costs $40-80K. SOC 2 takes 4-9 months and costs $20-50K. Which one enterprise customers actually require — and when you need both.',
    url: 'https://bizlegal-ai.com/guides/iso-27001-vs-soc2-guide',
    publisher: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    author: { '@type': 'Organization', name: 'BizLegal AI' },
    inLanguage: 'en-US',
    datePublished: '2025-04-01',
    dateModified: '2025-07-22',
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://bizlegal-ai.com/guides' },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'ISO 27001 vs SOC 2',
        item: 'https://bizlegal-ai.com/guides/iso-27001-vs-soc2-guide',
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        <nav style={{ fontSize: '0.8rem', opacity: 0.55, marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'inherit' }}>Home</a>
          {' → '}
          <a href="/guides" style={{ color: 'inherit' }}>Guides</a>
          {' → '}
          ISO 27001 vs SOC 2
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Security Certifications
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          ISO 27001 vs SOC 2: Which Does Your SaaS Startup Need? (2025)
        </h1>

        {/* Hero */}
        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '1rem' }}>
          The enterprise customer asked for &ldquo;SOC 2 or ISO 27001.&rdquo; Here&rsquo;s what they actually want.
        </p>
        <p style={{ lineHeight: 1.75, opacity: 0.85, marginBottom: '1rem' }}>
          Most enterprise buyers who request a security certification are following a procurement checklist written by their security team — and that checklist often conflates ISO 27001 and SOC 2 as if they are interchangeable. They are not. ISO 27001 is a certificate issued by an accredited certification body attesting that your information security management system meets an international standard. SOC 2 is an attestation report issued by a US CPA firm covering how your controls operated over time.
        </p>
        <p style={{ lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Which one you pursue first — and whether you eventually need both — determines 6 to 18 months of compliance work and $20K to $80K in year-one spend. This guide gives you the information to make that decision correctly.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        {/* Comparison Matrix */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            12-Dimension Comparison: ISO 27001 vs SOC 2
          </h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem', opacity: 0.8 }}>
            Side-by-side on every dimension that matters for an early-stage SaaS decision.
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: '560px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, width: '30%' }}>Dimension</th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      fontWeight: 600,
                      background: 'rgba(37, 99, 235, 0.06)',
                      width: '35%',
                    }}
                  >
                    ISO 27001
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      fontWeight: 600,
                      background: 'rgba(5, 150, 105, 0.06)',
                      width: '35%',
                    }}
                  >
                    SOC 2
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_MATRIX.map(({ dimension, iso, soc }) => (
                  <tr key={dimension} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, opacity: 0.8 }}>{dimension}</td>
                    <td
                      style={{
                        padding: '10px 12px',
                        opacity: 0.85,
                        lineHeight: 1.5,
                        background: 'rgba(37, 99, 235, 0.03)',
                      }}
                    >
                      {iso}
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        opacity: 0.85,
                        lineHeight: 1.5,
                        background: 'rgba(5, 150, 105, 0.03)',
                      }}
                    >
                      {soc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SOC 2 Trust Service Criteria */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            SOC 2&rsquo;s 5 Trust Service Criteria
          </h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1.25rem', opacity: 0.8 }}>
            SOC 2 is organized around five Trust Service Criteria (TSCs). Only Security is mandatory. You select which additional criteria to include based on your product and what your customers need.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {SOC2_TRUST_CRITERIA.map(({ name, required, label, desc }) => (
              <div
                key={name}
                style={{
                  border: required
                    ? '2px solid rgba(5, 150, 105, 0.4)'
                    : '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '10px',
                  padding: '1.1rem 1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{name}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: required ? 'rgba(5, 150, 105, 0.12)' : 'rgba(0,0,0,0.06)',
                      color: required ? 'rgb(5, 120, 85)' : 'inherit',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, opacity: 0.8, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ISO 27001 Annex A Themes */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            ISO 27001 Annex A: 4 Themes, 93 Controls
          </h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1.25rem', opacity: 0.8 }}>
            ISO 27001:2022 reorganized its control set into four themes — a significant change from the 14-clause structure of the 2013 version. All 93 controls apply to any scoped ISMS, though implementation is risk-driven.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
              gap: '1rem',
            }}
          >
            {ISO_ANNEX_A_THEMES.map(({ theme, count, examples }) => (
              <div
                key={theme}
                style={{
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '10px',
                  padding: '1.1rem 1.25rem',
                  background: 'rgba(37, 99, 235, 0.025)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{theme}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: 'rgba(37, 99, 235, 0.1)',
                      color: 'rgb(29, 78, 216)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {count} controls
                  </span>
                </div>
                <p style={{ fontSize: '0.83rem', lineHeight: 1.6, opacity: 0.75, margin: 0 }}>{examples}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Decision Matrix */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Which One Does YOUR Startup Need?
          </h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1.25rem', opacity: 0.8 }}>
            Five common scenarios — each with a clear recommendation and the reasoning behind it.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {DECISION_MATRIX.map(({ scenario, recommendation, rationale, highlight }) => (
              <div
                key={scenario}
                style={{
                  border: highlight
                    ? '2px solid rgba(37, 99, 235, 0.35)'
                    : '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '10px',
                  padding: '1.1rem 1.25rem',
                  background: highlight ? 'rgba(37, 99, 235, 0.04)' : undefined,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.95rem' }}>{scenario}</div>
                <div
                  style={{
                    display: 'inline-block',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    padding: '2px 10px',
                    borderRadius: '999px',
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: 'rgb(29, 78, 216)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {recommendation}
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.65, opacity: 0.8 }}>{rationale}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cost Breakdown */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>The Real Cost</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1.25rem', opacity: 0.8 }}>
            Both standards have significant but manageable year-one costs. The breakdown below reflects mid-market vendors (not Big 4 pricing, not discount vendors whose audits are rejected by serious enterprise buyers).
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* SOC 2 */}
            <div style={{ border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '10px', overflow: 'hidden' }}>
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  background: 'rgba(5, 150, 105, 0.08)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderBottom: '1px solid var(--color-border, #e5e7eb)',
                }}
              >
                SOC 2 — Year 1 Cost
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <tbody>
                  {COST_BREAKDOWN.soc2.map(({ item, cost, highlight }) => (
                    <tr
                      key={item}
                      style={{
                        borderBottom: '1px solid var(--color-border, #e5e7eb)',
                        fontWeight: highlight ? 700 : undefined,
                        background: highlight ? 'rgba(5, 150, 105, 0.06)' : undefined,
                      }}
                    >
                      <td style={{ padding: '9px 14px', opacity: highlight ? 1 : 0.8 }}>{item}</td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>{cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ISO 27001 */}
            <div style={{ border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '10px', overflow: 'hidden' }}>
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  background: 'rgba(37, 99, 235, 0.08)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderBottom: '1px solid var(--color-border, #e5e7eb)',
                }}
              >
                ISO 27001 — Year 1 Cost
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <tbody>
                  {COST_BREAKDOWN.iso.map(({ item, cost, highlight }) => (
                    <tr
                      key={item}
                      style={{
                        borderBottom: '1px solid var(--color-border, #e5e7eb)',
                        fontWeight: highlight ? 700 : undefined,
                        background: highlight ? 'rgba(37, 99, 235, 0.06)' : undefined,
                      }}
                    >
                      <td style={{ padding: '9px 14px', opacity: highlight ? 1 : 0.8 }}>{item}</td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>{cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ lineHeight: 1.75, marginTop: '1rem', fontSize: '0.875rem', opacity: 0.7 }}>
            Ongoing annual costs after year 1: both standards require $10,000–$30,000/year in surveillance audits or renewal fees, plus continued tooling and staff time.
          </p>
        </section>

        {/* CTA */}
        <section
          style={{
            background: 'var(--surface, #f9fafb)',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: '12px',
            padding: '1.75rem',
            marginBottom: '3rem',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Know your compliance gaps before the audit does
          </h2>
          <p style={{ lineHeight: 1.7, marginBottom: '1.25rem', opacity: 0.85 }}>
            LexAudit generates a Compliance Health Score across SOC 2 Trust Service Criteria and ISO 27001 Annex A — 60 signals evaluated monthly. Identify exactly which controls you are missing before entering a $20K–$80K audit engagement. $99/month, cancel anytime.
          </p>
          <a
            href="https://lexaudit.bizlegal-ai.com"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.75rem',
              background: 'var(--primary, #1a56db)',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.95rem',
            }}
          >
            Get Your Compliance Health Score — $99/mo
          </a>
        </section>

        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Review Your Security Vendor Contracts in 60 Seconds</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Before committing to an ISO 27001 or SOC 2 programme, your MSA, NDA, and security vendor agreements need contractual alignment with your chosen framework. BizLegal AI scans your security contracts for gaps in incident response obligations, audit rights, and subprocessor requirements — framework-specific, not generic.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Security Contracts →
          </a>
        </div>

        {/* FAQ */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {FAQS.map(({ q, a }) => (
              <div key={q}>
                <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>{q}</p>
                <p style={{ lineHeight: 1.75, opacity: 0.85, margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal cross-links */}
        <div
          style={{
            marginBottom: '2rem',
            padding: '1rem 1.25rem',
            background: 'var(--surface, #f9fafb)',
            borderRadius: '8px',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.75 }}>
            Related guides:{' '}
            <a href="/guides/soc2-compliance-checklist-saas" style={{ color: 'var(--primary, #1a56db)' }}>
              SOC 2 Compliance Checklist for SaaS
            </a>
            {' · '}
            <a href="/guides/compliance-health-score-saas" style={{ color: 'var(--primary, #1a56db)' }}>
              Compliance Health Score for SaaS
            </a>
            {' · '}
            <a href="/guides/gdpr-compliance-checklist-saas" style={{ color: 'var(--primary, #1a56db)' }}>
              GDPR Compliance Checklist for SaaS
            </a>
            {' · '}
            <a href="/guides" style={{ color: 'var(--primary, #1a56db)' }}>
              All Compliance Guides
            </a>
          </p>
          <p style={{ margin: '8px 0 0' }}>
            <a href="/regulations/soc2" style={{ color: 'var(--primary, #1a56db)', textDecoration: 'none' }}>
              SOC 2 Compliance Hub →
            </a>
            {' '}Type I vs Type II breakdown, Trust Service Criteria, commercial consequences of missing SOC 2, and auditor selection guide.
          </p>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p>
            This guide is for informational purposes only and does not constitute legal or audit advice. ISO 27001 and SOC 2 requirements, auditor interpretations, and industry expectations evolve. Engage a licensed CPA firm, accredited certification body, and legal counsel for advice specific to your situation.
          </p>
        </footer>
      </main>
    </>
  )
}
