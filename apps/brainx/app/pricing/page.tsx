export const metadata = { title: 'BrainX — Pricing' }

const tiers = [
  {
    name: 'Opportunity Radar',
    price: '$99/mo',
    yearly: '$999/yr',
    tag: 'Solo · Small firm',
    features: ['Evidence-first opportunity alerts', 'Weekly Gmail digest', 'Customer-voice + competitor + regulatory feeds', 'BUILD THIS bundles (up to 2/mo)'],
  },
  {
    name: 'Radar + Reports',
    price: '$249/mo',
    yearly: '$2,499/yr',
    tag: 'Practice / boutique',
    features: ['Everything in Radar', 'Custom verticals (up to 5)', 'Practice-revenue cross-scan', 'Named human reviewer on high-stakes offers (Moses Dor, Adv.)', 'BUILD THIS bundles (unlimited)'],
    highlight: true,
  },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">BrainX — Evidence-first Opportunity Intelligence</h1>
        <p className="text-slate-300 mb-8">No outcome guarantees. No fabricated evidence. You see where money, pain, and regulatory complexity intersect — and what to sell.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {tiers.map((t) => (
            <div key={t.name} className={`rounded-2xl border p-6 ${t.highlight ? 'border-amber-300 bg-slate-900' : 'border-slate-700 bg-slate-900/50'}`}>
              <div className="text-xs uppercase tracking-wider text-amber-300">{t.tag}</div>
              <h2 className="text-xl font-semibold mt-1">{t.name}</h2>
              <div className="text-3xl font-bold mt-3">{t.price}<span className="text-sm text-slate-400 font-normal"> / {t.yearly}</span></div>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {t.features.map((f) => <li key={f}>• {f}</li>)}
              </ul>
              <a href="https://bizlegal-ai.com/api/pay/start" className="mt-6 inline-block rounded bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900">Get started</a>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
