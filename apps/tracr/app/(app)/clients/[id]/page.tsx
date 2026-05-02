export const dynamic = 'force-dynamic'
import { supabase, formatCurrency } from '@/lib/supabase'
import type { Client, Deal } from '@/lib/supabase'
import TopBar from '@/components/TopBar'
import StageBadge from '@/components/StageBadge'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Globe, Building2, Plus } from 'lucide-react'

async function getClient(id: string) {
  const [{ data: client }, { data: deals }] = await Promise.all([
    supabase.from('trcr_clients').select('*').eq('id', id).single(),
    supabase.from('trcr_deals').select('*').eq('client_id', id).order('created_at', { ascending: false }),
  ])
  return { client: client as Client | null, deals: (deals ?? []) as Deal[] }
}

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const { client, deals } = await getClient(params.id)
  if (!client) notFound()

  const totalValue = deals.reduce((s, d) => s + d.value, 0)
  const wonValue = deals.filter(d => d.stage === 'closed_won').reduce((s, d) => s + d.value, 0)

  return (
    <>
      <TopBar title={client.name} />
      <div className="p-6 max-w-4xl">
        <Link href="/clients" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft size={14} /> Back to Clients
        </Link>

        <div className="grid grid-cols-3 gap-6">
          {/* Client Card */}
          <div className="col-span-1 space-y-4">
            <div className="card p-5">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-3">
                {client.name.charAt(0)}
              </div>
              <h2 className="text-lg font-bold text-slate-900">{client.name}</h2>
              {client.company && (
                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                  <Building2 size={12} /> {client.company}
                </p>
              )}

              <div className="mt-4 space-y-2.5">
                {client.email && (
                  <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm text-indigo-600 hover:underline">
                    <Mail size={13} /> {client.email}
                  </a>
                )}
                {client.phone && (
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={13} /> {client.phone}
                  </p>
                )}
                {client.country && (
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <Globe size={13} /> {client.country}
                  </p>
                )}
              </div>

              {client.notes && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">Notes</p>
                  <p className="text-sm text-slate-600">{client.notes}</p>
                </div>
              )}
            </div>

            <div className="card p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Deals</span>
                <span className="font-semibold">{deals.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Pipeline</span>
                <span className="font-semibold">{formatCurrency(totalValue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Won Revenue</span>
                <span className="font-semibold text-emerald-700">{formatCurrency(wonValue)}</span>
              </div>
            </div>
          </div>

          {/* Deals */}
          <div className="col-span-2">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700">Deals ({deals.length})</h3>
                <Link href={`/deals/new`} className="btn-primary flex items-center gap-1 text-xs py-1.5 px-3">
                  <Plus size={12} /> New Deal
                </Link>
              </div>

              {deals.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-500">Deal</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">Stage</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">Value</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deals.map(deal => (
                      <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-900">{deal.title}</p>
                          {deal.doc_type && <p className="text-xs text-slate-400">{deal.doc_type}</p>}
                        </td>
                        <td className="px-4 py-3"><StageBadge stage={deal.stage} /></td>
                        <td className="px-4 py-3 font-medium text-slate-700">{formatCurrency(deal.value, deal.currency)}</td>
                        <td className="px-4 py-3">
                          <Link href={`/deals/${deal.id}`} className="text-xs text-indigo-600 hover:underline">View →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-slate-400 mb-3">No deals for this client yet.</p>
                  <Link href="/deals/new" className="btn-primary text-sm">Create Deal</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
