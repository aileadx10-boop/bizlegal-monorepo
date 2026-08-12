import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'
import { supabaseAdmin } from '@/lib/supabase'
import { analyzeReserve, orderEmailKey, validateReserveInput } from '@/lib/reserve-report'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * POST /api/reserve-report/generate
 *
 * W2-5. Validates issuer-supplied reserve composition, persists a pending
 * `reserve_reports` row keyed by email (for webhook fulfillment), and returns
 * the deterministic template report JSON for the free preview. The checkout
 * itself goes through /api/pay/start (universal checkout — no NEXT_PUBLIC URL).
 * Never stores the report as an audit — see lib/reserve-report.ts liability.
 */

export async function POST(req: NextRequest) {
  let body: { email?: string; reserve?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid work email.' }, { status: 400 })
  }

  const validated = validateReserveInput(body.reserve)
  if (!validated.ok) {
    return NextResponse.json({ ok: false, errors: validated.errors }, { status: 400 })
  }
  const input = validated.input

  const report = analyzeReserve(input)
  const key = orderEmailKey(email)

  // Persist pending row so the webhook can find + fulfill it after payment.
  try {
    await supabaseAdmin.from('reserve_reports').insert({
      email,
      order_email_key: key,
      issuer_name: input.issuerName,
      issuer_jurisdiction: input.issuerJurisdiction,
      token_type: input.tokenType,
      payload: input as unknown as Record<string, unknown>,
      status: 'pending',
    })
  } catch {
    // Preview must never break on a storage hiccup — the webhook re-derives
    // the report from the payload at fulfillment time only for rows that
    // persisted. If the insert failed here, fulfillment is impossible, so
    // surface a 503 rather than pretend the checkout will work.
    return NextResponse.json(
      { ok: false, error: 'Could not prepare your report — please retry in a moment.' },
      { status: 503 },
    )
  }

  logEventAsync({
    type: 'lead.inbound',
    source: 'hub',
    email,
    status: 'ok',
    metadata: { tool: 'reserve-report', stage: 'preview', regime: report.regime },
  })

  return NextResponse.json({ ok: true, report })
}
