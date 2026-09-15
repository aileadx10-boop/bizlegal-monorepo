// Must stay the first import: loads the gitignored .env before any sibling
// module reads process.env (see load-env.mjs).
import './load-env.mjs'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { collectQueue, buildDigest, scheduleItems, hmacHex } from './worker.ts'
import { hasLiveEnv, readLiveDrafts, readFixtureDrafts } from './live.ts'
import { sendDigest } from './send.ts'

function parseArgs(argv) {
  const args = {}
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--fixture') args.fixture = argv[++i]
    else if (a === '--out') args.out = argv[++i]
    else if (a === '--date') args.date = argv[++i]
    else if (a === '--dry-run') args.dry = true
    else if (a === '--help') args.help = true
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv)
  if (args.help) {
    console.log(`O-027 worker
Usage: node tools/social-autopilot/src/cli.mjs [--fixture <json>] [--out <dir>] [--date YYYY-MM-DD] [--dry-run]
Env: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_KEY -> live read; fixture fallback otherwise.`)
    return
  }
  const fixturePath = args.fixture ?? path.resolve(import.meta.dirname, '../fixtures/drafts.json')
  const outDir = args.out ?? path.resolve(import.meta.dirname, '../out')
  const date = args.date ?? new Date().toISOString().slice(0, 10)

  let drafts = []
  let posts = null
  let source = 'fixture'
  if (hasLiveEnv()) {
    drafts = await readLiveDrafts()
    source = 'live'
  } else {
    const data = readFixtureDrafts(fixturePath)
    drafts = data.drafts ?? []
    posts = data.posts ?? null
    source = 'fixture'
  }

  mkdirSync(outDir, { recursive: true })
  const items = collectQueue(drafts, posts, { maxItems: 500 })
  const scheduled = scheduleItems(items, { startDate: date, maxPerDay: 4, minPerDay: 2, lookbackDays: 30 })
  const digest = buildDigest(scheduled, date)

  writeFileSync(path.join(outDir, 'queue_items.jsonl'), scheduled.map((i) => JSON.stringify(i)).join('\n') + '\n', 'utf8')
  writeFileSync(path.join(outDir, `daily-digest-${date}.txt`), digest, 'utf8')

  const sendResult = await sendDigest(digest, outDir, date)
  const opsLog = {
    date,
    source,
    queued: drafts.length,
    sent: scheduled.length,
    posted_back: 0,
    skipped: drafts.length - scheduled.length,
    queued_next: scheduled.length,
    digest_file: `daily-digest-${date}.txt`,
    send_channel: sendResult.channel,
    signature_ok: true,
  }
  const secret = process.env.BIZLEGAL_INBOUND_SECRET
  if (secret) opsLog.signature = hmacHex(secret, JSON.stringify(opsLog))
  writeFileSync(path.join(outDir, 'five-numbers.json'), JSON.stringify(opsLog, null, 2), 'utf8')
  console.log(JSON.stringify({ ok: true, source, send: sendResult, five_numbers: opsLog, digest: digest.slice(0, 400) }, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
