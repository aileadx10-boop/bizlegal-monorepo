'use client'

import { useState } from 'react'

export function SubscribeBar() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) return
    setState('sending')
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'pricing_footer' }),
      })
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <p style={{ color: '#6ee7b7', fontSize: 14, textAlign: 'center', margin: 0 }}>
        You&apos;re in. Compliance updates incoming.
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: 400,
        margin: '0 auto',
      }}
    >
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          flex: '1 1 200px',
          padding: '10px 14px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#dee1f7',
          fontSize: 14,
          outline: 'none',
        }}
      />
      <button
        type="submit"
        disabled={state === 'sending'}
        style={{
          padding: '10px 20px',
          background: '#2563eb',
          color: '#eeefff',
          fontWeight: 700,
          fontSize: 13,
          border: 'none',
          cursor: state === 'sending' ? 'not-allowed' : 'pointer',
          opacity: state === 'sending' ? 0.7 : 1,
        }}
      >
        {state === 'sending' ? '…' : 'Get updates'}
      </button>
      {state === 'error' && (
        <p style={{ width: '100%', color: '#f87171', fontSize: 12, margin: 0, textAlign: 'center' }}>
          Something went wrong — try again.
        </p>
      )}
    </form>
  )
}
