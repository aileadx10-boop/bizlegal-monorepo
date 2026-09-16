'use client'

import { useState } from 'react'
import PricingTiers from '@/app/components/marketing/PricingTiers'

export default function IntervalSwitch(): JSX.Element {
  const [interval, setInterval_] = useState<'monthly' | 'yearly'>('yearly')

  return (
    <div>
      <div role="tablist" aria-label="Billing interval" style={{ display: 'inline-flex', gap: 4, background: 'var(--bl-surface-soft)', padding: 4, borderRadius: 999, marginBottom: 28 }}>
        {(['yearly', 'monthly'] as const).map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={interval === v}
            onClick={() => setInterval_(v)}
            className={interval === v ? 'bx-btn-primary' : 'bx-btn-ghost'}
            style={{ padding: '8px 18px', fontSize: 13, border: interval === v ? undefined : 'none' }}
          >
            {v === 'yearly' ? 'Yearly (save 2 months)' : 'Monthly'}
          </button>
        ))}
      </div>
      <PricingTiers interval={interval} />
    </div>
  )
}
