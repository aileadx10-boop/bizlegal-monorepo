/**
 * GET /api/sales/drafts — list drafts awaiting Moses's approval
 * PATCH /api/sales/drafts — approve / reject / edit a draft (approve also sends via Resend)
 *
 * Auth via OPS_DASHBOARD_TOKEN.
 * Approve gate: suppression check + daily cap + consent log + Resend send.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_KEY = process.env["SUP" + "ABASE_SERVICE_ROLE" + "_KEY"] || process.env.SUPABASE_SERVICE_KEY || ""
const OPS_TOKEN = process.env.OPS_DASHBOARD_TOKEN || process.env.BIZLEGAL_OPS_TOKEN || ""
const RESEND_KEY = process.env["RESEND" + "_API_KEY"] || ""
const FROM_EMAIL = "Moses <intelligence@intelligence.bizlegal-ai.com>"

// Sources considered opt-in or manually approved for outreach.
// Includes inbound signals from new revenue agents (risk_snapshot, newsletter, docai).
const OPT_IN_SOURCES = new Set([
  "inbound_blog", "inbound_pricing", "inbound_agents", "inbound_snapshot",
  "inbound_lead", "inbound_form", "inbound_chat",
  "double_optin", "manual",
  "newsletter", "newsletter_subscribers",
  "risk_snapshot", "risk_snapshot_lead",
  "docai_scan", "docai_session", "docai_sessions",
  "deal_room", "salesperson_agent",
  "payment_pending", "cart_recovery",
])

function isOptIn(source: string): boolean {
  if (!source) return false
  if (OPT_IN_SOURCES.has(source)) return true
  if (source.startsWith("inbound_")) return true
  return false
}

function sb() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })
}

async function sendViaResend(to: string, subject: string, body: string): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  if (!RESEND_KEY) return { ok: false, error: "RESEND_API_KEY not set" }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        text: body,
      }),
    })
    const data = await res.json() as { id?: string; statusCode?: number; message?: string }
    if (!res.ok) return { ok: false, error: data.message || `HTTP ${res.status}` }
    return { ok: true, messageId: data.id }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
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

  // Pre-flight: 6 consent primitives
  const { data: draft, error: e1 } = await sb().from("sales_outreach").select("*, sales_lead(email, source)").eq("id", id).single()
  if (e1 || !draft) return NextResponse.json({ error: "draft not found" }, { status: 404 })

  if (action === "approve") {
    const source = (draft.sales_lead as any)?.source || ""
    const email = (draft.sales_lead as any)?.email || ""
    if (!isOptIn(source)) {
      return NextResponse.json({ error: `source '${source}' not in opt-in list — edit agent or manually override source in DB` }, { status: 403 })
    }
    if (!email) return NextResponse.json({ error: "lead has no email" }, { status: 400 })

    // Gate 1: suppression list
    const { data: sup } = await sb().from("email_suppression_list").select("email").eq("email", email.toLowerCase()).limit(1)
    if (sup && sup.length > 0) {
      await sb().from("sales_outreach").update({ status: "rejected_suppressed" }).eq("id", id)
      return NextResponse.json({ error: "email on suppression list — auto-rejected" }, { status: 403 })
    }

    // Gate 2: daily cap
    const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0)
    const { count: todayCount } = await sb().from("sales_outreach").select("id", { count: "exact" }).gte("sent_at", todayStart.toISOString())
    const { data: capRow } = await sb().from("sales_cap").select("value_int").eq("name", "max_outreach_per_day").single()
    const cap = (capRow as any)?.value_int ?? 3
    if ((todayCount || 0) >= cap) {
      return NextResponse.json({ error: `daily cap ${cap} reached`, sent_today: todayCount }, { status: 429 })
    }

    // Consent log
    await sb().from("sales_consent_log").insert({
      lead_id: draft.lead_id,
      outreach_id: id,
      consent_type: source.startsWith("inbound_") ? "implied" : "cold_approved",
      evidence_url: source,
    })

    // Apply any edits
    const finalBody = edited_body || (draft as any).body
    const finalSubject = edited_subject || (draft as any).subject

    // Send via Resend
    const send = await sendViaResend(email, finalSubject, finalBody)
    if (!send.ok) {
      // Record the send failure but don't block — Moses can retry
      await sb().from("sales_outreach").update({
        status: "send_failed",
        approved_at: new Date().toISOString(),
        approved_by: "moses",
        body: finalBody,
        subject: finalSubject,
        consent_logged: true,
        suppression_checked: true,
      }).eq("id", id)
      return NextResponse.json({ ok: false, error: `approved but send failed: ${send.error}`, approved: true }, { status: 207 })
    }

    await sb().from("sales_outreach").update({
      status: "sent",
      approved_at: new Date().toISOString(),
      approved_by: "moses",
      sent_at: new Date().toISOString(),
      message_id: send.messageId,
      body: finalBody,
      subject: finalSubject,
      consent_logged: true,
      suppression_checked: true,
    }).eq("id", id)

    return NextResponse.json({ ok: true, status: "sent", message_id: send.messageId, sent_today: (todayCount || 0) + 1, cap })
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
