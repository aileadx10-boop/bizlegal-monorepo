import { NextResponse } from "next/server"
import { refreshSanctions } from "@/lib/chain"

/**
 * BRAI — daily sanctions cache refresh.
 *
 * Gated by CRON_SECRET. Mirrors TRACR's endpoint; in the later P2
 * Flask-extraction commit, the sanctions cache may move to a shared
 * service. Until then, BRAI and TRACR each maintain their own cached
 * lists, refreshed independently.
 */
export async function POST(request: Request): Promise<Response> {
  const secret = request.headers.get("authorization")
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`
  if (!process.env.CRON_SECRET || secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const result = await refreshSanctions()
  return NextResponse.json({
    refreshed_at: new Date().toISOString(),
    ...result,
  })
}

export const dynamic = "force-dynamic"
