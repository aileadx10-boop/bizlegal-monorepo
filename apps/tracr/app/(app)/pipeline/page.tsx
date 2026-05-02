export const dynamic = 'force-dynamic'
import { supabase, STAGES } from '@/lib/supabase'
import type { Deal } from '@/lib/supabase'
import TopBar from '@/components/TopBar'
import DealCard from '@/components/DealCard'
import { formatCurrency } from '@/lib/supabase'

async function getDeals() {
  const { data } = await supabase
    .from('trcr_deals')
    .select('*, trcr_clients(name, company)')
    .order('created_at', { ascending: false })
  return (data ?? []) as Deal[]
}

export default async function PipelinePage() {
  const deals = await getDeals()

  const columns = STAGES.map(stage => ({
    ...stage,
    deals: deals.filter(d => d.stage === stage.id),
    total: deals.filter(d => d.stage === stage.id).reduce((s, d) => s + d.value, 0),
  }))

  return (
    <>
      <TopBar title="Pipeline" />
      <div className="p-6">
        <div className="kanban-scroll">
          {columns.map(col => (
            <div key={col.id} className="shrink-0 w-64">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`badge ${col.bg} ${col.color}`}>{col.label}</span>
                  <span className="text-xs text-slate-400 font-medium">{col.deals.length}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {formatCurrency(col.total)}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3 min-h-[200px]">
                {col.deals.map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
                {col.deals.length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl h-24 flex items-center justify-center">
                    <span className="text-xs text-slate-300">No deals</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
