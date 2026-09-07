/**
 * LeadForge Free Audit — POST /api/free-audit
 *
 * The free tier of the LeadForge consent & suppression audit. Runs the
 * deterministic scorer in lib/free-audit over the 10-check self-
 * assessment and returns the full on-page result: overall score,
 * posture band, per-area aggregates, and per-check recommendations for
 * every control not fully met. LeadForge has no paid tier of its own —
 * the free result IS the deliverable; the conversion path after it is
 * fleet cross-sell, not a LeadForge paywall.
 *
 * Guardrails mirror the sibling free flows (lexaudit /api/free-scan —
 * newest fleet pattern): IP rate limit + Cloudflare Turnstile before
 * any scoring runs.
 *
 * Lead capture: every successful audit enqueues a nurture lead
 * (vertical='leadforge') via @bizlegal/nurture-enqueue and emits a
 * lead.qualified ops event. Both are fire-and-forget — a nurture
 * failure must never break the audit response.
 */

import { NextRequest, NextResponse } from 'next/server'
import { enqueueNurture } from '@/lib/nurture-enqueue'
import { logEventAsync } from '@/lib/ops/log'
import { verifyTurnstile, clientIpFromHeaders } from '@bizlegal/turnstile-verify'
import { rateLimit } from '@bizlegal/rate-limit'
import {
  evaluationsFromRaw,
  postureFor,
  scoreAudit,
} from '@/lib/free-audit'

export const dynamic = 'force-dynamic'

interface FreeAuditPayload {
  email?: string
  answers?: Record<string, unknown>
  turnstile_token?: string
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: FreeAuditPayload
  try {
    body = (await req.json()) as FreeAuditPayload
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const ip = clientIpFromHeaders(req.headers) ?? 'unknown'
  const rl = rateLimit('leadforge-free-audit', ip, { windowMs: 60_000, limit: 5 })
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

  // Only allowlisted free-audit checks are scored, and only with a
  // scorable status. Anything else the client sends is ignored —
  // unanswered checks are excluded from the denominator by the engine,
  // not silently zeroed.
  const evaluations = evaluationsFromRaw(body.answers ?? {})
  if (evaluations.length === 0) {
    return NextResponse.json({ error: 'no_valid_answers' }, { status: 400 })
  }

  const score = scoreAudit(evaluations)
  const posture = postureFor(score.overall_pct)
  const auditRef = 'LF-AUD-' + Math.random().toString(36).substring(2, 8).toUpperCase()

  void enqueueNurture({
    lead_id: `leadforge-free-audit-${email}`,
    email,
    vertical: 'leadforge',
    source: 'leadforge:free-audit',
    lead_classification: {
      magnet: 'free-audit',
      audit_ref: auditRef,
      score_pct: score.overall_pct,
      posture: posture.label,
      gaps_not_met: score.gaps_not_met,
      gaps_partial: score.gaps_partial,
      checks_evaluated: score.checks_evaluated,
    },
  }).catch((err) => console.warn('[leadforge/free-audit] nurture enqueue failed:', err))

  logEventAsync({
    type: 'lead.qualified',
    source: 'leadforge',
    ref_id: auditRef,
    email,
    status: 'ok',
    metadata: {
      magnet: 'free-audit',
      score_pct: score.overall_pct,
      posture: posture.label,
      gaps_not_met: score.gaps_not_met,
      gaps_partial: score.gaps_partial,
    },
  })

  return NextResponse.json({
    ok: true,
    audit_ref: auditRef,
    overall_pct: score.overall_pct,
    posture_label: posture.label,
    posture_summary: posture.summary,
    areas: score.areas,
    recommendations: score.recommendations,
    gaps: { not_met: score.gaps_not_met, partial: score.gaps_partial },
    checks_evaluated: score.checks_evaluated,
    legal_notice:
      'Self-reported answers across a 10-point consent and suppression checklist. This is a preliminary signal — not legal advice, not an audit in the assurance sense, and not a compliance certification. TCPA and CAN-SPAM outcomes are fact-specific; confirm your specific situation with qualified counsel.',
  })
}
