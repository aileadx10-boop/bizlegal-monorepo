'use client'

import { useState, useEffect } from 'react'
import { Activity, TrendingUp, AlertTriangle, Globe, Shield } from 'lucide-react'

interface MetricItem {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  live?: boolean
}

const liveMetrics: MetricItem[] = [
  { label: 'Global Risk Index', value: '67.4', change: '+2.1', trend: 'up', icon: <Activity size={14} />, live: true },
  { label: 'Active Enforcements', value: '1,847', change: '+12', trend: 'up', icon: <AlertTriangle size={14} />, live: true },
  { label: 'Jurisdictions Tracked', value: '54', trend: 'neutral', icon: <Globe size={14} />, live: false },
  { label: 'Compliance Decisions', value: '24.3K', change: '+8%', trend: 'up', icon: <Shield size={14} />, live: false },
]

export function GlobalMetricsBar() {
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    setMounted(true)
    const update = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-3 max-w-[1800px] mx-auto">
        {liveMetrics.map((metric, i) => (
          <div key={metric.label} className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={mounted && metric.live ? 'text-red-400 animate-pulse' : 'text-white/30'}>
                {metric.icon}
              </span>
              <div className="hidden md:block">
                <div className="text-xs text-white/40 font-mono uppercase tracking-wider">{metric.label}</div>
              </div>
            </div>
            <div className="text-sm font-bold text-white font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {metric.value}
            </div>
            {metric.change && (
              <div className={`hidden md:flex items-center gap-0.5 text-xs font-mono ${
                metric.trend === 'up' ? 'text-red-400' : metric.trend === 'down' ? 'text-emerald-400' : 'text-white/40'
              }`}>
                <TrendingUp size={10} className={metric.trend === 'down' ? 'rotate-180' : ''} />
                {metric.change}
              </div>
            )}
            {i < liveMetrics.length - 1 && (
              <div className="hidden lg:block w-px h-6 bg-white/10 mx-2" />
            )}
          </div>
        ))}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-white/30">
          <div className={`w-1.5 h-1.5 rounded-full ${mounted ? 'bg-emerald-400' : 'bg-white/20'} animate-pulse`} />
          <span>LIVE</span>
          {time && <span className="text-white/60">{time}</span>}
        </div>
      </div>
    </div>
  )
}

export function JurisdictionHeatmapWidget({ className = '' }: { className?: string }) {
  const heatmapData = [
    { code: 'US', flag: '🇺🇸', name: 'United States', risk: 62 },
    { code: 'EU', flag: '🇪🇺', name: 'European Union', risk: 58 },
    { code: 'UK', flag: '🇬🇧', name: 'United Kingdom', risk: 55 },
    { code: 'SG', flag: '🇸🇬', name: 'Singapore', risk: 38 },
    { code: 'UAE', flag: '🇦🇪', name: 'UAE / Dubai', risk: 45 },
    { code: 'CH', flag: '🇨🇭', name: 'Switzerland', risk: 32 },
    { code: 'KY', flag: '🇰🇾', name: 'Cayman Islands', risk: 28 },
    { code: 'VG', flag: '🇻🇬', name: 'BVI', risk: 25 },
    { code: 'JP', flag: '🇯🇵', name: 'Japan', risk: 35 },
    { code: 'AU', flag: '🇦🇺', name: 'Australia', risk: 42 },
    { code: 'CA', flag: '🇨🇦', name: 'Canada', risk: 48 },
    { code: 'DE', flag: '🇩🇪', name: 'Germany', risk: 56 },
  ]

  return (
    <div className={`grid grid-cols-4 md:grid-cols-6 gap-2 ${className}`}>
      {heatmapData.map(j => (
        <div
          key={j.code}
          className="group relative"
          title={`${j.name}: Risk ${j.risk}`}
        >
          <div
            className="aspect-square rounded-lg flex items-center justify-center text-lg border border-white/10 hover:border-white/30 transition-all cursor-pointer hover:scale-105"
            style={{
              background: `rgba(${j.risk > 60 ? '239,68,68' : j.risk > 40 ? '245,158,11' : '16,185,129'}, ${j.risk / 250 + 0.1})`
            }}
          >
            {j.flag}
          </div>
          <div className="absolute inset-0 bg-black/90 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-center p-1 z-10">
            <span className="text-xs font-bold text-white">{j.name}</span>
            <span className={`text-xs font-mono font-bold ${
              j.risk > 60 ? 'text-red-400' : j.risk > 40 ? 'text-amber-400' : 'text-emerald-400'
            }`}>Risk {j.risk}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
