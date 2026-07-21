/**
 * LexAudit Compliance Health Score — lead capture endpoint.
 *
 * Called by ComplianceHealthScore.tsx after the user completes the 40-question
 * self-assessment and submits their email. Stores the lead, enqueues nurture
 * (vertical='lexaudit'), and emits a lead.qualified ops event.
 */

import { NextRequest, NextResponse } from 'next/server'
import { enqueueNurture } from '@/lib/nurture-enqueue'
import { logEventAsync } from '@/lib/ops/log'
import { verifyTurnstile, clientIpFromHeaders } from '@bizlegal/turnstile-verify'
import { rateLimit } from '@bizlegal/rate-limit'

export const dynamic = 'force-dynamic'

interface CategoryScore {
  id: string
  label: string
  pct: number
}

interface HealthScorePayload {
  email?: string
  total_score?: number
  score_pct?: number
  score_label?: string
  category_scores?: CategoryScore[]
  turnstile_token?: string
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: HealthScorePayload
  try {
    body = (await req.json()) as HealthScorePayload
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const ip = clientIpFromHeaders(req.headers) ?? 'unknown'
  const rl = rateLimit('lexaudit-health-score-lead', ip, { windowMs: 60_000, limit: 10 })
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

  const scorePct = body.score_pct ?? 0
  const scoreLabel = body.score_label ?? 'unknown'
  const leadId = `lexaudit-health-score-${email}`

  void enqueueNurture({
    lead_id: leadId,
    email,
    vertical: 'lexaudit',
    source: 'lexaudit:health-score',
    lead_classification: {
      score_pct: scorePct,
      score_label: scoreLabel,
      total_score: body.total_score,
      category_scores: body.category_scores,
    },
  }).catch((err) => console.warn('[lexaudit/health-score/lead] nurture enqueue failed:', err))

  logEventAsync({
    type: 'lead.qualified',
    source: 'lexaudit',
    ref_id: leadId,
    email,
    status: 'ok',
    metadata: {
      magnet: 'compliance-health-score',
      score_pct: scorePct,
      score_label: scoreLabel,
    },
  })

  return NextResponse.json({ ok: true, lead_id: leadId })
}
