'use client'

import { useState } from 'react'

interface FormData {
  system_name: string
  system_purpose: string
  sector: string
  uses_biometrics: boolean
  interacts_with_public: boolean
  affects_employment: boolean
  affects_education: boolean
  affects_credit_or_insurance: boolean
  affects_law_enforcement: boolean
  affects_migration: boolean
  generates_deepfakes: boolean
}

const INITIAL: FormData = {
  system_name: '',
  system_purpose: '',
  sector: '',
  uses_biometrics: false,
  interacts_with_public: false,
  affects_employment: false,
  affects_education: false,
  affects_credit_or_insurance: false,
  affects_law_enforcement: false,
  affects_migration: false,
  generates_deepfakes: false,
}

const BOOLEAN_FIELDS: { key: keyof FormData; label: string }[] = [
  { key: 'uses_biometrics', label: 'Uses biometric identification (face, fingerprint, voice)?' },
  { key: 'interacts_with_public', label: 'Interacts directly with members of the public?' },
  { key: 'affects_employment', label: 'Used for recruitment, hiring, promotion, or termination decisions?' },
  { key: 'affects_education', label: 'Determines access to education or assesses student performance?' },
  { key: 'affects_credit_or_insurance', label: 'Assesses creditworthiness or insurance pricing?' },
  { key: 'affects_law_enforcement', label: 'Used in law enforcement (profiling, evidence assessment, sentencing)?' },
  { key: 'affects_migration', label: 'Used in migration, asylum, or border control decisions?' },
  { key: 'generates_deepfakes', label: 'Generates synthetic images, audio, or video (deepfakes)?' },
]

type State = 'form' | 'loading' | 'result' | 'error'

export default function QuestionnaireClient() {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [state, setState] = useState<State>('form')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.system_name || !form.system_purpose) return

    setState('loading')
    try {
      const res = await fetch('/api/verticals/ai-act/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionnaire: form, consent_timestamp: new Date().toISOString() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Classification failed')
      setResult(data)
      setState('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setState('error')
    }
  }

  if (state === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Classifying AI system...</p>
        <p style={{ color: 'var(--bl-text-muted, #888)' }}>Analyzing against EU AI Act requirements.</p>
      </div>
    )
  }

  if (state === 'result' && result) {
    const c = result.classification as Record<string, unknown>
    return (
      <div style={{ maxWidth: 700 }}>
        <div style={{
          padding: '1.5rem',
          borderRadius: 10,
          border: '1px solid var(--bl-border, #e2e2e2)',
          background: 'var(--bl-surface, #fff)',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>Risk Classification</h3>
            <span style={{
              padding: '0.3rem 1rem',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              background: c.risk_tier === 'unacceptable' ? '#fecaca' : c.risk_tier === 'high' ? '#fed7aa' : c.risk_tier === 'limited' ? '#fef3c7' : '#d1fae5',
              color: c.risk_tier === 'unacceptable' ? '#991b1b' : c.risk_tier === 'high' ? '#9a3412' : c.risk_tier === 'limited' ? '#92400e' : '#065f46',
            }}>
              {c.risk_tier as string}
            </span>
          </div>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{c.rationale as string}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--bl-text-muted, #888)', marginTop: '0.75rem' }}>
            <strong>Deadline:</strong> {c.deadline as string}
          </p>
        </div>

        {(c.required_actions as string[])?.length > 0 && (
          <div style={{ padding: '1.5rem', borderRadius: 10, border: '1px solid var(--bl-border, #e2e2e2)', background: 'var(--bl-surface, #fff)', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontWeight: 700 }}>Required Actions</h3>
            <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
              {(c.required_actions as string[]).map((a, i) => (
                <li key={i} style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>{a}</li>
              ))}
            </ol>
          </div>
        )}

        <a
          href={`/dashboard/reports/${result.report_id}`}
          style={{
            display: 'inline-block',
            padding: '0.6rem 1.5rem',
            borderRadius: 8,
            background: 'var(--bl-accent, #2563eb)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          View Full Report
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
          AI System Name *
        </label>
        <input
          type="text"
          value={form.system_name}
          onChange={e => setForm({ ...form, system_name: e.target.value })}
          required
          placeholder="e.g., Customer Churn Predictor"
          style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid var(--bl-border, #d0d0d0)', fontSize: '0.95rem', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
          System Purpose *
        </label>
        <textarea
          value={form.system_purpose}
          onChange={e => setForm({ ...form, system_purpose: e.target.value })}
          required
          rows={3}
          placeholder="Describe what the AI system does and how it's used..."
          style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid var(--bl-border, #d0d0d0)', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
          Industry Sector
        </label>
        <input
          type="text"
          value={form.sector}
          onChange={e => setForm({ ...form, sector: e.target.value })}
          placeholder="e.g., Financial Services, Healthcare, HR Tech"
          style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid var(--bl-border, #d0d0d0)', fontSize: '0.95rem', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>
          System Characteristics
        </p>
        {BOOLEAN_FIELDS.map(f => (
          <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem', fontSize: '0.9rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form[f.key] as boolean}
              onChange={e => setForm({ ...form, [f.key]: e.target.checked })}
              style={{ width: 18, height: 18, accentColor: 'var(--bl-accent, #2563eb)' }}
            />
            {f.label}
          </label>
        ))}
      </div>

      {state === 'error' && (
        <p style={{ color: 'var(--bl-danger, #dc2626)', marginBottom: '1rem' }}>{error}</p>
      )}

      <button
        type="submit"
        style={{
          padding: '0.75rem 2rem',
          borderRadius: 8,
          border: 'none',
          background: 'var(--bl-accent, #2563eb)',
          color: '#fff',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Classify AI System
      </button>
    </form>
  )
}
