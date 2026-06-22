import type { Metadata } from 'next'
import Link from 'next/link'
import { PricingTierCard, type PricingTierData } from '../../components/ui-v2/PricingTierCard'
import { PolicyRefreshForm } from './PolicyRefreshForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Privacy Policy Auto-Refresh — BizLegal AI',
  description:
    'Daily redline of your privacy policy against GDPR / CCPA / CPRA / Quebec Law 25 / Colorado / Connecticut / Texas DPSA. Free first audit. $29/mo monitoring.',
  alternates: { canonical: 'https://bizlegal-ai.com/agents/policy-refresh' },
}

function url(name: string): string | undefined {
  const v = (process.env as Record<string, string | undefined>)[name]
  return v && v.length > 4 ? v : undefined
}

const MONITORING_TIER: PricingTierData = {
  name: 'Monitoring',
  badge: 'Most popular',
  description:
    'Daily Sonnet semantic-diff of your policy vs the 7 frameworks. Email alert the day a framework amendment or your policy edit creates a new finding. Cancel anytime.',
  prices: {
    monthly: { amount: 29, currency: 'USD' },
    yearly: { amount: 290, currency: 'USD', saveLabel: 'save 2 mo' },
  },
  features: [
    'Daily 7-framework redline',
    'Material-change email alerts (new HIGH findings only)',
    'Suggested replacement language per finding',
    'Audit history dashboard',
    'Cancel anytime',
  ],
  checkoutUrls: {
    monthly: {
      crypto: url('NEXT_PUBLIC_NOWPAYMENTS_POLICY_REFRESH_URL'),
      card: url('NEXT_PUBLIC_PAYPAL_POLICY_REFRESH_URL'),
    },
  },
  highlighted: true,
}

export default function PolicyRefreshPage() {
  const appLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Policy Auto-Refresh",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description":
      "Auto-refresh your privacy policy + terms when regulations change. Tracks 50+ jurisdictions.",
    "url": "https://bizlegal-ai.com/agents/policy-refresh",
    "image": "https://bizlegal-ai.com/og/policy-refresh.png",
    "offers": { "@type": "Offer", "price": "49", "priceCurrency": "USD",
      "category": "monthly", "url": "https://bizlegal-ai.com/agents/policy-refresh" },
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
      { "@type": "ListItem", "position": 3, "name": "Policy Auto-Refresh", "item": "https://bizlegal-ai.com/agents/policy-refresh" },
    ],
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <section
        className="bl-hero-bg"
        style={{
          paddingTop: 'clamp(4rem, 2rem + 4vw, 6rem)',
          paddingBottom: 'clamp(2rem, 1.5rem + 2vw, 3rem)',
        }}
      >
        <div className="bl-container" style={{ maxWidth: 880 }}>
          <span className="bl-tag" style={{ marginBottom: '1rem' }}>
            7 frameworks · GDPR · CCPA · CPRA · Q-Law25 · CO · CT · TX
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
            Stop publishing a <span className="bl-grad-text">stale privacy policy.</span>
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
            Most B2B SaaS privacy policies are 6-24 months stale. Enforcement actions cite{' '}
            <em>&ldquo;policy did not reflect current data flows&rdquo;</em> verbatim. Paste your policy URL and
            we&apos;ll redline it against 7 frameworks (GDPR, CCPA, CPRA, Quebec Law 25, Colorado, Connecticut, Texas
            DPSA) — flagging missing notices, stale opt-outs, and obsolete retention language. Free first audit.
          </p>
        </div>
      </section>

      <section className="bl-section" style={{ paddingTop: 'clamp(2rem, 1rem + 2vw, 3rem)' }}>
        <div className="bl-container" style={{ maxWidth: 720 }}>
          <PolicyRefreshForm />
        </div>
      </section>

      <section
        className="bl-section"
        style={{ background: 'var(--bl-bg-low)', borderTop: '1px solid var(--bl-divider)' }}
      >
        <div className="bl-container" style={{ maxWidth: 720 }}>
          <span className="bl-label" style={{ color: 'var(--bl-accent)' }}>— Beyond the free audit</span>
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
            Don&apos;t go stale again.
          </h2>
          <p style={{ color: 'var(--bl-text-muted)', lineHeight: 1.6, margin: '0 0 1.75rem' }}>
            The free audit shows 3 of N findings. The $29/mo tier delivers the full redline daily, with suggested
            replacement language per finding and email alerts only when a NEW high-severity finding appears (no
            cosmetic-edit alert noise).
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'clamp(1rem, 0.75rem + 1vw, 1.5rem)',
              alignItems: 'stretch',
            }}
          >
            <PricingTierCard {...MONITORING_TIER} defaultInterval="monthly" />
          </div>
        </div>
      </section>

      <section className="bl-section">
        <div className="bl-container-narrow" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--bl-text-muted)', lineHeight: 1.6 }}>
            Curious which framework you&apos;ve missed?{' '}
            <Link href="/regulations" style={{ color: 'var(--bl-accent)' }}>
              Read our 7-framework explainer
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
