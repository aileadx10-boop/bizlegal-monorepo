import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ report_id: string }> }
) {
  const { report_id } = await params
  const { data: order } = await supabaseAdmin
    .from('tracr_orders')
    .select('report_id, wallet_address, network, tier, status, risk_score, risk_level, ai_content')
    .eq('report_id', report_id)
    .single()

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ order })
}
