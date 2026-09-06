/* ─── SellerRadar margin / impact engine — pure, typed, no I/O ────────────
   Diff engine (spec §4): current vs previous schedule → per-SKU impact =
   (new_fee − old_fee) × est. monthly units. Output speaks dollars (spec §3
   criterion 4): "This change reduces your margin by X% on Y SKUs,
   estimated $Z/year". All figures are estimates — reports carry the
   "verify against your settlement reports" label (liability shrinker). */

import type { SellerSkuInput } from './csv'
import {
  classifySizeTier,
  computeStoredFees,
  cubicFeet,
  diffFeeTypes,
  FeeBreakdown,
  FeeSchedule,
  FeeType,
  SizeTier,
} from './fees'

export interface SkuImpact {
  readonly sku: string
  readonly asin: string | null
  readonly category: string
  readonly price: number
  readonly cogs: number
  readonly monthlyUnits: number
  readonly sizeTier: SizeTier
  readonly feesOld: FeeBreakdown
  readonly feesNew: FeeBreakdown
  /** USD fee delta per unit sold (new − old; positive = margin loss). */
  readonly feeDeltaPerUnit: number
  /** USD per month this fee change costs on this SKU. */
  readonly monthlyImpact: number
  /** USD per year. */
  readonly annualImpact: number
  /** Margin % before/after the change: (price − cogs − fees) / price. */
  readonly marginOldPct: number
  readonly marginNewPct: number
}

export interface CatalogImpact {
  readonly perSku: readonly SkuImpact[]
  readonly totals: {
    readonly skuCount: number
    readonly affectedCount: number
    readonly monthlyImpact: number
    readonly annualImpact: number
    /** Average margin-percentage-point change across affected SKUs. */
    readonly avgMarginDeltaPct: number
  }
  readonly changedFeeTypes: readonly FeeType[]
  readonly scheduleFrom: { version: string; effective_date: string; source_url: string }
  readonly scheduleTo: { version: string; effective_date: string; source_url: string }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function marginPct(price: number, cogs: number, fees: number): number {
  if (price <= 0) return 0
  return round2(((price - cogs - fees) / price) * 100)
}

export function analyzeCatalog(
  skus: readonly SellerSkuInput[],
  prev: FeeSchedule,
  next: FeeSchedule,
): CatalogImpact {
  return analyzeStoredCatalog(
    skus.map((sku) => ({
      sku: sku.sku,
      asin: sku.asin,
      category: sku.category,
      price: sku.price,
      cogs: sku.cogs,
      monthlyUnits: sku.monthlyUnits,
      sizeTier: classifySizeTier(sku),
      volumeCuFt: cubicFeet(sku),
    })),
    prev,
    next,
  )
}

/**
 * A SKU row as persisted in sellerradar_skus: raw dimensions/weight are not
 * stored, only the classified size_tier — volumeCuFt is recovered from the
 * stored storage fee (fees_old.storage ÷ the schedule's storage rate, 0 when
 * the SKU never had dimensions). Used by the monitor weekly re-scan, which
 * re-runs the diff on a stored catalog instead of a fresh CSV.
 */
export interface StoredSkuInput {
  readonly sku: string
  readonly asin: string | null
  readonly category: string
  readonly price: number
  readonly cogs: number
  readonly monthlyUnits: number
  readonly sizeTier: SizeTier
  readonly volumeCuFt: number
}

export function analyzeStoredCatalog(
  skus: readonly StoredSkuInput[],
  prev: FeeSchedule,
  next: FeeSchedule,
): CatalogImpact {
  const perSku: SkuImpact[] = skus.map((sku) => {
    const feesOld = computeStoredFees(sku, prev)
    const feesNew = computeStoredFees(sku, next)
    const feeDeltaPerUnit = round2(feesNew.total - feesOld.total)
    const monthlyImpact = round2(feeDeltaPerUnit * sku.monthlyUnits)
    return {
      sku: sku.sku,
      asin: sku.asin,
      category: sku.category,
      price: sku.price,
      cogs: sku.cogs,
      monthlyUnits: sku.monthlyUnits,
      sizeTier: feesNew.sizeTier,
      feesOld,
      feesNew,
      feeDeltaPerUnit,
      monthlyImpact,
      annualImpact: round2(monthlyImpact * 12),
      marginOldPct: marginPct(sku.price, sku.cogs, feesOld.total),
      marginNewPct: marginPct(sku.price, sku.cogs, feesNew.total),
    }
  })

  const affected = perSku.filter((s) => s.feeDeltaPerUnit !== 0)
  const monthlyImpact = round2(affected.reduce((sum, s) => sum + s.monthlyImpact, 0))
  const avgMarginDeltaPct =
    affected.length > 0
      ? round2(affected.reduce((sum, s) => sum + (s.marginNewPct - s.marginOldPct), 0) / affected.length)
      : 0

  return {
    perSku,
    totals: {
      skuCount: perSku.length,
      affectedCount: affected.length,
      monthlyImpact,
      annualImpact: round2(monthlyImpact * 12),
      avgMarginDeltaPct,
    },
    changedFeeTypes: diffFeeTypes(prev, next),
    scheduleFrom: { version: prev.version, effective_date: prev.effective_date, source_url: prev.source_url },
    scheduleTo: { version: next.version, effective_date: next.effective_date, source_url: next.source_url },
  }
}
