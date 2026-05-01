'use client'

import { AnimatedCounter } from './AnimatedCounter'

interface StatItem {
  label: string
  value: number
  prefix?: string
  suffix?: string
}

interface StatCounterBlockProps {
  stats: StatItem[]
  className?: string
}

export function StatCounterBlock({ stats, className = '' }: StatCounterBlockProps) {
  return (
    <div
      className={`grid gap-8 ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={i}
          className="glass-card"
          style={{
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
            }}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <AnimatedCounter
            value={stat.value}
            prefix={stat.prefix}
            suffix={stat.suffix}
            className="quantum-h2"
            style={{
              color: 'var(--white)',
              fontVariantNumeric: 'tabular-nums',
            } as React.CSSProperties}
          />
          <span
            style={{
              fontSize: 14,
              color: 'var(--muted)',
              lineHeight: 1.5,
            }}
          >
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  )
}