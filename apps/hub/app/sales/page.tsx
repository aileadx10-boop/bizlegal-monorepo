"use client"
/**
 * /sales — Moses's sales dashboard.
 * Review drafts in 30 seconds. Approve / reject / edit + see hot replies.
 * Built 2026-07-13. Mobile-first (Moses approves from his phone).
 */
import { useEffect, useState } from "react"

type Draft = {
  id: string
  subject: string
  body: string
  status: string
  drafted_at: string
  sales_lead: { email: string; full_name?: string; company?: string; icp_score?: number; source?: string } | null
}

type PipelineData = {
  counts: Record<string, number>
  hot_replies: Array<{ id: string; body: string; received_at: string; lead_id: string }>
  recent_wins: Array<{ id: string; lead_id: string; details: any; created_at: string }>
}

export default function SalesPage() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [pipeline, setPipeline] = useState<PipelineData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState("")
  const [editSubject, setEditSubject] = useState("")
  const [token, setToken] = useState("")

  async function load() {
    setLoading(true)
    const draftRes = await fetch(`/api/sales/drafts?status=drafted&limit=20&token=${encodeURIComponent(token)}`)
    const draftData = await draftRes.json()
    setDrafts(draftData.drafts || [])
    const pipeRes = await fetch(`/api/sales/pipeline?token=${encodeURIComponent(token)}`)
    const pipeData = await pipeRes.json()
    setPipeline(pipeData)
    setLoading(false)
  }

  async function act(id: string, action: "approve" | "reject" | "edit", body?: string, subject?: string) {
    const res = await fetch(`/api/sales/drafts?token=${encodeURIComponent(token)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, edited_body: body, edited_subject: subject }),
    })
    const data = await res.json()
    if (!res.ok) alert(`Error: ${data.error || "unknown"}`)
    await load()
  }

  useEffect(() => {
    if (token) load()
  }, [token])

  if (!token) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="max-w-sm w-full bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sales</h1>
          <p className="text-sm text-gray-600 mb-4">Moses's sales dashboard. Review and approve drafts.</p>
          <input
            type="password"
            placeholder="OPS token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </main>
    )
  }

  if (loading) {
    return <main className="p-8 text-center text-gray-500">Loading...</main>
  }

  const c = pipeline?.counts || {}

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Salesperson agent</h1>
        <p className="text-sm text-gray-600 mt-1">Moses-approved only. Async-only. {c.sent_today}/{c.cap_per_day} sent today. {c.drafts_pending} draft(s) awaiting your review.</p>
      </header>

      {/* Pipeline counters */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries({ new: "New leads", qualifying: "Qualifying", replied: "Replied", meeting: "Meeting", won: "Won", lost: "Lost", unsubscribed: "Unsub" }).map(([k, label]) => (
          <div key={k} className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-xs text-gray-500 uppercase">{label}</div>
            <div className="text-2xl font-bold text-gray-900">{c[k] || 0}</div>
          </div>
        ))}
      </section>

      {/* Hot replies (escalated) */}
      {pipeline && pipeline.hot_replies.length > 0 && (
        <section className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <h2 className="text-lg font-semibold text-orange-900 mb-2">🔥 Hot replies (last 24h)</h2>
          {pipeline.hot_replies.map((r) => (
            <div key={r.id} className="bg-white rounded p-3 mb-2 text-sm">
              <div className="text-gray-700">{r.body}</div>
              <div className="text-xs text-gray-500 mt-1">{new Date(r.received_at).toLocaleString()}</div>
            </div>
          ))}
        </section>
      )}

      {/* Drafts queue */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Drafts awaiting your review ({drafts.length})</h2>
        {drafts.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center text-gray-500">
            No drafts pending. The agent is idle. Next intake runs at 06:00 UTC.
          </div>
        ) : (
          drafts.map((d) => (
            <div key={d.id} className="bg-white rounded-xl shadow-sm p-4 mb-3 border border-gray-200">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="text-sm text-gray-500">to: <span className="font-mono text-gray-700">{d.sales_lead?.email}</span></div>
                  <div className="text-xs text-gray-500">
                    {d.sales_lead?.full_name && `${d.sales_lead.full_name} · `}
                    {d.sales_lead?.company && `${d.sales_lead.company} · `}
                    ICP {d.sales_lead?.icp_score || "?"} · source: {d.sales_lead?.source || "?"}
                  </div>
                </div>
              </div>

              {editingId === d.id ? (
                <div className="space-y-2">
                  <input
                    className="w-full px-2 py-1 border rounded text-sm"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                  />
                  <textarea
                    className="w-full px-2 py-1 border rounded text-sm h-40"
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => act(d.id, "approve", editBody, editSubject)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Save + Approve</button>
                    <button onClick={() => act(d.id, "edit", editBody, editSubject)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Save only</button>
                    <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="font-semibold text-gray-900 mb-1">{d.subject}</div>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans bg-gray-50 p-3 rounded">{d.body}</pre>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => act(d.id, "approve")} className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium">Approve + Send</button>
                    <button onClick={() => { setEditingId(d.id); setEditBody(d.body); setEditSubject(d.subject) }} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Edit</button>
                    <button onClick={() => act(d.id, "reject")} className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm">Reject</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </section>

      {/* Recent wins */}
      {pipeline && pipeline.recent_wins.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent wins</h2>
          {pipeline.recent_wins.map((w) => (
            <div key={w.id} className="bg-green-50 border border-green-200 rounded p-3 mb-2 text-sm">
              <span className="font-medium">{w.details?.product || "close"}</span> — {new Date(w.created_at).toLocaleString()}
            </div>
          ))}
        </section>
      )}
    </main>
  )
}
