'use client'
import { useState } from 'react'
import Link from 'next/link'

interface ComplianceArea { score: number; status: string; issues: string[]; fixes: string[] }
interface ComplianceResult {
  overallScore: number; complianceLevel: string; summary: string
  gdpr: ComplianceArea; ccpa: ComplianceArea; cookies: ComplianceArea; accessibility: ComplianceArea; privacyPolicy: ComplianceArea
  topPriorities: string[]; estimatedFineRisk: string; verdict: string
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    PASS:    { color: 'var(--teal)',   bg: 'rgba(94,234,212,0.1)' },
    FAIL:    { color: '#f87171',        bg: 'rgba(248,113,113,0.1)' },
    PARTIAL: { color: '#fbbf24',        bg: 'rgba(251,191,36,0.1)' },
  }
  const s = map[status] ?? { color: 'var(--muted)', bg: 'rgba(125,211,252,0.05)' }
  return <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em', color: s.color, background: s.bg, border: `1px solid ${s.color}30` }}>{status}</span>
}

function AreaCard({ title, area }: { title: string; area: ComplianceArea }) {
  const [open, setOpen] = useState(false)
  const c = area.score >= 70 ? 'var(--teal)' : area.score >= 40 ? '#fbbf24' : '#f87171'
  return (
    <div style={{ borderRadius: '12px', border: '1px solid rgba(125,211,252,0.1)', background: 'rgba(7,9,26,0.6)', overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${c}10`, border: `1px solid ${c}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Gloock, serif', fontSize: '16px', color: c, fontWeight: 700 }}>{area.score}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', color: 'var(--white)', fontWeight: 600, marginBottom: '2px' }}>{title}</div>
          <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(125,211,252,0.08)', overflow: 'hidden', width: '100%' }}>
            <div style={{ height: '100%', width: `${area.score}%`, background: c, borderRadius: '2px' }} />
          </div>
        </div>
        <StatusBadge status={area.status} />
        <span style={{ color: 'var(--muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', fontSize: '14px' }}>▼</span>
      </button>
      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(125,211,252,0.05)' }}>
          {area.issues?.length > 0 && (
            <div style={{ marginTop: '14px' }}>
              <p style={{ fontSize: '11px', color: '#f87171', marginBottom: '8px', fontFamily: 'Geist Mono, monospace', fontWeight: 700, letterSpacing: '0.1em' }}>ISSUES</p>
              {area.issues.map((iss, i) => <p key={i} style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '5px' }}>• {iss}</p>)}
            </div>
          )}
          {area.fixes?.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '11px', color: 'var(--teal)', marginBottom: '8px', fontFamily: 'Geist Mono, monospace', fontWeight: 700, letterSpacing: '0.1em' }}>FIXES</p>
              {area.fixes.map((fix, i) => <p key={i} style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '5px' }}>✓ {fix}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function WebsiteCompliancePage() {
  const [url, setUrl] = useState('')
  const [context, setContext] = useState('')
  const [lang, setLang] = useState<'en' | 'pt' | 'es'>('en')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ComplianceResult | null>(null)
  const [error, setError] = useState('')

  async function scan() {
    const trimmed = url.trim()
    if (!trimmed || (!trimmed.startsWith('http://') && !trimmed.startsWith('https://'))) {
      setError('Please enter a valid URL starting with https://'); return
    }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/tools/website-compliance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed, context, lang }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Analysis failed.'); return }
      setResult(data)
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  const scoreColor = result ? (result.overallScore >= 70 ? 'var(--teal)' : result.overallScore >= 40 ? '#fbbf24' : '#f87171') : 'var(--sky)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingTop: '36px' }}>
      <div style={{ background: 'rgba(7,9,26,0.95)', borderBottom: '1px solid rgba(125,211,252,0.08)' }}>
        <div className="container" style={{ paddingTop: '20px', paddingBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/tools" style={{ color: 'var(--muted)', fontSize: '13px', fontFamily: 'Geist Mono, monospace' }}>← Tools</Link>
          <span style={{ color: 'var(--border)', fontSize: '13px' }}>/</span>
          <span style={{ color: 'var(--indigo)', fontSize: '13px', fontFamily: 'Geist Mono, monospace' }}>Website Compliance</span>
        </div>
      </div>

      <div className="section" style={{ paddingTop: '60px', paddingBottom: '40px' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: '20px' }}>
              <span className="bdot" />&nbsp;Free Tool · GDPR · CCPA · ADA
            </div>
            <h1 className="sh" style={{ marginBottom: '14px' }}>AI Website <em>Compliance Checker</em></h1>
            <p className="sdesc" style={{ margin: '0 auto' }}>Enter any website URL. Scan for GDPR, CCPA, ADA/WCAG, ePrivacy, and cookie compliance issues. Get a compliance score and actionable fixes.</p>
          </div>

          {/* Input */}
          <div style={{ background: 'rgba(7,9,26,0.7)', border: '1px solid rgba(165,180,252,0.15)', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
              <label style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'Geist Mono, monospace' }}>Website URL to scan:</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['en', 'pt', 'es'] as const).map(l => (
                  <button key={l} onClick={() => setLang(l)} style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontFamily: 'Geist Mono, monospace', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase',
                    background: lang === l ? 'rgba(165,180,252,0.12)' : 'transparent',
                    border: `1px solid ${lang === l ? 'rgba(165,180,252,0.4)' : 'var(--border2)'}`,
                    color: lang === l ? 'var(--indigo)' : 'var(--muted)',
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <input
              type="url" value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              style={{
                width: '100%', padding: '14px 16px', borderRadius: '10px',
                border: '1px solid var(--border2)', background: 'rgba(4,6,14,0.7)',
                color: 'var(--white)', fontSize: '14px', fontFamily: 'Geist Mono, monospace', outline: 'none',
                marginBottom: '12px',
              }}
            />
            <textarea
              value={context} onChange={e => setContext(e.target.value)}
              placeholder="Optional: describe your website (e.g. 'B2B SaaS targeting EU businesses, collects email addresses, uses Google Analytics')"
              style={{
                width: '100%', minHeight: '80px', padding: '12px 16px', borderRadius: '10px',
                border: '1px solid var(--border2)', background: 'rgba(4,6,14,0.7)',
                color: 'var(--white)', fontSize: '13px', fontFamily: 'Geist Mono, monospace', resize: 'vertical', outline: 'none', lineHeight: 1.65,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
              <span style={{ fontSize: '11px', color: 'var(--dim)' }}>Scans: GDPR · CCPA · ADA · ePrivacy · Cookies · Privacy Policy</span>
              <button onClick={scan} disabled={loading} className="btn-primary" style={{ padding: '11px 28px', fontSize: '13px', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer', borderColor: 'rgba(165,180,252,0.45)', color: 'var(--indigo)' }}>
                {loading ? '⟳ Scanning...' : '🌐 Check Compliance →'}
              </button>
            </div>
          </div>
          {error && <div style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.06)', color: '#f87171', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}

          {/* Results */}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeUp 0.5s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '20px' }}>
                <div style={{ textAlign: 'center', padding: '28px 20px', borderRadius: '14px', border: '1px solid rgba(125,211,252,0.12)', background: 'rgba(7,9,26,0.7)' }}>
                  <div style={{ fontFamily: 'Gloock, serif', fontSize: '64px', color: scoreColor, lineHeight: 1, marginBottom: '8px' }}>{result.overallScore}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Score</div>
                  <div style={{ padding: '5px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, fontFamily: 'Geist Mono, monospace', color: scoreColor, border: `1px solid ${scoreColor}40`, background: `${scoreColor}10` }}>{result.complianceLevel}</div>
                </div>
                <div style={{ padding: '24px', borderRadius: '14px', border: '1px solid rgba(125,211,252,0.12)', background: 'rgba(7,9,26,0.7)' }}>
                  <p style={{ fontFamily: 'Gloock, serif', fontSize: '20px', color: 'var(--white)', lineHeight: 1.4, marginBottom: '10px' }}>{result.verdict}</p>
                  <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.75, marginBottom: '14px' }}>{result.summary}</p>
                  <div style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.04)', fontSize: '12px', color: '#fbbf24' }}>
                    ⚠️ Fine Risk: {result.estimatedFineRisk}
                  </div>
                </div>
              </div>

              <h3 style={{ fontFamily: 'Gloock, serif', fontSize: '22px', color: 'var(--white)' }}>Compliance Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <AreaCard title="GDPR (EU)" area={result.gdpr} />
                <AreaCard title="CCPA (California)" area={result.ccpa} />
                <AreaCard title="Cookie Compliance" area={result.cookies} />
                <AreaCard title="ADA / WCAG Accessibility" area={result.accessibility} />
                <AreaCard title="Privacy Policy" area={result.privacyPolicy} />
              </div>

              {result.topPriorities?.length > 0 && (
                <div style={{ padding: '24px', borderRadius: '14px', border: '1px solid rgba(248,113,113,0.15)', background: 'rgba(248,113,113,0.03)' }}>
                  <h3 style={{ fontSize: '14px', color: '#f87171', fontFamily: 'Geist Mono, monospace', fontWeight: 700, marginBottom: '14px' }}>🔴 Top Priorities</h3>
                  {result.topPriorities.map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: '1px solid rgba(125,211,252,0.04)' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#f8717115', border: '1px solid #f8717140', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#f87171', fontWeight: 700, flexShrink: 0 }}>{i+1}</span>
                      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65 }}>{p}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '24px', padding: '24px 28px', borderRadius: '12px', border: '1px solid rgba(37,99,235,0.2)', background: 'rgba(37,99,235,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(125,211,252,0.6)', fontFamily: 'Geist Mono, monospace', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Automate compliance monitoring for your site</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>LexAudit Compliance Health Score — $99/mo</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>60-signal monthly scan covering GDPR, CCPA, SOC 2, ISO 27001, and cookie/consent requirements.</div>
              </div>
              <a href="https://lexaudit.bizlegal-ai.com" style={{ display: 'inline-block', background: '#2563eb', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>Get Your Score →</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
