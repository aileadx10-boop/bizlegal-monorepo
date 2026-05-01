'use client'
import { useState } from 'react'
import Link from 'next/link'

interface DebtResult {
  subject: string; letter: string; tone: string
  keyPoints: string[]; nextSteps: string[]; legalNotes: string[]
  recommendedDeadline: string; escalationPath: string
}

const JURISDICTIONS = [
  'United Kingdom', 'United States', 'European Union', 'UAE / Dubai', 'Singapore',
  'Australia', 'Canada', 'Brazil', 'France', 'Germany', 'India', 'International',
]

const LETTER_TYPES = [
  { value: 'first_notice', label: 'First Reminder (Friendly)' },
  { value: 'second_notice', label: 'Second Notice (Firm)' },
  { value: 'final_demand', label: 'Final Demand' },
  { value: 'legal_notice', label: 'Pre-Legal Notice' },
]

const CURRENCIES = ['USD', 'GBP', 'EUR', 'AED', 'SGD', 'AUD', 'CAD', 'BRL', 'INR']

export default function DebtCollectionPage() {
  const [form, setForm] = useState({
    creditorName: '', creditorAddress: '',
    debtorName: '', debtorAddress: '',
    amount: '', currency: 'USD', dueDate: '', invoiceNumber: '',
    jurisdiction: 'United Kingdom', letterType: 'first_notice',
    additionalContext: '', lang: 'en' as 'en' | 'pt' | 'es',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DebtResult | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function generate() {
    if (!form.creditorName || !form.debtorName || !form.amount) {
      setError('Please fill in creditor name, debtor name, and amount.'); return
    }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/tools/debt-collection', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Generation failed.'); return }
      setResult(data)
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  function copy() {
    if (!result) return
    navigator.clipboard.writeText(result.letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '8px',
    border: '1px solid var(--border2)', background: 'rgba(4,6,14,0.7)',
    color: 'var(--white)', fontSize: '13px', fontFamily: 'Geist Mono, monospace',
    outline: 'none',
  } as const

  const labelStyle = { fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '6px', fontFamily: 'Geist Mono, monospace' } as const

  const toneColor = (t: string) => ({ FRIENDLY: 'var(--teal)', FIRM: '#fbbf24', FORMAL: 'var(--sky)', LEGAL: '#f87171' })[t] ?? 'var(--muted)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingTop: '36px' }}>
      <div style={{ background: 'rgba(7,9,26,0.95)', borderBottom: '1px solid rgba(125,211,252,0.08)' }}>
        <div className="container" style={{ paddingTop: '20px', paddingBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/tools" style={{ color: 'var(--muted)', fontSize: '13px', fontFamily: 'Geist Mono, monospace' }}>← Tools</Link>
          <span style={{ color: 'var(--border)', fontSize: '13px' }}>/</span>
          <span style={{ color: 'var(--teal)', fontSize: '13px', fontFamily: 'Geist Mono, monospace' }}>Debt Collection</span>
        </div>
      </div>

      <div className="section" style={{ paddingTop: '60px', paddingBottom: '40px' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: '20px' }}>
              <span className="bdot" />&nbsp;Free Tool · EN · PT · ES
            </div>
            <h1 className="sh" style={{ marginBottom: '14px' }}>Debt Collection <em>Letter Generator</em></h1>
            <p className="sdesc" style={{ margin: '0 auto' }}>Generate professional, jurisdiction-compliant debt collection letters in seconds. From friendly reminders to pre-litigation demands — in 3 languages.</p>
          </div>

          {/* Form */}
          <div style={{ background: 'rgba(7,9,26,0.7)', border: '1px solid rgba(94,234,212,0.15)', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
            {/* Language + Letter Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>Language</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['en', 'pt', 'es'] as const).map(l => (
                    <button key={l} onClick={() => set('lang', l)} style={{
                      flex: 1, padding: '10px', borderRadius: '8px', fontSize: '11px', fontFamily: 'Geist Mono, monospace', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase',
                      background: form.lang === l ? 'rgba(94,234,212,0.12)' : 'transparent',
                      border: `1px solid ${form.lang === l ? 'rgba(94,234,212,0.4)' : 'var(--border2)'}`,
                      color: form.lang === l ? 'var(--teal)' : 'var(--muted)',
                    }}>{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Letter Type</label>
                <select value={form.letterType} onChange={e => set('letterType', e.target.value)} style={{ ...inputStyle }}>
                  {LETTER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Jurisdiction</label>
                <select value={form.jurisdiction} onChange={e => set('jurisdiction', e.target.value)} style={{ ...inputStyle }}>
                  {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
            </div>

            {/* Creditor */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', color: 'var(--sky)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'Geist Mono, monospace', fontWeight: 700 }}>Your Details (Creditor)</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={labelStyle}>Name / Company *</label><input type="text" value={form.creditorName} onChange={e => set('creditorName', e.target.value)} placeholder="Your name or company" style={inputStyle} /></div>
                <div><label style={labelStyle}>Address</label><input type="text" value={form.creditorAddress} onChange={e => set('creditorAddress', e.target.value)} placeholder="Your address (optional)" style={inputStyle} /></div>
              </div>
            </div>

            {/* Debtor */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', color: '#f87171', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'Geist Mono, monospace', fontWeight: 700 }}>Debtor Details</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={labelStyle}>Name / Company *</label><input type="text" value={form.debtorName} onChange={e => set('debtorName', e.target.value)} placeholder="Debtor name or company" style={inputStyle} /></div>
                <div><label style={labelStyle}>Address</label><input type="text" value={form.debtorAddress} onChange={e => set('debtorAddress', e.target.value)} placeholder="Debtor address (optional)" style={inputStyle} /></div>
              </div>
            </div>

            {/* Debt Details */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', color: 'var(--teal)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'Geist Mono, monospace', fontWeight: 700 }}>Debt Details</p>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Currency</label>
                  <select value={form.currency} onChange={e => set('currency', e.target.value)} style={{ ...inputStyle }}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Amount Owed *</label><input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="10000" style={inputStyle} /></div>
                <div><label style={labelStyle}>Original Due Date</label><input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Invoice / Ref No.</label><input type="text" value={form.invoiceNumber} onChange={e => set('invoiceNumber', e.target.value)} placeholder="INV-001" style={inputStyle} /></div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Additional context (optional)</label>
              <textarea
                value={form.additionalContext} onChange={e => set('additionalContext', e.target.value)}
                placeholder="e.g. 'Services were completed on Jan 15. Client acknowledged receipt but has not paid. Previous informal reminder ignored.'"
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={generate} disabled={loading} className="btn-primary" style={{ padding: '12px 32px', fontSize: '14px', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer', borderColor: 'rgba(94,234,212,0.45)', color: 'var(--teal)' }}>
                {loading ? '⟳ Generating...' : '📬 Generate Letter →'}
              </button>
            </div>
          </div>
          {error && <div style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.06)', color: '#f87171', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}

          {/* Result */}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeUp 0.5s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: 'Gloock, serif', fontSize: '22px', color: 'var(--white)' }}>Generated Letter</h3>
                  <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, fontFamily: 'Geist Mono, monospace', color: toneColor(result.tone), border: `1px solid ${toneColor(result.tone)}40`, background: `${toneColor(result.tone)}10` }}>{result.tone}</span>
                </div>
                <button onClick={copy} className="btn-ghost" style={{ fontSize: '13px' }}>
                  {copied ? '✓ Copied!' : '📋 Copy Letter'}
                </button>
              </div>

              <div style={{ padding: '28px', borderRadius: '14px', border: '1px solid rgba(125,211,252,0.12)', background: 'rgba(7,9,26,0.8)', fontFamily: 'IBM Plex Serif, serif' }}>
                <div style={{ fontSize: '13px', color: 'var(--sky)', fontFamily: 'Geist Mono, monospace', fontWeight: 700, marginBottom: '16px', letterSpacing: '0.05em' }}>Re: {result.subject}</div>
                <pre style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.9, whiteSpace: 'pre-wrap', fontFamily: 'IBM Plex Serif, serif' }}>{result.letter}</pre>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {result.nextSteps?.length > 0 && (
                  <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(125,211,252,0.12)', background: 'rgba(7,9,26,0.6)' }}>
                    <h4 style={{ fontSize: '13px', color: 'var(--sky)', fontFamily: 'Geist Mono, monospace', fontWeight: 700, marginBottom: '12px' }}>⚡ Next Steps</h4>
                    {result.nextSteps.map((s, i) => <p key={i} style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '6px' }}>• {s}</p>)}
                  </div>
                )}
                {result.legalNotes?.length > 0 && (
                  <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(251,191,36,0.15)', background: 'rgba(251,191,36,0.03)' }}>
                    <h4 style={{ fontSize: '13px', color: '#fbbf24', fontFamily: 'Geist Mono, monospace', fontWeight: 700, marginBottom: '12px' }}>⚠️ Legal Notes</h4>
                    {result.legalNotes.map((n, i) => <p key={i} style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '6px' }}>• {n}</p>)}
                  </div>
                )}
              </div>

              <div style={{ padding: '16px 20px', borderRadius: '10px', border: '1px solid rgba(94,234,212,0.15)', background: 'rgba(94,234,212,0.03)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div><span style={{ fontSize: '11px', color: 'var(--teal)' }}>Deadline: </span><span style={{ fontSize: '13px', color: 'var(--text)' }}>{result.recommendedDeadline}</span></div>
                <div><span style={{ fontSize: '11px', color: 'var(--teal)' }}>Escalation: </span><span style={{ fontSize: '13px', color: 'var(--text)' }}>{result.escalationPath}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
