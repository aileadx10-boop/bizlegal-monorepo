'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import TopBar from '@/components/TopBar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const INDUSTRIES = [
  'Real Estate','SaaS','Fintech','eCommerce','Data','Healthcare',
  'Legal','Consulting','Manufacturing','Media','Other'
]
const COUNTRIES = ['US','UK','UAE','EU','AU','CA','SG','IN','NG','Other']

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '',
    country: 'US', industry: '', notes: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.from('trcr_clients').insert(form).select('id').single()
    if (!error && data) router.push(`/clients/${data.id}`)
    else setLoading(false)
  }

  return (
    <>
      <TopBar title="Add Client" />
      <div className="p-6 max-w-xl">
        <Link href="/clients" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft size={14} /> Back to Clients
        </Link>

        <form onSubmit={submit} className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-800">Client Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input required className="input" placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="label">Company</label>
              <input className="input" placeholder="Company / org" value={form.company} onChange={e => set('company', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="contact@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+1 555 000 0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Country</label>
              <select className="select" value={form.country} onChange={e => set('country', e.target.value)}>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Industry</label>
              <select className="select" value={form.industry} onChange={e => set('industry', e.target.value)}>
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea rows={3} className="input resize-none" placeholder="Any notes about this client..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving…' : 'Add Client'}
            </button>
            <Link href="/clients" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  )
}
