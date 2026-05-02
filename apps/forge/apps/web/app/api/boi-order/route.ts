import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logEventAsync } from '@/lib/ops/log'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createServerClient()

    const { data, error } = await supabase.from('boi_orders').insert({
      id: crypto.randomUUID(),
      paypal_order_id: body.paypal_order_id || null,
      nowpayments_payment_id: body.nowpayments_payment_id || null,
      payer_email: body.payer_email,
      form_data: body.form_data,
      amount: body.amount || 149,
      status: 'paid',
      created_at: new Date().toISOString(),
    }).select().single()

    if (error) {
      console.error('BOI order insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Forge Compliance <${process.env.RESEND_FROM ?? 'hello@bizlegal-ai.com'}>`,
          to: [body.payer_email],
          subject: 'Your BOI Compliance Report — Order Confirmed',
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px">
              <h2 style="color:#111">Order Confirmed — BOI Compliance Report</h2>
              <p style="color:#444;line-height:1.7">Thank you. Your order has been received and is being processed.</p>
              <div style="background:#f8f9fa;border-left:4px solid #4f46e5;padding:16px 20px;margin:24px 0">
                <p style="margin:0;font-size:13px;color:#666">Order ID</p>
                <p style="margin:4px 0 0;font-weight:600">${body.paypal_order_id || data.id}</p>
                <p style="margin:12px 0 0;font-size:13px;color:#666">Company</p>
                <p style="margin:4px 0 0;font-weight:600">${body.form_data?.companyName || body.form_data?.company_name || 'N/A'}</p>
              </div>
              <p style="color:#444;line-height:1.7">Your report will be delivered within 24 hours to this email address.</p>
              <p style="color:#666;font-size:13px">Questions? Contact <a href="mailto:team@bizlegal-ai.com" style="color:#4f46e5">team@bizlegal-ai.com</a></p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
              <p style="color:#999;font-size:11px">Forge Compliance Engine — BizLegal AI | Not legal advice</p>
            </div>
          `,
        }),
      }).catch(console.error)
    }

    const telegramToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID
    if (telegramToken && chatId) {
      fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🚨 NEW BOI ORDER — $149\nCompany: ${body.form_data?.companyName || 'N/A'}\nEmail: ${body.payer_email}\nPayment: ${body.paypal_order_id || 'crypto'}`,
        }),
      }).catch(console.error)
    }

    logEventAsync({
      type: 'payment.confirmed',
      source: 'forge',
      ref_id: String(data.id),
      email: body.payer_email,
      amount_cents: 14900,
      status: 'ok',
      metadata: {
        product: 'forge_boi_kit',
        gateway: body.paypal_order_id ? 'paypal' : 'crypto',
        paypal_order_id: body.paypal_order_id,
        company: body.form_data?.companyName,
      },
    })

    return NextResponse.json({ success: true, order_id: data.id })
  } catch (err) {
    console.error('BOI order error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
