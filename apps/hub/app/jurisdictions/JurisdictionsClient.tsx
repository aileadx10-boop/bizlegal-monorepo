'use client'

import { useMemo, useState } from 'react'
import { Globe, ArrowRight, Sparkles, AlertCircle, Loader2 } from 'lucide-react'

// ──────────────────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────────────────
interface Jurisdiction {
  readonly id: string
  readonly name: string
  readonly flag: string
  readonly riskScore: number
  readonly complianceCost: string
  readonly speedToOperate: string
  readonly enforcement: 'Low' | 'Medium' | 'High'
  readonly keyRegulations: ReadonlyArray<string>
  readonly tags: ReadonlyArray<'optimal' | 'recommended' | 'crypto' | 'family-office' | 'banking'>
}

const JURISDICTIONS: ReadonlyArray<Jurisdiction> = [
  { id: 'ky', name: 'Cayman Islands', flag: '🇰🇾', riskScore: 22, complianceCost: '$12K/yr', speedToOperate: '1–2 wk', enforcement: 'Low', keyRegulations: ['CIMA', 'AML'], tags: ['optimal', 'recommended', 'family-office', 'banking'] },
  { id: 'vg', name: 'British Virgin Islands', flag: '🇻🇬', riskScore: 25, complianceCost: '$15K/yr', speedToOperate: '2–3 wk', enforcement: 'Low', keyRegulations: ['FSC', 'AML'], tags: ['recommended', 'family-office'] },
  { id: 'sg', name: 'Singapore', flag: '🇸🇬', riskScore: 32, complianceCost: '$45K/yr', speedToOperate: '4–8 wk', enforcement: 'Low', keyRegulations: ['MAS', 'PSA', 'AML'], tags: ['recommended', 'crypto', 'banking', 'family-office'] },
  { id: 'ch', name: 'Switzerland', flag: '🇨🇭', riskScore: 35, complianceCost: '$55K/yr', speedToOperate: '8–12 wk', enforcement: 'Low', keyRegulations: ['FINMA', 'AML'], tags: ['banking', 'family-office'] },
  { id: 'jp', name: 'Japan', flag: '🇯🇵', riskScore: 38, complianceCost: '$60K/yr', speedToOperate: '8–16 wk', enforcement: 'Medium', keyRegulations: ['FSA', 'JVCEA', 'AML'], tags: ['crypto'] },
  { id: 'au', name: 'Australia', flag: '🇦🇺', riskScore: 42, complianceCost: '$50K/yr', speedToOperate: '6–10 wk', enforcement: 'Medium', keyRegulations: ['ASIC', 'AUSTRAC', 'AML'], tags: [] },
  { id: 'ae', name: 'UAE / Dubai', flag: '🇦🇪', riskScore: 45, complianceCost: '$80K/yr', speedToOperate: '4–12 wk', enforcement: 'Medium', keyRegulations: ['VARA', 'SCA', 'AML'], tags: ['crypto', 'family-office'] },
  { id: 'ca', name: 'Canada', flag: '🇨🇦', riskScore: 48, complianceCost: '$70K/yr', speedToOperate: '8–12 wk', enforcement: 'Medium', keyRegulations: ['OSC', 'FINTRAC', 'AML'], tags: [] },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', riskScore: 52, complianceCost: '$90K/yr', speedToOperate: '8–16 wk', enforcement: 'Medium', keyRegulations: ['FCA', 'AML', 'MiCA-eq'], tags: ['banking'] },
  { id: 'de', name: 'Germany', flag: '🇩🇪', riskScore: 56, complianceCost: '$110K/yr', speedToOperate: '12–20 wk', enforcement: 'Medium', keyRegulations: ['BaFin', 'GDPR', 'MiCA'], tags: ['banking'] },
  { id: 'fr', name: 'France', flag: '🇫🇷', riskScore: 57, complianceCost: '$100K/yr', speedToOperate: '12–20 wk', enforcement: 'Medium', keyRegulations: ['AMF', 'ACPR', 'GDPR', 'MiCA'], tags: [] },
  { id: 'nl', name: 'Netherlands', flag: '🇳🇱', riskScore: 58, complianceCost: '$105K/yr', speedToOperate: '12–18 wk', enforcement: 'Medium', keyRegulations: ['AFM', 'DNB', 'GDPR', 'MiCA'], tags: [] },
  { id: 'eu', name: 'European Union', flag: '🇪🇺', riskScore: 60, complianceCost: '$120K/yr', speedToOperate: '16–24 wk', enforcement: 'High', keyRegulations: ['MiCA', 'GDPR', 'AMLD6'], tags: ['crypto'] },
  { id: 'us', name: 'United States', flag: '🇺🇸', riskScore: 62, complianceCost: '$150K/yr', speedToOperate: '16–24 wk', enforcement: 'High', keyRegulations: ['SEC', 'CFTC', 'FinCEN', 'AML'], tags: ['banking'] },
]

const FILTERS = ['All', 'Crypto-friendly', 'Family-office', 'Banking-strong', 'Lowest risk'] as const
type FilterKey = (typeof FILTERS)[number]

function getRiskColor(score: number): string {
  if (score < 30) return 'var(--bl-success)'
  if (score < 60) return 'var(--bl-warning)'
  return 'var(--bl-danger)'
}

function applyFilter(filter: FilterKey, juris: Jurisdiction): boolean {
  if (filter === 'All') return true
  if (filter === 'Crypto-friendly') return juris.tags.includes('crypto')
  if (filter === 'Family-office') return juris.tags.includes('family-office')
  if (filter === 'Banking-strong') return juris.tags.includes('banking')
  if (filter === 'Lowest risk') return juris.riskScore < 35
  return true
}

// ──────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────
export function JurisdictionsClient() {
  const [filter, setFilter] = useState<FilterKey>('All')
  const [a, setA] = useState<string>('sg')
  const [b, setB] = useState<string>('ae')
  const [industry, setIndustry] = useState<string>('crypto / fintech')
  const [model, setModel] = useState<string>('digital-asset issuer with cross-border treasury')
  const [comparing, setComparing] = useState(false)
  const [comparison, setComparison] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(
    () => JURISDICTIONS.filter((j) => applyFilter(filter, j)).sort((x, y) => x.riskScore - y.riskScore),
    [filter],
  )

  const aJ = JURISDICTIONS.find((j) => j.id === a)
  const bJ = JURISDICTIONS.find((j) => j.id === b)

  async function runCompare() {
    if (!aJ || !bJ || aJ.id === bJ.id) return
    setComparing(true)
    setComparison(null)
    setError(null)
    try {
      const res = await fetch('/api/jurisdictions/compare', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          jurisdictionA: aJ.name,
          jurisdictionB: bJ.name,
          industry,
          businessModel: model,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { markdown?: string; error?: string }
      if (!res.ok) {
        setError(data.error ?? `Comparison failed (${res.status}).`)
      } else if (data.markdown) {
        setComparison(data.markdown)
      } else {
        setError('Comparison returned empty. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error.')
    } finally {
      setComparing(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section
        className="bl-hero-bg"
        style={{ paddingTop: 'clamp(4rem, 2rem + 4vw, 6rem)', paddingBottom: 'clamp(2rem, 1.5rem + 2vw, 3rem)' }}
      >
        <div className="bl-container" style={{ maxWidth: 880 }}>
          <span className="bl-tag" style={{ marginBottom: '1rem' }}>
            <Globe size={14} />
            Jurisdiction Intelligence
          </span>
          <h1
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: 'var(--bl-text-h1)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              color: 'var(--bl-text)',
              margin: '1.5rem 0 1rem',
            }}
          >
            Move where the regulator is{' '}
            <span className="bl-grad-text">friendly.</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem)',
              color: 'var(--bl-text-muted)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 720,
            }}
          >
            14 jurisdictions, scored on regulatory risk, compliance cost,
            speed-to-operate and enforcement aggression. Click two to run an
            AI-generated side-by-side comparison powered by Claude Sonnet 4.6.
          </p>
        </div>
      </section>

      {/* Filter chips */}
      <section style={{ paddingBlock: 'clamp(1rem, 0.75rem + 1vw, 1.5rem)', borderBottom: '1px solid var(--bl-divider)' }}>
        <div className="bl-container" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => {
            const active = f === filter
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--bl-radius-pill)',
                  border: '1px solid var(--bl-border)',
                  background: active ? 'var(--bl-accent)' : 'var(--bl-surface)',
                  color: active ? 'var(--bl-text-on-accent)' : 'var(--bl-text)',
                  fontFamily: 'var(--bl-font-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all var(--bl-duration-fast) var(--bl-ease-out-expo)',
                }}
              >
                {f}
              </button>
            )
          })}
        </div>
      </section>

      {/* Table */}
      <section className="bl-section" style={{ paddingTop: 'clamp(1.5rem, 1rem + 1vw, 2.5rem)' }}>
        <div className="bl-container">
          <div className="bl-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--bl-font-body)', fontSize: 'var(--bl-text-small)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--bl-border)' }}>
                    {['Jurisdiction', 'Risk Score', 'Compliance Cost', 'Speed to Operate', 'Enforcement', 'Key Regulators'].map((h, i) => (
                      <th
                        key={h}
                        style={{
                          padding: '14px 18px',
                          textAlign: i === 0 ? 'left' : 'center',
                          fontFamily: 'var(--bl-font-mono)',
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: 'var(--bl-text-muted)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((j) => (
                    <tr key={j.id} style={{ borderTop: '1px solid var(--bl-divider)' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 22 }}>{j.flag}</span>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--bl-text)' }}>{j.name}</div>
                            {j.tags.includes('optimal') && (
                              <span style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--bl-accent)' }}>
                                Optimal
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center', fontFamily: 'var(--bl-font-mono)', fontWeight: 700, color: getRiskColor(j.riskScore) }}>
                        {j.riskScore}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center', fontFamily: 'var(--bl-font-mono)', color: 'var(--bl-text)' }}>{j.complianceCost}</td>
                      <td style={{ padding: '14px 18px', textAlign: 'center', fontFamily: 'var(--bl-font-mono)', color: 'var(--bl-text)' }}>{j.speedToOperate}</td>
                      <td style={{ padding: '14px 18px', textAlign: 'center', fontFamily: 'var(--bl-font-mono)', color: 'var(--bl-text-muted)' }}>{j.enforcement}</td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                          {j.keyRegulations.map((r) => (
                            <span
                              key={r}
                              style={{
                                fontFamily: 'var(--bl-font-mono)',
                                fontSize: 9,
                                fontWeight: 600,
                                letterSpacing: '0.08em',
                                padding: '3px 8px',
                                borderRadius: 4,
                                background: 'var(--bl-accent-soft)',
                                color: 'var(--bl-accent)',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ fontSize: 'var(--bl-text-small)', color: 'var(--bl-text-subtle)', marginTop: 16, textAlign: 'center' }}>
            Risk score 0–100. Lower = more permissive regulator + lower enforcement aggression. Scores are intelligence indicators, not legal advice.
          </p>
        </div>
      </section>

      {/* Compare 2 */}
      <section
        className="bl-section"
        style={{
          background: 'var(--bl-bg-low)',
          borderTop: '1px solid var(--bl-divider)',
          borderBottom: '1px solid var(--bl-divider)',
        }}
      >
        <div className="bl-container">
          <div style={{ marginBottom: 'clamp(1.5rem, 1rem + 1vw, 2.5rem)', textAlign: 'center', maxWidth: 720, margin: '0 auto clamp(1.5rem, 1rem + 1vw, 2.5rem)' }}>
            <span className="bl-label" style={{ color: 'var(--bl-accent)' }}>— Compare two</span>
            <h2
              style={{
                fontFamily: 'var(--bl-font-display)',
                fontSize: 'var(--bl-text-h2)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: 'var(--bl-text)',
                margin: '0.5rem 0 0.75rem',
              }}
            >
              Run a side-by-side <span className="bl-grad-text">in 10 seconds.</span>
            </h2>
            <p style={{ fontSize: 'var(--bl-text-body)', color: 'var(--bl-text-muted)', lineHeight: 1.6, margin: 0 }}>
              Pick two jurisdictions + paste your industry + business model. Sonnet 4.6 returns a 700-word brief with dimension table, recommendation, and a 3-step move-in plan.
            </p>
          </div>

          <div className="bl-card" style={{ display: 'grid', gap: 'clamp(0.75rem, 0.5rem + 0.5vw, 1rem)', maxWidth: 920, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'clamp(0.75rem, 0.5rem + 0.5vw, 1rem)' }}>
              <Field label="Jurisdiction A">
                <Select value={a} onChange={setA} options={JURISDICTIONS.map((j) => ({ value: j.id, label: `${j.flag} ${j.name}` }))} />
              </Field>
              <Field label="Jurisdiction B">
                <Select value={b} onChange={setB} options={JURISDICTIONS.map((j) => ({ value: j.id, label: `${j.flag} ${j.name}` }))} />
              </Field>
              <Field label="Industry">
                <input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="crypto / fintech"
                  style={inputStyle}
                />
              </Field>
              <Field label="Business model">
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. digital-asset issuer with cross-border treasury"
                  style={inputStyle}
                />
              </Field>
            </div>

            <button
              type="button"
              onClick={runCompare}
              disabled={comparing || a === b}
              className="bl-btn-primary"
              style={{ alignSelf: 'flex-start', justifySelf: 'flex-start', opacity: a === b ? 0.5 : 1, cursor: a === b ? 'not-allowed' : 'pointer' }}
            >
              {comparing ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
              {comparing ? 'Generating — ~10s' : 'Generate side-by-side'}
            </button>

            {a === b && (
              <p style={{ fontSize: 'var(--bl-text-small)', color: 'var(--bl-warning)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={14} /> Pick two different jurisdictions.
              </p>
            )}

            {error && (
              <div role="alert" style={{ padding: '12px 14px', background: 'rgba(220,38,38,0.08)', color: 'var(--bl-danger)', borderRadius: 8, fontSize: 13, lineHeight: 1.5 }}>
                <strong>Comparison failed:</strong> {error}
              </div>
            )}

            {comparison && (
              <div style={{ padding: 'clamp(1rem, 0.75rem + 0.5vw, 1.5rem)', background: 'var(--bl-surface)', border: '1px solid var(--bl-border)', borderRadius: 'var(--bl-radius-md)' }}>
                <div className="bl-label" style={{ marginBottom: 12, color: 'var(--bl-accent)', fontSize: 10 }}>
                  AI brief · Sonnet 4.6 · disclosure v1.0.0-p4
                </div>
                <div style={{ fontFamily: 'var(--bl-font-body)', fontSize: 14, lineHeight: 1.75, color: 'var(--bl-text)', whiteSpace: 'pre-wrap' }}>
                  {comparison}
                </div>
                <p style={{ marginTop: 16, fontSize: 11, color: 'var(--bl-text-subtle)', fontStyle: 'italic' }}>
                  Intelligence — not legal advice. For decisions with regulatory consequences, retain qualified counsel.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bl-section" style={{ background: 'var(--bl-accent-soft)' }}>
        <div className="bl-container-narrow" style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: 'var(--bl-text-h2)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--bl-text)',
              margin: 0,
              marginBottom: '1rem',
            }}
          >
            Found your <span className="bl-grad-text">target jurisdiction?</span>
          </h2>
          <p style={{ fontSize: 'var(--bl-text-body)', color: 'var(--bl-text-muted)', lineHeight: 1.6, margin: 0, marginBottom: '2rem' }}>
            Run a free Risk Engine analysis tailored to that jurisdiction —
            instant score, then click for a full Sonnet 4.6 deep-dive.
          </p>
          <a href="/risk-engine" className="bl-btn-primary">
            Free Risk Engine analysis
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <style>{`
        .spin { animation: spin 0.9s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}

// ──────────────────────────────────────────────────────────
// Small primitives (kept inline; D7 polish-pass extracts them)
// ──────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span
        style={{
          fontFamily: 'var(--bl-font-mono)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--bl-text-muted)',
        }}
      >
        {label}
      </span>
      {children}
    </label>
  )
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: ReadonlyArray<{ value: string; label: string }>
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--bl-surface)',
  border: '1px solid var(--bl-border)',
  borderRadius: 'var(--bl-radius-sm)',
  color: 'var(--bl-text)',
  fontFamily: 'var(--bl-font-body)',
  fontSize: 13,
  outline: 'none',
}
