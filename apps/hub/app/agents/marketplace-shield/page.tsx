import type { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Marketplace Compliance Shield — Stripe Connect 1099-K + State NEXUS Monitor',
  description:
    'For SaaS marketplaces, gig platforms, and creator-economy tools. Monitor 1099-K cliff crossings ($600 threshold), state NEXUS exposure, and KYB drift on connected accounts. $49/mo. Decision-support, not tax advice.',
  alternates: { canonical: 'https://bizlegal-ai.com/agents/marketplace-shield' },
}

const FEATURES: ReadonlyArray<string> = [
  '1099-K threshold monitor per connected account (the $600 cliff hits at year-end)',
  'State NEXUS exposure scorecard — track where each connected seller has crossed economic-nexus thresholds',
  'KYB drift alerts: sanctions and PEP refresh against the OFAC + UN + EU lists weekly',
  'Stripe Connect webhook ingest (configurable; bring your own event stream)',
  'Quarterly platform-liability brief (CDA §230 in US, DSA in EU)',
  'Email alerts on every material change · cancel anytime',
]

const FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'Is this tax advice?',
    a: 'No. We surface the data signals — threshold crossings, NEXUS triggers, KYB drift — that tell you when to bring in your CPA or counsel. We do not file your 1099-Ks, do not register you for state sales tax, and do not give jurisdiction-specific legal opinion. The output is decision-support.',
  },
  {
    q: 'Which platforms are supported?',
    a: 'Anything that emits Stripe Connect webhooks today. Native ingest for the Stripe Connect API; you can also forward events from Lemon Squeezy, Paddle, or a homegrown ledger to our ingest endpoint. Reach out for non-Stripe integrations.',
  },
  {
    q: 'What happens at the $600 1099-K cliff?',
    a: 'The IRS lowered the third-party payment-processor reporting threshold to $600 (from $20K + 200 transactions) starting tax year 2025. Once a connected account crosses that, Stripe is required to issue them a 1099-K and you may need to provide platform-side documentation. We alert you the day they cross.',
  },
  {
    q: 'How long does setup take?',
    a: 'Under 10 minutes if you already have a Stripe Connect account. We give you a webhook URL + an API key. You paste them into Stripe. We start ingesting events immediately and surface a baseline report within 24 hours.',
  },
]

const CHECKOUT_URL =
  'https://bizlegal-ai.com/checkout?product=agent_marketplace_shield&tier=Marketplace+Compliance+Shield&interval=monthly&amount=4900&name=Marketplace+Compliance+Shield'

export default function MarketplaceShieldPage() {
  return (
    <>
      <section className="bl-hero-bg" style={{ paddingTop: 'clamp(4rem, 2rem + 4vw, 6rem)', paddingBottom: 'clamp(2rem, 1.5rem + 2vw, 3rem)' }}>
        <div className="bl-container" style={{ maxWidth: 880 }}>
          <span className="bl-tag" style={{ marginBottom: '1rem' }}>
            Stripe Connect · 1099-K · State NEXUS · KYB
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
            Your marketplace just crossed <span className="bl-grad-text">a tax cliff</span> — and the seller doesn't know yet.
          </h1>
          <p style={{ fontSize: 'clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem)', color: 'var(--bl-text-muted)', lineHeight: 1.6, margin: 0, maxWidth: 720 }}>
            The 1099-K threshold dropped from $20K to $600. State NEXUS rules keep tightening. KYB on connected accounts drifts the moment they get listed on OFAC. Marketplace Compliance Shield watches all three for you, every day, for $49/mo.
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
            What you get
          </h2>
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

      <section className="bl-section" style={{ background: 'var(--bl-accent-soft)' }}>
        <div className="bl-container-narrow" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--bl-font-display)', fontSize: 'var(--bl-text-h2)', fontWeight: 800, margin: '0 0 1rem', letterSpacing: '-0.025em' }}>
            Get monitored today.
          </h2>
          <p style={{ fontSize: 'var(--bl-text-body)', color: 'var(--bl-text-muted)', lineHeight: 1.6, margin: 0, marginBottom: '2rem' }}>
            $49/mo. Cancel anytime. First baseline report in 24 hours.
          </p>
          <Link href={CHECKOUT_URL} className="bl-btn-primary">Subscribe — $49/mo →</Link>
          <p style={{ marginTop: '2rem', fontSize: 11, color: 'var(--bl-text-subtle)', fontFamily: 'var(--bl-font-mono)', letterSpacing: '0.04em' }}>
            Decision-support, not tax advice. Consult a CPA before filing.
          </p>
        </div>
      </section>
    </>
  )
}
