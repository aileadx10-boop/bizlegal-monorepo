'use client'

import { useState } from 'react'
import { Loader2, Bitcoin, CreditCard } from 'lucide-react'

interface AgentCheckoutButtonProps {
  /** Stable id used in payment_orders.product (e.g. "agent_compliance_researcher") */
  product: string
  /** Tier name (e.g. agent name) — stored in payment_orders.tier */
  tier: string
  /** Amount in USD cents for this interval */
  amountCents: number
  /** 'monthly' | 'yearly' */
  interval: 'monthly' | 'yearly'
  /** Display label, e.g. "$29/mo" */
  priceLabel: string
  /** Accent color for the agent (border + hover) */
  accent: string
}

type State = 'idle' | 'collecting' | 'submitting' | 'redirecting' | 'error'

/**
 * AgentCheckoutButton — collects email inline + posts to the existing
 * NOWPayments / PayPal payment routes. Redirects user to the invoice
 * URL or PayPal approval URL on success. Replaces the legacy
 * "Request Access -> /contact" funnel.
 */
export function AgentCheckoutButton({
  product,
  tier,
  amountCents,
  interval,
  priceLabel,
  accent,
}: AgentCheckoutButtonProps) {
  const [state, setState] = useState<State>('idle')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [gateway, setGateway] = useState<'nowpayments' | 'paypal' | null>(null)

  async function startCheckout(g: 'nowpayments' | 'paypal') {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email so we can email you the receipt + access link.')
      return
    }
    setError(null)
    setGateway(g)
    setState('submitting')
    try {
      const res = await fetch(`/api/payments/${g}/start`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          product,
          tier,
          interval,
          amount_cents: amountCents,
          email,
          source: 'hub_agents',
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        invoice_url?: string
        approve_url?: string
        error?: string
      }
      if (!res.ok) {
        setError(data.error ?? `Checkout failed (${res.status}). Please try the other gateway.`)
        setState('error')
        return
      }
      const url = data.invoice_url ?? data.approve_url
      if (!url) {
        setError('Checkout URL missing from response. Please try again.')
        setState('error')
        return
      }
      setState('redirecting')
      window.location.assign(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error.')
      setState('error')
    }
  }

  if (state === 'idle') {
    return (
      <button
        type="button"
        onClick={() => setState('collecting')}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: `${accent}15`,
          border: `1px solid ${accent}50`,
          color: accent,
          borderRadius: 'var(--bl-radius-md)',
          fontFamily: 'var(--bl-font-mono)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'all var(--bl-duration-fast) var(--bl-ease-out-expo)',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.background = `${accent}28`
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.background = `${accent}15`
          ;(e.currentTarget as HTMLElement).style.transform = 'none'
        }}
      >
        Subscribe — {priceLabel}
      </button>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: 8,
        padding: 12,
        background: 'var(--bl-surface)',
        border: `1px solid ${accent}40`,
        borderRadius: 'var(--bl-radius-md)',
      }}
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        autoFocus
        disabled={state === 'submitting' || state === 'redirecting'}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: 'var(--bl-bg)',
          border: '1px solid var(--bl-border)',
          borderRadius: 'var(--bl-radius-sm)',
          color: 'var(--bl-text)',
          fontFamily: 'var(--bl-font-body)',
          fontSize: 13,
          outline: 'none',
        }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <button
          type="button"
          onClick={() => startCheckout('nowpayments')}
          disabled={state === 'submitting' || state === 'redirecting' || !email}
          style={{
            padding: '10px 12px',
            background: accent,
            color: 'var(--bl-text-on-accent)',
            border: 'none',
            borderRadius: 'var(--bl-radius-sm)',
            fontFamily: 'var(--bl-font-mono)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: state === 'submitting' || state === 'redirecting' || !email ? 'not-allowed' : 'pointer',
            opacity: state === 'submitting' || state === 'redirecting' || !email ? 0.6 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {state === 'submitting' && gateway === 'nowpayments' ? <Loader2 size={12} className="spin" /> : <Bitcoin size={12} />}
          Pay crypto
        </button>
        <button
          type="button"
          onClick={() => startCheckout('paypal')}
          disabled={state === 'submitting' || state === 'redirecting' || !email}
          style={{
            padding: '10px 12px',
            background: 'transparent',
            color: accent,
            border: `1px solid ${accent}80`,
            borderRadius: 'var(--bl-radius-sm)',
            fontFamily: 'var(--bl-font-mono)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: state === 'submitting' || state === 'redirecting' || !email ? 'not-allowed' : 'pointer',
            opacity: state === 'submitting' || state === 'redirecting' || !email ? 0.6 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {state === 'submitting' && gateway === 'paypal' ? <Loader2 size={12} className="spin" /> : <CreditCard size={12} />}
          Pay card
        </button>
      </div>
      {error && (
        <p
          role="alert"
          style={{
            margin: 0,
            fontSize: 11,
            color: 'var(--bl-danger)',
            lineHeight: 1.4,
          }}
        >
          {error}
        </p>
      )}
      {state === 'redirecting' && (
        <p style={{ margin: 0, fontSize: 11, color: 'var(--bl-text-muted)' }}>
          Redirecting to {gateway === 'nowpayments' ? 'NOWPayments' : 'PayPal'}…
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          setState('idle')
          setError(null)
        }}
        disabled={state === 'submitting' || state === 'redirecting'}
        style={{
          padding: '4px',
          background: 'transparent',
          border: 'none',
          color: 'var(--bl-text-subtle)',
          fontSize: 10,
          fontFamily: 'var(--bl-font-mono)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          alignSelf: 'flex-end',
        }}
      >
        Cancel
      </button>
      <style>{`.spin{animation:spin 0.9s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default AgentCheckoutButton
