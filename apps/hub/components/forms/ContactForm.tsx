'use client'

import { useState } from 'react'

const INQUIRY_TYPES = [
  { value: '', label: 'Select inquiry type...' },
  { value: 'general', label: 'General Inquiry' },
  { value: 'demo', label: 'Product Demo' },
  { value: 'compliance', label: 'Compliance Assessment' },
  { value: 'enterprise', label: 'Enterprise' },
]

const JURISDICTIONS = [
  { value: '', label: 'Select jurisdiction...' },
  { value: 'US', label: 'United States' },
  { value: 'EU', label: 'European Union' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'UAE', label: 'UAE / Dubai' },
  { value: 'SG', label: 'Singapore' },
  { value: 'global', label: 'Global / Multi-jurisdiction' },
]

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '', email: '', company: '', jurisdiction: '', inquiry: '', message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source: 'contact',
          product: form.inquiry || 'general',
          page: typeof window !== 'undefined' ? window.location.pathname : '/contact',
        }),
      })
      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', company: '', jurisdiction: '', inquiry: '', message: '' })
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
      <div className="glass-card" style={{ padding: 40, textAlign: 'center', borderRadius: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--accent)', marginBottom: 12 }}>
          Message Sent
        </div>
        <div style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.6 }}>
          We'll review your inquiry and respond within 24 hours.
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card" style={{ padding: 32, borderRadius: 16 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 20 }}>
        Send a Message
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
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
            {JURISDICTIONS.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Inquiry Type</label>
        <select value={form.inquiry} onChange={e => setForm(f => ({ ...f, inquiry: e.target.value }))} style={{ ...fieldStyle, cursor: 'pointer' }}>
          {INQUIRY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Message</label>
        <textarea
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          placeholder="Tell us about your compliance needs..."
          rows={4}
          style={{ ...fieldStyle, resize: 'vertical', minHeight: 80 }}
        />
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
        {status === 'loading' ? 'Sending...' : 'Send Inquiry'}
      </button>

      {status === 'error' && (
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--danger)', textAlign: 'center' }}>
          Something went wrong. Please try again.
        </div>
      )}
    </form>
  )
}