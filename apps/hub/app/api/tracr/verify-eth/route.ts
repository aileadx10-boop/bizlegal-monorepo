import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getWalletData } from '@/app/lib/tracr-etherscan'
import { calculateRisk } from '@/app/lib/tracr-risk-engine'
import { generateFullReport } from '@/app/lib/tracr-ai'
import { generateReportHTML } from '@/app/lib/tracr-pdf'
import { logEventAsync } from '@/lib/ops/log'

export const maxDuration = 60

const ETHERSCAN_BASE = 'https://api.etherscan.io/api'

// Lazy getter — reading at module load crashes the Vercel build during
// "Collecting page data" if TRACR_ETH_ADDRESS isn't set. Reading at
// request time means missing env returns a 500 from this single route
// instead of taking down the whole build. (More defensive than `|| ''`
// fallback: empty string would silently match any `tx.to.toLowerCase()`
// of empty, causing false-positive matches.)
function getReceivingAddress(): string {
  const addr = process.env.TRACR_ETH_ADDRESS
  if (!addr) throw new Error('TRACR_ETH_ADDRESS env var is not configured on this deployment')
  return addr.toLowerCase()
}

const PRICES_USD: Record<string, number> = {
  standard: 149,
  priority: 249,
  litigation: 500,
}

// Lazy Supabase client for the same reason — module-level !-asserts on
// env that may not be present at build time crash the build.
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Supabase env vars are not configured on this deployment')
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  try {
    const { txHash, reportId } = await req.json()

    if (!txHash || !reportId) {
      return NextResponse.json({ error: 'txHash and reportId required' }, { status: 400 })
    }
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return NextResponse.json({ error: 'Invalid transaction hash format' }, { status: 400 })
    }

    const supabase = getSupabase()
    const RECEIVING_ADDRESS = getReceivingAddress()

    // Idempotency check
    const { data: order } = await supabase
      .from('tracr_orders')
      .select('*')
      .eq('report_id', reportId)
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.status === 'delivered') {
      return NextResponse.json({ success: true, reportUrl: order.report_url })
    }

    // Verify tx on Etherscan
    const txRes = await fetch(
      `${ETHERSCAN_BASE}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${process.env.ETHERSCAN_API_KEY}`
    )
    const txData = await txRes.json()

    if (!txData.result) {
      return NextResponse.json({ error: 'Transaction not found. Please wait for it to propagate and try again.' }, { status: 422 })
    }

    const tx = txData.result

    // Verify destination
    if (!tx.to || tx.to.toLowerCase() !== RECEIVING_ADDRESS) {
      return NextResponse.json({ error: 'Transaction destination does not match the TRACR payment address.' }, { status: 422 })
    }

    // Verify confirmed (has blockNumber)
    if (!tx.blockNumber || tx.blockNumber === '0x0') {
      return NextResponse.json({ error: 'Transaction is still pending. Please wait for at least 1 confirmation.' }, { status: 422 })
    }

    // Mark processing
    await supabase.from('tracr_orders').update({
      status: 'processing',
      paid_at: new Date().toISOString(),
      nowpayments_payment_id: `eth_${txHash}`,
    }).eq('report_id', reportId)

    // Generate report
    const summary = await getWalletData(order.wallet_address, order.network || 'ethereum')
    const risk = calculateRisk(summary)
    const content = await generateFullReport(order.wallet_address, summary.transactions, risk)

    const clientName = [order.first_name, order.last_name].filter(Boolean).join(' ') || 'Client'
    const reportHTML = generateReportHTML(
      order.wallet_address, reportId, risk, content, clientName, order.network || 'ethereum'
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

    await sendReportEmail(order.email, clientName, reportId, risk, publicUrl)

    const tier = String(order.tier ?? '').toLowerCase()
    const amountCents = (PRICES_USD[tier] ?? 149) * 100

    logEventAsync({
      type: 'payment.confirmed',
      source: 'tracr',
      ref_id: reportId,
      email: order.email,
      amount_cents: amountCents,
      status: 'ok',
      metadata: {
        product: 'tracr_forensic_report',
        tier,
        gateway: 'eth-onchain',
        tx_hash: txHash,
      },
    })
    logEventAsync({
      type: 'report.generated',
      source: 'tracr',
      ref_id: reportId,
      email: order.email,
      status: 'ok',
      metadata: {
        product: 'tracr_forensic_report',
        wallet: order.wallet_address,
        risk_score: risk.score,
        risk_level: risk.level,
      },
    })

    return NextResponse.json({ success: true, reportId, reportUrl: publicUrl })
  } catch (err: any) {
    console.error('[TRACR verify-eth]', err)
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
    console.error('[TRACR eth email]', err)
  }
}
