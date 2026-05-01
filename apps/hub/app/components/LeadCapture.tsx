'use client'

import { useState } from 'react'

export function LeadCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setTimeout(() => {
      setStatus('success')
      setEmail('')
    }, 1500)
  }

  return (
    <section className="section-shell lead-capture-section">
      <div className="container lead-capture-grid">
        <div className="lead-capture-content">
          <span className="eyebrow">Free regulatory brief</span>
          <h2>Get the UAE VARA 2025 Risk Report. Before Your Next Move.</h2>
          <p>
            We send a weekly brief covering VARA enforcement updates, ADGM licensing shifts, and
            cross-border risk patterns — the things that move before the market notices.
          </p>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '1rem 0 0',
              display: 'grid',
              gap: '0.5rem',
            }}
          >
            {[
              'VARA & ADGM enforcement radar',
              'MiCA and cross-border updates',
              'Founder-grade clarity, not legal noise',
            ].map((item) => (
              <li
                key={item}
                style={{
                  color: 'var(--muted)',
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--accent-mint)',
                    flexShrink: 0,
                  }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={handleSubmit} className="lead-capture-form">
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'var(--muted-strong)',
              marginBottom: '1rem',
            }}
          >
            Join 1,400+ founders already scanning
          </p>
          <div className="input-group">
            <input
              type="email"
              placeholder="Enter your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === 'loading' || status === 'success'}
              className="email-input"
            />
            <button
              type="submit"
              className="button button-primary"
              disabled={status === 'loading' || status === 'success'}
            >
              {status === 'loading'
                ? 'Sending...'
                : status === 'success'
                  ? 'Report Sent'
                  : 'Send Me the Report'}
            </button>
          </div>
          {status === 'success' && (
            <p className="success-message">
              Your VARA 2025 Risk Report is on its way. Check your inbox.
            </p>
          )}
          <p className="micro-copy">
            No spam. Unsubscribe anytime. Work email only.
          </p>
        </form>
      </div>
    </section>
  )
}
