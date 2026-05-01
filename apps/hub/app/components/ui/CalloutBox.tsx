'use client'

import { ReactNode } from 'react'
import { Shield, AlertTriangle, Info, CheckCircle, Lightbulb } from 'lucide-react'

type CalloutVariant = 'info' | 'warning' | 'danger' | 'success' | 'tip'

interface CalloutBoxProps {
  variant?: CalloutVariant
  title?: string
  children: ReactNode
  icon?: ReactNode
  className?: string
}

const variantConfig = {
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: Info,
    iconColor: '#6366f1',
    titleColor: 'text-blue-400',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: AlertTriangle,
    iconColor: '#f59e0b',
    titleColor: 'text-amber-400',
  },
  danger: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: AlertTriangle,
    iconColor: '#ef4444',
    titleColor: 'text-red-400',
  },
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: CheckCircle,
    iconColor: '#10B981',
    titleColor: 'text-emerald-400',
  },
  tip: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    icon: Lightbulb,
    iconColor: '#818cf8',
    titleColor: 'text-indigo-400',
  },
}

export function CalloutBox({ variant = 'info', title, children, icon, className = '' }: CalloutBoxProps) {
  const config = variantConfig[variant]
  const Icon = icon || config.icon

  return (
    <div
      className={`rounded-xl border p-4 ${config.bg} ${config.border} ${className}`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {typeof Icon === 'function' ? (
            <Icon size={18} style={{ color: config.iconColor }} />
          ) : Icon}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold text-sm mb-1 ${config.titleColor}`}>{title}</h4>
          )}
          <div className="text-sm text-white/70 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: ReactNode
}

export function StatCard({ label, value, change, trend = 'neutral', icon }: StatCardProps) {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-white/40',
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-white/40">{label}</span>
        {icon && <span className="text-white/30">{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
      {change && (
        <div className={`text-xs font-mono ${trendColors[trend]}`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {change}
        </div>
      )}
    </div>
  )
}
