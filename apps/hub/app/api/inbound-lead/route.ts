/**
 * Hub /api/inbound-lead — public newsletter subscription endpoint.
 *
 * Receives plain JSON from blog.bizlegal-ai.com (NewsletterSignup component)
 * and any cross-origin surface. No HMAC required — this is a public form.
 *
 * Wire:
 *   NewsletterSignup { email, source, page, product }
 *     ↓
 *   newsletter_subscribers upsert as UNCONFIRMED (Supabase)
 *     ↓
 *   Resend double-opt-in confirmation request
 *     ↓
 *   logEventAsync('lead.inbound', source: 'blog')
 *
 * The address becomes mailable only after /api/newsletter/confirm.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { startDoubleOptIn, originFromHeaders } from '@/lib/newsletter-optin'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'

const ALLOWED_ORIGINS = [
  'https://blog.bizlegal-ai.com',
  'https://bizlegal-ai.com',
  'https://www.bizlegal-ai.com',
]

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
  }
}

export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  const origin = req.headers.get('origin')
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

interface Body {
  email?: string
  source?: string
  page?: string
  product?: string
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const origin = req.headers.get('origin')
  const cors = corsHeaders(origin)

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400, headers: cors })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400, headers: cors })
  }

  const source = (body.source ?? body.page ?? 'blog').slice(0, 200)
  const product = (body.product ?? 'newsletter').slice(0, 100)

  const supabase = getSupabase()

  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('id, active')
    .eq('email', email)
    .maybeSingle()

  if (existing?.active) {
    void logEventAsync({
      type: 'lead.inbound',
      source: 'blog',
      email,
      status: 'ok',
      metadata: { product, source, duplicate: true },
    })
    return NextResponse.json({ ok: true, status: 'already_subscribed' }, { headers: cors })
  }

  // Consent gate (2026-08-14). This route used to mark the address active and
  // send a "You're in" welcome immediately, subscribing people who had only
  // typed an address into a public form. startDoubleOptIn writes the row as
  // unconfirmed and sends the confirm request instead; /api/newsletter/confirm
  // is what makes the address mailable.
  const optIn = await startDoubleOptIn({
    sb: supabase,
    email,
    source,
    origin: originFromHeaders(req.headers),
  })

  if (!optIn.ok) {
    if (optIn.error === 'suppressed') {
      return NextResponse.json({ error: 'cannot_subscribe' }, { status: 403, headers: cors })
    }
    if (optIn.error === 'invalid_email') {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400, headers: cors })
    }
    console.error('[inbound-lead] opt-in start failed')
    return NextResponse.json({ error: 'subscribe_failed' }, { status: 500, headers: cors })
  }

  void logEventAsync({
    type: 'lead.inbound',
    source: 'blog',
    email,
    status: 'ok',
    metadata: { product, source, pending_confirmation: !optIn.alreadyConfirmed },
  })

  return NextResponse.json(
    { ok: true, status: optIn.alreadyConfirmed ? 'already_subscribed' : 'confirmation_sent' },
    { headers: cors },
  )
}

