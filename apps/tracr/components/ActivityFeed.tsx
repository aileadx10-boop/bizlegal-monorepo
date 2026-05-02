'use client'
import { useState } from 'react'
import type { Activity, ActivityType } from '@/lib/supabase'
import { MessageSquare, Mail, Phone, Calendar, FileText, CheckSquare, RefreshCw, Plus } from 'lucide-react'
import clsx from 'clsx'

const TYPE_ICON: Record<ActivityType, React.ElementType> = {
  note: MessageSquare, email: Mail, call: Phone, meeting: Calendar,
  document: FileText, task: CheckSquare, stage_change: RefreshCw,
}
const TYPE_COLOR: Record<ActivityType, string> = {
  note: 'bg-slate-100 text-slate-600', email: 'bg-blue-100 text-blue-600',
  call: 'bg-green-100 text-green-600', meeting: 'bg-violet-100 text-violet-600',
  document: 'bg-amber-100 text-amber-600', task: 'bg-indigo-100 text-indigo-600',
  stage_change: 'bg-slate-100 text-slate-500',
}

export default function ActivityFeed({ dealId, initial }: { dealId: string; initial: Activity[] }) {
  const [activities, setActivities] = useState<Activity[]>(initial)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ type: 'note' as ActivityType, title: '', body: '' })

  async function addActivity(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, deal_id: dealId }),
      })
      const data = await res.json()
      if (data.id) {
        setActivities(prev => [data, ...prev])
        setForm({ type: 'note', title: '', body: '' })
        setAdding(false)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Activity</h3>
        <button onClick={() => setAdding(!adding)} className="btn-ghost flex items-center gap-1 text-xs">
          <Plus size={13} /> Log Activity
        </button>
      </div>

      {adding && (
        <form onSubmit={addActivity} className="card p-4 mb-4 space-y-3">
          <div className="flex gap-2">
            <select
              className="select flex-1"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as ActivityType }))}
            >
              {(['note','email','call','meeting','document','task'] as ActivityType[]).map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <input
              required className="input flex-[3]" placeholder="Title / summary"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <textarea
            className="input min-h-[60px] resize-y text-xs" placeholder="Details (optional)"
            value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-xs py-1.5 px-3" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="btn-ghost text-xs" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {activities.map(act => {
          const Icon = TYPE_ICON[act.type] ?? MessageSquare
          return (
            <div key={act.id} className="flex gap-3">
              <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5', TYPE_COLOR[act.type])}>
                <Icon size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{act.title}</p>
                {act.body && <p className="text-xs text-slate-500 mt-0.5 whitespace-pre-line">{act.body}</p>}
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(act.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        {activities.length === 0 && !adding && (
          <p className="text-xs text-slate-400 text-center py-6">No activity yet. Log a call, email, or note.</p>
        )}
      </div>
    </div>
  )
}
