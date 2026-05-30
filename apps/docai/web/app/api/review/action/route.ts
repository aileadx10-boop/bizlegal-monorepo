import { NextResponse, type NextRequest } from 'next/server'
import { getSession } from '../../../../lib/auth'
import { requireTier } from '../../../../lib/tier-gate'
import { getSupabaseAdmin } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await requireTier(session.user.id, 'team')

  const body = await request.json().catch(() => null)
  if (!body?.review_id || !body?.action || !['approve', 'reject'].includes(body.action)) {
    return NextResponse.json({ error: 'review_id and action (approve/reject) required' }, { status: 400 })
  }

  const admin = getSupabaseAdmin()

  const { data: review } = await admin
    .from('conductor_reviews')
    .select('id, report_id, firm_email')
    .eq('id', body.review_id)
    .eq('firm_email', session.user.email)
    .single()

  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }

  const newStatus = body.action === 'approve' ? 'approved' : 'rejected'

  await admin.from('conductor_reviews').update({
    status: newStatus,
    reviewer_email: session.user.email,
    review_notes: body.notes || null,
    reviewed_at: new Date().toISOString(),
  }).eq('id', body.review_id)

  await admin.from('conductor_reports').update({
    status: 'attorney-reviewed',
    review_notes: body.notes || null,
  }).eq('id', review.report_id)

  return NextResponse.json({ review_id: body.review_id, status: newStatus })
}
