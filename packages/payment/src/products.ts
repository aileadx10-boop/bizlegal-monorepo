/**
 * Single source of truth for every priceable product in the BizLegal AI fleet.
 *
 * Adding a new product? Append here. The /api/pay/start endpoint reads this
 * registry; PricingTierCard components reference these IDs by string.
 *
 * Why centralized: per Phase Z, the rule is no NEXT_PUBLIC_*_URL env constants.
 * Pricing + product metadata lives in code; checkout URLs are generated on the
 * fly via the gateway clients (NOWPayments invoice / PayPal order / LS / Paddle).
 *
 * Phase AA D10: getProduct() applies any active pricing experiment from
 * pricing-experiments.ts. The PRODUCTS table itself is immutable except
 * via Moses-approved direct edits.
 */

import { activeExperimentFor } from './pricing-experiments'

export type ProductId =
  // BOI Tracker
  // O-025 CasePage
  | 'cp_solo_49'
  | 'cp_firm_149'
  | 'cp_setup_490'
  // O-026 SinceFiled
  | 'sf_firm_49'
  | 'sf_lifetime_329'
  | 'sf_pack_us_19'
  | 'sf_pack_both_29'
  | 'boi_solo_monthly'
  | 'boi_solo_yearly'
  | 'boi_firm_monthly'
  | 'boi_firm_yearly'
  // V1 — AI-Act Risk Classifier
  | 'ai_act_onetime'
  | 'ai_act_monthly'
  // V2 — Privacy Auto-Refresh
  | 'policy_refresh_monthly'
  | 'policy_refresh_yearly'
  // PSP & MoR Risk Manager
  | 'psp_audit_onetime'
  | 'psp_retainer_monthly'
  // TRACR forensic reports (dynamic per-wallet; tier sets the price)
  | 'tracr_bronze'
  | 'tracr_silver'
  // BRAI full report removed 2026-09-02 — stop-sold (no fulfillment code,
  // fleet finding F4). Unknown id now fails closed at checkout.
  // Forge surfaces
  | 'forge_boi_kit'
  | 'forge_passport'
  | 'forge_wallet_scan'
  // DocAI
  | 'docai_scan_report'
  | 'docai_team_monthly'
  | 'docai_firm_monthly'
  // LexAudit Compliance Monitor
  | 'lexaudit_monitor_monthly'
  | 'lexaudit_boutique_monthly'
  | 'lexaudit_midmarket_monthly'
  // AI Conductor
  | 'conductor_solo_monthly'
  | 'conductor_solo_yearly'
  | 'conductor_team_monthly'
  | 'conductor_team_yearly'
  | 'conductor_firm_monthly'
  | 'conductor_firm_yearly'
  // CLE
  | 'cle_standalone_monthly'
  // AIA — Compliance Ops Retainer (managed service)
  | 'compliance_ops_retainer'
  // Trio (2026-07-28 scaffold — inert until each surface goes live; see
  // decisions/TRIO-PROPSIGNAL-LEASEPARSE-CLOSEFLOW-2026-07-28.md)
  | 'propsignal_report_49'
  | 'leaseparse_abstract_59'
  | 'closeflow_transaction_39'
  // Nifty Haven — the /learn layer (2026-07-30). Registered so pre-order
  // checkout is one flag away, but NOT yet wired to a buy button: /learn has
  // no auth and no delivery mechanism, so a purchase could not be fulfilled.
  // /learn currently captures email via double opt-in only. Do not surface
  // these in a checkout until gated-lesson delivery exists.
  | 'academy_realestate_annual'
  | 'academy_founders_annual'
  // Stablecoin Reserve Report Generator (W2-5)
  | 'stablecoin_reserve_monthly'
  // Bench — legal AI evaluation lab (2026-08-16 scaffold; checkout dark until
  // Moses-verified test purchase — see decisions/BENCH-LEGAL-AI-QUALITY-2026-08-16.md)
  | 'bench_audit_2500'
  | 'bench_managed_monthly'
  // CoGuard — co-parenting communication & evidentiary engine (checkout dark;
  // see decisions/COGUARD_PRODUCT_PLAN.md)
  | 'coguard_solo_monthly'
  | 'coguard_solo_yearly'
  | 'coguard_litigation_monthly'
  | 'coguard_litigation_yearly'
  // OFAC Sanctions List Watcher (W2-6)
  | 'ofac_watch_monthly'
  // CASP Compliance Bundle (W4-12) — flagship recurring SKU
  | 'casp_bundle_monthly'
  // AI Policy Generator (W3-8) — $99 one-time wizard
  | 'ai_policy_generator'
  // AI Practice Review + AI Teammate Kit (O-018, 2026-09-06). Written, async
  // products offered by Moses Dor, Adv. in his personal capacity; payment is
  // processed by DOR INNOVATIONS. Fulfilled by lib/payments/practice-grant.ts
  // (five-question email / gated kit link). No calls, no live delivery.
  | 'ai_practice_review'
  | 'ai_teammate_kit'
  | 'practice_revenue_report'
  | 'deal44_room_setup_ils'
  | 'deal44_broker_monthly_ils'
  | 'deal44_room_setup_usd'
  // BrainX — Intelligence OS (2026-09-16)
  | 'brainx_opportunity_radar_monthly'
  | 'brainx_opportunity_radar_yearly'
  | 'brainx_radar_build_monthly'
  | 'brainx_radar_build_yearly'
  | 'deal44_broker_monthly_usd'

export type BillingInterval = 'one-time' | 'monthly' | 'yearly'

export interface ProductSpec {
  readonly id: ProductId
  readonly name: string
  readonly description: string
  readonly product_family: 'boi' | 'ai_act' | 'policy_refresh' | 'psp' | 'tracr' | 'brai' | 'forge' | 'docai' | 'lexaudit' | 'conductor' | 'cle' | 'propsignal' | 'leaseparse' | 'closeflow' | 'academy' | 'reserve_report' | 'bench' | 'coguard' | 'ofac_watch' | 'casp' | 'ai_policy' | 'practice' | 'deal44' | 'casepage' | 'sincefiled' | 'brainx'
  readonly billing_interval: BillingInterval
  readonly amount_cents: number
  /**
   * ILS was added 2026-09-07 for DEAL44, whose first market is Israel.
   *
   * Which rails carry it: NOWPayments prices in fiat and settles in crypto, so
   * a shekel price is a number it converts — that is live. PayPal cannot
   * RECEIVE shekels, so `apps/hub/app/api/pay/start` refuses card checkout for
   * any non-USD product rather than creating an order that cannot settle. The
   * wire route is USD/EUR-only above a $500 floor. A shekel card payment is
   * therefore taken by invoice, recorded as a `gateway='manual'` order — the
   * O-018 precedent.
   */
  readonly currency: 'USD' | 'ILS'
  /** Hub agent landing where this product is bought (relative path). */
  readonly checkout_origin: string
  /** Webhook callback path on hub — gateway IPN/webhook fires here on payment confirmation. */
  readonly webhook_path: string
  /** True if the gateway supports cancellation (subscriptions only). */
  readonly cancellable: boolean
}

/**
 * DEAL44 room setup — the shekel price and its dollar twin.
 *
 * The product is priced in shekels. Israel is market #1 and ₪2,500 is the
 * number the founder set, so the USD SKU is not an independent price: it is
 * that same price converted once, at a rate written down here rather than
 * re-guessed at each deploy. It replaced a $699 placeholder that had drifted
 * ~3% above the shekel figure it was meant to mirror.
 *
 * Rate: 3.68 ILS per USD. This is a STATED ASSUMPTION recorded on 2026-09-15,
 * not a live quote — nothing in this repo fetches FX. ₪2,500 ÷ 3.68 = $679.35,
 * rounded down to $679.
 *
 * Move both numbers together. A dollar figure that no longer tracks ₪2,500 is
 * a second price, not a twin, and the two markets then quote different deals.
 */
export const DEAL44_ILS_PER_USD = 3.68
export const DEAL44_ROOM_SETUP_ILS_AGOROT = 250_000
export const DEAL44_ROOM_SETUP_USD_CENTS = 67_900

export const PRODUCTS: Readonly<Record<ProductId, ProductSpec>> = {
  // ───── BOI Tracker ─────
  boi_solo_monthly: {
    id: 'boi_solo_monthly',
    name: 'BOI Tracker Solo (monthly)',
    description: '1 entity tracked + daily FinCEN guidance monitor + 30-day refile alerts.',
    product_family: 'boi',
    billing_interval: 'monthly',
    amount_cents: 2900,
    currency: 'USD',
    checkout_origin: '/agents/boi-tracker',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  boi_solo_yearly: {
    id: 'boi_solo_yearly',
    name: 'BOI Tracker Solo (yearly)',
    description: '1 entity tracked, 12-month plan (save 2 months).',
    product_family: 'boi',
    billing_interval: 'yearly',
    amount_cents: 29000,
    currency: 'USD',
    checkout_origin: '/agents/boi-tracker',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  boi_firm_monthly: {
    id: 'boi_firm_monthly',
    name: 'BOI Tracker Firm (monthly)',
    description: 'Up to 50 entities + multi-entity dashboard + bulk CSV add + API access.',
    product_family: 'boi',
    billing_interval: 'monthly',
    amount_cents: 9900,
    currency: 'USD',
    checkout_origin: '/agents/boi-tracker',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  boi_firm_yearly: {
    id: 'boi_firm_yearly',
    name: 'BOI Tracker Firm (yearly)',
    description: 'Up to 50 entities, 12-month plan (save 2 months).',
    product_family: 'boi',
    billing_interval: 'yearly',
    amount_cents: 99000,
    currency: 'USD',
    checkout_origin: '/agents/boi-tracker',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },

  // ───── V1 AI-Act ─────
  ai_act_onetime: {
    id: 'ai_act_onetime',
    name: 'EU AI Act Risk Classifier — Full Report',
    description: 'Sonnet-drafted compliance file with Article 6 + Annex III citations + 15-item checklist.',
    product_family: 'ai_act',
    billing_interval: 'one-time',
    amount_cents: 9900,
    currency: 'USD',
    checkout_origin: '/agents/ai-act',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },
  ai_act_monthly: {
    id: 'ai_act_monthly',
    name: 'EU AI Act Monitoring',
    description: 'Daily semantic-diff on EU AI Act sources + quarterly re-classification.',
    product_family: 'ai_act',
    billing_interval: 'monthly',
    amount_cents: 4900,
    currency: 'USD',
    checkout_origin: '/agents/ai-act',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },

  // ───── V2 Privacy Auto-Refresh ─────
  policy_refresh_monthly: {
    id: 'policy_refresh_monthly',
    name: 'Privacy Policy Auto-Refresh (monthly)',
    description: 'Daily 7-framework redline + material-change alerts + suggested replacement language.',
    product_family: 'policy_refresh',
    billing_interval: 'monthly',
    amount_cents: 2900,
    currency: 'USD',
    checkout_origin: '/agents/policy-refresh',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  policy_refresh_yearly: {
    id: 'policy_refresh_yearly',
    name: 'Privacy Policy Auto-Refresh (yearly)',
    description: '12-month plan (save 2 months).',
    product_family: 'policy_refresh',
    billing_interval: 'yearly',
    amount_cents: 29000,
    currency: 'USD',
    checkout_origin: '/agents/policy-refresh',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },

  // ───── PSP & MoR Risk Manager ─────
  psp_audit_onetime: {
    id: 'psp_audit_onetime',
    name: 'PSP & MoR Pre-flight Audit',
    description: 'AUP-clause audit + documentation plan to prevent processor rejection.',
    product_family: 'psp',
    billing_interval: 'one-time',
    amount_cents: 29900,
    currency: 'USD',
    checkout_origin: '/psp-risk',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },
  psp_retainer_monthly: {
    id: 'psp_retainer_monthly',
    name: 'PSP & MoR Retainer (monthly)',
    description: 'Quarterly re-audit + on-call freeze-recovery support.',
    product_family: 'psp',
    billing_interval: 'monthly',
    amount_cents: 9900,
    currency: 'USD',
    checkout_origin: '/psp-risk',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },

  // ───── TRACR (dynamic per-wallet, fixed price by tier) ─────
  tracr_bronze: {
    id: 'tracr_bronze',
    name: 'TRACR Bronze Forensic Report',
    description: 'Wallet trace + counterparty graph + 1-year history.',
    product_family: 'tracr',
    billing_interval: 'one-time',
    amount_cents: 14900,
    currency: 'USD',
    checkout_origin: 'https://tracr.bizlegal-ai.com',
    webhook_path: '/api/tracr/webhook',
    cancellable: false,
  },
  tracr_silver: {
    id: 'tracr_silver',
    name: 'TRACR Silver Forensic Report',
    description: 'Bronze + court-ready prose for freezing-order applications.',
    product_family: 'tracr',
    billing_interval: 'one-time',
    amount_cents: 29900,
    currency: 'USD',
    checkout_origin: 'https://tracr.bizlegal-ai.com',
    webhook_path: '/api/tracr/webhook',
    cancellable: false,
  },

  // ───── BRAI — removed 2026-09-02 (stop-sell, fleet finding F4): ─────
  // brai_full_report was a $49 SKU with no report-generation or fulfillment
  // code anywhere in apps/brai. Deleted so /api/pay/start fails closed on
  // it. Re-add only when paid report delivery exists.

  // ───── Forge ─────
  forge_boi_kit: {
    id: 'forge_boi_kit',
    name: 'BOI Compliance Report (Forge)',
    description: 'One-time PDF report on BOI obligations for an LLC.',
    product_family: 'forge',
    billing_interval: 'one-time',
    amount_cents: 14900,
    currency: 'USD',
    checkout_origin: 'https://forge.bizlegal-ai.com/boi',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },
  forge_passport: {
    id: 'forge_passport',
    name: 'Regulatory Passport (Forge)',
    description: 'Multi-jurisdiction compliance passport for a single entity.',
    product_family: 'forge',
    billing_interval: 'one-time',
    amount_cents: 29700,
    currency: 'USD',
    checkout_origin: 'https://forge.bizlegal-ai.com/passport',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },
  forge_wallet_scan: {
    id: 'forge_wallet_scan',
    name: 'Wallet Scan (Forge)',
    description: 'Forensic wallet scan with sanctions screening.',
    product_family: 'forge',
    billing_interval: 'one-time',
    amount_cents: 9700,
    currency: 'USD',
    checkout_origin: 'https://forge.bizlegal-ai.com/scan',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },

  // ───── DocAI ─────
  docai_scan_report: {
    id: 'docai_scan_report',
    name: 'DocAI Contract Risk Report',
    description: 'Evidence-cited contract risk report with all red flags, missing clauses, and fix recommendations.',
    product_family: 'docai',
    billing_interval: 'one-time',
    amount_cents: 9700,
    currency: 'USD',
    checkout_origin: 'https://docai.bizlegal-ai.com',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },
  docai_team_monthly: {
    id: 'docai_team_monthly',
    name: 'DocAI Team (monthly)',
    description: '50 SQA drafts/mo + DPA Negotiator + 5 seats.',
    product_family: 'docai',
    billing_interval: 'monthly',
    amount_cents: 6900,
    currency: 'USD',
    checkout_origin: 'https://docai.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  docai_firm_monthly: {
    id: 'docai_firm_monthly',
    name: 'DocAI Firm (monthly)',
    description: 'Team + Firm-tier KB upload + dedicated reviewer.',
    product_family: 'docai',
    billing_interval: 'monthly',
    amount_cents: 19900,
    currency: 'USD',
    checkout_origin: 'https://docai.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },

  // ───── LexAudit ─────
  lexaudit_monitor_monthly: {
    id: 'lexaudit_monitor_monthly',
    name: 'LexAudit Compliance Monitor (monthly)',
    description: 'Daily Sonnet semantic-diff on tracked compliance frameworks.',
    product_family: 'lexaudit',
    billing_interval: 'monthly',
    amount_cents: 9900,
    currency: 'USD',
    checkout_origin: '/compliance-monitor',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  lexaudit_boutique_monthly: {
    id: 'lexaudit_boutique_monthly',
    name: 'LexAudit Boutique (monthly)',
    description: 'Compliance monitor + cert renewal + boutique support.',
    product_family: 'lexaudit',
    billing_interval: 'monthly',
    amount_cents: 19900,
    currency: 'USD',
    checkout_origin: 'https://lexaudit.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  lexaudit_midmarket_monthly: {
    id: 'lexaudit_midmarket_monthly',
    name: 'LexAudit Mid-Market (monthly)',
    description: 'Boutique + dedicated CSM + custom framework onboarding.',
    product_family: 'lexaudit',
    billing_interval: 'monthly',
    amount_cents: 59900,
    currency: 'USD',
    checkout_origin: 'https://lexaudit.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },

  // ───── AI Conductor ─────
  conductor_solo_monthly: {
    id: 'conductor_solo_monthly',
    name: 'AI Conductor Solo (monthly)',
    description: '10 scans/mo, 5 AI drafts, all 4 verticals, 1 CLE course.',
    product_family: 'conductor',
    billing_interval: 'monthly',
    amount_cents: 9900,
    currency: 'USD',
    checkout_origin: 'https://docai.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  conductor_solo_yearly: {
    id: 'conductor_solo_yearly',
    name: 'AI Conductor Solo (yearly)',
    description: '10 scans/mo, 5 AI drafts, all 4 verticals, 1 CLE course. Save 2 months.',
    product_family: 'conductor',
    billing_interval: 'yearly',
    amount_cents: 99000,
    currency: 'USD',
    checkout_origin: 'https://docai.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  conductor_team_monthly: {
    id: 'conductor_team_monthly',
    name: 'AI Conductor Team (monthly, per seat)',
    description: '50 scans/seat/mo, 50 drafts, attorney review queue, 3 CLE courses.',
    product_family: 'conductor',
    billing_interval: 'monthly',
    amount_cents: 25000,
    currency: 'USD',
    checkout_origin: 'https://docai.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  conductor_team_yearly: {
    id: 'conductor_team_yearly',
    name: 'AI Conductor Team (yearly, per seat)',
    description: '50 scans/seat/mo, 50 drafts, attorney review queue, 3 CLE courses. Save 2 months.',
    product_family: 'conductor',
    billing_interval: 'yearly',
    amount_cents: 250000,
    currency: 'USD',
    checkout_origin: 'https://docai.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  conductor_firm_monthly: {
    id: 'conductor_firm_monthly',
    name: 'AI Conductor Firm (monthly)',
    description: 'Unlimited scans + drafts, custom KB, API access, unlimited CLE, attorney review.',
    product_family: 'conductor',
    billing_interval: 'monthly',
    amount_cents: 99900,
    currency: 'USD',
    checkout_origin: 'https://docai.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  conductor_firm_yearly: {
    id: 'conductor_firm_yearly',
    name: 'AI Conductor Firm (yearly)',
    description: 'Unlimited everything. Save 2 months.',
    product_family: 'conductor',
    billing_interval: 'yearly',
    amount_cents: 999000,
    currency: 'USD',
    checkout_origin: 'https://docai.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },

  // ───── CLE ─────
  cle_standalone_monthly: {
    id: 'cle_standalone_monthly',
    name: 'CLE Subscription (monthly)',
    description: 'Access to all CLE courses + certificates. No AI Conductor features.',
    product_family: 'cle',
    billing_interval: 'monthly',
    amount_cents: 9900,
    currency: 'USD',
    checkout_origin: 'https://docai.bizlegal-ai.com/cle',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  // ───── AIA: Compliance Ops Retainer (managed service) ─────
  // The flagship AIA offer. 8 clients × this = $20K MRR.
  // Setup fee is a separate one-time (handled via the custom-build deal room).
  compliance_ops_retainer: {
    id: 'compliance_ops_retainer',
    name: 'Compliance Ops Retainer (monthly)',
    description: '8-agent managed compliance ops: 24/7 monitoring, regulatory update scan, risk flag, draft response, daily Telegram digest, monthly 1-page status PDF. $5K-$15K one-time setup. First 2 weeks free. Month-to-month after that.',
    product_family: 'conductor',
    billing_interval: 'monthly',
    amount_cents: 250000,  // $2,500/mo
    currency: 'USD',
    checkout_origin: '/services/compliance-ops',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },

  // ───── Trio (scaffold 2026-07-28 — surfaces not yet deployed; checkout
  // stays dark until Z7-style verification per hard rule #5) ─────
  propsignal_report_49: {
    id: 'propsignal_report_49',
    name: 'PropSignal Property Risk Report',
    description: 'Public-data property risk report: flood zone, environmental screening, open-data signals, deterministic risk score. Informational only — not an inspection, title opinion, or legal advice.',
    product_family: 'propsignal',
    billing_interval: 'one-time',
    amount_cents: 4900,
    currency: 'USD',
    checkout_origin: 'https://propsignal.bizlegal-ai.com',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },
  leaseparse_abstract_59: {
    id: 'leaseparse_abstract_59',
    name: 'LeaseParse Commercial Lease Abstract',
    description: 'AI-extracted lease abstract: critical dates, financial terms, risk-flag clauses. Document analysis tool — does not render legal advice.',
    product_family: 'leaseparse',
    billing_interval: 'one-time',
    amount_cents: 5900,
    currency: 'USD',
    checkout_origin: 'https://leaseparse.bizlegal-ai.com',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },
  closeflow_transaction_39: {
    id: 'closeflow_transaction_39',
    name: 'CloseFlow Closing Checklist',
    description: 'Jurisdiction-aware closing checklist + deadline tracker + automated reminders for one real-estate transaction. Project-management software — not escrow, title, or legal services.',
    product_family: 'closeflow',
    billing_interval: 'one-time',
    amount_cents: 3900,
    currency: 'USD',
    checkout_origin: 'https://closeflow.bizlegal-ai.com',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },

  // ───── Learn (Nifty Haven) ─────
  // Registered but NOT yet sellable. /learn has no account system and no
  // gated-lesson delivery, so a paid subscriber could not be given access.
  // /learn captures double-opt-in email only. Wire a buy button here after
  // delivery exists — not before.
  academy_realestate_annual: {
    id: 'academy_realestate_annual',
    name: 'Learn — Real Estate Track (annual)',
    description: 'Full real-estate track: reading purchase agreements, disclosure obligations, closing mechanics, and cross-border purchase by non-residents. Written by a practising real-estate lawyer. Educational material only — not legal advice, and it carries no CLE, CPE, or other professional credit.',
    product_family: 'academy',
    billing_interval: 'yearly',
    amount_cents: 24000,
    currency: 'USD',
    checkout_origin: '/learn/real-estate',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  academy_founders_annual: {
    id: 'academy_founders_annual',
    name: 'Learn — Founders Track (annual)',
    description: 'Full founder legal-and-compliance literacy track: the obligations that attach at incorporation, reading a contract someone sends you, when counsel is actually required, and personal-data duties. Educational material only — not legal advice, and it carries no CLE, CPE, or other professional credit.',
    product_family: 'academy',
    billing_interval: 'yearly',
    amount_cents: 18000,
    currency: 'USD',
    checkout_origin: '/learn/founders',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },

  // ───── Bench — the evaluation lab for legal AI (2026-08-16 scaffold) ─────
  // Checkout stays dark (bench /api/checkout/start returns 503) until a
  // Moses-verified test purchase, per hard rule #5. Registered now so lighting
  // it is a one-line change. Dedicated tier ($12,500+/mo) is deal-room scoped
  // like compliance_ops_retainer's setup fee — no product ID until priced.
  // Canonical doc: decisions/BENCH-LEGAL-AI-QUALITY-2026-08-16.md
  bench_audit_2500: {
    id: 'bench_audit_2500',
    name: 'Bench Diagnostic Audit',
    description:
      '25-30 expert-verified evaluations of your legal AI against one jurisdiction-specific benchmark: accuracy score, hallucination rate, critical-error rate, citation reliability, error taxonomy, gold-standard corrections, remediation memo. Measurement services only — not legal advice.',
    product_family: 'bench',
    billing_interval: 'one-time',
    amount_cents: 250000,
    currency: 'USD',
    checkout_origin: 'https://bench.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },
  bench_managed_monthly: {
    id: 'bench_managed_monthly',
    name: 'Bench Managed Evaluation Program (monthly)',
    description:
      '100-150 evaluations/month with continuous accuracy tracking, monthly trend report, and remediation guidance. AI-prescored with expert verification sampling. Measurement services only — not legal advice.',
    product_family: 'bench',
    billing_interval: 'monthly',
    amount_cents: 500000,
    currency: 'USD',
    checkout_origin: 'https://bench.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },

  // ───── Stablecoin Reserve Report Generator (W2-5) ─────
  // Fulfilled by the self-contained /api/reserve-report/webhook (TRACR-style:
  // own webhook + own reserve_reports table), NOT the shared payments webhook,
  // because fulfillment needs the stored reserve payload, not just an order row.
  stablecoin_reserve_monthly: {
    id: 'stablecoin_reserve_monthly',
    name: 'Stablecoin Reserve Report Generator (monthly)',
    description: 'Templated monthly reserve report against GENIUS Act + MiCA reserve rules, generated from issuer-supplied reserve composition. Template generated from your data — not an audit. Human review before use.',
    product_family: 'reserve_report',
    billing_interval: 'monthly',
    amount_cents: 19900,
    currency: 'USD',
    checkout_origin: '/reserve-report',
    webhook_path: '/api/reserve-report/webhook',
    cancellable: true,
  },

  // ───── CoGuard — Co-Parenting Communication & Legal Evidentiary Engine ─────
  // Checkout dark until Z7-style verification per hard rule #5.
  // Canonical doc: decisions/COGUARD_PRODUCT_PLAN.md
  coguard_solo_monthly: {
    id: 'coguard_solo_monthly',
    name: 'CoGuard Solo Shield (monthly)',
    description: 'AI-powered BIFF message neutralization + immutable SHA-256 communication log + court binder on demand. Up to 100 messages/month. Communication drafting tool — not legal advice.',
    product_family: 'coguard',
    billing_interval: 'monthly',
    amount_cents: 1499,
    currency: 'USD',
    checkout_origin: 'https://coguard.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  coguard_solo_yearly: {
    id: 'coguard_solo_yearly',
    name: 'CoGuard Solo Shield (yearly)',
    description: 'Solo Shield at yearly rate. Save ~$50 vs monthly.',
    product_family: 'coguard',
    billing_interval: 'yearly',
    amount_cents: 12900,
    currency: 'USD',
    checkout_origin: 'https://coguard.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  coguard_litigation_monthly: {
    id: 'coguard_litigation_monthly',
    name: 'CoGuard Litigation (monthly)',
    description: 'Unlimited messages + advanced court binder + attorney portal + priority processing. Designed for active custody litigation. Communication drafting tool — not legal advice.',
    product_family: 'coguard',
    billing_interval: 'monthly',
    amount_cents: 2999,
    currency: 'USD',
    checkout_origin: 'https://coguard.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  coguard_litigation_yearly: {
    id: 'coguard_litigation_yearly',
    name: 'CoGuard Litigation (yearly)',
    description: 'Litigation plan at yearly rate. Save ~$110 vs monthly.',
    product_family: 'coguard',
    billing_interval: 'yearly',
    amount_cents: 24900,
    currency: 'USD',
    checkout_origin: 'https://coguard.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  // ───── OFAC Sanctions List Watcher (W2-6) ─────
  // $29/mo recurring watcher. Subscriber registers watched addresses/entities;
  // the daily cron diffs sanctions_cache and emails on new matches. Fulfilled
  // by the shared payments webhook (no per-product fulfillment table needed —
  // the watch subscription is the access grant).
  ofac_watch_monthly: {
    id: 'ofac_watch_monthly',
    name: 'OFAC Sanctions List Watcher (monthly)',
    description: 'Daily diff of the OFAC SDN / UN / EU sanctions lists against your watched addresses and entities, with email alerts on new matches. Alerts are possible matches — verify independently before acting.',
    product_family: 'ofac_watch',
    billing_interval: 'monthly',
    amount_cents: 2900,
    currency: 'USD',
    checkout_origin: '/tools/ofac-watcher',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  // ───── CASP Compliance Bundle (W4-12) ─────
  // The monopoly wedge, packaged: MiCA CASP gets screening + deadline
  // tracking + stablecoin classification + reserve reports + obligation
  // extraction + OFAC watch in one $499/mo bundle. payment.confirmed grants
  // an active row in casp_bundle_subs (grantCaspBundle). The bundle is a
  // compliance toolkit + intelligence, not a legal opinion / not regulatory
  // approval — per-tool disclaimers inherited.
  casp_bundle_monthly: {
    id: 'casp_bundle_monthly',
    name: 'CASP Compliance Bundle (monthly)',
    description: 'MiCA CASP compliance toolkit: sanctions & wallet screening, MiCA deadline tracking, stablecoin classification, reserve reports, obligation extraction, and OFAC list watch — one $499/mo bundle. Compliance toolkit + intelligence, not a legal opinion or regulatory approval.',
    product_family: 'casp',
    billing_interval: 'monthly',
    amount_cents: 49900,
    currency: 'USD',
    checkout_origin: '/agents/casp-bundle',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  // ───── AI Policy Generator (W3-8) ─────
  // $99 one-time wizard → firm AI usage policy with ABA citations. The
  // generated policy is a TEMPLATE — attorney must review before adoption.
  // payment.confirmed flips the matching ai_policy_drafts row to 'paid' and
  // emails the policy (grantAiPolicy).
  ai_policy_generator: {
    id: 'ai_policy_generator',
    name: 'AI Policy Generator',
    description: 'Firm-wide AI usage policy drafted from your firm size, practice areas, and AI tools — with citations to ABA Formal Opinion 512 and the Model Rules. Template — attorney must review before adoption.',
    product_family: 'ai_policy',
    billing_interval: 'one-time',
    amount_cents: 9900,
    currency: 'USD',
    checkout_origin: '/tools/ai-policy-generator',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },
  // ───── AI Practice Review + AI Teammate Kit (O-018, 2026-09-06) ─────
  // Two written, async products from decisions/workflows/ai_practice_review.md.
  // payment.confirmed → lib/payments/practice-grant.ts emails the buyer the
  // five questions (review) or the gated kit link (kit) and pings Moses on
  // Telegram. The memo itself is written by Moses — nothing is auto-generated
  // as advice. Priced to the FirmCited Session rung ($200) and the kit at $49.
  // 2026-09-07 — Practice Revenue Report: free totals on /practice-revenue,
  // $99 unlocks the full report. Fulfilled by lib/payments/practice-revenue-
  // grant.ts, which reads the report ref from payment_orders.source.
  practice_revenue_report: {
    id: 'practice_revenue_report',
    name: 'Practice Revenue Report (full)',
    description: 'Unlocks the full Practice Revenue Report for one upload: every overdue invoice and unbilled entry with drafts, client ranking, closed-matter rows, timing counterfactuals. Arithmetic on your own billing export; not a financial statement; not legal, tax or accounting advice. Delivered by email within minutes.',
    product_family: 'practice',
    billing_interval: 'one-time',
    amount_cents: 9900,
    currency: 'USD',
    checkout_origin: '/practice-revenue',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },
  ai_practice_review: {
    id: 'ai_practice_review',
    name: 'AI Practice Review (written memo)',
    description: 'Five questions by email, one written memo back: your intended AI-agent setup checked against the published checklist of a practising attorney. Not legal advice; not a review of any client matter. Delivered by email within five working days of your answers.',
    product_family: 'practice',
    billing_interval: 'one-time',
    amount_cents: 20000,
    currency: 'USD',
    checkout_origin: '/ai-practice-review',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },
  ai_teammate_kit: {
    id: 'ai_teammate_kit',
    name: 'AI Teammate Kit for Law Practices',
    description: 'Eight-part written kit: pre-flight confidentiality checklist, engagement-letter and client-consent clauses, agent role card, three draft-only recipes, activity-log template, ten vendor questions, five never-automate rules, 30-day rollout. For licensed practitioners; adapt with counsel.',
    product_family: 'practice',
    billing_interval: 'one-time',
    amount_cents: 4900,
    currency: 'USD',
    checkout_origin: '/ai-practice-review',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },
  // ───── DEAL44 — multi-party transaction rooms (2026-09-07) ─────
  // LIVE. The USD pair takes both card and crypto; the ILS pair takes crypto,
  // because PayPal cannot receive shekels (see the `currency` docblock above) —
  // a shekel card payment is invoiced instead and recorded as a manual order.
  //
  // `deal44_room_setup_usd` is the FX twin of the ₪2,500 room (see
  // DEAL44_ROOM_SETUP_USD_CENTS above for the rate and the date it was taken).
  // `deal44_broker_monthly_usd` is still a first-pass figure and says so in its
  // own description — no broker subscription has been sold outside Israel, and
  // nothing in the B3 checkout offers it.
  // Canonical doc: decisions/DEAL44-WORKFLOW44-2026-09-07.md
  deal44_room_setup_ils: {
    id: 'deal44_room_setup_ils',
    name: 'DEAL44 deal room — setup and run (Israel)',
    description: 'One property transaction: a shared checklist for every party, dated against the signing and delivery dates, with reminders before each deadline. Set up and kept current for the life of the transaction. Software that organises the checklist — not legal services, not legal advice, and not a substitute for the parties own lawyers.',
    product_family: 'deal44',
    billing_interval: 'one-time',
    amount_cents: DEAL44_ROOM_SETUP_ILS_AGOROT,
    currency: 'ILS',
    checkout_origin: '/start',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },
  deal44_broker_monthly_ils: {
    id: 'deal44_broker_monthly_ils',
    name: 'DEAL44 for brokers (monthly, Israel)',
    description: 'Open your own deal rooms for every transaction you run: shared checklists, per-party links, deadline reminders. Software that organises the checklist — not legal services and not legal advice.',
    product_family: 'deal44',
    billing_interval: 'monthly',
    amount_cents: 34900,
    currency: 'ILS',
    checkout_origin: '/start',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  deal44_room_setup_usd: {
    id: 'deal44_room_setup_usd',
    name: 'DEAL44 deal room — setup and run',
    description: 'One property transaction: a shared checklist for every party, dated against the signing and closing dates, with reminders before each deadline. Set up and kept current for the life of the transaction. Software that organises the checklist — not legal services, not legal advice, and not a substitute for the parties own lawyers. Priced as the dollar equivalent of the ₪2,500 room.',
    product_family: 'deal44',
    billing_interval: 'one-time',
    amount_cents: DEAL44_ROOM_SETUP_USD_CENTS,
    currency: 'USD',
    checkout_origin: '/start',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },
  deal44_broker_monthly_usd: {
    id: 'deal44_broker_monthly_usd',
    name: 'DEAL44 for brokers (monthly)',
    description: 'Open your own deal rooms for every transaction you run: shared checklists, per-party links, deadline reminders. Software that organises the checklist — not legal services and not legal advice. PLACEHOLDER PRICE pending the founder decision.',
    product_family: 'deal44',
    billing_interval: 'monthly',
    amount_cents: 9900,
    currency: 'USD',
    checkout_origin: '/start',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },

  // ───── O-025 CasePage (2026-09-15) ─────
  cp_solo_49: {
    id: 'cp_solo_49',
    name: 'CasePage Solo',
    description: 'Up to 10 live matter-status pages, standard themes, milestone widget. For decision-support only; not legal advice.',
    product_family: 'casepage',
    billing_interval: 'monthly',
    amount_cents: 4900,
    currency: 'USD',
    checkout_origin: '/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  cp_firm_149: {
    id: 'cp_firm_149',
    name: 'CasePage Firm',
    description: 'Unlimited pages, white-label domain, AI summaries with human approval gate, audio narration. For decision-support only; not legal advice.',
    product_family: 'casepage',
    billing_interval: 'monthly',
    amount_cents: 14900,
    currency: 'USD',
    checkout_origin: '/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  cp_setup_490: {
    id: 'cp_setup_490',
    name: 'CasePage Setup',
    description: 'Template pack + branding + widget install by BizLegal. Human setup service; no outcome guarantees.',
    product_family: 'casepage',
    billing_interval: 'one-time',
    amount_cents: 49000,
    currency: 'USD',
    checkout_origin: '/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },
  // ───── O-026 SinceFiled (2026-09-15) ─────
  sf_firm_49: {
    id: 'sf_firm_49',
    name: 'SinceFiled Firm',
    description: 'Unlimited obligations, team seats, email log links, predictions. Prediction is an estimate — verify against jurisdiction rules.',
    product_family: 'sincefiled',
    billing_interval: 'monthly',
    amount_cents: 4900,
    currency: 'USD',
    checkout_origin: '/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  sf_lifetime_329: {
    id: 'sf_lifetime_329',
    name: 'SinceFiled Lifetime',
    description: 'SinceFiled Firm plan, lifetime access. Prediction is an estimate — verify against jurisdiction rules.',
    product_family: 'sincefiled',
    billing_interval: 'one-time',
    amount_cents: 32900,
    currency: 'USD',
    checkout_origin: '/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },
  sf_pack_us_19: {
    id: 'sf_pack_us_19',
    name: 'US Compliance Rhythm Pack',
    description: '19-page PDF: trust-recon tracker, renewal calendar, CLE deadline sheet. Reviewer-gated; not legal advice.',
    product_family: 'sincefiled',
    billing_interval: 'one-time',
    amount_cents: 1900,
    currency: 'USD',
    checkout_origin: '/packs',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },
  sf_pack_both_29: {
    id: 'sf_pack_both_29',
    name: 'US + Dubai Compliance Rhythm Pack',
    description: 'Combined US + Dubai packs (32 pages). Reviewer-gated; not legal advice.',
    product_family: 'sincefiled',
    billing_interval: 'one-time',
    amount_cents: 2900,
    currency: 'USD',
    checkout_origin: '/packs',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: false,
  },
  // ───── BrainX — Opportunity Intelligence (2026-09-16, productized) ─────
  // brainx.bizlegal-ai.com. Neon Postgres (not Supabase). A weekly,
  // operator-run radar — not a 24/7 pipeline; see apps/brainx/CLAUDE.md.
  // Card billing is a real PayPal subscription via the hub's
  // /api/payments/paypal/start (PAYPAL_PLAN_ID_BRAINX_<TIER>_<INTERVAL>);
  // crypto is yearly-only via /api/pay/start. Fulfillment: hub webhook →
  // HMAC POST to BrainX /api/fulfillment → apps/hub/lib/payments/brainx-grant.ts.
  brainx_opportunity_radar_monthly: {
    id: 'brainx_opportunity_radar_monthly',
    name: 'BrainX Radar (monthly)',
    description: 'Weekly evidence-first opportunity radar across three verticals (real estate, legal & compliance, AI & fintech regulation). Every opportunity carries ≥3 verified public sources and a BrainX Decision Score v1. Up to 5 radar profiles. 2 BUILD THIS briefs/month. Not legal advice; no outcome guarantee.',
    product_family: 'brainx',
    billing_interval: 'monthly',
    amount_cents: 9900,
    currency: 'USD',
    checkout_origin: 'https://brainx.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  brainx_opportunity_radar_yearly: {
    id: 'brainx_opportunity_radar_yearly',
    name: 'BrainX Radar (yearly)',
    description: 'Yearly BrainX Radar subscription (save 2 months). Weekly evidence-first opportunity radar, ≥3 verified sources per opportunity, BrainX Decision Score v1, up to 5 radar profiles, 2 BUILD THIS briefs/month.',
    product_family: 'brainx',
    billing_interval: 'yearly',
    amount_cents: 99900,
    currency: 'USD',
    checkout_origin: 'https://brainx.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  brainx_radar_build_monthly: {
    id: 'brainx_radar_build_monthly',
    name: 'BrainX Radar + Build (monthly)',
    description: 'Everything in BrainX Radar, plus unlimited BUILD THIS briefs and a written, async expert review of each brief by Moses Dor, Adv. (capped at 4/month, within 5 business days — no calls). Not legal advice; no outcome guarantee.',
    product_family: 'brainx',
    billing_interval: 'monthly',
    amount_cents: 24900,
    currency: 'USD',
    checkout_origin: 'https://brainx.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
  brainx_radar_build_yearly: {
    id: 'brainx_radar_build_yearly',
    name: 'BrainX Radar + Build (yearly)',
    description: 'Yearly BrainX Radar + Build subscription (save 2 months). Unlimited BUILD THIS briefs, written async expert review of each brief by Moses Dor, Adv. (capped at 4/month).',
    product_family: 'brainx',
    billing_interval: 'yearly',
    amount_cents: 249900,
    currency: 'USD',
    checkout_origin: 'https://brainx.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/nowpayments/webhook',
    cancellable: true,
  },
}
export function getProduct(id: ProductId): ProductSpec {
  const product = PRODUCTS[id]
  if (!product) throw new Error(`Unknown product_id: ${id}`)

  // Phase AA D10: pricing-experiment override layer. If an active
  // experiment matches this product, swap amount_cents with the
  // experimental price. Everything else (name, description, billing
  // interval) stays the same. The pricing-experiments module imports
  // ProductId from this file as a type-only import, so there's no
  // runtime cycle.
  const exp = activeExperimentFor(id)
  if (exp) {
    return { ...product, amount_cents: exp.experiment_amount_cents }
  }
  return product
}




