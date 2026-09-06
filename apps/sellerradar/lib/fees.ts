/* ─── SellerRadar fee engine — pure, typed, no I/O ────────────────────────
   Fee types v1 (spec §4): referral fee %, FBA fulfillment fee (size/weight
   tiers), monthly storage fee. Schedules are curated JSON fixtures
   versioned in-repo under data/fee-schedules/ — every row carries a
   source_url + effective_date citation (liability shrinker, spec §5). */

import type { SellerSkuInput } from './csv'

export type FeeType = 'referral' | 'fba_fulfillment' | 'storage'

/** Simplified Amazon size tiers. */
export type SizeTier = 'small_standard' | 'large_standard' | 'large_bulky' | 'oversize'

export interface FeeSchedule {
  readonly marketplace: string
  readonly version: string
  readonly effective_date: string
  readonly source_url: string
  /** Referral % by normalized category key; `default` is required. */
  readonly referral_pct: Readonly<Record<string, number>>
  /** FBA fulfillment fee in USD per unit by size tier. */
  readonly fba_fulfillment: Readonly<Record<SizeTier, number>>
  /** Monthly storage fee in USD per cubic foot. */
  readonly storage_per_cuft_monthly: Readonly<{ standard: number; oversize: number }>
}

export interface FeeBreakdown {
  readonly referral: number
  readonly fulfillment: number
  readonly storage: number
  readonly total: number
  readonly sizeTier: SizeTier
}

export function normalizeCategory(category: string): string {
  // "Home & Kitchen" → "home_kitchen" — any run of non-alphanumerics
  // collapses to one underscore so real CSV category strings hit the
  // fixture keys.
  return category.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

/**
 * Simplified Amazon size-tier classification (spec §4: size/weight tiers).
 * Missing dimensions/weight degrade upward to large_standard — conservative
 * for impact estimates, and the CSV layer warns when it had to default.
 */
export function classifySizeTier(sku: {
  lengthIn: number | null
  widthIn: number | null
  heightIn: number | null
  weightLb: number | null
}): SizeTier {
  const dims = [sku.lengthIn, sku.widthIn, sku.heightIn].filter((d): d is number => d != null && d > 0)
  const weight = sku.weightLb ?? 1
  if (dims.length < 3) {
    return weight > 50 ? 'oversize' : 'large_standard'
  }
  const sorted = [...dims].sort((a, b) => b - a)
  const [longest, median, shortest] = sorted
  if (longest <= 15 && median <= 12 && shortest <= 0.75 && weight <= 1) return 'small_standard'
  if (longest <= 18 && median <= 14 && shortest <= 8 && weight <= 20) return 'large_standard'
  if (longest <= 59 && weight <= 50) return 'large_bulky'
  return 'oversize'
}

/** Cubic feet per unit for storage fees; null when dims are unknown. */
export function cubicFeet(sku: { lengthIn: number | null; widthIn: number | null; heightIn: number | null }): number {
  if (sku.lengthIn == null || sku.widthIn == null || sku.heightIn == null) return 0
  return (sku.lengthIn * sku.widthIn * sku.heightIn) / 1728
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/** Compute the per-unit Amazon fee stack for one SKU under one schedule. */
export function computeFees(sku: SellerSkuInput, schedule: FeeSchedule): FeeBreakdown {
  return computeStoredFees(
    {
      price: sku.price,
      category: sku.category,
      sizeTier: classifySizeTier(sku),
      volumeCuFt: cubicFeet(sku),
    },
    schedule,
  )
}

/**
 * Fee computation for a SKU whose size tier + volume are already known.
 * The monitor re-scan path needs this: sellerradar_skus rows persist the
 * classified size_tier (and the old storage fee, from which volume is
 * recoverable) but not the raw dimensions/weight classifySizeTier wants.
 * computeFees delegates here so there is exactly one fee formula.
 */
export interface StoredFeeInput {
  readonly price: number
  readonly category: string
  readonly sizeTier: SizeTier
  /** Cubic feet per unit; 0 when dimensions were never supplied. */
  readonly volumeCuFt: number
}

export function computeStoredFees(input: StoredFeeInput, schedule: FeeSchedule): FeeBreakdown {
  const categoryKey = normalizeCategory(input.category)
  const referralPct = schedule.referral_pct[categoryKey] ?? schedule.referral_pct.default
  const referral = round2(input.price * referralPct)
  const fulfillment = schedule.fba_fulfillment[input.sizeTier]
  const isOversize = input.sizeTier === 'oversize' || input.sizeTier === 'large_bulky'
  const storage = round2(
    input.volumeCuFt * (isOversize ? schedule.storage_per_cuft_monthly.oversize : schedule.storage_per_cuft_monthly.standard),
  )
  return {
    referral,
    fulfillment,
    storage,
    total: round2(referral + fulfillment + storage),
    sizeTier: input.sizeTier,
  }
}

/** Which fee types moved between two schedules (drives SEO pages + digest). */
export function diffFeeTypes(prev: FeeSchedule, next: FeeSchedule): FeeType[] {
  const changed: FeeType[] = []
  const referralChanged =
    prev.referral_pct.default !== next.referral_pct.default ||
    Object.keys(next.referral_pct).some((k) => prev.referral_pct[k] !== next.referral_pct[k])
  if (referralChanged) changed.push('referral')
  const fulfillmentChanged = (Object.keys(next.fba_fulfillment) as SizeTier[]).some(
    (tier) => prev.fba_fulfillment[tier] !== next.fba_fulfillment[tier],
  )
  if (fulfillmentChanged) changed.push('fba_fulfillment')
  if (
    prev.storage_per_cuft_monthly.standard !== next.storage_per_cuft_monthly.standard ||
    prev.storage_per_cuft_monthly.oversize !== next.storage_per_cuft_monthly.oversize
  ) {
    changed.push('storage')
  }
  return changed
}
