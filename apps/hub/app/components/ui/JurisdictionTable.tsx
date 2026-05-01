'use client'

import { useState } from 'react'
import { ArrowRight, Filter } from 'lucide-react'

export interface JurisdictionData {
  id: string
  name: string
  flag: string
  riskScore: number
  complianceCost: string
  speedToOperate: string
  enforcementAggression: 'Low' | 'Medium' | 'High'
  keyRegulations: string[]
  optimal?: boolean
  recommended?: boolean
}

interface JurisdictionTableProps {
  data: JurisdictionData[]
  onSelect?: (jurisdiction: JurisdictionData) => void
  className?: string
}

type SortKey = 'name' | 'riskScore' | 'complianceCost' | 'speedToOperate'

function getRiskColor(score: number): string {
  if (score < 30) return 'text-emerald-400'
  if (score < 60) return 'text-amber-400'
  return 'text-red-400'
}

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  const Arrow = dir === 'asc' ? '↑' : '↓'
  return (
    <span className={`inline-flex ml-1 ${active ? 'text-indigo-400' : 'text-white/20'}`}>
      {Arrow}
    </span>
  )
}

export function JurisdictionTable({ data, onSelect, className = '' }: JurisdictionTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('riskScore')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [filter, setFilter] = useState('')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = data.filter(j =>
    j.name.toLowerCase().includes(filter.toLowerCase()) ||
    j.keyRegulations.some(r => r.toLowerCase().includes(filter.toLowerCase()))
  )

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0
    if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
    else if (sortKey === 'riskScore') cmp = a.riskScore - b.riskScore
    else if (sortKey === 'complianceCost') {
      const parseCost = (s: string) => parseInt(s.replace(/[^0-9]/g, '')) || 0
      cmp = parseCost(a.complianceCost) - parseCost(b.complianceCost)
    }
    else if (sortKey === 'speedToOperate') cmp = a.speedToOperate.localeCompare(b.speedToOperate)
    return sortDir === 'asc' ? cmp : -cmp
  })

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden ${className}`}>
      {/* Filter bar */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <Filter size={16} className="text-white/40" />
        <input
          type="text"
          placeholder="Filter jurisdictions..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
        />
        <span className="text-xs font-mono text-white/40">{sorted.length} jurisdictions</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th
                onClick={() => handleSort('name')}
                className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-white/40 cursor-pointer hover:text-white/70 transition-colors"
              >
                Jurisdiction
                <SortIcon active={sortKey === 'name'} dir={sortDir} />
              </th>
              <th
                onClick={() => handleSort('riskScore')}
                className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-white/40 cursor-pointer hover:text-white/70 transition-colors"
              >
                Risk Score
                <SortIcon active={sortKey === 'riskScore'} dir={sortDir} />
              </th>
              <th
                onClick={() => handleSort('complianceCost')}
                className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-white/40 cursor-pointer hover:text-white/70 transition-colors"
              >
                Compliance Cost
                <SortIcon active={sortKey === 'complianceCost'} dir={sortDir} />
              </th>
              <th
                onClick={() => handleSort('speedToOperate')}
                className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-white/40 cursor-pointer hover:text-white/70 transition-colors"
              >
                Speed to Operate
                <SortIcon active={sortKey === 'speedToOperate'} dir={sortDir} />
              </th>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-white/40">
                Enforcement
              </th>
              <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider text-white/40">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(j => (
              <tr
                key={j.id}
                className={`border-b border-white/5 hover:bg-white/5 transition-colors ${j.optimal ? 'bg-indigo-500/5' : ''}`}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{j.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{j.name}</span>
                        {j.optimal && (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            OPTIMAL
                          </span>
                        )}
                        {j.recommended && (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {j.keyRegulations.slice(0, 2).map(reg => (
                          <span key={reg} className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-white/40 font-mono">{reg}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold font-mono ${getRiskColor(j.riskScore)}`}>{j.riskScore}</span>
                    <span className="text-white/20 text-xs font-mono">/100</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-white/70 font-mono">{j.complianceCost}</span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-white/70 font-mono">{j.speedToOperate}</span>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                    j.enforcementAggression === 'Low' ? 'bg-emerald-500/20 text-emerald-400' :
                    j.enforcementAggression === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {j.enforcementAggression}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button
                    onClick={() => onSelect?.(j)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
                  >
                    {j.optimal ? 'Select' : 'View'}
                    <ArrowRight size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function JurisdictionHeatmap({ data }: { data: JurisdictionData[] }) {
  return (
    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
      {data.map(j => (
        <div
          key={j.id}
          className="relative group cursor-pointer"
          title={`${j.name}: Risk ${j.riskScore}`}
        >
          <div
            className="aspect-square rounded-lg flex items-center justify-center text-lg border border-white/10 hover:border-white/30 transition-all hover:scale-105"
            style={{
              background: `rgba(${j.riskScore > 60 ? '239,68,68' : j.riskScore > 30 ? '245,158,11' : '16,185,129'}, ${j.riskScore / 300 + 0.05})`
            }}
          >
            {j.flag}
          </div>
          <div className="absolute inset-0 bg-black/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-center p-2">
              <div className="text-xs font-bold text-white">{j.name}</div>
              <div className="text-xs font-mono" style={{ color: j.riskScore > 60 ? '#ef4444' : j.riskScore > 30 ? '#f59e0b' : '#10B981' }}>Risk: {j.riskScore}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
