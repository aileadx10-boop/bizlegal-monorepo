import { NextRequest, NextResponse } from 'next/server'
import { serviceSupabase, STORAGE_BUCKET } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * GET /api/jobs/<id>
 *
 * Returns the job state. If status=full_report_ready, includes a fresh
 * 1-hour signed URL for the PDF download.
 *
 * No auth — caller needs to know the UUID. UUIDs are unguessable.
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const id = params.id
  if (!/^[0-9a-f-]{36}$/.test(id)) {
    return NextResponse.json({ error: 'invalid job id' }, { status: 400 })
  }
  const supabase = serviceSupabase()
  const { data, error } = await supabase
    .from('funnel_jobs')
    .select('id, user_email, status, doc_filename, doc_size_bytes, preview_text, full_report_key, paypal_order_id, amount_cents, currency, error_message, created_at, paid_at, completed_at, metadata')
    .eq('id', id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })

  // Generate a fresh signed URL for the report PDF if available
  let report_download_url: string | null = null
  if (data.status === 'full_report_ready' && data.full_report_key) {
    const { data: signed } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(data.full_report_key, 3600)
    report_download_url = signed?.signedUrl ?? null
  }

  return NextResponse.json({ ...data, report_download_url })
}
