/**
 * bench-import-scores.mjs
 *
 * Reads a scored CSV (output of bench-export-for-scoring.mjs, filled in by
 * Moses) and PATCHes each bench_evaluations row in Supabase with the 5 rubric
 * scores, severity, taxonomy, gold_correction, and rationale.
 *
 *   node apps/bench/scripts/bench-import-scores.mjs bench-scoring-workbook.csv
 *
 * Only rows where score_jurisdictional is a number are updated — blank rows
 * are skipped so partial-save is safe (run multiple times, converges).
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY (loaded from vault).
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

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
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_KEY.')
  process.exit(1)
}

// ── args ─────────────────────────────────────────────────────────────────────
const csvPath = process.argv[2]
if (!csvPath) {
  console.error('Usage: node bench-import-scores.mjs <path-to-csv>')
  process.exit(1)
}
const csvContent = readFileSync(resolve(csvPath), 'utf8')

// ── CSV parser (handles quoted fields with embedded commas + newlines) ────────
function parseCsv(text) {
  const rows = []
  let cur = []
  let field = ''
  let inQuote = false
  const chars = text.replace(/\r\n/g, '\n')

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]
    if (inQuote) {
      if (c === '"') {
        if (chars[i + 1] === '"') { field += '"'; i++ }
        else inQuote = false
      } else {
        field += c
      }
    } else {
      if (c === '"') {
        inQuote = true
      } else if (c === ',') {
        cur.push(field); field = ''
      } else if (c === '\n') {
        cur.push(field); field = ''
        rows.push(cur); cur = []
      } else {
        field += c
      }
    }
  }
  if (field || cur.length) { cur.push(field); rows.push(cur) }
  return rows
}

const [headerRow, ...dataRows] = parseCsv(csvContent)
const headers = headerRow.map((h) => h.trim())
const col = (row, name) => row[headers.indexOf(name)]?.trim() ?? ''

const VALID_SEVERITIES = new Set(['critical', 'high', 'medium', 'low', 'none'])
const VALID_TAGS = new Set([
  'hallucinated_authority',
  'misstatement',
  'omission',
  'wrong_jurisdiction',
  'bad_reasoning',
  'unreliable_citation',
])

// ── process rows ─────────────────────────────────────────────────────────────
let updated = 0
let skipped = 0
let errors = 0

for (const row of dataRows) {
  if (row.length < 3) continue // blank trailing line
  const id = col(row, 'id')
  const itemId = col(row, 'item_id')
  const rawScore = col(row, 'score_jurisdictional')

  if (!id || !rawScore || isNaN(Number(rawScore))) {
    skipped++
    continue
  }

  const scoreJ = Number(rawScore)
  const scoreC = Number(col(row, 'score_correctness'))
  const scoreP = Number(col(row, 'score_completeness'))
  const scoreR = Number(col(row, 'score_reasoning'))
  const scoreH = Number(col(row, 'score_hallucination'))

  for (const [label, val] of [
    ['score_jurisdictional', scoreJ],
    ['score_correctness', scoreC],
    ['score_completeness', scoreP],
    ['score_reasoning', scoreR],
    ['score_hallucination', scoreH],
  ]) {
    if (isNaN(val) || val < 0 || val > 5) {
      console.warn(`  WARN ${itemId}: ${label}=${val} out of range 0-5 — skipping row`)
      errors++
      continue
    }
  }

  const severityRaw = col(row, 'severity').toLowerCase()
  const severity = VALID_SEVERITIES.has(severityRaw) ? severityRaw : null
  if (!severity) {
    console.warn(`  WARN ${itemId}: severity="${severityRaw}" invalid — must be critical|high|medium|low|none`)
    errors++
    continue
  }

  const taxonomyRaw = col(row, 'taxonomy')
  const taxonomy = taxonomyRaw
    ? taxonomyRaw.split(',').map((t) => t.trim()).filter((t) => {
        if (!t) return false
        if (!VALID_TAGS.has(t)) {
          console.warn(`  WARN ${itemId}: unknown taxonomy tag "${t}" — dropped`)
          return false
        }
        return true
      })
    : []

  const patch = {
    score_jurisdictional: scoreJ,
    score_correctness: scoreC,
    score_completeness: scoreP,
    score_reasoning: scoreR,
    score_hallucination: scoreH,
    severity,
    taxonomy,
    scored_at: new Date().toISOString(),
  }
  const goldCorrection = col(row, 'gold_correction')
  const rationale = col(row, 'rationale')
  if (goldCorrection) patch.gold_correction = goldCorrection
  if (rationale) patch.rationale = rationale

  const res = await fetch(`${SUPABASE_URL}/rest/v1/bench_evaluations?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
      'user-agent': 'bizlegal-agent/1.0',
    },
    body: JSON.stringify(patch),
  })

  if (!res.ok) {
    console.error(`  ERROR ${itemId}: HTTP ${res.status} — ${(await res.text()).slice(0, 120)}`)
    errors++
  } else {
    console.log(`  ok  ${itemId} [${scoreJ}/${scoreC}/${scoreP}/${scoreR}/${scoreH}] ${severity}`)
    updated++
  }
}

console.log(`\nDone: ${updated} updated, ${skipped} skipped (no scores), ${errors} errors`)

if (updated > 0) {
  console.log('\nNext: node apps/bench/scripts/bench-compute-metrics.mjs')
}
if (skipped > 0) {
  console.log(`${skipped} rows still unscored — safe to re-run after filling them in.`)
}
