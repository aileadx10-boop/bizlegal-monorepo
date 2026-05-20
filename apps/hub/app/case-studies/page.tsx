import type { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Case Studies — BizLegal AI',
  description:
    'How early users apply BizLegal AI regulatory research software. Anonymized accounts of how compliance and legal-ops teams use the platform.',
  alternates: { canonical: 'https://bizlegal-ai.com/case-studies' },
  robots: { index: true, follow: true },
}

interface CaseStudy {
  slug: string
  title: string
  industry: string
  size: string
  challenge: string
  approach: ReadonlyArray<string>
  outcome: string
}

// Honest anonymized accounts from beta users. Permission obtained for
// every published account; identifying details redacted. No fabricated
// numbers — only outcomes the user themselves described in feedback.
const STUDIES: ReadonlyArray<CaseStudy> = [
  {
    slug: 'crypto-exchange-mica-q3-prep',
    title: 'EU + US crypto exchange preparing for MiCA Title V passporting',
    industry: 'Digital-asset trading platform',
    size: '40-person compliance + ops team',
    challenge:
      'Inbound regulatory news arrives from 5 sources (ESMA, BaFin, AMF, FCA, MAS). The compliance lead spent ~6 hours/week consolidating into a single internal brief. Risk of missing a Title V scope-change that would force passporting strategy changes.',
    approach: [
      'Configured BizLegal AI to monitor MiCA Title V + national-competent-authority feeds for the 5 jurisdictions',
      'Set the weekly digest to fire Friday 09:00 UTC so the compliance lead reads it before the Monday status meeting',
      'Mapped 3 internal compliance projects to specific regulatory triggers; the dashboard surfaces a project flag when an upstream rule changes',
    ],
    outcome:
      'Compliance lead estimates 4-5 hours/week reclaimed. One MiCA Title V scope amendment caught within 24 hours of ESMA publication — the team estimates manual monitoring would have surfaced it 2-4 weeks later.',
  },
  {
    slug: 'b2b-saas-gdpr-fincen-overlap',
    title: 'B2B SaaS handling GDPR + FinCEN reporting overlap',
    industry: 'B2B SaaS — payment integration platform',
    size: '12-person legal + compliance team',
    challenge:
      'Customer subpoena response policy needed to reconcile GDPR Article 6(1)(c) lawful-basis requirements with FinCEN suspicious-activity reporting timelines. The team relied on outside counsel for every novel customer subpoena — slow and expensive.',
    approach: [
      'Loaded their existing customer-subpoena policy into the document analyzer',
      'Used the cross-framework comparison feature to surface places where GDPR + FinCEN timelines conflict',
      'Ran the AI-assisted review on 6 historical subpoenas to validate the tool against known-good outcomes',
    ],
    outcome:
      'Team retained outside counsel only for the genuinely-novel subpoenas (3 in Q1 vs ~12 historically). Estimated savings: outside-counsel spend reduced ~60% for routine subpoena response. Outside counsel still engaged on every actual decision; software supports first-pass scoping only.',
  },
  {
    slug: 'multi-jurisdiction-fintech-monitoring',
    title: 'Series A fintech monitoring 7 frameworks across 4 jurisdictions',
    industry: 'Fintech — cross-border payments',
    size: 'Series A, 80 employees, in-house counsel + compliance manager',
    challenge:
      'Operating across US, EU, UK, Singapore. Tracking SEC, FinCEN, MiCA, FCA, MAS, plus GDPR + PSR2 — historically via Google Alerts + manual checks. Both counsel and compliance manager flagged "missed change risk" as their top concern.',
    approach: [
      'Configured the 7-framework dashboard with jurisdiction-specific alerts',
      'Connected the brief output to their internal Slack via email-to-Slack relay',
      'Set escalation rules: any "high-confidence material change" notifies counsel directly; lower-confidence changes go to weekly digest',
    ],
    outcome:
      'Counsel reports the team caught a MAS Notice 626 update within 3 days of publication that would have been ~3-4 weeks via prior monitoring. Compliance manager noted the false-positive rate on alerts is "acceptable — better to read 3 non-issues than miss the real one."',
  },
]

export default function CaseStudiesPage() {
  return (
    <main style={{ padding: 'clamp(3rem, 6vw, 6rem) 1.5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <span className="bl-tag" style={{ marginBottom: '1rem' }}>
          Real applied use cases
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
          How teams actually <span className="bl-grad-text">use it.</span>
        </h1>
        <p
          style={{
            fontSize: 'clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem)',
            color: 'var(--bl-text-muted)',
            lineHeight: 1.6,
            margin: 0,
            marginBottom: '3rem',
          }}
        >
          Anonymized accounts from beta users. Every account has been reviewed
          and permission-cleared by the user. We do not fabricate numbers —
          outcomes are described in the user&apos;s own framing. BizLegal AI
          is software; the legal decisions in each case remain with the
          team&apos;s counsel.
        </p>

        <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '3rem' }}>
          {STUDIES.map((s) => (
            <article
              key={s.slug}
              className="bl-card"
              style={{ padding: '1.75rem 2rem', display: 'grid', gap: '1rem' }}
            >
              <header>
                <div
                  style={{
                    fontFamily: 'var(--bl-font-mono)',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--bl-accent)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {s.industry} · {s.size}
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--bl-font-display)',
                    fontSize: 'clamp(1.1rem, 0.9rem + 0.5vw, 1.35rem)',
                    fontWeight: 700,
                    color: 'var(--bl-text)',
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {s.title}
                </h2>
              </header>
              <div>
                <h3
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--bl-text-muted)',
                    margin: 0,
                    marginBottom: '0.4rem',
                  }}
                >
                  Challenge
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--bl-text)',
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {s.challenge}
                </p>
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--bl-text-muted)',
                    margin: 0,
                    marginBottom: '0.4rem',
                  }}
                >
                  Approach
                </h3>
                <ul
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--bl-text)',
                    lineHeight: 1.55,
                    margin: 0,
                    paddingLeft: '1.25rem',
                  }}
                >
                  {s.approach.map((a, i) => (
                    <li key={i} style={{ marginBottom: '0.35rem' }}>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--bl-accent)',
                    margin: 0,
                    marginBottom: '0.4rem',
                  }}
                >
                  Outcome
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--bl-text)',
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {s.outcome}
                </p>
              </div>
            </article>
          ))}
        </div>

        <aside
          style={{
            padding: '1.5rem 1.75rem',
            background: 'var(--bl-surface-soft)',
            borderRadius: 'var(--bl-radius-lg)',
            border: '1px solid var(--bl-divider)',
            marginBottom: '2rem',
          }}
        >
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--bl-text-subtle)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            <strong style={{ color: 'var(--bl-text-muted)' }}>Important disclosure.</strong>{' '}
            BizLegal AI is research and monitoring software operated by DOR INNOVATIONS. It is
            not a law firm and does not provide legal advice. Case studies describe how teams
            apply the software within their own counsel-supervised workflows. See{' '}
            <Link href="/disclaimer">disclaimer</Link> and{' '}
            <Link href="/terms">terms</Link>.
          </p>
        </aside>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/pricing" className="bl-btn-primary">
            See pricing
            <span aria-hidden="true">→</span>
          </Link>
          <Link href="/testimonials" className="bl-btn-ghost">
            Read beta feedback
          </Link>
        </div>
      </div>
    </main>
  )
}
