"use client"
import { useEffect, useState } from "react"

type Snapshot = any

export function CommandClient({ token }: { token?: string }) {
  const [data, setData] = useState<Snapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [authorized, setAuthorized] = useState<boolean>(!!token)
  const [live, setLive] = useState<string[]>([])

  useEffect(() => {
    if (!token) return
    fetch(`/api/ops/command?t=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then((r) => r.ok ? r.json() : r.json().then((j) => { throw new Error(j.error || "failed") }))
      .then(setData).catch((e) => setError(e.message))
    const t = setInterval(() => {
      fetch(`/api/ops/command?t=${encodeURIComponent(token)}`, { cache: "no-store" })
        .then((r) => r.json()).then(setData).catch(() => {})
    }, 30000)
    return () => clearInterval(t)
  }, [token])

  // Token entry form
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <form action="" method="get" className="bg-white p-6 rounded-lg shadow-sm border max-w-sm w-full">
          <h1 className="text-lg font-semibold mb-3">Ops Command</h1>
          <p className="text-sm text-slate-500 mb-3">Enter your dashboard token.</p>
          <input name="t" type="password" placeholder="OPS_DASHBOARD_TOKEN" className="w-full rounded-md border-slate-300 text-sm" />
          <button type="submit" className="mt-3 w-full px-4 py-2 rounded-md bg-slate-900 text-white text-sm">Enter</button>
        </form>
      </div>
    )
  }

  if (error) return <div className="p-6 text-red-600">Error: {error}</div>
  if (!data) return <div className="p-6 text-slate-500">Loading...</div>

  const f = data.fleet, fn = data.funnel, r = data.revenue, p = data.products, sr = data.standing_review
  const statusColor = sr.current_status === "OK" ? "bg-emerald-100 text-emerald-800" :
    sr.current_status === "WATCH" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Ops Command</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>{sr.current_status}</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">Updated: {data.generated_at} · Auto-refresh every 30s</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Tile title="Agent runs (24h)" value={f.agent_runs_24h} sub={`${f.success_rate}% success · ${f.fails_24h} fails`} />
          <Tile title="New leads (24h)" value={fn.leads_24h} sub={`Total: ${fn.leads_total}`} />
          <Tile title="Outreach (24h)" value={fn.outreach_24h} sub={`Total: ${fn.outreach_total}`} />
          <Tile title="Revenue (30d)" value={`$${r.last_30_days.toLocaleString()}`} sub={`LTV: $${r.ltv_completed.toLocaleString()}`} />
          <Tile title="Active subs" value={r.active_subs} sub={`${r.payment_count_30d} payments 30d · ${r.payment_count_completed} lifetime`} />
          <Tile title="Compliance snapshots" value={p.compliance_snapshots_recent} sub={`Deal rooms: ${p.deal_rooms_recent}`} />
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <Card title="Per-agent last 24h">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500"><th>Agent</th><th>OK</th><th>Fail</th><th>Skip</th></tr></thead>
              <tbody>
                {Object.entries(f.per_agent as Record<string, { ok: number; fail: number; skip: number }>).sort().map(([a, v]) => (
                  <tr key={a} className="border-t"><td className="py-1.5">{a}</td><td className="text-emerald-700">{v.ok}</td><td className="text-red-700">{v.fail}</td><td className="text-slate-500">{v.skip}</td></tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card title="Top leads (24h)">
            {fn.top_leads?.length ? (
              <ul className="text-sm space-y-1">
                {fn.top_leads.map((l: any, i: number) => (
                  <li key={i} className="flex justify-between border-t py-1.5">
                    <span>{l.company || "(unknown)"}</span>
                    <span className="text-slate-500">score {l.score || "?"} · {l.source || "?"}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-500">No leads in 24h</p>}
          </Card>
          <Card title="Latest deal rooms">
            {p.latest_deals?.length ? (
              <ul className="text-sm space-y-1">
                {p.latest_deals.map((d: any, i: number) => (
                  <li key={i} className="flex justify-between border-t py-1.5">
                    <span>score {d.score} · {d.product}</span>
                    <span className="text-slate-500">{d.status}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-500">No deal rooms yet</p>}
          </Card>
          <Card title="Latest compliance snapshots">
            {p.latest_snapshots?.length ? (
              <ul className="text-sm space-y-1">
                {p.latest_snapshots.map((s: any, i: number) => (
                  <li key={i} className="flex justify-between border-t py-1.5">
                    <span>{s.email}</span>
                    <span className="text-slate-500">{s.score}/100 ({s.grade})</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-500">No snapshots yet</p>}
          </Card>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          <a href="/ops/main" className="hover:underline">/ops/main</a> · <a href="/ops/health" className="hover:underline">/ops/health</a> · <a href="/ops/snapshot" className="hover:underline">/ops/snapshot</a>
        </div>
      </div>
    </div>
  )
}

function Tile({ title, value, sub }: { title: string; value: any; sub?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}
function Card({ title, children }: { title: string; children: any }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h2 className="text-sm font-semibold text-slate-700 mb-2">{title}</h2>
      {children}
    </div>
  )
}
