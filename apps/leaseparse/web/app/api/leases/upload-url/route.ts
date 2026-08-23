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
 * Storage bucket: lease-documents (create in Supabase dashboard, private)
 * Storage path:  {email}/{lease_id}.pdf
 *
 * Body: { email, filename, size_bytes, lease_type?, property_id? }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db/client'
import { logEventAsync } from '@/lib/ops/log'

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

  // Create lease row (status: uploading — no parsed_at yet)
  const { data: lease, error: insertErr } = await db
    .from('leaseparse_leases')
    .insert({
      email: email.toLowerCase(),
      property_id: typeof property_id === 'string' ? property_id : null,
      lease_type: validLeaseType,
      critical_dates: [],
      risk_flags: [],
    })
    .select('id')
    .single()

  if (insertErr || !lease) {
    console.error('[leases/upload-url] insert failed', insertErr?.message)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  const storagePath = `${email.toLowerCase()}/${lease.id}_${sanitizeFilename(filename)}`

  // Signed upload URL — 15 min window is plenty for a PDF upload
  const { data: signed, error: storageErr } = await db.storage
    .from(BUCKET)
    .createSignedUploadUrl(storagePath)

  if (storageErr || !signed) {
    console.error('[leases/upload-url] storage error', storageErr?.message)
    // Clean up the row so the client can retry cleanly
    await db.from('leaseparse_leases').delete().eq('id', lease.id)
    return NextResponse.json(
      { error: 'storage_error', detail: storageErr?.message },
      { status: 500 }
    )
  }

  logEventAsync({
    type: 'lead.inbound',
    source: 'leaseparse',
    ref_id: lease.id,
    email: email.toLowerCase(),
    status: 'pending',
    metadata: { step: 'upload_url_issued', size_bytes, lease_type: validLeaseType },
  })

  return NextResponse.json({
    ok: true,
    lease_id: lease.id,
    storage_path: storagePath,
    upload_url: signed.signedUrl,
    token: signed.token,
    expires_in_seconds: 900,
  })
}
