'use client'

import { useState } from 'react'

type State = 'idle' | 'sending' | 'sent' | 'error'

export default function LoginClient() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setState('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()

      if (data.ok) {
        setState('sent')
      } else {
        setState('error')
        setErrorMsg(data.error || 'Something went wrong.')
      }
    } catch {
      setState('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  return (
    <div style={{
      maxWidth: 420,
      width: '100%',
      padding: '3rem 2rem',
      borderRadius: 12,
      border: '1px solid var(--bl-border, #e2e2e2)',
      background: 'var(--bl-surface, #fff)',
    }}>
      <h1 style={{
        fontFamily: 'var(--bl-font-display, Fraunces, serif)',
        fontSize: '1.75rem',
        fontWeight: 600,
        marginBottom: '0.5rem',
        color: 'var(--bl-text, #1a1a1a)',
      }}>
        AI Conductor
      </h1>
      <p style={{
        color: 'var(--bl-text-muted, #666)',
        marginBottom: '2rem',
        fontSize: '0.95rem',
      }}>
        Sign in with a magic link — no password needed.
      </p>

      {state === 'sent' ? (
        <div style={{
          padding: '1.5rem',
          borderRadius: 8,
          background: 'var(--bl-accent-soft, #f0f7ff)',
          textAlign: 'center',
        }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Check your email</p>
          <p style={{ color: 'var(--bl-text-muted, #666)', fontSize: '0.9rem' }}>
            We sent a magic link to <strong>{email}</strong>. Click it to sign in.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="email" style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 500,
            marginBottom: '0.5rem',
            color: 'var(--bl-text, #1a1a1a)',
          }}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@firm.com"
            required
            autoFocus
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 8,
              border: '1px solid var(--bl-border, #d0d0d0)',
              fontSize: '1rem',
              marginBottom: '1rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          {state === 'error' && (
            <p style={{ color: 'var(--bl-danger, #dc2626)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={state === 'sending'}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 8,
              border: 'none',
              background: 'var(--bl-accent, #2563eb)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: state === 'sending' ? 'wait' : 'pointer',
              opacity: state === 'sending' ? 0.7 : 1,
            }}
          >
            {state === 'sending' ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
      )}
    </div>
  )
}
