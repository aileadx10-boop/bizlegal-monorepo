import type { ReactNode } from 'react'

interface IntelligenceCardProps {
  /** Small caps category (e.g. "Chain Intel") */
  category: string
  /** Product name (e.g. "TRACR") */
  name: string
  /** Tagline (e.g. "Wallet & Transaction Intelligence") */
  tagline: string
  /** 1-2 sentence description */
  description: string
  /** Bullet list of capabilities (3-4 items) */
  features: ReadonlyArray<string>
  /** External link to the product subdomain */
  href: string
  /** Optional accent override per product (defaults to brand purple) */
  accent?: string
  /** Optional inline icon node (lucide-react icon recommended) */
  icon?: ReactNode
  /** Featured = larger card on bento grid */
  featured?: boolean
}

/**
 * IntelligenceCard — bento grid tile for the hub homepage's six product
 * surfaces (TRACR, BRAI, LexAudit, DocAI, Forge, LeadForge).
 *
 * Direction C: light mode = lavender-white card with purple accent, hover
 * lifts 4px with shadow glow. Dark mode = navy card with gold/purple accent.
 *
 * Per-product accent override allowed via `accent` prop so each product
 * keeps its own brand color while the card structure stays consistent.
 */
export function IntelligenceCard({
  category,
  name,
  tagline,
  description,
  features,
  href,
  accent,
  icon,
  featured = false,
}: IntelligenceCardProps) {
  const accentVar = accent ?? 'var(--bl-accent)'

  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="bl-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        textDecoration: 'none',
        color: 'inherit',
        gridColumn: featured ? 'span 2' : 'span 1',
        minHeight: featured ? 320 : 280,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        <span
          className="bl-label"
          style={{ color: accentVar, fontSize: 10 }}
        >
          {category}
        </span>
        {icon && (
          <span
            aria-hidden="true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 'var(--bl-radius-md)',
              background: 'var(--bl-accent-soft)',
              color: accentVar,
            }}
          >
            {icon}
          </span>
        )}
      </div>

      <h3
        style={{
          fontFamily: 'var(--bl-font-display)',
          fontSize: featured ? 'clamp(1.5rem, 1rem + 1vw, 2rem)' : 'var(--bl-text-h3)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: 'var(--bl-text)',
          margin: 0,
          lineHeight: 1.15,
        }}
      >
        {name}
        <span
          style={{
            display: 'block',
            fontSize: '0.75em',
            fontWeight: 500,
            color: 'var(--bl-text-muted)',
            marginTop: 4,
          }}
        >
          {tagline}
        </span>
      </h3>

      <p
        style={{
          fontFamily: 'var(--bl-font-body)',
          fontSize: 'var(--bl-text-body)',
          lineHeight: 1.6,
          color: 'var(--bl-text-muted)',
          margin: 0,
          flex: 1,
        }}
      >
        {description}
      </p>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'grid',
          gap: 6,
        }}
      >
        {features.map((f) => (
          <li
            key={f}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              fontFamily: 'var(--bl-font-body)',
              fontSize: 'var(--bl-text-small)',
              color: 'var(--bl-text-subtle)',
              lineHeight: 1.5,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                color: accentVar,
                fontSize: 12,
                lineHeight: '1.5',
                flexShrink: 0,
              }}
            >
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>

      <div
        style={{
          marginTop: '0.5rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--bl-divider)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'var(--bl-font-mono)',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: accentVar,
        }}
      >
        <span>Open {name}</span>
        <span aria-hidden="true">→</span>
      </div>
    </a>
  )
}

export default IntelligenceCard
