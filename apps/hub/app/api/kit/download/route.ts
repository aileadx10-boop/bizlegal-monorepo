import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { KIT_MARKDOWN, KIT_VERSION } from '@/lib/kit/ai-teammate-kit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/kit/download?order=<payment_orders.id>
 *
 * O-018 — markdown download of the AI Teammate Kit, gated on payment. The
 * order id is a v4 UUID minted by /api/pay/start; it is the bearer secret,
 * the same way the AI Policy Generator uses its draft token. A row that is
 * not for the kit, or not paid, returns 402. The readable version of the same
 * content is the server page /kit?order=<id>.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PAID_STATES = new Set(['active', 'paid'])

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function GET(req: NextRequest) {
  const order = (req.nextUrl.searchParams.get('order') ?? '').trim()
  if (!UUID_RE.test(order)) {
    return NextResponse.json({ error: 'order required' }, { status: 400 })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'order_store_unavailable' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('payment_orders')
    .select('id, product, status')
    .eq('id', order)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  if (data.product !== 'ai_teammate_kit' || !PAID_STATES.has(String(data.status))) {
    return NextResponse.json(
      { error: 'payment_required', message: 'This link is for a paid AI Teammate Kit order.' },
      { status: 402 },
    )
  }

  const versionTag = KIT_VERSION.split(' ')[0]
  return new NextResponse(KIT_MARKDOWN, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="ai-teammate-kit-${versionTag}.md"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
