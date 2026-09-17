import type { NextRequest } from 'next/server'
import { logObligationEvent } from '@/lib/data'
import { verifyToken } from '@/lib/auth'
export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  const session = verifyToken(req.cookies.get('sf_session')?.value ?? '')
  if (!session) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  const id = ctx.params.id
  if (!id) return Response.json({ ok: false, error: 'missing_id' }, { status: 400 })
  const r = await logObligationEvent({ obligationId: id, ownerEmail: session.email })
  return Response.json(r, { status: r.ok ? 200 : r.error === 'not_found' ? 404 : 500 })
}
