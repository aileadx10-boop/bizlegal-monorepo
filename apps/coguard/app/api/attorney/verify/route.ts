import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    if (!code) return NextResponse.redirect(new URL('/', req.url))

    const supabase = getServiceSupabase()

    // Look up binder by attorney_access_code
    const { data: binder } = await supabase
      .from('coguard_binders')
      .select('id, subscriber_id, status')
      .eq('attorney_access_code', code)
      .single()

    if (!binder || binder.status !== 'ready') {
      return NextResponse.redirect(new URL('/attorney/not-found', req.url))
    }

    // Upsert access log
    await supabase
      .from('coguard_attorney_access')
      .upsert({ access_code: code, subscriber_id: binder.subscriber_id, binder_id: binder.id, last_accessed_at: new Date().toISOString() }, { onConflict: 'access_code' })
      .then(({ error }) => { if (error) console.warn('[attorney/verify] access log failed', error) })

    logEventAsync({ type: 'coguard.attorney.access', source: 'coguard', ref_id: binder.id, metadata: { access_code: code.slice(0, 4) + '****' } })

    return NextResponse.redirect(new URL(`/attorney/${code}`, req.url))
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
  }
}
