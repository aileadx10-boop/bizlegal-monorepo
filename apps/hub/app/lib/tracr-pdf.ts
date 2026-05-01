import { ReportContent } from './tracr-ai'
import { RiskResult } from './tracr-risk-engine'

export function generateReportHTML(
  wallet: string,
  reportId: string,
  risk: RiskResult,
  content: ReportContent,
  clientName: string,
  network: string
): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const riskColor = { Critical: '#c0392b', High: '#e67e22', Moderate: '#f39c12', Low: '#27ae60' }[risk.level] || '#c0392b'
  const severityColors: Record<string, string> = {
    critical: '#c0392b', high: '#e67e22', medium: '#f39c12', informational: '#2980b9',
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; font-size: 11pt; color: #1a1a2e; background: #fff; }
  .cover { padding: 60px; display: flex; flex-direction: column; justify-content: space-between; min-height: 100vh; border-bottom: 3px solid #d4a843; }
  .cover-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .logo { font-family: 'DM Mono', monospace; font-size: 28px; font-weight: 500; letter-spacing: 0.1em; color: #050608; }
  .logo span { color: #d4a843; }
  .cover-meta { text-align: right; font-family: 'DM Mono', monospace; font-size: 9pt; color: #666; line-height: 1.8; }
  .cover-body { border-left: 4px solid #d4a843; padding-left: 40px; margin: 60px 0; }
  .cover-label { font-family: 'DM Mono', monospace; font-size: 9pt; letter-spacing: 0.25em; text-transform: uppercase; color: #d4a843; margin-bottom: 16px; }
  .cover-title { font-family: 'Playfair Display', serif; font-size: 36pt; font-weight: 700; color: #050608; line-height: 1.1; margin-bottom: 20px; }
  .cover-wallet { font-family: 'DM Mono', monospace; font-size: 10pt; color: #444; margin-bottom: 32px; word-break: break-all; }
  .risk-badge { display: inline-block; padding: 10px 24px; background: ${riskColor}; color: white; font-family: 'DM Mono', monospace; font-size: 10pt; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; }
  .cover-footer { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 20px; border-top: 1px solid #ddd; }
  .cover-footer-left { font-family: 'DM Mono', monospace; font-size: 8pt; color: #999; line-height: 1.6; }
  .confidential { font-family: 'DM Mono', monospace; font-size: 8pt; letter-spacing: 0.2em; text-transform: uppercase; color: #c0392b; border: 1px solid #c0392b; padding: 4px 12px; opacity: 0.6; }
  .page { padding: 60px; page-break-after: always; }
  .page-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 2px solid #050608; margin-bottom: 40px; font-family: 'DM Mono', monospace; font-size: 9pt; color: #666; }
  .page-header-right { color: #d4a843; }
  h2 { font-family: 'Playfair Display', serif; font-size: 16pt; font-weight: 700; color: #050608; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e8e8e8; }
  h2 span { font-family: 'DM Mono', monospace; font-size: 9pt; color: #d4a843; letter-spacing: 0.15em; text-transform: uppercase; font-weight: 400; display: block; margin-bottom: 6px; }
  p { font-size: 11pt; line-height: 1.75; color: #2c2c3e; margin-bottom: 16px; }
  .risk-box { background: #f9f8f6; border: 1px solid #e0ddd6; border-left: 4px solid ${riskColor}; padding: 24px 28px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center; }
  .risk-num { font-family: 'DM Mono', monospace; font-size: 48pt; font-weight: 500; color: ${riskColor}; line-height: 1; }
  .risk-label { font-family: 'DM Mono', monospace; font-size: 9pt; letter-spacing: 0.15em; text-transform: uppercase; color: #888; margin-top: 4px; }
  .risk-level { font-family: 'Playfair Display', serif; font-size: 20pt; color: ${riskColor}; font-weight: 600; }
  .metrics-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1px; background: #e0ddd6; margin-bottom: 32px; }
  .metric-cell { background: #fff; padding: 16px 20px; }
  .metric-key { font-family: 'DM Mono', monospace; font-size: 7pt; letter-spacing: 0.15em; text-transform: uppercase; color: #999; margin-bottom: 4px; }
  .metric-val { font-family: 'DM Mono', monospace; font-size: 12pt; color: #1a1a2e; font-weight: 500; }
  .finding { border: 1px solid #e8e8e8; border-left: 3px solid; padding: 16px 20px; margin-bottom: 12px; page-break-inside: avoid; }
  .finding-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .finding-title { font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 11pt; color: #050608; }
  .severity-pill { font-family: 'DM Mono', monospace; font-size: 7pt; letter-spacing: 0.15em; text-transform: uppercase; padding: 2px 8px; border-radius: 2px; white-space: nowrap; }
  .finding-text { font-size: 10pt; color: #555; line-height: 1.6; }
  .page-footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; }
  .page-footer span { font-family: 'DM Mono', monospace; font-size: 8pt; color: #bbb; }
  .disclaimer { background: #f5f4f2; border: 1px solid #ddd; padding: 20px; font-size: 9pt; color: #777; line-height: 1.6; margin-top: 40px; }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-header">
    <div class="logo">TRA<span>C</span>R</div>
    <div class="cover-meta">
      Report ID: ${reportId}<br>
      Prepared for: ${clientName}<br>
      Date: ${date}<br>
      Network: ${network || 'Ethereum'}
    </div>
  </div>
  <div class="cover-body">
    <div class="cover-label">Blockchain Forensic Intelligence</div>
    <div class="cover-title">On-Chain<br>Forensic<br>Report</div>
    <div class="cover-wallet">Target: ${wallet}</div>
    <div class="risk-badge">Risk Level: ${risk.level} — ${risk.score}/100</div>
  </div>
  <div class="cover-footer">
    <div class="cover-footer-left">
      TRACR Intelligence Platform<br>
      Generated using automated blockchain analysis combined with AI-assisted interpretation.<br>
      For professional legal and compliance use only.
    </div>
    <div class="confidential">Confidential</div>
  </div>
</div>

<div class="page">
  <div class="page-header">
    <div>TRACR // ${reportId} // CONFIDENTIAL</div>
    <div class="page-header-right">Section 1 — Executive Summary</div>
  </div>
  <h2><span>01 — Executive Summary</span>Assessment Overview</h2>
  <div class="risk-box">
    <div>
      <div class="risk-num">${risk.score}</div>
      <div class="risk-label">Risk Score / 100</div>
    </div>
    <div style="text-align:right">
      <div class="risk-level">${risk.level} Risk</div>
      <div style="font-family:'DM Mono',monospace;font-size:9pt;color:#888;margin-top:8px">
        ${risk.metrics.totalTransactions} transactions analyzed<br>
        ${risk.metrics.uniqueCounterparties} unique counterparties
      </div>
    </div>
  </div>
  <p>${content.executiveSummary}</p>
  <div class="metrics-grid">
    <div class="metric-cell"><div class="metric-key">Total Transactions</div><div class="metric-val">${risk.metrics.totalTransactions.toLocaleString()}</div></div>
    <div class="metric-cell"><div class="metric-key">Unique Counterparties</div><div class="metric-val">${risk.metrics.uniqueCounterparties.toLocaleString()}</div></div>
    <div class="metric-cell"><div class="metric-key">Peak Activity</div><div class="metric-val">${risk.metrics.maxTxPerDay} tx/day</div></div>
    <div class="metric-cell"><div class="metric-key">Volume (ETH)</div><div class="metric-val">${risk.metrics.totalVolumeETH.toFixed(3)}</div></div>
    <div class="metric-cell"><div class="metric-key">First Activity</div><div class="metric-val" style="font-size:9pt">${risk.metrics.firstSeen.split('T')[0]}</div></div>
    <div class="metric-cell"><div class="metric-key">Last Activity</div><div class="metric-val" style="font-size:9pt">${risk.metrics.lastSeen.split('T')[0]}</div></div>
  </div>
  <div class="page-footer"><span>TRACR Intelligence // Confidential // ${reportId}</span><span>${date}</span></div>
</div>

<div class="page">
  <div class="page-header">
    <div>TRACR // ${reportId} // CONFIDENTIAL</div>
    <div class="page-header-right">Section 2 — Findings & Behavioral Analysis</div>
  </div>
  <h2><span>02 — Key Findings</span>Detected Risk Indicators</h2>
  ${risk.flags.map(f => `
  <div class="finding" style="border-left-color:${severityColors[f.severity] || '#999'}">
    <div class="finding-header">
      <div class="finding-title">${f.title}</div>
      <div class="severity-pill" style="background:${severityColors[f.severity]}22;color:${severityColors[f.severity]}">${f.severity.toUpperCase()}</div>
    </div>
    <div class="finding-text">${f.description}</div>
  </div>`).join('')}
  <h2 style="margin-top:32px"><span>03 — Behavioral Analysis</span>Transaction Pattern Assessment</h2>
  <p>${content.behavioralAnalysis}</p>
  <div class="page-footer"><span>TRACR Intelligence // Confidential // ${reportId}</span><span>${date}</span></div>
</div>

<div class="page">
  <div class="page-header">
    <div>TRACR // ${reportId} // CONFIDENTIAL</div>
    <div class="page-header-right">Section 3 — Risk & Legal Context</div>
  </div>
  <h2><span>04 — Risk Interpretation</span>Practical Assessment</h2>
  <p>${content.riskInterpretation}</p>
  <h2><span>05 — Legal & Compliance Context</span>Regulatory Considerations</h2>
  <p>${content.legalComplianceContext}</p>
  <h2><span>06 — Methodology & Limitations</span>Data Scope</h2>
  <p>${content.limitations}</p>
  <p>Analysis conducted using on-chain data from public blockchain records via Etherscan. Risk heuristics include: transaction volume analysis, counterparty pattern recognition, temporal behavior analysis, and cross-reference against known high-risk address clusters. Data sources: Etherscan, OFAC SDN list, on-chain heuristics. This report does not represent legal advice.</p>
  <h2><span>07 — Conclusion</span>Preliminary Assessment</h2>
  <p>${content.conclusion}</p>
  <div class="disclaimer">
    <strong>Disclaimer:</strong> This report is generated by TRACR Intelligence using automated blockchain analysis tools and AI-assisted interpretation. It is intended for informational and professional reference purposes only. This report does not constitute legal advice, nor does it represent a definitive finding of illicit activity. All findings are expressed as risk indicators only. Recipients are advised to consult qualified legal counsel before taking any action based on this report. Not legal advice.
  </div>
  <div class="page-footer"><span>TRACR Intelligence // Confidential // ${reportId}</span><span>© TRACR Intelligence ${new Date().getFullYear()}</span></div>
</div>

</body>
</html>`
}
