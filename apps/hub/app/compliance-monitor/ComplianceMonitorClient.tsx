'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, AlertCircle, CreditCard, Bitcoin } from 'lucide-react'

const FRAMEWORKS = [
  { value: 'soc2', label: 'SOC 2 (AICPA TSC)' },
  { value: 'iso27001', label: 'ISO/IEC 27001:2022' },
  { value: 'gdpr', label: 'GDPR (EU 2016/679)' },
  { value: 'hipaa', label: 'HIPAA Security Rule' },
  { value: 'dpdp', label: 'DPDP Act 2023 (India)' },
  { value: 'nist-800-53', label: 'NIST SP 800-53 Rev. 5' },
] as const

function url(name: string): string | undefined {
  const v = (process.env as Record<string, string | undefined>)[name]
  return v && v.length > 4 ? v : undefined
}

export function ComplianceMonitorClient() {
  const [email, setEmail] = useState('')
  const [selected, setSelected] = useState<string[]>(['soc2', 'gdpr'])
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  const cryptoUrl = url('NEXT_PUBLIC_NOWPAYMENTS_COMPLIANCE_MONITOR_MONTHLY_URL')
  const cardUrl = url('NEXT_PUBLIC_PAYPAL_COMPLIANCE_MONITOR_MONTHLY_URL')

  function toggle(value: string) {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  async function startCheckout(gateway: 'crypto' | 'card') {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setResult({ ok: false, message: 'Enter a valid email.' })
      return
    }
    if (selected.length === 0) {
      setResult({ ok: false, message: 'Pick at least one framework to track.' })
      return
    }
    setBusy(true)
    setResult(null)

    try {
      const res = await fetch(`/api/payments/${gateway === 'crypto' ? 'nowpayments' : 'paypal'}/start`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          product: 'compliance_monitor_pro',
          tier: 'Compliance Monitor Pro',
          interval: 'monthly',
          amount_cents: 9900,
          email,
          source: 'hub_compliance_monitor',
          metadata: { frameworks: selected },
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        invoice_url?: string
        approve_url?: string
        error?: string
      }
      if (!res.ok) {
        setResult({ ok: false, message: data.error ?? `Checkout failed (${res.status}).` })
        return
      }
      const redirect = data.invoice_url ?? data.approve_url
      if (redirect) {
        window.location.href = redirect
      } else {
        setResult({ ok: false, message: 'Checkout URL missing from response.' })
      }
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : 'Network error.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bl-card" style={{ display: 'grid', gap: '1rem' }}>
      <label style={{ display: 'grid', gap: 6 }}>
        <span
          style={{
            fontFamily: 'var(--bl-font-mono)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--bl-text-muted)',
          }}
        >
          Email
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourcompany.com"
          autoComplete="email"
          required
          style={inputStyle}
        />
      </label>

      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend
          style={{
            fontFamily: 'var(--bl-font-mono)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--bl-text-muted)',
            marginBottom: 8,
          }}
        >
          Frameworks to track
        </legend>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
          {FRAMEWORKS.map((f) => {
            const isSelected = selected.includes(f.value)
            return (
              <label
                key={f.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  background: isSelected ? 'var(--bl-accent-soft)' : 'var(--bl-surface-soft)',
                  border: `1px solid ${isSelected ? 'var(--bl-accent)' : 'var(--bl-border)'}`,
                  borderRadius: 'var(--bl-radius-sm)',
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(f.value)}
                  style={{ margin: 0 }}
                />
                <span style={{ color: isSelected ? 'var(--bl-accent)' : 'var(--bl-text)', fontWeight: isSelected ? 600 : 400 }}>
                  {f.label}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: 4 }}>
        <button
          type="button"
          onClick={() => startCheckout('crypto')}
          disabled={busy || !cryptoUrl && !email}
          className="bl-btn-primary"
          style={{
            justifyContent: 'center',
            opacity: busy ? 0.6 : 1,
            cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          {busy ? <Loader2 size={16} className="spin" /> : <Bitcoin size={16} />}
          {busy ? 'Starting…' : 'Pay $99/mo · crypto'}
        </button>

        <button
          type="button"
          onClick={() => startCheckout('card')}
          disabled={busy || !cardUrl && !email}
          className="bl-btn-ghost"
          style={{
            justifyContent: 'center',
            opacity: busy ? 0.6 : 1,
            cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          {busy ? <Loader2 size={16} className="spin" /> : <CreditCard size={16} />}
          {busy ? 'Starting…' : 'Pay $99/mo · card'}
        </button>
      </div>

      {result && (
        <div
          role="status"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            padding: '10px 12px',
            background: result.ok ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
            color: result.ok ? 'var(--bl-success)' : 'var(--bl-danger)',
            borderRadius: 'var(--bl-radius-md)',
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {result.ok ? (
            <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          ) : (
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          )}
          <span>{result.message}</span>
        </div>
      )}

      <p style={{ fontSize: 11, color: 'var(--bl-text-subtle)', lineHeight: 1.55, fontStyle: 'italic', margin: 0 }}>
        Cancel anytime. Source-monitoring service only — we do not interpret regulatory changes, attest compliance,
        or guarantee any outcome.
      </p>

      <style>{`.spin{animation:spin 0.9s linear infinite;margin-right:6px}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--bl-surface)',
  border: '1px solid var(--bl-border)',
  borderRadius: 'var(--bl-radius-sm)',
  color: 'var(--bl-text)',
  fontFamily: 'var(--bl-font-body)',
  fontSize: 14,
  outline: 'none',
}
