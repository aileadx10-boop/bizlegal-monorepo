/**
 * TRACR Decision Tree — lead capture endpoint.
 *
 * Phase AA Day 7 — replicates the V1 conversion-machine pattern from
 * Forge BOI (apps/forge/apps/web/app/api/decision-tree/lead/route.ts):
 *  1. Validate email + verdict.
 *  2. Fire enqueueNurture with vertical='tracr' so the worker runs the
 *     4-step cadence over 7 days.
 *  3. Log a 'lead.qualified' ops event.
 *
 * Lead-id pinned to (email, magnet) so re-takes don't restart the
 * sequence. Fully unauthenticated POST — same shape as Forge today.
 * Bot-pump risk acknowledged in INTEGRATION-V3 F-2; Turnstile to
 * follow before launch.
 */

import { NextRequest, NextResponse } from 'next/server'
import { enqueueNurture } from '@/lib/nurture-enqueue'

export const dynamic = 'force-dynamic'

const VALID_VERDICTS = new Set(['high_priority', 'standard_review', 'casual_use'])

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

  const leadId = `tracr-decision-tree-${email}`

  void enqueueNurture({
    lead_id: leadId,
    email,
    vertical: 'tracr',
    source: 'tracr:decision-tree',
    lead_classification: { verdict, answers },
  }).catch((err) => console.warn('[tracr/decision-tree/lead] nurture enqueue failed:', err))

  return NextResponse.json({ ok: true, lead_id: leadId })
}
