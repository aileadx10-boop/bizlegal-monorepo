// CRM types and helpers — formerly in lib/supabase.ts

export type Stage = 'lead' | 'engaged' | 'drafting' | 'review' | 'signed' | 'closed_won' | 'closed_lost'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type ActivityType = 'note' | 'email' | 'call' | 'meeting' | 'stage_change' | 'document' | 'task'
export type DocStatus = 'draft' | 'sent' | 'signed' | 'archived'

export interface Client {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  country?: string
  industry?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  title: string
  client_id?: string
  stage: Stage
  value: number
  currency: string
  doc_type?: string
  priority: Priority
  deadline?: string
  description?: string
  tags: string[]
  assigned_to?: string
  source?: string
  created_at: string
  updated_at: string
  trcr_clients?: Client
}

export interface Activity {
  id: string
  deal_id: string
  type: ActivityType
  title: string
  body?: string
  created_at: string
}

export interface Document {
  id: string
  deal_id: string
  name: string
  doc_type?: string
  status: DocStatus
  url?: string
  created_at: string
}

export const STAGES: { id: Stage; label: string; color: string; bg: string }[] = [
  { id: 'lead',        label: 'Lead',        color: 'text-slate-600',  bg: 'bg-slate-100' },
  { id: 'engaged',     label: 'Engaged',     color: 'text-blue-600',   bg: 'bg-blue-50' },
  { id: 'drafting',    label: 'Drafting',    color: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'review',      label: 'In Review',   color: 'text-amber-600',  bg: 'bg-amber-50' },
  { id: 'signed',      label: 'Signed',      color: 'text-emerald-600',bg: 'bg-emerald-50' },
  { id: 'closed_won',  label: 'Closed Won',  color: 'text-green-700',  bg: 'bg-green-100' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'text-red-600',    bg: 'bg-red-50' },
]

export const PRIORITY_CONFIG: Record<Priority, { label: string; dot: string }> = {
  low:    { label: 'Low',    dot: 'bg-slate-400' },
  medium: { label: 'Medium', dot: 'bg-blue-400' },
  high:   { label: 'High',   dot: 'bg-amber-500' },
  urgent: { label: 'Urgent', dot: 'bg-red-500' },
}

export function stageConfig(stage: Stage) {
  return STAGES.find(s => s.id === stage) ?? STAGES[0]
}

export function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(value)
}

export function daysUntil(deadline?: string) {
  if (!deadline) return null
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  return diff
}
