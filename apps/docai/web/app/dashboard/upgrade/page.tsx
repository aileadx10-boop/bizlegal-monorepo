import { getSession, getUserProfile } from '../../../lib/auth'

export const dynamic = 'force-dynamic'

const CONDUCTOR_START = 'https://bizlegal-ai.com/api/payments/conductor/start'

interface PlanCard {
  tier: 'solo' | 'team' | 'firm'
  name: string
  amountCents: number
  priceLabel: string
  blurb: string
  features: string[]
  accent: string
}

const PLANS: PlanCard[] = [
  {
    tier: 'solo',
    name: 'Solo',
    amountCents: 9900,
    priceLabel: '$99/mo',
    blurb: 'For solo founders + small ops teams.',
    features: ['10 scans / month', '5 AI drafts', 'All 4 verticals', '1 CLE course'],
    accent: '#6b7280',
  },
  {
    tier: 'team',
    name: 'Team',
    amountCents: 25000,
    priceLabel: '$250/mo · per seat',
    blurb: 'For B2B SaaS + revops teams running compliance daily.',
    features: ['50 scans / seat / month', '50 AI drafts', 'Attorney review queue', '3 CLE courses'],
    accent: '#2563eb',
  },
  {
    tier: 'firm',
    name: 'Firm',
    amountCents: 99900,
    priceLabel: '$999/mo',
    blurb: 'For compliance teams + general counsel.',
    features: ['Unlimited scans + drafts', 'Custom firm knowledge base', 'API access', 'Unlimited CLE + attorney review'],
    accent: '#7c3aed',
  },
]

// Routes through the dedicated hub endpoint, which derives the price
// server-side from the product registry (the client can't tamper the amount)
// and 303-redirects to the gateway checkout.
function checkoutUrl(plan: PlanCard, email: string, gateway: 'crypto' | 'card'): string {
  const params = new URLSearchParams({
    tier: plan.tier,
    interval: 'monthly',
    gateway,
    email,
  })
  return `${CONDUCTOR_START}?${params.toString()}`
}

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const session = await getSession()
  if (!session) return null

  const profile = await getUserProfile(session.user.id)
  const currentTier = profile?.tier ?? 'solo'
  const checkoutError = searchParams?.error

  return (
    <div style={{ maxWidth: 1080 }}>
      <h1 style={{ fontFamily: 'var(--bl-font-display, Fraunces, serif)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Upgrade your plan
      </h1>
      <p style={{ color: 'var(--bl-text-muted, #888)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
        You are currently on the <strong style={{ textTransform: 'uppercase' }}>{currentTier}</strong> tier. Your tier upgrades the
        moment payment confirms (and again at next sign-in as a fallback). Crypto activates instantly.
      </p>

      {checkoutError && (
        <div style={{
          marginBottom: '1.5rem', padding: '0.75rem 1rem', borderRadius: 8,
          background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.85rem',
        }}>
          Checkout couldn&rsquo;t start ({checkoutError}). If you chose card and recurring billing isn&rsquo;t enabled yet,
          try crypto or contact support.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {PLANS.map((plan) => {
          const isCurrent = plan.tier === currentTier
          return (
            <div
              key={plan.tier}
              style={{
                border: `1px solid ${isCurrent ? plan.accent : 'var(--bl-border, #e2e2e2)'}`,
                borderRadius: 12,
                padding: '1.5rem',
                background: 'var(--bl-surface, #fff)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isCurrent ? `0 0 0 1px ${plan.accent}` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--bl-font-display, Fraunces, serif)', fontSize: '1.2rem', fontWeight: 700 }}>
                  {plan.name}
                </span>
                <span style={{
                  padding: '0.15rem 0.55rem', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff', background: plan.accent,
                }}>
                  {plan.tier}
                </span>
              </div>

              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{plan.priceLabel}</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--bl-text-muted, #888)', margin: '0 0 1rem' }}>{plan.blurb}</p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', flex: 1 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ fontSize: '0.85rem', padding: '0.3rem 0', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: plan.accent }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <span style={{
                  textAlign: 'center', padding: '0.65rem', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
                  background: 'var(--bl-bg-low, #f1f1f1)', color: 'var(--bl-text-muted, #888)',
                }}>
                  Current plan
                </span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <a
                    href={checkoutUrl(plan, session.user.email, 'crypto')}
                    style={{
                      textAlign: 'center', padding: '0.65rem', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600,
                      background: plan.accent, color: '#fff', textDecoration: 'none',
                    }}
                  >
                    Pay with crypto
                  </a>
                  <a
                    href={checkoutUrl(plan, session.user.email, 'card')}
                    style={{
                      textAlign: 'center', padding: '0.55rem', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
                      background: 'transparent', color: plan.accent, textDecoration: 'none',
                      border: `1px solid ${plan.accent}`,
                    }}
                  >
                    Pay with card
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p style={{ marginTop: '2rem', fontSize: '0.78rem', color: 'var(--bl-text-muted, #aaa)' }}>
        Crypto checkout activates instantly. Recurring card billing routes through PayPal; if a plan shows
        &ldquo;coming soon,&rdquo; use crypto or contact us. Prices in USD.
      </p>
    </div>
  )
}
