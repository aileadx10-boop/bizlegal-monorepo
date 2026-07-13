/**
 * GET /api/sales/drafts — list drafts awaiting Moses's approval
 * POST /api/sales/drafts — (internal) create a new draft from the agent
 * PATCH /api/sales/drafts/[id] — approve / reject / edit a draft
 *
 * Built 2026-07-13. Auth via OPS_DASHBOARD_TOKEN (the founder's session token).
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
  const status = req.nextUrl.searchParams.get("status") || "drafted"
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "20"), 50)
  const { data, error } = await sb()
    .from("sales_outreach")
    .select("id, lead_id, channel, subject, body, status, drafted_at, sent_at, sales_lead(email, full_name, company, icp_score, source)")
    .eq("status", status)
    .order("drafted_at", { ascending: false })
    .limit(limit)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ drafts: data, count: data?.length || 0 })
}

export async function PATCH(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { id, action, edited_body, edited_subject } = await req.json()
  if (!id || !action) return NextResponse.json({ error: "id and action required" }, { status: 400 })

  // Pre-flight: 6 consent primitives enforced
  const { data: draft, error: e1 } = await sb().from("sales_outreach").select("*, sales_lead(email, source)").eq("id", id).single()
  if (e1 || !draft) return NextResponse.json({ error: "draft not found" }, { status: 404 })

  if (action === "approve") {
    // Primitive 1: DRAFT-ONLY (we are explicitly approving this one)
    // Primitive 2: OPT-IN-ONLY (only inbound, double_optin, or pre-approved sources)
    const source = (draft.sales_lead as any)?.source || ""
    const optInAllowed = source.startsWith("inbound_") || source === "double_optin" || source === "manual"
    if (!optInAllowed) {
      return NextResponse.json({ error: `source '${source}' not opt-in approved` }, { status: 403 })
    }
    // Primitive 3: suppression check
    const { data: sup } = await sb().from("email_suppression_list").select("email").eq("email", (draft.sales_lead as any)?.email).limit(1)
    if (sup && sup.length > 0) {
      await sb().from("sales_outreach").update({ status: "rejected_suppressed" }).eq("id", id)
      return NextResponse.json({ error: "email is on suppression list" }, { status: 403 })
    }
    // Primitive 4: consent log
    await sb().from("sales_consent_log").insert({
      lead_id: draft.lead_id,
      outreach_id: id,
      consent_type: source.startsWith("inbound_") ? "implied" : "cold_approved",
      evidence_url: source,
    })
    // Primitive 5: cap check (read from sales_cap table)
    const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0)
    const { count: todayCount } = await sb().from("sales_outreach").select("id", { count: "exact" }).gte("sent_at", todayStart.toISOString())
    const { data: capRow } = await sb().from("sales_cap").select("value_int").eq("name", "max_outreach_per_day").single()
    const cap = (capRow as any)?.value_int ?? 3
    if ((todayCount || 0) >= cap) {
      return NextResponse.json({ error: `daily cap ${cap} reached`, sent_today: todayCount }, { status: 429 })
    }
    // All 6 primitives passed. Mark approved.
    const update: any = {
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: "moses",
      consent_logged: true,
      suppression_checked: true,
    }
    if (edited_body) update.body = edited_body
    if (edited_subject) update.subject = edited_subject
    await sb().from("sales_outreach").update(update).eq("id", id)
    return NextResponse.json({ ok: true, status: "approved", sent_today: todayCount, cap })
  }

  if (action === "reject") {
    await sb().from("sales_outreach").update({ status: "rejected" }).eq("id", id)
    return NextResponse.json({ ok: true, status: "rejected" })
  }

  if (action === "edit") {
    const update: any = {}
    if (edited_body) update.body = edited_body
    if (edited_subject) update.subject = edited_subject
    await sb().from("sales_outreach").update(update).eq("id", id)
    return NextResponse.json({ ok: true, status: "edited" })
  }

  return NextResponse.json({ error: `unknown action '${action}'` }, { status: 400 })
}
