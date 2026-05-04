import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getWalletData } from '@/app/lib/tracr-etherscan'
import { calculateRisk } from '@/app/lib/tracr-risk-engine'
import { generateFullReport } from '@/app/lib/tracr-ai'
import { generateReportHTML } from '@/app/lib/tracr-pdf'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'

export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(req: NextRequest) {
  const internalKey = req.headers.get('x-internal-key')
  if (internalKey !== process.env.TRACR_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { reportId, wallet, network = 'ethereum' } = await req.json()

  try {
    const { data: order } = await supabase
      .from('tracr_orders')
      .select('*')
      .eq('report_id', reportId)
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // Fetch chain data
    const summary = await getWalletData(wallet, network)
    const risk = calculateRisk(summary)

    // Run AI pipeline
    const content = await generateFullReport(wallet, summary.transactions, risk)

    // Generate HTML report
    const clientName = [order.first_name, order.last_name].filter(Boolean).join(' ') || 'Client'
    const reportHTML = generateReportHTML(wallet, reportId, risk, content, clientName, network)

    // Store HTML in Supabase Storage
    const htmlBytes = Buffer.from(reportHTML, 'utf-8')
    const storagePath = `reports/${reportId}.html`

    await supabase.storage
      .from('tracr-reports')
      .upload(storagePath, htmlBytes, { contentType: 'text/html', upsert: true })

    const { data: { publicUrl } } = supabase.storage
      .from('tracr-reports')
      .getPublicUrl(storagePath)

    // Update order
    await supabase.from('tracr_orders').update({
      status: 'delivered',
      risk_score: risk.score,
      risk_level: risk.level,
      report_url: publicUrl,
      ai_content: content as any,
      delivered_at: new Date().toISOString(),
    }).eq('report_id', reportId)

    // Send email via SendGrid
    await sendReportEmail(order.email, clientName, reportId, risk, publicUrl)

    logEventAsync({
      type: 'report.generated',
      source: 'tracr',
      ref_id: reportId,
      email: order.email,
      status: 'ok',
      metadata: {
        product: 'tracr_forensic_report',
        wallet,
        network,
        risk_score: risk.score,
        risk_level: risk.level,
        report_url: publicUrl,
      },
    })
    logEventAsync({
      type: 'email.sent',
      source: 'tracr',
      ref_id: reportId,
      email: order.email,
      status: 'ok',
      metadata: { kind: 'forensic-report-ready', subject: `Your TRACR Forensic Report — ${reportId}` },
    })

    return NextResponse.json({ success: true, reportId, reportUrl: publicUrl })
  } catch (err: any) {
    console.error('[TRACR generate-report]', err)
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
