import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Mirrors the report page's PAID_STATUSES set — only these unlock ai_content.
const PAID_STATUSES = new Set(['paid', 'delivered', 'processing'])

/**
 * GET /api/report/[report_id] — report-page data. Unauthenticated (fleet
 * pattern: the report_id is the bearer secret), but report IDs follow the
 * guessable TR-YYYY-NNNNN pattern, so the response is minimized:
 *
 *   - Buyer email NEVER leaves the server (was leaked pre-fix).
 *   - ai_content (the full paid report) only ships for paid/delivered/
 *     processing orders — same paid gate as FalseEcho's /api/report route.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ report_id: string }> }
) {
  const { report_id } = await params
  const { data: order } = await supabaseAdmin
    .from('tracr_orders')
    .select('report_id, wallet_address, network, tier, status, risk_score, risk_level, ai_content')
    .eq('report_id', report_id)
    .single()

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const paid = PAID_STATUSES.has(order.status ?? '')

  return NextResponse.json({
    order: {
      report_id: order.report_id,
      wallet_address: order.wallet_address,
      network: order.network,
      tier: order.tier,
      status: order.status,
      risk_score: order.risk_score,
      risk_level: order.risk_level,
      ...(paid ? { ai_content: order.ai_content } : {}),
    },
  })
}
