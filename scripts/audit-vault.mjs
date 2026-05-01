#!/usr/bin/env node
/**
 * audit-vault.mjs — enforce that every env var referenced in the monorepo
 * is also present (by NAME) in the canonical vault. Names + presence only;
 * never reads or logs values.
 *
 * Modes:
 *   node scripts/audit-vault.mjs                 # full scan, exit 0/1 with punch list
 *   node scripts/audit-vault.mjs --staged        # only check staged files (pre-commit)
 *
 * Used by: lefthook pre-commit + .github/workflows/operating-book-check.yml + manual.
 */

import { execSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import process from 'node:process'

const VAULT_PATH = process.env.BIZLEGAL_VAULT_PATH ||
  'C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt'

const REPO_ROOT = resolve(import.meta.dirname, '..')

// Allow-list: env names that are framework-managed and don't need to be in the vault.
const ALLOW_LIST = new Set([
  'NODE_ENV', 'NODE_OPTIONS', 'PATH', 'HOME', 'USER', 'PWD', 'CI',
  'VERCEL', 'VERCEL_ENV', 'VERCEL_URL', 'VERCEL_REGION', 'VERCEL_GIT_COMMIT_SHA',
  'PORT', 'HOSTNAME',
  'NEXT_RUNTIME', 'NEXT_PHASE', 'NEXT_PUBLIC_VERCEL_URL',
  'CF_PAGES', 'CF_PAGES_BRANCH', 'CF_PAGES_COMMIT_SHA', 'CF_PAGES_URL',
  'PYTHONPATH', 'PYTHONUNBUFFERED',
])

// Patterns that read env vars across our 3 languages.
const ENV_PATTERNS = [
  /\bprocess\.env\.([A-Z][A-Z0-9_]+)/g,                // TS/JS:  process.env.X
  /\bprocess\.env\[['"`]([A-Z][A-Z0-9_]+)['"`]\]/g,    // TS/JS:  process.env["X"]
  /\bos\.environ\.get\(['"]([A-Z][A-Z0-9_]+)['"]/g,    // Python: os.environ.get("X")
  /\bos\.environ\[['"]([A-Z][A-Z0-9_]+)['"]\]/g,        // Python: os.environ["X"]
  /\bos\.getenv\(['"]([A-Z][A-Z0-9_]+)['"]/g,          // Python: os.getenv("X")
  /\benv\.([A-Z][A-Z0-9_]+)/g,                          // CF Worker: env.X
  /\bgetEnv\(['"]([A-Z][A-Z0-9_]+)['"]/g,               // generic helper
]

function loadVaultNames() {
  if (!existsSync(VAULT_PATH)) {
    console.error(`✗ Canonical vault not found at ${VAULT_PATH}`)
    console.error('  See CLAUDE.md Section 4. Set BIZLEGAL_VAULT_PATH env var to override.')
    process.exit(2)
  }
  const text = readFileSync(VAULT_PATH, 'utf8')
  const names = new Set()
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z][A-Z0-9_]+)=/)
    if (m) names.add(m[1])
  }
  return names
}

function listFilesToScan() {
  const staged = process.argv.includes('--staged')
  const exts = /\.(ts|tsx|js|jsx|mjs|cjs|py)$/
  if (staged) {
    const out = execSync('git diff --cached --name-only --diff-filter=ACM', {
      cwd: REPO_ROOT, encoding: 'utf8',
    })
    return out.split(/\r?\n/).filter((p) => p && exts.test(p))
  }
  const out = execSync('git ls-files', { cwd: REPO_ROOT, encoding: 'utf8' })
  return out.split(/\r?\n/).filter((p) => p && exts.test(p) && !p.includes('node_modules'))
}

function extractEnvNames(text) {
  const names = new Set()
  for (const pattern of ENV_PATTERNS) {
    pattern.lastIndex = 0
    for (const m of text.matchAll(pattern)) {
      names.add(m[1])
    }
  }
  return names
}

function main() {
  const vaultNames = loadVaultNames()
  const files = listFilesToScan()
  const missing = new Map() // var -> Set<file>
  for (const file of files) {
    const abs = resolve(REPO_ROOT, file)
    if (!existsSync(abs)) continue
    let text
    try { text = readFileSync(abs, 'utf8') } catch { continue }
    const referenced = extractEnvNames(text)
    for (const name of referenced) {
      if (ALLOW_LIST.has(name)) continue
      if (vaultNames.has(name)) continue
      if (!missing.has(name)) missing.set(name, new Set())
      missing.get(name).add(file)
    }
  }
  if (missing.size === 0) {
    console.log(`✓ vault audit clean: ${files.length} files scanned, all env names present in vault`)
    process.exit(0)
  }
  console.error(`✗ ${missing.size} env var(s) referenced but missing from canonical vault:\n`)
  for (const [name, fileSet] of [...missing.entries()].sort()) {
    console.error(`  ${name}`)
    for (const f of [...fileSet].slice(0, 3)) {
      console.error(`     ↳ ${f}`)
    }
    if (fileSet.size > 3) console.error(`     ↳ … and ${fileSet.size - 3} more`)
  }
  console.error(``)
  console.error(`Fix: append each missing name (with empty value) to the canonical vault:`)
  console.error(`  ${VAULT_PATH}`)
  console.error(``)
  console.error(`Example: echo "MY_VAR=" >> "${VAULT_PATH}"`)
  console.error(`See CLAUDE.md Section 4 + Section 5.`)
  process.exit(1)
}

main()
