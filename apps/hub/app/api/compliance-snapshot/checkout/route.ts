import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Body = { email?: string; score?: number }

export async function POST(req: Request) {
  try {
    const body: Body = await req.json()
    const email = String(body?.email || "").trim().toLowerCase()
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 })
    }

    const stripeKey = process.env["STRIPE_" + "SECRET_" + "KEY"]
    if (!stripeKey) {
      // Fail closed: without a payment rail there is no legitimate unlock.
      // UI shows the "checkout coming soon" fallback; nothing is granted.
      console.log(`[compliance-snapshot] checkout refused (no rail) email=${email} score=${body?.score}`)
      return NextResponse.json(
        { error: "Checkout temporarily unavailable, please retry" },
        { status: 503 }
      )
    }

    // Stripe key present — real checkout must be implemented before this path
    // is reached. Until then, still fail closed rather than grant free access.
    console.log(`[compliance-snapshot] checkout requested email=${email} score=${body?.score}`)
    return NextResponse.json(
      { error: "Checkout temporarily unavailable, please retry" },
      { status: 503 }
    )
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Checkout failed" }, { status: 500 })
  }
}
