'use client'

import Link from 'next/link'
import type { Vertical } from '@/lib/radar/types'
import { VERTICAL_LABEL } from '@/lib/radar/types'

interface Props {
  readonly active: Vertical | 'all'
  readonly counts: Partial<Record<Vertical | 'all', number>>
  readonly basePath: string
}

const ORDER: readonly (Vertical | 'all')[] = ['all', 'real_estate', 'legal_compliance', 'ai_fintech_regulation']

export default function VerticalTabs({ active, counts, basePath }: Props): JSX.Element {
  return (
    <div role="tablist" aria-label="Vertical" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {ORDER.map((v) => {
        const label = v === 'all' ? 'All verticals' : VERTICAL_LABEL[v]
        const href = v === 'all' ? basePath : `${basePath}?vertical=${v}`
        const isActive = v === active
        return (
          <Link
            key={v}
            href={href}
            role="tab"
            aria-selected={isActive}
            className="bx-chip"
            style={isActive ? { color: 'var(--bl-accent)', borderColor: 'color-mix(in srgb, var(--bl-accent) 45%, var(--bl-border))', background: 'var(--bl-accent-soft)' } : undefined}
          >
            {label}
            {typeof counts[v] === 'number' && <span className="bx-mono" style={{ opacity: 0.7 }}>&nbsp;{counts[v]}</span>}
          </Link>
        )
      })}
    </div>
  )
}
