/**
 * Loads tools/social-autopilot/.env (gitignored) into process.env without a
 * dotenv dependency. Imported FIRST by cli.mjs so it runs before any sibling
 * module reads env — ES imports are hoisted, so an inline loader in cli.mjs
 * ran after live.ts had already captured empty values.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const envPath = path.resolve(import.meta.dirname, '../.env')
if (existsSync(envPath)) {
  for (const raw of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const k = line.slice(0, eq).trim()
    const v = line.slice(eq + 1).trim()
    if (k && !process.env[k]) process.env[k] = v
  }
}
