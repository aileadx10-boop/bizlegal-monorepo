/**
 * Task templates and materialisation.
 *
 * A template is DATA: plain, JSON-serialisable, no functions. That is
 * deliberate — WORKFLOW44 (phase 3) turns templates into rows in a table with
 * an editor over them, and that only stays a UI change if nothing here needs
 * code to describe a workflow. Hence `phase`, `assigneeRole` and `anchor` are
 * free strings validated at the API boundary against the template's own
 * declared lists, never by a database CHECK constraint.
 *
 * Labels are i18n KEYS, not text. A Hebrew room and an English room render the
 * same template.
 */

import {
  addBusinessDays,
  addCalendarDays,
  coversDate,
  parseIsoDateUtc,
  rollForwardToWorkingDay,
  toIsoDate,
  type Calendar,
} from './calendar.js'

/**
 * Business days follow the working week. Calendar days do not.
 *
 * This distinction is the whole reason the type exists: an Israeli purchase-tax
 * declaration runs on CALENDAR days from signing, while a contractual milestone
 * like registering the caveat runs on working days. Routing a statutory
 * calendar deadline through business-day maths silently buys the client days
 * they do not have. The same trap exists in the US engine's 1031 45/180-day
 * dates, which are statutory calendar days.
 */
export type DayType = 'business' | 'calendar'

export interface TaskSpec {
  readonly key: string
  /** i18n key, resolved by the consuming app's dictionaries. Never display text. */
  readonly labelKey: string
  readonly phase: string
  readonly assigneeRole: string
  /** Which anchor date the offset counts from, e.g. signing or closing. */
  readonly anchor: string
  /** Days relative to the anchor. Negative = before. */
  readonly offset: number
  readonly dayType: DayType
  /**
   * What happens when a calendar-day deadline lands on a non-working day.
   * 'none' (the default) leaves it — a statutory clock that does not extend.
   * 'forward' rolls to the next working day.
   * Which one applies is a question for the practitioner, not an assumption.
   */
  readonly rollIfNonWorking?: 'none' | 'forward'
  /** True when the deadline comes from statute rather than the contract. */
  readonly statutory?: boolean
  /** True while the offset is a draft the practitioner has not confirmed. */
  readonly placeholder?: boolean
  readonly note?: string
}

export interface TaskTemplate {
  readonly id: string
  readonly jurisdiction: string
  readonly version: number
  readonly roles: readonly string[]
  readonly phases: readonly string[]
  readonly anchors: readonly string[]
  readonly tasks: readonly TaskSpec[]
  /**
   * False until a practising lawyer in this jurisdiction has confirmed every
   * offset. Consuming surfaces MUST refuse to present dates from an unreviewed
   * template — the same contract as JurisdictionPack.reviewed in
   * @bizlegal/deal-engine.
   */
  readonly reviewed: boolean
}

export interface MaterialisedTask {
  readonly key: string
  readonly labelKey: string
  readonly phase: string
  readonly assigneeRole: string
  readonly anchor: string
  readonly offset: number
  readonly dayType: DayType
  /** ISO date, or null when the anchor was not supplied. Never a guess. */
  readonly dueDate: string | null
  readonly statutory: boolean
  readonly placeholder: boolean
  readonly note?: string
}

export interface MaterialiseResult {
  readonly tasks: readonly MaterialisedTask[]
  /**
   * Non-fatal problems the caller must show rather than swallow: an anchor the
   * template wanted but the room did not supply, a business-day date landing in
   * a year the holiday table does not cover, or an unreviewed template.
   */
  readonly warnings: readonly string[]
}

function dueDateFor(spec: TaskSpec, anchorDate: Date, cal: Calendar): Date {
  if (spec.dayType === 'calendar') {
    const raw = addCalendarDays(anchorDate, spec.offset)
    return spec.rollIfNonWorking === 'forward' ? rollForwardToWorkingDay(raw, cal) : raw
  }
  return addBusinessDays(anchorDate, spec.offset, cal)
}

function withoutDate(spec: TaskSpec): MaterialisedTask {
  return {
    key: spec.key,
    labelKey: spec.labelKey,
    phase: spec.phase,
    assigneeRole: spec.assigneeRole,
    anchor: spec.anchor,
    offset: spec.offset,
    dayType: spec.dayType,
    dueDate: null,
    statutory: spec.statutory ?? false,
    placeholder: spec.placeholder ?? false,
    note: spec.note,
  }
}

/**
 * Date every task in a template against the room's anchor dates.
 *
 * Pure, and deliberately ungated: it will happily materialise an unreviewed
 * template, and reports that as a warning. The refusal belongs at the app
 * boundary as a 409, exactly as apps/hub/lib/deal-audit/audit.ts refuses the
 * unreviewed Dubai pack — that keeps this function testable without a fixture
 * pretending to be reviewed.
 *
 * A missing anchor yields a null dueDate plus a warning. It never invents a
 * date, because an invented deadline is worse than a blank one.
 */
export function materialiseTasks(
  template: TaskTemplate,
  anchors: Readonly<Record<string, string>>,
  cal: Calendar,
): MaterialiseResult {
  const warnings: string[] = []
  const missingAnchors = new Set<string>()
  let uncoveredYear = false

  const tasks = template.tasks.map((spec): MaterialisedTask => {
    const anchorIso = anchors[spec.anchor]
    const anchorDate = anchorIso ? parseIsoDateUtc(anchorIso) : null

    if (!anchorDate) {
      missingAnchors.add(spec.anchor)
      return withoutDate(spec)
    }

    const due = dueDateFor(spec, anchorDate, cal)
    if (spec.dayType === 'business' && !coversDate(due, cal)) uncoveredYear = true

    return { ...withoutDate(spec), dueDate: toIsoDate(due) }
  })

  for (const anchor of missingAnchors) warnings.push(`missing_anchor:${anchor}`)
  if (uncoveredYear) warnings.push('holidays_not_configured')
  if (!template.reviewed) warnings.push('template_not_reviewed')

  const sorted = [...tasks].sort((a, b) => {
    if (a.dueDate === null && b.dueDate === null) return 0
    if (a.dueDate === null) return 1
    if (b.dueDate === null) return -1
    return a.dueDate.localeCompare(b.dueDate)
  })

  return { tasks: sorted, warnings }
}

/** Validate a role/phase/anchor string against what the template declares. */
export function templateAccepts(
  template: TaskTemplate,
  field: 'roles' | 'phases' | 'anchors',
  value: string,
): boolean {
  return template[field].includes(value)
}
