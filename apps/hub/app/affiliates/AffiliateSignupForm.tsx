'use client'

import { useState } from 'react'

type State = 'idle' | 'submitting' | 'success' | 'error'

interface SignupResult {
  code: string
  dashboard_url: string
  share_url: string
}

export function AffiliateSignupForm() {
  const [state, setState] = useState<State>('idle')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [payoutAddress, setPayoutAddress] = useState('')
  const [result, setResult] = useState<SignupResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email so we can email you the dashboard link.')
      return
    }
    setError(null)
    setState('submitting')
    try {
      const res = await fetch('/api/affiliates/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          display_name: displayName.trim() || null,
          payout_address: payoutAddress.trim() || null,
        }),
      })
      const data = (await res.json()) as SignupResult & { error?: string }
      if (!res.ok) {
        setError(data.error ?? `signup failed (${res.status})`)
        setState('error')
        return
      }
      setResult(data)
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'network error')
      setState('error')
    }
  }

  if (state === 'success' && result) {
    return (
      <div className="bl-card" style={{ display: 'grid', gap: 12, padding: '1.5rem' }}>
        <span className="bl-label" style={{ color: 'var(--bl-success)' }}>Welcome aboard</span>
        <h2 style={{ fontFamily: 'var(--bl-font-display)', fontSize: 'var(--bl-text-h3)', fontWeight: 800, margin: 0 }}>
          Your affiliate code is <span style={{ color: 'var(--bl-accent)' }}>{result.code}</span>
        </h2>
        <p style={{ color: 'var(--bl-text-muted)', margin: 0, fontSize: 14 }}>
          Save these two URLs — they're how you earn:
        </p>
        <div style={{ display: 'grid', gap: 8 }}>
          <KvRow label="Share link" value={result.share_url} />
          <KvRow label="Your dashboard" value={result.dashboard_url} />
        </div>
        <p style={{ fontSize: 13, color: 'var(--bl-text-muted)', lineHeight: 1.5, margin: 0 }}>
          When someone clicks your share link, we set a 90-day cookie. Any paid order they make inside that window credits your account. Reconciliation runs every Friday 10:30 UTC.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="bl-card" style={{ display: 'grid', gap: 12, padding: '1.5rem' }}>
      <h2 style={{ fontFamily: 'var(--bl-font-display)', fontSize: 'var(--bl-text-h3)', fontWeight: 800, margin: '0 0 6px' }}>
        Sign up — 30 seconds
      </h2>
      <p style={{ margin: '0 0 12px', color: 'var(--bl-text-muted)', fontSize: 14 }}>
        We email you the dashboard link + share URL. No vetting, no contracts. You can opt out anytime by ignoring the link.
      </p>
      <Field label="Email" required>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          required
          disabled={state === 'submitting'}
          style={inputStyle}
        />
      </Field>
      <Field label="Display name (optional)">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How you want to show up on the leaderboard"
          disabled={state === 'submitting'}
          style={inputStyle}
        />
      </Field>
      <Field label="Payout (optional — add later)">
        <input
          type="text"
          value={payoutAddress}
          onChange={(e) => setPayoutAddress(e.target.value)}
          placeholder="USDC wallet, BTC address, or bank wire ref"
          disabled={state === 'submitting'}
          style={inputStyle}
        />
      </Field>
      {error && (
        <p role="alert" style={{ margin: 0, color: 'var(--bl-danger)', fontSize: 13 }}>{error}</p>
      )}
      <button
        type="submit"
        className="bl-btn-primary"
        disabled={state === 'submitting'}
        style={{ marginTop: 4 }}
      >
        {state === 'submitting' ? 'Creating your code…' : 'Get my affiliate code'}
      </button>
    </form>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--bl-bg)',
  border: '1px solid var(--bl-border)',
  borderRadius: 'var(--bl-radius-sm)',
  color: 'var(--bl-text)',
  fontFamily: 'var(--bl-font-body)',
  fontSize: 14,
  outline: 'none',
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 4 }}>
      <span style={{ fontSize: 11, fontFamily: 'var(--bl-font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--bl-text-muted)', fontWeight: 700 }}>
        {label}{required ? ' *' : ''}
      </span>
      {children}
    </label>
  )
}

function KvRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'baseline', padding: 8, background: 'var(--bl-surface)', border: '1px solid var(--bl-divider)', borderRadius: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--bl-text-muted)', fontFamily: 'var(--bl-font-mono)', textTransform: 'uppercase' }}>{label}</span>
      <code style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 12, wordBreak: 'break-all' }}>{value}</code>
    </div>
  )
}
