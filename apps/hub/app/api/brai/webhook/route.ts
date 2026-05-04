import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// POST /api/brai/webhook
// NOWPayments IPN webhook for BRAI full report delivery
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const sig = req.headers.get('x-nowpayments-sig')
    const secret = process.env.NOWPAYMENTS_IPN_SECRET

    const payload = JSON.parse(body)

    // Verify signature — NOWPayments requires sorting JSON keys alphabetically before hashing
    if (secret && sig) {
      const sorted = Object.keys(payload).sort().reduce((acc, k) => {
        acc[k] = payload[k]
        return acc
      }, {} as Record<string, unknown>)
      const expected = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(sorted))
        .digest('hex')
      if (expected !== sig) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }
    const { payment_status, order_id } = payload

    if (!order_id?.startsWith('brai_')) {
      return NextResponse.json({ ok: true }) // not ours
    }

    const leadId = order_id.replace('brai_', '')

    if (payment_status === 'finished' || payment_status === 'confirmed') {
      const { data: lead } = await supabase
        .from('tracr_wallet_leads')
        .update({
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
        .select('email, report_data')
        .single()

      const paidAmountCents = Number(payload.price_amount ?? payload.actually_paid ?? 0) * 100
      logEventAsync({
        type: 'payment.confirmed',
        source: 'brai',
        ref_id: String(leadId),
        email: lead?.email ?? undefined,
        amount_cents: paidAmountCents > 0 ? Math.round(paidAmountCents) : undefined,
        status: 'ok',
        metadata: {
          product: 'brai_report',
          gateway: 'nowpayments',
          payment_status,
        },
      })

      // Deliver full report via email if lead exists
      if (lead?.email && process.env.RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `BizLegal AI <${process.env.RESEND_FROM || 'reports@bizlegal-ai.com'}>`,
            to: [lead.email],
            subject: 'Your BRAI Full Regulatory Report — Payment Confirmed',
            html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 24px">
  <h2 style="color:#a5b4fc">Your BRAI Full Report Is Ready</h2>
  <p>Thank you for your payment. Your full blockchain regulatory report has been processed.</p>
  <p style="font-size:13px;color:#666">Return to <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://bizlegal-ai.com'}/blockchain-report?unlocked=true&lead=${leadId}">your report page</a> to view the full analysis.</p>
  <p style="font-size:11px;color:#999">BizLegal AI</p>
</div>`,
          }),
        }).catch(err => console.error('[brai/webhook] email error:', err))

        logEventAsync({
          type: 'email.sent',
          source: 'brai',
          ref_id: String(leadId),
          email: lead.email,
          status: 'ok',
          metadata: { kind: 'brai-report-ready', subject: 'Your BRAI Full Regulatory Report — Payment Confirmed' },
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[brai/webhook] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
