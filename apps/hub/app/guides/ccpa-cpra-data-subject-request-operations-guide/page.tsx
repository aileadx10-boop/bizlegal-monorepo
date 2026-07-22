import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CCPA/CPRA Data Subject Request (DSR) Operations Guide (2025): 45-Day Response, Opt-Out of Sale/Sharing, GPC Signal, SPI, Sensitive Personal Information | BizLegal AI',
  description: 'CCPA/CPRA data subject request (DSR) operations guide for SaaS companies: 45-day response deadline (15-day extension), right to know, right to delete, right to opt-out of sale/sharing, right to correct, right to limit SPI use, Global Privacy Control (GPC) signal compliance, verification requirements for DSRs, employee and B2B exemption sunset (January 2023), authorized agent procedures, CPRA enforcement by the California Privacy Protection Agency (CPPA), and AG enforcement actions.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/ccpa-cpra-data-subject-request-operations-guide' },
  openGraph: {
    title: 'CCPA/CPRA Data Subject Request Operations Guide (2025) — BizLegal AI',
    description: 'CCPA/CPRA DSR operations: 45-day response deadline, right to know/delete/opt-out/correct/limit SPI, GPC signal compliance, authorized agent procedures, CPPA enforcement, AG enforcement track record.',
    url: 'https://bizlegal-ai.com/guides/ccpa-cpra-data-subject-request-operations-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What are the CCPA/CPRA consumer rights, and how do the CPRA amendments expand CCPA\'s original framework?',
    a: 'The California Consumer Privacy Act (CCPA), enacted in 2018 and effective January 1, 2020, created four foundational privacy rights for California consumers. The California Privacy Rights Act (CPRA), passed by ballot initiative in November 2020, substantially expanded CCPA effective January 1, 2023 and created the California Privacy Protection Agency (CPPA) as a standalone enforcement agency. Understanding which version of the law applies and what each right covers is critical for building a compliant DSR program. The CCPA\'s original four rights (as of January 1, 2020): (1) Right to Know: consumers may request disclosure of the categories and specific pieces of personal information collected, sold, or disclosed for a business purpose in the preceding 12 months, including the sources, purposes, and third-party recipients. (2) Right to Delete: consumers may request deletion of personal information collected from them, with 9 exceptions (including completing a transaction the consumer requested, detecting security incidents, fulfilling legal obligations, and internal use reasonably aligned with consumer expectations). (3) Right to Opt-Out of Sale: consumers may direct businesses not to sell personal information to third parties. (4) Right to Non-Discrimination: businesses may not discriminate against consumers who exercise their CCPA rights (denial of goods, higher prices, or lower service quality). The CPRA\'s additions effective January 1, 2023: (5) Right to Correct: consumers may request correction of inaccurate personal information. (6) Right to Limit Use of Sensitive Personal Information (SPI): consumers may direct businesses to limit the use of SPI to what is necessary to perform reasonably expected services or for specific permitted purposes. This is a new category of right with no direct equivalent in the original CCPA. (7) Expanded Right to Know (12-month restriction removed): the original CCPA limited Right to Know requests to information collected in the preceding 12 months. The CPRA regulations (effective March 29, 2023) removed this time limitation for requests submitted after January 1, 2022 — consumers can now request disclosure of personal information collected beyond the 12-month period, subject to an exception if compliance would require disproportionate effort. (8) Right to Opt-Out of Sharing: the CPRA expanded the opt-out right to cover "sharing" personal information for cross-context behavioral advertising — even if no money changes hands. This was a critical gap in the original CCPA, where the "sale" definition required a "valuable consideration" exchange that platforms argued did not include behavioral advertising data. The key CPRA definitions: "Sale" (Civil Code § 1798.140(ad)): disclosing personal information to a third party for monetary or other valuable consideration, with specific carve-outs for the consumer\'s direction, the consumer\'s use, and disclosures to service providers/contractors. "Sharing" (Civil Code § 1798.140(ah)): disclosing, making available, or transferring personal information to a third party for cross-context behavioral advertising — regardless of whether money changes hands. Companies that share behavioral targeting data with advertising platforms (Google Ads, Meta Pixel, LinkedIn Insight Tag, programmatic networks) must treat that as "sharing" subject to the opt-out right, even if they receive no direct payment. "Service Provider" vs "Contractor" (CPRA): service providers are those that process personal information under a written contract prohibiting the use of personal information for purposes other than the contracted service. Contractors are the same concept under CPRA, but the term updates and aligns with GDPR\'s "processor" concept. Disclosures to service providers/contractors are not "sales" or "sharing." "Sensitive Personal Information" (SPI) — 9 categories: (1) Social Security, driver\'s license, state ID, passport number; (2) account login credentials (username + password); (3) financial account number + security/access code; (4) precise geolocation; (5) racial or ethnic origin; (6) religious or philosophical beliefs; (7) genetic data; (8) biometric information for identification; (9) personal information concerning a consumer\'s health, sex life, or sexual orientation. Processing SPI triggers additional disclosure obligations and the right to limit SPI use.',
  },
  {
    q: 'What are the exact operational requirements for processing a CCPA/CPRA Data Subject Request (DSR), including the response deadline and verification?',
    a: 'The CCPA/CPRA establishes a precise operational framework for handling DSRs. Failure to comply within the required timeframes or to provide the required disclosures is a violation subject to Civil Code § 1798.155 enforcement by the CPPA. Response timeline: the business must respond to a verifiable consumer request within 45 calendar days of receipt. A 45-day extension is available if the business notifies the consumer within the initial 45-day period that it needs additional time and explains why. The total response period cannot exceed 90 calendar days. For deletion requests: the business must delete personal information from its records AND notify any service providers, contractors, and (where applicable) third parties that received the personal information and direct them to delete — creating a downstream deletion chain. For opt-out requests: the business must process the opt-out within 15 business days of receipt. If the business uses any agent to facilitate the sale or sharing of personal information, it must notify all third parties processing data sold or shared after the opt-out request with instructions to stop use within 90 calendar days. Verification requirements — the most operationally complex aspect: (a) for requests to know specific pieces of information: identity verification at a high level — the consumer must provide at least three pieces of personal information the business holds (name, email, account ID, date of birth, and similar). The business must use "a reasonable degree of certainty" standard. (b) for requests to know categories only: identity verification at a lower "reasonable degree of certainty" — matching two pieces of personal information to records held. (c) for deletion requests: matching two pieces of personal information (same as category request). (d) for opt-out requests: NO identity verification required — opt-out must be honored without verification (to avoid using verification as a friction mechanism to discourage opt-outs). Methods of submission — the business must provide at least two methods for submitting requests: (1) a toll-free telephone number (required); and (2) a website link titled "Do Not Sell or Share My Personal Information" (for online businesses). CPRA added that the link must be at least as prominent as any other link on the homepage. The "Do Not Sell or Share" opt-out link (previously "Do Not Sell My Personal Information" under the original CCPA) must appear on the homepage and in the privacy policy. Authorized agents: consumers may designate an authorized agent to submit requests on their behalf. The business may require: (a) the authorized agent provide proof of authority (signed permission); (b) the consumer directly verify their identity with the business (for requests to know and delete). For opt-out requests made by authorized agents: businesses may only require the agent to provide a signed permission and must process the opt-out without requiring the consumer to directly verify. Response format for "right to know" requests: the business must provide disclosures in a portable format (JSON, XML, CSV, or similar) if the consumer requests a specific format. The response must include: categories of personal information collected, specific pieces of personal information collected (for requests for specific pieces), sources of collection, purpose of collection, categories sold or shared, categories of third parties receiving the information. The business must not require account creation to submit a request (though it may offer it as an option).',
  },
  {
    q: 'What is the Global Privacy Control (GPC) signal, and is a business legally required to honor it under CCPA/CPRA?',
    a: 'The Global Privacy Control (GPC) is a browser/device-level privacy signal developed by the W3C and implemented in privacy-focused browsers (Brave, Firefox with privacy extensions, DuckDuckGo browser) that sends a header (`Sec-GPC: 1`) when consumers visit websites. The CPPA\'s regulations have definitively answered the legal status question: businesses MUST honor the GPC signal as an opt-out of sale and sharing under CCPA/CPRA. California AG enforcement: the California AG has cited non-compliance with the GPC as the basis for CCPA enforcement letters. In October 2022, the AG sent warning letters to businesses citing failure to honor GPC signals as a CCPA violation. CPPA regulations (March 29, 2023): the CPPA\'s final CCPA regulations (11 CCR § 7025) explicitly require that businesses treat a valid GPC signal as a consumer opt-out of sale and sharing — to the same degree as a click on the "Do Not Sell or Share" link. A consumer who has both set the GPC signal AND submitted an opt-out form does not need to do both; the GPC alone is sufficient. What "honoring" the GPC requires: (1) Detecting the `Sec-GPC: 1` header on page load for California consumers; (2) Blocking all data sharing/sale operations for that session — including analytics pixels, advertising tags, and behavioral tracking scripts that transfer personal information to third parties; (3) Storing the opt-out preference (cookie or server-side record) so that the consumer does not need to resend the signal on subsequent visits; (4) Not overriding the GPC with dark patterns — websites may not show a consent banner that asks consumers to "accept" sharing after the GPC has been detected, as this would conflict with the opt-out signal. The GPC and consent mode: Google Tag Manager\'s "Consent Mode" does not automatically honor GPC signals. A business using Google Consent Mode must separately implement GPC detection and configure consent mode to deny analytics and ad_storage when GPC is detected. Practical implementation: (a) server-side: detect `Sec-GPC: 1` in incoming requests; set a session flag; suppress any third-party data shares for flagged sessions; (b) client-side JavaScript: use `navigator.globalPrivacyControl` (returns `true` when GPC is active) to block tag firing before GTM/analytics scripts load; (c) consent management platform (CMP): if using a CMP (OneTrust, Usercentrics, Cookiebot), confirm the CMP has GPC detection built in for California and is configured to block marketing tags when detected. CMPs that have not implemented GPC detection or treat it differently from CCPA opt-outs may create compliance exposure. Geolocation and GPC: the GPC does not contain geographic information — the browser sends `Sec-GPC: 1` regardless of the consumer\'s location. Businesses may use geolocation (IP-based) to limit GPC enforcement to California consumers if they choose, but geolocation is imperfect and many businesses choose to honor GPC globally to simplify compliance. Colorado Privacy Act (CPA), Connecticut CTDPA, and other state laws: Colorado, Connecticut, Texas, and several other states have explicitly required honoring universal opt-out signals. Businesses operating nationally should treat GPC as a nationwide opt-out signal to comply with all applicable state laws.',
  },
  {
    q: 'What is CPRA\'s Sensitive Personal Information (SPI) category, and what does the right to limit SPI use require operationally?',
    a: 'The Sensitive Personal Information (SPI) category is a CPRA innovation with no direct precedent in the original CCPA. It creates a new tier of consumer rights for information that carries higher inherent risk — biometric, financial credentials, health, precise geolocation, and similar categories. The 9 SPI categories (Civil Code § 1798.140(ae)): (1) Social Security number, driver\'s license number, state ID card number, or passport number; (2) account log-in credentials — financial account, debit card, or credit card number — in combination with any required security or access code, password, or credentials allowing access to the account; (3) precise geolocation (location within 1,853 feet / ~1/3 mile radius); (4) racial or ethnic origin; (5) religious or philosophical beliefs; (6) union membership; (7) contents of a consumer\'s mail, email, or text messages unless the business is the intended recipient of the communication; (8) genetic data; (9) biometric information for the purpose of uniquely identifying a consumer; personal information collected and analyzed concerning a consumer\'s health; personal information collected and analyzed concerning a consumer\'s sex life or sexual orientation. Right to limit SPI use: consumers have the right to direct a business to limit the use and disclosure of SPI to what is necessary to perform the services or provide the goods requested by the consumer — and to the following permitted purposes: (a) the business may use SPI to perform the service; (b) detect and respond to security incidents; (c) ensure physical safety of natural persons; (d) resist malicious, deceptive, fraudulent, or illegal actions; (e) ensure the physical safety of natural persons; (f) retain employees and provide short-term transient benefits; (g) verify quality or safety; (h) perform services on behalf of the consumer. The right to limit is OPTIONAL for businesses to offer — a business that does NOT use SPI beyond the permitted purposes listed above is not required to provide the right to limit. However, if a business does process SPI beyond those purposes (e.g., using precise geolocation for advertising targeting, or sharing health-related data with advertising platforms), it MUST provide the right to limit and must honor exercises of that right. "Limit the Use and Disclosure" link: businesses that process SPI for additional purposes beyond the permitted list must provide a separate link on the homepage titled "Limit the Use of My Sensitive Personal Information" (separate from the "Do Not Sell or Share My Personal Information" link). Alternatively, a business may combine both links into a single link that covers both opt-outs ("Limit the Use of My Personal Information" or similar). The CPPA regulations allow combined links if the single link clearly addresses both rights. SPI processing and data maps: for SPI, businesses must identify in their data map: which categories of SPI are collected; what the processing purpose is for each SPI category; whether the purpose is within the CPRA permitted purposes list; if processing beyond permitted purposes, what opt-in consent is obtained or what disclosure is provided. SPI disclosure in privacy policy: the privacy policy must separately disclose: (a) the categories of SPI collected; (b) the purposes for processing each SPI category; (c) the length of time each SPI category is retained; (d) whether SPI is sold or shared; (e) a link to the right to limit SPI use (if applicable). SPI and HR data: as of January 1, 2023, the CCPA employee and B2B exemptions expired. Employee personal information (including biometric data collected for timekeeping, health information for benefits administration, and financial account information for payroll direct deposit) is now fully subject to CCPA/CPRA. This means employees have the right to know, delete, correct, opt-out of sharing, and limit SPI use for their own personal information collected in the employment context.',
  },
  {
    q: 'What is the CPPA\'s enforcement track record, and what are the penalties for CCPA/CPRA violations?',
    a: 'Enforcement of the CCPA/CPRA operates through three channels: the California AG (pre-CPPA, with ongoing authority for some violations), the California Privacy Protection Agency (CPPA, the dedicated enforcement body established by CPRA), and private rights of action for data breaches. Understanding each channel is essential for calibrating compliance investment. California AG enforcement (January 2020 — ongoing): the AG has authority to enforce CCPA violations and can bring civil actions. Under the AG enforcement model: the business receives a 30-day cure period after notice of a violation (the "right to cure" provision was amended by AB 2370 signed September 2024 — see below). Penalties: up to $2,500 per unintentional violation, up to $7,500 per intentional violation or violation involving minor\'s data. The AG is not required to provide a per-violation count — the AG may seek $7,500 per record or per event, making large datasets extremely high-exposure. AG enforcement settlements: Sephora Inc. (2022): $1.2M settlement for failure to disclose sale of personal information and failure to honor opt-out requests (including GPC signals). The Sephora case was the AG\'s first publicly disclosed CCPA enforcement action and established that (a) using advertising pixels constitutes a "sale" of personal information; (b) failure to honor GPC is a violation. DoorDash (2024): $375,000 settlement for sharing customer personal information with a third-party marketing cooperative without proper disclosure or opt-out rights. Tilting Point Media (2023): $500,000 civil penalty for COPPA and CCPA violations regarding children\'s data in mobile games. Multiple warning letters (2023): the AG sent enforcement letters to streaming services for failure to provide opt-out rights for behavioral advertising data shared with streaming measurement vendors. CPPA enforcement (July 1, 2023 — ongoing): the CPPA became the primary enforcement authority for CCPA/CPRA as of July 1, 2023. The CPPA can: initiate its own investigations (without a consumer complaint); issue administrative citations and fines; conduct audits of businesses; issue regulations (which have the force of law). 30-day cure period amendment (AB 2370, effective January 1, 2025): the original CCPA included a 30-day right-to-cure period for all violations. AB 2370 eliminated the right to cure for all violations occurring after January 1, 2025 — businesses no longer receive a warning before penalty. This makes it critical to build a compliant DSR program before a violation occurs. CPPA first enforcement action (2024): the CPPA issued its first enforcement action against a mobile app operator for failure to provide a "Do Not Sell or Share My Personal Information" opt-out link and failure to honor GPC signals. Private right of action — data breach: Civil Code § 1798.150 gives consumers a private right of action for data breaches involving nonencrypted and nonredacted personal information due to the business\'s failure to implement and maintain reasonable security procedures. Statutory damages: $100-$750 per consumer per incident (or actual damages, whichever is greater). No need to prove actual harm — the breach itself triggers the statutory damages claim. This private right of action is limited to the data breach context — it does NOT extend to other CCPA rights violations, which are enforced exclusively by the AG and CPPA. Class action exposure: the private right of action for data breaches creates significant class action exposure. A breach affecting 1 million California residents carries theoretical exposure of $100M-$750M in statutory damages (before reduction by a court). Practical penalty calculation: the "per violation" penalty structure means the exposure multiplies rapidly with the size of the consumer dataset. For a SaaS company with 50,000 California users, a systematic failure to honor opt-out requests could be characterized as 50,000 separate violations at $7,500 each = $375M theoretical exposure.',
  },
  {
    q: 'How do CPRA requirements interact with B2B SaaS companies whose customers are businesses rather than individual consumers — do CCPA/CPRA apply?',
    a: 'The employee and B2B contact exemptions that existed in CCPA\'s original text expired on January 1, 2023 under the CPRA amendments. This is one of the most significant operational changes in the CPRA and directly affects B2B SaaS companies that previously believed they were exempt from most CCPA obligations. Pre-CPRA exemptions (expired January 1, 2023): (1) Employee exception (Civil Code § 1798.145(h), now expired): personal information collected from employees, contractors, and job applicants was previously exempt from most CCPA obligations (right to know, right to delete, right to opt-out of sale). Only the private right of action for data breaches applied to employee data. (2) B2B exception (Civil Code § 1798.145(o), now expired): personal information about a natural person acting as a representative of another business was previously exempt from most CCPA obligations when the personal information was collected solely in the context of a business transaction between two businesses. Post-CPRA (effective January 1, 2023): both exemptions EXPIRED. Employee personal information and B2B contact personal information are NOW fully subject to all CCPA/CPRA rights — right to know, right to delete, right to correct, right to opt-out of sale/sharing, right to limit SPI use, non-discrimination. What this means for a B2B SaaS company: (a) Employee data: if you collect biometric data for timekeeping (fingerprint time clocks), health data for benefits administration, financial account data for payroll, or other SPI categories — your employees now have the right to know, correct, delete, and limit SPI use for that data. You must provide CCPA-compliant privacy notices to employees and a mechanism to submit DSRs. (b) B2B contact data in your CRM: if your CRM contains personal information about individual contacts at other businesses (name, email, phone, job title), those individuals have CCPA rights to know, delete, correct, and opt-out — to the extent they are California residents. (c) Customer data in your SaaS product: if your SaaS product processes personal information of your customers\' end users, the B2B exception analysis requires determining whether YOUR company is the "business" subject to CCPA obligations for that data. Service provider vs business analysis: if your SaaS company processes personal information on behalf of your customer (the controller), and does so under a contract that prohibits use of that data beyond the contracted service, you are a "service provider" under CCPA/CPRA. As a service provider, your customer\'s users have their CCPA rights against the customer (the controller), not against you (the service provider). You must assist the customer in responding to DSRs. However: if your SaaS company uses the personal information of your customer\'s users for YOUR OWN purposes (analytics, model training, product improvement, advertising), you are a "business" for that data processing activity, and you are directly subject to CCPA obligations for it. The service provider vs business line is drawn by the contract and by actual data use practices. Minimum contract requirements for service providers: a Data Processing Agreement (DPA) or Service Provider Agreement must prohibit: (a) selling or sharing the personal information; (b) retaining, using, or disclosing the personal information for any purpose outside the contracted service; (c) retaining, using, or disclosing the personal information beyond the duration of the business relationship; (d) combining the personal information with personal information collected from other sources (with limited exceptions). If your customer agreement lacks these provisions, you risk being classified as a "business" rather than "service provider" for the data you receive, triggering direct CCPA obligations for that data. DSR assistance obligations for service providers: even as a service provider, you must assist the controller in honoring DSRs. When a controller receives a deletion or access request from their consumer, they will typically pass the request to you. Your contract must provide a mechanism for doing so, and you must respond within a reasonable time (CCPA does not specify a deadline for service provider responses to controller-passed requests, but 30-day internal SLAs are common practice).',
  },
]

export default function CCPACPRADSROperationsGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'CCPA/CPRA Data Subject Request (DSR) Operations Guide (2025): 45-Day Response, Opt-Out of Sale/Sharing, GPC Signal Compliance, SPI, Enforcement Track Record',
    description: 'CCPA/CPRA DSR operations guide for B2B SaaS companies: 45-day response deadline (15-day extension available, 90-day max), right to know/delete/correct/opt-out/limit SPI, GPC signal required under CPPA regulations (11 CCR § 7025), authorized agent procedures, verification requirements by request type, Sephora $1.2M enforcement, AB 2370 right-to-cure elimination (January 2025), expiration of employee and B2B exemptions (January 2023), and service provider vs business classification.',
    url: 'https://bizlegal-ai.com/guides/ccpa-cpra-data-subject-request-operations-guide',
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
      { '@type': 'ListItem', position: 3, name: 'CCPA/CPRA DSR Operations Guide', item: 'https://bizlegal-ai.com/guides/ccpa-cpra-data-subject-request-operations-guide' },
    ],
  }

  const DSR_DEADLINES = [
    { right: 'Right to Know', deadline: '45 calendar days', extension: '+45 days (with notice)', maxTotal: '90 days', verificationLevel: 'High (3 data points) for specific pieces; Low (2 data points) for categories' },
    { right: 'Right to Delete', deadline: '45 calendar days', extension: '+45 days (with notice)', maxTotal: '90 days', verificationLevel: 'Low (2 data points)' },
    { right: 'Right to Correct', deadline: '45 calendar days', extension: '+45 days (with notice)', maxTotal: '90 days', verificationLevel: 'Low (2 data points)' },
    { right: 'Right to Opt-Out of Sale/Sharing', deadline: '15 business days', extension: 'None', maxTotal: '15 business days', verificationLevel: 'None required' },
    { right: 'GPC Signal Opt-Out', deadline: 'Immediate (session)', extension: 'None', maxTotal: 'Immediate', verificationLevel: 'None required' },
    { right: 'Right to Limit SPI Use', deadline: '15 business days', extension: 'None', maxTotal: '15 business days', verificationLevel: 'None required' },
    { right: 'Authorized Agent Request', deadline: 'Same as underlying right', extension: 'May verify agent authority', maxTotal: 'Same as underlying right', verificationLevel: 'Signed permission from consumer' },
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
          CCPA/CPRA DSR Operations Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Privacy &amp; Data / California
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          CCPA/CPRA Data Subject Request Operations Guide (2025): 45-Day Response Deadline, Opt-Out of Sale/Sharing, GPC Signal Compliance, Sensitive Personal Information, and Enforcement
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          The CPRA expanded CCPA to six consumer rights, added the Sensitive Personal Information category, created a dedicated enforcement agency (CPPA), and eliminated the employee and B2B exemptions. AB 2370 eliminated the 30-day cure period effective January 2025. This guide covers the full operational requirements for DSR processing, GPC signal compliance, and the enforcement track record.
        </p>

        <div style={{ padding: '1rem 1.25rem', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '8px', marginBottom: '2.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.7 }}>
            <strong>No Cure Period as of January 1, 2025:</strong> AB 2370 eliminated the CCPA&apos;s 30-day right-to-cure provision. Businesses no longer receive a warning notice before penalty imposition. CPPA and AG enforcement can move directly to penalties — making proactive compliance essential before a violation occurs.
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>DSR Response Deadlines and Verification Requirements</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '580px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Consumer Right</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Initial Deadline</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Extension</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Max Total</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Verification Required</th>
                </tr>
              </thead>
              <tbody>
                {DSR_DEADLINES.map(({ right, deadline, extension, maxTotal, verificationLevel }) => (
                  <tr key={right} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, verticalAlign: 'top', fontSize: '0.76rem' }}>{right}</td>
                    <td style={{ padding: '10px 12px', verticalAlign: 'top', fontWeight: 700, color: '#dc2626', fontSize: '0.76rem' }}>{deadline}</td>
                    <td style={{ padding: '10px 12px', verticalAlign: 'top', opacity: 0.75, fontSize: '0.76rem' }}>{extension}</td>
                    <td style={{ padding: '10px 12px', verticalAlign: 'top', fontWeight: 700, fontSize: '0.76rem' }}>{maxTotal}</td>
                    <td style={{ padding: '10px 12px', verticalAlign: 'top', opacity: 0.85, fontSize: '0.75rem' }}>{verificationLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your Privacy Policy, DPA, or Service Provider Agreement for CCPA/CPRA Compliance</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your privacy policy, data processing agreement, or SaaS customer agreement. BizLegal AI reviews for CCPA/CPRA required disclosures (Civil Code § 1798.100-135), service provider vs business classification risk (data use beyond contracted purposes), sale and sharing opt-out mechanisms, GPC signal compliance gaps, SPI disclosure and right-to-limit provisions, DSR submission methods (toll-free number + web form), employee data processing disclosures (post-January 2023 exemption expiration), and authorized agent procedures.
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
            <Link href="/guides/gdpr-dsar-response-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR DSAR Response Guide →</Link>
            <Link href="/guides/gdpr-cookie-consent-eprivacy-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Cookie Consent / ePrivacy Guide →</Link>
            <Link href="/guides/data-retention-deletion-policy-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Data Retention and Deletion Guide →</Link>
            <Link href="/guides/eu-us-data-transfer-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>EU-US Data Transfer Guide →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. CCPA/CPRA law, regulations, and enforcement interpretations evolve continuously. AB 2370 eliminated the right-to-cure period effective January 1, 2025 — verify current enforcement posture with legal counsel. CPPA regulations (11 CCR §§ 7000-7306) are the authoritative source for operational requirements. Compliance determinations are highly fact-specific. Consult qualified privacy counsel before implementing a CCPA/CPRA compliance program.
          </p>
        </footer>

      </main>
    </>
  )
}
