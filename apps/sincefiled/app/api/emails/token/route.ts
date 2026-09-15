import type { NextRequest } from 'next/server'
import { createEmailLogToken } from '@/lib/data'
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body.obligationId !== 'string') return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  const r = await createEmailLogToken({ obligationId: body.obligationId })
  return Response.json(r, { status: r.ok ? 200 : 500 })
}
