import Link from 'next/link'

const PLANS = [
  {
    name: 'Solo Shield',
    price: '$14.99',
    period: '/mo',
    yearly: '$129/yr',
    productId: 'coguard_solo_monthly',
    description: 'For individuals managing co-parenting communication on their own.',
    features: [
      'Up to 100 messages/month logged',
      'BIFF neutralization on every draft',
      'SHA-256 cryptographic log',
      'Court binder generator (PDF)',
      'Basic attorney portal access',
      '7-day free trial',
    ],
    cta: 'Start free trial',
    highlight: false,
  },
  {
    name: 'Litigation',
    price: '$29.99',
    period: '/mo',
    yearly: '$249/yr',
    productId: 'coguard_litigation_monthly',
    description: 'For active custody litigation with unlimited logging and attorney tools.',
    features: [
      'Unlimited messages/month',
      'Priority BIFF processing',
      'SHA-256 cryptographic log',
      'Court binder with full Bates numbering',
      'Full attorney portal with timeline',
      'Multi-thread (track multiple issues)',
      '7-day free trial',
    ],
    cta: 'Start free trial',
    highlight: true,
  },
]

export default function PricingPage() {
  return (
    <main style={{ padding: 'clamp(3rem, 6vw, 6rem) 1.5rem' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
          Simple, transparent pricing
        </h1>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '3rem', fontSize: 16 }}>
          Break-even: 7 subscribers. Everything is self-serve. Cancel anytime.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{
              border: plan.highlight ? '2px solid #111827' : '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 28,
              position: 'relative',
            }}>
              {plan.highlight && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#111827', color: '#fff', borderRadius: 9999, padding: '4px 14px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  BEST FOR ACTIVE CASES
                </div>
              )}
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>{plan.name}</h2>
              <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 20px' }}>{plan.description}</p>

              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 36, fontWeight: 800 }}>{plan.price}</span>
                <span style={{ color: '#6b7280', fontSize: 15 }}>{plan.period}</span>
                <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>or {plan.yearly} (save 2 months)</div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: '#374151' }}>
                    <span style={{ color: '#059669', fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/api/payments/nowpayments/start?product_id=${plan.productId}`}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: plan.highlight ? '#111827' : '#f3f4f6',
                  color: plan.highlight ? '#fff' : '#111827',
                  padding: '12px 20px',
                  borderRadius: 8,
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: 15,
                }}
              >
                {plan.cta} →
              </Link>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, padding: 24, background: '#f9fafb', borderRadius: 12, fontSize: 14, color: '#6b7280', lineHeight: 1.65 }}>
          <strong style={{ color: '#374151' }}>Communication drafting tool — not legal advice.</strong> CoGuard helps you communicate professionally and documents your communication history. It is not a law firm, does not provide legal advice, and does not create an attorney-client relationship. Always consult a licensed attorney in your jurisdiction about your specific legal situation.
        </div>
      </div>
    </main>
  )
}
