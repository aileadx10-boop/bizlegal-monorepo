'use client'
import { useState } from 'react'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) setStatus('success')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="newsletter" style={{ background: '#2563eb', padding: '64px 32px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <span className="section-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Free Weekly Newsletter</span>
        <h2 style={{ color: '#fff', fontSize: 40, marginBottom: 16 }}>Stay Precise.</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 32, fontSize: 15 }}>
          The BizLegal AI Regulatory Pulse — enforcement alerts, compliance updates, and risk intelligence delivered every 48 hours.
        </p>

        {/* Perks */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 36, flexWrap: 'wrap' }}>
          {['SEC enforcement alerts', 'MiCA & VARA updates', 'GDPR breach notices', 'Risk scoring tools'].map(perk => (
            <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="6" fill="#10B981" />
                <path d="M3.5 6l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="square" />
              </svg>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{perk}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        {status === 'success' ? (
          <p style={{ color: '#10B981', fontWeight: 700, fontSize: 15 }}>Subscribed — next issue incoming.</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 0, maxWidth: 440, margin: '0 auto' }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderBottom: '2px solid rgba(255,255,255,0.5)',
                padding: '12px 16px',
                color: '#fff',
                fontSize: 14,
                outline: 'none',
                fontFamily: 'Manrope, sans-serif',
              }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                background: '#fff',
                color: '#2563eb',
                border: 'none',
                padding: '12px 20px',
                fontWeight: 700,
                fontSize: 14,
                cursor: status === 'loading' ? 'wait' : 'pointer',
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              {status === 'loading' ? '...' : '→'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8, fontSize: 12 }}>Something went wrong. Please try again.</p>
        )}
      </div>
    </section>
  )
}
