import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'HIPAA Business Associate Agreement Guide (2025): Required Provisions, BAA Review Checklist, Covered Entity vs BA | BizLegal AI',
  description: 'Complete guide to HIPAA Business Associate Agreements (BAAs): who must sign a BAA, the 9 required BAA provisions under 45 C.F.R. §164.504(e), how to identify covered entities vs business associates, what SaaS vendors need to include in their BAA template, BAA review checklist, and OCR enforcement actions for missing or deficient BAAs.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/hipaa-business-associate-agreement-guide' },
  openGraph: {
    title: 'HIPAA Business Associate Agreement Guide (2025) — BizLegal AI',
    description: 'HIPAA BAA required provisions, covered entity vs business associate determination, SaaS vendor BAA template requirements, OCR enforcement patterns, and BAA review checklist for health tech companies.',
    url: 'https://bizlegal-ai.com/guides/hipaa-business-associate-agreement-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'Who is a "business associate" under HIPAA and when is a BAA legally required?',
    a: 'Under HIPAA\'s Privacy Rule (45 C.F.R. §160.103), a "business associate" is a person or entity that: (1) creates, receives, maintains, or transmits protected health information (PHI) on behalf of a covered entity; or (2) provides certain services to a covered entity that involve the disclosure of PHI. The BAA requirement was significantly expanded by the HITECH Act (2009) and the 2013 Omnibus Rule, which extended direct HIPAA obligations to business associates and their subcontractors. A BAA is legally required before a covered entity may disclose PHI to, or allow PHI to be accessed by, a business associate. Covered entities that disclose PHI to a business associate without a BAA in place have committed a HIPAA Privacy Rule violation — regardless of whether a breach actually occurs. Who is a covered entity: (a) healthcare providers that transmit health information electronically (hospitals, physician practices, pharmacies, labs, nursing homes); (b) health plans (health insurance companies, HMOs, Medicare/Medicaid programs, employer-sponsored health plans with 50+ participants); (c) healthcare clearinghouses (entities that process nonstandard health information into standard formats or vice versa). Who is a business associate: (a) cloud service providers that store or process PHI — including SaaS companies, EHR platforms, data analytics companies, and even IaaS providers (AWS, Azure, GCP) if they have access to PHI; (b) medical transcriptionists; (c) billing services; (d) benefits management companies; (e) claims processing companies; (f) practice management software vendors; (g) email and communication services that transmit PHI; (h) attorneys, accountants, and consultants that access PHI in the course of providing services; (i) patient engagement platforms, telemedicine vendors, remote patient monitoring companies; (j) data aggregators and health data companies. Who is NOT a business associate: (a) covered entities in their own right (a hospital does not need a BAA with another hospital for a treatment referral); (b) healthcare providers when their function is treatment, payment, or operations (not processing); (c) "conduits" — entities that transmit PHI but do not access it (the postal service, telephone companies, internet service providers that are merely transmission channels without access to content); (d) employees of covered entities (employees are not business associates, they are workforce members governed by internal policies); (e) covered entities sharing PHI with workforce members. The subcontractor rule: under the 2013 Omnibus Rule, business associates must enter into BAAs with their subcontractors who create, receive, maintain, or transmit PHI on the business associate\'s behalf. A SaaS company that is a business associate must execute BAAs with its own cloud providers, data processors, and sub-vendors that access PHI — even if the original covered entity is not a party to those downstream agreements. Failure to obtain a BAA from a subcontractor does not relieve the business associate of liability for the subcontractor\'s HIPAA violations.',
  },
  {
    q: 'What are the 9 required provisions that every HIPAA BAA must contain?',
    a: '45 C.F.R. §164.504(e)(2) specifies the minimum required content for a business associate agreement. An agreement that is missing any of these provisions is deficient and does not satisfy the HIPAA Privacy Rule. Required provision 1 — Permitted uses and disclosures: the BAA must specify the permitted and required uses and disclosures of PHI by the business associate. Permitted uses/disclosures must be limited to what is necessary to perform the service for which the business associate was engaged (minimum necessary standard). The covered entity may authorize the business associate to use PHI for the business associate\'s own management and administration or to carry out legal responsibilities, as long as the disclosures are required by law or the business associate obtains reasonable assurances regarding confidentiality. Required provision 2 — Restriction on further use/disclosure: the business associate may not use or disclose PHI in any manner that would violate the HIPAA Privacy Rule if done by the covered entity. Required provision 3 — Business associate will use appropriate safeguards: the business associate must implement appropriate safeguards (under the Security Rule, this means administrative, physical, and technical safeguards) to prevent unauthorized use or disclosure of PHI other than as provided for by the agreement. Required provision 4 — Reporting of unauthorized uses/disclosures and breaches: the business associate must report to the covered entity any use or disclosure of PHI not provided for by the agreement, including breaches of unsecured PHI as required by the Breach Notification Rule. The reporting obligation applies to suspected breaches — the business associate must report even before the investigation is complete if it has reasonable belief that a breach occurred. Timing: under the Breach Notification Rule (45 C.F.R. §164.410), business associates must notify covered entities without unreasonable delay and in no case later than 60 days after discovery of a breach. Most BAAs contractually require faster notification (24-72 hours is common and recommended). Required provision 5 — Disclosure to subcontractors: the business associate must ensure that any subcontractor it uses to create, receive, maintain, or transmit PHI on its behalf agrees to the same restrictions and conditions that apply to the business associate under the BAA (and executes a BAA with the subcontractor). Required provision 6 — Making PHI available to covered entity: the business associate must make PHI available to the covered entity as necessary to fulfill the covered entity\'s obligations under the Privacy Rule (e.g., to respond to a patient\'s access request under 45 C.F.R. §164.524). Required provision 7 — Access and amendment: the business associate must make PHI available for amendment and incorporate amendments as directed by the covered entity, to fulfill the covered entity\'s obligations under 45 C.F.R. §164.526 (individuals\' right to amend). Required provision 8 — Accounting of disclosures: the business associate must document disclosures and maintain information necessary for the covered entity to provide accounting of disclosures as required by 45 C.F.R. §164.528. Required provision 9 — Compliance with covered entity policies / termination: the business associate must comply with the covered entity\'s Privacy Rule restrictions. The BAA must authorize termination by the covered entity if the covered entity determines the business associate has violated a material term of the BAA. Upon termination, the BAA must address how PHI is returned or destroyed by the business associate. HHS model BAA language is available on the HHS website — use this as the baseline and customize, rather than drafting from scratch.',
  },
  {
    q: 'What OCR enforcement actions have targeted missing or deficient BAAs, and what penalties apply?',
    a: 'The HHS Office for Civil Rights (OCR) has a consistent enforcement pattern: the absence of a BAA, or a materially deficient BAA, is often the first violation OCR identifies in a breach investigation, and it triggers separate civil monetary penalties regardless of whether the breach itself was preventable. Civil monetary penalty structure under HIPAA (as amended by HITECH, 45 C.F.R. §160.404): Violations are categorized by culpability — (a) did not know: $100-$50,000 per violation, annual cap $25,000; (b) reasonable cause: $1,000-$50,000 per violation, annual cap $100,000; (c) willful neglect, corrected: $10,000-$50,000 per violation, annual cap $250,000; (d) willful neglect, not corrected: $50,000 per violation, annual cap $1.5 million. The "same type of violation" annual cap applies per violation category, not in aggregate — OCR has imposed penalties of multiple $1.5M maximums where violations fell into multiple categories. Significant OCR enforcement actions involving BAA violations: (1) Oregon Health & Science University (OHSU), 2016: $2.7M settlement. OHSU used Google\'s Gmail without executing a BAA with Google. PHI of 3,000+ patients was stored in Google Drive and Gmail without a BAA in place. OCR also found the lack of encryption on mobile devices. Key lesson: cloud storage (including consumer cloud services like Google Drive, Dropbox) used for PHI requires a BAA. (2) Catholic Health Care Services, 2016: $650,000 settlement. HIPAA BAA missing from agreement with entity that had access to PHI. OCR found no safeguards to protect 412 individuals\' PHI on a stolen device. (3) North Memorial Health Care, 2016: $1.55M settlement. An unencrypted laptop was stolen from a business associate. OCR found no BAA was in place with the business associate before PHI was disclosed. (4) Anthem Inc., 2018: $16M settlement (largest in HIPAA history at the time). While primarily a Security Rule case, OCR found insufficient safeguards and noted that Anthem had relationships with business associates without adequate BAA oversight. (5) Premera Blue Cross, 2019: $6.85M settlement. Insufficient safeguards for PHI held by business associates. (6) OCR Enforcement Spotlight — SaaS vendors: in 2024, OCR increased enforcement against SaaS companies that serve the healthcare industry without proper BAAs. Cloud-based EHR vendors, telehealth platforms, and digital health apps are OCR enforcement priorities. What "willful neglect" looks like in OCR enforcement: OCR has found willful neglect where a covered entity or business associate was aware of the BAA requirement but chose not to execute one (knowingly using a vendor for PHI processing without a BAA), where a covered entity ignored its own workforce\'s identification of a missing BAA, and where a business associate provided PHI-handling services to covered entities without developing a standard BAA.',
  },
  {
    q: 'What should a SaaS vendor\'s standard HIPAA BAA template include beyond the minimum required provisions?',
    a: 'Many SaaS companies use a form BAA (often posted publicly and signed by a covered entity without negotiation). A well-drafted SaaS BAA must include the 9 minimum required provisions PLUS additional provisions that protect the SaaS vendor from liability for covered entity conduct, clarify the scope of PHI processing, and address practical issues that arise in cloud service relationships. Beyond-the-minimum provisions for a SaaS vendor BAA: (1) Covered entity representations and warranties: the covered entity represents that it is in fact a covered entity or business associate (whichever applies), and that it will only transmit to the SaaS vendor PHI that the covered entity is authorized to process. This provision shifts liability to the covered entity if it sends PHI to the vendor beyond what is authorized. (2) Prohibited uses by covered entity: the covered entity may not use the SaaS platform to process categories of PHI that the BAA does not contemplate — for example, the BAA might exclude HIV/AIDS status records, genetic information, or substance abuse treatment records if the SaaS vendor\'s platform is not designed to handle these categories (which have heightened regulatory requirements under 42 C.F.R. Part 2 for substance abuse records and state-specific additional protections). (3) Breach notification timeline and procedure: the BAA should specify a 24-72 hour notification timeline (faster than the 60-day regulatory minimum), what information must be included in the initial notification, and the process for supplementing the notification as investigation develops. A forensic report timeline should be specified. (4) Limitation of liability: SaaS vendors should include a limitation of liability clause that caps damages at the lesser of direct damages and 12 months of fees paid. Note: limitation of liability clauses in BAAs are enforceable under contract law, but do not limit OCR\'s ability to impose civil monetary penalties — the contractual cap only governs the covered entity\'s breach of contract claim against the SaaS vendor. (5) PHI return and destruction procedures: specify the format in which PHI will be returned on termination (e.g., CSV export within 30 days), the timeline for destruction of remaining copies (within 60 days of return confirmation), and the certification of destruction to be provided. Cloud backup retention windows must be addressed (some backup systems retain data for 30-90 days after deletion). (6) Security incident response: beyond breach notification, specify the process for security incidents that may not meet the breach threshold — how the business associate will investigate and determine whether the incident constitutes a breach. (7) Right to audit: covered entities should insist on audit rights (access to policies, procedures, and evidence of Security Rule compliance). SaaS vendors often limit audits to review of SOC 2 Type II reports in lieu of direct audits. If you accept a SOC 2 report in lieu of audit: ensure it covers HIPAA-relevant controls, is no older than 12 months, and that the covered entity has the right to receive updated reports annually. (8) HITECH enhancements: the 2013 Omnibus Rule requires that BAAs include provisions addressing the HITECH Act requirements, including individual rights to restrict disclosures to health plans for certain self-pay services. Most form BAAs include this but verify it is present. (9) Subcontractor list disclosure: SaaS vendors should disclose their sub-processors that will access PHI (analogous to GDPR Article 28). This allows the covered entity to assess the vendor\'s subcontractor chain.',
  },
  {
    q: 'How do cloud service providers like AWS, Azure, and Google Cloud fit into the BAA framework for SaaS companies?',
    a: 'Cloud infrastructure providers (AWS, Azure, Google Cloud Platform, and others) that store or process PHI are business associates — they must execute BAAs with covered entities and with business associates that use their services to process PHI. The major cloud providers all offer HIPAA-eligible services and BAAs. Important nuance: a BAA with AWS/Azure/GCP does not make your entire cloud environment HIPAA-compliant. It makes specific eligible services available for PHI processing under the BAA — and your organization remains responsible for configuring those services securely. AWS HIPAA: AWS offers a standard BAA (available at aws.amazon.com/compliance/hipaa-eligible-services-reference/). Not all AWS services are HIPAA eligible — only those on the "HIPAA Eligible Services" list are covered by the AWS BAA. As of 2024, 170+ AWS services are HIPAA eligible. Key eligible services include EC2, S3, RDS, Lambda, and many more. Services NOT on the eligible list cannot be used with PHI under the AWS BAA. AWS BAA execution: the AWS BAA is signed through the AWS Management Console, under "AWS Artifact." Azure HIPAA: Microsoft Azure also offers a BAA (the "Microsoft Online Services BAA") covering HIPAA-eligible services. The Business Associate Agreement is automatically included in the Microsoft Product Terms for covered online services. Azure services that are HIPAA eligible are listed in the Microsoft Service Trust Portal. Google Cloud HIPAA: Google Cloud Platform offers a BAA that covers a defined set of Google Cloud services. Google Workspace can also be configured for HIPAA compliance under a separate BAA — but not all Google Workspace features are HIPAA eligible (for example, Google Chat and certain Google Meet features may have limitations). What a SaaS vendor must do after signing a cloud provider BAA: (1) configure your cloud environment to only use HIPAA-eligible services for PHI processing; (2) enable appropriate logging and monitoring on those services; (3) encrypt PHI at rest and in transit; (4) implement access controls consistent with the Security Rule; (5) review and update your BAA with the cloud provider when you add new services that will process PHI (the cloud provider\'s BAA covers the list of eligible services, not new services automatically); (6) reflect the cloud provider as a subcontractor in your BAAs with covered entities; (7) if a breach occurs due to the cloud provider\'s infrastructure, you as the business associate remain responsible for breach notification to the covered entity even if the root cause was the cloud provider\'s fault — your contractual rights against the cloud provider for indemnification are separate from your regulatory obligations. Multi-cloud considerations: if your SaaS uses multiple cloud providers, each must execute a separate BAA and be configured separately for HIPAA compliance. A BAA with AWS does not extend to Azure infrastructure.',
  },
  {
    q: 'What is the BAA review checklist for covered entities evaluating a vendor\'s proposed BAA?',
    a: 'When a covered entity (hospital, health plan, or healthcare provider) receives a BAA from a vendor for review, legal review should assess each of the following elements. Substantive provisions checklist: (1) Permitted uses and disclosures: are the permitted uses and disclosures clearly and specifically defined? Do they limit the business associate to the minimum necessary for the service? Does the BAA explicitly prohibit uses beyond the defined purposes? (2) Prohibited uses: does the BAA prohibit the business associate from using PHI for its own commercial purposes, marketing, or purposes beyond the agreement? Does it prohibit disclosure to third parties beyond defined subcontractors? (3) Security safeguards: does the BAA require the business associate to implement "appropriate safeguards" and explicitly reference the Security Rule? Does it require administrative, physical, and technical safeguards? Does it reference encryption specifically? (4) Breach notification: does the BAA require breach notification? Is the notification timeline faster than the 60-day regulatory minimum (24-72 hours is preferable for operational reasons)? Does it specify what must be included in the notification? (5) Subcontractor obligations: does the BAA require the business associate to enter BAAs with its own subcontractors? Does it require the business associate to disclose its subcontractors? (6) Return or destruction of PHI: does the BAA require return or destruction of PHI upon termination? Does it specify a timeline and a certification of destruction requirement? (7) Audit rights: does the covered entity have the right to audit the business associate\'s compliance? Or is audit limited to review of the business associate\'s SOC 2 report or equivalent? What is the SOC 2 report type and recency requirement? (8) Termination rights: does the covered entity have the right to terminate if the business associate materially breaches the BAA? Is this right exercisable immediately upon breach or after a cure period? For material breaches of the Privacy Rule, OCR guidance suggests termination should be exercisable without a lengthy cure period. (9) OCR cooperation: does the BAA require the business associate to cooperate with OCR audits and investigations? (10) Limitation of liability: if the BAA includes a limitation of liability clause, what is the cap? Is it adequate relative to the volume of PHI processed and the potential harm? Procedure checklist: (a) identify the correct signatories (must be authorized legal representatives of both parties); (b) retain an executed copy with the original signatures; (c) maintain in your BAA register with expiration date and renewal tracking; (d) calendar reminder for annual review and renewal; (e) ensure the BAA is effective before any PHI is disclosed to the vendor (cannot be retroactive under HIPAA — must pre-date first disclosure). Common BAA red flags: (a) BAA that covers only "inadvertent access" — a BAA must cover intentional access and processing, not just inadvertent exposure; (b) BAA that does not include a breach notification requirement — this is a required provision and its absence makes the BAA deficient; (c) BAA that limits the business associate\'s indemnification for breaches to its "data security program" or "reasonable efforts" without a meaningful standard; (d) "Privacy Act" language only, without specific HIPAA provisions; (e) BAA executed only by business associate but not signed by covered entity — must be executed by both parties; (f) outdated BAA that does not reflect 2013 Omnibus Rule changes (BAA predating 2013 must be updated).',
  },
]

export default function HIPAABAAGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'HIPAA Business Associate Agreement Guide (2025): Required Provisions, BAA Review Checklist, Covered Entity vs BA',
    description: 'Complete guide to HIPAA BAAs: who must sign, 9 required provisions, OCR enforcement actions, SaaS vendor BAA template requirements, cloud provider BAA coverage, and BAA review checklist.',
    url: 'https://bizlegal-ai.com/guides/hipaa-business-associate-agreement-guide',
    publisher: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    author: { '@type': 'Organization', name: 'BizLegal AI' },
    inLanguage: 'en-US',
    datePublished: '2026-01-01',
    dateModified: '2026-07-22',
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://bizlegal-ai.com/guides' },
      { '@type': 'ListItem', position: 3, name: 'HIPAA BAA Guide', item: 'https://bizlegal-ai.com/guides/hipaa-business-associate-agreement-guide' },
    ],
  }

  const BAA_PROVISIONS = [
    { provision: 'Permitted uses and disclosures', regulation: '45 C.F.R. §164.504(e)(2)(i)', required: true, notes: 'Must be limited to the minimum necessary for the service' },
    { provision: 'Restriction on further use/disclosure', regulation: '45 C.F.R. §164.504(e)(2)(ii)(A)', required: true, notes: 'Must not violate Privacy Rule if performed by covered entity' },
    { provision: 'Appropriate safeguards implementation', regulation: '45 C.F.R. §164.504(e)(2)(ii)(B)', required: true, notes: 'Must reference the Security Rule explicitly' },
    { provision: 'Breach and unauthorized use reporting', regulation: '45 C.F.R. §164.504(e)(2)(ii)(C)', required: true, notes: 'Must cover security incidents and breaches per Breach Notification Rule' },
    { provision: 'Subcontractor BAA requirement', regulation: '45 C.F.R. §164.504(e)(2)(ii)(D)', required: true, notes: 'Must require downstream BAAs before PHI disclosure to subcontractors' },
    { provision: 'PHI availability to covered entity', regulation: '45 C.F.R. §164.504(e)(2)(ii)(E)', required: true, notes: 'Must allow covered entity to fulfill patient access obligations (§164.524)' },
    { provision: 'Availability for amendment', regulation: '45 C.F.R. §164.504(e)(2)(ii)(F)', required: true, notes: 'Must incorporate amendments directed by covered entity (§164.526)' },
    { provision: 'Accounting of disclosures documentation', regulation: '45 C.F.R. §164.504(e)(2)(ii)(G)', required: true, notes: 'Must maintain records for accounting under §164.528' },
    { provision: 'Termination right for material breach', regulation: '45 C.F.R. §164.504(e)(2)(iii)', required: true, notes: 'Covered entity must be able to terminate if BA materially breaches' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        <nav style={{ fontSize: '0.8rem', opacity: 0.55, marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'inherit' }}>Home</a>
          {' → '}
          <a href="/guides" style={{ color: 'inherit' }}>Guides</a>
          {' → '}
          HIPAA Business Associate Agreement Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          HIPAA Compliance
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          HIPAA Business Associate Agreement Guide (2025): 9 Required Provisions, SaaS Vendor Templates, Cloud Provider BAAs, and OCR Enforcement
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          A missing or deficient HIPAA Business Associate Agreement (BAA) is one of the most common HIPAA violations — and one of the most expensive. OCR has imposed penalties ranging from $650,000 to $16 million specifically for BAA failures. Every SaaS company that touches protected health information (PHI) must execute a BAA before receiving that data. Every covered entity must have executed BAAs with all vendors who access PHI — including their cloud providers. This guide covers what must be in a BAA, who must sign one, and what a review checklist looks like in practice.
        </p>

        <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '2.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.7 }}>
            <strong>OCR enforcement note:</strong> Oregon Health & Science University paid $2.7M after using Google Gmail and Drive for PHI without executing a BAA with Google. A BAA is required before any PHI is disclosed — not after a breach is discovered.
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>9 Required BAA Provisions (45 C.F.R. §164.504(e)(2))</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Provision</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Regulation</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {BAA_PROVISIONS.map(({ provision, regulation, notes }) => (
                  <tr key={provision} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: '0.8rem', verticalAlign: 'top' }}>{provision}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.7, fontSize: '0.75rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{regulation}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, fontSize: '0.76rem', verticalAlign: 'top' }}>{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your HIPAA Business Associate Agreement</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your Business Associate Agreement or vendor agreement for HIPAA analysis. BizLegal AI identifies whether all 9 required BAA provisions are present, whether breach notification timelines meet regulatory and operational requirements, whether PHI return or destruction on termination is addressed, whether subcontractor obligations are included, and whether the BAA reflects the 2013 Omnibus Rule updates (agreements predating 2013 are deficient under current law).
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your BAA →
          </a>
        </div>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem' }}>Frequently Asked Questions</h2>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: i < FAQS.length - 1 ? '1px solid var(--color-border, #e5e7eb)' : 'none' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.4 }}>{faq.q}</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.75, opacity: 0.85, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </section>

        <div style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '2rem', marginTop: '2rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1rem' }}>Related compliance resources</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link href="/guides/hipaa-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>HIPAA Compliance Checklist →</Link>
            <Link href="/guides/gdpr-data-processing-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR DPA Guide →</Link>
            <Link href="/guides/data-breach-response-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Data Breach Response Guide →</Link>
            <Link href="/guides/data-retention-deletion-policy-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Data Retention Policy Guide →</Link>
            <Link href="/guides/saas-vendor-agreement-review-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SaaS Vendor Agreement Review →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. HIPAA BAA requirements, OCR enforcement priorities, and the scope of the Security Rule technical safeguard requirements are subject to regulatory guidance and state law variations. HIPAA compliance determinations depend on the specific facts of each covered entity or business associate relationship. Consult qualified legal counsel and a certified HIPAA compliance officer before finalizing any Business Associate Agreement.
          </p>
        </footer>

      </main>
    </>
  )
}
