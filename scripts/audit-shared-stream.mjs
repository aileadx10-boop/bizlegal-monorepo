#!/usr/bin/env node
/**
 * audit-shared-stream.mjs — makes the consolidation rules mechanical.
 *
 * Written 2026-08-20 because the written rules did not hold. CLAUDE.md hard
 * rule 1 has said "no new features" since Phase Z, and two new surfaces landed
 * anyway. Worse, four days after 22 email senders were catalogued and
 * @bizlegal/email was written to replace them, a new surface shipped sender #23
 * with a raw fetch to api.resend.com and no consent check.
 *
 * A rule that depends on the author remembering is not a rule. This blocks the
 * commit instead.
 *
 * Checks (staged files only):
 *   1. No raw Resend transport outside packages/email
 *   2. No new Anthropic/LLM client outside packages/llm
 *   3. No cold-outbound vocabulary anywhere (hard rule 7)
 *   4. No new crontab source file outside the sanctioned set
 *
 * Escape hatch: a file may carry `bizlegal-allow: <check>` in a comment on the
 * offending line when there is a real reason. That makes the exception visible
 * in review rather than silent.
 *
 * Usage: node scripts/audit-shared-stream.mjs --staged
 */
import { execSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'

const ALLOW = 'bizlegal-allow'

const CHECKS = [
  {
    id: 'email',
    // Raw Resend transport. The SDK import and the REST endpoint both count.
    pattern: /api\.resend\.com|from ['"]resend['"]|new Resend\s*\(/,
    exemptPaths: [/^packages\/email\//, /^services\/worker\/src\/resend\.ts$/],
    message:
      'raw Resend transport. Import { sendEmail } from "@bizlegal/email" instead —\n' +
      '    suppression + double-opt-in are enforced inside that package, and a caller\n' +
      '    that forgets to check is indistinguishable from one that decided not to.',
  },
  {
    id: 'llm',
    pattern: /new Anthropic\s*\(|api\.anthropic\.com/,
    exemptPaths: [/^packages\/llm\//],
    message:
      'a direct Anthropic client. Use the shared router in packages/llm so model tier\n' +
      '    and the spend cap stay a one-line change instead of 41.',
  },
  {
    id: 'cold-outbound',
    // Hard rule 7. Deliberately broad — the cost of a false positive is one
    // comment marker; the cost of a false negative is a spam incident.
    pattern: /cold[_-]?(email|outbound|pitch)|sendColdOutbound|draftColdOutbound|COLD_BATCH|apollo[_-]?enrich|prospect[_-]?scrape/i,
    exemptPaths: [/^scripts\/audit-shared-stream\.mjs$/, /^decisions\//, /CLAUDE\.md$/],
    message:
      'cold-outbound code. Hard rule 7: outbound is inbound-only — we email people who\n' +
      '    contacted us and confirmed. The previous engine ran on a 10-minute tick with no\n' +
      '    approval step and a kill-switch that failed open. Do not reintroduce it.',
  },
]

const CRON_ALLOWED = new Set(['services/cron_jobs.txt', 'services/cron/manifest.yaml'])
const CRON_PATTERN = /(^|\/)(crontab|.*\.crontab|install_.*_cron\.(sh|py))$/

function stagedFiles() {
  const out = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' })
  return out.split('\n').map((s) => s.trim()).filter(Boolean)
}

// This file necessarily contains every pattern it looks for, and the docs
// describe them on purpose. Exempt both globally rather than per-check.
const GLOBAL_EXEMPT = [/^scripts\/audit-shared-stream\.mjs$/, /^decisions\//, /CLAUDE\.md$/, /^lefthook\.yml$/]

const failures = []
for (const file of stagedFiles()) {
  if (!existsSync(file)) continue
  if (file.includes('node_modules') || file.includes('/.next/') || file.includes('/dist/')) continue
  if (GLOBAL_EXEMPT.some((re) => re.test(file.replace(/\\/g, '/')))) continue

  if (CRON_PATTERN.test(file) && !CRON_ALLOWED.has(file)) {
    failures.push(
      `${file}\n  → a new crontab source. There must be ONE schedule source; five competing\n` +
        '    crontab files on one box is how 147 jobs and ~30 dead ones happened.',
    )
    continue
  }

  let lines
  try {
    lines = readFileSync(file, 'utf8').split('\n')
  } catch {
    continue // binary or unreadable
  }

  for (const check of CHECKS) {
    if (check.exemptPaths.some((re) => re.test(file.replace(/\\/g, '/')))) continue
    lines.forEach((line, i) => {
      if (!check.pattern.test(line)) return
      if (line.includes(`${ALLOW}: ${check.id}`)) return
      failures.push(`${file}:${i + 1}\n  → ${check.message}`)
    })
  }
}

if (failures.length > 0) {
  console.error('\n❌ shared-stream check failed:\n')
  for (const f of failures) console.error('  ' + f + '\n')
  console.error(
    `  To make a deliberate exception, add a comment on the line:  ${ALLOW}: <check-id>\n` +
      '  That keeps the exception visible in review instead of silent.\n',
  )
  process.exit(1)
}
