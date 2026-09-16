'use client'

import { useState } from 'react'
import { TurnstileWidget } from '@bizlegal/turnstile-widget'

type Status = 'idle' | 'submitting' | 'sent' | 'error'

export default function EmailCapture({ source }: { source: 'home' | 'sample' | 'guide' }): JSX.Element {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!email.includes('@')) return
    setStatus('submitting')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, turnstile_token: token, source }),
      })
      const json = (await res.json()) as { ok?: boolean; message?: string; error?: string }
      if (json.ok) {
        setStatus('sent')
        setMessage(json.message ?? 'Check your inbox to confirm.')
      } else {
        setStatus('error')
        setMessage(json.error ?? 'Something went wrong.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error — try again.')
    }
  }

  if (status === 'sent') {
    return <p className="bx-notice bx-notice--ok" style={{ maxWidth: 440 }}>{message}</p>
  }

  return (
    <form onSubmit={submit} className="bx-form" style={{ maxWidth: 440 }}>
      <p className="bx-label" style={{ marginBottom: 8, display: 'block' }}>One evidence-linked opportunity a week</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="email"
          required
          placeholder="you@firm.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bx-input"
          style={{ flex: '1 1 220px' }}
        />
        <button type="submit" disabled={status === 'submitting'} className="bx-btn-primary">
          {status === 'submitting' ? 'Sending…' : 'Get the pick'}
        </button>
      </div>
      <div style={{ marginTop: 10 }}>
        <TurnstileWidget onToken={setToken} />
      </div>
      <p className="bx-muted" style={{ fontSize: 11, marginTop: 8 }}>Double opt-in. No sequence. Unsubscribe anytime.</p>
      {status === 'error' && <p className="bx-notice bx-notice--error">{message}</p>}
    </form>
  )
}
