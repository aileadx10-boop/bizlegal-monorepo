/**
 * Lease abstract report — self-contained HTML, print-ready.
 *
 * Adapted from apps/hub/app/lib/tracr-pdf.ts: the same cover page, section
 * numbering, brand palette, and severity colour map, restyled for a lease
 * abstract. Returns an HTML string (no PDF library, no external assets) so the
 * document can be stored in Supabase Storage and opened straight from a link.
 */

import type { UpcomingAlert } from '../extract/date-engine'
import type { LeaseAbstract, RiskSeverity } from '../extract/types'
import type { LeaseGrade, LeaseRiskResult } from '../risk/score-engine'

const BRAND_GOLD = '#d4a843'
const INK = '#050608'

/** Same family as tracr's risk colours, keyed by lease grade. */
const GRADE_COLORS: Readonly<Record<LeaseGrade, string>> = {
  A: '#27ae60',
  B: '#27ae60',
  C: '#f39c12',
  D: '#e67e22',
  F: '#c0392b',
}

const SEVERITY_COLORS: Readonly<Record<RiskSeverity, string>> = {
  high: '#c0392b',
  warn: '#e67e22',
  info: '#2980b9',
}

const GRADE_VERDICTS: Readonly<Record<LeaseGrade, string>> = {
  A: 'No landlord-leverage clauses were identified in the extracted text.',
  B: 'Minor landlord-leverage clauses present. Standard for a negotiated lease.',
  C: 'Several clauses shift meaningful control to the landlord. Review before renewal.',
  D: 'Significant landlord leverage. These clauses materially affect occupancy certainty.',
  F: 'Severe landlord leverage, including rights that can end the tenancy. Counsel review advised.',
}

export interface LeaseReportInput {
  readonly leaseId: string
  readonly abstract: LeaseAbstract
  readonly risk: LeaseRiskResult
  readonly alerts: readonly UpcomingAlert[]
  readonly engine: 'hermes' | 'claude'
  readonly confidence: number
  readonly warnings: readonly string[]
  readonly generatedAt?: Date
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function money(cents: number | undefined): string {
  if (!cents || cents <= 0) return 'Not stated'
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function orDash(value: string | number | undefined): string {
  if (value === undefined || value === '' || value === 0) return '—'
  return esc(String(value))
}

function longDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '—'
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function row(label: string, value: string): string {
  return `<tr><th>${esc(label)}</th><td>${value}</td></tr>`
}

function renderRiskDrivers(risk: LeaseRiskResult): string {
  if (risk.drivers.length === 0) {
    return `<p class="muted">No risk clauses were flagged in the extracted text. This is not a statement that none exist — only that none appeared in the text layer we read.</p>`
  }
  return risk.drivers
    .map(
      d => `
      <div class="finding" style="border-left-color:${SEVERITY_COLORS[d.severity]}">
        <div class="finding-head">
          <span class="finding-title">${esc(d.label)}</span>
          <span class="badge" style="background:${SEVERITY_COLORS[d.severity]}">${esc(d.severity.toUpperCase())}</span>
        </div>
        <p class="excerpt">&ldquo;${esc(d.excerpt)}&rdquo;</p>
        <p class="muted">Score impact: &minus;${d.deduction} points</p>
      </div>`
    )
    .join('')
}

function renderAlerts(alerts: readonly UpcomingAlert[]): string {
  if (alerts.length === 0) {
    return `<p class="muted">No critical dates fall inside the next 90 days.</p>`
  }
  return `<table class="data">
    <thead><tr><th>Date</th><th>Milestone</th><th>Days out</th><th>Tier</th></tr></thead>
    <tbody>${alerts
      .map(
        a => `<tr>
        <td>${longDate(a.date)}</td>
        <td>${esc(a.label)}</td>
        <td>${a.days_until}</td>
        <td>${a.tier}-day</td>
      </tr>`
      )
      .join('')}</tbody>
  </table>`
}

function renderEscalations(abstract: LeaseAbstract): string {
  const { escalations } = abstract.financial
  if (escalations.length === 0) return `<p class="muted">No rent escalations were extracted.</p>`
  return `<table class="data">
    <thead><tr><th>Effective</th><th>Base rent</th></tr></thead>
    <tbody>${escalations
      .map(e => `<tr><td>${longDate(e.effective)}</td><td>${money(e.base_rent_cents)}</td></tr>`)
      .join('')}</tbody>
  </table>`
}

export function generateLeaseReportHTML(input: LeaseReportInput): string {
  const { leaseId, abstract, risk, alerts, engine, confidence, warnings } = input
  const generatedAt = input.generatedAt ?? new Date()
  const gradeColor = GRADE_COLORS[risk.grade]
  const stamp = generatedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
  const premisesLine = [abstract.premises.address, abstract.premises.city, abstract.premises.state]
    .filter(Boolean)
    .join(', ')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lease Abstract — ${esc(premisesLine || leaseId)}</title>
<style>
  :root { --gold: ${BRAND_GOLD}; --ink: ${INK}; --grade: ${gradeColor}; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #f4f4f5; color: var(--ink);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    line-height: 1.6; -webkit-font-smoothing: antialiased; }
  .page { max-width: 820px; margin: 0 auto 24px; background: #fff; padding: 56px 60px;
    box-shadow: 0 1px 3px rgba(0,0,0,.12); }
  .cover { background: var(--ink); color: #fff; padding: 88px 60px; }
  .logo { color: var(--gold); font-size: 13px; letter-spacing: .28em; text-transform: uppercase; font-weight: 700; }
  .cover h1 { font-size: 40px; line-height: 1.15; margin: 28px 0 8px; font-weight: 700; }
  .cover .sub { font-size: 17px; color: #b9bcc4; margin: 0 0 36px; }
  .cover-meta { display: flex; flex-wrap: wrap; gap: 28px; border-top: 1px solid rgba(255,255,255,.16); padding-top: 22px; }
  .cover-meta div { min-width: 130px; }
  .cover-meta span { display: block; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #83868f; }
  .cover-meta strong { font-size: 15px; font-weight: 600; }
  h2 { font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: #6b6e77;
    border-bottom: 1px solid #e4e4e7; padding-bottom: 10px; margin: 0 0 22px; }
  h2 em { font-style: normal; color: var(--gold); font-weight: 700; }
  .grade-box { display: flex; align-items: center; gap: 26px; padding: 24px 26px; border-radius: 6px;
    background: #fafafa; border-left: 6px solid var(--grade); margin-bottom: 26px; }
  .grade-letter { font-size: 56px; font-weight: 800; color: var(--grade); line-height: 1; }
  .grade-score { font-size: 13px; color: #6b6e77; }
  table.data, table.kv { width: 100%; border-collapse: collapse; font-size: 14px; }
  table.kv th { text-align: left; width: 34%; color: #6b6e77; font-weight: 600; vertical-align: top;
    padding: 9px 12px 9px 0; border-bottom: 1px solid #f0f0f1; }
  table.kv td { padding: 9px 0; border-bottom: 1px solid #f0f0f1; }
  table.data th { text-align: left; font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
    color: #6b6e77; padding: 9px 10px 9px 0; border-bottom: 1px solid #e4e4e7; }
  table.data td { padding: 10px 10px 10px 0; border-bottom: 1px solid #f0f0f1; }
  .finding { border-left: 4px solid #999; background: #fafafa; padding: 16px 18px; margin-bottom: 14px; border-radius: 0 4px 4px 0; }
  .finding-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .finding-title { font-weight: 700; font-size: 15px; }
  .badge { color: #fff; font-size: 10px; letter-spacing: .1em; font-weight: 700; padding: 3px 9px; border-radius: 3px; }
  .excerpt { font-style: italic; color: #3f4148; margin: 10px 0 6px; }
  .muted { color: #6b6e77; font-size: 13px; }
  .section + .section { margin-top: 40px; }
  .disclaimer { margin-top: 40px; padding: 20px 22px; background: #fff8e6; border: 1px solid #f0dca8;
    border-radius: 5px; font-size: 12.5px; color: #58452a; }
  .footer { text-align: center; font-size: 11px; color: #8a8d95; letter-spacing: .1em;
    text-transform: uppercase; padding: 18px 0 40px; }
  @media print { body { background: #fff; } .page, .cover { box-shadow: none; margin: 0; } }
</style>
</head>
<body>

<section class="cover">
  <div class="logo">LeaseParse &middot; BizLegal AI</div>
  <h1>Commercial Lease Abstract</h1>
  <p class="sub">${esc(premisesLine || 'Premises not stated in the lease text')}</p>
  <div class="cover-meta">
    <div><span>Tenant</span><strong>${orDash(abstract.parties.tenant)}</strong></div>
    <div><span>Landlord</span><strong>${orDash(abstract.parties.landlord)}</strong></div>
    <div><span>Prepared</span><strong>${esc(stamp)}</strong></div>
    <div><span>Reference</span><strong>${esc(leaseId.slice(0, 8))}</strong></div>
  </div>
</section>

<section class="page">
  <div class="section">
    <h2><em>01</em> &nbsp; Risk Summary</h2>
    <div class="grade-box">
      <div class="grade-letter">${risk.grade}</div>
      <div>
        <div class="grade-score"><strong>${risk.score}/100</strong> &middot; ${risk.flagged_clause_count} risk clause(s) flagged</div>
        <p style="margin:6px 0 0">${esc(GRADE_VERDICTS[risk.grade])}</p>
      </div>
    </div>
    ${renderRiskDrivers(risk)}
  </div>

  <div class="section">
    <h2><em>02</em> &nbsp; Parties &amp; Premises</h2>
    <table class="kv">
      ${row('Landlord', orDash(abstract.parties.landlord))}
      ${row('Tenant', orDash(abstract.parties.tenant))}
      ${row('Guarantor', orDash(abstract.parties.guarantor))}
      ${row('Address', orDash(abstract.premises.address))}
      ${row('City / State', esc([abstract.premises.city, abstract.premises.state].filter(Boolean).join(', ') || '—'))}
      ${row('Suite', orDash(abstract.premises.suite))}
      ${row('Square feet', abstract.premises.square_feet ? abstract.premises.square_feet.toLocaleString('en-US') : '—')}
    </table>
  </div>
</section>

<section class="page">
  <div class="section">
    <h2><em>03</em> &nbsp; Term</h2>
    <table class="kv">
      ${row('Commencement', longDate(abstract.term.commencement))}
      ${row('Expiration', longDate(abstract.term.expiration))}
      ${row('Renewal options', orDash(abstract.term.renewal_options))}
    </table>
  </div>

  <div class="section">
    <h2><em>04</em> &nbsp; Financial Terms</h2>
    <table class="kv">
      ${row('Base rent', money(abstract.financial.base_rent_cents))}
      ${row('Security deposit', money(abstract.financial.security_deposit_cents))}
      ${row('CAM / operating expenses', orDash(abstract.financial.cam))}
      ${row('Percentage rent', orDash(abstract.financial.percentage_rent))}
    </table>
    <h3 style="font-size:13px;margin:24px 0 10px">Rent escalations</h3>
    ${renderEscalations(abstract)}
  </div>
</section>

<section class="page">
  <div class="section">
    <h2><em>05</em> &nbsp; Critical Dates</h2>
    ${
      abstract.critical_dates.length === 0
        ? '<p class="muted">No critical dates were extracted from this lease.</p>'
        : `<table class="data">
      <thead><tr><th>Date</th><th>Milestone</th><th>Notice window</th></tr></thead>
      <tbody>${abstract.critical_dates
        .map(
          d => `<tr><td>${longDate(d.date)}</td><td>${esc(d.label)}</td><td>${
            d.notice_window_days ? `${d.notice_window_days} days` : '—'
          }</td></tr>`
        )
        .join('')}</tbody></table>`
    }
    <h3 style="font-size:13px;margin:24px 0 10px">Falling within the next 90 days</h3>
    ${renderAlerts(alerts)}
  </div>

  <div class="section">
    <h2><em>06</em> &nbsp; Method &amp; Limitations</h2>
    <table class="kv">
      ${row('Extraction engine', engine === 'hermes' ? 'Hermes (local)' : 'Claude (fallback)')}
      ${row('Field completeness', `${Math.round(confidence * 100)}%`)}
      ${row('Source', 'PDF text layer (no OCR)')}
    </table>
    ${
      warnings.length > 0
        ? `<h3 style="font-size:13px;margin:24px 0 10px">Extraction warnings</h3>
           <ul class="muted">${warnings.map(w => `<li>${esc(w)}</li>`).join('')}</ul>`
        : ''
    }
    <div class="disclaimer">
      <strong>This is a document analysis tool, not legal advice.</strong>
      LeaseParse reads the text layer of the PDF you supplied and reports what it
      found. It does not read scanned images, handwritten riders, exhibits filed
      separately, or amendments not included in the upload. Fields shown as
      &ldquo;—&rdquo; were not located in the text; they are not assertions that
      the lease is silent. Verify every date and dollar figure against the
      executed lease before relying on it. No attorney-client relationship is
      created by this report.
    </div>
  </div>
</section>

<div class="footer">LeaseParse // BizLegal AI // ${esc(leaseId)}</div>

</body>
</html>`
}
