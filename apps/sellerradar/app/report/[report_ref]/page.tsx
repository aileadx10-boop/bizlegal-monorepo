'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

/* ─── Design tokens (fleet dark-professional look, matches TRACR) ───────── */
const C = {
  bg: '#07090e', surface: '#0d1118', card: '#111622', border: '#1a2035',
  text: '#e8ecf4', muted: '#5a6278', dim: '#2e3450',
  red: '#c0392b', redBg: 'rgba(192,57,43,0.09)', redBorder: 'rgba(192,57,43,0.30)',
  amber: '#d4a843', amberBg: 'rgba(212,168,67,0.08)', amberBorder: 'rgba(212,168,67,0.28)',
  green: '#27ae60', greenBg: 'rgba(39,174,96,0.08)', orange: '#e67e22',
  mono: '"DM Mono","Fira Code",ui-monospace,monospace',
  serif: '"Playfair Display",Georgia,serif',
  sans: '"DM Sans",system-ui,-apple-system,sans-serif',
}

interface FeeBreakdownShape {
  referral: number
  fulfillment: number
  storage: number
  total: number
  sizeTier: string
}

interface SkuRow {
  sku: string
  asin: string | null
  category: string
  price: number
  cogs: number
  monthly_units: number
  size_tier: string
  fees_old: FeeBreakdownShape
  fees_new: FeeBreakdownShape
  fee_delta_per_unit: number
  monthly_impact: number
  annual_impact: number
  margin_old_pct: number
  margin_new_pct: number
}

interface ReportMeta {
  report_ref: string
  tier: string
  status: string
  sku_count: number
  affected_count: number
  monthly_impact: number
  annual_impact: number
  avg_margin_delta_pct: number
  changed_fee_types: string[]
  schedule_from: string
  schedule_to: string
  warnings: string[]
  created_at: string
  completed_at: string | null
}

function money(n: number, decimals = 0): string {
  const sign = n < 0 ? '-' : ''
  return `${sign}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

const FEE_TYPE_LABELS: Record<string, string> = {
  referral: 'Referral fee %',
  fba_fulfillment: 'FBA fulfillment',
  storage: 'Monthly storage',
}

export default function ReportPage() {
  const { report_ref } = useParams<{ report_ref: string }>()
  const [report, setReport] = useState<ReportMeta | null>(null)
  const [skus, setSkus] = useState<SkuRow[] | null>(null)
  const [paid, setPaid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [payBusy, setPayBusy] = useState<'card' | 'crypto' | null>(null)
  const [payErr, setPayErr] = useState('')

  useEffect(() => {
    fetch(`/api/report/${report_ref}`)
      .then(async (r) => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return }
        const d = await r.json()
        setReport(d.report ?? null)
        setSkus(d.skus ?? null)
        setPaid(Boolean(d.paid))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [report_ref])

  async function payCard() {
    if (!report) return
    setPayBusy('card')
    setPayErr('')
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'audit', reportRef: report.report_ref }),
      })
      const data = await res.json()
      if (data.approvalUrl) window.location.href = data.approvalUrl
      else { setPayErr(data.error || 'Could not start card checkout.'); setPayBusy(null) }
    } catch { setPayErr('Network error starting checkout.'); setPayBusy(null) }
  }

  async function payCrypto() {
    if (!report) return
    setPayBusy('crypto')
    setPayErr('')
    try {
      const res = await fetch('/api/payments/nowpayments/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'audit', reportRef: report.report_ref }),
      })
      const data = await res.json()
      if (data.invoice_url) window.location.href = data.invoice_url
      else { setPayErr(data.error || 'Could not start crypto checkout.'); setPayBusy(null) }
    } catch { setPayErr('Network error starting checkout.'); setPayBusy(null) }
  }

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: `1.5px solid ${C.amber}`, borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite' }} />
      <div style={{ fontFamily: C.mono, fontSize: 12, color: C.muted, letterSpacing: '0.12em' }}>Loading impact report…</div>
    </div>
  )

  /* ── Not found ── */
  if (notFound || !report) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div style={{ fontSize: 28, color: C.red }}>⚠</div>
      <div style={{ fontFamily: C.mono, fontSize: 14, color: C.muted }}>Report not found.</div>
      <a href="/analyze" style={{ fontFamily: C.mono, fontSize: 12, color: C.amber, textDecoration: 'none', marginTop: 8 }}>← Run a new analysis</a>
    </div>
  )

  const loss = report.annual_impact > 0

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: C.sans }}>
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
        <a href="/" style={{ textDecoration: 'none', fontFamily: C.mono, fontSize: 20, fontWeight: 500, letterSpacing: '0.14em', color: C.text }}>
          Seller<span style={{ color: C.amber }}>Radar</span>
        </a>
        <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.1em' }}>{report.report_ref}</div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '52px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32, paddingBottom: 28, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
            SellerRadar {report.tier === 'monitor' ? 'Monitor' : report.tier === 'audit' ? 'Audit' : 'Free Check'} Impact Report
          </div>
          <h1 style={{ fontFamily: C.serif, fontSize: 30, fontWeight: 700, color: C.text, marginBottom: 10, lineHeight: 1.2 }}>
            Fee schedule {report.schedule_from} → {report.schedule_to}
          </h1>
          <div style={{ fontFamily: C.mono, fontSize: 12, color: C.muted }}>
            {report.changed_fee_types.length > 0
              ? `Changed: ${report.changed_fee_types.map((t) => FEE_TYPE_LABELS[t] ?? t).join(' · ')}`
              : 'No fee-type changes detected between schedules'}
            {report.completed_at && ` · analyzed ${new Date(report.completed_at).toUTCString()}`}
          </div>
        </div>

        {/* Impact summary */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', marginBottom: 28, padding: '24px 28px', borderRadius: 12, background: loss ? C.redBg : C.greenBg, border: `1px solid ${loss ? C.redBorder : 'rgba(39,174,96,0.25)'}` }}>
          <div style={{ textAlign: 'center', minWidth: 140 }}>
            <div style={{ fontFamily: C.mono, fontSize: 40, fontWeight: 500, color: loss ? C.red : C.green, lineHeight: 1 }}>{money(report.annual_impact)}</div>
            <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, letterSpacing: '0.12em', marginTop: 4 }}>EST. IMPACT / YEAR</div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: loss ? C.red : C.green, marginBottom: 4, fontFamily: C.serif }}>
              {loss
                ? `Margin hit on ${report.affected_count} of ${report.sku_count} SKUs`
                : `No negative impact across ${report.sku_count} SKUs`}
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>
              {money(report.monthly_impact)}/month · avg {Math.abs(report.avg_margin_delta_pct).toFixed(1)} margin points
              {' · '}
              <span style={{ color: paid ? C.green : C.orange }}>{paid ? 'Payment confirmed' : 'Per-SKU detail locked'}</span>
            </div>
          </div>
        </div>

        {/* Per-SKU table — paid only */}
        {paid && skus && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Per-SKU impact — {skus.length} rows, worst first
            </div>
            <div style={{ overflowX: 'auto', border: `1px solid ${C.border}`, borderRadius: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: C.mono }}>
                <thead>
                  <tr style={{ background: C.surface, color: C.muted, textAlign: 'left' }}>
                    {['SKU', 'Category', 'Tier', 'Fees old', 'Fees new', 'Δ/unit', 'Units/mo', 'Impact/yr', 'Margin old→new'].map((h) => (
                      <th key={h} style={{ padding: '10px 12px', fontWeight: 500, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {skus.map((s) => (
                    <tr key={s.sku} style={{ borderTop: `1px solid ${C.border}`, color: s.annual_impact > 0 ? C.text : C.muted }}>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {s.sku}
                        {s.asin && <span style={{ color: C.dim }}> · {s.asin}</span>}
                      </td>
                      <td style={{ padding: '10px 12px' }}>{s.category}</td>
                      <td style={{ padding: '10px 12px' }}>{s.size_tier}</td>
                      <td style={{ padding: '10px 12px' }}>{money(s.fees_old.total, 2)}</td>
                      <td style={{ padding: '10px 12px' }}>{money(s.fees_new.total, 2)}</td>
                      <td style={{ padding: '10px 12px', color: s.fee_delta_per_unit > 0 ? C.red : C.green }}>
                        {s.fee_delta_per_unit > 0 ? '+' : ''}{money(s.fee_delta_per_unit, 2)}
                      </td>
                      <td style={{ padding: '10px 12px' }}>{s.monthly_units}</td>
                      <td style={{ padding: '10px 12px', color: s.annual_impact > 0 ? C.red : C.green, fontWeight: 600 }}>
                        {s.annual_impact > 0 ? '+' : ''}{money(s.annual_impact)}
                      </td>
                      <td style={{ padding: '10px 12px' }}>{s.margin_old_pct.toFixed(1)}% → {s.margin_new_pct.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <button onClick={() => window.print()} style={{
                padding: '11px 24px', background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: C.sans,
              }}>Print / Save as PDF</button>
            </div>

            {/* Monitor upsell */}
            {report.tier !== 'monitor' && (
              <div style={{ marginTop: 12, padding: '28px 32px', borderRadius: 12, textAlign: 'center', background: C.amberBg, border: `1px solid ${C.amberBorder}` }}>
                <h3 style={{ fontFamily: C.serif, fontSize: 18, color: C.text, marginBottom: 8 }}>This report is a snapshot</h3>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.7 }}>
                  Amazon changes fees on a schedule. SellerRadar Monitor re-scans your catalog weekly when schedules update and emails you the personal dollar impact — $99/mo, cancel anytime.
                </p>
                <a href="/pricing"
                  style={{ display: 'inline-block', padding: '12px 30px', background: C.amberBg, border: `1px solid ${C.amber}66`, borderRadius: 8, color: C.amber, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  Set up monitoring →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Paywall — not paid */}
        {!paid && (
          <div style={{ padding: '40px 32px', background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🔒</div>
            <h2 style={{ fontFamily: C.serif, fontSize: 22, color: C.text, marginBottom: 10 }}>Per-SKU breakdown locked</h2>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 28, lineHeight: 1.7, maxWidth: 460, margin: '0 auto 28px' }}>
              The top-line impact is above. Unlock which of the {report.affected_count} affected SKUs
              lose the most, why (referral vs FBA fulfillment vs storage), and
              the before/after margin on each — $49 one-time.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <button onClick={payCard} disabled={payBusy !== null} style={{
                padding: '13px 30px', background: C.amber, color: '#07090e', border: 'none',
                borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: payBusy ? 'wait' : 'pointer', fontFamily: C.sans,
              }}>
                {payBusy === 'card' ? 'Starting checkout…' : 'Pay $49 by card →'}
              </button>
              <button onClick={payCrypto} disabled={payBusy !== null} style={{
                padding: '13px 30px', background: C.redBg, border: `1px solid ${C.redBorder}`,
                borderRadius: 8, color: C.red, fontSize: 14, fontWeight: 700, cursor: payBusy ? 'wait' : 'pointer', fontFamily: C.sans,
              }}>
                {payBusy === 'crypto' ? 'Creating invoice…' : 'Pay with crypto →'}
              </button>
            </div>
            {payErr && <p style={{ fontSize: 12, color: C.red, fontFamily: C.mono, marginBottom: 12 }}>{payErr}</p>}
            <p style={{ fontSize: 11, color: C.dim, fontFamily: C.mono }}>Card via PayPal · Crypto via NOWPayments</p>
          </div>
        )}

        {/* Disclaimer — liability shrinker, on every report */}
        <div style={{ marginTop: 40, padding: '18px 24px', borderRadius: 8, background: C.surface, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 11, color: C.dim, lineHeight: 1.7, fontFamily: C.mono, margin: 0 }}>
            <strong style={{ color: C.muted }}>DISCLAIMER:</strong> All impact figures are estimates computed from published Amazon fee schedules (versioned fixtures with source URLs and effective dates) and the unit economics you uploaded — verify against your settlement reports. This report is not financial, tax, or repricing advice, and no savings are guaranteed. Report ref: {report.report_ref}.
          </p>
        </div>
      </div>
    </div>
  )
}
