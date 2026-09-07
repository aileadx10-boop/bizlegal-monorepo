/**
 * The template registry: every jurisdiction the product can open a room for.
 *
 * `reviewed` is now INFORMATIONAL, not a gate. It drives the banner every party
 * sees ("these dates are a draft"), and it no longer stops a room being created
 * — the founder's call, 2026-09-07: a broker who wants the checklist should get
 * the checklist, with the caveat visible, rather than an error.
 *
 * The banner is not decoration. It is the difference between a tool that says
 * what it knows and one that implies more certainty than it has.
 */

import { IL_RESIDENTIAL_TASKS } from './il-residential.js'
import { US_TEMPLATES } from './us-residential.js'
import { IL_REGISTRATION_TEMPLATES } from './il-registration.js'
import type { TaskTemplate } from '../tasks.js'

export * from './il-residential.js'
export * from './us-residential.js'
export * from './il-registration.js'

export const TEMPLATES: Readonly<Record<string, TaskTemplate>> = {
  [IL_RESIDENTIAL_TASKS.id]: IL_RESIDENTIAL_TASKS,
  ...IL_REGISTRATION_TEMPLATES,
  ...US_TEMPLATES,
}

export function getTemplate(id: string): TaskTemplate | undefined {
  return TEMPLATES[id]
}

/** Ids a UI can offer, with the label and review state it must show alongside. */
export function listTemplates(): Array<{ id: string; jurisdiction: string; reviewed: boolean; tasks: number }> {
  return Object.values(TEMPLATES).map((t) => ({
    id: t.id,
    jurisdiction: t.jurisdiction,
    reviewed: t.reviewed,
    tasks: t.tasks.length,
  }))
}
