/**
 * Translation and direction.
 *
 * No i18n library: two dictionaries and `Intl`, both of which ship with Node 22
 * and every browser we target. A routing/locale-negotiation library would be
 * weight for a product whose locale is a column on the party row.
 */

import { en } from './en'
import { he } from './he'
import { DEFAULT_LOCALE, type DictKey, type Locale } from './types'

export * from './types'
export { en, he }

const DICTS: Record<Locale, Record<DictKey, string>> = {
  'he-IL': he,
  'en-US': en as unknown as Record<DictKey, string>,
}

/** Right-to-left is a property of the locale, not of the page. */
export function dirFor(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'he-IL' ? 'rtl' : 'ltr'
}

export function langFor(locale: Locale): string {
  return locale === 'he-IL' ? 'he' : 'en'
}

/**
 * Look up a key and interpolate {placeholders}.
 *
 * An unknown key falls back to the English string and then to the key itself —
 * visible in review, never a crash in front of a customer mid-transaction.
 */
export function t(
  locale: Locale,
  key: DictKey,
  vars?: Readonly<Record<string, string | number>>,
): string {
  const dict = DICTS[locale] ?? DICTS[DEFAULT_LOCALE]
  const raw = dict[key] ?? (en as Record<string, string>)[key] ?? key
  if (!vars) return raw
  return Object.entries(vars).reduce(
    (acc, [name, value]) => acc.split(`{${name}}`).join(String(value)),
    raw,
  )
}

/** Resolve a task's label: template tasks carry an i18n key, manual ones carry text. */
export function taskLabel(
  locale: Locale,
  labelKey: string | null,
  labelText: string | null,
): string {
  if (labelText) return labelText
  if (labelKey) return t(locale, labelKey as DictKey)
  return ''
}
