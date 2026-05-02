/**
 * BizLegal AI — LegalShield 7-clause disclosure (P1 draft).
 *
 * LIABILITY_JUDGMENT: The pivot spec references a "7-clause disclosure
 * verbatim" sourced from a prior v1 document that was not carried into
 * this implementation context. The clauses below were drafted from the
 * North-Star Rule ("intelligence, not services, verdicts, certifications,
 * or filings on behalf of the customer") and from defensive patterns
 * used in SaaS legal-tech disclaimers. They are intentionally conservative
 * in framing. Any subsequent discovery of the original verbatim source
 * should supersede this file in a future LIABILITY_JUDGMENT commit.
 *
 * Clauses should be kept short, plainly worded, and mutually independent
 * so a plaintiff's expert reading the page cannot collapse them into a
 * single softer assertion.
 */

export interface ShieldClause {
  id: string
  heading: string
  body: string
}

export const SEVEN_CLAUSES: ShieldClause[] = [
  {
    id: "not-a-law-firm",
    heading: "We are not a law firm.",
    body: "BizLegal AI is a regulatory intelligence platform. We do not practice law in any jurisdiction. Accessing this site or using our tools does not create an attorney-client relationship.",
  },
  {
    id: "not-legal-advice",
    heading: "This is not legal advice.",
    body: "Our output is intelligence: analysis, summaries, and machine-assisted interpretation of publicly available regulatory information. It is not a substitute for advice from a licensed attorney in your jurisdiction.",
  },
  {
    id: "human-in-the-loop",
    heading: "Every output passes human review.",
    body: "No intelligence ships to a customer without a named human reviewer signing off. The reviewer verifies sources, flags uncertainty, and can hold delivery if any assertion cannot be substantiated.",
  },
  {
    id: "no-filings-on-your-behalf",
    heading: "We do not file on your behalf.",
    body: "We do not submit filings to FinCEN, the SEC, a court, a registry, or any other regulator for you. Where our output references a filing, you remain the filer of record and are responsible for submission, timing, accuracy, and consequences.",
  },
  {
    id: "jurisdictional-scope",
    heading: "Jurisdictional scope is finite.",
    body: "Our intelligence covers specified jurisdictions and frameworks. Gaps exist. If a question sits outside our coverage, we say so rather than infer. The pages listing covered jurisdictions and frameworks control.",
  },
  {
    id: "regulatory-drift",
    heading: "Regulation changes. We do not warrant currency.",
    body: "Regulatory texts, enforcement postures, and guidance evolve continuously. We make reasonable efforts to keep intelligence current, but we do not warrant that any output is complete or up-to-date at the moment you act on it. The disclosure version and issue timestamp on each output pin what was in force when the intelligence was produced.",
  },
  {
    id: "limits-of-liability",
    heading: "Limits of liability.",
    body: "Use of our intelligence is at your own risk and, where applicable, subject to the liability limits in our Terms. We are not liable for outcomes of decisions you make after reading our intelligence, including filings you submit, contracts you sign, or transactions you execute. If you have a complaint or a concern about a specific output, our incident response procedure is published on the Trust page.",
  },
]

export const DISCLAIMER_FOOTER_LINE =
  "BizLegal AI publishes regulatory intelligence. We are not a law firm. This is not legal advice. All output is reviewed by a human analyst before release and is subject to the version-stamped disclosure in force at the moment of issue."
