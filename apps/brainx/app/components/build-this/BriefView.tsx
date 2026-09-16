import type { BriefVM } from '@/lib/radar/types'

const SECTION_LABEL: Record<keyof NonNullable<BriefVM['brief']>, string> = {
  offer: 'Offer',
  buyer: 'Buyer',
  deliverable: 'Deliverable',
  pricing_hypothesis: 'Pricing hypothesis',
  sales_angle: 'Sales angle',
  landing_page_brief: 'Landing-page brief',
  delivery_workflow: 'Delivery workflow',
  evidence_pack: 'Evidence pack',
  next_actions: 'Next 3 actions',
}

export default function BriefView({ brief }: { brief: BriefVM }): JSX.Element {
  if (brief.status !== 'ready' && brief.status !== 'delivered') {
    return (
      <div className="bx-card">
        <p className="bx-label" style={{ marginBottom: 8, display: 'block' }}>{brief.opportunity_name}</p>
        <p style={{ fontSize: 14 }}>Brief requested {new Date(brief.requested_at).toLocaleDateString('en-US')}. {brief.turnaround_note}</p>
      </div>
    )
  }

  if (!brief.brief) {
    return <p className="bx-muted">Brief is marked ready but has no content yet — contact support.</p>
  }

  return (
    <div className="bx-grid" style={{ gap: 24 }}>
      <header>
        <h1 className="bx-h2">{brief.opportunity_name}</h1>
        <p className="bx-eyebrow" style={{ marginTop: 8 }}>Ready {brief.ready_at ? new Date(brief.ready_at).toLocaleDateString('en-US') : ''}</p>
      </header>
      {(Object.keys(SECTION_LABEL) as (keyof NonNullable<BriefVM['brief']>)[]).map((key) => {
        const section = brief.brief![key]
        return (
          <section key={key} className="bx-card">
            <h2 className="bx-label" style={{ marginBottom: 8, display: 'block' }}>{SECTION_LABEL[key]}</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{section.text}</p>
            {section.evidence_ids.length > 0 && (
              <p className="bx-mono bx-muted" style={{ fontSize: 11, marginTop: 8 }}>Cites: {section.evidence_ids.join(', ')}</p>
            )}
          </section>
        )
      })}
      {brief.review && (
        <section className="bx-card bx-card--accent">
          <h2 className="bx-label" style={{ marginBottom: 8, display: 'block' }}>Expert review — Moses Dor, Adv.</h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{brief.review.text}</p>
          <p className="bx-eyebrow" style={{ marginTop: 8 }}>Reviewed {new Date(brief.review.reviewed_at).toLocaleDateString('en-US')}</p>
        </section>
      )}
    </div>
  )
}
