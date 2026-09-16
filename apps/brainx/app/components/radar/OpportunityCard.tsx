import Link from 'next/link'
import type { OpportunityVM } from '@/lib/radar/types'
import { VERTICAL_LABEL } from '@/lib/radar/types'
import StatusPill from './StatusPill'
import ScoreBars from './ScoreBars'

interface Props {
  readonly o: OpportunityVM
  readonly href: string
  readonly compact?: boolean
}

export default function OpportunityCard({ o, href, compact = false }: Props): JSX.Element {
  return (
    <Link href={href} className="bx-card" style={{ display: 'block', textDecoration: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <span className="bx-chip bx-chip--vertical">{VERTICAL_LABEL[o.vertical]}</span>
        <StatusPill status={o.score.status} />
      </div>
      <h3 className="bx-h3" style={{ fontSize: compact ? 17 : 20, marginBottom: 8 }}>{o.name}</h3>
      {!compact && <p className="bx-muted" style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{o.problem}</p>}
      {o.why_now[0] && (
        <p style={{ fontSize: 12.5, color: 'var(--bl-text-muted)', marginBottom: 14 }}>
          <span className="bx-label" style={{ marginRight: 6 }}>Why now</span>
          {o.why_now[0]}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ScoreBars score={o.score} variant="mini" />
        <span className="bx-eyebrow">{o.evidence.length} sources</span>
      </div>
    </Link>
  )
}
