import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@bizlegal/ops-log'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * POST /api/tools/stablecoin-classifier
 *
 * Lead capture for the free stablecoin classifier. The classification
 * itself is computed client-side (deterministic — no API call). This
 * endpoint only stores an optional email so we can follow up about the
 * reserve-report upsell (O-007). Never blocks or affects the result.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const ipHits = new Map<string, { count: number; resetAt: number }>()

function allowed(req: NextRequest): boolean {
  const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  const now = Date.now()
  const entry = ipHits.get(ip)
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return true
  }
  entry.count += 1
  return entry.count <= 10
}

export async function POST(req: NextRequest) {
  if (!allowed(req)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }
  let body: { email?: string; result_type?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }
  const email = (body.email ?? '').trim().toLowerCase()
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid work email.' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
  }

  try {
    const sb = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    await sb.from('leads').insert({
      email,
      name: null,
      company: null,
      jurisdiction: null,
      source: 'stablecoin-classifier',
      page: '/tools/stablecoin-classifier',
      product: 'tracr',
    })
    logEventAsync({
      type: 'lead.inbound',
      source: 'hub',
      email,
      status: 'ok',
      metadata: { tool: 'stablecoin-classifier', result_type: body.result_type ?? null },
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    // Lead capture must never break the tool page — the client treats a
    // non-2xx here as "report saved anyway" and still shows the result.
    logEventAsync({
      type: 'error',
      source: 'hub',
      ref_id: 'stablecoin-classifier',
      status: 'failed',
      metadata: { reason: err instanceof Error ? err.message : 'unknown' },
    })
    return NextResponse.json({ ok: true, degraded: true })
  }
}
