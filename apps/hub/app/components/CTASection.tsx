import Link from 'next/link'
import { productLinks } from '@/app/lib/site-content'

export function CTASection() {
  return (
    <section className="section-shell">
      <div className="container">
        <div
          style={{
            padding: '3.5rem',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(43,87,255,0.18), rgba(108,185,255,0.08))',
            border: '1px solid rgba(108,185,255,0.22)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background glow */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '400px',
              height: '200px',
              background: 'radial-gradient(ellipse, rgba(43,87,255,0.25), transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <span className="eyebrow" style={{ marginBottom: '1rem', display: 'block' }}>
            Last warning before you sign
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display), serif',
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
              margin: '0 0 1.25rem',
            }}
          >
            If You&apos;re About to Launch, Raise, or Expand — Do This First.
          </h2>
          <p
            style={{
              color: 'var(--muted)',
              lineHeight: 1.8,
              maxWidth: '62ch',
              margin: '0 auto 2rem',
              fontSize: '1.05rem',
            }}
          >
            Most regulatory disasters were preventable. The ones that weren&apos;t had no warning.
            Run a BRAI scan before you commit to your next move — and know exactly where you&apos;re exposed.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a className="button button-primary" href={productLinks.brai}>
              Start BRAI Scan — Free
            </a>
            <Link className="button button-secondary" href="/posts">
              Browse Intelligence Hub
            </Link>
          </div>
          <p
            style={{
              marginTop: '1.25rem',
              color: 'var(--muted)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
            }}
          >
            No signup required · Attorney-led analysis · UAE, VARA, ADGM, MiCA coverage
          </p>
        </div>
      </div>
    </section>
  )
}
