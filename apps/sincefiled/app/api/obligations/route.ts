import type { NextRequest } from 'next/server'
import { createObligation } from '@/lib/data'
import { canCreateObligation } from '@/lib/paywall'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body.obligationType !== 'string' || typeof body.intervalDays !== 'number' || typeof body.jurisdiction !== 'string') {
    return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }
  const gate = await canCreateObligation()
  if (!gate.allowed) {
    return Response.json({ ok: false, error: 'paywall_4th_obligation', paywall: true, pricePath: '/pricing', ...gate }, { status: 402 })
  }
  const r = await createObligation(body)
  return Response.json(r, { status: r.ok ? 200 : 500 })
}
