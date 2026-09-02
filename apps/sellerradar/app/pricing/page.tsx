import type { Metadata } from 'next'
import Link from 'next/link'
import { TIER_PRICES_USD } from '../../lib/tiers'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pricing — SellerRadar Amazon Fee-Change Monitoring',
  description:
    '$49 one-time audit: full per-SKU impact breakdown of the latest Amazon fee change on your catalog. $99/mo monitor: weekly re-scans when schedules update, alert email with your personal impact.',
  alternates: { canonical: 'https://sellerradar.bizlegal-ai.com/pricing' },
}

/**
 * Fleet checkout pattern: pricing links go to the hub apex checkout
 * (bizlegal-ai.com/checkout), which resolves the amount server-side from
 * apps/hub/lib/payments/price-map.ts (product `sellerradar`). The `amount`
 * param here is a display hint only — it is never charged.
 */
function apexCheckout(
  tier: string,
  interval: 'one-time' | 'monthly',
  amountCents: number,
  name: string,
): string {
  const params = new URLSearchParams({
    product: 'sellerradar',
    tier,
    interval,
    amount: String(amountCents),
    name,
  })
  return `https://bizlegal-ai.com/checkout?${params.toString()}`
}

const TIERS = [
  {
    name: 'Free impact check',
    price: '$0',
    cadence: 'top-line only',
    description: 'See what the latest fee change costs your whole catalog — before you spend a dollar.',
    features: [
      'CSV upload with flexible header mapping',
      'Catalog-level dollar impact (monthly + annual)',
      'Affected SKU count + margin delta',
      'Upgrade to per-SKU detail anytime',
    ],
    cta: 'Run the free check',
    href: '/analyze',
    external: false,
    featured: false,
  },
  {
    name: 'SellerRadar Audit',
    price: `$${TIER_PRICES_USD.audit}`,
    cadence: 'one-time',
    description: 'The full per-SKU breakdown — built for the moment you reprice or renegotiate.',
    features: [
      'Per-SKU impact: referral, FBA fulfillment, storage',
      'Before/after margin per SKU with size-tier attribution',
      'Fee schedule citations (source URL + effective date)',
      'Email delivery + permanent report link',
    ],
    cta: 'Order the audit — $49',
    href: apexCheckout('audit', 'one-time', TIER_PRICES_USD.audit * 100, 'SellerRadar Audit (one-time)'),
    external: true,
    featured: true,
  },
  {
    name: 'SellerRadar Monitor',
    price: `$${TIER_PRICES_USD.monitor}`,
    cadence: 'per month',
    description: 'Amazon changes fees on a schedule. Never learn about it from your accountant again.',
    features: [
      'Everything in the Audit',
      'Weekly re-scan of your catalog when schedules update',
      'Alert email with YOUR personal dollar impact',
      'Monitor dashboard + change history',
    ],
    cta: 'Start monitoring — $99/mo',
    href: apexCheckout('monitor', 'monthly', TIER_PRICES_USD.monitor * 100, 'SellerRadar Monitor (monthly)'),
    external: true,
    featured: false,
  },
]

export default function SellerRadarPricingPage() {
  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SellerRadar',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Amazon fee-change impact monitoring: per-SKU dollar impact of referral, FBA fulfillment, and storage fee changes. $49 one-time audit, $99/mo monitor.',
    url: 'https://sellerradar.bizlegal-ai.com/pricing',
    offers: [
      { '@type': 'Offer', name: 'SellerRadar Audit', price: String(TIER_PRICES_USD.audit), priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'SellerRadar Monitor', price: String(TIER_PRICES_USD.monitor), priceCurrency: 'USD' },
    ],
    brand: { '@type': 'Brand', name: 'SellerRadar' },
    provider: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'SellerRadar', item: 'https://sellerradar.bizlegal-ai.com' },
      { '@type': 'ListItem', position: 3, name: 'Pricing', item: 'https://sellerradar.bizlegal-ai.com/pricing' },
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
            Amazon fee-change impact — audit once or watch weekly
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
            Fee changes, priced on{' '}
            <span className="bl-grad-text">your catalog.</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem)',
              color: 'var(--bl-text-muted)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Free top-line check first. $49 for the full per-SKU impact report.
            $99/mo to re-scan weekly when schedules update and get alerted with
            your personal dollar impact. Card via PayPal, crypto via
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
            Impact figures are estimates computed from published Amazon fee
            schedules and your uploaded unit economics — verify against your
            settlement reports. No financial, tax, or repricing advice. No
            savings guaranteed.
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
            Not sure the fee change hit you?{' '}
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
            Upload your catalog CSV and see the catalog-level dollar impact in
            seconds. No charge, no signup wall, no Amazon API credentials.
          </p>
          <Link href="/analyze" className="bl-btn-primary">
            Run the free impact check
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  )
}
