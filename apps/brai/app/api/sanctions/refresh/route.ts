import { NextResponse } from "next/server"
import { refreshSanctions, getCachedListsFromSupabase } from "@/lib/chain/sanctions"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * BRAI — daily sanctions cache refresh.
 * Writes fetched addresses to Supabase sanctions_cache so they survive
 * Vercel cold starts. Gated by CRON_SECRET.
 */
export async function POST(request: Request): Promise<Response> {
  const secret = request.headers.get("authorization")
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`
  if (!process.env.CRON_SECRET || secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const result = await refreshSanctions()
  return NextResponse.json({ refreshed_at: new Date().toISOString(), ...result })
}

/** GET: return current cache status (for /ops/health probes). */
export async function GET(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get("t") ?? ""
  if (token !== process.env.OPS_DASHBOARD_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const status = await getCachedListsFromSupabase()
  return NextResponse.json({ cache: status })
}
