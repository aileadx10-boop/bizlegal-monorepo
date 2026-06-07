import { NextResponse, type NextRequest } from 'next/server'
import { getSession } from '../../../../lib/auth'
import { requireTier } from '../../../../lib/tier-gate'
import { getSupabaseAdmin } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await requireTier(session.user.id, 'team')

  const body = await request.json().catch(() => null)
  if (!body?.report_id) {
    return NextResponse.json({ error: 'report_id required' }, { status: 400 })
  }

  const admin = getSupabaseAdmin()

  const { data: report } = await admin
    .from('conductor_reports')
    .select('id, user_id')
    .eq('id', body.report_id)
    .eq('user_id', session.user.id)
    .single()

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  const { data: review, error } = await admin.from('conductor_reviews').insert({
    report_id: body.report_id,
    firm_email: session.user.email,
    priority: body.priority || 'normal',
    status: 'pending',
  }).select('id').single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }

  await admin
    .from('conductor_reports')
    .update({ status: 'review-flagged' })
    .eq('id', body.report_id)

  return NextResponse.json({ review_id: review.id, status: 'pending' })
}
