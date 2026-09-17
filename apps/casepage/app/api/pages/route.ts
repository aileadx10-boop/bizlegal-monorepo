import type { NextRequest } from 'next/server'
import { createPage, pageLimitFor, readPages } from '@/lib/store'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = verifyToken(req.cookies.get('cp_session')?.value ?? '')
  if (!session) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  if (!body || typeof body.title !== 'string' || typeof body.template !== 'string' || !Array.isArray(body.milestones)) {
    return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }
  const pages = await readPages(session.email)
  const limit = await pageLimitFor(session.email)
  if (pages.length >= limit) {
    return Response.json({ ok: false, error: 'page_limit_reached', paywall: true, pricePath: '/pricing', limit }, { status: 402 })
  }
  const r = await createPage({ title: body.title, template: body.template, jurisdiction: body.jurisdiction ?? 'us', milestones: body.milestones }, session.email)
  return Response.json(r, { status: r.ok ? 200 : 500 })
}
