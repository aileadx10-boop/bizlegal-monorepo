import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getWalletData } from '@/app/lib/tracr-etherscan'
import { calculateRisk } from '@/app/lib/tracr-risk-engine'
import { generateFullReport } from '@/app/lib/tracr-ai'
import { generateReportHTML } from '@/app/lib/tracr-pdf'
import { logEventAsync } from '@/lib/ops/log'

export const maxDuration = 60

const PAYPAL_BASE = 'https://api-m.paypal.com'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function getPayPalToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`)
  const data = await res.json()
  return data.access_token
}

export async function POST(req: NextRequest) {
  let reportId = ''
  try {
    const body = await req.json()
    const { paypalOrderId } = body
    reportId = body.reportId || ''

    if (!paypalOrderId || !reportId) {
      return NextResponse.json({ error: 'paypalOrderId and reportId required' }, { status: 400 })
    }

    // Idempotency check
    const { data: existing } = await supabase
      .from('tracr_orders')
      .select('*')
      .eq('report_id', reportId)
      .single()

    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (existing.status === 'delivered') {
      return NextResponse.json({ success: true, reportUrl: existing.report_url })
    }

    // Capture PayPal payment
    const token = await getPayPalToken()
    const captureRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!captureRes.ok) {
      const err = await captureRes.json()
      throw new Error(`PayPal capture failed: ${JSON.stringify(err)}`)
    }

    const capture = await captureRes.json()
    const captureStatus = capture.status

    if (captureStatus !== 'COMPLETED') {
      return NextResponse.json({ error: `Payment not completed: ${captureStatus}` }, { status: 402 })
    }

    // Mark processing
    await supabase.from('tracr_orders').update({
      status: 'processing',
      paid_at: new Date().toISOString(),
      nowpayments_payment_id: capture.id,
    }).eq('report_id', reportId)

    // Generate report inline
    const summary = await getWalletData(existing.wallet_address, existing.network || 'ethereum')
    const risk = calculateRisk(summary)
    const content = await generateFullReport(existing.wallet_address, summary.transactions, risk)

    const clientName = [existing.first_name, existing.last_name].filter(Boolean).join(' ') || 'Client'
    const reportHTML = generateReportHTML(
      existing.wallet_address, reportId, risk, content, clientName, existing.network || 'ethereum'
    )

    const htmlBytes = Buffer.from(reportHTML, 'utf-8')
    const storagePath = `reports/${reportId}.html`

    await supabase.storage
      .from('tracr-reports')
      .upload(storagePath, htmlBytes, { contentType: 'text/html', upsert: true })

    const { data: { publicUrl } } = supabase.storage
      .from('tracr-reports')
      .getPublicUrl(storagePath)

    await supabase.from('tracr_orders').update({
      status: 'delivered',
      risk_score: risk.score,
      risk_level: risk.level,
      report_url: publicUrl,
      ai_content: content as any,
      delivered_at: new Date().toISOString(),
    }).eq('report_id', reportId)

    // Send email
    await sendReportEmail(existing.email, clientName, reportId, risk, publicUrl)

    logEventAsync({
      type: 'payment.confirmed',
      source: 'tracr',
      ref_id: reportId,
      email: existing.email,
      status: 'ok',
      metadata: {
        product: 'tracr_forensic_report',
        gateway: 'paypal',
        paypal_order_id: paypalOrderId,
      },
    })
    logEventAsync({
      type: 'report.generated',
      source: 'tracr',
      ref_id: reportId,
      email: existing.email,
      status: 'ok',
      metadata: {
        product: 'tracr_forensic_report',
        wallet: existing.wallet_address,
        risk_score: risk.score,
        risk_level: risk.level,
      },
    })

    return NextResponse.json({ success: true, reportId, reportUrl: publicUrl })
  } catch (err: any) {
    console.error('[TRACR paypal-capture]', err)
    await supabase.from('tracr_orders')
      .update({ status: 'error' })
      .eq('report_id', reportId)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

async function sendReportEmail(
  email: string,
  clientName: string,
  reportId: string,
  risk: { score: number; level: string },
  reportUrl: string
) {
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `TRACR Intelligence <${process.env.RESEND_FROM || 'reports@bizlegal-ai.com'}>`,
        to: [email],
        subject: `Your TRACR Forensic Report — ${reportId}`,
        html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#fff">
  <div style="font-family:monospace;font-size:22px;font-weight:700;letter-spacing:0.1em;color:#050608;margin-bottom:32px">
    TRA<span style="color:#d4a843">C</span>R
  </div>
  <p style="color:#444;font-size:16px">Dear ${clientName},</p>
  <p style="color:#444;font-size:16px;line-height:1.7">Your on-chain forensic report is ready.</p>
  <div style="background:#f9f8f6;border-left:4px solid #d4a843;padding:20px 24px;margin:24px 0">
    <div style="font-size:12px;font-family:monospace;color:#888;text-transform:uppercase;letter-spacing:0.1em">Report ID</div>
    <div style="font-size:20px;font-family:monospace;font-weight:700;color:#050608">${reportId}</div>
    <div style="margin-top:12px;font-size:12px;font-family:monospace;color:#888;text-transform:uppercase;letter-spacing:0.1em">Risk Assessment</div>
    <div style="font-size:18px;font-weight:700;color:${risk.level === 'Critical' ? '#c0392b' : risk.level === 'High' ? '#e67e22' : risk.level === 'Moderate' ? '#f39c12' : '#27ae60'}">${risk.level} — ${risk.score}/100</div>
  </div>
  <a href="${reportUrl}" style="display:inline-block;padding:14px 32px;background:#050608;color:#d4a843;font-family:monospace;font-weight:700;font-size:14px;text-decoration:none;letter-spacing:0.1em;margin-bottom:32px">
    VIEW REPORT &rarr;
  </a>
  <p style="color:#999;font-size:12px;line-height:1.7">This report is confidential and intended solely for the named recipient. It does not constitute legal advice. TRACR Intelligence.</p>
</div>`,
      }),
    })
  } catch (err) {
    console.error('[TRACR paypal email]', err)
  }
}
