import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { logEventAsync } from '@/lib/ops/log'
import { supabaseAdmin } from '@/lib/supabase'
import { claimWebhookEvent } from '@/lib/payments/webhook-idempotency'
import { analyzeReserve, parseOrderEmailKey, renderReportHtml, validateReserveInput } from '@/lib/reserve-report'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/reserve-report/webhook — NOWPayments IPN for the W2-5 reserve
 * report product (webhook_path on stablecoin_reserve_monthly).
 *
 * Self-contained fulfillment (TRACR-style): the universal /api/pay/start path
 * does not write payment_orders, so this handler matches the reserve_reports
 * row by the order_id's embedded email key, generates the template report
 * deterministically from the stored payload, uploads it, emails the link, and
 * emits payment.confirmed + report.generated. No audit claims — the report
 * template is generated from issuer-supplied data.
 */

const TERMINAL_PAID = ['finished', 'confirmed', 'sending']

interface ReserveReportIpn {
  payment_id?: string
  payment_status?: string
  order_id?: string
  price_amount?: number
  actually_paid?: number
}

function sortedJsonString(obj: Record<string, unknown>): string {
  const sorted = Object.keys(obj)
    .sort()
    .reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = obj[k]
      return acc
    }, {})
  return JSON.stringify(sorted)
}

function verifyIpnSignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const parsed = JSON.parse(rawBody) as Record<string, unknown>
    const expected = crypto.createHmac('sha512', secret).update(sortedJsonString(parsed)).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.NOWPAYMENTS_IPN_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'webhook secret not configured' }, { status: 500 })
    }
    const signature = req.headers.get('x-nowpayments-sig') ?? ''
    if (!signature) return NextResponse.json({ error: 'missing signature' }, { status: 401 })

    const rawBody = await req.text()
    if (!verifyIpnSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
    }

    const ipn = JSON.parse(rawBody) as ReserveReportIpn
    const paymentId = String(ipn.payment_id ?? '')
    const orderId = ipn.order_id ?? ''
    const status = ipn.payment_status ?? ''

    if (!orderId || !paymentId) {
      return NextResponse.json({ received: true })
    }

    const claim = await claimWebhookEvent({
      gateway: 'nowpayments',
      eventId: paymentId,
      eventType: status,
    })
    if (claim === 'duplicate') return NextResponse.json({ ok: true, deduped: true })
    if (claim === 'error') return NextResponse.json({ error: 'idempotency_storage_failed' }, { status: 500 })

    // Map the pay/start order_id back to the reserve_reports row.
    const emailKey = parseOrderEmailKey(orderId)
    if (!emailKey) {
      // Not one of our order ids — acknowledge without fulfilling.
      return NextResponse.json({ received: true })
    }

    const { data: row } = await supabaseAdmin
      .from('reserve_reports')
      .select('*')
      .eq('order_email_key', emailKey)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!row) return NextResponse.json({ received: true })

    if (TERMINAL_PAID.includes(status)) {
      await supabaseAdmin
        .from('reserve_reports')
        .update({ status: 'processing', paid_at: new Date().toISOString(), order_id: orderId, nowpayments_payment_id: paymentId })
        .eq('id', row.id)

      try {
        const validated = validateReserveInput(row.payload)
        if (!validated.ok) throw new Error('stored payload invalid at fulfillment')
        const report = analyzeReserve(validated.input)
        const html = renderReportHtml(report, {
          issuerName: validated.input.issuerName,
          orderId,
          reportUrl: '',
        })

        const storagePath = `reserve-reports/${row.id}.html`
        await supabaseAdmin.storage
          .from('reserve-reports')
          .upload(storagePath, Buffer.from(html, 'utf-8'), { contentType: 'text/html', upsert: true })
        const { data: { publicUrl } } = supabaseAdmin.storage.from('reserve-reports').getPublicUrl(storagePath)

        const finalHtml = renderReportHtml(report, { issuerName: validated.input.issuerName, orderId, reportUrl: publicUrl })
        await supabaseAdmin
          .from('reserve_reports')
          .update({ status: 'delivered', report_url: publicUrl, report_html: finalHtml, delivered_at: new Date().toISOString() })
          .eq('id', row.id)

        await sendReportEmail(row.email, validated.input.issuerName, row.id, publicUrl)

        logEventAsync({
          type: 'payment.confirmed',
          source: 'hub',
          ref_id: row.id,
          email: row.email,
          amount_cents: Math.round(Number(ipn.price_amount ?? ipn.actually_paid ?? 0) * 100),
          status: 'ok',
          metadata: { product: 'stablecoin_reserve_monthly', gateway: 'nowpayments', payment_status: status, payment_id: paymentId },
        })
        logEventAsync({
          type: 'report.generated',
          source: 'hub',
          ref_id: row.id,
          email: row.email,
          status: 'ok',
          metadata: { product: 'stablecoin_reserve_monthly', regime: report.regime, coverage_pct: report.coveragePct, issues: report.issues.length },
        })
      } catch (genErr) {
        const msg = genErr instanceof Error ? genErr.message : 'unknown'
        await supabaseAdmin.from('reserve_reports').update({ status: 'error' }).eq('id', row.id)
        logEventAsync({
          type: 'error',
          source: 'hub',
          ref_id: row.id,
          email: row.email,
          status: 'failed',
          metadata: { stage: 'reserve-report-generation', error: msg },
        })
      }
    } else if (status === 'failed' || status === 'expired') {
      await supabaseAdmin.from('reserve_reports').update({ status: 'failed' }).eq('id', row.id)
      logEventAsync({
        type: 'payment.failed',
        source: 'hub',
        ref_id: row.id,
        email: row.email,
        status: 'failed',
        metadata: { gateway: 'nowpayments', payment_status: status },
      })
    }

    return NextResponse.json({ ok: true, status })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    console.error('[reserve-report/webhook]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

async function sendReportEmail(email: string, issuerName: string, reportId: string, reportUrl: string) {
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `BizLegal AI Intelligence <${process.env.RESEND_FROM_EMAIL ?? 'intelligence@intelligence.bizlegal-ai.com'}>`,
        to: [email],
        subject: `Your Stablecoin Reserve Report — ${reportId.slice(0, 8)}`,
        html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#fff">
  <div style="font-family:monospace;font-size:20px;font-weight:700;letter-spacing:0.1em;color:#050608;margin-bottom:24px">RESERVE REPORT</div>
  <p style="color:#444;font-size:16px">Dear ${issuerName},</p>
  <p style="color:#444;font-size:15px;line-height:1.7">Your templated reserve report is ready. It is generated from the reserve composition you supplied — it is <strong>not an audit</strong>, and a named qualified professional must review it before external use.</p>
  <a href="${reportUrl}" style="display:inline-block;padding:14px 32px;background:#050608;color:#d4a843;font-weight:700;font-size:14px;text-decoration:none;margin-bottom:24px">VIEW REPORT &rarr;</a>
  <p style="color:#999;font-size:12px;line-height:1.7">This report does not certify, verify, or opine on the accuracy of the reserve data, and it is not legal advice.</p>
</div>`,
      }),
    })
  } catch (err) {
    console.error('[reserve-report email]', err)
  }
}
