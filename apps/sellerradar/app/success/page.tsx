'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { crossSellFor } from '@bizlegal/nurture-enqueue/cross-sell'

const C = {
  bg: '#07090e', surface: '#0d1118', border: '#1a2035', text: '#e8ecf4',
  muted: '#5a6278', dim: '#2e3450', amber: '#d4a843', amberBg: 'rgba(212,168,67,0.08)',
  red: '#c0392b', greenBg: 'rgba(39,174,96,0.08)',
  mono: '"DM Mono","Fira Code",ui-monospace,monospace',
  serif: '"Playfair Display",Georgia,serif',
  sans: '"DM Sans",system-ui,sans-serif',
}

function SuccessContent() {
  const params       = useSearchParams()
  const reportId     = params.get('report')       // SellerRadar order report_id
  const method       = params.get('method')
  const paypalToken  = params.get('token')        // PayPal order token on return
  const [status, setStatus] = useState<'capturing' | 'done' | 'error'>('capturing')
  const [reportRef, setReportRef] = useState<string | null>(null)
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    if (method === 'paypal' && paypalToken && reportId) {
      capturePayment()
    } else {
      // NOWPayments — payment confirmed on their end, webhook unlocks the report
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
          if (data.reportRef) setReportRef(data.reportRef)
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

      <div style={{ fontFamily: C.mono, fontSize: 20, letterSpacing: '0.12em', color: C.text, marginBottom: 48 }}>
        Seller<span style={{ color: C.amber }}>Radar</span>
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
          <a href="/analyze" style={{ padding: '12px 28px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, textDecoration: 'none', fontSize: 14, fontFamily: C.sans }}>
            ← Try Again
          </a>
        </div>
      )}

      {status === 'done' && (
        <div style={{ maxWidth: 560, width: '100%' }}>
          <div style={{ padding: '36px 40px', background: C.greenBg, border: `1px solid rgba(39,174,96,0.25)`, borderRadius: 16, textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>✓</div>
            <h1 style={{ fontFamily: C.serif, fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 10 }}>
              Payment Confirmed
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.65, marginBottom: 0 }}>
              Your per-SKU impact report is unlocked — the full breakdown is on
              its way to your inbox.
            </p>
          </div>

          {reportId && (
            <div style={{ padding: '20px 24px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Order ID</div>
              <div style={{ fontFamily: C.mono, fontSize: 18, color: C.amber }}>{reportId}</div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>Save this ID — it tracks your impact report</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {reportRef && (
              <a href={`/report/${reportRef}`} style={{
                flex: 1, display: 'block', padding: '13px', textAlign: 'center',
                background: C.amber, color: '#07090e',
                borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 700, fontFamily: C.sans,
              }}>
                View Impact Report →
              </a>
            )}
            <a href="/" style={{
              flex: 1, display: 'block', padding: '13px', textAlign: 'center',
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 8, textDecoration: 'none', color: C.muted, fontSize: 14, fontFamily: C.sans,
            }}>
              Back to SellerRadar
            </a>
          </div>

          <div style={{ marginTop: 28, padding: '24px 28px', background: C.amberBg, border: `1px solid ${C.amber}33`, borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>Amazon changes fees on a schedule</div>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>
              SellerRadar Monitor re-scans your catalog weekly when schedules update and emails you the personal dollar impact — $99/mo, cancel anytime.
            </p>
            <a href="/pricing"
              style={{ padding: '10px 24px', border: `1px solid ${C.amber}55`, background: C.amberBg, borderRadius: 8, color: C.amber, textDecoration: 'none', fontSize: 13, fontWeight: 700, fontFamily: C.sans }}>
              Set up monitoring →
            </a>
          </div>

          {/* Fleet cross-sell — other live products relevant to this buyer */}
          <div style={{ marginTop: 28, textAlign: 'left' }}>
            <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Also from the fleet
            </div>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {crossSellFor('sellerradar').map((offer) => (
                <a key={offer.url} href={offer.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', padding: '18px 20px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, textDecoration: 'none' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{offer.headline}</div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, marginBottom: 10 }}>{offer.blurb}</div>
                  <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber }}>{offer.product} · {offer.price} →</div>
                </a>
              ))}
            </div>
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
