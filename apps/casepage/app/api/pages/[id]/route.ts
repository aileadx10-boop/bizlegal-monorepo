import type { NextRequest } from 'next/server'
import { updatePage } from '@/lib/store'
import { verifyToken } from '@/lib/auth'
export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const session = verifyToken(req.cookies.get('cp_session')?.value ?? '')
  if (!session) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const r = await updatePage(ctx.params.id, body ?? {}, session.email)
  return Response.json(r, { status: r.ok ? 200 : r.error === 'not_found' ? 404 : 500 })
}
