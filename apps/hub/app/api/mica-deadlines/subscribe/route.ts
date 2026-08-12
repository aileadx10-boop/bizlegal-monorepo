import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@bizlegal/ops-log'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * POST /api/mica-deadlines/subscribe
 *
 * Subscribe an email to the daily MiCA deadline digest. Upserts on
 * (email) so re-subscribes are idempotent; re-activates a previously
 * unsubscribed row. Light per-IP rate limit (10 / 15 min).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const JURISDICTION_RE = /^[A-Za-z]{2,3}$/

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
  let body: { email?: string; jurisdiction?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }
  const email = (body.email ?? '').trim().toLowerCase()
  const jurisdiction = (body.jurisdiction ?? 'EU').trim().toUpperCase()
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid work email.' }, { status: 400 })
  }
  if (!JURISDICTION_RE.test(jurisdiction)) {
    return NextResponse.json({ error: 'Jurisdiction should be a country code (e.g. FR, DE, EU).' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
  }
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { error } = await supabase
    .from('mica_deadline_subs')
    .upsert(
      { email, jurisdiction, status: 'active' },
      { onConflict: 'email' }
    )
  if (error) {
    logEventAsync({ type: 'error', source: 'hub', ref_id: 'mica-deadlines-subscribe', status: 'failed', metadata: { reason: error.message } })
    return NextResponse.json({ error: 'Could not save your subscription. Please try again.' }, { status: 500 })
  }

  logEventAsync({
    type: 'boi.subscribed',
    source: 'hub',
    ref_id: 'mica-deadline-sub',
    email,
    status: 'ok',
    metadata: { vertical: 'mica-deadlines', jurisdiction },
  })

  return NextResponse.json({ ok: true, email, jurisdiction })
}
