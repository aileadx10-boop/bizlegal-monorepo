import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * GET /api/tools/ai-policy-generator/download?token=<download_token>
 *
 * W3-8 (O-010) — full-policy download, gated on payment. The wizard stores a
 * draft (status='draft'); the webhook flips it to 'paid' on payment.confirmed
 * for product ai_policy_generator. A draft token returns 402 (payment
 * required); a paid token returns the policy as markdown.
 */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') ?? ''
  if (!token) {
    return NextResponse.json({ error: 'token required' }, { status: 400 })
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('ai_policy_drafts')
    .select('status,policy_markdown,policy_title')
    .eq('download_token', token)
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  if (data.status !== 'paid') {
    return NextResponse.json(
      { error: 'payment_required', message: 'Unlock the full policy for $99.' },
      { status: 402 }
    )
  }

  return new NextResponse(data.policy_markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="ai-usage-policy.md"`,
    },
  })
}
