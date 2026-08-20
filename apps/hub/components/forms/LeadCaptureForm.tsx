'use client'

import { useState } from 'react'

interface LeadCaptureFormProps {
  source?: string
  product?: string
  className?: string
}

export default function LeadCaptureForm({ source = 'general', product, className }: LeadCaptureFormProps) {
  const [form, setForm] = useState({ name: '', email: '', company: '', jurisdiction: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source, product, page: typeof window !== 'undefined' ? window.location.pathname : '' }),
      })
      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', company: '', jurisdiction: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'var(--bg-mid)',
    border: '1px solid var(--outline-var)', borderRadius: 8, color: 'var(--on-surface)',
    fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6, display: 'block',
  }

  if (status === 'success') {
    return (
      <div className="glass-card" style={{ padding: 32, textAlign: 'center', borderRadius: 16 }} {...({ 'data-product': product || 'hub' } as any)}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--accent)', marginBottom: 8 }}>Thank You</div>
        <div style={{ fontSize: 13, color: 'var(--on-surface-var)' }}>We'll be in touch within 24 hours with your compliance assessment.</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`glass-card ${className || ''}`} style={{ padding: 32, borderRadius: 16 }} {...({ 'data-product': product || 'hub' } as any)}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--product-accent)', marginBottom: 12 }}>
        Get Started
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>Name</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="work@email.com" required style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Company</label>
          <input type="text" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Company name" style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Jurisdiction</label>
          <select value={form.jurisdiction} onChange={e => setForm(f => ({ ...f, jurisdiction: e.target.value }))} style={{ ...fieldStyle, cursor: 'pointer' }}>
            <option value="">Select...</option>
            <option value="US">United States</option>
            <option value="EU">European Union</option>
            <option value="UK">United Kingdom</option>
            <option value="UAE">UAE / Dubai</option>
            <option value="SG">Singapore</option>
            <option value="global">Global / Multi-jurisdiction</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        style={{
          width: '100%', padding: '12px', background: 'var(--gold)', color: '#08080f',
          border: 'none', borderRadius: 8, fontFamily: 'var(--font-mono)',
          fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
          cursor: status === 'loading' ? 'wait' : 'pointer', transition: 'filter 0.2s',
        }}
      >
        {status === 'loading' ? 'Submitting...' : 'Send my question'}
      </button>

      {status === 'error' && (
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--danger)', textAlign: 'center' }}>
          Something went wrong. Please try again.
        </div>
      )}
    </form>
  )
}