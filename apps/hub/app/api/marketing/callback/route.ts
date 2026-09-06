import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * POST /api/marketing/callback — n8n reports a publish result (goal M.1).
 *
 * n8n POSTs { queue_id, content_type, url, status } after a workflow
 * publishes (or fails). We upsert published_content (proof surface, anon
 * readable) and mark the content_queue row: status + processed_at, with
 * the URL appended to published_urls.
 *
 * Auth: x-bizlegal-signature = HMAC-SHA256(raw body, BIZLEGAL_INBOUND_SECRET),
 * same scheme as /api/ops/log. n8n holds the secret in its credentials.
 *
 * Graceful degradation: if migration 20260906_content_queue hasn't been
 * applied yet, returns 503 marketing_tables_missing instead of a bare 500.
 */

const schema = z.object({
  queue_id: z.string().uuid(),
  content_type: z.string().min(1).max(100),
  url: z.string().url().max(2000),
  status: z.enum(['published', 'failed']),
  title: z.string().max(300).optional(),
  platform: z.string().max(50).optional(),
})

function verifyHmac(body: string, sig: string | null, secret: string): boolean {
  if (!sig || !secret) return false
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  if (expected.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  return diff === 0
}

function isMissingTable(err: { code?: string; message?: string } | null): boolean {
  return (
    err?.code === '42P01' ||
    (err?.message ?? '').includes('content_queue') ||
    (err?.message ?? '').includes('published_content')
  )
}

export async function POST(req: NextRequest) {
  const secret = process.env.BIZLEGAL_INBOUND_SECRET ?? ''
  if (!secret) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 })
  }

  const raw = await req.text()
  if (!verifyHmac(raw, req.headers.get('x-bizlegal-signature'), secret)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let parsed: z.infer<typeof schema>
  try {
    parsed = schema.parse(JSON.parse(raw))
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_payload', issues: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }

  // ── Mark the queue row (read-modify-write published_urls) ──
  const { data: item, error: fetchErr } = await supabaseAdmin
    .from('content_queue')
    .select('id, product, published_urls')
    .eq('id', parsed.queue_id)
    .maybeSingle()

  if (fetchErr) {
    if (isMissingTable(fetchErr)) {
      console.warn('[marketing/callback] tables missing — apply 20260906_content_queue.sql')
      return NextResponse.json(
        { error: 'marketing_tables_missing', migration: '20260906_content_queue' },
        { status: 503 },
      )
    }
    console.error('[marketing/callback] queue fetch failed:', fetchErr.message)
    return NextResponse.json({ error: 'callback_failed' }, { status: 500 })
  }
  if (!item) {
    return NextResponse.json({ error: 'queue item not found' }, { status: 404 })
  }

  const urls = Array.isArray(item.published_urls) ? (item.published_urls as unknown[]) : []
  urls.push({ content_type: parsed.content_type, url: parsed.url, platform: parsed.platform ?? null })

  const { error: updateErr } = await supabaseAdmin
    .from('content_queue')
    .update({
      status: parsed.status,
      processed_at: new Date().toISOString(),
      published_urls: urls,
    })
    .eq('id', parsed.queue_id)

  if (updateErr) {
    console.error('[marketing/callback] queue update failed:', updateErr.message)
    return NextResponse.json({ error: 'callback_failed' }, { status: 500 })
  }

  // ── Upsert the published-content proof row (published only) ──
  if (parsed.status === 'published') {
    const { error: pubErr } = await supabaseAdmin.from('published_content').upsert(
      {
        queue_id: parsed.queue_id,
        product: item.product,
        content_type: parsed.content_type,
        title: parsed.title ?? null,
        url: parsed.url,
        platform: parsed.platform ?? null,
      },
      { onConflict: 'queue_id,content_type,url' },
    )
    if (pubErr) {
      // Queue row is already marked — log loudly but don't fail the callback.
      console.error('[marketing/callback] published_content upsert failed:', pubErr.message)
    }
  }

  logEventAsync({
    type: 'webhook.received',
    source: 'hub',
    status: parsed.status === 'published' ? 'ok' : 'failed',
    metadata: {
      route: 'marketing/callback',
      queue_id: parsed.queue_id,
      content_type: parsed.content_type,
      url: parsed.url,
    },
  })

  return NextResponse.json({ ok: true })
}
