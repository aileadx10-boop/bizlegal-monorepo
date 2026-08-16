'use client'

import { useState } from 'react'

/**
 * Checkout entry. POSTs to bench's own /api/checkout/start, which is DARK
 * (503 checkout_not_live) until a Moses-verified test purchase — hard rule 5.
 * When lit, that route forwards to hub /api/pay/start (@bizlegal/payment).
 */

interface CheckoutButtonProps {
  readonly productId: 'bench_audit_2500' | 'bench_managed_monthly'
  readonly label: string
}

export function CheckoutButton({ productId, label }: CheckoutButtonProps) {
  const [email, setEmail] = useState('')
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'working' | 'unavailable' | 'error'>('idle')

  async function start(gateway: 'card' | 'crypto') {
    setStatus('working')
    try {
      const res = await fetch('/api/checkout/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, user_email: email, gateway }),
      })
      if (res.status === 503) {
        setStatus('unavailable')
        return
      }
      const data = (await res.json()) as { ok?: boolean; checkout_url?: string }
      if (data.ok && data.checkout_url) {
        window.location.href = data.checkout_url
        return
      }
      setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  if (!open) {
    return (
      <button type="button" className="btn btn--primary" onClick={() => setOpen(true)}>
        {label}
      </button>
    )
  }

  return (
    <div>
      <div className="field" style={{ maxWidth: '340px', marginBottom: '0.75rem' }}>
        <label htmlFor={`email-${productId}`}>Work email</label>
        <input
          id={`email-${productId}`}
          type="email"
          required
          value={email}
          placeholder="you@company.com"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn--primary"
          disabled={status === 'working' || !email.includes('@')}
          onClick={() => void start('card')}
        >
          Pay by card
        </button>
        <button
          type="button"
          className="btn"
          disabled={status === 'working' || !email.includes('@')}
          onClick={() => void start('crypto')}
        >
          Pay with crypto
        </button>
      </div>
      {status === 'unavailable' ? (
        <p className="form-status" role="status">
          Checkout opens with our first audit cohort.{' '}
          <a href="/audit/request" style={{ textDecoration: 'underline' }}>
            Request an audit
          </a>{' '}
          and we&apos;ll reserve your slot — no payment taken until scoping is
          agreed.
        </p>
      ) : null}
      {status === 'error' ? (
        <p className="form-status form-status--err" role="status">
          Something went wrong starting checkout. Email team@bizlegal-ai.com and
          we&apos;ll take it from there.
        </p>
      ) : null}
    </div>
  )
}
