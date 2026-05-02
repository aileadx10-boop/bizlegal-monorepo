const C = {
  bg: '#07090e', surface: '#0d1118', border: '#1a2035', text: '#e8ecf4',
  muted: '#5a6278', dim: '#2e3450', amber: '#d4a843', red: '#c0392b',
  mono: '"DM Mono","Fira Code",ui-monospace,monospace',
  serif: '"Playfair Display",Georgia,serif',
  sans: '"DM Sans",system-ui,sans-serif',
}

import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Methodology & Data Sources — TRACR Intelligence',
  description: 'How TRACR analyzes blockchain wallets, scores risk, and produces court-ready forensic reports.',
}

const RISK_WEIGHTS = [
  { signal: 'Interaction with flagged address',  weight: '40', severity: 'Critical' },
  { signal: 'Rapid transaction bursts (>30/day)', weight: '30', severity: 'High' },
  { signal: 'New wallet, high activity',          weight: '25', severity: 'High' },
  { signal: 'Extremely high volume (>500 tx)',    weight: '20', severity: 'High' },
  { signal: 'Large value movement (>10 ETH)',     weight: '20', severity: 'Medium' },
  { signal: 'Moderate bursting (>15/day)',        weight: '15', severity: 'Medium' },
  { signal: 'High counterparty diversity',        weight: '15', severity: 'Medium' },
  { signal: 'Elevated failed transactions',       weight: '10', severity: 'Medium' },
  { signal: 'Elevated volume (>100 tx)',          weight: '10', severity: 'Medium' },
]

export default function MethodologyPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: C.sans }}>
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: C.mono, fontSize: 22, fontWeight: 500, letterSpacing: '0.12em', color: C.text }}>
            TRA<span style={{ color: C.amber }}>C</span>R
          </div>
        </a>
        <a href="/analyze" style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, textDecoration: 'none', letterSpacing: '0.08em' }}>
          Free Wallet Scan →
        </a>
      </nav>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '64px 24px 80px' }}>

        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 14 }}>
            Transparency
          </div>
          <h1 style={{ fontFamily: C.serif, fontSize: 40, fontWeight: 700, color: C.text, marginBottom: 16, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Methodology & Data Sources
          </h1>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.7, maxWidth: 600 }}>
            How TRACR Intelligence analyzes blockchain wallets, scores risk exposure, and produces court-ready forensic evidence packages.
          </p>
        </div>

        {/* Data Sources */}
        <Section title="01 — Data Sources">
          <p>TRACR Intelligence aggregates on-chain data from multiple sources to ensure comprehensive coverage across blockchain networks:</p>
          <ul style={{ margin: '16px 0', paddingLeft: 0, listStyle: 'none' }}>
            {[
              { label: 'GoldRush / Covalent API', desc: 'Multi-chain transaction indexing across Ethereum, BNB Chain, Polygon, Arbitrum, Base, Avalanche' },
              { label: 'Etherscan API',            desc: 'Ethereum mainnet transaction verification and fallback data source' },
              { label: 'Blockchain.info',          desc: 'Bitcoin address transaction history (no authentication required)' },
              { label: 'OFAC SDN List',            desc: 'U.S. Treasury Office of Foreign Assets Control — Specially Designated Nationals list of sanctioned entities' },
              { label: 'On-chain heuristics',      desc: 'Proprietary behavioral clustering and pattern recognition applied to transaction metadata' },
            ].map(s => (
              <li key={s.label} style={{ display: 'flex', gap: 16, marginBottom: 12, padding: '14px 18px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                <div style={{ fontFamily: C.mono, fontSize: 12, fontWeight: 600, color: C.amber, minWidth: 200, flexShrink: 0 }}>{s.label}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{s.desc}</div>
              </li>
            ))}
          </ul>
        </Section>

        {/* Risk Scoring */}
        <Section title="02 — Risk Scoring Methodology">
          <p>TRACR uses a heuristic scoring system that assigns weights to behavioral signals detected in on-chain transaction data. Scores range from 0 to 100 and map to four risk levels:</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, margin: '20px 0 24px' }}>
            {[
              { label: 'Low',      range: '0–24',  color: '#27ae60' },
              { label: 'Moderate', range: '25–49', color: '#f39c12' },
              { label: 'High',     range: '50–74', color: '#e67e22' },
              { label: 'Critical', range: '75–100', color: C.red },
            ].map(l => (
              <div key={l.label} style={{ padding: '14px', background: C.surface, border: `1px solid ${l.color}33`, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontFamily: C.mono, fontSize: 16, fontWeight: 500, color: l.color }}>{l.label}</div>
                <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, marginTop: 4 }}>{l.range}</div>
              </div>
            ))}
          </div>

          <p>The following signals and weights are applied during analysis:</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {['Risk Signal', 'Weight', 'Severity'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: C.mono, fontSize: 10, color: C.amber, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RISK_WEIGHTS.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: C.text }}>{row.signal}</td>
                  <td style={{ padding: '12px 14px', fontFamily: C.mono, fontSize: 13, color: C.amber }}>+{row.weight}</td>
                  <td style={{ padding: '12px 14px', fontFamily: C.mono, fontSize: 11, color: row.severity === 'Critical' ? C.red : row.severity === 'High' ? '#e67e22' : '#f39c12' }}>{row.severity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 16, fontSize: 13, color: C.dim }}>* Total score is capped at 100. Weights are additive. Multiple signals compound.</p>
        </Section>

        {/* AI Analysis */}
        <Section title="03 — AI-Assisted Analysis">
          <p>Full paid reports use a 4-stage AI analysis pipeline powered by Claude (Anthropic) to produce defensible, court-ready narratives:</p>
          {[
            { stage: 'Stage 1', label: 'Pattern Extraction',    desc: 'Raw transaction data is analyzed to identify behavioral patterns, flow characteristics, and temporal anomalies.' },
            { stage: 'Stage 2', label: 'Risk Classification',   desc: 'Detected patterns are correlated with known risk typologies and scored against AML/FATF frameworks.' },
            { stage: 'Stage 3', label: 'Legal Framing',         desc: 'Technical findings are translated into court-appropriate language — cautious, evidence-based, avoiding criminality assertions.' },
            { stage: 'Stage 4', label: 'Report Synthesis',      desc: 'A complete forensic report is produced with executive summary, behavioral analysis, legal context, and limitations.' },
          ].map(s => (
            <div key={s.stage} style={{ display: 'flex', gap: 16, marginBottom: 14, padding: '16px 20px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
              <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, minWidth: 80, flexShrink: 0, marginTop: 2 }}>{s.stage}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </Section>

        {/* Limitations */}
        <Section title="04 — Limitations & Boundaries">
          <p>TRACR reports are analytical tools, not legal determinations. The following limitations apply to all analyses:</p>
          {[
            'Reports are based solely on publicly available on-chain data. Off-chain activity, private transactions, and layer-2 rollup internals may not be captured.',
            'Risk scores are probabilistic indicators, not proof of illicit activity. A high score indicates behavioral patterns associated with elevated risk, not confirmed wrongdoing.',
            'Address clustering and counterparty attribution is based on heuristics and may produce false positives. Exchange hot wallets and shared custody services may appear as single high-volume entities.',
            'TRACR does not have access to exchange KYC data, private keys, or law enforcement databases. Reports complement, but do not replace, formal legal discovery.',
            'This report does not constitute legal advice. Recipients should consult qualified legal counsel before taking action based on TRACR findings.',
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 12, alignItems: 'flex-start' }}>
              <span style={{ color: C.amber, flexShrink: 0, marginTop: 2 }}>▸</span>
              <span style={{ fontSize: 14, color: C.muted, lineHeight: 1.65 }}>{t}</span>
            </div>
          ))}
        </Section>

        {/* Credentials */}
        <Section title="05 — About TRACR Intelligence">
          <p>TRACR Intelligence is developed by a team of legal professionals and blockchain analysts. Our reports are designed for use in active litigation, regulatory proceedings, and due diligence investigations.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
            {[
              { label: 'Legal Coverage',   value: 'NY Bar · ICC Arbitration · DIFC' },
              { label: 'Jurisdictions',    value: '12+ active jurisdictions served' },
              { label: 'Chain Coverage',   value: 'ETH · BNB · Polygon · ARB · Base' },
              { label: 'Report Format',    value: 'Court-ready PDF · Evidence-grade' },
            ].map(s => (
              <div key={s.label} style={{ padding: '16px 18px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                <div style={{ fontFamily: C.mono, fontSize: 10, color: C.amber, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>{s.label}</div>
                <div style={{ fontSize: 14, color: C.text }}>{s.value}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Disclaimer */}
        <div style={{ padding: '20px 24px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, marginTop: 48 }}>
          <p style={{ fontSize: 11, color: C.dim, lineHeight: 1.7, fontFamily: C.mono, margin: 0 }}>
            <strong style={{ color: C.muted }}>NOT LEGAL ADVICE:</strong> TRACR Intelligence reports are generated using automated blockchain analysis tools. They are for informational purposes only and do not constitute legal advice. All risk findings are probabilistic indicators only. TRACR does not assert criminal activity. Consult qualified legal counsel before taking any action.
          </p>
        </div>

      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 48, paddingBottom: 40, borderBottom: `1px solid ${C.border}` }}>
      <h2 style={{ fontFamily: C.serif, fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 18, lineHeight: 1.2 }}>{title}</h2>
      <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.75 }}>{children}</div>
    </div>
  )
}
