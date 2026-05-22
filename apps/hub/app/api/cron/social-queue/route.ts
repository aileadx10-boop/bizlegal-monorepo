import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'
import { ADAPTERS } from '@/lib/social/channels'
import type { SocialChannel } from '@/lib/social/syndicate'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/cron/social-queue
 *
 * Drain approved social_drafts rows. For each, call the channel
 * adapter, update status to posted/failed, log social.posted.
 *
 * Throttle: max 1 post per channel per run. If 4 channels each have an
 * approved draft, one of each posts; remaining stay queued for next
 * tick.
 *
 * Auth: Bearer CRON_SECRET.
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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: 'supabase env missing' }, { status: 500 })
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  // Pick the oldest approved row per channel
  const { data: drafts } = await supabase
    .from('social_drafts')
    .select('id, channel, body, channel_meta, source_url, source_title')
    .eq('status', 'approved')
    .order('created_at', { ascending: true })
    .limit(20)

  const picked = new Map<SocialChannel, NonNullable<typeof drafts>[number]>()
  for (const d of drafts ?? []) {
    const ch = d.channel as SocialChannel
    if (!picked.has(ch)) picked.set(ch, d)
  }

  const results: Array<{ id: number; channel: SocialChannel; ok: boolean; error?: string; posted_url?: string }> = []
  for (const entry of Array.from(picked.entries())) {
    const channel = entry[0]
    const draft = entry[1]
    const adapter = ADAPTERS[channel]
    const r = await adapter(draft.body as string, (draft.channel_meta ?? {}) as Record<string, unknown>)
    const newStatus = r.ok ? 'posted' : 'failed'
    await supabase
      .from('social_drafts')
      .update({
        status: newStatus,
        posted_url: r.posted_url ?? null,
        posted_at: r.ok ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', draft.id)

    logEventAsync({
      type: 'social.posted',
      source: 'hub',
      ref_id: String(draft.id),
      status: r.ok ? 'ok' : 'failed',
      metadata: {
        channel,
        source_url: draft.source_url,
        posted_url: r.posted_url ?? null,
        error: r.error ?? null,
      },
    })
    results.push({ id: draft.id, channel, ok: r.ok, error: r.error, posted_url: r.posted_url })
  }

  logEventAsync({
    type: 'cron.completed',
    source: 'hub',
    ref_id: 'social-queue',
    metadata: {
      cron: 'social-queue',
      queued: drafts?.length ?? 0,
      attempted: picked.size,
      successes: results.filter((r) => r.ok).length,
      failures: results.filter((r) => !r.ok).length,
    },
  })

  return NextResponse.json({ ok: true, attempted: picked.size, results })
}
