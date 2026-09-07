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

/**
 * WHERE A DEADLINE COMES FROM. Every task must declare this, because the
 * counting rule follows the source and nothing else.
 *
 * - `statutory`   the Act or regulations fix it. Counted per the general
 *                 interpretation rules; days are NOT silently business days.
 * - `contractual` the sale agreement fixes it. Counted per the agreement's own
 *                 wording — if it says "ימים" it is not "ימי עסקים".
 * - `operational` a customary working period. Not a legal obligation.
 * - `third_party` derived from a bank, registry, RMI or management company.
 *                 An ESTIMATE of handling time, never a legal deadline.
 * - `judgment`    cannot be fixed without reading the agreement, the state of
 *                 title or the applicable law.
 */
export type DeadlineSource = 'statutory' | 'contractual' | 'operational' | 'third_party' | 'judgment'

/**
 * How a computed date was reached — stored WITH the date, never discarded.
 *
 * A system that keeps only the result presents a derived date as if it were a
 * legal fact. Keeping the chain means anyone can see the date came from a rule
 * applied to a trigger under a named calendar, and can challenge any link.
 */
export interface DateProvenance {
  readonly trigger: string
  readonly rule: string
  readonly durationDays: number
  readonly dayType: DayType
  readonly calendarId: string
  readonly result: string
  readonly source: DeadlineSource
}

export interface TaskSpec {
  readonly key: string
  /**
   * i18n key, resolved by the consuming app's dictionaries.
   *
   * Exactly one of `labelKey` and `labelText` is set. A template written for a
   * market the app translates (Israel) carries a key; one whose language IS the
   * deal's language (the US set, which is English by definition) carries the
   * text, so 44 US task labels do not have to be pointlessly translated into
   * Hebrew to satisfy a type.
   */
  readonly labelKey?: string
  /** Literal label, for templates whose own language is the deal's language. */
  readonly labelText?: string
  readonly phase: string
  readonly assigneeRole: string
  /** Which anchor date the offset counts from, e.g. signing or closing. */
  /** Which anchor the offset counts from. Absent when nothing anchors it. */
  readonly anchor?: string
  /** Days relative to the anchor. Negative = before. */
  readonly offset?: number
  readonly dayType?: DayType
  /** Where the obligation comes from. Determines how it may be counted. */
  readonly source: DeadlineSource
  /**
   * MAY A DATE BE COMPUTED FOR THIS TASK AT ALL? Default NO.
   *
   * Inverted deliberately. Consideration payments, the final payment, handover
   * of possession, discharge of the seller's mortgage, anything an authority
   * controls, and anything whose trigger is not unambiguous must never be
   * auto-dated — those dates come from the agreement or from a person, and a
   * computed guess presented next to a real date is indistinguishable from one.
   */
  readonly autoDate?: boolean
  /** Surfaced as "review with your counsel" — for judgment, not admin steps. */
  readonly legalReview?: boolean
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
  readonly labelKey: string | null
  readonly labelText: string | null
  readonly phase: string
  readonly assigneeRole: string
  readonly anchor: string | null
  readonly offset: number | null
  readonly dayType: DayType | null
  readonly source: DeadlineSource
  readonly legalReview: boolean
  /** ISO date, or null. Null whenever a date may not be computed. */
  readonly dueDate: string | null
  /** How the date was reached. Null when there is no computed date. */
  readonly provenance: DateProvenance | null
  /** Why there is no date, when there is none. */
  readonly noDateReason: 'no_auto_date' | 'missing_anchor' | 'no_offset' | null
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

function dueDateFor(spec: TaskSpec & { dayType: DayType }, anchorDate: Date, cal: Calendar): Date {
  if (spec.dayType === 'calendar') {
    const raw = addCalendarDays(anchorDate, spec.offset ?? 0)
    return spec.rollIfNonWorking === 'forward' ? rollForwardToWorkingDay(raw, cal) : raw
  }
  return addBusinessDays(anchorDate, spec.offset ?? 0, cal)
}

function base(spec: TaskSpec): MaterialisedTask {
  return {
    key: spec.key,
    labelKey: spec.labelKey ?? null,
    labelText: spec.labelKey ? null : (spec.labelText ?? spec.key),
    phase: spec.phase,
    assigneeRole: spec.assigneeRole,
    anchor: spec.anchor ?? null,
    offset: spec.offset ?? null,
    dayType: spec.dayType ?? null,
    source: spec.source,
    legalReview: spec.legalReview ?? false,
    dueDate: null,
    provenance: null,
    noDateReason: null,
    statutory: spec.source === 'statutory',
    placeholder: spec.placeholder ?? false,
    note: spec.note,
  }
}

/**
 * Date every task in a template against the room's anchor dates.
 *
 * THE DEFAULT IS NO DATE. A task is computed only when it opts in with
 * `autoDate: true` AND supplies an anchor and an offset. Everything else comes
 * back with a null date and a reason, because a date this engine invented and a
 * date taken from the agreement look identical once they are on the screen.
 *
 * What may be computed: statutory reporting deadlines, internal follow-ups,
 * operational targets, and dates derived from an unambiguous contractual term.
 * What may not: the consideration payments, the final payment, handover of
 * possession, discharge of the seller's mortgage, anything an authority
 * controls, and anything whose trigger is open to reading.
 *
 * Pure, and ungated on review status — the banner is the app's job.
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
    const row = base(spec)

    if (spec.autoDate !== true) return { ...row, noDateReason: 'no_auto_date' }
    if (spec.offset === undefined || !spec.anchor) return { ...row, noDateReason: 'no_offset' }

    const anchorIso = anchors[spec.anchor]
    const anchorDate = anchorIso ? parseIsoDateUtc(anchorIso) : null
    if (!anchorDate) {
      missingAnchors.add(spec.anchor)
      return { ...row, noDateReason: 'missing_anchor' }
    }

    const dayType: DayType = spec.dayType ?? 'calendar'
    const due = dueDateFor({ ...spec, dayType }, anchorDate, cal)
    if (dayType === 'business' && !coversDate(due, cal)) uncoveredYear = true

    const result = toIsoDate(due)
    return {
      ...row,
      dayType,
      dueDate: result,
      // Trigger → Rule → Duration → Calendar → Result → Source, kept together.
      provenance: {
        trigger: `${spec.anchor}=${anchorIso}`,
        rule: spec.note ?? spec.key,
        durationDays: spec.offset,
        dayType,
        calendarId: cal.id,
        result,
        source: spec.source,
      },
    }
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
