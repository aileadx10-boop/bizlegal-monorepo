// app/pricing/page.tsx — Phase D6 + B4 (3-tier matrix, no Contact Sales)

import type { Metadata } from 'next'
import Link from 'next/link'
import { PricingTierCard, type PricingTierData } from '@/app/components/ui-v2/PricingTierCard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pricing — BizLegal AI | Regulatory Intelligence Plans',
  description:
    'Compliance intelligence priced honestly. Free snapshot, $149/mo Pro, $499/mo Scale. One-time, monthly, and yearly billing — no contact-us dead ends.',
  alternates: { canonical: 'https://bizlegal-ai.com/pricing' },
}

// ──────────────────────────────────────────────────────────
// Checkout: 2026-05-20 — unified API-driven flow.
//
// Every product now routes through /checkout?... which calls the
// gateway start routes (/api/payments/nowpayments/start +
// /api/payments/paypal/start). NOWPayments needs only the global
// NOWPAYMENTS_API_KEY env (no per-product hosted-URL setup); PayPal
// one-time needs only PAYPAL_CLIENT_ID/SECRET. So Hub Pro, Hub Scale,
// and BRAI variants ALL accept money today with zero dashboard work.
// ──────────────────────────────────────────────────────────

function checkoutHref(
  product: string,
  tier: string,
  interval: 'one-time' | 'monthly' | 'yearly',
  amountCents: number,
  displayName: string,
): string {
  const params = new URLSearchParams({
    product,
    tier,
    interval,
    amount: String(amountCents),
    name: displayName,
  })
  return `/checkout?${params.toString()}`
}

const PRO_TIER: PricingTierData = {
  name: 'Pro',
  badge: 'Most popular',
  description:
    'Continuous regulatory monitoring across 50+ jurisdictions, on-demand risk analyses, and an exportable PDF brief every month.',
  prices: {
    oneTime: { amount: 149, currency: 'USD', label: 'one-time brief' },
    monthly: { amount: 149, currency: 'USD' },
    yearly: { amount: 1490, currency: 'USD', saveLabel: 'save 2 mo' },
  },
  features: [
    'Unlimited risk analyses',
    'Full jurisdiction comparison (50+ jurisdictions)',
    'Real-time enforcement alerts',
    'Priority Sonnet 4.6 deep analysis',
    'Exportable PDF reports',
    '5 team seats',
    'API access (1,000 calls / mo)',
    'Practitioner review on flagged outputs',
  ],
  excludes: ['White-label reports', 'SSO / SAML'],
  checkoutUrls: {
    oneTime: { checkout: checkoutHref('hub', 'pro', 'one-time', 14900, 'BizLegal Hub Pro — one-time brief') },
    monthly: { checkout: checkoutHref('hub', 'pro', 'monthly', 14900, 'BizLegal Hub Pro — monthly') },
    yearly: { checkout: checkoutHref('hub', 'pro', 'yearly', 149000, 'BizLegal Hub Pro — yearly') },
  },
  highlighted: true,
}

const SCALE_TIER: PricingTierData = {
  name: 'Scale',
  description:
    'For organisations operating across 5+ jurisdictions or needing custom regulatory coverage, white-label briefs, and a dedicated compliance analyst.',
  prices: {
    oneTime: { amount: 499, currency: 'USD', label: 'enterprise brief' },
    monthly: { amount: 499, currency: 'USD' },
    yearly: { amount: 4990, currency: 'USD', saveLabel: 'save 2 mo' },
  },
  features: [
    'Everything in Pro',
    'Unlimited API access',
    'Custom jurisdiction coverage',
    'White-label reports',
    'Dedicated compliance analyst',
    'Quarterly regulatory briefings',
    'Custom alert rules',
    'SSO / SAML integration',
    '99.9% SLA',
  ],
  checkoutUrls: {
    oneTime: { checkout: checkoutHref('hub', 'scale', 'one-time', 49900, 'BizLegal Hub Scale — enterprise brief') },
    monthly: { checkout: checkoutHref('hub', 'scale', 'monthly', 49900, 'BizLegal Hub Scale — monthly') },
    yearly: { checkout: checkoutHref('hub', 'scale', 'yearly', 499000, 'BizLegal Hub Scale — yearly') },
  },
}

// ──────────────────────────────────────────────────────────
// FAQ
// ──────────────────────────────────────────────────────────
const FAQ = [
  {
    q: 'Can I switch plans at any time?',
    a: 'Yes. Upgrades take effect immediately; downgrades apply at the next billing cycle. No lock-in beyond the interval you chose.',
  },
  {
    q: 'What counts as a risk analysis?',
    a: 'Each submission of business parameters through the Risk Engine is one analysis. Multiple jurisdictions in a single submission count as one analysis.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Subscriptions: cancel anytime — access continues to the end of the period you have already paid for, no further billing. One-time intelligence reports are non-refundable once produced, except where the delivery is damaged or demonstrably defective. Full policy at /refund.',
  },
  {
    q: 'Crypto vs card — what is the difference?',
    a: 'Crypto checkout uses NOWPayments (BTC, ETH, USDT, USDC, and 100+ others). Card checkout uses PayPal. Same product, same price. Pick whichever is easier for your jurisdiction.',
  },
  {
    q: 'Is the intelligence feed updated in real time?',
    a: 'Pro and Scale users receive real-time alerts when new enforcement actions or regulatory changes are detected in their tracked jurisdictions. Free users see the daily brief on the homepage.',
  },
  {
    q: 'What jurisdictions are covered?',
    a: 'Free tier covers 5 major jurisdictions. Pro covers 50+ including US, EU, UK, UAE, Singapore, Switzerland, Cayman, BVI. Scale supports custom coverage on request.',
  },
  {
    q: 'Is my data secure?',
    a: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Supabase with row-level security. We never sell or share your data. Annual third-party penetration test.',
  },
  {
    q: 'Why no Stripe / LemonSqueezy?',
    a: 'We use NOWPayments + PayPal today, which are merchant-of-record and serve global customers (including jurisdictions Stripe and LemonSqueezy do not). Once we complete LemonSqueezy / Paddle approval we will add card-based subscription billing as an option.',
  },
]

// ══════════════════════════════════════════════════════════
export default function PricingPage() {
  return (
    <>
      {/* Header */}
      <section
        className="bl-hero-bg"
        style={{
          paddingTop: 'clamp(4rem, 2rem + 4vw, 6rem)',
          paddingBottom: 'clamp(2rem, 1.5rem + 2vw, 3rem)',
        }}
      >
        <div className="bl-container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
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
            Regulatory intelligence,{' '}
            <span className="bl-grad-text">priced honestly.</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem)',
              color: 'var(--bl-text-muted)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Free snapshot, paid Pro, scale on request — every plan billable
            one-time, monthly, or yearly. Crypto via NOWPayments, card via
            PayPal. Cancel anytime; one-time deliveries non-refundable once
            produced (damaged or defective output redelivered or refunded).
          </p>
        </div>
      </section>

      {/* Pricing cards */}
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
            {/* Free tier (custom card — no checkout, just CTA) */}
            <div
              className="bl-card"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--bl-font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--bl-text)',
                    margin: 0,
                    marginBottom: 4,
                  }}
                >
                  Free
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--bl-font-body)',
                    fontSize: 'var(--bl-text-small)',
                    color: 'var(--bl-text-muted)',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  For founders assessing regulatory exposure for the first time.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span
                  style={{
                    fontFamily: 'var(--bl-font-display)',
                    fontSize: 'clamp(2rem, 1.5rem + 1.5vw, 3rem)',
                    fontWeight: 800,
                    color: 'var(--bl-text)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                  }}
                >
                  $0
                </span>
                <span
                  style={{
                    fontFamily: 'var(--bl-font-body)',
                    fontSize: 'var(--bl-text-small)',
                    color: 'var(--bl-text-muted)',
                  }}
                >
                  forever
                </span>
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'grid',
                  gap: 8,
                  flex: 1,
                }}
              >
                {[
                  '3 risk analyses / month',
                  'Basic jurisdiction comparison',
                  '5 jurisdictions tracked',
                  'Intelligence feed access',
                  'Standard PDF reports',
                  'Community support',
                ].map((f) => (
                  <li
                    key={f}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      fontFamily: 'var(--bl-font-body)',
                      fontSize: 'var(--bl-text-small)',
                      color: 'var(--bl-text)',
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{ color: 'var(--bl-accent)', fontWeight: 700, flexShrink: 0 }}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/snapshot"
                className="bl-btn-ghost"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Start Free Snapshot →
              </Link>
            </div>

            {/* Pro tier */}
            <PricingTierCard {...PRO_TIER} defaultInterval="monthly" />

            {/* Scale tier */}
            <PricingTierCard {...SCALE_TIER} defaultInterval="yearly" />
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
            200+ countries. Subscriptions: cancel anytime. One-time deliveries:
            non-refundable once produced unless damaged or defective.
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="bl-section" style={{ background: 'var(--bl-bg-low)', borderTop: '1px solid var(--bl-divider)', borderBottom: '1px solid var(--bl-divider)' }}>
        <div className="bl-container">
          <div style={{ marginBottom: 'clamp(2rem, 1.5rem + 1vw, 3rem)', textAlign: 'center' }}>
            <span className="bl-label" style={{ color: 'var(--bl-accent)' }}>
              Side by side
            </span>
            <h2
              style={{
                fontFamily: 'var(--bl-font-display)',
                fontSize: 'var(--bl-text-h2)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: 'var(--bl-text)',
                margin: '0.5rem 0 0',
              }}
            >
              Plan comparison
            </h2>
          </div>
          <div
            className="bl-card"
            style={{
              padding: 0,
              overflow: 'hidden',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontFamily: 'var(--bl-font-body)',
                  fontSize: 'var(--bl-text-small)',
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--bl-border)' }}>
                    <th
                      style={{
                        padding: '14px 18px',
                        textAlign: 'left',
                        fontFamily: 'var(--bl-font-mono)',
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--bl-text-muted)',
                      }}
                    >
                      Feature
                    </th>
                    <th
                      style={{
                        padding: '14px 18px',
                        textAlign: 'center',
                        fontFamily: 'var(--bl-font-mono)',
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--bl-text-muted)',
                      }}
                    >
                      Free
                    </th>
                    <th
                      style={{
                        padding: '14px 18px',
                        textAlign: 'center',
                        fontFamily: 'var(--bl-font-mono)',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--bl-accent)',
                      }}
                    >
                      Pro
                    </th>
                    <th
                      style={{
                        padding: '14px 18px',
                        textAlign: 'center',
                        fontFamily: 'var(--bl-font-mono)',
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--bl-text-muted)',
                      }}
                    >
                      Scale
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ['Risk analyses / month', '3', 'Unlimited', 'Unlimited'],
                      ['Jurisdictions tracked', '5', '50+', 'Custom'],
                      ['Sonnet 4.6 deep analysis', '—', 'Yes', 'Yes'],
                      ['Enforcement alerts', '—', 'Real-time', 'Real-time + custom rules'],
                      ['PDF reports', 'Standard', 'Pro', 'White-label'],
                      ['API access', '—', '1,000 / mo', 'Unlimited'],
                      ['Team seats', '1', '5', 'Unlimited'],
                      ['Practitioner review', '—', 'On flagged outputs', 'Mandatory tier-3'],
                      ['Support', 'Community', 'Priority', 'Dedicated analyst'],
                      ['SSO / SAML', '—', '—', 'Yes'],
                      ['SLA', '—', '—', '99.9%'],
                    ] as const
                  ).map(([feature, free, pro, scale]) => (
                    <tr
                      key={feature}
                      style={{ borderTop: '1px solid var(--bl-divider)' }}
                    >
                      <td style={{ padding: '12px 18px', color: 'var(--bl-text)' }}>
                        {feature}
                      </td>
                      <td
                        style={{
                          padding: '12px 18px',
                          textAlign: 'center',
                          fontFamily: 'var(--bl-font-mono)',
                          color: 'var(--bl-text-subtle)',
                        }}
                      >
                        {free}
                      </td>
                      <td
                        style={{
                          padding: '12px 18px',
                          textAlign: 'center',
                          fontFamily: 'var(--bl-font-mono)',
                          fontWeight: 700,
                          color: 'var(--bl-accent)',
                        }}
                      >
                        {pro}
                      </td>
                      <td
                        style={{
                          padding: '12px 18px',
                          textAlign: 'center',
                          fontFamily: 'var(--bl-font-mono)',
                          color: 'var(--bl-text-muted)',
                        }}
                      >
                        {scale}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bl-section">
        <div className="bl-container">
          <div style={{ marginBottom: 'clamp(2rem, 1.5rem + 1vw, 3rem)', textAlign: 'center', maxWidth: 720, margin: '0 auto clamp(2rem, 1.5rem + 1vw, 3rem)' }}>
            <span className="bl-label" style={{ color: 'var(--bl-accent)' }}>
              FAQ
            </span>
            <h2
              style={{
                fontFamily: 'var(--bl-font-display)',
                fontSize: 'var(--bl-text-h2)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: 'var(--bl-text)',
                margin: '0.5rem 0 0',
              }}
            >
              Common questions
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'clamp(0.75rem, 0.5rem + 0.5vw, 1rem)',
              maxWidth: 1100,
              margin: '0 auto',
            }}
          >
            {FAQ.map(({ q, a }) => (
              <div key={q} className="bl-card" style={{ padding: '1.25rem 1.5rem' }}>
                <h3
                  style={{
                    fontFamily: 'var(--bl-font-display)',
                    fontSize: '1.0625rem',
                    fontWeight: 700,
                    color: 'var(--bl-text)',
                    margin: 0,
                    marginBottom: '0.5rem',
                    lineHeight: 1.3,
                  }}
                >
                  {q}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--bl-font-body)',
                    fontSize: 'var(--bl-text-small)',
                    color: 'var(--bl-text-muted)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
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
            Start with the <span className="bl-grad-text">free snapshot.</span>
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
            One snapshot, two jurisdictions, zero cards. Real regulatory
            exposure brief in 5 minutes — or use it as the input to a Pro
            subscription.
          </p>
          <Link href="/snapshot" className="bl-btn-primary">
            Free Jurisdiction Snapshot
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  )
}
