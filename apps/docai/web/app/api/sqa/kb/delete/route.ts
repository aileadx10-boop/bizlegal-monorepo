import { NextRequest, NextResponse } from "next/server"
import { deleteFirmKbItem, isFirmTierActive } from "@/lib/sqa/firm-kb"

export const dynamic = "force-dynamic"
export const maxDuration = 15

interface DeleteBody {
  email: string
  id: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<DeleteBody>
    const email = (body.email ?? "").trim().toLowerCase()
    const id = (body.id ?? "").trim()

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "valid email required" }, { status: 400 })
    }
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 })
    }

    const paywall = await isFirmTierActive(email)
    if (!paywall.ok) {
      return NextResponse.json({ error: "Firm-tier subscription required" }, { status: 402 })
    }

    const ok = await deleteFirmKbItem(email, id)
    return NextResponse.json({ ok })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error"
    console.error("[sqa/kb/delete]", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
