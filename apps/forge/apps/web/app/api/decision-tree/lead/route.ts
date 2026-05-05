/**
 * BOI Decision Tree — lead capture endpoint.
 *
 * Phase AA Day 6 — V1 conversion-machine pattern. The user has just
 * completed the 4-5-question decision tree and chosen to receive the
 * full report. We:
 *  1. Validate the email + verdict shape.
 *  2. Insert (or upsert) the lead into Supabase `leads` for ops + CRM.
 *  3. Fire enqueueNurture with vertical='boi' so the worker sends the
 *     welcome email in 5 min and runs the 4-step cadence over 7 days.
 *  4. Log a 'lead.qualified' ops event so /ops sees the conversion.
 *
 * Idempotent on email: if the same address completes the tree twice,
 * Supabase upsert keeps the latest verdict + the nurture-state unique
 * index on lead_id ensures a single sequence per (email, magnet) pair.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { enqueueNurture } from '@/lib/nurture-enqueue'
import { logEventAsync } from '@/lib/ops/log'
import { verifyTurnstile, clientIpFromHeaders } from '@bizlegal/turnstile-verify'
import { rateLimit } from '@bizlegal/rate-limit'

export const dynamic = 'force-dynamic'

const VALID_VERDICTS = new Set(['must_file', 'likely_exempt', 'edge_case'])

interface DecisionTreePayload {
  email?: string
  verdict?: string
  answers?: Record<string, boolean>
  turnstile_token?: string
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: DecisionTreePayload
  try {
    body = (await req.json()) as DecisionTreePayload
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  const verdict = body.verdict ?? ''
  const answers = body.answers ?? {}

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }
  if (!VALID_VERDICTS.has(verdict)) {
    return NextResponse.json({ error: 'invalid_verdict' }, { status: 400 })
  }

  // D10 SECURITY-V3 C-1: rate-limit BEFORE Turnstile so a pump can't
  // burn Turnstile verify-API quota either. 10 per IP per minute is
  // generous for a 60-second decision tree, restrictive for a bot.
  const ip = clientIpFromHeaders(req.headers) ?? 'unknown'
  const rl = rateLimit('forge-decision-tree-lead', ip, { windowMs: 60_000, limit: 10 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'rate_limited', retry_after_ms: rl.retryAfterMs },
      { status: 429, headers: { 'retry-after': String(Math.ceil(rl.retryAfterMs / 1000)) } },
    )
  }

  // D9 INTEGRATION-V3 F-2: Turnstile bot challenge. Skip-if-not-
  // configured semantics — if TURNSTILE_SECRET_KEY is unset on Vercel
  // the verifier returns ok=true so dev / pre-launch deploys keep
  // working. Set the secret to enable enforcement.
  const turnstile = await verifyTurnstile({
    token: body.turnstile_token,
    clientIp: clientIpFromHeaders(req.headers),
  })
  if (!turnstile.ok) {
    return NextResponse.json(
      { error: 'turnstile_failed', codes: turnstile.errorCodes },
      { status: 403 },
    )
  }

  const supabase = createServerClient()
  // Lead-id pinned to (email, magnet) so re-takes don't restart the sequence.
  const leadId = `forge-decision-tree-boi-${email}`

  // 1. Upsert into leads table (CRM tail + analytics).
  try {
    await supabase.from('leads').upsert(
      {
        email,
        source: 'forge:decision-tree-boi',
        gap_slug: 'decision-tree-boi',
        metadata: { verdict, answers },
        created_at: new Date().toISOString(),
      },
      { onConflict: 'email' },
    )
  } catch (err) {
    console.warn('[decision-tree/lead] leads upsert failed:', err)
    // Non-blocking — the nurture path is what actually drives revenue.
  }

  // 2. Fire nurture enqueue (vertical=boi).
  void enqueueNurture({
    lead_id: leadId,
    email,
    vertical: 'boi',
    source: 'forge:decision-tree-boi',
    lead_classification: { verdict, answers },
  }).catch((err) => console.warn('[decision-tree/lead] nurture enqueue failed:', err))

  // 3. Ops event so /ops dashboard reflects the conversion.
  logEventAsync({
    type: 'lead.qualified',
    source: 'forge',
    ref_id: leadId,
    email,
    status: 'ok',
    metadata: {
      magnet: 'decision-tree-boi',
      verdict,
      answer_count: Object.keys(answers).length,
    },
  })

  return NextResponse.json({ ok: true, lead_id: leadId })
}
