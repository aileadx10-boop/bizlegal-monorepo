import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@bizlegal/ops-log'
import { serviceSupabase, STORAGE_BUCKET } from '@/lib/supabase'
import { extractDocumentText } from '@/lib/extract'
import { extractWithFallback } from '@/lib/ai/extract'
import { buildPreview } from '@/lib/ai/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const AFFILIATE_COOKIE = 'bz_aff'
const MAX_BYTES = 4_000_000 // ~4MB, Vercel function body limit is 4.5MB

function readAffiliateCode(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.split(';').find((c) => c.trim().startsWith(`${AFFILIATE_COOKIE}=`))
  if (!match) return null
  const val = match.split('=')[1]?.trim() ?? ''
  return /^[a-z0-9]{8}$/.test(val) ? val : null
}

/**
 * POST /api/upload
 *
 * Single-shot: multipart/form-data with `file` + `email` fields.
 * Server stores file → parses → runs AI extraction → writes funnel_jobs row
 * with status=preview_ready, returns { jobId, preview, overall_risk }.
 *
 * Client redirects to /report/<jobId> to see preview + paywall.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now()

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'expected multipart/form-data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const email = String(formData.get('email') ?? '').trim().toLowerCase()

  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'valid email required' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `file too large (max ${MAX_BYTES} bytes)` }, { status: 413 })
  }

  const arrayBuf = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuf)

  const supabase = serviceSupabase()
  const affiliateCode = readAffiliateCode(req.headers.get('cookie'))

  // 1. Create job row in 'uploaded' state
  const { data: jobRow, error: insertErr } = await supabase
    .from('funnel_jobs')
    .insert({
      user_email: email,
      status: 'uploaded',
      doc_storage_key: 'pending',
      doc_filename: file.name,
      doc_mime: file.type,
      doc_size_bytes: file.size,
      affiliate_code: affiliateCode,
    })
    .select('id')
    .single()

  if (insertErr || !jobRow) {
    return NextResponse.json({ error: 'job creation failed' }, { status: 500 })
  }
  const jobId = jobRow.id as string

  // 2. Upload to Supabase Storage
  const storageKey = `uploads/${jobId}/${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const { error: storageErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storageKey, buffer, { contentType: file.type, upsert: true })

  if (storageErr) {
    await supabase.from('funnel_jobs').update({ status: 'failed', error_message: `storage: ${storageErr.message}` }).eq('id', jobId)
    return NextResponse.json({ error: `storage upload failed: ${storageErr.message}` }, { status: 500 })
  }
  await supabase.from('funnel_jobs').update({ doc_storage_key: storageKey, status: 'extracting' }).eq('id', jobId)

  // 3. Parse + extract
  let preview: string
  let overallRisk: 'low' | 'medium' | 'high'
  try {
    const parsed = await extractDocumentText(buffer, file.type, file.name)
    if (!parsed.text.trim()) throw new Error('document had no extractable text')
    const { result, provider } = await extractWithFallback(parsed.text)
    preview = buildPreview(result)
    overallRisk = result.overall_risk

    await supabase
      .from('funnel_jobs')
      .update({
        status: 'preview_ready',
        extracted_json: result,
        preview_text: preview,
        metadata: { provider, page_count: parsed.pageCount, duration_ms: Date.now() - startedAt },
      })
      .eq('id', jobId)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'extraction failed'
    await supabase.from('funnel_jobs').update({ status: 'failed', error_message: message }).eq('id', jobId)
    logEventAsync({
      type: 'error',
      source: 'hub',
      ref_id: jobId,
      email,
      status: 'failed',
      metadata: { stage: 'extract', error: message },
    })
    return NextResponse.json({ error: message, jobId }, { status: 500 })
  }

  logEventAsync({
    type: 'snapshot.generated',
    source: 'hub',
    ref_id: jobId,
    email,
    status: 'ok',
    metadata: {
      surface: 'funnel-mvp',
      filename: file.name,
      size_bytes: file.size,
      overall_risk: overallRisk,
      affiliate_code: affiliateCode,
      duration_ms: Date.now() - startedAt,
    },
  })

  return NextResponse.json({
    jobId,
    preview,
    overall_risk: overallRisk,
    next_url: `/report/${jobId}`,
  })
}
