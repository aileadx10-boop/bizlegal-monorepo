export interface Faq {
  readonly q: string
  readonly a: string
}

export const HOME_FAQ: readonly Faq[] = [
  { q: 'Is BrainX AI research or a product?', a: 'A weekly, operator-run opportunity radar. It produces structured opportunity cards with evidence and a score — not a chat interface, and not a 24/7 automated pipeline.' },
  { q: 'What happens after I subscribe?', a: 'You define your radar profile (up to 5, across the three verticals), receive access to the current radar, and see new opportunities each week the radar runs, with a real timestamp on every run.' },
  { q: 'Does BrainX guarantee revenue?', a: 'No. It is decision-support software. Every opportunity states its evidence, its score and its reasoning — the decision to pursue it is yours.' },
  { q: 'What is BUILD THIS?', a: 'A request for a brief on one opportunity: offer, buyer, deliverable, pricing hypothesis, sales angle, landing-page brief, delivery workflow, evidence pack and next actions — every claim cited to the opportunity’s own evidence.' },
]

export default function FaqList({ items }: { items: readonly Faq[] }): JSX.Element {
  return (
    <div className="bx-grid" style={{ gap: 14 }}>
      {items.map((f) => (
        <div key={f.q} className="bx-card bx-card--flat">
          <h3 className="bx-h3" style={{ fontSize: 15, marginBottom: 8 }}>{f.q}</h3>
          <p className="bx-muted" style={{ fontSize: 13.5, lineHeight: 1.6 }}>{f.a}</p>
        </div>
      ))}
    </div>
  )
}
