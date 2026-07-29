/**
 * Core typed contract for the LeaseParse extraction pipeline.
 * Every engine (Hermes, Claude) must produce an ExtractionResult; the
 * date engine and portfolio monitor consume LeaseAbstract downstream.
 */

export interface LeaseParties {
  landlord: string
  tenant: string
  guarantor?: string
}

export interface LeasePremises {
  address: string
  city: string
  state: string
  square_feet?: number
  suite?: string
}

export interface LeaseTerm {
  /** ISO date (YYYY-MM-DD). */
  commencement: string
  /** ISO date (YYYY-MM-DD). */
  expiration: string
  renewal_options?: string
}

export interface RentEscalation {
  /** ISO date the new rent takes effect. */
  effective: string
  base_rent_cents: number
}

export interface LeaseFinancial {
  base_rent_cents: number
  escalations: RentEscalation[]
  /** CAM / operating-expense structure, as extracted prose. */
  cam?: string
  /** Percentage rent terms (rate + breakpoint), as extracted prose. */
  percentage_rent?: string
  security_deposit_cents?: number
}

export interface CriticalDate {
  /** Stable machine key, e.g. 'renewal_notice', 'expiration', 'kick_out'. */
  key: string
  /** Human label shown in alerts. */
  label: string
  /** ISO date (YYYY-MM-DD). */
  date: string
  /** Days of advance notice the lease requires, if any. */
  notice_window_days?: number
}

export type RiskClause =
  | 'co_tenancy'
  | 'go_dark'
  | 'assignment_restriction'
  | 'exclusive_use'
  | 'relocation'
  | 'demolition'

export type RiskSeverity = 'info' | 'warn' | 'high'

export interface RiskFlag {
  clause: RiskClause
  /** Verbatim excerpt from the lease supporting the flag. */
  excerpt: string
  severity: RiskSeverity
}

export interface LeaseAbstract {
  parties: LeaseParties
  premises: LeasePremises
  term: LeaseTerm
  financial: LeaseFinancial
  critical_dates: CriticalDate[]
  risk_flags: RiskFlag[]
}

export type ExtractionEngine = 'hermes' | 'claude'

export interface ExtractionResult {
  abstract: LeaseAbstract
  /** 0–1; deterministic completeness score, see hermes-first.ts scoreConfidence. */
  confidence: number
  engine: ExtractionEngine
  warnings: string[]
}
