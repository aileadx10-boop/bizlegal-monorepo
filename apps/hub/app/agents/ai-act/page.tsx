import type { Metadata } from 'next'
import Link from 'next/link'
import { PricingTierCard, type PricingTierData } from '../../components/ui-v2/PricingTierCard'
import { AiActIntakeForm } from './AiActIntakeForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'EU AI Act Risk Classifier — BizLegal AI',
  description:
    'Free preview classification of your AI system into Article 6 risk tiers + Annex III references. Deadline: 2026-08-02. $99 one-time full report, $49/mo monitoring.',
  alternates: { canonical: 'https://bizlegal-ai.com/agents/ai-act' },
}

function url(name: string): string | undefined {
  const v = (process.env as Record<string, string | undefined>)[name]
  return v && v.length > 4 ? v : undefined
}

const ONETIME_TIER: PricingTierData = {
  name: 'Full classification report',
  description:
    'Sonnet-drafted compliance file: full Article 6 / Annex III citation map, 10-line documentation checklist, conformity-assessment outline, Article 50 transparency notices. Delivered as PDF.',
  prices: {
    oneTime: { amount: 99, currency: 'USD' },
  },
  features: [
    'Full Article + Annex III citation map',
    'Conformity-assessment outline (high-risk only)',
    'Documentation checklist (15+ items)',
    'Article 50 transparency notice templates',
    'PDF delivery within 5 minutes',
  ],
  excludes: ['Ongoing monitoring', 'Re-classification on rule changes'],
  checkoutUrls: {
    oneTime: {
      crypto: url('NEXT_PUBLIC_NOWPAYMENTS_AI_ACT_ONETIME_URL'),
      card: url('NEXT_PUBLIC_PAYPAL_AI_ACT_ONETIME_URL'),
    },
  },
}

const MONITORING_TIER: PricingTierData = {
  name: 'Monitoring',
  badge: 'Most popular',
  description:
    'Daily Sonnet-aware monitoring of EU AI Act + Implementing Regulations + EDPB AI guidance. Email alerts when a published change affects your risk tier or the obligations downstream of it.',
  prices: {
    monthly: { amount: 49, currency: 'USD' },
    yearly: { amount: 490, currency: 'USD', saveLabel: 'save 2 mo' },
  },
  features: [
    'Everything in the one-time report',
    'Daily Sonnet semantic-diff on 5 EU sources',
    'Email alert on material change to your tier',
    'Quarterly re-classification (free)',
    'Cancel anytime',
  ],
  checkoutUrls: {
    monthly: {
      crypto: url('NEXT_PUBLIC_NOWPAYMENTS_AI_ACT_MONTHLY_URL'),
      card: url('NEXT_PUBLIC_PAYPAL_AI_ACT_MONTHLY_URL'),
    },
  },
  highlighted: true,
}

const FAQ = [
  {
    q: 'What is the EU AI Act?',
    a: 'Regulation (EU) 2024/1689, in force since 2 August 2024, establishes a risk-based framework for AI systems in the EU. It classifies AI into four tiers (unacceptable / high-risk / limited / minimal), imposes pre-market conformity assessment for high-risk systems, bans certain practices outright, and creates the EU AI Office as the central regulator. Fines reach €35M or 7% of global annual turnover, whichever is higher.',
  },
  {
    q: 'When do EU AI Act obligations actually apply?',
    a: 'Prohibited AI practices: 2024-02-02 (already applicable). General-purpose AI (GPAI) model obligations: 2025-08-02. High-risk AI systems under Annex I (product safety legislation) and Annex III (biometrics, education, employment, essential services, law enforcement, etc.): 2026-08-02. If your system could fall under any Annex III category, you need to classify before 2 August 2026.',
  },
  {
    q: 'What is Article 6 risk classification?',
    a: 'Article 6 defines the two-step test for "high-risk AI." Step 1: is the system a safety component of a product covered by Annex I legislation (medical devices, machinery, civil aviation, etc.)? Step 2: is the system listed in Annex III categories — biometric categorization, critical infrastructure, education, employment decisions, access to essential services, law enforcement, migration, or administration of justice? A yes to either step means high-risk obligations apply.',
  },
  {
    q: 'Does the EU AI Act apply to non-EU companies?',
    a: 'Yes. The EU AI Act applies extraterritorially to AI systems placed on the EU market or whose output is used in the EU, regardless of where the provider is established. A US startup with EU users, an EU-facing SaaS product, or a model accessed via API from the EU is within scope. The territorial logic mirrors GDPR\'s extra-EU application.',
  },
  {
    q: 'How is AI Act compliance different from GDPR compliance?',
    a: 'GDPR governs personal data processing. The AI Act governs AI system design and deployment regardless of whether personal data is processed. A model trained on public data that makes decisions affecting EU individuals still triggers AI Act obligations even if GDPR is not engaged. For AI systems processing personal data, both regimes apply simultaneously.',
  },
] as const

export default function AiActPage() {
  const appLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AI Act Classifier",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description":
      "EU AI Act risk classification + compliance roadmap for AI systems and high-risk use cases.",
    "url": "https://bizlegal-ai.com/agents/ai-act",
    "image": "https://bizlegal-ai.com/og/ai-act.png",
    "offers": { "@type": "Offer", "price": "49", "priceCurrency": "USD",
      "category": "monthly", "url": "https://bizlegal-ai.com/agents/ai-act" },
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
      { "@type": "ListItem", "position": 3, "name": "AI Act Classifier", "item": "https://bizlegal-ai.com/agents/ai-act" },
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
      <section
        className="bl-hero-bg"
        style={{
          paddingTop: 'clamp(4rem, 2rem + 4vw, 6rem)',
          paddingBottom: 'clamp(2rem, 1.5rem + 2vw, 3rem)',
        }}
      >
        <div className="bl-container" style={{ maxWidth: 880 }}>
          <span className="bl-tag" style={{ marginBottom: '1rem' }}>
            EU AI Act · applicable 2026-08-02 · Article 6 / Annex III
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
            Classify your AI system before <span className="bl-grad-text">2026-08-02.</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem)',
              color: 'var(--bl-text-muted)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 720,
            }}
          >
            The general-purpose AI obligations under the EU AI Act become applicable on{' '}
            <strong style={{ color: 'var(--bl-text)' }}>2 August 2026.</strong> Misclassification can mean fines up
            to <strong style={{ color: 'var(--bl-text)' }}>€35M or 7% of global turnover.</strong> Tell us how your
            system works; we&apos;ll classify it into <em>minimal / limited / high / unacceptable</em>, cite the
            specific Article 6 + Annex III provisions that govern, and produce a documentation checklist for your
            compliance file. Free preview classification — no card.
          </p>
        </div>
      </section>

      <section className="bl-section" style={{ paddingTop: 'clamp(2rem, 1rem + 2vw, 3rem)' }}>
        <div className="bl-container" style={{ maxWidth: 720 }}>
          <AiActIntakeForm />
        </div>
      </section>

      <section
        className="bl-section"
        style={{ background: 'var(--bl-bg-low)', borderTop: '1px solid var(--bl-divider)' }}
      >
        <div className="bl-container" style={{ maxWidth: 1100 }}>
          <span className="bl-label" style={{ color: 'var(--bl-accent)' }}>— Beyond the preview</span>
          <h2
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: 'var(--bl-text-h2)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--bl-text)',
              margin: '0.5rem 0 1rem',
            }}
          >
            Full report or ongoing monitoring.
          </h2>
          <p
            style={{
              color: 'var(--bl-text-muted)',
              lineHeight: 1.6,
              margin: '0 0 1.75rem',
              maxWidth: 720,
            }}
          >
            The free preview gives you the tier + the top-level Article references. The $99 one-time report adds the
            conformity-assessment outline and Article 50 transparency-notice templates. The $49/mo monitoring tier
            re-runs your classification quarterly and emails you the day a Commission Implementing Regulation
            affects your tier.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'clamp(1rem, 0.75rem + 1vw, 1.5rem)',
              alignItems: 'stretch',
            }}
          >
            <PricingTierCard {...ONETIME_TIER} defaultInterval="one-time" />
            <PricingTierCard {...MONITORING_TIER} defaultInterval="monthly" />
          </div>
        </div>
      </section>

      <section className="bl-section" style={{ background: 'var(--bl-bg-low)', borderTop: '1px solid var(--bl-divider)', borderBottom: '1px solid var(--bl-divider)' }}>
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

      <section className="bl-section">
        <div className="bl-container-narrow" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--bl-text-muted)', lineHeight: 1.6 }}>
            Curious about the rule itself?{' '}
            <Link href="/regulations" style={{ color: 'var(--bl-accent)' }}>
              Read our EU AI Act explainer
            </Link>{' '}
            or{' '}
            <Link href="/agents" style={{ color: 'var(--bl-accent)' }}>
              browse the rest of the agent fleet
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
