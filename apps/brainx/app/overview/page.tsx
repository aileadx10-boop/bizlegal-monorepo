export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { sql } from '@/lib/neon'

const nav = [
  { href: '/overview', label: 'Overview' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/signals', label: 'Signals' },
  { href: '/competitors', label: 'Competitors' },
  { href: '/voices', label: 'Customer Voices' },
  { href: '/regulatory', label: 'Regulatory' },
]

export default async function OverviewPage() {
  let counts = { opportunities: 0, signals: 0, competitors: 0, changes: 0, voices: 0, regulatory: 0 }
  let dbOk = true
  try {
    const rows = await (sql())`
      select
        (select count(*) from opportunities) as opportunities,
        (select count(*) from signals) as signals,
        (select count(*) from competitors) as competitors,
        (select count(*) from detected_changes) as changes,
        (select count(*) from customer_voices) as voices,
        (select count(*) from regulatory_events) as regulatory
    ` as unknown as Array<typeof counts & { signals?: number }>
    const r = (rows as unknown as Array<Record<string, string>>)[0] || {}
    counts = {
      opportunities: Number(r.opportunities) || 0,
      signals: Number(r.signals) || 0,
      competitors: Number(r.competitors) || 0,
      changes: Number(r.changes) || 0,
      voices: Number(r.voices) || 0,
      regulatory: Number(r.regulatory) || 0,
    }
  } catch {
    dbOk = false
  }
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">BrainX Overview</h1>
      {!dbOk && <p className="mb-4 rounded border border-amber-400 bg-amber-50 px-3 py-2 text-sm">Neon not connected yet — showing zeros.</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Kpi label="Opportunities" value={String(counts.opportunities)} />
        <Kpi label="Signals" value={String(counts.signals)} />
        <Kpi label="Competitors" value={String(counts.competitors)} />
        <Kpi label="Customer Voices" value={String(counts.voices)} />
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

