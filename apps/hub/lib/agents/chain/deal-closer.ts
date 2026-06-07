import type { AgentRunRecord } from './types'

export interface PartnerProspect {
  name: string
  email: string
  type: 'realtor' | 'consultant' | 'legal_tech' | 'accounting'
  jurisdiction: string
  signal: string
}

export function draftPartnerOutreach(prospect: PartnerProspect): {
  subject: string
  body: string
} {
  const TYPE_ANGLES: Record<string, string> = {
    realtor: 'Your clients doing cross-border property deals need compliance clearance before closing.',
    consultant: 'Your compliance advisory clients need automated monitoring between engagements.',
    legal_tech: 'Your platform users could get AI-powered compliance reports as a value-add.',
    accounting: 'Your audit clients need continuous compliance monitoring, not just annual reviews.',
  }

  const angle = TYPE_ANGLES[prospect.type] || TYPE_ANGLES.consultant

  return {
    subject: `Partnership opportunity — BizLegal AI × ${prospect.name}`,
    body: `Hi,\n\n${angle}\n\nBizLegal AI offers automated compliance-as-a-service across GDPR, SOC 2, AI Act, and 4 other frameworks. We pay referral partners a finder's fee on every conversion.\n\nOur typical deal: ${prospect.type === 'realtor' ? '$15-25K per cross-border close' : '10-15% ongoing revenue share on client subscriptions'}.\n\nWorth a 15-minute call to see if there's a fit?\n\nBest,\nMoses\nBizLegal AI\nhttps://bizlegal-ai.com/partners`,
  }
}

export function buildDealRunRecord(action: string, status: 'success' | 'failed' | 'skipped', email?: string, details?: Record<string, unknown>): AgentRunRecord {
  return { agent_name: 'deal_closer', workflow_id: 'WF-5', action, status, target_email: email, details }
}
