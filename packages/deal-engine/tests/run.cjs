// node --test on a DIRECTORY misbehaves on Windows (reports a phantom failing
// suite). Point it at the file explicitly.
const { execFileSync } = require('node:child_process')
const { join } = require('node:path')
execFileSync(process.execPath, ['--test', join(__dirname, 'reconcile.test.mjs')], {
  stdio: 'inherit',
  cwd: join(__dirname, '..'),
})
