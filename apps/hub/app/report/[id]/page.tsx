import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import ScoreGauge from '@/components/tools/ScoreGauge'
import PrintButton from '@/components/report/PrintButton'
import Link from 'next/link'
import type { Metadata } from 'next'

type Props = { params: { id: string } }

async function getReport(id: string) {
  const { data } = await supabaseAdmin
    .from('assessments')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const report = await getReport(params.id)
  if (!report) return { title: 'Report Not Found' }
  return {
    title: `Compliance Risk Report — Score: ${report.score} (${report.severity})`,
    robots: { index: false, follow: false },
  }
}

export default async function ReportPage({ params }: Props) {
  const report = await getReport(params.id)
  if (!report) notFound()

  const { calculateRisk } = await import('@/lib/riskEngine')
  const result = calculateRisk({
    industry: report.industry,
    userCountRange: report.user_count_range,
    regions: report.regions,
    hasDPO: report.has_dpo,
  })

  const severityColor = report.severity === 'CRITICAL' ? '#f87171' : report.severity === 'MODERATE' ? '#e9c349' : '#10B981'
  const scoreBg = report.severity === 'CRITICAL' ? 'rgba(163,45,45,0.15)' : report.severity === 'MODERATE' ? 'rgba(133,79,11,0.20)' : 'rgba(16,185,129,0.10)'
  const scoreBorder = report.severity === 'CRITICAL' ? 'rgba(248,113,113,0.3)' : report.severity === 'MODERATE' ? 'rgba(233,195,73,0.3)' : 'rgba(16,185,129,0.3)'

  return (
    <div style={{ maxWidth: 580, margin: '0 auto', padding: '48px 24px' }} className="no-print">
      {/* Print-only header */}
      <div style={{ display: 'none' }} className="print-only">
        <h1>BizLegal AI — Compliance Risk Report</h1>
        <p>Generated: {new Date(report.created_at).toLocaleDateString()}</p>
      </div>

      {/* Score Band */}
      <div style={{ background: scoreBg, border: `0.5px solid ${scoreBorder}`, padding: '28px 24px', marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Newsreader, serif', fontSize: 80, fontWeight: 700, color: severityColor, lineHeight: 1 }}>
          {report.score}
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: severityColor, marginTop: 8 }}>
          {report.severity} Risk
        </div>
        <div style={{ fontSize: 12, color: 'var(--outline)', marginTop: 8 }}>
          {report.industry} · {Array.isArray(report.regions) ? report.regions.join(', ') : report.regions}
        </div>
      </div>

      {/* Score Gauge */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <ScoreGauge score={report.score} severity={report.severity} animate />
      </div>

      {/* Threats */}
      <div style={{ marginBottom: 32 }}>
        <span className="section-label">Identified Threats</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {result.threats.map((threat, i) => {
            const regMatch = threat.match(/^(GDPR|MiCA|VARA|SEC|AML)/i)
            const reg = regMatch ? regMatch[1].toUpperCase() : 'RISK'
            return (
              <div key={i} style={{ borderLeft: '2px solid var(--danger)', padding: '12px 16px', background: 'var(--bg-low)' }}>
                <span className="tag" style={{ display: 'block', marginBottom: 6 }}>{reg}</span>
                <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>{threat}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Precedent Blockquote */}
      <div className="bq-callout" style={{ marginBottom: 32 }}>
        {result.precedent}
        <cite>Enforcement Precedent</cite>
      </div>

      {/* Mitigations */}
      <div style={{ marginBottom: 40 }}>
        <span className="section-label">Recommended Actions</span>
        {result.mitigations.map((mit, i) => (
          <div key={i} style={{ display: 'flex', gap: 20, marginBottom: 20, alignItems: 'flex-start' }}>
            <span style={{ fontFamily: 'Newsreader, serif', fontSize: 32, fontWeight: 700, color: 'var(--primary)', lineHeight: 1, flexShrink: 0, minWidth: 40 }}>
              0{i + 1}
            </span>
            <p style={{ fontSize: 13, margin: 0, lineHeight: 1.7, paddingTop: 4 }}>{mit}</p>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }} className="no-print">
        <a
          href="/tools"
          className="btn-primary"
          style={{ justifyContent: 'center', fontSize: 14, padding: '14px' }}
        >
          Fix these with the compliance tools →
        </a>
        <PrintButton label="Download PDF Report" />
      </div>

      {/* Disclaimer */}
      <p style={{ fontSize: 11, color: 'var(--outline)', textAlign: 'center', lineHeight: 1.6 }}>
        This report is for informational purposes only and does not constitute legal advice.
        Consult qualified legal counsel for your specific situation.
      </p>
    </div>
  )
}
