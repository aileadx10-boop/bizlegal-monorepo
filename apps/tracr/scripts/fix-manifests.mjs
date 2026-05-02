/**
 * Vercel packaging workaround: Next.js 14 route groups don't always generate
 * page_client-reference-manifest.js files. Vercel's server file tracer requires
 * them to exist. This script creates empty ones for route groups that lack them.
 */
import { existsSync, writeFileSync, readdirSync, mkdirSync } from 'fs'
import { join } from 'path'

const APP_DIR = '.next/server/app'
const MANIFEST_NAME = 'page_client-reference-manifest.js'
const EMPTY_MANIFEST = 'self.__RSC_MANIFEST=self.__RSC_MANIFEST||{};'

function processDir(dir) {
  if (!existsSync(dir)) return
  const entries = readdirSync(dir, { withFileTypes: true })
  const hasPageJs = entries.some(e => e.name === 'page.js')
  const hasManifest = entries.some(e => e.name === MANIFEST_NAME)

  if (hasPageJs && !hasManifest) {
    const manifestPath = join(dir, MANIFEST_NAME)
    writeFileSync(manifestPath, EMPTY_MANIFEST)
    console.log(`Created: ${manifestPath}`)
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      processDir(join(dir, entry.name))
    }
  }
}

processDir(APP_DIR)
console.log('Done fixing manifests.')
