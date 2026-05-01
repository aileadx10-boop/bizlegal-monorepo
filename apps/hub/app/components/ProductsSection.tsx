import Link from 'next/link'
import { productCards } from '@/app/lib/site-content'
import { SectionHeading } from '@/app/components/SectionHeading'

const productIcons: Record<string, { icon: string; color: string; bg: string }> = {
  DocStack: {
    icon: '&#9636;',
    color: '#9fe1ff',
    bg: 'rgba(159,225,255,0.1)',
  },
  BRAI: {
    icon: '&#9670;',
    color: '#ff6b6b',
    bg: 'rgba(255,107,107,0.1)',
  },
  TRACR: {
    icon: '&#9650;',
    color: '#ffc107',
    bg: 'rgba(255,193,7,0.1)',
  },
  'Intelligence Hub': {
    icon: '&#9679;',
    color: '#6cb9ff',
    bg: 'rgba(108,185,255,0.1)',
  },
}

export function ProductsSection() {
  return (
    <section id="products" className="section-shell">
      <div className="container">
        <SectionHeading
          eyebrow="Product stack"
          title="Four intelligence instruments. One decision engine."
          description="Each module is designed to reduce regulatory friction, expose blind spots, and move serious buyers toward a clear next step."
        />
        <div className="grid-4">
          {productCards.map((card) => {
            const internal = card.href.startsWith('/')
            const meta = productIcons[card.name] ?? {
              icon: '&#9679;',
              color: 'var(--accent-blue)',
              bg: 'rgba(43,87,255,0.1)',
            }

            return (
              <article key={card.name} className="product-card">
                {/* Icon badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: meta.bg,
                    border: `1px solid ${meta.color}30`,
                    marginBottom: '0.9rem',
                    fontSize: '1.1rem',
                    color: meta.color,
                  }}
                  dangerouslySetInnerHTML={{ __html: meta.icon }}
                />

                <span className="product-card__eyebrow">{card.eyebrow}</span>
                <h3
                  style={{
                    background: `linear-gradient(135deg, var(--text) 40%, ${meta.color} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {card.name}
                </h3>
                <p>{card.description}</p>
                <ul className="list-clean">
                  {card.points.map((point) => (
                    <li key={point} style={{ fontSize: '0.87rem' }}>
                      {point}
                    </li>
                  ))}
                </ul>
                {internal ? (
                  <Link
                    className="button button-secondary"
                    href={card.href}
                    style={{ marginTop: '0.5rem', fontSize: '0.88rem' }}
                  >
                    {card.ctaLabel} &rarr;
                  </Link>
                ) : (
                  <a
                    className="button button-secondary"
                    href={card.href}
                    style={{ marginTop: '0.5rem', fontSize: '0.88rem' }}
                  >
                    {card.ctaLabel} &rarr;
                  </a>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
