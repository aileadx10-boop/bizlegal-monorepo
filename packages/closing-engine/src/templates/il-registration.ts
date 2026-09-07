/**
 * Israel — the registration route is a separate axis from the sale itself.
 *
 * The practitioner was explicit: the Tabu checklist must never be applied
 * automatically to an RMI property or one held through a management company.
 * The reason is not filing tidiness. The source of the right, the body that
 * administers it and the documents required all differ, and an RMI transfer
 * carries further conditions of its own — lease validity, arrears, and whether
 * the transfer can be effected at all.
 *
 * So the route is chosen per deal, and the variants add their own tasks on top
 * of the shared sale template rather than replacing it.
 */

import type { TaskSpec, TaskTemplate } from '../tasks.js'
import { IL_PHASES, IL_ROLES, IL_RESIDENTIAL_TASKS } from './il-residential.js'

/** Registered ownership in the Land Registry. The base case. */
const TABU: readonly TaskSpec[] = []

/** Israel Land Authority leasehold. */
const RMI: readonly TaskSpec[] = [
  { key: 'rmi_lease_validity_checked', labelKey: 'task.il.rmi_lease_validity_checked', phase: 'pre_contract', assigneeRole: 'buyer_lawyer', source: 'judgment', legalReview: true,
    note: 'Term remaining, capitalisation, and whether the right can be transferred at all.' },
  { key: 'rmi_arrears_checked', labelKey: 'task.il.rmi_arrears_checked', phase: 'clearances', assigneeRole: 'seller_lawyer', source: 'third_party', legalReview: true },
  { key: 'rmi_transfer_approval', labelKey: 'task.il.rmi_transfer_approval', phase: 'registration', assigneeRole: 'buyer_lawyer', source: 'third_party', legalReview: true,
    note: 'Authority-controlled. Handling time is an estimate and never a legal deadline.' },
]

/** Rights held through a housing management company. */
const MANAGEMENT_COMPANY: readonly TaskSpec[] = [
  { key: 'company_rights_confirmation', labelKey: 'task.il.company_rights_confirmation', phase: 'pre_contract', assigneeRole: 'buyer_lawyer', source: 'third_party', legalReview: true },
  { key: 'company_transfer_documents', labelKey: 'task.il.company_transfer_documents', phase: 'registration', assigneeRole: 'seller_lawyer', source: 'third_party', legalReview: true },
  { key: 'company_registration_completed', labelKey: 'task.il.company_registration_completed', phase: 'registration', assigneeRole: 'buyer_lawyer', source: 'third_party', legalReview: true },
]

function variant(id: string, extra: readonly TaskSpec[]): TaskTemplate {
  return {
    ...IL_RESIDENTIAL_TASKS,
    id,
    version: 2,
    roles: [...IL_ROLES],
    phases: [...IL_PHASES],
    tasks: [...IL_RESIDENTIAL_TASKS.tasks, ...extra],
  }
}

export const IL_REGISTRATION_TEMPLATES: Readonly<Record<string, TaskTemplate>> = {
  'il-residential-tabu': variant('il-residential-tabu', TABU),
  'il-residential-rmi': variant('il-residential-rmi', RMI),
  'il-residential-management-company': variant('il-residential-management-company', MANAGEMENT_COMPANY),
  'il-residential-rmi-management-company': variant('il-residential-rmi-management-company', [
    ...RMI,
    ...MANAGEMENT_COMPANY,
  ]),
}
