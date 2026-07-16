/**
 * FAQPage schema helper for /pricing pages.
 *
 * Built 2026-07-10 as part of the $5K-MRR plan, Phase B.6.
 *
 * Renders a FAQPage JSON-LD block with 5 product-specific Q&A pairs.
 * Use inside a Next.js page like:
 *
 *   <script
 *     type="application/ld+json"
 *     dangerouslySetInnerHTML={{
 *       __html: JSON.stringify(buildFaqSchema(productFaqs['tracr']))
 *     }}
 *   />
 *
 * Or use the prebuilt helper:
 *   <FaqSchema product="tracr" />
 */
export type Faq = { question: string; answer: string }

export const productFaqs: Record<string, Faq[]> = {
  tracr: [
    {
      question: "What does Tracr's wallet risk score measure?",
      answer: "Tracr's 0-100 risk score combines 5 signals: (1) sanctions-list match against OFAC, UN, EU, and UK HMT lists; (2) counterparty exposure to known illicit wallets; (3) mixer/tumbler exposure; (4) exchange-risk grade; (5) jurisdiction clustering. The score is deterministic and reproducible.",
    },
    {
      question: "How long does a Tracr scan take?",
      answer: "A Tracr scan completes in 2-5 minutes for the standard 1-year history trace. For the continuous monitoring tier, the score is recalculated every 4 hours as new transactions are observed.",
    },
    {
      question: "Is Tracr a regulatory verdict?",
      answer: "No. Tracr is an intelligence indicator, not a legal verdict or a regulatory finding. The risk score is one input among many that compliance teams should consider. We do not provide legal advice.",
    },
    {
      question: "Can Tracr trace cross-chain transactions?",
      answer: "Yes. Tracr covers Ethereum, Bitcoin, Tron, BNB Chain, Polygon, Arbitrum, Optimism, and Base. Cross-chain bridges are explicitly resolved to identify the receiving wallet on the destination chain.",
    },
    {
      question: "What if my wallet is incorrectly flagged?",
      answer: "If you believe your wallet has been incorrectly flagged, you can submit a re-review request via the Tracr dashboard. Our compliance desk responds within 48 hours with a documented review.",
    },
  ],
  brai: [
    {
      question: "What does BRAI's regulatory posture report cover?",
      answer: "BRAI produces a 20-page report covering the company's regulatory status across 50+ jurisdictions. Each jurisdiction is rated on licensing status, enforcement record, and compliance posture.",
    },
    {
      question: "How often is BRAI data refreshed?",
      answer: "Primary regulator sources (FCA, SEC, OFAC, VARA, MAS, etc.) are checked daily. The BRAI report is regenerated every 7 days and reflects any changes in the 7-day window.",
    },
    {
      question: "Can I download the BRAI report as a PDF?",
      answer: "Yes. The $49/mo Intelligence Report tier includes a downloadable PDF + ongoing access to the live dashboard.",
    },
    {
      question: "Is BRAI a regulatory verdict?",
      answer: "No. BRAI is an intelligence indicator based on primary sources. It is not legal advice and should not be used as a sole input to a compliance decision.",
    },
    {
      question: "How is BRAI different from a manual background check?",
      answer: "BRAI automates the 5-10 hours of manual research that a compliance analyst would do, with 100% source citations and a 7-day refresh. Manual checks become outdated the day after they're done.",
    },
  ],
  lexaudit: [
    {
      question: "What is a Compliance Health Score?",
      answer: "A Compliance Health Score is a 0-100 deterministic rating of your company's compliance posture, calculated from 60 specific signals (policy coverage, training completion, control testing, etc.). It's designed to complement — not replace — a SOC 2 attestation.",
    },
    {
      question: "Is LexAudit the same as SOC 2?",
      answer: "No. SOC 2 is a one-time annual attestation by a licensed CPA firm. LexAudit is continuous, deterministic, and runs 364 days of the year. The two are complementary: LexAudit for the 364 days, SOC 2 for the 1 day of attestation.",
    },
    {
      question: "How long does it take to set up LexAudit?",
      answer: "LexAudit Solo is set up in 30 minutes. LexAudit Team and Firm tiers take 2-4 hours to integrate with your existing compliance tools and policy library.",
    },
    {
      question: "Which frameworks does LexAudit cover?",
      answer: "LexAudit monitors 7 frameworks out of the box: GDPR, SOC 2, ISO 27001, HIPAA, DPDP, AML, and NIST 800-53. Custom frameworks can be added on the Firm tier.",
    },
    {
      question: "Can LexAudit help me pass a SOC 2 audit?",
      answer: "Yes. The LexAudit 60-signal score is the most efficient way to identify and resolve the 5-15 findings that typically delay a SOC 2 audit. Customers report 40% faster SOC 2 audits on average.",
    },
  ],
  docai: [
    {
      question: "What is policy-aware contract review?",
      answer: "Policy-aware contract review means DocAI redlines contracts against YOUR standards (your clause library, your approved deviations, your escalation rules), not generic best-practice defaults. The result is consistent with how your team would have done it.",
    },
    {
      question: "How long does a DocAI redline take?",
      answer: "A 50-page contract redline completes in 2-4 minutes. A 5-page security questionnaire completes in 60-90 seconds. The Firm tier includes batch processing for 50+ documents in parallel.",
    },
    {
      question: "Is DocAI's output audit-ready?",
      answer: "Yes. Every DocAI output includes version-controlled clause references, the prompt history, and the model version used. The output is suitable for use as evidence in a compliance review.",
    },
    {
      question: "What types of contracts does DocAI handle?",
      answer: "DocAI handles MSAs, NDAs, DPAs, security questionnaires (SOC 2, ISO 27001, HIPAA), SOWs, employment agreements, and partnership agreements. Custom contract types can be added on the Firm tier.",
    },
    {
      question: "Is my data used to train DocAI?",
      answer: "No. DocAI does not retain or use customer data for model training. Your contracts and questionnaires are processed ephemerally and not stored beyond the response.",
    },
  ],
  forge: [
    {
      question: "What is the Forge BOI Kit?",
      answer: "The Forge BOI Kit is a one-time $149 package that includes: (1) BOI applicability assessment for your LLC, (2) pre-filled BOI report template, (3) step-by-step filing instructions, (4) post-filing compliance checklist, and (5) 30 days of email support for follow-up questions.",
    },
    {
      question: "Does the BOI Kit cover state-level LLC annual reports?",
      answer: "No. The BOI Kit covers the federal FinCEN Beneficial Ownership Information report. State-level LLC annual reports (Delaware franchise tax, California Statement of Information, etc.) are handled separately and are not included in the $149 tier.",
    },
    {
      question: "Is the Forge BOI Kit legal advice?",
      answer: "No. The BOI Kit is an intelligence indicator based on FinCEN guidance. It is not legal advice. Companies with complex ownership structures should consult a licensed attorney.",
    },
    {
      question: "What if my company has changed ownership since filing?",
      answer: "The FinCEN BOI report must be updated within 30 days of any change in beneficial ownership. The Forge Continuous tier ($99/mo) includes change detection and 24/7 alerts.",
    },
    {
      question: "What are the penalties for not filing BOI?",
      answer: "Penalties for non-compliance include $591/day (per company, civil) and up to $10,000 + 2 years imprisonment (criminal, willful). Late filers can also be subject to enhanced enforcement on subsequent filings.",
    },
  ],
}

export function buildFaqSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  }
}
