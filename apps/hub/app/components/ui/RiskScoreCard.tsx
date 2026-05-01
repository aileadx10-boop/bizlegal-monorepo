'use client'

import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'

interface RiskScoreCardProps {
  score: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  label?: string
  animated?: boolean
  className?: string
}

const riskConfig = {
  LOW: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', label: 'Low Risk', icon: CheckCircle },
  MODERATE: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', label: 'Moderate Risk', icon: AlertTriangle },
  CRITICAL: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', label: 'Critical Risk', icon: AlertTriangle },
}

function getRiskLevel(score: number) {
  if (score >= 70) return 'CRITICAL'
  if (score >= 40) return 'MODERATE'
  return 'LOW'
}

function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = value / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setDisplay(value)
        clearInterval(timer)
      } else {
        setDisplay(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [value, duration])

  return <span>{display}</span>
}

export function RiskScoreCard({ score, size = 'md', showLabel = true, label, animated = true, className = '' }: RiskScoreCardProps) {
  const level = getRiskLevel(score)
  const config = riskConfig[level]
  const Icon = config.icon
  const sizeClasses = {
    sm: { container: 'p-4', score: 'text-2xl', label: 'text-xs' },
    md: { container: 'p-6', score: 'text-4xl', label: 'text-sm' },
    lg: { container: 'p-8', score: 'text-6xl', label: 'text-base' },
    xl: { container: 'p-10', score: 'text-8xl', label: 'text-lg' },
  }
  const s = sizeClasses[size]

  return (
    <div
      className={`relative ${s.container} rounded-2xl border ${className}`}
      style={{
        background: config.bg,
        borderColor: config.border,
        backdropFilter: 'blur(12px)',
      }}
    >
      {showLabel && (
        <div className="flex items-center gap-2 mb-4">
          <Icon size={16} style={{ color: config.color }} />
          <span className={`${s.label} font-mono uppercase tracking-wider font-semibold`} style={{ color: config.color }}>
            {label || config.label}
          </span>
        </div>
      )}
      <div className="flex items-end gap-3">
        <span
          className={`${s.score} font-bold tracking-tighter`}
          style={{ color: config.color, fontFamily: 'JetBrains Mono, monospace' }}
        >
          {animated ? <AnimatedNumber value={score} /> : score}
        </span>
        <span className="text-sm text-white/40 font-mono mb-2 mb-2">/100</span>
      </div>
      <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${score}%`, background: config.color }}
        />
      </div>
    </div>
  )
}

export function RiskBreakdownCard({ regulatory, financial, enforcement }: { regulatory: number; financial: number; enforcement: number }) {
  const items = [
    { label: 'Regulatory', value: regulatory, desc: 'Compliance & licensing gaps' },
    { label: 'Financial', value: financial, desc: 'Capital requirements & AML' },
    { label: 'Enforcement', value: enforcement, desc: 'Active investigations & history' },
  ]

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4">
      <h3 className="text-sm font-mono uppercase tracking-wider text-white/50 mb-4">Risk Breakdown</h3>
      {items.map(item => {
        const level = getRiskLevel(item.value)
        const config = riskConfig[level]
        return (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-white">{item.label}</span>
                <p className="text-xs text-white/40">{item.desc}</p>
              </div>
              <span className="font-mono font-bold" style={{ color: config.color }}>{item.value}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${item.value}%`, background: config.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function EnforcementProbabilityCard({ probability, exposure }: { probability: number; exposure: string }) {
  const level = getRiskLevel(probability)
  const config = riskConfig[level]

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-white/50 mb-4">Enforcement Outlook</h3>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-bold font-mono" style={{ color: config.color }}>{probability}%</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Est. Exposure</span>
          <span className="font-mono font-semibold text-white">{exposure}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Probability</span>
          <span className="font-mono" style={{ color: config.color }}>{probability}%</span>
        </div>
      </div>
    </div>
  )
}
