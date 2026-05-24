'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const input = {
    width: '100%', background: '#0f172a', border: '1px solid #1e293b',
    borderRadius: '8px', color: '#e2e8f0', padding: '12px 14px',
    fontSize: '14px', outline: 'none', marginBottom: '12px'
  }

  async function handleAuth() {
    const supabase = createClient()
    setLoading(true)
    setMessage('')
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050509', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap')`}</style>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '24px' }}>
            <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#c9a84c,#7a5c20)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚖</div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '18px', color: '#e2e8f0' }}>LexAudit</span>
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '26px', color: '#f1f5f9', marginBottom: '8px' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ color: '#475569', fontSize: '13px' }}>
            {mode === 'login' ? 'Sign in to your LexAudit account' : 'Start your 3-month free beta'}
          </p>
        </div>

        <div style={{ background: '#080810', border: '1px solid #1a1a2e', borderRadius: '14px', padding: '32px' }}>
          <label style={{ color: '#64748b', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>EMAIL</label>
          <input style={input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@lawfirm.com" />

          <label style={{ color: '#64748b', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>PASSWORD</label>
          <input style={{ ...input, marginBottom: '20px' }} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />

          {message && (
            <div style={{ background: message.includes('Check') ? '#0a1a0a' : '#1a0a0a', border: `1px solid ${message.includes('Check') ? '#166534' : '#7f1d1d'}`, borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: message.includes('Check') ? '#22c55e' : '#ef4444' }}>
              {message}
            </div>
          )}

          <button onClick={handleAuth} disabled={loading || !email || !password}
            style={{ width: '100%', background: 'linear-gradient(135deg,#c9a84c,#a07830)', color: '#0a0a0f', border: 'none', borderRadius: '8px', padding: '14px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage('') }}
              style={{ background: 'none', border: 'none', color: '#c9a84c', fontSize: '13px', cursor: 'pointer' }}>
              {mode === 'login' ? "Don't have an account? Sign up free" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
