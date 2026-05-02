export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import type { Client } from '@/lib/supabase'

interface ClientWithDeals extends Client {
  trcr_deals?: { id: string; stage: string; value: number; currency: string }[]
}
import TopBar from '@/components/TopBar'
import Link from 'next/link'
import { Plus, ChevronRight, Globe } from 'lucide-react'

async function getClients() {
  const { data } = await supabase
    .from('trcr_clients')
    .select('*, trcr_deals(id, stage, value, currency)')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <>
      <TopBar title="Clients" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">{clients.length} clients</p>
          <Link href="/clients/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14} /> Add Client
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {(clients as ClientWithDeals[]).map((client) => {
            const dealCount = client.trcr_deals?.length ?? 0
            const totalValue = (client.trcr_deals ?? []).reduce((s, d) => s + d.value, 0)

            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="card p-5 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {client.name.charAt(0)}
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>

                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{client.name}</h3>
                {client.company && <p className="text-sm text-slate-500">{client.company}</p>}

                <div className="flex items-center gap-1 mt-1">
                  {client.country && (
                    <span className="text-xs text-slate-400 flex items-center gap-0.5">
                      <Globe size={10} /> {client.country}
                    </span>
                  )}
                  {client.industry && (
                    <span className="text-xs text-slate-400">· {client.industry}</span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    {dealCount} deal{dealCount !== 1 ? 's' : ''}
                  </span>
                  {totalValue > 0 && (
                    <span className="text-xs font-medium text-slate-700">
                      ${totalValue.toLocaleString()}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}

          {clients.length === 0 && (
            <div className="col-span-3 text-center py-16">
              <p className="text-slate-400 text-sm mb-3">No clients yet.</p>
              <Link href="/clients/new" className="btn-primary">Add First Client</Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
