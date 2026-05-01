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

export default function AiActPage() {
  return (
    <>
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
