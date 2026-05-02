import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

function sortObjectKeys(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(obj).sort().reduce((acc, k) => {
    acc[k] = obj[k]
    return acc
  }, {} as Record<string, unknown>)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const sig = req.headers.get('x-nowpayments-sig')
    const secret = process.env.NOWPAYMENTS_IPN_SECRET
    const parsed = JSON.parse(body)

    if (secret && sig) {
      const sorted = sortObjectKeys(parsed)
      const hmac = crypto.createHmac('sha512', secret).update(JSON.stringify(sorted)).digest('hex')
      if (hmac !== sig) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const { payment_status, order_id: report_id, payment_id } = parsed

    if (payment_status === 'finished' || payment_status === 'confirmed') {
      await supabaseAdmin
        .from('tracr_orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          nowpayments_payment_id: payment_id,
        })
        .eq('report_id', report_id)

      // Trigger async report generation
      const site = process.env.NEXT_PUBLIC_SITE_URL ?? ''
      fetch(`${site}/api/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': process.env.NOWPAYMENTS_IPN_SECRET ?? '',
        },
        body: JSON.stringify({ reportId: report_id }),
      }).catch(console.error)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[payment/webhook]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
