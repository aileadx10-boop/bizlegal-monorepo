'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import type { BlockchainReport } from '../api/blockchain-report/route'

// ─── TYPES ───────────────────────────────────────────────────────
type TokenType = 'utility' | 'security' | 'payment' | 'governance' | 'nft' | 'stablecoin' | 'unknown'

// ─── HELPERS ─────────────────────────────────────────────────────
async function captureLead(email: string, source: string, product?: string) {
  try {
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source, page: '/blockchain-report', product }),
    })
  } catch { /* silent */ }
}

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    LOW: '#22c55e',
    MEDIUM: '#f59e0b',
    HIGH: '#ef4444',
    CRITICAL: '#dc2626',
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '99px', fontSize: '11px',
      fontFamily: 'Geist Mono, monospace', fontWeight: 700, letterSpacing: '0.1em',
      background: `${colors[level] ?? '#888'}22`,
      color: colors[level] ?? '#888',
      border: `1px solid ${colors[level] ?? '#888'}44`,
    }}>
      {level}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    compliant:     { color: '#22c55e', label: '✓ Compliant' },
    partial:       { color: '#f59e0b', label: '⚠ Partial' },
    non_compliant: { color: '#ef4444', label: '✗ Non-Compliant' },
    prohibited:    { color: '#dc2626', label: '⛔ Prohibited' },
    unclear:       { color: '#94a3b8', label: '? Unclear' },
  }
  const s = map[status] ?? { color: '#94a3b8', label: status }
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '99px', fontSize: '11px',
      fontFamily: 'Geist Mono, monospace', fontWeight: 700,
      background: `${s.color}22`, color: s.color,
      border: `1px solid ${s.color}44`,
    }}>{s.label}</span>
  )
}

function SeverityDot({ severity }: { severity: string }) {
  const c: Record<string, string> = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' }
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c[severity] ?? '#888', marginRight: 6, flexShrink: 0 }} />
}

function ScoreRing({ score }: { score: number }) {
  const r = 38, circ = 2 * Math.PI * r
  const fill = circ - (score / 100) * circ
  const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#22c55e'
  return (
    <div style={{ position: 'relative', width: 100, height: 100 }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${circ}`} strokeDashoffset={fill}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 700, color, fontFamily: 'Geist Mono, monospace' }}>{score}</span>
        <span style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.05em' }}>RISK</span>
      </div>
    </div>
  )
}

// ─── FORM ────────────────────────────────────────────────────────
const CHAINS = ['Ethereum', 'Bitcoin', 'Solana', 'BNB Chain', 'Polygon', 'Avalanche', 'Base', 'Arbitrum', 'Cardano', 'Polkadot', 'Other']
const TOKEN_TYPES: { value: TokenType; label: string; desc: string }[] = [
  { value: 'utility', label: 'Utility Token', desc: 'Access to platform/service' },
  { value: 'governance', label: 'Governance Token', desc: 'Voting rights in DAO' },
  { value: 'payment', label: 'Payment Token', desc: 'Medium of exchange' },
  { value: 'security', label: 'Security Token', desc: 'Equity/profit rights' },
  { value: 'stablecoin', label: 'Stablecoin', desc: 'Price-pegged asset' },
  { value: 'nft', label: 'NFT', desc: 'Non-fungible asset' },
  { value: 'unknown', label: 'Not Sure', desc: 'Help me determine' },
]
const JURISDICTIONS = [
  { id: 'uae', label: '🇦🇪 UAE (VARA)', desc: 'Virtual Assets Regulatory Authority' },
  { id: 'eu', label: '🇪🇺 EU (MiCA)', desc: 'Markets in Crypto-Assets' },
  { id: 'us', label: '🇺🇸 USA (SEC/CFTC)', desc: 'Securities & Commodities' },
  { id: 'uk', label: '🇬🇧 UK (FCA)', desc: 'Financial Conduct Authority' },
  { id: 'sg', label: '🇸🇬 Singapore (MAS)', desc: 'Monetary Authority' },
  { id: 'ca', label: '🇨🇦 Canada (CSA)', desc: 'Canadian Securities Administrators' },
]

// ─── MAIN PAGE ────────────────────────────────────────────────────
export default function BlockchainReportPage() {
  const [step, setStep] = useState<'form' | 'preview' | 'loading' | 'gate' | 'report' | 'upsell'>('form')
  const [report, setReport] = useState<BlockchainReport | null>(null)
  const [reportTier, setReportTier] = useState<'preview' | 'full'>('preview')
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [leadId, setLeadId] = useState<string | null>(null)

  const [form, setForm] = useState({
    projectName: '',
    tokenName: '',
    tokenSymbol: '',
    chain: '',
    tokenType: '' as TokenType | '',
    projectDescription: '',
    targetJurisdictions: [] as string[],
    hasPublicSale: false,
    hasDeFi: false,
    hasStaking: false,
  })

  const toggleJurisdiction = useCallback((id: string) => {
    setForm(f => ({
      ...f,
      targetJurisdictions: f.targetJurisdictions.includes(id)
        ? f.targetJurisdictions.filter(j => j !== id)
        : [...f.targetJurisdictions, id],
    }))
  }, [])

  const runReport = useCallback(async (tier: 'preview' | 'full') => {
    setError('')
    setStep('loading')
    setReportTier(tier)
    try {
      const jurisdictionLabels = form.targetJurisdictions.length > 0
        ? JURISDICTIONS.filter(j => form.targetJurisdictions.includes(j.id)).map(j => j.label.replace(/^[^\s]+\s/, ''))
        : JURISDICTIONS.map(j => j.label.replace(/^[^\s]+\s/, ''))

      const res = await fetch('/api/blockchain-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tokenType: form.tokenType || 'unknown',
          chain: form.chain || 'Ethereum',
          targetJurisdictions: jurisdictionLabels,
          tier,
        }),
      })
      if (!res.ok) throw new Error('Failed to generate report')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setReport(data.report)
      // Free preview goes to payment gate; paid full tier goes directly to report
      setStep(tier === 'preview' ? 'gate' : 'report')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate report')
      setStep('form')
    }
  }, [form])

  const handleGateEmailSubmit = useCallback(async () => {
    if (!email.includes('@') || !report) return
    setEmailSent(true)
    try {
      const res = await fetch('/api/brai/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          wallet_address: form.projectName,
          risk_score: report.overallRiskScore,
          risk_level: report.overallRiskLevel,
          report_data: {
            projectName: form.projectName,
            tokenName: form.tokenName,
            chain: form.chain,
            tokenType: form.tokenType,
          },
        }),
      })
      const data = await res.json()
      if (data.leadId) setLeadId(data.leadId)
    } catch { /* silent */ }
  }, [email, report, form])

  const handleEmailSubmit = useCallback(async () => {
    if (!email.includes('@')) return
    setEmailSent(true)
    await captureLead(email, 'blockchain_report', 'blockchain_report_full')
  }, [email])

  const isFormValid = form.projectName.length > 2 && form.tokenName.length > 1 && form.projectDescription.length > 20

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'IBM Plex Serif, serif' }}>

      {/* NAV */}
      <nav style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(4,6,14,0.95)', backdropFilter: 'blur(12px)', zIndex: 50 }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--sky)', fontFamily: 'Geist Mono, monospace', fontWeight: 700, fontSize: 15 }}>
          BizLegal<em style={{ fontStyle: 'italic', color: 'var(--teal)' }}>AI</em>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'Geist Mono, monospace' }}>Blockchain Compliance Report</span>
          <a href="https://brai.bizlegal-ai.com" style={{ padding: '6px 16px', background: 'rgba(165,180,252,0.1)', border: '1px solid rgba(165,180,252,0.3)', borderRadius: 6, color: 'var(--indigo)', fontSize: 12, textDecoration: 'none', fontFamily: 'Geist Mono, monospace' }}>
            Full BRAI Scan →
          </a>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(165,180,252,0.08)', border: '1px solid rgba(165,180,252,0.2)', borderRadius: 99, fontSize: 11, color: 'var(--indigo)', fontFamily: 'Geist Mono, monospace', marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--indigo)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            AI-POWERED · BLOCKCHAIN COMPLIANCE · TIER 1 REPORT
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 16, color: '#fff' }}>
            Free Blockchain<br />
            <span style={{ background: 'linear-gradient(135deg, #a5b4fc, #7dd3fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Regulatory Report
            </span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
            Get analysis across VARA, MiCA, SEC, FCA, MAS &amp; CSA, delivered in 2&ndash;5 minutes.
            Free preview report &middot; Full report free while waitlist-only &middot; Used by 200+ Web3 founders.
          </p>

          {/* STATS ROW */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}>
            {[['6', 'Jurisdictions'], ['30s', 'Generation Time'], ['200+', 'Reports Generated'], ['Free', 'Full Report']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--sky)', fontFamily: 'Geist Mono, monospace' }}>{v}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.05em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FORM ── */}
        {step === 'form' && (
          <div style={{ background: 'rgba(7,9,26,0.8)', border: '1px solid var(--border)', borderRadius: 16, padding: 'clamp(24px, 4vw, 40px)' }}>

            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', marginBottom: 24, fontSize: 13 }}>
                ⚠ {error}
              </div>
            )}

            {/* Project basics */}
            <div style={{ marginBottom: 32 }}>
              <div className="form-section-label">Project Basics</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Project Name *</label>
                  <input className="form-input" placeholder="e.g. MetaSwap Protocol" value={form.projectName}
                    onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Token Name *</label>
                  <input className="form-input" placeholder="e.g. MetaSwap Token" value={form.tokenName}
                    onChange={e => setForm(f => ({ ...f, tokenName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Token Symbol</label>
                  <input className="form-input" placeholder="e.g. META" value={form.tokenSymbol}
                    onChange={e => setForm(f => ({ ...f, tokenSymbol: e.target.value.toUpperCase().slice(0, 8) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Blockchain</label>
                  <select className="form-input" value={form.chain} onChange={e => setForm(f => ({ ...f, chain: e.target.value }))}>
                    <option value="">Select chain…</option>
                    {CHAINS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Project description */}
            <div style={{ marginBottom: 32 }}>
              <div className="form-group">
                <label className="form-label">Project Description * <span style={{ fontWeight: 400, color: 'var(--dim)' }}>(min 20 chars)</span></label>
                <textarea className="form-input" rows={4}
                  placeholder="Describe your project: what it does, how the token works, who the users are, how tokens are distributed…"
                  value={form.projectDescription}
                  onChange={e => setForm(f => ({ ...f, projectDescription: e.target.value }))}
                  style={{ resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>
            </div>

            {/* Token type */}
            <div style={{ marginBottom: 32 }}>
              <div className="form-section-label">Token Classification</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                {TOKEN_TYPES.map(t => (
                  <button key={t.value} onClick={() => setForm(f => ({ ...f, tokenType: t.value }))}
                    style={{
                      padding: '12px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                      background: form.tokenType === t.value ? 'rgba(165,180,252,0.12)' : 'rgba(7,9,26,0.6)',
                      border: `1px solid ${form.tokenType === t.value ? 'rgba(165,180,252,0.4)' : 'var(--border)'}`,
                      color: form.tokenType === t.value ? 'var(--indigo)' : 'var(--text)',
                      transition: 'all 0.15s',
                    }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feature flags */}
            <div style={{ marginBottom: 32 }}>
              <div className="form-section-label">Project Features</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                  { key: 'hasPublicSale', label: '🏷️ Public Token Sale / ICO / IDO' },
                  { key: 'hasDeFi', label: '⚡ DeFi / Liquidity Mining' },
                  { key: 'hasStaking', label: '🔒 Staking / Yield Rewards' },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => setForm(f => ({ ...f, [key]: !f[key as keyof typeof form] }))}
                    style={{
                      padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                      background: (form as any)[key] ? 'rgba(125,211,252,0.1)' : 'rgba(7,9,26,0.6)',
                      border: `1px solid ${(form as any)[key] ? 'rgba(125,211,252,0.35)' : 'var(--border)'}`,
                      color: (form as any)[key] ? 'var(--sky)' : 'var(--muted)',
                      transition: 'all 0.15s',
                    }}>
                    {(form as any)[key] ? '☑ ' : '☐ '}{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Jurisdictions */}
            <div style={{ marginBottom: 36 }}>
              <div className="form-section-label">Target Jurisdictions <span style={{ fontWeight: 400, color: 'var(--dim)', fontSize: 12 }}>(optional — leave blank for all 6)</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {JURISDICTIONS.map(j => (
                  <button key={j.id} onClick={() => toggleJurisdiction(j.id)}
                    style={{
                      padding: '12px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                      background: form.targetJurisdictions.includes(j.id) ? 'rgba(94,234,212,0.08)' : 'rgba(7,9,26,0.6)',
                      border: `1px solid ${form.targetJurisdictions.includes(j.id) ? 'rgba(94,234,212,0.3)' : 'var(--border)'}`,
                      color: form.targetJurisdictions.includes(j.id) ? 'var(--teal)' : 'var(--text)',
                      transition: 'all 0.15s',
                    }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{j.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{j.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => isFormValid && runReport('preview')}
                disabled={!isFormValid}
                style={{
                  padding: '14px 32px', borderRadius: 8, cursor: isFormValid ? 'pointer' : 'not-allowed',
                  background: isFormValid ? 'linear-gradient(135deg, rgba(165,180,252,0.15), rgba(125,211,252,0.1))' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isFormValid ? 'rgba(165,180,252,0.4)' : 'var(--border)'}`,
                  color: isFormValid ? '#fff' : 'var(--dim)', fontSize: 14, fontWeight: 600,
                  transition: 'all 0.2s',
                }}>
                Generate Free Preview Report →
              </button>
              <button
                onClick={() => isFormValid && runReport('full')}
                disabled={!isFormValid}
                style={{
                  padding: '14px 32px', borderRadius: 8, cursor: isFormValid ? 'pointer' : 'not-allowed',
                  background: isFormValid ? 'rgba(94,234,212,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isFormValid ? 'rgba(94,234,212,0.35)' : 'var(--border)'}`,
                  color: isFormValid ? 'var(--teal)' : 'var(--dim)', fontSize: 14, fontWeight: 600,
                  transition: 'all 0.2s',
                }}>
                Get Full Tier 1 Report — $99 →
              </button>
            </div>
            {!isFormValid && (
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--dim)', marginTop: 10 }}>
                Fill in Project Name, Token Name, and Description to continue
              </p>
            )}
          </div>
        )}

        {/* ── LOADING ── */}
        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid rgba(165,180,252,0.15)', borderTopColor: 'var(--indigo)', animation: 'spin 0.8s linear infinite', margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: 22, color: '#fff', marginBottom: 12 }}>Generating Your Compliance Report</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>
              Analyzing against VARA, MiCA, SEC, FCA, MAS & CSA regulations…<br />
              This takes 15–30 seconds.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
              {['🇦🇪 VARA', '🇪🇺 MiCA', '🇺🇸 SEC/CFTC', '🇬🇧 FCA', '🇸🇬 MAS', '🇨🇦 CSA'].map(j => (
                <span key={j} style={{ padding: '6px 14px', background: 'rgba(165,180,252,0.07)', border: '1px solid rgba(165,180,252,0.15)', borderRadius: 6, fontSize: 12, color: 'var(--indigo)', fontFamily: 'Geist Mono, monospace', animation: 'pulse 2s infinite' }}>{j}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── PAYMENT GATE ── */}
        {step === 'gate' && report && (
          <div>
            {/* Preview header — always visible */}
            <div style={{ background: 'rgba(7,9,26,0.8)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--indigo)', fontFamily: 'Geist Mono, monospace', letterSpacing: '0.1em', marginBottom: 6 }}>FREE PREVIEW — {report.projectName}</div>
                  <h2 style={{ fontSize: 22, color: '#fff', marginBottom: 4 }}>{report.tokenName} Regulatory Risk Scan</h2>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Generated {new Date(report.generatedAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <ScoreRing score={report.overallRiskScore} />
                  <RiskBadge level={report.overallRiskLevel} />
                </div>
              </div>
              <div style={{ padding: '14px 18px', background: 'rgba(125,211,252,0.04)', border: '1px solid rgba(125,211,252,0.1)', borderRadius: 10, fontSize: 14, color: 'var(--text)', lineHeight: 1.7, marginBottom: 20 }}>
                {report.executiveSummary}
              </div>

              {/* Show first 2 jurisdictions truncated */}
              <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Geist Mono, monospace', marginBottom: 10 }}>TOP RISK FINDINGS (2 of {report.jurisdictions.length})</div>
              {report.jurisdictions.slice(0, 2).map(j => (
                <div key={j.jurisdiction} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(7,9,26,0.6)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{j.flag}</span>
                    <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{j.jurisdiction}</span>
                    <StatusBadge status={j.status} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'Geist Mono, monospace' }}>{j.regulator}</span>
                </div>
              ))}

              {/* Blurred remaining content */}
              <div style={{ position: 'relative', marginTop: 8 }}>
                <div style={{ filter: 'blur(6px)', pointerEvents: 'none', opacity: 0.5, userSelect: 'none' }}>
                  {report.jurisdictions.slice(2, 4).map(j => (
                    <div key={j.jurisdiction} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(7,9,26,0.6)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{j.flag}</span>
                        <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{j.jurisdiction}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom, transparent, rgba(7,9,26,0.85))' }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'Geist Mono, monospace' }}>+{report.jurisdictions.length - 2} more jurisdictions in full report</span>
                </div>
              </div>
            </div>

            {/* Email capture / payment gate */}
            <div style={{ background: 'linear-gradient(135deg, rgba(165,180,252,0.08), rgba(125,211,252,0.05))', border: '1px solid rgba(165,180,252,0.25)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
              {!emailSent ? (
                <>
                  <div style={{ fontSize: 11, color: 'var(--indigo)', fontFamily: 'Geist Mono, monospace', letterSpacing: '0.1em', marginBottom: 12 }}>🔒 FULL REPORT LOCKED</div>
                  <h3 style={{ fontSize: 20, color: '#fff', marginBottom: 8 }}>Get Your Full Regulatory Report</h3>
                  <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
                    Unlock all {report.jurisdictions.length} jurisdiction analyses, Howey Test verdict, compliance cost estimate, and step-by-step action plan.
                  </p>
                  <div style={{ display: 'flex', gap: 10, maxWidth: 440, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleGateEmailSubmit()}
                      style={{ flex: 1, minWidth: 220, padding: '12px 16px', background: 'rgba(7,9,26,0.8)', border: '1px solid rgba(165,180,252,0.3)', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'Geist Mono, monospace' }}
                    />
                    <button
                      onClick={handleGateEmailSubmit}
                      disabled={!email.includes('@')}
                      style={{ padding: '12px 24px', background: 'rgba(165,180,252,0.15)', border: '1px solid rgba(165,180,252,0.4)', borderRadius: 8, color: 'var(--indigo)', fontSize: 14, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Get Full Report →
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--dim)', marginTop: 12 }}>No spam. Full reports are waitlist-only while we scale analyst review.</p>
                </>
              ) : (
                <>
                  <div style={{ color: 'var(--teal)', fontSize: 14, marginBottom: 16 }}>✓ You&apos;re on the list</div>
                  <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 8 }}>Full reports are waitlist-only right now</h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 24 }}>
                    Paid report checkout is paused while we scale analyst review. We&apos;ll email {email} the moment full reports reopen — waitlist members keep today&apos;s pricing.
                  </p>
                  <button
                    onClick={() => runReport('full')}
                    style={{ padding: '14px 28px', background: 'linear-gradient(135deg, rgba(165,180,252,0.2), rgba(125,211,252,0.15))', border: '1px solid rgba(165,180,252,0.4)', borderRadius: 8, color: '#fff', fontSize: 14, cursor: 'pointer', fontWeight: 700 }}>
                    Generate Full Report — Free →
                  </button>
                  {(report?.overallRiskLevel === 'HIGH' || report?.overallRiskLevel === 'CRITICAL') && (
                    <div style={{ marginTop: 20, padding: '16px 20px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10 }}>
                      <p style={{ fontSize: 13, color: '#fca5a5', marginBottom: 10 }}>
                        ⚠ Your project has a {report.overallRiskLevel} risk profile. Classify your token and check your counterparties against the sanctions lists before launch.
                      </p>
                      <a
                        href="/tools/token-classifier"
                        style={{ display: 'inline-block', padding: '9px 20px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 7, color: '#fca5a5', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                        Run the token classifier →
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button onClick={() => { setStep('form'); setReport(null); setEmailSent(false); setLeadId(null) }}
                style={{ padding: '10px 24px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>
                ← Run Another Report
              </button>
            </div>
          </div>
        )}

        {/* ── REPORT ── */}
        {step === 'report' && report && (
          <div>

            {/* Report header */}
            <div style={{ background: 'rgba(7,9,26,0.8)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Geist Mono, monospace', letterSpacing: '0.1em', marginBottom: 6 }}>BLOCKCHAIN COMPLIANCE REPORT</div>
                  <h2 style={{ fontSize: 24, color: '#fff', marginBottom: 4 }}>{report.projectName}</h2>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{report.tokenName} · Generated {new Date(report.generatedAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <ScoreRing score={report.overallRiskScore} />
                  <RiskBadge level={report.overallRiskLevel} />
                </div>
              </div>
              <div style={{ padding: '16px 20px', background: 'rgba(125,211,252,0.04)', border: '1px solid rgba(125,211,252,0.1)', borderRadius: 10, fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>
                {report.executiveSummary}
              </div>
            </div>

            {/* Howey Test */}
            <div style={{ background: 'rgba(7,9,26,0.8)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>⚖️</span> Howey Test Analysis (US Securities Classification)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                {[
                  ['Investment of Money', report.howeyTestAnalysis.investmentOfMoney],
                  ['Common Enterprise', report.howeyTestAnalysis.commonEnterprise],
                  ['Expectation of Profits', report.howeyTestAnalysis.expectationOfProfits],
                  ["Efforts of Others", report.howeyTestAnalysis.effortsOfOthers],
                ].map(([label, val]) => (
                  <div key={String(label)} style={{ padding: '12px 14px', background: 'rgba(7,9,26,0.6)', border: `1px solid ${val ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{String(label)}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: val ? '#ef4444' : '#22c55e' }}>{val ? '✗ Yes (risk)' : '✓ No (safe)'}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(7,9,26,0.6)', border: `1px solid ${report.howeyTestAnalysis.verdict === 'LIKELY_SECURITY' ? 'rgba(239,68,68,0.3)' : report.howeyTestAnalysis.verdict === 'UNCERTAIN' ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`, borderRadius: 8, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontFamily: 'Geist Mono, monospace', fontWeight: 700, color: report.howeyTestAnalysis.verdict === 'LIKELY_SECURITY' ? '#ef4444' : report.howeyTestAnalysis.verdict === 'UNCERTAIN' ? '#f59e0b' : '#22c55e' }}>
                    VERDICT: {report.howeyTestAnalysis.verdict.replace(/_/g, ' ')}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{report.howeyTestAnalysis.reasoning}</p>
              </div>
            </div>

            {/* Jurisdictions */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 16 }}>Jurisdiction-by-Jurisdiction Analysis</h3>
              {report.jurisdictions.map(j => (
                <div key={j.jurisdiction} style={{ background: 'rgba(7,9,26,0.8)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 22 }}>{j.flag}</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{j.jurisdiction}</span>
                        <StatusBadge status={j.status} />
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'Geist Mono, monospace' }}>
                        Regulator: {j.regulator} · Token: {j.tokenClassification}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Timeline · Cost</div>
                      <div style={{ fontSize: 13, color: 'var(--sky)', fontFamily: 'Geist Mono, monospace' }}>
                        {j.estimatedTimeline} · {j.estimatedCost}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                    {/* Licenses */}
                    {j.requiredLicenses.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--sky)', fontFamily: 'Geist Mono, monospace', marginBottom: 8, letterSpacing: '0.05em' }}>REQUIRED LICENSES</div>
                        {j.requiredLicenses.map(l => (
                          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>
                            <span style={{ color: 'var(--sky)' }}>◆</span> {l}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Risk flags */}
                    {j.riskFlags.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, color: '#ef4444', fontFamily: 'Geist Mono, monospace', marginBottom: 8, letterSpacing: '0.05em' }}>RISK FLAGS</div>
                        {j.riskFlags.map((rf, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 4, fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>
                            <SeverityDot severity={rf.severity} />
                            <span>{rf.flag}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Key actions */}
                    {j.keyActions.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--teal)', fontFamily: 'Geist Mono, monospace', marginBottom: 8, letterSpacing: '0.05em' }}>KEY ACTIONS</div>
                        {j.keyActions.map((a, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>
                            <span style={{ color: 'var(--teal)', flexShrink: 0 }}>{i + 1}.</span> {a}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Preview gate / upsell */}
            {reportTier === 'preview' && (
              <div style={{ position: 'relative', background: 'rgba(7,9,26,0.9)', border: '1px solid rgba(165,180,252,0.3)', borderRadius: 16, padding: 36, marginBottom: 20, textAlign: 'center', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, rgba(4,6,14,0.97) 100%)', pointerEvents: 'none', zIndex: 1 }} />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>🔒</div>
                  <h3 style={{ fontSize: 20, color: '#fff', marginBottom: 10 }}>Unlock Full Tier 1 Report</h3>
                  <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.7 }}>
                    Preview shows 2 jurisdictions. Full report includes all 6 jurisdictions, critical risks matrix, complete recommendations, estimated compliance costs, and PDF export.
                  </p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
                    {['✓ All 6 jurisdictions', '✓ Critical risk matrix', '✓ Complete action plan', '✓ Cost estimates', '✓ PDF export'].map(f => (
                      <span key={f} style={{ padding: '6px 12px', background: 'rgba(165,180,252,0.08)', border: '1px solid rgba(165,180,252,0.2)', borderRadius: 6, fontSize: 12, color: 'var(--indigo)' }}>{f}</span>
                    ))}
                  </div>
                  <button onClick={() => runReport('full')}
                    style={{ padding: '14px 32px', background: 'linear-gradient(135deg, rgba(94,234,212,0.15), rgba(125,211,252,0.1))', border: '1px solid rgba(94,234,212,0.4)', borderRadius: 8, color: 'var(--teal)', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'block', width: '100%', maxWidth: 360, margin: '0 auto' }}>
                    Get Full Report — Free →
                  </button>
                  <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 10 }}>Or run free unlimited scans with <a href="https://brai.bizlegal-ai.com" style={{ color: 'var(--indigo)', textDecoration: 'none' }}>BRAI →</a></div>
                </div>
              </div>
            )}

            {/* Top recommendations */}
            {report.topRecommendations.length > 0 && (
              <div style={{ background: 'rgba(7,9,26,0.8)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, color: '#fff', marginBottom: 16 }}>Top Recommendations</h3>
                {report.topRecommendations.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12, padding: '12px 14px', background: 'rgba(94,234,212,0.04)', border: '1px solid rgba(94,234,212,0.1)', borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--teal)', fontFamily: 'Geist Mono, monospace', fontWeight: 700, flexShrink: 0 }}>0{i + 1}</span>
                    <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{r}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Cost + next steps */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
              <div style={{ background: 'rgba(7,9,26,0.8)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Geist Mono, monospace', marginBottom: 8 }}>ESTIMATED TOTAL COMPLIANCE COST</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--sky)', fontFamily: 'Geist Mono, monospace', marginBottom: 8 }}>{report.estimatedTotalCost}</div>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>Cross-jurisdiction legal setup. BizLegal AI templates from $49 can reduce this significantly.</p>
                <a href="https://docstack.bizlegal-ai.com" style={{ display: 'inline-block', marginTop: 12, padding: '8px 16px', background: 'rgba(125,211,252,0.08)', border: '1px solid rgba(125,211,252,0.25)', borderRadius: 6, color: 'var(--sky)', fontSize: 12, textDecoration: 'none' }}>Get Templates from $49 →</a>
              </div>
              <div style={{ background: 'rgba(7,9,26,0.8)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Geist Mono, monospace', marginBottom: 12 }}>NEXT STEPS</div>
                {report.nextSteps.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                    <span style={{ color: 'var(--teal)', flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span> {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Next-step CTA for HIGH/CRITICAL risk — self-serve, no calendar */}
            {(report.overallRiskLevel === 'HIGH' || report.overallRiskLevel === 'CRITICAL') && (
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 16, padding: 28, marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>⚠️</div>
                <h3 style={{ fontSize: 17, color: '#fca5a5', marginBottom: 8 }}>
                  {report.overallRiskLevel} Risk Detected — Work Through It Before Launch
                </h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 20, maxWidth: 480, margin: '0 auto 20px' }}>
                  Your project has significant regulatory exposure. Start with the classification questions that drive most of it: how your token is characterised, and whether anyone you deal with is sanctioned.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a
                    href="/tools/token-classifier"
                    style={{ display: 'inline-block', padding: '12px 28px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, color: '#fca5a5', fontSize: 14, textDecoration: 'none', fontWeight: 700 }}>
                    Classify your token →
                  </a>
                  <a
                    href="/tools/wallet-screener"
                    style={{ display: 'inline-block', padding: '12px 28px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#fca5a5', fontSize: 14, textDecoration: 'none', fontWeight: 700 }}>
                    Screen a wallet →
                  </a>
                </div>
              </div>
            )}

            {/* Lead capture */}
            <div style={{ background: 'linear-gradient(135deg, rgba(165,180,252,0.07), rgba(125,211,252,0.04))', border: '1px solid rgba(165,180,252,0.2)', borderRadius: 16, padding: 28, marginBottom: 24, textAlign: 'center' }}>
              <h3 style={{ fontSize: 17, color: '#fff', marginBottom: 8 }}>Get This Report + Weekly Crypto Regulatory Updates</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.7 }}>
                We'll email you this report + send weekly regulatory alerts for VARA, MiCA, SEC & FCA changes affecting your project.
              </p>
              {!emailSent ? (
                <div style={{ display: 'flex', gap: 10, maxWidth: 420, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
                    style={{ flex: 1, minWidth: 220, padding: '10px 14px', background: 'rgba(7,9,26,0.8)', border: '1px solid var(--border)', borderRadius: 7, color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'Geist Mono, monospace' }} />
                  <button onClick={handleEmailSubmit}
                    style={{ padding: '10px 20px', background: 'rgba(165,180,252,0.12)', border: '1px solid rgba(165,180,252,0.35)', borderRadius: 7, color: 'var(--indigo)', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    Send Me Updates →
                  </button>
                </div>
              ) : (
                <div style={{ color: 'var(--teal)', fontSize: 14 }}>✓ You're in! Watch for regulatory alerts in your inbox.</div>
              )}
            </div>

            {/* Disclaimer */}
            <p style={{ fontSize: 11, color: 'var(--dim)', lineHeight: 1.7, textAlign: 'center', padding: '0 20px' }}>
              {report.disclaimer}
            </p>

            {/* Run again */}
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button onClick={() => { setStep('form'); setReport(null) }}
                style={{ padding: '10px 24px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>
                ← Run Another Report
              </button>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .form-section-label {
          font-size: 11px; color: var(--sky); font-family: 'Geist Mono', monospace;
          letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 14px; font-weight: 600;
        }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 12px; color: var(--muted); font-family: 'Geist Mono', monospace; }
        .form-input {
          padding: 10px 14px; background: rgba(7,9,26,0.8); border: 1px solid var(--border);
          border-radius: 8px; color: #fff; font-size: 13px; outline: none;
          font-family: 'IBM Plex Serif', serif; transition: border-color 0.15s;
        }
        .form-input:focus { border-color: rgba(165,180,252,0.4); }
        .form-input option { background: #07091a; }
      `}</style>
    </div>
  )
}
