import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'EU AI Act Compliance Guide for SaaS & AI Companies (2025)',
  description:
    'The EU AI Act becomes fully applicable on 2 August 2026. This guide covers Article 6 risk classification, Annex III categories, GPAI model obligations, conformity assessment, and what SaaS and AI companies must do before the deadline.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/eu-ai-act-compliance-guide' },
  openGraph: {
    title: 'EU AI Act Compliance Guide — BizLegal AI',
    description:
      'Practical EU AI Act compliance for SaaS founders and AI teams. Article 6 classification, Annex III categories, GPAI obligations, conformity assessment timeline.',
    url: 'https://bizlegal-ai.com/guides/eu-ai-act-compliance-guide',
    type: 'article',
  },
}

const RISK_TIERS = [
  {
    tier: 'Unacceptable risk',
    description: 'Banned outright under Article 5. Includes social scoring by governments, real-time remote biometric surveillance in public spaces (with narrow exceptions), AI exploiting vulnerabilities of specific groups, and subliminal manipulation.',
    examples: 'Facial recognition databases scraped from social media, emotion-inference in workplaces, predictive policing targeting individuals.',
    color: '#dc2626',
  },
  {
    tier: 'High risk (Annex I)',
    description: 'AI systems that are safety components of products covered by existing EU product safety legislation — medical devices, machinery, civil aviation, railway systems, automotive, lifts.',
    examples: 'An AI-powered diagnostic software module in a CE-marked medical device; an AI-assisted collision avoidance system in an autonomous vehicle.',
    color: '#f97316',
  },
  {
    tier: 'High risk (Annex III)',
    description: 'Standalone AI systems in 8 specific use-case categories listed in Annex III of the regulation.',
    examples: 'Biometric categorization; critical infrastructure management; education assessment; employment screening; essential services access (credit scoring, insurance); law enforcement risk assessment; migration and border control; administration of justice.',
    color: '#f59e0b',
  },
  {
    tier: 'Limited risk',
    description: 'AI systems with specific transparency obligations under Articles 50-52. Must disclose that users are interacting with an AI.',
    examples: 'Chatbots, AI-generated synthetic content, deepfake videos. Primary obligation: disclosure label.',
    color: '#2563eb',
  },
  {
    tier: 'Minimal risk',
    description: 'AI systems not covered by any of the above. No mandatory obligations, but voluntary codes of conduct apply.',
    examples: 'AI-powered spam filters, recommendation engines, simple content classification.',
    color: '#16a34a',
  },
]

const ANNEX_III_CATEGORIES = [
  { number: '1', name: 'Biometric systems', note: 'Categorization and emotion recognition' },
  { number: '2', name: 'Critical infrastructure', note: 'Management of roads, water, gas, electricity, internet, banking, public health' },
  { number: '3', name: 'Education and vocational training', note: 'Systems determining access, admission, placement, grading, assessment' },
  { number: '4', name: 'Employment, workforce management', note: 'Recruitment, screening, task allocation, promotion, termination decisions' },
  { number: '5', name: 'Essential private services', note: 'Credit scoring, insurance risk assessment, eligibility for essential public benefits' },
  { number: '6', name: 'Law enforcement', note: 'Risk assessment, polygraphs, evidence reliability, crime analytics' },
  { number: '7', name: 'Migration, asylum, border control', note: 'Risk assessment, authentication, visa application decisions' },
  { number: '8', name: 'Administration of justice', note: 'Judicial decision support, dispute resolution, legal interpretation tools' },
]

const HIGH_RISK_OBLIGATIONS = [
  { step: '1', title: 'Risk management system', detail: 'Article 9: document risks throughout lifecycle; update with operational experience' },
  { step: '2', title: 'Data governance', detail: 'Article 10: training data relevance, bias testing, data quality measures' },
  { step: '3', title: 'Technical documentation', detail: 'Article 11 + Annex IV: complete technical file before market placement' },
  { step: '4', title: 'Record-keeping', detail: 'Article 12: automatic logging of operations; logs kept by deployers for at least 6 months' },
  { step: '5', title: 'Transparency to deployers', detail: 'Article 13: instructions for use, performance characteristics, limitations, intended purpose' },
  { step: '6', title: 'Human oversight', detail: 'Article 14: design must enable overseers to understand, monitor, and override the system' },
  { step: '7', title: 'Accuracy, robustness, cybersecurity', detail: 'Article 15: appropriate accuracy levels for intended purpose; resilience to adversarial inputs' },
  { step: '8', title: 'Conformity assessment', detail: 'Articles 43-49: self-assessment or third-party audit depending on Annex I vs Annex III; EU Declaration of Conformity; CE marking' },
  { step: '9', title: 'Registration in EU database', detail: 'Article 71: high-risk systems must be registered in the EU AI database before deployment' },
  { step: '10', title: 'Post-market monitoring', detail: 'Article 72: providers must implement monitoring plans; serious incident reporting to national authorities' },
]

const GPAI_OBLIGATIONS = [
  { tier: 'All GPAI models', obligations: 'Technical documentation; compliance with copyright law (training data provenance); make summary of training data publicly available; cooperate with AI Office requests' },
  { tier: 'Systemic risk models (>10²⁵ FLOPs)', obligations: 'All above PLUS: adversarial testing (red-teaming); incident reporting to AI Office within 24 hours of serious incidents; cybersecurity measures; energy efficiency information' },
]

const TIMELINE = [
  { date: '2024-08-01', event: 'EU AI Act enters into force', status: 'past' },
  { date: '2025-02-02', event: 'Prohibited AI practices banned (Article 5)', status: 'past' },
  { date: '2025-08-02', event: 'GPAI model obligations apply (Articles 51-56)', status: 'past' },
  { date: '2025-08-02', event: 'Governance bodies operational (Articles 57-78)', status: 'past' },
  { date: '2026-08-02', event: 'High-risk AI systems obligations (Annex I + III) — THE KEY DEADLINE', status: 'critical' },
  { date: '2026-08-02', event: 'Notified body assessments required for applicable Annex I systems', status: 'critical' },
  { date: '2027-08-02', event: 'Annex I AI systems already on market before 2026-08-02 must comply', status: 'future' },
  { date: '2030-01-01', event: 'AI systems in Annex I products regulated under existing harmonized legislation must comply', status: 'future' },
]

const FAQ = [
  {
    q: 'My SaaS uses OpenAI or Claude as an API. Does the EU AI Act apply to me?',
    a: 'It depends on what you build with it. The GPAI model obligations (Articles 51-56) apply to the model providers (OpenAI, Anthropic). But if you build a system on top of a GPAI model that falls into an Annex III category — for example, an AI-powered employment screening tool, a credit risk tool, or a student assessment product — YOU are the "provider" of a high-risk AI system and the Annex III obligations apply to you, not just to OpenAI.',
  },
  {
    q: 'When does the EU AI Act apply extraterritorially to non-EU companies?',
    a: 'The EU AI Act applies to providers placing AI systems on the EU market, deployers using AI systems in the EU, and providers/deployers established outside the EU when the output of their AI system is used in the EU. A US SaaS company with EU customers, or an AI tool whose outputs affect EU individuals, is within scope even without a EU legal entity.',
  },
  {
    q: 'What is a "systemic risk" GPAI model?',
    a: 'A GPAI model trained with more than 10²⁵ floating-point operations (FLOPs) is presumed to carry systemic risk under Article 51. As of 2025, GPT-4, Gemini Ultra, Claude 3 Opus, and Llama 3 are in this category. Models in this tier face additional obligations: adversarial testing, serious incident reporting to the AI Office within 24 hours, cybersecurity measures, and energy consumption disclosure.',
  },
  {
    q: 'What is conformity assessment for high-risk AI?',
    a: 'Conformity assessment is the process by which a provider demonstrates that a high-risk AI system meets the requirements in Articles 9-15. For most Annex III systems, providers self-assess against their own technical documentation and issue an EU Declaration of Conformity. For AI systems in Annex I products that already require third-party certification (medical devices, machinery, etc.), the AI Act conformity assessment is integrated into the existing product certification.',
  },
  {
    q: 'What are the fines for non-compliance?',
    a: 'Article 99 sets a three-tier penalty structure. Deploying a prohibited AI practice (Article 5): up to €35M or 7% of global annual turnover, whichever is higher. Violating other obligations (high-risk, GPAI, transparency): up to €15M or 3% of global annual turnover. Providing false or misleading information to authorities: up to €7.5M or 1.5% of global annual turnover.',
  },
  {
    q: 'How long does EU AI Act compliance take to implement?',
    a: 'For a SaaS startup with one or two in-scope features: 4-8 weeks to complete the Article 6 classification, technical documentation, risk management system, and instructions for use. For a company with multiple high-risk systems or an Annex I product integration: 6-12 months, including third-party assessment. Starting with classification (free with BizLegal AI) takes 24 hours.',
  },
]

export default function EuAiActGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'EU AI Act Compliance Guide for SaaS & AI Companies (2025)',
    description:
      'Practical EU AI Act compliance: Article 6 risk classification, Annex III categories, GPAI obligations, conformity assessment, and the 2026-08-02 deadline.',
    url: 'https://bizlegal-ai.com/guides/eu-ai-act-compliance-guide',
    datePublished: '2025-07-22',
    dateModified: '2025-07-22',
    author: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    publisher: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://bizlegal-ai.com/guides/eu-ai-act-compliance-guide' },
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
      { '@type': 'ListItem', position: 3, name: 'EU AI Act Compliance Guide', item: 'https://bizlegal-ai.com/guides/eu-ai-act-compliance-guide' },
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
          EU AI Act Compliance Guide
        </nav>

        <span style={{ display: 'inline-block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, opacity: 0.5, marginBottom: '0.75rem' }}>
          Regulatory Compliance · EU AI Act
        </span>

        <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem', marginTop: 0, letterSpacing: '-0.025em' }}>
          EU AI Act Compliance Guide for SaaS & AI Companies (2025)
        </h1>

        <p style={{ fontSize: '1.1rem', lineHeight: 1.75, opacity: 0.8, marginBottom: '0.5rem' }}>
          <strong>Deadline: 2 August 2026.</strong> The EU AI Act&apos;s high-risk AI obligations become fully applicable on that date. GPAI model obligations have already been in force since August 2025. This guide explains the risk classification framework, what each tier requires, and what SaaS companies and AI teams need to do before the deadline.
        </p>

        <div style={{ fontSize: '0.85rem', opacity: 0.55, marginBottom: '2.5rem' }}>
          Decision-support only. Not a legal opinion. For binding EU AI Act analysis, retain licensed EU counsel.
        </div>

        {/* Section 1: Risk Tiers */}
        <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.015em' }}>
          1. The Five Risk Tiers
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: '1.5rem' }}>
          The EU AI Act classifies AI systems into five risk tiers. The tier determines what obligations apply. Classification flows from the system&apos;s intended purpose — not from the underlying technology.
        </p>
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          {RISK_TIERS.map((tier) => (
            <div key={tier.tier} style={{ border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '10px', padding: '1.25rem', borderLeft: `4px solid ${tier.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: tier.color, flexShrink: 0 }} />
                <strong style={{ fontSize: '1rem' }}>{tier.tier}</strong>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.65, margin: '0 0 0.5rem', opacity: 0.85 }}>{tier.description}</p>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.6, margin: 0, opacity: 0.6 }}>
                <em>Examples:</em> {tier.examples}
              </p>
            </div>
          ))}
        </div>

        {/* Section 2: Annex III Categories */}
        <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.015em' }}>
          2. The Eight Annex III High-Risk Categories
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: '1.5rem' }}>
          Annex III is the list that most SaaS and AI companies need to check. If your product falls into any of these 8 categories — regardless of how the underlying model was built or who trained it — you are the &quot;provider&quot; of a high-risk AI system.
        </p>
        <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border, #e5e7eb)' }}>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 700, width: '2rem' }}>#</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 700 }}>Category</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 700 }}>Scope note</th>
              </tr>
            </thead>
            <tbody>
              {ANNEX_III_CATEGORIES.map((cat) => (
                <tr key={cat.number} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <td style={{ padding: '0.65rem 0.75rem', fontFamily: 'monospace', fontWeight: 600, opacity: 0.7 }}>{cat.number}</td>
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>{cat.name}</td>
                  <td style={{ padding: '0.65rem 0.75rem', opacity: 0.75, lineHeight: 1.5 }}>{cat.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 3: GPAI Obligations */}
        <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.015em' }}>
          3. General-Purpose AI (GPAI) Model Obligations
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: '1.5rem' }}>
          Articles 51-56 govern general-purpose AI models — foundation models and large language models that can be used for many tasks. These obligations apply to model <em>providers</em>, not to API consumers. But if you fine-tune a GPAI model on your own data and deploy it, you become a provider of a new GPAI model with your own obligations.
        </p>
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          {GPAI_OBLIGATIONS.map((row) => (
            <div key={row.tier} style={{ border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '10px', padding: '1.25rem' }}>
              <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>{row.tier}</strong>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.65, margin: 0, opacity: 0.85 }}>{row.obligations}</p>
            </div>
          ))}
        </div>

        {/* Section 4: High-Risk Obligations */}
        <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.015em' }}>
          4. High-Risk System Obligations (Articles 9–15 + 43–72)
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: '1.5rem' }}>
          If your system is high-risk under Annex I or Annex III, these 10 obligations apply before you can place it on the EU market. Each has a specific Article citation.
        </p>
        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '2rem' }}>
          {HIGH_RISK_OBLIGATIONS.map((item) => (
            <div key={item.step} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem', padding: '0.9rem 1rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '8px', alignItems: 'start' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary, #1a56db)', minWidth: '1.5rem' }}>{item.step}</span>
              <div>
                <strong style={{ fontSize: '0.9rem' }}>{item.title}</strong>
                <p style={{ fontSize: '0.82rem', lineHeight: 1.55, margin: '0.25rem 0 0', opacity: 0.7 }}>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Section 5: Timeline */}
        <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.015em' }}>
          5. EU AI Act Compliance Timeline
        </h2>
        <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '2rem' }}>
          {TIMELINE.map((item) => (
            <div
              key={item.date}
              style={{
                display: 'grid',
                gridTemplateColumns: '8rem 1fr',
                gap: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: item.status === 'critical' ? 'color-mix(in srgb, #ef4444 8%, transparent)' : item.status === 'past' ? 'var(--color-surface-low, #f9fafb)' : 'transparent',
                border: item.status === 'critical' ? '1px solid #fca5a5' : '1px solid var(--color-border, #e5e7eb)',
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, opacity: item.status === 'past' ? 0.5 : 1, color: item.status === 'critical' ? '#dc2626' : 'inherit' }}>{item.date}</span>
              <span style={{ fontSize: '0.875rem', lineHeight: 1.5, fontWeight: item.status === 'critical' ? 700 : 400 }}>{item.event}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: '2.5rem', padding: '1.75rem 2rem', background: 'var(--primary, #1a56db)', borderRadius: '12px', color: '#fff' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            Classify your AI system — free preview, no card required
          </h3>
          <p style={{ margin: '0 0 1.25rem', opacity: 0.9, lineHeight: 1.6, fontSize: '0.95rem' }}>
            Tell us how your system works. Get an Article 6 + Annex III risk tier, the specific obligations that apply, and a documentation checklist — free. Upgrade to a $99 full report or $49/mo monitoring to stay current as implementing regulations evolve.
          </p>
          <a
            href="https://bizlegal-ai.com/agents/ai-act"
            style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#fff', color: 'var(--primary, #1a56db)', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}
          >
            Get Free AI Act Classification →
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
            <Link href="/guides/gdpr-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>
              GDPR Compliance Checklist →
            </Link>
            <Link href="/guides/soc2-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>
              SOC 2 Compliance Guide →
            </Link>
            <Link href="/regulations/ai-act" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>
              EU AI Act Compliance Hub →
            </Link>
            <Link href="/guides/ai-governance-framework-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>
              AI Governance Framework →
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
