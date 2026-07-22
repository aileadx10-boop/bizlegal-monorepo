import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Data Retention and Deletion Policy Guide (2025): GDPR Article 17, CCPA, HIPAA, Litigation Holds | BizLegal AI',
  description: 'How to build a data retention policy: GDPR Article 17 right to erasure obligations, CCPA/CPRA deletion request requirements and 45-day deadline, HIPAA minimum retention periods (6 years), litigation hold procedures, data retention schedule by data type, and the 3 common gaps that create regulatory and litigation exposure.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/data-retention-deletion-policy-guide' },
  openGraph: {
    title: 'Data Retention and Deletion Policy Guide (2025) — BizLegal AI',
    description: 'GDPR right to erasure, CCPA deletion requests (45-day deadline), HIPAA minimum retention periods, data retention schedule, litigation hold obligations, and common gaps that expose SaaS companies to regulatory enforcement.',
    url: 'https://bizlegal-ai.com/guides/data-retention-deletion-policy-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What does the GDPR right to erasure (Article 17) require, and when can you refuse a deletion request?',
    a: 'Article 17 of the GDPR gives EU/EEA data subjects the right to request that a controller erase their personal data — the "right to be forgotten." The right is not absolute: it applies in specific circumstances and is subject to specific exceptions. When the right to erasure applies: (1) the personal data is no longer necessary for the purpose for which it was collected or processed; (2) the data subject withdraws consent (where consent was the legal basis) and there is no other legal basis for processing; (3) the data subject objects to processing under Article 21 and there are no overriding legitimate grounds for processing (objection to direct marketing always prevails); (4) the personal data has been unlawfully processed; (5) erasure is required to comply with a legal obligation in EU or member state law; (6) the data was collected in relation to the offer of information society services to a child. When you can refuse: Article 17(3) provides that the right does not apply where processing is necessary: (a) for exercising freedom of expression and information; (b) for compliance with a legal obligation which requires processing under EU or member state law; (c) for reasons of public interest in the area of public health; (d) for archiving purposes in the public interest, scientific research, historical research, or statistical purposes where erasure would seriously impair the achievement of those objectives; (e) for the establishment, exercise, or defense of legal claims. The most practically significant exception for SaaS companies: (b) compliance with legal obligations (tax records, invoices, transaction records under accounting and tax law must be retained for 7-10 years depending on jurisdiction) and (e) legal claims (if you are in litigation with the data subject, you can refuse erasure until the claim resolves). Practical requirements for responding to erasure requests: (a) Acknowledge within 72 hours (best practice, not legally required but demonstrates good faith); (b) Respond within one month with either confirmation of erasure or explanation of refusal; (c) the response period can be extended by 2 months for complex or numerous requests — but you must inform the data subject within the first month; (d) If you are a data controller and you have disclosed the data to other controllers (partners, analytics providers), you must take reasonable steps to inform them of the erasure request (Article 17(2)); (e) If you are a data processor, you must notify the data controller immediately upon receiving an erasure request from an end user — you act on the controller\'s instruction, not the data subject\'s request directly. Backups and erasure: a critical practical issue. GDPR guidance from the European Data Protection Board (EDPB) acknowledges that immediate deletion from backup systems may not be technically feasible. The recommended approach: (a) isolate the data in backups so it is not accessed or processed further (mark as "erasure pending"); (b) delete the data from backups during the next scheduled backup rotation cycle; (c) document the approach in your erasure procedure. The GDPR does not require you to immediately destroy backup tapes or interrupt scheduled backup rotation. Pseudonymization vs erasure: pseudonymized data (where the key linking pseudonymous data to an individual is held separately) is still personal data and is subject to erasure requests. Truly anonymized data (where re-identification is not reasonably possible) is not personal data and is not subject to erasure obligations. Anonymization is very difficult to achieve in practice — what most companies call "anonymization" is pseudonymization.',
  },
  {
    q: 'What are the CCPA/CPRA deletion request requirements and what are the specific timelines?',
    a: 'The California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA), gives California residents the right to request deletion of their personal information from a business and its service providers. CCPA/CPRA deletion timeline: (a) businesses must respond to deletion requests within 45 calendar days of receipt; (b) if more time is needed, the business may extend by an additional 45 days (90 days total) but must notify the consumer of the extension within the initial 45-day period; (c) if the business does not take action on a request, it must notify the consumer without delay and at the latest within 45 days — explaining the reason for non-action and informing of the right to complain to the California Privacy Protection Agency (CPPA). Verification requirements for deletion requests: before deleting personal information, you must verify the identity of the person making the request. The level of verification depends on the sensitivity of the information: (a) Matching provided information against existing information in your system; (b) For account holders: verification via email click or other reasonable method; (c) For non-account holders: verification of at least two data points the company has collected, or one piece of government-issued ID. Verification balancing: for requests to delete sensitive information (financial, medical, precise geolocation), require stronger verification. Do not require a signature notarization or excessive documentation — the CPRA regulations prohibit unreasonably burdensome verification processes. When you can refuse CCPA deletion requests — the nine exemptions: (1) Necessary to complete a transaction the consumer requested or reasonably anticipated; (2) Necessary to provide a good or service reasonably anticipated by the consumer given the context; (3) Necessary for security purposes — detecting security incidents, protecting against malicious, deceptive, fraudulent, or illegal actions; (4) Necessary to debug and repair errors that impair existing intended functionality; (5) Free speech / news, media, or other journalism purposes; (6) Solely for internal uses reasonably aligned with consumer expectations based on the consumer\'s relationship with the business; (7) Necessary for compliance with legal obligation; (8) Otherwise used internally, in a lawful manner, compatible with the context in which the consumer provided the information; (9) Consumer research in the public interest (with consumer consent). Service provider obligations: if you are a CCPA service provider (processing data on behalf of another business), you must delete personal information at the direction of the controller-business when they instruct you to. The service provider agreement must specify this obligation. How CCPA deletion interacts with GDPR erasure: if you serve both EU and California users, maintain a unified deletion workflow. GDPR is generally stricter (one month response period vs 45 days; more specific grounds for exemption). Design your process to satisfy GDPR timelines and both frameworks are covered. CCPA applies to businesses meeting at least one of: (a) annual gross revenues > $25M; (b) buy, sell, receive, or share personal information of 100,000+ California consumers/households; (c) derive 50%+ of annual revenues from selling California consumers\' personal information.',
  },
  {
    q: 'What are the HIPAA data retention requirements, and how do they differ from GDPR erasure?',
    a: 'HIPAA (the Health Insurance Portability and Accountability Act) imposes minimum retention requirements for protected health information (PHI) — the OPPOSITE of GDPR\'s deletion requirements. HIPAA requires retention; GDPR requires the ability to delete. HIPAA minimum retention periods: (1) Medical records: not specified by HIPAA directly — HIPAA defers to state law for medical record retention. State requirements vary from 5-10 years for adult medical records (pediatric records often longer — until the patient is 21). Covered entities should use the LONGEST applicable period. (2) HIPAA Privacy Rule documentation (privacy policies, training records, authorization forms, business associate agreements): 6 years from creation date or last effective date — whichever is LATER. (3) HIPAA Security Rule documentation (security policies, risk assessments, security incident documentation, workforce training records): 6 years from creation or last effective date. (4) HIPAA Breach Notification Rule documentation (breach notification logs, investigation findings, notification letters): 6 years from creation or date of breach notification. (5) Business Associate Agreements (BAAs): 6 years from the date the BAA terminates plus 6 additional years — because a BAA may be evidence of obligations years after termination. Practical approach: retain all HIPAA-related documentation for 6 years from the later of creation date or last effective date. For medical records specifically: use the longest applicable state law period (typically 7-10 years). HIPAA vs GDPR conflict for SaaS companies serving healthcare clients: this is a genuine conflict — you may receive a GDPR erasure request for PHI that HIPAA requires you to retain for 6+ years. Resolution: the GDPR legal obligation exception (Article 17(3)(b)) applies here — US law (HIPAA) constitutes a legal obligation requiring retention. You can refuse the GDPR erasure request on this basis, but you must: (a) inform the data subject that erasure is refused; (b) cite the specific legal obligation; (c) inform the data subject of their right to complain to a supervisory authority. CCPA deletion vs HIPAA retention: California explicitly carved out HIPAA-regulated data from CCPA. If the personal information is PHI governed by HIPAA and maintained by a covered entity or business associate, CCPA does not apply to that information. Document this CCPA exemption in your privacy policy. PHI definition: PHI is "individually identifiable health information" — information that (a) relates to the past, present, or future physical or mental health or condition of an individual, the provision of health care to an individual, or the past, present, or future payment for the provision of health care; AND (b) identifies the individual or provides a reasonable basis for identification. De-identification under HIPAA: properly de-identified data (using Expert Determination method or Safe Harbor method — removing all 18 HIPAA identifiers) is not PHI and is not subject to HIPAA retention or GDPR erasure obligations. Proper de-identification is a meaningful compliance tool for retaining analytical value while reducing compliance burden.',
  },
  {
    q: 'How should a SaaS company build a data retention schedule, and what categories must it cover?',
    a: 'A data retention schedule (also called a data retention policy or data retention matrix) is a document that specifies what categories of data your company holds, the legal basis and purpose for retention, the maximum retention period, and the deletion/anonymization method when the retention period expires. Building the schedule involves 5 steps: Step 1 — Data inventory: map every category of personal data and business records you hold. For SaaS companies, typical categories include: (a) Customer account data: email addresses, names, company names, contact information — retained for the duration of the customer relationship + 3-7 years post-termination (for potential legal claims); (b) Customer-uploaded content and end-user data: content your customers store in your product. Retention depends on your data processing agreement with the customer — typically deleted within 30-90 days of contract termination; (c) Support and communication records: support tickets, email threads, chat logs — typically 2-5 years; (d) Payment and transaction records: invoices, payment confirmations — 7-10 years for tax and accounting compliance (varies by country); (e) Server and application logs: error logs, access logs, security logs — 3-12 months (shorter for routine logs, longer for security incident logs); (f) Marketing data: email lists, campaign engagement data — retain while active, delete 2 years after last engagement; (g) Security incident records: retain indefinitely or minimum 6 years (for insurance and legal claims purposes); (h) Employment records: payroll, contracts, benefits — varies by jurisdiction, typically 7 years. Step 2 — Legal basis assessment: for each category, identify why you are retaining it: (a) Contractual necessity (data needed to perform the contract): retain for contract term plus claims limitation period; (b) Legal obligation: retain for the period required by the specific law (tax, HIPAA, GDPR, etc.); (c) Legitimate interests: perform legitimate interests assessment and document the balancing test; (d) Consent: retain until consent withdrawn. Step 3 — Retention period determination: the retention period for each category = MAX(contractual need, legal obligation, limitation period). Limitation periods for legal claims: US federal claims typically 2-6 years; EU contract claims 3-10 years depending on member state (Germany: 3 years; France: 5 years; UK: 6 years); tort claims 2-6 years. The limitation period is why many companies retain data 3-7 years after contract termination even after the legal obligation expires — it provides evidence for potential claims. Step 4 — Deletion/anonymization method: for each category, specify what happens when the retention period expires: (a) Hard delete (purge from all systems including backups within 30-90 days of period expiry); (b) Anonymize (strip all identifiers so re-identification is not reasonably possible — the data becomes non-personal); (c) Archive (move to isolated, non-accessible storage for remaining retention period, then purge). Step 5 — Technical implementation: the retention schedule is only effective if your product architecture supports automated deletion. For SaaS products: (a) implement automated deletion jobs that run on schedule for each data category; (b) ensure deletion cascades to analytics systems, backups, data warehouses, and third-party processors; (c) implement a deletion log that records what was deleted, when, and by which automated process.',
  },
  {
    q: 'What is a litigation hold and when must a SaaS company implement one?',
    a: 'A litigation hold (also called a legal hold or litigation preservation notice) is a formal directive requiring a company to suspend its normal data destruction and retention practices to preserve electronically stored information (ESI) and other documents relevant to anticipated or actual litigation. The legal basis for litigation holds: the duty to preserve arises under common law (US) and civil procedure rules when litigation is "reasonably anticipated." Under US Federal Rule of Civil Procedure 37(e), if a party fails to take reasonable steps to preserve ESI that should have been preserved in anticipation of litigation, and the ESI cannot be restored or replaced, the court may: (a) order the adverse inference instruction (instructing the jury they can assume the lost evidence was harmful to the losing party); (b) enter a default judgment or dismiss the case (for intentional destruction); (c) impose monetary sanctions and attorney\'s fees. The standard: preservation obligation begins when litigation is "reasonably anticipated" — not when a lawsuit is actually filed. Reasonable anticipation can be triggered by: (a) a threatening letter from a counterparty or their attorney; (b) receipt of a subpoena or legal demand; (c) a regulatory investigation or government inquiry; (d) a known contract dispute where one party is threatening legal action; (e) an internal report of a significant incident that may lead to third-party claims. What data must be preserved: all ESI and physical documents "potentially relevant" to the anticipated litigation. This is broad — when in doubt, preserve. Categories typically covered: (a) emails, Slack messages, and other communications related to the matter; (b) contracts, agreements, and amendments related to the matter; (c) financial records related to the parties or transactions at issue; (d) product records, logs, and technical documentation related to the matter; (e) personnel records if employment is at issue. SaaS-specific considerations: (a) Customer data: if you are in litigation with a customer or if a customer\'s data is at issue, implement a hold on that customer\'s data immediately — even if your DPA would normally permit deletion on contract termination; (b) Automated deletion: the first action when implementing a litigation hold is to suspend any automated deletion processes that could destroy relevant data. Document that deletion was suspended. (c) Backup systems: preserve backups that contain relevant data — do not permit normal backup rotation to overwrite relevant data. (d) Third-party processors: notify relevant processors that data must be preserved. How to implement a litigation hold: (1) issue a written litigation hold notice to all employees who may have relevant information (identifying the matter, the data to be preserved, and the prohibition on destroying relevant data); (2) disable relevant automated deletion jobs and backup rotation; (3) collect relevant ESI from custodian devices and email systems to a preservation repository; (4) document the hold notice, distribution list, and custodian acknowledgments; (5) monitor compliance throughout the litigation and update the hold if new custodians or data categories become relevant. Interaction with GDPR / CCPA deletion requests: if you receive a data subject deletion request but a litigation hold is in effect for data relevant to that specific data subject, you can refuse or delay deletion for the duration of the hold. In GDPR terms, the "establishment, exercise, or defense of legal claims" exception (Article 17(3)(e)) applies. Document the hold and the specific connection between the data subject\'s data and the litigation.',
  },
  {
    q: 'What are the most common data retention compliance gaps that expose SaaS companies to enforcement risk, and how do you close them?',
    a: 'Three gaps create the vast majority of regulatory enforcement risk for SaaS companies around data retention and deletion: Gap 1 — Retention policy exists but deletion does not actually happen (the most common gap). Many SaaS companies have written data retention policies that specify deletion periods — but they have no automated technical processes to actually delete data when the period expires. Data accumulates indefinitely because no one deletes it manually. This creates dual risk: (a) Regulatory risk — if you promise in your privacy policy to delete data within a certain period and you do not, this is a misrepresentation that regulators (FTC, CNIL, ICO) have enforced against. The FTC\'s Section 5 "unfair or deceptive acts" authority covers privacy policy misrepresentations. (b) Data minimization violation — GDPR Article 5(1)(e) requires data to be kept "no longer than is necessary." Indefinite retention without legal basis is a standalone GDPR violation. Close this gap: implement automated deletion jobs for each data category in your data retention schedule. Use scheduled database queries to identify and delete records past their retention period. Include analytics systems, data warehouses, and all third-party processors in the deletion workflow. Gap 2 — "Right to erasure" requests have no technical implementation path. Many SaaS companies accept erasure requests via a form or email — but have no documented procedure for actually executing deletion across all systems. The customer record is deleted from the primary database, but remains in backup systems, analytics data lakes, support ticket systems, marketing automation tools, and third-party integrations. Close this gap: build a deletion cascade procedure that documents every system where personal data may reside, the responsible team member for each system, and the maximum time to complete deletion from each system. Test this procedure at least annually. For GDPR purposes, document the testing in your records of processing activities (RoPA). Gap 3 — No litigation hold procedure, or automated deletion fires during active litigation. If your automated deletion system destroys data that was subject to a litigation hold — because no one communicated the hold to the engineering team running the deletion job — you have spoliation liability. Courts have awarded multi-million dollar sanctions for this failure. Close this gap: (a) create a written litigation hold procedure that identifies who is responsible for notifying engineering when a hold is issued; (b) create a "hold" flag or marker in your data systems that prevents automated deletion for flagged records; (c) test the hold mechanism annually by verifying that holds prevent deletion; (d) maintain a registry of all active litigation holds. Secondary gaps worth addressing: (a) Third-party processor contracts that do not specify retention and deletion obligations — your DPA with each processor must specify their deletion obligations and timelines; (b) Employee offboarding without data access revocation — former employee accounts left active contain personal data that should be deleted or anonymized on a specific schedule post-departure; (c) Marketing data retained indefinitely — email lists with no engagement tracking accumulate data subject to deletion requests; implementing engagement-based sunset policies (delete after 24 months of no engagement) reduces this risk.',
  },
]

export default function DataRetentionDeletionPolicyGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Data Retention and Deletion Policy Guide (2025): GDPR Article 17, CCPA, HIPAA, Litigation Holds',
    description: 'How to build a data retention policy: GDPR Article 17 right to erasure, CCPA deletion request requirements, HIPAA retention minimums, litigation hold procedures, and closing common compliance gaps.',
    url: 'https://bizlegal-ai.com/guides/data-retention-deletion-policy-guide',
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
      { '@type': 'ListItem', position: 3, name: 'Data Retention & Deletion Policy Guide', item: 'https://bizlegal-ai.com/guides/data-retention-deletion-policy-guide' },
    ],
  }

  const RETENTION_SCHEDULE = [
    { category: 'Customer account data', period: 'Contract term + 7 years', legalBasis: 'Contractual necessity + limitation period', deletionMethod: 'Hard delete + anonymize analytics' },
    { category: 'Customer-uploaded end-user data', period: '30–90 days post-termination (per DPA)', legalBasis: 'Contract (DPA obligation)', deletionMethod: 'Hard delete per DPA procedure' },
    { category: 'Payment / invoice records', period: '7–10 years', legalBasis: 'Legal obligation (tax / accounting law)', deletionMethod: 'Archive, then purge' },
    { category: 'Support tickets / communications', period: '2–5 years', legalBasis: 'Legitimate interests (legal claims)', deletionMethod: 'Hard delete (anonymize if aggregated)' },
    { category: 'Application / server logs', period: '3–12 months (routine); 6 years (security incidents)', legalBasis: 'Legitimate interests (security)', deletionMethod: 'Automated log rotation' },
    { category: 'Marketing / email lists', period: 'Duration of consent + 24 months post-last-engagement', legalBasis: 'Consent / legitimate interests', deletionMethod: 'Automated sunset + hard delete' },
    { category: 'HIPAA-covered PHI documentation', period: '6 years from creation or last effective date', legalBasis: 'Legal obligation (HIPAA 45 CFR § 164.530)', deletionMethod: 'Archive then purge' },
    { category: 'Security incident records', period: '6 years minimum', legalBasis: 'Legitimate interests (insurance / legal claims)', deletionMethod: 'Archive indefinitely or 10 years' },
    { category: 'Employment records', period: '7 years post-termination', legalBasis: 'Legal obligation (jurisdiction-specific)', deletionMethod: 'Secure destruction' },
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
          Data Retention & Deletion Policy Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Privacy & Data
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          Data Retention and Deletion Policy Guide (2025): GDPR Article 17, CCPA, HIPAA, and Litigation Holds
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          GDPR requires you to delete personal data when it is no longer necessary. HIPAA requires you to retain health records for 6 years. CCPA requires you to honor deletion requests within 45 days. Litigation holds require you to stop ALL deletion when legal proceedings are anticipated. These obligations conflict — and the conflict is exactly where SaaS companies get sanctioned. A written data retention policy that is not technically implemented is worse than no policy at all: it is a promise to regulators that you are breaking.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Data Retention Schedule by Category</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', minWidth: '560px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Data Category</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Retention Period</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Legal Basis</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Deletion Method</th>
                </tr>
              </thead>
              <tbody>
                {RETENTION_SCHEDULE.map(({ category, period, legalBasis, deletionMethod }) => (
                  <tr key={category} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: '0.8rem', verticalAlign: 'top' }}>{category}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, fontSize: '0.76rem', verticalAlign: 'top' }}>{period}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, fontSize: '0.76rem', verticalAlign: 'top' }}>{legalBasis}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, fontSize: '0.76rem', verticalAlign: 'top' }}>{deletionMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.82rem', opacity: 0.65, lineHeight: 1.6 }}>
            Retention periods should reflect the LONGEST applicable obligation across all relevant jurisdictions. When GDPR minimization conflicts with a statutory retention requirement (tax, HIPAA), the statutory obligation prevails — document this in your Records of Processing Activities (RoPA).
          </p>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your Privacy Policy, DPA, or Data Retention Agreement</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your privacy policy, data processing agreement, or data retention policy document. BizLegal AI identifies whether your stated retention periods are specific enough to satisfy GDPR data minimization requirements, whether your DPA specifies deletion obligations for service providers (Article 28 requirement), whether your privacy policy makes deletion promises you may be failing to keep, and whether your retention terms create conflicts with HIPAA minimum retention obligations.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Privacy Policy or DPA →
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
            <Link href="/guides/gdpr-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR Compliance Checklist →</Link>
            <Link href="/guides/gdpr-data-processing-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR DPA Guide →</Link>
            <Link href="/guides/ccpa-cpra-compliance-checklist" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>CCPA/CPRA Checklist →</Link>
            <Link href="/guides/hipaa-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>HIPAA Compliance Checklist →</Link>
            <Link href="/guides/data-breach-response-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Data Breach Response Guide →</Link>
            <Link href="/guides/eu-us-data-transfer-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>EU-US Data Transfer Guide →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. Data retention requirements vary significantly by jurisdiction, industry, data type, and applicable regulatory framework. GDPR, CCPA, and HIPAA requirements described here reflect regulations as of 2025 and are subject to regulatory updates and supervisory authority guidance. Litigation hold requirements depend on the specific laws and court rules applicable to the jurisdiction and type of proceeding. Consult qualified legal counsel before finalizing your data retention policy or responding to deletion requests.
          </p>
        </footer>

      </main>
    </>
  )
}
