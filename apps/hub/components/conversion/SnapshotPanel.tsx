'use client'

import { useState, type FormEvent } from 'react'
import { DISCLAIMER_VERSION } from '@/lib/legal/disclaimer'

const WORKER_URL =
  process.env.NEXT_PUBLIC_LEAD_INTAKE_URL ?? 'https://bizlegal-lead-intake.bizlegal-ai.workers.dev'

const JURISDICTIONS: ReadonlyArray<{ code: string; label: string }> = [
  { code: 'UAE', label: 'United Arab Emirates (UAE)' },
  { code: 'SG', label: 'Singapore' },
  { code: 'CH', label: 'Switzerland' },
  { code: 'EU', label: 'European Union (MiCA)' },
  { code: 'UK', label: 'United Kingdom' },
  { code: 'US', label: 'United States' },
  { code: 'HK', label: 'Hong Kong' },
  { code: 'BVI', label: 'British Virgin Islands' },
  { code: 'KY', label: 'Cayman Islands' },
  { code: 'CA', label: 'Canada' },
  { code: 'PT', label: 'Portugal' },
  { code: 'BM', label: 'Bermuda' },
  { code: 'LI', label: 'Liechtenstein' },
  { code: 'MT', label: 'Malta' },
  { code: 'EE', label: 'Estonia' },
]

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface ConfirmationState {
  readonly id: string
  readonly email: string
}

// After 3 consecutive failed submits, show a mailto: fallback so users
// can still reach us when the Worker is unreachable.
const MAX_RETRIES_BEFORE_FALLBACK = 3
const FALLBACK_EMAIL = 'team@bizlegal-ai.com'

/**
 * Hub-side snapshot intake panel. POSTs to the public Worker endpoint;
 * Worker handles Sonnet/Haiku draft, GitHub commit, Resend email delivery
 * with PDF attachment. Honeypot field "website" is rejected silently by
 * the Worker (no need to handle here).
 */
export function SnapshotPanel() {
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [errorKind, setErrorKind] = useState<'validation' | 'network' | 'server' | 'auth' | 'unknown'>('unknown')
  const [retries, setRetries] = useState(0)
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg('')

    const fd = new FormData(e.currentTarget)
    const juris1 = String(fd.get('juris1') ?? '')
    const juris2 = String(fd.get('juris2') ?? '')
    if (!juris1 || !juris2) {
      setErrorMsg('Pick both jurisdictions.')
      setState('error')
      return
    }
    if (juris1 === juris2) {
      setErrorMsg('Pick two different jurisdictions.')
      setState('error')
      return
    }

    setState('submitting')

    const email = String(fd.get('email') ?? '')
    const payload: Record<string, unknown> = {
      full_name: String(fd.get('full_name') ?? ''),
      email,
      company: String(fd.get('company') ?? '') || null,
      jurisdiction_codes: [juris1, juris2],
      activity: String(fd.get('activity') ?? ''),
      urgency_window: String(fd.get('urgency_window') ?? '') || null,
      website: String(fd.get('website') ?? ''),
      source: 'hub_snapshot',
      disclaimer_version: DISCLAIMER_VERSION,
    }

    try {
      const res = await fetch(`${WORKER_URL}/report/snapshot-public`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string
          issues?: ReadonlyArray<{ path?: readonly (string | number)[]; message?: string }>
        }
        if (res.status === 400 && Array.isArray(body.issues) && body.issues.length > 0) {
          const msg = body.issues
            .map((i) => `${(i.path ?? []).join('.') || '?'}: ${i.message ?? 'invalid'}`)
            .join('; ')
          setErrorKind('validation')
          throw new Error(msg)
        }
        if (res.status === 400) {
          setErrorKind('validation')
          throw new Error(body.error ?? 'Please check the form and try again.')
        }
        if (res.status === 401 || res.status === 403) {
          setErrorKind('auth')
          throw new Error('Authentication issue with our intake service. Use the email fallback below.')
        }
        if (res.status >= 500 && res.status < 600) {
          setErrorKind('server')
          throw new Error(body.error ?? `Our intake service is temporarily unavailable (${res.status}). Try again or use the email fallback below.`)
        }
        setErrorKind('unknown')
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }
      const body = (await res.json()) as { snapshot_id?: string }
      setConfirmation({ id: String(body.snapshot_id ?? ''), email })
      setRetries(0)
      setErrorKind('unknown')
      setState('success')
    } catch (err) {
      // If we never even got an HTTP response (worker unreachable, DNS, CORS, offline)
      if (errorKind === 'unknown' && err instanceof TypeError) {
        setErrorKind('network')
      }
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected error.')
      setRetries((r) => r + 1)
      setState('error')
    }
  }

  function buildMailtoFallback(): string {
    const subject = encodeURIComponent('Free Snapshot request — fallback (Worker unreachable)')
    const body = encodeURIComponent(
      `Hi BizLegal AI team,\n\nThe snapshot form on bizlegal-ai.com errored, so I am sending my details directly. Please prepare my free jurisdiction snapshot from the info below.\n\n— Name:\n— Work email:\n— Company:\n— Jurisdiction A:\n— Jurisdiction B:\n— Regulated activity:\n— Urgency window:\n\nThanks.`,
    )
    return `mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${body}`
  }

  if (state === 'success' && confirmation) {
    return (
      <div className="glass-card" style={{ padding: 28, textAlign: 'center' }}>
        <div className="quantum-label" style={{ marginBottom: 16, color: 'var(--accent, var(--gold))' }}>
          Snapshot submitted
        </div>
        <p style={{ fontSize: 15, color: 'var(--on-surface-var)', marginBottom: 16, lineHeight: 1.6 }}>
          Look for an email from <strong>team@intelligence.bizlegal-ai.com</strong> at{' '}
          <strong>{confirmation.email}</strong> in 2–5 minutes.
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
          Reference: {confirmation.id.slice(0, 8)}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="glass-card" style={{ padding: 28, display: 'grid', gap: 14 }} noValidate>
      <Field label="Your name" name="full_name" required placeholder="Jane Chen" />
      <Field label="Work email" name="email" type="email" required placeholder="jane@yourprotocol.xyz" />
      <Field label="Company (optional)" name="company" placeholder="Your protocol or firm" />

      <Row>
        <Select label="Jurisdiction A" name="juris1" required options={JURISDICTIONS} />
        <Select label="Jurisdiction B" name="juris2" required options={JURISDICTIONS} />
      </Row>

      <FieldArea
        label="What are you doing? (regulated activity)"
        name="activity"
        required
        placeholder="e.g., stablecoin issuance with EUR-pegged token, Series A backed, targeting institutional OTC desks"
      />

      <Select
        label="Urgency (optional)"
        name="urgency_window"
        options={[
          { code: '', label: 'Unspecified' },
          { code: 'within_30_days', label: 'Within 30 days' },
          { code: 'within_90_days', label: 'Within 90 days' },
          { code: 'within_6_months', label: 'Within 6 months' },
          { code: 'exploratory', label: 'Exploratory — no deadline' },
        ]}
      />

      {/* Honeypot — invisible to humans, bots fill it */}
      <label aria-hidden="true" tabIndex={-1} style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <button
        type="submit"
        disabled={state === 'submitting'}
        style={{
          padding: '14px 20px',
          background: 'var(--accent, var(--gold))',
          color: '#08080f',
          border: 'none',
          borderRadius: 10,
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: state === 'submitting' ? 'wait' : 'pointer',
          marginTop: 6,
        }}
      >
        {state === 'submitting' ? 'Generating…' : 'Get my free snapshot →'}
      </button>

      <p style={{ margin: 0, fontSize: 10, color: 'var(--muted)', letterSpacing: '0.04em' }}>
        Disclosure {DISCLAIMER_VERSION} · Intelligence — not legal advice. You remain responsible for filing/action.
      </p>

      {state === 'error' && (
        <div role="alert" style={{ margin: 0, padding: '12px 14px', background: 'rgba(248,113,113,0.1)', color: 'var(--red, #f87171)', borderRadius: 8, fontSize: 12, lineHeight: 1.5 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            {errorKind === 'validation' && 'Please check the form fields'}
            {errorKind === 'auth' && 'Intake authentication issue'}
            {errorKind === 'server' && 'Our intake service is temporarily unavailable'}
            {errorKind === 'network' && 'Could not reach our intake service'}
            {errorKind === 'unknown' && 'Something went wrong'}
          </div>
          <div>{errorMsg || 'Try again.'}</div>
          {retries >= MAX_RETRIES_BEFORE_FALLBACK && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(248,113,113,0.25)' }}>
              <div style={{ marginBottom: 6, color: 'var(--on-surface-var)' }}>
                Tried {retries} times. You can email us directly instead — we will hand-prepare the snapshot:
              </div>
              <a
                href={buildMailtoFallback()}
                style={{
                  display: 'inline-block',
                  padding: '8px 14px',
                  background: 'var(--accent, var(--gold))',
                  color: '#08080f',
                  borderRadius: 6,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                Email {FALLBACK_EMAIL} →
              </a>
            </div>
          )}
        </div>
      )}
    </form>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>{children}</div>
}

function Field({
  label,
  name,
  type = 'text',
  required,
  placeholder,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={labelStyle}>{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        style={inputStyle}
        autoComplete={type === 'email' ? 'email' : name === 'full_name' ? 'name' : 'off'}
      />
    </label>
  )
}

function FieldArea({
  label,
  name,
  required,
  placeholder,
}: {
  label: string
  name: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={labelStyle}>{label}</span>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        rows={3}
        minLength={10}
        maxLength={500}
        style={{ ...inputStyle, resize: 'vertical' as const, fontFamily: 'inherit' }}
      />
    </label>
  )
}

function Select({
  label,
  name,
  required,
  options,
}: {
  label: string
  name: string
  required?: boolean
  options: ReadonlyArray<{ code: string; label: string }>
}) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={labelStyle}>{label}</span>
      <select name={name} required={required} defaultValue="" style={{ ...inputStyle, cursor: 'pointer' }}>
        {options[0]?.code !== '' && (
          <option value="" disabled>
            Pick one…
          </option>
        )}
        {options.map((o) => (
          <option key={o.code || 'none'} value={o.code}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--accent, var(--gold))',
  fontWeight: 700,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: 'var(--bg-mid, var(--card))',
  border: '1px solid var(--outline-var)',
  borderRadius: 8,
  color: 'var(--on-surface, var(--text))',
  fontSize: 14,
  outline: 'none',
}

export default SnapshotPanel
