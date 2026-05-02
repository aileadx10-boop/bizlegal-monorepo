import type { KnowledgeBaseItem } from "@/lib/sqa"

/**
 * Seed corpus for the DPA Negotiator agent. All entries cite public legal
 * sources (regulations + official guidance + sanitised industry baselines).
 * No customer-specific clauses or private agreements live here.
 *
 * REVENUE+LIABILITY framing: every entry is decision-support, not legal
 * opinion. Cited regulator text is the authority; the agent only patterns
 * it against the customer's redline.
 */

const NOW_ISO = new Date().toISOString()

export const DPA_CLAUSES: KnowledgeBaseItem[] = [
  // ─── GDPR Article 28 anchor clauses ──────────────────────────────────
  {
    id: "gdpr-art28-3-instructions",
    source_name: "GDPR Article 28(3)(a) — Processor Instructions",
    source_url: "https://gdpr-info.eu/art-28-gdpr/",
    jurisdiction: "EU",
    topics: ["gdpr", "art-28", "processor-instructions", "procedural"],
    text: "The processor processes personal data only on documented instructions from the controller, including with regard to transfers of personal data to a third country or an international organisation, unless required to do so by Union or Member State law. The processor must inform the controller of any such legal requirement before processing, unless that law prohibits such information on important grounds of public interest.",
    last_updated: NOW_ISO,
  },
  {
    id: "gdpr-art28-3-confidentiality",
    source_name: "GDPR Article 28(3)(b) — Confidentiality of Personnel",
    source_url: "https://gdpr-info.eu/art-28-gdpr/",
    jurisdiction: "EU",
    topics: ["gdpr", "art-28", "confidentiality", "procedural"],
    text: "The processor ensures that persons authorised to process the personal data have committed themselves to confidentiality or are under an appropriate statutory obligation of confidentiality.",
    last_updated: NOW_ISO,
  },
  {
    id: "gdpr-art28-3-security",
    source_name: "GDPR Article 28(3)(c) — Security Measures",
    source_url: "https://gdpr-info.eu/art-28-gdpr/",
    jurisdiction: "EU",
    topics: ["gdpr", "art-28", "security", "art-32", "liability"],
    text: "The processor takes all measures required pursuant to Article 32 (security of processing): pseudonymisation and encryption of personal data; ongoing confidentiality, integrity, availability and resilience; the ability to restore availability and access in a timely manner; and a process for regularly testing, assessing and evaluating the effectiveness of technical and organisational measures.",
    last_updated: NOW_ISO,
  },
  {
    id: "gdpr-art28-2-subprocessor",
    source_name: "GDPR Article 28(2) — Sub-processor Authorisation",
    source_url: "https://gdpr-info.eu/art-28-gdpr/",
    jurisdiction: "EU",
    topics: ["gdpr", "art-28", "sub-processor", "sub-processor"],
    text: "The processor does not engage another processor without prior specific or general written authorisation of the controller. In the case of general written authorisation, the processor informs the controller of any intended changes concerning the addition or replacement of other processors, thereby giving the controller the opportunity to object to such changes.",
    last_updated: NOW_ISO,
  },
  {
    id: "gdpr-art28-3-data-subject-rights",
    source_name: "GDPR Article 28(3)(e) — Assistance with Data Subject Rights",
    source_url: "https://gdpr-info.eu/art-28-gdpr/",
    jurisdiction: "EU",
    topics: ["gdpr", "art-28", "data-subject-rights", "procedural"],
    text: "Taking into account the nature of the processing, the processor assists the controller by appropriate technical and organisational measures, insofar as this is possible, for the fulfilment of the controller's obligation to respond to requests for exercising the data subject's rights laid down in Chapter III (access, rectification, erasure, restriction, portability, objection).",
    last_updated: NOW_ISO,
  },
  {
    id: "gdpr-art28-3-breach-notification",
    source_name: "GDPR Article 28(3)(f) — Breach Notification Assistance",
    source_url: "https://gdpr-info.eu/art-28-gdpr/",
    jurisdiction: "EU",
    topics: ["gdpr", "art-28", "breach-notification", "art-33", "art-34", "liability"],
    text: "The processor assists the controller in ensuring compliance with obligations pursuant to Articles 32 to 36 (security, breach notification to authority within 72h, breach notification to data subjects, DPIA, prior consultation), taking into account the nature of processing and the information available to the processor.",
    last_updated: NOW_ISO,
  },
  {
    id: "gdpr-art28-3-deletion",
    source_name: "GDPR Article 28(3)(g) — Deletion or Return on Termination",
    source_url: "https://gdpr-info.eu/art-28-gdpr/",
    jurisdiction: "EU",
    topics: ["gdpr", "art-28", "termination", "deletion", "procedural"],
    text: "At the choice of the controller, the processor deletes or returns all the personal data to the controller after the end of the provision of services relating to processing, and deletes existing copies unless Union or Member State law requires storage of the personal data.",
    last_updated: NOW_ISO,
  },
  {
    id: "gdpr-art28-3-audit",
    source_name: "GDPR Article 28(3)(h) — Audit Rights",
    source_url: "https://gdpr-info.eu/art-28-gdpr/",
    jurisdiction: "EU",
    topics: ["gdpr", "art-28", "audit", "procedural", "liability"],
    text: "The processor makes available to the controller all information necessary to demonstrate compliance with the obligations laid down in Article 28 and allows for and contributes to audits, including inspections, conducted by the controller or another auditor mandated by the controller. With regard to audit rights, the processor immediately informs the controller if, in its opinion, an instruction infringes the GDPR or other Union or Member State data protection provisions.",
    last_updated: NOW_ISO,
  },

  // ─── EU SCCs (2021 modules) ──────────────────────────────────────────
  {
    id: "eu-scc-2021-clause-7-docking",
    source_name: "EU SCC 2021/914 — Clause 7 (Docking Clause)",
    source_url: "https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj",
    jurisdiction: "EU",
    topics: ["scc", "transfer", "third-country", "docking", "residency"],
    text: "An entity that is not a Party to these Clauses may, with the agreement of the Parties, accede to these Clauses at any time, either as a data exporter or as a data importer, by completing the Appendix and signing Annex I.A. Once it has completed the Appendix and signed Annex I.A, the acceding entity becomes a Party to these Clauses and has the rights and obligations of a data exporter or data importer, in accordance with its designation in Annex I.A.",
    last_updated: NOW_ISO,
  },
  {
    id: "eu-scc-2021-clause-8-data-protection-safeguards",
    source_name: "EU SCC 2021/914 — Clause 8 (Data Protection Safeguards)",
    source_url: "https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj",
    jurisdiction: "EU",
    topics: ["scc", "transfer", "third-country", "safeguards", "residency"],
    text: "The data exporter warrants that it has used reasonable efforts to determine that the data importer is able, through the implementation of appropriate technical and organisational measures, to satisfy its obligations under these Clauses. The data importer agrees that the controller may verify compliance.",
    last_updated: NOW_ISO,
  },
  {
    id: "eu-scc-2021-clause-9-subprocessor-list",
    source_name: "EU SCC 2021/914 — Clause 9 (Use of Sub-processors)",
    source_url: "https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj",
    jurisdiction: "EU",
    topics: ["scc", "sub-processor", "third-country", "residency"],
    text: "Option 1 (Specific authorisation): the data importer must not subcontract to any sub-processor without specific prior written authorisation. Option 2 (General authorisation): the data importer has general authorisation to engage sub-processors from an agreed list. In both cases, the data importer must inform the data exporter of any intended addition or replacement, allowing time for objection (typically 30 days minimum). Sub-processor must enter back-to-back obligations.",
    last_updated: NOW_ISO,
  },
  {
    id: "eu-scc-2021-clause-15-third-country-access",
    source_name: "EU SCC 2021/914 — Clause 15 (Local Laws & Public Authority Access)",
    source_url: "https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj",
    jurisdiction: "EU",
    topics: ["scc", "third-country", "government-access", "schrems-ii", "residency", "liability"],
    text: "The Parties warrant that they have no reason to believe that the laws and practices in the third country of destination — including any requirements to disclose personal data or measures authorising access by public authorities — prevent the data importer from fulfilling its obligations under these Clauses. The data importer notifies the data exporter promptly of any legally binding request from public authorities for disclosure, and challenges such requests where lawful.",
    last_updated: NOW_ISO,
  },

  // ─── CCPA / CPRA processor language ──────────────────────────────────
  {
    id: "ccpa-1798-140-service-provider",
    source_name: "CCPA §1798.140(ag) / (ai) — Service Provider & Contractor",
    source_url: "https://oag.ca.gov/privacy/ccpa",
    jurisdiction: "US",
    topics: ["ccpa", "cpra", "service-provider", "procedural", "liability"],
    text: "A 'service provider' or 'contractor' processes personal information on behalf of a business pursuant to a written contract that prohibits selling, sharing, or retaining the information for any purpose other than the specific purpose set out in the contract. The contract must include the obligation to assist the business with consumer rights requests, prohibit combining personal information with other sources except as permitted, and notify the business if the service provider determines it can no longer meet its obligations.",
    last_updated: NOW_ISO,
  },
  {
    id: "ccpa-required-contract-terms",
    source_name: "CCPA Regulations §7051 — Required Contract Provisions",
    source_url: "https://oag.ca.gov/privacy/ccpa",
    jurisdiction: "US",
    topics: ["ccpa", "cpra", "service-provider", "contract-terms", "procedural"],
    text: "Service-provider contracts must specify: (1) the limited and specified purposes; (2) prohibition on selling/sharing the personal information; (3) prohibition on retaining, using, or disclosing outside the direct business relationship; (4) obligation to comply with CCPA; (5) right of the business to take reasonable and appropriate steps to ensure the service provider uses the personal information consistently; (6) requirement to notify if the service provider can no longer meet obligations; (7) right to take steps to stop and remediate unauthorised use.",
    last_updated: NOW_ISO,
  },

  // ─── HIPAA BAA ────────────────────────────────────────────────────────
  {
    id: "hipaa-baa-permitted-uses",
    source_name: "HIPAA 45 CFR §164.504(e) — Permitted Uses & Disclosures",
    source_url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html",
    jurisdiction: "US",
    topics: ["hipaa", "baa", "permitted-uses", "procedural"],
    text: "The business associate may use or disclose protected health information only as permitted or required by the BAA or as required by law. Permitted uses typically include performing services for or on behalf of the covered entity, management and administration of the business associate, and to carry out its legal responsibilities. The BAA must limit uses to the minimum necessary.",
    last_updated: NOW_ISO,
  },
  {
    id: "hipaa-baa-breach-60d",
    source_name: "HIPAA 45 CFR §164.410 — Breach Notification (60-day)",
    source_url: "https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html",
    jurisdiction: "US",
    topics: ["hipaa", "baa", "breach-notification", "liability"],
    text: "A business associate must notify a covered entity of a breach of unsecured PHI without unreasonable delay and in no case later than 60 calendar days after discovery of the breach. The notification must include the identification of each individual whose unsecured PHI has been breached, and any other information the covered entity is required to include in its notification to the affected individual.",
    last_updated: NOW_ISO,
  },
  {
    id: "hipaa-baa-subcontractor",
    source_name: "HIPAA 45 CFR §164.502(e) — Subcontractor Obligations",
    source_url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html",
    jurisdiction: "US",
    topics: ["hipaa", "baa", "sub-processor", "subcontractor"],
    text: "A business associate may not allow a subcontractor to create, receive, maintain, or transmit electronic protected health information on its behalf unless the business associate obtains satisfactory assurances, in the form of a written contract, that the subcontractor will appropriately safeguard the information. Subcontractors are themselves business associates and bound by the same standards.",
    last_updated: NOW_ISO,
  },
  {
    id: "hipaa-baa-termination",
    source_name: "HIPAA 45 CFR §164.504(e)(2)(ii)(I) — Termination",
    source_url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html",
    jurisdiction: "US",
    topics: ["hipaa", "baa", "termination", "deletion"],
    text: "Upon termination of the BAA, the business associate must return or destroy all PHI received from, or created or received by the business associate on behalf of, the covered entity, and retain no copies. If return or destruction is infeasible, the business associate extends the BAA's protections to the information and limits further uses and disclosures to those purposes that make return or destruction infeasible.",
    last_updated: NOW_ISO,
  },

  // ─── Liability framing — common negotiation flashpoints ───────────────
  {
    id: "negotiation-liability-uncapped-pii",
    source_name: "Industry baseline — Uncapped data-breach liability carve-outs",
    source_url: "https://iapp.org/resources/article/dpa-negotiation-key-clauses/",
    jurisdiction: "OTHER",
    topics: ["liability", "indemnification", "data-breach", "negotiation"],
    text: "Many enterprise customers ask for uncapped liability for data breaches. Common middle-ground positions include: (a) supercap at 2-5x annual fees specifically for confidentiality/data-breach claims while keeping the general cap at 1x annual fees; (b) carve-out only for breaches of the data-protection clauses themselves; (c) excluding consequential damages but allowing direct damages including regulatory fines and notification costs.",
    last_updated: NOW_ISO,
  },
  {
    id: "negotiation-data-residency",
    source_name: "Industry baseline — Data residency requests",
    source_url: "https://iapp.org/resources/article/data-residency-considerations/",
    jurisdiction: "OTHER",
    topics: ["residency", "transfer", "third-country", "negotiation"],
    text: "Common customer asks include: (a) all processing must occur in EU/UK/customer-specified region; (b) no cross-border transfers without prior approval; (c) right to mandate specific sub-processor regions. Common compromise: commit to a primary region with documented backup region for disaster recovery; provide list of regions on request; commit to advance notice of any new region.",
    last_updated: NOW_ISO,
  },
  {
    id: "negotiation-subprocessor-objection",
    source_name: "Industry baseline — Sub-processor objection windows",
    source_url: "https://iapp.org/resources/article/dpa-negotiation-key-clauses/",
    jurisdiction: "OTHER",
    topics: ["sub-processor", "negotiation", "procedural"],
    text: "Customer asks typically demand 30-90 day objection window for new sub-processors with right to terminate without penalty. Common middle ground: 30-day notice via email or a sub-processors page; reasonable-objection standard (cannot block routine sub-processor changes for non-substantive reasons); termination right limited to material objections.",
    last_updated: NOW_ISO,
  },
]
