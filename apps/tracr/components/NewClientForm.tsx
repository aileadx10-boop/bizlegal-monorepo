'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewClientForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '',
    country: 'US', industry: '', notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.id) router.push(`/clients/${data.id}`)
    } finally {
      setSaving(false)
    }
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name *</label>
          <input required className="input" placeholder="Ahmad Al-Rashid" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <label className="label">Company</label>
          <input className="input" placeholder="Gulf Ventures LLC" value={form.company} onChange={e => set('company', e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="ahmad@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" placeholder="+971 50 000 0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
        <div>
          <label className="label">Country</label>
          <select className="select" value={form.country} onChange={e => set('country', e.target.value)}>
            {['US','UAE','UK','EU','AU','CA','SG','Other'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Industry</label>
          <input className="input" placeholder="Real Estate, SaaS, Fintech..." value={form.industry} onChange={e => set('industry', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="label">Notes</label>
          <textarea className="input min-h-[80px] resize-y" placeholder="Background, preferences, referral source..." value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Add Client'}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  )
}
