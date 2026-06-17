/**
 * Hub /api/inbound-lead — public newsletter subscription endpoint.
 *
 * Receives plain JSON from blog.bizlegal-ai.com (NewsletterSignup component)
 * and any cross-origin surface. No HMAC required — this is a public form.
 *
 * Wire:
 *   NewsletterSignup { email, source, page, product }
 *     ↓
 *   newsletter_subscribers upsert (Supabase)
 *     ↓
 *   Resend welcome email (non-fatal)
 *     ↓
 *   logEventAsync('lead.inbound', source: 'blog')
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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

  if (existing) {
    await supabase
      .from('newsletter_subscribers')
      .update({ active: true, source, unsubscribed_at: null })
      .eq('id', existing.id)
  } else {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, source, active: true })
    if (error) {
      console.error('[inbound-lead] insert failed', error)
      return NextResponse.json({ error: 'subscribe_failed' }, { status: 500, headers: cors })
    }
  }

  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    void fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'BizLegal AI <hello@bizlegal-ai.com>',
        to: [email],
        reply_to: 'team@bizlegal-ai.com',
        subject: "You're in — regulatory alerts from BizLegal AI",
        html: welcomeHtml(),
      }),
    }).catch((e) => console.warn('[inbound-lead] welcome email failed', e))
  }

  void logEventAsync({
    type: 'lead.inbound',
    source: 'blog',
    email,
    status: 'ok',
    metadata: { product, source },
  })

  return NextResponse.json({ ok: true, status: 'subscribed' }, { headers: cors })
}

function welcomeHtml(): string {
  return `<div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;padding:24px;color:#0e0b1a">
<h2 style="font-weight:800;letter-spacing:-0.02em;margin:0 0 12px">You're on the list.</h2>
<p style="line-height:1.7;color:#4b3f6a">
  You'll get one email when a regulation that affects crypto, fintech, or cross-border deals
  actually changes — not when someone writes a blog post about it.
</p>
<p style="line-height:1.7;color:#4b3f6a">
  Until then, catch up on the latest compliance intelligence at
  <a href="https://blog.bizlegal-ai.com" style="color:#5b21b6">blog.bizlegal-ai.com</a>.
</p>
<p style="font-size:12px;color:#6b6188;margin-top:24px">
  BizLegal AI · Regulatory intelligence for crypto, fintech &amp; cross-border deals.<br>
  Reply to unsubscribe at any time.
</p>
</div>`
}
