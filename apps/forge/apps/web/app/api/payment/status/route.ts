// app/api/payment/status/route.ts
// Returns payment status for a scan or passport from Supabase

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const referenceId = searchParams.get('reference_id')
  const referenceType = searchParams.get('reference_type') as 'passport' | 'scan' | null

  if (!referenceId || !referenceType) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    const supabase = createServerClient()
    const table = referenceType === 'passport' ? 'passport_assessments' : 'scans'

    const { data } = await supabase
      .from(table)
      .select('payment_status')
      .eq('id', referenceId)
      .single()

    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      paid: data.payment_status === 'paid',
      status: data.payment_status,
    })
  } catch (err) {
    console.error('[forge/payment/status]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
