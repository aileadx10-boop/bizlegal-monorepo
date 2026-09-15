/**
 * O-027 daily wrapper for cron / local scheduling.
 * Usage: node tools/social-autopilot/src/run-daily.cjs
 * Wraps the worker and records a timestamp; safe to call from cron.
 */
const { spawnSync } = require('node:child_process')
const path = require('node:path')
const os = require('node:os')

const cliPath = path.resolve(__dirname, 'cli.mjs')
const outDir = path.resolve(__dirname, '../out/daily')
const date = new Date().toISOString().slice(0, 10)
console.log(`[autopilot] ${date} starting scheduled run`)
const r = spawnSync(process.execPath, [cliPath, '--out', outDir, '--date', date], { stdio: 'inherit', cwd: path.resolve(__dirname, '..') })
if (r.status !== 0) {
  process.exitCode = r.status ?? 1
}
console.log(`[autopilot] ${date} done (exit ${process.exitCode ?? 0})`)
