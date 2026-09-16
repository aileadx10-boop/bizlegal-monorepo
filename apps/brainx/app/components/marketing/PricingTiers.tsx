import CheckoutButton from './CheckoutButton'

interface Tier {
  readonly tier: 'radar' | 'radar_build'
  readonly tag: string
  readonly name: string
  readonly monthly: number
  readonly yearly: number
  readonly features: readonly string[]
  readonly highlight?: boolean
}

const TIERS: readonly Tier[] = [
  {
    tier: 'radar',
    tag: 'Solo · Small firm',
    name: 'Radar',
    monthly: 99,
    yearly: 999,
    features: [
      'Weekly evidence-first opportunity radar',
      '3 verticals: real estate, legal & compliance, AI/fintech regulation',
      'Evidence vault on every opportunity (≥3 verified sources)',
      'BrainX Decision Score v1, all seven factors',
      'Up to 5 radar profiles',
      '2 BUILD THIS briefs / month',
    ],
  },
  {
    tier: 'radar_build',
    tag: 'Practice / boutique',
    name: 'Radar + Build',
    monthly: 249,
    yearly: 2499,
    highlight: true,
    features: [
      'Everything in Radar',
      'Unlimited BUILD THIS briefs',
      'Written async expert review of each brief by Moses Dor, Adv. (capped 4/mo, within 5 business days — no calls)',
      'Priority ordering of radar profiles',
    ],
  },
]

export default function PricingTiers({ interval }: { interval: 'monthly' | 'yearly' }): JSX.Element {
  return (
    <div className="bx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
      {TIERS.map((t) => {
        const price = interval === 'monthly' ? t.monthly : t.yearly
        return (
          <div key={t.tier} className={t.highlight ? 'bx-card bx-card--accent' : 'bx-card'}>
            <span className="bx-eyebrow">{t.tag}</span>
            <h3 className="bx-h3" style={{ marginTop: 6, marginBottom: 10 }}>{t.name}</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 18 }}>
              <span className="bx-mono" style={{ fontSize: 36, fontWeight: 700 }}>${price}</span>
              <span className="bx-muted" style={{ fontSize: 13 }}>/ {interval === 'monthly' ? 'mo' : 'yr'}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {t.features.map((f) => (
                <li key={f} style={{ fontSize: 13.5, color: 'var(--bl-text-muted)', display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--bl-accent)' }}>·</span>{f}
                </li>
              ))}
            </ul>
            <CheckoutButton tier={t.tier} interval={interval} label={`Start ${t.name}`} />
          </div>
        )
      })}
    </div>
  )
}
