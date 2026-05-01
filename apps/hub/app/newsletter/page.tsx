import type { Metadata } from 'next'
import Link from 'next/link'
import NewsletterSection from '@/components/home/NewsletterSection'

export const metadata: Metadata = {
  title: 'Newsletter — BizLegal AI Regulatory Pulse',
  description: 'Subscribe to the BizLegal AI Regulatory Pulse — SEC, MiCA, VARA, and GDPR enforcement alerts and compliance intelligence delivered 2–3 times a week.',
  alternates: { canonical: 'https://bizlegal-ai.com/newsletter' },
}

export default function NewsletterPage() {
  return (
    <div>
      <div style={{ padding: '64px 32px', borderBottom: '0.5px solid var(--outline-var)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <span className="section-label">Regulatory Intelligence</span>
          <h1 style={{ marginBottom: 16 }}>The Regulatory Pulse</h1>
          <p style={{ fontSize: 16, color: 'var(--on-surface-var)', lineHeight: 1.7 }}>
            Enforcement alerts, jurisdiction updates, and compliance intelligence for fintech and
            crypto executives — delivered 2–3 times a week.
          </p>
          <p style={{ marginTop: 24, fontSize: 14, color: 'var(--on-surface-var)' }}>
            Read the full archive at{' '}
            <Link
              href="https://blog.bizlegal-ai.com/blog"
              style={{ color: 'var(--accent, var(--gold))', textDecoration: 'underline' }}
            >
              blog.bizlegal-ai.com
            </Link>
            .
          </p>
        </div>
      </div>

      <NewsletterSection />
    </div>
  )
}
