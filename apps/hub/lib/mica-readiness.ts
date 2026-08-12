// MiCA Readiness Assessment — pure scoring + report logic.
// Framework-free on purpose: this module is imported by both the API route
// (server) and the questionnaire client, and is kept pure so it can be
// unit-tested without any Next.js or Supabase dependency.
//
// Regulation references follow Regulation (EU) 2023/1114 (MiCA). Where an
// article number is not stated with confidence, the citation falls back to a
// "MiCA Title/Chapter" reference rather than guessing an article.

export type MicaTier = "Critical Gap" | "At Risk" | "Nearly Ready" | "Ready"

export type MicaSeverity = "Critical" | "High" | "Medium" | "Low"

export interface MicaOption {
  value: string
  label: string
  score: number
}

export interface MicaGapTemplate {
  title: string
  detail: string
  citation: string
  recommendation: (answer: string, answerLabel: string) => string
}

export interface MicaQuestion {
  id: string
  category: string
  prompt: string
  help?: string
  kind: "choice" | "yes-no"
  weight: number
  options?: MicaOption[]
  gap: MicaGapTemplate
}

export interface MicaGap {
  id: string
  category: string
  title: string
  detail: string
  citation: string
  severity: MicaSeverity
  recommendation: string
}

export interface MicaAreaScore {
  id: string
  category: string
  score: number
  status: "OK" | "PARTIAL" | "GAP"
}

export interface MicaReport {
  score: number
  tier: MicaTier
  tierSummary: string
  areas: MicaAreaScore[]
  gaps: MicaGap[]
  covered: string[]
  liability: {
    disclaimer: string
    scope: string
    humanReview: string
  }
  generatedAt: string
}

const YES_NO_OPTIONS: MicaOption[] = [
  { value: "yes", label: "Yes", score: 100 },
  { value: "partial", label: "Partially", score: 50 },
  { value: "no", label: "No", score: 0 },
]

const YES_NO_TWO_OPTIONS: MicaOption[] = [
  { value: "yes", label: "Yes", score: 100 },
  { value: "no", label: "No", score: 0 },
]

export const QUESTIONS: MicaQuestion[] = [
  {
    id: "authorisation",
    category: "Licence & Authorisation",
    prompt:
      "Which best describes your current MiCA authorisation status as a crypto-asset service provider (CASP)?",
    kind: "choice",
    weight: 25,
    options: [
      { value: "full", label: "Fully authorised MiCA CASP", score: 100 },
      {
        value: "transitional",
        label: "Operating under a transitional / grandfathering authorisation",
        score: 65,
      },
      {
        value: "pending",
        label: "Authorisation application pending with a national competent authority",
        score: 35,
      },
      { value: "none", label: "No authorisation — not yet licensed under MiCA", score: 0 },
    ],
    gap: {
      title: "CASP authorisation not yet secured",
      detail:
        "MiCA authorisation is the gateway obligation: it determines which crypto-asset services you may lawfully provide to EU clients and affects several obligations below.",
      citation:
        "MiCA Art. 59 (authorisation of crypto-asset service providers); transitional regime under MiCA Art. 143",
      recommendation: (answer, label) =>
        answer === "transitional"
          ? "Confirm in writing with your national competent authority (NCA) the validity period and scope of your transitional authorisation, and start the full authorisation application in parallel so there is no gap when the transitional regime ends."
          : answer === "pending"
            ? "Track the NCA decision timeline and prepare the operational evidence (policies, capital, governance, outsourcing register) that the authorisation review will examine."
            : `Your response ("${label}") indicates no final MiCA authorisation is in place. Engage a qualified adviser to map whether any exemption applies and the realistic timeline, capital and cost to obtain authorisation before offering crypto-asset services to EU clients.`,
    },
  },
  {
    id: "screening",
    category: "Wallet & Transaction Screening",
    prompt:
      "Before executing a transaction, do you screen counterparty wallets and counterparties against EU and UN sanctions lists (and, where relevant, aligned lists such as OFAC)?",
    help: "This is a sanctions-screening control. Screening obligations also derive from the EU/UN sanctions regimes and the EU AML framework, which sit outside this assessment's MiCA licensing scope.",
    kind: "yes-no",
    weight: 10,
    options: YES_NO_OPTIONS,
    gap: {
      title: "No sanctions screening of wallets and counterparties",
      detail:
        "Automated screening of counterparty wallets and identities before execution is a core operational control; its absence leaves the firm exposed to transacting with sanctioned parties.",
      citation:
        "MiCA Title V, Chapter 2 (operational requirements); EU/UN sanctions regimes and the EU AML framework (Regulation (EU) 2024/1624)",
      recommendation: (_answer, _label) =>
        "Implement automated wallet and counterparty sanctions screening before execution, including handling of blocked or flagged addresses, escalation procedures, and records of screening decisions.",
    },
  },
  {
    id: "travelrule",
    category: "Travel Rule",
    prompt:
      "Do you collect and transmit originator and beneficiary information for transfers to other VASPs / CASPs (the crypto Travel Rule)?",
    kind: "yes-no",
    weight: 10,
    options: YES_NO_OPTIONS,
    gap: {
      title: "Travel Rule data sharing not in place",
      detail:
        "Travel Rule information accompanies each transfer and must be transmitted securely to the receiving VASP/CASP; without it, transfers to or from your firm can be blocked or rejected by counterparties.",
      citation: "MiCA Art. 79-80 (transfer of information accompanying transfers of crypto-assets)",
      recommendation: (_answer, _label) =>
        "Implement Travel Rule procedures to collect, verify and securely transmit originator and beneficiary information for every VASP-to-VASP transfer, including an encrypted peer-to-peer data-exchange solution and a fallback for counterparties that cannot receive the data.",
    },
  },
  {
    id: "marketabuse",
    category: "Market Abuse Detection",
    prompt:
      "Do you operate monitoring or surveillance to detect and report market abuse (insider dealing, unlawful disclosure, market manipulation) in the crypto-assets you serve?",
    kind: "yes-no",
    weight: 10,
    options: YES_NO_TWO_OPTIONS,
    gap: {
      title: "No market abuse surveillance programme",
      detail:
        "Crypto-asset service providers are expected to have arrangements to detect and report possible market abuse; a missing programme is a common supervisory finding.",
      citation: "MiCA Title VI — market abuse (Art. 92 et seq.)",
      recommendation: (_answer, _label) =>
        "Deploy transaction and order monitoring to detect suspicious patterns, train staff on market-abuse indicators, and establish a documented route for notifying your NCA of suspected abuse.",
    },
  },
  {
    id: "counterpartydd",
    category: "Counterparty Due Diligence",
    prompt:
      "Do you perform risk-based due diligence on counterparties and business relationships (identity verification and ongoing monitoring)?",
    help: "Customer due diligence under the EU AML framework is outside this assessment's MiCA licensing scope, but MiCA's operational requirements presume functioning counterparty controls.",
    kind: "yes-no",
    weight: 8,
    options: YES_NO_OPTIONS,
    gap: {
      title: "Counterparty due diligence gaps",
      detail:
        "Risk-based identity verification and ongoing monitoring of relationships is the foundation that screening and Travel Rule controls build on.",
      citation:
        "MiCA Title V, Chapter 2 (operational requirements); customer due diligence under the EU AML framework (Regulation (EU) 2024/1624)",
      recommendation: (_answer, _label) =>
        "Formalise risk-based customer and counterparty due diligence procedures, including identity verification, beneficial-ownership checks where relevant, and ongoing monitoring of relationships with periodic reviews.",
    },
  },
  {
    id: "stablecoin",
    category: "Stablecoin (ART / EMT) Exposure",
    prompt:
      "What is your exposure to asset-referenced tokens (ARTs) and e-money tokens (EMTs) — for example, as issuer, sponsor, or custodian?",
    help: "If you are US-facing, US stablecoin rules (the GENIUS Act) may also apply to reserve and disclosure, alongside MiCA.",
    kind: "choice",
    weight: 10,
    options: [
      {
        value: "art-issuer",
        label: "We issue or sponsor ARTs (asset-referenced tokens)",
        score: 35,
      },
      { value: "emt-issuer", label: "We issue or sponsor EMTs (e-money tokens)", score: 45 },
      { value: "custody", label: "We only hold or custody third-party stablecoins", score: 75 },
      { value: "none", label: "No meaningful stablecoin exposure", score: 100 },
    ],
    gap: {
      title: "Stablecoin obligations not assessed",
      detail:
        "ARTs and EMTs carry issuer-specific duties (reserve of assets, redemption rights, authorisation) that go beyond general CASP obligations; the exposure determines which of these apply.",
      citation:
        "MiCA Art. 36 (reserve of assets for ARTs); MiCA Title IV (EMT requirements); if US-facing, the US GENIUS Act reserve and disclosure rules",
      recommendation: (answer, _label) =>
        answer === "art-issuer"
          ? "Assess whether you hold the required authorisation and can operate the reserve of assets, custody and redemption duties for ARTs (MiCA Art. 35-42); obtain legal advice before issuing or continuing to offer ARTs."
          : answer === "emt-issuer"
            ? "Confirm you are authorised as a credit institution or e-money institution (only those may issue EMTs) and verify compliance with the EUR-referencing, redemption and disclosure rules under MiCA Title IV."
            : answer === "custody"
              ? "Confirm your custody and safeguarding policies distinguish ART/EMT holdings and that you do not inadvertently trigger issuer obligations for assets you merely hold on behalf of clients."
              : "Re-assess if you later add stablecoin products; based on your response, no issuer-side ART/EMT obligations appear engaged today.",
    },
  },
  {
    id: "recordkeeping",
    category: "Record-Keeping & Reporting",
    prompt:
      "Do you keep transaction and client records to regulatory retention standards and report to your national competent authority as required?",
    kind: "yes-no",
    weight: 8,
    options: YES_NO_OPTIONS,
    gap: {
      title: "Record-keeping and NCA reporting not confirmed",
      detail:
        "Retention of client instructions, transactions and orders, plus scheduled reporting to the NCA, is a routine but essential MiCA obligation that is easy to under-scope.",
      citation: "MiCA Title V, Chapter 2 (record-keeping and reporting obligations)",
      recommendation: (_answer, _label) =>
        "Verify your retention periods meet MiCA requirements, keep immutable audit trails of client instructions and transactions, and confirm the reporting schedule and templates your NCA expects for the services you provide.",
    },
  },
  {
    id: "whitepaper",
    category: "White Paper & Disclosure",
    prompt:
      "If you offer or issue crypto-assets, is a compliant white paper notified to your NCA and published (or a valid exemption confirmed)?",
    kind: "choice",
    weight: 8,
    options: [
      { value: "yes", label: "Yes — white paper in place (or valid exemption)", score: 100 },
      {
        value: "na",
        label: "Not applicable — we only provide services over third-party assets",
        score: 85,
      },
      { value: "no", label: "No — no white paper yet", score: 0 },
    ],
    gap: {
      title: "White paper / disclosure obligations not met",
      detail:
        "Offering crypto-assets to EU clients generally requires a white paper notified to the NCA and published before the offering, unless a valid exemption applies.",
      citation:
        "MiCA Art. 8 (white paper for crypto-assets other than ARTs/EMTs); Art. 19 (ART white paper); MiCA Title IV (EMT white paper)",
      recommendation: (answer, _label) =>
        answer === "na"
          ? "Document your analysis confirming you only provide services over third-party assets and have no issuer-side white paper obligation, and keep that analysis for review."
          : "Draft and notify the white paper to your NCA and publish it within the required notice period before any offering, with legal review of content, risk disclosures and marketing communications.",
    },
  },
  {
    id: "governance",
    category: "Governance & Compliance Officer",
    prompt:
      "Do you have a designated compliance function or officer and governance arrangements covering MiCA obligations?",
    kind: "yes-no",
    weight: 6,
    options: YES_NO_TWO_OPTIONS,
    gap: {
      title: "Compliance function or governance arrangements not evidenced",
      detail:
        "Supervisors expect a named compliance function with real authority and documented governance; its absence weakens every other control.",
      citation: "MiCA Title V, Chapter 2 (governance and organisational requirements)",
      recommendation: (_answer, _label) =>
        "Designate a named compliance officer with appropriate seniority and board access, document the governance framework (policies, decision rights, escalation paths), and keep training and committee records.",
    },
  },
  {
    id: "capital",
    category: "Capital & Insurance",
    prompt:
      "Do you hold the required own funds (minimum capital) and, where applicable, professional indemnity insurance for the services you provide?",
    kind: "yes-no",
    weight: 5,
    options: YES_NO_OPTIONS,
    gap: {
      title: "Prudential capital or insurance not confirmed",
      detail:
        "Minimum own funds vary by service category; providers of custody and some other services must also hold professional indemnity insurance or additional own funds.",
      citation:
        "MiCA Art. 67 (prudential requirements — own funds); insurance cover for certain services under MiCA Title V, Chapter 2",
      recommendation: (_answer, _label) =>
        "Calculate the own-funds requirement for each MiCA service category you provide, confirm funds are held in qualifying liquid assets, and arrange professional indemnity insurance where the relevant service category requires it.",
    },
  },
]

const TIER_SUMMARIES: Record<MicaTier, string> = {
  "Critical Gap":
    "Based on your responses, several core MiCA obligations appear unaddressed — in the most serious cases including authorisation itself. This is the highest-exposure posture of the four tiers. This snapshot does not determine your legal status: the obligations and timelines that apply depend on your services, the assets involved and your member state.",
  "At Risk":
    "Based on your responses, some high-weight obligations are only partially addressed. Authorisation, sanctions screening and the Travel Rule typically need the most urgent attention. This tier reflects the readiness snapshot only, not a finding of non-compliance.",
  "Nearly Ready":
    "Based on your responses, most core MiCA obligations appear addressed, with a few lower-weight gaps remaining. Confirm and close the open items with a qualified reviewer before any filing or expansion of services.",
  Ready:
    "Based on your responses, the MiCA licensing obligations covered by this assessment appear substantially addressed. This is a snapshot, not a certificate: verify the remaining details with your NCA and a qualified reviewer.",
}

const LIABILITY = {
  disclaimer:
    "This is an informational readiness snapshot, not legal advice. MiCA implementation details are set by national regulators and ESMA guidelines, and may differ by member state and by the specific services you provide.",
  scope:
    "This assessment covers MiCA licensing obligations only — it does not cover PSD2, DORA, AML/CFT national implementation, or marketing rules.",
  humanReview:
    "For a formal gap analysis, a qualified reviewer reviews the output before any regulatory filing. This snapshot is not a certification of compliance and carries no outcome guarantee.",
}

export const TOTAL_WEIGHT = QUESTIONS.reduce((sum, q) => sum + q.weight, 0)

export function tierForScore(score: number): MicaTier {
  if (score >= 85) return "Ready"
  if (score >= 65) return "Nearly Ready"
  if (score >= 40) return "At Risk"
  return "Critical Gap"
}

function severityFor(weight: number, score: number): MicaSeverity {
  if (score === 0) return weight >= 10 ? "Critical" : "High"
  if (score < 50) return weight >= 10 ? "High" : "Medium"
  if (score < 80) return "Medium"
  return "Low"
}

const SEVERITY_ORDER: Record<MicaSeverity, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 }

function areaStatusFor(score: number): "OK" | "PARTIAL" | "GAP" {
  if (score >= 100) return "OK"
  if (score >= 50) return "PARTIAL"
  return "GAP"
}

interface ResolvedAnswer {
  question: MicaQuestion
  option: MicaOption | undefined
  score: number
  label: string
}

function resolveAnswers(answers: Record<string, string>): ResolvedAnswer[] {
  return QUESTIONS.map((question) => {
    const raw = answers[question.id] ?? ""
    const option =
      question.kind === "yes-no"
        ? (question.options ?? []).find((o) => o.value === raw)
        : (question.options ?? []).find((o) => o.value === raw)
    return {
      question,
      option,
      score: option?.score ?? 0,
      label: option?.label ?? "Not answered",
    }
  })
}

export function computeMicaReadiness(
  answers: Record<string, string>,
  now: Date = new Date()
): MicaReport {
  const resolved = resolveAnswers(answers)

  const score = Math.round(
    resolved.reduce((sum, r) => sum + (r.score * r.question.weight) / TOTAL_WEIGHT, 0)
  )

  const weightById = new Map(QUESTIONS.map((q) => [q.id, q.weight]))

  const gaps: MicaGap[] = resolved
    .filter((r) => r.score < 100)
    .map((r) => ({
      id: r.question.id,
      category: r.question.category,
      title: r.question.gap.title,
      detail: r.question.gap.detail,
      citation: r.question.gap.citation,
      severity: severityFor(r.question.weight, r.score),
      recommendation: r.question.gap.recommendation(r.option?.value ?? "", r.label),
    }))
    .sort(
      (a, b) =>
        SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
        (weightById.get(b.id) ?? 0) - (weightById.get(a.id) ?? 0)
    )

  // Hard gate: a weighted average can mask a core obligation. A Critical gap
  // (e.g. no authorisation, weight >= 10 scored 0) must never let the report
  // claim readiness, so the tier is capped below the score-derived tier.
  let tier = tierForScore(score)
  if (gaps.some((g) => g.severity === "Critical")) {
    if (tier === "Ready" || tier === "Nearly Ready") tier = "At Risk"
  } else if (gaps.some((g) => g.severity === "High")) {
    if (tier === "Ready") tier = "Nearly Ready"
  }

  const covered = resolved.filter((r) => r.score >= 100).map((r) => r.question.category)

  const areas: MicaAreaScore[] = resolved.map((r) => ({
    id: r.question.id,
    category: r.question.category,
    score: r.score,
    status: areaStatusFor(r.score),
  }))

  return {
    score,
    tier,
    tierSummary: TIER_SUMMARIES[tier],
    areas,
    gaps,
    covered,
    liability: LIABILITY,
    generatedAt: now.toISOString(),
  }
}
