export const metadata = { title: 'BrainX — Opportunity' }

export default async function OpportunityDetail({ params }: { params: { id: string } }) {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-2">Opportunity {params.id}</h1>
      <div className="rounded border p-8 text-sm text-slate-400">Detail view — WHY NOW factors, evidence, voices, competitors, regulatory, recommendation.</div>
    </main>
  )
}
