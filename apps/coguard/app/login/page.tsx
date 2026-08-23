'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Login failed')
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Sign in to CoGuard</h1>
        <p style={{ color: '#6b7280', marginBottom: 28, fontSize: 15 }}>
          We&apos;ll send you a magic link — no password needed.
        </p>

        {sent ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 10, padding: 20, color: '#065f46' }}>
            <strong>Check your email</strong>
            <p style={{ margin: '8px 0 0', fontSize: 14 }}>
              We sent a sign-in link to <strong>{email}</strong>. Click it to access your dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15, outline: 'none' }}
            />
            {error && <p style={{ color: '#dc2626', fontSize: 14, margin: 0 }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{ background: '#111827', color: '#fff', padding: '12px', borderRadius: 8, fontWeight: 600, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
