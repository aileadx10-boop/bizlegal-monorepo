'use client'

import { useState } from 'react'
import Link from 'next/link'

const VERTICALS = [
  { id: 'cipa', label: 'CIPA §631', description: 'CA wiretapping — pre-consent tracker detection', price: 999 },
  { id: 'gpc', label: 'GPC Signal', description: 'CCPA/CPA — Global Privacy Control non-compliance', price: 999 },
  { id: 'mhmda', label: 'WA MHMDA', description: 'WA health data — My Health My Data Act', price: 999 },
  { id: 'gdpr', label: 'GDPR', description: 'EU/UK cookie consent compliance', price: 999 },
  { id: 'sms', label: '10DLC SMS', description: 'FCC TCPA — SMS marketing 10DLC compliance', price: 149 },
  { id: 'tdpsa', label: 'TX TDPSA', description: 'Texas Data Privacy Act — HB 4 compliance', price: 299 },
  { id: 'iso27001', label: 'ISO 27001', description: 'Information security management readiness', price: 999 },
  { id: 'gipa', label: 'GIPA (IL)', description: 'Illinois HR document — genetic privacy violations', price: 2999 },
  { id: 'edtech', label: 'EdTech §49073.1', description: 'CA student data privacy — COPPA-adjacent', price: 1999 },
  { id: 'surplus', label: 'Surplus Funds', description: 'Unclaimed property — qualify for attorney routing', price: 800 },
]

const VERTICAL_PRICES: Record<string, { crypto: number; card: number }> = {
  cipa: { crypto: 97, card: 119 }, gpc: { crypto: 97, card: 119 },
  mhmda: { crypto: 97, card: 119 }, gdpr: { crypto: 97, card: 119 },
  sms: { crypto: 15, card: 18 }, tdpsa: { crypto: 29, card: 36 },
  iso27001: { crypto: 97, card: 119 }, gipa: { crypto: 290, card: 360 },
  edtech: { crypto: 195, card: 240 }, surplus: { crypto: 78, card: 96 },
}

type Step = 'scan' | 'payment'

interface PaymentOptions {
  crypto: { invoiceUrl: string; amount_usd: number }
  payoneer: { link: string; amount_usd: number }
}

export default function AuditPage() {
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [vertical, setVertical] = useState('cipa')
  const [step, setStep] = useState<Step>('scan')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | {
    scan_id: string
    risk_level: string
    violation: boolean
    exposure_min: number
    exposure_max: number
    findings: string[]
  }>(null)
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptions | null>(null)
  const [error, setError] = useState('')

  async function handleScan(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)

    if (vertical === 'surplus') {
      window.location.href = '/surplus'
      return
    }

    if (!url || !email) {
      setError('URL and email are required.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email, vertical }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Scan failed.')
        return
      }
      setResult(data)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckout() {
    if (!result?.scan_id) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/scan/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_id: result.scan_id, email, vertical }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Checkout failed.')
        return
      }
      if (data.payment_options) {
        setPaymentOptions(data.payment_options)
        setStep('payment')
      } else if (data.checkout_url) {
        window.location.href = data.checkout_url
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const currentPrice = VERTICAL_PRICES[vertical]

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-forge-muted mb-6">
        <Link href="/" className="hover:text-forge-accent">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-white">Compliance Scanner</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-forge-accent/10 border border-forge-accent/20 text-forge-accent text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          🔍 FREE PREVIEW SCAN
        </div>
        <h1 className="text-3xl font-bold text-white mt-2 mb-3">Web Compliance Scanner</h1>
        <p className="text-forge-muted">
          Detect regulatory exposure before enforcement does. Free preview scan — pay only for the full report.
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-forge-muted">
          <span className="flex items-center gap-1"><span className="text-green-400">✓</span> Free preview</span>
          <span className="flex items-center gap-1"><span className="text-green-400">✓</span> 10+ verticals</span>
          <span className="flex items-center gap-1"><span className="text-green-400">✓</span> Fix scripts included</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-forge-muted mb-2">
          <span className={step === 'scan' ? 'text-forge-accent font-semibold' : ''}>Step 1: Scan</span>
          <span className={step === 'payment' ? 'text-forge-accent font-semibold' : ''}>Step 2: Full Report</span>
        </div>
        <div className="h-2 bg-forge-card rounded-full overflow-hidden">
          <div
            className="h-full bg-forge-accent transition-all duration-500"
            style={{ width: step === 'scan' ? '50%' : '100%' }}
          />
        </div>
      </div>

      {/* STEP 1: Scan */}
      {step === 'scan' && (
        <>
          <form onSubmit={handleScan} className="card space-y-4 mb-6">
            <div>
              <label className="label">Website URL *</label>
              <input type="url" className="input-field" placeholder="https://yoursite.com"
                value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <div>
              <label className="label">Your Email *</label>
              <input type="email" className="input-field" placeholder="you@company.com"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Compliance Check</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {VERTICALS.map((v) => (
                  <button key={v.id} type="button" onClick={() => setVertical(v.id)}
                    className={`text-left p-3 rounded-lg border transition-colors ${vertical === v.id ? 'border-forge-accent bg-forge-accent/10 text-white' : 'border-forge-border text-forge-muted hover:border-forge-accent'}`}>
                    <div className="font-semibold text-sm">{v.label}</div>
                    <div className="text-xs mt-0.5 opacity-75">{v.description}</div>
                  </button>
                ))}
              </div>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Scanning...' : 'Run Free Scan'}
            </button>
          </form>

          {result && (
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white">Scan Preview</h2>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  result.risk_level === 'critical' ? 'bg-red-500/20 text-red-400' :
                  result.risk_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  result.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {result.risk_level?.toUpperCase()} RISK
                </span>
              </div>
              {result.violation && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 font-semibold text-sm">Potential exposure detected</p>
                  <p className="text-forge-muted text-sm mt-1">
                    Estimated: ${result.exposure_min?.toLocaleString()} – ${result.exposure_max?.toLocaleString()}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                {result.findings.slice(0, 2).map((f: string, i: number) => (
                  <div key={i} className="text-sm text-forge-muted border-l-2 border-forge-border pl-3">{f}</div>
                ))}
                {result.findings.length > 2 && (
                  <div className="text-sm text-forge-muted italic">+ {result.findings.length - 2} more findings...</div>
                )}
              </div>
              <div className="pt-2 border-t border-forge-border">
                <button onClick={handleCheckout} disabled={loading} className="btn-primary w-full">
                  Get Full Report — ${currentPrice?.card ?? 119} card / ${currentPrice?.crypto ?? 97} crypto
                </button>
                <p className="text-xs text-forge-muted text-center mt-2">
                  Includes fix scripts, policy addendum, and remediation guide.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* STEP 2: Payment */}
      {step === 'payment' && paymentOptions && (
        <div className="card space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Get Full Compliance Report</h2>
            <p className="text-forge-muted text-sm">Choose your payment method below.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
          )}

          {/* Crypto */}
          <div className="border border-forge-border rounded-xl p-6 hover:border-forge-accent transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">₿</div>
              <div>
                <h3 className="font-bold text-white">Crypto — ${paymentOptions.crypto.amount_usd}</h3>
                <p className="text-sm text-forge-muted">BTC, ETH, USDT and 100+ coins via NOWPayments</p>
              </div>
            </div>
            <a href={paymentOptions.crypto.invoiceUrl} target="_blank" rel="noopener noreferrer"
              className="btn-primary w-full block text-center">
              Pay ${paymentOptions.crypto.amount_usd} with Crypto →
            </a>
          </div>

          {/* Payoneer */}
          <div className="border border-forge-border rounded-xl p-6 hover:border-forge-accent transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">💳</div>
              <div>
                <h3 className="font-bold text-white">Card / Bank — ${paymentOptions.payoneer.amount_usd}</h3>
                <p className="text-sm text-forge-muted">Credit card, debit, or bank transfer via Payoneer</p>
              </div>
            </div>
            <a href={paymentOptions.payoneer.link} target="_blank" rel="noopener noreferrer"
              className="btn-primary w-full block text-center">
              Pay ${paymentOptions.payoneer.amount_usd} by Card →
            </a>
          </div>

          <button onClick={() => setStep('scan')} className="text-sm text-forge-muted hover:text-white transition-colors w-full text-center">
            ← Back to scan results
          </button>
        </div>
      )}
    </div>
  )
}
