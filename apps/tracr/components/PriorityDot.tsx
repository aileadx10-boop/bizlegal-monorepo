import { PRIORITY_CONFIG } from '@/lib/supabase'
import type { Priority } from '@/lib/supabase'
import clsx from 'clsx'

export default function PriorityDot({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority]
  return (
    <span className="flex items-center gap-1 text-xs text-slate-500">
      <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}
