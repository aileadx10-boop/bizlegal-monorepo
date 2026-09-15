import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">BrainX</h1>
        <p className="text-slate-300 text-lg mb-8">The BizLegal intelligence OS. Evidence-first opportunities for legal, real-estate, and AI-fintech compliance. No fabricated quotes. No invented URLs. <strong>No evidence, no opportunity.</strong></p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/pricing" className="rounded bg-amber-300 px-6 py-3 font-semibold text-slate-900">See pricing</Link>
          <Link href="/overview" className="rounded border border-slate-600 px-6 py-3 text-white">Dashboard</Link>
        </div>
        <p className="mt-10 text-xs text-slate-500">BrainX connects market demand, customer pain, competitor moves, and regulatory events into buildable products — ready for the next payment rail.</p>
      </div>
    </main>
  )
}
