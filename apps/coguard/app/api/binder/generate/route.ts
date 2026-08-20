import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logEventAsync } from '@/lib/ops/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

const BINDER_SERVICE_URL = process.env.COGUARD_BINDER_URL ?? 'http://204.168.209.235:8083'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { date_from, date_to } = (await req.json()) as { date_from?: string; date_to?: string }
    if (!date_from || !date_to) return NextResponse.json({ error: 'date_from and date_to required' }, { status: 400 })

    const supabase = getServiceSupabase()
    const { data: subscriber } = await supabase
      .from('coguard_subscribers')
      .select('id, plan, status')
      .eq('email', user.email!)
      .eq('status', 'active')
      .maybeSingle()

    if (!subscriber) return NextResponse.json({ error: 'no active subscription' }, { status: 403 })

    // Create pending binder record
    const { data: binder, error: insertErr } = await supabase
      .from('coguard_binders')
      .insert({ subscriber_id: subscriber.id, date_from, date_to, status: 'pending' })
      .select('id')
      .single()

    if (insertErr || !binder) return NextResponse.json({ error: 'binder creation failed' }, { status: 500 })

    logEventAsync({ type: 'coguard.binder.requested', source: 'coguard', ref_id: binder.id, metadata: { subscriber_id: subscriber.id, date_from, date_to } })

    // Fire-and-forget to Hetzner binder service — don't await
    const internalSecret = process.env.COGUARD_INTERNAL_SECRET
    if (internalSecret) {
      fetch(`${BINDER_SERVICE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': internalSecret },
        body: JSON.stringify({ binder_id: binder.id, subscriber_id: subscriber.id, date_from, date_to }),
      }).catch(err => console.warn('[binder/generate] Hetzner kick failed', err))
    }

    return NextResponse.json({ ok: true, binder_id: binder.id, status: 'pending' })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
  }
}
