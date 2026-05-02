import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'

/**
 * DocAI /api/inbound-lead — see lexaudit equivalent for protocol.
 * Verifies HMAC-SHA256 of body against BIZLEGAL_INBOUND_SECRET.
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

  if (payload.classification?.product !== 'docai') {
    return NextResponse.json(
      { error: 'wrong_product', expected: 'docai', received: payload.classification?.product ?? 'unknown' },
      { status: 400 }
    )
  }

  const leadId = payload.lead?.lead_id ?? 'unknown'
  console.log(`[inbound-lead] DocAI received lead=${leadId} confidence=${payload.classification.confidence}`)
  return NextResponse.json({ ok: true, accepted: true, lead_id: leadId })
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { ok: true, service: 'docai', endpoint: 'inbound-lead', configured: Boolean(process.env.BIZLEGAL_INBOUND_SECRET) },
    { status: 200 }
  )
}
