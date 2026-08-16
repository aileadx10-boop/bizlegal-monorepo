import Link from 'next/link'
import { BENCHMARKS, heldOutCount } from '@/lib/benchmarks'

/**
 * Landing — research-lab positioning. Everything numeric on this page is
 * either registry-derived (benchmark counts) or explicitly labeled
 * illustrative; no invented client metrics, per the no-fabrication rule.
 */

export default function Home() {
  const totalItems = BENCHMARKS.reduce((n, b) => n + b.items.length, 0)

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="graph-paper">
        <div className="shell" style={{ padding: 'clamp(4rem, 8vw, 7.5rem) clamp(1.25rem, 4vw, 2.5rem)' }}>
          <div className="split">
            <div>
              <p className="eyebrow rise rise-1">Legal AI Quality Intelligence · EU / UK / UAE</p>
              <h1 className="display rise rise-2">The evaluation lab for legal AI.</h1>
              <p className="lede rise rise-3">
                Bench measures how accurately AI systems perform legal work — by
                jurisdiction, against expert-labeled gold standards. You get a
                defensible accuracy score, a hallucination rate, and the exact
                corrections. Not opinions. Measurements.
              </p>
              <div className="rise rise-4" style={{ display: 'flex', gap: '0.9rem', marginTop: '2.2rem', flexWrap: 'wrap' }}>
                <Link href="/audit/request" className="btn btn--primary">
                  Request an audit
                </Link>
                <Link href="/methodology" className="btn">
                  Read the methodology
                </Link>
              </div>
            </div>

            <aside className="readout rise rise-4" aria-label="Example measurement readout">
              <p className="readout__title">
                <span>Measurement readout</span>
                <span className="chip chip--warn">Illustrative</span>
              </p>
              <div className="metric-grid">
                <div className="metric">
                  <div className="metric__value">14.2<span className="faint" style={{ fontSize: '0.55em' }}>/25</span></div>
                  <div className="metric__label">Accuracy score</div>
                </div>
                <div className="metric">
                  <div className="metric__value metric__value--crit">30%</div>
                  <div className="metric__label">Hallucination rate</div>
                </div>
                <div className="metric">
                  <div className="metric__value metric__value--warn">2</div>
                  <div className="metric__label">Critical errors</div>
                </div>
                <div className="metric">
                  <div className="metric__value">60%</div>
                  <div className="metric__label">Citation reliability</div>
                </div>
              </div>
              <p className="footnote" style={{ marginTop: '1.1rem' }}>
                Example values showing report structure — not results for any
                real product. Named results are private to each client.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* ── What a measurement contains ──────────────────── */}
      <section className="section">
        <div className="shell">
          <p className="eyebrow">The deliverable</p>
          <h2 className="heading">A measurement, not a marketplace.</h2>
          <div className="split" style={{ marginTop: '2rem' }}>
            <div className="prose">
              <p>
                Your team submits model outputs. Bench returns a structured
                measurement report scored by a versioned rubric and verified by
                practising lawyers in the target jurisdiction — who remain
                production infrastructure, invisible and asynchronous. The
                product is the number and the correction, not access to people.
              </p>
              <p>
                Every metric in a Bench report is computed by a deterministic,
                documented formula, so the same evaluations always reproduce the
                same score. That is what makes it citable in a board deck, a
                diligence room, or a vendor negotiation.
              </p>
            </div>
            <div className="table-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th scope="col">Metric</th>
                    <th scope="col">What it tells you</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Accuracy score</td><td>Overall correctness vs the jurisdiction-specific gold standard</td></tr>
                  <tr><td>Hallucination rate</td><td>Share of outputs with fabricated law, cases, or citations</td></tr>
                  <tr><td>Critical-error rate</td><td>Outputs with materially dangerous misstatements</td></tr>
                  <tr><td>Citation reliability</td><td>Cited authorities that are real, relevant, correctly used</td></tr>
                  <tr><td>Missing-law rate</td><td>Outputs omitting legally required elements</td></tr>
                  <tr><td>Error taxonomy</td><td>Failures classified: hallucination, misstatement, omission, wrong jurisdiction, bad reasoning</td></tr>
                  <tr><td>Gold-standard corrections</td><td>Expert-written correct answers for every failed item</td></tr>
                  <tr><td>Remediation memo</td><td>Prioritized fixes: data gaps, prompting, guardrails</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured benchmarks ──────────────────────────── */}
      <section className="section">
        <div className="shell">
          <p className="eyebrow">Featured benchmarks</p>
          <h2 className="heading">Jurisdiction-specific. Expert-labeled. Versioned.</h2>
          <p className="prose" style={{ marginBottom: '2.5rem' }}>
            Generic benchmarks measure English-language legal trivia. Bench
            maintains {totalItems} gold-standard items across three regulated
            jurisdictions, with held-out sets that never touch a public page —
            so vendors can&apos;t train on the test.
          </p>
          <div className="ledger">
            {BENCHMARKS.map((b) => (
              <Link key={b.slug} href={`/benchmarks/${b.slug}`} className="ledger__row">
                <span className="ledger__name">
                  {b.name}
                  <span className="chip chip--accent">{b.jurisdiction}</span>
                  <span className="chip">v{b.version}</span>
                </span>
                <span className="ledger__desc">{b.claim}</span>
                <span className="ledger__meta">
                  {b.items.length} items · {heldOutCount(b)} held out
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <p className="eyebrow">Process</p>
          <h2 className="heading">Asynchronous by design. Three business days, typically.</h2>
          <div className="table-scroll" style={{ marginTop: '2rem' }}>
            <table className="data">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '4rem' }}>Step</th>
                  <th scope="col">What happens</th>
                  <th scope="col">Who does it</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="mono">01</td>
                  <td>You submit model outputs — via API run, output upload, or public interface</td>
                  <td>Your team</td>
                </tr>
                <tr>
                  <td className="mono">02</td>
                  <td>Items are scored against the rubric; every score is verified or produced by a practising lawyer in the target jurisdiction, with QA sampling and calibration</td>
                  <td>The expert bench</td>
                </tr>
                <tr>
                  <td className="mono">03</td>
                  <td>The rubric engine computes the report deterministically — accuracy, hallucination rate, taxonomy, breakdowns</td>
                  <td>Instrumentation</td>
                </tr>
                <tr>
                  <td className="mono">04</td>
                  <td>You receive the measurement report with gold-standard corrections and a prioritized remediation memo</td>
                  <td>Delivered async</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="footnote" style={{ marginTop: '1.5rem' }}>
            No calls required, ever. Expedited turnaround is available on
            managed programs.
          </p>
        </div>
      </section>

      {/* ── Who it's for ─────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <p className="eyebrow">Who buys measurement</p>
          <h2 className="heading">Built for teams whose AI touches the law.</h2>
          <div className="ledger" style={{ marginTop: '2rem' }}>
            <div className="ledger__row">
              <span className="ledger__name">Legal-AI vendors</span>
              <span className="ledger__desc">
                Prove accuracy to buyers and boards with an independent,
                jurisdiction-specific score — before a prospect finds the
                failure mode themselves.
              </span>
              <span className="ledger__meta">diagnostic → managed</span>
            </div>
            <div className="ledger__row">
              <span className="ledger__name">Compliance software</span>
              <span className="ledger__desc">
                Your product answers regulatory questions. Bench tells you where
                it hallucinates MiCA, GDPR, or VARA — and what the correct
                answer was.
              </span>
              <span className="ledger__meta">managed program</span>
            </div>
            <div className="ledger__row">
              <span className="ledger__name">Law firms &amp; in-house</span>
              <span className="ledger__desc">
                Evaluate the AI tools you are about to trust with client work.
                Vendor-independent, expert-verified, private.
              </span>
              <span className="ledger__meta">diagnostic audit</span>
            </div>
            <div className="ledger__row">
              <span className="ledger__name">AI labs &amp; diligence</span>
              <span className="ledger__desc">
                Jurisdiction-deep evaluation data and audits for legal-domain
                capability claims, structured for repeat measurement.
              </span>
              <span className="ledger__meta">dedicated program</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Human expertise ──────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <div className="split">
            <div>
              <p className="eyebrow">The bench</p>
              <h2 className="heading">Practising lawyers. Calibrated. Invisible.</h2>
              <div className="prose">
                <p>
                  Every gold standard is written or verified by a vetted
                  practitioner in the target jurisdiction — admitted, in
                  practice, paid per task. Experts pass a paid assessment and a
                  calibration round before their scores count, and ongoing QA
                  sampling keeps them honest.
                </p>
                <p>
                  Reports disclose expert credentials by class — jurisdiction,
                  practice area, years of post-qualification experience — never
                  by name. No profiles, no marketplace, no directory. The
                  measurement is the product.
                </p>
              </div>
            </div>
            <div className="readout">
              <p className="readout__title">
                <span>Credential classes — example report</span>
              </p>
              <ul className="mono small" style={{ margin: 0, paddingLeft: '1.1rem', lineHeight: 2.1, color: 'var(--ink-soft)' }}>
                <li>EU regulatory · 8y PQE · MiCA / funds</li>
                <li>UK data protection · 6y PQE · ICO practice</li>
                <li>UAE / DIFC commercial · 10y PQE</li>
              </ul>
              <p className="footnote" style={{ marginTop: '1rem' }}>
                Inter-rater agreement from calibration rounds is published on
                the methodology page once the first cycle completes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────── */}
      <section className="section graph-paper">
        <div className="shell" style={{ textAlign: 'left' }}>
          <p className="eyebrow">Start</p>
          <h2 className="heading" style={{ maxWidth: '22ch' }}>
            Know your number before your buyers do.
          </h2>
          <div style={{ display: 'flex', gap: '0.9rem', marginTop: '1.8rem', flexWrap: 'wrap' }}>
            <Link href="/audit/request" className="btn btn--primary">
              Request a diagnostic audit
            </Link>
            <Link href="/experts" className="btn">
              Join the expert bench
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
