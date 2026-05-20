'use client'

import { useState } from 'react'

export type BillingInterval = 'one-time' | 'monthly' | 'yearly'
const PAYPAL_CHECKOUT_ENABLED = process.env.NEXT_PUBLIC_PAYPAL_SCAN_ENABLED === 'true'

export interface PricingTierData {
  /** Tier name (e.g. "Pro") */
  name: string
  /** Optional badge above name (e.g. "Most popular") */
  badge?: string
  /** 1-2 sentence value prop */
  description: string
  /** Per-interval pricing — at least one of monthly/yearly/oneTime must be set */
  prices: {
    oneTime?: { amount: number; currency: string; label?: string }
    monthly?: { amount: number; currency: string; label?: string }
    yearly?: { amount: number; currency: string; label?: string; saveLabel?: string }
  }
  /** Feature bullets — checkmarked */
  features: ReadonlyArray<string>
  /** What's NOT included (greyed out) */
  excludes?: ReadonlyArray<string>
  /**
   * CTA targets per interval. When clicked, the user is sent to the
   * interval-specific checkout URL (NOWPayments invoice, PayPal subscription
   * approval, or LemonSqueezy checkout once MoR approved).
   */
  checkoutUrls: {
    oneTime?: { checkout?: string; crypto?: string; card?: string }
    monthly?: { checkout?: string; crypto?: string; card?: string }
    yearly?: { checkout?: string; crypto?: string; card?: string }
  }
  /** Highlighted = scaled up + accent border */
  highlighted?: boolean
}

interface PricingTierCardProps extends PricingTierData {
  /** Default interval to show on mount */
  defaultInterval?: BillingInterval
}

const INTERVAL_LABELS: Record<BillingInterval, string> = {
  'one-time': 'One-time',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

function formatPrice(amount: number, currency: string): string {
  // Default to compact USD formatting
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US')}`
  }
  return `${amount} ${currency}`
}

/**
 * PricingTierCard — 3-interval (one-time / monthly / yearly) pricing card
 * for hub Pro/Scale + every product page that sells subscriptions.
 *
 * Phase B4: replaces "Contact Sales" dead-ends. Today wires NOWPayments
 * (crypto) + PayPal (card) for all three intervals; LemonSqueezy /
 * Paddle remain GATED until MoR approved.
 */
export function PricingTierCard({
  name,
  badge,
  description,
  prices,
  features,
  excludes,
  checkoutUrls,
  highlighted = false,
  defaultInterval,
}: PricingTierCardProps) {
  const availableIntervals: BillingInterval[] = []
  if (prices.oneTime) availableIntervals.push('one-time')
  if (prices.monthly) availableIntervals.push('monthly')
  if (prices.yearly) availableIntervals.push('yearly')

  const initial: BillingInterval = defaultInterval ?? availableIntervals[0] ?? 'one-time'
  const [interval, setInterval] = useState<BillingInterval>(initial)
  const [email, setEmail] = useState('')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [checkoutState, setCheckoutState] = useState<'idle' | 'submitting' | 'redirecting'>('idle')
  const [gateway, setGateway] = useState<'nowpayments' | 'paypal' | null>(null)

  const currentPrice =
    interval === 'one-time'
      ? prices.oneTime
      : interval === 'monthly'
        ? prices.monthly
        : prices.yearly
  const currentCheckout =
    interval === 'one-time'
      ? checkoutUrls.oneTime
      : interval === 'monthly'
        ? checkoutUrls.monthly
        : checkoutUrls.yearly

  if (!currentPrice) {
    return null
  }

  async function startDynamicCheckout(nextGateway: 'nowpayments' | 'paypal') {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setCheckoutError('Enter a valid email for receipt + access delivery.')
      return
    }
    if (!currentPrice) return
    setGateway(nextGateway)
    setCheckoutState('submitting')
    setCheckoutError(null)
    try {
      const res = await fetch(`/api/payments/${nextGateway}/start`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          product: 'docai',
          tier: name.toLowerCase(),
          interval,
          amount_cents: Math.round(currentPrice.amount * 100),
          email,
          source: 'docai_pricing',
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { invoice_url?: string; approve_url?: string; error?: string }
      if (!res.ok) {
        setCheckoutError(data.error || `Checkout failed (${res.status}). Try the other payment method.`)
        setCheckoutState('idle')
        return
      }
      const redirectUrl = data.invoice_url || data.approve_url
      if (!redirectUrl) {
        setCheckoutError('Checkout URL missing. Try again or contact support.')
        setCheckoutState('idle')
        return
      }
      setCheckoutState('redirecting')
      window.location.assign(redirectUrl)
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Network error. Try again.')
      setCheckoutState('idle')
    }
  }

  const yearlySave = prices.yearly?.saveLabel
  const intervalSuffix =
    interval === 'monthly'
      ? ' / month'
      : interval === 'yearly'
        ? ' / year'
        : ''

  return (
    <div
      className="bl-card"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        borderColor: highlighted ? 'var(--bl-accent)' : 'var(--bl-border)',
        borderWidth: highlighted ? 2 : 1,
        boxShadow: highlighted ? 'var(--bl-shadow-lg)' : 'var(--bl-shadow-sm)',
        transform: highlighted ? 'scale(1.02)' : 'none',
        zIndex: highlighted ? 1 : 0,
      }}
    >
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: -14,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bl-accent)',
            color: 'var(--bl-text-on-accent)',
            fontFamily: 'var(--bl-font-mono)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '5px 14px',
            borderRadius: 'var(--bl-radius-pill)',
            whiteSpace: 'nowrap',
          }}
        >
          {badge}
        </div>
      )}

      <div>
        <h3
          style={{
            fontFamily: 'var(--bl-font-display)',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--bl-text)',
            margin: 0,
            marginBottom: 4,
          }}
        >
          {name}
        </h3>
        <p
          style={{
            fontFamily: 'var(--bl-font-body)',
            fontSize: 'var(--bl-text-small)',
            color: 'var(--bl-text-muted)',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      </div>

      {/* Interval toggle */}
      {availableIntervals.length > 1 && (
        <div
          role="tablist"
          aria-label="Billing interval"
          style={{
            display: 'inline-flex',
            padding: 4,
            background: 'var(--bl-surface-soft)',
            border: '1px solid var(--bl-divider)',
            borderRadius: 'var(--bl-radius-pill)',
            alignSelf: 'flex-start',
          }}
        >
          {availableIntervals.map((iv) => {
            const active = iv === interval
            return (
              <button
                key={iv}
                role="tab"
                aria-selected={active}
                onClick={() => setInterval(iv)}
                style={{
                  padding: '6px 14px',
                  background: active ? 'var(--bl-accent)' : 'transparent',
                  color: active ? 'var(--bl-text-on-accent)' : 'var(--bl-text-muted)',
                  border: 'none',
                  borderRadius: 'var(--bl-radius-pill)',
                  fontFamily: 'var(--bl-font-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all var(--bl-duration-fast) var(--bl-ease-out-expo)',
                }}
              >
                {INTERVAL_LABELS[iv]}
                {iv === 'yearly' && yearlySave && (
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 9,
                      opacity: active ? 1 : 0.7,
                    }}
                  >
                    {yearlySave}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Price */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: 'clamp(2rem, 1.5rem + 1.5vw, 3rem)',
              fontWeight: 800,
              color: 'var(--bl-text)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {formatPrice(currentPrice.amount, currentPrice.currency)}
          </span>
          <span
            style={{
              fontFamily: 'var(--bl-font-body)',
              fontSize: 'var(--bl-text-small)',
              color: 'var(--bl-text-muted)',
            }}
          >
            {currentPrice.label ?? intervalSuffix}
          </span>
        </div>
      </div>

      {/* Features */}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'grid',
          gap: 8,
          flex: 1,
        }}
      >
        {features.map((f) => (
          <li
            key={f}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              fontFamily: 'var(--bl-font-body)',
              fontSize: 'var(--bl-text-small)',
              color: 'var(--bl-text)',
              lineHeight: 1.5,
            }}
          >
            <span
              aria-hidden="true"
              style={{ color: 'var(--bl-accent)', fontWeight: 700, flexShrink: 0 }}
            >
              ✓
            </span>
            {f}
          </li>
        ))}
        {excludes?.map((x) => (
          <li
            key={x}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              fontFamily: 'var(--bl-font-body)',
              fontSize: 'var(--bl-text-small)',
              color: 'var(--bl-text-subtle)',
              lineHeight: 1.5,
              textDecoration: 'line-through',
              opacity: 0.7,
            }}
          >
            <span aria-hidden="true" style={{ flexShrink: 0 }}>
              ✕
            </span>
            {x}
          </li>
        ))}
      </ul>

      {/* CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {currentCheckout?.checkout && (
          <>
            <a
              href={currentCheckout.checkout}
              className="bl-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Continue to checkout
              <span aria-hidden="true">→</span>
            </a>
            <p
              style={{
                fontSize: 11,
                color: 'var(--bl-text-subtle)',
                textAlign: 'center',
                margin: 0,
                marginTop: 2,
              }}
            >
              Crypto, PayPal/card, or bank wire — choose on next page.
            </p>
          </>
        )}
        {!currentCheckout?.checkout && currentCheckout?.crypto && (
          <a href={currentCheckout.crypto} className="bl-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Pay with crypto
            <span aria-hidden="true">→</span>
          </a>
        )}
        {!currentCheckout?.checkout && currentCheckout?.card && (
          <a href={currentCheckout.card} className="bl-btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
            Pay with card
          </a>
        )}
        {!currentCheckout?.checkout && !currentCheckout?.crypto && !currentCheckout?.card && (
          <div style={{ display: 'grid', gap: 8 }}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              disabled={checkoutState !== 'idle'}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--bl-border)',
                borderRadius: 'var(--bl-radius-sm)',
                background: 'var(--bl-bg)',
                color: 'var(--bl-text)',
                fontFamily: 'var(--bl-font-body)',
                fontSize: 13,
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: PAYPAL_CHECKOUT_ENABLED ? '1fr 1fr' : '1fr', gap: 8 }}>
              <button
                type="button"
                onClick={() => startDynamicCheckout('nowpayments')}
                disabled={checkoutState !== 'idle'}
                className="bl-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {checkoutState === 'submitting' && gateway === 'nowpayments' ? 'Opening…' : 'Pay crypto'}
              </button>
              {PAYPAL_CHECKOUT_ENABLED ? (
                <button
                  type="button"
                  onClick={() => startDynamicCheckout('paypal')}
                  disabled={checkoutState !== 'idle'}
                  className="bl-btn-ghost"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {checkoutState === 'submitting' && gateway === 'paypal' ? 'Opening…' : 'Pay card'}
                </button>
              ) : null}
            </div>
            {checkoutError ? <p style={{ margin: 0, color: 'var(--bl-danger)', fontSize: 12 }}>{checkoutError}</p> : null}
            {checkoutState === 'redirecting' ? <p style={{ margin: 0, color: 'var(--bl-text-muted)', fontSize: 12 }}>Redirecting…</p> : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default PricingTierCard




