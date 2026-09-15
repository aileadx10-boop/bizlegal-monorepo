import type { NextRequest } from 'next/server'
import { updatePage } from '@/lib/store'
export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const body = await req.json().catch(() => null)
  const r = await updatePage(ctx.params.id, body ?? {})
  return Response.json(r, { status: r.ok ? 200 : 500 })
}
