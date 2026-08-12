/**
 * stablecoin-classifier.ts — W2-4 Permitted/Non-Permitted Stablecoin
 * Classifier (GENIUS Act + MiCA).
 *
 * Deterministic decision tree (no API). Routes a token to:
 *   EMT / ART / MiCA Title II  — EU regime (MiCA Title III & IV)
 *   permitted / non-permitted  — US GENIUS Act regime (effective 2027)
 *
 * Every classification carries citations to the governing provision so
 * the output is framed as "classification for discussion", not legal
 * advice (liability shrinker).
 */

export interface StablecoinQuestion {
  id: string
  text: string
  help?: string
}

export interface StablecoinResult {
  type: string
  regime: "GENIUS Act (US)" | "MiCA (EU)" | "Both"
  color: string
  citation: string
  desc: string
}

export const QUESTIONS: StablecoinQuestion[] = [
  {
    id: "q1",
    text: "Is the token's value pegged to a single official currency (e.g. USD, EUR)?",
  },
  {
    id: "q2",
    text: "Does the token reference a basket of currencies or multiple assets/commodities?",
  },
  {
    id: "q3",
    text: "Is the issuer a regulated depository institution (bank) or licensed e-money / credit institution?",
  },
  {
    id: "q4",
    text: "Does the issuer hold eligible reserves at 1:1 backing, with monthly attestation and no rehypothecation?",
  },
  {
    id: "q5",
    text: "Do tokenholders have a right to redeem at par (1:1) within one business day?",
  },
  {
    id: "q6",
    text: "Is the token primarily offered or marketed to US persons (vs. the EU)?",
  },
  {
    id: "q7",
    text: "Is the token algorithmic — value maintained by protocol/arbitrage with no reserve backing?",
  },
]

export type StablecoinAnswers = Record<string, boolean>

/**
 * Deterministic classification. `undefined` answers are treated as
 * "no" so a partial/blank form still returns a hedged result.
 */
export function classifyStablecoin(a: StablecoinAnswers): StablecoinResult {
  const yes = (id: string): boolean => a[id] === true

  // Algorithmic / unbacked — fails both regimes.
  if (yes("q7")) {
    return {
      type: "Non-permitted — unbacked / algorithmic",
      regime: "Both",
      color: "#f87171",
      citation: "GENIUS Act (payment stablecoin definition) · MiCA Art. 3(1)(5)–(6)",
      desc:
        "A token whose value is maintained by protocol or arbitrage with no qualifying reserve backing is not a permitted stablecoin under the GENIUS Act, and does not meet MiCA's EMT/ART definitions (an EMT must reference a single official currency; an ART must reference assets to maintain a stable value). It is likely treated as a MiCA Title II other crypto-asset and faces the GENIUS Act's ban on algorithmic stablecoins without authorization. Classification for discussion — verify with qualified counsel.",
    }
  }

  // US-focused (GENIUS Act primary).
  if (yes("q6")) {
    if (yes("q1") && !yes("q2")) {
      if (yes("q3")) {
        return {
          type: "Permitted stablecoin — depository institution issuer",
          regime: "GENIUS Act (US)",
          color: "#10B981",
          citation: "GENIUS Act — permitted payment-stablecoin issuer",
          desc:
            "Issued by a regulated depository institution. Under the GENIUS Act this is the highest-confidence permitted route for a USD-pegged payment stablecoin. Maintain 1:1 eligible reserves, monthly attestations, no rehypothecation, and par redemption within one business day to stay compliant. If also offered in the EU, confirm EMT authorisation under MiCA Title IV. Classification for discussion — verify with qualified counsel.",
        }
      }
      if (yes("q4") && yes("q5")) {
        return {
          type: "Permitted stablecoin — non-bank, certified issuer",
          regime: "GENIUS Act (US)",
          color: "#e9c349",
          citation: "GENIUS Act — non-bank issuer certification",
          desc:
            "Non-bank issuer with full reserve backing (1:1), monthly attestation, no rehypothecation, and par redemption. The GENIUS Act allows certified non-bank issuers to operate, subject to state or federal certification and reserve requirements. Certification and ongoing disclosure are mandatory. Classification for discussion — verify with qualified counsel.",
        }
      }
      return {
        type: "Non-permitted (US) — missing reserve / redemption requirements",
        regime: "GENIUS Act (US)",
        color: "#f87171",
        citation: "GENIUS Act — reserve, redemption, and attestation requirements",
        desc:
          "A single-currency (USD-pegged) stablecoin issued by an entity that is neither a depository institution nor fully compliant with the reserve, attestation, and par-redemption requirements would not qualify as a permitted stablecoin under the GENIUS Act. Structure the reserve and redemption mechanics before offering to US persons. Classification for discussion — verify with qualified counsel.",
      }
    }
    return {
      type: "Not a payment stablecoin (US) — multi-asset / non-currency pegged",
      regime: "GENIUS Act (US)",
      color: "#b4c5ff",
      citation: "GENIUS Act — 'payment stablecoin' scope",
      desc:
        "The GENIUS Act's permitted-stablecoin regime covers tokens tied to the US dollar or a single fiat currency. A multi-currency basket or asset/commodity-referenced token falls outside the payment-stablecoin definition and is governed instead as a digital-asset or securities matter depending on its facts. Re-route to the MiCA ART analysis for EU exposure. Classification for discussion — verify with qualified counsel.",
    }
  }

  // EU-focused (MiCA primary).
  if (yes("q1") && !yes("q2")) {
    if (yes("q3")) {
      return {
        type: "E-Money Token (EMT)",
        regime: "MiCA (EU)",
        color: "#b4c5ff",
        citation: "MiCA Art. 3(1)(5) (EMT definition) · Title IV",
        desc:
          "References a single official currency and is issued by a credit institution or licensed e-money institution. Under MiCA Title IV this is an EMT: issuer must be an authorised credit/e-money institution, a whitepaper is required, and no advance NCA approval is needed for the token itself. If you are also marketing to US persons, confirm GENIUS Act treatment. Classification for discussion — verify with qualified counsel.",
      }
    }
    return {
      type: "EMT candidate — issuer authorisation required",
      regime: "MiCA (EU)",
      color: "#e9c349",
      citation: "MiCA Art. 3(1)(5) · Art. 48 (EMT offering conditions)",
      desc:
        "The token references a single official currency, so it maps to MiCA's EMT category — but your issuer must obtain credit-institution or e-money-institution authorisation before offering it in the EU. This authorisation is the critical path; the token whitepaper alone is not sufficient. Classification for discussion — verify with qualified counsel.",
    }
  }
  if (yes("q2") && !yes("q1")) {
    return {
      type: "Asset-Referenced Token (ART)",
      regime: "MiCA (EU)",
      color: "#f87171",
      citation: "MiCA Art. 3(1)(6) (ART definition) · Title III · Art. 4(3)",
      desc:
        "References a basket of currencies or multiple assets to maintain a stable value. Under MiCA Title III this is an ART: prior NCA authorisation, reserve-asset requirements, and strict governance apply. This is MiCA's most stringent stablecoin category. Confirm whether the Art. 4(3) utility-token carve-out could apply, and check GENIUS Act treatment for any US offering. Classification for discussion — verify with qualified counsel.",
    }
  }
  return {
    type: "Other Crypto-Asset — MiCA Title II",
    regime: "MiCA (EU)",
    color: "#b4c5ff",
    citation: "MiCA Art. 3(1)(2) · Title II",
    desc:
      "Does not meet the EMT or ART definitions (not single-currency pegged, not multi-asset referenced). It falls under MiCA Title II as an 'other crypto-asset': a whitepaper must be notified to the NCA and published at least 20 working days before any public offering in the EU. No advance NCA approval of the whitepaper is required. Classification for discussion — verify with qualified counsel.",
  }
}
