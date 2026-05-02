export const dynamic = 'force-dynamic'
import { supabase, formatCurrency, daysUntil, STAGES } from '@/lib/supabase'
import type { Deal, Activity, Document } from '@/lib/supabase'
import TopBar from '@/components/TopBar'
import StageBadge from '@/components/StageBadge'
import PriorityDot from '@/components/PriorityDot'
import DealActions from './DealActions'
import { notFound } from 'next/navigation'
import { Calendar, DollarSign, ArrowLeft, FileText, Clock } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'

async function getDeal(id: string) {
  const [{ data: deal }, { data: activities }, { data: docs }] = await Promise.all([
    supabase.from('trcr_deals').select('*, trcr_clients(*)').eq('id', id).single(),
    supabase.from('trcr_activities').select('*').eq('deal_id', id).order('created_at', { ascending: false }),
    supabase.from('trcr_documents').select('*').eq('deal_id', id).order('created_at', { ascending: false }),
  ])
  return { deal: deal as Deal | null, activities: (activities ?? []) as Activity[], docs: (docs ?? []) as Document[] }
}

const ACTIVITY_ICONS: Record<string, string> = {
  note: '📝', email: '📧', call: '📞', meeting: '🤝',
  stage_change: '🔄', document: '📄', task: '✅',
}

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const { deal, activities, docs } = await getDeal(params.id)
  if (!deal) notFound()

  const days = daysUntil(deal.deadline)
  const isOverdue = days !== null && days < 0
  return (
    <>
      <TopBar title={deal.title} />
      <div className="p-6 max-w-5xl">
        <Link href="/deals" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: deal info */}
          <div className="col-span-2 space-y-5">
            {/* Header */}
            <div className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{deal.title}</h2>
                  {deal.doc_type && <p className="text-sm text-slate-400 mt-0.5">{deal.doc_type}</p>}
                </div>
                <StageBadge stage={deal.stage} />
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><DollarSign size={11} />Value</p>
                  <p className="font-semibold text-slate-800">{formatCurrency(deal.value, deal.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Calendar size={11} />Deadline</p>
                  <p className={clsx('font-medium', isOverdue ? 'text-red-600' : 'text-slate-800')}>
                    {deal.deadline
                      ? new Date(deal.deadline).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })
                      : '—'
                    }
                    {isOverdue && <span className="text-xs ml-1">(overdue)</span>}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Priority</p>
                  <PriorityDot priority={deal.priority} />
                </div>
              </div>

              {deal.description && (
                <p className="text-sm text-slate-600 mt-4 pt-4 border-t border-slate-100">{deal.description}</p>
              )}
            </div>

            {/* Stage Pipeline */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Stage Progress</h3>
              <div className="flex items-center gap-1">
                {STAGES.filter(s => !['closed_won','closed_lost'].includes(s.id)).map((s, i, arr) => {
                  const stageOrder = ['lead','engaged','drafting','review','signed']
                  const currentIdx = stageOrder.indexOf(deal.stage)
                  const thisIdx = stageOrder.indexOf(s.id)
                  const isPast = thisIdx <= currentIdx
                  return (
                    <div key={s.id} className="flex items-center flex-1">
                      <div className={clsx(
                        'flex-1 h-2 rounded-full transition-colors',
                        isPast ? 'bg-indigo-500' : 'bg-slate-200'
                      )} />
                      {i < arr.length - 1 && <div className={clsx('w-2 h-2 rounded-full mx-0.5', isPast ? 'bg-indigo-500' : 'bg-slate-200')} />}
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center justify-between mt-2">
                {STAGES.filter(s => !['closed_won','closed_lost'].includes(s.id)).map(s => (
                  <p key={s.id} className="text-[10px] text-slate-400">{s.label}</p>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700">Activity</h3>
              </div>
              <DealActions dealId={deal.id} />
              <div className="mt-4 space-y-3">
                {activities.map(act => (
                  <div key={act.id} className="flex gap-3 text-sm">
                    <span className="text-base mt-0.5">{ACTIVITY_ICONS[act.type] ?? '•'}</span>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{act.title}</p>
                      {act.body && <p className="text-slate-500 text-xs mt-0.5">{act.body}</p>}
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(act.created_at).toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">No activity yet. Log a note or call below.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="col-span-1 space-y-4">
            {/* Client */}
            {deal.trcr_clients && (
              <div className="card p-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Client</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-sm">
                    {deal.trcr_clients.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{deal.trcr_clients.name}</p>
                    {deal.trcr_clients.company && <p className="text-xs text-slate-400">{deal.trcr_clients.company}</p>}
                  </div>
                </div>
                {deal.trcr_clients.email && (
                  <a href={`mailto:${deal.trcr_clients.email}`} className="text-xs text-indigo-600 hover:underline block mb-1">
                    {deal.trcr_clients.email}
                  </a>
                )}
                {deal.trcr_clients.country && (
                  <p className="text-xs text-slate-400">{deal.trcr_clients.country} · {deal.trcr_clients.industry}</p>
                )}
                <Link href={`/clients/${deal.trcr_clients.id}`} className="text-xs text-slate-500 hover:text-indigo-600 mt-2 inline-block">
                  View client →
                </Link>
              </div>
            )}

            {/* Documents */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Documents</h3>
                <Link href={`https://bizlegal.ai/tools`} target="_blank" className="text-xs text-indigo-600 hover:underline">
                  Generate →
                </Link>
              </div>
              {docs.length > 0 ? (
                <div className="space-y-2">
                  {docs.map(doc => (
                    <div key={doc.id} className="flex items-center gap-2 text-xs">
                      <FileText size={12} className="text-slate-400" />
                      <span className="flex-1 text-slate-700">{doc.name}</span>
                      <span className={clsx(
                        'badge',
                        doc.status === 'signed' ? 'bg-green-100 text-green-700' :
                        doc.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      )}>{doc.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No documents attached</p>
              )}
            </div>

            {/* Meta */}
            <div className="card p-4 space-y-2.5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Details</h3>
              {deal.source && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Source</span>
                  <span className="text-slate-700">{deal.source}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Created</span>
                <span className="text-slate-700">
                  {new Date(deal.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Updated</span>
                <span className="text-slate-700">
                  {new Date(deal.updated_at).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
