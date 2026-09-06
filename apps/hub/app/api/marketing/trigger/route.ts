import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * POST /api/marketing/trigger — marketing content queue intake (goal M.1).
 *
 * Fleet apps (falseecho, sellerradar) fire-and-forget POST here when a
 * content-worthy event happens (falsehood_detected, fee_change_detected).
 * The row lands in content_queue; the services/marketing Trigger.dev
 * schedule picks it up every 6h and hands it to n8n. n8n reports back via
 * /api/marketing/callback.
 *
 * Auth: x-bizlegal-signature = HMAC-SHA256(raw body, BIZLEGAL_INBOUND_SECRET),
 * same scheme as /api/ops/log and /api/content/syndicate.
 *
 * Graceful degradation: if migration 20260906_content_queue hasn't been
 * applied yet, returns 503 marketing_tables_missing instead of a bare 500.
 */

const schema = z.object({
  product: z.string().min(1).max(50),
  event_type: z.string().min(1).max(100),
  payload: z.record(z.string(), z.unknown()).default({}),
  content_types: z.array(z.string().max(50)).max(20).optional(),
  scheduled_for: z.string().datetime().optional(),
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
  return err?.code === '42P01' || (err?.message ?? '').includes('content_queue')
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

  const { data, error } = await supabaseAdmin
    .from('content_queue')
    .insert({
      product: parsed.product,
      event_type: parsed.event_type,
      payload: parsed.payload,
      content_types: parsed.content_types ?? null,
      scheduled_for: parsed.scheduled_for ?? null,
    })
    .select('id')
    .single()

  if (error || !data) {
    if (isMissingTable(error)) {
      console.warn('[marketing/trigger] content_queue missing — apply 20260906_content_queue.sql')
      return NextResponse.json(
        { error: 'marketing_tables_missing', migration: '20260906_content_queue' },
        { status: 503 },
      )
    }
    console.error('[marketing/trigger] insert failed:', error?.message)
    return NextResponse.json({ error: 'enqueue_failed' }, { status: 500 })
  }

  logEventAsync({
    type: 'webhook.received',
    source: 'hub',
    status: 'ok',
    metadata: { route: 'marketing/trigger', product: parsed.product, event_type: parsed.event_type },
  })

  return NextResponse.json({ ok: true, id: data.id })
}
