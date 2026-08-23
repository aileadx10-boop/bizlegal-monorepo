import type { Metadata } from 'next'
import Link from 'next/link'
import { ExpertApplyForm } from './apply-form'

export const metadata: Metadata = {
  title: 'For experts',
  description:
    'Join the Bench expert network: practising lawyers in the EU, UK, and UAE evaluate AI outputs asynchronously, paid per task. No calls, no profiles, no marketplace.',
  alternates: { canonical: '/experts' },
}

export default function ExpertsPage() {
  return (
    <>
      <section className="graph-paper">
        <div className="shell" style={{ padding: 'clamp(3.5rem, 7vw, 6rem) clamp(1.25rem, 4vw, 2.5rem)' }}>
          <p className="eyebrow">For experts · async only</p>
          <h1 className="display" style={{ fontSize: 'clamp(2.2rem, 1.3rem + 3.6vw, 4rem)' }}>
            Judgment work, on your hours.
          </h1>
          <p className="lede">
            Bench pays practising lawyers to evaluate AI outputs against their
            jurisdiction&apos;s law — scoring, correcting, and writing the gold
            standards that AI teams pay to be measured against. Everything is
            asynchronous. No calls, no meetings, no public profile, ever.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="split">
            <div>
              <p className="eyebrow">The work</p>
              <h2 className="heading">What an evaluation task looks like.</h2>
              <div className="prose">
                <p>
                  You receive a batch of AI-generated answers to legal questions
                  in your jurisdiction and practice area. For each one you score
                  five rubric dimensions, classify the failure, and — where the
                  answer fails — write the correct one, grounded in primary
                  authority. A typical task takes 20–40 minutes of focused
                  legal judgment.
                </p>
                <p>
                  Compensation is per task, at rates reflecting the judgment
                  involved (full evaluations pay more than verification passes).
                  Payouts run weekly by bank transfer or Wise. We never pay in
                  crypto.
                </p>
              </div>

              <p className="eyebrow" style={{ marginTop: '2.5rem' }}>The process</p>
              <h2 className="heading">Vetting, without the theatre.</h2>
              <div className="table-scroll" style={{ marginTop: '1rem' }}>
                <table className="data">
                  <tbody>
                    <tr>
                      <td className="mono">01</td>
                      <td>Apply with credentials and availability — the form, nothing else</td>
                    </tr>
                    <tr>
                      <td className="mono">02</td>
                      <td>Paid test task ($100 flat): evaluate 5 sample outputs with our rubric, 72-hour window</td>
                    </tr>
                    <tr>
                      <td className="mono">03</td>
                      <td>Calibration round — your scores are compared with a second expert&apos;s; agreement is computed, not vibes</td>
                    </tr>
                    <tr>
                      <td className="mono">04</td>
                      <td>Admission decided by a human. Early tasks are fully QA-reviewed, then sampling drops as your track record builds</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="footnote" style={{ marginTop: '1.25rem' }}>
                AI assists our assessment scoring; admission and retention
                decisions are always made by a person. Reports show your
                credential class (e.g. &ldquo;UK data protection · 6y
                PQE&rdquo;) — never your name. See the{' '}
                <Link href="/methodology" style={{ borderBottom: '1px solid var(--rule)' }}>methodology</Link>{' '}
                for how calibration works.
              </p>
            </div>

            <ExpertApplyForm />
          </div>
        </div>
      </section>
    </>
  )
}
