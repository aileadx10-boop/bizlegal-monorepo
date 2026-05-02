import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Guide Sent — Forge by BizLegal AI',
  description: 'Your free compliance guide is on its way.',
}

export default function ThankYouPage() {
  return (
    <main style={{
      minHeight: '100vh', background: '#020408', color: '#E8F4FF',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', textAlign: 'center',
    }}>
      <div style={{
        fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: '#00E599', marginBottom: 24,
      }}>
        Success
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 300, marginBottom: 16, letterSpacing: '-0.02em' }}>
        Your guide is on its way.
      </h1>

      <p style={{ fontSize: 16, color: '#4A6080', lineHeight: 1.7, maxWidth: 440, marginBottom: 40 }}>
        Check your inbox. The free compliance guide will arrive within 60 seconds.
        If you don&apos;t see it, check your spam folder.
      </p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a
          href="https://forge.bizlegal-ai.com"
          style={{
            padding: '12px 24px', background: '#00C8FF', color: '#020408',
            fontWeight: 600, fontSize: 14, borderRadius: 8, textDecoration: 'none',
          }}
        >
          Explore Forge &rarr;
        </a>
        <a
          href="https://bizlegal-ai.com"
          style={{
            padding: '12px 24px', background: 'transparent', color: '#4A6080',
            fontWeight: 500, fontSize: 14, borderRadius: 8, textDecoration: 'none',
            border: '1px solid rgba(0,200,255,0.15)',
          }}
        >
          &larr; BizLegal AI
        </a>
      </div>
    </main>
  )
}
