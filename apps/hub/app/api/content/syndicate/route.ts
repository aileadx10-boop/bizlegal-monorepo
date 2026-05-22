import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { logEventAsync } from '@/lib/ops/log'
import { syndicateArticle } from '@/lib/social/syndicate'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/content/syndicate
 * Body: { source_url, source_title, source_summary }
 * Header: x-bizlegal-signature (HMAC over body, same key as /api/ops/log)
 *
 * Called by Hetzner publisher.py after content.published. Generates 4
 * channel drafts and writes them to social_drafts table for Moses to
 * approve via Telegram.
 */

interface Body {
  source_url?: string
  source_title?: string
  source_summary?: string
}

function verifyHmac(body: string, sig: string | null, secret: string): boolean {
  if (!sig || !secret) return false
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  if (expected.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  return diff === 0
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const raw = await req.text()
  const sig = req.headers.get('x-bizlegal-signature')
  const secret = process.env.BIZLEGAL_INBOUND_SECRET ?? ''
  if (!verifyHmac(raw, sig, secret)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: Body
  try {
    body = JSON.parse(raw) as Body
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }
  if (!body.source_url || !body.source_title) {
    return NextResponse.json({ error: 'source_url, source_title required' }, { status: 400 })
  }

  const summary = (body.source_summary ?? '').slice(0, 1200)
  const results = await syndicateArticle({
    source_url: body.source_url,
    source_title: body.source_title,
    source_summary: summary,
  })

  const ok = results.filter((r) => r.ok).length
  logEventAsync({
    type: 'social.draft',
    source: 'hub',
    ref_id: body.source_url,
    status: ok > 0 ? 'ok' : 'failed',
    metadata: { results, source_title: body.source_title },
  })

  return NextResponse.json({ ok: ok > 0, results })
}
