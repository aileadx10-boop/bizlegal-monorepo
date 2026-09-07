"use client"
/**
 * Campaigns panel on /sales — the per-campaign approval gate (rule 7 v2).
 * Every number shown is a count from a table (see /api/sales/campaigns).
 * Approve = the campaign may send within its caps once OUTBOUND_AUTOSEND=1;
 * Pause stops the dispatch cron for that campaign on its next tick.
 */
import { useEffect, useState } from "react"

interface Campaign {
  id: string
  name: string
  status: string
  product_id: string | null
  jurisdictions: string[] | null
  lawful_basis: string | null
  daily_cap: number | null
  mailboxes: number | null
  sender_campaign_ref: string | null
  sender_domain: string | null
  approved_by: string | null
  approved_at: string | null
  paused_reason: string | null
  template_a: string | null
  counts: { drafted: number; sent_today: number; sent: number; replied: number; bounced: number; verified_leads: number }
}

interface CampaignsResponse {
  campaigns: Campaign[]
  autosend: boolean
  sender_domain: string | null
}

export default function CampaignsPanel({ token }: { token: string }) {
  const [data, setData] = useState<CampaignsResponse | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [refInputs, setRefInputs] = useState<Record<string, string>>({})
  const [openTemplate, setOpenTemplate] = useState<string | null>(null)

  async function load() {
    const res = await fetch(`/api/sales/campaigns?token=${encodeURIComponent(token)}`)
    if (res.ok) setData((await res.json()) as CampaignsResponse)
  }

  async function act(id: string, action: "approve" | "pause" | "resume" | "archive") {
    setBusy(id)
    const res = await fetch(`/api/sales/campaigns?token=${encodeURIComponent(token)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, sender_campaign_ref: refInputs[id] || undefined }),
    })
    const d = (await res.json().catch(() => ({}))) as { error?: string; note?: string }
    if (!res.ok) alert(`Error: ${d.error || "unknown"}`)
    else if (d.note) alert(d.note)
    setBusy(null)
    await load()
  }

  useEffect(() => {
    if (token) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  if (!data) return null

  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Outbound campaigns ({data.campaigns.length})</h2>
      <p className="text-xs text-gray-600 mb-3">
        Autosend switch: <span className={data.autosend ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>{data.autosend ? "ON" : "OFF — nothing sends"}</span>
        {" · "}sender domain: <span className="font-mono">{data.sender_domain || "not set"}</span>
        {" · "}approve = may send within caps; every count below is read from tables.
      </p>
      {data.campaigns.length === 0 ? (
        <div className="bg-white rounded-xl p-4 text-sm text-gray-500">No campaigns filed. The sourcing routine or a session files a draft here.</div>
      ) : (
        data.campaigns.map((c) => (
          <div key={c.id} className="bg-white rounded-xl shadow-sm p-4 mb-3 border border-gray-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-gray-900">{c.name}</div>
                <div className="text-xs text-gray-500">
                  {c.status.toUpperCase()} · {(c.jurisdictions || []).join(",")} · {c.lawful_basis} · cap {c.daily_cap}/mailbox × {c.mailboxes} · sells {c.product_id || "—"}
                  {c.approved_by ? ` · approved by ${c.approved_by} ${c.approved_at ? new Date(c.approved_at).toLocaleDateString() : ""}` : ""}
                  {c.paused_reason ? ` · paused: ${c.paused_reason}` : ""}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 my-3">
              {Object.entries({ verified_leads: "Verified leads", drafted: "Drafted", sent_today: "Sent today", sent: "Sent", replied: "Replied", bounced: "Bounced" }).map(([k, label]) => (
                <div key={k} className="bg-gray-50 rounded p-2">
                  <div className="text-[10px] text-gray-500 uppercase">{label}</div>
                  <div className="text-lg font-bold text-gray-900">{c.counts[k as keyof Campaign["counts"]]}</div>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-600 mb-2">
              Provider campaign ref: <span className="font-mono">{c.sender_campaign_ref || "not set"}</span>
              {!c.sender_campaign_ref && (
                <input
                  className="ml-2 px-2 py-1 border rounded text-xs font-mono"
                  placeholder="Instantly campaign id"
                  value={refInputs[c.id] || ""}
                  onChange={(e) => setRefInputs({ ...refInputs, [c.id]: e.target.value })}
                />
              )}
            </div>
            <button onClick={() => setOpenTemplate(openTemplate === c.id ? null : c.id)} className="text-xs text-blue-700 underline mb-2">
              {openTemplate === c.id ? "Hide template A" : "Show template A"}
            </button>
            {openTemplate === c.id && <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans bg-gray-50 p-3 rounded mb-2">{c.template_a || "(no template)"}</pre>}
            <div className="flex gap-2 flex-wrap">
              {(c.status === "draft" || c.status === "approved") && (
                <button disabled={busy === c.id} onClick={() => act(c.id, "approve")} className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium">
                  Approve — may send within caps
                </button>
              )}
              {c.status === "running" && (
                <button disabled={busy === c.id} onClick={() => act(c.id, "pause")} className="px-4 py-1.5 bg-yellow-500 text-white rounded-lg text-sm font-medium">
                  Pause
                </button>
              )}
              {c.status === "paused" && (
                <button disabled={busy === c.id} onClick={() => act(c.id, "resume")} className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium">
                  Resume
                </button>
              )}
              {c.status !== "archived" && (
                <button disabled={busy === c.id} onClick={() => act(c.id, "archive")} className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm">
                  Archive
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </section>
  )
}
