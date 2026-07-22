import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Startup Compliance Program Guide: When You Need One and How to Build It (2025) | BizLegal AI',
  description: 'Series A fintech startup? You need a compliance program. Here\'s what it must include, how to staff it, and the 4 triggers that make it non-negotiable — from BOI to GDPR to bank partnerships.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/startup-compliance-program-guide' },
  openGraph: {
    title: 'Startup Compliance Program Guide: When You Need One and How to Build It (2025)',
    description: 'Series A fintech startup? You need a compliance program. Here\'s what it must include, how to staff it, and the 4 triggers that make it non-negotiable.',
    url: 'https://bizlegal-ai.com/guides/startup-compliance-program-guide',
    type: 'article',
  },
}

const TRIGGER_EVENTS = [
  {
    title: 'Bank Partnership / BaaS Relationship',
    severity: 'Immediate',
    description:
      'Every bank sponsor (Bancorp, Cross River, etc.) requires a written BSA/AML compliance program before they will onboard you. This is the single most common trigger for fintech startups — no program, no partnership.',
  },
  {
    title: 'Institutional Investor Due Diligence (Series A+)',
    severity: 'Pre-close',
    description:
      'Lead VC funds routinely require compliance representations in Series A documents. PE buyers in M&A diligence will reject a company with no compliance infrastructure. Build the program before the data room opens.',
  },
  {
    title: 'Processing EU Personal Data',
    severity: 'Immediate',
    description:
      'GDPR Article 24 requires a documented accountability framework. If you have EU users, you need written records of processing activities, DPAs with every vendor, and a privacy compliance program — not optional.',
  },
  {
    title: 'FinCEN / MSB Registration',
    severity: 'Pre-registration',
    description:
      'If you transmit funds, exchange currency, or act as a payment intermediary, FinCEN requires federal registration and a written AML program with independent testing. The program must exist before you register.',
  },
  {
    title: 'First Regulated Enterprise Customer',
    severity: 'Pre-contract',
    description:
      'A Fortune 500 financial institution, healthcare company, or government contractor will require vendor compliance documentation before signing. No compliance program means no enterprise contract.',
  },
  {
    title: 'Entering a Licensed Activity',
    severity: 'Pre-license',
    description:
      'Crypto exchange, lending, insurance, or investment advice in any jurisdiction requires a licensed compliance officer. You need the documented program before the regulator will grant the license.',
  },
]

const PROGRAM_COMPONENTS = [
  {
    num: '01',
    title: 'Written Compliance Policy',
    required: 'BSA/AML, GDPR, bank partner agreements',
    description:
      'Master policy document defining scope, obligations, roles, and responsibilities. Must be adopted by the board of directors. Without board adoption, it does not exist in the eyes of regulators or bank partners.',
  },
  {
    num: '02',
    title: 'Risk Assessment',
    required: 'BSA/AML, NIST AI RMF, enterprise vendor questionnaires',
    description:
      'Documented identification and rating of compliance risks by regulatory area and business function. Must be updated at least annually. The risk assessment drives every other element of the program.',
  },
  {
    num: '03',
    title: 'Controls Inventory',
    required: 'SOC 2, ISO 27001, bank partner BSA programs',
    description:
      'List of specific operational controls — both technical and procedural — that mitigate each identified risk. The controls inventory is what enterprise customers and bank sponsors actually audit.',
  },
  {
    num: '04',
    title: 'Training Program',
    required: 'BSA/AML (mandatory annual), GDPR Article 39, financial licenses',
    description:
      'Documented annual compliance training for all employees, with attendance logs. BSA/AML training is mandatory under FinCEN guidance. Logs are required — verbal confirmation is not sufficient.',
  },
  {
    num: '05',
    title: 'Monitoring & Testing',
    required: 'FinCEN BSA rules (independent testing required)',
    description:
      'Ongoing KPIs for control effectiveness plus periodic independent testing by a party not directly responsible for BSA compliance. FinCEN lists independent testing as one of the five pillars of a BSA program.',
  },
  {
    num: '06',
    title: 'Incident Response Plan',
    required: 'GDPR Article 33, FinCEN SAR rules, SEC disclosure',
    description:
      'Documented process for detecting, escalating, and reporting compliance incidents — SAR filing, GDPR breach notification within 72 hours, SEC disclosure for public companies. Must be tested before an incident occurs.',
  },
  {
    num: '07',
    title: 'Third-Party Risk Management',
    required: 'GDPR Article 28 (DPAs), bank partner BSA programs, SOC 2',
    description:
      'Due diligence questionnaire process for all vendors with access to regulated data or systems. GDPR Article 28 requires a signed DPA with every processor. Bank sponsors require it for every sub-servicer.',
  },
]

const STAFFING_MODELS = [
  {
    model: 'Founder-Led',
    stage: 'Pre-seed / pre-regulated',
    cost: '$0 additional',
    suitable: 'Pre-revenue, pre-regulated, under $1M ARR',
    risk: 'Blind spots, no independence, not accepted by bank partners or institutional investors.',
    highlight: false,
  },
  {
    model: 'First Compliance Hire',
    stage: 'Seed — Series A',
    cost: '$80K–$120K/year',
    suitable: 'When regulated activity begins, first bank partnership, 10–50 employees',
    risk: 'Single point of failure, hard to find a qualified candidate, full HR overhead.',
    highlight: false,
  },
  {
    model: 'Fractional CCO / Compliance Retainer',
    stage: 'Seed — Series B (under $5M ARR)',
    cost: '$2,000–$5,000/month',
    suitable: 'Fintech, crypto, cross-border SaaS needing credentialed oversight without a full-time executive',
    risk: 'Limited availability vs. full-time hire — mitigated by async workflows and scoped engagements.',
    highlight: true,
  },
  {
    model: 'In-House CCO',
    stage: 'Series B+ ($10M+ ARR)',
    cost: '$200K–$400K/year total comp',
    suitable: 'Multiple licensing obligations, regulated in 3+ jurisdictions, full compliance team required',
    risk: 'High fixed cost — not economically rational below $10M ARR with multiple regulated products.',
    highlight: false,
  },
]

const COMPLIANCE_CALENDAR = [
  { month: 'January', obligation: 'Annual compliance policy review (all regulated entities)', highlight: false },
  { month: 'January', obligation: 'BSA/AML independent testing (annual, FinCEN requirement)', highlight: false },
  { month: 'March', obligation: 'GDPR Record of Processing Activities update (annual)', highlight: false },
  { month: 'April', obligation: 'Annual SOC 2 audit window opens (12-month period for Type II)', highlight: false },
  { month: 'May', obligation: 'GDPR Data Protection Impact Assessment review for high-risk processing', highlight: false },
  { month: 'June', obligation: 'Annual BSA/AML training completion deadline (bank partner requirement)', highlight: false },
  { month: 'August', obligation: 'EU AI Act new obligations effective (2026) — mark calendar now', highlight: true },
  { month: 'September', obligation: 'Q3 SAR review / suspicious activity lookback', highlight: false },
  { month: 'October', obligation: 'Vendor risk assessment annual refresh (SOC 2 + bank BSA)', highlight: false },
  { month: 'November', obligation: 'BOI update filings review (within 30 days of any reportable change)', highlight: false },
  { month: 'December', obligation: 'Annual compliance training completion deadline (SOC 2 / ISO 27001)', highlight: false },
  { month: 'Ongoing', obligation: 'Privacy request fulfillment — 30-day response window (GDPR / CCPA)', highlight: true },
]

const FAQS = [
  {
    q: "What's the minimum viable compliance program for a fintech startup?",
    a: "A minimum viable compliance program for a bank-partnered fintech requires: (1) written BSA/AML policy adopted by the board; (2) designated compliance officer (can be fractional); (3) annual AML training with attendance records; (4) customer due diligence procedures; (5) transaction monitoring rules; (6) SAR and CTR filing procedures; (7) annual independent testing. Without all seven, you will not pass bank partner BSA due diligence.",
  },
  {
    q: 'When should we hire our first compliance officer vs. use a fractional CCO?',
    a: 'Use a fractional CCO when you have a bank partnership requirement, a first regulated activity, or institutional due diligence approaching, but are below $3–5M ARR where a $200K+ full-time hire is not economically rational. The fractional model gives you a credentialed CCO on bank partner paperwork, independence from your own operations, and scalable capacity without the cost of a full-time executive.',
  },
  {
    q: 'Does a startup need a Data Protection Officer (DPO) under GDPR?',
    a: "A DPO is legally required only if: you are a public authority; your core activities require regular and systematic monitoring of data subjects at large scale; or your core activities involve large-scale processing of special categories of data or criminal offense data. Most B2B SaaS startups do not legally require a DPO — but a documented accountability framework (policy, ROPA, DPIAs where applicable) is mandatory regardless.",
  },
  {
    q: "What does 'independent testing' mean for BSA/AML?",
    a: "FinCEN requires that BSA/AML programs include annual testing by an independent party — someone not directly responsible for BSA compliance. At a startup, this typically means external counsel or a compliance consulting firm conducts an annual review of your BSA controls, testing them against a sample of transactions and customer records. The testing results must be documented and reported to senior management.",
  },
  {
    q: 'How does the Managed Compliance Ops Retainer work?',
    a: 'The $2,500/month retainer provides a designated BizLegal attorney as your fractional CCO. We handle: bank partner compliance documentation, BSA/AML program maintenance, GDPR accountability framework, enterprise vendor questionnaire responses, compliance calendar management, and incident escalation. You get senior legal counsel on your compliance program — not a template.',
  },
]

export default function StartupComplianceProgramGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Startup Compliance Program Guide: When You Need One and How to Build It (2025)',
    description:
      "Series A fintech startup? You need a compliance program. Here's what it must include, how to staff it, and the 4 triggers that make it non-negotiable.",
    url: 'https://bizlegal-ai.com/guides/startup-compliance-program-guide',
    datePublished: '2025-05-01',
    dateModified: '2025-07-22',
    publisher: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    author: { '@type': 'Organization', name: 'BizLegal AI' },
    inLanguage: 'en-US',
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
      { '@type': 'ListItem', position: 3, name: 'Startup Compliance Program Guide', item: 'https://bizlegal-ai.com/guides/startup-compliance-program-guide' },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Breadcrumb */}
        <nav style={{ fontSize: '0.8rem', opacity: 0.55, marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'inherit' }}>Home</a>
          {' → '}
          <a href="/guides" style={{ color: 'inherit' }}>Guides</a>
          {' → '}
          Startup Compliance Program Guide
        </nav>

        {/* Label */}
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Compliance Programs
        </span>

        {/* Title */}
        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.6rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          Startup Compliance Program Guide: When You Need One and How to Build It
        </h1>

        {/* Hero intro */}
        <div
          style={{
            background: 'var(--surface, #f9fafb)',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderLeft: '4px solid var(--primary, #1a56db)',
            borderRadius: '8px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <p style={{ margin: 0, lineHeight: 1.75, fontWeight: 500 }}>
            Series A fintech. First bank partner. First enterprise customer. Your compliance program is overdue.
          </p>
          <p style={{ margin: '0.75rem 0 0', lineHeight: 1.75, opacity: 0.8 }}>
            A compliance program is not a paperwork exercise — it is the operational infrastructure that lets you sign bank agreements, close institutional funding, and land regulated enterprise customers. This guide explains what a defensible program requires, how to staff it at each stage, and the six events that make it non-negotiable.
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        {/* Section 1: Trigger Events */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            6 Events That Make a Compliance Program Non-Negotiable
          </h2>
          <p style={{ lineHeight: 1.75, opacity: 0.8, marginBottom: '1.75rem' }}>
            Most founders treat compliance programs as something to address after product-market fit. These six events move compliance from optional to immediately required — often with a hard deadline.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {TRIGGER_EVENTS.map((event) => (
              <div
                key={event.title}
                style={{
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3, flex: 1 }}>{event.title}</p>
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      background: '#fef2f2',
                      color: '#b91c1c',
                      border: '1px solid #fecaca',
                      borderRadius: '4px',
                      padding: '0.2rem 0.5rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {event.severity}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.7, opacity: 0.8 }}>{event.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Program Components */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            7 Components of a Defensible Compliance Program
          </h2>
          <p style={{ lineHeight: 1.75, opacity: 0.8, marginBottom: '1.75rem' }}>
            A compliance program that satisfies a bank sponsor, GDPR supervisory authority, and SOC 2 auditor simultaneously requires these seven documented elements. Missing any one typically fails the entire audit.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {PROGRAM_COMPONENTS.map((component) => (
              <div
                key={component.num}
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: 'var(--primary, #1a56db)',
                    opacity: 0.25,
                    lineHeight: 1,
                    minWidth: '2.5rem',
                  }}
                >
                  {component.num}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 0.35rem', fontWeight: 700, fontSize: '0.97rem' }}>{component.title}</p>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary, #1a56db)', opacity: 0.75 }}>
                    Required by: {component.required}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.7, opacity: 0.8 }}>{component.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Staffing Models */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Compliance Staffing: 4 Models
          </h2>
          <p style={{ lineHeight: 1.75, opacity: 0.8, marginBottom: '1.75rem' }}>
            The right compliance staffing model depends on your revenue stage, regulatory obligations, and the economics of your compliance volume. Most Series A companies are overbuying when they hire full-time and underbuying when they rely on the founder.
          </p>

          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0.75rem', fontWeight: 700 }}>Model</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0.75rem', fontWeight: 700 }}>Stage</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0.75rem', fontWeight: 700 }}>Cost</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0.75rem', fontWeight: 700 }}>Use Case</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0.75rem', fontWeight: 700 }}>Key Risk</th>
                </tr>
              </thead>
              <tbody>
                {STAFFING_MODELS.map((row) => (
                  <tr
                    key={row.model}
                    style={{
                      borderBottom: '1px solid var(--color-border, #e5e7eb)',
                      background: row.highlight ? 'color-mix(in srgb, var(--primary, #1a56db) 5%, transparent)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: row.highlight ? 700 : 500, whiteSpace: 'nowrap' }}>
                      {row.highlight && (
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: 'var(--primary, #1a56db)',
                            color: '#fff',
                            borderRadius: '3px',
                            padding: '0.1rem 0.4rem',
                            marginRight: '0.4rem',
                            verticalAlign: 'middle',
                          }}
                        >
                          Recommended
                        </span>
                      )}
                      {row.model}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', opacity: 0.75 }}>{row.stage}</td>
                    <td style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap', fontWeight: 600 }}>{row.cost}</td>
                    <td style={{ padding: '0.85rem 0.75rem', opacity: 0.8 }}>{row.suitable}</td>
                    <td style={{ padding: '0.85rem 0.75rem', opacity: 0.7, fontSize: '0.83rem' }}>{row.risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ lineHeight: 1.75, opacity: 0.8, fontSize: '0.9rem' }}>
            The fractional CCO model is the economic sweet spot for most Series A fintech companies. You get credentialed oversight that satisfies bank sponsor requirements, independence your own team cannot provide, and predictable monthly cost at roughly 1–2% of a full-time CCO salary.
          </p>
        </section>

        {/* Section 4: Compliance Calendar */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Your Compliance Calendar
          </h2>
          <p style={{ lineHeight: 1.75, opacity: 0.8, marginBottom: '1.75rem' }}>
            A compliance program that exists on paper but misses recurring deadlines fails in practice. These are the recurring obligations a fintech compliance program must actively track.
          </p>

          <div style={{ border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '10px', overflow: 'hidden' }}>
            {COMPLIANCE_CALENDAR.map((item, idx) => (
              <div
                key={`${item.month}-${idx}`}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '0.9rem 1.25rem',
                  borderBottom: idx < COMPLIANCE_CALENDAR.length - 1 ? '1px solid var(--color-border, #e5e7eb)' : 'none',
                  background: item.highlight ? 'color-mix(in srgb, var(--primary, #1a56db) 6%, transparent)' : 'transparent',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    minWidth: '5.5rem',
                    fontWeight: 700,
                    fontSize: '0.83rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: item.highlight ? 'var(--primary, #1a56db)' : 'inherit',
                    opacity: item.highlight ? 1 : 0.6,
                    paddingTop: '0.1rem',
                  }}
                >
                  {item.month}
                </span>
                <span style={{ fontSize: '0.9rem', lineHeight: 1.6, fontWeight: item.highlight ? 500 : 400 }}>
                  {item.obligation}
                </span>
              </div>
            ))}
          </div>

          <p style={{ marginTop: '1rem', lineHeight: 1.7, opacity: 0.75, fontSize: '0.85rem' }}>
            The EU AI Act entry (August 2026) and the ongoing privacy request obligation are highlighted because they are most commonly missed. The AI Act obligations affecting most B2B SaaS and fintech companies take effect August 2026 — less than 13 months from publication of this guide.
          </p>
        </section>

        {/* Internal cross-links */}
        <section
          style={{
            background: 'var(--surface, #f9fafb)',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: '10px',
            padding: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          <p style={{ margin: '0 0 0.75rem', fontWeight: 700, fontSize: '0.9rem' }}>Related compliance guides</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {[
              { label: 'Fractional CCO vs Compliance Retainer', href: '/guides/fractional-cco-vs-compliance-retainer' },
              { label: 'AML/KYC Compliance for Crypto', href: '/guides/aml-kyc-compliance-crypto' },
              { label: 'GDPR Compliance Checklist for SaaS', href: '/guides/gdpr-compliance-checklist-saas' },
              { label: 'ISO 27001 vs SOC 2', href: '/guides/iso-27001-vs-soc2-guide' },
              { label: 'All Guides', href: '/guides' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  display: 'inline-block',
                  fontSize: '0.83rem',
                  padding: '0.35rem 0.85rem',
                  border: '1px solid var(--color-border, #d1d5db)',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: 'inherit',
                  fontWeight: 500,
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>

        {/* Section 5: FAQ */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {FAQS.map(({ q, a }) => (
              <div key={q}>
                <p style={{ fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.97rem' }}>{q}</p>
                <p style={{ lineHeight: 1.78, opacity: 0.85, margin: 0, fontSize: '0.92rem' }}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section
          style={{
            background: 'var(--surface, #f9fafb)',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: '12px',
            padding: '2rem 1.75rem',
            marginBottom: '3rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', marginTop: 0 }}>
            Get a Designated Compliance Officer for $2,500/Month
          </h2>
          <p style={{ lineHeight: 1.75, marginBottom: '0.75rem', opacity: 0.85 }}>
            The Managed Compliance Ops Retainer provides a practicing BizLegal attorney as your fractional CCO. We maintain your BSA/AML program, GDPR accountability framework, bank partner documentation, and compliance calendar — month to month, no long-term commitment.
          </p>
          <p style={{ lineHeight: 1.75, marginBottom: '1.25rem', opacity: 0.85 }}>
            Credentialed oversight that satisfies bank sponsors, FinCEN requirements, and Series A due diligence — at a fraction of the cost of a full-time hire.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href="/agents"
              style={{
                display: 'inline-block',
                padding: '0.8rem 2rem',
                background: 'var(--primary, #1a56db)',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '0.97rem',
              }}
            >
              Start the Retainer Conversation
            </a>
            <a
              href="mailto:compliance@bizlegal-ai.com?subject=Compliance%20Program%20Inquiry"
              style={{
                display: 'inline-block',
                padding: '0.8rem 1.5rem',
                border: '1.5px solid var(--color-border, #d1d5db)',
                borderRadius: '8px',
                fontWeight: 500,
                textDecoration: 'none',
                color: 'inherit',
                fontSize: '0.97rem',
              }}
            >
              Book a Call
            </a>
          </div>
        </section>

        {/* Footer disclaimer */}
        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. Compliance requirements vary by jurisdiction, regulatory designation, and specific business activity. The information reflects U.S. federal requirements and GDPR as of the date published. Consult a licensed attorney for advice specific to your situation.
          </p>
        </footer>

      </main>
    </>
  )
}
