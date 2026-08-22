/**
 * Jurisdiction pack — Dubai residential purchase (DLD / RERA).
 *
 * Dubai first because that is where the founder's credibility actually is:
 * DIFC-registered, practising real-estate lawyer, multi-jurisdiction. A
 * "is this deal ready to close" product is only as good as the practitioner
 * who validates its rules, and Florida — the market the source strategy doc
 * proposed — is a market with no bar admission and no network behind it.
 *
 * ⚠️ UNVERIFIED — MOSES MUST REVIEW BEFORE THIS IS SHOWN TO ANY CUSTOMER.
 * The document set and sequence below are assembled from public description of
 * the DLD process. Freshness windows in particular are placeholders. Getting
 * these wrong is precisely what would make the product wrong, and I cannot
 * derive them from the codebase. Nothing here should reach a customer until a
 * practising Dubai practitioner has signed off.
 *
 * `weekendDays` matters more than it looks: the UAE weekend is Friday-Saturday,
 * so US/UK business-day arithmetic silently computes the wrong deadline here.
 */

import type { RequiredFact, Severity } from '../reconcile.js'

export interface RequiredDocument {
  readonly doc_type: string
  readonly label: string
  readonly severity: Severity
  /** Days the document stays fresh, or null when the pack defines no expiry. */
  readonly freshness_days: number | null
  readonly note?: string
}

export interface JurisdictionPack {
  readonly id: string
  readonly label: string
  readonly country: string
  /** 0=Sun … 6=Sat. UAE weekend is Fri-Sat. */
  readonly weekendDays: readonly number[]
  /** ISO dates that are non-working. Hijri holidays move yearly — see note. */
  readonly holidays: readonly string[]
  readonly requiredDocuments: readonly RequiredDocument[];
  readonly requiredFacts: readonly RequiredFact[]
  readonly reviewed: boolean
}

export const AE_DUBAI_RESIDENTIAL: JurisdictionPack = {
  id: 'ae-dubai-residential',
  label: 'Dubai residential purchase (DLD)',
  country: 'AE',
  // Friday + Saturday. This single line is why the shared calendar had to
  // become pluggable — the existing Mon-Fri assumption is not merely
  // imprecise here, it is wrong in both directions.
  weekendDays: [5, 6],
  // Deliberately empty: Islamic holidays follow the Hijri calendar and shift
  // each Gregorian year, and a stale hardcoded list is worse than none — it
  // would produce confidently wrong deadlines. Populate per-year from an
  // authoritative source before relying on business-day maths.
  holidays: [],

  requiredDocuments: [
    { doc_type: 'form_f', label: 'Form F (MOU / Unified Sale Contract)', severity: 'critical', freshness_days: null },
    { doc_type: 'title_deed', label: 'Title Deed', severity: 'critical', freshness_days: null },
    { doc_type: 'noc', label: 'Developer NOC (No Objection Certificate)', severity: 'critical', freshness_days: 30,
      note: 'NOC validity is developer-specific; 30 days is a placeholder pending review.' },
    { doc_type: 'passport_id', label: 'Buyer/Seller passport or Emirates ID', severity: 'high', freshness_days: null },
    { doc_type: 'mortgage_letter', label: 'Mortgage pre-approval / liability letter', severity: 'high', freshness_days: 90,
      note: 'Only applicable to financed purchases.' },
    { doc_type: 'oqood', label: 'Oqood (off-plan registration)', severity: 'high', freshness_days: null,
      note: 'Off-plan only; not applicable to ready property.' },
    { doc_type: 'service_charge', label: 'Service charge clearance', severity: 'medium', freshness_days: 30 },
    { doc_type: 'trakheesi', label: 'Trakheesi permit (broker listing permit)', severity: 'low', freshness_days: null },
  ],

  requiredFacts: [
    { fact_key: 'contract.closing_date', label: 'Closing / transfer date', severity: 'critical' },
    { fact_key: 'financial.purchase_price', label: 'Purchase price', severity: 'critical' },
    { fact_key: 'parties.seller.name', label: 'Seller name', severity: 'critical' },
    { fact_key: 'parties.buyer.name', label: 'Buyer name', severity: 'critical' },
    { fact_key: 'property.address', label: 'Property address', severity: 'high' },
    { fact_key: 'financial.deposit_amount', label: 'Deposit amount', severity: 'high' },
    { fact_key: 'property.area', label: 'Property area', severity: 'medium' },
  ],

  // Flipped to true only after a practitioner review. The audit surface must
  // refuse to present pack-derived findings while this is false.
  reviewed: false,
}

export const PACKS: Readonly<Record<string, JurisdictionPack>> = {
  [AE_DUBAI_RESIDENTIAL.id]: AE_DUBAI_RESIDENTIAL,
}

export function getPack(id: string): JurisdictionPack | undefined {
  return PACKS[id]
}
