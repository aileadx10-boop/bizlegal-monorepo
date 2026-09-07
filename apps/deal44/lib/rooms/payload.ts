/**
 * Shape a resolved room for the client.
 *
 * Two things happen here and nowhere else, so the page and the API can never
 * disagree about them:
 *
 * 1. `days_until` is recomputed on every read rather than stored. A stored
 *    countdown is wrong by definition the next morning.
 * 2. Token hashes and party emails are dropped. The room shows names and roles;
 *    it never ships one party's contact details to another party's browser.
 */

import { daysUntil, getTemplate } from '@bizlegal/closing-engine'
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n/types'
import type { ResolvedRoom } from './create'
import type { TaskRow } from '@/lib/db'

export interface RoomPayloadDto {
  title: string
  locale: Locale
  anchors: Record<string, string>
  phases: string[]
  warnings: string[]
  party: { id: string; role: string; display_name: string; locale: Locale }
  parties: Array<{ id: string; role: string; display_name: string }>
  tasks: Array<{
    id: string
    key: string
    label_key: string | null
    label_text: string | null
    phase: string
    assignee_role: string
    due_date: string | null
    days_until: number | null
    statutory: boolean
    status: string
    completed_at: string | null
  }>
}

const FALLBACK_PHASES = ['contract', 'tax', 'financing', 'clearances', 'delivery', 'registration']

function asLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE
}

function daysFor(task: TaskRow, now: Date): number | null {
  if (!task.due_date) return null
  const due = new Date(`${task.due_date}T00:00:00.000Z`)
  if (Number.isNaN(due.getTime())) return null
  return daysUntil(due, now)
}

export function buildRoomPayload(resolved: ResolvedRoom, now: Date = new Date()): RoomPayloadDto {
  const { deal, party, parties, tasks } = resolved
  const template = deal.template_id ? getTemplate(deal.template_id) : undefined

  // Warnings the room must show rather than swallow. An unreviewed template
  // means the dates are a working list, not deadlines — the user is told so.
  const warnings: string[] = []
  if (template && !template.reviewed) warnings.push('template_not_reviewed')
  if (template) {
    for (const anchor of template.anchors) {
      if (!deal.anchors?.[anchor]) warnings.push(`missing_anchor:${anchor}`)
    }
  }

  const phases = template ? [...template.phases] : FALLBACK_PHASES

  return {
    title: deal.title ?? '',
    locale: asLocale(deal.locale),
    anchors: deal.anchors ?? {},
    phases,
    warnings,
    party: {
      id: party.id,
      role: party.role,
      display_name: party.display_name,
      locale: asLocale(party.locale),
    },
    parties: parties.map((p) => ({ id: p.id, role: p.role, display_name: p.display_name })),
    tasks: tasks
      .filter((task) => task.status !== 'dismissed')
      .map((task) => ({
        id: task.id,
        key: task.key,
        label_key: task.label_key,
        label_text: task.label_text,
        phase: task.phase,
        assignee_role: task.assignee_role,
        due_date: task.due_date,
        days_until: daysFor(task, now),
        statutory: task.statutory,
        status: task.status,
        completed_at: task.completed_at,
      })),
  }
}
