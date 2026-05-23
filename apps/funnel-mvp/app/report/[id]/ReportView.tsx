'use client'

import { useEffect, useState } from 'react'

interface JobResponse {
  id: string
  user_email: string
  status: string
  doc_filename: string | null
  preview_text: string | null
  amount_cents: number
  currency: string
  paypal_order_id: string | null
  error_message: string | null
  full_report_key: string | null
  report_download_url: string | null
  created_at: string
  paid_at: string | null
}

interface Props {
  job: JobResponse
  cameFromPayPal: boolean
  wasCancelled: boolean
}

const POLL_INTERVAL_MS = 4_000

export function ReportView({ job: initialJob, cameFromPayPal, wasCancelled }: Props) {
  const [job, setJob] = useState<JobResponse>(initialJob)
  const [checkoutState, setCheckoutState] = useState<'idle' | 'starting' | 'redirecting' | 'error'>('idle')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  // Poll for status changes while in transitional states
  useEffect(() => {
    if (['full_report_ready', 'failed'].includes(job.status)) return
    if (!cameFromPayPal && !['payment_pending', 'paid', 'extracting'].includes(job.status)) return
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${job.id}`, { cache: 'no-store' })
        if (res.ok) {
          const data = (await res.json()) as JobResponse
          setJob(data)
        }
      } catch {
        // network blip; keep polling
      }
    }, POLL_INTERVAL_MS)
    return () => clearInterval(t)
  }, [job.id, job.status, cameFromPayPal])

  async function startCheckout() {
    setCheckoutState('starting')
    setCheckoutError(null)
    try {
      const res = await fetch('/api/payments/paypal/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      })
      const data = (await res.json().catch(() => ({}))) as { approve_url?: string; error?: string }
      if (!res.ok || !data.approve_url) {
        setCheckoutError(data.error ?? `checkout failed (${res.status})`)
        setCheckoutState('error')
        return
      }
      setCheckoutState('redirecting')
      window.location.assign(data.approve_url)
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'network error')
      setCheckoutState('error')
    }
  }

  const usd = (job.amount_cents / 100).toFixed(2)

  return (
    <>
      <span className="tag">Job · {job.id.slice(0, 8)}</span>
      <h1 style={{ marginTop: '1rem' }}>
        {job.status === 'full_report_ready'
          ? 'Your full report is ready.'
          : job.status === 'paid'
            ? 'Payment received — building your report…'
            : job.status === 'payment_pending'
              ? cameFromPayPal
                ? 'Confirming payment with PayPal…'
                : 'Awaiting payment'
              : job.status === 'preview_ready'
                ? 'Free preview ready.'
                : job.status === 'extracting'
                  ? 'Reviewing your contract…'
                  : job.status === 'failed'
                    ? 'Extraction failed.'
                    : 'Processing your upload…'}
      </h1>

      <p style={{ marginBottom: '1.5rem', fontSize: 13, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
        {job.doc_filename ?? 'document'} · uploaded {new Date(job.created_at).toLocaleString()}
      </p>

      {wasCancelled && (
        <div className="card" style={{ borderColor: 'var(--warn)' }}>
          <p style={{ margin: 0, color: 'var(--warn)' }}>
            You cancelled the PayPal checkout. No charge made. Click "Pay $97" below when ready.
          </p>
        </div>
      )}

      {job.status === 'failed' && (
        <div className="card" style={{ borderColor: 'var(--danger)' }}>
          <p style={{ margin: 0, color: 'var(--danger)' }}>
            {job.error_message ?? 'Extraction failed. Try a different document or contact team@bizlegal-ai.com.'}
          </p>
        </div>
      )}

      {job.preview_text && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Free preview</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)', margin: 0 }}>
            {job.preview_text}
          </pre>
        </div>
      )}

      {job.status === 'full_report_ready' && job.report_download_url && (
        <div className="card" style={{ borderColor: 'var(--success)' }}>
          <h2 style={{ marginTop: 0, color: 'var(--success)' }}>Full report ready</h2>
          <p>The signed download link is valid for 1 hour. Refresh this page to get a fresh link.</p>
          <a className="btn" href={job.report_download_url}>
            Download PDF →
          </a>
          {job.paid_at && (
            <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: 12, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
              Paid {new Date(job.paid_at).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {['preview_ready', 'payment_pending'].includes(job.status) && job.status !== 'full_report_ready' && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Get the full report</h2>
          <p>
            Every issue across all 4 buckets (clauses, anomalies, missing protections, ambiguities), ranked by severity, with remediation guidance. PDF delivered immediately after PayPal confirms.
          </p>
          {checkoutError && (
            <p role="alert" style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>
              {checkoutError}
            </p>
          )}
          <button
            className="btn"
            onClick={startCheckout}
            disabled={checkoutState === 'starting' || checkoutState === 'redirecting'}
          >
            {checkoutState === 'idle' && `Pay $${usd} via PayPal →`}
            {checkoutState === 'starting' && 'Creating PayPal order…'}
            {checkoutState === 'redirecting' && 'Redirecting to PayPal…'}
            {checkoutState === 'error' && 'Try again'}
          </button>
          <p style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: 11, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
            One-time payment · no subscription · refund on request within 7 days
          </p>
        </div>
      )}

      {(['extracting', 'paid'].includes(job.status) || (cameFromPayPal && job.status === 'payment_pending')) && (
        <div className="card">
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            Auto-refreshing every {POLL_INTERVAL_MS / 1000}s · this page will update when the next stage completes.
          </p>
        </div>
      )}
    </>
  )
}
