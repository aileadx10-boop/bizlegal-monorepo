import type { Metadata } from 'next'
import Link from 'next/link'
import { PricingTierCard, type PricingTierData } from '../../components/ui-v2/PricingTierCard'
import { BoiSubscribeForm } from './BoiSubscribeForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'CTA-2024 BOI Tracker — BizLegal AI',
  description:
    'Daily monitoring of FinCEN BOI rule changes + 30-day refile deadline alerts for your US LLC. $29/mo solo, $99/mo firm pack (up to 50 entities).',
  alternates: { canonical: 'https://bizlegal-ai.com/agents/boi-tracker' },
}

function url(name: string): string | undefined {
  const v = (process.env as Record<string, string | undefined>)[name]
  return v && v.length > 4 ? v : undefined
}

const SOLO_TIER: PricingTierData = {
  name: 'Solo',
  description: 'Track 1 US entity. FinCEN guidance + 30-day refile deadline alerts. Cancel anytime.',
  prices: {
    monthly: { amount: 29, currency: 'USD' },
    yearly: { amount: 290, currency: 'USD', saveLabel: 'save 2 mo' },
  },
  features: [
    '1 entity tracked',
    'Daily FinCEN guidance monitor',
    '30-day refile deadline alerts',
    'Resend email notifications',
    'Cancel anytime',
  ],
  excludes: ['Multi-entity dashboard', 'API access'],
  checkoutUrls: {
    monthly: {
      crypto: url('NEXT_PUBLIC_NOWPAYMENTS_BOI_SOLO_MONTHLY_URL'),
      card: url('NEXT_PUBLIC_PAYPAL_BOI_SOLO_MONTHLY_URL'),
    },
    yearly: {
      crypto: url('NEXT_PUBLIC_NOWPAYMENTS_BOI_SOLO_YEARLY_URL'),
      card: url('NEXT_PUBLIC_PAYPAL_BOI_SOLO_YEARLY_URL'),
    },
  },
}

const FIRM_TIER: PricingTierData = {
  name: 'Firm',
  badge: 'Most popular',
  description: 'For accountants + corporate-counsel handling 10-50 entities. One dashboard, one email, one bill.',
  prices: {
    monthly: { amount: 99, currency: 'USD' },
    yearly: { amount: 990, currency: 'USD', saveLabel: 'save 2 mo' },
  },
  features: [
    'Up to 50 entities',
    'Everything in Solo',
    'Multi-entity dashboard',
    'Bulk add via CSV',
    'Priority support',
    'API access (1k calls/mo)',
  ],
  checkoutUrls: {
    monthly: {
      crypto: url('NEXT_PUBLIC_NOWPAYMENTS_BOI_FIRM_MONTHLY_URL'),
      card: url('NEXT_PUBLIC_PAYPAL_BOI_FIRM_MONTHLY_URL'),
    },
    yearly: {
      crypto: url('NEXT_PUBLIC_NOWPAYMENTS_BOI_FIRM_YEARLY_URL'),
      card: url('NEXT_PUBLIC_PAYPAL_BOI_FIRM_YEARLY_URL'),
    },
  },
  highlighted: true,
}

export default function BoiTrackerPage() {
  const appLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CTA-2024 BOI Tracker",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description":
      "Daily monitoring of FinCEN BOI rule changes + 30-day refile deadline alerts for your US LLC.",
    "url": "https://bizlegal-ai.com/agents/boi-tracker",
    "image": "https://bizlegal-ai.com/og/boi-tracker.png",
    "offers": [
      { "@type": "Offer", "name": "Solo", "price": "29", "priceCurrency": "USD",
        "category": "subscription", "url": "https://bizlegal-ai.com/agents/boi-tracker" },
      { "@type": "Offer", "name": "Firm", "price": "99", "priceCurrency": "USD",
        "category": "subscription", "url": "https://bizlegal-ai.com/agents/boi-tracker" },
    ],
    "brand": { "@type": "Brand", "name": "BizLegal AI" },
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
      { "@type": "ListItem", "position": 2, "name": "Agents", "item": "https://bizlegal-ai.com/agents" },
      { "@type": "ListItem", "position": 3, "name": "BOI Tracker", "item": "https://bizlegal-ai.com/agents/boi-tracker" },
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
            CTA-2024 · FinCEN · 32M LLCs covered
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
            Never miss a <span className="bl-grad-text">BOI deadline.</span>
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
            The Corporate Transparency Act keeps moving. We watch FinCEN every day and email you the moment the rule
            changes for your entity type — or when your 30-day refile window opens. Penalty for missed filings is up
            to $500/day capped at $10,000. Don&apos;t leave it to your tax software.
          </p>
        </div>
      </section>

      <section
        style={{
          padding: 'clamp(1.5rem, 1rem + 1vw, 2.5rem) 0',
          background: 'linear-gradient(135deg, var(--bl-surface) 0%, color-mix(in oklab, var(--bl-accent) 8%, var(--bl-surface)) 100%)',
          borderTop: '1px solid color-mix(in oklab, var(--bl-accent) 25%, var(--bl-border))',
          borderBottom: '1px solid color-mix(in oklab, var(--bl-accent) 25%, var(--bl-border))',
        }}
      >
        <div className="bl-container" style={{ maxWidth: 880 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
            }}
          >
            <div style={{ flex: '1 1 320px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  background: 'color-mix(in oklab, var(--bl-success) 18%, transparent)',
                  color: 'var(--bl-success)',
                  border: '1px solid color-mix(in oklab, var(--bl-success) 35%, transparent)',
                  borderRadius: 'var(--bl-radius-pill)',
                  fontFamily: 'var(--bl-font-mono)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                7-day free trial · no card
              </span>
              <h2
                style={{
                  fontFamily: 'var(--bl-font-display)',
                  fontSize: 'clamp(1.5rem, 1.25rem + 1vw, 2rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  margin: '0 0 8px',
                  color: 'var(--bl-text)',
                }}
              >
                Track 1 entity free for 7 days.
              </h2>
              <p style={{ color: 'var(--bl-text-muted)', margin: 0, lineHeight: 1.55, fontSize: '0.95rem' }}>
                Email gate only. We start the FinCEN monitor immediately, send a 30-day refile reminder if your
                window is upcoming, and email a renewal nudge on day 8 — no auto-charge, no card on file.
              </p>
            </div>
            <div style={{ flex: '0 1 280px' }}>
              <BoiSubscribeForm
                tier="trial"
                submitLabel="Start free trial"
                helperText="No card. Cancel by ignoring the day-8 email."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bl-section" style={{ paddingTop: 'clamp(2rem, 1rem + 2vw, 3rem)' }}>
        <div className="bl-container" style={{ maxWidth: 1100 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'clamp(1rem, 0.75rem + 1vw, 1.5rem)',
              alignItems: 'stretch',
            }}
          >
            <PricingTierCard {...SOLO_TIER} defaultInterval="monthly" />
            <PricingTierCard {...FIRM_TIER} defaultInterval="monthly" />
          </div>
        </div>
      </section>

      <section
        className="bl-section"
        style={{ background: 'var(--bl-bg-low)', borderTop: '1px solid var(--bl-divider)' }}
      >
        <div className="bl-container" style={{ maxWidth: 720 }}>
          <span className="bl-label" style={{ color: 'var(--bl-accent)' }}>— Already paid?</span>
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
            Add an entity to your tracker.
          </h2>
          <p style={{ color: 'var(--bl-text-muted)', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
            Tell us the legal name + filing date and we&apos;ll start watching FinCEN guidance for you tomorrow at
            14:00 UTC. Full firm pack subscribers can add up to 50 entities — reply to your welcome email with the
            list.
          </p>
          <BoiSubscribeForm />
        </div>
      </section>

      <section className="bl-section">
        <div className="bl-container-narrow" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--bl-text-muted)', lineHeight: 1.6 }}>
            Curious about the rule itself?{' '}
            <Link href="/regulations" style={{ color: 'var(--bl-accent)' }}>
              Read our CTA-2024 explainer
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
