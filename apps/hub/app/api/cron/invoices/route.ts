import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'
import { resend } from '@/lib/resend'
import {
  getWireDetails,
  wireReferenceFromOrderId,
  type WireCurrency,
  type WireDetails,
} from '@/lib/payments/wire'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/cron/invoices — agents/ops/invoice-agent.md as code.
 *
 * Daily cron over `payment_orders` rows with gateway='wire' and
 * status='pending_wire' (the shape written by /api/payments/wire/start;
 * /api/payments/wire/confirm flips them to active/partial_paid):
 *
 *   1. No `metadata.invoice_sent_at` yet → send invoice email
 *      (invoice number BL-{YYYYMMDD}-{seq}, wire details from the same
 *      BANK_* envs wire/start uses, alt crypto/card link to /checkout),
 *      then stamp metadata.invoice_sent_at + reminder_count=0.
 *   2. Aged >= 3d since invoice_sent_at, reminder_count 0 → Day-3
 *      "just checking in" reminder, reminder_count=1.
 *   3. Aged >= 7d, reminder_count 1 → Day-7 overdue notice with
 *      alternative payment options, reminder_count=2.
 *   4. Aged >= 14d, not yet escalated → Telegram alert to Moses,
 *      stamp metadata.escalated_at. Final notice is a Moses decision.
 *
 * Idempotent per run: every action is gated on a metadata flag that the
 * same run writes, so re-running is safe.
 *
 * Auth: CRON_SECRET in Authorization: Bearer header (Vercel Cron sends
 * this automatically when configured in vercel.json).
 */

const REMINDER_1_DAYS = 3
const REMINDER_2_DAYS = 7
const ESCALATE_DAYS = 14
const DAY_MS = 24 * 60 * 60 * 1000

interface PendingWireOrder {
  id: string
  user_email: string
  user_name: string | null
  product: string
  tier: string
  billing_interval: 'one-time' | 'monthly' | 'yearly'
  amount_cents: number
  gateway_invoice_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

async function sendTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return false
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    })
    return res.ok
  } catch (err) {
    console.warn('[cron/invoices] telegram send failed:', err)
    return false
  }
}

function formatAmount(amountCents: number, currency: WireCurrency): string {
  return `${currency === 'USD' ? '$' : '€'}${(amountCents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function wireRowsHtml(wire: WireDetails, currency: WireCurrency): string {
  const detailRows: Array<[string, string | undefined]> =
    currency === 'EUR'
      ? [
          ['Bank name', wire.bankName],
          ['Bank address', wire.bankAddress],
          ['IBAN', wire.iban],
          ['BIC / SWIFT', wire.bic],
          ['Beneficiary name', wire.beneficiary],
        ]
      : [
          ['Bank name', wire.bankName],
          ['Bank address', wire.bankAddress],
          ['Routing (ABA)', wire.routing],
          ['Account number', wire.accountNumber],
          ['Account type', wire.accountType],
          ['SWIFT (intl. wires)', wire.swift],
          ['Beneficiary name', wire.beneficiary],
        ]
  return detailRows
    .filter(([, v]) => v && v.length > 0)
    .map(
      ([k, v]) => `<tr>
  <td style="padding:8px 14px;border-bottom:1px solid #2a3148;font-size:12px;color:#8d90a0;letter-spacing:0.05em;text-transform:uppercase;width:42%;">${k}</td>
  <td style="padding:8px 14px;border-bottom:1px solid #2a3148;font-size:14px;color:#dee1f7;font-family:'Courier New',monospace;font-weight:600;">${v}</td>
</tr>`,
    )
    .join('\n')
}

function emailShell(inner: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="background:#0e1322;color:#dee1f7;font-family:'Manrope',sans-serif;margin:0;padding:0;">
<div style="max-width:580px;margin:0 auto;padding:40px 24px;">
  <div style="font-family:Georgia,serif;font-size:22px;color:#dee1f7;margin-bottom:32px;">BizLegal <span style="color:#e9c349;">•</span> AI</div>
${inner}
  <hr style="border:none;border-top:1px solid #2a3148;margin:24px 0;"/>
  <p style="font-size:11px;color:#8d90a0;line-height:1.6;margin:0;">BizLegal AI is software operated by DOR INNOVATIONS. Not a law firm; outputs are research, not legal advice. Questions: <a href="mailto:team@bizlegal-ai.com" style="color:#b4c5ff;">team@bizlegal-ai.com</a></p>
</div>
</body></html>`
}

// Kept local to this route (invoice-agent-specific formatting); lib/resend
// stays the home of the shared/wire-start templates.
async function sendInvoiceEmail(args: {
  order: PendingWireOrder
  invoiceNumber: string
  reference: string
  wire: WireDetails
  currency: WireCurrency
  altPayUrl: string
  dueDate: string
}) {
  const { order, invoiceNumber, reference, wire, currency, altPayUrl, dueDate } = args
  const amount = formatAmount(order.amount_cents, currency)
  const productLabel = `${order.product.toUpperCase()} ${order.tier} ${order.billing_interval}`
  return resend.emails.send({
    from: 'BizLegal AI <orders@intelligence.bizlegal-ai.com>',
    to: order.user_email,
    replyTo: 'team@bizlegal-ai.com',
    subject: `Invoice ${invoiceNumber} — ${productLabel} — ${amount}`,
    html: emailShell(`
  <h1 style="font-family:Georgia,serif;font-size:24px;color:#dee1f7;line-height:1.25;margin:0 0 8px;">Invoice ${invoiceNumber}</h1>
  <p style="font-size:13px;color:#8d90a0;margin:0 0 24px;letter-spacing:0.04em;text-transform:uppercase;">${productLabel} · due ${dueDate} (NET 7)</p>
  <p style="color:#c3c6d7;font-size:14px;line-height:1.65;margin:0 0 16px;">Hi${order.user_name ? ` ${order.user_name}` : ''},</p>
  <p style="color:#c3c6d7;font-size:14px;line-height:1.65;margin:0 0 16px;">Please find below invoice <strong style="color:#dee1f7;">${invoiceNumber}</strong> for ${productLabel} — <strong style="color:#e9c349;">${amount} ${currency}</strong>. Wire the amount using the details below and put the reference in the bank&rsquo;s memo field exactly as written.</p>
  <table style="width:100%;border-collapse:collapse;background:#161b2b;border:1px solid #2a3148;margin:16px 0 24px;">
${wireRowsHtml(wire, currency)}
  <tr>
    <td style="padding:8px 14px;border-bottom:1px solid #2a3148;font-size:12px;color:#e9c349;letter-spacing:0.05em;text-transform:uppercase;font-weight:700;">Reference (REQUIRED)</td>
    <td style="padding:8px 14px;border-bottom:1px solid #2a3148;font-size:16px;color:#e9c349;font-family:'Courier New',monospace;font-weight:700;">${reference}</td>
  </tr>
  </table>
  <p style="color:#c3c6d7;font-size:13px;line-height:1.6;margin:0 0 16px;">Prefer crypto or card instead of a wire? Pay the same order here: <a href="${altPayUrl}" style="color:#b4c5ff;">${altPayUrl}</a></p>
  <p style="color:#c3c6d7;font-size:13px;line-height:1.6;margin:0 0 16px;">Reply to confirm receipt or with any questions. We mark your order paid within 1 business day of the wire landing. Order ID: <code style="font-family:'Courier New',monospace;">${order.id}</code></p>`),
  })
}

async function sendReminderEmail(args: {
  order: PendingWireOrder
  invoiceNumber: string
  reference: string
  currency: WireCurrency
  reminderNumber: 1 | 2
  altPayUrl: string
}) {
  const { order, invoiceNumber, reference, currency, reminderNumber, altPayUrl } = args
  const amount = formatAmount(order.amount_cents, currency)
  const productLabel = `${order.product.toUpperCase()} ${order.tier} ${order.billing_interval}`
  const isOverdue = reminderNumber === 2
  const body = isOverdue
    ? `<p style="color:#c3c6d7;font-size:14px;line-height:1.65;margin:0 0 16px;">Invoice <strong style="color:#dee1f7;">${invoiceNumber}</strong> for ${productLabel} (<strong style="color:#e9c349;">${amount} ${currency}</strong>) is now past its NET-7 due date. If the wire is already on its way, reply with proof of transfer and we&rsquo;ll reconcile it as soon as it lands.</p>
  <p style="color:#c3c6d7;font-size:14px;line-height:1.65;margin:0 0 16px;">If a bank wire is inconvenient, the same order can be paid by crypto or card in a couple of minutes: <a href="${altPayUrl}" style="color:#b4c5ff;">${altPayUrl}</a></p>`
    : `<p style="color:#c3c6d7;font-size:14px;line-height:1.65;margin:0 0 16px;">Just checking in on invoice <strong style="color:#dee1f7;">${invoiceNumber}</strong> for ${productLabel} (<strong style="color:#e9c349;">${amount} ${currency}</strong>). Wires can take 1&ndash;3 business days — if yours is already sent, no action needed. Otherwise the wire details are in the original invoice email.</p>
  <p style="color:#c3c6d7;font-size:14px;line-height:1.65;margin:0 0 16px;">Prefer crypto or card? Same order, instant confirmation: <a href="${altPayUrl}" style="color:#b4c5ff;">${altPayUrl}</a></p>`
  return resend.emails.send({
    from: 'BizLegal AI <orders@intelligence.bizlegal-ai.com>',
    to: order.user_email,
    replyTo: 'team@bizlegal-ai.com',
    subject: isOverdue
      ? `Overdue: invoice ${invoiceNumber} — ${productLabel}`
      : `Re: invoice ${invoiceNumber} — ${productLabel}`,
    html: emailShell(`
  <h1 style="font-family:Georgia,serif;font-size:24px;color:#dee1f7;line-height:1.25;margin:0 0 8px;">${isOverdue ? 'Invoice overdue' : 'Quick check-in'}</h1>
  <p style="font-size:13px;color:#8d90a0;margin:0 0 24px;letter-spacing:0.04em;text-transform:uppercase;">${productLabel} · ref ${reference}</p>
${body}
  <p style="color:#c3c6d7;font-size:13px;line-height:1.6;margin:0 0 16px;">Wire memo reference: <strong style="color:#e9c349;font-family:'Courier New',monospace;">${reference}</strong> · Order ID: <code style="font-family:'Courier New',monospace;">${order.id}</code></p>`),
  })
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') ?? ''
    const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
    if (!process.env.CRON_SECRET || authHeader !== expected) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()
    const now = new Date()
    const nowIso = now.toISOString()

    const { data: pending, error: queryErr } = await supabase
      .from('payment_orders')
      .select(
        'id, user_email, user_name, product, tier, billing_interval, amount_cents, gateway_invoice_id, metadata, created_at',
      )
      .eq('gateway', 'wire')
      .eq('status', 'pending_wire')
      .order('created_at', { ascending: true })
      .limit(100)

    if (queryErr) {
      console.error('[cron/invoices] query failed', queryErr)
      return NextResponse.json({ error: 'query failed' }, { status: 500 })
    }

    const orders = (pending ?? []) as PendingWireOrder[]
    if (orders.length === 0) {
      return NextResponse.json({ ok: true, processed: 0 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bizlegal-ai.com'
    const today = nowIso.slice(0, 10).replace(/-/g, '') // YYYYMMDD

    // Sequence number continues from invoices already issued today (idempotent
    // across re-runs — already-invoiced rows are skipped below anyway).
    const { count: issuedToday } = await supabase
      .from('payment_orders')
      .select('id', { count: 'exact', head: true })
      .eq('gateway', 'wire')
      .like('metadata->>invoice_number', `BL-${today}-%`)
    let seq = issuedToday ?? 0

    let invoicesSent = 0
    let remindersSent = 0
    let escalations = 0
    const results: Array<{ id: string; action: string; ok: boolean; error?: string }> = []

    for (const order of orders) {
      try {
        const meta = (order.metadata ?? {}) as Record<string, unknown>
        const currency: WireCurrency = meta.currency === 'EUR' ? 'EUR' : 'USD'
        const invoiceSentAt =
          typeof meta.invoice_sent_at === 'string' ? meta.invoice_sent_at : null
        const reminderCount = typeof meta.reminder_count === 'number' ? meta.reminder_count : 0
        const escalatedAt = typeof meta.escalated_at === 'string' ? meta.escalated_at : null
        const reference = order.gateway_invoice_id ?? wireReferenceFromOrderId(order.id)
        const altPayUrl =
          `${baseUrl}/checkout?product=${encodeURIComponent(order.product)}` +
          `&tier=${encodeURIComponent(order.tier)}` +
          `&interval=${encodeURIComponent(order.billing_interval)}` +
          `&amount=${order.amount_cents}`

        // 1. Fresh order — send the invoice
        if (!invoiceSentAt) {
          const wire = getWireDetails(currency)
          if (!wire) {
            results.push({ id: order.id, action: 'invoice', ok: false, error: `wire ${currency} not configured` })
            continue
          }
          seq += 1
          const invoiceNumber = `BL-${today}-${String(seq).padStart(3, '0')}`
          const dueDate = new Date(now.getTime() + 7 * DAY_MS).toISOString().slice(0, 10)
          await sendInvoiceEmail({ order, invoiceNumber, reference, wire, currency, altPayUrl, dueDate })
          await supabase
            .from('payment_orders')
            .update({
              metadata: {
                ...meta,
                invoice_number: invoiceNumber,
                invoice_sent_at: nowIso,
                reminder_count: 0,
              },
            })
            .eq('id', order.id)
          invoicesSent++
          results.push({ id: order.id, action: `invoice:${invoiceNumber}`, ok: true })
          continue
        }

        const invoiceNumber =
          typeof meta.invoice_number === 'string' ? meta.invoice_number : reference
        const ageDays = (now.getTime() - Date.parse(invoiceSentAt)) / DAY_MS

        // 2. Aged >= 14d — Telegram escalation to Moses (once)
        if (ageDays >= ESCALATE_DAYS && !escalatedAt) {
          const amount = formatAmount(order.amount_cents, currency)
          await sendTelegram(
            `🚨 Wire invoice ${invoiceNumber} unpaid for ${Math.floor(ageDays)} days\n` +
              `${order.product} ${order.tier} — ${amount} ${currency}\n` +
              `Buyer: ${order.user_email}\n` +
              `Reference: ${reference}\nOrder: ${order.id}\n` +
              `Decide: final notice / cancel / call. Confirm via /api/payments/wire/confirm when paid.`,
          )
          await supabase
            .from('payment_orders')
            .update({ metadata: { ...meta, escalated_at: nowIso } })
            .eq('id', order.id)
          escalations++
          results.push({ id: order.id, action: 'escalate', ok: true })
          continue
        }

        // 3. Reminders: day 3 (count 0 -> 1) and day 7 (count 1 -> 2)
        const dueReminder: 1 | 2 | null =
          ageDays >= REMINDER_2_DAYS && reminderCount === 1
            ? 2
            : ageDays >= REMINDER_1_DAYS && reminderCount === 0
              ? 1
              : null
        if (dueReminder) {
          await sendReminderEmail({
            order,
            invoiceNumber,
            reference,
            currency,
            reminderNumber: dueReminder,
            altPayUrl,
          })
          await supabase
            .from('payment_orders')
            .update({
              metadata: { ...meta, reminder_count: dueReminder, last_reminder_at: nowIso },
            })
            .eq('id', order.id)
          remindersSent++
          results.push({ id: order.id, action: `reminder:${dueReminder}`, ok: true })
          continue
        }

        results.push({ id: order.id, action: 'noop', ok: true })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown'
        results.push({ id: order.id, action: 'error', ok: false, error: msg })
      }
    }

    const failures = results.filter((r) => !r.ok).length

    logEventAsync({
      type: 'cron.completed',
      source: 'hub',
      ref_id: 'invoices',
      status: failures > 0 ? 'failed' : 'ok',
      metadata: {
        cron: 'invoices',
        processed: orders.length,
        invoices_sent: invoicesSent,
        reminders_sent: remindersSent,
        escalations,
        failures,
      },
    })

    return NextResponse.json({
      ok: true,
      processed: orders.length,
      invoices_sent: invoicesSent,
      reminders_sent: remindersSent,
      escalations,
      failures,
      results,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[cron/invoices]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
