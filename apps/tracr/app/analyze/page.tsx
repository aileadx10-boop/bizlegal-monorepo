'use client'

import { useState } from 'react'

const C = {
  bg: '#07090e', surface: '#0d1118', card: '#111622', border: '#1a2035',
  borderActive: '#2d3d6b', text: '#e8ecf4', muted: '#5a6278', dim: '#2e3450',
  red: '#c0392b', redBg: 'rgba(192,57,43,0.09)', redBorder: 'rgba(192,57,43,0.30)',
  amber: '#d4a843', amberBg: 'rgba(212,168,67,0.08)', amberBorder: 'rgba(212,168,67,0.28)',
  green: '#27ae60', greenBg: 'rgba(39,174,96,0.08)', orange: '#e67e22',
  mono: '"DM Mono","Fira Code",ui-monospace,monospace',
  serif: '"Playfair Display",Georgia,serif',
  sans: '"DM Sans",system-ui,-apple-system,sans-serif',
}

interface AnalysisResult {
  riskScore: number
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
  preview: string
  flags: { severity: string; title: string; description: string }[]
  flagCount: number
  metrics: { totalTransactions: number; uniqueCounterparties: number; firstSeen: string; totalVolumeETH: number }
  fullReportAvailable: boolean
}

const NETWORKS = [
  { id: 'ethereum', label: 'Ethereum' },
  { id: 'bnb',      label: 'BNB Chain' },
  { id: 'polygon',  label: 'Polygon' },
  { id: 'arbitrum', label: 'Arbitrum' },
  { id: 'base',     label: 'Base' },
  { id: 'bitcoin',  label: 'Bitcoin' },
]

const SEV_COLORS: Record<string, string> = {
  critical: '#c0392b', high: '#e67e22', medium: '#f39c12', informational: '#5a6278',
}

function Logo() {
  return (
    <a href="/" style={{ textDecoration: 'none' }}>
      <div style={{ fontFamily: C.mono, fontSize: 22, fontWeight: 500, letterSpacing: '0.12em', color: C.text }}>
        TRA<span style={{ color: C.amber }}>C</span>R
      </div>
    </a>
  )
}

export default function AnalyzePage() {
  const [wallet,  setWallet]  = useState('')
  const [network, setNetwork] = useState('ethereum')
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [result,  setResult]  = useState<AnalysisResult | null>(null)

  const LEVEL_COLORS: Record<string, string> = { Critical: C.red, High: C.orange, Moderate: '#f39c12', Low: C.green }
  const LEVEL_BGS: Record<string, string>    = { Critical: C.redBg, High: 'rgba(230,126,34,0.08)', Moderate: 'rgba(243,156,18,0.08)', Low: C.greenBg }
  const levelColor = result?.riskLevel ? (LEVEL_COLORS[result.riskLevel] ?? C.muted) : C.muted
  const levelBg    = result?.riskLevel ? (LEVEL_BGS[result.riskLevel]    ?? C.surface) : C.surface

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault()
    if (!wallet.trim()) { setError('Enter a wallet address.'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: wallet.trim(), network, email: email || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Analysis failed.'); return }
      setResult(data)
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: C.sans }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}`}</style>

      {/* Nav */}
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
        <Logo />
        <a href="/scan" style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, textDecoration: 'none', letterSpacing: '0.08em' }}>
          Regulatory Scan →
        </a>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
            Free Blockchain Forensic Tool
          </div>
          <h1 style={{ fontFamily: C.serif, fontSize: 36, fontWeight: 700, color: C.text, marginBottom: 14, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
            Wallet Risk Snapshot
          </h1>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.65, maxWidth: 520 }}>
            Instant on-chain risk analysis. Enter any Ethereum, BNB, or Polygon wallet to detect AML flags, counterparty exposure, and behavioral anomalies — free.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAnalyze} style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
              Wallet Address *
            </label>
            <input
              value={wallet} onChange={e => setWallet(e.target.value)}
              placeholder="0x... or bc1..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '14px 16px', background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.text, fontSize: 14, fontFamily: C.mono, outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Network</label>
              <select value={network} onChange={e => setNetwork(e.target.value)}
                style={{ width: '100%', padding: '13px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, outline: 'none' }}>
                {NETWORKS.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Email (for report)</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@firm.com"
                style={{ width: '100%', boxSizing: 'border-box', padding: '13px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, outline: 'none' }} />
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: 14, padding: '11px 14px', background: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: 8, fontSize: 13, color: C.red, fontFamily: C.mono }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '15px', background: loading ? C.surface : C.red,
            color: loading ? C.muted : '#fff', border: 'none', borderRadius: 8,
            fontSize: 15, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', fontFamily: C.sans,
            boxShadow: loading ? 'none' : `0 4px 24px rgba(192,57,43,0.3)`,
          }}>
            {loading
              ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${C.muted}`, borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite', display: 'inline-block' }} />
                  Analyzing on-chain data…
                </span>
              : 'Analyze Wallet — Free'}
          </button>
          <p style={{ marginTop: 10, textAlign: 'center', fontFamily: C.mono, fontSize: 11, color: C.dim }}>
            Free snapshot · 3 risk flags · No sign-up required
          </p>
        </form>

        {/* Results */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Risk score */}
            <div style={{ padding: '28px 32px', borderRadius: 14, background: levelBg, border: `1px solid ${levelColor}33` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
                <div>
                  <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>Risk Score</div>
                  <div style={{ fontFamily: C.mono, fontSize: 52, fontWeight: 500, color: levelColor, lineHeight: 1 }}>{result.riskScore}</div>
                  <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, letterSpacing: '0.1em' }}>/100</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: C.serif, fontSize: 22, fontWeight: 700, color: levelColor, marginBottom: 8 }}>{result.riskLevel} Risk</div>
                  <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted }}>
                    {result.metrics.totalTransactions.toLocaleString()} transactions analyzed
                  </div>
                </div>
              </div>
              {result.preview && (
                <p style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${C.border}`, fontSize: 14, color: C.muted, lineHeight: 1.7, fontStyle: 'italic' }}>
                  {result.preview}
                </p>
              )}
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 10 }}>
              {[
                ['Transactions', result.metrics.totalTransactions.toLocaleString()],
                ['Counterparties', result.metrics.uniqueCounterparties.toLocaleString()],
                ['Volume (ETH)', result.metrics.totalVolumeETH.toFixed(3)],
                ['First Seen', result.metrics.firstSeen.split('T')[0] ?? 'Unknown'],
              ].map(([label, val]) => (
                <div key={label} style={{ padding: '14px 16px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                  <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
                  <div style={{ fontFamily: C.mono, fontSize: 16, fontWeight: 500, color: C.text }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Flags */}
            <div style={{ padding: '24px 28px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14 }}>
              <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 18 }}>
                Risk Flags — Showing {result.flags.length} of {result.flagCount}
              </div>
              {result.flags.map((flag, i) => (
                <div key={i} style={{
                  padding: '14px 16px', borderRadius: 8, marginBottom: 10,
                  background: C.card, borderLeft: `3px solid ${SEV_COLORS[flag.severity] || C.muted}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{flag.title}</div>
                    <span style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: SEV_COLORS[flag.severity] || C.muted }}>{flag.severity}</span>
                  </div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{flag.description}</div>
                </div>
              ))}

              {/* Blurred remaining flags */}
              {result.flagCount > result.flags.length && (
                <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', marginTop: 4 }}>
                  <div style={{ filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}>
                    {[...Array(Math.min(result.flagCount - result.flags.length, 3))].map((_, i) => (
                      <div key={i} style={{ padding: '14px 16px', background: C.card, borderLeft: `3px solid ${C.border}`, borderRadius: 8, marginBottom: 10 }}>
                        <div style={{ height: 14, background: C.border, borderRadius: 4, width: '60%', marginBottom: 8 }} />
                        <div style={{ height: 11, background: C.dim, borderRadius: 4, width: '85%' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(transparent, ${C.surface}cc)` }}>
                    <span style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.12em' }}>
                      +{result.flagCount - result.flags.length} more flags in full report
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div style={{ padding: '32px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>🔒</div>
              <h3 style={{ fontFamily: C.serif, fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 10 }}>
                Unlock the Full Forensic Report
              </h3>
              <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.65, maxWidth: 440, margin: '0 auto 24px' }}>
                Full {result.flagCount}-flag analysis, behavioral pattern report, legal exposure summary, and court-ready PDF for attorneys.
              </p>
              <a href={`/scan?wallet=${encodeURIComponent(wallet)}&network=${network}`}
                style={{
                  display: 'inline-block', padding: '15px 40px',
                  background: C.red, color: '#fff', textDecoration: 'none',
                  borderRadius: 8, fontSize: 15, fontWeight: 700, fontFamily: C.sans,
                  boxShadow: `0 4px 24px rgba(192,57,43,0.3)`,
                }}>
                Order Full Report — from $149 →
              </a>
              <p style={{ marginTop: 12, fontFamily: C.mono, fontSize: 11, color: C.dim }}>
                Court-ready PDF · 48hr delivery · PayPal or crypto
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
