'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface SubscribeResponse {
  subscription_id?: number
  status?: string
  tier?: string
  message?: string
  error?: string
}

const ENTITY_TYPES = [
  { value: 'LLC', label: 'LLC' },
  { value: 'Corp', label: 'Corp / Inc' },
  { value: 'LLP', label: 'LLP' },
  { value: 'PLLC', label: 'PLLC' },
  { value: 'LP', label: 'LP' },
  { value: 'other', label: 'Other' },
] as const

type EntityType = (typeof ENTITY_TYPES)[number]['value']

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
] as const

export interface BoiSubscribeFormProps {
  /** When 'trial', sends `tier: 'trial'` so the API spins up a 7-day no-card watch. */
  tier?: 'trial' | 'paid'
  /** Override the submit button text (defaults to "Add entity to tracker"). */
  submitLabel?: string
  /** Tiny helper line below the submit button. */
  helperText?: string
}

export function BoiSubscribeForm({ tier = 'paid', submitLabel, helperText }: BoiSubscribeFormProps = {}) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [entityType, setEntityType] = useState<EntityType>('LLC')
  const [filingDate, setFilingDate] = useState('')
  const [ein4, setEin4] = useState('')
  const [state, setState] = useState('DE')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setResult(null)

    try {
      const res = await fetch('/api/boi/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          entity_legal_name: name,
          entity_type: entityType,
          entity_filing_date: filingDate || undefined,
          ein_last4: ein4 || undefined,
          state_of_formation: state,
          tier,
        }),
      })
      const data = (await res.json()) as SubscribeResponse
      if (!res.ok) {
        setResult({ ok: false, message: data.error ?? `Failed (${res.status})` })
      } else {
        setResult({
          ok: true,
          message:
            data.message === 'already subscribed'
              ? `Already tracking ${name}. We'll keep watching FinCEN for you.`
              : `Tracking ${name}. Welcome email sent — first FinCEN check runs tomorrow at 14:00 UTC.`,
        })
        setName('')
        setFilingDate('')
        setEin4('')
      }
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : 'Network error.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="bl-card" style={{ display: 'grid', gap: '1rem' }}>
      <Field label="Email (must match your active subscription)">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourcompany.com"
          style={inputStyle}
        />
      </Field>

      <Field label="Entity legal name">
        <input
          type="text"
          required
          minLength={2}
          maxLength={200}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Holdings LLC"
          style={inputStyle}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        <Field label="Entity type">
          <select value={entityType} onChange={(e) => setEntityType(e.target.value as EntityType)} style={inputStyle}>
            {ENTITY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="State of formation">
          <select value={state} onChange={(e) => setState(e.target.value)} style={inputStyle}>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        <Field label="Last BOI filing date (optional)">
          <input
            type="date"
            value={filingDate}
            onChange={(e) => setFilingDate(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label="EIN last 4 (optional)">
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={ein4}
            onChange={(e) => setEin4(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="1234"
            style={inputStyle}
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={busy || !email || !name}
        className="bl-btn-primary"
        style={{
          opacity: busy || !email || !name ? 0.6 : 1,
          cursor: busy || !email || !name ? 'not-allowed' : 'pointer',
          justifyContent: 'center',
        }}
      >
        {busy ? <Loader2 size={16} className="spin" /> : null}
        {busy ? 'Adding entity…' : submitLabel ?? 'Add entity to tracker'}
      </button>
      {helperText && (
        <div
          style={{
            fontFamily: 'var(--bl-font-mono)',
            fontSize: 11,
            color: 'var(--bl-text-subtle)',
            textAlign: 'center',
            marginTop: -4,
          }}
        >
          {helperText}
        </div>
      )}

      {result && (
        <div
          role="status"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            padding: '12px 14px',
            background: result.ok ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
            color: result.ok ? 'var(--bl-success)' : 'var(--bl-danger)',
            borderRadius: 'var(--bl-radius-md)',
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {result.ok ? (
            <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          ) : (
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          )}
          <span>{result.message}</span>
        </div>
      )}

      <style>{`.spin{animation:spin 0.9s linear infinite;margin-right:6px}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span
        style={{
          fontFamily: 'var(--bl-font-mono)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--bl-text-muted)',
        }}
      >
        {label}
      </span>
      {children}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--bl-surface)',
  border: '1px solid var(--bl-border)',
  borderRadius: 'var(--bl-radius-sm)',
  color: 'var(--bl-text)',
  fontFamily: 'var(--bl-font-body)',
  fontSize: 14,
  outline: 'none',
}
