import { sendEmail } from '@bizlegal/email'
import { sendToTelegram } from '@/lib/agents/ea-runner'

/**
 * O-018 — fulfilment for the two written, async products sold at
 * /ai-practice-review (decisions/workflows/ai_practice_review.md):
 *
 *   ai_practice_review ($200) → email the buyer the five questions; ping Moses
 *                               on Telegram. The memo itself is written by
 *                               Moses — nothing here generates advice.
 *   ai_teammate_kit    ($49)  → email the buyer the private kit link
 *                               (/kit?order=<id>, printable) plus the markdown
 *                               download; ping Moses.
 *
 * Called from both payment webhooks on payment.confirmed, like the other
 * lib/payments/*-grant.ts helpers. No-op for every other product. Never throws
 * into the webhook flow. Goes through @bizlegal/email (transactional kind:
 * suppression still applies; consent is not required for a receipt-class
 * message to the address that just paid).
 */

const SITE = 'https://bizlegal-ai.com'
const FROM = 'Moses Dor, Adv. <orders@intelligence.bizlegal-ai.com>'
const REPLY_TO = 'moses@bizlegal-ai.com'

export interface PracticeOrderLike {
  readonly id?: string | number | null
  readonly product?: string | null
  readonly user_email?: string | null
  readonly user_name?: string | null
  readonly amount_cents?: number | null
}

const QUESTIONS: ReadonlyArray<readonly [string, string]> = [
  ['Context', 'What tasks do you want an agent to do, and for which kinds of work (practice areas, not client names)?'],
  [
    'Connections',
    'Which accounts or systems would it connect to (email, calendar, document store, practice-management), and whose data do those hold?',
  ],
  [
    'Capabilities',
    'For each task, what does "done" look like: a draft for you to review, or something sent or filed without you?',
  ],
  ['Cadence', 'How often would it run, who would read its output, and how would you stop it?'],
  [
    'Consent and vendor',
    'What do your engagement terms currently say about third-party tools processing client communications, and which product(s) are you considering?',
  ],
]

const LIMITS =
  'Two limits so we are clear from the start: the memo reviews your intended setup against my published checklist; it is not legal advice on your matters or your clients, and it does not recommend a vendor. Please do not include client names or matter details in your answers.'

const FOOTER =
  'Written by Moses Dor, Adv. in his personal capacity as a practising attorney. Not legal advice; no attorney-client relationship is created. Payment and delivery are processed by BizLegal AI (DOR INNOVATIONS), a software company, not a law firm.'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function reviewEmail(name: string | null | undefined): { subject: string; text: string; html: string } {
  const greeting = name ? `Hello ${name},` : 'Hello,'
  const qText = QUESTIONS.map(([k, q], i) => `${i + 1}. ${k}. ${q}`).join('\n')
  const qHtml = QUESTIONS.map(([k, q]) => `<li><strong>${escapeHtml(k)}.</strong> ${escapeHtml(q)}</li>`).join('')
  const text = [
    greeting,
    '',
    'Thank you. Reply to this email with short answers to the five questions below; a sentence or two each is enough. The written memo follows within five working days of your answers, by email. There is no call.',
    '',
    qText,
    '',
    LIMITS,
    '',
    'Moses Dor, Adv.',
    '',
    FOOTER,
  ].join('\n')
  const html = `<div style="font-family:Georgia,serif;font-size:15px;line-height:1.7;color:#111;max-width:620px">
<p>${escapeHtml(greeting)}</p>
<p>Thank you. Reply to this email with short answers to the five questions below; a sentence or two each is enough. The written memo follows within five working days of your answers, by email. There is no call.</p>
<ol>${qHtml}</ol>
<p>${escapeHtml(LIMITS)}</p>
<p>Moses Dor, Adv.</p>
<p style="font-size:12px;color:#555">${escapeHtml(FOOTER)}</p>
</div>`
  return { subject: 'AI practice review: five questions', text, html }
}

function kitEmail(name: string | null | undefined, orderId: string): { subject: string; text: string; html: string } {
  const greeting = name ? `Hello ${name},` : 'Hello,'
  const readUrl = `${SITE}/kit?order=${encodeURIComponent(orderId)}`
  const mdUrl = `${SITE}/api/kit/download?order=${encodeURIComponent(orderId)}`
  const text = [
    greeting,
    '',
    'Your AI Teammate Kit for Law Practices is ready. This link is personal to your order; please do not forward it.',
    '',
    `Read online (printable; use "Save as PDF" in your browser): ${readUrl}`,
    `Download as Markdown: ${mdUrl}`,
    '',
    'For licensed practitioners; adapt every clause and checklist with counsel in your own jurisdiction. Questions about the kit: reply to this email. I answer in writing.',
    '',
    'Moses Dor, Adv.',
    '',
    FOOTER,
  ].join('\n')
  const html = `<div style="font-family:Georgia,serif;font-size:15px;line-height:1.7;color:#111;max-width:620px">
<p>${escapeHtml(greeting)}</p>
<p>Your AI Teammate Kit for Law Practices is ready. This link is personal to your order; please do not forward it.</p>
<p><a href="${readUrl}">Read online</a> (printable; use &ldquo;Save as PDF&rdquo; in your browser)<br/>
<a href="${mdUrl}">Download as Markdown</a></p>
<p>For licensed practitioners; adapt every clause and checklist with counsel in your own jurisdiction. Questions about the kit: reply to this email. I answer in writing.</p>
<p>Moses Dor, Adv.</p>
<p style="font-size:12px;color:#555">${escapeHtml(FOOTER)}</p>
</div>`
  return { subject: 'Your AI Teammate Kit for Law Practices', text, html }
}

export async function grantPracticeProducts(order: PracticeOrderLike): Promise<void> {
  const product = order.product
  if (product !== 'ai_practice_review' && product !== 'ai_teammate_kit') return
  const email = order.user_email
  if (!email) return
  const orderId = order.id === null || order.id === undefined ? '' : String(order.id)

  try {
    const mail = product === 'ai_practice_review' ? reviewEmail(order.user_name) : kitEmail(order.user_name, orderId)

    const result = await sendEmail({
      to: email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      kind: 'transactional',
      from: FROM,
      replyTo: REPLY_TO,
      idempotencyKey: orderId ? `practice-${product}-${orderId}` : undefined,
    })

    if (!result.ok) {
      console.warn('[practice-grant] email not sent:', result.error, result.detail ?? '')
    }

    const amount = typeof order.amount_cents === 'number' ? `$${(order.amount_cents / 100).toFixed(0)}` : ''
    const next =
      product === 'ai_practice_review'
        ? 'Next: when the answers arrive, draft the memo per decisions/workflows/ai_practice_review.md step 4.'
        : 'Kit link emailed automatically. Nothing to do unless the buyer replies.'
    const delivery = result.ok ? 'delivery email sent' : `delivery email FAILED (${result.error})`
    await sendToTelegram(
      `*O-018 sale* — ${product} ${amount}\n${email}\norder ${orderId || '(no id)'} · ${delivery}\n${next}`,
    )
  } catch (err) {
    console.warn('[practice-grant] threw:', err instanceof Error ? err.message : err)
  }
}
