'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * /payment/cancelled — cancel_url landing target for both gateways
 * (PayPal application_context.cancel_url in
 * app/api/payments/paypal/start/route.ts and NOWPayments cancel_url in
 * app/api/payments/nowpayments/start/route.ts both redirect here with
 * ?order=<id>). The payment was abandoned before completion — reassure the
 * buyer they were not charged and route them back to pricing.
 */
function CancelledContent() {
  const params = useSearchParams()
  const orderId = params?.get('order')

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '96px 24px 96px' }}>
      <div style={{
        padding: '36px 40px', textAlign: 'center',
        background: 'rgba(255,120,120,0.06)', border: '1px solid rgba(255,120,120,0.25)', borderRadius: 16,
      }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>✕</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
          Payment Cancelled
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(218,226,253,0.7)', lineHeight: 1.7, marginBottom: 4 }}>
          The payment was cancelled before completion — you have not been charged.
          You can restart checkout whenever you&apos;re ready.
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
            Include this reference if you contact support about this checkout.
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <a href="/pricing" style={{
          display: 'inline-block', padding: '13px 28px', borderRadius: 8, textDecoration: 'none',
          background: 'linear-gradient(135deg, #b3c5ff, #6288ff)', color: '#0b1326', fontSize: 14, fontWeight: 700,
        }}>
          ← Back to Pricing
        </a>
      </div>

      <p style={{ marginTop: 32, textAlign: 'center', fontSize: 13, color: 'rgba(218,226,253,0.45)', lineHeight: 1.7 }}>
        Questions? Email{' '}
        <a href="mailto:info@bizlegal-ai.com" style={{ color: '#b3c5ff' }}>info@bizlegal-ai.com</a>
        {orderId ? ' and include the order reference above' : ''}.
      </p>
    </main>
  )
}

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={<main style={{ maxWidth: 640, margin: '0 auto', padding: '96px 24px' }} />}>
      <CancelledContent />
    </Suspense>
  )
}
