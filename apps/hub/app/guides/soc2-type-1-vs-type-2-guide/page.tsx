import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SOC 2 Type I vs Type II Guide (2025): Trust Service Criteria, Audit Scope, Vendor Review | BizLegal AI',
  description: 'The definitive comparison of SOC 2 Type I and Type II audits: what each report covers, the 5 Trust Service Criteria (Security, Availability, Confidentiality, Processing Integrity, Privacy) and what auditors test in each, how long it takes, what a SOC 2 report actually contains, how to evaluate a vendor\'s SOC 2 report as a customer, and the difference between SOC 2 Type II and ISO 27001 certification.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/soc2-type-1-vs-type-2-guide' },
  openGraph: {
    title: 'SOC 2 Type I vs Type II Guide (2025) — BizLegal AI',
    description: 'SOC 2 audit guide: Type I vs Type II, 5 Trust Service Criteria breakdown, what auditors actually test, readiness timeline, vendor report review, and SOC 2 vs ISO 27001.',
    url: 'https://bizlegal-ai.com/guides/soc2-type-1-vs-type-2-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What is the difference between SOC 2 Type I and Type II, and which one do customers actually require?',
    a: 'SOC 2 (System and Organization Controls 2) is an audit framework developed by the AICPA (American Institute of Certified Public Accountants) that assesses whether a service organization\'s controls relevant to security, availability, processing integrity, confidentiality, or privacy meet the Trust Service Criteria. SOC 2 Type I and Type II differ in scope and what they prove. SOC 2 Type I — point-in-time assessment: a Type I report evaluates whether the controls described by management were suitably designed and implemented at a single point in time (typically the report date). What it proves: the auditor examined the control environment on day X and found that the controls described exist and appear designed to achieve the stated objectives. What it does NOT prove: that those controls actually operated effectively over time. The controls could fail the day after the report is issued — Type I would not detect this. A Type I report has a single report date (e.g., "as of December 31, 2024"). Getting a Type I report is faster — typically 2-4 months from readiness assessment to report issuance — because no observation period is required. SOC 2 Type II — historical operations: a Type II report evaluates whether controls were suitably designed AND operated effectively over a specified period, typically 6-12 months. What it proves: the auditor observed the control environment over the stated period (e.g., January 1 through December 31, 2024) and found that the controls operated as described throughout that period. What it shows customers: the controls were actually working in practice, not just existing on paper. The observation period is typically 6 months minimum for a first Type II report. Subsequent reports are usually annual (12-month periods). What customers actually require: enterprise and mid-market customers now almost universally require SOC 2 Type II as a vendor qualification requirement. Type I is increasingly treated as a "we\'re working on it" placeholder that is acceptable only if: (a) you have a clear timeline to Type II; (b) the deal is not security-sensitive; or (c) the customer is also early-stage. The practical implication: if you start a SOC 2 program today, your audit timeline is: 2-3 months for readiness assessment and gap remediation → 3-4 months to implement controls → 6-12 month observation period → 2-3 months for auditors to fieldwork and issue report. First Type II report: 13-22 months from starting. Type I can be issued after readiness and implementation (~6-8 months total) — useful as proof of progress while you complete the Type II observation period.',
  },
  {
    q: 'What are the 5 Trust Service Criteria (TSC), and what do auditors actually test within each category?',
    a: 'The Trust Service Criteria (TSC) are the AICPA\'s framework for evaluating service organization controls. SOC 2 reports must cover the Security TSC (mandatory) and any additional criteria the organization includes in scope. Each criterion is broken down into Common Criteria (CC) sub-categories that map to specific control objectives. Trust Service Category 1 — Security (CC1-CC9, mandatory): Security is always required. The Security TSC maps to the Common Criteria framework and covers: CC1 (Control Environment) — tone at top, board oversight, hiring practices, organizational accountability; CC2 (Communication and Information) — internal and external communication of responsibilities, system descriptions, vendor communication; CC3 (Risk Assessment) — risk identification methodology, risk tolerance, fraud risk assessment; CC4 (Monitoring Activities) — ongoing monitoring, separate evaluations, deficiency reporting; CC5 (Control Activities) — policies and procedures to address risks, including logical and physical access controls, change management, and incident response; CC6 (Logical and Physical Access Controls) — most scrutinized: authentication requirements (MFA), role-based access, privileged access management, logical access reviews (quarterly or more), physical access controls to data centers, data encryption at rest and in transit, access revocation procedures; CC7 (System Operations) — monitoring for deviations, security event detection and response, business continuity planning, disaster recovery; CC8 (Change Management) — software development lifecycle (SDLC), change control procedures, testing before deployment, separation of environments; CC9 (Risk Mitigation) — risk transfer (insurance), vendor management, vendor due diligence. Trust Service Category 2 — Availability (A1): tests whether the system is available for operation and use as committed or agreed. Auditors examine: uptime SLAs vs actual performance data, incident logging and response times, business continuity plan (BCP) testing, disaster recovery testing (RTO/RPO validation), capacity planning, infrastructure redundancy. Trust Service Category 3 — Processing Integrity (PI1): tests whether system processing is complete, valid, accurate, timely, and authorized. Most relevant for payment processors, data pipelines, and financial applications. Auditors examine: input validation controls, processing accuracy monitoring, error handling and exception reporting, reconciliation procedures. Trust Service Category 4 — Confidentiality (C1): tests whether information designated as confidential is protected per the entity\'s commitments. Auditors examine: data classification policies, encryption of confidential data, access controls on confidential data, disposal of confidential information, NDA programs. Trust Service Category 5 — Privacy (P1-P8): maps to AICPA privacy principles and aligns with GDPR/CCPA concepts. Tests consent, choice, collection limitation, use/retention/disposal, access, disclosure, security, and monitoring. Privacy TSC is increasingly included in scope for companies processing significant personal data. Standard scope for most B2B SaaS vendors: Security (CC) + Availability (A1) + Confidentiality (C1). Full five-criteria scope is less common and adds significant audit cost.',
  },
  {
    q: 'What does a SOC 2 Type II report actually contain, and how should you read a vendor\'s SOC 2 report?',
    a: 'Understanding the structure of a SOC 2 report is essential both for the organization being audited and for customers reviewing a vendor\'s SOC 2. A SOC 2 Type II report typically contains the following sections: Section 1 — Independent Service Auditor\'s Report: the auditor\'s formal opinion. This is the single most important page to read. Look for: (a) the opinion type — "unqualified" (clean) opinion means the auditor found no material issues; "qualified" opinion means one or more control objectives were not met; "adverse" opinion (rare) means widespread control failures; (b) the period covered — check that it covers a recent period (a report from 18+ months ago may not reflect current controls); (c) the specific Trust Service Criteria covered — verify the criteria include what you care about (Security is mandatory; confirm Availability if uptime matters to you). Section 2 — Management\'s Description of the Service Organization\'s System: a narrative description of the system written by management. This section describes the system boundaries, infrastructure, software, people, procedures, and data. Key things to read: (a) what is included vs excluded from the system description (the "carve-out" — certain subservice organizations may be excluded using the carve-out method, meaning those vendors are NOT covered by this SOC 2); (b) the data types processed; (c) any significant subservice organizations (downstream vendors). Section 3 — Criteria, Related Controls, and Tests of Controls: the core technical section. A table format typically showing: (a) the Trust Service Criterion; (b) the control objective; (c) the control the organization has implemented (described by management); (d) the test performed by the auditor; (e) the test result — "No exceptions noted" means the control operated effectively; exceptions are documented specifically. How to read exceptions: look for the "exceptions" or "deviations" column. A test result of "Except as noted, no exceptions" with a footnote describing an exception is significant. Key exception patterns to flag: (a) access reviews not performed on schedule; (b) terminated employees retaining access longer than policy requires; (c) change management procedures not followed for certain changes; (d) patch management delays beyond policy timelines; (e) security training not completed by all required personnel. Section 4 (if applicable) — Management\'s Response to Exceptions: management explains the exceptions and remediation steps. Read this section critically — it tells you whether the exceptions are isolated incidents or systemic. What a vendor SOC 2 review checklist should include: (a) check the opinion type (unqualified = clean); (b) confirm report period recency (within 12 months); (c) verify TSC scope matches your requirements; (d) review the system description for carve-outs — if your vendor carves out their cloud provider or key subprocessors, those are not covered; (e) review all exceptions and management responses; (f) assess whether the remediation described for exceptions is adequate; (g) compare the control descriptions to your security questionnaire answers (SOC 2 descriptions should be consistent with vendor questionnaire responses).',
  },
  {
    q: 'How long does it take to get SOC 2 certified, what does it cost, and what are the typical readiness gaps?',
    a: 'SOC 2 audit timeline and cost depend heavily on the organization\'s starting maturity, the number of Trust Service Criteria in scope, and whether the organization uses automation tools. Timeline for first-time SOC 2 Type II: Phase 1 — Readiness Assessment: 4-8 weeks. A qualified advisor or auditing firm reviews your current control environment against the TSC and produces a gap report. This is often the most eye-opening phase — organizations typically discover 40-80+ control gaps. Phase 2 — Remediation and Implementation: 2-5 months. This is where most of the work happens: implementing access reviews, deploying an MDM (Mobile Device Management) solution, enabling SIEM (Security Information and Event Management) logging, formalizing all required policies and procedures (15-25 written policies are typical), implementing vendor management program, deploying encryption at rest and in transit, establishing change management procedures. Phase 3 — Observation Period: 6-12 months (minimum 6 months for initial report). The auditor\'s observation period must be at least 6 months for a first Type II. During this period, all controls must operate as designed — this is where organizations that implemented controls but don\'t enforce them get caught. Phase 4 — Fieldwork and Report Issuance: 8-16 weeks. The auditor performs the actual testing, requests evidence for each control, and drafts the report. Total time from starting: 13-22 months for first Type II report. Costs: Readiness assessment: $5,000-$20,000 (CPA firm or consultant). Auditor fees for Type II report: $20,000-$60,000 (mid-market firm) to $50,000-$150,000 (Big 4 or national firm). Compliance automation tools (Drata, Vanta, Tugboat Logic, Secureframe): $15,000-$40,000/year. Internal time investment: 0.5-1.5 FTE for 6-12 months during implementation. Annual recurring costs after first report: $20,000-$75,000 (annual audit) + tool costs. Compliance automation tools can significantly reduce the observation period burden and fieldwork time. Most common readiness gaps discovered during Phase 1: (1) No formal access review process — most organizations lack quarterly access reviews, a core CC6 requirement; (2) Missing employee security training program with completion tracking; (3) No formal vendor management program — contracts and security assessments for subprocessors; (4) Inadequate change management documentation — informal deployments with no formal review and approval process; (5) Missing security policies — incident response, data classification, acceptable use, vulnerability management, business continuity, disaster recovery policies are all required; (6) MFA not enforced on all critical systems and production access; (7) No security monitoring / SIEM alerting; (8) Background check policy not in place or not consistently applied.',
  },
  {
    q: 'How does SOC 2 compare to ISO 27001, and which should a B2B SaaS company pursue first?',
    a: 'SOC 2 and ISO 27001 are the two dominant enterprise security frameworks for B2B technology companies, and the choice between them — or the order in which to pursue them — is one of the most common compliance planning questions. SOC 2: AICPA framework; primarily recognized in North America (US, Canada); a report from an independent auditor; the auditor tests whether controls were operating effectively during the period; outputs an audit report (not a certification); customer-specific — companies typically share their SOC 2 report under NDA; no formal certification body; annual audits required to maintain current report. ISO 27001: international standard (ISO/IEC); globally recognized (Europe, Asia, Middle East, Latin America); a certification from an accredited certification body (not an auditor); auditor tests whether the ISMS (Information Security Management System) conforms to the standard and implements required controls; outputs an ISO 27001 certificate valid for 3 years (with annual surveillance audits); publicly verifiable certificate; covers 114 controls organized into 14 domains under Annex A. Key structural difference: SOC 2 is an attestation that controls operated effectively over a period. ISO 27001 is a certification that an ISMS exists and conforms to the standard. SOC 2 is more focused on operational effectiveness over time; ISO 27001 is more focused on whether a system (ISMS) is in place and correctly structured. Which to pursue first — market signal: if your target customers are US-based B2B SaaS buyers: SOC 2 Type II first. This is the US enterprise security standard, and US procurement teams default to requesting it. ISO 27001 may be unknown to your buyer or treated as a secondary credential. If your target customers are in the EU, Middle East, UK, or global enterprises with international procurement: ISO 27001 first or simultaneously. EU procurement teams, government contracts, and global enterprises frequently require ISO 27001. SOC 2 may be less familiar to EU buyers. If your target customers are both US and international: pursue SOC 2 and ISO 27001 simultaneously. The control overlap is approximately 60-75% — most controls required for SOC 2 also satisfy ISO 27001 Annex A requirements, and both require a documented risk assessment, access controls, incident response, business continuity, vendor management, and change management. Control overlap means dual-certification is not twice the work — typically 25-40% additional effort beyond a single certification. Notable difference: ISO 27001 requires a formal Information Security Management System (ISMS) with a defined scope, objectives, and continuous improvement program. SOC 2 does not require a formal ISMS structure. Organizations that pursue ISO 27001 first often find SOC 2 Type II relatively straightforward because the ISMS foundation covers most SOC 2 requirements.',
  },
  {
    q: 'What is a SOC 2 bridge letter, SOC 2+ report, and other SOC 2 report variants customers may encounter?',
    a: 'Beyond the standard Type I and Type II reports, several SOC 2 report variants exist that enterprise customers or compliance teams may encounter during vendor due diligence. SOC 2 Bridge Letter (also called a Gap Letter): when a SOC 2 Type II report covers a period ending more than 6-12 months ago, customers often request a bridge letter. A bridge letter is a management representation letter from the vendor organization stating that: (a) no material changes have been made to the control environment since the SOC 2 report period ended; (b) there have been no material incidents or control failures during the gap period; (c) the existing SOC 2 report can still be relied upon. A bridge letter is a management representation — it is NOT auditor-verified. It should be treated as supplementary assurance, not a substitute for a current report. Best practice: if a vendor\'s most recent SOC 2 report is more than 12 months old, request both a bridge letter and evidence that a new report is in progress. SOC 2+ Report: a SOC 2+ report adds criteria from other recognized frameworks to the standard TSC evaluation. A single audit covers both the TSC and the additional framework criteria. Common SOC 2+ additions: SOC 2+ HITRUST CSF (relevant for healthcare vendors, combines SOC 2 Security TSC with HITRUST CSF requirements); SOC 2+ CSA STAR (relevant for cloud vendors, combines SOC 2 with the Cloud Security Alliance Controls Matrix); SOC 2+ ISO 27001 (dual-coverage for US + international buyers); SOC 2+ NIST CSF (relevant for US government contractors). SOC 2 for Startups: several CPA firms offer "SOC 2 for Startups" programs that streamline the initial Type II report process. These programs often leverage compliance automation platforms and have pre-agreed audit programs, reducing cost for early-stage companies. The resulting report is a standard SOC 2 Type II — there is no formal "SOC 2 lite" designation. SOC 2 Report Confidentiality and NDA: SOC 2 reports are confidential documents. Vendors sharing their report with customers typically require the customer to sign an NDA or a "restricted use" agreement. The report itself contains language noting that it is "prepared for the use of user entities." Customers may NOT publicly post a vendor\'s SOC 2 report or share it with third parties without the vendor\'s permission. Customer due diligence considerations: when reviewing a vendor\'s SOC 2 report, the following should raise flags: (a) very short observation period (3 months vs 6-12 months standard); (b) limited TSC scope (Security only, when Availability or Privacy are relevant to your use case); (c) extensive exceptions with vague management responses; (d) use of carve-out method for key subservice organizations (meaning the cloud provider or key infrastructure is excluded from the audit scope); (e) first-time Type II with no track record of ongoing compliance.',
  },
]

export default function SOC2TypeGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'SOC 2 Type I vs Type II Guide (2025): Trust Service Criteria, Audit Scope, Timeline, and Vendor Review',
    description: 'SOC 2 audit guide: Type I vs Type II comparison, 5 Trust Service Criteria breakdown, what auditors actually test, readiness timeline and cost, how to review a vendor SOC 2 report, and SOC 2 vs ISO 27001.',
    url: 'https://bizlegal-ai.com/guides/soc2-type-1-vs-type-2-guide',
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
      { '@type': 'ListItem', position: 3, name: 'SOC 2 Type I vs Type II Guide', item: 'https://bizlegal-ai.com/guides/soc2-type-1-vs-type-2-guide' },
    ],
  }

  const TSC_TABLE = [
    {
      tsc: 'Security (CC)',
      mandatory: '✅ Always required',
      keysTests: 'MFA enforcement, access reviews, privileged access mgmt, change management, incident response, encryption, security monitoring (SIEM)',
      commonScope: 'All SOC 2 reports',
    },
    {
      tsc: 'Availability (A1)',
      mandatory: '⚠️ Optional',
      keysTests: 'Uptime monitoring vs SLA commitments, BCP/DR testing, incident response times, capacity planning, infrastructure redundancy',
      commonScope: 'SaaS, cloud services, mission-critical platforms',
    },
    {
      tsc: 'Processing Integrity (PI1)',
      mandatory: '⚠️ Optional',
      keysTests: 'Input validation, processing accuracy, error handling, reconciliation procedures, completeness of processing',
      commonScope: 'Payment processors, financial data pipelines, data transformation services',
    },
    {
      tsc: 'Confidentiality (C1)',
      mandatory: '⚠️ Optional',
      keysTests: 'Data classification, confidential data encryption, access controls on confidential data, secure disposal, NDA programs',
      commonScope: 'B2B vendors handling customer confidential data, legal tech, healthcare tech',
    },
    {
      tsc: 'Privacy (P1–P8)',
      mandatory: '⚠️ Optional',
      keysTests: 'Consent/notice, collection limitation, use/retention/disposal, data subject access rights, third-party disclosure controls',
      commonScope: 'Consumer-facing platforms, health apps, HR platforms, high-volume personal data',
    },
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
          SOC 2 Type I vs Type II Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Security Compliance
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          SOC 2 Type I vs Type II Guide (2025): Trust Service Criteria, Audit Timeline, and How to Read a Vendor SOC 2 Report
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Enterprise customers now routinely require SOC 2 Type II as a vendor qualification threshold — not Type I, and not a SOC 2 readiness assessment or "in progress" badge. Understanding what each type of report covers, what the five Trust Service Criteria actually test, and how to critically evaluate a vendor's SOC 2 report (including reading exceptions) is essential for both organizations pursuing SOC 2 and customers reviewing vendor security posture.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>The 5 Trust Service Criteria — Scope and Key Tests</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '580px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Trust Service Category</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Mandatory?</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Key Tests in Audit</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Common Scope</th>
                </tr>
              </thead>
              <tbody>
                {TSC_TABLE.map(({ tsc, mandatory, keysTests, commonScope }) => (
                  <tr key={tsc} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, verticalAlign: 'top' }}>{tsc}</td>
                    <td style={{ padding: '10px 12px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{mandatory}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, fontSize: '0.76rem', verticalAlign: 'top' }}>{keysTests}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.75, fontSize: '0.76rem', verticalAlign: 'top' }}>{commonScope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your SOC 2 Report, DPA, or Vendor Security Agreement</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload a vendor's SOC 2 Type II report summary, a data processing agreement referencing SOC 2 compliance, or your own draft vendor security agreement. BizLegal AI flags material exceptions in the auditor's opinion, identifies carve-outs in the system description that may leave key subservice organizations uncovered, reviews whether the TSC scope matches your contractual requirements, and surfaces contract clauses that are inconsistent with disclosed SOC 2 control gaps.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Vendor Agreement →
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
            <Link href="/guides/soc2-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SOC 2 Compliance Checklist →</Link>
            <Link href="/guides/iso-27001-vs-soc2-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>ISO 27001 vs SOC 2 →</Link>
            <Link href="/guides/saas-vendor-agreement-review-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SaaS Vendor Agreement Guide →</Link>
            <Link href="/guides/hipaa-business-associate-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>HIPAA BAA Guide →</Link>
            <Link href="/guides/data-breach-response-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Data Breach Response →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal or audit advice. SOC 2 audit requirements, timelines, and costs vary significantly based on organizational complexity, systems in scope, and the auditing firm selected. Trust Service Criteria interpretations may evolve with AICPA guidance updates. Consult a qualified AICPA-licensed CPA firm and, where appropriate, legal counsel before making compliance decisions based on this content.
          </p>
        </footer>

      </main>
    </>
  )
}
