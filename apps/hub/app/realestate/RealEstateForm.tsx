'use client'

import { useState } from 'react'

const BUDGET_BANDS = [
  '< $500K',
  '$500K – $2M',
  '$2M – $10M',
  '$10M+',
  'Confidential',
]
const JURISDICTIONS = ['UAE', 'Singapore', 'United States', 'European Union', 'United Kingdom', 'Cross-border', 'Other']
const DEAL_TYPES = ['Joint venture (JV)', 'Syndication', 'Family office structure', 'Lease / single asset', 'Other']
const TIMELINES = [
  'Active — moving in <30 days',
  'Next quarter',
  'Researching, no firm date',
  'Confidential',
]

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--secondary)',
  display: 'block',
  marginBottom: 6,
}

export function RealEstateForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [leadId, setLeadId] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setError(null)

    const fd = new FormData(e.currentTarget)
    const payload = {
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      jurisdiction: String(fd.get('jurisdiction') ?? ''),
      budget: String(fd.get('budget') ?? ''),
      deal_type: String(fd.get('deal_type') ?? ''),
      timeline: String(fd.get('timeline') ?? ''),
      message: String(fd.get('message') ?? '').trim(),
    }

    if (!payload.email.includes('@') || !payload.message) {
      setStatus('error')
      setError('Email and a short description of the matter are required.')
      return
    }

    try {
      const res = await fetch('/api/realestate-intake', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json().catch(() => ({}))) as { lead_id?: string; error?: string }
      if (!res.ok) {
        setStatus('error')
        setError(data.error || `Server returned ${res.status}.`)
        return
      }
      setLeadId(data.lead_id ?? null)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Network error — try again.')
    }
  }

  if (status === 'success') {
    return (
      <div
        style={{
          border: '1px solid var(--border)',
          padding: '32px',
          background: 'var(--surface)',
          borderRadius: 4,
        }}
      >
        <span className="section-label">Received</span>
        <h2 style={{ fontSize: 22, marginTop: 8, marginBottom: 12 }}>Thanks — we have your matter.</h2>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--on-surface)' }}>
          Our intelligence layer is classifying the opportunity now. If we have a
          fitting partner, we will introduce by email and CC you. If the matter
          is research-stage, we will reply with a scoping-memo proposal instead.
        </p>
        {leadId && (
          <p style={{ fontSize: 12, color: 'var(--secondary)', marginTop: 16 }}>
            Reference: <code>{leadId}</code>
          </p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={labelStyle}>Name</label>
        <input name="name" required placeholder="Your name" className="input" />
      </div>
      <div>
        <label style={labelStyle}>Email</label>
        <input name="email" type="email" required placeholder="you@firm.com" className="input" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Jurisdiction</label>
          <select name="jurisdiction" className="input" defaultValue="" required>
            <option value="" disabled>
              Select…
            </option>
            {JURISDICTIONS.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Budget band</label>
          <select name="budget" className="input" defaultValue="" required>
            <option value="" disabled>
              Select…
            </option>
            {BUDGET_BANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Deal type</label>
          <select name="deal_type" className="input" defaultValue="" required>
            <option value="" disabled>
              Select…
            </option>
            {DEAL_TYPES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Timeline</label>
          <select name="timeline" className="input" defaultValue="" required>
            <option value="" disabled>
              Select…
            </option>
            {TIMELINES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>The matter</label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="One paragraph: vehicle, jurisdiction(s), capital, what you need from a partner."
          className="input"
          style={{ resize: 'vertical' }}
        />
      </div>

      {status === 'error' && error && (
        <div
          style={{
            border: '1px solid var(--border)',
            padding: '10px 12px',
            background: 'var(--surface)',
            color: 'var(--secondary)',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn-cta"
        style={{ justifyContent: 'center' }}
        disabled={status === 'submitting'}
      >
        {status === 'submitting' ? 'Submitting…' : 'Route my matter →'}
      </button>

      <p style={{ fontSize: 11, color: 'var(--secondary)', lineHeight: 1.6, marginTop: 4 }}>
        By submitting, you consent to BizLegal-AI Intelligence classifying your
        matter and, if appropriate, introducing it to a vetted partner on a
        finder-fee basis under written disclosure. We do not act as your counsel
        for the underlying matter.
      </p>
    </form>
  )
}
