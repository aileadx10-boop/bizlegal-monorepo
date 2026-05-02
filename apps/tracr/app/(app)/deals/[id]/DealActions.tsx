'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ActivityType } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { MessageSquare, Phone, Mail, Calendar } from 'lucide-react'

const TYPES: { id: ActivityType; label: string; icon: React.ReactNode }[] = [
  { id: 'note',    label: 'Note',    icon: <MessageSquare size={12} /> },
  { id: 'call',    label: 'Call',    icon: <Phone size={12} /> },
  { id: 'email',   label: 'Email',   icon: <Mail size={12} /> },
  { id: 'meeting', label: 'Meeting', icon: <Calendar size={12} /> },
]

export default function DealActions({ dealId }: { dealId: string }) {
  const router = useRouter()
  const [type, setType] = useState<ActivityType>('note')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function log() {
    if (!title.trim()) return
    setLoading(true)
    await supabase.from('trcr_activities').insert({ deal_id: dealId, type, title, body })
    setTitle('')
    setBody('')
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary text-xs w-full">
        + Log Activity
      </button>
    )
  }

  return (
    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-3">
      <div className="flex gap-1.5">
        {TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              type === t.id ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-white'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <input
        className="input text-sm"
        placeholder="Title / subject..."
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        rows={2}
        className="input text-sm resize-none"
        placeholder="Details (optional)..."
        value={body}
        onChange={e => setBody(e.target.value)}
      />
      <div className="flex gap-2">
        <button onClick={log} disabled={loading || !title.trim()} className="btn-primary text-xs">
          {loading ? 'Logging…' : 'Log'}
        </button>
        <button onClick={() => setOpen(false)} className="btn-ghost text-xs">Cancel</button>
      </div>
    </div>
  )
}
