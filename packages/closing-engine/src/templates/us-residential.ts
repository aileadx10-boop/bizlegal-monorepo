/**
 * United States — the four transaction types, as TaskTemplates.
 *
 * DERIVED, NOT RETYPED. These are generated at module load from
 * `us/checklist-templates.ts`, the same 44 tasks CloseFlow and LeaseParse have
 * always used. Copying them into a second literal would have created exactly
 * the drift this package was made to end: two lists that agree today and
 * disagree after the first edit.
 *
 * Labels are literal English text rather than i18n keys. The Israeli template
 * carries keys because the app translates it; a US deal is conducted in English
 * by definition, so translating 44 US labels into Hebrew to satisfy a type
 * would be work that no user ever sees.
 *
 * ⚠️ `reviewed: false`, and for a different reason than the Israeli template.
 * The Israeli one is unreviewed because the questions have not been answered
 * yet. These are unreviewed because **nobody here is admitted in any US state**.
 * The offsets are common contract practice, not a rule of any jurisdiction, and
 * `applyJurisdictionOverrides` is still a pass-through — attorney-closing
 * states, transfer-tax filings, wet-vs-dry funding and state holidays are all
 * unmodelled. A room may still use them, but only when the person creating it
 * acknowledges that explicitly, and every party sees the banner.
 */

import { BASE_TEMPLATES, type ChecklistTask } from '../us/checklist-templates.js'
import { TRANSACTION_TYPES, type TransactionType } from '../us/date-calculator.js'
import type { TaskSpec, TaskTemplate } from '../tasks.js'

/** The US checklist assigns to these five; there is no lawyer role in it. */
const US_ROLES = ['buyer', 'seller', 'agent', 'lender', 'title'] as const
const US_PHASES = ['contract', 'diligence', 'financing', 'closing', 'post_closing'] as const

/**
 * Statutory US deadlines that are CALENDAR days, keyed by task.
 *
 * The 1031 identification and completion windows run 45 and 180 calendar days
 * from the relinquished closing by statute — they carry no weekend or holiday
 * extension, and routing them through business-day maths destroys a client's
 * tax deferral. `deriveDeadlines` already treats them correctly; this keeps the
 * template in step.
 */
const CALENDAR_DAY_TASKS: Readonly<Record<string, true>> = {
  identification_sent: true,
  rescission_ends: true,
}

function toSpec(task: ChecklistTask): TaskSpec {
  const isCalendar = CALENDAR_DAY_TASKS[task.key] === true
  return {
    key: task.key,
    labelText: task.label,
    phase: task.phase,
    assigneeRole: task.assignee,
    anchor: 'closing',
    offset: task.offsetBusinessDays,
    dayType: isCalendar ? 'calendar' : 'business',
    // Common contract practice, not a rule of any jurisdiction — so
    // 'operational' rather than 'statutory', except the two statutory 1031
    // windows. Dates are computed here because the US set is a working
    // checklist whose offsets are conventional and openly marked as drafts.
    source: isCalendar ? 'statutory' : 'operational',
    autoDate: true,
    placeholder: true,
  }
}

function templateFor(type: TransactionType): TaskTemplate {
  return {
    id: `us-${type.replace(/_/g, '-')}`,
    jurisdiction: 'US',
    version: 1,
    roles: [...US_ROLES],
    phases: [...US_PHASES],
    anchors: ['closing'],
    tasks: BASE_TEMPLATES[type].map(toSpec),
    reviewed: false,
  }
}

export const US_TEMPLATES: Readonly<Record<string, TaskTemplate>> = Object.fromEntries(
  TRANSACTION_TYPES.map((type) => {
    const template = templateFor(type)
    return [template.id, template]
  }),
)
