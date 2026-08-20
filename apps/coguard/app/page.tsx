import Link from 'next/link'

const EXAMPLE_RAW = `You NEVER bring the kids back on time and it's destroying their schedule. I've told you a hundred times and you just don't listen. This is going to court.`

const EXAMPLE_BIFF = `Hi, just confirming: per our parenting plan, pickup is at 3 PM on Saturdays. Please let me know if there's a conflict with this weekend's schedule so we can coordinate.`

export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section style={{ padding: 'clamp(4rem, 8vw, 10rem) 1.5rem', textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: '#f0fdf4', color: '#15803d', borderRadius: 9999, padding: '4px 14px', fontSize: 13, fontWeight: 600, marginBottom: 24, letterSpacing: '0.05em' }}>
          COURT-ADMISSIBLE COMMUNICATION LOG
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 1.2rem', letterSpacing: '-0.02em' }}>
          Stop escalating.<br />Start documenting.
        </h1>
        <p style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', color: 'var(--color-muted, #6b7280)', maxWidth: 580, margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          CoGuard rewrites your emotionally charged co-parenting replies into calm, court-ready messages — and logs every communication with a SHA-256 fingerprint your attorney can verify.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/pricing" style={{ display: 'inline-block', background: '#111827', color: '#fff', padding: '14px 28px', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: 16 }}>
            Start free trial →
          </Link>
          <a href="#how" style={{ display: 'inline-block', background: 'transparent', color: '#374151', padding: '14px 28px', borderRadius: 8, fontWeight: 500, textDecoration: 'none', fontSize: 16, border: '1px solid #d1d5db' }}>
            See how it works
          </a>
        </div>
      </section>

      {/* BIFF Demo */}
      <section id="how" style={{ background: '#f9fafb', padding: 'clamp(3rem, 6vw, 6rem) 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '0.5rem' }}>
            Watch the transformation
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2.5rem', fontSize: 15 }}>
            Paste your draft. CoGuard rewrites it using the BIFF method — Brief, Informative, Friendly, Firm.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
            <div style={{ background: '#fff', border: '1px solid #fecdd3', borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', letterSpacing: '0.1em', marginBottom: 12 }}>YOUR DRAFT</div>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>{EXAMPLE_RAW}</p>
            </div>
            <div style={{ background: '#fff', border: '1px solid #a7f3d0', borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', letterSpacing: '0.1em' }}>COGUARD BIFF VERSION</div>
                <div style={{ background: '#d1fae5', color: '#065f46', borderRadius: 9999, fontSize: 11, padding: '2px 8px', fontWeight: 600 }}>✓ Court-ready</div>
              </div>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>{EXAMPLE_BIFF}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Features */}
      <section style={{ padding: 'clamp(3rem, 6vw, 6rem) 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {[
            {
              icon: '🛡️',
              title: 'BIFF Neutralization',
              desc: 'Every draft is scored for hostility. High-conflict messages are transformed to Brief, Informative, Friendly, Firm before you send.',
            },
            {
              icon: '🔐',
              title: 'SHA-256 Immutable Log',
              desc: 'Every sent and received message is cryptographically fingerprinted at the moment of capture. Nothing can be altered after logging.',
            },
            {
              icon: '📋',
              title: 'Court Binder on Demand',
              desc: 'Generate a Bates-numbered PDF with a chain-of-custody certificate in one click. Attorney access code printed on the cover.',
            },
          ].map(f => (
            <div key={f.title} style={{ padding: 28, border: '1px solid #e5e7eb', borderRadius: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>{f.title}</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.65, margin: 0, fontSize: 15 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ background: '#111827', color: '#fff', padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: '1rem' }}>
          Start documenting today
        </h2>
        <p style={{ color: '#9ca3af', marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
          7-day free trial. No credit card required. Cancel anytime.
        </p>
        <Link href="/pricing" style={{ display: 'inline-block', background: '#fff', color: '#111827', padding: '14px 32px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 16 }}>
          View pricing →
        </Link>
      </section>
    </main>
  )
}
