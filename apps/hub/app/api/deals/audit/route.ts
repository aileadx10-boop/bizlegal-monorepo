// app/api/deals/audit/route.ts
//
// Free Deal Audit (DI-3) — POST handler.
//
// Validates the visitor's form submission, runs the deterministic
// reconciliation engine against the Dubai residential pack, and returns
// findings sorted by severity. The pack is gated on `reviewed`: while it
// is false this route answers 409 `deal_audit_unavailable`, so the surface
// ships now and goes live the moment Moses flips the flag — no code change.
//
// No Supabase, no secrets, no LLM. Pure computation + in-memory rate limit.

import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, clientIpFromHeaders } from '@bizlegal/rate-limit'
import { runDealAudit, validateDealAuditInput } from '@/lib/deal-audit/audit'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

const RATE_LIMIT = { windowMs: 60_000, limit: 10 }

export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers) ?? 'unknown'
  const rl = rateLimit('deal-audit', ip, RATE_LIMIT)
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        message: 'Too many requests — please wait a minute and try again.',
      },
      {
        status: 429,
        headers: { 'retry-after': String(Math.ceil(rl.retryAfterMs / 1000)) },
      },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', message: 'Request body must be valid JSON.' },
      { status: 400 },
    )
  }

  const validated = validateDealAuditInput(body)
  if (!validated.ok) {
    return NextResponse.json(
      { error: 'invalid_input', message: validated.error },
      { status: 400 },
    )
  }

  const result = runDealAudit(validated.value)
  if (!result.ok) {
    return NextResponse.json(
      {
        error: 'deal_audit_unavailable',
        message:
          'The Dubai deal audit is under review by a practising Dubai lawyer and will be live shortly. Please check back soon.',
      },
      { status: 409 },
    )
  }

  return NextResponse.json({
    ok: true,
    pack_id: result.packId,
    pack_label: result.packLabel,
    findings: result.findings,
  })
}

export const GET = () =>
  NextResponse.json({ error: 'POST only' }, { status: 405 })
