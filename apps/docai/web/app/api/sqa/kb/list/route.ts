import { NextRequest, NextResponse } from "next/server"
import { isFirmTierActive, listFirmKb } from "@/lib/sqa/firm-kb"

export const dynamic = "force-dynamic"
export const maxDuration = 15

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const email = (url.searchParams.get("email") ?? "").trim().toLowerCase()

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "valid email required" }, { status: 400 })
    }

    const paywall = await isFirmTierActive(email)
    if (!paywall.ok) {
      return NextResponse.json({ error: "Firm-tier subscription required" }, { status: 402 })
    }

    const items = await listFirmKb(email)
    return NextResponse.json({
      items,
      count: items.length,
      tier_check: { firm_active: true, payment_order_id: paywall.orderId },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error"
    console.error("[sqa/kb/list]", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
