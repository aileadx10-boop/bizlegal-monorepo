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
    if (stripeKey) {
      // Real Stripe path — implemented when STRIPE_SECRET_KEY is added to vault.
      // For now return a 503 so the UI shows the "checkout coming soon" fallback.
      return NextResponse.json(
        { error: "Checkout temporarily unavailable, please retry" },
        { status: 503 }
      )
    }

    // No Stripe key yet — return a stub response so the client can still mark
    // "paid" locally and email the report manually until payments are wired.
    // (We log the intent so the agent can follow up.)
    console.log(`[compliance-snapshot] unlock request email=${email} score=${body?.score}`)
    return NextResponse.json({ unlocked: true, email, score: body?.score })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Checkout failed" }, { status: 500 })
  }
}
