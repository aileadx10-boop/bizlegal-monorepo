import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getTransactions } from '@/lib/covalent'
import { calculateRisk } from '@/lib/risk-engine'
import { generateFullReport } from '@/lib/ai-prompts'

export const maxDuration = 60  // Vercel: allow up to 60s for AI generation

export async function POST(req: NextRequest) {
  try {
    const { report_id } = await req.json()
    if (!report_id) return NextResponse.json({ error: 'Missing report_id' }, { status: 400 })

    const { data: order } = await supabaseAdmin
      .from('tracr_orders')
      .select('*')
      .eq('report_id', report_id)
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (!['paid', 'processing'].includes(order.status)) {
      return NextResponse.json({ error: 'Payment required' }, { status: 402 })
    }
    if (order.ai_content) return NextResponse.json({ ai_content: order.ai_content })

    // Fetch real blockchain data
    const txs = await getTransactions(order.wallet_address, order.network ?? 'ethereum')
    const risk = calculateRisk(txs)

    // Generate via full 4-stage pipeline
    const ai_content = await generateFullReport(order.wallet_address, txs, risk)

    await supabaseAdmin
      .from('tracr_orders')
      .update({
        ai_content,
        risk_score: risk.score,
        risk_level: risk.level,
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      })
      .eq('report_id', report_id)

    return NextResponse.json({ ai_content })
  } catch (err) {
    console.error('[scan/report]', err)
    return NextResponse.json({ error: 'Report generation failed' }, { status: 500 })
  }
}
