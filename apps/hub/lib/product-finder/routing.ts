/**
 * Deterministic product-finder routing.
 *
 * Pure function: given the visitor's 3 quiz answers, return exactly one
 * recommendation — either a paid product (`productId`, typed as ProductId so
 * TypeScript rejects any product that isn't in the @bizlegal/payment registry)
 * or a free guide (`guideHref`, resolved from the live GUIDES array so the href
 * always exists). No LLM, no I/O — trivially testable and impossible to point
 * at a product or page that doesn't exist.
 */
import type { ProductId } from '@bizlegal/payment'
import { GUIDES } from '@/lib/guides'

export type CompanyType = 'saas' | 'fintech' | 'crypto' | 'marketplace' | 'other'
export type Need =
  | 'contract_review'
  | 'compliance_proof'
  | 'filing_deadline'
  | 'ongoing_monitoring'
  | 'exploring'
export type CryptoInvolved = 'yes' | 'no'

export interface FinderAnswers {
  readonly company: CompanyType
  readonly need: Need
  readonly crypto: CryptoInvolved
}

export interface Recommendation {
  /** Set for a paid-product recommendation. Mutually exclusive with guideHref. */
  readonly productId?: ProductId
  /** Set for a free-guide recommendation. Mutually exclusive with productId. */
  readonly guideHref?: string
  /** Plain-language reason, fed to the LLM "why this fits" prompt and used as the fallback. */
  readonly rationale: string
}

/** Pick the first guide whose href or tag matches any keyword; fall back to the first guide. */
function guideMatching(keywords: readonly string[]): string {
  const hit = GUIDES.find((g) => {
    const hay = `${g.href} ${g.tag}`.toLowerCase()
    return keywords.some((k) => hay.includes(k))
  })
  return (hit ?? GUIDES[0])?.href ?? '/guides'
}

/**
 * The routing table. Priority order matters: the need drives the primary
 * decision; company + crypto refine it. Every product literal here is checked
 * against ProductId at compile time.
 */
export function recommend(answers: FinderAnswers): Recommendation {
  const { company, need, crypto } = answers

  // 1. A specific document to check → DocAI $97 scan. The Phase 1 primary.
  if (need === 'contract_review') {
    return {
      productId: 'docai_scan_report',
      rationale: 'they have a specific contract, DPA, or ToS they want checked for risk right now',
    }
  }

  // 2. A filing deadline (BOI / CTA) → Forge BOI kit.
  if (need === 'filing_deadline') {
    return {
      productId: 'forge_boi_kit',
      rationale: 'they are facing a beneficial-ownership / entity filing obligation and need it handled',
    }
  }

  // 3. Proof of compliance posture, or ongoing monitoring.
  if (need === 'compliance_proof' || need === 'ongoing_monitoring') {
    if (crypto === 'yes') {
      // Crypto-specific, low-friction one-time report to start.
      // 2026-09-02: was brai_full_report — BRAI is stop-sold (no fulfillment
      // code, fleet finding F4). TRACR has a working native paid loop.
      return {
        productId: 'tracr_bronze',
        rationale: 'they need a blockchain / crypto regulatory posture they can show a counterparty or investor',
      }
    }
    return {
      productId: 'lexaudit_monitor_monthly',
      rationale: 'a customer or investor wants ongoing proof their compliance posture is monitored and current',
    }
  }

  // 4. Just exploring → the most relevant free guide (top of funnel).
  if (crypto === 'yes' || company === 'crypto') {
    return { guideHref: guideMatching(['crypto', 'mica', 'ofac', 'aml']), rationale: 'they are early and exploring crypto/web3 compliance' }
  }
  if (company === 'fintech') {
    return { guideHref: guideMatching(['aml', 'bsa', 'fintech', 'payment']), rationale: 'they are early and exploring fintech/payments compliance' }
  }
  if (company === 'saas' || company === 'marketplace') {
    return { guideHref: guideMatching(['soc2', 'soc-2', 'gdpr', 'saas']), rationale: 'they are early and exploring SaaS compliance basics' }
  }
  return { guideHref: guideMatching(['beneficial-ownership', 'boi']), rationale: 'they are early and want an accessible starting point' }
}
