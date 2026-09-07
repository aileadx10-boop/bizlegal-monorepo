'use client'

import { useState } from 'react'
import { locateIdentifierColumns, splitCsv, toCsv } from '@/lib/practice-revenue/csv'
import { formatMoney } from '@/lib/practice-revenue/drafts'
import { createPseudonymState, keyToCsv, mergedSpellings, pseudonymiseGrid, relabel, reverseKey } from '@/lib/practice-revenue/pseudonymise'
import type { PseudonymKey } from '@/lib/practice-revenue/pseudonymise'
import type { ClientRow, Finding, Headline } from '@/lib/practice-revenue/types'

/**
 * Upload panel. Everything that touches a client's name happens in this
 * component, in the browser: the two CSVs are parsed, identifiers are
 * replaced with codes, description columns are dropped, and only the coded
 * grid is sent to /api/practice-revenue/analyze. The reverse key is written
 * to localStorage under prr:<ref> and offered as a download.
 */

interface FilePreview {
  readonly label: string
  readonly rows: number
  readonly mapped: Readonly<Record<string, string>>
  readonly unmapped: readonly string[]
  readonly droppedHeaders: readonly string[]
}

interface Prepared {
  readonly invoicesCsv: string
  readonly timeCsv: string | null
  readonly key: PseudonymKey
  readonly previews: readonly FilePreview[]
  readonly merged: ReadonlyArray<{ key: string; spellings: readonly string[] }>
  readonly counts: { clients: number; invoices: number; matters: number }
}

interface AnalyzeResult {
  readonly report_ref: string
  readonly expires_at: string
  readonly currency: string
  readonly headline: Headline
  readonly findings: readonly Finding[]
  readonly teaser: ClientRow | null
}

type DateFormatChoice = 'auto' | 'dmy' | 'mdy'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const inputStyle = { width: '100%', maxWidth: 420, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--outline, #99a)', background: 'transparent', color: 'inherit', fontSize: 15 } as const
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, marginTop: 16 } as const
const muted = { color: 'var(--on-surface-var)', lineHeight: 1.6, fontSize: 14 } as const

export function describeFinding(f: Finding): string {
  switch (f.kind) {
    case 'missing_column':
      return `The ${f.file} file has no ${f.field} column, so ${f.affects.join(', ')} could not be computed.`
    case 'ambiguous_column':
      return `Two columns in the ${f.file} file could be "${f.field}" (${f.candidates.join(', ')}); neither was used.`
    case 'ambiguous_date_format':
      return `Dates like "${f.sample}" in the ${f.file} file could be day-first or month-first. Choose the format your tool uses and run again.`
    case 'rows_skipped':
      return `${f.count} ${f.file} row(s) were skipped: ${Object.entries(f.reasons)
        .map(([r, n]) => `${n} ${r.replace(/_/g, ' ')}`)
        .join(', ')}.`
    case 'insufficient_evidence':
      return `${f.section}: not computable — ${f.reason}.`
    case 'assumption':
      return f.text
  }
}

function money(cents: number | null, currency: string): string {
  return cents === null ? 'not computable' : formatMoney(cents, currency)
}

function pctText(v: number | null): string {
  return v === null ? 'not computable' : `${v}%`
}

async function prepare(invoicesFile: File, timeFile: File | null): Promise<Prepared> {
  const state = createPseudonymState()
  const previews: FilePreview[] = []

  const invGrid = splitCsv(await invoicesFile.text())
  if (invGrid.length < 2) throw new Error('The invoice file has no data rows.')
  const invCols = locateIdentifierColumns(invGrid[0], 'invoices')
  const invOut = pseudonymiseGrid(invGrid, { client: invCols.client, invoice: invCols.invoice, drop: invCols.drop }, state)
  previews.push({
    label: 'Invoices',
    rows: invGrid.length - 1,
    mapped: invCols.mapped,
    unmapped: invCols.unmapped,
    droppedHeaders: invCols.drop.map((c) => invGrid[0][c]),
  })

  let timeCsv: string | null = null
  if (timeFile) {
    const timeGrid = splitCsv(await timeFile.text())
    if (timeGrid.length < 2) throw new Error('The time-entry file has no data rows.')
    const timeCols = locateIdentifierColumns(timeGrid[0], 'time')
    const timeOut = pseudonymiseGrid(timeGrid, { client: timeCols.client, matter: timeCols.matter, invoice: timeCols.invoice, drop: timeCols.drop }, state)
    timeCsv = toCsv(timeOut)
    previews.push({
      label: 'Time entries',
      rows: timeGrid.length - 1,
      mapped: timeCols.mapped,
      unmapped: timeCols.unmapped,
      droppedHeaders: timeCols.drop.map((c) => timeGrid[0][c]),
    })
  }

  return {
    invoicesCsv: toCsv(invOut),
    timeCsv,
    key: reverseKey(state),
    previews,
    merged: mergedSpellings(state),
    counts: { clients: state.clients.size, invoices: state.invoices.size, matters: state.matters.size },
  }
}

function download(name: string, text: string): void {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function UploadPanel() {
  const [email, setEmail] = useState('')
  const [invoicesFile, setInvoicesFile] = useState<File | null>(null)
  const [timeFile, setTimeFile] = useState<File | null>(null)
  const [currency, setCurrency] = useState('USD')
  const [dateFormat, setDateFormat] = useState<DateFormatChoice>('auto')
  const [prepared, setPrepared] = useState<Prepared | null>(null)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [busy, setBusy] = useState<'preview' | 'analyze' | 'checkout' | null>(null)
  const [error, setError] = useState('')
  const [serverFindings, setServerFindings] = useState<readonly Finding[]>([])

  async function onPreview() {
    setError('')
    setResult(null)
    if (!invoicesFile) {
      setError('Choose the invoice export first.')
      return
    }
    setBusy('preview')
    try {
      setPrepared(await prepare(invoicesFile, timeFile))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read the file.')
    } finally {
      setBusy(null)
    }
  }

  async function onAnalyze() {
    if (!prepared) return
    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter the email address the totals should go to.')
      return
    }
    setBusy('analyze')
    setError('')
    setServerFindings([])
    try {
      const res = await fetch('/api/practice-revenue/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          invoicesCsv: prepared.invoicesCsv,
          timeCsv: prepared.timeCsv ?? undefined,
          currency,
          dateFormat: dateFormat === 'auto' ? undefined : dateFormat,
          asOf: new Date().toISOString().slice(0, 10),
        }),
      })
      const data = (await res.json().catch(() => ({}))) as Partial<AnalyzeResult> & { error?: string; message?: string; findings?: Finding[] }
      if (!res.ok || !data.report_ref) {
        setServerFindings(data.findings ?? [])
        setError(data.message ?? data.error ?? 'Upload failed. Please retry.')
        return
      }
      try {
        window.localStorage.setItem(`prr:${data.report_ref}`, JSON.stringify(prepared.key))
      } catch {
        // private window or storage blocked — the downloadable key still works
      }
      setResult(data as AnalyzeResult)
    } catch {
      setError('Network issue. Please retry.')
    } finally {
      setBusy(null)
    }
  }

  async function checkout(gateway: 'card' | 'crypto') {
    if (!result) return
    setBusy('checkout')
    setError('')
    try {
      const res = await fetch('/api/pay/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: 'practice_revenue_report', user_email: email.trim(), gateway, source: `practice_revenue:${result.report_ref}` }),
      })
      const data = (await res.json().catch(() => ({}))) as { checkout_url?: string; error?: string }
      if (!res.ok || !data.checkout_url) {
        setError(data.error ?? 'Checkout is temporarily unavailable. Please retry in a moment.')
        setBusy(null)
        return
      }
      window.location.href = data.checkout_url
    } catch {
      setError('Network issue. Please retry.')
      setBusy(null)
    }
  }

  const needsDateFormat = serverFindings.some((f) => f.kind === 'ambiguous_date_format')

  return (
    <div id="upload" style={{ border: '1px solid var(--outline, #99a)', borderRadius: 12, padding: 24, margin: '32px 0' }}>
      <label htmlFor="prr-invoices" style={{ ...labelStyle, marginTop: 0 }}>
        Invoice export (CSV) — required
      </label>
      <input id="prr-invoices" type="file" accept=".csv,text/csv" onChange={(e) => setInvoicesFile(e.target.files?.[0] ?? null)} />

      <label htmlFor="prr-time" style={labelStyle}>
        Time-entry export (CSV) — optional, unlocks unbilled work and realization
      </label>
      <input id="prr-time" type="file" accept=".csv,text/csv" onChange={(e) => setTimeFile(e.target.files?.[0] ?? null)} />

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <label htmlFor="prr-currency" style={labelStyle}>
            Currency of the export
          </label>
          <select id="prr-currency" value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ ...inputStyle, maxWidth: 140 }}>
            {['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'ILS'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {(needsDateFormat || dateFormat !== 'auto') && (
          <div>
            <label htmlFor="prr-dateformat" style={labelStyle}>
              Date format in your files
            </label>
            <select id="prr-dateformat" value={dateFormat} onChange={(e) => setDateFormat(e.target.value as DateFormatChoice)} style={{ ...inputStyle, maxWidth: 220 }}>
              <option value="auto">Detect automatically</option>
              <option value="mdy">Month/Day/Year (US)</option>
              <option value="dmy">Day/Month/Year</option>
            </select>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <button type="button" onClick={onPreview} disabled={busy !== null} className="cta-btn-outline" style={{ padding: '10px 16px', borderRadius: 8, fontWeight: 700 }}>
          {busy === 'preview' ? 'Reading…' : '1. Preview what will be uploaded'}
        </button>
      </div>

      {prepared && (
        <div style={{ marginTop: 20 }}>
          <p style={muted}>
            Codes assigned in your browser: {prepared.counts.clients} clients, {prepared.counts.invoices} invoices
            {prepared.counts.matters > 0 ? `, ${prepared.counts.matters} matters` : ''}. Only the coded columns below are sent.
          </p>
          {prepared.previews.map((p) => (
            <div key={p.label} style={{ marginTop: 10 }}>
              <strong>{p.label}</strong> — {p.rows} rows
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', marginTop: 6 }}>
                <tbody>
                  {Object.entries(p.mapped).map(([field, header]) => (
                    <tr key={field}>
                      <td style={{ padding: '3px 8px 3px 0', color: 'var(--on-surface-var)' }}>{field}</td>
                      <td style={{ padding: '3px 0' }}>{header}</td>
                    </tr>
                  ))}
                  {p.unmapped.length > 0 && (
                    <tr>
                      <td style={{ padding: '3px 8px 3px 0', color: 'var(--on-surface-var)' }}>not found</td>
                      <td style={{ padding: '3px 0' }}>{p.unmapped.join(', ')}</td>
                    </tr>
                  )}
                  {p.droppedHeaders.length > 0 && (
                    <tr>
                      <td style={{ padding: '3px 8px 3px 0', color: 'var(--on-surface-var)' }}>not uploaded</td>
                      <td style={{ padding: '3px 0' }}>{p.droppedHeaders.join(', ')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
          {prepared.merged.length > 0 && (
            <p style={{ ...muted, marginTop: 10 }}>
              Spellings merged into one code: {prepared.merged.map((m) => m.spellings.join(' = ')).join('; ')}.
            </p>
          )}

          <label htmlFor="prr-email" style={labelStyle}>
            Email for the totals
          </label>
          <input id="prr-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourfirm.com" style={inputStyle} />

          <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={onAnalyze} disabled={busy !== null} className="cta-btn-solid" style={{ padding: '10px 16px', borderRadius: 8, fontWeight: 700 }}>
              {busy === 'analyze' ? 'Computing…' : '2. Send the coded files and get the totals'}
            </button>
            <button type="button" onClick={() => download('practice-revenue-name-key.csv', keyToCsv(prepared.key))} className="btn-ghost" style={{ padding: '10px 16px', borderRadius: 8 }}>
              Download the name key
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" style={{ color: '#d14343', fontSize: 14, marginTop: 14 }}>
          {error}
        </p>
      )}
      {serverFindings.length > 0 && (
        <ul style={{ ...muted, paddingLeft: 20, marginTop: 8 }}>
          {serverFindings.map((f, i) => (
            <li key={i}>{describeFinding(f)}</li>
          ))}
        </ul>
      )}

      {result && prepared && (
        <div style={{ marginTop: 24, borderTop: '1px solid var(--outline, #99a)', paddingTop: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--on-surface-var)' }}>
            Reference <strong>{result.report_ref}</strong> · totals sent to {email.trim()} (check spam if absent) · kept 14 days
          </p>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {[
              ['Open receivables', money(result.headline.arOpenCents, result.currency)],
              ['Past due 60+ days', money(result.headline.overdue60Cents, result.currency)],
              ['Unbilled work', money(result.headline.unbilledCents, result.currency)],
              ['Collection rate', pctText(result.headline.collectionPct)],
              ['Realization rate', pctText(result.headline.realizationPct)],
              ['Days sales outstanding', result.headline.dsoDays === null ? 'not computable' : `${result.headline.dsoDays} days`],
              ['Dormant clients', result.headline.dormantClientCount === null ? 'not computable' : String(result.headline.dormantClientCount)],
              ['Overdue invoices', result.headline.overdueInvoiceCount === null ? 'not computable' : String(result.headline.overdueInvoiceCount)],
            ].map(([k, v]) => (
              <div key={k} style={{ border: '1px solid var(--outline, #99a)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--on-surface-var)' }}>{k}</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>
          {result.teaser && (
            <p style={{ ...muted, marginTop: 14 }}>
              Sample client row — {relabel(result.teaser.clientId, prepared.key)}: {result.teaser.billableHours ?? '—'} billable hours,{' '}
              {money(result.teaser.collectedCents, result.currency)} collected
              {result.teaser.collectedPerHourCents !== null ? `, ${formatMoney(result.teaser.collectedPerHourCents, result.currency)} per hour` : ''}. The full report ranks every client.
            </p>
          )}
          {result.findings.length > 0 && (
            <ul style={{ ...muted, paddingLeft: 20, marginTop: 8 }}>
              {result.findings.map((f, i) => (
                <li key={i}>{describeFinding(f)}</li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" onClick={() => checkout('card')} disabled={busy !== null} className="cta-btn-solid" style={{ padding: '10px 16px', borderRadius: 8, fontWeight: 700 }}>
              {busy === 'checkout' ? 'Opening checkout…' : 'Unlock the full report — $99 by card (PayPal)'}
            </button>
            <a href={`/practice-revenue/report/${encodeURIComponent(result.report_ref)}`} style={{ fontSize: 14, color: 'var(--primary, #1a56db)' }}>
              Open the report page
            </a>
            <button type="button" onClick={() => checkout('crypto')} disabled={busy !== null} className="btn-ghost" style={{ fontSize: 12, padding: '4px 6px' }}>
              or pay in crypto
            </button>
          </div>
          <p style={{ ...muted, fontSize: 12, marginTop: 12 }}>
            Payment is processed by DOR INNOVATIONS (BizLegal AI), a software company, not a law firm. The report is arithmetic on your export; not a financial statement; not legal, tax or accounting advice.
          </p>
        </div>
      )}
    </div>
  )
}
