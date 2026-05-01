/**
 * PSP & MoR Risk Manager — public-source corpus only.
 *
 * Two modes:
 *   - prevention: pre-application audit. Match a business description against
 *     processor AUP clauses + restricted-business categories from public ToS.
 *   - recovery: post-freeze remediation. Pattern an account-freeze email or
 *     reason code against published appeal pathways and regulator-complaint
 *     routes.
 *
 * REVENUE+LIABILITY framing: this is decision-support, not legal advice.
 * Output never guarantees a Stripe approval, PayPal account reinstatement,
 * or successful regulator complaint. Customers must engage their own counsel
 * for binding determinations.
 *
 * No private rejection emails or customer-specific data live here. The
 * corpus is built from publicly-available AUP texts + public regulator
 * complaint pathways.
 */

export interface AupItem {
  id: string
  source_name: string
  source_url: string
  processor: "stripe" | "paypal" | "square" | "mercury" | "wise" | "revolut" | "all"
  category:
    | "restricted-business"
    | "high-risk-merchant"
    | "documentation"
    | "kyc-aml"
    | "appeal-pathway"
    | "regulator-complaint"
    | "alternative-processor"
  topics: string[]
  text: string
  last_updated: string
}

const NOW_ISO = new Date().toISOString()

export const AUP_CORPUS: AupItem[] = [
  // ─── Stripe public AUP ────────────────────────────────────────────────
  {
    id: "stripe-restricted-businesses",
    source_name: "Stripe Restricted Businesses",
    source_url: "https://stripe.com/legal/restricted-businesses",
    processor: "stripe",
    category: "restricted-business",
    topics: ["high-risk", "stripe", "prohibited", "regulated-services"],
    text: "Stripe's Restricted Businesses list includes (non-exhaustive): adult content/services, age-restricted goods, gambling, debt-collection, get-rich-quick schemes, multi-level marketing, credit-repair services, currency exchange, money-transmitter activities without licence, drug paraphernalia, file-sharing services, financial products that require licensing, government IDs, occult materials, pseudo-pharma, unauthorised subscription/recurring services, and any service that bears 'an unacceptable level of risk to Stripe' as determined by Stripe.",
    last_updated: NOW_ISO,
  },
  {
    id: "stripe-high-risk-merchants",
    source_name: "Stripe High-Risk Merchant Categories",
    source_url: "https://stripe.com/docs/treasury/marketplace/high-risk",
    processor: "stripe",
    category: "high-risk-merchant",
    topics: ["high-risk", "stripe", "underwriting", "deposits"],
    text: "Stripe categorises merchants as high-risk based on factors including: industry classification (e.g., crypto, supplements, CBD, gambling, certain financial services), chargeback rate above 1%, dispute rate, average transaction size, refund rate, and processing volume volatility. High-risk classification triggers additional KYC, longer payout holds, and may result in account closure with 24-72h notice.",
    last_updated: NOW_ISO,
  },
  {
    id: "stripe-appeal-pathway",
    source_name: "Stripe Appeals — How to Reopen a Closed Account",
    source_url: "https://support.stripe.com/topics/restricted-and-prohibited-businesses",
    processor: "stripe",
    category: "appeal-pathway",
    topics: ["appeal", "stripe", "reinstatement", "documentation"],
    text: "If Stripe closes your account, you may submit a written appeal via support.stripe.com/contact. Provide: (1) detailed business description with website URL; (2) sample products/services; (3) chargeback history with mitigation plan if relevant; (4) corporate registration documents; (5) bank statements; (6) clarification of any flagged transactions. Reviews typically take 5-10 business days. Stripe is not obligated to reinstate any closed account.",
    last_updated: NOW_ISO,
  },

  // ─── PayPal public AUP ───────────────────────────────────────────────
  {
    id: "paypal-aup",
    source_name: "PayPal Acceptable Use Policy",
    source_url: "https://www.paypal.com/us/legalhub/acceptableuse-full",
    processor: "paypal",
    category: "restricted-business",
    topics: ["paypal", "prohibited", "restricted", "buyer-protection"],
    text: "PayPal's AUP prohibits transactions involving: narcotics, steroids/controlled substances, items that infringe intellectual-property rights, ammunition/firearms/explosives, items promoting hatred/violence/intolerance, certain sexually-oriented materials, gambling/wagering services not licensed, payment-aggregation, credit/debt-settlement services, mortgage/escrow services, prescription medication without licence, get-rich-quick schemes, items that disclose personal information in violation of laws, multi-level-marketing programs, and 'transactions that show the characteristics of money laundering'. PayPal reserves right to limit accounts at its sole discretion.",
    last_updated: NOW_ISO,
  },
  {
    id: "paypal-180day-hold",
    source_name: "PayPal 180-day rolling reserve / hold policy",
    source_url: "https://www.paypal.com/us/cshelp/article/why-is-my-paypal-account-on-hold-help135",
    processor: "paypal",
    category: "documentation",
    topics: ["paypal", "hold", "rolling-reserve", "buyer-protection"],
    text: "PayPal may place a 21-day, 90-day, or 180-day hold on funds when: account is new (under 90 days); selling category is high-risk; chargeback or dispute filed; selling pattern changes significantly; transaction value is unusually large; recipient has insufficient transaction history. Funds become available after the hold period if no disputes are filed, or earlier upon delivery confirmation. Customer-protection-claim window is up to 180 days after transaction.",
    last_updated: NOW_ISO,
  },
  {
    id: "paypal-appeal-pathway",
    source_name: "PayPal Account Restrictions — Appeal Pathway",
    source_url: "https://www.paypal.com/us/cshelp/article/how-do-i-resolve-account-limitations-help301",
    processor: "paypal",
    category: "appeal-pathway",
    topics: ["paypal", "appeal", "limitation", "documentation"],
    text: "When PayPal limits an account, the path to resolution typically requires: (1) verifying identity (government-ID upload); (2) supplying business documents (registration, EIN/VAT, bank statements); (3) providing tracking/proof-of-delivery for recent disputed transactions; (4) explaining business model in plain language; (5) responding to any specific document request within the deadline shown in the resolution centre. Permanent limitations are subject to a 180-day fund-release window.",
    last_updated: NOW_ISO,
  },

  // ─── Square / Block public AUP ───────────────────────────────────────
  {
    id: "square-prohibited-services",
    source_name: "Square Prohibited Goods, Services & Activities",
    source_url: "https://squareup.com/us/en/legal/general/ua",
    processor: "square",
    category: "restricted-business",
    topics: ["square", "prohibited", "restricted"],
    text: "Square prohibits: any business in violation of law; pseudo-pharmaceuticals; unsolicited/get-rich-quick schemes; firearms/ammunition (limited categories allowed in some jurisdictions); illegal drugs/paraphernalia; counterfeit goods; bail bonds; collection-agency services; cryptocurrency-related businesses outside Square's specific crypto offering; certain telemedicine; chain-letters/multi-level-marketing; adult-entertainment businesses; gambling/wagering not authorised; stored-value sales (gift cards) above thresholds. Square may close any account at its discretion with notice.",
    last_updated: NOW_ISO,
  },

  // ─── Mercury (Choice Bank) ───────────────────────────────────────────
  {
    id: "mercury-restricted",
    source_name: "Mercury Restricted Industries",
    source_url: "https://help.mercury.com/hc/en-us/articles/360044319814",
    processor: "mercury",
    category: "restricted-business",
    topics: ["mercury", "fintech", "restricted", "underwriting"],
    text: "Mercury (operated through Choice Financial Group / Evolve Bank & Trust) restricts: businesses based in OFAC-sanctioned countries; businesses owned by SDN-listed individuals; cannabis/hemp; firearms/ammunition; gambling; adult content; money-transmitter without licence; cryptocurrency exchange or custody (own-treasury OK with verification); shell companies without operating business; certain political/religious organisations. Account opening requires US business registration + EIN; non-US founders allowed if entity is US-formed.",
    last_updated: NOW_ISO,
  },

  // ─── Wise / Revolut Business ─────────────────────────────────────────
  {
    id: "wise-restricted",
    source_name: "Wise Business — Acceptable Use Policy",
    source_url: "https://wise.com/help/articles/2932591/acceptable-use-policy",
    processor: "wise",
    category: "restricted-business",
    topics: ["wise", "transferwise", "restricted", "money-transmitter"],
    text: "Wise prohibits: cryptocurrency businesses (exchange, custody, mining-as-a-service); cannabis/hemp products; gambling; payment-services-without-licence; shell companies; sanctioned-country business; adult-content production; payday lending; remittance/money-transmitter services; trust accounts holding third-party funds (with limited exceptions). Wise may freeze funds during compliance review and is regulated by the FCA in UK / FinCEN in US.",
    last_updated: NOW_ISO,
  },
  {
    id: "revolut-business-restricted",
    source_name: "Revolut Business — Restricted Activities",
    source_url: "https://www.revolut.com/business/business-terms/",
    processor: "revolut",
    category: "restricted-business",
    topics: ["revolut", "fca", "restricted", "high-risk"],
    text: "Revolut Business restricts: cryptocurrency businesses (some categories allowed under separate review); gambling-without-licence; adult content; firearms; cannabis/hemp; tobacco/vape direct-to-consumer in some EU markets; money-services without licence; shell companies; embargo-country business; charities without specific approval. Account holders are subject to ongoing transaction-monitoring and may be required to provide additional KYC at any time.",
    last_updated: NOW_ISO,
  },

  // ─── Generic AML / KYC patterns ──────────────────────────────────────
  {
    id: "kyc-aml-baseline",
    source_name: "FATF Recommendations — Customer Due Diligence",
    source_url: "https://www.fatf-gafi.org/en/topics/Fatfrecommendations.html",
    processor: "all",
    category: "kyc-aml",
    topics: ["kyc", "aml", "fatf", "customer-due-diligence"],
    text: "All regulated payment processors must conduct customer due diligence: identify and verify identity using reliable independent source documents; identify beneficial owner (≥25% ownership threshold typical); understand purpose and intended nature of business relationship; ongoing monitoring; enhanced due diligence for high-risk customers (PEPs, sanctioned-country links, high transaction volumes). FATF Recommendations 10-12 govern this baseline; processors implement via their own KYC stack.",
    last_updated: NOW_ISO,
  },

  // ─── Regulator complaint pathways (recovery mode) ────────────────────
  {
    id: "cfpb-complaint",
    source_name: "CFPB Consumer Complaint Pathway",
    source_url: "https://www.consumerfinance.gov/complaint/",
    processor: "all",
    category: "regulator-complaint",
    topics: ["cfpb", "us", "appeal", "regulator-complaint"],
    text: "For US-based payment processors that have frozen funds or limited an account in a manner the customer believes is unlawful, the Consumer Financial Protection Bureau accepts complaints at consumerfinance.gov/complaint. CFPB forwards the complaint to the company, which has 15 days to respond. Most companies respond within the deadline. The CFPB does not adjudicate disputes but the public-record nature of complaints often produces faster resolution.",
    last_updated: NOW_ISO,
  },
  {
    id: "fca-complaint-uk",
    source_name: "FCA Complaints — UK Payment Services",
    source_url: "https://www.fca.org.uk/consumers/how-complain",
    processor: "all",
    category: "regulator-complaint",
    topics: ["fca", "uk", "appeal", "regulator-complaint"],
    text: "For UK-authorised payment institutions and EMIs (Wise, Revolut, etc.), the customer must first complain directly to the firm and allow 8 weeks for response. If unresolved, the customer can escalate to the Financial Ombudsman Service (financial-ombudsman.org.uk) which can require firms to pay up to £415,000 in compensation. The FCA itself does not handle individual complaints but tracks complaint patterns for supervisory action.",
    last_updated: NOW_ISO,
  },
  {
    id: "eba-complaint-eu",
    source_name: "European Banking Authority — Complaint Routing",
    source_url: "https://www.eba.europa.eu/consumer-corner",
    processor: "all",
    category: "regulator-complaint",
    topics: ["eba", "eu", "appeal", "regulator-complaint", "out-of-court-redress"],
    text: "For EU-authorised payment institutions, complaints first go to the firm, then to the national-competent-authority (e.g., BaFin in Germany, AMF in France, AFM in Netherlands). Out-of-court redress mechanisms exist in every Member State per PSD2 Article 102. The EBA maintains a list of NCAs and ADR bodies. Cross-border consumer disputes can also use the FIN-NET network.",
    last_updated: NOW_ISO,
  },

  // ─── Alternative-processor onboarding (recovery mode) ────────────────
  {
    id: "alternative-processors",
    source_name: "Alternative Processors for High-Risk Verticals",
    source_url: "https://www.merchantmaverick.com/best-high-risk-merchant-account-providers/",
    processor: "all",
    category: "alternative-processor",
    topics: ["alternative", "high-risk", "fallback", "recovery"],
    text: "When mainstream processors decline, common alternatives by vertical: (a) crypto-adjacent — NOWPayments, BitPay, Coinbase Commerce; (b) e-commerce high-risk — Authorize.net + dedicated MID, PaymentCloud, SMB Global, Easy Pay Direct; (c) recurring SaaS — Paddle, LemonSqueezy (act as Merchant of Record absorbing AUP risk); (d) international — Adyen (enterprise), Checkout.com (mid-market). Each has its own AUP — re-audit before re-applying.",
    last_updated: NOW_ISO,
  },
  {
    id: "mor-vs-direct-processor",
    source_name: "Merchant of Record (MoR) vs Direct Processor",
    source_url: "https://www.lemonsqueezy.com/learn/what-is-a-merchant-of-record",
    processor: "all",
    category: "alternative-processor",
    topics: ["mor", "lemonsqueezy", "paddle", "compliance-transfer"],
    text: "A Merchant of Record (MoR) — Paddle, LemonSqueezy, FastSpring — sells to your end-customer on your behalf and absorbs: PSP underwriting risk, sales-tax/VAT collection and remittance, chargeback management, AUP compliance, fraud screening. The MoR pays you net of fees + reserves. Trade-off: 5-10% fee vs 2-3% direct processing, but unlocks SaaS founders who cannot pass Stripe/PayPal underwriting. Approval timeline is typically 2-4 weeks with detailed business documentation.",
    last_updated: NOW_ISO,
  },
]

/**
 * Lexical search — score each item by overlapping tokens between query and
 * (text + topics + category). Returns top N hits sorted by score descending.
 */
export function searchAup(
  query: string,
  options: { processor?: AupItem["processor"]; mode: "prevention" | "recovery"; limit?: number },
): AupItem[] {
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2)
  if (tokens.length === 0) return []

  // Mode-specific category bias
  const modeCategories: AupItem["category"][] =
    options.mode === "prevention"
      ? ["restricted-business", "high-risk-merchant", "kyc-aml", "documentation"]
      : ["appeal-pathway", "regulator-complaint", "alternative-processor", "documentation"]

  const limit = options.limit ?? 6
  const ranked = AUP_CORPUS
    .filter((item) => !options.processor || item.processor === options.processor || item.processor === "all")
    .map((item) => {
      const haystack = `${item.text} ${item.topics.join(" ")} ${item.category} ${item.processor}`.toLowerCase()
      let score = 0
      for (const t of tokens) {
        if (haystack.includes(t)) score += 1
      }
      // Mode boost
      if (modeCategories.includes(item.category)) score *= 1.5
      return { item, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.item)

  return ranked
}
