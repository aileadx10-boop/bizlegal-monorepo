'use client'

/**
 * Email capture for a /learn track. The only client component under /learn —
 * everything else stays a server component so the lessons ship no JS.
 *
 * Posts to the existing double opt-in endpoint (POST /api/newsletter), which
 * stores double_optin_confirmed=false and emails a confirmation link. Nothing
 * here makes an address mailable on its own; confirmation does. Do not swap this
 * for a direct table write — that is the bug the 2026-07-10 rebuild fixed.
 */
import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'done' | 'error'

interface TrackSignupProps {
  /** Track slug, stored as vertical_interest so nurture can segment by track. */
  track: string
  /** What the reader gets for signing up — shown above the field. */
  prompt: string
}

export default function TrackSignup({ track, prompt }: TrackSignupProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setMessage('')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'learn', vertical_interest: track }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setStatus('error')
        setMessage(data?.error || 'Could not sign you up — please try again.')
        return
      }

      setStatus('done')
      setMessage('Check your inbox and click the confirmation link to finish signing up.')
    } catch {
      setStatus('error')
      setMessage('Network error — please try again.')
    }
  }

  if (status === 'done') {
    return (
      <div
        role="status"
        style={{
          background: 'rgba(16,185,129,0.08)',
          border: '0.5px solid rgba(16,185,129,0.3)',
          borderLeft: '3px solid var(--green)',
          padding: '16px 18px',
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        {message}
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--bg-low)',
        border: '0.5px solid var(--outline-var)',
        padding: '20px 22px',
      }}
    >
      <label
        htmlFor={`learn-email-${track}`}
        style={{ display: 'block', fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}
      >
        {prompt}
      </label>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          id={`learn-email-${track}`}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          disabled={status === 'submitting'}
          style={{
            flex: '1 1 220px',
            minWidth: 0,
            padding: '11px 14px',
            background: 'var(--bg)',
            border: '0.5px solid var(--outline-var)',
            color: 'var(--on-surface)',
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={status === 'submitting'}
          style={{ fontSize: 13 }}
        >
          {status === 'submitting' ? 'Sending…' : 'Notify me'}
        </button>
      </div>

      {status === 'error' && (
        <p role="alert" style={{ fontSize: 12, color: 'var(--danger)', margin: '10px 0 0' }}>
          {message}
        </p>
      )}

      <p style={{ fontSize: 11, color: 'var(--outline)', margin: '12px 0 0', lineHeight: 1.6 }}>
        Double opt-in — we send one confirmation email and nothing else until you click it.
        Unsubscribe any time.
      </p>
    </form>
  )
}
