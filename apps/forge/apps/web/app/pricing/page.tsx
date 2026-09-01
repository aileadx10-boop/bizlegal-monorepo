// Forge /pricing — Phase D8 + B4 (3-tier matrix, no Contact Sales)

import type { Metadata } from 'next'
import Link from 'next/link'
import { PricingTierCard, type PricingTierData } from '../components/ui-v2/PricingTierCard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pricing — BizLegal Forge | State Transparency Kit, Regulatory Passport & Compliance Audit',
  description: 'State Transparency Report Kit $149 one-time. Regulatory Passport $297 one-time or $99/mo. Web Compliance Scanner $99/scan or $49/mo. Crypto + card checkout. 14-day money-back.',
  openGraph: {
    title: 'BizLegal Forge Pricing — State Transparency Kit, Passport & Audit',
    description: 'Transparent compliance tool pricing. State Transparency Kit $149, Passport $297, Web Audit $99. Crypto via NOWPayments, card via PayPal. 14-day money-back.',
    url: 'https://forge.bizlegal-ai.com/pricing',
  },
  alternates: { canonical: 'https://forge.bizlegal-ai.com/pricing' },
}


function apexCheckout(
  product: string,
  tier: string,
  interval: 'one-time' | 'monthly' | 'yearly',
  amountCents: number,
  name: string,
): string {
  const params = new URLSearchParams({
    product,
    tier,
    interval,
    amount: String(amountCents),
    name,
  })
  return `https://bizlegal-ai.com/checkout?${params.toString()}`
}

const BOI_TIER: PricingTierData = {
  name: 'State Transparency Report Kit',
  badge: 'Most popular',
  description:
    'Federal BOI filing for US domestic companies ended under FinCEN\'s 2025 rule — states are filling the gap. This kit maps your LLC details to state-level disclosure duties (NY\'s enacted LLC Transparency Act; proposed acts elsewhere), statute-cited, in 5 minutes.',
  prices: {
    oneTime: { amount: 149, currency: 'USD', label: 'one-time' },
    yearly: { amount: 149, currency: 'USD', saveLabel: '+ refresh', label: '/year (annual refresh)' },
  },
  features: [
    'State-by-state duty mapping',
    'NY LLCTA readiness check',
    'Enacted vs proposed tracker',
    'Ownership structure analyzer',
    'Annual refresh reminder',
    'Practitioner-reviewed template',
    '14-day money back',
  ],
  checkoutUrls: {
    oneTime: { checkout: apexCheckout('forge', 'boi', 'one-time', 14900, 'FORGE boi one-time') },
    yearly: { checkout: apexCheckout('forge', 'boi', 'yearly', 14900, 'FORGE boi yearly') },
  },
  highlighted: true,
}

const PASSPORT_TIER: PricingTierData = {
  name: 'Regulatory Passport',
  description:
    'Multi-framework operating brief for cross-border founders. 8 frameworks, scored against your business model. Quarterly refresh keeps you ahead of regulator changes.',
  prices: {
    oneTime: { amount: 297, currency: 'USD', label: 'one-time brief' },
    monthly: { amount: 99, currency: 'USD' },
    yearly: { amount: 990, currency: 'USD', saveLabel: 'save 2 mo' },
  },
  features: [
    '8 regulatory frameworks',
    'GDPR / CIPA / FCA / VARA / MAS',
    'Per-jurisdiction risk score',
    'Quarterly refresh',
    'Custom watch list',
    'Practitioner-reviewed',
  ],
  checkoutUrls: {
    oneTime: { checkout: apexCheckout('forge', 'passport', 'one-time', 29700, 'FORGE passport one-time') },
    monthly: { checkout: apexCheckout('forge', 'passport', 'monthly', 9900, 'FORGE passport monthly') },
    yearly: { checkout: apexCheckout('forge', 'passport', 'yearly', 99000, 'FORGE passport yearly') },
  },
}

const AUDIT_TIER: PricingTierData = {
  name: 'Web Compliance Scanner',
  description:
    'Automated audit of your public surface — cookie banners, privacy policy, CIPA, accessibility. Scan once or subscribe for monthly re-scans + drift alerts.',
  prices: {
    oneTime: { amount: 99, currency: 'USD', label: 'per scan' },
    monthly: { amount: 49, currency: 'USD' },
    yearly: { amount: 490, currency: 'USD', saveLabel: 'save 2 mo' },
  },
  features: [
    'Cookie / GDPR audit',
    'Privacy policy gap scan',
    'CIPA disclosure check',
    'Accessibility (WCAG AA)',
    'Prioritised remediation list',
    'PDF export',
  ],
  checkoutUrls: {
    oneTime: { checkout: apexCheckout('forge', 'audit', 'one-time', 9900, 'FORGE audit one-time') },
    monthly: { checkout: apexCheckout('forge', 'audit', 'monthly', 4900, 'FORGE audit monthly') },
    yearly: { checkout: apexCheckout('forge', 'audit', 'yearly', 49000, 'FORGE audit yearly') },
  },
}

export default function ForgePricingPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the State Transparency Report Kit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The State Transparency Report Kit maps your LLC's details to state-level transparency disclosure duties. Federal BOI filing for US domestic companies ended under FinCEN's 2025 rule; states are filling the gap — New York's LLC Transparency Act is enacted, others are proposed. The kit identifies which duties apply, cites the controlling statutes, and includes an ownership-structure worksheet. Price: $149 one-time.",
        },
      },
      {
        "@type": "Question",
        "name": "What is the BizLegal Passport?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Passport is our flagship compliance binder — a 200-page document covering your entity, state transparency duties, ownership structure, license status, and a year of monitoring. Reviewed by a named analyst. Price: $297 one-time.",
        },
      },
      {
        "@type": "Question",
        "name": "Do I need a lawyer to use these products?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For most standard entities (LLC, C-Corp, Ltd), the templates are designed to be DIY. For complex ownership structures, trusts, foreign entities, or regulated industries, we recommend a 30-minute consult with one of our partner firms.",
        },
      },
      {
        "@type": "Question",
        "name": "What payment methods are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Crypto via NOWPayments (BTC, ETH, USDT), card via PayPal. Wire transfer on request.",
        },
      },
      {
        "@type": "Question",
        "name": "Is the Passport refundable?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, within 14 days of purchase if the document has not been finalized for your entity. Once the analyst begins the review, the sale is final.",
        },
      },
    ],
  }

  const productLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "BizLegal Forge",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description":
      "Compliance templates and binders for small businesses — State Transparency Report Kit, BizLegal Passport, and entity-specific packages.",
    "url": "https://forge.bizlegal-ai.com/pricing",
    "image": "https://forge.bizlegal-ai.com/og.png",
    "offers": [
      { "@type": "Offer", "name": "State Transparency Report Kit", "price": "149", "priceCurrency": "USD",
        "category": "one-time", "url": "https://forge.bizlegal-ai.com/boi" },
      { "@type": "Offer", "name": "BizLegal Passport", "price": "297", "priceCurrency": "USD",
        "category": "one-time", "url": "https://forge.bizlegal-ai.com/passport" },
    ],
    "brand": { "@type": "Brand", "name": "BizLegal Forge" },
    "provider": {
      "@type": "Organization",
      "name": "BizLegal AI",
      "url": "https://bizlegal-ai.com",
    },
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bizlegal-ai.com" },
      { "@type": "ListItem", "position": 2, "name": "Forge", "item": "https://forge.bizlegal-ai.com" },
      { "@type": "ListItem", "position": 3, "name": "Pricing", "item": "https://forge.bizlegal-ai.com/pricing" },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <section
        className="bl-hero-bg"
        style={{
          paddingTop: 'clamp(4rem, 2rem + 4vw, 6rem)',
          paddingBottom: 'clamp(2rem, 1.5rem + 2vw, 3rem)',
        }}
      >
        <div
          className="bl-container"
          style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}
        >
          <span className="bl-tag" style={{ marginBottom: '1rem' }}>
            Transparent pricing
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
            Pay for the filing,{' '}
            <span className="bl-grad-text">not the meeting.</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem)',
              color: 'var(--bl-text-muted)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            State Transparency Kit one-time. Passport on subscription. Audit
            per scan or monthly. Crypto via NOWPayments, card via PayPal.
            14-day money-back, no questions.
          </p>
        </div>
      </section>

      <section className="bl-section" style={{ paddingTop: 'clamp(2rem, 1rem + 2vw, 4rem)' }}>
        <div className="bl-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'clamp(1rem, 0.75rem + 1vw, 1.5rem)',
              alignItems: 'stretch',
            }}
          >
            <PricingTierCard {...BOI_TIER} defaultInterval="one-time" />
            <PricingTierCard {...PASSPORT_TIER} defaultInterval="monthly" />
            <PricingTierCard {...AUDIT_TIER} defaultInterval="one-time" />
          </div>
          <p
            style={{
              fontSize: 'var(--bl-text-small)',
              color: 'var(--bl-text-subtle)',
              textAlign: 'center',
              marginTop: 'clamp(1.5rem, 1rem + 1vw, 2.5rem)',
              maxWidth: 720,
              marginInline: 'auto',
            }}
          >
            Prices in USD. Crypto checkout (NOWPayments) accepts BTC, ETH,
            USDT, USDC + 100 more. Card checkout (PayPal) supports cards in
            200+ countries. 14-day money-back, no questions.
          </p>
        </div>
      </section>

      <section
        className="bl-section"
        style={{
          background: 'var(--bl-accent-soft)',
          borderTop: '1px solid var(--bl-divider)',
        }}
      >
        <div className="bl-container-narrow" style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: 'var(--bl-text-h2)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--bl-text)',
              margin: 0,
              marginBottom: '1rem',
            }}
          >
            Need all three?{' '}
            <span className="bl-grad-text">Bundle.</span>
          </h2>
          <p
            style={{
              fontSize: 'var(--bl-text-body)',
              color: 'var(--bl-text-muted)',
              lineHeight: 1.6,
              margin: 0,
              marginBottom: '1.5rem',
            }}
          >
            Transparency Kit + Passport + Audit on a single annual plan — saves ~$300
            vs the per-product prices.
          </p>
          <Link href="/boi" className="bl-btn-primary">
            Start with the Transparency Kit ($149)
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  )
}
