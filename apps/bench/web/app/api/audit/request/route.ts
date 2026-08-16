import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@bizlegal/email'
import { dbInsert } from '@/lib/db'
import { logEventAsync } from '@/lib/ops/log'
import { clientKey, isRateLimited } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * POST /api/audit/request — the inbound client-intake ingress.
 *
 * Rule-7 note: this is the acquisition path. It writes bench_intake, fires
 * lead.inbound, and sends ONE transactional acknowledgement (a reply to the
 * person's own action) via @bizlegal/email — suppression still enforced
 * in-package. No marketing sends originate here.
 */

const SEGMENTS = new Set(['legal_ai_vendor', 'compliance_software', 'law_firm', 'ai_lab', 'other'])
const ACCESS_MODES = new Set(['api', 'output_upload', 'public_interface', 'unsure'])
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

interface IntakeBody {
  email?: string
  company?: string
  segment?: string
  product_area?: string
  jurisdiction?: string
  practice_area?: string
  model_access?: string
  message?: string
}

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (isRateLimited(`audit:${clientKey(req)}`)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }

  let body: IntakeBody
  try {
    body = (await req.json()) as IntakeBody
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const email = str(body.email, 254).toLowerCase()
  const segment = str(body.segment, 40)
  const productArea = str(body.product_area, 300)
  const jurisdiction = str(body.jurisdiction, 40)
  const practiceArea = str(body.practice_area, 200)
  const modelAccess = str(body.model_access, 40)

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }
  if (!SEGMENTS.has(segment) || !ACCESS_MODES.has(modelAccess) || !productArea || !jurisdiction || !practiceArea) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
  }

  const stored = await dbInsert('bench_intake', {
    email,
    company: str(body.company, 200) || null,
    segment,
    product_area: productArea,
    jurisdiction,
    practice_area: practiceArea,
    model_access: modelAccess,
    message: str(body.message, 2000) || null,
    source: 'audit_request',
  })

  if (!stored) {
    logEventAsync({
      type: 'error',
      source: 'bench',
      email,
      status: 'failed',
      metadata: { where: 'audit_request_insert' },
    })
    return NextResponse.json({ ok: false, error: 'store_failed' }, { status: 503 })
  }

  logEventAsync({
    type: 'lead.inbound',
    source: 'bench',
    email,
    status: 'ok',
    metadata: { segment, jurisdiction, practice_area: practiceArea, model_access: modelAccess },
  })

  // Transactional acknowledgement — a direct reply to the request just made.
  const ack = await sendEmail({
    to: email,
    kind: 'transactional',
    subject: 'Bench — audit request received',
    text: [
      'Your audit request has reached the Bench intake queue.',
      '',
      `System: ${productArea}`,
      `Jurisdiction: ${jurisdiction} · Practice area: ${practiceArea}`,
      '',
      'We reply with a scoping note — benchmark, item count, price, turnaround — typically within two business days. No payment is taken until scoping is agreed.',
      '',
      'Methodology: https://bench.bizlegal-ai.com/methodology',
      '',
      'Bench by BizLegal AI — the evaluation lab for legal AI.',
      'Measurement services only; nothing in this email is legal advice.',
    ].join('\n'),
  })

  if (ack.ok) {
    logEventAsync({ type: 'email.sent', source: 'bench', email, status: 'ok', metadata: { template: 'audit_request_ack' } })
  }

  return NextResponse.json({ ok: true })
}

export function GET(): NextResponse {
  return NextResponse.json({ ok: true, service: 'bench', endpoint: 'audit/request', method: 'POST' })
}
