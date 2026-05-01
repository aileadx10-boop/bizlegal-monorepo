import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { getWalletData } from '@/app/lib/tracr-etherscan'
import { calculateRisk } from '@/app/lib/tracr-risk-engine'
import { generateFullReport } from '@/app/lib/tracr-ai'
import { generateReportHTML } from '@/app/lib/tracr-pdf'
import { logEventAsync } from '@/lib/ops/log'

export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-nowpayments-sig')
    const event = JSON.parse(body)

    // Verify NOWPayments IPN signature — must sort JSON keys alphabetically before hashing
    if (signature && process.env.NOWPAYMENTS_IPN_SECRET) {
      const sorted = Object.keys(event).sort().reduce((acc, k) => {
        acc[k] = event[k]
        return acc
      }, {} as Record<string, unknown>)
      const hmac = crypto
        .createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET)
        .update(JSON.stringify(sorted))
        .digest('hex')
      if (hmac !== signature) {
        console.warn('[TRACR webhook] Invalid signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }
    const { order_id: reportId, payment_status, payment_id } = event

    if (!reportId) return NextResponse.json({ received: true })

    if (payment_status === 'finished' || payment_status === 'confirmed') {
      // Check idempotency — don't reprocess already delivered orders
      const { data: existing } = await supabase
        .from('tracr_orders')
        .select('status, wallet_address, network, email, first_name, last_name')
        .eq('report_id', reportId)
        .single()

      if (!existing) return NextResponse.json({ received: true })
      if (existing.status === 'delivered') return NextResponse.json({ received: true })

      await supabase.from('tracr_orders').update({
        status: 'processing',
        paid_at: new Date().toISOString(),
        nowpayments_payment_id: payment_id,
      }).eq('report_id', reportId)

      // Generate report inline (avoids fire-and-forget termination on Vercel serverless)
      try {
        const summary = await getWalletData(existing.wallet_address, existing.network || 'ethereum')
        const risk = calculateRisk(summary)
        const content = await generateFullReport(existing.wallet_address, summary.transactions, risk)

        const clientName = [existing.first_name, existing.last_name].filter(Boolean).join(' ') || 'Client'
        const reportHTML = generateReportHTML(existing.wallet_address, reportId, risk, content, clientName, existing.network || 'ethereum')

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

        await sendReportEmail(existing.email, clientName, reportId, risk, publicUrl)

        const paidAmountCents = Number(event.price_amount ?? event.actually_paid ?? 0) * 100
        logEventAsync({
          type: 'payment.confirmed',
          source: 'tracr',
          ref_id: reportId,
          email: existing.email,
          amount_cents: paidAmountCents > 0 ? Math.round(paidAmountCents) : undefined,
          status: 'ok',
          metadata: {
            product: 'tracr_forensic_report',
            gateway: 'nowpayments',
            payment_status,
            payment_id: String(payment_id ?? ''),
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
      } catch (genErr: any) {
        console.error('[TRACR webhook] Report generation failed:', genErr)
        await supabase.from('tracr_orders').update({ status: 'error' }).eq('report_id', reportId)
        logEventAsync({
          type: 'error',
          source: 'tracr',
          ref_id: reportId,
          status: 'failed',
          metadata: { stage: 'report-generation', error: String(genErr?.message ?? genErr) },
        })
      }
    } else if (payment_status === 'partially_paid') {
      await supabase.from('tracr_orders').update({ status: 'partial_payment' }).eq('report_id', reportId)
    } else if (payment_status === 'failed' || payment_status === 'expired') {
      await supabase.from('tracr_orders').update({ status: 'failed' }).eq('report_id', reportId)
      logEventAsync({
        type: 'payment.failed',
        source: 'tracr',
        ref_id: reportId,
        status: 'failed',
        metadata: { gateway: 'nowpayments', payment_status },
      })
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('[TRACR webhook]', err)
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
  <p style="color:#444;font-size:16px;line-height:1.7">Your on-chain forensic report is ready. Please find the details below.</p>
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
    console.error('[TRACR email]', err)
  }
}
