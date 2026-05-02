export const dynamic = 'force-dynamic'
import { supabase, formatCurrency, STAGES } from '@/lib/supabase'
import type { Deal } from '@/lib/supabase'
import TopBar from '@/components/TopBar'
import DealCard from '@/components/DealCard'
import { TrendingUp, Users, FileText, AlertCircle } from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const [{ data: deals }, { data: clients }] = await Promise.all([
    supabase.from('trcr_deals').select('*, trcr_clients(name, company)'),
    supabase.from('trcr_clients').select('id'),
  ])

  const allDeals = (deals ?? []) as Deal[]
  const activeDeals = allDeals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
  const pipelineValue = activeDeals.reduce((s, d) => s + d.value, 0)
  const closedWon = allDeals.filter(d => d.stage === 'closed_won')
  const revenue = closedWon.reduce((s, d) => s + d.value, 0)

  const today = new Date()
  const overdue = activeDeals.filter(d => d.deadline && new Date(d.deadline) < today)

  // Recent 5 deals
  const recent = [...allDeals]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  // Stage breakdown
  const byStage = STAGES.map(s => ({
    ...s,
    count: allDeals.filter(d => d.stage === s.id).length,
    value: allDeals.filter(d => d.stage === s.id).reduce((sum, d) => sum + d.value, 0),
  }))

  return {
    allDeals,
    activeDeals,
    pipelineValue,
    revenue,
    overdue,
    recent,
    byStage,
    clientCount: (clients ?? []).length,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const kpis = [
    {
      label: 'Pipeline Value',
      value: formatCurrency(stats.pipelineValue),
      sub: `${stats.activeDeals.length} active deals`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Revenue Closed',
      value: formatCurrency(stats.revenue),
      sub: `${stats.allDeals.filter(d => d.stage === 'closed_won').length} deals won`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Clients',
      value: stats.clientCount.toString(),
      sub: 'Active accounts',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Overdue',
      value: stats.overdue.length.toString(),
      sub: 'Require attention',
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ]

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="p-6 space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map(kpi => (
            <div key={kpi.label} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">{kpi.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{kpi.sub}</p>
                </div>
                <div className={`${kpi.bg} p-2 rounded-lg`}>
                  <kpi.icon size={18} className={kpi.color} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Pipeline Funnel */}
          <div className="col-span-1 card p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Pipeline Funnel</h2>
            <div className="space-y-2">
              {stats.byStage.filter(s => s.count > 0).map(s => (
                <Link
                  key={s.id}
                  href={`/pipeline?stage=${s.id}`}
                  className="flex items-center justify-between group hover:bg-slate-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`badge ${s.bg} ${s.color}`}>{s.label}</span>
                    <span className="text-xs text-slate-400">{s.count} deal{s.count !== 1 ? 's' : ''}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {formatCurrency(s.value)}
                  </span>
                </Link>
              ))}
              {stats.byStage.every(s => s.count === 0) && (
                <p className="text-xs text-slate-400 text-center py-4">No deals yet. <Link href="/deals/new" className="text-indigo-600 underline">Create one →</Link></p>
              )}
            </div>
          </div>

          {/* Recent Deals */}
          <div className="col-span-2 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-700">Recent Deals</h2>
              <Link href="/deals" className="text-xs text-indigo-600 hover:underline">View all →</Link>
            </div>
            <div className="space-y-3">
              {stats.recent.map(deal => (
                <DealCard key={deal.id} deal={deal} />
              ))}
              {stats.recent.length === 0 && (
                <div className="text-center py-8">
                  <FileText size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No deals yet</p>
                  <Link href="/deals/new" className="btn-primary mt-3 inline-flex">+ New Deal</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overdue Alert */}
        {stats.overdue.length > 0 && (
          <div className="card p-5 border-red-200 bg-red-50">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-red-600" />
              <h2 className="text-sm font-semibold text-red-700">Overdue Deals ({stats.overdue.length})</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {stats.overdue.slice(0, 3).map(deal => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
