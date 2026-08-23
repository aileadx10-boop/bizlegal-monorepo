/**
 * bench-compute-metrics.mjs
 *
 * Reads scored bench_evaluations rows from Supabase and prints
 * EngagementMetrics per benchmark set (the same numbers the /sample
 * page will display).
 *
 *   node apps/bench/scripts/bench-compute-metrics.mjs
 *   node apps/bench/scripts/bench-compute-metrics.mjs --set mica-bench
 *
 * Prints a JSON object per set: { itemsScored, meanTotal, accuracyPct,
 * hallucinationRatePct, criticalErrorRatePct, citationReliabilityPct,
 * missingLawRatePct, dimensions[], byPracticeArea[], taxonomyHistogram,
 * severityHistogram }.
 *
 * Rows where score_jurisdictional is NULL are excluded. Exits non-zero
 * if any set has zero scored rows.
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY (loaded from vault).
 */

import { readFileSync } from 'node:fs'

// ── load vault ──────────────────────────────────────────────────────────────
const vaultPath = 'C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt'
try {
  const vault = readFileSync(vaultPath, 'utf8')
  for (const line of vault.split('\n')) {
    const idx = line.indexOf('=')
    if (idx > 0) {
      const k = line.slice(0, idx).trim()
      const v = line.slice(idx + 1).trim()
      if (k && v) process.env[k] = process.env[k] ?? v
    }
  }
} catch {
  // vault not found
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_KEY.')
  process.exit(1)
}

// ── args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const setSlugArg = (() => { const i = args.indexOf('--set'); return i >= 0 ? args[i + 1] : null })()
const jsonOut = args.includes('--json')

// ── fetch scored rows ────────────────────────────────────────────────────────
const slugFilter = setSlugArg ? `&benchmark_slug=eq.${encodeURIComponent(setSlugArg)}` : ''
const url =
  `${SUPABASE_URL}/rest/v1/bench_evaluations` +
  `?select=id,benchmark_slug,item_id,model_output,score_jurisdictional,` +
  `score_correctness,score_completeness,score_reasoning,score_hallucination,` +
  `severity,taxonomy,scored_at` +
  `&score_jurisdictional=not.is.null` +
  `&order=benchmark_slug.asc,item_id.asc` +
  slugFilter

const res = await fetch(url, {
  headers: {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'user-agent': 'bizlegal-agent/1.0',
  },
})
if (!res.ok) {
  console.error('Supabase error:', res.status, await res.text())
  process.exit(1)
}
const rows = await res.json()
console.error(`Fetched ${rows.length} scored rows${setSlugArg ? ` for ${setSlugArg}` : ''}\n`)

// ── engine: mirror of rubric-engine.ts ───────────────────────────────────────
const RUBRIC_DIMENSIONS = ['jurisdictional', 'correctness', 'completeness', 'reasoning', 'hallucination']
const MAX_DIMENSION_SCORE = 5
const MAX_TOTAL_SCORE = MAX_DIMENSION_SCORE * RUBRIC_DIMENSIONS.length
const HALLUCINATION_SCORE_THRESHOLD = 2
const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low', 'none']

const clamp = (v) => (Number.isNaN(v) ? 0 : Math.min(Math.max(Math.round(v), 0), MAX_DIMENSION_SCORE))
const total = (e) => RUBRIC_DIMENSIONS.reduce((s, d) => s + clamp(e.scores[d]), 0)
const round = (v, dp) => { const f = 10 ** dp; return Math.round(v * f) / f }
const pct = (n, d) => (d === 0 ? 0 : Math.round((n / d) * 100))

// We need practice_area for the byPracticeArea breakdown — load from benchmark JSONs
const { readdirSync } = await import('node:fs')
const { join, dirname } = await import('node:path')
const { fileURLToPath } = await import('node:url')
// apps/bench/scripts → apps/bench → apps → monorepo root (3 levels up)
const here = dirname(fileURLToPath(import.meta.url))
const dataDir = join(here, '..', 'web', 'data', 'benchmarks', 'v1')
const practiceAreaByItem = {}
for (const file of readdirSync(dataDir)) {
  if (!file.endsWith('.json')) continue
  const b = JSON.parse(readFileSync(join(dataDir, file), 'utf8'))
  for (const item of b.items) practiceAreaByItem[item.id] = item.practice_area
}

const isHall = (e) =>
  (e.taxonomy || []).includes('hallucinated_authority') || clamp(e.scores.hallucination) <= HALLUCINATION_SCORE_THRESHOLD
const hasUnrel = (e) =>
  (e.taxonomy || []).includes('unreliable_citation') || (e.taxonomy || []).includes('hallucinated_authority')

function compute(evaluations) {
  const n = evaluations.length
  const totals = evaluations.map(total)
  const meanTotal = n === 0 ? 0 : round(totals.reduce((a, b) => a + b, 0) / n, 1)

  const dimensions = RUBRIC_DIMENSIONS.map((d) => ({
    dimension: d,
    mean: n === 0 ? 0 : round(evaluations.reduce((s, e) => s + clamp(e.scores[d]), 0) / n, 2),
  }))

  const areaMap = new Map()
  for (const e of evaluations) {
    const pa = e.practiceArea || 'unknown'
    const slot = areaMap.get(pa) ?? { items: 0, sum: 0 }
    areaMap.set(pa, { items: slot.items + 1, sum: slot.sum + total(e) })
  }
  const byPracticeArea = [...areaMap.entries()]
    .map(([practiceArea, { items, sum }]) => ({
      practiceArea,
      items,
      meanTotal: round(sum / items, 1),
    }))
    .sort((a, b) => a.practiceArea.localeCompare(b.practiceArea))

  const tagCounts = new Map()
  for (const e of evaluations) {
    for (const t of e.taxonomy || []) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
  }
  const taxonomyHistogram = [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))

  const sevCounts = new Map()
  for (const e of evaluations) sevCounts.set(e.severity, (sevCounts.get(e.severity) ?? 0) + 1)
  const severityHistogram = SEVERITY_ORDER
    .filter((s) => sevCounts.has(s))
    .map((severity) => ({ severity, count: sevCounts.get(severity) ?? 0 }))

  return {
    itemsScored: n,
    meanTotal,
    accuracyPct: n === 0 ? 0 : Math.round((meanTotal / MAX_TOTAL_SCORE) * 100),
    hallucinationRatePct: pct(evaluations.filter(isHall).length, n),
    criticalErrorRatePct: pct(evaluations.filter((e) => e.severity === 'critical').length, n),
    citationReliabilityPct: n === 0 ? 0 : 100 - pct(evaluations.filter(hasUnrel).length, n),
    missingLawRatePct: pct(evaluations.filter((e) => (e.taxonomy || []).includes('omission')).length, n),
    dimensions,
    byPracticeArea,
    taxonomyHistogram,
    severityHistogram,
  }
}

// ── group + compute ──────────────────────────────────────────────────────────
const bySet = new Map()
for (const r of rows) {
  const slot = bySet.get(r.benchmark_slug) ?? []
  slot.push({
    itemId: r.item_id,
    practiceArea: practiceAreaByItem[r.item_id] ?? 'unknown',
    severity: r.severity,
    taxonomy: r.taxonomy ?? [],
    scores: {
      jurisdictional: Number(r.score_jurisdictional),
      correctness: Number(r.score_correctness),
      completeness: Number(r.score_completeness),
      reasoning: Number(r.score_reasoning),
      hallucination: Number(r.score_hallucination),
    },
  })
  bySet.set(r.benchmark_slug, slot)
}

const results = {}
let zeroScored = 0
for (const [slug, evals] of [...bySet.entries()].sort()) {
  const m = compute(evals)
  results[slug] = m
  if (m.itemsScored === 0) zeroScored++

  if (!jsonOut) {
    console.log(`━━━ ${slug} ━━━`)
    console.log(`  items:           ${m.itemsScored}`)
    console.log(`  mean total:      ${m.meanTotal.toFixed(1)} / 25`)
    console.log(`  accuracy:        ${m.accuracyPct}%`)
    console.log(`  hallucination:   ${m.hallucinationRatePct}%`)
    console.log(`  critical errors: ${m.criticalErrorRatePct}%`)
    console.log(`  citation rel.:   ${m.citationReliabilityPct}%`)
    console.log(`  missing law:     ${m.missingLawRatePct}%`)
    console.log(`  dimensions:`)
    for (const d of m.dimensions) console.log(`    ${d.dimension.padEnd(18)} ${d.mean.toFixed(2)} / 5`)
    if (m.byPracticeArea.length) {
      console.log(`  by practice area:`)
      for (const p of m.byPracticeArea) console.log(`    ${p.practiceArea.padEnd(22)} n=${String(p.items).padStart(2)}  mean=${p.meanTotal.toFixed(1)}/25`)
    }
    if (m.taxonomyHistogram.length) {
      console.log(`  taxonomy: ${m.taxonomyHistogram.map((t) => `${t.tag}=${t.count}`).join('  ')}`)
    }
    console.log(`  severity:  ${m.severityHistogram.map((s) => `${s.severity}=${s.count}`).join('  ')}`)
    console.log('')
  }
}

if (jsonOut) {
  console.log(JSON.stringify(results, null, 2))
}

if (zeroScored > 0) {
  console.error(`\nWARN: ${zeroScored} benchmark set(s) have zero scored rows. Score them, then re-run.`)
  process.exit(2)
}
