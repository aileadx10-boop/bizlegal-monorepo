'use client'

import { useState } from 'react'

export default function LeadforgePage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleSubmit() {
    if (!email || !email.includes('@')) return
    setStatus('loading')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'leadforge-early-access', page: '/leadforge', product: 'leadforge' }),
      })
      if (res.ok) {
        setStatus('done')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#08080f', color: '#f0f2ff', fontFamily: "'Geist', 'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&family=Inter:wght@300;400;500;600&display=swap');
      `}</style>

      {/* Back to BizLegal bar */}
      <a href="https://bizlegal-ai.com" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        padding: '6px 0', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase',
        background: '#0d0d1a', borderBottom: '1px solid rgba(255,255,255,0.06)',
        color: '#636680', textDecoration: 'none', fontFamily: "'DM Mono', monospace",
        transition: 'color 0.2s',
      }}>
        ← Back to BizLegal AI
      </a>

      <div style={{ paddingTop: '64px' }}>
        {/* Hero */}
        <div style={{
          maxWidth: 800, margin: '0 auto', padding: '120px 32px 80px',
          textAlign: 'center',
        }}>
          {/* Eyebrow */}
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: '#fb923c', marginBottom: 24,
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '4px 16px', borderRadius: 9999,
              border: '1px solid rgba(251,146,60,0.2)',
              background: 'rgba(251,146,60,0.05)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#fb923c',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              Coming Soon
            </span>
          </div>

          <style>{`
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          `}</style>

          <h1 style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 400, lineHeight: 1.1, marginBottom: 24,
            color: '#f0f2ff',
          }}>
            LeadForge
          </h1>

          <p style={{
            fontSize: 18, color: '#636680', lineHeight: 1.7,
            maxWidth: 560, margin: '0 auto 48px',
          }}>
            AI-powered lead generation and qualification engine. Find, score, and convert leads
            automatically. Currently under construction.
          </p>

          {/* Email capture */}
          <div style={{
            display: 'flex', gap: 12, maxWidth: 480, margin: '0 auto',
            flexWrap: 'wrap', justifyContent: 'center',
          }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              placeholder="Enter your email for early access"
              style={{
                flex: '1 1 280px', padding: '14px 20px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(251,146,60,0.15)',
                borderRadius: 8, color: '#f0f2ff',
                fontSize: 15, outline: 'none',
                fontFamily: "'Inter', sans-serif",
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(251,146,60,0.5)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(251,146,60,0.15)' }}
            />
            <button onClick={handleSubmit} disabled={status === 'loading' || status === 'done'} style={{
              padding: '14px 32px',
              background: status === 'done' ? '#4ade80' : status === 'error' ? '#f87171' : 'linear-gradient(135deg, #fb923c, #ea580c)',
              color: status === 'done' ? '#000' : '#000', fontWeight: 600, fontSize: 15,
              border: 'none', borderRadius: 8, cursor: status === 'loading' ? 'wait' : 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'opacity 0.2s, transform 0.15s',
              opacity: status === 'loading' ? 0.7 : 1,
            }}
            >
              {status === 'done' ? 'You\'re on the list!' : status === 'loading' ? 'Submitting...' : status === 'error' ? 'Try again' : 'Notify Me'}
            </button>
          </div>

          <p style={{ fontSize: 12, color: '#4a4a6a', marginTop: 12 }}>
            No spam. Unsubscribe anytime. By signing up you agree to our{' '}
            <a href="https://bizlegal-ai.com/privacy" style={{ color: '#fb923c', textDecoration: 'none' }}>Privacy Policy</a>.
          </p>
        </div>

        {/* Feature preview cards */}
        <div style={{
          maxWidth: 960, margin: '0 auto', padding: '0 32px 80px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {[
            { icon: '🎯', title: 'Smart Lead Scoring', desc: 'AI scores every lead on fit, intent, and timing. No more guessing.' },
            { icon: '⚡', title: 'Auto-Qualification', desc: 'Leads are qualified in real-time using behavioral signals and firmographics.' },
            { icon: '🔄', title: 'Pipeline Automation', desc: 'From first touch to closed-won. Automated sequences that convert.' },
          ].map((feature, i) => (
            <div key={i} style={{
              padding: '32px 28px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(251,146,60,0.08)',
              borderRadius: 12,
              transition: 'border-color 0.2s, transform 0.15s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(251,146,60,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(251,146,60,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: 28, marginBottom: 16 }}>{feature.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#f0f2ff', marginBottom: 8 }}>{feature.title}</h3>
              <p style={{ fontSize: 14, color: '#636680', lineHeight: 1.7 }}>{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.04)',
          padding: '32px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 12, color: '#4a4a6a' }}>
            Built by BizLegal AI ·{' '}
            <a href="https://bizlegal-ai.com/terms" style={{ color: '#636680', textDecoration: 'none' }}>Terms</a>
            {' · '}
            <a href="https://bizlegal-ai.com/privacy" style={{ color: '#636680', textDecoration: 'none' }}>Privacy</a>
            {' · '}
            <a href="mailto:team@bizlegal-ai.com" style={{ color: '#636680', textDecoration: 'none' }}>team@bizlegal-ai.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}