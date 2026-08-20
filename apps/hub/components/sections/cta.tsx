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
          <Link href="/risk-engine" className="cta-btn-solid">
            Start Free Scan
          </Link>
          <Link href="/pricing/all" className="cta-btn-outline">
            See Pricing
          </Link>
        </div>
      </div>
    </section>
  )
}
