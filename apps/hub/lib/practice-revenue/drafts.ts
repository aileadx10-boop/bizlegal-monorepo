/**
 * Draft-only outputs. Nothing here is ever sent by us.
 *
 * Wording stays to the amount, the invoice number, the dates and a polite
 * question. No interest, no late fees, no "collections", no threat to pause
 * work, no deadlines — fee-dispute and client-communication rules differ by
 * jurisdiction and the text cites none of them. Names are placeholders the
 * buyer's browser fills from its local key; the server never holds a
 * recipient name.
 */
import type { Cents, Draft, OverdueRow, UnbilledRow } from './types'

export const MAX_DRAFTS = 50

export function formatMoney(cents: Cents, currency: string): string {
  const abs = Math.abs(cents)
  const whole = Math.floor(abs / 100)
  const frac = String(abs % 100).padStart(2, '0')
  const grouped = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${cents < 0 ? '-' : ''}${currency} ${grouped}.${frac}`
}

export function reminderDraft(inv: OverdueRow, currency: string): Draft {
  const amount = formatMoney(inv.openCents, currency)
  const dueLine = inv.dueDate ? ` It was due on ${inv.dueDate}.` : ''
  const body = [
    'Dear {{client}},',
    '',
    `I am writing about invoice {{invoice}}, issued on ${inv.issuedDate}, with an open balance of ${amount}.${dueLine}`,
    '',
    'If payment has already been sent, please let me know and I will update my records. If you have any questions about the invoice, I am glad to answer them by email.',
    '',
    'Thank you,',
    '{{your_name}}',
    '{{firm}}',
  ].join('\n')
  return {
    kind: 'reminder',
    ref: inv.invoiceId,
    subject: `Invoice {{invoice}} — open balance ${amount}`,
    body,
    placeholders: ['{{client}}', '{{invoice}}', '{{your_name}}', '{{firm}}'],
  }
}

export function invoiceLineDraft(entry: UnbilledRow, currency: string): Draft {
  const amount = entry.amountCents === null ? '{{amount}}' : formatMoney(entry.amountCents, currency)
  const matter = entry.matterId ? ' — {{matter}}' : ''
  const body = `${entry.date}${matter}: {{description}} — ${entry.hours.toFixed(2)} h — ${amount}`
  return {
    kind: 'invoice_line',
    ref: `row-${entry.row}`,
    subject: `Unbilled entry ${entry.date} ({{client}})`,
    body,
    placeholders: ['{{client}}', '{{matter}}', '{{description}}', ...(entry.amountCents === null ? ['{{amount}}'] : [])],
  }
}

export function buildDrafts(
  overdue: readonly OverdueRow[] | null,
  unbilled: readonly UnbilledRow[] | null,
  currency: string,
): { readonly reminders: readonly Draft[]; readonly invoiceLines: readonly Draft[] } {
  const reminders = (overdue ?? [])
    .filter((r) => r.daysPast > 0)
    .slice(0, MAX_DRAFTS)
    .map((r) => reminderDraft(r, currency))
  const invoiceLines = (unbilled ?? []).slice(0, MAX_DRAFTS).map((u) => invoiceLineDraft(u, currency))
  return { reminders, invoiceLines }
}
