import type { RiskSignal } from '../score-engine'

/** Address after normalization/geocoding (Census geocoder, build phase 3). */
export interface NormalizedAddress {
  readonly street: string
  readonly city: string
  /** Two-letter USPS state code, uppercase. */
  readonly state: string
  /** Five-digit ZIP. */
  readonly zip: string
  readonly lat?: number
  readonly lon?: number
  /** Census FIPS code when geocoding succeeded. */
  readonly fips?: string
}

/**
 * Every free data source implements this interface so the Audit Agent can
 * fan out uniformly and fail soft per source (see wf_audit_property.md).
 */
export interface SourceClient {
  readonly name: string
  fetchSignals(address: NormalizedAddress): Promise<RiskSignal[]>
}
