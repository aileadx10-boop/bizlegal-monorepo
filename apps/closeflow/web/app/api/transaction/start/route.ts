import { NextRequest, NextResponse } from 'next/server'
import { isTransactionType, type TransactionType } from '@/lib/date-calculator'
import { logEventAsync } from '@/lib/ops/log'

/**
 * POST /api/transaction/start — checkout entry stub.
 *
 * Intended live flow: forward to hub /checkout (apex) — NOT /api/pay/start, which is disabled 2026-07-30
 *      because it never inserted a payment_orders row and its bz_* order_id
 *      could not be reconciled by the IPN webhook. Use:
 *      https://bizlegal-ai.com/checkout?product=&tier=&interval=&amount=&name=
 *      with
 * { product_id: 'closeflow_transaction_39', user_email, gateway } per the
 * @bizlegal/payment registry, then create the transaction row on the
 * payment.confirmed webhook.
 *
 * Deliberately returns 503 checkout_not_live until Z7-style verification
 * passes (root CLAUDE.md hard rule #5 — no real money before the chain
 * is verified green). The validation below is the real contract.
 */

export const dynamic = 'force-dynamic'

const PRODUCT_ID = 'closeflow_transaction_39'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface StartRequest {
  email: string
  property_address: string
  transaction_type: TransactionType
  closing_date: string
}

function parseBody(raw: unknown): { ok: true; body: StartRequest } | { ok: false; error: string } {
  if (typeof raw !== 'object' || raw === null) return { ok: false, error: 'body_must_be_object' }
  const candidate = raw as Record<string, unknown>

  const email = candidate.email
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) return { ok: false, error: 'invalid_email' }

  const propertyAddress = candidate.property_address
  if (typeof propertyAddress !== 'string' || propertyAddress.trim().length < 5) {
    return { ok: false, error: 'invalid_property_address' }
  }

  const transactionType = candidate.transaction_type
  if (!isTransactionType(transactionType)) return { ok: false, error: 'invalid_transaction_type' }

  const closingDate = candidate.closing_date
  if (typeof closingDate !== 'string' || Number.isNaN(Date.parse(closingDate))) {
    return { ok: false, error: 'invalid_closing_date' }
  }
  if (new Date(closingDate).getTime() < Date.now()) {
    return { ok: false, error: 'closing_date_in_past' }
  }

  return {
    ok: true,
    body: {
      email,
      property_address: propertyAddress.trim(),
      transaction_type: transactionType,
      closing_date: closingDate,
    },
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const parsed = parseBody(raw)
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 })
  }

  logEventAsync({
    type: 'lead.inbound',
    source: 'closeflow',
    email: parsed.body.email,
    status: 'pending',
    metadata: {
      product_id: PRODUCT_ID,
      transaction_type: parsed.body.transaction_type,
      closing_date: parsed.body.closing_date,
      stage: 'checkout_stub',
    },
  })

  return NextResponse.json(
    { ok: false, error: 'checkout_not_live', product_id: PRODUCT_ID },
    { status: 503 },
  )
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { ok: true, service: 'closeflow', endpoint: 'transaction/start', live: false },
    { status: 200 },
  )
}
