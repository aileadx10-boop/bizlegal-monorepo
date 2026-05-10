import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Thanks for reaching out | BizLegal AI',
  description: 'Your inquiry was received. The BizLegal AI team responds within one business day.',
  alternates: { canonical: 'https://bizlegal-ai.com/contact/thank-you' },
  // No-index the thank-you page — it's a flow terminator, not a
  // landing surface. Avoids Google indexing transient confirmations.
  robots: { index: false, follow: true },
}

export default function ContactThankYouPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <section style={{ padding: '96px 32px 32px', maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <span className="section-label">Inquiry received</span>
        <h1 style={{ marginBottom: 20 }}>Thanks &mdash; we&rsquo;re on it.</h1>
        <p style={{ fontSize: 16, lineHeight: 1.8 }}>
          Your message is in our queue. The team responds within one business day for standard
          inquiries; expert review requests are acknowledged within four hours.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.8, marginTop: 24, color: 'var(--on-surface-var)' }}>
          Need to add anything? Reply to the confirmation email or reach us directly at{' '}
          <a href="mailto:team@bizlegal-ai.com" style={{ color: 'var(--primary)' }}>
            team@bizlegal-ai.com
          </a>
          .
        </p>
        <div style={{ marginTop: 40, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-secondary" style={{ minWidth: 180, justifyContent: 'center' }}>
            Back to home
          </Link>
          <Link href="/risk-engine" className="btn-cta" style={{ minWidth: 180, justifyContent: 'center' }}>
            Try a free risk scan
          </Link>
        </div>
      </section>
    </div>
  )
}
