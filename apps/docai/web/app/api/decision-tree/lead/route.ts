/**
 * DocAI Decision Tree — lead capture endpoint.
 *
 * Phase AA Day 8 — third instance of the V1 conversion-machine pattern
 * (Forge BOI → TRACR → DocAI). Same shape:
 *  1. Validate email + verdict.
 *  2. enqueueNurture vertical='docai' so the worker runs the 4-step
 *     cadence over 7 days.
 *  3. Log a `lead.qualified` ops event.
 *
 * Lead-id pinned to (email, magnet) so re-takes don't restart the
 * sequence. Fully unauthenticated POST today; INTEGRATION-V3 F-2 noted
 * Turnstile/origin-allowlist as a follow-up before public launch.
 */

import { NextRequest, NextResponse } from 'next/server'
import { enqueueNurture } from '@/lib/nurture-enqueue'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'

const VALID_VERDICTS = new Set(['high_risk', 'moderate_review', 'light_touch'])

interface DecisionTreePayload {
  email?: string
  verdict?: string
  answers?: Record<string, boolean>
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

  const leadId = `docai-decision-tree-${email}`

  void enqueueNurture({
    lead_id: leadId,
    email,
    vertical: 'docai',
    source: 'docai:decision-tree',
    lead_classification: { verdict, answers },
  }).catch((err) => console.warn('[docai/decision-tree/lead] nurture enqueue failed:', err))

  logEventAsync({
    type: 'lead.qualified',
    source: 'docai',
    ref_id: leadId,
    email,
    status: 'ok',
    metadata: {
      magnet: 'decision-tree-privacy',
      verdict,
      answer_count: Object.keys(answers).length,
    },
  })

  return NextResponse.json({ ok: true, lead_id: leadId })
}
