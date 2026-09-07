import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { resolveRoomByToken, recordEvent, touchParty } from '@/lib/rooms/create'
import { buildRoomPayload } from '@/lib/rooms/payload'
import RoomView from './RoomView'

/**
 * A party's room, addressed by their own link.
 *
 * The token is hashed and looked up with the service client — there is no anon
 * RLS policy to lean on, deliberately. An unknown token and an expired one both
 * render the same 404, so probing cannot tell them apart.
 */

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'DEAL44',
}

export default async function RoomPage({ params }: { params: { token: string } }) {
  const resolved = await resolveRoomByToken(params.token)
  if (!resolved) notFound()

  touchParty(resolved.party.id)
  void recordEvent(resolved.deal.id, resolved.party.id, resolved.party.role, 'party.viewed')

  return <RoomView token={params.token} initial={buildRoomPayload(resolved)} />
}
