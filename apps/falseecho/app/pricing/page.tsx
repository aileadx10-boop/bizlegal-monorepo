import type { Metadata } from 'next'
import Link from 'next/link'
import { TIER_PRICES_USD } from '../../lib/tiers'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pricing — FalseEcho AI Falsehood Monitoring',
  description:
    '$29 one-time audit: 25-prompt battery across ChatGPT, Claude, Perplexity, and Google AI Overviews with a hash-anchored evidence pack. $149/mo monitor: daily re-scans and alerts on new falsehoods.',
  alternates: { canonical: 'https://falseecho.bizlegal-ai.com/pricing' },
}

/**
 * Fleet checkout pattern: pricing links go to the hub apex checkout
 * (bizlegal-ai.com/checkout), which resolves the amount server-side from
 * apps/hub/lib/payments/price-map.ts (product `falseecho`). The `amount`
 * param here is a display hint only — it is never charged.
 */
function apexCheckout(
  tier: string,
  interval: 'one-time' | 'monthly',
  amountCents: number,
  name: string,
): string {
  const params = new URLSearchParams({
    product: 'falseecho',
    tier,
    interval,
    amount: String(amountCents),
    name,
  })
  return `https://bizlegal-ai.com/checkout?${params.toString()}`
}

const TIERS = [
  {
    name: 'Free exposure check',
    price: '$0',
    cadence: '3-prompt probe',
    description: 'See whether the engines flag you at all — before you spend a dollar.',
    features: [
      '4-engine quick probe (ChatGPT, Claude, Perplexity, Google AI Overviews)',
      'Flag count + 0–100 exposure score',
      'Per-engine availability matrix',
      'Upgrade to the full evidence pack anytime',
    ],
    cta: 'Run the free check',
    href: '/scan',
    external: false,
    featured: false,
  },
  {
    name: 'FalseEcho Audit',
    price: `$${TIER_PRICES_USD.audit}`,
    cadence: 'one-time',
    description: 'The full evidence pack — built for the moment you hand it to counsel.',
    features: [
      'Full 25-prompt battery × 4 engines',
      'SHA-256 hash + UTC timestamp on every captured answer',
      'Claude-graded confidence + narrative per flag',
      'Email delivery + permanent report link',
      'Programmatic evidence pages per detected falsehood',
    ],
    cta: 'Order the audit — $29',
    href: apexCheckout('audit', 'one-time', TIER_PRICES_USD.audit * 100, 'FalseEcho Audit (one-time)'),
    external: true,
    featured: true,
  },
  {
    name: 'FalseEcho Monitor',
    price: `$${TIER_PRICES_USD.monitor}`,
    cadence: 'per month',
    description: 'Engines change their answers constantly. Watch yours daily.',
    features: [
      'Everything in the Audit',
      'Daily re-scan of your entity',
      'Alert email when a new falsehood appears',
      'Weekly evidence summary',
      'Scan history with diff vs previous scan',
    ],
    cta: 'Start monitoring — $149/mo',
    href: apexCheckout('monitor', 'monthly', TIER_PRICES_USD.monitor * 100, 'FalseEcho Monitor (monthly)'),
    external: true,
    featured: false,
  },
]

export default function FalseEchoPricingPage() {
  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'FalseEcho',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'AI falsehood monitoring: 4-engine probe battery with hash-anchored evidence packs. $29 one-time audit, $149/mo monitor.',
    url: 'https://falseecho.bizlegal-ai.com/pricing',
    offers: [
      { '@type': 'Offer', name: 'FalseEcho Audit', price: String(TIER_PRICES_USD.audit), priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'FalseEcho Monitor', price: String(TIER_PRICES_USD.monitor), priceCurrency: 'USD' },
    ],
    brand: { '@type': 'Brand', name: 'FalseEcho' },
    provider: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'FalseEcho', item: 'https://falseecho.bizlegal-ai.com' },
      { '@type': 'ListItem', position: 3, name: 'Pricing', item: 'https://falseecho.bizlegal-ai.com/pricing' },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <section
        className="bl-hero-bg"
        style={{
          paddingTop: 'clamp(4rem, 2rem + 4vw, 6rem)',
          paddingBottom: 'clamp(2rem, 1.5rem + 2vw, 3rem)',
        }}
      >
        <div className="bl-container" style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
          <span className="bl-tag" style={{ marginBottom: '1rem' }}>
            AI falsehood monitoring — audit once or watch daily
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
            See what AI says about you.{' '}
            <span className="bl-grad-text">Prove it.</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem)',
              color: 'var(--bl-text-muted)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Free exposure check first. $29 for the full hash-anchored evidence
            pack. $149/mo to watch the engines daily and get alerted the
            moment a new falsehood appears. Card via PayPal, crypto via
            NOWPayments.
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
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className="bl-card"
                style={
                  tier.featured
                    ? {
                        borderColor: 'var(--bl-accent)',
                        boxShadow: '0 0 0 1px var(--bl-accent), var(--bl-shadow-md)',
                      }
                    : undefined
                }
              >
                {tier.featured && (
                  <span className="bl-tag" style={{ marginBottom: '0.75rem' }}>Most popular</span>
                )}
                <h2
                  style={{
                    fontFamily: 'var(--bl-font-display)',
                    fontSize: 'var(--bl-text-h3)',
                    fontWeight: 700,
                    color: 'var(--bl-text)',
                    margin: 0,
                  }}
                >
                  {tier.name}
                </h2>
                <div style={{ margin: '0.5rem 0' }}>
                  <span
                    style={{
                      fontFamily: 'var(--bl-font-display)',
                      fontSize: '2.25rem',
                      fontWeight: 800,
                      color: 'var(--bl-text)',
                    }}
                  >
                    {tier.price}
                  </span>
                  <span style={{ color: 'var(--bl-text-subtle)', fontSize: 'var(--bl-text-small)', marginLeft: 6 }}>
                    {tier.cadence}
                  </span>
                </div>
                <p style={{ color: 'var(--bl-text-muted)', fontSize: 'var(--bl-text-small)', lineHeight: 1.6, margin: 0 }}>
                  {tier.description}
                </p>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '1rem 0 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    fontSize: 'var(--bl-text-small)',
                    color: 'var(--bl-text-muted)',
                  }}
                >
                  {tier.features.map((f) => (
                    <li key={f} style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--bl-accent)' }} aria-hidden="true">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {tier.external ? (
                  <a href={tier.href} className="bl-btn-primary" style={{ justifyContent: 'center' }}>
                    {tier.cta}
                  </a>
                ) : (
                  <Link href={tier.href} className="bl-btn-primary" style={{ justifyContent: 'center' }}>
                    {tier.cta}
                  </Link>
                )}
              </div>
            ))}
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
            We publish signals, you decide. Evidence packs state facts and
            sources — never legal conclusions or defamation determinations.
            We do not guarantee detection completeness: engines change their
            answers constantly. Reviewed pipeline: automated capture, human
            review available on request.
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
            Not sure you need it?{' '}
            <span className="bl-grad-text">Check free first.</span>
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
            A 3-prompt probe across the four engines. Flag count and exposure
            score in about a minute. No charge, no signup wall.
          </p>
          <Link href="/scan" className="bl-btn-primary">
            Run the free exposure check
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  )
}
