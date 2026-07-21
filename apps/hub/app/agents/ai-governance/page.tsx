import type { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'AI Governance for Product Teams — EU AI Act + CA SB-942 + CO AI Act Tracker',
  description:
    'For product orgs deploying LLM features (not lawyers). Per-feature Article 6 risk classification, monthly delta reports mapping repo changes to compliance posture changes. $49/mo. Decision-support, not legal advice.',
  alternates: { canonical: 'https://bizlegal-ai.com/agents/ai-governance' },
}

const DEADLINES: ReadonlyArray<{ name: string; date: string; impact: string }> = [
  { name: 'EU AI Act', date: '2026-08-02', impact: 'Article 6 high-risk obligations applicable to in-scope systems' },
  { name: 'Colorado AI Act', date: '2026-02-01', impact: 'High-risk AI decision systems must comply with consumer protections' },
  { name: 'California SB-942', date: 'In force', impact: 'AI-generated content disclosure for content provider services' },
]

const FEATURES: ReadonlyArray<string> = [
  'Per-feature Article 6 risk classification — every LLM-powered feature in your repo gets a tier',
  'Monthly delta report: maps git commits → compliance posture changes',
  'EU AI Act + CA SB-942 + CO AI Act coverage in a single dashboard',
  'Documentation checklist auto-generated per high-risk feature (Article 11 technical documentation)',
  'Conformity-assessment outline for in-scope features',
  'Article 50 transparency-notice templates for content-generation features',
]

const FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'Who is this for?',
    a: 'Product orgs (PMs, engineering managers, CTOs) shipping LLM features inside SaaS — not lawyers reviewing client work. If you have a chat assistant, an LLM-powered code suggester, or a content-generation feature in your product, the EU AI Act and the new US state laws apply to YOU, not your customers. This agent translates "we shipped a feature" into "here\'s the compliance delta".',
  },
  {
    q: 'How does the per-feature classification work?',
    a: 'You give us a JSON inventory of your AI features (we publish a 5-line schema). For each one, we apply the EU AI Act Article 6 + Annex III test, the CO AI Act consequential-decision test, and the CA SB-942 content-provider test. Output: per-feature risk tier + cited rationale + recommended controls.',
  },
  {
    q: 'What about California SB-942 content provenance?',
    a: 'SB-942 requires content provider services to offer a free AI detection tool and embed provenance metadata (C2PA-compatible) in AI-generated content. We flag features that meet the "content provider service" definition and walk you through the embed.',
  },
  {
    q: 'What about the EU AI Office?',
    a: 'For high-risk systems applicable 2026-08-02, the EU AI Office is the central regulator. We track their published guidance + national-authority delegations and surface anything material in your monthly report.',
  },
]

const CHECKOUT_URL =
  'https://bizlegal-ai.com/checkout?product=agent_ai_governance_product&tier=AI+Governance+for+Product+Teams&interval=monthly&amount=4900&name=AI+Governance+for+Product+Teams'

export default function AiGovernancePage() {
  const appLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AI Governance Product",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description":
      "Governance toolkit for AI products — model cards, risk assessments, NIST AI RMF mapping.",
    "url": "https://bizlegal-ai.com/agents/ai-governance",
    "image": "https://bizlegal-ai.com/og/ai-governance.png",
    "offers": { "@type": "Offer", "price": "99", "priceCurrency": "USD",
      "category": "monthly", "url": "https://bizlegal-ai.com/agents/ai-governance" },
    "brand": { "@type": "Brand", "name": "BizLegal AI" },
    "provider": {
      "@type": "Organization", "name": "BizLegal AI", "url": "https://bizlegal-ai.com",
    },
  }
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bizlegal-ai.com" },
      { "@type": "ListItem", "position": 2, "name": "Agents", "item": "https://bizlegal-ai.com/agents" },
      { "@type": "ListItem", "position": 3, "name": "AI Governance", "item": "https://bizlegal-ai.com/agents/ai-governance" },
    ],
  }
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a },
    })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <section className="bl-hero-bg" style={{ paddingTop: 'clamp(4rem, 2rem + 4vw, 6rem)', paddingBottom: 'clamp(2rem, 1.5rem + 2vw, 3rem)' }}>
        <div className="bl-container" style={{ maxWidth: 880 }}>
          <span className="bl-tag" style={{ marginBottom: '1rem' }}>
            EU AI Act · CA SB-942 · CO AI Act · 2026 deadlines
          </span>
          <h1
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: 'var(--bl-text-h1)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              color: 'var(--bl-text)',
              margin: '1.5rem 0 1rem',
            }}
          >
            AI Governance <span className="bl-grad-text">for the team that ships the code.</span>
          </h1>
          <p style={{ fontSize: 'clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem)', color: 'var(--bl-text-muted)', lineHeight: 1.6, margin: 0, maxWidth: 720 }}>
            Your legal team monitors the EU AI Act. Your engineers ship LLM features twice a week. Nobody is mapping commit-to-compliance until something breaks. $49/mo to close that gap.
          </p>
          <div style={{ marginTop: '1.75rem', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href={CHECKOUT_URL} className="bl-btn-primary">
              Subscribe — $49/mo →
            </Link>
            <Link href="/agents" className="bl-btn-ghost">All agents</Link>
          </div>
        </div>
      </section>

      <section className="bl-section">
        <div className="bl-container-narrow">
          <h2 style={{ fontFamily: 'var(--bl-font-display)', fontSize: 'var(--bl-text-h2)', fontWeight: 800, marginTop: 0, marginBottom: '1.5rem', letterSpacing: '-0.025em' }}>
            The deadlines stacking up
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {DEADLINES.map((d) => (
              <div key={d.name} className="bl-card" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, alignItems: 'baseline' }}>
                <div style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 13, color: 'var(--bl-accent)', fontWeight: 700 }}>{d.date}</div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--bl-text-muted)', lineHeight: 1.5 }}>{d.impact}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bl-section" style={{ background: 'var(--bl-bg-low)', borderTop: '1px solid var(--bl-divider)', borderBottom: '1px solid var(--bl-divider)' }}>
        <div className="bl-container-narrow">
          <h2 style={{ fontFamily: 'var(--bl-font-display)', fontSize: 'var(--bl-text-h2)', fontWeight: 800, marginTop: 0, marginBottom: '1.5rem', letterSpacing: '-0.025em' }}>What you get</h2>
          <ul style={{ display: 'grid', gap: 12, listStyle: 'none', padding: 0, margin: 0 }}>
            {FEATURES.map((f) => (
              <li key={f} className="bl-card" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'start', padding: '0.9rem 1rem' }}>
                <span aria-hidden="true" style={{ color: 'var(--bl-accent)', fontWeight: 700, fontSize: 18 }}>✓</span>
                <span style={{ fontSize: 14, lineHeight: 1.55 }}>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bl-section">
        <div className="bl-container-narrow">
          <h2 style={{ fontFamily: 'var(--bl-font-display)', fontSize: 'var(--bl-text-h2)', fontWeight: 800, marginTop: 0, marginBottom: '1.5rem', letterSpacing: '-0.025em' }}>FAQ</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {FAQ.map((item) => (
              <div key={item.q} className="bl-card">
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{item.q}</h3>
                <p style={{ fontSize: 14, color: 'var(--bl-text-muted)', lineHeight: 1.6, margin: 0 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bl-section" style={{ background: 'var(--bl-accent-soft)' }}>
        <div className="bl-container-narrow" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--bl-font-display)', fontSize: 'var(--bl-text-h2)', fontWeight: 800, margin: '0 0 1rem', letterSpacing: '-0.025em' }}>
            Map every commit to compliance.
          </h2>
          <p style={{ fontSize: 'var(--bl-text-body)', color: 'var(--bl-text-muted)', lineHeight: 1.6, margin: 0, marginBottom: '2rem' }}>
            $49/mo. Cancel anytime.
          </p>
          <Link href={CHECKOUT_URL} className="bl-btn-primary">Subscribe — $49/mo →</Link>
          <p style={{ marginTop: '2rem', fontSize: 11, color: 'var(--bl-text-subtle)', fontFamily: 'var(--bl-font-mono)', letterSpacing: '0.04em' }}>
            Decision-support, not legal advice. We surface obligations; your counsel files them.
          </p>
        </div>
      </section>
    </>
  )
}
