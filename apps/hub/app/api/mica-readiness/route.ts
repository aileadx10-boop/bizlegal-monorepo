// POST /api/mica-readiness
// Accepts the questionnaire answers, computes the readiness report
// server-side (so the logic is testable and reports can be logged), and
// optionally stores a lead for follow-up.
//
// Lead capture is fully guarded: if Supabase env vars, the `leads` table,
// or the network are unavailable, the report is still returned.

import { QUESTIONS, computeMicaReadiness } from "@/lib/mica-readiness"
import { type NextRequest, NextResponse } from "next/server"

const REQUIRED_IDS = QUESTIONS.map((q) => q.id)

// Simple in-memory rate limiter (best-effort on serverless — same pattern as
// the dashboard auth route). Bounds lead-capture spam without a Redis dependency.
const attempts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return false
  }
  entry.count++
  return entry.count > 5
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown"
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in 15 minutes." },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const rawAnswers = body?.answers

    if (!rawAnswers || typeof rawAnswers !== "object" || Array.isArray(rawAnswers)) {
      return NextResponse.json({ error: "Missing or invalid answers." }, { status: 400 })
    }

    const answers: Record<string, string> = {}
    for (const id of REQUIRED_IDS) {
      const value = rawAnswers[id]
      answers[id] = typeof value === "string" ? value : ""
    }

    const unanswered = REQUIRED_IDS.filter((id) => !answers[id])
    if (unanswered.length > 0) {
      return NextResponse.json(
        { error: "Not all questions were answered.", missing: unanswered },
        { status: 400 }
      )
    }

    const report = computeMicaReadiness(answers)

    // Optional lead capture — never blocks the report.
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
    if (email?.includes("@")) {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.SUPABASE_SERVICE_KEY
        if (url && key) {
          const { createClient } = await import("@supabase/supabase-js")
          const sb = createClient(url, key)
          await sb.from("leads").insert({
            email,
            name: typeof body?.name === "string" ? body.name : null,
            company: typeof body?.company === "string" ? body.company : null,
            jurisdiction: "EU",
            source: "mica-readiness",
            page: "/mica-readiness",
            product: "forge",
          })
        }
      } catch {
        // Non-fatal: lead capture must never prevent the report from being delivered.
      }
    }

    return NextResponse.json(report)
  } catch {
    return NextResponse.json(
      { error: "Failed to compute readiness report. Please try again." },
      { status: 500 }
    )
  }
}
