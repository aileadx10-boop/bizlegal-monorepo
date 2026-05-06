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
  // BRAI full report
  | 'brai_full_report'
  // Forge surfaces
  | 'forge_boi_kit'
  | 'forge_passport'
  | 'forge_wallet_scan'
  // DocAI
  | 'docai_team_monthly'
  | 'docai_firm_monthly'
  // LexAudit Compliance Monitor
  | 'lexaudit_monitor_monthly'
  | 'lexaudit_boutique_monthly'
  | 'lexaudit_midmarket_monthly'

export type BillingInterval = 'one-time' | 'monthly' | 'yearly'

export interface ProductSpec {
  readonly id: ProductId
  readonly name: string
  readonly description: string
  readonly product_family: 'boi' | 'ai_act' | 'policy_refresh' | 'psp' | 'tracr' | 'brai' | 'forge' | 'docai' | 'lexaudit'
  readonly billing_interval: BillingInterval
  readonly amount_cents: number
  readonly currency: 'USD'
  /** Hub agent landing where this product is bought (relative path). */
  readonly checkout_origin: string
  /** Webhook callback path on hub — gateway IPN/webhook fires here on payment confirmation. */
  readonly webhook_path: string
  /** True if the gateway supports cancellation (subscriptions only). */
  readonly cancellable: boolean
}

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
    webhook_path: '/api/payments/webhook',
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
    webhook_path: '/api/payments/webhook',
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
    webhook_path: '/api/payments/webhook',
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
    webhook_path: '/api/payments/webhook',
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
    webhook_path: '/api/payments/webhook',
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
    webhook_path: '/api/payments/webhook',
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
    webhook_path: '/api/payments/webhook',
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
    webhook_path: '/api/payments/webhook',
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
    webhook_path: '/api/payments/webhook',
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
    webhook_path: '/api/payments/webhook',
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

  // ───── BRAI ─────
  brai_full_report: {
    id: 'brai_full_report',
    name: 'BRAI Full Blockchain Regulatory Report',
    description: 'Wallet risk preview + comprehensive jurisdictional analysis.',
    product_family: 'brai',
    billing_interval: 'one-time',
    amount_cents: 4900,
    currency: 'USD',
    checkout_origin: 'https://brai.bizlegal-ai.com',
    webhook_path: '/api/brai/webhook',
    cancellable: false,
  },

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
    webhook_path: '/api/payments/webhook',
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
    webhook_path: '/api/payments/webhook',
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
    webhook_path: '/api/payments/webhook',
    cancellable: false,
  },

  // ───── DocAI ─────
  docai_team_monthly: {
    id: 'docai_team_monthly',
    name: 'DocAI Team (monthly)',
    description: '50 SQA drafts/mo + DPA Negotiator + 5 seats.',
    product_family: 'docai',
    billing_interval: 'monthly',
    amount_cents: 6900,
    currency: 'USD',
    checkout_origin: 'https://docai.bizlegal-ai.com/pricing',
    webhook_path: '/api/payments/webhook',
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
    webhook_path: '/api/payments/webhook',
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
    webhook_path: '/api/payments/webhook',
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
    webhook_path: '/api/payments/webhook',
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
    webhook_path: '/api/payments/webhook',
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
