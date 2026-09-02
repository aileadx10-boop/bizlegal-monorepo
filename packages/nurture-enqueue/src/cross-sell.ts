/**
 * @bizlegal/nurture-enqueue/cross-sell — single source of truth for
 * post-purchase (and post-decline) cross-sell offers across the fleet.
 *
 * Each revenue app's success/thank-you page renders the 2-3 offers for
 * its surface. Recommendations follow the same sanity rules as the hub
 * product-finder (apps/hub/lib/product-finder/routing.ts): only live
 * products with working checkout + fulfillment are listed (no BRAI —
 * stop-sold fleet finding F4; no bench/coguard/trio — checkout dark).
 *
 * Copy discipline (per the one rule): every blurb is factual, names the
 * deliverable, and carries no outcome guarantees. Prices mirror
 * packages/payment/src/products.ts — update both when pricing changes.
 */

export interface CrossSellOffer {
  /** Display name of the destination product. */
  readonly product: string
  /** Short card headline. */
  readonly headline: string
  /** 1-2 sentence copy — factual, no outcome promises. */
  readonly blurb: string
  /** Display price string, e.g. "$97 one-time". */
  readonly price: string
  /** Absolute URL to the product's landing/checkout surface. */
  readonly url: string
}

/**
 * Surface = the app/page showing the cross-sell block. Keyed by the
 * success-page surface rather than ProductId so forge's two surfaces
 * (boi vs passport) can diverge.
 */
export type CrossSellSurface =
  | 'tracr'
  | 'forge_boi'
  | 'forge_passport'
  | 'docai'
  | 'lexaudit'
  | 'falseecho'
  | 'sellerradar'

const CROSS_SELL: Readonly<Record<CrossSellSurface, readonly CrossSellOffer[]>> = {
  // Wallet-trace buyer → sanctions screening + ongoing monitoring.
  tracr: [
    {
      product: 'Forge Wallet Scan',
      headline: 'Screen the counterparty wallet',
      blurb:
        'One-time forensic wallet scan with OFAC sanctions screening — the fast check before funds move.',
      price: '$97 one-time',
      url: 'https://forge.bizlegal-ai.com/scan',
    },
    {
      product: 'LexAudit Compliance Monitor',
      headline: 'Track the rules that apply to you',
      blurb:
        'Daily monitoring of FinCEN, SEC, and CFPB guidance with drift alerts when something changes for your scenario.',
      price: '$99/mo',
      url: 'https://lexaudit.bizlegal-ai.com',
    },
  ],

  // BOI report buyer → multi-jurisdiction passport + contract hygiene.
  forge_boi: [
    {
      product: 'Regulatory Passport',
      headline: 'One entity, every jurisdiction',
      blurb:
        'Multi-jurisdiction compliance passport for your entity — the obligations that apply beyond the BOI filing.',
      price: '$297 one-time',
      url: 'https://forge.bizlegal-ai.com/passport',
    },
    {
      product: 'DocAI Contract Risk Report',
      headline: 'Check the contracts behind the entity',
      blurb:
        'Evidence-cited risk report on an operating agreement, DPA, or ToS — red flags, missing clauses, fix recommendations.',
      price: '$97 one-time',
      url: 'https://docai.bizlegal-ai.com',
    },
  ],

  // Passport buyer → the US filing obligation + ongoing drift monitoring.
  forge_passport: [
    {
      product: 'BOI Compliance Report',
      headline: 'US entity? Check the BOI obligation',
      blurb:
        'One-time report on your FinCEN beneficial-ownership filing duties under the Corporate Transparency Act.',
      price: '$149 one-time',
      url: 'https://forge.bizlegal-ai.com/boi',
    },
    {
      product: 'LexAudit Compliance Monitor',
      headline: 'Passports age — monitoring doesn\u2019t',
      blurb:
        'Daily regulatory-drift alerts across the agencies in your passport so you hear about changes before enforcement does.',
      price: '$99/mo',
      url: 'https://lexaudit.bizlegal-ai.com',
    },
  ],

  // Contract-scan buyer → ongoing monitoring + policy hygiene.
  docai: [
    {
      product: 'LexAudit Compliance Monitor',
      headline: 'Contracts age — keep watching the rules',
      blurb:
        'Daily monitoring of regulatory guidance affecting your contracts, with alerts when a framework changes.',
      price: '$99/mo',
      url: 'https://lexaudit.bizlegal-ai.com',
    },
    {
      product: 'Privacy Policy Auto-Refresh',
      headline: 'Keep the policy in sync',
      blurb:
        'Daily 7-framework redline of your privacy policy with material-change alerts and suggested replacement language.',
      price: '$29/mo',
      url: 'https://bizlegal-ai.com/agents/policy-refresh',
    },
  ],

  // Monitoring subscriber → point-in-time scans it complements.
  lexaudit: [
    {
      product: 'DocAI Contract Risk Report',
      headline: 'Scan the document you\u2019re worried about',
      blurb:
        'Evidence-cited risk report on a specific contract, DPA, or ToS — complements ongoing monitoring with a point-in-time deep read.',
      price: '$97 one-time',
      url: 'https://docai.bizlegal-ai.com',
    },
    {
      product: 'OFAC Sanctions List Watcher',
      headline: 'Watch the sanctions lists daily',
      blurb:
        'Daily diff of OFAC / UN / EU sanctions lists against your watched addresses and entities, with email alerts on new matches.',
      price: '$29/mo',
      url: 'https://bizlegal-ai.com/tools/ofac-watcher',
    },
  ],

  // AI-falsehood evidence buyer → adjacent evidence-grade scans.
  falseecho: [
    {
      product: 'TRACR Wallet Trace',
      headline: 'False claim involve a wallet?',
      blurb:
        'On-chain trace + counterparty risk report with hash-anchored evidence — the same evidence discipline, applied to crypto transactions.',
      price: '$149 one-time',
      url: 'https://tracr.bizlegal-ai.com',
    },
    {
      product: 'DocAI Contract Risk Report',
      headline: 'Check what a contract actually says',
      blurb:
        'Evidence-cited risk report on a contract, DPA, or ToS with red flags and missing-clause findings.',
      price: '$97 one-time',
      url: 'https://docai.bizlegal-ai.com',
    },
  ],

  // Amazon fee-impact buyer → processor risk + contract review.
  sellerradar: [
    {
      product: 'PSP & MoR Pre-flight Audit',
      headline: 'Marketplace payouts frozen before?',
      blurb:
        'AUP-clause audit + documentation plan for your payment-processor exposure — the review done before a freeze, not during one.',
      price: '$299 one-time',
      url: 'https://bizlegal-ai.com/psp-risk',
    },
    {
      product: 'DocAI Contract Risk Report',
      headline: 'Review the agreements behind the store',
      blurb:
        'Evidence-cited risk report on supplier agreements, Amazon ToS, or DPAs — red flags and fix recommendations.',
      price: '$97 one-time',
      url: 'https://docai.bizlegal-ai.com',
    },
  ],
}

/** Cross-sell offers for a success-page surface. Always 2-3, never empty. */
export function crossSellFor(surface: CrossSellSurface): readonly CrossSellOffer[] {
  return CROSS_SELL[surface]
}
