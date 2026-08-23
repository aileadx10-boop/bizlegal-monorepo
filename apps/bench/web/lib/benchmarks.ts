/**
 * Benchmark registry — typed loader over the versioned JSON sets in
 * web/data/benchmarks/. The JSON files ARE the moat's spine: git-versioned,
 * jurisdiction-tagged, expert-review-gated (reviewed_by stays null until the
 * Moses legal-review gate in docs/workflows/wf_benchmark_authoring.md passes).
 *
 * Contamination control: only items with `released: true` ever render on
 * public pages. Held-out items exist solely for paid engagements — publishing
 * a full test set would let vendors train on it and void the measurement.
 */

import micaRaw from '@/data/benchmarks/v1/mica-bench.json'
import dpaRaw from '@/data/benchmarks/v1/dpa-bench.json'
import varaRaw from '@/data/benchmarks/v1/vara-bench.json'
import type { TaxonomyTag } from './rubric-engine'

export interface BenchmarkItem {
  readonly id: string
  readonly practice_area: string
  /** 1 = foundational, 2 = applied, 3 = adversarial/edge. */
  readonly difficulty: 1 | 2 | 3
  /** Only released items appear on public pages. */
  readonly released: boolean
  readonly prompt: string
  readonly gold_standard: string
  readonly authority_refs: readonly string[]
  /** Failure modes this item is designed to surface. */
  readonly probes: readonly TaxonomyTag[]
}

export interface Benchmark {
  readonly slug: string
  readonly name: string
  /** The one-line standard claim (micro1 pattern). */
  readonly claim: string
  readonly version: string
  readonly status: 'draft' | 'reviewed' | 'published'
  readonly jurisdiction: string
  readonly regime: string
  readonly practice_areas: readonly string[]
  readonly author: string
  readonly reviewed_by: string | null
  readonly created: string
  readonly items: readonly BenchmarkItem[]
}

function asBenchmark(raw: unknown): Benchmark {
  // JSON shape is owned by this repo and validated by scripts/bench-engine-check.mjs;
  // the cast is a boundary annotation, not a runtime trust decision.
  return raw as Benchmark
}

export const BENCHMARKS: readonly Benchmark[] = [
  asBenchmark(micaRaw),
  asBenchmark(dpaRaw),
  asBenchmark(varaRaw),
]

export function getBenchmark(slug: string): Benchmark | undefined {
  return BENCHMARKS.find((b) => b.slug === slug)
}

export function releasedItems(b: Benchmark): readonly BenchmarkItem[] {
  return b.items.filter((i) => i.released)
}

export function heldOutCount(b: Benchmark): number {
  return b.items.length - releasedItems(b).length
}
