export const metadata = { title: 'BrainX — Opportunities' }

export default function OpportunitiesPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-2">Opportunities</h1>
      <p className="text-slate-500 mb-4">Evidence-first opportunities ranked by score. No evidence, no opportunity.</p>
      <div className="rounded border p-8 text-sm text-slate-400">No opportunities scored yet.</div>
    </main>
  )
}
