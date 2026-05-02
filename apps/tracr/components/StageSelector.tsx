'use client'
import { useState } from 'react'
import { STAGES } from '@/lib/supabase'
import type { Stage } from '@/lib/supabase'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'

export default function StageSelector({ dealId, current }: { dealId: string; current: Stage }) {
  const [stage, setStage] = useState<Stage>(current)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const cfg = STAGES.find(s => s.id === stage)!

  async function changeStage(newStage: Stage) {
    if (newStage === stage) { setOpen(false); return }
    setSaving(true)
    setOpen(false)
    try {
      await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      setStage(newStage)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={clsx('badge gap-1.5 cursor-pointer pr-2 py-1', cfg.bg, cfg.color, saving && 'opacity-60')}
        disabled={saving}
      >
        {cfg.label}
        <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-40">
            {STAGES.map(s => (
              <button
                key={s.id}
                onClick={() => changeStage(s.id)}
                className={clsx(
                  'w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors flex items-center gap-2',
                  s.id === stage && 'font-medium'
                )}
              >
                <span className={clsx('w-2 h-2 rounded-full', s.bg.replace('bg-', 'bg-').replace('-50', '-400').replace('-100', '-500'))} />
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
