import { NextRequest, NextResponse } from 'next/server'
import { runNewsletterDigest } from '@/lib/agents/newsletter'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/newsletter/send
 *
 * Weekly cron: compiles the Regulatory Pulse digest and sends it to
 * every confirmed, active newsletter_subscribers row. Auth matches
 * the other cron endpoints — Bearer CRON_SECRET.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization') ?? ''
  const provided = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (new URL(req.url).searchParams.get('token') ?? '')
  const expected = process.env.CRON_SECRET ?? ''
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const result = await runNewsletterDigest()
  return NextResponse.json({ ok: true, ...result })
}
