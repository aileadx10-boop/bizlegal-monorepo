import type { Metadata } from 'next'
import Link from 'next/link'
import { PricingTierCard, type PricingTierData } from '../components/ui-v2/PricingTierCard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pricing — TRACR Wallet & Transaction Intelligence',
  description:
    'On-chain forensic reports priced honestly. $29 to $799 per scan, with monthly and yearly subscriptions for active investigators. Pay with crypto or card.',
  alternates: { canonical: 'https://tracr.bizlegal-ai.com/pricing' },
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

const REGULATORY_TIER: PricingTierData = {
  name: 'Regulatory',
  description:
    'Quick chain-data check on a single wallet — sanctions list match + composite signal score. Best for one-off due diligence.',
  prices: {
    oneTime: { amount: 29, currency: 'USD', label: 'per scan' },
    monthly: { amount: 29, currency: 'USD' },
    yearly: { amount: 290, currency: 'USD', saveLabel: 'save 2 mo' },
  },
  features: [
    'Single-wallet sanctions check',
    'OFAC / UN / EU lists',
    '0-100 composite signal',
    '9 chains supported',
    'PDF report (basic)',
    'Email delivery',
  ],
  excludes: ['Counterparty graph traversal', 'Practitioner review'],
  checkoutUrls: {
    oneTime: { checkout: apexCheckout('tracr', 'regulatory', 'one-time', 2900, 'TRACR regulatory one-time') },
    monthly: { checkout: apexCheckout('tracr', 'regulatory', 'monthly', 2900, 'TRACR regulatory monthly') },
    yearly: { checkout: apexCheckout('tracr', 'regulatory', 'yearly', 29000, 'TRACR regulatory yearly') },
  },
}

const STANDARD_TIER: PricingTierData = {
  name: 'Standard',
  badge: 'Most popular',
  description:
    'Full forensic report with counterparty graph + 1st-degree exposure traversal. Suited for legal counsel + recovery work.',
  prices: {
    oneTime: { amount: 149, currency: 'USD', label: 'per report' },
    monthly: { amount: 149, currency: 'USD' },
    yearly: { amount: 1490, currency: 'USD', saveLabel: 'save 2 mo' },
  },
  features: [
    'Everything in Regulatory',
    'Counterparty graph (1st degree)',
    'Unusual-activity heatmap',
    'Exportable PDF + CSV',
    'Mixer / bridge tracing',
    'Citation footer',
    '7-day refresh',
  ],
  checkoutUrls: {
    oneTime: { checkout: apexCheckout('tracr', 'standard', 'one-time', 14900, 'TRACR standard one-time') },
    monthly: { checkout: apexCheckout('tracr', 'standard', 'monthly', 14900, 'TRACR standard monthly') },
    yearly: { checkout: apexCheckout('tracr', 'standard', 'yearly', 149000, 'TRACR standard yearly') },
  },
  highlighted: true,
}

const PROFESSIONAL_TIER: PricingTierData = {
  name: 'Professional',
  description:
    'Deep-dive forensic — 3-degree counterparty traversal, mixer/bridge analysis, AI narrative + practitioner sign-off.',
  prices: {
    oneTime: { amount: 349, currency: 'USD', label: 'per investigation' },
    monthly: { amount: 349, currency: 'USD' },
    yearly: { amount: 3490, currency: 'USD', saveLabel: 'save 2 mo' },
  },
  features: [
    'Everything in Standard',
    'Counterparty graph (3-degree)',
    'Mixer / cross-chain bridge map',
    'AI narrative (Sonnet 4.6)',
    'Practitioner-reviewed (LLB+LLM)',
    '24-48h turnaround',
    'API access',
  ],
  checkoutUrls: {
    oneTime: { checkout: apexCheckout('tracr', 'professional', 'one-time', 34900, 'TRACR professional one-time') },
    monthly: { checkout: apexCheckout('tracr', 'professional', 'monthly', 34900, 'TRACR professional monthly') },
    yearly: { checkout: apexCheckout('tracr', 'professional', 'yearly', 349000, 'TRACR professional yearly') },
  },
}

const ENTERPRISE_TIER: PricingTierData = {
  name: 'Enterprise',
  description:
    'Litigation-grade. Court-ready report, expert-witness affidavit option, multi-wallet scope, custom data sources.',
  prices: {
    oneTime: { amount: 799, currency: 'USD', label: 'per matter' },
    monthly: { amount: 799, currency: 'USD' },
    yearly: { amount: 7990, currency: 'USD', saveLabel: 'save 2 mo' },
  },
  features: [
    'Everything in Professional',
    'Court-ready format',
    'Expert-witness affidavit (option)',
    'Multi-wallet matter scope',
    'Custom data sources',
    'White-label PDF',
    'Dedicated investigator',
    '99.9% SLA',
  ],
  checkoutUrls: {
    oneTime: { checkout: apexCheckout('tracr', 'enterprise', 'one-time', 79900, 'TRACR enterprise one-time') },
    monthly: { checkout: apexCheckout('tracr', 'enterprise', 'monthly', 79900, 'TRACR enterprise monthly') },
    yearly: { checkout: apexCheckout('tracr', 'enterprise', 'yearly', 799000, 'TRACR enterprise yearly') },
  },
}

export default function TracrPricingPage() {
  return (
    <>
      <section
        className="bl-hero-bg"
        style={{
          paddingTop: 'clamp(4rem, 2rem + 4vw, 6rem)',
          paddingBottom: 'clamp(2rem, 1.5rem + 2vw, 3rem)',
        }}
      >
        <div className="bl-container" style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
          <span className="bl-tag" style={{ marginBottom: '1rem' }}>
            On-chain forensics — pay per scan or subscribe
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
            Wallet intelligence,{' '}
            <span className="bl-grad-text">priced per signal.</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem)',
              color: 'var(--bl-text-muted)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            One-off due diligence at $29. Court-ready forensic at $799.
            Subscribe monthly or yearly for ongoing investigations. Crypto via
            NOWPayments, card via PayPal. Cancel anytime; one-time scans
            non-refundable once produced unless damaged or defective.
          </p>
        </div>
      </section>

      <section className="bl-section" style={{ paddingTop: 'clamp(2rem, 1rem + 2vw, 4rem)' }}>
        <div className="bl-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'clamp(1rem, 0.75rem + 1vw, 1.5rem)',
              alignItems: 'stretch',
            }}
          >
            <PricingTierCard {...REGULATORY_TIER} defaultInterval="one-time" />
            <PricingTierCard {...STANDARD_TIER} defaultInterval="one-time" />
            <PricingTierCard {...PROFESSIONAL_TIER} defaultInterval="one-time" />
            <PricingTierCard {...ENTERPRISE_TIER} defaultInterval="one-time" />
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
            Reports are intelligence — not legal advice. We do not file,
            certify, or guarantee outcomes. Anti-hallucination guard: every
            claim cites the source on-chain query. Disclosure version
            v1.0.0-p4.
          </p>
        </div>
      </section>

      <section
        className="bl-section"
        style={{ background: 'var(--bl-accent-soft)', borderTop: '1px solid var(--bl-divider)' }}
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
            Need to scan now?{' '}
            <span className="bl-grad-text">Start with $29.</span>
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
            One wallet, sanctions check, signal score. Delivered in 60 seconds.
            Damaged or defective output redelivered or refunded — see policy.
          </p>
          <Link href="/scan" className="bl-btn-primary">
            Run a scan now
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  )
}
