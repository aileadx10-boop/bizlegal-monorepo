import { NextRequest, NextResponse } from 'next/server'
import { createRoom, RoomError } from '@/lib/rooms/create'
import { createRoomSchema } from '@/lib/rooms/schemas'
import { buildInvite } from '@/lib/email/messages'
import { roomLink, sendRoomEmail } from '@/lib/email/send'
import { getServiceClient } from '@/lib/db'
import { isLocale, DEFAULT_LOCALE } from '@/lib/i18n/types'

/**
 * POST /api/admin/rooms — create a room. Phase 0 only.
 *
 * Gated by INTERNAL_API_SECRET, the same header pattern CoGuard uses for
 * provisioning. Phase 0 has no broker accounts: Moses sets up the ten rooms he
 * has been paid for, and each participant — the broker included — gets a link.
 * Phase 1 replaces this route with a magic-link dashboard; `createRoom()` is
 * already the shared implementation so the rules cannot drift apart.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function authorised(req: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET ?? ''
  if (!secret) return false
  return req.headers.get('x-internal-secret') === secret
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!authorised(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = createRoomSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_input', detail: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) },
      { status: 400 },
    )
  }

  let created
  try {
    created = await createRoom(parsed.data)
  } catch (err) {
    if (err instanceof RoomError) {
      return NextResponse.json({ error: err.code, detail: err.message }, { status: err.status })
    }
    console.error('[admin/rooms] create failed', err)
    return NextResponse.json({ error: 'create_failed' }, { status: 500 })
  }

  // Invites go out by default now. Pass send_invites:false to hold them and
  // forward the links by hand — the links come back either way.
  const invites: Array<{ email: string; ok: boolean; error?: string }> = []
  if (parsed.data.send_invites) {
    const broker = created.parties.find((p) => p.role === 'broker')
    const db = getServiceClient()
    for (const party of created.parties) {
      const locale = isLocale(party.locale) ? party.locale : DEFAULT_LOCALE
      const built = buildInvite({
        locale,
        brokerName: broker?.display_name ?? 'DEAL44',
        roomTitle: created.deal.title ?? '',
        role: party.role,
        link: roomLink(party.token),
      })
      const result = await sendRoomEmail({
        to: party.email,
        built,
        idempotencyKey: `deal44:invite:${party.id}`,
        replyTo: broker?.email,
        dealId: created.deal.id,
      })
      invites.push({ email: party.email, ok: result.ok, error: result.error })
      if (result.ok) {
        await db.from('deal_parties').update({ invited_at: new Date().toISOString() }).eq('id', party.id)
        await db.from('deal_alerts').insert({
          deal_id: created.deal.id,
          party_id: party.id,
          kind: 'invite',
          idempotency_key: `deal44:invite:${party.id}`,
        })
      }
    }
  }

  return NextResponse.json({
    ok: true,
    deal_id: created.deal.id,
    warnings: created.warnings,
    invites,
    // The raw tokens are returned exactly once, here. They are not recoverable
    // afterwards — the database stores only their hashes.
    links: created.parties.map((p) => ({
      role: p.role,
      name: p.display_name,
      email: p.email,
      url: roomLink(p.token),
    })),
  })
}
