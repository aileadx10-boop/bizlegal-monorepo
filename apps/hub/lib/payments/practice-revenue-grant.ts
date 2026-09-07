import type { SupabaseClient } from '@supabase/supabase-js'
import { sendEmail } from '@bizlegal/email'
import { logEventAsync } from '@/lib/ops/log'
import { sendToTelegram } from '@/lib/agents/ea-runner'

/**
 * Fulfilment for `practice_revenue_report` ($99, one-time).
 *
 * The report already exists before payment (free totals row). /api/pay/start
 * stores `source = 'practice_revenue:<report_ref>'` on the payment_orders
 * row, so on payment.confirmed this helper flips that report to paid,
 * extends its retention, and emails the unlocked link. Idempotent: a replayed
 * webhook updates zero rows (paid_at is already set) and the email carries
 * an Idempotency-Key per order.
 *
 * Fallbacks, in order: the ref in `source` → the latest unpaid report for the
 * paying email → an email asking for the reference + a Telegram ping. Never
 * throws into the webhook flow.
 */

const SITE = 'https://bizlegal-ai.com'
const FROM = 'BizLegal AI <orders@intelligence.bizlegal-ai.com>'
const REPLY_TO = 'team@bizlegal-ai.com'
const PAID_RETENTION_DAYS = 180
const REF_RE = /practice_revenue:(PR-\d{4}-[0-9a-f]{10})/i

export interface PracticeRevenueOrderLike {
  readonly id?: string | number | null
  readonly product?: string | null
  readonly user_email?: string | null
  readonly user_name?: string | null
  readonly amount_cents?: number | null
  readonly source?: string | null
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const FOOTER =
  'The Practice Revenue Report is arithmetic on the export you uploaded. It is not a financial statement and not legal, tax or accounting advice. BizLegal AI (DOR INNOVATIONS) is a software company, not a law firm.'

function unlockedEmail(ref: string): { subject: string; text: string; html: string } {
  const url = `${SITE}/practice-revenue/report/${encodeURIComponent(ref)}`
  const text = [
    'Hello,',
    '',
    `Your Practice Revenue Report is unlocked: ${url}`,
    '',
    'Open it in the same browser you uploaded from and your client names appear automatically; anywhere else, import the name key you downloaded. Use your browser’s "Save as PDF" on the report page for a copy. The unlocked report stays available for 180 days.',
    '',
    'Questions: reply to this email. We answer in writing.',
    '',
    FOOTER,
  ].join('\n')
  const html = `<div style="font-family:Georgia,serif;font-size:15px;line-height:1.7;color:#111;max-width:620px">
<p>Hello,</p>
<p>Your Practice Revenue Report is unlocked: <a href="${url}">${url}</a></p>
<p>Open it in the same browser you uploaded from and your client names appear automatically; anywhere else, import the name key you downloaded. Use your browser&rsquo;s &ldquo;Save as PDF&rdquo; on the report page for a copy. The unlocked report stays available for 180 days.</p>
<p>Questions: reply to this email. We answer in writing.</p>
<p style="font-size:12px;color:#555">${escapeHtml(FOOTER)}</p>
</div>`
  return { subject: `Your Practice Revenue Report is unlocked (${ref})`, text, html }
}

function unmatchedEmail(): { subject: string; text: string; html: string } {
  const text = [
    'Hello,',
    '',
    'We received your payment for a Practice Revenue Report but could not match it to an uploaded report automatically. Reply to this email with the report reference (it starts with PR-) shown on the results page and we will unlock it the same day.',
    '',
    FOOTER,
  ].join('\n')
  const html = `<div style="font-family:Georgia,serif;font-size:15px;line-height:1.7;color:#111;max-width:620px">
<p>Hello,</p>
<p>We received your payment for a Practice Revenue Report but could not match it to an uploaded report automatically. Reply to this email with the report reference (it starts with PR-) shown on the results page and we will unlock it the same day.</p>
<p style="font-size:12px;color:#555">${escapeHtml(FOOTER)}</p>
</div>`
  return { subject: 'Practice Revenue Report — one detail needed to unlock', text, html }
}

async function markPaid(
  supabase: SupabaseClient,
  where: { report_ref: string } | { email: string },
  orderId: string,
  email: string,
): Promise<string | null> {
  const now = new Date()
  const expires = new Date(now.getTime() + PAID_RETENTION_DAYS * 86_400_000).toISOString()
  const patch = { paid_at: now.toISOString(), tier: 'paid', paid_email: email, payment_order_id: orderId || null, expires_at: expires }
  if ('report_ref' in where) {
    const { data } = await supabase.from('practice_revenue_reports').update(patch).eq('report_ref', where.report_ref).is('paid_at', null).select('report_ref').maybeSingle()
    return data?.report_ref ?? null
  }
  const { data: latest } = await supabase
    .from('practice_revenue_reports')
    .select('report_ref')
    .ilike('email', where.email)
    .is('paid_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!latest?.report_ref) return null
  const { data } = await supabase.from('practice_revenue_reports').update(patch).eq('report_ref', latest.report_ref).is('paid_at', null).select('report_ref').maybeSingle()
  return data?.report_ref ?? null
}

export async function grantPracticeRevenueReport(supabase: SupabaseClient, order: PracticeRevenueOrderLike): Promise<void> {
  if (order.product !== 'practice_revenue_report') return
  const email = (order.user_email ?? '').trim().toLowerCase()
  if (!email) return
  const orderId = order.id === null || order.id === undefined ? '' : String(order.id)

  try {
    const m = (order.source ?? '').match(REF_RE)
    let ref: string | null = null
    if (m) ref = await markPaid(supabase, { report_ref: m[1].toUpperCase() }, orderId, email)
    if (!ref) {
      // A replayed webhook lands here too (paid_at already set) — check before falling back.
      if (m) {
        const { data: already } = await supabase.from('practice_revenue_reports').select('report_ref, paid_at').eq('report_ref', m[1].toUpperCase()).maybeSingle()
        if (already?.paid_at) ref = already.report_ref
      }
      if (!ref) ref = await markPaid(supabase, { email }, orderId, email)
    }

    if (!ref) {
      const mail = unmatchedEmail()
      await sendEmail({ to: email, ...mail, kind: 'transactional', from: FROM, replyTo: REPLY_TO, idempotencyKey: orderId ? `prr-unmatched-${orderId}` : undefined })
      await sendToTelegram(`*Practice Revenue Report* paid but UNMATCHED\n${email}\norder ${orderId || '(no id)'} · source ${order.source ?? '(none)'}\nReply to the buyer with the unlock once they send the PR- reference.`)
      return
    }

    const mail = unlockedEmail(ref)
    const result = await sendEmail({ to: email, ...mail, kind: 'transactional', from: FROM, replyTo: REPLY_TO, idempotencyKey: orderId ? `prr-paid-${orderId}` : undefined })
    if (!result.ok) console.warn('[practice-revenue-grant] email not sent:', result.error, result.detail ?? '')

    logEventAsync({
      type: 'report.generated',
      source: 'hub',
      ref_id: ref,
      email,
      amount_cents: typeof order.amount_cents === 'number' ? order.amount_cents : 9900,
      status: 'ok',
      metadata: { product: 'practice_revenue_report', order_id: orderId || null, delivery: result.ok ? 'sent' : result.error },
    })

    await sendToTelegram(`*Practice Revenue Report* sale — $99\n${email}\nreport ${ref} · order ${orderId || '(no id)'} · ${result.ok ? 'unlock email sent' : `unlock email FAILED (${result.error})`}`)
  } catch (err) {
    console.warn('[practice-revenue-grant] threw:', err instanceof Error ? err.message : err)
  }
}
