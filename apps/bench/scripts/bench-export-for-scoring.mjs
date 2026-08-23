/**
 * bench-export-for-scoring.mjs
 *
 * Pulls all bench_evaluations rows where scores are NULL, joins them with
 * the benchmark JSON files to add prompt + gold_standard, and writes a CSV
 * ready for Moses to fill in Excel / Google Sheets.
 *
 *   node apps/bench/scripts/bench-export-for-scoring.mjs [--set mica-bench]
 *
 * Without --set: exports all 75 rows.
 * With --set:    exports only that benchmark (25 rows).
 *
 * Output: bench-scoring-workbook.csv at the monorepo root.
 *
 * Env (vault at C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..', '..', '..')
const dataDir = join(here, '..', 'web', 'data', 'benchmarks', 'v1')

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
  // vault not found; rely on env vars already set
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_KEY. Add to vault or set in env.')
  process.exit(1)
}

// ── args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const setSlugArg = (() => { const i = args.indexOf('--set'); return i >= 0 ? args[i + 1] : null })()

// ── load benchmark JSONs ──────────────────────────────────────────────────────
const SLUGS = ['mica-bench', 'dpa-bench', 'vara-bench']
const benchmarks = {}
for (const slug of SLUGS) {
  const parsed = JSON.parse(readFileSync(join(dataDir, `${slug}.json`), 'utf8'))
  benchmarks[slug] = {}
  for (const item of parsed.items) {
    benchmarks[slug][item.id] = {
      prompt: item.prompt,
      gold_standard: item.gold_standard,
      practice_area: item.practice_area,
      difficulty: item.difficulty,
      authority_refs: item.authority_refs ?? [],
      probes: item.probes ?? [],
    }
  }
}

// ── fetch rows from Supabase ──────────────────────────────────────────────────
const slugFilter = setSlugArg ? `&benchmark_slug=eq.${encodeURIComponent(setSlugArg)}` : ''
const url =
  `${SUPABASE_URL}/rest/v1/bench_evaluations` +
  `?select=id,benchmark_slug,item_id,benchmark_version,model_output,mode,` +
  `score_jurisdictional,score_correctness,score_completeness,score_reasoning,` +
  `score_hallucination,severity,taxonomy,gold_correction,rationale,created_at` +
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
console.log(`Fetched ${rows.length} rows from bench_evaluations`)

// ── build CSV ─────────────────────────────────────────────────────────────────
function csvCell(v) {
  if (v === null || v === undefined) return ''
  const s = Array.isArray(v) ? v.join(',') : String(v)
  // quote if contains comma, newline, or double-quote
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

const COLUMNS = [
  'id',                      // Supabase row UUID — needed for import
  'benchmark_slug',
  'item_id',
  'practice_area',           // from JSON
  'difficulty',              // from JSON (1-3)
  'authority_refs',          // from JSON (semicolon-joined)
  'probes',                  // from JSON — expected failure modes
  'prompt',                  // from JSON
  'gold_standard',           // from JSON — the correct answer
  'model_output',            // from Supabase — what the AI said
  // ── fill these in ──
  'score_jurisdictional',    // 0-5
  'score_correctness',       // 0-5
  'score_completeness',      // 0-5
  'score_reasoning',         // 0-5
  'score_hallucination',     // 0-5  (5=no fabrication, 0=fabricated)
  'severity',                // critical | high | medium | low | none
  'taxonomy',                // comma-separated: hallucinated_authority | misstatement | omission | wrong_jurisdiction | bad_reasoning | unreliable_citation
  'gold_correction',         // corrected answer for failed items (leave blank if AI was right)
  'rationale',               // one-line scoring note
  // ── read-only context ──
  'mode',
  'benchmark_version',
  'created_at',
]

const headerLine = COLUMNS.join(',')

const dataLines = rows.map((row) => {
  const meta = benchmarks[row.benchmark_slug]?.[row.item_id] ?? {}
  const enriched = {
    id: row.id,
    benchmark_slug: row.benchmark_slug,
    item_id: row.item_id,
    practice_area: meta.practice_area ?? '',
    difficulty: meta.difficulty ?? '',
    authority_refs: (meta.authority_refs ?? []).join('; '),
    probes: (meta.probes ?? []).join(', '),
    prompt: meta.prompt ?? '',
    gold_standard: meta.gold_standard ?? '',
    model_output: row.model_output ?? '',
    score_jurisdictional: row.score_jurisdictional ?? '',
    score_correctness: row.score_correctness ?? '',
    score_completeness: row.score_completeness ?? '',
    score_reasoning: row.score_reasoning ?? '',
    score_hallucination: row.score_hallucination ?? '',
    severity: row.severity ?? '',
    taxonomy: Array.isArray(row.taxonomy) ? row.taxonomy.join(', ') : (row.taxonomy ?? ''),
    gold_correction: row.gold_correction ?? '',
    rationale: row.rationale ?? '',
    mode: row.mode,
    benchmark_version: row.benchmark_version,
    created_at: row.created_at,
  }
  return COLUMNS.map((c) => csvCell(enriched[c])).join(',')
})

const csv = [headerLine, ...dataLines].join('\r\n')
const outPath = join(repoRoot, 'bench-scoring-workbook.csv')
writeFileSync(outPath, csv, 'utf8')

console.log(`\nWrote ${rows.length} rows → ${outPath}`)
console.log('\nOpen in Excel or Google Sheets. Fill in columns:')
console.log('  score_jurisdictional, score_correctness, score_completeness,')
console.log('  score_reasoning, score_hallucination  (each 0-5)')
console.log('  severity  (critical | high | medium | low | none)')
console.log('  taxonomy  (comma-separated tags, blank if no errors)')
console.log('  gold_correction  (leave blank if AI output was correct)')
console.log('  rationale  (one-line note, optional)')
console.log('\nDo NOT edit: id, benchmark_slug, item_id, model_output, or read-only columns.')
console.log('\nWhen done: node apps/bench/scripts/bench-import-scores.mjs bench-scoring-workbook.csv')
