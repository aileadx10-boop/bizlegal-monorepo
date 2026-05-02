/**
 * LexAudit — Compliance health-score signal registry.
 *
 * 60 signals total, 12 per framework across:
 *   SOC 2 (Trust Service Criteria)
 *   ISO 27001:2022 (Annex A)
 *   GDPR (EU 2016/679)
 *   HIPAA Security Rule (45 CFR §164)
 *   DPDP Act 2023 (India)
 *
 * Each signal references a real, published control in its source
 * framework. The `control_ref` is the citation a reviewer or auditor
 * can use to verify the mapping. The `evidence_type` describes what
 * artefact substantiates the signal; human reviewers verify the
 * submitted evidence matches.
 *
 * This registry is versioned via lib/legal/disclaimer.ts
 * DISCLAIMER_VERSION. When weights change or signals are added/
 * removed, the version bumps and prior reports remain reproducible
 * against their stamped version.
 *
 * LIABILITY_JUDGMENT: The signals below are process-attestation
 * signals, not certification criteria. A "met" signal attests that
 * the customer's documented workflow produced evidence for the
 * control — it does NOT certify the customer as compliant with the
 * framework. A framework compliance finding is made by an
 * independent auditor or a regulator.
 */

export type FrameworkId = "soc2" | "iso27001" | "gdpr" | "hipaa" | "dpdp"
export type Severity = "critical" | "high" | "medium" | "low"
export type EvidenceType =
  | "policy_document"
  | "access_log"
  | "configuration"
  | "training_record"
  | "incident_log"
  | "contract_artefact"
  | "risk_register"
  | "audit_log"

export interface Signal {
  id: string
  framework: FrameworkId
  control_ref: string
  name: string
  description: string
  evidence_type: EvidenceType
  severity: Severity
}

export const SIGNALS: Signal[] = [
  // ─── SOC 2 — Trust Service Criteria (AICPA 2017 TSC) ────────────
  { id: "soc2-cc1-1", framework: "soc2", control_ref: "CC1.1", name: "Integrity and ethical values", description: "Entity demonstrates a commitment to integrity and ethical values via a published code of conduct.", evidence_type: "policy_document", severity: "medium" },
  { id: "soc2-cc2-1", framework: "soc2", control_ref: "CC2.1", name: "Information and communication", description: "Entity obtains or generates relevant, quality information to support internal controls.", evidence_type: "policy_document", severity: "medium" },
  { id: "soc2-cc3-1", framework: "soc2", control_ref: "CC3.1", name: "Risk identification", description: "Entity specifies objectives and identifies risks to achieving them; maintained in a risk register.", evidence_type: "risk_register", severity: "high" },
  { id: "soc2-cc5-1", framework: "soc2", control_ref: "CC5.1", name: "Control activities selection", description: "Entity selects and develops control activities that contribute to mitigation of identified risks.", evidence_type: "policy_document", severity: "high" },
  { id: "soc2-cc6-1", framework: "soc2", control_ref: "CC6.1", name: "Logical access controls", description: "Logical access controls restrict system access to authorized users.", evidence_type: "configuration", severity: "critical" },
  { id: "soc2-cc6-6", framework: "soc2", control_ref: "CC6.6", name: "Transmission encryption", description: "Data in transit is protected using approved cryptographic protocols.", evidence_type: "configuration", severity: "critical" },
  { id: "soc2-cc6-7", framework: "soc2", control_ref: "CC6.7", name: "At-rest encryption", description: "Data at rest is protected using approved cryptographic protocols.", evidence_type: "configuration", severity: "critical" },
  { id: "soc2-cc7-1", framework: "soc2", control_ref: "CC7.1", name: "System monitoring", description: "Entity monitors system components and the operation of controls to detect anomalies.", evidence_type: "audit_log", severity: "high" },
  { id: "soc2-cc7-3", framework: "soc2", control_ref: "CC7.3", name: "Incident evaluation", description: "Entity evaluates security events to determine whether they constitute incidents.", evidence_type: "incident_log", severity: "high" },
  { id: "soc2-cc8-1", framework: "soc2", control_ref: "CC8.1", name: "Change management", description: "Entity authorizes, designs, develops, configures, documents, tests, and approves changes to system components.", evidence_type: "audit_log", severity: "high" },
  { id: "soc2-cc9-2", framework: "soc2", control_ref: "CC9.2", name: "Vendor risk management", description: "Entity assesses and manages risks associated with vendors and business partners.", evidence_type: "contract_artefact", severity: "high" },
  { id: "soc2-c1-1", framework: "soc2", control_ref: "C1.1 (Confidentiality)", name: "Confidentiality commitments", description: "Entity identifies and maintains confidential information consistent with its commitments.", evidence_type: "policy_document", severity: "high" },

  // ─── ISO/IEC 27001:2022 — Annex A ────────────────────────────────
  { id: "iso-a5-1", framework: "iso27001", control_ref: "A.5.1", name: "Policies for information security", description: "A set of information security policies is defined, approved by management, and communicated.", evidence_type: "policy_document", severity: "high" },
  { id: "iso-a5-7", framework: "iso27001", control_ref: "A.5.7", name: "Threat intelligence", description: "Information relating to information security threats is collected and analysed.", evidence_type: "policy_document", severity: "medium" },
  { id: "iso-a5-15", framework: "iso27001", control_ref: "A.5.15", name: "Access control policy", description: "Access to information and other associated assets is controlled by a documented policy.", evidence_type: "policy_document", severity: "critical" },
  { id: "iso-a5-19", framework: "iso27001", control_ref: "A.5.19", name: "Supplier security", description: "Processes are defined to manage information security risks associated with suppliers.", evidence_type: "contract_artefact", severity: "high" },
  { id: "iso-a5-23", framework: "iso27001", control_ref: "A.5.23", name: "Cloud services security", description: "Security of information in cloud services is managed per the organization's requirements.", evidence_type: "configuration", severity: "high" },
  { id: "iso-a5-26", framework: "iso27001", control_ref: "A.5.26", name: "Incident response", description: "Information security incidents are responded to per documented procedures.", evidence_type: "incident_log", severity: "high" },
  { id: "iso-a6-3", framework: "iso27001", control_ref: "A.6.3", name: "Security awareness training", description: "Personnel receive appropriate information security awareness, education, and training.", evidence_type: "training_record", severity: "medium" },
  { id: "iso-a8-2", framework: "iso27001", control_ref: "A.8.2", name: "Privileged access rights", description: "Allocation and use of privileged access rights is restricted and managed.", evidence_type: "access_log", severity: "critical" },
  { id: "iso-a8-5", framework: "iso27001", control_ref: "A.8.5", name: "Secure authentication", description: "Secure authentication technologies and procedures are implemented based on access control policy.", evidence_type: "configuration", severity: "critical" },
  { id: "iso-a8-16", framework: "iso27001", control_ref: "A.8.16", name: "Monitoring activities", description: "Networks, systems, and applications are monitored for anomalous behaviour.", evidence_type: "audit_log", severity: "high" },
  { id: "iso-a8-24", framework: "iso27001", control_ref: "A.8.24", name: "Use of cryptography", description: "Rules for the effective use of cryptography, including cryptographic key management, are defined.", evidence_type: "configuration", severity: "critical" },
  { id: "iso-a8-28", framework: "iso27001", control_ref: "A.8.28", name: "Secure coding", description: "Secure coding principles are applied to software development.", evidence_type: "policy_document", severity: "medium" },

  // ─── GDPR — Regulation (EU) 2016/679 ─────────────────────────────
  { id: "gdpr-art5", framework: "gdpr", control_ref: "Art. 5", name: "Principles of processing", description: "Personal data is processed lawfully, fairly, transparently, and limited to stated purposes.", evidence_type: "policy_document", severity: "critical" },
  { id: "gdpr-art6", framework: "gdpr", control_ref: "Art. 6", name: "Lawful basis for processing", description: "Each processing activity has an identified and documented lawful basis.", evidence_type: "policy_document", severity: "critical" },
  { id: "gdpr-art7", framework: "gdpr", control_ref: "Art. 7", name: "Conditions for consent", description: "Where consent is the lawful basis, it is freely given, specific, informed, and demonstrable.", evidence_type: "policy_document", severity: "high" },
  { id: "gdpr-art13", framework: "gdpr", control_ref: "Art. 13", name: "Information to data subjects", description: "Data subjects are informed at collection of controller, purposes, recipients, and rights.", evidence_type: "policy_document", severity: "high" },
  { id: "gdpr-art15", framework: "gdpr", control_ref: "Art. 15", name: "Right of access", description: "Procedures exist to respond to data-subject access requests within one month.", evidence_type: "policy_document", severity: "high" },
  { id: "gdpr-art17", framework: "gdpr", control_ref: "Art. 17", name: "Right to erasure", description: "Procedures exist to effect erasure of personal data when conditions are met.", evidence_type: "policy_document", severity: "high" },
  { id: "gdpr-art25", framework: "gdpr", control_ref: "Art. 25", name: "Data protection by design", description: "Data protection measures are implemented by design and by default.", evidence_type: "configuration", severity: "high" },
  { id: "gdpr-art28", framework: "gdpr", control_ref: "Art. 28", name: "Processor contracts", description: "Processors are engaged under written contracts meeting the Art. 28 requirements.", evidence_type: "contract_artefact", severity: "critical" },
  { id: "gdpr-art30", framework: "gdpr", control_ref: "Art. 30", name: "Records of processing activities", description: "A record of processing activities (RoPA) is maintained and kept current.", evidence_type: "policy_document", severity: "high" },
  { id: "gdpr-art32", framework: "gdpr", control_ref: "Art. 32", name: "Security of processing", description: "Appropriate technical and organizational measures are implemented to ensure security of processing.", evidence_type: "configuration", severity: "critical" },
  { id: "gdpr-art33", framework: "gdpr", control_ref: "Art. 33", name: "Breach notification to supervisory authority", description: "Personal data breaches are notified to the supervisory authority within 72 hours.", evidence_type: "incident_log", severity: "critical" },
  { id: "gdpr-art35", framework: "gdpr", control_ref: "Art. 35", name: "Data protection impact assessment", description: "DPIAs are carried out for processing likely to result in high risk.", evidence_type: "risk_register", severity: "high" },

  // ─── HIPAA Security Rule — 45 CFR §164 ───────────────────────────
  { id: "hipaa-308-a1", framework: "hipaa", control_ref: "§164.308(a)(1)", name: "Security management process", description: "Policies and procedures to prevent, detect, contain, and correct security violations.", evidence_type: "policy_document", severity: "critical" },
  { id: "hipaa-308-a3", framework: "hipaa", control_ref: "§164.308(a)(3)", name: "Workforce security", description: "Policies to ensure members of the workforce have appropriate access to ePHI.", evidence_type: "access_log", severity: "high" },
  { id: "hipaa-308-a4", framework: "hipaa", control_ref: "§164.308(a)(4)", name: "Information access management", description: "Policies authorizing access to ePHI consistent with the Privacy Rule.", evidence_type: "access_log", severity: "critical" },
  { id: "hipaa-308-a5", framework: "hipaa", control_ref: "§164.308(a)(5)", name: "Security awareness and training", description: "Security awareness and training program for all members of the workforce.", evidence_type: "training_record", severity: "high" },
  { id: "hipaa-308-a6", framework: "hipaa", control_ref: "§164.308(a)(6)", name: "Security incident procedures", description: "Policies and procedures to address security incidents.", evidence_type: "incident_log", severity: "critical" },
  { id: "hipaa-308-a7", framework: "hipaa", control_ref: "§164.308(a)(7)", name: "Contingency plan", description: "Policies and procedures for responding to emergencies that damage ePHI systems.", evidence_type: "policy_document", severity: "high" },
  { id: "hipaa-308-b1", framework: "hipaa", control_ref: "§164.308(b)(1)", name: "Business associate contracts", description: "Satisfactory assurances (BAAs) from business associates that receive ePHI.", evidence_type: "contract_artefact", severity: "critical" },
  { id: "hipaa-310-a1", framework: "hipaa", control_ref: "§164.310(a)(1)", name: "Facility access controls", description: "Policies limiting physical access to systems and facilities housing ePHI.", evidence_type: "access_log", severity: "high" },
  { id: "hipaa-312-a1", framework: "hipaa", control_ref: "§164.312(a)(1)", name: "Access controls (technical)", description: "Technical policies and procedures to allow access only to authorized persons.", evidence_type: "configuration", severity: "critical" },
  { id: "hipaa-312-b", framework: "hipaa", control_ref: "§164.312(b)", name: "Audit controls", description: "Hardware, software, and procedural mechanisms that record and examine ePHI system activity.", evidence_type: "audit_log", severity: "high" },
  { id: "hipaa-312-c1", framework: "hipaa", control_ref: "§164.312(c)(1)", name: "Integrity of ePHI", description: "Policies and procedures to protect ePHI from improper alteration or destruction.", evidence_type: "configuration", severity: "critical" },
  { id: "hipaa-312-e1", framework: "hipaa", control_ref: "§164.312(e)(1)", name: "Transmission security", description: "Technical measures to guard against unauthorized access to ePHI in transit.", evidence_type: "configuration", severity: "critical" },

  // ─── DPDP Act 2023 (India) ───────────────────────────────────────
  { id: "dpdp-s5", framework: "dpdp", control_ref: "Sec. 5", name: "Notice to data principals", description: "A clear, itemized notice of processing is provided to the data principal before or at collection.", evidence_type: "policy_document", severity: "critical" },
  { id: "dpdp-s6", framework: "dpdp", control_ref: "Sec. 6", name: "Consent", description: "Consent is free, specific, informed, unconditional, and unambiguous; withdrawal is as easy as giving.", evidence_type: "policy_document", severity: "critical" },
  { id: "dpdp-s7", framework: "dpdp", control_ref: "Sec. 7", name: "Certain legitimate uses", description: "Processing under legitimate uses is documented and limited to the specified purposes.", evidence_type: "policy_document", severity: "high" },
  { id: "dpdp-s8", framework: "dpdp", control_ref: "Sec. 8", name: "Obligations of data fiduciary", description: "Data fiduciary ensures accuracy, completeness, and security of personal data.", evidence_type: "policy_document", severity: "high" },
  { id: "dpdp-s8-5", framework: "dpdp", control_ref: "Sec. 8(5)", name: "Reasonable security safeguards", description: "Reasonable security safeguards are implemented to prevent personal data breach.", evidence_type: "configuration", severity: "critical" },
  { id: "dpdp-s8-6", framework: "dpdp", control_ref: "Sec. 8(6)", name: "Breach notification", description: "Personal data breaches are notified to the Board and affected data principals.", evidence_type: "incident_log", severity: "critical" },
  { id: "dpdp-s9", framework: "dpdp", control_ref: "Sec. 9", name: "Children's data", description: "Processing of children's personal data follows the verifiable-parental-consent rule.", evidence_type: "policy_document", severity: "high" },
  { id: "dpdp-s10", framework: "dpdp", control_ref: "Sec. 10", name: "Significant data fiduciary obligations", description: "SDF-specific obligations (DPO, audits, DPIA) are met where the entity is classified as significant.", evidence_type: "risk_register", severity: "high" },
  { id: "dpdp-s11", framework: "dpdp", control_ref: "Sec. 11", name: "Right to access", description: "Procedures exist to respond to access requests from data principals.", evidence_type: "policy_document", severity: "high" },
  { id: "dpdp-s12", framework: "dpdp", control_ref: "Sec. 12", name: "Right to correction and erasure", description: "Procedures exist for correction, completion, updating, and erasure of personal data.", evidence_type: "policy_document", severity: "high" },
  { id: "dpdp-s16", framework: "dpdp", control_ref: "Sec. 16", name: "Cross-border transfer restrictions", description: "Transfers outside India comply with the restrictions notified by the Central Government.", evidence_type: "policy_document", severity: "high" },
  { id: "dpdp-s17", framework: "dpdp", control_ref: "Sec. 17", name: "Exemptions and applicability", description: "Reliance on any exemption (government, research, etc.) is documented and reviewed.", evidence_type: "policy_document", severity: "medium" },
]

export function signalsByFramework(framework: FrameworkId): Signal[] {
  return SIGNALS.filter((s) => s.framework === framework)
}

export function signalById(id: string): Signal | undefined {
  return SIGNALS.find((s) => s.id === id)
}

export const FRAMEWORK_LABELS: Record<FrameworkId, string> = {
  soc2: "SOC 2 (AICPA TSC)",
  iso27001: "ISO/IEC 27001:2022",
  gdpr: "GDPR (EU 2016/679)",
  hipaa: "HIPAA Security Rule (45 CFR §164)",
  dpdp: "DPDP Act 2023 (India)",
}
