/**
 * English dictionary — and the source of truth for the key set.
 *
 * `he.ts` is typed as `Record<DictKey, string>`, so a key added here without a
 * Hebrew translation fails typecheck rather than rendering a raw key at a
 * broker. That is the whole reason this is a plain object and not a JSON file.
 *
 * Prose lives in double-quoted strings: SWC (which `next build` uses) chokes on
 * an apostrophe inside single quotes where tsc does not, and that has broken a
 * build in this repo before.
 */

export const en = {
  // ── Product ───────────────────────────────────────────────────────────────
  "brand": "DEAL44",
  "brand.tagline": "One room for the whole transaction.",

  // ── Room chrome ───────────────────────────────────────────────────────────
  "room.progress": "Progress",
  "room.tasks_done": "{done} of {total} done",
  "room.your_tasks": "Your tasks",
  "room.all_tasks": "Everything in this room",
  "room.no_tasks": "No tasks yet. Your broker adds them as the transaction moves.",
  "room.due": "Due",
  "room.no_date": "No date yet",
  "room.today": "today",
  "room.tomorrow": "tomorrow",
  "room.days_left": "in {n} days",
  "room.overdue_by": "{n} days overdue",
  "room.done_on": "done {date}",
  "room.role": "Your role",
  "room.parties": "Who is in this room",
  "room.signing": "Signing",
  "room.closing": "Delivery",
  "room.statutory": "Statutory deadline",
  "room.draft_dates": "Draft dates",
  "room.add_task": "Add a task",
  "room.task_label": "What has to happen",
  "room.task_phase": "Stage",
  "room.task_owner": "Whose job",
  "room.task_due": "Due date",
  "room.change_dates": "Change the dates",
  "room.add_party": "Add someone to the room",
  "room.send_invite": "Email them their link",
  "room.link_once": "Copy this link now — it is shown once and cannot be recovered.",
  "room.rescheduled": "{n} dates moved.",
  "room.sale_date": "Sale date",
  "room.no_auto_date": "From the agreement",
  "room.source.statutory": "By law",
  "room.source.contractual": "By agreement",
  "room.source.operational": "Working step",
  "room.source.third_party": "Depends on a third party",
  "room.source.judgment": "Needs a legal call",
  "room.review_counsel": "Review with your counsel",
  "room.link_expired": "This link has expired. Ask your broker for a new one.",

  // ── Warnings the room must never hide ─────────────────────────────────────
  "warn.template_not_reviewed":
    "The dates in this room come from a draft checklist that has not yet been confirmed by a lawyer. Treat them as a working list, not as deadlines.",
  "warn.holidays_not_configured":
    "Public holidays are not yet loaded, so working-day dates may be off by a day or two around a holiday.",
  "warn.missing_anchor": "Some dates are blank because the transaction dates have not been entered yet.",

  // ── Phases ────────────────────────────────────────────────────────────────
  "phase.pre_contract": "Before signing",
  "phase.contract": "Contract",
  "phase.tax": "Tax",
  "phase.financing": "Mortgage",
  "phase.clearances": "Clearances",
  "phase.delivery": "Delivery",
  "phase.diligence": "Due diligence",
  "phase.closing": "Closing",
  "phase.post_closing": "After closing",
  "phase.registration": "Registration",

  // ── Roles ─────────────────────────────────────────────────────────────────
  "role.broker": "Broker",
  "role.buyer": "Buyer",
  "role.seller": "Seller",
  "role.buyer_lawyer": "Buyer's lawyer",
  "role.seller_lawyer": "Seller's lawyer",
  "role.agent": "Agent",
  "role.lender": "Lender",
  "role.title": "Title company",
  "role.escrow": "Escrow",
  "role.mortgage_broker": "Mortgage advisor",

  // ── Israeli residential purchase tasks ────────────────────────────────────

  // ── Israeli purchase — vocabulary authored by the practitioner ──
  "task.il.title_extract_reviewed": "Title extract reviewed",
  "task.il.encumbrances_checked": "Encumbrances and restrictions checked",
  "task.il.seller_mortgage_identified": "Seller's existing mortgage identified",
  "task.il.buyer_finance_feasibility": "Buyer's financing feasibility",
  "task.il.sale_agreement_signed": "Sale agreement signing",
  "task.il.buyer_caveat_registered": "Buyer's warning notice registration",
  "task.il.buyer_tax_declaration": "Buyer's real estate tax reporting",
  "task.il.seller_tax_declaration": "Seller's capital gains tax declaration",
  "task.il.purchase_tax_payment": "Purchase tax payment",
  "task.il.capital_gains_tax_payment": "Capital gains tax payment",
  "task.il.mortgage_approval_in_principle": "Mortgage approval in principle",
  "task.il.mortgage_file_opened": "Mortgage file opening",
  "task.il.mortgage_valuation": "Mortgage valuation",
  "task.il.bank_documents_to_seller": "Bank documents delivered to seller",
  "task.il.seller_signs_bank_documents": "Seller's bank documentation",
  "task.il.bank_security_registered": "Bank security registration",
  "task.il.seller_payoff_letter": "Payoff letter for seller's mortgage",
  "task.il.seller_mortgage_discharged": "Discharge of seller's mortgage",
  "task.il.municipal_clearance": "Municipal clearance",
  "task.il.tax_clearance_certificates": "Tax clearance certificates",
  "task.il.purchase_price_payment": "Purchase price payment",
  "task.il.possession_handover": "Possession handover",
  "task.il.registration_documents_delivered": "Delivery of registration documents",
  "task.il.ownership_registered": "Ownership registration",
  "task.il.mortgage_registered": "Mortgage registration",
  "task.il.final_title_extract": "Final land registry extract",
  "task.il.transaction_completed": "Transaction completion",
  "task.il.rmi_lease_validity_checked": "ILA lease validity checked",
  "task.il.rmi_arrears_checked": "ILA arrears checked",
  "task.il.rmi_transfer_approval": "ILA transfer approval",
  "task.il.company_rights_confirmation": "Management company rights confirmation",
  "task.il.company_transfer_documents": "Management company transfer documents",
  "task.il.company_registration_completed": "Management company registration completed",

  // ── Landing ───────────────────────────────────────────────────────────────
  "landing.h1": "Every party, every deadline, one room.",
  "landing.sub":
    "A shared checklist for a property transaction. The broker opens a room, everyone gets their own link, and each deadline reaches the person responsible before it passes.",
  "landing.cta": "Set up a room for my next signing",
  "landing.price": "₪2,500 per transaction, set up and run for you.",
  "landing.how": "How it works",
  "landing.how1": "You send the signed contract and the key dates.",
  "landing.how2": "We build the room and send each party their own private link.",
  "landing.how3": "Everyone sees what is theirs. Reminders go out before deadlines, not after.",
  "landing.disclaimer":
    "DEAL44 is software that organises a transaction's checklist. It is not legal services, it is not legal advice, and it does not replace the lawyers acting for the parties.",

  // ── Intake ────────────────────────────────────────────────────────────────
  "intake.h1": "Set up a deal room",
  "intake.sub": "Answer five things. You get a written proposal back, no call.",
  "intake.name": "Your name",
  "intake.email": "Email",
  "intake.phone": "Phone (optional)",
  "intake.deals_per_month": "Roughly how many transactions a month",
  "intake.next_signing": "When is your next signing",
  "intake.notes": "Anything I should know",
  "intake.submit": "Send",
  "intake.sending": "Sending...",
  "intake.thanks": "Got it. You will have a written reply within one business day.",
  "intake.error": "That did not go through. Try again, or write to the address below.",

  // ── Email ─────────────────────────────────────────────────────────────────
  "email.invite.subject": "{broker} added you to the deal room for {title}",
  "email.invite.intro": "{broker} set up a shared checklist for this transaction and added you as {role}.",
  "email.invite.cta": "Open your room",
  "email.invite.explain":
    "The room shows every step of the transaction, who is responsible for each one, and when it is due. You will get a short reminder email before your own deadlines.",
  "email.digest.subject": "{title} — {n} items need attention",
  "email.digest.intro": "Here is where the transaction stands.",
  "email.stop": "To stop these reminders, reply with the word STOP.",
  "email.footer.disclaimer":
    "DEAL44 organises the transaction checklist. It is not legal advice. Questions about your own position go to your lawyer.",
} as const
