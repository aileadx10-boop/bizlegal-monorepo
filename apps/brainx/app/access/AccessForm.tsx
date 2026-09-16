'use client'

import { useState } from 'react'
import { TurnstileWidget } from '@bizlegal/turnstile-widget'

type Status = 'idle' | 'submitting' | 'sent' | 'error'

export default function AccessForm(): JSX.Element {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!email.includes('@')) return
    setStatus('submitting')
    try {
      const res = await fetch('/api/access/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, turnstile_token: token }),
      })
      const json = (await res.json()) as { ok?: boolean; message?: string; error?: string }
      if (json.ok) {
        setStatus('sent')
        setMessage(json.message ?? 'Check your inbox.')
      } else {
        setStatus('error')
        setMessage(json.error ?? 'Something went wrong — try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error — try again.')
    }
  }

  if (status === 'sent') {
    return <p className="bx-notice bx-notice--ok">{message}</p>
  }

  return (
    <form onSubmit={submit} className="bx-form">
      <label className="bx-label" htmlFor="access-email">Email</label>
      <input
        id="access-email"
        type="email"
        required
        placeholder="you@firm.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bx-input"
      />
      <div style={{ marginTop: 12 }}>
        <TurnstileWidget onToken={setToken} />
      </div>
      <button type="submit" disabled={status === 'submitting'} className="bx-btn-primary" style={{ marginTop: 16, width: '100%' }}>
        {status === 'submitting' ? 'Sending…' : 'Email me my link'}
      </button>
      {status === 'error' && <p className="bx-notice bx-notice--error">{message}</p>}
    </form>
  )
}
