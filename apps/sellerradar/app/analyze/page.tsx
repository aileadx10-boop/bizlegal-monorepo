'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { TurnstileWidget } from '@bizlegal/turnstile-widget'

/* ─── Design tokens (fleet dark-professional look, matches TRACR) ───────── */
const C = {
  bg: '#07090e',
  surface: '#0d1118',
  card: '#111622',
  border: '#1a2035',
  text: '#e8ecf4',
  muted: '#5a6278',
  dim: '#2e3450',
  red: '#c0392b',
  redBg: 'rgba(192,57,43,0.09)',
  redBorder: 'rgba(192,57,43,0.30)',
  amber: '#d4a843',
  amberBg: 'rgba(212,168,67,0.08)',
  amberBorder: 'rgba(212,168,67,0.28)',
  green: '#27ae60',
  greenBg: 'rgba(39,174,96,0.08)',
  mono: '"DM Mono", "Fira Code", ui-monospace, monospace',
  serif: '"Playfair Display", Georgia, serif',
  sans: '"DM Sans", system-ui, -apple-system, sans-serif',
}

interface AnalyzeTotals {
  skuCount: number
  affectedCount: number
  monthlyImpact: number
  annualImpact: number
  avgMarginDeltaPct: number
}

interface AnalyzeResult {
  reportRef: string
  tier: string
  totals: AnalyzeTotals
  warnings: string[]
}

type Phase = 'form' | 'analyzing' | 'results'

function money(n: number): string {
  const sign = n < 0 ? '-' : ''
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`
}

function AnalyzeInner() {
  const searchParams = useSearchParams()
  const prepaidOrder = searchParams.get('order') ?? ''

  const [email, setEmail] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('form')
  const [error, setError] = useState('')
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [payBusy, setPayBusy] = useState<'card' | 'crypto' | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!file) {
      setError('Choose a CSV file first.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('File too large — the MVP accepts CSVs up to 2 MB.')
      return
    }
    setPhase('analyzing')
    try {
      const csv = await file.text()
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          csv,
          ...(prepaidOrder ? { orderId: prepaidOrder } : {}),
          ...(token ? { turnstile_token: token } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const details = Array.isArray(data.errors) ? ` ${data.errors.join(' ')}` : ''
        setError((data.error || 'Analysis failed. Please try again.') + details)
        setPhase('form')
        return
      }
      setResult(data as AnalyzeResult)
      setPhase('results')
    } catch {
      setError('Network error. Please try again.')
      setPhase('form')
    }
  }

  async function payCard() {
    if (!result) return
    setPayBusy('card')
    setError('')
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tier: 'audit', reportRef: result.reportRef }),
      })
      const data = await res.json()
      if (data.approvalUrl) window.location.href = data.approvalUrl
      else {
        setError(data.error || 'Could not start card checkout.')
        setPayBusy(null)
      }
    } catch {
      setError('Network error starting checkout.')
      setPayBusy(null)
    }
  }

  async function payCrypto() {
    if (!result) return
    setPayBusy('crypto')
    setError('')
    try {
      const res = await fetch('/api/payments/nowpayments/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tier: 'audit', reportRef: result.reportRef }),
      })
      const data = await res.json()
      if (data.invoice_url) window.location.href = data.invoice_url
      else {
        setError(data.error || 'Could not start crypto checkout.')
        setPayBusy(null)
      }
    } catch {
      setError('Network error starting checkout.')
      setPayBusy(null)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    color: C.text,
    fontSize: 14,
    fontFamily: C.sans,
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: C.mono,
    fontSize: 11,
    color: C.muted,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    marginBottom: 6,
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: C.sans }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px 96px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
            {prepaidOrder ? 'Paid audit — catalog intake' : 'Free impact check'}
          </div>
          <h1 style={{ fontFamily: C.serif, fontSize: 34, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.15 }}>
            What did the fee change cost you?
          </h1>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, margin: 0 }}>
            Upload a seller CSV export — SKU, category, dimensions, weight,
            COGS, price, est. monthly units. We diff the latest Amazon fee
            schedule against your catalog and answer in dollars per SKU per
            year.
          </p>
        </div>

        {phase === 'form' && (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '28px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 }}>
            <div>
              <label htmlFor="csv" style={labelStyle}>Catalog CSV *</label>
              <input
                id="csv"
                type="file"
                accept=".csv,text/csv,text/plain"
                required
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                style={{ ...inputStyle, padding: '11px 16px' }}
              />
              <p style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, margin: '6px 0 0', lineHeight: 1.6 }}>
                Headers are matched flexibly: sku, asin, category, price, cogs, weight, length/width/height or dimensions (LxWxH), monthly units. Max 2 MB / 5,000 SKUs.
              </p>
            </div>
            <div>
              <label htmlFor="email" style={labelStyle}>Email for the report *</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourstore.com" style={inputStyle} />
            </div>
            <TurnstileWidget onToken={setToken} />
            {error && <p style={{ color: C.red, fontSize: 13, fontFamily: C.mono, margin: 0, whiteSpace: 'pre-wrap' }}>{error}</p>}
            <button type="submit" style={{ padding: '14px', background: C.amber, color: C.bg, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: C.sans }}>
              {prepaidOrder ? 'Run my paid audit →' : 'Run free impact check →'}
            </button>
            <p style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, margin: 0, lineHeight: 1.6 }}>
              Estimates only — verify against your settlement reports. Not financial or tax advice.
            </p>
          </form>
        )}

        {phase === 'analyzing' && (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: `1.5px solid ${C.amber}`, borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite', margin: '0 auto 20px' }} />
            <div style={{ fontFamily: C.mono, fontSize: 12, color: C.muted, letterSpacing: '0.12em' }}>
              Parsing catalog &amp; diffing fee schedules…
            </div>
          </div>
        )}

        {phase === 'results' && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Impact card */}
            <div style={{ padding: '28px', background: result.totals.monthlyImpact > 0 ? C.redBg : C.greenBg, border: `1px solid ${result.totals.monthlyImpact > 0 ? C.redBorder : 'rgba(39,174,96,0.25)'}`, borderRadius: 16 }}>
              <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
                Estimated impact of the latest fee change
              </div>
              <div style={{ fontFamily: C.mono, fontSize: 40, fontWeight: 500, color: result.totals.monthlyImpact > 0 ? C.red : C.green, lineHeight: 1 }}>
                {money(result.totals.annualImpact)}<span style={{ fontSize: 16, color: C.muted }}>/year</span>
              </div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 10, lineHeight: 1.6 }}>
                {result.totals.monthlyImpact > 0
                  ? `This change reduces your margin on ${result.totals.affectedCount} of ${result.totals.skuCount} SKUs — ${money(result.totals.monthlyImpact)}/month, average ${Math.abs(result.totals.avgMarginDeltaPct).toFixed(1)} margin points.`
                  : `No SKUs are negatively affected by the latest fee change across ${result.totals.skuCount} parsed SKUs.`}
              </div>
            </div>

            {result.warnings.length > 0 && (
              <div style={{ padding: '16px 20px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Parse notes ({result.warnings.length})
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: C.muted, fontFamily: C.mono, lineHeight: 1.8 }}>
                  {result.warnings.slice(0, 8).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                  {result.warnings.length > 8 && <li>…and {result.warnings.length - 8} more</li>}
                </ul>
              </div>
            )}

            {result.tier !== 'free' ? (
              <div style={{ padding: '36px 32px', background: C.greenBg, border: '1px solid rgba(39,174,96,0.25)', borderRadius: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                <h2 style={{ fontFamily: C.serif, fontSize: 24, margin: '0 0 10px' }}>Your full audit is ready</h2>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: '0 0 20px' }}>
                  Per-SKU impact breakdown, before/after margins, and fee-type attribution are unlocked.
                </p>
                <a href={`/report/${result.reportRef}`} style={{ display: 'inline-block', padding: '13px 30px', background: C.amber, color: C.bg, borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
                  View the full report →
                </a>
              </div>
            ) : (
              /* Paywall */
              <div style={{ padding: '32px', background: C.surface, border: `1px solid ${C.amberBorder}`, borderRadius: 16, textAlign: 'center' }}>
                <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>SellerRadar Audit — $49 one-time</div>
                <h2 style={{ fontFamily: C.serif, fontSize: 24, margin: '0 0 10px' }}>Unlock the per-SKU breakdown</h2>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: '0 0 22px' }}>
                  Which SKUs lose the most, why (referral vs FBA fulfillment vs
                  storage), and the before/after margin on each — with fee
                  schedule citations you can verify.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={payCard} disabled={payBusy !== null} style={{ padding: '13px 30px', background: C.amber, color: C.bg, border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: payBusy ? 'wait' : 'pointer', fontFamily: C.sans }}>
                    {payBusy === 'card' ? 'Starting checkout…' : 'Pay $49 by card →'}
                  </button>
                  <button onClick={payCrypto} disabled={payBusy !== null} style={{ padding: '13px 30px', background: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: 8, color: C.red, fontSize: 14, fontWeight: 700, cursor: payBusy ? 'wait' : 'pointer', fontFamily: C.sans }}>
                    {payBusy === 'crypto' ? 'Creating invoice…' : 'Pay with crypto →'}
                  </button>
                </div>
                {error && <p style={{ color: C.red, fontSize: 12, fontFamily: C.mono, marginTop: 12 }}>{error}</p>}
                <p style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, marginTop: 16 }}>
                  Card via PayPal · Crypto via NOWPayments · Monitor tier ($99/mo) on the <a href="/pricing" style={{ color: C.amber }}>pricing page</a>
                </p>
                <p style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, marginTop: 8 }}>
                  <a href={`/report/${result.reportRef}`} style={{ color: C.muted }}>View report summary →</a> (ref {result.reportRef})
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07090e' }} />}>
      <AnalyzeInner />
    </Suspense>
  )
}
