'use client'

import { useState } from 'react'

const VISA_OPTIONS = [
  { code: '', label: 'Let AI recommend best fit' },
  { code: 'H-1B', label: 'H-1B — Specialty Occupation' },
  { code: 'L-1A', label: 'L-1A — Intracompany Manager/Executive' },
  { code: 'L-1B', label: 'L-1B — Intracompany Specialized Knowledge' },
  { code: 'O-1A', label: 'O-1A — Extraordinary Ability' },
  { code: 'EB-1A', label: 'EB-1A — Extraordinary Ability (Green Card)' },
  { code: 'EB-2 NIW', label: 'EB-2 NIW — National Interest Waiver' },
  { code: 'EB-5', label: 'EB-5 — Immigrant Investor' },
]

type State = 'form' | 'loading' | 'result' | 'error'

export default function IntakeClient() {
  const [state, setState] = useState<State>('form')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    visa_preference: '',
    petitioner_name: '',
    beneficiary_name: '',
    beneficiary_nationality: '',
    beneficiary_education: '',
    position_title: '',
    position_duties: '',
    salary: '',
    additional_context: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    try {
      const res = await fetch('/api/verticals/immigration/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, consent_timestamp: new Date().toISOString() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Draft failed')
      setResult(data)
      setState('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setState('error')
    }
  }

  const field = (key: keyof typeof form, label: string, required = false, multiline = false) => (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
        {label}{required && ' *'}
      </label>
      {multiline ? (
        <textarea
          value={form[key]}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          required={required}
          rows={3}
          style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid var(--bl-border, #d0d0d0)', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box' }}
        />
      ) : (
        <input
          type="text"
          value={form[key]}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          required={required}
          style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid var(--bl-border, #d0d0d0)', fontSize: '0.95rem', boxSizing: 'border-box' }}
        />
      )}
    </div>
  )

  if (state === 'loading') {
    return <div style={{ textAlign: 'center', padding: '3rem' }}><p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Drafting petition...</p><p style={{ color: 'var(--bl-text-muted, #888)' }}>Analyzing eligibility and generating citations.</p></div>
  }

  if (state === 'result' && result) {
    return (
      <div style={{ maxWidth: 700 }}>
        <div style={{ padding: '1.5rem', borderRadius: 10, border: '1px solid var(--bl-border, #e2e2e2)', background: 'var(--bl-surface, #fff)', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>Recommended: {result.recommended_visa as string}</h3>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{result.eligibility_assessment as string}</p>
        </div>
        <div style={{ padding: '1.5rem', borderRadius: 10, border: '1px solid var(--bl-border, #e2e2e2)', background: 'var(--bl-surface, #fff)', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.75rem', fontWeight: 700 }}>Petition Draft</h3>
          <div style={{ fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{result.petition_draft as string}</div>
        </div>
        <a href={`/dashboard/reports/${result.report_id}`} style={{ display: 'inline-block', padding: '0.6rem 1.5rem', borderRadius: 8, background: 'var(--bl-accent, #2563eb)', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
          View Full Report
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Visa Category</label>
        <select
          value={form.visa_preference}
          onChange={e => setForm({ ...form, visa_preference: e.target.value })}
          style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid var(--bl-border, #d0d0d0)', fontSize: '0.95rem', boxSizing: 'border-box' }}
        >
          {VISA_OPTIONS.map(v => <option key={v.code} value={v.code}>{v.label}</option>)}
        </select>
      </div>
      {field('petitioner_name', 'Petitioner (Employer) Name')}
      {field('beneficiary_name', 'Beneficiary Name', true)}
      {field('beneficiary_nationality', 'Beneficiary Nationality', true)}
      {field('beneficiary_education', 'Education (Degree, Field, University)')}
      {field('position_title', 'Position Title', true)}
      {field('position_duties', 'Position Duties', true, true)}
      {field('salary', 'Annual Salary')}
      {field('additional_context', 'Additional Context', false, true)}
      {state === 'error' && <p style={{ color: 'var(--bl-danger, #dc2626)', marginBottom: '1rem' }}>{error}</p>}
      <button type="submit" style={{ padding: '0.75rem 2rem', borderRadius: 8, border: 'none', background: 'var(--bl-accent, #2563eb)', color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
        Draft Petition
      </button>
    </form>
  )
}
