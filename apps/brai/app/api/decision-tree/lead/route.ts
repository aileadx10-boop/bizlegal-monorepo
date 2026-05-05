/**
 * BRAI Decision Tree — lead capture endpoint.
 *
 * Phase AA Day 9 — fifth instance of the V1 conversion-machine pattern.
 * Same shape as Forge BOI / TRACR / DocAI / LexAudit:
 *  1. Validate email + verdict.
 *  2. Cloudflare Turnstile bot challenge (skip-if-not-configured).
 *  3. enqueueNurture vertical='brai'.
 *  4. lead.qualified ops event.
 */

import { NextRequest, NextResponse } from 'next/server'
import { enqueueNurture } from '@/lib/nurture-enqueue'
import { logEventAsync } from '@/lib/ops/log'
import { verifyTurnstile, clientIpFromHeaders } from '@bizlegal/turnstile-verify'
import { rateLimit } from '@bizlegal/rate-limit'

export const dynamic = 'force-dynamic'

const VALID_VERDICTS = new Set(['critical_screen', 'periodic_screen', 'low_priority'])

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

  // D10 SECURITY-V3 C-1: rate-limit before Turnstile.
  const ip = clientIpFromHeaders(req.headers) ?? 'unknown'
  const rl = rateLimit('brai-decision-tree-lead', ip, { windowMs: 60_000, limit: 10 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'rate_limited', retry_after_ms: rl.retryAfterMs },
      { status: 429, headers: { 'retry-after': String(Math.ceil(rl.retryAfterMs / 1000)) } },
    )
  }

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

  const leadId = `brai-decision-tree-${email}`

  void enqueueNurture({
    lead_id: leadId,
    email,
    vertical: 'brai',
    source: 'brai:decision-tree',
    lead_classification: { verdict, answers },
  }).catch((err) => console.warn('[brai/decision-tree/lead] nurture enqueue failed:', err))

  logEventAsync({
    type: 'lead.qualified',
    source: 'brai',
    ref_id: leadId,
    email,
    status: 'ok',
    metadata: {
      magnet: 'decision-tree-sanctions',
      verdict,
      answer_count: Object.keys(answers).length,
    },
  })

  return NextResponse.json({ ok: true, lead_id: leadId })
}
