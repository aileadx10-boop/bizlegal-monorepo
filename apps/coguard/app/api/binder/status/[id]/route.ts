import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const supabase = getServiceSupabase()

    // Verify subscriber owns the binder
    const { data: subscriber } = await supabase.from('coguard_subscribers').select('id').eq('email', user.email!).maybeSingle()
    if (!subscriber) return NextResponse.json({ error: 'subscriber not found' }, { status: 404 })

    const { data: binder } = await supabase
      .from('coguard_binders')
      .select('id, status, pdf_url, message_count, bates_start, bates_end, created_at, completed_at')
      .eq('id', id)
      .eq('subscriber_id', subscriber.id)
      .single()

    if (!binder) return NextResponse.json({ error: 'binder not found' }, { status: 404 })

    return NextResponse.json(binder)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
  }
}
