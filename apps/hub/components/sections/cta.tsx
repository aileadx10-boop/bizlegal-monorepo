import Link from 'next/link'

export function CTA() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, var(--cta) 0%, var(--secondary) 100%)',
      padding: '96px 32px',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{
          fontFamily: 'Newsreader, Georgia, serif',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 700, color: '#fff', marginBottom: 16,
        }}>
          Ready to Automate Compliance?
        </h2>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', marginBottom: 40 }}>
          Start with a free scan. No credit card required.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/risk-engine" style={{
            padding: '14px 32px', background: '#fff',
            color: 'var(--cta)', borderRadius: 8, fontWeight: 700,
            textDecoration: 'none', transition: 'transform 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Start Free Scan
          </Link>
          <a
            href="https://calendly.com/ai-leadx10"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '14px 32px',
              border: '2px solid #fff', color: '#fff',
              borderRadius: 8, fontWeight: 700,
              textDecoration: 'none', transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Book Demo
          </a>
        </div>
      </div>
    </section>
  )
}
