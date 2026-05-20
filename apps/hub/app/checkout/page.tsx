/**
 * Unified Checkout Page — 2026-05-20
 *
 * Single front door for EVERY product across EVERY subdomain.
 *
 * Why this exists:
 *   The pricing pages used to embed static hosted-checkout URLs per product
 *   (NEXT_PUBLIC_NOWPAYMENTS_<SKU>_URL × ~30 SKUs, NEXT_PUBLIC_PAYPAL_<SKU>_URL ×
 *   ~30 SKUs). That required Moses to generate ~60 invoice URLs in dashboards
 *   before any product could accept money. After LS rejected the 4th application
 *   2026-05-20, that path is no longer viable.
 *
 *   This page replaces all of that with API-driven invoice creation:
 *     - NOWPayments: one API call creates a fresh invoice for any product/price.
 *       Needs only NOWPAYMENTS_API_KEY in env.
 *     - PayPal Orders v2 (one-time): one API call creates a fresh order. Needs
 *       only PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET + PAYPAL_ENV=live.
 *     - PayPal Subscriptions (recurring): needs per-product Plan ID in env;
 *       falls back gracefully if not configured.
 *     - Paddle: needs per-product Price ID in env; falls back gracefully.
 *
 *   So with ZERO per-product dashboard config, every product can take crypto
 *   AND one-time card payments via PayPal. Recurring/Paddle activate as the
 *   per-product env vars land.
 *
 * URL contract:
 *   /checkout?product=<slug>&tier=<slug>&interval=one-time|monthly|yearly&amount=<cents>&name=<display>
 *
 * All subdomain pricing pages link here (https://bizlegal-ai.com/checkout?...)
 * — centralised so we don't replicate gateway logic per subdomain and so the
 * MoR-facing checkout domain stays a single one.
 */
'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Interval = 'one-time' | 'monthly' | 'yearly'

interface CheckoutParams {
  product: string
  tier: string
  interval: Interval
  amountCents: number
  displayName: string
}

function parseParams(sp: URLSearchParams): CheckoutParams | { error: string } {
  const product = sp.get('product')?.trim() || ''
  const tier = sp.get('tier')?.trim() || ''
  const intervalRaw = (sp.get('interval')?.trim() || 'one-time') as Interval
  const amountStr = sp.get('amount')?.trim() || ''
  const displayName = sp.get('name')?.trim() || ''

  if (!product || !tier || !amountStr) {
    return { error: 'Missing required parameter (product, tier, amount).' }
  }
  if (!['one-time', 'monthly', 'yearly'].includes(intervalRaw)) {
    return { error: `Invalid interval: ${intervalRaw}` }
  }
  const amountCents = Number(amountStr)
  if (!Number.isFinite(amountCents) || amountCents < 50 || amountCents > 100000_00) {
    return { error: 'Amount out of acceptable range.' }
  }
  return {
    product,
    tier,
    interval: intervalRaw,
    amountCents,
    displayName: displayName || `${product} ${tier} ${intervalRaw}`,
  }
}

function CheckoutInner() {
  const sp = useSearchParams()
  const parsed = sp ? parseParams(new URLSearchParams(sp.toString())) : { error: 'No params' }
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState<null | 'crypto' | 'paypal'>(null)
  const [err, setErr] = useState<string | null>(null)

  // Reset error when user starts typing
  useEffect(() => {
    if (err) setErr(null)
  }, [email, err])

  if ('error' in parsed) {
    return (
      <main style={{ padding: '4rem 1.5rem', maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Checkout link invalid
        </h1>
        <p style={{ color: 'var(--bl-text-muted)', marginBottom: '1.25rem' }}>
          {parsed.error} Please return to the pricing page and click the product button again.
        </p>
        <Link href="/pricing" className="bl-btn-primary">
          Back to pricing
        </Link>
      </main>
    )
  }

  const { product, tier, interval, amountCents, displayName } = parsed
  const priceLabel = `$${(amountCents / 100).toLocaleString('en-US')}${
    interval === 'monthly' ? ' / month' : interval === 'yearly' ? ' / year' : ''
  }`

  async function pay(gateway: 'crypto' | 'paypal') {
    if (!email || !email.includes('@')) {
      setErr('Please enter a valid email so we can deliver your receipt and product.')
      return
    }
    setBusy(gateway)
    setErr(null)
    try {
      const endpoint =
        gateway === 'crypto'
          ? '/api/payments/nowpayments/start'
          : '/api/payments/paypal/start'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          product,
          tier,
          interval,
          amount_cents: amountCents,
          email,
          source: 'checkout_page',
        }),
      })
      const data = (await res.json()) as {
        invoice_url?: string
        approve_url?: string
        error?: string
      }
      if (!res.ok) {
        setErr(data.error || `Payment gateway error (${res.status}). Please try the other method below.`)
        setBusy(null)
        return
      }
      const redirect = data.invoice_url || data.approve_url
      if (!redirect) {
        setErr('Gateway did not return a checkout URL. Please try the other method below.')
        setBusy(null)
        return
      }
      window.location.href = redirect
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Network error. Please try again.')
      setBusy(null)
    }
  }

  // PayPal recurring (monthly/yearly) only works when a Plan ID is configured
  // server-side. We optimistically expose the button — if the start route
  // returns 503 ("PAYPAL_PLAN_ID_… not configured") the user sees a clear
  // fallback message and can use crypto.
  const paypalAvailable = true
  const paypalDisabledNote =
    interval !== 'one-time' && false
      ? 'PayPal subscription for this product not yet activated — use crypto.'
      : null

  return (
    <main
      style={{
        padding: 'clamp(2rem, 4vw, 4rem) 1.5rem',
        maxWidth: 640,
        margin: '0 auto',
      }}
    >
      <Link
        href="/pricing"
        style={{
          fontFamily: 'var(--bl-font-mono)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--bl-text-muted)',
          textDecoration: 'none',
        }}
      >
        ← Back to pricing
      </Link>
      <h1
        style={{
          fontFamily: 'var(--bl-font-display)',
          fontSize: 'clamp(1.5rem, 1rem + 1.5vw, 2rem)',
          fontWeight: 800,
          color: 'var(--bl-text)',
          margin: '1rem 0 0.5rem',
          letterSpacing: '-0.02em',
        }}
      >
        Checkout — {displayName}
      </h1>
      <p
        style={{
          color: 'var(--bl-text-muted)',
          fontSize: '1.05rem',
          marginBottom: '2rem',
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: 'var(--bl-text)' }}>{priceLabel}</strong> USD.{' '}
        {interval === 'one-time'
          ? 'One-time payment. Non-refundable once delivered.'
          : 'Cancel anytime; access continues to end of paid period.'}
      </p>

      {/* Email */}
      <label
        htmlFor="email"
        style={{
          display: 'block',
          fontFamily: 'var(--bl-font-mono)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--bl-text-muted)',
          marginBottom: 8,
        }}
      >
        Email — for receipt & delivery
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        style={{
          width: '100%',
          padding: '12px 14px',
          fontSize: '1rem',
          fontFamily: 'var(--bl-font-body)',
          border: '1px solid var(--bl-border)',
          borderRadius: 'var(--bl-radius-md)',
          background: 'var(--bl-surface)',
          color: 'var(--bl-text)',
          marginBottom: '1.5rem',
        }}
      />

      {err && (
        <div
          role="alert"
          style={{
            padding: '12px 14px',
            background: 'var(--bl-danger-soft, #fee)',
            color: 'var(--bl-danger, #b00)',
            border: '1px solid var(--bl-danger, #b00)',
            borderRadius: 'var(--bl-radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            lineHeight: 1.4,
          }}
        >
          {err}
        </div>
      )}

      {/* Pay buttons */}
      <div style={{ display: 'grid', gap: 12 }}>
        <button
          onClick={() => pay('crypto')}
          disabled={busy !== null}
          className="bl-btn-primary"
          style={{
            width: '100%',
            padding: '14px 20px',
            fontSize: '1rem',
            fontWeight: 600,
            justifyContent: 'center',
            opacity: busy && busy !== 'crypto' ? 0.5 : 1,
            cursor: busy ? 'wait' : 'pointer',
          }}
        >
          {busy === 'crypto' ? 'Creating crypto invoice…' : `Pay ${priceLabel} with Crypto`}
        </button>
        {paypalAvailable && (
          <button
            onClick={() => pay('paypal')}
            disabled={busy !== null}
            className="bl-btn-ghost"
            style={{
              width: '100%',
              padding: '14px 20px',
              fontSize: '1rem',
              fontWeight: 600,
              justifyContent: 'center',
              opacity: busy && busy !== 'paypal' ? 0.5 : 1,
              cursor: busy ? 'wait' : 'pointer',
            }}
          >
            {busy === 'paypal' ? 'Creating PayPal order…' : `Pay ${priceLabel} with PayPal / Card`}
          </button>
        )}
        {paypalDisabledNote && (
          <p style={{ fontSize: 13, color: 'var(--bl-text-subtle)', margin: 0 }}>
            {paypalDisabledNote}
          </p>
        )}
      </div>

      {/* Trust footer */}
      <div
        style={{
          marginTop: '2.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--bl-divider)',
          fontSize: '0.85rem',
          color: 'var(--bl-text-subtle)',
          lineHeight: 1.6,
        }}
      >
        <p style={{ margin: '0 0 0.5rem' }}>
          <strong style={{ color: 'var(--bl-text-muted)' }}>BizLegal AI</strong> is a software
          tool operated by DOR INNOVATIONS. It provides research and monitoring; it is not a law
          firm and does not provide legal advice. See <Link href="/disclaimer">disclaimer</Link>{' '}
          and <Link href="/terms">terms</Link>.
        </p>
        <p style={{ margin: 0 }}>
          Refunds: <Link href="/refund">refund policy</Link>. Questions:{' '}
          <a href="mailto:team@bizlegal-ai.com">team@bizlegal-ai.com</a>.
        </p>
      </div>
    </main>
  )
}

// Suspense boundary — Next 14 requires useSearchParams to be wrapped.
export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
          <p>Loading checkout…</p>
        </main>
      }
    >
      <CheckoutInner />
    </Suspense>
  )
}
