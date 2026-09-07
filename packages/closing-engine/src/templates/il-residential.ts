/**
 * Israel — second-hand residential purchase (Tabu-registered apartment).
 *
 * ⚠️ DRAFT. `reviewed: false`. NOTHING HERE MAY BE SHOWN TO A CUSTOMER AS A
 * DATE until Moses — who is the practising Israeli real-estate lawyer, and
 * therefore the only person who can sign this off — has confirmed every
 * offset. Consuming surfaces must refuse, the way apps/hub/lib/deal-audit
 * refuses the unreviewed Dubai pack. A room can still run today with manually
 * entered tasks; that path does not touch this file.
 *
 * Every offset marked `placeholder: true` is a guess assembled from public
 * description of the process, not from practice. The four statutory items are
 * the ones the founder stated directly, and even those carry the trigger-date
 * question (interview Q2): the tax clocks are widely described as running from
 * the day of the transaction, but whether that is the signing date in every
 * case is his call, not mine.
 *
 * The ten questions that turn this into a reviewed template live in
 * decisions/DEAL44-WORKFLOW44-2026-09-07.md. Answers arrive as text — no call.
 *
 * Labels are i18n keys. Hebrew and English text live in the app dictionaries
 * (apps/deal44/lib/i18n/), never here.
 */

import type { TaskTemplate } from '../tasks.js'

export const IL_RESIDENTIAL_TASKS: TaskTemplate = {
  id: 'il-residential',
  jurisdiction: 'IL',
  version: 1,
  roles: ['broker', 'buyer', 'seller', 'buyer_lawyer', 'seller_lawyer', 'mortgage_broker'],
  phases: ['contract', 'tax', 'financing', 'clearances', 'delivery', 'registration'],
  anchors: ['signing', 'closing'],

  tasks: [
    // ── At signing ──────────────────────────────────────────────────────────
    {
      key: 'contract_signed',
      labelKey: 'task.il.contract_signed',
      phase: 'contract',
      assigneeRole: 'broker',
      anchor: 'signing',
      offset: 0,
      dayType: 'calendar',
    },
    {
      key: 'first_payment_at_signing',
      labelKey: 'task.il.first_payment_at_signing',
      phase: 'contract',
      assigneeRole: 'buyer',
      anchor: 'signing',
      offset: 0,
      dayType: 'calendar',
      note: 'Amount comes from the contract, never from this template.',
    },
    {
      key: 'irrevocable_poa_signed',
      labelKey: 'task.il.irrevocable_poa_signed',
      phase: 'contract',
      assigneeRole: 'buyer_lawyer',
      anchor: 'signing',
      offset: 0,
      dayType: 'calendar',
    },
    {
      key: 'caveat_registered',
      labelKey: 'task.il.caveat_registered',
      phase: 'contract',
      assigneeRole: 'buyer_lawyer',
      anchor: 'signing',
      offset: 3,
      dayType: 'business',
      placeholder: true,
      note: 'Interview Q5: days after signing, and who registers it.',
    },

    // ── Statutory tax clocks (CALENDAR days — never business days) ───────────
    {
      key: 'purchase_tax_declaration',
      labelKey: 'task.il.purchase_tax_declaration',
      phase: 'tax',
      assigneeRole: 'buyer_lawyer',
      anchor: 'signing',
      offset: 30,
      dayType: 'calendar',
      statutory: true,
      note: 'Founder-stated: 30 days. Interview Q2 confirms the trigger date and whether it rolls off a non-working day.',
    },
    {
      key: 'purchase_tax_payment',
      labelKey: 'task.il.purchase_tax_payment',
      phase: 'tax',
      assigneeRole: 'buyer',
      anchor: 'signing',
      offset: 60,
      dayType: 'calendar',
      statutory: true,
      note: 'Founder-stated: 60 days. Interview Q2.',
    },
    {
      key: 'shevach_declaration',
      labelKey: 'task.il.shevach_declaration',
      phase: 'tax',
      assigneeRole: 'seller_lawyer',
      anchor: 'signing',
      offset: 30,
      dayType: 'calendar',
      statutory: true,
      note: 'Founder-stated: 30 days. Interview Q2.',
    },
    {
      key: 'shevach_payment',
      labelKey: 'task.il.shevach_payment',
      phase: 'tax',
      assigneeRole: 'seller',
      anchor: 'signing',
      offset: 60,
      dayType: 'calendar',
      statutory: true,
      placeholder: true,
      note: 'UNCONFIRMED — mirrored from the purchase-tax payment window purely as a placeholder. Interview Q2.',
    },

    // ── Financing ───────────────────────────────────────────────────────────
    {
      key: 'mortgage_application_filed',
      labelKey: 'task.il.mortgage_application_filed',
      phase: 'financing',
      assigneeRole: 'mortgage_broker',
      anchor: 'signing',
      offset: 10,
      dayType: 'business',
      placeholder: true,
      note: 'Interview Q6.',
    },
    {
      key: 'seller_payoff_letter_obtained',
      labelKey: 'task.il.seller_payoff_letter_obtained',
      phase: 'financing',
      assigneeRole: 'seller_lawyer',
      anchor: 'closing',
      offset: -30,
      dayType: 'business',
      placeholder: true,
      note: 'Only when the seller has a mortgage. Letters expire — interview Q6.',
    },
    {
      key: 'undertaking_to_register_mortgage',
      labelKey: 'task.il.undertaking_to_register_mortgage',
      phase: 'financing',
      assigneeRole: 'seller_lawyer',
      anchor: 'closing',
      offset: -21,
      dayType: 'business',
      placeholder: true,
      note: 'Interview Q6.',
    },
    {
      key: 'bank_caveat_registered',
      labelKey: 'task.il.bank_caveat_registered',
      phase: 'financing',
      assigneeRole: 'buyer_lawyer',
      anchor: 'closing',
      offset: -14,
      dayType: 'business',
      placeholder: true,
      note: 'Interview Q5: does the bank caveat get its own task and timing.',
    },
    {
      key: 'mortgage_funds_released',
      labelKey: 'task.il.mortgage_funds_released',
      phase: 'financing',
      assigneeRole: 'mortgage_broker',
      anchor: 'closing',
      offset: -3,
      dayType: 'business',
      placeholder: true,
      note: 'Interview Q6.',
    },

    // ── Clearances for registration ─────────────────────────────────────────
    {
      key: 'betterment_levy_checked',
      labelKey: 'task.il.betterment_levy_checked',
      phase: 'clearances',
      assigneeRole: 'seller_lawyer',
      anchor: 'closing',
      offset: -30,
      dayType: 'business',
      placeholder: true,
      note: 'Interview Q7.',
    },
    {
      key: 'municipal_clearance_obtained',
      labelKey: 'task.il.municipal_clearance_obtained',
      phase: 'clearances',
      assigneeRole: 'seller_lawyer',
      anchor: 'closing',
      offset: -21,
      dayType: 'business',
      placeholder: true,
      note: 'Interview Q7.',
    },
    {
      key: 'tax_certificates_for_registration',
      labelKey: 'task.il.tax_certificates_for_registration',
      phase: 'clearances',
      assigneeRole: 'seller_lawyer',
      anchor: 'closing',
      offset: -14,
      dayType: 'business',
      placeholder: true,
      note: 'Interview Q7.',
    },
    {
      key: 'house_committee_clearance',
      labelKey: 'task.il.house_committee_clearance',
      phase: 'clearances',
      assigneeRole: 'seller',
      anchor: 'closing',
      offset: -7,
      dayType: 'business',
      placeholder: true,
      note: 'Interview Q7.',
    },

    // ── Delivery ────────────────────────────────────────────────────────────
    {
      key: 'final_payment_and_delivery',
      labelKey: 'task.il.final_payment_and_delivery',
      phase: 'delivery',
      assigneeRole: 'broker',
      anchor: 'closing',
      offset: 0,
      dayType: 'calendar',
    },
    {
      key: 'seller_mortgage_released',
      labelKey: 'task.il.seller_mortgage_released',
      phase: 'delivery',
      assigneeRole: 'seller_lawyer',
      anchor: 'closing',
      offset: 0,
      dayType: 'calendar',
      placeholder: true,
    },
    {
      key: 'utilities_transferred',
      labelKey: 'task.il.utilities_transferred',
      phase: 'delivery',
      assigneeRole: 'buyer',
      anchor: 'closing',
      offset: 7,
      dayType: 'calendar',
      placeholder: true,
    },

    // ── Registration ────────────────────────────────────────────────────────
    {
      key: 'title_registered',
      labelKey: 'task.il.title_registered',
      phase: 'registration',
      assigneeRole: 'buyer_lawyer',
      anchor: 'closing',
      offset: 30,
      dayType: 'business',
      placeholder: true,
      note: 'Interview Q7: differs for Israel Land Authority leasehold and for a חברה משכנת — may need separate templates.',
    },
  ],

  // Flipped to true only by the practitioner, after the interview. Until then
  // every consuming surface refuses to present these dates.
  reviewed: false,
}

export const TEMPLATES: Readonly<Record<string, TaskTemplate>> = {
  [IL_RESIDENTIAL_TASKS.id]: IL_RESIDENTIAL_TASKS,
}

export function getTemplate(id: string): TaskTemplate | undefined {
  return TEMPLATES[id]
}
