#!/usr/bin/env node
/**
 * audit-operating-book.mjs — enforce that every new dir under apps/ services/
 * agents/ packages/ has its own CLAUDE.md AND is referenced from the root
 * CLAUDE.md.
 *
 * Modes:
 *   node scripts/audit-operating-book.mjs            # full repo scan
 *   node scripts/audit-operating-book.mjs --staged   # pre-commit (only check staged dirs)
 *
 * Used by: lefthook pre-commit + .github/workflows/operating-book-check.yml.
 */

import { execSync } from 'node:child_process'
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'
import process from 'node:process'

const REPO_ROOT = resolve(import.meta.dirname, '..')
const ROOT_BOOK = join(REPO_ROOT, 'CLAUDE.md')
const ENFORCED_PARENTS = ['apps', 'services', 'agents', 'packages']

function rootBookText() {
  if (!existsSync(ROOT_BOOK)) {
    console.error('✗ root CLAUDE.md not found — Phase Z2.1 incomplete')
    process.exit(2)
  }
  return readFileSync(ROOT_BOOK, 'utf8')
}

function listImmediateChildren(parentDir) {
  const abs = join(REPO_ROOT, parentDir)
  if (!existsSync(abs)) return []
  return readdirSync(abs).filter((name) => {
    if (name.startsWith('.') || name === 'node_modules') return false
    try {
      return statSync(join(abs, name)).isDirectory()
    } catch {
      return false
    }
  })
}

function listStagedNewDirs() {
  const out = execSync('git diff --cached --name-only --diff-filter=A', {
    cwd: REPO_ROOT, encoding: 'utf8',
  })
  const newDirs = new Set()
  for (const file of out.split(/\r?\n/)) {
    if (!file) continue
    for (const parent of ENFORCED_PARENTS) {
      const prefix = parent + '/'
      if (file.startsWith(prefix)) {
        const rest = file.slice(prefix.length)
        const slash = rest.indexOf('/')
        if (slash > 0) newDirs.add(`${parent}/${rest.slice(0, slash)}`)
      }
    }
  }
  return [...newDirs]
}

function main() {
  const staged = process.argv.includes('--staged')
  const dirsToCheck = staged
    ? listStagedNewDirs()
    : ENFORCED_PARENTS.flatMap((p) => listImmediateChildren(p).map((c) => `${p}/${c}`))

  if (dirsToCheck.length === 0) {
    console.log('✓ operating-book audit: nothing to check')
    process.exit(0)
  }

  const rootBook = rootBookText()
  const failures = []

  for (const dir of dirsToCheck) {
    const claudePath = join(REPO_ROOT, dir, 'CLAUDE.md')
    if (!existsSync(claudePath)) {
      failures.push(`${dir}/CLAUDE.md missing`)
      continue
    }
    // Look for any reference to "<dir>/" or "<basename>/" in the root book.
    const basename = dir.split('/').pop()
    const ref = rootBook.includes(dir) || rootBook.includes(`${basename}/`)
    if (!ref) {
      failures.push(`${dir} present but root CLAUDE.md does not reference it`)
    }
  }

  if (failures.length === 0) {
    console.log(`✓ operating-book audit clean: ${dirsToCheck.length} dir(s) checked`)
    process.exit(0)
  }
  console.error(`✗ operating-book violations:\n`)
  for (const f of failures) console.error(`  - ${f}`)
  console.error(``)
  console.error(`Fix: per CLAUDE.md Section 5,`)
  console.error(`  1. Add <dir>/CLAUDE.md (10-20 lines: purpose, envs, deploy target).`)
  console.error(`  2. Add a one-liner pointing at it from root CLAUDE.md (Section 1 layout).`)
  process.exit(1)
}

main()
