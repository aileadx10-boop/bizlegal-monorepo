/**
 * LexAudit Free Scan — POST /api/free-scan
 *
 * The free (summary) tier of the health-score engine. Runs the
 * deterministic scorer in lib/health-score over the 10-check
 * FREE_SCAN_CHECKS subset and returns a TRIMMED result: overall
 * percentage, posture band, per-framework aggregates, and gap
 * counts. It never returns per-signal detail, never generates a
 * report (generateReport requires reviewer signoff), and never
 * issues a certificate — those remain paid/reviewer-gated.
 *
 * Guardrails mirror the sibling free flows (falseecho /api/scan
 * free mode + lexaudit /api/health-score/lead): IP rate limit +
 * Cloudflare Turnstile before any scoring runs.
 *
 * Lead capture: every successful scan enqueues a nurture lead
 * (vertical='lexaudit') via @bizlegal/nurture-enqueue and emits a
 * lead.qualified ops event. Both are fire-and-forget — a nurture
 * failure must never break the scan response.
 */

import { NextRequest, NextResponse } from 'next/server'
import { enqueueNurture } from '@/lib/nurture-enqueue'
import { logEventAsync } from '@/lib/ops/log'
import { verifyTurnstile, clientIpFromHeaders } from '@bizlegal/turnstile-verify'
import { rateLimit } from '@bizlegal/rate-limit'
import { disclaimerStamp } from '@/lib/legal/disclaimer'
import {
  FRAMEWORK_LABELS,
  SIGNALS,
  postureSummary,
  scoreFramework,
  scoreOverall,
  type EvidenceStatus,
  type SignalEvaluation,
} from '@/lib/health-score'
import { FREE_SCAN_CHECKS, FREE_SCAN_FRAMEWORKS } from '@/lib/health-score/free-scan'

export const dynamic = 'force-dynamic'

interface FreeScanPayload {
  email?: string
  answers?: Record<string, unknown>
  turnstile_token?: string
}

const SCORABLE_STATUSES: readonly EvidenceStatus[] = ['met', 'partial', 'not_met']

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: FreeScanPayload
  try {
    body = (await req.json()) as FreeScanPayload
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const ip = clientIpFromHeaders(req.headers) ?? 'unknown'
  const rl = rateLimit('lexaudit-free-scan', ip, { windowMs: 60_000, limit: 5 })
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

  // Only allowlisted free-scan signals are scored, and only with a
  // scorable status. Anything else the client sends is ignored — the
  // free tier cannot touch the remaining 50 registry signals, and
  // unanswered picks score as insufficient_evidence (excluded from
  // the denominator by the engine, not silently zeroed).
  const rawAnswers = body.answers ?? {}
  const evaluations: SignalEvaluation[] = []
  for (const check of FREE_SCAN_CHECKS) {
    const raw = rawAnswers[check.signal_id]
    if (typeof raw === 'string' && (SCORABLE_STATUSES as readonly string[]).includes(raw)) {
      evaluations.push({ signal_id: check.signal_id, status: raw as EvidenceStatus })
    }
  }
  if (evaluations.length === 0) {
    return NextResponse.json({ error: 'no_valid_answers' }, { status: 400 })
  }

  const frameworkScores = FREE_SCAN_FRAMEWORKS.map((fw) => scoreFramework(fw, evaluations))
  const overall = scoreOverall([...frameworkScores])
  const overallPct = Math.round(overall.overall_ratio * 100)

  // Gap counts over the free subset only — highest-severity checks
  // the respondent marked unmet or partial. Aggregate counts, never
  // per-signal findings.
  const statusById = new Map(evaluations.map((e) => [e.signal_id, e.status]))
  let gapsNotMet = 0
  let gapsPartial = 0
  for (const check of FREE_SCAN_CHECKS) {
    if (check.severity !== 'critical' && check.severity !== 'high') continue
    const status = statusById.get(check.signal_id)
    if (status === 'not_met') gapsNotMet += 1
    else if (status === 'partial') gapsPartial += 1
  }

  const stamp = disclaimerStamp()
  const scanRef = 'LA-FS-' + Math.random().toString(36).substring(2, 8).toUpperCase()

  void enqueueNurture({
    lead_id: `lexaudit-free-scan-${email}`,
    email,
    vertical: 'lexaudit',
    source: 'lexaudit:free-scan',
    lead_classification: {
      magnet: 'free-scan',
      scan_ref: scanRef,
      score_pct: overallPct,
      gaps_not_met: gapsNotMet,
      gaps_partial: gapsPartial,
      signals_evaluated: evaluations.length,
    },
  }).catch((err) => console.warn('[lexaudit/free-scan] nurture enqueue failed:', err))

  logEventAsync({
    type: 'lead.qualified',
    source: 'lexaudit',
    ref_id: scanRef,
    email,
    status: 'ok',
    metadata: {
      magnet: 'free-scan',
      score_pct: overallPct,
      gaps_not_met: gapsNotMet,
      gaps_partial: gapsPartial,
    },
  })

  return NextResponse.json({
    ok: true,
    scan_ref: scanRef,
    overall_pct: overallPct,
    posture_summary: postureSummary(overall),
    frameworks: frameworkScores
      .filter((f) => f.signals_scored > 0)
      .map((f) => ({
        id: f.framework,
        label: FRAMEWORK_LABELS[f.framework],
        pct: Math.round(f.ratio * 100),
      })),
    gaps: { critical_or_high_not_met: gapsNotMet, critical_or_high_partial: gapsPartial },
    signals_evaluated: evaluations.length,
    signals_in_full_assessment: SIGNALS.length,
    disclaimer_version: stamp.disclaimer_version,
    legal_notice:
      'Self-reported signals across a 10-check subset of the LexAudit registry. This is regulatory intelligence, not legal advice, not an audit, and not a compliance certification. Confirm your specific situation with qualified counsel.',
  })
}
