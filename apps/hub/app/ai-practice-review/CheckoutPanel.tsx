'use client'

import { useState } from 'react'

/**
 * O-018 — checkout for the two written, async products. Posts to the
 * universal /api/pay/start (no payment-URL constants — hard rule 2). The
 * card path is PayPal via @bizlegal/payment; crypto is NOWPayments.
 */

type ProductId = 'ai_practice_review' | 'ai_teammate_kit'

interface Offer {
  readonly id: ProductId
  readonly name: string
  readonly price: string
  readonly line: string
}

const OFFERS: readonly Offer[] = [
  {
    id: 'ai_practice_review',
    name: 'AI Practice Review',
    price: '$200',
    line: 'Five questions by email, one written memo back. No meeting.',
  },
  {
    id: 'ai_teammate_kit',
    name: 'AI Teammate Kit',
    price: '$49',
    line: 'Eight-part written kit, delivered as a private link within minutes.',
  },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function CheckoutPanel() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState<ProductId | null>(null)
  const [error, setError] = useState('')

  const emailOk = EMAIL_RE.test(email.trim())

  async function checkout(productId: ProductId, gateway: 'card' | 'crypto') {
    if (!emailOk) {
      setError('Enter the email address the memo or kit should be delivered to.')
      return
    }
    setBusy(productId)
    setError('')
    try {
      const res = await fetch('/api/pay/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          user_email: email.trim(),
          gateway,
          source: 'ai_practice_review_page',
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { checkout_url?: string; error?: string }
      if (!res.ok || !data.checkout_url) {
        setError(data.error ?? 'Checkout is temporarily unavailable. Please retry in a moment.')
        setBusy(null)
        return
      }
      window.location.href = data.checkout_url
    } catch {
      setError('Network issue. Please retry.')
      setBusy(null)
    }
  }

  return (
    <div id="buy" style={{ border: '1px solid var(--outline, #99a)', borderRadius: 12, padding: 24, margin: '32px 0' }}>
      <label htmlFor="apr-email" style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
        Delivery email
      </label>
      <input
        id="apr-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@yourfirm.com"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid var(--outline, #99a)',
          background: 'transparent',
          color: 'inherit',
          fontSize: 15,
          marginBottom: 20,
        }}
      />

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {OFFERS.map((o) => (
          <div key={o.id} style={{ border: '1px solid var(--outline, #99a)', borderRadius: 10, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
              <strong style={{ fontSize: 17 }}>{o.name}</strong>
              <span style={{ fontSize: 22, fontWeight: 700 }}>{o.price}</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.6, margin: '8px 0 14px' }}>{o.line}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => checkout(o.id, 'card')}
                disabled={busy !== null}
                className="cta-btn-solid"
                style={{ padding: '10px 16px', borderRadius: 8, fontWeight: 700, cursor: busy ? 'wait' : 'pointer' }}
              >
                {busy === o.id ? 'Opening checkout…' : 'Pay by card (PayPal)'}
              </button>
              <button
                type="button"
                onClick={() => checkout(o.id, 'crypto')}
                disabled={busy !== null}
                className="cta-btn-outline"
                style={{ padding: '10px 16px', borderRadius: 8, fontWeight: 700, cursor: busy ? 'wait' : 'pointer' }}
              >
                Pay with crypto
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" style={{ color: '#d14343', fontSize: 14, marginTop: 14 }}>
          {error}
        </p>
      )}

      <p style={{ fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.6, marginTop: 16 }}>
        Payment is processed by DOR INNOVATIONS (BizLegal AI), a software company, not a law firm. The review and the
        kit are written by Moses Dor, Adv. in his personal capacity. Neither is legal advice. Non-refundable once
        delivered unless defective.
      </p>
    </div>
  )
}
