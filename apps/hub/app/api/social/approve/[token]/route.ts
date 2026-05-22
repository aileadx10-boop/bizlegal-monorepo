import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * GET /api/social/approve/<token>?action=approve|reject
 *
 * Telegram one-click approval. The bot sends the digest with two URL
 * buttons per draft (approve / reject), each carrying the draft's
 * unique approval_token. This endpoint flips status and the social-
 * queue cron drains approved rows on the next firing.
 *
 * No auth beyond the unguessable 32-char token. Single-shot: once a
 * token has been consumed, status != pending_approval and re-using
 * the link is a no-op.
 */
export async function GET(req: NextRequest, { params }: { params: { token: string } }): Promise<NextResponse> {
  const token = params.token
  if (!/^[a-f0-9]{32}$/.test(token)) {
    return NextResponse.json({ error: 'invalid token' }, { status: 400 })
  }
  const action = req.nextUrl.searchParams.get('action') ?? 'approve'
  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 })
  }
  const newStatus = action === 'approve' ? 'approved' : 'rejected'

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: 'supabase env missing' }, { status: 500 })
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data, error } = await supabase
    .from('social_drafts')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('approval_token', token)
    .eq('status', 'pending_approval')
    .select('id, channel, source_title')
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: 'token expired or already used' }, { status: 410 })
  }

  logEventAsync({
    type: 'social.draft',
    source: 'hub',
    ref_id: String(data.id),
    status: 'ok',
    metadata: { action: newStatus, channel: data.channel, source_title: data.source_title },
  })

  return NextResponse.json({ ok: true, id: data.id, channel: data.channel, status: newStatus })
}
