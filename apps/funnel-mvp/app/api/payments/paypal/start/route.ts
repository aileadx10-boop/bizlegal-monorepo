import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@bizlegal/ops-log'
import { serviceSupabase } from '@/lib/supabase'
import { createOneTimeOrder } from '@/lib/paypal'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

interface Body {
  jobId?: string
}

/**
 * POST /api/payments/paypal/start
 * Body: { jobId }
 *
 * Looks up the funnel_jobs row, creates a PayPal Orders v2 order for the
 * job's amount (default $97), updates row with paypal_order_id, returns
 * { approve_url, order_id } for client-side redirect.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }
  const jobId = body.jobId?.trim() ?? ''
  if (!/^[0-9a-f-]{36}$/.test(jobId)) {
    return NextResponse.json({ error: 'invalid jobId' }, { status: 400 })
  }

  const supabase = serviceSupabase()
  const { data: job, error: jobErr } = await supabase
    .from('funnel_jobs')
    .select('id, user_email, status, amount_cents, currency, doc_filename')
    .eq('id', jobId)
    .maybeSingle()

  if (jobErr || !job) return NextResponse.json({ error: 'job not found' }, { status: 404 })
  if (!['preview_ready', 'payment_pending'].includes(job.status as string)) {
    return NextResponse.json({ error: `job not in payable state (current: ${job.status})` }, { status: 409 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://funnel.bizlegal-ai.com'

  let order
  try {
    order = await createOneTimeOrder({
      amountCents: (job.amount_cents as number) ?? 9700,
      currency: (job.currency as string) ?? 'USD',
      description: `BizLegal AI — Contract Risk Report (${(job.doc_filename as string) ?? 'document'})`,
      returnUrl: `${appUrl}/report/${jobId}?paid=1`,
      cancelUrl: `${appUrl}/report/${jobId}?cancelled=1`,
      customId: jobId,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'paypal failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  await supabase
    .from('funnel_jobs')
    .update({ paypal_order_id: order.orderId, status: 'payment_pending' })
    .eq('id', jobId)

  logEventAsync({
    type: 'payment.intent',
    source: 'hub',
    ref_id: jobId,
    email: job.user_email as string,
    amount_cents: (job.amount_cents as number) ?? 9700,
    status: 'pending',
    metadata: { surface: 'funnel-mvp', gateway: 'paypal', paypal_order_id: order.orderId },
  })

  return NextResponse.json({ order_id: order.orderId, approve_url: order.approveUrl })
}
