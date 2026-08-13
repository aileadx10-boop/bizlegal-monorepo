/**
 * Hub /api/tools/ofac-watcher/watch — registers the addresses/entities a
 * prospective OFAC Watcher subscriber wants monitored.
 *
 * Called by /tools/ofac-watcher immediately before checkout. Rows land as
 * status='pending' and are flipped to 'active' by grantOfacWatch() when the
 * payment webhook confirms the order — the daily cron only screens 'active'
 * rows, so registering a watchlist never grants free monitoring.
 *
 * Before this route existed the tool collected addresses in React state and
 * dropped them at checkout, so /api/cron/ofac-watch screened an empty table
 * forever.
 *
 * Returns:
 *   200  { ok: true, watched: number, status: 'pending' }
 *   400  { ok: false, error: string }
 *   429  { ok: false, error: 'rate_limited', retry_after_ms: number }
 */

import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, clientIpFromHeaders } from '@bizlegal/rate-limit'
import { supabaseAdmin } from '@/lib/supabase'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

const MAX_ADDRESSES = 25
const MAX_ADDRESS_LEN = 200
const EMAIL_RE = /^\S+@\S+\.\S+$/

interface WatchBody {
  email?: string
  addresses?: unknown
}

export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers) ?? ''
  const limited = rateLimit('ofac-watch', ip, { limit: 6, windowMs: 60_000 })
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited', retry_after_ms: limited.retryAfterMs },
      { status: 429 },
    )
  }

  let body: WatchBody
  try {
    body = (await req.json()) as WatchBody
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }

  if (!Array.isArray(body.addresses)) {
    return NextResponse.json({ ok: false, error: 'addresses_must_be_array' }, { status: 400 })
  }

  // Dedupe case-insensitively: watched_addresses is UNIQUE (email, address),
  // so duplicates within one request would abort the whole upsert.
  const seen = new Set<string>()
  const addresses: string[] = []
  for (const raw of body.addresses) {
    if (typeof raw !== 'string') continue
    const value = raw.trim().toLowerCase()
    if (!value || value.length > MAX_ADDRESS_LEN) continue
    if (seen.has(value)) continue
    seen.add(value)
    addresses.push(value)
  }

  if (addresses.length === 0) {
    return NextResponse.json({ ok: false, error: 'no_valid_addresses' }, { status: 400 })
  }
  if (addresses.length > MAX_ADDRESSES) {
    return NextResponse.json(
      { ok: false, error: `max_${MAX_ADDRESSES}_addresses` },
      { status: 400 },
    )
  }

  // onConflict keeps an already-active watch active — a returning subscriber
  // adding one address must not have their existing watchlist reset to pending.
  const { error } = await supabaseAdmin.from('watched_addresses').upsert(
    addresses.map((address) => ({
      email,
      address,
      status: 'pending',
      created_at: new Date().toISOString(),
    })),
    { onConflict: 'email,address', ignoreDuplicates: true },
  )

  if (error) {
    console.error('[ofac-watcher/watch] upsert failed', error.message)
    return NextResponse.json({ ok: false, error: 'watchlist_save_failed' }, { status: 500 })
  }

  logEventAsync({
    type: 'lead.inbound',
    source: 'hub',
    email,
    status: 'ok',
    metadata: { tool: 'ofac_watcher', watched_count: addresses.length, watch_status: 'pending' },
  })

  return NextResponse.json({ ok: true, watched: addresses.length, status: 'pending' })
}

export const GET = () => NextResponse.json({ error: 'POST only' }, { status: 405 })
