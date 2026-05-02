// app/surplus/page.tsx
// Surplus Funds Deal Flow — intake form for PipeForge pipeline
// For attorneys and investors looking to acquire surplus funds cases

'use client'

import { useState } from 'react'

const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']
const CASE_TYPES = [
  'Real estate escrow surplus',
  'Insurance claim payout',
  'Estate / probate funds',
  'Uncashed payroll check',
  'Forgotten bank account',
  'Utility deposit refund',
  'CD / savings account',
  'Other'
]

interface FormData {
  contact_name: string
  email: string
  phone: string
  state: string
  case_type: string
  estimated_value: string
  notes: string
}

const initial: FormData = {
  contact_name: '',
  email: '',
  phone: '',
  state: '',
  case_type: '',
  estimated_value: '',
  notes: '',
}

export default function SurplusPage() {
  const [form, setForm] = useState<FormData>(initial)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.contact_name || !form.email || !form.state || !form.case_type) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/surplus/qualify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Submission failed.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="text-5xl mb-6">📋</div>
        <h1 className="text-2xl font-bold text-white mb-3">Case Submitted</h1>
        <p className="text-forge-muted mb-6">
          We received your case. OurPipeForge pipeline will qualify it and route to an appropriate attorney or investor within 24 hours.
        </p>
        <p className="text-forge-muted text-sm">
          You&apos;ll receive an email confirmation at <strong className="text-white">{form.email}</strong> with next steps.
        </p>
        <p className="text-xs text-forge-muted mt-8">
          Not legal advice. This intake is for internal routing only.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <div className="mb-8">
        <span className="text-forge-accent text-sm font-semibold uppercase tracking-wider">
          Deal Flow Pipeline
        </span>
        <h1 className="text-3xl font-bold text-white mt-2 mb-3">Surplus Funds Intake</h1>
        <p className="text-forge-muted">
          Submit a surplus funds case forPipeForge qualification and attorney/investor routing.
          $800 per qualified case.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold text-white">Your Contact</h2>
          <div>
            <label className="label">Name *</label>
            <input className="input-field" placeholder="Moshe Cohen"
              value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email *</label>
              <input type="email" className="input-field" placeholder="moshe@lawfirm.com"
                value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input-field" placeholder="+1-555-000-0000"
                value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-white">Case Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">State *</label>
              <select className="input-field" value={form.state}
                onChange={(e) => set('state', e.target.value)}>
                <option value="">Select state...</option>
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Estimated Value</label>
              <input className="input-field" placeholder="$50,000"
                value={form.estimated_value} onChange={(e) => set('estimated_value', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Case Type *</label>
            <select className="input-field" value={form.case_type}
              onChange={(e) => set('case_type', e.target.value)}>
              <option value="">Select type...</option>
              {CASE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Additional Details</label>
            <textarea className="input-field min-h-[100px] resize-none"
              placeholder="Describe the case, how the surplus arose, any documentation available..."
              value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Submitting...' : 'Submit Case for Qualification'}
        </button>
        <p className="text-xs text-forge-muted text-center">
          Cases qualified byPipeForge → routed to attorney/investor → $800 per qualified referral
        </p>
      </form>
    </div>
  )
}
