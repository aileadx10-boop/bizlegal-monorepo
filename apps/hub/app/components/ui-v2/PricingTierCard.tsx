'use client'

import { useState } from 'react'

export type BillingInterval = 'one-time' | 'monthly' | 'yearly'

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
   * CTA targets per interval. Three forms supported (any combination):
   *
   *   `checkout` — Unified /checkout URL (preferred since 2026-05-20).
   *                Points to the apex checkout page which handles all
   *                gateways via API — no per-product dashboard URL setup.
   *                When present, renders a single primary "Continue to
   *                checkout" button.
   *
   *   `crypto`   — Direct NOWPayments hosted invoice URL (legacy).
   *   `card`     — Direct PayPal hosted approve URL (legacy).
   *                When `checkout` is absent and these are set, falls back
   *                to the dual-button "Pay with crypto / Pay with card"
   *                presentation. Kept for backwards compat with subdomains
   *                still using static env URLs.
   *
   * If none are set → "Checkout coming soon" disabled button.
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
        {currentCheckout?.checkout ? (
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
              Crypto or PayPal/card — choose on next page.
            </p>
          </>
        ) : (
          <>
            {currentCheckout?.crypto && (
              <a href={currentCheckout.crypto} className="bl-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Pay with crypto
                <span aria-hidden="true">→</span>
              </a>
            )}
            {currentCheckout?.card && (
              <a href={currentCheckout.card} className="bl-btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                Pay with card
              </a>
            )}
            {!currentCheckout?.crypto && !currentCheckout?.card && (
              <button
                type="button"
                disabled
                className="bl-btn-ghost"
                style={{ width: '100%', justifyContent: 'center', opacity: 0.5, cursor: 'not-allowed' }}
              >
                Checkout coming soon
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PricingTierCard
