'use client'

import { useState } from 'react'

interface TemplateOption { code: string; label: string; desc: string }

type State = 'select' | 'form' | 'loading' | 'result' | 'error'

export default function GenerateClient({ templateTypes }: { templateTypes: TemplateOption[] }) {
  const [state, setState] = useState<State>('select')
  const [selected, setSelected] = useState<TemplateOption | null>(null)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    company_name: '',
    parent_jurisdiction: 'Delaware, USA',
    subsidiary_jurisdiction: 'Israel',
    business_description: '',
    additional_details: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setState('loading')
    try {
      const res = await fetch('/api/verticals/tech-transfer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_type: selected.code, ...form, consent_timestamp: new Date().toISOString() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data)
      setState('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setState('error')
    }
  }

  if (state === 'select') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {templateTypes.map(t => (
          <button
            key={t.code}
            onClick={() => { setSelected(t); setState('form') }}
            style={{
              padding: '1.25rem',
              borderRadius: 10,
              border: '1px solid var(--bl-border, #e2e2e2)',
              background: 'var(--bl-surface, #fff)',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>{t.label}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--bl-text-muted, #666)' }}>{t.desc}</div>
          </button>
        ))}
      </div>
    )
  }

  if (state === 'loading') {
    return <div style={{ textAlign: 'center', padding: '3rem' }}><p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Generating template...</p></div>
  }

  if (state === 'result' && result) {
    return (
      <div style={{ maxWidth: 700 }}>
        <div style={{ padding: '1.5rem', borderRadius: 10, border: '1px solid var(--bl-border, #e2e2e2)', background: 'var(--bl-surface, #fff)', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.75rem', fontWeight: 700 }}>{selected?.label}</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.6, fontFamily: 'var(--bl-font-mono, monospace)', background: '#f8f8f8', padding: '1rem', borderRadius: 8, maxHeight: 500, overflow: 'auto' }}>
            {result.generated_template as string}
          </pre>
        </div>
        {(result.compliance_checklist as string[])?.length > 0 && (
          <div style={{ padding: '1.5rem', borderRadius: 10, border: '1px solid var(--bl-border, #e2e2e2)', background: 'var(--bl-surface, #fff)', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontWeight: 700 }}>Compliance Checklist</h3>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              {(result.compliance_checklist as string[]).map((c, i) => <li key={i} style={{ marginBottom: '0.4rem', fontSize: '0.9rem' }}>{c}</li>)}
            </ul>
          </div>
        )}
        <a href={`/dashboard/reports/${result.report_id}`} style={{ display: 'inline-block', padding: '0.6rem 1.5rem', borderRadius: 8, background: 'var(--bl-accent, #2563eb)', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
          View Full Report
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
      <p style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Template: {selected?.label}</p>
      {[
        { key: 'company_name', label: 'Company Name', required: true },
        { key: 'parent_jurisdiction', label: 'Parent Jurisdiction' },
        { key: 'subsidiary_jurisdiction', label: 'Subsidiary Jurisdiction' },
      ].map(f => (
        <div key={f.key} style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>{f.label}{f.required && ' *'}</label>
          <input
            type="text"
            value={form[f.key as keyof typeof form]}
            onChange={e => setForm({ ...form, [f.key]: e.target.value })}
            required={f.required}
            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid var(--bl-border, #d0d0d0)', fontSize: '0.95rem', boxSizing: 'border-box' }}
          />
        </div>
      ))}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Business Description *</label>
        <textarea
          value={form.business_description}
          onChange={e => setForm({ ...form, business_description: e.target.value })}
          required rows={3}
          style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid var(--bl-border, #d0d0d0)', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box' }}
        />
      </div>
      {(state === 'error') && <p style={{ color: 'var(--bl-danger, #dc2626)', marginBottom: '1rem' }}>{error}</p>}
      <button type="submit" style={{ padding: '0.75rem 2rem', borderRadius: 8, border: 'none', background: 'var(--bl-accent, #2563eb)', color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
        Generate Template
      </button>
    </form>
  )
}
