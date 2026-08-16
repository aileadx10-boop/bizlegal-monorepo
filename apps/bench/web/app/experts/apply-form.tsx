'use client'

import { useState, type FormEvent } from 'react'

const JURISDICTIONS = ['EU', 'UK', 'UAE', 'Other'] as const

export function ExpertApplyForm() {
  const [status, setStatus] = useState<'idle' | 'working' | 'ok' | 'err'>('idle')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('working')
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    try {
      const res = await fetch('/api/experts/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const payload = (await res.json()) as { ok?: boolean }
      if (res.ok && payload.ok) {
        setStatus('ok')
        form.reset()
      } else {
        setStatus('err')
      }
    } catch {
      setStatus('err')
    }
  }

  if (status === 'ok') {
    return (
      <div className="readout">
        <p className="readout__title"><span>Application received</span></p>
        <p className="prose small" style={{ margin: 0 }}>
          Thank you. A confirmation is on its way to your inbox. If your
          jurisdiction and practice areas match open bench capacity, the next
          email you receive is the paid test task.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="readout" aria-label="Expert application form">
      <p className="readout__title"><span>Apply to the bench</span></p>

      <div className="field">
        <label htmlFor="x-name">Full name *</label>
        <input id="x-name" name="full_name" type="text" required maxLength={160} />
      </div>

      <div className="field">
        <label htmlFor="x-email">Email *</label>
        <input id="x-email" name="email" type="email" required maxLength={254} />
      </div>

      <div className="field">
        <label htmlFor="x-jurisdiction">Primary jurisdiction *</label>
        <select id="x-jurisdiction" name="jurisdiction" required defaultValue="">
          <option value="" disabled>Select…</option>
          {JURISDICTIONS.map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="x-practice">Practice areas *</label>
        <input
          id="x-practice"
          name="practice_areas"
          type="text"
          required
          maxLength={300}
          placeholder="e.g. financial regulation, data protection"
        />
      </div>

      <div className="field">
        <label htmlFor="x-pqe">Years PQE *</label>
        <input id="x-pqe" name="pqe_years" type="number" min={0} max={60} required />
      </div>

      <div className="field">
        <label htmlFor="x-credentials">Credentials *</label>
        <textarea
          id="x-credentials"
          name="credentials"
          rows={3}
          required
          maxLength={1500}
          placeholder="Bar admission(s), current role, relevant specialisms"
        />
      </div>

      <div className="field">
        <label htmlFor="x-languages">Working languages</label>
        <input id="x-languages" name="languages" type="text" maxLength={200} placeholder="e.g. English, German" />
      </div>

      <div className="field">
        <label htmlFor="x-hours">Hours available / week</label>
        <input id="x-hours" name="availability_hours" type="number" min={1} max={40} />
      </div>

      <div className="field">
        <label htmlFor="x-sample">Writing sample URL</label>
        <input id="x-sample" name="sample_work_url" type="url" maxLength={500} placeholder="Optional — article, memo, publication" />
      </div>

      <button type="submit" className="btn btn--primary" disabled={status === 'working'}>
        {status === 'working' ? 'Submitting…' : 'Apply'}
      </button>

      {status === 'err' ? (
        <p className="form-status form-status--err" role="alert">
          Something went wrong. Email team@bizlegal-ai.com with
          &ldquo;Expert application&rdquo; in the subject.
        </p>
      ) : null}
    </form>
  )
}
