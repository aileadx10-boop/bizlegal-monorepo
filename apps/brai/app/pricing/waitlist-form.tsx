'use client'

import { useState } from 'react'
import { TurnstileWidget } from '@bizlegal/turnstile-widget'

/**
 * BRAI pricing waitlist — replaces paid checkout CTAs while paid report
 * delivery is suspended (fleet finding F4/brai, 2026-09-02). Captures the
 * lead via the same /api/decision-tree/lead endpoint the homepage hero
 * uses (verdict 'home_capture'), so waitlist signups flow into the
 * existing nurture pipeline. Turnstile token is forwarded when the widget
 * is configured — the endpoint rejects token-less posts if
 * TURNSTILE_SECRET_KEY is set on the deployment.
 */
export function PricingWaitlistForm() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) return
    setState('sending')
    try {
      const res = await fetch('/api/decision-tree/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          verdict: 'home_capture',
          ...(token ? { turnstile_token: token } : {}),
          answers: { home_capture: true, source: 'pricing-waitlist' },
        }),
      })
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <p style={{ margin: 0, fontSize: 14, color: 'var(--accent, var(--gold))' }}>
        You&apos;re on the list — we&apos;ll email {email} the moment reports reopen.
      </p>
    )
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
      <input
        type="email"
        required
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          flex: 1,
          minWidth: 240,
          padding: '12px 16px',
          background: 'var(--bg-1, transparent)',
          border: '1px solid var(--outline-var)',
          borderRadius: 8,
          color: 'inherit',
          fontSize: 14,
          outline: 'none',
        }}
      />
      <button
        type="submit"
        disabled={state === 'sending'}
        style={{
          padding: '12px 24px',
          background: 'var(--accent, var(--gold))',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 14,
          cursor: state === 'sending' ? 'wait' : 'pointer',
        }}
      >
        {state === 'sending' ? 'Joining…' : 'Notify me →'}
      </button>
      {state === 'error' && (
        <p style={{ width: '100%', margin: '4px 0 0', fontSize: 12, color: 'var(--danger, #f87171)' }}>
          Could not save your email — please try again.
        </p>
      )}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <TurnstileWidget onToken={setToken} />
      </div>
    </form>
  )
}

export default PricingWaitlistForm
