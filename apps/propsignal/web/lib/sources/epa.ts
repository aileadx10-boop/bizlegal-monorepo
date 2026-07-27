/**
 * EPA environmental screening client — free public APIs, no key required.
 *
 * Endpoints:
 *   EJScreen:    https://ejscreen.epa.gov/mapper/ejscreenRESTbroker1.aspx
 *                  ?namestr=&geometry={"x":<lon>,"y":<lat>}&distance=1
 *                  &unit=9035&areatype=&areaid=&f=json
 *   Envirofacts: https://data.epa.gov/efservice/  (Superfund SEMS, brownfields
 *                  ACRES, TRI facilities — RESTful table queries, JSON output)
 *
 * Strategy: query Superfund (SEMS) + brownfield (ACRES) + TRI facilities
 * within a radius of the geocoded point, convert proximity to severity.
 */

import type { RiskSignal, Severity } from '../score-engine'
import type { NormalizedAddress, SourceClient } from './types'

export const EJSCREEN_URL =
  'https://ejscreen.epa.gov/mapper/ejscreenRESTbroker1.aspx'
export const ENVIROFACTS_URL = 'https://data.epa.gov/efservice/'

export type EnvSiteKind = 'superfund' | 'brownfield' | 'tri_facility'

/**
 * Maps an environmental site's kind + distance (miles) to severity.
 * Implemented now (pure, testable); the network fetch ships in build phase 3.
 */
export function envProximitySeverity(kind: EnvSiteKind, distanceMiles: number): Severity {
  if (distanceMiles < 0) return 'none'
  if (kind === 'superfund') {
    if (distanceMiles <= 1) return 'high'
    if (distanceMiles <= 3) return 'medium'
    return 'none'
  }
  if (kind === 'brownfield') {
    if (distanceMiles <= 0.5) return 'medium'
    if (distanceMiles <= 1) return 'low'
    return 'none'
  }
  // tri_facility
  if (distanceMiles <= 0.5) return 'low'
  return 'none'
}

export const epaClient: SourceClient = {
  name: 'epa-screening',
  async fetchSignals(_address: NormalizedAddress): Promise<RiskSignal[]> {
    throw new Error('not_implemented: build phase 3')
  },
}
