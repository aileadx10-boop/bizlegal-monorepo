/**
 * Checklist template engine — the deterministic core of CloseFlow.
 *
 * A checklist is a typed task list per transaction type, dated against
 * the closing date via date-calculator. Jurisdiction overrides (attorney
 * states, transfer-tax filings, holiday calendars) are a stubbed layer
 * to be filled in the build phase from cached Perplexity research.
 */

import { addBusinessDays, type TransactionType } from './date-calculator'

export type ChecklistPhase = 'contract' | 'diligence' | 'financing' | 'closing' | 'post_closing'
export type ChecklistAssignee = 'buyer' | 'seller' | 'agent' | 'lender' | 'title'

export interface ChecklistTask {
  key: string
  label: string
  phase: ChecklistPhase
  /** Business days relative to closing (negative = before). */
  offsetBusinessDays: number
  assignee: ChecklistAssignee
}

export interface DatedChecklistTask extends ChecklistTask {
  dueDate: Date
}

export const BASE_TEMPLATES: Record<TransactionType, readonly ChecklistTask[]> = {
  residential_purchase: [
    { key: 'contract_executed', label: 'Purchase contract fully executed + delivered', phase: 'contract', offsetBusinessDays: -30, assignee: 'agent' },
    { key: 'earnest_money', label: 'Earnest money deposited with escrow', phase: 'contract', offsetBusinessDays: -25, assignee: 'buyer' },
    { key: 'disclosures_delivered', label: 'Seller disclosures delivered + acknowledged', phase: 'contract', offsetBusinessDays: -24, assignee: 'seller' },
    { key: 'loan_application', label: 'Loan application submitted', phase: 'financing', offsetBusinessDays: -24, assignee: 'buyer' },
    { key: 'inspection_ordered', label: 'Home inspection ordered', phase: 'diligence', offsetBusinessDays: -20, assignee: 'buyer' },
    { key: 'inspection_complete', label: 'Inspection complete + objections delivered', phase: 'diligence', offsetBusinessDays: -14, assignee: 'buyer' },
    { key: 'repair_negotiation', label: 'Repair requests resolved / amendment signed', phase: 'diligence', offsetBusinessDays: -11, assignee: 'agent' },
    { key: 'appraisal_complete', label: 'Appraisal received at or above contract price', phase: 'financing', offsetBusinessDays: -12, assignee: 'lender' },
    { key: 'title_search', label: 'Title search complete, commitment issued', phase: 'diligence', offsetBusinessDays: -10, assignee: 'title' },
    { key: 'title_objections', label: 'Title objections raised / cured', phase: 'diligence', offsetBusinessDays: -8, assignee: 'buyer' },
    { key: 'insurance_bound', label: 'Homeowner insurance bound, binder to lender', phase: 'financing', offsetBusinessDays: -7, assignee: 'buyer' },
    { key: 'financing_contingency', label: 'Financing contingency satisfied or waived', phase: 'financing', offsetBusinessDays: -21, assignee: 'lender' },
    { key: 'clear_to_close', label: 'Lender issues clear-to-close', phase: 'financing', offsetBusinessDays: -3, assignee: 'lender' },
    { key: 'closing_disclosure', label: 'Closing Disclosure delivered (3-day rule)', phase: 'closing', offsetBusinessDays: -3, assignee: 'lender' },
    { key: 'cash_to_close', label: 'Cash-to-close wired to escrow', phase: 'closing', offsetBusinessDays: -1, assignee: 'buyer' },
    { key: 'final_walkthrough', label: 'Final walkthrough completed', phase: 'closing', offsetBusinessDays: -1, assignee: 'buyer' },
    { key: 'closing_day', label: 'Sign, fund, record — closing day', phase: 'closing', offsetBusinessDays: 0, assignee: 'title' },
    { key: 'utilities_keys', label: 'Utilities transferred, keys delivered', phase: 'post_closing', offsetBusinessDays: 1, assignee: 'agent' },
  ],
  residential_refi: [
    { key: 'application_complete', label: 'Loan application + disclosures signed', phase: 'financing', offsetBusinessDays: -20, assignee: 'buyer' },
    { key: 'appraisal_complete', label: 'Appraisal received', phase: 'financing', offsetBusinessDays: -12, assignee: 'lender' },
    { key: 'title_commitment', label: 'Title commitment issued', phase: 'diligence', offsetBusinessDays: -10, assignee: 'title' },
    { key: 'payoff_ordered', label: 'Existing-loan payoff statement ordered', phase: 'financing', offsetBusinessDays: -7, assignee: 'title' },
    { key: 'insurance_updated', label: 'Insurance endorsement naming new lender', phase: 'financing', offsetBusinessDays: -5, assignee: 'buyer' },
    { key: 'clear_to_close', label: 'Clear-to-close issued', phase: 'financing', offsetBusinessDays: -3, assignee: 'lender' },
    { key: 'signing_day', label: 'Signing day', phase: 'closing', offsetBusinessDays: 0, assignee: 'title' },
    { key: 'rescission_ends', label: 'Rescission period ends, loan funds', phase: 'post_closing', offsetBusinessDays: 3, assignee: 'lender' },
  ],
  commercial: [
    { key: 'psa_executed', label: 'PSA executed, escrow opened', phase: 'contract', offsetBusinessDays: -50, assignee: 'agent' },
    { key: 'due_diligence_open', label: 'Due-diligence materials delivered', phase: 'diligence', offsetBusinessDays: -45, assignee: 'seller' },
    { key: 'phase1_environmental', label: 'Phase I environmental complete', phase: 'diligence', offsetBusinessDays: -20, assignee: 'buyer' },
    { key: 'survey_complete', label: 'ALTA survey delivered', phase: 'diligence', offsetBusinessDays: -25, assignee: 'buyer' },
    { key: 'title_objections', label: 'Title/survey objection letter served', phase: 'diligence', offsetBusinessDays: -25, assignee: 'buyer' },
    { key: 'lease_review', label: 'Lease file reviewed (rent roll vs leases)', phase: 'diligence', offsetBusinessDays: -22, assignee: 'buyer' },
    { key: 'estoppels_received', label: 'Tenant estoppels + SNDAs received', phase: 'diligence', offsetBusinessDays: -10, assignee: 'seller' },
    { key: 'financing_commitment', label: 'Loan commitment issued', phase: 'financing', offsetBusinessDays: -15, assignee: 'lender' },
    { key: 'closing_docs_final', label: 'Deed, assignment, FIRPTA, settlement statement finalized', phase: 'closing', offsetBusinessDays: -5, assignee: 'title' },
    { key: 'closing_day', label: 'Closing day — fund + record', phase: 'closing', offsetBusinessDays: 0, assignee: 'title' },
    { key: 'tenant_notices', label: 'Tenant notification letters sent', phase: 'post_closing', offsetBusinessDays: 3, assignee: 'buyer' },
  ],
  exchange_1031: [
    { key: 'qi_engaged', label: 'Qualified intermediary engaged BEFORE relinquished closing', phase: 'contract', offsetBusinessDays: -35, assignee: 'buyer' },
    { key: 'relinquished_closes', label: 'Relinquished property closes, proceeds to QI', phase: 'contract', offsetBusinessDays: -30, assignee: 'title' },
    { key: 'identification_sent', label: '45-day identification letter to QI (calendar days!)', phase: 'diligence', offsetBusinessDays: -20, assignee: 'buyer' },
    { key: 'replacement_contract', label: 'Replacement property under contract', phase: 'contract', offsetBusinessDays: -18, assignee: 'agent' },
    { key: 'title_commitment', label: 'Title commitment on replacement property', phase: 'diligence', offsetBusinessDays: -10, assignee: 'title' },
    { key: 'exchange_docs', label: 'Exchange agreement + assignment docs executed', phase: 'closing', offsetBusinessDays: -7, assignee: 'buyer' },
    { key: 'closing_day', label: 'Replacement closing — QI funds directly', phase: 'closing', offsetBusinessDays: 0, assignee: 'title' },
  ],
}

/**
 * Jurisdiction override layer — intentionally a pass-through today.
 *
 * Build phase (Perplexity-researched, cached in repo): attorney-closing
 * states (e.g. GA, SC, MA) reassign `closing_day` to an attorney role,
 * transfer-tax states add a filing task, wet-funding vs dry-funding
 * states shift the funding offset, and state/federal holidays shift
 * business-day math.
 */
export function applyJurisdictionOverrides(
  tasks: readonly DatedChecklistTask[],
  _state?: string,
): readonly DatedChecklistTask[] {
  return tasks
}

/** Generate the dated checklist for a transaction, sorted soonest-first. */
export function generateChecklist(
  type: TransactionType,
  closingDate: Date,
  state?: string,
): readonly DatedChecklistTask[] {
  const dated: DatedChecklistTask[] = BASE_TEMPLATES[type].map((task) => ({
    ...task,
    dueDate: addBusinessDays(closingDate, task.offsetBusinessDays),
  }))
  const sorted = [...dated].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  return applyJurisdictionOverrides(sorted, state)
}
