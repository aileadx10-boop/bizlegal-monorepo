import { startCasePageCheckout } from '@/lib/checkout'

export default function PricingPage() {
  async function buy(productId: string) {
    const email = window.prompt('Firm email (demo or live checkout)')
    if (!email || !email.includes('@')) return
    const res = await startCasePageCheckout({ productId, email, gateway: 'card' })
    if (res.ok && res.checkout_url) window.location.href = res.checkout_url
    else alert(`Checkout unavailable: ${res.error ?? 'unknown'}`)
  }
  const plans = [
    { id: 'cp_solo_49', name: 'Solo — $49/mo', desc: '10 pages, standard themes, milestone widget.' },
    { id: 'cp_firm_149', name: 'Firm — $149/mo', desc: 'Unlimited pages, white-label, AI summaries, audio.' },
    { id: 'cp_setup_490', name: 'Setup — $490 once', desc: 'Template pack + branding + widget install.' },
    { id: 'cp_setup_490_lifetime', name: 'Lifetime Firm — $290 once (demo uses setup SKU)', desc: 'Firm plan forever.' },
  ]
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 680, margin: '3rem auto', padding: '0 1rem' }}>
      <h1>CasePage pricing</h1>
      <p>Beautiful client-facing matter pages for law firms.</p>
      {plans.map((p) => (
        <div key={p.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', marginBottom: '0.75rem' }}>
          <strong>{p.name}</strong><br />
          <span style={{ fontSize: '0.9rem', color: '#555' }}>{p.desc}</span><br />
          <button onClick={() => buy(p.id)} style={{ marginTop: '0.5rem' }}>Choose {p.name}</button>
        </div>
      ))}
      <p style={{ fontSize: '0.8rem', color: '#888' }}>Decision support — not legal advice. No outcome guarantees.</p>
    </main>
  )
}
