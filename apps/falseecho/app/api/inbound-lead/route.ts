import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { enqueueNurture } from '@bizlegal/nurture-enqueue'

/**
 * FalseEcho /api/inbound-lead — HMAC-verified lead handoff from the fleet
 * lead router (same protocol as TRACR /api/inbound-lead).
 */

export const dynamic = 'force-dynamic'

interface InboundLeadPayload {
  schema_version: string
  classification: { product: string; confidence: number; reason: string }
  lead: { lead_id: string; received_at?: string; contact?: { email?: string } }
}

function timingSafeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'))
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

  if (payload.classification?.product !== 'falseecho') {
    return NextResponse.json(
      { error: 'wrong_product', expected: 'falseecho', received: payload.classification?.product ?? 'unknown' },
      { status: 400 }
    )
  }

  const leadId = payload.lead?.lead_id ?? 'unknown'
  const email = payload.lead?.contact?.email
  console.log(`[inbound-lead] FalseEcho received lead=${leadId} confidence=${payload.classification.confidence}`)

  if (email && leadId !== 'unknown') {
    void enqueueNurture({
      lead_id: leadId,
      email,
      vertical: 'falseecho',
      source: 'falseecho:inbound-lead',
      lead_classification: {
        confidence: payload.classification.confidence,
        reason: payload.classification.reason,
      },
    }).catch((err) => console.warn('[inbound-lead] nurture enqueue failed:', err))
  }

  return NextResponse.json({ ok: true, accepted: true, lead_id: leadId })
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { ok: true, service: 'falseecho', endpoint: 'inbound-lead', configured: Boolean(process.env.BIZLEGAL_INBOUND_SECRET) },
    { status: 200 }
  )
}
