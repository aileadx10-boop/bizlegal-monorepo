import type { ReactNode } from 'react'
import type { OpportunityVM } from '@/lib/radar/types'
import { VERTICAL_LABEL } from '@/lib/radar/types'
import StatusPill from './StatusPill'
import ScoreBars from './ScoreBars'
import EvidenceVault from './EvidenceVault'
import RunStamp from './RunStamp'

interface Props {
  readonly o: OpportunityVM
  readonly buildSlot?: ReactNode
}

function money(n: number | undefined): string | null {
  if (typeof n !== 'number') return null
  return `$${n.toLocaleString('en-US')}`
}

export default function OpportunityDetail({ o, buildSlot }: Props): JSX.Element {
  const pricing = o.proposed_pricing
  return (
    <article className="bx-grid" style={{ gap: 32 }}>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <span className="bx-chip bx-chip--vertical">{VERTICAL_LABEL[o.vertical]}</span>
          <StatusPill status={o.score.status} />
          <RunStamp finishedAt={o.run.finished_at} />
        </div>
        <h1 className="bx-h2" style={{ marginBottom: 12 }}>{o.name}</h1>
        {o.why_now.length > 0 && (
          <div className="bx-grid" style={{ gap: 4, marginTop: 16 }}>
            <span className="bx-label">Why now</span>
            {o.why_now.map((line, i) => (
              <p key={i} style={{ margin: 0, fontSize: 14, color: 'var(--bl-text-muted)' }}>· {line}</p>
            ))}
          </div>
        )}
      </header>

      <section className="bx-card">
        <ScoreBars score={o.score} variant="full" />
      </section>

      <section className="bx-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <h2 className="bx-label" style={{ marginBottom: 8, display: 'block' }}>Problem</h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.7 }}>{o.problem}</p>
        </div>
        <div>
          <h2 className="bx-label" style={{ marginBottom: 8, display: 'block' }}>Who should care</h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.7 }}>{o.target_customer ?? 'Not yet specified.'}</p>
        </div>
      </section>

      {o.proposed_product && (
        <section className="bx-card bx-card--accent">
          <h2 className="bx-label" style={{ marginBottom: 8, display: 'block' }}>What to sell</h2>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: pricing ? 8 : 0 }}>{o.proposed_product}</p>
          {pricing && (money(pricing.initial) || money(pricing.recurring)) && (
            <p className="bx-mono bx-muted" style={{ fontSize: 13 }}>
              Pricing hypothesis — not market-confirmed:{' '}
              {money(pricing.initial) && `${money(pricing.initial)} setup`}
              {money(pricing.initial) && money(pricing.recurring) && ' + '}
              {money(pricing.recurring) && `${money(pricing.recurring)}/${pricing.recurring_period ?? 'month'}`}
            </p>
          )}
        </section>
      )}

      {o.gtm_channels.length > 0 && (
        <section>
          <h2 className="bx-label" style={{ marginBottom: 8, display: 'block' }}>Suggested GTM channels</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {o.gtm_channels.map((c) => <span key={c} className="bx-chip">{c}</span>)}
          </div>
        </section>
      )}

      <section className="bx-card">
        <EvidenceVault evidence={o.evidence} />
      </section>

      {o.status_reason && (
        <section>
          <h2 className="bx-label" style={{ marginBottom: 8, display: 'block' }}>BrainX conclusion</h2>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--bl-text-muted)' }}>{o.status_reason}</p>
          <p style={{ fontSize: 12, color: 'var(--bl-text-subtle)', marginTop: 8 }}>
            This is an inferred commercial opportunity based on the evidence above. It is not a guaranteed business outcome.
            {typeof o.confidence === 'number' && <> Analyst confidence: <span className="bx-mono">{Math.round(o.confidence * 100)}%</span>.</>}
          </p>
        </section>
      )}

      {buildSlot && <section>{buildSlot}</section>}
    </article>
  )
}
