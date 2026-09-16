#!/usr/bin/env tsx
/**
 * tools/list-requests.ts [--status requested,in_progress] [--tier radar_build]
 *
 * The operator's queue: open BUILD THIS requests, oldest first, with the
 * subscriber's tier so a Radar + Build request (which also needs Moses's
 * capped async expert review, 4/month) is visible separately from a plain
 * Radar request.
 */
import { sql } from '../lib/neon'

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const statusArg = args.find((a) => a.startsWith('--status='))?.split('=')[1]
  const statuses = statusArg ? statusArg.split(',') : ['requested', 'in_progress']

  const rows = (await sql()`
    select p.id, p.status, p.requested_at, s.email, s.tier, o.id as opportunity_id, o.slug, o.name
    from products p
    join subscribers s on s.id = p.subscriber_id
    join opportunities o on o.id = p.opportunity_id
    where p.status = any(${statuses}::text[])
    order by p.requested_at asc
  `) as unknown as Array<{ id: string; status: string; requested_at: string; email: string; tier: string; opportunity_id: string; slug: string; name: string }>

  if (rows.length === 0) {
    console.log('No open BUILD THIS requests.')
    return
  }

  const buildTierCount = rows.filter((r) => r.tier === 'radar_build').length
  console.log(`${rows.length} open request(s), ${buildTierCount} on Radar + Build (each also needs a written expert review, capped 4/month/subscriber).\n`)
  for (const r of rows) {
    console.log(`${r.id}  [${r.status}]  ${r.tier.padEnd(11)}  ${r.email}`)
    console.log(`  "${r.name}"  (opportunity ${r.opportunity_id}, ${r.slug})`)
    console.log(`  requested ${r.requested_at}`)
    console.log(`  → tsx tools/ingest-brief.ts --product ${r.id} --file <brief.json>\n`)
  }
}

void main()
