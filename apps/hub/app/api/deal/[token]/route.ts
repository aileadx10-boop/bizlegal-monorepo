import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendToTelegram } from '@/lib/agents/ea-runner'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * GET /api/deal/<token>
 *
 * Loads a private deal room by its unguessable token (32+ hex chars,
 * minted by /api/qualify — same shape as social approval tokens).
 *
 * - 404 when the token matches nothing.
 * - 410 when the room is past expires_at (status flipped to 'expired'
 *   lazily on first hit after the deadline).
 * - First view flips status open -> viewed, stamps viewed_at, and
 *   Telegram-notifies Moses (standing-order O3: know the moment a
 *   prospect opens their room). Subsequent views are read-only.
 *
 * The token never goes to ops_events or server logs — Telegram (Moses's
 * private channel) and the buyer's email are the only places it travels.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } },
): Promise<NextResponse> {
  const token = params.token
  if (!/^[a-f0-9]{32,64}$/.test(token)) {
    return NextResponse.json({ error: 'invalid token' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: 'supabase env missing' }, { status: 500 })
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: room, error } = await supabase
    .from('deal_rooms')
    .select('id, email, offer_tier, price_usd, scope_md, status, expires_at, viewed_at, created_at')
    .eq('token', token)
    .maybeSingle()

  if (error || !room) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const expired =
    room.status === 'expired' ||
    (room.expires_at && new Date(String(room.expires_at)).getTime() < Date.now() && room.status !== 'paid')

  if (expired) {
    if (room.status !== 'expired') {
      await supabase.from('deal_rooms').update({ status: 'expired' }).eq('id', room.id)
    }
    return NextResponse.json(
      { error: 'expired', offer_tier: room.offer_tier, expires_at: room.expires_at },
      { status: 410 },
    )
  }

  // First view — stamp it and alert Moses (O3)
  if (room.status === 'open' && !room.viewed_at) {
    const viewedAt = new Date().toISOString()
    await supabase
      .from('deal_rooms')
      .update({ status: 'viewed', viewed_at: viewedAt })
      .eq('id', room.id)
      .eq('status', 'open')
    room.status = 'viewed'
    room.viewed_at = viewedAt
    void sendToTelegram(
      `👀 *Deal room viewed*\n${room.email}\nCustom Build (${room.offer_tier}) — $${Number(room.price_usd).toLocaleString('en-US')}\nExpires ${new Date(String(room.expires_at)).toLocaleDateString('en-US')}`,
    )
  }

  return NextResponse.json({
    email: room.email,
    offer_tier: room.offer_tier,
    price_usd: room.price_usd,
    scope_md: room.scope_md,
    status: room.status,
    expires_at: room.expires_at,
    created_at: room.created_at,
  })
}
