// app/audit/success/page.tsx
// NOWPayments redirects here after a crypto payment for a full scan report
// (success_url set in /api/payment/crypto and /api/scan/checkout).
// The IPN webhook flips the scan to paid and fires /api/scan/report, which
// generates the report and emails the delivery link — this page polls
// /api/payment/status until that lands.

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function AuditSuccessContent() {
  const searchParams = useSearchParams()
  const scanId = searchParams.get('id') ?? ''

  const [status, setStatus] = useState<'polling' | 'confirmed' | 'pending'>('polling')

  useEffect(() => {
    if (!scanId) {
      setStatus('pending')
      return
    }

    let cancelled = false
    let attempts = 0

    async function checkStatus() {
      try {
        const res = await fetch(
          `/api/payment/status?reference_id=${encodeURIComponent(scanId)}&reference_type=scan`
        )
        const data = await res.json()
        if (cancelled) return
        if (data.paid) {
          setStatus('confirmed')
          return
        }
        // Crypto confirmations can take a few minutes; keep polling gently.
        attempts += 1
        if (attempts < 40) setTimeout(checkStatus, 5000)
        else setStatus('pending')
      } catch {
        if (!cancelled) setStatus('pending')
      }
    }

    checkStatus()
    return () => {
      cancelled = true
    }
  }, [scanId])

  return (
    <div className="max-w-lg mx-auto px-6 py-24 text-center">
      {status === 'polling' && (
        <>
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <h1 className="text-2xl font-bold text-white mb-3">Confirming Payment...</h1>
          <p className="text-forge-muted">
            Waiting for the network to confirm your crypto payment. This usually takes a few
            minutes — this page updates automatically.
          </p>
        </>
      )}
      {status === 'confirmed' && (
        <>
          <div className="text-5xl mb-6">✅</div>
          <h1 className="text-2xl font-bold text-white mb-3">Payment Confirmed</h1>
          <p className="text-forge-muted mb-8">
            Your full compliance report is being generated now and will arrive at the email
            address you provided. Check your inbox (and spam folder) shortly.
          </p>
        </>
      )}
      {status === 'pending' && (
        <>
          <div className="text-4xl mb-4">🕐</div>
          <h1 className="text-2xl font-bold text-white mb-3">Payment Processing</h1>
          <p className="text-forge-muted mb-8">
            We haven&apos;t seen the network confirmation yet. As soon as the payment confirms,
            your full report is generated and emailed to you automatically — no action needed.
          </p>
        </>
      )}

      <div className="flex gap-4 flex-wrap justify-center mt-4">
        <Link href="/audit" className="btn-primary inline-block">
          Run Another Scan &rarr;
        </Link>
        <Link
          href="/"
          className="px-6 py-3 border border-forge-border text-forge-muted rounded-lg text-sm hover:border-forge-accent transition-colors inline-block"
        >
          &larr; Back to Forge
        </Link>
      </div>

      <p className="text-xs text-forge-muted mt-10 leading-relaxed">
        Regulatory intelligence, not legal advice. Confirm your specific situation with qualified
        counsel.
      </p>
    </div>
  )
}

export default function AuditSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="text-4xl animate-pulse">⏳</div>
        <p className="text-forge-muted mt-4">Loading...</p>
      </div>
    }>
      <AuditSuccessContent />
    </Suspense>
  )
}
