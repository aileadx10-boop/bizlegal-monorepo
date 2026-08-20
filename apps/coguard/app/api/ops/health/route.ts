import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t')
  if (token !== process.env.OPS_DASHBOARD_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const checks: Record<string, string> = {}

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { error } = await supabase.from('coguard_subscribers').select('id').limit(1)
    checks.supabase = error ? `ERROR: ${error.message}` : 'ok'
  } catch (e) {
    checks.supabase = `ERROR: ${e instanceof Error ? e.message : 'unknown'}`
  }

  checks.resend = process.env.RESEND_API_KEY ? 'configured' : 'MISSING'
  checks.nowpayments = process.env.NOWPAYMENTS_API_KEY ? 'configured' : 'MISSING'
  checks.coguard_internal_secret = process.env.COGUARD_INTERNAL_SECRET ? 'configured' : 'MISSING'
  checks.cf_kv_namespace = process.env.CF_COGUARD_KV_NAMESPACE_ID ? 'configured' : 'MISSING'

  const allOk = Object.values(checks).every(v => v === 'ok' || v === 'configured')
  return NextResponse.json({ status: allOk ? 'green' : 'degraded', checks, ts: new Date().toISOString() }, { status: allOk ? 200 : 207 })
}
