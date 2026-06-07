import type { AgentRunRecord, PitchDraft } from './types'

const PITCH_TEMPLATES = {
  initial: {
    subject: (signal: string) => `Quick question about ${signal}`,
    body: (params: { signal: string; pain: string; outcome: string; company: string }) =>
      `Hi,\n\nSaw ${params.signal} at ${params.company}. Looks like ${params.pain}.\n\nI build AI systems that turn that into ${params.outcome} — no IT department needed.\n\nWorth a quick 10-minute look?\n\nBest,\nMoses\nBizLegal AI\nhttps://bizlegal-ai.com`,
  },
  followup_1: {
    subject: (signal: string) => `Re: ${signal} — one more angle`,
    body: (params: { pain: string; cost: string; company: string }) =>
      `Hi again,\n\nQuick follow-up on my note about ${params.pain} at ${params.company}.\n\nMost firms in your space spend ${params.cost} on this manually. Our clients cut that by 60-80% with automated compliance checks.\n\nHappy to show you in under 10 minutes — no pitch, just a demo.\n\nMoses`,
  },
  followup_2: {
    subject: () => 'Last note',
    body: (params: { pain: string }) =>
      `Hi,\n\nLast note on this — if ${params.pain} isn't a priority right now, totally understand.\n\nIf it becomes one, our AI compliance tools are here: https://docai.bizlegal-ai.com\n\nNo hard feelings either way.\n\nMoses`,
  },
}

export function draftColdPitch(lead: {
  email: string
  name?: string
  company: string
  signal: string
  pain: string
  outcome: string
}): PitchDraft {
  const t = PITCH_TEMPLATES.initial
  return {
    lead_email: lead.email,
    lead_name: lead.name,
    company: lead.company,
    subject: t.subject(lead.signal),
    body: t.body({ signal: lead.signal, pain: lead.pain, outcome: lead.outcome, company: lead.company }),
    pitch_variant: 'initial',
  }
}

export function draftFollowUp(
  lead: { email: string; company: string; pain: string; cost?: string },
  variant: 'followup_1' | 'followup_2'
): PitchDraft {
  if (variant === 'followup_1') {
    const t = PITCH_TEMPLATES.followup_1
    return {
      lead_email: lead.email,
      company: lead.company,
      subject: t.subject(lead.pain),
      body: t.body({ pain: lead.pain, cost: lead.cost || '$50K+/year', company: lead.company }),
      pitch_variant: 'followup_1',
    }
  }
  const t = PITCH_TEMPLATES.followup_2
  return {
    lead_email: lead.email,
    company: lead.company,
    subject: t.subject(),
    body: t.body({ pain: lead.pain }),
    pitch_variant: 'followup_2',
  }
}

export function buildRunRecord(action: string, status: 'success' | 'failed' | 'skipped', email?: string, details?: Record<string, unknown>): AgentRunRecord {
  return { agent_name: 'lead_commander', workflow_id: 'WF-1', action, status, target_email: email, details }
}

export const NURTURE_TEMPLATES = {
  education: {
    subject: '3 compliance gaps costing companies $1M+',
    prompt: 'Write a 150-word educational email about the top 3 compliance gaps that cost B2B SaaS companies significant fines. Reference GDPR Article 83, SOC 2 trust criteria, and AI Act penalties. End with a soft CTA to try a free AI compliance scan.',
  },
  comparison: {
    subject: 'Why manual compliance review costs 10x what we charge',
    prompt: 'Write a 150-word comparison email showing the cost of manual compliance review ($200-500/hr attorney time, 20-40 hours per audit) vs AI-assisted ($99/mo, 15-minute scans). Include a specific example. End with a CTA to start a free trial.',
  },
  last_call: {
    subject: 'Your free scan expires in 48h',
    prompt: 'Write a 100-word urgency email. The user did a free compliance scan but never upgraded. Their scan results expire in 48 hours. Mention the key risks found. CTA: upgrade now to keep your report and get ongoing monitoring.',
  },
}
