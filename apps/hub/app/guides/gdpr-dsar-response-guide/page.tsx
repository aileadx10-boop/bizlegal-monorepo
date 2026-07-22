import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'GDPR Data Subject Rights & DSAR Response Guide (2025): 30-Day Deadline, Exemptions, Verification, Identity Checks | BizLegal AI',
  description: 'GDPR data subject access request (DSAR) response guide: 30-day response deadline (extendable to 3 months), 12 Article 23 exemptions, identity verification without creating unnecessary barriers, what information must be included in a DSAR response, when fees can be charged (manifestly unfounded or excessive requests), responding to erasure (right to be forgotten), portability requests, and the 6 rights that require a response vs 2 that are absolute.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/gdpr-dsar-response-guide' },
  openGraph: {
    title: 'GDPR Data Subject Rights & DSAR Response Guide (2025) — BizLegal AI',
    description: 'GDPR DSAR response requirements: 30-day deadline, 12 exemptions, identity verification, what to include in your response, when to charge fees, right to erasure exceptions, and the 8 data subject rights operationalized.',
    url: 'https://bizlegal-ai.com/guides/gdpr-dsar-response-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What are the 8 GDPR data subject rights, and which ones require an individual response vs which are absolute?',
    a: 'The GDPR establishes 8 categories of data subject rights across Articles 12-22, but they differ significantly in how absolute they are and what triggers a controller\'s response obligation. Understanding this taxonomy is essential for operationalizing your DSAR process — receiving a request to exercise "GDPR rights" without knowing which right is being invoked (which the data subject is not required to specify) means your team must identify the applicable right from context and respond accordingly. Right 1 — Right to be informed (Articles 13-14): this is a proactive transparency right, not an individual request-response cycle. Controllers must provide privacy notice information at the time of data collection (Article 13, first-party data) or within one month if data was obtained from a third party (Article 14). No individual response required; the obligation is satisfied by a published, GDPR-compliant privacy notice. Operationally, this means DSARs that are really "where is your privacy notice?" questions are satisfied by directing the person to your published privacy policy. Right 2 — Right of access (Article 15): the most commonly invoked right — this is the "data subject access request" in its classical sense. The data subject requests a copy of their personal data and supplementary information (purposes, categories, recipients, retention period, source of data, safeguards for international transfers, the right to complain to a supervisory authority). Controllers must respond within 1 month (extendable to 3 months for complex/numerous requests). First copy is free; subsequent copies may be charged a reasonable administrative fee. Right 3 — Right to rectification (Article 16): right to have inaccurate personal data corrected and incomplete data completed. Relatively simple to operationalize: verify the data, make corrections, notify recipients to whom data was disclosed (unless disproportionate effort). Right 4 — Right to erasure / "Right to be forgotten" (Article 17): right to have personal data deleted. This right is conditional — it applies when: (a) data is no longer necessary for the original purpose; (b) consent was the legal basis and is withdrawn; (c) the data subject objects under Article 21 and there are no overriding legitimate grounds; (d) data has been unlawfully processed; (e) erasure is required for compliance with a legal obligation; (f) data was collected in relation to services offered to a child. Critically, Article 17(3) provides exemptions: erasure does not apply when processing is necessary for (a) exercising freedom of expression and information; (b) compliance with a legal obligation; (c) public health purposes; (d) archiving in the public interest, scientific or historical research; (e) establishment, exercise, or defense of legal claims. Right 5 — Right to restriction of processing (Article 18): right to request that processing is temporarily suspended in specific circumstances — while accuracy is contested, while the data subject exercises their right to object, when processing is unlawful but the data subject requests restriction rather than erasure, or when the controller no longer needs the data but the data subject needs it for legal claims. Restriction is operationally distinct from erasure: the data is retained but processing is paused. Right 6 — Right to data portability (Article 20): right to receive personal data in a structured, commonly used, machine-readable format, and to transmit it to another controller. This right only applies when: (a) the legal basis is consent or contract (NOT legitimate interests); (b) processing is carried out by automated means. This is one of the narrowest rights in practice — it does not apply to processing under legitimate interests (the most common commercial basis), does not apply to paper records, and requires only data that the data subject themselves provided (not derived data, inferred data, or output from analytics). JSON and CSV are acceptable formats; Excel is generally acceptable for consumer-facing data. Right 7 — Right to object (Article 21): right to object to processing based on legitimate interests or for direct marketing purposes. When objected to for direct marketing (the most common invocation): controller must STOP processing immediately without exception — this is an absolute right for direct marketing. When objected to on legitimate interests grounds: controller may override the objection if it can demonstrate compelling legitimate grounds that override the individual\'s interests. The data subject must specify grounds relating to their particular situation. Right 8 — Rights relating to automated decision-making and profiling (Article 22): right not to be subject to solely automated decisions that produce legal or similarly significant effects. Absolute exemptions: automated decisions permissible when necessary for a contract, authorized by law, or based on explicit consent. When automated decisions are permitted, individuals have the right to obtain human intervention, express their point of view, and contest the decision.',
  },
  {
    q: 'What is the GDPR DSAR 30-day response deadline, and when can it be extended to 3 months?',
    a: 'The core GDPR DSAR timeline is established in Article 12(3): the controller must act on the data subject\'s request without undue delay and in any event within one calendar month of receipt of the request. "Receipt" is the date the request is received in any form — email, website contact form, social media message, or letter. The clock starts from the date the request is received, not the date it is read or acknowledged. The 1-month period is in calendar months, not 30 working days. Receipt in January 15 → response due by February 15. If the deadline falls on a weekend or public holiday, it extends to the next working day (general principle of EU law). Article 12(3) also allows extension: where requests are complex or numerous, the controller may extend the response period by a further two months (for a maximum of 3 months total response period). Two conditions must be met for the extension: (1) the request is complex or numerous — the GDPR does not define "complex," but EDPB guidance suggests: requests involving large volumes of data, searches across multiple systems or time periods, requests that require significant legal analysis (e.g., determining applicable exemptions), or technical challenges in producing the data. "Numerous" means several requests from the same person in a short period. (2) the controller must notify the data subject within the first calendar month of the extension, explaining the reasons for the delay. Failure to notify of extension within 1 month is itself a GDPR violation even if the extended response is provided on time. Practical implications: for most SaaS companies processing standard user data, the 1-month period without extension is feasible. The extension is not a default option — it must be genuinely justified. The ICO guidance makes clear that controllers cannot extend simply because they lack resources or have not built the operational infrastructure to respond. Operational DSAR process recommended: (a) automated DSAR intake system (web form or email inbox) with date-stamping; (b) identity verification step initiated within 3 business days of receipt; (c) for simple requests (email address, account data), target 15-day response; (d) for complex requests, assess at day 20 whether extension is needed and send extension notice by day 28 (leaving buffer before day-30 deadline). Identity verification clock: if the controller requests additional information for identity verification purposes, the 1-month clock pauses until the additional information is received. This is a narrow exception — the verification request must be proportionate (see FAQ below).',
  },
  {
    q: 'What identity verification is required for GDPR DSARs, and what\'s the line between legitimate verification and creating unnecessary barriers?',
    a: 'Article 12(6) allows controllers to request additional information necessary to confirm the identity of the data subject before responding to a DSAR. This is a security measure — to prevent a malicious third party from obtaining someone else\'s personal data by submitting a DSAR in their name. However, the GDPR and EDPB guidance are clear that identity verification must not create unnecessary barriers or be used to delay or refuse responses. The proportionality test: the verification steps must be proportionate to the type and volume of data at risk. For controllers who have limited data (e.g., an email newsletter subscription with only an email address and first name), requiring a government-issued ID to verify a request from the email address on record is disproportionate. For controllers who hold sensitive data (financial records, health information, location history, detailed behavioral profiles), stronger verification is justified. Verification mechanisms by data sensitivity: (a) Low-sensitivity, low-volume data (email newsletter, basic account): email verification to the address on file (reply from the known address, or click a verification link sent to the email) is proportionate. (b) Standard SaaS accounts: account login + email confirmation. Require the request to come from the verified email address associated with the account. For account holders, in-app DSAR submission (logged in) is the gold standard — the authentication step IS the identity verification. (c) High-value accounts or sensitive data: may request verification of an account-specific identifier (transaction ID, account number) in addition to email verification. This is proportionate when the data is financial or health-related. (d) High-risk requests (request for comprehensive data history, or requests from unverified external parties): may request additional documentary evidence proportionate to the risk. What is NOT acceptable: (a) Requiring a copy of government ID for all requests regardless of data sensitivity — ICO enforcement actions have found this to be disproportionate for standard account data; (b) Requiring notarized documentation; (c) Requiring requests in a specific format (you cannot require a formal letter when an email is sufficient to identify the person); (d) Using identity verification as a delay tactic — the ICO expects verification to be completed quickly so the substantive 1-month response clock can run; (e) Refusing to start the response process until verification is complete when the data subject\'s identity is already reasonably clear from the request. When identity cannot be verified: if the data subject refuses to provide reasonable verification information, the controller may refuse to act on the request (Article 12(2)). The controller must document this decision. For anonymous requests (where the person cannot be identified at all in the controller\'s systems), no DSAR obligation exists — you cannot fulfill a request for personal data for a person you hold no data on and cannot identify.',
  },
  {
    q: 'What information must be included in a GDPR Article 15 access request response, and what format is required?',
    a: 'Article 15 GDPR specifies two distinct components of a right of access response: (1) confirmation of whether personal data about the data subject is being processed, and (2) if so, access to that data plus a body of supplementary information. Controllers must provide all of this, and the omission of any required element makes the response legally incomplete. Component 1 — Confirmation of processing: even if you hold no personal data about the data subject (e.g., the email address does not appear in your systems), you must confirm that fact. "We have searched our systems and found no personal data held about you" is a valid DSAR response. Component 2 — Copy of personal data: a copy of the personal data being processed about the data subject. What this includes: (a) all data in your databases that is linked to or can be linked to that specific individual (name, email, phone, IP address if associated with their account, browsing behavior linked to their account, purchase history, support ticket history, etc.); (b) data in archived or backup systems IF it is reasonably accessible — the GDPR does not require forensic reconstruction of deleted data, but data that could be retrieved with reasonable effort should be included; (c) derived data and inferred data — EDPB Opinion 06/2019 on the right of access: data subjects have the right to access derived data and profiles inferred from their data (e.g., a risk score, a churn propensity score, a customer segment assignment). This is frequently overlooked by SaaS companies. What this excludes: data about other individuals that would require disclosing their personal data. If an email thread includes a third party\'s communications, that third party\'s data may need to be redacted before disclosure. Component 3 — Supplementary information (required even if the person already knows it from your privacy notice): (a) purposes of processing; (b) categories of personal data; (c) recipients or categories of recipients to whom data was/will be disclosed; (d) envisaged retention period or criteria used to determine it; (e) right to request rectification, erasure, or restriction; (f) right to lodge a complaint with a supervisory authority; (g) where data was not collected directly from the data subject — any available information as to source; (h) existence of automated decision-making including profiling, and meaningful information about the logic and the significance and envisaged consequences for the data subject. Format: Article 12(1) requires information to be provided "in a concise, transparent, intelligible and easily accessible form, using clear and plain language." No specific format is mandated. PDF, email body, or a structured document are all acceptable. If the request was made electronically, the response should be provided electronically where possible. A secure portal download link is acceptable for large data packages. Language: the response should be in the same language as the request unless the data subject agrees otherwise. Free copies: the first copy is free. Additional copies requested by the same person: you may charge a "reasonable fee based on administrative costs." The GDPR does not define "reasonable" — ICO guidance suggests it should reflect the actual cost of providing the copy.',
  },
  {
    q: 'What are the 12 categories of exemptions to GDPR data subject rights, and when can a UK GDPR or EU GDPR controller use them?',
    a: 'Article 23 GDPR allows EU Member States to restrict the scope of data subject rights through national legislation when such restriction is necessary and proportionate to safeguard specific objectives. These national-law exemptions vary by jurisdiction. The UK GDPR separately gives the UK government the same exemption power, and Schedule 2 of the UK Data Protection Act 2018 codifies the UK exemptions in detail. The most practically relevant exemptions for SaaS and fintech companies are: Exemption category 1 — Crime, taxation, and related purposes (DPA 2018 Schedule 2, Part 1): this exemption applies to processing for the purpose of the prevention or detection of crime, apprehension or prosecution of offenders, or assessment or collection of tax. A fintech company processing transaction data for fraud monitoring may resist access requests that would reveal fraud detection methodologies. This exemption is discretionary — the controller must assess in each case whether applying it is necessary and proportionate. Blanket application of this exemption to all user data is not permissible. Exemption category 2 — Legal professional privilege: data covered by legal professional privilege (communications between a lawyer and client for the purpose of obtaining legal advice, or communications for the purpose of litigation) is exempt from DSAR disclosure. This exemption applies to: correspondence with external legal counsel about the data subject (e.g., a letter from your lawyer advising on how to respond to a complaint from the person making the DSAR); litigation documents prepared in contemplation of or for the purpose of legal proceedings involving that data subject. The exemption does not apply to all legal communications — business advice from an in-house lawyer that is not privileged, or compliance documents, are not covered. Exemption category 3 — Management information (UK DPA 2018): data processed for the purposes of management planning, including management forecasts, management plans, or budgets, is exempt to the extent that providing access would be likely to prejudice the conduct of the business. This exemption applies to: board minutes discussing a specific employee\'s performance before a disciplinary action; workforce restructuring plans that include specific individuals. Exemption category 4 — Negotiations with the data subject: data consisting of records of the intentions of the controller in relation to any negotiations with the data subject is exempt to the extent that providing access would be likely to prejudice the negotiations. This exemption applies to: internal settlement offers under discussion, commercial negotiation positions. Exemption category 5 — Examination scripts and exam marks: academic/educational context — not typically relevant for SaaS companies. Exemption category 6 — Research, statistics, and archiving: data processed for scientific or historical research, or statistical purposes (and the research is in the public interest and results are published anonymously) is exempt to the extent providing access would seriously impair the purpose. Exemption category 7 — Journalism and media: data processed for special purposes (journalism, artistic and literary expression) can resist some rights. Exemption category 8 — Social work and regulatory activity: not typically relevant for SaaS companies. Exemption category 9 — Auditing: data processed for the purposes of auditing accounts is exempt where the data is necessary for audit purposes. Exemption category 10 — Disclosures prohibited by an enactment: where a statute prohibits disclosure, the DSAR exemption applies. For financial services companies: some prudential regulatory data may be exempt. Exemption category 11 — Confidential references: references given in confidence by an employer, educational institution, etc. Exemption category 12 — Consumer credit reference: data held by credit reference agencies that is exempt under specific credit legislation. How to document exemption use: when a controller invokes an exemption, the decision must be documented (the exemption relied on, the specific data withheld, and the proportionality assessment). Blanket application of exemptions without individual assessment is a compliance risk — the ICO expects controllers to apply exemptions on a case-by-case basis, not as default data protection avoidance tactics.',
  },
  {
    q: 'How should a SaaS company build an operational DSAR process, and what tools and documentation are required?',
    a: 'Building an operational GDPR DSAR process is one of the most overlooked compliance obligations for growth-stage SaaS companies — most invest in privacy policies and cookie banners but discover during the first real DSAR that they have no systematic way to search their systems, no intake workflow, and no template response. A functioning DSAR process requires: Component 1 — DSAR intake mechanism: every website that processes EU/UK personal data must have a publicly accessible way to submit a data subject rights request. Required: (a) a dedicated email address or web form for DSARs — not a general "contact us" form where DSAR requests can get lost; (b) auto-acknowledgment confirming receipt and starting the clock; (c) date-stamping with unique ticket ID for tracking. The DPA and ICO expect requests to be recognizable to any member of staff — if a user emails support saying "I want to know what data you have on me," that IS a valid DSAR even if it wasn\'t submitted through the official DSAR channel. Train support staff to flag any such email to whoever owns DSAR compliance. Component 2 — Data mapping and discovery: the core technical challenge of DSAR fulfillment. To provide a complete response, you must know where personal data is stored. A DSAR process without a data map (a record of the categories of personal data held, the systems they\'re stored in, and how to export them) produces incomplete or inconsistent responses. Required data map elements for DSAR response: (a) Primary production database: user profile data, account data, purchase history, usage logs. Document the exact SQL query or API call that extracts all data for a specific user_id/email. (b) Analytics systems: Mixpanel, Amplitude, Segment, Heap — user behavior data often held here separately from your production DB. Many analytics vendors support DSAR export via their API or a subject request tool. (c) Customer support system: Zendesk, Intercom, Freshdesk — support tickets, chat logs. (d) Email marketing: Mailchimp, HubSpot, Customer.io — subscription history, email engagement data. (e) Payment processor: Stripe, Braintree — card data is held at the payment processor, NOT by you (if using a compliant integration), but the payment processor holds personal data about your users and has their own DSAR obligations. You can direct the data subject to the payment processor for payment-specific data. (f) Backups: specify your backup retention policy — if backups are encrypted and not routinely accessed, they may be outside the scope of "reasonably accessible" data. Document this position. (g) Third-party analytics: Google Analytics, Mixpanel, etc. — typically anonymized (if configured correctly), but if the data can be linked back to an individual, it\'s in scope. (h) LLM or AI training data: if you\'ve used customer data for model training, this is increasingly a DSAR risk area. Component 3 — Response templates: create standard templates for: (a) Acknowledgment (immediate on receipt); (b) Identity verification request; (c) Full access response (the Article 15 package); (d) Refusal/exemption letter (citing specific exemption relied upon); (e) Extension notification (sent within 1 month if extension needed). Component 4 — Records keeping: document every DSAR received, date received, date acknowledged, identity verification completed, response sent, any exemptions applied, and reason for any extension. The ICO expects controllers to be able to demonstrate compliance — the DSAR log is evidence. Component 5 — Third-party processor coordination: if personal data is processed by sub-processors, you must coordinate with them for DSAR fulfillment. Your DPAs with sub-processors should require them to assist with DSARs within a specific timeframe (commonly 10 working days, to give you time to compile the full response by day 28 of your 30-day clock). Component 6 — Right to erasure ("right to be forgotten") workflow: erasure requests are more complex than access requests because you must: (a) verify the legal basis for deletion (not all data can be deleted — data subject to legal hold, financial records required for tax compliance, fraud prevention data); (b) delete from all systems (production, backups — note that backup deletion may need to wait for the next backup cycle); (c) notify third parties to whom the data was disclosed; (d) document what was deleted and what was retained (with legal basis for retention). The 1-month timeline applies to erasure responses as well. Component 7 — Automated decision-making disclosure: if your product uses automated decision-making (credit scoring, risk assessment, fraud scoring, recommendation engines), Article 22 requires you to explain: the logic involved, the significance, and the envisaged consequences.',
  },
]

export default function GdprDsarResponseGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'GDPR Data Subject Rights & DSAR Response Guide (2025): 30-Day Deadline, Exemptions, Verification, and Operational Process',
    description: 'GDPR DSAR operational guide: 8 data subject rights taxonomy, 30-day response deadline (3-month extension conditions), proportionate identity verification, Article 15 response content requirements, 12 exemption categories, and how to build an operational DSAR process.',
    url: 'https://bizlegal-ai.com/guides/gdpr-dsar-response-guide',
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
      { '@type': 'ListItem', position: 3, name: 'GDPR DSAR Response Guide', item: 'https://bizlegal-ai.com/guides/gdpr-dsar-response-guide' },
    ],
  }

  const RIGHTS_TABLE = [
    { article: 'Art. 13-14', right: 'Right to be Informed', trigger: 'Proactive — at collection', absolute: 'Yes (with exceptions)', responseRequired: 'Privacy notice publication', dsarCommon: 'Rare' },
    { article: 'Art. 15', right: 'Right of Access', trigger: 'Data subject request', absolute: 'Conditional (exemptions apply)', responseRequired: 'Full data export + supplementary info', dsarCommon: '⭐ Most common' },
    { article: 'Art. 16', right: 'Right to Rectification', trigger: 'Data subject request', absolute: 'Yes', responseRequired: 'Correction + notify recipients', dsarCommon: 'Common' },
    { article: 'Art. 17', right: 'Right to Erasure (Forgotten)', trigger: 'Data subject request', absolute: 'Conditional (Art. 17(3) exceptions)', responseRequired: 'Delete or refuse with legal basis', dsarCommon: '⭐ Very common' },
    { article: 'Art. 18', right: 'Right to Restriction', trigger: 'Data subject request', absolute: 'Conditional', responseRequired: 'Pause processing; retain data', dsarCommon: 'Moderate' },
    { article: 'Art. 20', right: 'Right to Portability', trigger: 'Data subject request', absolute: 'Narrow (consent/contract + auto)', responseRequired: 'Machine-readable export', dsarCommon: 'Moderate' },
    { article: 'Art. 21', right: 'Right to Object', trigger: 'Data subject objection', absolute: 'Absolute for direct marketing', responseRequired: 'Stop or demonstrate override grounds', dsarCommon: '⭐ Direct marketing — absolute' },
    { article: 'Art. 22', right: 'Automated Decision-Making', trigger: 'Data subject request', absolute: 'Conditional (contract/law/consent)', responseRequired: 'Human review + explanation', dsarCommon: 'Emerging' },
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
          GDPR Data Subject Rights &amp; DSAR Response Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          GDPR &amp; Privacy
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          GDPR Data Subject Rights &amp; DSAR Response Guide (2025): 30-Day Deadline, Exemptions, Identity Verification, and Building an Operational Process
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          A GDPR data subject access request (DSAR) received with no operational process in place is one of the most stressful compliance events a startup faces — a 30-day legal deadline, a legal obligation to search every system where you hold personal data, and real enforcement risk from the ICO or national DPAs if the response is incomplete, delayed, or uses identity verification as a barrier. This guide covers the 8 GDPR data subject rights, the 1-month deadline and 3-month extension conditions, Article 15 response content requirements, 12 exemption categories, and what an operational DSAR process should look like before you receive the first request.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>GDPR Data Subject Rights — Quick Reference</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '620px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Article</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Right</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Trigger</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Absolute?</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Response Required</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>DSAR Frequency</th>
                </tr>
              </thead>
              <tbody>
                {RIGHTS_TABLE.map(({ article, right, trigger, absolute, responseRequired, dsarCommon }) => (
                  <tr key={article} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, verticalAlign: 'top', whiteSpace: 'nowrap' }}>{article}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, verticalAlign: 'top' }}>{right}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top', opacity: 0.85 }}>{trigger}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top' }}>{absolute}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top', opacity: 0.8 }}>{responseRequired}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top' }}>{dsarCommon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your Privacy Policy for GDPR Compliance Gaps</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your privacy policy, data processing agreement, or data retention policy. BizLegal AI checks whether your privacy notice includes all 8 required information elements under Articles 13-14, verifies your data subject rights section describes all 8 rights accurately including the narrow portability right (consent/contract only), flags missing DSAR contact mechanisms, identifies whether your automated decision-making disclosure is adequate, and reviews your data retention disclosures against EDPB guidelines.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Privacy Policy →
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
            <Link href="/guides/gdpr-legitimate-interests-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR Legitimate Interests →</Link>
            <Link href="/guides/ccpa-cpra-compliance-checklist" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>CCPA/CPRA Checklist →</Link>
            <Link href="/guides/data-breach-response-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Data Breach Response Guide →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. GDPR data subject rights obligations, exemptions, and enforcement priorities vary by EU Member State implementing legislation, UK GDPR (post-Brexit), and the specific facts of each data subject request. Identity verification requirements are fact-specific and depend on data sensitivity, data volume, and the risk of unauthorized disclosure. Consult qualified GDPR counsel and your national supervisory authority guidance for jurisdiction-specific DSAR compliance obligations.
          </p>
        </footer>

      </main>
    </>
  )
}
