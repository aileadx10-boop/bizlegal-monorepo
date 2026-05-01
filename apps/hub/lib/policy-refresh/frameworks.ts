/**
 * V2 — Privacy Auto-Refresh framework registry.
 *
 * Single source of truth for the 7 privacy frameworks the redline
 * cron evaluates against. Used by:
 *   - app/api/policy-refresh/audit/route.ts (allow-list filter on Sonnet output)
 *   - app/agents/policy-refresh/page.tsx + form component (label rendering)
 *   - app/api/cron/policy-refresh/route.ts (recurring re-audit)
 */

export const ALLOWED_FRAMEWORKS = new Set([
  'gdpr',
  'ccpa',
  'cpra',
  'law25',
  'co_cpa',
  'ct_dpa',
  'tx_dpsa',
])

export const FRAMEWORK_LABELS: Record<string, string> = {
  gdpr: 'GDPR',
  ccpa: 'CCPA',
  cpra: 'CPRA',
  law25: 'Quebec Law 25',
  co_cpa: 'Colorado CPA',
  ct_dpa: 'Connecticut DPA',
  tx_dpsa: 'Texas DPSA',
}

export const FRAMEWORK_ORDER: ReadonlyArray<string> = [
  'gdpr',
  'ccpa',
  'cpra',
  'law25',
  'co_cpa',
  'ct_dpa',
  'tx_dpsa',
]
