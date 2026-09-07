/**
 * Israel — second-hand residential purchase, buyer financed, both sides
 * represented.
 *
 * AUTHORED BY THE PRACTITIONER (Moses, 2026-09-08), replacing my draft. The
 * corrections that mattered most, kept here so nobody reintroduces them:
 *
 * 1. There is no fixed list of twenty tasks. A sale is not one linear process —
 *    after signing, the contract, tax, mortgage and registration tracks run in
 *    parallel. Which tasks exist depends on the deal: whether the seller has a
 *    mortgage, whether the buyer borrows, which registry holds the rights.
 * 2. Declaration and payment are DIFFERENT obligations with different clocks.
 *    Both parties declare within 30 days of the sale date (s.73). Payment runs
 *    under s.90 and the self-assessment rules and is circumstance-dependent —
 *    my draft's "60 days from signing" was invented and is gone.
 * 3. Almost nothing here may be auto-dated. `autoDate` is off by default and
 *    only two tasks turn it on. See the NO-AUTO-DATE note below.
 * 4. The caveat has no universal statutory offset. It is created at signing and
 *    registered as soon as the documents allow, which is a risk-management
 *    practice, not a counted deadline.
 * 5. The bank's security is its own task, not a child of the buyer's caveat.
 * 6. Bank handling times are estimates. A bank's turnaround is never a legal
 *    deadline and must not be displayed as one.
 * 7. The payment schedule is contractual and is extracted from the agreement.
 *    "Final payment = possession" is NOT a rule; the agreement's own mechanism
 *    governs. No instalments are templated at all.
 *
 * Registration is a separate axis: Tabu, RMI, and a management company are
 * different templates, because the source of the right, the body administering
 * it and the documents required all differ. Never run the Tabu checklist
 * against an RMI property. See ./il-registration.ts.
 */

import type { TaskSpec, TaskTemplate } from '../tasks.js'

export const IL_ROLES = [
  'broker',
  'buyer',
  'seller',
  'buyer_lawyer',
  'seller_lawyer',
  'mortgage_broker',
] as const

export const IL_PHASES = [
  'pre_contract',
  'contract',
  'tax',
  'financing',
  'clearances',
  'delivery',
  'registration',
] as const

/**
 * The two statutory reporting deadlines, and the only tasks in this template
 * permitted to compute a date.
 *
 * 30 calendar days from the sale date under s.73. The trigger is יום המכירה as
 * the law and the circumstances define it — which is why the anchor is named
 * `sale_date` and not `signing`: they usually coincide and are not the same
 * concept, and the room asks for it explicitly.
 */
const STATUTORY_DECLARATIONS: readonly TaskSpec[] = [
  {
    key: 'buyer_tax_declaration',
    labelKey: 'task.il.buyer_tax_declaration',
    phase: 'tax',
    assigneeRole: 'buyer_lawyer',
    source: 'statutory',
    anchor: 'sale_date',
    offset: 30,
    dayType: 'calendar',
    autoDate: true,
    legalReview: true,
    note: 'Declaration to the Real Estate Taxation Authority, 30 days from the sale date (s.73).',
  },
  {
    key: 'seller_tax_declaration',
    labelKey: 'task.il.seller_tax_declaration',
    phase: 'tax',
    assigneeRole: 'seller_lawyer',
    source: 'statutory',
    anchor: 'sale_date',
    offset: 30,
    dayType: 'calendar',
    autoDate: true,
    legalReview: true,
    note: 'Declaration to the Real Estate Taxation Authority, 30 days from the sale date (s.73).',
  },
]

/**
 * Everything else. No offsets, because none of these has a duration this engine
 * is entitled to assert: they are either contractual, controlled by a third
 * party, or require reading the agreement.
 */
const TRACKS: readonly TaskSpec[] = [
  // ── Pre-contract ─────────────────────────────────────────────────────────
  { key: 'title_extract_reviewed', labelKey: 'task.il.title_extract_reviewed', phase: 'pre_contract', assigneeRole: 'buyer_lawyer', source: 'operational', legalReview: true,
    note: 'A title extract shows the state of rights when it was issued. Never rely on a historic extract for a substantive step.' },
  { key: 'encumbrances_checked', labelKey: 'task.il.encumbrances_checked', phase: 'pre_contract', assigneeRole: 'buyer_lawyer', source: 'operational', legalReview: true },
  { key: 'seller_mortgage_identified', labelKey: 'task.il.seller_mortgage_identified', phase: 'pre_contract', assigneeRole: 'seller_lawyer', source: 'operational' },
  { key: 'buyer_finance_feasibility', labelKey: 'task.il.buyer_finance_feasibility', phase: 'pre_contract', assigneeRole: 'buyer', source: 'operational' },

  // ── Contract ─────────────────────────────────────────────────────────────
  { key: 'sale_agreement_signed', labelKey: 'task.il.sale_agreement_signed', phase: 'contract', assigneeRole: 'broker', source: 'contractual' },
  { key: 'buyer_caveat_registered', labelKey: 'task.il.buyer_caveat_registered', phase: 'contract', assigneeRole: 'buyer_lawyer', source: 'operational', legalReview: true,
    note: 'No universal statutory period. Open at signing and register as soon as the documents allow — a risk-management step, not a counted deadline. Ownership follows the agreement.' },

  // ── Tax (payment is separate from declaration) ───────────────────────────
  { key: 'purchase_tax_payment', labelKey: 'task.il.purchase_tax_payment', phase: 'tax', assigneeRole: 'buyer', source: 'statutory', legalReview: true,
    note: 'Payment runs under s.90 and the self-assessment rules, and special provisions can apply. Not a fixed period from signing — set it from the assessment.' },
  { key: 'capital_gains_tax_payment', labelKey: 'task.il.capital_gains_tax_payment', phase: 'tax', assigneeRole: 'seller', source: 'statutory', legalReview: true,
    note: 'Payment is a separate obligation from the declaration; the period follows the tax route, the assessment and the circumstances.' },

  // ── Mortgage. Bank turnaround is an estimate, never a legal deadline. ────
  { key: 'mortgage_approval_in_principle', labelKey: 'task.il.mortgage_approval_in_principle', phase: 'financing', assigneeRole: 'buyer', source: 'third_party' },
  { key: 'mortgage_file_opened', labelKey: 'task.il.mortgage_file_opened', phase: 'financing', assigneeRole: 'buyer', source: 'third_party' },
  { key: 'mortgage_valuation', labelKey: 'task.il.mortgage_valuation', phase: 'financing', assigneeRole: 'buyer', source: 'third_party' },
  { key: 'bank_documents_to_seller', labelKey: 'task.il.bank_documents_to_seller', phase: 'financing', assigneeRole: 'buyer_lawyer', source: 'operational' },
  { key: 'seller_signs_bank_documents', labelKey: 'task.il.seller_signs_bank_documents', phase: 'financing', assigneeRole: 'seller', source: 'contractual',
    note: 'Bank requirements vary between banks and are not a statutory list.' },
  { key: 'bank_security_registered', labelKey: 'task.il.bank_security_registered', phase: 'financing', assigneeRole: 'buyer_lawyer', source: 'third_party', legalReview: true,
    note: 'A task in its own right, not part of the buyer caveat. Depends on the bank requirements, the seller signatures and what the registry permits.' },
  { key: 'seller_payoff_letter', labelKey: 'task.il.seller_payoff_letter', phase: 'financing', assigneeRole: 'seller_lawyer', source: 'third_party', legalReview: true,
    note: 'Only where the seller has a mortgage. Letters carry their own validity period.' },
  { key: 'seller_mortgage_discharged', labelKey: 'task.il.seller_mortgage_discharged', phase: 'financing', assigneeRole: 'seller', source: 'contractual', legalReview: true },

  // ── Clearances ───────────────────────────────────────────────────────────
  { key: 'municipal_clearance', labelKey: 'task.il.municipal_clearance', phase: 'clearances', assigneeRole: 'seller_lawyer', source: 'third_party', legalReview: true },
  { key: 'tax_clearance_certificates', labelKey: 'task.il.tax_clearance_certificates', phase: 'clearances', assigneeRole: 'seller_lawyer', source: 'third_party', legalReview: true },

  // ── Delivery. NO-AUTO-DATE, every one of them. ───────────────────────────
  { key: 'purchase_price_payment', labelKey: 'task.il.purchase_price_payment', phase: 'delivery', assigneeRole: 'buyer', source: 'contractual', legalReview: true,
    note: 'Instalments come from the agreement: how many, how much, when, and on what conditions. Nothing here is templated.' },
  { key: 'possession_handover', labelKey: 'task.il.possession_handover', phase: 'delivery', assigneeRole: 'seller', source: 'contractual', legalReview: true,
    note: 'Per the mechanism in the agreement. Possession is NOT defined as the final payment.' },
  { key: 'registration_documents_delivered', labelKey: 'task.il.registration_documents_delivered', phase: 'delivery', assigneeRole: 'seller_lawyer', source: 'contractual', legalReview: true },

  // ── Registration ─────────────────────────────────────────────────────────
  { key: 'ownership_registered', labelKey: 'task.il.ownership_registered', phase: 'registration', assigneeRole: 'buyer_lawyer', source: 'third_party', legalReview: true,
    note: 'A transaction in land is completed by registration; until then it is an undertaking to carry out a transaction.' },
  { key: 'mortgage_registered', labelKey: 'task.il.mortgage_registered', phase: 'registration', assigneeRole: 'buyer_lawyer', source: 'third_party', legalReview: true },
  { key: 'final_title_extract', labelKey: 'task.il.final_title_extract', phase: 'registration', assigneeRole: 'buyer_lawyer', source: 'operational' },
  { key: 'transaction_completed', labelKey: 'task.il.transaction_completed', phase: 'registration', assigneeRole: 'buyer_lawyer', source: 'contractual', legalReview: true },
]

export const IL_RESIDENTIAL_TASKS: TaskTemplate = {
  id: 'il-residential',
  jurisdiction: 'IL',
  version: 2,
  roles: [...IL_ROLES],
  phases: [...IL_PHASES],
  // `sale_date` drives the statutory clocks and is deliberately distinct from
  // the signing date; `closing` is the agreement's delivery date.
  anchors: ['sale_date', 'signing', 'closing'],
  tasks: [...TRACKS, ...STATUTORY_DECLARATIONS],
  reviewed: true,
}
