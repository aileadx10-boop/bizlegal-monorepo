'use client'
import { useState } from 'react'
import Link from 'next/link'

interface RedFlag { clause: string; issue: string; severity: 'HIGH' | 'MEDIUM' | 'LOW'; fix: string }
interface ScanResult {
  riskScore: number
  riskLevel: string
  summary: string
  redFlags: RedFlag[]
  positives: string[]
  negotiationPoints: string[]
  missingClauses: string[]
  overallVerdict: string
}

function ScoreMeter({ score, level }: { score: number; level: string }) {
  const color = score >= 70 ? '#f87171' : score >= 40 ? '#fbbf24' : 'var(--teal)'
  return (
    <div style={{ textAlign: 'center', padding: '32px', borderRadius: '16px', border: '1px solid rgba(125,211,252,0.12)', background: 'rgba(7,9,26,0.7)' }}>
      <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 16px' }}>
        <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(125,211,252,0.08)" strokeWidth="10" />
          <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${score * 3.14} 314`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Gloock, serif', fontSize: '32px', color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.1em' }}>RISK</span>
        </div>
      </div>
      <div style={{ padding: '6px 16px', borderRadius: '100px', display: 'inline-block', fontSize: '12px', fontWeight: 700, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.1em', color, border: `1px solid ${color}40`, background: `${color}10` }}>{level}</div>
    </div>
  )
}

function SeverityBadge({ sev }: { sev: string }) {
  const c = sev === 'HIGH' ? '#f87171' : sev === 'MEDIUM' ? '#fbbf24' : 'var(--teal)'
  return <span style={{ padding: '2px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: 700, color: c, border: `1px solid ${c}40`, background: `${c}10`, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em' }}>{sev}</span>
}

export default function SaasRiskScannerPage() {
  const [text, setText] = useState('')
  const [lang, setLang] = useState<'en' | 'pt' | 'es'>('en')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')

  async function scan() {
    if (text.trim().length < 50) { setError('Please paste at least 50 characters of contract text.'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/tools/saas-scanner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Analysis failed.'); return }
      setResult(data)
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingTop: '36px' }}>
      <div style={{ background: 'rgba(7,9,26,0.95)', borderBottom: '1px solid rgba(125,211,252,0.08)' }}>
        <div className="container" style={{ paddingTop: '20px', paddingBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/tools" style={{ color: 'var(--muted)', fontSize: '13px', fontFamily: 'Geist Mono, monospace' }}>← Tools</Link>
          <span style={{ color: 'var(--border)', fontSize: '13px' }}>/</span>
          <span style={{ color: 'var(--sky)', fontSize: '13px', fontFamily: 'Geist Mono, monospace' }}>SaaS Risk Scanner</span>
        </div>
      </div>

      <div className="section" style={{ paddingTop: '60px', paddingBottom: '40px' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: '20px' }}>
              <span className="bdot" />&nbsp;Free Tool · Powered by Claude AI
            </div>
            <h1 className="sh" style={{ marginBottom: '14px' }}>SaaS Terms <em>Risk Scanner</em></h1>
            <p className="sdesc" style={{ margin: '0 auto' }}>Paste any SaaS contract, subscription terms, or service agreement. Get a risk score, red flags, negotiation points, and missing protections in 2&ndash;5 minutes.</p>
          </div>

          {/* Input */}
          <div style={{ background: 'rgba(7,9,26,0.7)', border: '1px solid rgba(125,211,252,0.12)', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
              <label style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'Geist Mono, monospace' }}>Paste contract or terms text:</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['en', 'pt', 'es'] as const).map(l => (
                  <button key={l} onClick={() => setLang(l)} style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontFamily: 'Geist Mono, monospace', fontWeight: 700,
                    cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase',
                    background: lang === l ? 'rgba(125,211,252,0.12)' : 'transparent',
                    border: `1px solid ${lang === l ? 'rgba(125,211,252,0.4)' : 'var(--border2)'}`,
                    color: lang === l ? 'var(--sky)' : 'var(--muted)',
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <textarea
              value={text} onChange={e => setText(e.target.value)}
              placeholder="Paste SaaS Terms of Service, subscription agreement, or any vendor contract here (min. 50 characters)..."
              style={{
                width: '100%', minHeight: '240px', padding: '16px', borderRadius: '10px',
                border: '1px solid var(--border2)', background: 'rgba(4,6,14,0.7)',
                color: 'var(--white)', fontSize: '13px', fontFamily: 'Geist Mono, monospace',
                resize: 'vertical', outline: 'none', lineHeight: 1.7,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
              <span style={{ fontSize: '11px', color: 'var(--dim)' }}>{text.length} chars · {loading ? 'Analyzing...' : 'Ready'}</span>
              <button onClick={scan} disabled={loading} className="btn-primary" style={{ padding: '11px 28px', fontSize: '13px', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? '⟳ Analyzing...' : '🔍 Scan Contract →'}
              </button>
            </div>
          </div>
          {error && <div style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.06)', color: '#f87171', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}

          {/* Results */}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeUp 0.5s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px', alignItems: 'start' }}>
                <ScoreMeter score={result.riskScore} level={result.riskLevel} />
                <div style={{ padding: '28px', borderRadius: '16px', border: '1px solid rgba(125,211,252,0.12)', background: 'rgba(7,9,26,0.7)' }}>
                  <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>Verdict</p>
                  <p style={{ fontFamily: 'Gloock, serif', fontSize: '20px', color: 'var(--white)', lineHeight: 1.4, marginBottom: '14px' }}>{result.overallVerdict}</p>
                  <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.75 }}>{result.summary}</p>
                </div>
              </div>

              {result.redFlags?.length > 0 && (
                <div style={{ padding: '28px', borderRadius: '16px', border: '1px solid rgba(248,113,113,0.15)', background: 'rgba(248,113,113,0.03)' }}>
                  <h3 style={{ fontFamily: 'Gloock, serif', fontSize: '20px', color: '#f87171', marginBottom: '18px' }}>🚩 Red Flags ({result.redFlags.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {result.redFlags.map((f, i) => (
                      <div key={i} style={{ padding: '16px', borderRadius: '10px', border: '1px solid rgba(248,113,113,0.1)', background: 'rgba(4,6,14,0.6)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <strong style={{ fontSize: '14px', color: 'var(--white)' }}>{f.clause}</strong>
                          <SeverityBadge sev={f.severity} />
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '8px' }}>{f.issue}</p>
                        <p style={{ fontSize: '12px', color: 'var(--teal)', lineHeight: 1.65 }}>💡 Fix: {f.fix}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {result.negotiationPoints?.length > 0 && (
                  <div style={{ padding: '24px', borderRadius: '14px', border: '1px solid rgba(125,211,252,0.12)', background: 'rgba(7,9,26,0.7)' }}>
                    <h3 style={{ fontSize: '14px', color: 'var(--sky)', marginBottom: '14px', fontFamily: 'Geist Mono, monospace', fontWeight: 700 }}>⚡ Negotiation Points</h3>
                    {result.negotiationPoints.map((p, i) => <p key={i} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '8px', paddingLeft: '12px', borderLeft: '2px solid rgba(125,211,252,0.2)' }}>{p}</p>)}
                  </div>
                )}
                {result.positives?.length > 0 && (
                  <div style={{ padding: '24px', borderRadius: '14px', border: '1px solid rgba(94,234,212,0.12)', background: 'rgba(7,9,26,0.7)' }}>
                    <h3 style={{ fontSize: '14px', color: 'var(--teal)', marginBottom: '14px', fontFamily: 'Geist Mono, monospace', fontWeight: 700 }}>✅ Positives</h3>
                    {result.positives.map((p, i) => <p key={i} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '8px', paddingLeft: '12px', borderLeft: '2px solid rgba(94,234,212,0.2)' }}>{p}</p>)}
                  </div>
                )}
              </div>

              {result.missingClauses?.length > 0 && (
                <div style={{ padding: '24px', borderRadius: '14px', border: '1px solid rgba(251,191,36,0.15)', background: 'rgba(251,191,36,0.03)' }}>
                  <h3 style={{ fontSize: '14px', color: '#fbbf24', marginBottom: '14px', fontFamily: 'Geist Mono, monospace', fontWeight: 700 }}>⚠️ Missing Clauses</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {result.missingClauses.map((c, i) => <span key={i} style={{ padding: '4px 12px', borderRadius: '100px', fontSize: '12px', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24', background: 'rgba(251,191,36,0.06)' }}>{c}</span>)}
                  </div>
                </div>
              )}

              <div style={{ padding: '24px 28px', borderRadius: '12px', border: '1px solid rgba(37,99,235,0.2)', background: 'rgba(37,99,235,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(125,211,252,0.6)', fontFamily: 'Geist Mono, monospace', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Track your compliance score continuously</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>LexAudit Compliance Health Score — $99/mo</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>60-signal automated scan. SOC 2, GDPR, CCPA, ISO 27001 gap detection. Monthly report card.</div>
                </div>
                <a href="https://lexaudit.bizlegal-ai.com" style={{ display: 'inline-block', background: '#2563eb', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>Get Your Score →</a>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <Link href="/guides/compliance-health-score-saas" style={{ fontSize: '12px', color: 'rgba(125,211,252,0.7)', textDecoration: 'none' }}>What is a Compliance Health Score? →</Link>
                <Link href="/guides/iso-27001-vs-soc2-guide" style={{ fontSize: '12px', color: 'rgba(125,211,252,0.7)', textDecoration: 'none' }}>ISO 27001 vs SOC 2 →</Link>
                <Link href="/guides" style={{ fontSize: '12px', color: 'rgba(125,211,252,0.7)', textDecoration: 'none' }}>All Guides →</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
