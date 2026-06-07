export type AgentName = 'lead_commander' | 'deal_closer' | 'newsletter_engine' | 'partner_seeder' | 'boi_hunter'

export type WorkflowId = 'WF-1' | 'WF-2' | 'WF-3' | 'WF-4' | 'WF-5' | 'WF-6' | 'WF-7' | 'WF-8' | 'WF-9' | 'WF-10'

export interface AgentRunRecord {
  agent_name: AgentName
  workflow_id: WorkflowId
  action: string
  status: 'success' | 'failed' | 'skipped'
  details?: Record<string, unknown>
  target_email?: string
}

export interface PitchDraft {
  lead_email: string
  lead_name?: string
  company?: string
  subject: string
  body: string
  pitch_variant: 'initial' | 'followup_1' | 'followup_2'
}

export interface AgentConfig {
  name: AgentName
  enabled: boolean
  autonomy_level: 'L1' | 'L2' | 'L3' | 'L4'
  cron_schedule?: string
  kill_switch: { metric: string; threshold: number; window_days: number }
}

export const AGENT_CONFIGS: AgentConfig[] = [
  {
    name: 'lead_commander',
    enabled: true,
    autonomy_level: 'L2',
    cron_schedule: '0 9 * * *',
    kill_switch: { metric: 'pitches_without_reply', threshold: 30, window_days: 14 },
  },
  {
    name: 'deal_closer',
    enabled: true,
    autonomy_level: 'L1',
    cron_schedule: '0 10 * * 1',
    kill_switch: { metric: 'outreach_without_response', threshold: 10, window_days: 21 },
  },
  {
    name: 'newsletter_engine',
    enabled: true,
    autonomy_level: 'L3',
    cron_schedule: '0 7 * * 2,4',
    kill_switch: { metric: 'open_rate_below', threshold: 10, window_days: 14 },
  },
  {
    name: 'partner_seeder',
    enabled: true,
    autonomy_level: 'L1',
    cron_schedule: '0 10 * * 3',
    kill_switch: { metric: 'outreach_without_signed', threshold: 15, window_days: 30 },
  },
  {
    name: 'boi_hunter',
    enabled: true,
    autonomy_level: 'L3',
    cron_schedule: '0 6 * * *',
    kill_switch: { metric: 'content_without_sale', threshold: 20, window_days: 30 },
  },
]
