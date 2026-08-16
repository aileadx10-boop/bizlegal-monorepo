/**
 * Deterministic self-check for the bench measurement engine + benchmark data.
 * No test runner needed: fixed inputs → exact expected outputs, plain node.
 *
 *   node apps/bench/scripts/bench-engine-check.mjs
 *
 * Re-implements the (deliberately simple, documented) formulas from
 * web/lib/rubric-engine.ts and web/lib/inter-rater.ts and cross-checks a
 * hand-computed fixture, then validates the benchmark JSON sets structurally.
 * If a formula in the TS engine changes, this file must change with it —
 * that is the point: silent metric drift breaks sold reports.
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = join(here, '..', 'web', 'data', 'benchmarks', 'v1')

let failures = 0
function check(name, actual, expected) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) {
    console.log(`  ok  ${name}`)
  } else {
    failures += 1
    console.error(`FAIL  ${name}\n      expected ${e}\n      actual   ${a}`)
  }
}

// ── fixture: 4 hand-computed evaluations ─────────────────────────────
// totals: 25, 15, 10, 5  → mean 13.8 (1dp) → accuracy round(13.8/25*100)=55%
const evals = [
  { itemId: 'a', practiceArea: 'x', severity: 'none', taxonomy: [], scores: { jurisdictional: 5, correctness: 5, completeness: 5, reasoning: 5, hallucination: 5 } },
  { itemId: 'b', practiceArea: 'x', severity: 'medium', taxonomy: ['omission'], scores: { jurisdictional: 3, correctness: 3, completeness: 2, reasoning: 3, hallucination: 4 } },
  { itemId: 'c', practiceArea: 'y', severity: 'critical', taxonomy: ['hallucinated_authority'], scores: { jurisdictional: 2, correctness: 2, completeness: 2, reasoning: 2, hallucination: 2 } },
  { itemId: 'd', practiceArea: 'y', severity: 'high', taxonomy: ['unreliable_citation', 'misstatement'], scores: { jurisdictional: 1, correctness: 1, completeness: 1, reasoning: 1, hallucination: 1 } },
]

// mirror of rubric-engine formulas
const DIMS = ['jurisdictional', 'correctness', 'completeness', 'reasoning', 'hallucination']
const total = (e) => DIMS.reduce((s, d) => s + e.scores[d], 0)
const totals = evals.map(total)
const meanTotal = Math.round((totals.reduce((a, b) => a + b, 0) / evals.length) * 10) / 10
const accuracyPct = Math.round((meanTotal / 25) * 100)
const isHall = (e) => e.taxonomy.includes('hallucinated_authority') || e.scores.hallucination <= 2
const pct = (n, d) => (d === 0 ? 0 : Math.round((n / d) * 100))

console.log('rubric-engine formula fixture:')
check('totals', totals, [25, 15, 10, 5])
check('meanTotal', meanTotal, 13.8)
check('accuracyPct', accuracyPct, 55)
// c (tag + score 2) and d (score 1) hallucinate → 2/4 = 50
check('hallucinationRatePct', pct(evals.filter(isHall).length, 4), 50)
// only c is critical → 25
check('criticalErrorRatePct', pct(evals.filter((e) => e.severity === 'critical').length, 4), 25)
// c (hallucinated_authority) + d (unreliable_citation) → 100 - 50 = 50
check(
  'citationReliabilityPct',
  100 - pct(evals.filter((e) => e.taxonomy.includes('unreliable_citation') || e.taxonomy.includes('hallucinated_authority')).length, 4),
  50,
)
// only b has omission → 25
check('missingLawRatePct', pct(evals.filter((e) => e.taxonomy.includes('omission')).length, 4), 25)

// ── inter-rater fixture ──────────────────────────────────────────────
// pair 1: identical → 5 exact. pair 2: deltas [1,1,0,2,0] → 2 exact, 4 adjacent.
const pairA = { a: evals[0], b: { ...evals[0] } }
const pairB = {
  a: { scores: { jurisdictional: 3, correctness: 3, completeness: 2, reasoning: 3, hallucination: 4 } },
  b: { scores: { jurisdictional: 4, correctness: 2, completeness: 2, reasoning: 5, hallucination: 4 } },
}
let exact = 0
let adjacent = 0
for (const pair of [pairA, pairB]) {
  for (const d of DIMS) {
    const delta = Math.abs(pair.a.scores[d] - pair.b.scores[d])
    if (delta === 0) { exact += 1; adjacent += 1 } else if (delta === 1) { adjacent += 1 }
  }
}
console.log('inter-rater fixture:')
check('exactPct', pct(exact, 10), 70)
check('adjacentPct', pct(adjacent, 10), 90)

// ── benchmark JSON structural validation ─────────────────────────────
const REQUIRED_ITEM_FIELDS = ['id', 'practice_area', 'difficulty', 'released', 'prompt', 'gold_standard', 'authority_refs', 'probes']
const VALID_PROBES = new Set(['hallucinated_authority', 'misstatement', 'omission', 'wrong_jurisdiction', 'bad_reasoning', 'unreliable_citation'])

console.log('benchmark sets:')
for (const file of ['mica-bench.json', 'dpa-bench.json', 'vara-bench.json']) {
  const b = JSON.parse(readFileSync(join(dataDir, file), 'utf8'))
  const ids = new Set()
  let problems = []
  for (const item of b.items) {
    for (const f of REQUIRED_ITEM_FIELDS) {
      if (item[f] === undefined) problems.push(`${item.id ?? '?'}: missing ${f}`)
    }
    if (ids.has(item.id)) problems.push(`duplicate id ${item.id}`)
    ids.add(item.id)
    if (![1, 2, 3].includes(item.difficulty)) problems.push(`${item.id}: bad difficulty`)
    if (!b.practice_areas.includes(item.practice_area)) problems.push(`${item.id}: practice_area not registered`)
    for (const p of item.probes) {
      if (!VALID_PROBES.has(p)) problems.push(`${item.id}: unknown probe ${p}`)
    }
    if (item.authority_refs.length === 0) problems.push(`${item.id}: no authority refs`)
  }
  const released = b.items.filter((i) => i.released).length
  check(`${b.slug}: 25 items`, b.items.length, 25)
  check(`${b.slug}: structural problems`, problems, [])
  check(`${b.slug}: held-out majority`, released <= 5, true)
  check(`${b.slug}: review gate intact (reviewed_by null while draft)`, b.status !== 'draft' || b.reviewed_by === null, true)
}

if (failures > 0) {
  console.error(`\n${failures} check(s) FAILED`)
  process.exit(1)
}
console.log('\nAll engine + benchmark checks passed.')
