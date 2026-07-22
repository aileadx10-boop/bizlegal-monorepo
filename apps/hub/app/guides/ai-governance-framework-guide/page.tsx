import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Governance Framework Guide for SaaS & Enterprises (2025) | BizLegal AI',
  description:
    'NIST AI RMF vs ISO/IEC 42001 vs EU AI Act: what each requires, who needs what, and the 6-component AI governance program every AI-integrated SaaS needs before the regulators arrive.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/ai-governance-framework-guide' },
  openGraph: {
    title: 'AI Governance Framework Guide for SaaS & Enterprises — BizLegal AI',
    description:
      'NIST AI RMF vs ISO/IEC 42001 vs EU AI Act: what each requires, who needs what, and the 6-component AI governance program every AI-integrated SaaS needs.',
    url: 'https://bizlegal-ai.com/guides/ai-governance-framework-guide',
    type: 'article',
  },
}

const FRAMEWORKS = [
  {
    name: 'EU AI Act',
    regulator: 'European Commission',
    type: 'Regulation (binding)',
    scope: 'All AI systems used in the EU',
    enforcement: 'Fines up to €35M or 7% global revenue',
    status: 'Mandatory by 2026-08-02',
    color: '#2563eb',
  },
  {
    name: 'NIST AI RMF 1.0',
    regulator: 'NIST / US federal agencies',
    type: 'Voluntary framework',
    scope: 'US federal agencies (mandatory); private sector (voluntary)',
    enforcement: 'No direct penalty — but agencies require it in contracts',
    status: 'Effective February 2023',
    color: '#16a34a',
  },
  {
    name: 'ISO/IEC 42001:2023',
    regulator: 'ISO/IEC JTC 1/SC 42',
    type: 'Certification standard (voluntary)',
    scope: 'Any organization developing or deploying AI',
    enforcement: 'Certification required in some enterprise procurement',
    status: 'Published December 2023',
    color: '#9333ea',
  },
  {
    name: 'Executive Order 14110',
    regulator: 'US White House / federal agencies',
    type: 'Executive Order (federal agencies binding)',
    scope: 'Foundation model developers (>10²⁶ FLOPs), federal AI use',
    enforcement: 'Agency-level enforcement; May 2024 rescission by EO 14179 for private sector mandates',
    status: 'Partially rescinded 2025-01-20',
    color: '#f97316',
  },
  {
    name: 'OECD AI Principles',
    regulator: 'OECD',
    type: 'Principles (non-binding, policy reference)',
    scope: 'OECD member governments and major economies',
    enforcement: 'No direct enforcement — referenced in GDPR recitals and EU AI Act',
    status: 'Updated 2024',
    color: '#64748b',
  },
]

const GOVERNANCE_COMPONENTS = [
  {
    number: '1',
    title: 'AI Inventory & Registry',
    description:
      'Document every AI system in use (developer or deployer), its risk tier, training data lineage, and use case.',
    frameworks: 'EU AI Act Article 26 · ISO 42001 §8.4 · NIST AI RMF GOVERN-1.1',
  },
  {
    number: '2',
    title: 'Risk Assessment',
    description:
      'Conduct systematic risk assessment before deployment. High-risk (EU AI Act Annex III) requires conformity assessment. NIST AI RMF uses the MAP function. ISO 42001 requires documented risk treatment plans.',
    frameworks: 'EU AI Act Article 9 · ISO 42001 §6.1 · NIST AI RMF MAP-1',
  },
  {
    number: '3',
    title: 'Human Oversight Controls',
    description:
      'AI decisions must have meaningful human review mechanisms, especially for high-risk use cases. Overseers must be able to understand, monitor, and override the system.',
    frameworks: 'EU AI Act Articles 14 & 29 · NIST AI RMF MANAGE-2.4',
  },
  {
    number: '4',
    title: 'Transparency & Disclosure',
    description:
      'Inform users when interacting with AI systems. B2C SaaS must disclose. B2B is often governed by contract. AI-generated content requires provenance labeling in some jurisdictions.',
    frameworks: 'EU AI Act Articles 50 & 52 · ISO 42001 §8.6 · OECD Principle 1.3',
  },
  {
    number: '5',
    title: 'Incident Response',
    description:
      'Process to detect, report, and remediate AI failures. Serious incidents must be reported to the relevant market surveillance authority. Maintain incident logs with root cause analysis.',
    frameworks: 'EU AI Act Article 72 · ISO 42001 §10.2 · NIST AI RMF MANAGE-4',
  },
  {
    number: '6',
    title: 'Continuous Monitoring',
    description:
      'Ongoing performance tracking, drift detection, and bias testing across the AI system lifecycle. Post-market monitoring plans required for high-risk systems.',
    frameworks: 'EU AI Act Article 72 · ISO 42001 §9.1 · NIST AI RMF MEASURE-2.5',
  },
]

const APPLICABILITY_ROWS = [
  'SaaS with embedded AI',
  'AI-native startup',
  'Enterprise deploying third-party AI',
  'Foundation model developer',
  'Government contractor',
]

const APPLICABILITY_COLS = ['EU AI Act', 'NIST AI RMF', 'ISO 42001', 'EO 14110', 'OECD Principles']

type CellValue = 'mandatory' | 'voluntary but recommended' | 'not applicable' | 'required by contract'

const APPLICABILITY_MATRIX: CellValue[][] = [
  // SaaS with embedded AI
  ['mandatory', 'voluntary but recommended', 'voluntary but recommended', 'not applicable', 'voluntary but recommended'],
  // AI-native startup
  ['mandatory', 'voluntary but recommended', 'voluntary but recommended', 'not applicable', 'voluntary but recommended'],
  // Enterprise deploying third-party AI
  ['mandatory', 'voluntary but recommended', 'required by contract', 'not applicable', 'voluntary but recommended'],
  // Foundation model developer
  ['mandatory', 'voluntary but recommended', 'voluntary but recommended', 'mandatory', 'voluntary but recommended'],
  // Government contractor
  ['mandatory', 'required by contract', 'required by contract', 'mandatory', 'voluntary but recommended'],
]

const CELL_STYLES: Record<CellValue, { bg: string; color: string; label: string }> = {
  mandatory: { bg: '#dcfce7', color: '#15803d', label: 'Mandatory' },
  'voluntary but recommended': { bg: '#dbeafe', color: '#1d4ed8', label: 'Recommended' },
  'not applicable': { bg: '#f1f5f9', color: '#64748b', label: 'N/A' },
  'required by contract': { bg: '#ffedd5', color: '#c2410c', label: 'Contract' },
}

const HIGH_RISK_USE_CASES = [
  { name: 'AI in hiring / HR / employment decisions', note: 'Covers automated screening, scoring, and promotion tools' },
  { name: 'AI for creditworthiness / credit scoring', note: 'Any AI that influences access to financial products' },
  { name: 'AI in education / student assessment', note: 'Grading, admission, placement, and certification systems' },
  { name: 'AI for access to essential private services', note: 'Insurance eligibility, utility access, essential benefits' },
  { name: 'AI used by law enforcement', note: 'Predictive policing, evidence analysis, risk scoring' },
  { name: 'AI for biometric identification', note: 'Remote biometric systems and emotion recognition' },
  { name: 'AI in migration / border control', note: 'Visa applications, risk assessment, asylum decisions' },
  { name: 'AI in administration of justice', note: 'Judicial decision support and dispute resolution tools' },
]

const PENALTIES_COMPARISON = [
  {
    framework: 'EU AI Act',
    tiers: [
      { label: 'Prohibited AI practices (Article 5)', penalty: 'Up to €35M or 7% global turnover' },
      { label: 'Most violations (high-risk, GPAI, transparency)', penalty: 'Up to €15M or 3% global turnover' },
      { label: 'Incorrect information to authorities', penalty: 'Up to €7.5M or 1.5% global turnover' },
    ],
    color: '#2563eb',
  },
  {
    framework: 'NIST AI RMF',
    tiers: [
      { label: 'Direct fines', penalty: 'None — framework is voluntary for private sector' },
      { label: 'Federal procurement', penalty: 'Exclusion possible if agency contract requires alignment' },
      { label: 'Reputational consequence', penalty: 'Material risk if breach is linked to RMF non-alignment' },
    ],
    color: '#16a34a',
  },
  {
    framework: 'ISO/IEC 42001',
    tiers: [
      { label: 'Direct fines', penalty: 'None — certification standard, not a regulation' },
      { label: 'Certification suspension', penalty: 'Loss of B2B contracts that require ISO 42001 certification' },
      { label: 'Enterprise procurement impact', penalty: 'Disqualification from RFPs requiring certified AIMS' },
    ],
    color: '#9333ea',
  },
]

const FAQ = [
  {
    q: 'Do I need to comply with the EU AI Act if my company is based in the US?',
    a: 'Yes, if your AI system is used in the EU, or if the outputs of your AI system affect people in the EU. The Act has explicit extraterritorial scope (Article 2(1)(c)). US-based AI providers placing systems on the EU market are covered. The same logic that makes GDPR apply to US companies processing EU personal data applies here.',
  },
  {
    q: 'What\'s the difference between an AI provider and an AI deployer under the EU AI Act?',
    a: 'A provider develops and makes an AI system available (typically a SaaS vendor). A deployer integrates or uses an AI system in a business context. Most SaaS companies are both — a provider to their customers, and a deployer of third-party AI (e.g., OpenAI, Anthropic) in their own product. Each role carries distinct obligations under the Act.',
  },
  {
    q: 'Is NIST AI RMF mandatory for my company?',
    a: 'Only if you contract with US federal agencies — they are required to use the framework. For private sector companies, it is voluntary. However, large enterprise customers (especially financial institutions and healthcare) increasingly require evidence of AI RMF alignment in vendor questionnaires. Voluntary today does not mean ignorable tomorrow.',
  },
  {
    q: 'What does ISO/IEC 42001 certification require?',
    a: 'ISO 42001 is a management system standard. Certification requires establishing an AI Management System (AIMS) covering: organizational context, risk assessment, AI objectives and planning, support and competence, operational controls, performance evaluation, and continual improvement. Certification is conducted by an accredited third-party auditor — you cannot self-certify.',
  },
  {
    q: 'How does the AI Governance agent monitor all of this?',
    a: 'The agent runs weekly checks across your registered AI use cases against the latest regulatory guidance from the EU AI Office, NIST, and ISO. When a new obligation is published, or when your system parameters change in a way that affects risk classification, it alerts you with the specific obligation and a suggested response. You get one consolidated dashboard instead of tracking five frameworks manually.',
  },
]

export default function AiGovernanceFrameworkGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'AI Governance Framework Guide for SaaS & Enterprises (2025)',
    description:
      'NIST AI RMF vs ISO/IEC 42001 vs EU AI Act: what each requires, who needs what, and the 6-component AI governance program every AI-integrated SaaS needs.',
    url: 'https://bizlegal-ai.com/guides/ai-governance-framework-guide',
    datePublished: '2025-03-01',
    dateModified: '2025-07-22',
    author: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    publisher: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://bizlegal-ai.com/guides/ai-governance-framework-guide' },
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
      { '@type': 'ListItem', position: 3, name: 'AI Governance Framework Guide', item: 'https://bizlegal-ai.com/guides/ai-governance-framework-guide' },
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
          AI Governance Framework Guide
        </nav>

        <span style={{ display: 'inline-block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, opacity: 0.5, marginBottom: '0.75rem' }}>
          Regulatory Compliance · AI Governance
        </span>

        <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem', marginTop: 0, letterSpacing: '-0.025em' }}>
          AI Governance Framework Guide for SaaS &amp; Enterprises (2025)
        </h1>

        {/* Hero urgency hook */}
        <div style={{ borderLeft: '4px solid #f97316', paddingLeft: '1.25rem', marginBottom: '1.5rem', background: 'color-mix(in srgb, #f97316 6%, transparent)', borderRadius: '0 8px 8px 0', padding: '1rem 1.25rem' }}>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0, fontWeight: 600 }}>
            Your AI feature ships. Your governance policy doesn&apos;t exist.
          </p>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.65, margin: '0.5rem 0 0', opacity: 0.85 }}>
            The EU AI Act&apos;s full enforcement deadline for high-risk AI systems is <strong>2 August 2026</strong>. If your SaaS product embeds AI, you are almost certainly in scope — as a provider, a deployer, or both. This guide maps the five major AI governance frameworks, explains which apply to your business, and shows the six-component program you need before the regulators arrive.
          </p>
        </div>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.8, marginBottom: '0.5rem' }}>
          Five frameworks now govern AI systems: the EU AI Act, NIST AI RMF 1.0, ISO/IEC 42001:2023, Executive Order 14110, and OECD AI Principles. They overlap, contradict each other in places, and arrive on different timelines. This guide tells you what each requires, who must comply, and what a defensible AI governance program actually looks like across all five.
        </p>

        <div style={{ fontSize: '0.85rem', opacity: 0.55, marginBottom: '2.5rem' }}>
          Decision-support only. Not a legal opinion. For binding AI governance analysis, retain licensed counsel with AI regulatory expertise.
        </div>

        {/* Section 1: Frameworks */}
        <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.015em' }}>
          1. The Five AI Governance Frameworks at a Glance
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: '1.5rem' }}>
          Each framework has a different legal character — binding regulation, voluntary standard, certification scheme, or policy reference. Understanding the difference determines your compliance obligations and the consequences of non-compliance.
        </p>
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          {FRAMEWORKS.map((fw) => (
            <div key={fw.name} style={{ border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '10px', padding: '1.25rem', borderLeft: `4px solid ${fw.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: fw.color, flexShrink: 0 }} />
                <strong style={{ fontSize: '1.05rem' }}>{fw.name}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 1.5rem', fontSize: '0.855rem', lineHeight: 1.55 }}>
                <div><span style={{ opacity: 0.55 }}>Regulator:</span> {fw.regulator}</div>
                <div><span style={{ opacity: 0.55 }}>Type:</span> {fw.type}</div>
                <div style={{ gridColumn: '1 / -1' }}><span style={{ opacity: 0.55 }}>Scope:</span> {fw.scope}</div>
                <div style={{ gridColumn: '1 / -1' }}><span style={{ opacity: 0.55 }}>Enforcement:</span> {fw.enforcement}</div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ opacity: 0.55 }}>Status:</span>{' '}
                  <span style={{ fontWeight: 600, color: fw.color }}>{fw.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section 2: Governance Components */}
        <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.015em' }}>
          2. 6 Components of a Defensible AI Governance Program
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: '1.5rem' }}>
          Across all five frameworks, the same six program elements appear repeatedly. Implementing these does not guarantee compliance with every framework, but it creates the audit-ready foundation that each one requires. Each card shows which specific articles and functions require that component.
        </p>
        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '2rem' }}>
          {GOVERNANCE_COMPONENTS.map((comp) => (
            <div key={comp.number} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem', padding: '1rem 1.1rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '8px', alignItems: 'start' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: 'var(--primary, #1a56db)', minWidth: '1.75rem', paddingTop: '0.1rem' }}>{comp.number}</span>
              <div>
                <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '0.35rem' }}>{comp.title}</strong>
                <p style={{ fontSize: '0.855rem', lineHeight: 1.6, margin: '0 0 0.4rem', opacity: 0.8 }}>{comp.description}</p>
                <p style={{ fontSize: '0.78rem', lineHeight: 1.5, margin: 0, opacity: 0.55, fontFamily: 'monospace' }}>Required by: {comp.frameworks}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Section 3: Applicability Matrix */}
        <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.015em' }}>
          3. Does It Apply to You? Applicability Matrix
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
          Applicability varies by company type. Use the matrix below to identify your exposure across all five frameworks.
        </p>
        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.78rem' }}>
          {(Object.entries(CELL_STYLES) as [CellValue, typeof CELL_STYLES[CellValue]][]).map(([key, s]) => (
            <span key={key} style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}</span>
          ))}
        </div>
        <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', minWidth: '540px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border, #e5e7eb)' }}>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 700, minWidth: '150px' }}>Company type</th>
                {APPLICABILITY_COLS.map((col) => (
                  <th key={col} style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontWeight: 700, fontSize: '0.78rem' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {APPLICABILITY_ROWS.map((row, ri) => (
                <tr key={row} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, lineHeight: 1.4 }}>{row}</td>
                  {APPLICABILITY_MATRIX[ri].map((cell, ci) => {
                    const s = CELL_STYLES[cell]
                    return (
                      <td key={ci} style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', padding: '0.2rem 0.45rem', borderRadius: '4px', background: s.bg, color: s.color, fontWeight: 600, fontSize: '0.72rem', lineHeight: 1.3, whiteSpace: 'nowrap' }}>
                          {s.label}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 4: High-Risk Use Cases */}
        <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.015em' }}>
          4. 8 Use Cases That Trigger High-Risk Obligations Under EU AI Act Annex III
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: '1.5rem' }}>
          If your AI system falls into any of these categories, you are the &quot;provider&quot; of a high-risk AI system under EU AI Act Annex III. The 10 high-risk obligations — risk management, data governance, technical documentation, logging, human oversight, conformity assessment, and post-market monitoring — all apply to you, regardless of whether you built the underlying model.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
          {HIGH_RISK_USE_CASES.map((uc, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.75rem', padding: '0.9rem 1rem', border: '1px solid #fca5a5', borderRadius: '8px', alignItems: 'start', background: 'color-mix(in srgb, #ef4444 4%, transparent)' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: '#dc2626', paddingTop: '0.1rem' }}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>{uc.name}</strong>
                <p style={{ fontSize: '0.78rem', lineHeight: 1.5, margin: 0, opacity: 0.65 }}>{uc.note}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Section 5: Penalties Comparison */}
        <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.015em' }}>
          5. Enforcement Consequences: What Each Framework Costs You
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: '1.5rem' }}>
          Only the EU AI Act carries direct financial penalties. NIST AI RMF and ISO 42001 impose commercial consequences — loss of federal contracts and enterprise procurement disqualification — that can be equally damaging in practice.
        </p>
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          {PENALTIES_COMPARISON.map((p) => (
            <div key={p.framework} style={{ border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '10px', padding: '1.25rem', borderLeft: `4px solid ${p.color}` }}>
              <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '0.75rem', color: p.color }}>{p.framework}</strong>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {p.tiers.map((t) => (
                  <div key={t.label} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'baseline', fontSize: '0.855rem', lineHeight: 1.5 }}>
                    <span style={{ opacity: 0.75 }}>{t.label}</span>
                    <span style={{ fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>{t.penalty}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: '2.5rem', padding: '1.75rem 2rem', background: 'var(--primary, #1a56db)', borderRadius: '12px', color: '#fff' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            AI Governance agent monitors all 5 frameworks weekly
          </h3>
          <p style={{ margin: '0 0 1.25rem', opacity: 0.9, lineHeight: 1.6, fontSize: '0.95rem' }}>
            Per-feature risk classification across EU AI Act, NIST AI RMF, ISO 42001, EO 14110, and OECD Principles. Monthly delta reports that map your product changes to compliance posture changes. One dashboard instead of five frameworks to track manually. $49/mo — cancel anytime.
          </p>
          <Link
            href="/agents/ai-governance"
            style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#fff', color: 'var(--primary, #1a56db)', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}
          >
            Get AI Governance Monitoring — $49/mo →
          </Link>
        </div>

        {/* Section 6: FAQ */}
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
            <Link href="/agents/ai-governance" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>
              AI Governance Agent ($49/mo) →
            </Link>
            <Link href="/guides/eu-ai-act-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>
              EU AI Act Compliance Guide →
            </Link>
            <Link href="/agents/ai-act" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>
              AI Act Classification Agent →
            </Link>
            <Link href="/guides/privacy-policy-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>
              Privacy Policy Compliance Guide →
            </Link>
            <Link href="/regulations" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>
              All Regulations →
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
