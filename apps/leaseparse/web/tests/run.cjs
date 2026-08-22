#!/usr/bin/env node
/**
 * Minimal test runner for the pure modules.
 *
 * There is no Jest/Vitest in this workspace and adding one for three pure
 * functions is not worth the dependency weight, so this compiles the test file
 * and its imports to CommonJS in a temp dir and hands them to Node's built-in
 * test runner.
 *
 * Usage (from apps/leaseparse/web):  node tests/run.cjs
 */

const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const webDir = path.resolve(__dirname, '..')
const outDir = path.join(webDir, '.test-out')
// Resolve TypeScript's JS entrypoint rather than the .bin shim: on Windows the
// shim is a .cmd, which execFileSync cannot spawn without a shell.
const tsc = require.resolve('typescript/bin/tsc', { paths: [webDir] })

fs.rmSync(outDir, { recursive: true, force: true })

console.log('[tests] compiling to CommonJS...')
execFileSync(
  process.execPath,
  [
    tsc,
    'tests/pure.test.ts',
    '--outDir',
    '.test-out',
    '--module',
    'commonjs',
    '--moduleResolution',
    'node',
    '--target',
    'es2022',
    '--esModuleInterop',
    '--skipLibCheck',
    '--strict',
    '--resolveJsonModule',
  ],
  { cwd: webDir, stdio: 'inherit' }
)

const compiled = path.join(outDir, 'tests', 'pure.test.js')
if (!fs.existsSync(compiled)) {
  console.error(`[tests] expected compiled output at ${compiled}`)
  process.exit(1)
}

console.log('[tests] running node:test...\n')
execFileSync(process.execPath, ['--test', compiled], { cwd: webDir, stdio: 'inherit' })
