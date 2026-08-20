/**
 * Report delivery — store the abstract, then email the customer a link.
 *
 * Storage follows the pattern in apps/forge/apps/web/lib/fulfillment/passport-pdf.ts:
 * the public `reports` bucket, `<product>/<id>/report.html`, upsert, then
 * getPublicUrl.
 *
 * Email goes through @bizlegal/email — the ONE sender in this monorepo. Do not
 * call api.resend.com from here and do not add a second wrapper. `kind` is
 * 'transactional' because the customer paid for this document; the package
 * defaults to 'marketing', which would bounce the receipt off the
 * double-opt-in check.
 */

import { sendEmail } from '@bizlegal/email'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { UpcomingAlert } from '../extract/date-engine'
import type { LeaseAbstract } from '../extract/types'
import type { LeaseRiskResult } from '../risk/score-engine'
import { generateLeaseReportHTML } from './lease-report'

const REPORTS_BUCKET = 'reports'

export interface DeliverReportInput {
  readonly db: SupabaseClient
  readonly leaseId: string
  readonly email: string | null
  readonly abstract: LeaseAbstract
  readonly risk: LeaseRiskResult
  readonly alerts: readonly UpcomingAlert[]
  readonly engine: 'hermes' | 'claude'
  readonly confidence: number
  readonly warnings: readonly string[]
}

export interface DeliverReportResult {
  readonly reportUrl: string | null
  readonly emailed: boolean
  /** Non-fatal problems — delivery never blocks a successful parse. */
  readonly issues: readonly string[]
}

function plainTextBody(reportUrl: string, risk: LeaseRiskResult, alertCount: number): string {
  return [
    'Your lease abstract is ready.',
    '',
    `Risk grade: ${risk.grade} (${risk.score}/100)`,
    `Risk clauses flagged: ${risk.flagged_clause_count}`,
    `Critical dates in the next 90 days: ${alertCount}`,
    '',
    `Read the full abstract: ${reportUrl}`,
    '',
    'This is a document analysis tool, not legal advice. Verify every date and',
    'dollar figure against the executed lease before relying on it.',
    '',
    '— BizLegal AI / LeaseParse',
  ].join('\n')
}

function emailHtml(reportUrl: string, risk: LeaseRiskResult, alertCount: number): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:560px;color:#050608;line-height:1.6">
  <p style="font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#d4a843;font-weight:700;margin:0 0 12px">LeaseParse &middot; BizLegal AI</p>
  <h1 style="font-size:22px;margin:0 0 16px">Your lease abstract is ready</h1>
  <table style="border-collapse:collapse;font-size:15px;margin:0 0 22px">
    <tr><td style="padding:4px 16px 4px 0;color:#6b6e77">Risk grade</td><td style="padding:4px 0"><strong>${risk.grade} &middot; ${risk.score}/100</strong></td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b6e77">Risk clauses flagged</td><td style="padding:4px 0"><strong>${risk.flagged_clause_count}</strong></td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b6e77">Dates in next 90 days</td><td style="padding:4px 0"><strong>${alertCount}</strong></td></tr>
  </table>
  <p style="margin:0 0 26px">
    <a href="${reportUrl}" style="display:inline-block;background:#050608;color:#fff;text-decoration:none;padding:13px 26px;border-radius:5px;font-weight:600">Read the full abstract</a>
  </p>
  <p style="font-size:12.5px;color:#6b6e77;margin:0">This is a document analysis tool, not legal advice. It reads the text layer of the PDF you supplied — not scanned images, exhibits filed separately, or amendments outside the upload. Verify every date and dollar figure against the executed lease before relying on it.</p>
</div>`
}

/**
 * Upload the report and email the link. Never throws: a parse that succeeded is
 * still worth persisting and returning, so delivery problems are reported as
 * issues for the caller to log rather than as a failed request.
 */
export async function deliverLeaseReport(
  input: DeliverReportInput
): Promise<DeliverReportResult> {
  const { db, leaseId, email, abstract, risk, alerts, engine, confidence, warnings } = input
  const issues: string[] = []

  const html = generateLeaseReportHTML({
    leaseId,
    abstract,
    risk,
    alerts,
    engine,
    confidence,
    warnings,
  })

  const path = `leaseparse/${leaseId}/report.html`
  let reportUrl: string | null = null

  const { error: uploadErr } = await db.storage
    .from(REPORTS_BUCKET)
    .upload(path, Buffer.from(html, 'utf-8'), { contentType: 'text/html', upsert: true })

  if (uploadErr) {
    issues.push(`report_upload_failed: ${uploadErr.message}`)
    return { reportUrl: null, emailed: false, issues }
  }

  reportUrl = db.storage.from(REPORTS_BUCKET).getPublicUrl(path).data.publicUrl

  if (!email) {
    issues.push('no_email_on_lease_row: report stored but not delivered')
    return { reportUrl, emailed: false, issues }
  }

  const sent = await sendEmail({
    to: email,
    subject: `Your lease abstract — risk grade ${risk.grade}`,
    html: emailHtml(reportUrl, risk, alerts.length),
    text: plainTextBody(reportUrl, risk, alerts.length),
    // They paid for this document; it is a receipt, not marketing.
    kind: 'transactional',
    idempotencyKey: `leaseparse_report_${leaseId}`,
  })

  if (!sent.ok) {
    issues.push(`report_email_failed: ${sent.error}${sent.detail ? ` (${sent.detail})` : ''}`)
    return { reportUrl, emailed: false, issues }
  }

  return { reportUrl, emailed: true, issues }
}
