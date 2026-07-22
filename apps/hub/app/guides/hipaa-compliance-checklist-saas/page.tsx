import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'HIPAA Compliance Checklist for Healthcare SaaS (2025) | BizLegal AI',
  description: 'Practical HIPAA compliance guide for health-tech startups and SaaS vendors. Covers the three HIPAA rules, Business Associate Agreements, technical safeguards, breach notification timelines, and the 2024 HIPAA Safe Harbor for cybersecurity.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/hipaa-compliance-checklist-saas' },
  openGraph: {
    title: 'HIPAA Compliance Checklist for Healthcare SaaS (2025) — BizLegal AI',
    description: 'The Privacy Rule, Security Rule, and Breach Notification Rule explained for SaaS vendors. BAA requirements, ePHI technical safeguards, and HHS OCR enforcement framework.',
    url: 'https://bizlegal-ai.com/guides/hipaa-compliance-checklist-saas',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'Does HIPAA apply to my SaaS company if I\'m not a healthcare provider?',
    a: 'Yes, if your SaaS product creates, receives, maintains, or transmits Protected Health Information (PHI) on behalf of a covered entity (hospital, clinic, health insurer, or healthcare clearinghouse). Any vendor in that position is a Business Associate under HIPAA and must execute a Business Associate Agreement (BAA) with the covered entity before handling PHI. This applies broadly: EHR integrations, patient data analytics platforms, healthcare AI systems, clinical documentation tools, revenue cycle management software, telehealth infrastructure, and any healthcare SaaS that touches identifiable patient data.',
  },
  {
    q: 'What is a Business Associate Agreement (BAA) and is it legally required?',
    a: 'A BAA is a written contract required by HIPAA before any covered entity shares PHI with a Business Associate. Without a BAA, the disclosure of PHI to the vendor is itself a HIPAA violation — before any breach occurs. The BAA must specify: permitted and required uses and disclosures of PHI; require the BA to implement appropriate safeguards; require the BA to report security incidents and breaches; allow the covered entity to terminate the agreement if the BA violates it; require the BA to return or destroy PHI at termination; and ensure downstream subcontractors (sub-BAs) also have BAAs. Major cloud providers (AWS, Google Cloud, Azure) offer HIPAA BAAs for eligible services. Signing the BAA is necessary but insufficient — your environment must also be configured to meet technical safeguard requirements.',
  },
  {
    q: 'What does HIPAA\'s Security Rule require for ePHI systems?',
    a: 'The Security Rule requires three categories of safeguards for electronic PHI (ePHI). Administrative safeguards include a designated Privacy/Security Officer, annual workforce training, documented policies and procedures, access management processes, and a contingency plan (backup and recovery). Physical safeguards include facility access controls, workstation use policies, device and media controls (including destruction of media before disposal), and audit logs of physical access to servers. Technical safeguards include unique user identification (no shared logins for ePHI systems), automatic logoff after inactivity, encryption and decryption of ePHI, audit logging of all ePHI access, and integrity controls to detect unauthorized ePHI alteration. Some controls are "required" (non-negotiable) while others are "addressable" — meaning you must implement them or document a reasonable alternative. Encryption is addressable, but HHS has clarified that failing to encrypt ePHI and having a breach removes the ability to claim breach safe harbor (encrypted data is not reportable under Breach Notification Rule).',
  },
  {
    q: 'What is the HIPAA breach notification timeline?',
    a: 'HIPAA\'s Breach Notification Rule (from HITECH 2009) requires: (1) Individual notification: notify affected individuals within 60 days of discovering the breach. Notification must include a description of what happened, what PHI was involved, steps individuals should take to protect themselves, what the covered entity is doing to investigate and mitigate, and contact information. (2) HHS notification: breaches affecting 500+ individuals must be reported to HHS simultaneously with individual notification. HHS publishes these on the public Breach Portal within 60 days — the "Wall of Shame." Breaches affecting fewer than 500 individuals must be reported to HHS annually. (3) Media notification: breaches affecting 500+ individuals in a single state or jurisdiction require notification to prominent media outlets in that state. The 60-day clock starts when the covered entity discovers the breach — or when it should have known with reasonable diligence.',
  },
  {
    q: 'What is the 2024 HIPAA Safe Harbor for cybersecurity and how does it reduce penalties?',
    a: 'The HITECH Act was amended in 2021 to add a cybersecurity Safe Harbor provision. Under 42 U.S.C. § 17931, HHS must consider whether an organization has implemented a recognized cybersecurity framework in the 12 months before the breach when determining penalty amount. Recognized frameworks include: NIST Cybersecurity Framework (CSF), NIST SP 800-66 (HIPAA-specific guidance), Center for Internet Security Controls (CIS Controls), ISO 27001, and Health Information Trust Alliance Common Security Framework (HITRUST CSF). The Safe Harbor does not provide immunity — it creates a mandatory consideration that can reduce penalties. Organizations with documented, mature cybersecurity frameworks in place before a breach have seen OCR settlements reduced significantly compared to similar breach sizes without such frameworks. Practical implication: implement SOC 2 Type II or ISO 27001 controls alongside your HIPAA programme — the overlapping controls satisfy both frameworks and give you Safe Harbor documentation.',
  },
  {
    q: 'What are the most common HIPAA violations in SaaS companies and how are they caught?',
    a: 'The most common HIPAA violations in technology companies are: (1) Missing or incomplete BAAs — sharing PHI with a vendor before a BAA is signed. Caught via: OCR audits, breach investigations revealing upstream data sharing. (2) Inadequate risk analysis — failing to conduct or document an annual formal risk analysis. OCR consistently lists this as the #1 deficiency in audits. (3) Unauthorized PHI access — employees accessing PHI without a business need (curiosity snooping). Caught via: audit log review, whistleblower complaints. (4) PHI in unencrypted devices — laptops, USB drives, mobile devices without encryption. Caught via: theft or loss of device → mandatory breach notification. (5) Insufficient breach notification — failing to notify HHS/individuals within 60 days, or failing to notify at all. OCR investigates all breach reports and many complaints. (6) Missing or inadequate policies — no written privacy/security policies, no workforce training records. Caught via: OCR desk audits (random selection), breach investigations that expand into compliance audits.',
  },
]

export default function HIPAAGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'HIPAA Compliance Checklist for Healthcare SaaS (2025)',
    description: 'HIPAA Privacy Rule, Security Rule, and Breach Notification Rule — practical compliance guide for health-tech SaaS vendors, digital health startups, and covered entities.',
    url: 'https://bizlegal-ai.com/guides/hipaa-compliance-checklist-saas',
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
      { '@type': 'ListItem', position: 3, name: 'HIPAA Compliance Checklist', item: 'https://bizlegal-ai.com/guides/hipaa-compliance-checklist-saas' },
    ],
  }

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
          HIPAA Compliance
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Healthcare Data Privacy
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          HIPAA Compliance Checklist for Healthcare SaaS (2025)
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          If your SaaS product touches healthcare data, HIPAA applies — regardless of whether you're a hospital or a startup. This guide covers what the three HIPAA rules require of health-tech vendors, what a Business Associate Agreement must include, the specific technical safeguards auditors look for, and how the 2024 HIPAA Safe Harbor reduces your exposure.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Who HIPAA Covers: Covered Entities and Business Associates</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            HIPAA creates two categories of regulated entity. <strong>Covered Entities</strong> are the traditional healthcare actors: healthcare providers who transmit health information electronically (hospitals, physician practices, pharmacies, clinical labs), health plans (commercial insurers, HMOs, Medicare/Medicaid), and healthcare clearinghouses. Covered Entities bear direct HIPAA obligations and are the primary enforcement targets.
          </p>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            <strong>Business Associates</strong> are every vendor, contractor, and technology provider that creates, receives, maintains, or transmits Protected Health Information (PHI) on behalf of a covered entity. HITECH 2009 extended direct HIPAA liability to Business Associates — so a BA can be directly penalized by HHS OCR even without a covered entity complaint. This is where most health-tech companies sit.
          </p>
          <p style={{ lineHeight: 1.75 }}>
            A Business Associate relationship exists whenever PHI flows to a third party to perform a function for the covered entity. This includes: EHR software vendors, cloud storage providers storing patient records, analytics platforms processing patient outcomes, billing and revenue cycle platforms, telehealth infrastructure providers, clinical decision support tools, healthcare AI companies, and patient engagement platforms. Importantly, subcontractors of Business Associates (sub-BAs) also carry direct HIPAA liability under HITECH.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>The Three HIPAA Rules: What Each Requires</h2>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', marginTop: '1.5rem' }}>1. The Privacy Rule (effective April 2003)</h3>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            The Privacy Rule defines Protected Health Information as individually identifiable health information in any form — paper, electronic, or oral — that relates to past, present, or future physical or mental health; the provision of healthcare; or payment for healthcare. It specifies 18 categories of PHI identifiers (name, address, dates, phone, email, SSN, medical record numbers, biometrics, and more) that make health data "identified."
          </p>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            The Privacy Rule's core obligations: the minimum necessary standard (use or disclose only the minimum PHI needed for the stated purpose); patient rights (access to their records within 30 days, right to an accounting of disclosures, right to request amendments); and designated Privacy Official (a specific person responsible for developing and implementing privacy policies).
          </p>
          <p style={{ lineHeight: 1.75 }}>
            For Business Associates: the Privacy Rule governs what you can do with PHI. Permitted uses and disclosures are defined in your BAA. You cannot use PHI for any purpose not expressly permitted by the BAA or required by law — including using de-identified patient data to train AI models without explicit authorization.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', marginTop: '1.5rem' }}>2. The Security Rule (effective April 2005)</h3>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            The Security Rule applies specifically to electronic PHI (ePHI) and requires Administrative, Physical, and Technical safeguards. Unlike the Privacy Rule (which governs all PHI), the Security Rule covers only ePHI — any PHI created, received, maintained, or transmitted in electronic form.
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Safeguard Category</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Key Required Controls</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Common Gap</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Administrative', 'Security Officer designation, workforce training, risk analysis, access management, contingency plan', 'Missing or undocumented annual risk analysis'],
                  ['Physical', 'Facility access controls, workstation use policy, device/media controls, audit logs for physical access', 'Untracked employee devices with ePHI access; no MDM'],
                  ['Technical', 'Unique user IDs, auto-logoff, encryption, audit logging, integrity controls', 'Shared admin accounts; no audit logging on ePHI DB; missing encryption at rest'],
                ].map(([category, controls, gap]) => (
                  <tr key={category} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{category}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8, lineHeight: 1.6 }}>{controls}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.75, lineHeight: 1.6, color: '#dc2626' }}>{gap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', marginTop: '1.5rem' }}>3. The Breach Notification Rule (effective February 2010)</h3>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            A breach is the acquisition, access, use, or disclosure of unsecured PHI not permitted by the Privacy Rule, unless the covered entity or BA can demonstrate a low probability of compromise through a 4-factor risk assessment: (1) nature and extent of the PHI involved; (2) who impermissibly used or accessed the PHI; (3) whether PHI was actually acquired or viewed; (4) extent to which risk has been mitigated.
          </p>
          <p style={{ lineHeight: 1.75 }}>
            Critically: <strong>encrypted PHI is not reportable</strong>. If data is encrypted using NIST-approved encryption (AES-128/256 for data at rest; TLS 1.2+ for data in transit) and the decryption key was not compromised, a breach involving that data does not trigger notification requirements. This makes encryption implementation an existential priority for HIPAA compliance — not just a best practice.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Business Associate Agreements: The HIPAA Checklist Every Vendor Needs</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            The BAA is not optional. Every covered entity must have a signed BAA in place before sharing PHI with a Business Associate. As a BA, you cannot accept or process PHI from a covered entity without executing a BAA first — doing so is itself a HIPAA violation.
          </p>
          <p style={{ lineHeight: 1.75, marginBottom: '0.75rem' }}>A legally compliant BAA must include:</p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li>Description of permitted uses and disclosures of PHI — must be specific, not catch-all</li>
            <li>Requirement for BA to implement appropriate safeguards to protect the PHI</li>
            <li>Requirement for BA to report security incidents (including successful or unsuccessful unauthorized accesses) to the covered entity</li>
            <li>Requirement for BA to report breaches under the Breach Notification Rule within 60 days of discovery</li>
            <li>Requirement for BA to ensure subcontractors also sign BAAs before receiving PHI</li>
            <li>Right for covered entity to terminate the BAA if BA violates a material term</li>
            <li>Requirement for BA to return or destroy all PHI at contract termination (or justify why retention is necessary)</li>
            <li>Compliance with the Privacy Rule's minimum necessary standard when using or disclosing PHI</li>
          </ul>
          <p style={{ lineHeight: 1.75, marginTop: '1rem', padding: '1rem', background: 'var(--color-bg-secondary, #f9fafb)', borderRadius: '8px', borderLeft: '3px solid #dc2626' }}>
            <strong>Common BAA mistake:</strong> using template BAA language that permits "any use necessary to perform the services." OCR has found such broad language to be non-compliant. Permitted uses must be specific to the functions the BA performs. Have your BAAs reviewed before signing — a deficient BAA is a liability for both parties.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>HIPAA Technical Safeguards: The Implementation Checklist</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            The following controls are the most commonly cited deficiencies in HHS OCR audits of SaaS companies and cloud providers:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li><strong>Unique user IDs:</strong> No shared accounts for ePHI systems. Every employee or system accessing ePHI must have a unique, individual account. Required (not addressable).</li>
            <li><strong>Automatic logoff:</strong> Sessions must automatically terminate after a defined period of inactivity. Typical thresholds: 15 minutes for clinical workstations, 30 minutes for administrative systems. Addressable — implement or document why alternative is equivalent.</li>
            <li><strong>Encryption of ePHI in transit:</strong> TLS 1.2 minimum; TLS 1.3 recommended. All API endpoints handling PHI must enforce encrypted transport. Non-encrypted transmission of PHI is a breach trigger. Required via Safe Harbor logic.</li>
            <li><strong>Encryption of ePHI at rest:</strong> AES-128 or AES-256 for databases, file storage, and backups containing PHI. Addressable — but failure to encrypt is the single largest predictor of breach penalty magnitude.</li>
            <li><strong>Audit logs:</strong> Maintain logs of all ePHI access, modification, and deletion. Logs must be retained for a minimum of 6 years (HIPAA documentation retention standard). Logs must be tamper-evident and protected from unauthorized modification. Required.</li>
            <li><strong>Integrity controls:</strong> Mechanisms to detect unauthorized alteration or destruction of ePHI. Addressable. In practice: checksums, hash verification, database audit trails.</li>
            <li><strong>Access control:</strong> Role-based access based on minimum necessary principle. No broader access than required to perform the BA function. Required.</li>
            <li><strong>Contingency plan:</strong> Data backup procedures; disaster recovery plan; emergency mode operation plan; testing and revision procedures. Required. AWS/Azure/GCP shared responsibility means you still own the application-layer backup.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>The 2024 HIPAA Safe Harbor: How Cybersecurity Frameworks Reduce Penalties</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            The HITECH Act Safe Harbor provision (42 U.S.C. § 17931, effective January 2021, clarified by HHS 2024 guidance) requires HHS to consider recognized security practices in penalty calculations and investigation decisions for covered entities and BAs that have implemented a recognized cybersecurity framework in the 12 months preceding a breach.
          </p>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Recognized frameworks under the Safe Harbor: NIST Cybersecurity Framework (CSF) 2.0, NIST SP 800-66 Rev. 2 (HIPAA-specific implementation guide), CIS Controls v8, ISO/IEC 27001:2022, and HITRUST CSF. The framework must be actively implemented — not just documented. HHS looks at: policies and procedures implementing the framework; evidence of training and workforce awareness; audit logs demonstrating operational controls; and documentation of the framework implementation start date (must predate the breach by 12+ months).
          </p>
          <p style={{ lineHeight: 1.75 }}>
            Practical implication: if your company already has SOC 2 Type II or ISO 27001, the overlapping controls directly support HIPAA Safe Harbor. Document the correspondence explicitly (NIST CSF controls → HIPAA Technical Safeguards → SOC 2 CC6) so that in any OCR investigation, you can immediately demonstrate Safe Harbor eligibility.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>HIPAA Risk Analysis: The Foundation of Every Compliance Programme</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            The Security Rule requires an accurate and thorough risk analysis as the cornerstone of any HIPAA security programme. OCR consistently identifies missing or inadequate risk analysis as the #1 violation in investigations — it's the compliance failure that transforms an incident into a multimillion-dollar settlement.
          </p>
          <p style={{ lineHeight: 1.75, marginBottom: '0.75rem' }}>A HIPAA-compliant risk analysis must:</p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li>Identify all ePHI your organization creates, receives, maintains, or transmits — including in cloud storage, backups, test environments, and third-party integrations</li>
            <li>Identify and document all reasonably anticipated threats to ePHI</li>
            <li>Assess the likelihood and impact of each threat (typically on a qualitative or semi-quantitative scale)</li>
            <li>Evaluate current controls and their adequacy to address each threat</li>
            <li>Document the risk analysis process and findings</li>
            <li>Implement security measures to reduce identified risks to a reasonable and appropriate level</li>
            <li>Review and update the analysis in response to environmental or operational changes, and at a minimum annually</li>
          </ul>
          <p style={{ lineHeight: 1.75, marginTop: '1rem' }}>
            The risk analysis must be documented — an undocumented mental exercise is not compliant. HHS provides a Security Risk Assessment (SRA) Tool at healthit.gov/topic/privacy-security-and-hipaa/security-risk-assessment-tool that guides smaller organizations through the process.
          </p>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #dc262608, #dc262614)', border: '1px solid #dc262630', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>BAA Review — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Get Your Business Associate Agreement Reviewed in 60 Seconds</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your BAA or vendor agreement. BizLegal AI scans for HIPAA compliance gaps — missing permitted uses, insufficient breach notification terms, inadequate subcontractor BAA provisions, and overbroad PHI use clauses — and flags every deficient clause with a risk rating and fix recommendation.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#dc2626', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your BAA for HIPAA Gaps →
          </a>
        </div>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>HIPAA Penalties: The Four-Tier Structure</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Tier</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Culpability</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Per Violation</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Annual Cap / Category</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1', 'Did not know (and could not have known)', '$100–$50,000', '$25,000'],
                  ['2', 'Reasonable cause (not willful neglect)', '$1,000–$50,000', '$100,000'],
                  ['3', 'Willful neglect — corrected within 30 days', '$10,000–$50,000', '$250,000'],
                  ['4', 'Willful neglect — not corrected', '$50,000', '$1,900,000'],
                ].map(([tier, culpability, perViolation, annualCap]) => (
                  <tr key={tier} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>Tier {tier}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8 }}>{culpability}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{perViolation}</td>
                    <td style={{ padding: '10px 12px', color: '#dc2626', fontWeight: 600 }}>{annualCap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ lineHeight: 1.75, fontSize: '0.9rem', opacity: 0.7 }}>
            Civil monetary penalties are assessed per violation category per calendar year. OCR may impose penalties for multiple violation categories simultaneously. The 2024 Safe Harbor can reduce penalties across all tiers. Criminal referrals to DOJ for knowing violations can result in fines up to $250,000 and up to 10 years imprisonment.
          </p>
        </section>

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
            <Link href="/regulations/hipaa" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>HIPAA Compliance Hub →</Link>
            <Link href="/guides/soc2-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SOC 2 Compliance Checklist →</Link>
            <Link href="/guides/gdpr-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR Compliance Checklist →</Link>
            <Link href="/guides/startup-compliance-program-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Startup Compliance Program →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Compliance Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. HIPAA requirements are complex, fact-specific, and subject to OCR interpretation. Engage qualified healthcare compliance counsel before making HIPAA compliance determinations for your organization.
          </p>
        </footer>

      </main>
    </>
  )
}
