'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { STAGES, PRIORITY_CONFIG } from '@/lib/supabase'
import type { Stage, Priority } from '@/lib/supabase'

interface Client { id: string; name: string; company?: string }

export default function NewDealForm({ clients }: { clients: Client[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', client_id: '', stage: 'lead' as Stage,
    value: '', currency: 'USD', doc_type: '',
    priority: 'medium' as Priority, deadline: '', description: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, value: parseFloat(form.value) || 0 }),
      })
      const data = await res.json()
      if (data.id) router.push(`/deals/${data.id}`)
    } finally {
      setSaving(false)
    }
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Deal Title *</label>
          <input required className="input" placeholder="e.g. JV Real Estate UAE" value={form.title} onChange={e => set('title', e.target.value)} />
        </div>

        <div>
          <label className="label">Client</label>
          <select className="select" value={form.client_id} onChange={e => set('client_id', e.target.value)}>
            <option value="">— No client —</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Document Type</label>
          <input className="input" placeholder="e.g. Joint Venture, NDA, SAFT" value={form.doc_type} onChange={e => set('doc_type', e.target.value)} />
        </div>

        <div>
          <label className="label">Stage</label>
          <select className="select" value={form.stage} onChange={e => set('stage', e.target.value as Stage)}>
            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Priority</label>
          <select className="select" value={form.priority} onChange={e => set('priority', e.target.value as Priority)}>
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Value</label>
          <input className="input" type="number" min="0" step="0.01" placeholder="0" value={form.value} onChange={e => set('value', e.target.value)} />
        </div>

        <div>
          <label className="label">Currency</label>
          <select className="select" value={form.currency} onChange={e => set('currency', e.target.value)}>
            {['USD','EUR','GBP','AED','AUD','CAD','SGD'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Deadline</label>
          <input className="input" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
        </div>

        <div className="col-span-2">
          <label className="label">Description / Notes</label>
          <textarea className="input min-h-[80px] resize-y" placeholder="Context, notes, next steps..." value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Creating...' : 'Create Deal'}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  )
}
