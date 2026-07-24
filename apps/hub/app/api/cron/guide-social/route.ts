import { NextRequest, NextResponse } from 'next/server'
import { runGuideSocialPoster } from '@/lib/agents/social-poster'

export const dynamic = 'force-dynamic'
export const maxDuration = 90

/**
 * GET /api/cron/guide-social
 *
 * Daily: syndicate a small batch of not-yet-drafted guides to
 * LinkedIn/X/Reddit/Buffer via the existing social_drafts +
 * Telegram-approval pipeline. Bearer CRON_SECRET, same as every
 * other cron endpoint.
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

  const result = await runGuideSocialPoster()
  return NextResponse.json({ ok: true, ...result })
}
