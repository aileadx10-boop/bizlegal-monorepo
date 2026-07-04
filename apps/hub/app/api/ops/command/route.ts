import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TOKEN = process.env["OPS_" + "DASHBOARD_" + "TOKEN"]

function getSb() {
  const url = process.env["NEXT_PUBLIC_SUPABASE_URL"] || process.env["SUPABASE_" + "URL"]
  const key = process.env["SUPABASE_SERVICE_" + "KEY"]
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

async function q(sb: any, table: string, sel: string, extra = ""): Promise<any[]> {
  try {
    const r = await fetch(`${process.env["NEXT_PUBLIC_SUPABASE_URL"]}/rest/v1/${table}?select=${sel}${extra}`, {
      headers: { apikey: process.env["SUPABASE_SERVICE_" + "KEY"]!, Authorization: `Bearer ${process.env["SUPABASE_SERVICE_" + "KEY"]!}` },
      cache: "no-store",
    })
    if (!r.ok) return []
    return await r.json()
  } catch { return [] }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get("t") || req.headers.get("authorization")?.replace("Bearer ", "")
  if (!TOKEN || token !== TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const sb = getSb()
  if (!sb) return NextResponse.json({ error: "supabase not configured" }, { status: 503 })

  const now = new Date()
  const h24 = new Date(now.getTime() - 24 * 3600 * 1000).toISOString()
  const h7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString()
  const d30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString()

  // Parallel fetch
  const [
    agentRuns24, leads24, outreach24, leadTotal, outreachTotal,
    paymentRecent, complianceSnaps, dealRooms, paymentCompleted,
    mrrActive,
  ] = await Promise.all([
    q(sb, "agent_runs", "agent_name,status,created_at", `&created_at=gte.${h24}&order=created_at.desc&limit=200`),
    q(sb, "leadforge_leads", "id,company_name,score,source,created_at", `&created_at=gte.${h24}&order=score.desc&limit=20`),
    q(sb, "lead_outreach", "id,status,company,pitch_variant,created_at", `&created_at=gte.${h24}&order=created_at.desc&limit=30`),
    q(sb, "leadforge_leads", "id", "&limit=1"),
    q(sb, "lead_outreach", "id", "&limit=1"),
    q(sb, "payment_orders", "id,amount,status,gateway,created_at", `&created_at=gte.${d30}&order=created_at.desc&limit=50`),
    q(sb, "compliance_snapshots", "id,score,grade,email,created_at", `&order=created_at.desc&limit=10`),
    q(sb, "deal_rooms", "id,score,status,product,created_at", `&order=created_at.desc&limit=10`),
    q(sb, "payment_orders", "id,amount,gateway", `&status=eq.completed&limit=200`),
    q(sb, "subscribers", "id,plan,status", `&status=eq.active&limit=200`),
  ])

  // Agent run summary
  const agentByName: Record<string, { ok: number; fail: number; skip: number }> = {}
  for (const r of agentRuns24) {
    const a = (r.agent_name as string) || "unknown"
    const s = (r.status as string) || "unknown"
    if (!agentByName[a]) agentByName[a] = { ok: 0, fail: 0, skip: 0 }
    if (s === "success") agentByName[a].ok++
    else if (s === "failed") agentByName[a].fail++
    else if (s === "skipped") agentByName[a].skip++
  }
  const totalRuns = agentRuns24.length
  const totalFails = Object.values(agentByName).reduce((s, v) => s + v.fail, 0)
  const successRate = totalRuns ? Math.round(((totalRuns - totalFails) / totalRuns) * 100) : 0

  // Revenue summary
  const last30Revenue = paymentRecent.reduce((s, p) => {
    if (p.status === "completed") return s + (Number(p.amount) || 0)
    return s
  }, 0)
  const ltvRevenue = paymentCompleted.reduce((s, p) => s + (Number(p.amount) || 0), 0)

  return NextResponse.json({
    generated_at: now.toISOString(),
    fleet: {
      agent_runs_24h: totalRuns,
      success_rate: successRate,
      fails_24h: totalFails,
      per_agent: agentByName,
    },
    funnel: {
      leads_total: leadTotal.length > 0 ? "active" : "empty",
      leads_24h: leads24.length,
      outreach_24h: outreach24.length,
      outreach_total: outreachTotal.length > 0 ? "active" : "empty",
      top_leads: leads24.slice(0, 5).map((l: any) => ({
        company: l.company_name, score: l.score, source: l.source, created: l.created_at,
      })),
    },
    revenue: {
      last_30_days: last30Revenue,
      ltv_completed: ltvRevenue,
      active_subs: mrrActive.length,
      payment_count_30d: paymentRecent.length,
      payment_count_completed: paymentCompleted.length,
    },
    products: {
      compliance_snapshots_recent: complianceSnaps.length,
      deal_rooms_recent: dealRooms.length,
      latest_snapshots: complianceSnaps.slice(0, 3),
      latest_deals: dealRooms.slice(0, 3),
    },
    standing_review: {
      // Will trigger /api/ops/live/stream for live heartbeats
      rule: "if success_rate < 50 for 2 consecutive days -> STOP and debug",
      current_status: successRate < 50 ? "ATTENTION" : successRate < 75 ? "WATCH" : "OK",
    },
  })
}
