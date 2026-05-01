'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/dashboard/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/dashboard')
    } else {
      setError('Invalid password')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050509',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '3px', color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
            Operations
          </div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 700, color: '#e2e8f0' }}>
            BizLegal Dashboard
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%',
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              color: '#e2e8f0',
              padding: '12px 16px',
              fontSize: '14px',
              outline: 'none',
              marginBottom: '12px',
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <div style={{ color: '#f87171', fontSize: '13px', marginBottom: '10px' }}>{error}</div>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%',
              background: password && !loading ? 'linear-gradient(135deg,#2b57ff,#6cb9ff)' : '#1e293b',
              color: password && !loading ? '#fff' : '#475569',
              border: 'none',
              borderRadius: '8px',
              padding: '13px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: password && !loading ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? 'Verifying...' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}
