export const dynamic = 'force-dynamic'
import { supabase, formatCurrency, daysUntil } from '@/lib/supabase'
import type { Deal } from '@/lib/supabase'
import TopBar from '@/components/TopBar'
import StageBadge from '@/components/StageBadge'
import PriorityDot from '@/components/PriorityDot'
import Link from 'next/link'
import { Calendar, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

async function getDeals() {
  const { data } = await supabase
    .from('trcr_deals')
    .select('*, trcr_clients(name, company)')
    .order('created_at', { ascending: false })
  return (data ?? []) as Deal[]
}

export default async function DealsPage() {
  const deals = await getDeals()

  return (
    <>
      <TopBar title="Deals" />
      <div className="p-6">
        {/* Filters strip */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm text-slate-500">{deals.length} deals</span>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Deal</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Stage</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Value</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Deadline</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deals.map(deal => {
                const days = daysUntil(deal.deadline)
                const isOverdue = days !== null && days < 0
                return (
                  <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-slate-900">{deal.title}</p>
                        {deal.doc_type && <p className="text-xs text-slate-400">{deal.doc_type}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {deal.trcr_clients ? (
                        <div>
                          <p>{deal.trcr_clients.name}</p>
                          {deal.trcr_clients.company && <p className="text-xs text-slate-400">{deal.trcr_clients.company}</p>}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <StageBadge stage={deal.stage} />
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">
                      {formatCurrency(deal.value, deal.currency)}
                    </td>
                    <td className="px-4 py-3.5">
                      <PriorityDot priority={deal.priority} />
                    </td>
                    <td className={clsx('px-4 py-3.5 text-xs', isOverdue ? 'text-red-600 font-medium' : 'text-slate-500')}>
                      {deal.deadline ? (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(deal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {isOverdue && ' (overdue)'}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/deals/${deal.id}`} className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {deals.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                    No deals yet. <Link href="/deals/new" className="text-indigo-600 underline">Create your first deal →</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
