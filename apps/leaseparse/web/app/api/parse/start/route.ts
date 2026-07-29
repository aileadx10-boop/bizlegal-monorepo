import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'

/**
 * POST /api/parse/start — entry point for a paid lease parse.
 *
 * SCAFFOLD STATUS: checkout is intentionally dark (503 checkout_not_live)
 * until the trio passes Z7-style verification (root CLAUDE.md hard rule #5).
 *
 * Intended live flow:
 *   1. Validate payload (below).
 *   2. POST hub /checkout (apex) — NOT /api/pay/start, which is disabled 2026-07-30
 *      because it never inserted a payment_orders row and its bz_* order_id
 *      could not be reconciled by the IPN webhook. Use:
 *      https://bizlegal-ai.com/checkout?product=&tier=&interval=&amount=&name=
 *      (product family 'leaseparse', tier 'abstract',
 *      user_email, gateway } → redirect user to checkout_url.
 *   3. On payment webhook: signed upload URL to Supabase storage.
 *   4. Extraction pipeline: pdf text → lib/extract/hermes-first →
 *      claude-fallback (confidence < 0.85 only) → date-engine →
 *      persist to leaseparse_leases → email abstract via Resend.
 */

export const dynamic = 'force-dynamic'

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024
const LEASE_TYPES = ['retail', 'office', 'industrial', 'other'] as const

type LeaseType = (typeof LEASE_TYPES)[number]

interface ParseStartPayload {
  email: string
  filename: string
  size_bytes: number
  lease_type?: LeaseType
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

  return { email, filename, size_bytes: sizeBytes, lease_type: leaseType }
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
      { ok: false, error: 'invalid_payload', expected: { email: 'string', filename: '*.pdf', size_bytes: `<= ${MAX_UPLOAD_BYTES}` } },
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
    },
  })

  return NextResponse.json(
    { ok: false, error: 'checkout_not_live', product_id: 'leaseparse_abstract_59' },
    { status: 503 }
  )
}
