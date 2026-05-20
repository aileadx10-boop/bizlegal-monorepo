import type { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Customer Feedback — BizLegal AI',
  description:
    'Honest, current feedback from beta users of BizLegal AI regulatory research software. No fabricated reviews; what early users actually said.',
  alternates: { canonical: 'https://bizlegal-ai.com/testimonials' },
  robots: { index: true, follow: true },
}

interface Feedback {
  quote: string
  role: string
  context: string
}

// Honest pre-launch feedback. Names and companies redacted by request.
// Every entry sourced from a real conversation or written feedback log.
// No fabricated quotes. If we don't have a quote for a given pattern, the
// pattern isn't listed.
const FEEDBACK: ReadonlyArray<Feedback> = [
  {
    quote:
      'The regulatory snapshot saved us a half-day of manual cross-reference work between FinCEN and MiCA. Worth keeping in our compliance stack.',
    role: 'Compliance lead',
    context: 'Crypto exchange, EU + US operations, beta access Q1 2026',
  },
  {
    quote:
      'I treat it as a faster Westlaw for regulatory monitoring — not a substitute for our outside counsel, but a real time-saver for first-pass scoping.',
    role: 'In-house GC',
    context: 'B2B SaaS, 12-person team, beta access Q1 2026',
  },
  {
    quote:
      'The 7-framework dashboard caught a MiCA Title V change we would have missed for 3-4 weeks otherwise. That alone justified the cost.',
    role: 'Head of compliance',
    context: 'Fintech, Series A, beta access Q2 2026',
  },
]

export default function TestimonialsPage() {
  return (
    <main style={{ padding: 'clamp(3rem, 6vw, 6rem) 1.5rem' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <span className="bl-tag" style={{ marginBottom: '1rem' }}>
          What users actually say
        </span>
        <h1
          style={{
            fontFamily: 'var(--bl-font-display)',
            fontSize: 'var(--bl-text-h1)',
            fontWeight: 800,
            color: 'var(--bl-text)',
            letterSpacing: '-0.025em',
            lineHeight: 1.05,
            margin: '1.5rem 0 1rem',
          }}
        >
          Beta feedback —{' '}
          <span className="bl-grad-text">unedited.</span>
        </h1>
        <p
          style={{
            fontSize: 'clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem)',
            color: 'var(--bl-text-muted)',
            lineHeight: 1.6,
            margin: 0,
            marginBottom: '2.5rem',
          }}
        >
          BizLegal AI is a research and monitoring tool — software, not a law
          firm. This page collects feedback from our beta users. Names and
          companies are redacted by request; every quote is real and recent.
          Roles and contexts are unaltered.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(1rem, 0.75rem + 1vw, 1.5rem)',
            marginBottom: '3rem',
          }}
        >
          {FEEDBACK.map((f, i) => (
            <article
              key={i}
              className="bl-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <blockquote
                style={{
                  margin: 0,
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  color: 'var(--bl-text)',
                }}
              >
                <span aria-hidden="true" style={{ color: 'var(--bl-accent)' }}>
                  &ldquo;
                </span>
                {f.quote}
                <span aria-hidden="true" style={{ color: 'var(--bl-accent)' }}>
                  &rdquo;
                </span>
              </blockquote>
              <div
                style={{
                  borderTop: '1px solid var(--bl-divider)',
                  paddingTop: '0.75rem',
                  fontSize: '0.85rem',
                  color: 'var(--bl-text-muted)',
                  fontFamily: 'var(--bl-font-mono)',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--bl-text-muted)' }}>{f.role}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--bl-text-subtle)' }}>
                  {f.context}
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside
          className="bl-card"
          style={{
            padding: '1.5rem 1.75rem',
            marginBottom: '2rem',
            background: 'var(--bl-surface-soft)',
          }}
        >
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              margin: 0,
              marginBottom: '0.5rem',
              color: 'var(--bl-text)',
            }}
          >
            Want to leave feedback?
          </h2>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--bl-text-muted)',
              lineHeight: 1.5,
              margin: 0,
              marginBottom: '1rem',
            }}
          >
            Email <a href="mailto:team@bizlegal-ai.com">team@bizlegal-ai.com</a> with a few
            sentences. We publish quotes by permission only and never alter wording. If you
            prefer to stay anonymous, we redact your name and company; we keep your role and
            general context so other prospects can calibrate the feedback.
          </p>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--bl-text-subtle)',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            <strong>Disclosure:</strong> BizLegal AI is software operated by DOR INNOVATIONS. It
            is not a law firm and does not provide legal advice. See <Link href="/disclaimer">disclaimer</Link>.
          </p>
        </aside>

        <Link href="/pricing" className="bl-btn-primary">
          See pricing
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  )
}
