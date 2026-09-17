/**
 * @bizlegal/nurture-enqueue/cross-sell — single source of truth for
 * post-purchase (and post-decline) cross-sell offers across the fleet.
 *
 * Each revenue app's success/thank-you page renders the 2-3 offers for
 * its surface. Recommendations follow the same sanity rules as the hub
 * product-finder (apps/hub/lib/product-finder/routing.ts): only live
 * HTTPS hosts with a working checkout path. BRAI stays on the rails.
 * Parked (no DNS, no deploy): propsignal, closeflow, coguard.
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
  | 'leadforge'
  | 'leaseparse'
  | 'casepage'
  | 'sincefiled'
  | 'brainx'
  | 'deal44'

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
    {
      product: 'BRAI Counterparty Risk Preview',
      headline: 'Regulatory-risk preview for that wallet',
      blurb:
        'A counterparty-risk preview plus a paid full report when you need the evidence pack. Not a sanctions determination.',
      price: '$49 one-time',
      url: 'https://brai.bizlegal-ai.com',
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

  // Free-audit lead → contract hygiene for lead-buy agreements,
  // ongoing TCPA/FCC rule drift, and evidence-grade AI-claim docs.
  // LeadForge has no paid tier of its own — this block IS the
  // conversion path.
  leadforge: [
    {
      product: 'DocAI Contract Risk Report',
      headline: 'Review your lead-purchase agreements',
      blurb:
        'Evidence-cited risk report on a lead-buying contract, DPA, or vendor ToS — consent-scope clauses, indemnification gaps, and fix recommendations.',
      price: '$97 one-time',
      url: 'https://docai.bizlegal-ai.com',
    },
    {
      product: 'LexAudit Compliance Monitor',
      headline: 'Track TCPA / FCC rule drift',
      blurb:
        'Daily monitoring of FCC, FTC, and state-AG guidance affecting outbound campaigns, with drift alerts when consent or revocation rules change.',
      price: '$99/mo',
      url: 'https://lexaudit.bizlegal-ai.com',
    },
    {
      product: 'FalseEcho AI Falsehood Audit',
      headline: 'What do AI engines say about you?',
      blurb:
        '25-prompt battery across four AI answer engines with a hash-anchored evidence pack documenting any false claims verbatim.',
      price: '$29 one-time',
      url: 'https://falseecho.bizlegal-ai.com',
    },
  ],

  leaseparse: [
    {
      product: 'Close-adjacent contract scan',
      headline: 'Read the lease the engine abstracted',
      blurb:
        'Evidence-cited risk report on the same lease PDF — red flags and missing clauses for your own review. Not legal advice.',
      price: '$97 one-time',
      url: 'https://docai.bizlegal-ai.com',
    },
    {
      product: 'DEAL44 deal room',
      headline: 'Turn dates into a shared checklist',
      blurb:
        'Hebrew/RTL room with per-party links and a deterministic deadline list. Dates the engine cannot source stay blank.',
      price: '$679 one-time',
      url: 'https://deal44.bizlegal-ai.com/start',
    },
  ],

  casepage: [
    {
      product: 'SinceFiled',
      headline: 'Track days since the last filing',
      blurb:
        'Days-since tracker for trust recs, CLE, and renewals with a predicted-due estimate. Verify against jurisdiction rules.',
      price: '$49/mo',
      url: 'https://sincefiled.bizlegal-ai.com',
    },
    {
      product: 'FirmCited Search Visibility OS',
      headline: 'Turn the status page into inbound',
      blurb:
        'Search-visibility operating system for the firm that bought CasePage — audit, intake, and citation tracking.',
      price: '$490 one-time',
      url: 'https://cited.bizlegal-ai.com/audit',
    },
  ],

  sincefiled: [
    {
      product: 'CasePage',
      headline: 'Show clients the matter status',
      blurb:
        'Client-facing matter pages with milestones, document checklists, and hearing countdowns. Decision support, not legal advice.',
      price: '$49/mo',
      url: 'https://casepage.bizlegal-ai.com',
    },
    {
      product: 'LexAudit Compliance Monitor',
      headline: 'Watch the rules behind the streak',
      blurb:
        'Daily monitoring of the frameworks your obligations sit under, with drift alerts when guidance changes.',
      price: '$99/mo',
      url: 'https://lexaudit.bizlegal-ai.com',
    },
  ],

  brainx: [
    {
      product: 'DocAI Contract Risk Report',
      headline: 'Diligence the document behind the opportunity',
      blurb:
        'Evidence-cited risk report on a contract or DPA before you act on a radar pick. Not legal advice.',
      price: '$97 one-time',
      url: 'https://docai.bizlegal-ai.com',
    },
    {
      product: 'Bench legal-AI evaluation',
      headline: 'Measure the model before you ship it',
      blurb:
        'Jurisdiction-specific legal-AI benchmarks with a written diagnostic. Measurement, not a substitute for counsel.',
      price: '$2,500 one-time',
      url: 'https://bench.bizlegal-ai.com/pricing',
    },
  ],

  deal44: [
    {
      product: 'LeaseParse abstract',
      headline: 'Abstract the lease in the room',
      blurb:
        'One $59 text-layer commercial lease abstract with a predicted critical-date list. Scanned PDFs are refused, not guessed.',
      price: '$59 one-time',
      url: 'https://leaseparse.bizlegal-ai.com',
    },
    {
      product: 'DocAI Contract Risk Report',
      headline: 'Cite the clauses the checklist tracks',
      blurb:
        'Evidence-cited risk report on the SPA or addendum sitting in the room. Not legal advice.',
      price: '$97 one-time',
      url: 'https://docai.bizlegal-ai.com',
    },
  ],
}

/** Cross-sell offers for a success-page surface. Always 2-3, never empty. */
export function crossSellFor(surface: CrossSellSurface): readonly CrossSellOffer[] {
  return CROSS_SELL[surface]
}
