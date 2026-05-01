import Link from 'next/link'
import { productLinks } from '@/app/lib/site-content'

const riskItems = [
  { severity: 'high', label: 'VARA license required for this token structure' },
  { severity: 'high', label: 'Jurisdiction mismatch: UAE ops + offshore entity' },
  { severity: 'medium', label: 'Investor disclosure gaps under ADGM rules' },
  { severity: 'medium', label: 'Missing whitepaper requirements (MiCA Art. 5)' },
] as const

const proofBadges = [
  { icon: '&#9670;', text: 'No signup required' },
  { icon: '&#9670;', text: '60-second results' },
  { icon: '&#9670;', text: 'Attorney-led intelligence' },
] as const

export function HeroSection() {
  return (
    <section className="hero-section">
      {/* Background glow blobs */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-80px',
          left: '10%',
          width: '500px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(43,87,255,0.18), transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '40px',
          right: '5%',
          width: '400px',
          height: '350px',
          background: 'radial-gradient(ellipse, rgba(108,185,255,0.1), transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="container hero-grid" style={{ position: 'relative', zIndex: 1 }}>
        {/* Left: copy */}
        <div className="hero-copy">
          {/* Status badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.4rem 0.9rem',
              borderRadius: '999px',
              border: '1px solid rgba(34,197,94,0.3)',
              background: 'rgba(34,197,94,0.08)',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#22c55e',
              width: 'fit-content',
            }}
          >
            <span className="pulse-dot" />
            AI Risk Intelligence · Live
          </div>

          <h1 style={{ margin: 0 }}>
            Identify{' '}
            <span className="gradient-text">Regulatory Exposure</span>
            <br />
            Before It Kills the Deal.
          </h1>

          <p style={{ fontSize: '1.08rem', maxWidth: '52ch' }}>
            AI-assisted risk analysis for digital asset ventures navigating{' '}
            <strong style={{ color: 'var(--accent-mint)' }}>UAE, VARA, ADGM, MiCA</strong>, and
            global frameworks. Know where you&apos;re exposed before you launch, fundraise, or sign.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href={productLinks.brai}>
              Start Free Risk Scan &rarr;
            </a>
            <Link className="button button-ghost" href="/posts">
              See Example Report
            </Link>
          </div>

          <div className="hero-proof">
            {proofBadges.map((b) => (
              <span key={b.text}>
                <span
                  style={{ color: 'var(--accent-mint)', fontSize: '0.5rem' }}
                  dangerouslySetInnerHTML={{ __html: b.icon }}
                />
                {b.text}
              </span>
            ))}
          </div>

          {/* Mini stats row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, auto)',
              gap: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              width: 'fit-content',
            }}
          >
            {[
              { value: '1,400+', label: 'Risk scans' },
              { value: '30+', label: 'Jurisdictions' },
              { value: '94%', label: 'Found exposure' },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  className="gradient-text"
                  style={{
                    fontFamily: 'var(--font-display), serif',
                    fontSize: '1.7rem',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    color: 'var(--muted)',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    marginTop: '0.25rem',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: live risk dashboard mockup */}
        <div className="hero-panel">
          {/* Panel header */}
          <div className="showcase-toolbar">
            <div>
              <span className="mini-label">BRAI Risk Report</span>
              <strong>Live Analysis Preview</strong>
            </div>
            <span
              className="badge"
              style={{
                color: '#ff6b6b',
                borderColor: 'rgba(255,107,107,0.3)',
                background: 'rgba(255,107,107,0.12)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                letterSpacing: '0.08em',
              }}
            >
              <span className="pulse-dot pulse-dot--red" style={{ width: '6px', height: '6px' }} />
              71% HIGH RISK
            </span>
          </div>

          {/* Risk score bar */}
          <div
            style={{
              margin: '1rem 0 0.75rem',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.6rem',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--muted-strong)',
                }}
              >
                Risk Score
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display), serif',
                  fontSize: '1.3rem',
                  color: '#ff6b6b',
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                }}
              >
                71
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'rgba(255,107,107,0.6)',
                  }}
                >
                  {' '}
                  / 100
                </span>
              </span>
            </div>
            <div
              style={{
                height: '8px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.07)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '71%',
                  height: '100%',
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, #ff6b6b, #ff9a3c)',
                  boxShadow: '0 0 12px rgba(255,107,107,0.5)',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '0.4rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.67rem',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              <span>Low risk</span>
              <span>Moderate</span>
              <span style={{ color: 'rgba(255,107,107,0.7)' }}>Critical</span>
            </div>
          </div>

          {/* Findings */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: 'var(--muted-strong)',
              paddingLeft: '0.1rem',
              marginBottom: '0.5rem',
            }}
          >
            Critical Findings &middot; 4 issues detected
          </div>

          <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
            {riskItems.map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  background:
                    item.severity === 'high'
                      ? 'rgba(255,107,107,0.06)'
                      : 'rgba(255,193,7,0.04)',
                  border: `1px solid ${
                    item.severity === 'high'
                      ? 'rgba(255,107,107,0.2)'
                      : 'rgba(255,193,7,0.16)'
                  }`,
                  transition: 'border-color 200ms ease',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: item.severity === 'high' ? '#ff6b6b' : '#ffc107',
                    boxShadow: `0 0 8px ${
                      item.severity === 'high'
                        ? 'rgba(255,107,107,0.8)'
                        : 'rgba(255,193,7,0.8)'
                    }`,
                  }}
                />
                <span style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                  {item.label}
                </span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.66rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color:
                      item.severity === 'high'
                        ? 'rgba(255,107,107,0.7)'
                        : 'rgba(255,193,7,0.6)',
                    flexShrink: 0,
                  }}
                >
                  {item.severity}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            className="button button-primary"
            href={productLinks.brai}
            style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
          >
            Fix This &mdash; Start BRAI Scan &rarr;
          </a>

          {/* Trust micro */}
          <p
            style={{
              textAlign: 'center',
              marginTop: '0.6rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.08em',
            }}
          >
            Attorney-reviewed &middot; No signup &middot; Results in 60s
          </p>
        </div>
      </div>
    </section>
  )
}
