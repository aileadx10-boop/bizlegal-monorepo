#!/usr/bin/env node
/**
 * generate-gap-visuals.mjs — Visual enrichment for SEO gap pages.
 *
 * For every row in public.gap_pages that has no hero_image_url yet, this
 * script:
 *   1. Generates a clean editorial infographic-style HERO IMAGE via the
 *      OpenAI Images API (gpt-image-1), prompted off the page's
 *      title + regulation + summary.
 *   2. Uploads the PNG to the Supabase Storage bucket `gap-visuals`
 *      (created if missing) and sets gap_pages.hero_image_url to the
 *      public URL.
 *   3. Generates a Mermaid compliance-flow DIAGRAM via the Anthropic
 *      Messages API and stores it in gap_pages.diagram_mermaid (+ a
 *      diagram_caption).
 *
 * Design choices:
 *   - Zero npm install. Uses Node 22 built-in fetch + the Supabase REST
 *     (PostgREST) and Storage HTTP APIs directly. No @supabase/supabase-js.
 *   - IDEMPOTENT: rows that already have hero_image_url are skipped. The
 *     diagram is (re)generated only when missing, independently of the hero.
 *   - DRY-RUN BY DEFAULT: without --apply, nothing is written and no paid
 *     API calls are made — it only prints what it WOULD do. Pass --apply
 *     to actually call the image/LLM APIs, upload, and write the DB.
 *   - RATE-LIMITED: a fixed delay between rows (configurable) to stay well
 *     under image-API rate limits and spread spend.
 *
 * ── COST NOTES ────────────────────────────────────────────────────────
 *   OpenAI gpt-image-1 hero image:
 *     quality=low    1536x1024 ~ $0.016
 *     quality=medium 1536x1024 ~ $0.063   (default here)
 *     quality=high   1536x1024 ~ $0.25
 *     (square 1024x1024 is cheaper; landscape used for hero aspect.)
 *     Industry guidance: roughly $0.04–0.17 per image at medium quality
 *     depending on size. Budget accordingly: ~$0.06 x N pages.
 *   Anthropic Mermaid diagram (claude-3-5-haiku):
 *     ~$0.001–0.003 per page (tiny prompt + short output).
 *   => For ~50 gap pages at medium quality: ~$3.00–3.50 total.
 *   Use --quality low for a ~4x cheaper first pass.
 * ──────────────────────────────────────────────────────────────────────
 *
 * USAGE (see scripts/README-gap-visuals.md):
 *   node scripts/generate-gap-visuals.mjs                 # dry-run, all rows
 *   node scripts/generate-gap-visuals.mjs --apply         # generate + write
 *   node scripts/generate-gap-visuals.mjs --apply --limit 1 --quality low
 *   node scripts/generate-gap-visuals.mjs --slug fincen-boi-gap --apply
 *
 * ENV (read from environment; never hardcode — load from the canonical
 * vault before running, see README):
 *   NEXT_PUBLIC_SUPABASE_URL        (required)
 *   SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY  (required, either)
 *   OPENAI_API_KEY                  (required with --apply for hero image)
 *   ANTHROPIC_API_KEY               (required with --apply for diagram)
 */

import { Buffer } from 'node:buffer'

// ── Config ────────────────────────────────────────────────────────────
const BUCKET = 'gap-visuals'
const IMAGE_SIZE = '1536x1024' // landscape hero
const DEFAULT_QUALITY = 'medium' // low | medium | high
const DEFAULT_DELAY_MS = 1500 // between rows, rate-limit cushion
const OPENAI_IMAGE_MODEL = 'gpt-image-1'
// Cheapest current Haiku — diagram generation is a tiny prompt + short
// output, so Haiku is plenty. Override with --model if needed.
const ANTHROPIC_MODEL = 'claude-haiku-4-5'
const ANTHROPIC_VERSION = '2023-06-01'

// ── CLI args ──────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = {
    apply: false,
    limit: Infinity,
    slug: null,
    quality: DEFAULT_QUALITY,
    delayMs: DEFAULT_DELAY_MS,
    skipDiagram: false,
    skipHero: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--apply') args.apply = true
    else if (a === '--limit') args.limit = Number(argv[++i])
    else if (a === '--slug') args.slug = argv[++i]
    else if (a === '--quality') args.quality = argv[++i]
    else if (a === '--delay') args.delayMs = Number(argv[++i])
    else if (a === '--skip-diagram') args.skipDiagram = true
    else if (a === '--skip-hero') args.skipHero = true
    else if (a === '--help' || a === '-h') {
      console.log(HELP)
      process.exit(0)
    } else {
      console.error(`Unknown arg: ${a}`)
      process.exit(1)
    }
  }
  if (!['low', 'medium', 'high'].includes(args.quality)) {
    console.error(`--quality must be low|medium|high, got "${args.quality}"`)
    process.exit(1)
  }
  return args
}

const HELP = `generate-gap-visuals.mjs — hero image + mermaid diagram for gap pages

  --apply           Actually call APIs, upload, and write the DB (default: dry-run)
  --limit N         Process at most N rows
  --slug SLUG       Process only the row with this slug
  --quality Q       Image quality: low | medium | high (default: medium)
  --delay MS        Delay between rows in ms (default: ${DEFAULT_DELAY_MS})
  --skip-diagram    Skip Mermaid diagram generation (hero only)
  --skip-hero       Skip hero image generation (diagram only)
  -h, --help        Show this help

Dry-run by default. See scripts/README-gap-visuals.md for cost + env details.`

// ── Env ───────────────────────────────────────────────────────────────
function requireEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
  if (!url || !serviceKey) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY).'
    )
    process.exit(1)
  }
  return { url: url.replace(/\/+$/, ''), serviceKey }
}

// ── Supabase REST (PostgREST) helpers ─────────────────────────────────
//
// Auth headers differ by key format:
//   - Legacy service-role keys are JWTs (prefix "eyJ"): PostgREST/Storage
//     want them in BOTH `apikey` and `Authorization: Bearer`.
//   - New API keys ("sb_secret_…") are NOT JWTs and must be sent in
//     `apikey` only — passing them as a Bearer token is rejected.
// Detect the format and build headers accordingly.
function authHeaders(serviceKey, extra = {}) {
  const isJwt = serviceKey.startsWith('eyJ')
  const headers = { apikey: serviceKey, ...extra }
  if (isJwt) headers.Authorization = `Bearer ${serviceKey}`
  return headers
}

async function fetchRows({ url, serviceKey }, slug) {
  // Select rows missing a hero image (or a specific slug). PostgREST
  // filters keep the payload small.
  const params = new URLSearchParams()
  params.set(
    'select',
    'id,slug,jurisdiction,title,regulation,summary,hero_image_url,diagram_mermaid'
  )
  if (slug) {
    params.set('slug', `eq.${slug}`)
  } else {
    params.set('hero_image_url', 'is.null')
  }
  params.set('order', 'published_at.desc')
  const res = await fetch(`${url}/rest/v1/gap_pages?${params.toString()}`, {
    headers: authHeaders(serviceKey),
  })
  if (!res.ok) {
    throw new Error(`Supabase select failed: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

async function updateRow({ url, serviceKey }, id, patch) {
  const res = await fetch(
    `${url}/rest/v1/gap_pages?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: authHeaders(serviceKey, {
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      }),
      body: JSON.stringify(patch),
    }
  )
  if (!res.ok) {
    throw new Error(`Supabase update failed: ${res.status} ${await res.text()}`)
  }
}

// ── Supabase Storage helpers ──────────────────────────────────────────
async function ensureBucket({ url, serviceKey }) {
  // Idempotent: create the public bucket if it does not exist.
  const list = await fetch(`${url}/storage/v1/bucket`, {
    headers: authHeaders(serviceKey),
  })
  if (list.ok) {
    const buckets = await list.json()
    if (Array.isArray(buckets) && buckets.some(b => b.name === BUCKET || b.id === BUCKET)) {
      return
    }
  }
  const create = await fetch(`${url}/storage/v1/bucket`, {
    method: 'POST',
    headers: authHeaders(serviceKey, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: true,
      file_size_limit: 10_485_760, // 10 MB
      allowed_mime_types: ['image/png'],
    }),
  })
  if (!create.ok && create.status !== 409) {
    throw new Error(`Bucket create failed: ${create.status} ${await create.text()}`)
  }
}

async function uploadPng({ url, serviceKey }, path, pngBuffer) {
  const res = await fetch(
    `${url}/storage/v1/object/${BUCKET}/${encodeURIComponent(path)}`,
    {
      method: 'POST',
      headers: authHeaders(serviceKey, {
        'Content-Type': 'image/png',
        'x-upsert': 'true',
      }),
      body: pngBuffer,
    }
  )
  if (!res.ok) {
    throw new Error(`Storage upload failed: ${res.status} ${await res.text()}`)
  }
  return `${url}/storage/v1/object/public/${BUCKET}/${path}`
}

// ── OpenAI image generation ───────────────────────────────────────────
function buildImagePrompt(row) {
  const reg = row.regulation ? ` concerning ${row.regulation}` : ''
  const summary = (row.summary || '').slice(0, 400)
  return [
    `Clean, modern editorial INFOGRAPHIC-style hero illustration for a B2B legal-compliance article${reg}.`,
    `Article topic: "${row.title}".`,
    summary ? `Context: ${summary}` : '',
    'Style: flat vector, minimal, professional, muted palette with a single violet accent (#5B49E0) on a dark navy background.',
    'Abstract iconography of documents, shields, checkmarks, flow arrows and regulatory motifs. Subtle grid/geometric texture.',
    'No realistic photos. NO text, NO words, NO letters, NO labels anywhere in the image. Wide landscape composition with clear negative space.',
  ]
    .filter(Boolean)
    .join(' ')
}

async function generateHeroImage(apiKey, prompt, quality) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_IMAGE_MODEL,
      prompt,
      n: 1,
      size: IMAGE_SIZE,
      quality, // low | medium | high for gpt-image-1
    }),
  })
  if (!res.ok) {
    throw new Error(`OpenAI image failed: ${res.status} ${await res.text()}`)
  }
  const json = await res.json()
  const b64 = json?.data?.[0]?.b64_json
  if (!b64) throw new Error('OpenAI image response missing b64_json')
  return Buffer.from(b64, 'base64')
}

// ── Anthropic mermaid diagram generation ──────────────────────────────
function buildDiagramPrompt(row) {
  return [
    `Produce a Mermaid "flowchart TD" diagram summarizing the compliance decision/flow for this regulation.`,
    `Regulation: ${row.regulation || 'N/A'}`,
    `Jurisdiction: ${row.jurisdiction || 'N/A'}`,
    `Topic: ${row.title}`,
    `Summary: ${(row.summary || '').slice(0, 600)}`,
    '',
    'Requirements:',
    '- Start with a "Does this rule apply?" style decision and branch to obligations / exemptions / penalties.',
    '- 6 to 12 nodes. Use decision diamonds {} for yes/no branches.',
    '- Keep node labels short (no special characters that break Mermaid; no parentheses inside labels).',
    '- Output ONLY a fenced ```mermaid code block, nothing else.',
  ].join('\n')
}

async function generateMermaid(apiKey, prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    throw new Error(`Anthropic failed: ${res.status} ${await res.text()}`)
  }
  const json = await res.json()
  const text = json?.content?.[0]?.text ?? ''
  // Extract the fenced mermaid block; fall back to raw text if the model
  // omitted fences but produced a flowchart.
  const fenced = text.match(/```mermaid\s*([\s\S]*?)```/i)
  const src = (fenced ? fenced[1] : text).trim()
  if (!/^(flowchart|graph)\b/m.test(src)) {
    throw new Error('Anthropic output did not contain a flowchart/graph definition')
  }
  return src
}

// ── Helpers ───────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms))

function captionFor(row) {
  const reg = row.regulation ? `${row.regulation} ` : ''
  return `${reg}compliance decision flow`.trim()
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv.slice(2))
  const sb = requireEnv()

  const openaiKey = process.env.OPENAI_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (args.apply && !args.skipHero && !openaiKey) {
    console.error('OPENAI_API_KEY required for hero generation (or use --skip-hero).')
    process.exit(1)
  }
  if (args.apply && !args.skipDiagram && !anthropicKey) {
    console.error('ANTHROPIC_API_KEY required for diagram generation (or use --skip-diagram).')
    process.exit(1)
  }

  const mode = args.apply ? 'APPLY (writing + spending)' : 'DRY-RUN (no writes, no spend)'
  console.log(`\n=== generate-gap-visuals — ${mode} ===`)
  console.log(`quality=${args.quality} size=${IMAGE_SIZE} delay=${args.delayMs}ms`)
  console.log(`hero=${!args.skipHero} diagram=${!args.skipDiagram}\n`)

  let rows = await fetchRows(sb, args.slug)
  // Defensive idempotency: even when querying by slug, skip rows that
  // already have a hero unless we're only doing the diagram.
  if (args.skipHero) {
    rows = rows.filter(r => !r.diagram_mermaid)
  } else {
    rows = rows.filter(r => !r.hero_image_url)
  }
  if (Number.isFinite(args.limit)) rows = rows.slice(0, args.limit)

  console.log(`${rows.length} row(s) to process.\n`)
  if (rows.length === 0) {
    console.log('Nothing to do.')
    return
  }

  if (args.apply && !args.skipHero) {
    await ensureBucket(sb)
  }

  let heroCount = 0
  let diagramCount = 0
  let errors = 0

  for (const row of rows) {
    console.log(`— [${row.slug}] ${row.title}`)
    const patch = {}

    // Hero image
    if (!args.skipHero && !row.hero_image_url) {
      const prompt = buildImagePrompt(row)
      if (!args.apply) {
        console.log(`  [hero] would generate (${args.quality}) → upload ${row.slug}.png`)
        console.log(`  [hero] prompt: ${prompt.slice(0, 120)}...`)
      } else {
        try {
          const png = await generateHeroImage(openaiKey, prompt, args.quality)
          const publicUrl = await uploadPng(sb, `${row.slug}.png`, png)
          patch.hero_image_url = publicUrl
          heroCount++
          console.log(`  [hero] uploaded → ${publicUrl} (${png.length} bytes)`)
        } catch (e) {
          errors++
          console.error(`  [hero] ERROR: ${e.message}`)
        }
      }
    }

    // Mermaid diagram
    if (!args.skipDiagram && !row.diagram_mermaid) {
      const prompt = buildDiagramPrompt(row)
      if (!args.apply) {
        console.log(`  [diagram] would generate Mermaid flowchart via ${ANTHROPIC_MODEL}`)
      } else {
        try {
          const src = await generateMermaid(anthropicKey, prompt)
          patch.diagram_mermaid = src
          patch.diagram_caption = captionFor(row)
          diagramCount++
          console.log(`  [diagram] generated (${src.length} chars)`)
        } catch (e) {
          errors++
          console.error(`  [diagram] ERROR: ${e.message}`)
        }
      }
    }

    if (args.apply && Object.keys(patch).length > 0) {
      try {
        await updateRow(sb, row.id, patch)
        console.log(`  [db] updated row ${row.id}`)
      } catch (e) {
        errors++
        console.error(`  [db] ERROR: ${e.message}`)
      }
    }

    await sleep(args.delayMs)
  }

  console.log(`\n=== Done. heroes=${heroCount} diagrams=${diagramCount} errors=${errors} ===`)
  if (!args.apply) {
    console.log('This was a DRY-RUN. Re-run with --apply to generate and write.')
  }
  if (errors > 0) process.exitCode = 1
}

main().catch(e => {
  console.error('FATAL:', e.message)
  process.exit(1)
})
