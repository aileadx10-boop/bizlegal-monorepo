'use client'

import { useState } from 'react'

type Tier = 'radar' | 'radar_build'
type Interval = 'monthly' | 'yearly'
type Gateway = 'card' | 'crypto'
type State = 'idle' | 'collecting' | 'submitting' | 'error'

interface Props {
  readonly tier: Tier
  readonly interval: Interval
  readonly label: string
}

export default function CheckoutButton({ tier, interval, label }: Props): JSX.Element {
  const [state, setState] = useState<State>('idle')
  const [email, setEmail] = useState('')
  const [gateway, setGateway] = useState<Gateway>('card')
  const [error, setError] = useState<string | null>(null)

  async function start(): Promise<void> {
    if (!email.includes('@')) return
    setState('submitting')
    setError(null)
    try {
      const res = await fetch('/api/checkout/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tier, interval, gateway, user_email: email }),
      })
      const json = (await res.json()) as { ok?: boolean; checkout_url?: string; error?: string; message?: string }
      if (json.ok && json.checkout_url) {
        window.location.href = json.checkout_url
        return
      }
      setState('error')
      setError(json.message ?? json.error ?? 'Checkout unavailable — try again shortly.')
    } catch {
      setState('error')
      setError('Network error — try again.')
    }
  }

  if (state === 'idle') {
    return (
      <button className="bx-btn-primary" style={{ width: '100%' }} onClick={() => setState('collecting')}>
        {label}
      </button>
    )
  }

  return (
    <div className="bx-form">
      <input
        type="email"
        required
        placeholder="you@firm.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bx-input"
      />
      <div role="radiogroup" aria-label="Payment method" style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button type="button" className={gateway === 'card' ? 'bx-btn-primary' : 'bx-btn-ghost'} style={{ flex: 1, padding: '9px 14px', fontSize: 13 }} onClick={() => setGateway('card')}>Card</button>
        <button
          type="button"
          className={gateway === 'crypto' ? 'bx-btn-primary' : 'bx-btn-ghost'}
          style={{ flex: 1, padding: '9px 14px', fontSize: 13 }}
          onClick={() => setGateway('crypto')}
          disabled={interval === 'monthly'}
          title={interval === 'monthly' ? 'Crypto is yearly-only' : undefined}
        >
          Crypto
        </button>
      </div>
      <p className="bx-muted" style={{ fontSize: 11, marginTop: 8 }}>
        {gateway === 'card' ? 'PayPal subscription — cancel anytime.' : 'One crypto invoice, yearly only.'}
      </p>
      <button className="bx-btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={start} disabled={state === 'submitting' || !email.includes('@')}>
        {state === 'submitting' ? 'Redirecting…' : 'Continue to checkout →'}
      </button>
      {state === 'error' && error && <p className="bx-notice bx-notice--error">{error}</p>}
    </div>
  )
}
