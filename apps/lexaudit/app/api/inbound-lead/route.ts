import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { enqueueNurture } from '@/lib/nurture-enqueue'

/**
 * LexAudit /api/inbound-lead — receives leads routed from the hub's
 * EA Worker after vertical classification. Verifies HMAC-SHA256
 * signature, then logs receipt. Persistence (LexAudit's own CRM
 * table) is wired separately when the Supabase schema is ready.
 *
 * Auth: x-bizlegal-signature header = hex HMAC-SHA256 of the raw
 *       body, key = BIZLEGAL_INBOUND_SECRET (same value as the
 *       Worker's WEBHOOK_SHARED_SECRET).
 *
 * If the secret is unset (dev / preview), the route 503s — never
 * accepts unsigned payloads.
 */

export const dynamic = 'force-dynamic'

interface InboundLeadPayload {
  schema_version: string
  classification: { product: string; confidence: number; reason: string }
  lead: { lead_id: string; received_at?: string; contact?: { email?: string } }
}

function timingSafeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const ab = Buffer.from(a, 'utf8')
  const bb = Buffer.from(b, 'utf8')
  return crypto.timingSafeEqual(ab, bb)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.BIZLEGAL_INBOUND_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'inbound_lead_not_configured' }, { status: 503 })
  }
  const signature = req.headers.get('x-bizlegal-signature')
  if (!signature) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 401 })
  }
  const rawBody = await req.text()
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  if (!timingSafeHexEqual(expected, signature)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
  }

  let payload: InboundLeadPayload
  try {
    payload = JSON.parse(rawBody) as InboundLeadPayload
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  if (payload.classification?.product !== 'lexaudit') {
    return NextResponse.json(
      {
        error: 'wrong_product',
        expected: 'lexaudit',
        received: payload.classification?.product ?? 'unknown',
      },
      { status: 400 }
    )
  }

  const leadId = payload.lead?.lead_id ?? 'unknown'
  const email = payload.lead?.contact?.email ?? 'unknown'
  console.log(
    `[inbound-lead] LexAudit received lead=${leadId} email=${email} ` +
      `confidence=${payload.classification.confidence}`
  )

  // Phase AA V3 — enqueue into lead_nurture_state. Fire-and-forget;
  // a Supabase blip on the nurture side never fails the verified inbound.
  if (email && email !== 'unknown' && leadId !== 'unknown') {
    void enqueueNurture({
      lead_id: leadId,
      email,
      vertical: 'lexaudit',
      source: 'lexaudit:inbound-lead',
      lead_classification: {
        confidence: payload.classification.confidence,
        reason: payload.classification.reason,
      },
    }).catch((err) => console.warn('[inbound-lead] nurture enqueue failed:', err))
  }

  // TODO: persist to Supabase `inbound_leads` table once schema is live.
  return NextResponse.json({ ok: true, accepted: true, lead_id: leadId })
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      ok: true,
      service: 'lexaudit',
      endpoint: 'inbound-lead',
      configured: Boolean(process.env.BIZLEGAL_INBOUND_SECRET),
    },
    { status: 200 }
  )
}
