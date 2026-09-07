/**
 * Public benchmarks the report compares against.
 *
 * The `verified` gate mirrors AE_DUBAI_RESIDENTIAL.reviewed in the deal
 * engine and the byline rule that a number without a checked primary source
 * does not appear: while it is false the report prints "benchmark pending
 * verification" instead of the figures. Moses flips it after reading the
 * primary PDF (Clio's site refuses automated fetches).
 */
import type { Benchmark } from './types'

export const CLIO_LEGAL_TRENDS_2025: Benchmark & { readonly verified: boolean } = {
  utilizationPct: 38,
  realizationPct: 88,
  collectionPct: 93,
  source: {
    title: 'Clio Legal Trends Report 2025 (Law Firm KPIs & Benchmarks page)',
    url: 'https://www.clio.com/resources/legal-trends/benchmarks/',
    edition: 2025,
  },
  // Verified 2026-09-07 on Clio's benchmarks page, read in Moses's own browser
  // (the site refuses automated fetches): "38% ... in 2025", "88% ... in 2025",
  // "93% ... in 2025" for utilization, realization and collection respectively.
  verified: true,
}

export function activeBenchmark(): Benchmark | null {
  const b = CLIO_LEGAL_TRENDS_2025
  if (!b.verified) return null
  return { utilizationPct: b.utilizationPct, realizationPct: b.realizationPct, collectionPct: b.collectionPct, source: b.source }
}
