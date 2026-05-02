import { NextRequest, NextResponse } from "next/server"
import { isFirmTierActive, upsertFirmKb } from "@/lib/sqa/firm-kb"
import { logEventAsync } from "@/lib/ops/log"

export const dynamic = "force-dynamic"
export const maxDuration = 30

interface UploadBody {
  email: string
  items: ReadonlyArray<unknown>
}

const MAX_ITEMS = 200

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<UploadBody>
    const email = (body.email ?? "").trim().toLowerCase()
    const items = Array.isArray(body.items) ? body.items : []

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "valid email required" }, { status: 400 })
    }
    if (items.length === 0) {
      return NextResponse.json({ error: "items array required (1-200 entries)" }, { status: 400 })
    }
    if (items.length > MAX_ITEMS) {
      return NextResponse.json({ error: `too many items: ${items.length} (max ${MAX_ITEMS})` }, { status: 400 })
    }

    // ── Paywall: only active Firm-tier subscribers may upload
    const paywall = await isFirmTierActive(email)
    if (!paywall.ok) {
      return NextResponse.json(
        {
          error:
            "Firm-tier subscription required to upload custom KB items. Upgrade at https://docai.bizlegal-ai.com/pricing.",
          legal_notice:
            "Firm-tier KB upload is gated by an active subscription tied to this email. We do not vet uploaded content; treat your own clauses as customer-managed material.",
        },
        { status: 402 },
      )
    }

    const result = await upsertFirmKb(email, items)

    logEventAsync({
      type: "kb.uploaded",
      source: "docai",
      email,
      status: result.errors.length > 0 ? "failed" : "ok",
      metadata: {
        inserted: result.inserted,
        errors: result.errors.length,
        firm_active: true,
        payment_order_id: paywall.orderId,
      },
    })

    return NextResponse.json({
      ok: true,
      inserted: result.inserted,
      errors: result.errors,
      tier_check: { firm_active: true, payment_order_id: paywall.orderId },
      legal_notice:
        "Customer-uploaded KB. BizLegal does not vet content. Cited inline by the SQA drafter as first-party material distinct from regulator-curated entries.",
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error"
    console.error("[sqa/kb/upload]", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
