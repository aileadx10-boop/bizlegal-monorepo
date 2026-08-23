import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckoutButton } from './checkout-button'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Bench pricing: Diagnostic Audit $2,500 one-time · Managed Evaluation Program $5,000/month · Dedicated Intelligence from $12,500/month. Measurement services, not legal advice.',
  alternates: { canonical: '/pricing' },
}

interface Tier {
  readonly name: string
  readonly price: string
  readonly cadence: string
  readonly productId: 'bench_audit_2500' | 'bench_managed_monthly' | null
  readonly blurb: string
  readonly includes: readonly string[]
  readonly forWho: string
}

const TIERS: readonly Tier[] = [
  {
    name: 'Diagnostic Audit',
    price: '$2,500',
    cadence: 'one-time',
    productId: 'bench_audit_2500',
    blurb:
      'A structured measurement of one system, one jurisdiction, one practice area. The fastest way to know your number.',
    includes: [
      '25–30 evaluations against a versioned benchmark',
      'Full measurement report: accuracy, hallucination rate, critical errors, citation reliability, missing-law rate',
      'Error taxonomy with severity classification',
      'Gold-standard corrections for every failed item',
      'Prioritized remediation memo',
      'Typical turnaround: 3 business days',
    ],
    forWho: 'Legal-AI vendors before a sales cycle · firms evaluating a tool · diligence',
  },
  {
    name: 'Managed Evaluation Program',
    price: '$5,000',
    cadence: 'per month',
    productId: 'bench_managed_monthly',
    blurb:
      'Continuous measurement for a system that ships. Accuracy tracked release over release, with corrections flowing back to your team.',
    includes: [
      '100–150 evaluations per month, AI-prescored with expert verification sampling',
      'Continuous accuracy tracking against pinned benchmark versions',
      'Monthly trend report + regression flags',
      'Gold-standard corrections and remediation guidance each cycle',
      'Expedited turnaround available',
    ],
    forWho: 'Scaling legal-AI products · compliance software with AI components',
  },
  {
    name: 'Dedicated Intelligence',
    price: 'from $12,500',
    cadence: 'per month · scoped',
    productId: null,
    blurb:
      'A custom evaluation program: your rubric extensions, multi-jurisdiction coverage, quarterly benchmark reports, competitive positioning.',
    includes: [
      'Custom evaluation rubric and item development',
      'Multi-jurisdiction coverage (EU · UK · UAE, extensible)',
      'Dedicated expert pod with named credential classes',
      'Quarterly benchmark and competitive-intelligence reports',
      'Scoped and contracted individually',
    ],
    forWho: 'Enterprise legal-tech · AI labs · BigLaw innovation teams',
  },
]

export default function PricingPage() {
  return (
    <section className="section section--flush">
      <div className="shell" style={{ paddingTop: 'var(--space-section)' }}>
        <p className="eyebrow">Pricing</p>
        <h1 className="title">Flat fees for measurement.</h1>
        <p className="lede" style={{ marginBottom: '3rem' }}>
          You are buying intelligence — a defensible score, the corrections, and
          the fix list — not hours. Expert time is our production
          infrastructure, priced into the measurement.
        </p>

        <div style={{ display: 'grid', gap: '2rem' }}>
          {TIERS.map((tier) => (
            <article key={tier.name} className="readout" style={{ boxShadow: tier.productId === 'bench_audit_2500' ? '6px 6px 0 var(--accent)' : undefined }}>
              <div className="split" style={{ gap: '2rem' }}>
                <div>
                  <p className="readout__title"><span>{tier.forWho}</span></p>
                  <h2 className="heading" style={{ marginBottom: '0.4rem' }}>{tier.name}</h2>
                  <p style={{ margin: '0 0 1rem' }}>
                    <span className="mono" style={{ fontSize: '2rem', fontWeight: 650, letterSpacing: '-0.02em' }}>{tier.price}</span>{' '}
                    <span className="faint small">{tier.cadence}</span>
                  </p>
                  <p className="prose small" style={{ margin: 0 }}>{tier.blurb}</p>
                  <div style={{ marginTop: '1.5rem' }}>
                    {tier.productId ? (
                      <CheckoutButton productId={tier.productId} label={`Start — ${tier.price}`} />
                    ) : (
                      <Link href="/audit/request" className="btn">Scope with us</Link>
                    )}
                  </div>
                </div>
                <ul className="small" style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--ink-soft)', lineHeight: 1.9 }}>
                  {tier.includes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <p className="footnote" style={{ marginTop: '2.5rem' }}>
          Payments are processed by BizLegal AI&apos;s payment infrastructure
          (card or crypto). All engagements run under the{' '}
          <Link href="/legal/terms" style={{ borderBottom: '1px solid var(--rule)' }}>service terms</Link>{' '}
          and <Link href="/legal/dpa" style={{ borderBottom: '1px solid var(--rule)' }}>data-processing addendum</Link>.
          Bench provides measurement and benchmarking services only — not legal
          advice. Prices exclude VAT where applicable.
        </p>
      </div>
    </section>
  )
}
