import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data processing addendum',
  description: 'Bench data processing addendum: roles, subprocessors, retention, cross-border transfers, deletion.',
  alternates: { canonical: '/legal/dpa' },
}

/**
 * DRAFT — pending review by a practising lawyer (Moses) before go-live.
 */

export default function DpaPage() {
  return (
    <section className="section section--flush">
      <div className="shell" style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}>
        <p className="eyebrow">Legal · data processing addendum</p>
        <h1 className="title">Data processing.</h1>
        <p className="small" style={{ marginBottom: '2.5rem' }}>
          <span className="chip chip--warn">Draft — subject to counsel review before first engagement</span>
        </p>

        <div className="prose" style={{ maxWidth: '72ch' }}>
          <h2 className="heading">1. Roles</h2>
          <p>
            Where client-submitted materials contain personal data, the client
            is the controller and Bench (BizLegal AI / DOR INNOVATIONS,
            operating from Israel) acts as processor, processing only on the
            client&apos;s documented instructions to deliver the measurement
            services. Clients are asked to minimise personal data in submitted
            outputs; evaluation does not require identified individuals, and
            redaction before submission is the recommended default.
          </p>

          <h2 className="heading">2. Subprocessors</h2>
          <p>
            Bench uses a small, listed set of subprocessors: cloud hosting and
            database infrastructure (Vercel; Supabase), transactional email
            (Resend), and the vetted independent experts who perform evaluation
            work under written confidentiality and data-protection obligations.
            The current register is available on request; we give notice of
            additions, with a right to object on reasonable data-protection
            grounds.
          </p>

          <h2 className="heading">3. International transfers</h2>
          <p>
            Israel benefits from an EU adequacy decision (reaffirmed 2024) and
            UK adequacy regulations. Where a transfer requires additional
            safeguards — including onward transfers to experts outside
            adequate jurisdictions — the parties rely on the applicable
            standard contractual clauses (EU SCCs, or the UK IDTA/Addendum for
            UK-origin data), executed as part of this addendum.
          </p>

          <h2 className="heading">4. Security</h2>
          <p>
            Access to client materials is limited to personnel and experts who
            need it for the engagement; expert access is scoped to assigned
            evaluation items, not client identity, wherever the workflow
            permits. Data is encrypted in transit and at rest by the
            infrastructure providers listed above; access is credentialed and
            logged.
          </p>

          <h2 className="heading">5. Retention and deletion</h2>
          <p>
            Client Inputs and Client Model Outputs are retained for twelve (12)
            months from Report delivery, then deleted; earlier deletion is
            honoured within thirty (30) days of a written request. Bench
            Evaluation Materials (rubric applications, error classifications,
            gold-standard answers) are retained by Bench in accordance with the
            service terms, with any embedded client-confidential content
            removed or anonymized.
          </p>

          <h2 className="heading">6. Incidents and assistance</h2>
          <p>
            Bench notifies the client without undue delay after becoming aware
            of a personal data breach affecting client materials, and provides
            reasonable assistance with data-subject requests, security
            questionnaires, and impact assessments relating to the Services.
          </p>

          <p className="footnote">
            Contact for data matters: team@bizlegal-ai.com · Service terms:{' '}
            <a href="/legal/terms" style={{ borderBottom: '1px solid var(--rule)' }}>/legal/terms</a>
          </p>
        </div>
      </div>
    </section>
  )
}
