const STEPS = [
  { n: '01', title: 'Scan', body: 'Customer voice, market demand, competitors and regulatory change — read weekly, not guessed.' },
  { n: '02', title: 'Connect', body: 'The analyst looks for where pain, money, urgency, regulation and buyer access intersect.' },
  { n: '03', title: 'Validate', body: 'Every opportunity carries sources, dates, a confidence level and a stated reason — no evidence, no opportunity.' },
  { n: '04', title: 'Build', body: 'Request BUILD THIS: an offer, buyer, deliverable, pricing hypothesis and next actions, cited to the evidence.' },
] as const

export default function HowItWorks(): JSX.Element {
  return (
    <section id="how" className="bx-section bx-container">
      <p className="bx-label" style={{ marginBottom: 10 }}>The engine</p>
      <h2 className="bx-h2" style={{ marginBottom: 40, maxWidth: 640 }}>Most intelligence stops at information. BrainX ends at an opportunity.</h2>
      <div className="bx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 22 }}>
        {STEPS.map((s, i) => (
          <div key={s.n} className="bx-card bx-card--flat" style={{ position: 'relative' }}>
            <span className="bx-mono" style={{ fontSize: 12, color: 'var(--bl-accent)' }}>{s.n}</span>
            <h3 className="bx-h3" style={{ fontSize: 17, marginTop: 8, marginBottom: 8 }}>{s.title}</h3>
            <p className="bx-muted" style={{ fontSize: 13.5, lineHeight: 1.6 }}>{s.body}</p>
            {i < STEPS.length - 1 && (
              <span aria-hidden="true" className="bx-mono" style={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', color: 'var(--bl-text-subtle)', display: 'none' }}>→</span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
