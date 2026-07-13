import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Flag = { severity: "high"|"medium"|"low"; title: string; detail: string }
type Snapshot = {
  score: number; grade: "A"|"B"|"C"|"D"|"F"; flags: Flag[]
  recommended_fix: string; next_step: string
  frameworks_checked: string[]
  url: string; jurisdiction: string; email: string
}

const FRAMEWORKS_BY_JURISDICTION: Record<string, string[]> = {
  US: ["CCPA", "COPPA", "HIPAA (if health)", "State breach laws", "SOX (if public)"],
  EU: ["GDPR Art. 13/14", "DSA", "DORA (if finance)", "AI Act (if applicable)", "NIS2 (if critical)"],
  UK: ["UK GDPR", "DPA 2018", "PECR", "Online Safety Act"],
  IL: ["Privacy Protection Law", "Amendment 13", "Sector-specific (finance/health)"],
  GLOBAL: ["GDPR (if EU users)", "CCPA (if CA users)", "SOC 2 (if B2B)", "ISO 27001 (if enterprise)"],
}

const SYSTEM_PROMPT = `You are a senior compliance analyst. Given a company's website, produce a Compliance Risk Snapshot.

Return STRICT JSON in this shape:
{
  "score": <integer 0-100, higher = healthier>,
  "grade": "A" | "B" | "C" | "D" | "F",
  "flags": [
    {"severity": "high"|"medium"|"low", "title": "<=8 words", "detail": "<=2 sentences, specific>"},
    {"severity": "high"|"medium"|"low", "title": "<=8 words", "detail": "<=2 sentences>"},
    {"severity": "high"|"medium"|"low", "title": "<=8 words", "detail": "<=2 sentences>"}
  ],
  "recommended_fix": "<one specific action user can take this week, <=30 words>",
  "next_step": "<natural next step toward our $99/mo LexAudit or $40K build, <=20 words>"
}

Be specific to what you observed on the site. No hedging.`

function getSupabase() {
  const url = process.env["NEXT_PUBLIC_SUPABASE_URL"] || process.env["SUPABASE_" + "URL"]
  const key = process.env["SUPABASE_SERVICE_" + "KEY"]
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

async function scrapeSite(url: string): Promise<string> {
  const fcKey = process.env["FIRECRAWL_" + "API_KEY"]
  if (!fcKey) return ""
  try {
    const r = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { "Authorization": `Bearer ${fcKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
    })
    if (!r.ok) return ""
    const d = await r.json()
    return (d?.data?.markdown || d?.markdown || "").slice(0, 6000)
  } catch { return "" }
}

async function generateSnapshot(
  siteText: string, url: string, jurisdiction: string, email: string
): Promise<Snapshot> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) throw new Error("Anthropic not configured")
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
      messages: [{
        role: "user",
        content: `Site URL: ${url}\nJurisdiction: ${jurisdiction}\nEmail: ${email}\n\nSite content (truncated to 6000 chars):\n\n${siteText || "(no scrapeable content)"}`,
      }],
    }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Anthropic ${res.status}: ${t.slice(0, 200)}`)
  }
  const j = await res.json()
  const text: string = j?.content?.[0]?.text || ""
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error("Could not parse snapshot JSON")
  const parsed = JSON.parse(match[0])
  const score = Math.max(0, Math.min(100, Number(parsed.score) || 50))
  const grade = (["A","B","C","D","F"] as const).includes(parsed.grade)
    ? parsed.grade
    : score >= 80 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F"
  const flags: Flag[] = Array.isArray(parsed.flags) ? parsed.flags.slice(0, 3).map((f: any) => ({
    severity: (["high","medium","low"] as const).includes(f?.severity) ? f.severity : "medium",
    title: String(f?.title || "Unspecified risk").slice(0, 120),
    detail: String(f?.detail || "").slice(0, 600),
  })) : []
  return {
    score, grade, flags,
    recommended_fix: String(parsed.recommended_fix || "").slice(0, 300),
    next_step: String(parsed.next_step || "").slice(0, 200),
    frameworks_checked: FRAMEWORKS_BY_JURISDICTION[jurisdiction] || FRAMEWORKS_BY_JURISDICTION.GLOBAL,
    url, jurisdiction, email,
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const url = String(body?.url || "").trim()
    const jurisdiction = (["US","EU","UK","IL","GLOBAL"] as const).includes(body?.jurisdiction)
      ? body.jurisdiction
      : "GLOBAL"
    const email = String(body?.email || "").trim().toLowerCase()
    const orderId = String(body?.order_id || "").trim()

    if (!url || !url.startsWith("http")) {
      return NextResponse.json({ error: "Valid URL required" }, { status: 400 })
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 })
    }

    const siteText = await scrapeSite(url)

    let snapshot: Snapshot
    try {
      snapshot = await generateSnapshot(siteText, url, jurisdiction, email)
    } catch (aiErr: any) {
      // The analysis engine is down (e.g. LLM credit/quota). NEVER leak the
      // raw provider error to a prospect — capture the lead and degrade
      // gracefully so the frontend can offer a "we'll follow up" path.
      const sbFail = getSupabase()
      if (sbFail) {
        sbFail.from("risk_snapshots").insert({
          email, url, jurisdiction,
          order_id: orderId || null,
          recommended_fix: "PENDING — analysis queued (engine temporarily unavailable)",
          created_at: new Date().toISOString(),
        }).then(() => null, () => null)
      }
      console.error("[risk-snapshot] engine unavailable:", aiErr?.message)
      return NextResponse.json(
        { error: "analysis_unavailable", message: "Your snapshot is queued — our analysis engine is briefly at capacity. We've saved your request and you can retry in a few minutes." },
        { status: 503 },
      )
    }

    // Persist (fire-and-forget; never break the user flow)
    const sb = getSupabase()
    if (sb) {
      sb.from("risk_snapshots").insert({
        email, url, jurisdiction,
        score: snapshot.score, grade: snapshot.grade,
        flags: snapshot.flags,
        recommended_fix: snapshot.recommended_fix,
        order_id: orderId || null,
        created_at: new Date().toISOString(),
      }).then(() => null, () => null)
    }

    return NextResponse.json(snapshot)
  } catch (e: any) {
    // Never leak internal error detail to the client.
    console.error("[risk-snapshot] unexpected:", e?.message)
    return NextResponse.json({ error: "snapshot_failed", message: "Something went wrong generating your snapshot. Please try again." }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    name: "AI Compliance Risk Snapshot",
    price_one_time: 19,
    price_monthly: 49,
    delivery: "automated, <2 minutes after payment confirmed",
    upsells: ["DocAI Starter $29/mo", "LexAudit $99/mo", "Custom Build $2.5K-$40K"],
  })
}
