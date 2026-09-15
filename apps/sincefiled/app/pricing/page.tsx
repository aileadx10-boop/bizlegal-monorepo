import { startSinceFiledCheckout } from '@/lib/checkout'

export default function PricingPage() {
  async function buy(productId: string) {
    const email = window.prompt('Firm email (demo or live checkout)')
    if (!email || !email.includes('@')) return
    const res = await startSinceFiledCheckout({ productId, email, gateway: 'card' })
    if (res.ok && res.checkout_url) {
      window.location.href = res.checkout_url
    } else {
      alert(`Checkout unavailable: ${res.error ?? 'unknown'}`)
    }
  }
  const plans = [
    { id: 'sf_firm_49', name: 'Firm — $49/mo', desc: 'Unlimited obligations, team seats, email logging, predictions.' },
    { id: 'sf_lifetime_329', name: 'Lifetime — $329 once', desc: 'Firm plan, forever. Refuge from subscriptions.' },
    { id: 'sf_pack_us_19', name: 'US Rhythm Pack — $19', desc: 'PDF tracker + renewal calendar + CLE sheet.' },
    { id: 'sf_pack_both_29', name: 'US + Dubai Pack — $29', desc: 'Combined rhythm packs.' },
  ]
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 680, margin: '3rem auto', padding: '0 1rem' }}>
      <h1>SinceFiled pricing</h1>
      <p>Days since, predicted due, no guilt. Estimates — verify against jurisdiction rules.</p>
      {plans.map((p) => (
        <div key={p.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', marginBottom: '0.75rem' }}>
          <strong>{p.name}</strong><br />
          <span style={{ fontSize: '0.9rem', color: '#555' }}>{p.desc}</span><br />
          <button onClick={() => buy(p.id)} style={{ marginTop: '0.5rem' }}>Choose {p.name}</button>
        </div>
      ))}
      <p style={{ fontSize: '0.8rem', color: '#888' }}>Not legal advice. No outcome guarantees.</p>
    </main>
  )
}
