// node --test on a DIRECTORY misbehaves on Windows (reports a phantom failing
// suite). Build first, then point --test at the file explicitly.
const { execFileSync } = require('node:child_process')
const { join } = require('node:path')
const pkgDir = join(__dirname, '..')
const tsc = require.resolve('typescript/bin/tsc', { paths: [pkgDir] })

execFileSync(process.execPath, [tsc, '-p', 'tsconfig.json'], { stdio: 'inherit', cwd: pkgDir })
execFileSync(process.execPath, ['--test', join(__dirname, 'engine.test.mjs')], {
  stdio: 'inherit',
  cwd: pkgDir,
})
