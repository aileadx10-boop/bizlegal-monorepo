import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'

/**
 * PropSignal /api/report/start — checkout entry stub.
 *
 * SCAFFOLD STATE: checkout is DARK. Valid requests get 503 checkout_not_live
 * (hard rule: no real money until Z7-style verification + Moses test buy).
 *
 * Intended flow (build phase 3):
 *   1. Validate address + email (below — already live).
 *   2. POST hub /api/pay/start { product_id: 'propsignal_report_49',
 *      user_email, gateway } → redirect to checkout_url.
 *   3. On payment.confirmed webhook: source fan-out (fema/epa/socrata/
 *      perplexity) → score-engine → PDF → Resend delivery → download.report.
 */

export const dynamic = 'force-dynamic'

interface StartReportBody {
  email: string
  address: string
  city: string
  state: string
  zip: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STATE_RE = /^[A-Za-z]{2}$/
const ZIP_RE = /^\d{5}$/

function parseBody(raw: unknown): StartReportBody | null {
  if (typeof raw !== 'object' || raw === null) return null
  const b = raw as Record<string, unknown>
  const email = typeof b.email === 'string' ? b.email.trim() : ''
  const address = typeof b.address === 'string' ? b.address.trim() : ''
  const city = typeof b.city === 'string' ? b.city.trim() : ''
  const state = typeof b.state === 'string' ? b.state.trim().toUpperCase() : ''
  const zip = typeof b.zip === 'string' ? b.zip.trim() : ''

  if (!EMAIL_RE.test(email)) return null
  if (address.length < 4) return null
  if (city.length < 2) return null
  if (!STATE_RE.test(state)) return null
  if (!ZIP_RE.test(zip)) return null

  return { email, address, city, state, zip }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const body = parseBody(raw)
  if (!body) {
    return NextResponse.json(
      { ok: false, error: 'invalid_input', expected: 'email, address, city, state (2-letter), zip (5-digit)' },
      { status: 400 },
    )
  }

  logEventAsync({
    type: 'lead.inbound',
    source: 'propsignal',
    email: body.email,
    metadata: { city: body.city, state: body.state, zip: body.zip, surface: 'report_start_stub' },
  })

  return NextResponse.json(
    { ok: false, error: 'checkout_not_live', product_id: 'propsignal_report_49' },
    { status: 503 },
  )
}
