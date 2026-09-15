/**
 * POST /api/leases/upload-url
 *
 * Step 1 of the DocParse flow. Returns a Supabase Storage signed upload
 * URL so the browser can PUT the PDF directly to storage, bypassing
 * Vercel's 4.5 MB request body cap.
 *
 * After the upload completes the client calls POST /api/leases/ingest
 * with the returned { lease_id, storage_path }.
 *
 * Storage bucket: lease-documents (private; created by
 *   supabase/migrations/20260915_leaseparse_paid_gate.sql)
 * Storage path:  {email}/{lease_id}.pdf
 *
 * PAID GATE (§B4, 2026-09-15): this route issues a write credential and starts
 * a job that ends in Claude spend and an outbound email, so it does nothing at
 * all without a paid credit for the caller — 503 checkout_dark while the flag
 * is off, 402 payment_required otherwise. See lib/payments/credits.ts.
 *
 * Body: { email, filename, size_bytes, lease_type?, property_id?, order_id? }
 * Query: ?order=<hub payment_orders id>  (alternative to body order_id)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db/client'
import { logEventAsync } from '@/lib/ops/log'
import {
  claimLeaseCredit,
  normaliseOrderId,
  requireLeaseCredit,
} from '@/lib/payments/credits'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

const MAX_BYTES = 20 * 1024 * 1024   // 20 MB
const BUCKET = 'lease-documents'

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const {
    email,
    filename,
    size_bytes,
    lease_type,
    property_id,
  } = body as Record<string, unknown>

  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'email_required' }, { status: 400 })
  }
  if (typeof filename !== 'string' || !filename.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ error: 'filename_must_be_pdf' }, { status: 400 })
  }
  if (typeof size_bytes !== 'number' || size_bytes > MAX_BYTES) {
    return NextResponse.json(
      { error: 'size_exceeds_20mb', max_bytes: MAX_BYTES },
      { status: 400 }
    )
  }

  const leaseTypes = ['retail', 'office', 'industrial', 'other'] as const
  type LeaseType = (typeof leaseTypes)[number]
  const validLeaseType: LeaseType | null =
    typeof lease_type === 'string' && (leaseTypes as readonly string[]).includes(lease_type)
      ? (lease_type as LeaseType)
      : null

  const db = getServiceClient()

  // ── The gate. Nothing above this line touched storage or the LLM; nothing
  //    below it runs without a paid credit. ────────────────────────────────
  const orderId =
    normaliseOrderId(req.nextUrl.searchParams.get('order')) ||
    normaliseOrderId((body as Record<string, unknown>).order_id)

  const gate = await requireLeaseCredit(db, { email, orderId })
  if (!gate.ok) {
    logEventAsync({
      type: 'payment.failed',
      source: 'leaseparse',
      email: email.toLowerCase(),
      status: 'failed',
      metadata: { step: 'upload_url_gate', error: gate.body.error, order_id: orderId || null },
    })
    return NextResponse.json(gate.body, { status: gate.status })
  }
  const credit = gate.credit

  // A credit already bound to an unparsed lease is a retry, not a second sale:
  // reuse that row rather than minting another (and charging again).
  let leaseId: string | null = null
  if (credit.lease_id) {
    const { data: existing } = await db
      .from('leaseparse_leases')
      .select('id, parsed_at')
      .eq('id', credit.lease_id)
      .maybeSingle()
    if (existing && !existing.parsed_at) leaseId = existing.id as string
  }

  if (!leaseId) {
    // Create lease row (status: uploading — no parsed_at yet)
    const { data: lease, error: insertErr } = await db
      .from('leaseparse_leases')
      .insert({
        email: email.toLowerCase(),
        property_id: typeof property_id === 'string' ? property_id : null,
        lease_type: validLeaseType,
        critical_dates: [],
        risk_flags: [],
        paid_order_id: credit.order_id,
        parse_status: 'pending',
      })
      .select('id')
      .single()

    if (insertErr || !lease) {
      console.error('[leases/upload-url] insert failed', insertErr?.message)
      return NextResponse.json({ error: 'db_error' }, { status: 500 })
    }
    leaseId = lease.id as string
  }

  const lease = { id: leaseId }
  const storagePath = `${email.toLowerCase()}/${lease.id}_${sanitizeFilename(filename)}`

  // Signed upload URL — 15 min window is plenty for a PDF upload.
  // upsert: a retry against the reused lease row targets the same path, and
  // "resource already exists" would otherwise strand a paying customer.
  const { data: signed, error: storageErr } = await db.storage
    .from(BUCKET)
    .createSignedUploadUrl(storagePath, { upsert: true })

  if (storageErr || !signed) {
    console.error('[leases/upload-url] storage error', storageErr?.message)
    // Clean up the row so the client can retry cleanly
    await db.from('leaseparse_leases').delete().eq('id', lease.id)
    return NextResponse.json(
      { error: 'storage_error', detail: storageErr?.message },
      { status: 500 }
    )
  }

  // Bind the credit to this lease. It is not spent yet — only a delivered
  // abstract consumes it (see /api/leases/ingest), so a failed upload is
  // retryable without a second purchase.
  await claimLeaseCredit(db, credit.id, lease.id)

  logEventAsync({
    type: 'lead.inbound',
    source: 'leaseparse',
    ref_id: lease.id,
    email: email.toLowerCase(),
    status: 'pending',
    metadata: {
      step: 'upload_url_issued',
      size_bytes,
      lease_type: validLeaseType,
      order_id: credit.order_id,
    },
  })

  return NextResponse.json({
    ok: true,
    lease_id: lease.id,
    order_id: credit.order_id,
    storage_path: storagePath,
    upload_url: signed.signedUrl,
    token: signed.token,
    expires_in_seconds: 900,
  })
}
