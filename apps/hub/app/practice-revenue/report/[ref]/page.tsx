'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import PrintButton from '@/components/report/PrintButton'
import { formatMoney } from '@/lib/practice-revenue/drafts'
import { keyFromCsv, relabel } from '@/lib/practice-revenue/pseudonymise'
import type { PseudonymKey } from '@/lib/practice-revenue/pseudonymise'
import type { ClientRow, Draft, Finding, Headline, PracticeRevenueReport } from '@/lib/practice-revenue/types'
import { describeFinding } from '../../UploadPanel'

/**
 * The report page. Codes come from the server; names come from the key in
 * this browser (localStorage prr:<ref>, or an imported key file). The
 * relabelling happens in the DOM only, so "Save as PDF" prints real names
 * here and codes anywhere the key is absent.
 */

interface ReportResponse {
  readonly ok: boolean
  readonly report_ref: string
  readonly paid: boolean
  readonly as_of: string
  readonly currency: string
  readonly expires_at: string
  readonly headline: Headline
  readonly findings: readonly Finding[]
  readonly teaser: ClientRow | null
  readonly report: PracticeRevenueReport | null
}

const muted = { color: 'var(--on-surface-var)', lineHeight: 1.6, fontSize: 14 } as const
const h2 = { fontSize: 20, margin: '28px 0 10px' } as const
const th = { textAlign: 'left', fontSize: 12, color: 'var(--on-surface-var)', padding: '6px 8px 6px 0', borderBottom: '1px solid var(--outline, #99a)' } as const
const td = { fontSize: 13, padding: '6px 8px 6px 0', borderBottom: '1px solid rgba(128,128,128,0.15)', verticalAlign: 'top' } as const
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function fill(draft: Draft, key: PseudonymKey | null, clientCode: string | null, invoiceCode: string | null, matterCode: string | null): string {
  return draft.body
    .replace(/\{\{client\}\}/g, clientCode ? relabel(clientCode, key) : '{{client}}')
    .replace(/\{\{invoice\}\}/g, invoiceCode ? relabel(invoiceCode, key) : '{{invoice}}')
    .replace(/\{\{matter\}\}/g, matterCode ? relabel(matterCode, key) : '{{matter}}')
}

export default function PracticeRevenueReportPage() {
  const params = useParams<{ ref: string }>()
  const ref = (params?.ref ?? '').toString().toUpperCase()
  const [data, setData] = useState<ReportResponse | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'expired' | 'error'>('loading')
  const [key, setKey] = useState<PseudonymKey | null>(null)
  const [showNames, setShowNames] = useState(true)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(`prr:${ref}`)
      if (raw) setKey(JSON.parse(raw) as PseudonymKey)
    } catch {
      // no key in this browser
    }
    fetch(`/api/practice-revenue/report/${encodeURIComponent(ref)}`)
      .then(async (r) => {
        if (r.status === 404 || r.status === 400) return setStatus('missing')
        if (r.status === 410) return setStatus('expired')
        if (!r.ok) return setStatus('error')
        setData((await r.json()) as ReportResponse)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [ref])

  const activeKey = showNames ? key : null
  const currency = data?.currency ?? 'USD'
  const money = (c: number | null) => (c === null ? 'not computable' : formatMoney(c, currency))
  const name = (code: string | null) => relabel(code, activeKey)
  const report = data?.report ?? null
  const clientOfInvoice = useMemo(() => {
    const m = new Map<string, string>()
    for (const o of report?.overdue ?? []) m.set(o.invoiceId, o.clientId)
    return m
  }, [report])

  async function checkout(gateway: 'card' | 'crypto') {
    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter the email the unlock link should go to.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/pay/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: 'practice_revenue_report', user_email: email.trim(), gateway, source: `practice_revenue:${ref}` }),
      })
      const d = (await res.json().catch(() => ({}))) as { checkout_url?: string; error?: string }
      if (!res.ok || !d.checkout_url) {
        setError(d.error ?? 'Checkout is temporarily unavailable. Please retry in a moment.')
        setBusy(false)
        return
      }
      window.location.href = d.checkout_url
    } catch {
      setError('Network issue. Please retry.')
      setBusy(false)
    }
  }

  function importKey(file: File | null) {
    if (!file) return
    file.text().then((t) => {
      const k = keyFromCsv(t)
      setKey(k)
      try {
        window.localStorage.setItem(`prr:${ref}`, JSON.stringify(k))
      } catch {
        // storage blocked; key still lives in memory for this view
      }
    })
  }

  if (status === 'loading') return <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>Loading…</div>
  if (status === 'missing') return <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>No report with that reference.</div>
  if (status === 'expired') return <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>This report expired and its data was deleted. <a href="/practice-revenue">Upload again</a> for fresh totals.</div>
  if (status === 'error' || !data) return <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>The report could not be loaded. Please retry in a minute.</div>

  const h = data.headline

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
      <div className="no-print" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--on-surface-var)' }}>
          {data.report_ref} · as of {data.as_of} · {data.paid ? 'full report' : 'free totals'}
        </span>
        {key ? (
          <button type="button" className="btn-ghost" style={{ fontSize: 13 }} onClick={() => setShowNames((v) => !v)}>
            {showNames ? 'Show codes' : 'Show names'}
          </button>
        ) : (
          <label style={{ fontSize: 13 }}>
            Import name key: <input type="file" accept=".csv,text/csv" onChange={(e) => importKey(e.target.files?.[0] ?? null)} />
          </label>
        )}
        {data.paid && <PrintButton label="Save as PDF" />}
      </div>

      <h1 style={{ fontSize: 'clamp(24px,4vw,34px)', marginBottom: 6 }}>Practice Revenue Report</h1>
      <p style={{ ...muted, marginBottom: 18 }}>Arithmetic on the export uploaded under this reference. Every figure states its formula; missing inputs read &ldquo;not computable&rdquo;, never zero.</p>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {[
          ['Open receivables', money(h.arOpenCents)],
          ['Past due 60+ days', money(h.overdue60Cents)],
          ['Unbilled work', h.unbilledCents === null ? 'not computable' : `${money(h.unbilledCents)} (${h.unbilledHours ?? 0} h)`],
          ['Aged unbilled (>30 d)', money(h.unbilledAgedCents)],
          ['Collection rate', h.collectionPct === null ? 'not computable' : `${h.collectionPct}%`],
          ['Realization rate', h.realizationPct === null ? 'not computable' : `${h.realizationPct}%`],
          ['Utilization', h.utilizationPct === null ? 'not computable' : `${h.utilizationPct}%`],
          ['Write-downs', money(h.writeDownCents)],
          ['Days sales outstanding', h.dsoDays === null ? 'not computable' : `${h.dsoDays} d`],
          ['Lock-up', h.lockupDays === null ? 'not computable' : `${h.lockupDays} d`],
          ['Dormant clients', h.dormantClientCount === null ? 'not computable' : String(h.dormantClientCount)],
          ['Overdue invoices', h.overdueInvoiceCount === null ? 'not computable' : String(h.overdueInvoiceCount)],
        ].map(([k, v]) => (
          <div key={k} style={{ border: '1px solid var(--outline, #99a)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--on-surface-var)' }}>{k}</div>
            <div style={{ fontSize: 19, fontWeight: 700 }}>{v}</div>
          </div>
        ))}
      </div>

      {h.aging && (
        <p style={{ ...muted, marginTop: 12 }}>
          Aging ({report?.agingBasis === 'issued_date' ? 'from issue date' : 'past due date'}): 0–30 {money(h.aging.b0_30)} · 31–60 {money(h.aging.b31_60)} · 61–90 {money(h.aging.b61_90)} · 90+ {money(h.aging.b90p)}
        </p>
      )}

      {data.findings.length > 0 && (
        <>
          <h2 style={h2}>Notes on this export</h2>
          <ul style={{ ...muted, paddingLeft: 20 }}>
            {data.findings.map((f, i) => (
              <li key={i}>{describeFinding(f)}</li>
            ))}
          </ul>
        </>
      )}

      {!data.paid && (
        <div className="no-print" style={{ border: '1px solid var(--outline, #99a)', borderRadius: 12, padding: 22, marginTop: 28 }}>
          <strong style={{ fontSize: 17 }}>Unlock the full report — $99</strong>
          <p style={{ ...muted, margin: '8px 0 12px' }}>
            Every overdue invoice with a reminder drafted, every unbilled entry with an invoice line, every client ranked by collected money per hour, closed-matter rows, timing counterfactuals, dormant clients, printable. Kept 180 days.
          </p>
          {data.teaser && (
            <p style={{ ...muted, marginBottom: 12 }}>
              Sample row — {name(data.teaser.clientId)}: {data.teaser.billableHours ?? '—'} billable hours, {money(data.teaser.collectedCents)} collected
              {data.teaser.collectedPerHourCents !== null ? `, ${money(data.teaser.collectedPerHourCents)} per hour` : ''}.
            </p>
          )}
          <input type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourfirm.com" style={{ width: '100%', maxWidth: 420, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--outline, #99a)', background: 'transparent', color: 'inherit', fontSize: 15, marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => checkout('card')} disabled={busy} className="cta-btn-solid" style={{ padding: '10px 16px', borderRadius: 8, fontWeight: 700 }}>
              {busy ? 'Opening checkout…' : 'Pay by card (PayPal)'}
            </button>
            <button type="button" onClick={() => checkout('crypto')} disabled={busy} className="cta-btn-outline" style={{ padding: '10px 16px', borderRadius: 8, fontWeight: 700 }}>
              Pay with crypto
            </button>
          </div>
          <p style={{ ...muted, fontSize: 12, marginTop: 10 }}>Already paid? Refresh this page once the unlock email arrives.</p>
          {error && (
            <p role="alert" style={{ color: '#d14343', fontSize: 14, marginTop: 10 }}>
              {error}
            </p>
          )}
        </div>
      )}

      {report && (
        <>
          <h2 style={h2}>Overdue invoices ({report.overdue?.length ?? 0})</h2>
          {report.overdue && report.overdue.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Invoice', 'Client', 'Issued', 'Due', 'Open', 'Days past', 'Bucket'].map((c) => <th key={c} style={th}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {report.overdue.map((o) => (
                    <tr key={o.invoiceId}>
                      <td style={td}>{name(o.invoiceId)}</td>
                      <td style={td}>{name(o.clientId)}</td>
                      <td style={td}>{o.issuedDate}</td>
                      <td style={td}>{o.dueDate ?? '—'}</td>
                      <td style={td}>{money(o.openCents)}</td>
                      <td style={td}>{o.daysPast}</td>
                      <td style={td}>{o.bucket.replace('b', '').replace('_', '–').replace('p', '+')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={muted}>None open past the aging basis.</p>
          )}

          {report.unbilled && (
            <>
              <h2 style={h2}>Unbilled work ({report.unbilled.length})</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Date', 'Client', 'Matter', 'Hours', 'Amount', 'Age (days)'].map((c) => <th key={c} style={th}>{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {report.unbilled.map((u) => (
                      <tr key={u.row}>
                        <td style={td}>{u.date}</td>
                        <td style={td}>{name(u.clientId)}</td>
                        <td style={td}>{name(u.matterId)}</td>
                        <td style={td}>{u.hours}</td>
                        <td style={td}>{money(u.amountCents)}</td>
                        <td style={td}>{u.ageDays}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <h2 style={h2}>Clients by collected money per billable hour</h2>
          <p style={muted}>&ldquo;Reprice&rdquo; is the arithmetic gap to your median: hours × median collected-per-hour − collected. It is a number to think about before quoting new work, not a recommendation about any existing relationship.</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['#', 'Client', 'Billable h', 'Invoiced', 'Collected', 'Open', 'Per hour', 'Reprice gap', 'Last activity'].map((c) => <th key={c} style={th}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {report.clients.map((c) => (
                  <tr key={c.clientId}>
                    <td style={td}>{c.rank ?? '—'}</td>
                    <td style={td}>{name(c.clientId)}</td>
                    <td style={td}>{c.billableHours ?? '—'}</td>
                    <td style={td}>{money(c.invoicedCents)}</td>
                    <td style={td}>{money(c.collectedCents)}</td>
                    <td style={td}>{money(c.openCents)}</td>
                    <td style={td}>{money(c.collectedPerHourCents)}</td>
                    <td style={td}>{money(c.repriceDeltaCents)}</td>
                    <td style={td}>{c.lastActivity ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {report.matters && (
            <>
              <h2 style={h2}>Matters ({report.matters.filter((m) => m.closed).length} closed)</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Client', 'Matter', 'Billable h', 'Worked', 'Invoiced', 'Collected', 'Unbilled h', 'Last entry', 'Status'].map((c) => <th key={c} style={th}>{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {report.matters.map((m) => (
                      <tr key={`${m.clientId}|${m.matterId}`}>
                        <td style={td}>{name(m.clientId)}</td>
                        <td style={td}>{name(m.matterId)}</td>
                        <td style={td}>{m.billableHours}</td>
                        <td style={td}>{money(m.workedCents)}</td>
                        <td style={td}>{money(m.invoicedCents)}</td>
                        <td style={td}>{money(m.collectedCents)}</td>
                        <td style={td}>{m.unbilledHours}</td>
                        <td style={td}>{m.lastEntry}</td>
                        <td style={td}>{m.closed ? 'closed (quiet)' : 'open'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {report.timeMachine && (
            <>
              <h2 style={h2}>Timing counterfactuals</h2>
              <ul style={{ ...muted, paddingLeft: 20 }}>
                <li>
                  Invoicing lag, amount-weighted: {report.timeMachine.invoiceLagDaysWeighted ?? 'not computable'} days across {report.timeMachine.linkedInvoiceCount} linked invoices. At a {report.options.invoiceLagTargetDays}-day lag the excess would have been {formatMoney(report.timeMachine.excessLagDollarDays * 100, currency)}-days earlier.
                </li>
                <li>
                  Days to payment, amount-weighted: {report.timeMachine.daysToPayWeighted ?? 'not computable'}. Collected at day {report.options.collectTargetDays}, cash would have arrived {formatMoney(report.timeMachine.excessCollectDollarDays * 100, currency)}-days earlier; {money(report.timeMachine.openPastTargetCents)} is open past that day now.
                </li>
              </ul>
            </>
          )}

          <h2 style={h2}>Dormant clients ({report.dormant.length})</h2>
          {report.dormant.length > 0 ? (
            <ul style={{ ...muted, paddingLeft: 20 }}>
              {report.dormant.map((d) => (
                <li key={d.clientId}>
                  {name(d.clientId)} — last activity {d.lastActivity} ({d.daysSince} days), lifetime collected {money(d.lifetimeCollectedCents)}
                </li>
              ))}
            </ul>
          ) : (
            <p style={muted}>None beyond {report.options.dormantDays} days.</p>
          )}

          <h2 style={h2}>Drafts (you edit and send; nothing is sent for you)</h2>
          {report.drafts.reminders.map((d) => (
            <pre key={d.ref} style={{ whiteSpace: 'pre-wrap', fontSize: 13, border: '1px solid var(--outline, #99a)', borderRadius: 8, padding: 12, margin: '8px 0' }}>
              {`Subject: ${d.subject.replace(/\{\{invoice\}\}/g, name(d.ref))}\n\n${fill(d, activeKey, clientOfInvoice.get(d.ref) ?? null, d.ref, null)}`}
            </pre>
          ))}
          {report.drafts.invoiceLines.length > 0 && (
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, border: '1px solid var(--outline, #99a)', borderRadius: 8, padding: 12, margin: '8px 0' }}>
              {report.drafts.invoiceLines
                .map((d) => {
                  const u = report.unbilled?.find((x) => `row-${x.row}` === d.ref)
                  return fill(d, activeKey, u?.clientId ?? null, null, u?.matterId ?? null)
                })
                .join('\n')}
            </pre>
          )}
        </>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--outline, #99a)', margin: '36px 0 16px' }} />
      <p style={{ ...muted, fontSize: 12 }}>
        Arithmetic on the export uploaded under this reference; not a financial statement; not legal, tax or accounting advice; decisions about existing client relationships are outside its scope. Drafts are templates you edit and send yourself. {report?.benchmark ? `Benchmarks: ${report.benchmark.source.title}.` : 'Benchmark comparison pending source verification.'} BizLegal AI (DOR INNOVATIONS) is a software company, not a law firm.
      </p>
    </div>
  )
}
