import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, clientIpFromHeaders } from '@bizlegal/rate-limit'
import { resolveRoomByToken, recordEvent } from '@/lib/rooms/create'
import { addPartySchema } from '@/lib/rooms/schemas'
import { canManageRoom } from '@/lib/rooms/access'
import { encryptToken, hashToken, mintToken } from '@/lib/rooms/tokens'
import { buildInvite } from '@/lib/email/messages'
import { roomLink, sendRoomEmail } from '@/lib/email/send'
import { getServiceClient } from '@/lib/db'
import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n/types'

/**
 * POST /api/r/[token]/parties — the broker adds a participant mid-transaction.
 *
 * Transactions gain people: the buyer instructs a lawyer in week two, a mortgage
 * advisor appears once financing starts. Rebuilding the room to add one person
 * would invalidate everyone else's link.
 *
 * The new party's raw link is returned exactly once, here. Sending the invite is
 * opt-in per call and defaults OFF — the spam-law position on messaging a party
 * who never wrote to us is still Moses's to confirm, so the default is that he
 * forwards the link himself. See lib/email/send.ts for the full justification.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 30

interface Ctx {
  params: { token: string }
}

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const limit = rateLimit('deal44-party-add', clientIpFromHeaders(req.headers) ?? 'unknown', {
    limit: 20,
    windowMs: 60_000,
  })
  if (!limit.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  const resolved = await resolveRoomByToken(params.token)
  if (!resolved) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  if (!canManageRoom(resolved.party)) {
    return NextResponse.json({ error: 'not_permitted' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = addPartySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
  const input = parsed.data

  const db = getServiceClient()
  const token = mintToken()
  const locale = isLocale(input.locale) ? input.locale : DEFAULT_LOCALE

  const { data, error } = await db
    .from('deal_parties')
    .insert({
      deal_id: resolved.deal.id,
      role: input.role,
      display_name: input.name,
      email: input.email,
      locale,
      token_hash: hashToken(token),
      token_cipher: encryptToken(token),
      // Inherit the room's expiry so links do not outlive the transaction.
      token_expires_at: resolved.party.token_expires_at,
    })
    .select('*')
    .single()

  if (error) {
    // The (deal_id, email, role) uniqueness is deliberate: adding the same
    // person twice would give them two links and double their reminders.
    const conflict = error.code === '23505'
    return NextResponse.json(
      { error: conflict ? 'already_in_room' : 'db_error', detail: error.message },
      { status: conflict ? 409 : 500 },
    )
  }

  await recordEvent(resolved.deal.id, resolved.party.id, resolved.party.role, 'party.added', {
    role: input.role,
    party_id: data.id,
  })

  let invite: { ok: boolean; error?: string } | null = null
  if (input.send_invite) {
    const built = buildInvite({
      locale,
      brokerName: resolved.party.display_name,
      roomTitle: resolved.deal.title ?? '',
      role: input.role,
      link: roomLink(token),
    })
    const result = await sendRoomEmail({
      to: input.email,
      built,
      idempotencyKey: `deal44:invite:${data.id}`,
      replyTo: resolved.party.email,
      dealId: resolved.deal.id,
    })
    invite = { ok: result.ok, error: result.error }
    if (result.ok) {
      await db.from('deal_parties').update({ invited_at: new Date().toISOString() }).eq('id', data.id)
      await db.from('deal_alerts').insert({
        deal_id: resolved.deal.id,
        party_id: data.id,
        kind: 'invite',
        idempotency_key: `deal44:invite:${data.id}`,
      })
    }
  }

  return NextResponse.json({
    ok: true,
    party: { id: data.id, role: data.role, display_name: data.display_name },
    url: roomLink(token),
    invite,
  })
}
