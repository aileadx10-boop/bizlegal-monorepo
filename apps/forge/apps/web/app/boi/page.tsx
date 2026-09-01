'use client'

import { useState } from 'react'
import Link from 'next/link'

const ENTITY_TYPES = ['LLC', 'Corporation', 'Limited Partnership', 'LLP', 'S-Corp', 'Other']
const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']
const YES_NO = ['Yes', 'No', 'Not sure']

interface FormData {
  company_name: string
  formation_date: string
  state: string
  entity_type: string
  ein: string
  contact_name: string
  contact_email: string
  boi_filed: string
  boi_filing_date: string
  ownership_changed: string
  owner_count: string
  prior_convictions: string
  notes: string
}

const initial: FormData = {
  company_name: '',
  formation_date: '',
  state: '',
  entity_type: '',
  ein: '',
  contact_name: '',
  contact_email: '',
  boi_filed: '',
  boi_filing_date: '',
  ownership_changed: '',
  owner_count: '',
  prior_convictions: '',
  notes: '',
}

function buildPayload(form: FormData) {
  return {
    // Reference statute: NY LLC Transparency Act (NY LLC Law § 1106).
    url: 'https://www.nysenate.gov/legislation/laws/LLC/1106',
    company_name: form.company_name,
    formation_date: form.formation_date,
    state: form.state,
    entity_type: form.entity_type,
    ein: form.ein,
    boi_filed: form.boi_filed,
    boi_filing_date: form.boi_filing_date || 'Never',
    ownership_changed: form.ownership_changed,
    owner_count: form.owner_count || '1',
    sensitive_data: 'boi_intake',
  }
}

export default function BOIPage() {
  const [form, setForm] = useState<FormData>(initial)
  const [step, setStep] = useState<'form' | 'payment' | 'done'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.company_name || !form.formation_date || !form.state || !form.contact_name || !form.contact_email) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      const payload = buildPayload(form)
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, email: form.contact_email, vertical: 'boi' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Analysis failed. Please try again.')
        return
      }
      setResult(data)
      setStep('payment')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCrypto() {
    if (!result) return
    setLoading(true)
    try {
      const res = await fetch('/api/payment/crypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference_id: (result as { scan_id?: string }).scan_id ?? '',
          reference_type: 'boi',
        }),
      })
      const data = await res.json()
      if (data.invoiceUrl) window.location.href = data.invoiceUrl
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
        <span className="text-white">State Transparency Kit</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-400/15 border border-indigo-400/30 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          <span className="w-2 h-2 rounded-full bg-indigo-300 animate-pulse" />
          STATE TRANSPARENCY DUTIES — NY ENACTED, MORE PROPOSED
        </div>
        <h1 className="text-3xl font-bold text-white mt-2 mb-3">State Transparency Report Kit</h1>
        <p className="text-forge-muted">
          FinCEN&apos;s 2025 interim rule ended federal BOI filing for US domestic companies — and
          states are moving to fill the gap. New York&apos;s LLC Transparency Act is enacted
          (effective for new LLCs from January 1, 2026; existing LLCs by January 1, 2027) and
          similar bills are proposed elsewhere. This kit maps your entity details to the
          state-level disclosure duties that apply to you — with statute citations. We publish
          the signals; you decide.
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-forge-muted">
          <span className="flex items-center gap-1"><span className="text-green-400">✓</span> $149 flat fee</span>
          <span className="flex items-center gap-1"><span className="text-green-400">✓</span> Delivered in 2–5 minutes</span>
          <span className="flex items-center gap-1"><span className="text-green-400">✓</span> Enacted vs proposed, cited</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-forge-muted mb-2">
          <span className={step === 'form' ? 'text-forge-accent font-semibold' : ''}>Step 1: Company Info</span>
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
                <input className="input-field" placeholder="Acme Holdings LLC"
                  value={form.company_name} onChange={(e) => set('company_name', e.target.value)} />
              </div>
              <div>
                <label className="label">EIN (Employer ID)</label>
                <input className="input-field" placeholder="12-3456789"
                  value={form.ein} onChange={(e) => set('ein', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Formation Date *</label>
                <input type="date" className="input-field"
                  value={form.formation_date} onChange={(e) => set('formation_date', e.target.value)} />
              </div>
              <div>
                <label className="label">Formation State *</label>
                <select className="input-field" value={form.state}
                  onChange={(e) => set('state', e.target.value)}>
                  <option value="">Select state...</option>
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Entity Type</label>
              <select className="input-field" value={form.entity_type}
                onChange={(e) => set('entity_type', e.target.value)}>
                <option value="">Select type...</option>
                {ENTITY_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-semibold text-white">Ownership &amp; Disclosure Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Has the entity ever filed a beneficial-ownership or transparency disclosure (federal or state)? *</label>
                <select className="input-field" value={form.boi_filed}
                  onChange={(e) => set('boi_filed', e.target.value)}>
                  <option value="">Select...</option>
                  {YES_NO.map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
              {form.boi_filed === 'Yes' && (
                <div>
                  <label className="label">Date of Most Recent Disclosure Filing</label>
                  <input type="date" className="input-field"
                    value={form.boi_filing_date} onChange={(e) => set('boi_filing_date', e.target.value)} />
                </div>
              )}
            </div>
            <div>
              <label className="label">Has ownership or control changed since that disclosure? *</label>
              <select className="input-field" value={form.ownership_changed}
                onChange={(e) => set('ownership_changed', e.target.value)}>
                <option value="">Select...</option>
                {YES_NO.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Number of Beneficial Owners (25%+ ownership or substantial control)</label>
              <input type="number" className="input-field" min="1" placeholder="e.g. 2"
                value={form.owner_count} onChange={(e) => set('owner_count', e.target.value)} />
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-semibold text-white">Your Contact</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Your Name *</label>
                <input className="input-field" placeholder="Moshe Cohen"
                  value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} />
              </div>
              <div>
                <label className="label">Email *</label>
                <input type="email" className="input-field" placeholder="moshe@acme.com"
                  value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Additional Notes (optional)</label>
              <textarea className="input-field min-h-[80px] resize-none"
                placeholder="Ownership structure details, prior filings, or questions..."
                value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Analyzing...' : 'Run State Transparency Check — $149'}
          </button>
          <p className="text-xs text-forge-muted text-center">
            🔒 Secure payment · Not legal advice — regulatory intelligence only · Delivered in 2–5 minutes
          </p>
        </form>
      )}

      {/* STEP 2: Payment */}
      {step === 'payment' && result && (
        <div className="card space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">State Transparency Report</h2>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${(result as { risk_level?: string }).risk_level === 'critical' ? 'bg-red-500/20 text-red-400' : (result as { risk_level?: string }).risk_level === 'high' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {((result as { risk_level?: string }).risk_level ?? 'medium').toUpperCase()} RISK
            </span>
          </div>

          {(result as { filing_overdue?: boolean }).filing_overdue && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 font-semibold text-sm">⚠️ State Disclosure Duty Identified</p>
              <p className="text-forge-muted text-sm mt-1">
                An enacted or proposed state transparency law appears to apply to your entity.
                The full report cites the statute and the exact disclosure steps.
              </p>
            </div>
          )}

          <div className="space-y-2">
            {((result as { findings?: string[] }).findings ?? []).slice(0, 3).map((f: string, i: number) => (
              <div key={i} className="text-sm text-forge-muted border-l-2 border-forge-border pl-3">{f}</div>
            ))}
          </div>

          <div className="border-t border-forge-border pt-4 space-y-3">
            <h3 className="font-semibold text-white">Choose Payment Method</h3>
            <div className="border border-forge-border rounded-xl p-4 hover:border-forge-accent transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">₿</div>
                <div>
                  <h4 className="font-bold text-white">Crypto — $149</h4>
                  <p className="text-sm text-forge-muted">BTC, ETH, USDT and 100+ coins via NOWPayments</p>
                </div>
              </div>
              <button onClick={handleCrypto} disabled={loading} className="btn-primary w-full">
                {loading ? 'Processing...' : 'Pay $149 with Crypto →'}
              </button>
            </div>
            <div className="border border-forge-border rounded-xl p-4 hover:border-forge-accent transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">💳</div>
                <div>
                  <h4 className="font-bold text-white">Card / Bank — $169</h4>
                  <p className="text-sm text-forge-muted">Pay by card via secure checkout</p>
                </div>
              </div>
              <a
                href={`https://bizlegal-ai.com/checkout?product=forge&tier=boi&interval=one-time&amount=16900&name=Forge+State+Transparency+Report+Kit`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full block text-center"
              >
                Pay $169 by Card →
              </a>
            </div>
          </div>

          <button onClick={() => setStep('form')} className="text-sm text-forge-muted hover:text-white transition-colors w-full text-center">
            ← Start over
          </button>
        </div>
      )}

      {/* STEP 3: Done */}
      {step === 'done' && (
        <div className="card space-y-6 text-center">
          <div className="text-5xl">✅</div>
          <h2 className="text-2xl font-bold text-white">Payment Initiated</h2>
          <p className="text-forge-muted leading-relaxed">
            Thank you. Your state transparency report will be delivered to <strong className="text-white">{form.contact_email}</strong> within 24 hours.
          </p>
          <p className="text-sm text-forge-muted">
            Reference: <span className="font-mono text-forge-accent">{(result as { scan_id?: string }).scan_id}</span>
          </p>
          <div className="pt-4">
            <Link href="/" className="btn-primary inline-block">← Back to Home</Link>
          </div>
        </div>
      )}
    </div>
  )
}
