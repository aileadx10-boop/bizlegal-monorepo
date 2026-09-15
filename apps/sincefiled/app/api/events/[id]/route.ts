import type { NextRequest } from 'next/server'
import { logObligationEvent } from '@/lib/data'
export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  const id = ctx.params.id
  if (!id) return Response.json({ ok: false, error: 'missing_id' }, { status: 400 })
  const r = await logObligationEvent({ obligationId: id })
  return Response.json(r, { status: r.ok ? 200 : 500 })
}
