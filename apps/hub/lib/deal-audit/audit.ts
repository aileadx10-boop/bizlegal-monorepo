/**
 * Deal Audit — the free lead magnet (DI-3).
 *
 * Pure, deterministic audit logic. No Next.js, no network, no secrets —
 * so it can be unit-tested with node:test and reused by any surface.
 *
 * The moat is the practitioner's checklist: the Dubai pack's required
 * facts and documents, assembled by a practising Dubai real-estate lawyer.
 * The engine (packages/deal-engine) does the arithmetic; this module maps
 * a visitor's form submission onto the pack's ontology.
 *
 * The pack is gated on `reviewed`. While it is false, `runDealAudit`
 * returns `{ ok: false, reason: 'not_reviewed' }` and the API answers 409 —
 * the surface ships now and goes live the moment the pack is signed off,
 * with no code change.
 */

import {
  AE_DUBAI_RESIDENTIAL,
  normaliseDate,
  reconcile,
  sortFindings,
} from '@bizlegal/deal-engine'
import type {
  DealDocument,
  DealFact,
  Finding,
  ReconcileInput,
} from '@bizlegal/deal-engine'

export interface DealAuditInput {
  readonly closingDate: string
  readonly purchasePrice: string
  readonly sellerName: string
  readonly buyerName: string
  readonly propertyAddress: string
  readonly depositAmount: string
  readonly propertyArea: string
  /**
   * Optional second source for the two facts where Dubai deals most
   * commonly disagree: the closing date as it appears on the title deed
   * vs the MOU, and the price on the title deed vs the agreed price.
   * When present and different, the engine reports a conflict.
   */
  readonly closingDateAlt?: string
  readonly purchasePriceAlt?: string
  /** Optional document expiry dates (ISO YYYY-MM-DD). */
  readonly nocExpiry?: string
  readonly mortgageLetterExpiry?: string
  readonly serviceChargeExpiry?: string
}

export type DealAuditResult =
  | {
      readonly ok: true
      readonly findings: readonly Finding[]
      readonly packId: string
      readonly packLabel: string
    }
  | { readonly ok: false; readonly reason: 'not_reviewed' }

const REQUIRED_FIELDS = [
  'closingDate',
  'purchasePrice',
  'sellerName',
  'buyerName',
  'propertyAddress',
  'depositAmount',
  'propertyArea',
] as const

const OPTIONAL_FIELDS = [
  'closingDateAlt',
  'purchasePriceAlt',
  'nocExpiry',
  'mortgageLetterExpiry',
  'serviceChargeExpiry',
] as const

export type ValidationResult =
  | { readonly ok: true; readonly value: DealAuditInput }
  | { readonly ok: false; readonly error: string }

/** Fail fast at the boundary: required fields present, optionals are strings. */
export function validateDealAuditInput(input: unknown): ValidationResult {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'Request body must be a JSON object.' }
  }
  const o = input as Record<string, unknown>
  for (const field of REQUIRED_FIELDS) {
    const v = o[field]
    if (typeof v !== 'string' || v.trim().length === 0) {
      return { ok: false, error: `Missing required field: ${field}.` }
    }
  }
  for (const field of OPTIONAL_FIELDS) {
    const v = o[field]
    if (v !== undefined && v !== null && typeof v !== 'string') {
      return { ok: false, error: `Field ${field} must be a string.` }
    }
  }
  return { ok: true, value: o as unknown as DealAuditInput }
}

/** The form is explicitly a Dubai residential purchase, so AED is the default. */
const MONEY_UNIT = 'AED'

function fact(
  factKey: string,
  rawValue: string,
  sourceDocumentId: string,
  unit?: string,
): DealFact {
  const trimmed = rawValue.trim()
  return {
    id: `${sourceDocumentId}:${factKey}`,
    fact_key: factKey,
    raw_value: trimmed,
    unit: unit ?? null,
    source_document_id: sourceDocumentId,
    page: null,
    quote: trimmed,
    confidence: null,
  }
}

function buildFacts(input: DealAuditInput): DealFact[] {
  // A blank field is "not provided", not "unreadable": skip it so the
  // engine reports the pack's required fact as `missing` — the honest
  // answer for a form field the visitor left empty.
  const facts: DealFact[] = []
  const push = (factKey: string, rawValue: string, sourceDocumentId: string, unit?: string) => {
    if (rawValue.trim()) facts.push(fact(factKey, rawValue, sourceDocumentId, unit))
  }
  push('contract.closing_date', input.closingDate, 'submission')
  push('financial.purchase_price', input.purchasePrice, 'submission', MONEY_UNIT)
  push('parties.seller.name', input.sellerName, 'submission')
  push('parties.buyer.name', input.buyerName, 'submission')
  push('property.address', input.propertyAddress, 'submission')
  push('financial.deposit_amount', input.depositAmount, 'submission', MONEY_UNIT)
  push('property.area', input.propertyArea, 'submission')
  push('contract.closing_date', input.closingDateAlt ?? '', 'second_source')
  push('financial.purchase_price', input.purchasePriceAlt ?? '', 'second_source', MONEY_UNIT)
  return facts
}

function buildDocuments(input: DealAuditInput): DealDocument[] {
  const docs: DealDocument[] = [
    { id: 'submission', doc_type: null, filename: 'Your submission' },
  ]
  if (input.closingDateAlt?.trim() || input.purchasePriceAlt?.trim()) {
    docs.push({
      id: 'second_source',
      doc_type: null,
      filename: 'Second document (title deed / closing statement)',
    })
  }
  if (input.nocExpiry?.trim()) {
    docs.push({
      id: 'noc',
      doc_type: 'noc',
      filename: 'Developer NOC',
      expires_at: input.nocExpiry.trim(),
    })
  }
  if (input.mortgageLetterExpiry?.trim()) {
    docs.push({
      id: 'mortgage_letter',
      doc_type: 'mortgage_letter',
      filename: 'Mortgage pre-approval',
      expires_at: input.mortgageLetterExpiry.trim(),
    })
  }
  if (input.serviceChargeExpiry?.trim()) {
    docs.push({
      id: 'service_charge',
      doc_type: 'service_charge',
      filename: 'Service charge clearance',
      expires_at: input.serviceChargeExpiry.trim(),
    })
  }
  return docs
}

/**
 * The reconcile pipeline, ungated. Exported separately from `runDealAudit`
 * so the findings logic is testable while the pack is still unreviewed.
 */
export function reconcileDealAudit(input: DealAuditInput): Finding[] {
  // The expired-document check compares ISO strings; normalise the closing
  // date first so a human-readable entry ("18 September 2026") still works.
  // An unreadable closing date yields null → no expiry check, and the
  // closing-date fact itself becomes insufficient_evidence downstream.
  const closingIso = normaliseDate(input.closingDate)?.value ?? null
  const reconcileInput: ReconcileInput = {
    facts: buildFacts(input),
    documents: buildDocuments(input),
    required: AE_DUBAI_RESIDENTIAL.requiredFacts,
    closingDate: closingIso,
  }
  return sortFindings(reconcile(reconcileInput))
}

/**
 * The audit entry point. Gated on the pack's `reviewed` flag — the whole
 * point of shipping the surface now and going live with a one-line flip.
 */
export function runDealAudit(input: DealAuditInput): DealAuditResult {
  if (!AE_DUBAI_RESIDENTIAL.reviewed) {
    return { ok: false, reason: 'not_reviewed' }
  }
  return {
    ok: true,
    findings: reconcileDealAudit(input),
    packId: AE_DUBAI_RESIDENTIAL.id,
    packLabel: AE_DUBAI_RESIDENTIAL.label,
  }
}
