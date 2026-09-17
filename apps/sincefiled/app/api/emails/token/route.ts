import type { NextRequest } from 'next/server'
import { createEmailLogToken } from '@/lib/data'
import { verifyToken } from '@/lib/auth'
export async function POST(req: NextRequest) {
  const session = verifyToken(req.cookies.get('sf_session')?.value ?? '')
  if (!session) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  if (!body || typeof body.obligationId !== 'string') return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  const r = await createEmailLogToken({ obligationId: body.obligationId, ownerEmail: session.email })
  return Response.json(r, { status: r.ok ? 200 : r.error === 'not_found' ? 404 : 500 })
}
