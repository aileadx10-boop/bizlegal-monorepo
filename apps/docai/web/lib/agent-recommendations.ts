export interface AgentRecommendation {
  slug: string
  name: string
  price: string
  reason: string
  href: string
}

interface ReportSummary {
  vertical: string
  risk_level?: string | null
  report_type?: string
}

export function getRecommendations(reports: ReportSummary[]): AgentRecommendation[] {
  const seen = new Set<string>()
  const recs: AgentRecommendation[] = []

  const verticals = new Set(reports.map(r => r.vertical))
  const hasHighRisk = reports.some(r => r.risk_level === 'high' || r.risk_level === 'critical')

  if (verticals.has('ai-act')) {
    add('ai-governance-product', 'AI Governance for Product Teams', '$49/mo', 'Monitor AI Act compliance continuously.')
  }
  if (verticals.has('ai-act') || verticals.has('contract')) {
    add('compliance-monitor-pro', 'Compliance Monitor Pro', '$49/mo', 'Daily framework drift detection across SOC 2, ISO, GDPR.')
  }
  if (verticals.has('contract')) {
    add('dpa-negotiator', 'DPA Negotiator Agent', '$19', 'Auto-compare DPA clauses against regulatory baselines.')
    add('policy-refresh', 'Privacy Policy Auto-Refresh', '$29/mo', 'Daily redline on 7 privacy frameworks.')
  }
  if (verticals.has('immigration') || verticals.has('tech-transfer')) {
    add('boi-tracker', 'BOI Amendment Tracker', '$49/mo', 'Track FinCEN BOI deadlines for your entities.')
  }
  if (verticals.has('tech-transfer')) {
    add('psp-mor-risk', 'PSP & MoR Risk Manager', '$49/mo', 'Pre-flight audit for payment processor compliance.')
  }
  if (hasHighRisk) {
    add('compliance-researcher', 'Compliance Researcher', '$49/mo', 'Deep 50+ jurisdiction regulatory research.')
  }

  return recs.slice(0, 4)

  function add(slug: string, name: string, price: string, reason: string) {
    if (seen.has(slug)) return
    seen.add(slug)
    recs.push({ slug, name, price, reason, href: `https://bizlegal-ai.com/agents/${slug}?ref=conductor` })
  }
}
