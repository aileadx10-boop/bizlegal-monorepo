'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const C = {
  bg: '#07090e', surface: '#0d1118', card: '#111622', border: '#1a2035',
  text: '#e8ecf4', muted: '#5a6278', dim: '#2e3450',
  red: '#c0392b', redBg: 'rgba(192,57,43,0.09)', redBorder: 'rgba(192,57,43,0.30)',
  amber: '#d4a843', amberBg: 'rgba(212,168,67,0.08)',
  green: '#27ae60', greenBg: 'rgba(39,174,96,0.08)', orange: '#e67e22',
  mono: '"DM Mono","Fira Code",ui-monospace,monospace',
  serif: '"Playfair Display",Georgia,serif',
  sans: '"DM Sans",system-ui,-apple-system,sans-serif',
}

/* ─── ai_content can come in two shapes ─────────────────────────────────── */
// Shape A: from /api/generate-report + /api/scan/report (both now use generateFullReport)
interface ReportContent {
  executiveSummary: string
  keyFindings: { title: string; detail: string; implication: string }[]
  behavioralAnalysis: string
  riskInterpretation: string
  legalComplianceContext: string
  limitations: string
  conclusion: string
}

// Shape B: regulatory scan (from generateRegulatoryReport)
interface RegContent {
  executiveSummary: string
  riskScore: number
  riskLevel: string
  frameworks: string[]
  violations: { framework: string; article: string; description: string; severity: string }[]
  remediationRoadmap: { action: string; timeframe: string; priority: string }[]
  estimatedExposureLow: string
  estimatedExposureHigh: string
  conclusion: string
}

type AiContent = ReportContent | RegContent

interface Order {
  report_id: string
  wallet_address: string
  network: string
  tier: string
  status: string
  email?: string
  risk_score?: number
  risk_level?: string
  ai_content?: AiContent
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const PAID_STATUSES = new Set(['paid', 'delivered', 'processing'])

function riskStyle(level?: string) {
  if (level === 'Critical') return { color: C.red,    bg: C.redBg }
  if (level === 'High')     return { color: C.orange, bg: 'rgba(230,126,34,0.08)' }
  if (level === 'Moderate') return { color: '#f39c12', bg: 'rgba(243,156,18,0.08)' }
  return { color: C.green, bg: C.greenBg }
}

function sevColor(s?: string) {
  if (s === 'critical') return C.red
  if (s === 'high')     return C.orange
  if (s === 'medium')   return '#f39c12'
  return C.muted
}

function isRegContent(c: AiContent): c is RegContent {
  return 'frameworks' in c || 'violations' in c
}

/* ─── Sub-components ──────────────────────────────────────────────────────── */
function MetricCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div style={{ padding: '16px 18px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 10 }}>
      <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: C.mono, fontSize: 17, fontWeight: 500, color: accent || C.text }}>{String(value)}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: '24px 28px', background: C.surface, borderRadius: 12, border: `1px solid ${C.border}` }}>
      <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16 }}>{title}</div>
      {children}
    </section>
  )
}

/* ─── Report renderer — forensic (ReportContent shape) ──────────────────── */
function ForensicReport({ content, riskScore, riskLevel }: { content: ReportContent; riskScore?: number; riskLevel?: string }) {
  const { color: rc } = riskStyle(riskLevel)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Section title="01 — Executive Summary">
        <p style={{ fontSize: 14, color: '#c6c6cd', lineHeight: 1.85, margin: 0 }}>{content.executiveSummary}</p>
      </Section>

      {content.keyFindings?.length > 0 && (
        <Section title="02 — Key Findings">
          {content.keyFindings.map((f, i) => (
            <div key={i} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: i < content.keyFindings.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ fontFamily: C.mono, fontSize: 12, fontWeight: 600, color: C.amber, marginBottom: 6 }}>{f.title}</div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: '0 0 6px' }}>{f.detail}</p>
              <p style={{ fontSize: 12, color: '#c6c6cd', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>→ {f.implication}</p>
            </div>
          ))}
        </Section>
      )}

      <Section title="03 — Behavioral Analysis">
        <p style={{ fontSize: 14, color: '#c6c6cd', lineHeight: 1.85, margin: 0 }}>{content.behavioralAnalysis}</p>
      </Section>

      <Section title="04 — Risk Interpretation">
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ fontFamily: C.mono, fontSize: 40, fontWeight: 500, color: rc, lineHeight: 1 }}>{riskScore ?? '—'}</div>
          <div>
            <div style={{ fontFamily: C.serif, fontSize: 18, fontWeight: 700, color: rc }}>{riskLevel ?? 'Pending'} Risk</div>
            <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, marginTop: 4 }}>Score / 100</div>
          </div>
        </div>
        <p style={{ fontSize: 14, color: '#c6c6cd', lineHeight: 1.85, margin: 0 }}>{content.riskInterpretation}</p>
      </Section>

      <Section title="05 — Legal & Compliance Context">
        <p style={{ fontSize: 14, color: '#c6c6cd', lineHeight: 1.85, margin: 0 }}>{content.legalComplianceContext}</p>
      </Section>

      <Section title="06 — Methodology & Limitations">
        <p style={{ fontSize: 14, color: '#c6c6cd', lineHeight: 1.85, margin: '0 0 12px' }}>{content.limitations}</p>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>
          Analysis conducted using GoldRush (Covalent) multi-chain API with Etherscan fallback. Risk heuristics cover transaction volume, burst patterns, known-risky address interactions, large-value movements, wallet age, counterparty diversity, and failed-transaction spikes. OFAC SDN list cross-referenced.
        </p>
      </Section>

      <Section title="07 — Conclusion">
        <p style={{ fontSize: 14, color: '#c6c6cd', lineHeight: 1.85, margin: 0 }}>{content.conclusion}</p>
      </Section>
    </div>
  )
}

/* ─── Report renderer — regulatory (RegContent shape) ───────────────────── */
function RegReport({ content }: { content: RegContent }) {
  const { color: rc } = riskStyle(content.riskLevel)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Section title="01 — Executive Summary">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: C.mono, fontSize: 40, fontWeight: 500, color: rc }}>{content.riskScore}</div>
          <div>
            <div style={{ fontFamily: C.serif, fontSize: 18, fontWeight: 700, color: rc }}>{content.riskLevel} Risk</div>
            <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, marginTop: 4 }}>Compliance Score / 100</div>
          </div>
        </div>
        <p style={{ fontSize: 14, color: '#c6c6cd', lineHeight: 1.85, margin: 0 }}>{content.executiveSummary}</p>
      </Section>

      {content.frameworks?.length > 0 && (
        <Section title="02 — Applicable Frameworks">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {content.frameworks.map(f => (
              <span key={f} style={{ padding: '5px 12px', background: C.amberBg, border: `1px solid ${C.amber}33`, borderRadius: 4, fontFamily: C.mono, fontSize: 11, color: C.amber }}>{f}</span>
            ))}
          </div>
        </Section>
      )}

      {content.violations?.length > 0 && (
        <Section title="03 — Identified Violations">
          {content.violations.map((v, i) => (
            <div key={i} style={{ padding: '14px 16px', borderLeft: `3px solid ${sevColor(v.severity)}`, background: C.card, borderRadius: '0 8px 8px 0', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: C.mono, fontSize: 12, fontWeight: 600, color: C.text }}>{v.framework} · {v.article}</span>
                <span style={{ fontFamily: C.mono, fontSize: 9, color: sevColor(v.severity), textTransform: 'uppercase', letterSpacing: '0.1em' }}>{v.severity}</span>
              </div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0 }}>{v.description}</p>
            </div>
          ))}
        </Section>
      )}

      <Section title="04 — Financial Exposure">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 0 }}>
          <MetricCard label="Exposure (Low)" value={content.estimatedExposureLow ?? '—'} accent={C.orange} />
          <MetricCard label="Exposure (High)" value={content.estimatedExposureHigh ?? '—'} accent={C.red} />
        </div>
      </Section>

      {content.remediationRoadmap?.length > 0 && (
        <Section title="05 — Remediation Roadmap">
          {content.remediationRoadmap.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 14, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: C.mono, fontSize: 10, color: r.priority === 'P0' ? C.red : r.priority === 'P1' ? C.orange : C.amber, flexShrink: 0, marginTop: 2 }}>{r.priority} · {r.timeframe}</span>
              <span style={{ fontSize: 13, color: '#c6c6cd', lineHeight: 1.65 }}>{r.action}</span>
            </div>
          ))}
        </Section>
      )}

      <Section title="06 — Conclusion">
        <p style={{ fontSize: 14, color: '#c6c6cd', lineHeight: 1.85, margin: 0 }}>{content.conclusion}</p>
      </Section>
    </div>
  )
}

/* ─── Main component ──────────────────────────────────────────────────────── */
export default function ReportPage() {
  const { report_id } = useParams<{ report_id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [payLoading, setPayLoading] = useState(false)
  const [payErr, setPayErr] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetch(`/api/report/${report_id}`)
      .then(r => r.json())
      .then(d => { setOrder(d.order); setLoading(false) })
      .catch(() => setLoading(false))
  }, [report_id])

  async function handleCryptoPay() {
    if (!order) return
    setPayLoading(true)
    setPayErr('')
    try {
      const res = await fetch('/api/scan/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: order.email ?? '', wallet_address: order.wallet_address, network: order.network, tier: order.tier }),
      })
      const data = await res.json()
      if (data.invoice_url) window.location.href = data.invoice_url
      else setPayErr(data.error || 'Could not create payment link. Email info@bizlegal-ai.com with your report ID.')
    } finally {
      setPayLoading(false)
    }
  }

  async function handleGenerateReport() {
    if (!order) return
    setGenerating(true)
    try {
      const res = await fetch('/api/scan/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: order.report_id }),
      })
      const data = await res.json()
      if (data.ai_content) {
        setOrder(o => o ? { ...o, ai_content: data.ai_content, status: 'delivered' } : o)
      }
    } finally {
      setGenerating(false)
    }
  }

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: `1.5px solid ${C.amber}`, borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite' }} />
      <div style={{ fontFamily: C.mono, fontSize: 12, color: C.muted, letterSpacing: '0.12em' }}>Loading report…</div>
    </div>
  )

  /* ── Not found ─────────────────────────────────────────────── */
  if (!order) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div style={{ fontSize: 28, color: C.red }}>⚠</div>
      <div style={{ fontFamily: C.mono, fontSize: 14, color: C.muted }}>Report not found.</div>
      <a href="/scan" style={{ fontFamily: C.mono, fontSize: 12, color: C.amber, textDecoration: 'none', marginTop: 8 }}>← Run a new scan</a>
    </div>
  )

  const isPaid = PAID_STATUSES.has(order.status)   // BUG FIX: includes 'delivered' and 'processing'
  const { color: riskColor, bg: riskBg } = riskStyle(order.risk_level)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: C.sans }}>
      {/* Nav */}
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
        <a href="/" style={{ textDecoration: 'none', fontFamily: C.mono, fontSize: 20, fontWeight: 500, letterSpacing: '0.14em', color: C.text }}>
          TRA<span style={{ color: C.amber }}>C</span>R
        </a>
        <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.1em' }}>{order.report_id}</div>
      </nav>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '52px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36, paddingBottom: 28, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
            TRACR {order.tier === 'regulatory' ? 'Regulatory' : 'Forensic'} Report
          </div>
          <h1 style={{ fontFamily: C.serif, fontSize: 30, fontWeight: 700, color: C.text, marginBottom: 10, lineHeight: 1.2 }}>
            {order.tier === 'regulatory' ? 'Regulatory Compliance Report' : 'On-Chain Intelligence Report'}
          </h1>
          <div style={{ fontFamily: C.mono, fontSize: 12, color: C.muted }}>
            {order.wallet_address}{order.tier !== 'regulatory' && ` · ${order.network}`}
          </div>
        </div>

        {/* Risk gauge */}
        {(order.risk_score !== undefined || order.risk_level) && order.tier !== 'regulatory' && (
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 28, padding: '24px 28px', borderRadius: 12, background: riskBg, border: `1px solid ${riskColor}33` }}>
            <div style={{ textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontFamily: C.mono, fontSize: 44, fontWeight: 500, color: riskColor, lineHeight: 1 }}>{order.risk_score ?? '—'}</div>
              <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, letterSpacing: '0.12em', marginTop: 4 }}>RISK SCORE</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: riskColor, marginBottom: 4, fontFamily: C.serif }}>{order.risk_level ?? 'Pending'} Risk</div>
              <div style={{ fontSize: 13, color: C.muted }}>
                {order.tier.charAt(0).toUpperCase() + order.tier.slice(1)} tier ·{' '}
                <span style={{ color: isPaid ? C.green : C.orange }}>{isPaid ? 'Payment confirmed' : 'Awaiting payment'}</span>
              </div>
            </div>
          </div>
        )}

        {/* PAID + report generated */}
        {isPaid && order.ai_content && (
          <>
            {isRegContent(order.ai_content)
              ? <RegReport content={order.ai_content} />
              : <ForensicReport content={order.ai_content} riskScore={order.risk_score} riskLevel={order.risk_level} />
            }

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
              <button onClick={() => window.print()} style={{
                padding: '11px 24px', background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: C.sans,
              }}>Print / Save as PDF</button>
            </div>

            {/* Keep-watching upsell — self-serve, no calendar */}
            <div style={{ marginTop: 28, padding: '28px 32px', borderRadius: 12, textAlign: 'center', background: C.amberBg, border: `1px solid rgba(212,168,67,0.2)` }}>
              <h3 style={{ fontFamily: C.serif, fontSize: 18, color: C.text, marginBottom: 8 }}>Keep these addresses under watch</h3>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.7 }}>A trace is a snapshot. Daily screening against the OFAC, UN and EU lists emails you the moment a watched address appears on one — $29/mo, cancel anytime.</p>
              <a href="https://bizlegal-ai.com/tools/ofac-watcher"
                style={{ display: 'inline-block', padding: '12px 30px', background: C.amberBg, border: `1px solid ${C.amber}66`, borderRadius: 8, color: C.amber, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                Set up daily monitoring →
              </a>
            </div>
          </>
        )}

        {/* PAID but awaiting generation (NOWPayments path — trigger manually) */}
        {isPaid && !order.ai_content && (
          <div style={{ padding: '36px 32px', background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontFamily: C.mono, fontSize: 12, color: C.green, letterSpacing: '0.15em', marginBottom: 16 }}>✓ Payment Confirmed</div>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.65 }}>
              Your payment has been verified. Click below to generate your full forensic report (takes ~30–60 seconds).
            </p>
            <button onClick={handleGenerateReport} disabled={generating} style={{
              padding: '14px 36px', background: generating ? C.surface : C.amber, color: generating ? C.muted : '#07090e',
              borderRadius: 8, border: 'none', fontSize: 15, fontWeight: 700, cursor: generating ? 'wait' : 'pointer', fontFamily: C.sans,
            }}>
              {generating ? 'Generating report… (this takes up to 60s)' : 'Generate Full Report →'}
            </button>
          </div>
        )}

        {/* NOT PAID */}
        {!isPaid && (
          <div style={{ padding: '40px 32px', background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🔒</div>
            <h2 style={{ fontFamily: C.serif, fontSize: 22, color: C.text, marginBottom: 10 }}>Full Report Locked</h2>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 28, lineHeight: 1.7, maxWidth: 420, margin: '0 auto 28px' }}>
              Complete payment to unlock the full forensic analysis, legal summary, and recommended actions.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <button onClick={handleCryptoPay} disabled={payLoading} style={{
                padding: '13px 30px', background: C.redBg, border: `1px solid ${C.redBorder}`,
                borderRadius: 8, color: C.red, fontSize: 14, fontWeight: 700, cursor: payLoading ? 'wait' : 'pointer', fontFamily: C.sans,
              }}>
                {payLoading ? 'Creating link…' : 'Pay with Crypto →'}
              </button>
              <a href="mailto:info@bizlegal-ai.com?subject=Card%20payment%20for%20TRACR%20report" style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '13px 30px', background: C.amberBg, border: `1px solid rgba(212,168,67,0.3)`,
                borderRadius: 8, color: C.amber, fontSize: 14, fontWeight: 700, textDecoration: 'none',
              }}>
                Pay by Card — Email Us →
              </a>
            </div>
            {payErr && (
              <p style={{ fontSize: 12, color: C.red, fontFamily: C.mono, marginBottom: 12 }}>{payErr}</p>
            )}
            <p style={{ fontSize: 11, color: C.dim, fontFamily: C.mono }}>Crypto via NOWPayments · Card via email arrangement</p>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ marginTop: 40, padding: '18px 24px', borderRadius: 8, background: C.surface, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 11, color: C.dim, lineHeight: 1.7, fontFamily: C.mono, margin: 0 }}>
            <strong style={{ color: C.muted }}>DISCLAIMER:</strong> This report is generated using automated blockchain analysis and AI-assisted interpretation. It does not constitute legal advice. Findings are risk indicators only. Consult qualified legal counsel before acting on this report. Report ID: {order.report_id}.
          </p>
        </div>
      </div>
    </div>
  )
}
