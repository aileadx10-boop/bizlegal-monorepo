'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const C = {
  bg: '#07090e', surface: '#0d1118', border: '#1a2035', text: '#e8ecf4',
  muted: '#5a6278', dim: '#2e3450', amber: '#d4a843', amberBg: 'rgba(212,168,67,0.08)',
  red: '#c0392b', green: '#27ae60', greenBg: 'rgba(39,174,96,0.08)',
  mono: '"DM Mono","Fira Code",ui-monospace,monospace',
  serif: '"Playfair Display",Georgia,serif',
  sans: '"DM Sans",system-ui,sans-serif',
}

function SuccessContent() {
  const params       = useSearchParams()
  const reportId     = params.get('report')
  const method       = params.get('method')
  const paypalToken  = params.get('token')        // PayPal order token on return
  const [status, setStatus] = useState<'capturing' | 'done' | 'error'>('capturing')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    if (method === 'paypal' && paypalToken && reportId) {
      capturePayment()
    } else {
      // NOWPayments — payment confirmed on their end, just show success
      setStatus('done')
    }

    async function capturePayment() {
      try {
        const res = await fetch('/api/paypal-capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: paypalToken, reportId }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          setErrMsg(data.error || 'Payment capture failed.')
          setStatus('error')
        } else {
          setStatus('done')
        }
      } catch {
        setErrMsg('Network error. Please contact support.')
        setStatus('error')
      }
    }
  }, [method, paypalToken, reportId])

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: C.sans, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Logo */}
      <div style={{ fontFamily: C.mono, fontSize: 20, letterSpacing: '0.12em', color: C.text, marginBottom: 48 }}>
        TRA<span style={{ color: C.amber }}>C</span>R
      </div>

      {status === 'capturing' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: `1.5px solid ${C.amber}`, borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite', margin: '0 auto 20px' }} />
          <div style={{ fontFamily: C.mono, fontSize: 12, color: C.muted, letterSpacing: '0.12em' }}>Confirming payment…</div>
        </div>
      )}

      {status === 'error' && (
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontFamily: C.serif, fontSize: 22, color: C.red, marginBottom: 12 }}>Payment Issue</h2>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.65 }}>{errMsg}</p>
          <a href="/scan" style={{ padding: '12px 28px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, textDecoration: 'none', fontSize: 14, fontFamily: C.sans }}>
            ← Try Again
          </a>
        </div>
      )}

      {status === 'done' && (
        <div style={{ maxWidth: 560, width: '100%' }}>
          {/* Success card */}
          <div style={{ padding: '36px 40px', background: C.greenBg, border: `1px solid rgba(39,174,96,0.25)`, borderRadius: 16, textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>✓</div>
            <h1 style={{ fontFamily: C.serif, fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 10 }}>
              Payment Confirmed
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.65, marginBottom: 0 }}>
              Your forensic report is being generated. You&apos;ll receive it by email within 48 hours, or often much faster.
            </p>
          </div>

          {/* Report ID */}
          {reportId && (
            <div style={{ padding: '20px 24px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Report ID</div>
              <div style={{ fontFamily: C.mono, fontSize: 18, color: C.amber }}>{reportId}</div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>Save this ID to track your report status</div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {reportId && (
              <a href={`/report/${reportId}`} style={{
                flex: 1, display: 'block', padding: '13px', textAlign: 'center',
                background: C.amber, color: '#07090e',
                borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 700, fontFamily: C.sans,
              }}>
                View Report →
              </a>
            )}
            <a href="/analyze" style={{
              flex: 1, display: 'block', padding: '13px', textAlign: 'center',
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 8, textDecoration: 'none', color: C.muted, fontSize: 14, fontFamily: C.sans,
            }}>
              Analyze Another Wallet
            </a>
          </div>

          {/* Keep-watching upsell — self-serve, no calendar */}
          <div style={{ marginTop: 28, padding: '24px 28px', background: C.amberBg, border: `1px solid ${C.amber}33`, borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>Keep this wallet under watch</div>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>
              Screen it against the OFAC, UN and EU sanctions lists every day and get an email the moment a new match appears — $29/mo, cancel anytime.
            </p>
            <a href="https://bizlegal-ai.com/tools/ofac-watcher"
              style={{ padding: '10px 24px', border: `1px solid ${C.amber}55`, background: C.amberBg, borderRadius: 8, color: C.amber, textDecoration: 'none', fontSize: 13, fontWeight: 700, fontFamily: C.sans }}>
              Set up daily monitoring →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07090e' }} />}>
      <SuccessContent />
    </Suspense>
  )
}
