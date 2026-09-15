'use client'
import { useState } from 'react'

export default function PricingPage() {
  const [email, setEmail] = useState('')

  const checkout = async (productId: string, gateway: 'card' | 'crypto') => {
    if (!email) { alert('Enter your email first'); return }
    const res = await fetch('/api/pay/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ product_id: productId, user_email: email, gateway, source: 'brainx-pricing' }),
    })
    const json = await res.json()
    if (json.ok && json.checkout_url) {
      window.location.href = json.checkout_url
    } else {
      alert(`Checkout unavailable: ${json.error || 'unknown'}`)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">BrainX — Evidence-first Opportunity Intelligence</h1>
        <p className="text-slate-300 mb-8">No outcome guarantees. No fabricated evidence. You see where money, pain, and regulatory complexity intersect — and what to sell.</p>
        <input
          className="mb-8 w-full max-w-md rounded border border-slate-600 bg-slate-900 px-4 py-3 text-white"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="grid md:grid-cols-2 gap-6">
          <Tier
            name="Opportunity Radar"
            price="$99/mo"
            yearly="$999/yr"
            tag="Solo · Small firm"
            features={['Evidence-first opportunity alerts', 'Weekly Gmail digest', 'Customer-voice + competitor + regulatory feeds', 'BUILD THIS bundles (up to 2/mo)']}
            onBuy={() => checkout('brainx_opportunity_radar_monthly', 'card')}
          />
          <Tier
            name="Radar + Reports"
            price="$249/mo"
            yearly="$2,499/yr"
            tag="Practice / boutique"
            features={['Everything in Radar', 'Custom verticals (up to 5)', 'Practice-revenue cross-scan', 'Named human reviewer on high-stakes offers (Moses Dor, Adv.)', 'BUILD THIS bundles (unlimited)']}
            onBuy={() => checkout('brainx_opportunity_radar_yearly', 'card')}
            highlight
          />
        </div>
      </div>
    </main>
  )
}

function Tier({ name, price, yearly, tag, features, onBuy, highlight }: { name: string; price: string; yearly: string; tag: string; features: string[]; onBuy: () => void; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 ${highlight ? 'border-amber-300 bg-slate-900' : 'border-slate-700 bg-slate-900/50'}`}>
      <div className="text-xs uppercase tracking-wider text-amber-300">{tag}</div>
      <h2 className="text-xl font-semibold mt-1">{name}</h2>
      <div className="text-3xl font-bold mt-3">{price}<span className="text-sm text-slate-400 font-normal"> / {yearly}</span></div>
      <ul className="mt-4 space-y-2 text-sm text-slate-300">
        {features.map((f) => <li key={f}>• {f}</li>)}
      </ul>
      <button onClick={onBuy} className="mt-6 inline-block rounded bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900">Get started</button>
    </div>
  )
}
