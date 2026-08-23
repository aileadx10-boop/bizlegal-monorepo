import type { Metadata } from 'next'
import { dbSelect } from '@/lib/db'
import { logEventAsync } from '@/lib/ops/log'
import { getBenchmark } from '@/lib/benchmarks'
import type { BenchReportRow } from '@/lib/report-model'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Measurement report',
  robots: { index: false, follow: false },
}

interface Props {
  params: { id: string }
  searchParams: { t?: string }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function Denied({ reason }: { reason: string }) {
  return (
    <section className="section section--flush">
      <div className="shell" style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}>
        <p className="eyebrow">Report access</p>
        <h1 className="title">Not available.</h1>
        <p className="prose">
          {reason} If you received a Bench report link, use it exactly as
          delivered — the token in the link is the key. Questions:
          team@bizlegal-ai.com.
        </p>
      </div>
    </section>
  )
}

export default async function ReportPage({ params, searchParams }: Props) {
  const { id } = params
  const token = searchParams.t ?? ''

  if (!UUID_RE.test(id) || !UUID_RE.test(token)) {
    return <Denied reason="This link is malformed or incomplete." />
  }

  const rows = await dbSelect<BenchReportRow>(
    `bench_reports?id=eq.${encodeURIComponent(id)}&access_token=eq.${encodeURIComponent(token)}` +
      `&select=id,engagement_id,access_token,metrics,narrative,expert_credentials,delivered_at,` +
      `bench_engagements(benchmark_slug,benchmark_version,jurisdiction,practice_area,target_system)&limit=1`,
  )

  const row = rows?.[0]
  if (!row) {
    return <Denied reason="No report matches this link." />
  }

  const m = row.metrics
  const engagement = row.bench_engagements
  const benchmark = engagement?.benchmark_slug ? getBenchmark(engagement.benchmark_slug) : undefined

  logEventAsync({
    type: 'download.report',
    source: 'bench',
    ref_id: row.id,
    status: 'ok',
    metadata: { engagement_id: row.engagement_id },
  })

  return (
    <>
      <section className="graph-paper">
        <div className="shell" style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 4vw, 2.5rem)' }}>
          <p className="eyebrow">
            Bench measurement report · {benchmark ? `${benchmark.name} v${engagement?.benchmark_version ?? benchmark.version}` : 'custom benchmark'}
          </p>
          <h1 className="title">{engagement?.target_system ?? 'Measured system'}</h1>
          <p className="small faint" style={{ margin: 0 }}>
            {engagement?.jurisdiction} · {engagement?.practice_area}
            {row.delivered_at ? ` · delivered ${row.delivered_at.slice(0, 10)}` : ''}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <p className="eyebrow">Headline metrics · {m.itemsScored} evaluations</p>
          <div className="metric-grid" style={{ marginTop: '1.25rem' }}>
            <div className="metric">
              <div className="metric__value">{m.meanTotal}<span className="faint" style={{ fontSize: '0.55em' }}>/25</span></div>
              <div className="metric__label">Mean rubric score</div>
            </div>
            <div className="metric">
              <div className="metric__value metric__value--accent">{m.accuracyPct}%</div>
              <div className="metric__label">Accuracy</div>
            </div>
            <div className="metric">
              <div className="metric__value metric__value--crit">{m.hallucinationRatePct}%</div>
              <div className="metric__label">Hallucination rate</div>
            </div>
            <div className="metric">
              <div className="metric__value metric__value--warn">{m.criticalErrorRatePct}%</div>
              <div className="metric__label">Critical errors</div>
            </div>
            <div className="metric">
              <div className="metric__value">{m.citationReliabilityPct}%</div>
              <div className="metric__label">Citation reliability</div>
            </div>
            <div className="metric">
              <div className="metric__value">{m.missingLawRatePct}%</div>
              <div className="metric__label">Missing-law rate</div>
            </div>
          </div>
        </div>
      </section>

      {m.byPracticeArea.length > 0 ? (
        <section className="section">
          <div className="shell">
            <p className="eyebrow">Breakdown</p>
            <div className="table-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th scope="col">Practice area</th>
                    <th scope="col">Items</th>
                    <th scope="col">Mean (0–25)</th>
                  </tr>
                </thead>
                <tbody>
                  {m.byPracticeArea.map((r) => (
                    <tr key={r.practiceArea}>
                      <td style={{ textTransform: 'capitalize' }}>{r.practiceArea.replaceAll('_', ' ')}</td>
                      <td className="mono">{r.items}</td>
                      <td className="mono">{r.meanTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {row.narrative ? (
        <section className="section">
          <div className="shell">
            <p className="eyebrow">Findings &amp; remediation</p>
            <div className="prose">
              {row.narrative.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="shell">
          <p className="eyebrow">Verified by</p>
          <ul className="mono small" style={{ margin: 0, paddingLeft: '1.1rem', lineHeight: 2, color: 'var(--ink-soft)' }}>
            {row.expert_credentials.map((c, i) => (
              <li key={i}>{c.credentialClass ?? ''}</li>
            ))}
          </ul>
          <p className="footnote" style={{ marginTop: '2rem' }}>
            This report measures a defined test set at a point in time under the
            Bench methodology (bench.bizlegal-ai.com/methodology). It is not a
            warranty of production safety and is not legal advice. Distribution
            is governed by your service agreement.
          </p>
        </div>
      </section>
    </>
  )
}
