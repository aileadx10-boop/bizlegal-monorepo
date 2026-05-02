'use client'

import { useState } from 'react'
import Link from 'next/link'

const PRODUCT_TYPES = ['SaaS', 'Fintech', 'Crypto-adjacent', 'Payments', 'Lending', 'Insurance', 'Other']
const ENTITY_OPTIONS = ['Israeli Ltd.', 'Delaware C-Corp', 'UK Ltd.', 'BVI/Cayman', 'Singapore Pte.', 'None yet']
const STAGE_OPTIONS = ['Pre-seed', 'Seed', 'Series A', 'Series B+', 'Revenue-generating (bootstrapped)']
const INVESTOR_JURISDICTIONS = ['Israel', 'US', 'UK', 'EU', 'Singapore', 'Mixed / Multiple', 'No institutional investors']

const MARKET_OPTIONS = [
  { id: 'uk', label: '🇬🇧 UK', flag: 'UK' },
  { id: 'eu', label: '🇪🇺 EU', flag: 'EU' },
  { id: 'us', label: '🇺🇸 US', flag: 'US' },
  { id: 'sg', label: '🇸🇬 Singapore', flag: 'SG' },
  { id: 'au', label: '🇦🇺 Australia', flag: 'AU' },
  { id: 'ca', label: '🇨🇦 Canada', flag: 'CA' },
  { id: 'de', label: '🇩🇪 Germany', flag: 'DE' },
  { id: 'nl', label: '🇳🇱 Netherlands', flag: 'NL' },
  { id: 'ch', label: '🇨🇭 Switzerland', flag: 'CH' },
  { id: 'ae', label: '🇦🇪 UAE', flag: 'AE' },
  { id: 'jp', label: '🇯🇵 Japan', flag: 'JP' },
  { id: 'hk', label: '🇭🇰 Hong Kong', flag: 'HK' },
]

interface FormData {
  company_name: string
  contact_name: string
  email: string
  website: string
  product_type: string
  crypto_involved: boolean
  entity_types: string[]
  target_markets: string[]
  current_revenue_usd: string
  fundraising_stage: string
  investor_jurisdiction: string
  notes: string
}

const initial: FormData = {
  company_name: '',
  contact_name: '',
  email: '',
  website: '',
  product_type: '',
  crypto_involved: false,
  entity_types: [],
  target_markets: [],
  current_revenue_usd: '',
  fundraising_stage: '',
  investor_jurisdiction: '',
  notes: '',
}

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]
}

type Step = 'form' | 'payment' | 'done'

interface PaymentOptions {
  crypto: { invoiceUrl: string; amount_usd: number }
  payoneer: { link: string; amount_usd: number }
}

export default function PassportPage() {
  const [form, setForm] = useState<FormData>(initial)
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passportId, setPassportId] = useState('')
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptions | null>(null)

  function set(field: keyof FormData, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.company_name || !form.contact_name || !form.email || !form.product_type) {
      setError('Please fill in all required fields.')
      return
    }
    if (form.target_markets.length === 0) {
      setError('Select at least one target market.')
      return
    }
    if (form.target_markets.length > 3) {
      setError('Select up to 3 markets per assessment.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/passport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          current_revenue_usd: form.current_revenue_usd ? parseInt(form.current_revenue_usd) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.passport_id) {
        setError(data.error || 'Something went wrong.')
        return
      }
      setPassportId(data.passport_id)
      setPaymentOptions(data.payment_options)
      setStep('payment')
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-forge-muted mb-6">
        <Link href="/" className="hover:text-forge-accent">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-white">Regulatory Passport</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-forge-accent/10 border border-forge-accent/20 text-forge-accent text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          ⚡ MULTI-FRAMEWORK · 12 MARKETS
        </div>
        <h1 className="text-3xl font-bold text-white mt-2 mb-3">Regulatory Passport</h1>
        <p className="text-forge-muted">
          Jurisdiction-by-jurisdiction compliance roadmap for tech companies expanding internationally.
          UK · EU · US · Singapore · Australia · Canada · Germany · Netherlands · UAE · Japan · Hong Kong · Switzerland
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-forge-muted">
          <span className="flex items-center gap-1"><span className="text-green-400">✓</span> $1,500 flat fee</span>
          <span className="flex items-center gap-1"><span className="text-green-400">✓</span> Practitioner-reviewed</span>
          <span className="flex items-center gap-1"><span className="text-green-400">✓</span> 12 markets covered</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-forge-muted mb-2">
          <span className={step === 'form' ? 'text-forge-accent font-semibold' : ''}>Step 1: Company Profile</span>
          <span className={step === 'payment' ? 'text-forge-accent font-semibold' : ''}>Step 2: Payment</span>
          <span className={step === 'done' ? 'text-forge-accent font-semibold' : ''}>Step 3: Confirmation</span>
        </div>
        <div className="h-2 bg-forge-card rounded-full overflow-hidden">
          <div
            className="h-full bg-forge-accent transition-all duration-500"
            style={{ width: step === 'form' ? '33%' : step === 'payment' ? '66%' : '100%' }}
          />
        </div>
      </div>

      {/* STEP 1: Form */}
      {step === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card space-y-4">
            <h2 className="font-semibold text-white">Company Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Company Name *</label>
                <input className="input-field" placeholder="Acme Technologies Ltd."
                  value={form.company_name} onChange={(e) => set('company_name', e.target.value)} />
              </div>
              <div>
                <label className="label">Website</label>
                <input className="input-field" placeholder="https://acme.io"
                  value={form.website} onChange={(e) => set('website', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Your Name *</label>
                <input className="input-field" placeholder="Moshe Cohen"
                  value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} />
              </div>
              <div>
                <label className="label">Email *</label>
                <input type="email" className="input-field" placeholder="moshe@acme.io"
                  value={form.email} onChange={(e) => set('email', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-semibold text-white">Product Profile</h2>
            <div>
              <label className="label">Product Type *</label>
              <select className="input-field" value={form.product_type}
                onChange={(e) => set('product_type', e.target.value)}>
                <option value="">Select type...</option>
                {PRODUCT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Entity Structure (select all)</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {ENTITY_OPTIONS.map((opt) => (
                  <button key={opt} type="button" onClick={() => set('entity_types', toggle(form.entity_types, opt))}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${form.entity_types.includes(opt) ? 'bg-forge-accent border-forge-accent text-white' : 'border-forge-border text-forge-muted hover:border-forge-accent'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="crypto" className="w-4 h-4 accent-forge-accent"
                checked={form.crypto_involved} onChange={(e) => set('crypto_involved', e.target.checked)} />
              <label htmlFor="crypto" className="text-sm text-forge-text cursor-pointer">
                Crypto / blockchain / digital assets involved
              </label>
            </div>
          </div>

          {/* Target Markets */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Target Markets *</h2>
              <span className="text-xs text-forge-muted">Select up to 3</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MARKET_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => set('target_markets', toggle(form.target_markets, m.id))}
                  disabled={!form.target_markets.includes(m.id) && form.target_markets.length >= 3}
                  className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                    form.target_markets.includes(m.id)
                      ? 'bg-forge-accent border-forge-accent text-white'
                      : form.target_markets.length >= 3
                      ? 'border-forge-border text-forge-muted opacity-40 cursor-not-allowed'
                      : 'border-forge-border text-forge-muted hover:border-forge-accent'
                  }`}
                >
                  <span className="mr-1.5">{m.label.split(' ')[0]}</span>
                  {m.label.split(' ').slice(1).join(' ')}
                </button>
              ))}
            </div>
            {form.target_markets.length > 0 && (
              <div className="text-xs text-forge-accent mt-1">
                Selected: {form.target_markets.map(id => MARKET_OPTIONS.find(m => m.id === id)?.label.split(' ').slice(1).join(' ')).join(', ')}
              </div>
            )}
          </div>

          <div className="card space-y-4">
            <h2 className="font-semibold text-white">Business Context</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Fundraising Stage</label>
                <select className="input-field" value={form.fundraising_stage}
                  onChange={(e) => set('fundraising_stage', e.target.value)}>
                  <option value="">Select...</option>
                  {STAGE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Annual Revenue (USD)</label>
                <input type="number" className="input-field" placeholder="500000"
                  value={form.current_revenue_usd} onChange={(e) => set('current_revenue_usd', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Primary Investor Jurisdiction</label>
              <select className="input-field" value={form.investor_jurisdiction}
                onChange={(e) => set('investor_jurisdiction', e.target.value)}>
                <option value="">Select...</option>
                {INVESTOR_JURISDICTIONS.map((j) => <option key={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Additional Context</label>
              <textarea className="input-field min-h-[100px] resize-none"
                placeholder="Any specific compliance concerns or context..."
                value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Processing...' : 'Continue to Payment →'}
          </button>
          <p className="text-xs text-forge-muted text-center">
            🔒 Secure payment · Practitioner-reviewed delivery · Not legal advice
          </p>
        </form>
      )}

      {/* STEP 2: Payment */}
      {step === 'payment' && paymentOptions && (
        <div className="card space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Regulatory Passport — Choose Payment</h2>
            <p className="text-forge-muted text-sm">We will contact you within 24 hours to begin your assessment.</p>
          </div>

          <div className="border border-forge-border rounded-xl p-6 hover:border-forge-accent transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">₿</div>
              <div>
                <h3 className="font-bold text-white">Crypto — ${paymentOptions.crypto.amount_usd}</h3>
                <p className="text-sm text-forge-muted">BTC, ETH, USDT and 100+ coins via NOWPayments</p>
              </div>
            </div>
            <a href={paymentOptions.crypto.invoiceUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => setStep('done')}
              className="btn-primary w-full block text-center">
              Pay ${paymentOptions.crypto.amount_usd} with Crypto →
            </a>
          </div>

          <div className="border border-forge-border rounded-xl p-6 hover:border-forge-accent transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">💳</div>
              <div>
                <h3 className="font-bold text-white">Card / Bank — ${paymentOptions.payoneer.amount_usd}</h3>
                <p className="text-sm text-forge-muted">Credit card, debit, or bank transfer via Payoneer</p>
              </div>
            </div>
            <a href={paymentOptions.payoneer.link} target="_blank" rel="noopener noreferrer"
              onClick={() => setStep('done')}
              className="btn-primary w-full block text-center">
              Pay ${paymentOptions.payoneer.amount_usd} by Card →
            </a>
          </div>

          <button onClick={() => setStep('form')} className="text-sm text-forge-muted hover:text-white w-full text-center">
            ← Back to form
          </button>
        </div>
      )}

      {/* STEP 3: Done */}
      {step === 'done' && (
        <div className="card space-y-6 text-center">
          <div className="text-5xl">✅</div>
          <h2 className="text-2xl font-bold text-white">Payment Initiated</h2>
          <p className="text-forge-muted leading-relaxed">
            Thank you. Our team will contact you at <strong className="text-white">{form.email}</strong> within 24 hours to begin your Regulatory Passport assessment.
          </p>
          <p className="text-sm text-forge-muted">
            Reference: <span className="font-mono text-forge-accent">{passportId}</span>
          </p>
          <p className="text-xs text-forge-muted">
            Questions? Email <a href="mailto:support@bizlegal-ai.com" className="text-forge-accent">support@bizlegal-ai.com</a>
          </p>
          <div className="pt-4">
            <Link href="/" className="btn-primary inline-block">← Back to Home</Link>
          </div>
        </div>
      )}
    </div>
  )
}
