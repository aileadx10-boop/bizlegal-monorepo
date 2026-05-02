import type { ReactNode } from 'react'

interface HeroProps {
  /** Small caps label above the headline (e.g. "Compliance Intelligence") */
  eyebrow?: string
  /** Main headline. Wrap text you want gradient-emphasized in <span className="bl-grad-text">…</span> */
  headline: ReactNode
  /** 1-2 sentence sub-headline */
  subheadline?: ReactNode
  /** Primary CTA */
  primaryCta?: { label: string; href: string }
  /** Secondary CTA (ghost) */
  secondaryCta?: { label: string; href: string }
  /** Optional AI-generated hero image src (placed to the right on lg+, hidden on mobile) */
  imageSrc?: string
  imageAlt?: string
  /** Tight = no top padding (use under sticky header) */
  tight?: boolean
}

/**
 * Hero — Direction C adaptive header section.
 *
 * Light mode: blog-aligned with purple→pink gradient text emphasis +
 * lavender-white surface, mesh hero gradient overlay.
 *
 * Dark mode: navy near-black bg + gold→purple gradient text + same
 * mesh structure (auto-swapped via CSS vars).
 */
export function Hero({
  eyebrow,
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  imageSrc,
  imageAlt = '',
  tight = false,
}: HeroProps) {
  return (
    <section
      className="bl-hero-bg"
      style={{
        position: 'relative',
        paddingTop: tight ? '4rem' : 'clamp(4rem, 2rem + 6vw, 8rem)',
        paddingBottom: 'clamp(4rem, 2rem + 5vw, 7rem)',
        overflow: 'hidden',
      }}
    >
      <div
        className="bl-container"
        style={{
          display: 'grid',
          gridTemplateColumns: imageSrc ? 'minmax(0, 1.1fr) minmax(0, 1fr)' : 'minmax(0, 1fr)',
          gap: 'clamp(1.5rem, 1rem + 2vw, 4rem)',
          alignItems: 'center',
        }}
      >
        {/* Text column */}
        <div style={{ maxWidth: imageSrc ? '100%' : '780px' }}>
          {eyebrow && (
            <div
              className="bl-label"
              style={{ marginBottom: 'clamp(1rem, 0.75rem + 1vw, 1.5rem)' }}
            >
              {eyebrow}
            </div>
          )}
          <h1
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: 'var(--bl-text-h1)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              color: 'var(--bl-text)',
              margin: 0,
              marginBottom: 'clamp(1rem, 0.75rem + 1vw, 1.5rem)',
            }}
          >
            {headline}
          </h1>
          {subheadline && (
            <p
              style={{
                fontFamily: 'var(--bl-font-body)',
                fontSize: 'clamp(1.05rem, 0.95rem + 0.4vw, 1.25rem)',
                lineHeight: 1.6,
                color: 'var(--bl-text-muted)',
                margin: 0,
                marginBottom: 'clamp(1.5rem, 1rem + 1.5vw, 2.5rem)',
                maxWidth: '64ch',
              }}
            >
              {subheadline}
            </p>
          )}
          {(primaryCta || secondaryCta) && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {primaryCta && (
                <a href={primaryCta.href} className="bl-btn-primary">
                  {primaryCta.label}
                  <span aria-hidden="true">→</span>
                </a>
              )}
              {secondaryCta && (
                <a href={secondaryCta.href} className="bl-btn-ghost">
                  {secondaryCta.label}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Image column (hidden on mobile) */}
        {imageSrc && (
          <div
            style={{
              position: 'relative',
              aspectRatio: '5 / 4',
              borderRadius: 'var(--bl-radius-xl)',
              overflow: 'hidden',
              border: '1px solid var(--bl-border)',
              boxShadow: 'var(--bl-shadow-lg)',
              display: 'block',
            }}
            className="bl-hero-image"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={imageAlt}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .bl-hero-image { display: none !important; }
          .bl-container > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

export default Hero
