"use client"
import { useState, useTransition } from "react"

type Flag = { severity: "high"|"medium"|"low"; title: string; detail: string }
type Snapshot = {
  score: number; grade: "A"|"B"|"C"|"D"|"F"; flags: Flag[]
  recommended_fix: string; next_step: string
  frameworks_checked: string[]; url: string; jurisdiction: string; email: string
}

const SEVERITY_COLOR = {
  high: "bg-red-100 text-red-800 border-red-300",
  medium: "bg-amber-100 text-amber-800 border-amber-300",
  low: "bg-yellow-50 text-yellow-800 border-yellow-300",
} as const

export function RiskSnapshotClient() {
  const [url, setUrl] = useState("")
  const [email, setEmail] = useState("")
  const [jurisdiction, setJurisdiction] = useState<"US"|"EU"|"UK"|"IL"|"GLOBAL">("GLOBAL")
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [unlocked, setUnlocked] = useState(false)

  async function buy() {
    setError(null)
    if (!url.startsWith("http")) { setError("Enter a full URL (https://...)"); return }
    if (!email.includes("@")) { setError("Enter a valid email"); return }
    startTransition(async () => {
      try {
        // Pay + generate in one step. In production this would create a checkout
        // session and run generation only on webhook. For now, we run both inline
        // so the user gets the report on first payment.
        const pay = await fetch("/api/pay/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: "risk-snapshot", email, metadata: { url, jurisdiction } }),
        })
        if (!pay.ok) {
          const t = await pay.text()
          throw new Error(t || "Checkout failed")
        }
        const payData = await pay.json()
        // If checkout URL returned, redirect (or in stub mode, we get {ok:true,stub:true})
        if (payData.checkout_url) {
          window.location.href = payData.checkout_url
          return
        }
        // Stub mode: run the generation directly
        const gen = await fetch("/api/risk-snapshot/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, email, jurisdiction, order_id: payData.order_id || "stub" }),
        })
        if (!gen.ok) throw new Error(await gen.text())
        const data: Snapshot = await gen.json()
        setSnapshot(data)
        setUnlocked(true)
      } catch (e: any) { setError(e.message || "Failed") }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="max-w-3xl mx-auto px-4 pt-16 pb-8 text-center">
        <p className="text-sm font-medium text-emerald-700 mb-3">$19 ONE-TIME · 2 MINUTES · NO SUBSCRIPTION</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
          AI Compliance Risk Snapshot
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Drop your company URL. Get a <strong>60-second compliance risk report</strong> with
          3 specific flags and 1 fix you can ship this week. Same engine as our $40K builds — distilled.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-12">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8">
          <label className="block text-sm font-medium text-slate-700 mb-2">Your company URL</label>
          <input
            value={url} onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourcompany.com"
            className="w-full rounded-md border-slate-300 text-sm focus:border-slate-500 focus:ring-slate-500"
          />
          <div className="mt-3 flex gap-2 flex-wrap">
            {(["US","EU","UK","IL","GLOBAL"] as const).map((j) => (
              <button key={j} onClick={() => setJurisdiction(j)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                  jurisdiction === j ? "bg-slate-900 text-white border-slate-900" :
                  "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                }`}>{j}</button>
            ))}
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com" className="flex-1 rounded-md border-slate-300 text-sm" />
            <button onClick={buy} disabled={pending}
              className="px-6 py-2.5 rounded-md bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50">
              {pending ? "Generating..." : "Get snapshot for $19"}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      </section>

      {snapshot && (
        <section className="max-w-3xl mx-auto px-4 pb-16">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white">
              <p className="text-sm text-slate-500 mb-1">Risk score for {snapshot.url}</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-slate-900">{snapshot.score}</span>
                <span className="text-2xl font-bold text-slate-500">/100</span>
                <span className={`text-2xl font-bold ${
                  snapshot.grade === "A" || snapshot.grade === "B" ? "text-emerald-600" :
                  snapshot.grade === "C" ? "text-amber-600" : "text-red-600"
                }`}>Grade {snapshot.grade}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1 text-xs">
                {snapshot.frameworks_checked.map((f) => (
                  <span key={f} className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">{f}</span>
                ))}
              </div>
            </div>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">3 specific risk flags</h2>
              <ul className="space-y-3">
                {snapshot.flags.map((f, i) => (
                  <li key={i} className={`rounded-md border p-4 ${SEVERITY_COLOR[f.severity]}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold uppercase tracking-wide mt-0.5">{f.severity}</span>
                      <div>
                        <p className="font-semibold">{f.title}</p>
                        <p className="text-sm mt-1 opacity-90">{f.detail}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-md p-5">
                <p className="text-sm font-medium text-emerald-900">Recommended fix (this week):</p>
                <p className="text-sm text-emerald-800 mt-2">{snapshot.recommended_fix}</p>
                <p className="text-xs text-emerald-700 mt-3">Next: {snapshot.next_step}</p>
                <p className="text-xs text-emerald-700 mt-2">PDF + full report emailed to {snapshot.email}.</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
