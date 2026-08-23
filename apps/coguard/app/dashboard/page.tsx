'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ClassificationResult {
  hostility_score: number
  urgency_score: number
  logistics_score: number
  biff_needed: boolean
  flags: string[]
}

interface DraftResult {
  draft_id: string
  classification: ClassificationResult
  raw_draft: string
  biff_text: string | null
  changes_summary: string | null
}

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const color = score > 0.6 ? '#dc2626' : score > 0.3 ? '#d97706' : '#059669'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ color: '#6b7280' }}>{label}</span>
      <span style={{ fontWeight: 600, color }}>{Math.round(score * 100)}%</span>
    </div>
  )
}

export default function DashboardPage() {
  const [draft, setDraft] = useState('')
  const [toEmail, setToEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<DraftResult | null>(null)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    setSent(false)
    try {
      const res = await fetch('/api/messages/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_draft: draft }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Analysis failed')
      }
      setResult(await res.json() as DraftResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    if (!result) return
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft_id: result.draft_id, to_email: toEmail, subject }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Send failed')
      }
      setSent(true)
      setResult(null)
      setDraft('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send error')
    } finally {
      setSending(false)
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(2rem, 4vw, 3rem) 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Compose & Send</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/dashboard/binders" style={{ fontSize: 14, color: '#374151', textDecoration: 'none', padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 6 }}>
            Court Binders
          </Link>
          <Link href="/dashboard/settings" style={{ fontSize: 14, color: '#374151', textDecoration: 'none', padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 6 }}>
            Settings
          </Link>
        </div>
      </div>

      {sent && (
        <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 10, padding: 16, color: '#065f46', marginBottom: 20 }}>
          Message sent and logged with SHA-256 fingerprint. ✓
        </div>
      )}

      {!result ? (
        <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Your draft</label>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={8}
              placeholder="Type your reply here. CoGuard will analyze the tone and suggest a BIFF version if needed."
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
            />
          </div>
          {error && <p style={{ color: '#dc2626', fontSize: 14, margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !draft.trim()}
            style={{ alignSelf: 'flex-start', background: '#111827', color: '#fff', padding: '12px 24px', borderRadius: 8, fontWeight: 600, fontSize: 15, border: 'none', cursor: loading || !draft.trim() ? 'not-allowed' : 'pointer', opacity: loading || !draft.trim() ? 0.6 : 1 }}
          >
            {loading ? 'Analyzing…' : 'Analyze & Neutralize →'}
          </button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Scores */}
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <ScoreBadge score={result.classification.hostility_score} label="Hostility" />
            <ScoreBadge score={result.classification.urgency_score} label="Urgency" />
            <ScoreBadge score={result.classification.logistics_score} label="Logistics" />
            {result.classification.biff_needed && (
              <div style={{ marginLeft: 'auto', background: '#fef3c7', color: '#92400e', borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
                BIFF recommended
              </div>
            )}
          </div>

          {/* Side-by-side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            <div style={{ border: '1px solid #fecdd3', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', letterSpacing: '0.1em', marginBottom: 10 }}>ORIGINAL</div>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>{result.raw_draft}</p>
            </div>
            {result.biff_text ? (
              <div style={{ border: '1px solid #a7f3d0', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', letterSpacing: '0.1em', marginBottom: 10 }}>BIFF VERSION</div>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>{result.biff_text}</p>
                {result.changes_summary && <p style={{ fontSize: 12, color: '#6b7280', marginTop: 10, padding: '8px', background: '#f9fafb', borderRadius: 6 }}>{result.changes_summary}</p>}
              </div>
            ) : (
              <div style={{ border: '1px solid #a7f3d0', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#059669', fontWeight: 600, margin: 0 }}>✓ Message tone is appropriate</p>
              </div>
            )}
          </div>

          {/* Send form */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Send message</h3>
            <input type="email" value={toEmail} onChange={e => setToEmail(e.target.value)} placeholder="Recipient email" style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }} />
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject line" style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }} />
            {error && <p style={{ color: '#dc2626', fontSize: 14, margin: 0 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleSend}
                disabled={sending || !toEmail}
                style={{ background: '#111827', color: '#fff', padding: '10px 20px', borderRadius: 7, fontWeight: 600, fontSize: 14, border: 'none', cursor: sending || !toEmail ? 'not-allowed' : 'pointer', opacity: sending || !toEmail ? 0.6 : 1 }}
              >
                {sending ? 'Sending…' : `Send ${result.biff_text ? 'BIFF version' : 'message'} →`}
              </button>
              <button onClick={() => setResult(null)} style={{ background: 'transparent', color: '#6b7280', padding: '10px 20px', borderRadius: 7, fontSize: 14, border: '1px solid #e5e7eb', cursor: 'pointer' }}>
                Edit draft
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
