import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

const VALID_SOURCES = [
  'checkout_success',
  'pricing_footer',
  'blog_cta',
  'paypal_return',
  'nurture',
  'test',
] as const

type SubscriberSource = (typeof VALID_SOURCES)[number]

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

async function addToResendAudience(email: string): Promise<void> {
  const audienceId = process.env.RESEND_AUDIENCE_ID
  const apiKey = process.env.RESEND_API_KEY
  if (!audienceId || !apiKey) return

  await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, unsubscribed: false }),
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; source?: string }

    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json({ error: 'email required' }, { status: 400 })
    }

    const email = body.email.toLowerCase().trim()
    if (!email.includes('@') || email.length < 5) {
      return NextResponse.json({ error: 'invalid email' }, { status: 400 })
    }

    const source = (VALID_SOURCES.includes(body.source as SubscriberSource)
      ? body.source
      : 'pricing_footer') as SubscriberSource

    const supabase = getSupabase()

    const { error } = await supabase.from('subscribers').upsert(
      { email, source, updated_at: new Date().toISOString() },
      { onConflict: 'email', ignoreDuplicates: false },
    )

    if (error) {
      console.error('[subscribers] upsert failed', error)
      return NextResponse.json({ error: 'subscription failed' }, { status: 500 })
    }

    // Sync to Resend audience for newsletter (non-blocking, best-effort)
    void addToResendAudience(email).catch((err: unknown) =>
      console.warn('[subscribers] resend sync failed:', err),
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[subscribers]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('t')
  if (!token || token !== process.env.OPS_DASHBOARD_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()
  const { count } = await supabase
    .from('subscribers')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({ subscriber_count: count ?? 0 })
}
