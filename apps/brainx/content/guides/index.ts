import type { Guide } from './types'
import { GUIDE as VALIDATE } from './validate-with-evidence'
import { GUIDE as RULE_CHANGES } from './compliance-software-from-rule-changes'
import { GUIDE as REAL_ESTATE } from './real-estate-compliance-signals'

export type { Guide, GuideCitation, GuideFaq } from './types'

export const GUIDES: readonly Guide[] = [VALIDATE, RULE_CHANGES, REAL_ESTATE]

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}
