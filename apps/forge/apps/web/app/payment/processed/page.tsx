// app/payment/processed/page.tsx
// PayPal redirects here after user approves payment
// This page polls /api/payment/status to confirm payment, then redirects

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function PaymentProcessedContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order_id') ?? ''
  const referenceId = searchParams.get('reference_id') ?? ''
  const referenceType = searchParams.get('type') ?? 'passport'

  const [status, setStatus] = useState<'polling' | 'success' | 'failed' | 'pending'>('polling')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderId || !referenceId) {
      setStatus('failed')
      setError('Missing payment information')
      return
    }

    async function checkStatus() {
      try {
        const res = await fetch(
          `/api/payment/status?order_id=${encodeURIComponent(orderId)}&reference_id=${encodeURIComponent(referenceId)}&reference_type=${encodeURIComponent(referenceType)}`
        )
        const data = await res.json()

        if (data.paid || data.status === 'completed') {
          setStatus('success')
          setTimeout(() => {
            router.push(data.redirect_url ?? '/passport/success')
          }, 1500)
        } else if (data.status === 'pending' || data.status === 'pending_verification') {
          setStatus('pending')
          setTimeout(checkStatus, 3000)
        } else {
          setStatus('failed')
          setError(data.error ?? 'Payment not confirmed')
        }
      } catch {
        setError('Failed to verify payment')
      }
    }

    checkStatus()
  }, [orderId, referenceId, referenceType, router])

  return (
    <div className="max-w-lg mx-auto px-6 py-24 text-center">
      {status === 'polling' && (
        <>
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <h1 className="text-2xl font-bold text-white mb-3">Confirming Payment...</h1>
          <p className="text-forge-muted">Verifying your PayPal payment. Please wait.</p>
        </>
      )}
      {status === 'pending' && (
        <>
          <div className="text-4xl mb-4">🕐</div>
          <h1 className="text-2xl font-bold text-white mb-3">Payment Pending</h1>
          <p className="text-forge-muted">
            PayPal is still processing. This usually takes a few seconds.
            We&apos;ll confirm and start your assessment automatically.
          </p>
          <p className="text-forge-muted text-sm mt-4">This page updates automatically.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="text-5xl mb-6">✅</div>
          <h1 className="text-2xl font-bold text-white mb-3">Payment Confirmed!</h1>
          <p className="text-forge-muted">Redirecting you to your results...</p>
        </>
      )}
      {status === 'failed' && (
        <>
          <div className="text-5xl mb-6">❌</div>
          <h1 className="text-2xl font-bold text-white mb-3">Payment Issue</h1>
          <p className="text-forge-muted mb-4">{error || 'We could not confirm your payment.'}</p>
          <button onClick={() => router.back()} className="btn-primary">
            Return and Try Again
          </button>
        </>
      )}
    </div>
  )
}

export default function PaymentProcessedPage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="text-4xl animate-pulse">⏳</div>
        <p className="text-forge-muted mt-4">Loading...</p>
      </div>
    }>
      <PaymentProcessedContent />
    </Suspense>
  )
}
