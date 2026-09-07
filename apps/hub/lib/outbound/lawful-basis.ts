/**
 * Jurisdiction → lawful basis for unsolicited B2B email (rule 7 v2, item 2).
 *
 * Only `enabled: true` rows may be sent under today. The others are written
 * down so the phase-2 switch is a one-line change with the evidence
 * requirement already stated. Sources: decisions/OUTBOUND-V2-RULE-7-AMENDED-
 * 2026-09-07.md §legal matrix. Moses (the lawyer) confirms before any row
 * flips to enabled.
 */
import type { LawfulBasis } from '@bizlegal/email'

export interface JurisdictionRule {
  readonly jurisdiction: string
  readonly basis: LawfulBasis | null
  readonly enabled: boolean
  readonly regime: string
  readonly requirements: readonly string[]
}

export const JURISDICTION_MATRIX: readonly JurisdictionRule[] = [
  {
    jurisdiction: 'US',
    basis: 'us_can_spam',
    enabled: true,
    regime: 'CAN-SPAM Act (opt-out)',
    requirements: [
      'accurate header and sender identification',
      'subject line not deceptive',
      'valid physical postal address in every message',
      'working unsubscribe honoured within 10 business days',
      'no further mail after opt-out',
    ],
  },
  {
    jurisdiction: 'CA',
    basis: 'ca_casl_published',
    enabled: false,
    regime: 'CASL (implied consent via conspicuous publication)',
    requirements: [
      'business email conspicuously published without a no-unsolicited statement (source_url required)',
      'message relevant to the recipient\'s business role',
      'sender identification with a mailing address',
      'unsubscribe mechanism honoured within 10 business days',
    ],
  },
  {
    jurisdiction: 'AU',
    basis: 'au_spam_act_published',
    enabled: false,
    regime: 'Spam Act 2003 (inferred consent via conspicuous publication)',
    requirements: ['business address conspicuously published without a no-unsolicited statement (source_url required)', 'sender identified', 'functional unsubscribe'],
  },
  {
    jurisdiction: 'GB',
    basis: 'uk_pecr_corporate',
    enabled: false,
    regime: 'PECR (corporate subscribers only)',
    requirements: ['recipient is a company or LLP, never a sole trader or partnership', 'sender identified', 'opt-out honoured'],
  },
  { jurisdiction: 'EU', basis: null, enabled: false, regime: 'member-state variance; excluded', requirements: [] },
  { jurisdiction: 'IL', basis: null, enabled: false, regime: 'Communications Law Amendment 40 (opt-in); excluded', requirements: [] },
]

export function basisFor(jurisdiction: string | null | undefined): LawfulBasis | null {
  if (!jurisdiction) return null
  const row = JURISDICTION_MATRIX.find((r) => r.jurisdiction === jurisdiction.toUpperCase())
  return row && row.enabled ? row.basis : null
}

export function enabledJurisdictions(): readonly string[] {
  return JURISDICTION_MATRIX.filter((r) => r.enabled).map((r) => r.jurisdiction)
}
