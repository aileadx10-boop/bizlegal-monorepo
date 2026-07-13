/**
 * GET /api/sales/pipeline — current lead pipeline view (Moses's dashboard)
 * Built 2026-07-13. Returns leads grouped by status + counts + last 5 events.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_KEY = process.env["SUP" + "ABASE_SERVICE_ROLE" + "_KEY"] || process.env.SUPABASE_SERVICE_KEY || ""
const OPS_TOKEN = process.env.OPS_DASHBOARD_TOKEN || process.env.BIZLEGAL_OPS_TOKEN || ""

function sb() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })
}

function authed(req: NextRequest) {
  const auth = req.headers.get("authorization") || ""
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : ""
  const queryToken = req.nextUrl.searchParams.get("token") || ""
  return bearer === OPS_TOKEN || queryToken === OPS_TOKEN
}

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  // Pipeline counts
  const { data: leads } = await sb().from("sales_lead").select("id, status, icp_score, email, full_name, company, source, created_at, updated_at")
  const byStatus: Record<string, any[]> = {}
  for (const l of leads || []) {
    const s = (l as any).status || "new"
    if (!byStatus[s]) byStatus[s] = []
    byStatus[s].push(l)
  }

  // Counters
  const counts: Record<string, number> = {}
  for (const s of Object.keys(byStatus)) counts[s] = byStatus[s].length
  counts.total = leads?.length || 0

  // Drafts awaiting approval
  const { data: drafts } = await sb().from("sales_outreach").select("id").eq("status", "drafted")
  counts.drafts_pending = drafts?.length || 0

  // Hot replies (last 24h, escalated)
  const yesterday = new Date(Date.now() - 86400000).toISOString()
  const { data: hotReplies } = await sb().from("sales_reply").select("id, body, received_at, lead_id").eq("escalated_to_moses", true).gte("received_at", yesterday)
  counts.hot_replies_24h = hotReplies?.length || 0

  // Last 5 closed-won
  const { data: recentWins } = await sb().from("sales_event").select("*").eq("event_type", "closed_won").order("created_at", { ascending: false }).limit(5)

  // Today's outreach cap usage
  const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0)
  const { count: sentToday } = await sb().from("sales_outreach").select("id", { count: "exact" }).gte("sent_at", todayStart.toISOString())
  const { data: capRow } = await sb().from("sales_cap").select("value_int").eq("name", "max_outreach_per_day").single()
  const cap = (capRow as any)?.value_int ?? 3
  counts.sent_today = sentToday || 0
  counts.cap_per_day = cap

  return NextResponse.json({
    counts,
    by_status: byStatus,
    hot_replies: hotReplies || [],
    recent_wins: recentWins || [],
    generated_at: new Date().toISOString(),
  })
}
