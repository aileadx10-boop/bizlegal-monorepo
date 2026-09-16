#!/usr/bin/env tsx
/**
 * tools/ingest-brief.ts --product <products.id> --file <brief.json> [--dry-run]
 *
 * Validates a BUILD THIS brief (lib/build-this/brief-schema.ts) written by a
 * Claude Code session against agents/brainx/build-this/prompt.md, checks
 * every evidence_ids reference resolves to the target opportunity's own
 * evidence_links, checks no URL in the prose is outside that evidence pack,
 * marks the request 'ready', and emails the subscriber.
 *
 * Exit codes: 0 ok · 2 validation failed · 4 database error.
 */
import { readFileSync } from 'node:fs'
import { brief as briefSchema, briefUrlViolations } from '../lib/build-this/brief-schema'
import { sql } from '../lib/neon'
import { sendBriefReady } from '../lib/email'
import { logEvent } from '../lib/ops/log'

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const productIdx = args.indexOf('--product')
  const fileIdx = args.indexOf('--file')
  if (productIdx === -1 || fileIdx === -1 || !args[productIdx + 1] || !args[fileIdx + 1]) {
    console.error('Usage: tsx tools/ingest-brief.ts --product <products.id> --file <brief.json> [--dry-run]')
    process.exit(2)
  }
  const productId = args[productIdx + 1]!
  const path = args[fileIdx + 1]!
  const dryRun = args.includes('--dry-run')

  const raw = JSON.parse(readFileSync(path, 'utf8'))
  const parsed = briefSchema.safeParse(raw)
  if (!parsed.success) {
    console.error('BRIEF SCHEMA VALIDATION FAILED:')
    for (const issue of parsed.error.issues) console.error(`  ${issue.path.join('.')}: ${issue.message}`)
    process.exit(2)
  }
  const briefData = parsed.data

  const db = sql()
  const rows = (await db`
    select p.id, p.opportunity_id, p.subscriber_id, o.name as opportunity_name, s.email
    from products p
    join opportunities o on o.id = p.opportunity_id
    join subscribers s on s.id = p.subscriber_id
    where p.id = ${productId}::uuid
    limit 1
  `) as unknown as Array<{ id: string; opportunity_id: string; subscriber_id: string; opportunity_name: string; email: string }>
  const request = rows?.[0]
  if (!request) {
    console.error(`unknown product id: ${productId}`)
    process.exit(2)
  }

  const evidenceRows = (await db`
    select s.id, s.url from evidence_links el join signals s on s.id = el.entity_id and el.entity_type = 'signal'
    where el.opportunity_id = ${request.opportunity_id}::uuid
  `) as unknown as Array<{ id: string; url: string }>
  const evidenceIds = new Set(evidenceRows.map((r) => r.id))
  const evidenceUrls = evidenceRows.map((r) => r.url)

  const badIds: string[] = []
  for (const [key, section] of Object.entries(briefData)) {
    for (const id of section.evidence_ids) {
      if (!evidenceIds.has(id)) badIds.push(`${key}: unknown evidence id ${id}`)
    }
  }
  const urlViolations = briefUrlViolations(briefData, evidenceUrls)

  if (badIds.length > 0 || urlViolations.length > 0) {
    console.error('BRIEF VALIDATION FAILED:')
    for (const m of [...badIds, ...urlViolations]) console.error(`  ${m}`)
    process.exit(2)
  }

  console.log(`Brief for "${request.opportunity_name}" (${request.email}) validates cleanly.`)
  if (dryRun) {
    console.log('DRY RUN — not written.')
    process.exit(0)
  }

  await db`update products set brief = ${JSON.stringify(briefData)}::jsonb, status = 'ready', ready_at = now() where id = ${productId}::uuid`
  await sendBriefReady({ to: request.email, productId: request.id, opportunityName: request.opportunity_name }).catch((err) => console.warn('email failed:', err))
  await logEvent({ type: 'report.generated', source: 'brainx', ref_id: productId, email: request.email, status: 'ok', metadata: { opportunity_id: request.opportunity_id } })
  console.log('INGEST OK — status ready, email sent.')
  process.exit(0)
}

void main()
