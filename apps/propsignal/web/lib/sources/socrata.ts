/**
 * Socrata open-data client — free municipal datasets (code violations,
 * permits, liens) for cities that publish them.
 *
 * Socrata SODA API pattern (no key needed at low volume; app token raises
 * rate limits and is free):
 *   https://<domain>/resource/<dataset-id>.json?$where=<address filter>
 *
 * Coverage is city-by-city: the registry below is appended as cities are
 * onboarded. Reports for unregistered cities simply omit this section and
 * disclose the coverage gap (see wf_audit_property.md).
 */

import type { RiskSignal } from '../score-engine'
import type { NormalizedAddress, SourceClient } from './types'

export interface SocrataDataset {
  /** e.g. 'data.cityofnewyork.us' */
  readonly domain: string
  /** Socrata 4x4 dataset id, e.g. 'wvxf-dwi5'. */
  readonly datasetId: string
  /** Which city/state this dataset covers. */
  readonly city: string
  readonly state: string
  readonly kind: 'code_violations' | 'permits' | 'liens'
  /** Column holding the street address, for $where filters. */
  readonly addressColumn: string
}

/**
 * Onboarded datasets. Empty at scaffold time — populated in build phase 3
 * starting with the top investor metros that publish violation data
 * (NYC, Chicago, Dallas, Austin, Seattle).
 */
export const SOCRATA_DATASETS: readonly SocrataDataset[] = []

export function datasetsFor(address: NormalizedAddress): readonly SocrataDataset[] {
  return SOCRATA_DATASETS.filter(
    (d) =>
      d.state === address.state &&
      d.city.toLowerCase() === address.city.toLowerCase(),
  )
}

export const socrataClient: SourceClient = {
  name: 'socrata-open-data',
  async fetchSignals(_address: NormalizedAddress): Promise<RiskSignal[]> {
    throw new Error('not_implemented: build phase 3')
  },
}
