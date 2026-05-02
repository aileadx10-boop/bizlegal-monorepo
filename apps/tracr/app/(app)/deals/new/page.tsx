'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, STAGES } from '@/lib/supabase'
import type { Client } from '@/lib/supabase'
import TopBar from '@/components/TopBar'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const DOC_TYPES = [
  'NDA', 'Joint Venture', 'SAFT', 'API Agreement', 'Supplier Agreement',
  'Service Agreement', 'Partnership Agreement', 'MSA', 'SaaS Agreement',
  'Franchise Agreement', 'Commercial Lease', 'Offer Letter', 'Other'
]

export default function NewDealPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Pick<Client,'id'|'name'|'company'>[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', client_id: '', stage: 'lead' as const,
    value: '', currency: 'USD', doc_type: '', priority: 'medium' as const,
    deadline: '', description: '', source: '',
  })

  useEffect(() => {
    supabase.from('trcr_clients').select('id, name, company').order('name')
      .then(({ data }) => setClients(data ?? []))
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.from('trcr_deals').insert({
      ...form,
      value: parseFloat(form.value) || 0,
      client_id: form.client_id || null,
      deadline: form.deadline || null,
    }).select('id').single()
    if (!error && data) router.push(`/deals/${data.id}`)
    else { setLoading(false) }
  }

  return (
    <>
      <TopBar title="New Deal" />
      <div className="p-6 max-w-2xl">
        <Link href="/deals" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft size={14} /> Back to Deals
        </Link>

        <form onSubmit={submit} className="card p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-800">Deal Details</h2>

          <div>
            <label className="label">Deal Title *</label>
            <input required className="input" placeholder="e.g. NDA with Acme Corp" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Client</label>
              <select className="select" value={form.client_id} onChange={e => set('client_id', e.target.value)}>
                <option value="">No client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Document Type</label>
              <select className="select" value={form.doc_type} onChange={e => set('doc_type', e.target.value)}>
                <option value="">Select type</option>
                {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Stage</label>
              <select className="select" value={form.stage} onChange={e => set('stage', e.target.value)}>
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="label">Deal Value</label>
              <input type="number" min="0" className="input" placeholder="0" value={form.value} onChange={e => set('value', e.target.value)} />
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="select" value={form.currency} onChange={e => set('currency', e.target.value)}>
                {['USD','EUR','GBP','AED','AUD','CAD'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Deadline</label>
              <input type="date" className="input" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
            </div>
            <div>
              <label className="label">Source</label>
              <input className="input" placeholder="Referral, Inbound, Cold..." value={form.source} onChange={e => set('source', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input resize-none" placeholder="Notes about this deal..." value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating…' : 'Create Deal'}
            </button>
            <Link href="/deals" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  )
}
