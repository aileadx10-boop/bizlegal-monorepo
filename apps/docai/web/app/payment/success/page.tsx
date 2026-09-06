'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { crossSellFor } from '@bizlegal/nurture-enqueue/cross-sell'

/**
 * /payment/success — landing target for the payment_orders checkout flow.
 *
 * NOWPayments invoices redirect here on success
 * (web/app/api/payments/nowpayments/start/route.ts) and the PayPal return
 * route (/payment/paypal/return) redirects here after capturing the order.
 * Payment confirmation itself is server-side (IPN webhook / PayPal
 * capture); this page only needs to reassure the buyer and show the
 * order reference.
 */
function SuccessContent() {
  const params = useSearchParams()
  const orderId = params?.get('order')
  const paypalError = params?.get('paypal_error')

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '96px 24px 96px' }}>
      {paypalError ? (
        <div style={{
          padding: '36px 40px', textAlign: 'center',
          background: 'rgba(255,120,120,0.06)', border: '1px solid rgba(255,120,120,0.25)', borderRadius: 16,
        }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
            Payment Issue
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(218,226,253,0.6)', lineHeight: 1.7, marginBottom: 20 }}>
            We couldn&apos;t confirm your PayPal payment ({paypalError.replaceAll('_', ' ')}). If the charge went
            through, email <a href="mailto:info@bizlegal-ai.com" style={{ color: '#b3c5ff' }}>info@bizlegal-ai.com</a>
            {orderId ? <> with order <code style={{ fontFamily: "'DM Mono', monospace" }}>{orderId}</code></> : null} and we&apos;ll activate it manually.
          </p>
          <a href="/pricing" style={{
            display: 'inline-block', padding: '12px 28px', borderRadius: 8, textDecoration: 'none',
            border: '1px solid rgba(218,226,253,0.15)', color: '#dae2fd', fontSize: 14, fontWeight: 600,
          }}>
            ← Back to Pricing
          </a>
        </div>
      ) : (
        <>
          <div style={{
            padding: '36px 40px', textAlign: 'center',
            background: 'rgba(120,255,180,0.06)', border: '1px solid rgba(120,255,180,0.25)', borderRadius: 16,
          }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>✓</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
              Payment Received
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(218,226,253,0.7)', lineHeight: 1.7 }}>
              Thank you — your order is being confirmed. Crypto payments activate as soon as the transaction
              confirms on-chain; you&apos;ll receive everything at the email you used at checkout.
            </p>
          </div>

          {orderId && (
            <div style={{
              marginTop: 20, padding: '20px 24px', textAlign: 'center',
              background: 'rgba(218,226,253,0.04)', border: '1px solid rgba(218,226,253,0.08)', borderRadius: 12,
            }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'rgba(218,226,253,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
                Order Reference
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, color: '#b3c5ff', wordBreak: 'break-all' }}>{orderId}</div>
              <div style={{ fontSize: 12, color: 'rgba(218,226,253,0.35)', marginTop: 6 }}>
                Save this reference — it identifies your order if you contact support.
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <a href="/" style={{
              display: 'inline-block', padding: '13px 28px', borderRadius: 8, textDecoration: 'none',
              background: 'linear-gradient(135deg, #b3c5ff, #6288ff)', color: '#0b1326', fontSize: 14, fontWeight: 700,
            }}>
              Back to DocAI →
            </a>
          </div>

          {/* Fleet cross-sell — other live products relevant to this buyer */}
          <div style={{ marginTop: 40 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'rgba(218,226,253,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Also from the fleet
            </div>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {crossSellFor('docai').map((offer) => (
                <a key={offer.url} href={offer.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '18px 20px', borderRadius: 12, textDecoration: 'none',
                    background: 'rgba(218,226,253,0.04)', border: '1px solid rgba(218,226,253,0.08)',
                  }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#dae2fd', marginBottom: 4 }}>{offer.headline}</div>
                  <div style={{ fontSize: 12, color: 'rgba(218,226,253,0.55)', lineHeight: 1.55, marginBottom: 10 }}>{offer.blurb}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#b3c5ff' }}>{offer.product} · {offer.price} →</div>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<main style={{ maxWidth: 640, margin: '0 auto', padding: '96px 24px' }} />}>
      <SuccessContent />
    </Suspense>
  )
}
