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
 *   3. No cold-sender / verification transport outside packages/email (rule 7 v2)
 *   3b. sendOutbound() only from the dispatch cron (rule 7 v2)
 *   4. No new crontab source file outside the sanctioned set
 *
 * Rule 7 was amended 2026-09-07 (decisions/OUTBOUND-V2-RULE-7-AMENDED-2026-09-07.md):
 * the vocabulary ban is gone; what is enforced now is that every cold message
 * passes the invariants in packages/email/src/outbound.ts.
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
    id: 'outbound-transport',
    // Rule 7 v2 (2026-09-07): outbound is allowed, but only through the
    // invariants in packages/email/src/outbound.ts. Any direct call to a
    // cold-sender or verification API outside that package bypasses the
    // verified-address, lawful-basis, suppression, cap and footer checks.
    pattern: /api\.instantly\.ai|api\.smartlead\.ai|api\.lemlist\.com|api\.woodpecker\.co|api\.apollo\.io\/v1\/emailer|api\.zerobounce\.net/i,
    exemptPaths: [/^packages\/email\//, /^apps\/hub\/lib\/outbound\/verify\.ts$/],
    message:
      'a direct cold-sender or verification transport. Go through sendOutbound() in\n' +
      '    @bizlegal/email (and lib/outbound/verify.ts for verification) so the rule 7 v2\n' +
      '    invariants — verified address, lawful basis, suppression, caps, footer — apply.',
  },
  {
    id: 'outbound-kind',
    // The only caller allowed to hand a message to the cold sender is the
    // dispatch cron; every other path must go through it so the per-campaign
    // approval gate and the fail-closed switch cannot be skipped.
    pattern: /sendOutbound\s*\(/,
    exemptPaths: [/^packages\/email\//, /^apps\/hub\/app\/api\/cron\/outbound-dispatch\//, /\.test\.ts$/],
    message:
      'sendOutbound() outside the dispatch cron. Cold mail is dispatched by\n' +
      '    apps/hub/app/api/cron/outbound-dispatch only, after the campaign was approved\n' +
      '    on /sales and OUTBOUND_AUTOSEND=1. Queue a sales_outreach row instead.',
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
