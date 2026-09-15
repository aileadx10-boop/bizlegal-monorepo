import Link from 'next/link'

const nav = [
  { href: '/overview', label: 'Overview' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/signals', label: 'Signals' },
  { href: '/competitors', label: 'Competitors' },
  { href: '/voices', label: 'Customer Voices' },
  { href: '/regulatory', label: 'Regulatory' },
]

export default function OverviewPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">BrainX Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Kpi label="New Opportunities (24h)" value="0" />
        <Kpi label="Competitor Moves (7d)" value="0" />
        <Kpi label="Demand Spikes (7d)" value="0" />
        <Kpi label="Regulatory Events (30d)" value="0" />
      </div>
      <nav className="flex flex-wrap gap-3">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className="rounded bg-slate-900 px-3 py-2 text-white">{n.label}</Link>
        ))}
      </nav>
    </main>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}
