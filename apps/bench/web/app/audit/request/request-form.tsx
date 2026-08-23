'use client'

import { useState, type FormEvent } from 'react'

const SEGMENTS = [
  { value: 'legal_ai_vendor', label: 'Legal-AI vendor' },
  { value: 'compliance_software', label: 'Compliance software' },
  { value: 'law_firm', label: 'Law firm / in-house' },
  { value: 'ai_lab', label: 'AI lab / diligence' },
  { value: 'other', label: 'Other' },
] as const

const JURISDICTIONS = ['EU', 'UK', 'UAE', 'Multi-jurisdiction', 'Other'] as const

const ACCESS_MODES = [
  { value: 'api', label: 'API access we can run against' },
  { value: 'output_upload', label: 'We will upload model outputs' },
  { value: 'public_interface', label: 'Public interface / demo' },
  { value: 'unsure', label: 'Not sure yet' },
] as const

export function AuditRequestForm() {
  const [status, setStatus] = useState<'idle' | 'working' | 'ok' | 'err'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('working')
    setError('')
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    try {
      const res = await fetch('/api/audit/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const payload = (await res.json()) as { ok?: boolean; error?: string }
      if (res.ok && payload.ok) {
        setStatus('ok')
        form.reset()
      } else {
        setStatus('err')
        setError(payload.error ?? 'request_failed')
      }
    } catch {
      setStatus('err')
      setError('network_error')
    }
  }

  if (status === 'ok') {
    return (
      <div className="readout">
        <p className="readout__title"><span>Request received</span></p>
        <p className="prose small" style={{ margin: 0 }}>
          Thank you — your request is in the intake queue and a confirmation is
          on its way to your inbox. We reply with a scoping note, typically
          within two business days.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="readout" aria-label="Audit request form">
      <p className="readout__title"><span>Audit request</span></p>

      <div className="field">
        <label htmlFor="email">Work email *</label>
        <input id="email" name="email" type="email" required maxLength={254} placeholder="you@company.com" />
      </div>

      <div className="field">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" maxLength={200} placeholder="Company or firm name" />
      </div>

      <div className="field">
        <label htmlFor="segment">You are *</label>
        <select id="segment" name="segment" required defaultValue="">
          <option value="" disabled>Select…</option>
          {SEGMENTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="product_area">What does the AI system do? *</label>
        <input
          id="product_area"
          name="product_area"
          type="text"
          required
          maxLength={300}
          placeholder="e.g. contract review, regulatory Q&A, legal research"
        />
      </div>

      <div className="field">
        <label htmlFor="jurisdiction">Target jurisdiction *</label>
        <select id="jurisdiction" name="jurisdiction" required defaultValue="">
          <option value="" disabled>Select…</option>
          {JURISDICTIONS.map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="practice_area">Practice area *</label>
        <input
          id="practice_area"
          name="practice_area"
          type="text"
          required
          maxLength={200}
          placeholder="e.g. MiCA / digital assets, data protection, employment"
        />
      </div>

      <div className="field">
        <label htmlFor="model_access">How would we evaluate it? *</label>
        <select id="model_access" name="model_access" required defaultValue="">
          <option value="" disabled>Select…</option>
          {ACCESS_MODES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="message">Anything else</label>
        <textarea id="message" name="message" rows={4} maxLength={2000} placeholder="Context, timelines, constraints" />
      </div>

      <button type="submit" className="btn btn--primary" disabled={status === 'working'}>
        {status === 'working' ? 'Submitting…' : 'Submit request'}
      </button>

      {status === 'err' ? (
        <p className="form-status form-status--err" role="alert">
          {error === 'rate_limited'
            ? 'Too many requests from this address right now — please try again in a few minutes.'
            : 'Something went wrong. Email team@bizlegal-ai.com and we will pick it up.'}
        </p>
      ) : null}
    </form>
  )
}
