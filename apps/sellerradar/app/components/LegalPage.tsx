import type { ReactNode } from 'react'

/** Shared shell for the simple legal/prose pages (footer links resolve here). */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bl-section" style={{ paddingTop: 'clamp(3rem, 2rem + 3vw, 5rem)' }}>
      <div className="bl-container-narrow">
        <h1
          style={{
            fontFamily: 'var(--bl-font-display)',
            fontSize: 'var(--bl-text-h2)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--bl-text)',
            margin: '0 0 1.5rem',
          }}
        >
          {title}
        </h1>
        <div style={{ color: 'var(--bl-text-muted)', fontSize: 'var(--bl-text-body)', lineHeight: 1.75, display: 'grid', gap: '1rem' }}>
          {children}
        </div>
      </div>
    </section>
  )
}
