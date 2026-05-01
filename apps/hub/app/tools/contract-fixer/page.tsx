'use client'
import { useState } from 'react'
import Link from 'next/link'

interface FixedClause { title: string; problem: string; original: string; fixed: string; severity: 'HIGH' | 'MEDIUM' | 'LOW' }
interface FixResult {
  overallScore: number; riskLevel: string; summary: string
  fixedClauses: FixedClause[]; missingProtections: string[]; paymentRisks: string[]; ipRisks: string[]; recommendations: string[]; verdict: string
}

const JURISDICTIONS = [
  { value: 'international', label: 'International' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'us-delaware', label: 'US (Delaware)' },
  { value: 'us-california', label: 'US (California)' },
  { value: 'eu', label: 'European Union' },
  { value: 'uae', label: 'UAE / DIFC' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'australia', label: 'Australia' },
  { value: 'brazil', label: 'Brazil' },
]

function ScoreBar({ score }: { score: number }) {
  const c = score >= 70 ? 'var(--teal)' : score >= 40 ? '#fbbf24' : '#f87171'
  return (
    <div style={{ padding: '24px', borderRadius: '14px', border: '1px solid rgba(125,211,252,0.12)', background: 'rgba(7,9,26,0.7)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'Geist Mono, monospace' }}>Freelancer Protection Score</span>
        <span style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: c }}>{score}/100</span>
      </div>
      <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(125,211,252,0.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: c, borderRadius: '4px', transition: 'width 1s ease' }} />
      </div>
      <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--dim)' }}>
        {score >= 70 ? 'Good protection' : score >= 40 ? 'Needs improvement' : 'Significant risk — fix urgently'}
      </div>
    </div>
  )
}

export default function ContractFixerPage() {
  const [text, setText] = useState('')
  const [jurisdiction, setJurisdiction] = useState('international')
  const [lang, setLang] = useState<'en' | 'pt' | 'es'>('en')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<FixResult | null>(null)
  const [error, setError] = useState('')
  const [expandedClause, setExpandedClause] = useState<number | null>(null)

  async function analyze() {
    if (text.trim().length < 50) { setError('Please paste at least 50 characters.'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/tools/contract-fixer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, jurisdiction, lang }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Analysis failed.'); return }
      setResult(data)
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  const sevColor = (s: string) => s === 'HIGH' ? '#f87171' : s === 'MEDIUM' ? '#fbbf24' : 'var(--teal)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingTop: '36px' }}>
      <div style={{ background: 'rgba(7,9,26,0.95)', borderBottom: '1px solid rgba(125,211,252,0.08)' }}>
        <div className="container" style={{ paddingTop: '20px', paddingBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/tools" style={{ color: 'var(--muted)', fontSize: '13px', fontFamily: 'Geist Mono, monospace' }}>← Tools</Link>
          <span style={{ color: 'var(--border)', fontSize: '13px' }}>/</span>
          <span style={{ color: 'var(--teal)', fontSize: '13px', fontFamily: 'Geist Mono, monospace' }}>Contract Fixer</span>
        </div>
      </div>

      <div className="section" style={{ paddingTop: '60px', paddingBottom: '40px' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: '20px' }}>
              <span className="bdot" />&nbsp;Free Tool · Freelancer Protection
            </div>
            <h1 className="sh" style={{ marginBottom: '14px' }}>Freelancer Contract <em>Fixer</em></h1>
            <p className="sdesc" style={{ margin: '0 auto' }}>Paste your freelance contract. Our AI identifies weak clauses exposing you to non-payment, scope creep, and IP loss — then rewrites them to protect you.</p>
          </div>

          {/* Input */}
          <div style={{ background: 'rgba(7,9,26,0.7)', border: '1px solid rgba(94,234,212,0.15)', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px', fontFamily: 'Geist Mono, monospace' }}>Jurisdiction</label>
                <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} style={{
                  width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border2)',
                  background: 'rgba(4,6,14,0.7)', color: 'var(--text)', fontSize: '13px', fontFamily: 'Geist Mono, monospace', outline: 'none',
                }}>
                  {JURISDICTIONS.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px', fontFamily: 'Geist Mono, monospace' }}>Language</label>
                <div style={{ display: 'flex', gap: '6px', height: '40px' }}>
                  {(['en', 'pt', 'es'] as const).map(l => (
                    <button key={l} onClick={() => setLang(l)} style={{
                      flex: 1, borderRadius: '8px', fontSize: '11px', fontFamily: 'Geist Mono, monospace', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase',
                      background: lang === l ? 'rgba(94,234,212,0.12)' : 'transparent',
                      border: `1px solid ${lang === l ? 'rgba(94,234,212,0.4)' : 'var(--border2)'}`,
                      color: lang === l ? 'var(--teal)' : 'var(--muted)',
                    }}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
            <textarea
              value={text} onChange={e => setText(e.target.value)}
              placeholder="Paste your freelance contract, service agreement, or consulting contract here..."
              style={{
                width: '100%', minHeight: '240px', padding: '16px', borderRadius: '10px',
                border: '1px solid var(--border2)', background: 'rgba(4,6,14,0.7)',
                color: 'var(--white)', fontSize: '13px', fontFamily: 'Geist Mono, monospace', resize: 'vertical', outline: 'none', lineHeight: 1.7,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
              <span style={{ fontSize: '11px', color: 'var(--dim)' }}>{text.length} chars · Text is not stored</span>
              <button onClick={analyze} disabled={loading} className="btn-primary" style={{ padding: '11px 28px', fontSize: '13px', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer', borderColor: 'rgba(94,234,212,0.45)', color: 'var(--teal)' }}>
                {loading ? '⟳ Analyzing...' : '🛠️ Fix My Contract →'}
              </button>
            </div>
          </div>
          {error && <div style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.06)', color: '#f87171', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}

          {/* Results */}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeUp 0.5s ease' }}>
              <ScoreBar score={result.overallScore} />

              <div style={{ padding: '24px', borderRadius: '14px', border: '1px solid rgba(125,211,252,0.12)', background: 'rgba(7,9,26,0.7)' }}>
                <p style={{ fontFamily: 'Gloock, serif', fontSize: '20px', color: 'var(--white)', lineHeight: 1.4, marginBottom: '10px' }}>{result.verdict}</p>
                <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.75 }}>{result.summary}</p>
              </div>

              {result.fixedClauses?.length > 0 && (
                <div>
                  <h3 style={{ fontFamily: 'Gloock, serif', fontSize: '22px', color: 'var(--white)', marginBottom: '16px' }}>🛠️ Fixed Clauses ({result.fixedClauses.length})</h3>
                  {result.fixedClauses.map((clause, i) => (
                    <div key={i} style={{ marginBottom: '12px', borderRadius: '12px', border: `1px solid ${sevColor(clause.severity)}25`, background: 'rgba(7,9,26,0.7)', overflow: 'hidden' }}>
                      <button onClick={() => setExpandedClause(expandedClause === i ? null : i)} style={{
                        width: '100%', textAlign: 'left', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: 700, color: sevColor(clause.severity), border: `1px solid ${sevColor(clause.severity)}40`, background: `${sevColor(clause.severity)}10`, fontFamily: 'Geist Mono, monospace' }}>{clause.severity}</span>
                          <strong style={{ fontSize: '14px', color: 'var(--white)' }}>{clause.title}</strong>
                        </div>
                        <span style={{ color: 'var(--sky)', fontSize: '18px', transform: expandedClause === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                      </button>
                      {expandedClause === i && (
                        <div style={{ padding: '0 20px 20px' }}>
                          <p style={{ fontSize: '13px', color: '#f87171', lineHeight: 1.65, marginBottom: '14px' }}>⚠️ Problem: {clause.problem}</p>
                          {clause.original && clause.original !== 'Not present' && (
                            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.1)', marginBottom: '12px' }}>
                              <p style={{ fontSize: '10px', color: '#f87171', marginBottom: '6px', fontFamily: 'Geist Mono, monospace', letterSpacing: '0.1em' }}>ORIGINAL</p>
                              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, fontFamily: 'IBM Plex Serif, serif', fontStyle: 'italic' }}>&ldquo;{clause.original}&rdquo;</p>
                            </div>
                          )}
                          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(94,234,212,0.05)', border: '1px solid rgba(94,234,212,0.15)' }}>
                            <p style={{ fontSize: '10px', color: 'var(--teal)', marginBottom: '6px', fontFamily: 'Geist Mono, monospace', letterSpacing: '0.1em' }}>FIXED CLAUSE</p>
                            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.75, fontFamily: 'IBM Plex Serif, serif' }}>{clause.fixed}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {result.paymentRisks?.length > 0 && (
                  <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(248,113,113,0.15)', background: 'rgba(248,113,113,0.03)' }}>
                    <h4 style={{ fontSize: '13px', color: '#f87171', fontFamily: 'Geist Mono, monospace', fontWeight: 700, marginBottom: '12px' }}>💰 Payment Risks</h4>
                    {result.paymentRisks.map((r, i) => <p key={i} style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '6px' }}>• {r}</p>)}
                  </div>
                )}
                {result.ipRisks?.length > 0 && (
                  <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(165,180,252,0.15)', background: 'rgba(165,180,252,0.03)' }}>
                    <h4 style={{ fontSize: '13px', color: 'var(--indigo)', fontFamily: 'Geist Mono, monospace', fontWeight: 700, marginBottom: '12px' }}>🧠 IP Risks</h4>
                    {result.ipRisks.map((r, i) => <p key={i} style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '6px' }}>• {r}</p>)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
