// POST /api/tools/wallet-screener
// Screens one EVM address against the OFAC / UN / EU sanctions lists
// (shared `sanctions_cache`). Free tool — result is always returned;
// email lead capture is optional and never blocks the result.
//
// Three-way outcome: hit / clean / list-not-found. `list-not-found` is an
// explicit non-claim ("could not verify") rather than a false clean bill —
// see lib/wallet-screener.ts.

import { screenWallet } from "@/lib/wallet-screener"
import { logEventAsync } from "@/lib/ops/log"
import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory rate limiter (best-effort on serverless — same pattern as
// /api/mica-readiness). Bounds screening spam without a Redis dependency.
const attempts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return false
  }
  entry.count++
  return entry.count > 10
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown"
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in 15 minutes." },
      { status: 429 }
    )
  }

  let body: { address?: unknown; email?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const rawAddress = typeof body?.address === "string" ? body.address.trim() : ""
  if (!rawAddress) {
    return NextResponse.json({ error: "Missing address." }, { status: 400 })
  }

  let result
  try {
    result = await screenWallet(rawAddress)
  } catch (err) {
    console.error("[wallet-screener]", err)
    return NextResponse.json(
      { error: "Screening failed. Please try again." },
      { status: 500 }
    )
  }

  // Optional lead capture — never blocks the result.
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
          name: null,
          company: null,
          jurisdiction: null,
          source: "wallet-screener",
          page: "/tools/wallet-screener",
          product: "tracr",
        })
      }
    } catch {
      // Non-fatal: lead capture must never prevent the result from being delivered.
    }
  }

  logEventAsync({
    type: "risk.assessment",
    source: "hub",
    ref_id: result.address,
    email: email || undefined,
    status: "ok",
    metadata: {
      product: "wallet_screener",
      screen_status: result.status,
      hit_count: result.hits.length,
      lists_loaded: result.listsLoaded,
      lists_missing: result.listsMissing,
    },
  })

  return NextResponse.json({
    address: result.address,
    status: result.status,
    reason: result.reason,
    hits: result.hits,
    listsLoaded: result.listsLoaded,
    listsMissing: result.listsMissing,
    checkedAt: result.checkedAt,
  })
}
