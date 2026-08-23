/**
 * Bench self-audit harness (wf_self_benchmark) — runs a benchmark's prompts
 * against a target model/surface and stores the raw outputs for scoring.
 *
 *   node apps/bench/scripts/bench-self-audit.mjs --set mica-bench [--target anthropic] [--dry-run]
 *
 * Targets:
 *   anthropic — the base model our fleet surfaces (DocAI et al.) build on,
 *               prompted cold: no retrieval, no guardrails. This measures the
 *               raw-capability floor our products must beat, and produces the
 *               first honest "/sample" dataset ("we measured our own stack").
 *
 * Output rows land in bench_evaluations as mode='ai_prescored' with NULL
 * scores — scoring stays with experts/Moses (wf_diagnostic_audit). With
 * --dry-run (or when env is missing) outputs are written to a local JSONL
 * instead, so the run is never blocked on infrastructure.
 *
 * Env (names only, values in the canonical vault): ANTHROPIC_API_KEY,
 * NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = join(here, '..', 'web', 'data', 'benchmarks', 'v1')

const args = process.argv.slice(2)
function argValue(flag, fallback) {
  const i = args.indexOf(flag)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}
const setSlug = argValue('--set', 'mica-bench')
const target = argValue('--target', 'anthropic')
const dryRun = args.includes('--dry-run')

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

const MODEL = 'claude-sonnet-5'
const SYSTEM_PROMPT =
  'You are a legal AI assistant. Answer the question accurately for the jurisdiction it concerns. Cite the specific legal authority you rely on.'

const benchmark = JSON.parse(readFileSync(join(dataDir, `${setSlug}.json`), 'utf8'))

async function askAnthropic(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'user-agent': 'bizlegal-agent/1.0',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  return data.content?.map((c) => c.text ?? '').join('') ?? ''
}

async function storeRow(row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/bench_evaluations`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
      'user-agent': 'bizlegal-agent/1.0',
    },
    body: JSON.stringify(row),
  })
  if (!res.ok) throw new Error(`supabase ${res.status}: ${(await res.text()).slice(0, 200)}`)
}

const canStore = !dryRun && SUPABASE_URL && SUPABASE_KEY
const localRows = []

if (!ANTHROPIC_KEY) {
  console.error('ANTHROPIC_API_KEY missing — cannot query the target. Aborting (nothing was invented).')
  process.exit(1)
}

console.log(`self-audit: ${benchmark.name} v${benchmark.version} → target=${target} model=${MODEL}`)
console.log(`storage: ${canStore ? 'bench_evaluations (supabase)' : 'local JSONL (dry-run or env missing)'}`)

let done = 0
for (const item of benchmark.items) {
  const output = await askAnthropic(item.prompt)
  const row = {
    benchmark_slug: benchmark.slug,
    item_id: item.id,
    benchmark_version: benchmark.version,
    model_output: output,
    mode: 'ai_prescored',
    engagement_id: null,
  }
  if (canStore) {
    await storeRow(row)
  } else {
    localRows.push({ ...row, prompt: item.prompt, gold_standard: item.gold_standard })
  }
  done += 1
  console.log(`  [${done}/${benchmark.items.length}] ${item.id} — ${output.length} chars`)
}

if (!canStore) {
  const out = join(here, `self-audit-${setSlug}-${target}.jsonl`)
  writeFileSync(out, localRows.map((r) => JSON.stringify(r)).join('\n'))
  console.log(`wrote ${localRows.length} rows → ${out}`)
}

console.log(
  '\nNext (wf_self_benchmark): score the outputs against the rubric (expert/Moses), ' +
    'then compute metrics with the rubric engine and update /sample with the anonymized snapshot.',
)
