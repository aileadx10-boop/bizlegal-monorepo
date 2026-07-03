import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Force Node.js runtime (not edge) so the Supabase service-role client works
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type DocType = "privacy_policy" | "vendor_contract" | "tos"

type Flag = {
  severity: "high" | "medium" | "low"
  title: string
  detail: string
}

type Snapshot = {
  score: number
  grade: "A" | "B" | "C" | "D" | "F"
  flags: Flag[]
  recommended_fix: string
  next_step: string
  frameworks_checked: string[]
}

const FRAMEWORKS_BY_TYPE: Record<DocType, string[]> = {
  privacy_policy: ["GDPR Art. 13/14", "CCPA", "DPDP"],
  vendor_contract: ["Indemnity", "Liability cap", "Data residency", "Termination", "Auto-renewal"],
  tos: ["Limitation of liability", "Dispute resolution", "IP assignment", "Auto-renewal"],
}

const SYSTEM_PROMPT = `You are a senior compliance analyst. Given a document and its type, produce a Compliance Health Snapshot.

Return STRICT JSON in this exact shape:
{
  "score": <integer 0-100, higher is healthier>,
  "grade": "A" | "B" | "C" | "D" | "F",
  "flags": [
    {"severity": "high"|"medium"|"low", "title": "<=8 words", "detail": "<=2 sentences, specific to the doc>"},
    {"severity": "high"|"medium"|"low", "title": "<=8 words", "detail": "<=2 sentences>"},
    {"severity": "high"|"medium"|"low", "title": "<=8 words", "detail": "<=2 sentences>"}
  ],
  "recommended_fix": "<one specific action the user can take today, <=30 words>",
  "next_step": "<the natural next step toward our $40K custom build OR $99/mo LexAudit, <=20 words>"
}

Be ruthless. If the document is missing GDPR-required disclosures, that is a HIGH flag. If it has unbounded liability, that is HIGH. No hedging.`

function getSupabase() {
  const url = process.env["NEXT_PUBLIC_SUPABASE_URL"] || process.env["SUPABASE_" + "URL"]
  const key = process.env["SUPABASE_SERVICE_" + "KEY"]
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

async function generateSnapshot(doc: string, docType: DocType, anthropicKey: string): Promise<Snapshot> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-05",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Document type: ${docType}\n\nDocument (truncated to 6000 chars):\n\n${doc.slice(0, 6000)}`,
        },
      ],
    }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Anthropic ${res.status}: ${t.slice(0, 200)}`)
  }
  const j = await res.json()
  const text: string = j?.content?.[0]?.text || ""
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error("Could not parse snapshot JSON from model")
  const parsed = JSON.parse(match[0])
  const score = Math.max(0, Math.min(100, Number(parsed.score) || 50))
  const grade = (["A", "B", "C", "D", "F"] as const).includes(parsed.grade)
    ? parsed.grade
    : score >= 80 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F"
  const flags: Flag[] = Array.isArray(parsed.flags) ? parsed.flags.slice(0, 3).map((f: any) => ({
    severity: (["high", "medium", "low"] as const).includes(f?.severity) ? f.severity : "medium",
    title: String(f?.title || "Unspecified risk").slice(0, 120),
    detail: String(f?.detail || "").slice(0, 600),
  })) : []
  return {
    score,
    grade,
    flags,
    recommended_fix: String(parsed.recommended_fix || "").slice(0, 300),
    next_step: String(parsed.next_step || "").slice(0, 200),
    frameworks_checked: FRAMEWORKS_BY_TYPE[docType],
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const doc = String(body?.doc || "").trim()
    const docType: DocType = (["privacy_policy", "vendor_contract", "tos"] as const).includes(body?.doc_type)
      ? body.doc_type
      : "privacy_policy"
    const email = String(body?.email || "").trim().toLowerCase()

    if (doc.length < 200) {
      return NextResponse.json({ error: "Document too short (min 200 chars)" }, { status: 400 })
    }
    if (doc.length > 30000) {
      return NextResponse.json({ error: "Document too long (max 30000 chars)" }, { status: 400 })
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      return NextResponse.json({ error: "Snapshot service not configured" }, { status: 503 })
    }

    const snapshot = await generateSnapshot(doc, docType, anthropicKey)

    // Persist a row for analytics + the email followup funnel.
    // We DO NOT store the document itself (privacy-by-default).
    const sb = getSupabase()
    if (sb && email) {
      sb.from("compliance_snapshots").insert({
        email,
        doc_type: docType,
        score: snapshot.score,
        grade: snapshot.grade,
        flags: snapshot.flags,
        recommended_fix: snapshot.recommended_fix,
        created_at: new Date().toISOString(),
      }).then(() => null, () => null) // fire-and-forget; never break the user flow
    }

    return NextResponse.json(snapshot)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Snapshot failed" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    name: "Compliance Health Snapshot",
    price_one_time: 9,
    price_monthly: 19,
    doc_types: ["privacy_policy", "vendor_contract", "tos"],
    latency_seconds: 60,
  })
}
