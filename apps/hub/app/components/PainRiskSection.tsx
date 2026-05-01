import Link from 'next/link'
import { productLinks } from '@/app/lib/site-content'

const painPoints = [
  {
    label: 'HIGH',
    color: '#ff6b6b',
    borderColor: 'rgba(255,107,107,0.2)',
    pain: "You're guessing on jurisdiction fit",
    solution:
      'BRAI maps your actual regulatory exposure — VARA, ADGM, MiCA, SEC — before you build the wrong structure.',
  },
  {
    label: 'HIGH',
    color: '#ffc107',
    borderColor: 'rgba(255,193,7,0.2)',
    pain: 'Lawyers are slow and expensive',
    solution:
      'Get a structured risk analysis in minutes, not weeks. No $500/hr retainer required to understand your exposure.',
  },
  {
    label: 'CRITICAL',
    color: '#ff6b6b',
    borderColor: 'rgba(255,107,107,0.2)',
    pain: 'Regulatory mistakes compound silently',
    solution:
      'Catch VARA licensing gaps, ADGM conflicts, and cross-border mismatches before they become structural surgery.',
  },
] as const

export function PainRiskSection() {
  return (
    <section className="section-shell">
      <div className="container">
        {/* Risk warning block */}
        <div
          style={{
            padding: '2rem 2.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(255,107,107,0.07), rgba(255,107,107,0.02))',
            border: '1px solid rgba(255,107,107,0.18)',
            marginBottom: '2.5rem',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '1.5rem',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255,107,107,0.12)',
              border: '1px solid rgba(255,107,107,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '1.4rem',
            }}
          >
            &#9888;
          </div>
          <div>
            <p
              style={{
                color: 'var(--muted-strong)',
                fontSize: '1.05rem',
                lineHeight: 1.75,
                margin: '0 0 0.5rem',
              }}
            >
              Most digital asset ventures discover regulatory exposure{' '}
              <em>after</em> they&apos;ve built on the wrong structure, raised on the wrong entity,
              or expanded into a jurisdiction where they can&apos;t operate. By then, it&apos;s structural surgery.
            </p>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color: 'rgba(255,107,107,0.8)',
              }}
            >
              94% of BRAI users found critical exposure they had no visibility on
            </span>
          </div>
        </div>

        {/* Pain → Solution grid */}
        <div className="grid-3">
          {painPoints.map((item) => (
            <div
              key={item.pain}
              className="security-card"
              style={{ borderColor: item.borderColor, padding: '1.5rem' }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '999px',
                  border: `1px solid ${item.borderColor}`,
                  background: `${item.color}10`,
                  marginBottom: '1rem',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: item.color,
                    boxShadow: `0 0 5px ${item.color}`,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em',
                    color: item.color,
                    fontWeight: 700,
                  }}
                >
                  {item.label}
                </span>
              </div>
              <h3
                style={{
                  margin: '0 0 0.75rem',
                  fontFamily: 'var(--font-display), serif',
                  fontSize: '1.3rem',
                  letterSpacing: '-0.02em',
                  color: 'var(--text)',
                }}
              >
                {item.pain}
              </h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.75, margin: 0 }}>{item.solution}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <a className="button button-primary" href={productLinks.brai}>
            Run Free Risk Scan Now
          </a>
          <p
            style={{
              marginTop: '0.75rem',
              color: 'var(--muted)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
            }}
          >
            No signup · 60 seconds · Attorney-led analysis
          </p>
        </div>
      </div>
    </section>
  )
}
