'use client'

import { useState } from 'react'
import { RiskScoreCard, RiskBreakdownCard, EnforcementProbabilityCard, DashboardPanel, InputField, SliderField, ToggleField, CalloutBox, CTASection } from '@/app/components/ui'
import { Shield, AlertTriangle, Info, ArrowRight, RefreshCw, Download, Mail } from 'lucide-react'

const INDUSTRIES = [
  { value: 'crypto', label: 'Crypto / DeFi' },
  { value: 'saas', label: 'SaaS Platform' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'payments', label: 'Payment Processing' },
  { value: 'lending', label: 'Lending / Credit' },
  { value: 'exchange', label: 'Crypto Exchange' },
]

const JURISDICTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'EU', label: 'European Union' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'SG', label: 'Singapore' },
  { value: 'UAE', label: 'UAE / Dubai' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'KY', label: 'Cayman Islands' },
  { value: 'VG', label: 'British Virgin Islands' },
  { value: 'AU', label: 'Australia' },
  { value: 'CA', label: 'Canada' },
]

function calculateRiskScore(data: {
  industry: string
  jurisdictions: string[]
  userCount: number
  transactionVolume: number
  hasComplianceProgram: boolean
  hasDPO: boolean
  hasAML: boolean
  hasLicense: boolean
}): { score: number; regulatory: number; financial: number; enforcement: number; enforcementProb: number; exposure: string; threats: string[]; mitigations: string[] } {
  let regulatory = 0
  let financial = 0
  let enforcement = 0

  // Industry base risk
  const industryRisk: Record<string, number> = {
    crypto: 65, exchange: 70, lending: 55, payments: 50, saas: 30, fintech: 45
  }
  regulatory += industryRisk[data.industry] || 40

  // Jurisdiction risk
  const jurisdictionRisk: Record<string, number> = {
    US: 55, EU: 52, UK: 48, SG: 32, UAE: 40, CH: 28, KY: 22, VG: 20, AU: 38, CA: 42
  }
  data.jurisdictions.forEach(j => {
    regulatory += (jurisdictionRisk[j] || 30) * 0.4
    enforcement += (jurisdictionRisk[j] || 30) * 0.3
  })

  // User count
  regulatory += Math.min(20, data.userCount * 0.002)

  // Transaction volume
  financial += Math.min(25, data.transactionVolume * 0.00005)

  // Compliance program reduces risk
  if (data.hasComplianceProgram) {
    regulatory *= 0.7
    enforcement *= 0.6
  }
  if (data.hasAML) {
    regulatory *= 0.8
    financial *= 0.7
  }
  if (data.hasLicense) {
    regulatory *= 0.5
    enforcement *= 0.4
  }
  if (data.hasDPO) {
    regulatory *= 0.85
  }

  regulatory = Math.round(Math.min(99, regulatory))
  financial = Math.round(Math.min(99, financial))
  enforcement = Math.round(Math.min(99, enforcement))

  const score = Math.round((regulatory + financial + enforcement) / 3)

  // Enforcement probability
  const enforcementProb = Math.round((enforcement * 0.8 + regulatory * 0.2))

  // Exposure estimate
  const exposureBase = Math.round(data.transactionVolume * 0.05 + data.userCount * 10)
  const exposure = `$${Math.round(exposureBase / 1000) * 1000 > 0 ? Math.round(exposureBase / 1000) * 1000 : '$10,000'}`

  // Threats
  const threats: string[] = []
  if (!data.hasLicense && (data.industry === 'crypto' || data.industry === 'exchange')) {
    threats.push('Unlicensed VASP operations — ' + (data.jurisdictions.includes('UAE') ? 'VARA Category 3 licence required for Dubai operations' : 'Operating without appropriate financial licence exposes principals to personal liability'))
  }
  if (!data.hasAML && data.transactionVolume > 50000) {
    threats.push('AML/CTF programme deficiency — FATF Recommendation 10 requires documented CDD for all high-risk transactions')
  }
  if (!data.hasComplianceProgram && data.jurisdictions.includes('EU')) {
    threats.push('GDPR Article 30 record-keeping gap — no documented data processing activities creates €10M+ exposure')
  }
  if (data.industry === 'crypto' && data.jurisdictions.includes('US')) {
    threats.push('SEC Howey Test exposure — digital asset sales may constitute unregistered securities offering without exemption')
  }
  if (data.userCount > 10000 && !data.hasDPO) {
    threats.push('Mandatory DPO obligation — Article 37 GDPR requires formal DPO appointment at this scale')
  }

  // Mitigations
  const mitigations: string[] = []
  mitigations.push(`Engage ${data.jurisdictions.includes('EU') ? 'qualified EU legal counsel for MiCA/GDPR gap analysis' : 'regulatory counsel to assess licensing requirements in target jurisdictions'}`)
  if (!data.hasLicense) mitigations.push('Apply for appropriate VASP/fintech licence in primary operating jurisdiction within 60 days')
  if (!data.hasAML) mitigations.push('Implement FATF-compliant AML programme with documented KYC/CDD/ongoing monitoring')
  if (!data.hasComplianceProgram) mitigations.push('Establish regulatory compliance management system with quarterly internal audits')
  mitigations.push('Subscribe to BizLegal AI enforcement monitoring for proactive alert coverage')

  return { score, regulatory, financial, enforcement, enforcementProb, exposure, threats: threats.slice(0, 4), mitigations }
}

export function RiskEngineClient() {
  const [industry, setIndustry] = useState('crypto')
  const [jurisdictions, setJurisdictions] = useState<string[]>(['US', 'EU'])
  const [userCount, setUserCount] = useState(50)
  const [transactionVolume, setTransactionVolume] = useState(100)
  const [hasComplianceProgram, setHasComplianceProgram] = useState(false)
  const [hasDPO, setHasDPO] = useState(false)
  const [hasAML, setHasAML] = useState(false)
  const [hasLicense, setHasLicense] = useState(false)
  const [result, setResult] = useState<ReturnType<typeof calculateRiskScore> | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [reportEmail, setReportEmail] = useState('')
  const [reportName, setReportName] = useState('')
  const [sendingReport, setSendingReport] = useState(false)
  const [reportSent, setReportSent] = useState(false)
  const [deepAnalysis, setDeepAnalysis] = useState<string | null>(null)
  const [loadingDeep, setLoadingDeep] = useState(false)
  const [deepError, setDeepError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setResult(null)
    setDeepAnalysis(null)
    setDeepError(null)
    // Snappy 600ms instead of 2s — instant feedback feels more premium
    await new Promise(r => setTimeout(r, 600))
    setResult(calculateRiskScore({ industry, jurisdictions, userCount, transactionVolume, hasComplianceProgram, hasDPO, hasAML, hasLicense }))
    setAnalyzing(false)
  }

  // Phase B1 — call Sonnet 4.6 deep-analysis route layered on top of the
  // deterministic client-side score. Returns a 600-word markdown narrative
  // with specific enforcement examples + 30/60/90-day action plan + 3 CTAs.
  const handleDeepAnalysis = async () => {
    if (!result) return
    setLoadingDeep(true)
    setDeepError(null)
    setDeepAnalysis(null)
    try {
      const res = await fetch('/api/risk-engine/deep-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result,
          industry,
          jurisdictions,
          userCount,
          transactionVolume,
          hasComplianceProgram,
          hasDPO,
          hasAML,
          hasLicense,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { narrative?: string; error?: string }
      if (!res.ok) {
        setDeepError(data.error ?? `Analysis failed (${res.status}). Please try again.`)
      } else if (data.narrative) {
        setDeepAnalysis(data.narrative)
      } else {
        setDeepError('Analysis returned empty. Please try again.')
      }
    } catch (err) {
      setDeepError(err instanceof Error ? err.message : 'Network error. Please try again.')
    } finally {
      setLoadingDeep(false)
    }
  }

  const toggleJurisdiction = (j: string) => {
    setJurisdictions(prev => prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j])
  }

  return (
    <div className="min-h-screen">
      {/* Page header — Direction C themed */}
      <section
        className="bl-hero-bg"
        style={{
          paddingTop: 'clamp(3rem, 1.5rem + 3vw, 5rem)',
          paddingBottom: 'clamp(2rem, 1.5rem + 1.5vw, 3rem)',
        }}
      >
        <div className="bl-container" style={{ maxWidth: 1600 }}>
          <span className="bl-tag" style={{ marginBottom: '1rem' }}>
            <Shield size={14} /> Risk Intelligence Engine
          </span>
          <h1
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: 'var(--bl-text-h1)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              color: 'var(--bl-text)',
              margin: '1.5rem 0 0.75rem',
            }}
          >
            Risk Analysis <span className="bl-grad-text">Dashboard.</span>
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
            Full-spectrum regulatory risk assessment in 30 seconds. Configure
            your business below — we score regulatory, financial, and
            enforcement exposure, then layer Sonnet 4.6 to write you a real
            action plan.
          </p>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          {/* LEFT: Input Panel */}
          <div className="space-y-6">
            <DashboardPanel title="Business Parameters" subtitle="Configure your risk profile">
              <div className="space-y-6">
                <InputField
                  label="Industry / Sector"
                  type="select"
                  value={industry}
                  onChange={v => setIndustry(v)}
                  options={INDUSTRIES}
                />

                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/50">Target Jurisdictions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {JURISDICTIONS.map(j => (
                      <button
                        key={j.value}
                        onClick={() => toggleJurisdiction(j.value)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                          jurisdictions.includes(j.value)
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-white/5 text-white/50 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        {j.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-white/30">{jurisdictions.length} jurisdiction(s) selected</p>
                </div>

                <SliderField
                  label="Active Users"
                  value={userCount}
                  onChange={setUserCount}
                  min={1}
                  max={100000}
                  unit="+"
                />

                <SliderField
                  label="Monthly Transaction Volume ($)"
                  value={transactionVolume}
                  onChange={setTransactionVolume}
                  min={0}
                  max={10000}
                  unit="K"
                />

                <div className="space-y-4 pt-2 border-t border-white/10">
                  <ToggleField
                    label="Active Compliance Program"
                    value={hasComplianceProgram}
                    onChange={setHasComplianceProgram}
                    description="Documented policies, training, and monitoring"
                  />
                  <ToggleField
                    label="AML / KYC Framework"
                    value={hasAML}
                    onChange={setHasAML}
                    description="Customer due diligence and transaction monitoring"
                  />
                  <ToggleField
                    label="Regulatory Licence(s)"
                    value={hasLicense}
                    onChange={setHasLicense}
                    description="VASP, fintech, or payment licence in active jurisdiction"
                  />
                  <ToggleField
                    label="Data Protection Officer"
                    value={hasDPO}
                    onChange={setHasDPO}
                    description="Internal or contracted DPO arrangement"
                  />
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || jurisdictions.length === 0}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/10 disabled:text-white/40 text-white font-bold text-sm uppercase tracking-wider transition-all"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Shield size={16} />
                      Run Risk Analysis
                    </>
                  )}
                </button>
              </div>
            </DashboardPanel>
          </div>

          {/* RIGHT: Results Dashboard */}
          <div className="space-y-6">
            {!result && !analyzing && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 backdrop-blur-xl p-16 text-center">
                <Shield size={48} className="mx-auto text-white/10 mb-4" />
                <h3 className="text-lg font-semibold text-white/40 mb-2">No Analysis Yet</h3>
                <p className="text-sm text-white/30 max-w-sm mx-auto">Configure your business parameters on the left and run the risk analysis to generate your quantified risk profile.</p>
              </div>
            )}

            {analyzing && (
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xl p-16 text-center">
                <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white/70 mb-2">Analyzing Risk Profile...</h3>
                <p className="text-sm text-white/40">Processing {jurisdictions.length} jurisdictions across {Object.keys({ industry, hasComplianceProgram, hasAML, hasLicense, hasDPO }).length} compliance dimensions</p>
              </div>
            )}

            {result && (
              <>
                {/* Score Cards */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <RiskScoreCard
                    score={result.score}
                    size="lg"
                    animated={true}
                  />
                  <EnforcementProbabilityCard
                    probability={result.enforcementProb}
                    exposure={result.exposure}
                  />
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col justify-center">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-white/50 mb-3">Jurisdictions</h3>
                    <div className="flex flex-wrap gap-1">
                      {result.score > 0 && jurisdictions.map(j => {
                        const risks: Record<string, number> = { US: 62, EU: 58, UK: 55, SG: 38, UAE: 45, CH: 32, KY: 28, VG: 25, AU: 42, CA: 48 }
                        const r = risks[j] || 40
                        return (
                          <span key={j} className={`px-2 py-1 rounded text-xs font-bold font-mono ${
                            r > 55 ? 'bg-red-500/20 text-red-400' : r > 40 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {j}
                          </span>
                        )
                      })}
                    </div>
                    <div className="mt-4 flex-1 flex items-center">
                      <span className="text-xs text-white/40">Click jurisdictions above to remove</span>
                    </div>
                  </div>
                </div>

                {/* Risk Breakdown */}
                <RiskBreakdownCard
                  regulatory={result.regulatory}
                  financial={result.financial}
                  enforcement={result.enforcement}
                />

                {/* Threats */}
                {result.threats.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-white/50 flex items-center gap-2">
                      <AlertTriangle size={14} className="text-red-400" />
                      Identified Threats
                    </h3>
                    {result.threats.map((threat, i) => (
                      <CalloutBox key={i} variant="danger" title={`Threat ${i + 1}`}>
                        {threat}
                      </CalloutBox>
                    ))}
                  </div>
                )}

                {/* Mitigations */}
                {result.mitigations.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-white/50 flex items-center gap-2">
                      <Info size={14} className="text-indigo-400" />
                      Recommended Mitigations
                    </h3>
                    {result.mitigations.map((m, i) => (
                      <CalloutBox key={i} variant="info" title={`Action ${i + 1}`}>
                        {m}
                      </CalloutBox>
                    ))}
                  </div>
                )}

                {/* Action bar */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
                  <a href="/jurisdictions" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all">
                    Compare Jurisdictions <ArrowRight size={14} />
                  </a>
                  <a href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 hover:border-white/40 text-white/70 hover:text-white text-sm font-medium transition-all">
                    Upgrade to Pro
                  </a>
                </div>

                {/* Phase B1 — Sonnet 4.6 deep-analysis narrative */}
                <div style={{
                  marginTop: 24,
                  padding: 20,
                  borderRadius: 12,
                  background: 'var(--bl-accent-soft, var(--bg-low))',
                  border: '1px solid var(--bl-border, var(--outline-var))',
                }}>
                  <div style={{
                    fontFamily: 'var(--bl-font-display, var(--font-display))',
                    fontSize: 18,
                    color: 'var(--bl-text, var(--white))',
                    marginBottom: 6,
                    fontWeight: 700,
                  }}>
                    Generate detailed regulatory analysis
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: 'var(--bl-text-muted, var(--on-surface-var))',
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}>
                    Get a free 600-word AI-generated brief specific to your{' '}
                    <strong>{industry}</strong> profile and your selected
                    jurisdictions — recent enforcement examples, 30/60/90-day
                    action plan, and prioritised next steps. Powered by
                    Claude Sonnet 4.6.
                  </div>

                  {!deepAnalysis && !deepError && (
                    <button
                      onClick={handleDeepAnalysis}
                      disabled={loadingDeep}
                      style={{
                        padding: '10px 20px',
                        background: 'var(--bl-accent, var(--primary))',
                        color: 'var(--bl-text-on-accent, #fff)',
                        border: 'none',
                        borderRadius: 8,
                        fontFamily: 'var(--bl-font-mono, var(--font-mono))',
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        cursor: loadingDeep ? 'wait' : 'pointer',
                      }}
                    >
                      {loadingDeep ? 'Analyzing — ~10s' : 'Generate detailed report (free)'}
                    </button>
                  )}

                  {deepError && (
                    <div style={{
                      marginTop: 12,
                      padding: '10px 14px',
                      background: 'rgba(220, 38, 38, 0.08)',
                      color: 'var(--bl-danger, #f87171)',
                      borderRadius: 8,
                      fontSize: 12,
                      lineHeight: 1.5,
                    }} role="alert">
                      <strong>Analysis failed:</strong> {deepError}
                      <button
                        onClick={handleDeepAnalysis}
                        style={{
                          marginLeft: 8,
                          padding: '4px 10px',
                          background: 'transparent',
                          color: 'var(--bl-danger, #f87171)',
                          border: '1px solid currentColor',
                          borderRadius: 4,
                          fontSize: 10,
                          fontFamily: 'var(--bl-font-mono, var(--font-mono))',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          cursor: 'pointer',
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {deepAnalysis && (
                    <div style={{
                      marginTop: 12,
                      padding: '20px 24px',
                      background: 'var(--bl-surface, var(--bg-mid))',
                      border: '1px solid var(--bl-border, var(--outline-var))',
                      borderRadius: 10,
                    }}>
                      <div style={{
                        fontFamily: 'var(--bl-font-mono, var(--font-mono))',
                        fontSize: 10,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--bl-accent, var(--primary))',
                        fontWeight: 700,
                        marginBottom: 12,
                      }}>
                        AI-generated brief · Sonnet 4.6 · disclosure v1.0.0-p4
                      </div>
                      <div
                        className="bl-md-deep"
                        style={{
                          fontFamily: 'var(--bl-font-body, var(--font-body))',
                          fontSize: 14,
                          lineHeight: 1.7,
                          color: 'var(--bl-text, var(--on-surface))',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {deepAnalysis}
                      </div>
                      <p style={{
                        marginTop: 16,
                        fontSize: 11,
                        color: 'var(--bl-text-subtle, var(--muted))',
                        fontStyle: 'italic',
                      }}>
                        Intelligence — not legal advice. For decisions with
                        regulatory consequences, retain qualified counsel.
                      </p>
                    </div>
                  )}
                </div>

                {/* Get detailed report via email */}
                {!reportSent ? (
                  <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'var(--bg-low)', border: '1px solid var(--outline-var)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--white)', marginBottom: 8 }}>Get Your Detailed Report</div>
                    <div style={{ fontSize: 13, color: 'var(--on-surface-var)', marginBottom: 16 }}>We'll email you a full risk assessment with detailed jurisdiction breakdowns and compliance recommendations.</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        value={reportName}
                        onChange={e => setReportName(e.target.value)}
                        placeholder="Your name"
                        style={{
                          flex: '1 1 140px', padding: '10px 14px', background: 'var(--bg-mid)',
                          border: '1px solid var(--outline-var)', borderRadius: 8, color: 'var(--on-surface)',
                          fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none', minWidth: 140,
                        }}
                      />
                      <input
                        type="email"
                        value={reportEmail}
                        onChange={e => setReportEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        style={{
                          flex: '1 1 200px', padding: '10px 14px', background: 'var(--bg-mid)',
                          border: '1px solid var(--outline-var)', borderRadius: 8, color: 'var(--on-surface)',
                          fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none', minWidth: 200,
                        }}
                      />
                      <button
                        onClick={async () => {
                          if (!reportEmail) return
                          setSendingReport(true)
                          try {
                            const res = await fetch('/api/risk-assessment', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                industry,
                                userCountRange: userCount < 100 ? '1-100' : userCount < 1000 ? '100-1000' : userCount < 10000 ? '1000-10000' : '10000+',
                                regions: jurisdictions,
                                hasDPO,
                                email: reportEmail,
                              }),
                            })
                            if (res.ok) setReportSent(true)
                          } catch { /* silent */ }
                          setSendingReport(false)
                        }}
                        disabled={sendingReport || !reportEmail}
                        style={{
                          padding: '10px 20px', background: 'var(--gold)', color: '#08080f',
                          border: 'none', borderRadius: 8, fontFamily: 'var(--font-mono)',
                          fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                          cursor: sendingReport ? 'wait' : 'pointer', whiteSpace: 'nowrap',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Mail size={14} /> {sendingReport ? 'Sending...' : 'Send Report'}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'rgba(0,255,148,0.06)', border: '1px solid rgba(0,255,148,0.3)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--accent)', marginBottom: 4 }}>Report Sent!</div>
                    <div style={{ fontSize: 13, color: 'var(--on-surface-var)' }}>Your detailed risk assessment has been sent to {reportEmail}.</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <CTASection
        headline="Need Deeper Analysis?"
        subheadline="Upgrade to Pro for full jurisdiction comparisons, historical enforcement data, and custom alert monitoring."
        primaryCTA={{ label: 'View Pro Features', href: '/pricing' }}
        variant="default"
      />
    </div>
  )
}
