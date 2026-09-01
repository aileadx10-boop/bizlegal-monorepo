/**
 * Server-side price map for the legacy /checkout flow — 2026-09-01.
 *
 * Closes fleet finding F2: /checkout?amount=<cents> used to carry a
 * client-controlled amount straight into the gateway with only a range
 * check, so anyone could buy a $999 plan for $0.50 by editing the URL.
 *
 * Now (product, tier, interval) is the SKU and the amount is resolved
 * here, server-side. The three gateway start routes
 * (/api/payments/{paypal,nowpayments,wire}/start) refuse any combination
 * not listed, and refuse a client-supplied amount_cents that doesn't
 * match an accepted value. The client `amount` param survives only as a
 * display hint — it is never charged.
 *
 * Every entry below mirrors a real link in the fleet (verified by grep
 * for `bizlegal-ai.com/checkout?` and direct /api/payments/*\/start
 * callers):
 *   - apps/{brai,tracr,lexaudit,docai}/app/pricing/page.tsx apexCheckout()
 *   - apps/forge/apps/web/app/pricing/page.tsx apexCheckout() + app/boi/page.tsx
 *   - apps/hub/app/pricing/page.tsx checkoutHref()
 *   - apps/hub/app/agents/page.tsx AgentCheckoutButton (tier = agent.name)
 *   - apps/hub/app/compliance-monitor/ComplianceMonitorClient.tsx
 *   - apps/hub/app/api/payments/conductor/start/route.ts (registry-priced)
 *   - apps/hub/app/ops/* quick-action links
 *   - apps/hub/app/agents/{marketplace-shield,india-dpdpa,ai-governance}
 *
 * New sellable SKU? Add it here AND update the linking page — a missing
 * entry fails closed (checkout shows an error, nothing is charged).
 */

export type CheckoutInterval = 'one-time' | 'monthly' | 'yearly'

/** Accepted amounts in USD cents. First entry is the canonical price. */
type AcceptedPrices = readonly number[]

type TierMap = Readonly<Record<string, Readonly<Partial<Record<CheckoutInterval, AcceptedPrices>>>>>

export const CHECKOUT_PRICE_MAP: Readonly<Record<string, TierMap>> = {
  // ───── Hub (apps/hub/app/pricing/page.tsx, ops quick links) ─────
  hub: {
    pro: { 'one-time': [14900], monthly: [14900], yearly: [149000] },
    scale: { 'one-time': [49900], monthly: [49900], yearly: [499000] },
  },

  // ───── BRAI (apps/brai/app/pricing/page.tsx) ─────
  brai: {
    standard: { 'one-time': [14900], monthly: [59900], yearly: [599000] },
    priority: { 'one-time': [24900], monthly: [99900], yearly: [999000] },
    extended: { 'one-time': [50000], monthly: [199900], yearly: [1999000] },
  },

  // ───── TRACR (apps/tracr/app/pricing/page.tsx) ─────
  tracr: {
    regulatory: { 'one-time': [2900], monthly: [2900], yearly: [29000] },
    standard: { 'one-time': [14900], monthly: [14900], yearly: [149000] },
    professional: { 'one-time': [34900], monthly: [34900], yearly: [349000] },
    enterprise: { 'one-time': [79900], monthly: [79900], yearly: [799000] },
  },

  // ───── LexAudit (apps/lexaudit pricing + landing-content.tsx) ─────
  lexaudit: {
    solo: { 'one-time': [4900], monthly: [4900], yearly: [49000] },
    boutique: { 'one-time': [19900], monthly: [19900], yearly: [199000] },
    midmarket: { 'one-time': [59900], monthly: [59900], yearly: [599000] },
    monitor: { monthly: [9900] },
  },

  // ───── Forge (apps/forge/apps/web pricing + boi page) ─────
  forge: {
    // boi/one-time has two live links at different prices: /pricing says
    // $149 (canonical, matches PRODUCTS.forge_boi_kit), /boi says $169.
    // Both are accepted so no existing link breaks; collapse to 14900
    // when the /boi page is updated.
    boi: { 'one-time': [14900, 16900], yearly: [14900] },
    // ops quick-action link uses tier 'boi-kit' for the same SKU.
    'boi-kit': { 'one-time': [14900] },
    passport: { 'one-time': [29700], monthly: [9900], yearly: [99000] },
    audit: { 'one-time': [9900], monthly: [4900], yearly: [49000] },
  },

  // ───── DocAI (apps/docai/web/app/pricing/page.tsx) ─────
  docai: {
    starter: { 'one-time': [2900], monthly: [2900], yearly: [29000] },
    team: { 'one-time': [6900], monthly: [6900], yearly: [69000] },
    firm: { 'one-time': [19900], monthly: [19900], yearly: [199000] },
  },

  // ───── AI Conductor (amounts derived from @bizlegal/payment registry
  // by /api/payments/conductor/start — keep in sync with products.ts) ─────
  conductor: {
    solo: { monthly: [9900], yearly: [99000] },
    team: { monthly: [25000], yearly: [250000] },
    firm: { monthly: [99900], yearly: [999000] },
  },

  // ───── Compliance Monitor page client ─────
  compliance_monitor_pro: {
    'Compliance Monitor Pro': { monthly: [9900] },
  },

  // ───── Hub agent cards (apps/hub/app/agents/page.tsx; tier = display
  // name, product = `agent_${id}`) + agent landing page links ─────
  agent_compliance_researcher: { 'Compliance Researcher': { monthly: [4900] } },
  agent_cross_jurisdiction_analyst: { 'Cross-Jurisdiction Analyst': { monthly: [4900] } },
  agent_contracts_expert: { 'Contracts Expert': { 'one-time': [1900] } },
  agent_risk_assessor: { 'Risk Assessor': { monthly: [4900] } },
  agent_due_diligence_scanner: { 'Due Diligence Scanner': { 'one-time': [1900] } },
  agent_regulatory_monitor: { 'Regulatory Monitor': { monthly: [4900] } },
  agent_compliance_monitor_pro: { 'Compliance Monitor Pro': { monthly: [4900] } },
  agent_dpa_negotiator: { 'DPA Negotiator': { 'one-time': [1900] } },
  agent_psp_mor_risk_manager: { 'PSP & MoR Risk Manager': { monthly: [4900] } },
  agent_cta_boi_tracker: { 'CTA-2024 BOI Tracker': { monthly: [4900] } },
  agent_ai_act_classifier: { 'EU AI Act Risk Classifier': { 'one-time': [1900] } },
  agent_policy_auto_refresh: { 'Privacy Policy Auto-Refresh': { monthly: [4900] } },
  agent_marketplace_shield: { 'Marketplace Compliance Shield': { monthly: [4900] } },
  agent_ai_governance_product: { 'AI Governance for Product Teams': { monthly: [4900] } },
  agent_india_dpdpa: { 'India DPDPA Readiness Kit': { 'one-time': [1900] } },
}

export interface ResolvedPrice {
  ok: true
  amountCents: number
}

export interface ResolveError {
  ok: false
  error: 'unknown_checkout_sku' | 'amount_mismatch'
  message: string
}

/**
 * Resolve the server-side price for a (product, tier, interval) SKU.
 * Fails closed: unknown combinations are rejected. When the caller
 * supplies a client-sent amount hint it must match one of the accepted
 * values; the resolved amount is what gets charged regardless.
 */
export function resolveCheckoutPrice(
  product: string,
  tier: string,
  interval: string,
  clientAmountCents?: number | null,
): ResolvedPrice | ResolveError {
  const accepted = CHECKOUT_PRICE_MAP[product]?.[tier]?.[interval as CheckoutInterval]
  if (!accepted || accepted.length === 0) {
    return {
      ok: false,
      error: 'unknown_checkout_sku',
      message: `Unknown product/tier/interval combination: ${product} / ${tier} / ${interval}`,
    }
  }
  if (
    typeof clientAmountCents === 'number' &&
    Number.isFinite(clientAmountCents) &&
    !accepted.includes(clientAmountCents)
  ) {
    return {
      ok: false,
      error: 'amount_mismatch',
      message: `Amount ${clientAmountCents} does not match the listed price for ${product} / ${tier} / ${interval}`,
    }
  }
  const amountCents =
    typeof clientAmountCents === 'number' && accepted.includes(clientAmountCents)
      ? clientAmountCents
      : accepted[0]
  return { ok: true, amountCents }
}
