'use client'
import Link from 'next/link'
import { Calendar, DollarSign } from 'lucide-react'
import type { Deal } from '@/lib/supabase'
import { formatCurrency, daysUntil } from '@/lib/supabase'
import PriorityDot from './PriorityDot'
import clsx from 'clsx'

export default function DealCard({ deal }: { deal: Deal }) {
  const days = daysUntil(deal.deadline)
  const isOverdue = days !== null && days < 0
  const isUrgent = days !== null && days <= 3 && days >= 0

  return (
    <Link
      href={`/deals/${deal.id}`}
      className="block card p-4 hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
          {deal.title}
        </p>
        <PriorityDot priority={deal.priority} />
      </div>

      {deal.trcr_clients && (
        <p className="text-xs text-slate-500 mb-2">
          {deal.trcr_clients.name}
          {deal.trcr_clients.company && ` · ${deal.trcr_clients.company}`}
        </p>
      )}

      {deal.doc_type && (
        <p className="text-xs text-slate-400 mb-2">{deal.doc_type}</p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1 text-xs font-medium text-slate-700">
          <DollarSign size={12} className="text-slate-400" />
          {formatCurrency(deal.value, deal.currency)}
        </div>

        {deal.deadline && (
          <div className={clsx(
            'flex items-center gap-1 text-xs',
            isOverdue ? 'text-red-600 font-medium' :
            isUrgent  ? 'text-amber-600 font-medium' :
                        'text-slate-400'
          )}>
            <Calendar size={12} />
            {isOverdue
              ? `${Math.abs(days!)}d overdue`
              : days === 0 ? 'Due today'
              : `${days}d left`
            }
          </div>
        )}
      </div>
    </Link>
  )
}
