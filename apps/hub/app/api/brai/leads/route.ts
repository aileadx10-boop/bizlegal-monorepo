import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// POST /api/brai/leads
// Captures BRAI scan lead for payment gate flow
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, wallet_address, risk_score, risk_level, report_data } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tracr_wallet_leads')
      .insert({
        email: email.toLowerCase().trim(),
        wallet_address: wallet_address ?? null,
        risk_score: risk_score ?? null,
        risk_level: risk_level ?? null,
        product: 'brai_report',
        report_data: report_data ?? null,
      })
      .select('id')
      .single()

    if (error && !error.message.includes('duplicate') && !error.message.includes('unique')) {
      console.error('[brai/leads]', error.message)
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
    }

    logEventAsync({
      type: 'lead.inbound',
      source: 'brai',
      ref_id: data?.id ? String(data.id) : undefined,
      email: email.toLowerCase().trim(),
      status: 'ok',
      metadata: {
        product: 'brai_report',
        wallet_address: wallet_address ?? null,
        risk_score: risk_score ?? null,
        risk_level: risk_level ?? null,
      },
    })

    return NextResponse.json({ success: true, leadId: data?.id ?? null })
  } catch (err) {
    console.error('[brai/leads] unexpected:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
