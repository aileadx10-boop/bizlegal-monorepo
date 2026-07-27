/**
 * FEMA National Flood Hazard Layer (NFHL) client — free public API.
 *
 * Endpoint (identify flood zone by point, no API key required):
 *   https://hazards.fema.gov/nfhlv2/output/FIRMette — FIRMette generation
 *   https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query
 *     ?geometry=<lon>,<lat>&geometryType=esriGeometryPoint&inSR=4326
 *     &outFields=FLD_ZONE,ZONE_SUBTY&returnGeometry=false&f=json
 *
 * Layer 28 = Flood Hazard Zones. Requires lat/lon from the (free) Census
 * geocoder — see NormalizedAddress.
 */

import type { RiskSignal, Severity } from '../score-engine'
import type { NormalizedAddress, SourceClient } from './types'

export const NFHL_QUERY_URL =
  'https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query'

/**
 * Maps a FEMA flood-zone code to a severity. Implemented now (pure,
 * testable); the network fetch ships in build phase 3.
 *
 * Zone reference: A/AE/AH/AO/AR/A99 = 1% annual chance (high risk);
 * V/VE = coastal high hazard (highest); X shaded = 0.2% (moderate);
 * X unshaded / C = minimal; D = undetermined.
 */
export function floodZoneSeverity(zone: string): Severity {
  const z = zone.trim().toUpperCase()
  if (z.startsWith('V')) return 'high'
  if (z.startsWith('A')) return 'high'
  if (z === 'X SHADED' || z === 'B' || z === 'X500') return 'medium'
  if (z === 'D') return 'low'
  return 'none' // X unshaded, C, or unrecognized → no deduction
}

export const femaClient: SourceClient = {
  name: 'fema-nfhl',
  async fetchSignals(_address: NormalizedAddress): Promise<RiskSignal[]> {
    throw new Error('not_implemented: build phase 3')
  },
}
