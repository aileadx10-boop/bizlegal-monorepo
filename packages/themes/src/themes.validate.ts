/**
 * Theme value sanity validator (audit M3 closure).
 *
 * Catches typos in the 4 ThemeSpec records before they ship —
 * `setProperty('--brand', '#oops')` silently no-ops in CSS, so a bad
 * hex never throws but renders as the inherited fallback, looking
 * subtly off-brand with no diagnostic.
 *
 * Run via:  pnpm --filter @bizlegal/themes validate-themes
 * Or in CI: node --experimental-strip-types packages/themes/src/themes.validate.ts
 *
 * Exits non-zero on any failure so it can gate a deploy.
 */

import { THEMES, THEME_VAR_KEYS, type ThemeId, type ThemeVarKey } from './themes.ts'

interface Failure {
  readonly theme: ThemeId
  readonly key: ThemeVarKey
  readonly value: string
  readonly reason: string
}

const HEX_RE = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const RGBA_RE = /^rgba?\([\s\d.,/%]+\)$/i
// Multi-line gradients in --hero-bg / --audits-bg etc. are also legal.
const GRADIENT_KEYS: ReadonlySet<ThemeVarKey> = new Set([
  '--hero-bg',
  '--audits-bg',
  '--spotlight-bg',
  '--bleed-bg',
  '--contact-bg',
  '--shield-grad',
])

function validateValue(key: ThemeVarKey, raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return 'empty value'

  if (GRADIENT_KEYS.has(key)) {
    if (!/(linear|radial|conic)-gradient\s*\(/i.test(trimmed)) {
      return `gradient key without a *-gradient(...) function`
    }
    return null
  }

  // Rest are color tokens or alpha-channel rgbas.
  if (HEX_RE.test(trimmed)) return null
  if (RGBA_RE.test(trimmed)) return null

  return `unrecognized color token (expected #hex or rgba())`
}

export function validateThemes(): { ok: boolean; failures: ReadonlyArray<Failure> } {
  const failures: Failure[] = []

  for (const [id, spec] of Object.entries(THEMES) as ReadonlyArray<[ThemeId, typeof THEMES[ThemeId]]>) {
    // Exhaustiveness — every theme defines every canonical key.
    for (const expected of THEME_VAR_KEYS) {
      if (!(expected in spec.vars)) {
        failures.push({
          theme: id,
          key: expected,
          value: '<missing>',
          reason: `theme "${id}" missing required key "${expected}"`,
        })
      }
    }

    for (const [k, v] of Object.entries(spec.vars) as ReadonlyArray<[ThemeVarKey, string]>) {
      const reason = validateValue(k, v)
      if (reason) failures.push({ theme: id, key: k, value: v, reason })
    }
  }

  return { ok: failures.length === 0, failures }
}

// Run when invoked as script (works under both CJS and ESM contexts).
const result = validateThemes()
if (result.ok) {
  // eslint-disable-next-line no-console
  console.log(`[validate-themes] ✓ ${Object.keys(THEMES).length} themes × ${THEME_VAR_KEYS.length} keys all valid`)
} else {
  // eslint-disable-next-line no-console
  console.error(`[validate-themes] ✗ ${result.failures.length} failures:`)
  for (const f of result.failures) {
    // eslint-disable-next-line no-console
    console.error(`  ${f.theme}.${f.key} = ${JSON.stringify(f.value).slice(0, 60)} — ${f.reason}`)
  }
  process.exit(1)
}
