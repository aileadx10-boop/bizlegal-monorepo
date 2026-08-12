'use client'
import { useState, type CSSProperties } from 'react'
import Link from 'next/link'
import type { ReserveCategory, ReserveReport } from '@/lib/reserve-report'

interface AssetRow {
  name: string
  amount: string
  category: ReserveCategory
  custodian: string
  attestationDays: string
  rehypothecated: boolean
}

const CATEGORIES: { value: ReserveCategory; label: string }[] = [
  { value: 'cash', label: 'Cash / bank deposits' },
  { value: 't_bills', label: 'US Treasury bills (<1yr)' },
  { value: 'money_market', label: 'Money-market funds' },
  { value: 'eligible_securities', label: 'Repo / agency / eligible securities' },
  { value: 'commodity', label: 'Commodity-referenced (e.g. gold)' },
  { value: 'other', label: 'Crypto / equity / other' },
]

const SEVERITY_COLOR: Record<string, string> = { critical: '#c0392b', warning: '#e67e22', info: '#7f8c8d' }

const INPUT_STYLE: CSSProperties = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid var(--outline-var)',
  background: 'var(--bg)',
  color: 'var(--on-surface)',
  fontSize: 13,
  fontFamily: 'Manrope, sans-serif',
}

export default function ReserveReport() {
  const [email, setEmail] = useState('')
  const [issuerName, setIsIssuerName] = useState('')
  const [issuerJurisdiction, setIssuerJurisdiction] = useState<'US' | 'EU' | 'Other'>('US')
  const [tokenType, setTokenType] = useState<'single_currency' | 'multi_asset' | 'algorithmic'>('single_currency')
  const [peggedCurrency, setPeggedCurrency] = useState('')
  const [assets, setAssets] = useState<AssetRow[]>([{ name: '', amount: '', category: 'cash', custodian: '', attestationDays: '', rehypothecated: false }])
  const [busy, setBusy] = useState<'idle' | 'preview' | 'checkout'>('idle')
  const [report, setReport] = useState<ReserveReport | null>(null)
  const [error, setError] = useState('')

  const updateAsset = (i: number, patch: Partial<AssetRow>) => {
    setAssets((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }

  const addAsset = () => setAssets((rows) => [...rows, { name: '', amount: '', category: 'cash', custodian: '', attestationDays: '', rehypothecated: false }])
  const removeAsset = (i: number) => setAssets((rows) => rows.filter((_, idx) => idx !== i))

  async function generatePreview() {
    setBusy('preview')
    setError('')
    try {
      const res = await fetch('/api/reserve-report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          reserve: {
            issuerName: issuerName.trim(),
            issuerJurisdiction,
            tokenType,
            peggedCurrency: peggedCurrency.trim() || undefined,
            assets: assets
              .filter((a) => a.name.trim() && a.amount.trim())
              .map((a) => ({
                name: a.name.trim(),
                amount: Number(a.amount),
                category: a.category,
                custodian: a.custodian.trim() || undefined,
                attestationDays: a.attestationDays.trim() ? Number(a.attestationDays) : undefined,
                rehypothecated: a.rehypothecated,
              })),
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError((data.errors && data.errors.join(' · ')) || data.error || 'Could not generate the preview.')
        setBusy('idle')
        return
      }
      setReport(data.report as ReserveReport)
      setBusy('idle')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError('Network issue — please retry.')
      setBusy('idle')
    }
  }

  async function checkout(gateway: 'crypto' | 'card') {
    if (!email.trim()) {
      setError('Enter a work email to start checkout.')
      return
    }
    setBusy('checkout')
    setError('')
    try {
      const res = await fetch('/api/pay/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: 'stablecoin_reserve_monthly',
          user_email: email.trim(),
          gateway,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.checkout_url) {
        setError(data.error ?? 'Checkout is temporarily unavailable — please retry in a moment.')
        setBusy('idle')
        return
      }
      window.location.href = data.checkout_url
    } catch {
      setError('Network issue — please retry.')
      setBusy('idle')
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 32px' }}>
      <span className="section-label">Stablecoins · GENIUS Act + MiCA · $199/mo</span>
      <h1 style={{ marginBottom: 8, fontSize: 'clamp(28px,5vw,48px)' }}>Reserve Report Generator</h1>
      <p style={{ color: 'var(--on-surface-var)', marginBottom: 8, lineHeight: 1.7 }}>
        Enter your reserve composition and get a <strong>templated monthly reserve report</strong> assessed
        against the US GENIUS Act (1:1 eligible reserves, monthly attestation, no rehypothecation) and EU
        MiCA EMT/ART reserve rules (Art. 43, Art. 36(4)) — each finding cited to the governing provision.
      </p>
      <p style={{ fontSize: 12, color: 'var(--outline)', lineHeight: 1.6, marginBottom: 32 }}>
        This is a <strong>template generated from the data you supply — it is not an audit</strong>, does not
        certify or opine on the accuracy of your reserve data, and is not legal advice. Before external use, a
        named qualified professional must review the underlying data and conclusions.
      </p>

      {error && (
        <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: '10px', background: '#fdecea', border: '1px solid #f5c6c0', color: '#c0392b', fontSize: 13, lineHeight: 1.6 }}>
          {error}
        </div>
      )}

      {report && (
        <div className="card" style={{ padding: '28px', background: 'var(--bg-mid)', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            <div>
              <span className="tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: 8 }}>FREE PREVIEW · {report.regime}</span>
              <div style={{ fontFamily: 'Newsreader, serif', fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>{issuerName || 'Your issuer'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Eligible coverage</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: report.coveragePct >= 100 ? '#27ae60' : '#c0392b' }}>{report.coveragePct}%</div>
              <div style={{ fontSize: 11, color: 'var(--outline)' }}>${report.eligibleUsd.toLocaleString()} of ${report.totalUsd.toLocaleString()}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <span className="tag" style={{ color: 'var(--outline)' }}>${report.totalUsd.toLocaleString()} total reserves</span>
            {report.issues.map((i) => (
              <span key={i.code} className="tag" style={{ color: SEVERITY_COLOR[i.severity] }}>{i.severity}: {i.code.replace(/_/g, ' ')}</span>
            ))}
            {report.issues.length === 0 && <span className="tag" style={{ color: '#27ae60' }}>no findings</span>}
          </div>

          <div style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
            {report.issues.map((i) => (
              <div key={i.code} style={{ marginBottom: 10 }}>
                <span style={{ fontWeight: 700, color: SEVERITY_COLOR[i.severity], textTransform: 'uppercase', fontSize: 11 }}>{i.severity}</span>
                <span style={{ color: 'var(--on-surface)' }}> — {i.text}</span>
                <div style={{ fontSize: 11, color: 'var(--outline)' }}>{i.citation}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, color: 'var(--outline)', lineHeight: 1.6, marginBottom: 20 }}>
            Governing provisions: {report.citations.join(' · ')}
          </div>

          <div style={{ padding: '22px', border: '1px solid var(--outline-var)', borderRadius: '12px', marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--outline)', marginBottom: 6 }}>Unlock the full report</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Your month-1 report — $199/mo</div>
            <div style={{ fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.6, marginBottom: 16 }}>
              On payment we generate the full HTML report from the exact composition above, host it, and email you
              the link. Regenerate monthly as your composition changes. Cancels anytime.
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => checkout('crypto')} disabled={busy === 'checkout'} className="btn-primary" style={{ fontSize: 13, padding: '11px 24px' }}>
                {busy === 'checkout' ? 'Opening checkout…' : 'Pay with crypto →'}
              </button>
              <button onClick={() => checkout('card')} disabled={busy === 'checkout'} className="btn-ghost" style={{ fontSize: 13, padding: '11px 24px' }}>
                Pay with card
              </button>
            </div>
            {busy === 'idle' && (
              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--outline)' }}>
                You'll be redirected to a secure payment page to complete checkout. The report generates on payment confirmation.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: '28px', background: 'var(--bg-mid)', marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--outline)', marginBottom: 16 }}>1 · Issuer</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 8 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--on-surface-var)', marginBottom: 6 }}>Work email (used for the report link)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@issuer.com" style={{ ...INPUT_STYLE, width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--on-surface-var)', marginBottom: 6 }}>Issuer name</label>
            <input type="text" value={issuerName} onChange={(e) => setIsIssuerName(e.target.value)} placeholder="Acme Stable Ltd" style={{ ...INPUT_STYLE, width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--on-surface-var)', marginBottom: 6 }}>Issuer jurisdiction</label>
            <select value={issuerJurisdiction} onChange={(e) => setIssuerJurisdiction(e.target.value as 'US' | 'EU' | 'Other')} style={{ ...INPUT_STYLE, width: '100%' }}>
              <option value="US">US</option>
              <option value="EU">EU</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--on-surface-var)', marginBottom: 6 }}>Token type</label>
            <select value={tokenType} onChange={(e) => setTokenType(e.target.value as 'single_currency' | 'multi_asset' | 'algorithmic')} style={{ ...INPUT_STYLE, width: '100%' }}>
              <option value="single_currency">Single-currency (e.g. USD stablecoin)</option>
              <option value="multi_asset">Multi-asset (e.g. basket / ART)</option>
              <option value="algorithmic">Algorithmic / unbacked</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--on-surface-var)', marginBottom: 6 }}>Pegged currency (optional)</label>
            <input type="text" value={peggedCurrency} onChange={(e) => setPeggedCurrency(e.target.value)} placeholder="USD / EUR" style={{ ...INPUT_STYLE, width: '100%' }} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '28px', background: 'var(--bg-mid)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--outline)' }}>2 · Reserve composition</div>
          <button onClick={addAsset} className="btn-ghost" style={{ fontSize: 12, padding: '7px 14px' }}>+ Add asset</button>
        </div>
        {assets.map((a, i) => (
          <div key={i} style={{ padding: '16px', border: '1px solid var(--outline-var)', borderRadius: '10px', marginBottom: 12, background: 'var(--bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Asset {i + 1}</span>
              {assets.length > 1 && (
                <button onClick={() => removeAsset(i)} style={{ background: 'none', border: 'none', fontSize: 11, color: '#c0392b', cursor: 'pointer', fontFamily: 'Manrope, sans-serif' }}>Remove</button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--on-surface-var)', marginBottom: 4 }}>Name</label>
                <input type="text" value={a.name} onChange={(e) => updateAsset(i, { name: e.target.value })} placeholder="USD cash at bank" style={{ ...INPUT_STYLE, width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--on-surface-var)', marginBottom: 4 }}>Amount (USD)</label>
                <input type="number" min="0" value={a.amount} onChange={(e) => updateAsset(i, { amount: e.target.value })} placeholder="100000" style={{ ...INPUT_STYLE, width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--on-surface-var)', marginBottom: 4 }}>Category</label>
                <select value={a.category} onChange={(e) => updateAsset(i, { category: e.target.value as ReserveCategory })} style={{ ...INPUT_STYLE, width: '100%' }}>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--on-surface-var)', marginBottom: 4 }}>Custodian (optional)</label>
                <input type="text" value={a.custodian} onChange={(e) => updateAsset(i, { custodian: e.target.value })} placeholder="Bank / custodian name" style={{ ...INPUT_STYLE, width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--on-surface-var)', marginBottom: 4 }}>Attestation age (days, optional)</label>
                <input type="number" min="0" value={a.attestationDays} onChange={(e) => updateAsset(i, { attestationDays: e.target.value })} placeholder="e.g. 21" style={{ ...INPUT_STYLE, width: '100%' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
                <input type="checkbox" id={`rehypo-${i}`} checked={a.rehypothecated} onChange={(e) => updateAsset(i, { rehypothecated: e.target.checked })} />
                <label htmlFor={`rehypo-${i}`} style={{ fontSize: 12, color: 'var(--on-surface-var)' }}>Rehypothecated / reused</label>
              </div>
            </div>
          </div>
        ))}
        <button onClick={generatePreview} disabled={busy !== 'idle'} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 14 }}>
          {busy === 'preview' ? 'Generating preview…' : report ? 'Regenerate preview' : 'Generate free preview'}
        </button>
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--outline)', lineHeight: 1.6 }}>
          The preview runs the same deterministic engine that fulfillment uses — no audit, no attestation, no
          legal opinion. Monthly GENIUS Act attestation and MiCA verification are separate professional duties.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
        <Link href="/tools/stablecoin-classifier" className="btn-ghost" style={{ fontSize: 13 }}>Stablecoin Classifier →</Link>
        <Link href="/regulations/mica" className="btn-ghost" style={{ fontSize: 13 }}>MiCA Hub →</Link>
        <a href="https://tracr.bizlegal-ai.com" className="btn-ghost" style={{ fontSize: 13 }}>TRACR Wallet Reports →</a>
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--outline)', lineHeight: 1.7 }}>
        <strong>Liability note.</strong> The report is a templated output generated deterministically from the
        reserve composition you enter. It is not an audit, does not certify, verify, or opine on the accuracy of
        the data, and is not legal advice. Regimes are evolving — GENIUS Act is effective 2027; MiCA transitional
        regimes vary by NCA. Before external use, a named qualified professional must review the underlying data
        and the conclusions. Subscriptions cancel anytime; no outcome guarantees.
      </div>
    </div>
  )
}
