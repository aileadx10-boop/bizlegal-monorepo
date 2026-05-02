import { NextResponse } from "next/server"

interface IntakeBody {
  email?: string
  organisation?: string
  use_case?: string
  jurisdictions?: string
  timeline?: string
  budget?: string
  product?: string
  disclaimer_version?: string
  submitted_at?: string
}

/**
 * Verified Intelligence Network intake endpoint.
 *
 * Accepts an intake from the /network page, stamps the server
 * timestamp + disclosure version, and sends a Resend email to the
 * network-ops inbox. No payment is collected here.
 *
 * If RESEND_API_KEY is not configured, the endpoint logs the intake
 * payload server-side and returns 202 — allows the form to be live
 * for previews without Resend wiring.
 */
export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as IntakeBody | null
  if (!body?.email || !body.organisation || !body.use_case) {
    return NextResponse.json(
      { error: "email, organisation, and use_case are required" },
      { status: 400 },
    )
  }

  const apiKey = process.env.RESEND_API_KEY
  const toAddress = process.env.NETWORK_INTAKE_EMAIL ?? "network@bizlegal-ai.com"
  const from = process.env.RESEND_FROM ?? "intake@bizlegal-ai.com"

  const record = {
    ...body,
    server_received_at: new Date().toISOString(),
  }

  if (!apiKey) {
    // Preview-mode: no Resend wired yet.
    console.info("[network-intake] received (Resend not configured):", record)
    return NextResponse.json({ ok: true, mode: "preview" }, { status: 202 })
  }

  const subject = `[VIN intake] ${body.organisation} — ${body.product ?? "unknown"}`
  const text = [
    "Verified Intelligence Network intake",
    "",
    `Product: ${body.product ?? "unknown"}`,
    `Disclosure version: ${body.disclaimer_version ?? "unknown"}`,
    `Submitted at: ${body.submitted_at ?? "unknown"}`,
    `Server received at: ${record.server_received_at}`,
    "",
    `Email: ${body.email}`,
    `Organisation: ${body.organisation}`,
    `Use case: ${body.use_case}`,
    `Jurisdictions: ${body.jurisdictions ?? "(not provided)"}`,
    `Timeline: ${body.timeline ?? "(not provided)"}`,
    `Budget: ${body.budget ?? "(not provided)"}`,
  ].join("\n")

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [toAddress],
      subject,
      text,
    }),
  })
  if (!resp.ok) {
    const errorText = await resp.text()
    console.error("[network-intake] resend error:", resp.status, errorText)
    return NextResponse.json({ error: "intake delivery failed" }, { status: 502 })
  }
  return NextResponse.json({ ok: true }, { status: 201 })
}

export const dynamic = "force-dynamic"
