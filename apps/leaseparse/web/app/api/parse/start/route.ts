import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'
import { isCheckoutLive, startLeaseCheckout, CHECKOUT_GATE_ENV } from '@/lib/payments/checkout'

/**
 * POST /api/parse/start — entry point for a paid lease parse.
 *
 * Live flow:
 *   1. Validate payload (below).
 *   2. POST hub /api/pay/start { product_id: 'leaseparse_abstract_59',
 *      user_email, gateway } → return checkout_url for the browser.
 *   3. After payment the client calls /api/leases/upload-url for a signed
 *      Supabase Storage URL, PUTs the PDF, then calls /api/leases/ingest.
 *   4. Ingest: pdf text (text-layer only, scanned PDFs refunded) →
 *      hermes-first → claude-fallback (confidence < 0.85 only) →
 *      date-engine + risk score → persist → report + email.
 *
 * GATE: the whole money path stays dark until LEASEPARSE_CHECKOUT_LIVE is
 * switched on. The code below is complete and testable, but with the flag off
 * it still answers 503 checkout_not_live, per the trio decision doc — no money
 * is taken before a verified test purchase.
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024
const LEASE_TYPES = ['retail', 'office', 'industrial', 'other'] as const
const GATEWAYS = ['crypto', 'card'] as const

type LeaseType = (typeof LEASE_TYPES)[number]
type Gateway = (typeof GATEWAYS)[number]

interface ParseStartPayload {
  email: string
  filename: string
  size_bytes: number
  lease_type?: LeaseType
  gateway: Gateway
}

function parsePayload(raw: unknown): ParseStartPayload | null {
  if (typeof raw !== 'object' || raw === null) return null
  const body = raw as Record<string, unknown>
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const filename = typeof body.filename === 'string' ? body.filename.trim() : ''
  const sizeBytes = typeof body.size_bytes === 'number' ? body.size_bytes : NaN

  if (!email.includes('@') || email.length > 320) return null
  if (!filename.toLowerCase().endsWith('.pdf') || filename.length > 255) return null
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_UPLOAD_BYTES) return null

  const leaseType =
    typeof body.lease_type === 'string' && (LEASE_TYPES as readonly string[]).includes(body.lease_type)
      ? (body.lease_type as LeaseType)
      : undefined

  const gateway =
    typeof body.gateway === 'string' && (GATEWAYS as readonly string[]).includes(body.gateway)
      ? (body.gateway as Gateway)
      : 'crypto'

  return { email, filename, size_bytes: sizeBytes, lease_type: leaseType, gateway }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const payload = parsePayload(raw)
  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        error: 'invalid_payload',
        expected: {
          email: 'string',
          filename: '*.pdf',
          size_bytes: `<= ${MAX_UPLOAD_BYTES}`,
          gateway: 'crypto | card (optional, defaults to crypto)',
        },
      },
      { status: 400 }
    )
  }

  logEventAsync({
    type: 'lead.inbound',
    source: 'leaseparse',
    email: payload.email,
    metadata: {
      surface: 'parse_start',
      filename: payload.filename,
      size_bytes: payload.size_bytes,
      lease_type: payload.lease_type ?? 'unspecified',
      gateway: payload.gateway,
      checkout_live: isCheckoutLive(),
    },
  })

  // Gate stays closed by default. Validation above still runs so the endpoint
  // is exercisable end-to-end without a live gateway.
  if (!isCheckoutLive()) {
    return NextResponse.json(
      {
        ok: false,
        error: 'checkout_not_live',
        product_id: 'leaseparse_abstract_59',
        gate: CHECKOUT_GATE_ENV,
        detail: 'Checkout opens after a verified test purchase (trio decision doc).',
      },
      { status: 503 }
    )
  }

  const checkout = await startLeaseCheckout({
    email: payload.email,
    gateway: payload.gateway,
  })

  if (!checkout.ok) {
    logEventAsync({
      type: 'payment.failed',
      source: 'leaseparse',
      email: payload.email,
      status: 'failed',
      metadata: { surface: 'parse_start', error: checkout.error, detail: checkout.detail },
    })
    return NextResponse.json(
      { ok: false, error: checkout.error, detail: checkout.detail },
      { status: checkout.status }
    )
  }

  logEventAsync({
    type: 'agent.checkout',
    source: 'leaseparse',
    email: payload.email,
    ref_id: checkout.orderId,
    amount_cents: checkout.amountCents,
    status: 'pending',
    metadata: { surface: 'parse_start', provider: checkout.provider, gateway: payload.gateway },
  })

  return NextResponse.json({
    ok: true,
    product_id: 'leaseparse_abstract_59',
    order_id: checkout.orderId,
    provider: checkout.provider,
    checkout_url: checkout.checkoutUrl,
    amount_cents: checkout.amountCents,
    // The browser resumes here once payment clears.
    next_step: '/api/leases/upload-url',
  })
}
