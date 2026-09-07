/**
 * The key set is whatever `en.ts` declares. `he.ts` must satisfy it exactly, so
 * a missing Hebrew string is a typecheck failure rather than a raw key rendered
 * at a broker.
 */
import type { en } from './en'

export type DictKey = keyof typeof en
export type Locale = 'he-IL' | 'en-US'

export const LOCALES: readonly Locale[] = ['he-IL', 'en-US']
export const DEFAULT_LOCALE: Locale = 'he-IL'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}
