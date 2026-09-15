import type { NextRequest } from 'next/server'
import { createPage, readPages, isEntitled } from '@/lib/store'

export const PAGE_FREE_LIMIT = 10

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body.title !== 'string' || typeof body.template !== 'string' || !Array.isArray(body.milestones)) {
    return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }
  const entitled = await isEntitled()
  const pages = await readPages()
  if (!entitled && pages.length >= PAGE_FREE_LIMIT) {
    return Response.json({ ok: false, error: 'paywall_10_pages', paywall: true, pricePath: '/pricing' }, { status: 402 })
  }
  const r = await createPage({ title: body.title, template: body.template, jurisdiction: body.jurisdiction ?? 'us', milestones: body.milestones })
  return Response.json(r, { status: r.ok ? 200 : 500 })
}
