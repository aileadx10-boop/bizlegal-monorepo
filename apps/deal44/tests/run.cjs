#!/usr/bin/env node
/**
 * Minimal test runner for the pure modules.
 *
 * There is no Jest/Vitest in this workspace and adding one for three pure
 * functions is not worth the dependency weight, so this compiles the test file
 * and its imports to CommonJS in a temp dir and hands them to Node's built-in
 * test runner.
 *
 * Usage (from apps/deal44):  node tests/run.cjs
 */

const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const appDir = path.resolve(__dirname, '..')
const outDir = path.join(appDir, '.test-out')
// Resolve TypeScript's JS entrypoint rather than the .bin shim: on Windows the
// shim is a .cmd, which execFileSync cannot spawn without a shell.
const tsc = require.resolve('typescript/bin/tsc', { paths: [appDir] })

fs.rmSync(outDir, { recursive: true, force: true })

console.log('[tests] compiling to CommonJS...')
// The compiled tests `require` @bizlegal/closing-engine, whose package `main`
// is TypeScript source for Next's transpiler. Build its dist first so the
// `require` condition has something to resolve to.
const enginePkg = path.resolve(appDir, '../../packages/closing-engine')
execFileSync(process.execPath, [tsc, '-p', 'tsconfig.json'], { cwd: enginePkg, stdio: 'inherit' })

execFileSync(process.execPath, [tsc, '-p', 'tests/tsconfig.json'], { cwd: appDir, stdio: 'inherit' })

const compiled = path.join(outDir, 'tests', 'pure.test.js')
if (!fs.existsSync(compiled)) {
  console.error(`[tests] expected compiled output at ${compiled}`)
  process.exit(1)
}

console.log('[tests] running node:test...\n')
execFileSync(process.execPath, ['--test', compiled], { cwd: appDir, stdio: 'inherit' })
