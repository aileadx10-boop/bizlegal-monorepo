import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CCPA / CPRA Compliance Checklist for SaaS Startups (2025) | BizLegal AI',
  description: 'Does CCPA apply to your SaaS company? The 3 thresholds, 12 required disclosures, 6 consumer rights, sensitive personal information rules, opt-out of sale/sharing, and the CPRA Privacy Protection Agency enforcement powers — with CPRA fines up to $7,500 per violation.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/ccpa-cpra-compliance-checklist' },
  openGraph: {
    title: 'CCPA / CPRA Compliance Checklist — BizLegal AI',
    description: 'CCPA and CPRA applicability thresholds, consumer rights (deletion, portability, correction, opt-out of sale), sensitive personal information rules, CPPA enforcement, and SaaS-specific compliance obligations.',
    url: 'https://bizlegal-ai.com/guides/ccpa-cpra-compliance-checklist',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'Does CCPA / CPRA apply to my SaaS company?',
    a: 'The California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA), applies to for-profit businesses that: (1) do business in California; AND (2) meet ANY ONE of the following three thresholds: (a) annual gross revenues over $25 million in the preceding calendar year; (b) annually buy, sell, or share the personal information of 100,000 or more California consumers or households; or (c) derive 50% or more of annual revenues from selling California consumers\' personal information. "Doing business in California" is interpreted broadly — it includes online businesses with California-resident customers, even if the company has no physical presence in the state. The $25M revenue threshold catches most growth-stage SaaS companies earlier than founders expect. Once a company crosses $25M in ARR, CCPA/CPRA compliance is mandatory regardless of data volume. Important nuances: (1) The "selling or sharing" threshold: even if you never sell data, if your SaaS product reaches 100,000+ California consumer accounts through organic growth, you trigger the threshold. (2) Employee data: from January 1, 2023, CCPA/CPRA applies to employee personal information, job applicant data, and business contact data — removing the prior B2B and employee exemptions. (3) B2B SaaS: your SaaS product may process personal data of your business customers\' employees and end-users — you may be acting as a "service provider" (the CCPA equivalent of a data processor) on behalf of your customer. In that case, your Data Processing Agreement (DPA) or Service Provider Agreement needs CCPA-compliant terms. (4) Territorial scope: the CCPA/CPRA applies to personal information of California residents regardless of where that data is processed, stored, or accessed.',
  },
  {
    q: 'What are the 6 consumer rights under CCPA / CPRA that SaaS companies must support?',
    a: 'California residents (consumers) have the following rights under CCPA as amended by CPRA, effective January 1, 2023: (1) Right to Know — consumers can request disclosure of: what categories of personal information the business collects; the specific pieces of personal information held about them; the categories of sources from which information was collected; the business purpose for collection; and the categories of third parties with whom information is shared. Response deadline: 45 days (extendable once by another 45 days with notice). (2) Right to Delete — consumers can request deletion of personal information. Businesses must also direct service providers to delete the information. Exceptions: information necessary for completing a transaction; detecting security incidents; complying with a legal obligation; or otherwise exercising free speech. Response deadline: 45 days. (3) Right to Correct — CPRA added this right (not in original CCPA). Consumers can request correction of inaccurate personal information. Businesses must use commercially reasonable efforts to correct. (4) Right to Opt-Out of Sale/Sharing — consumers can opt out of: the sale of their personal information to third parties; and (CPRA expansion) the sharing of personal information for cross-context behavioral advertising. Businesses must honor opt-out signals from global privacy controls (GPCs) like browser extensions — this is the most operationally complex requirement for SaaS companies with advertising technology. Must provide a "Do Not Sell or Share My Personal Information" link on the homepage. (5) Right to Limit Use of Sensitive Personal Information — CPRA created a new right to limit the use and disclosure of sensitive personal information (SPI) to purposes necessary for providing the service. SPI categories: social security number; financial account numbers; precise geolocation; racial/ethnic origin; religious or philosophical beliefs; union membership; contents of mail/email/text messages; genetic data; biometric data; health data; sex life or sexual orientation data. (6) Right to Non-Discrimination — businesses cannot discriminate against consumers who exercise their CCPA/CPRA rights (denying services, charging higher prices, providing lower quality service). Businesses CAN offer financial incentives for providing data, if disclosed and not so disproportionate as to constitute a penalty for opting out.',
  },
  {
    q: 'What is required in a CCPA-compliant privacy notice?',
    a: 'CCPA/CPRA requires two types of privacy disclosures, with specific required content: (1) Privacy Notice at Collection (at-collection notice): Required at or before collecting personal information. Must disclose: categories of personal information to be collected; the purposes for which it will be used; whether any category is sold or shared (and if so, to whom); and a link to the full privacy policy. For online businesses, this notice is typically embedded in a "cookie consent" banner or just-in-time notice when a user starts a sign-up flow. (2) Full Privacy Policy: Must include all CCPA/CPRA required disclosures and be accessible via a link on the homepage. Required contents: the 11 categories of personal information under CCPA; specific categories the business collects; purposes for collection; how long personal information is retained (or criteria used to determine retention period — this is a CPRA addition); categories of third parties with whom information is shared; whether personal information is sold or shared for behavioral advertising; consumer rights summary and how to exercise them; contact information for submitting requests; date of last update. The CPRA added a requirement to disclose retention periods (or criteria) — many SaaS privacy policies do not include this and are therefore non-compliant with CPRA as of January 1, 2023.',
  },
  {
    q: 'What are the CCPA / CPRA service provider agreement requirements for B2B SaaS?',
    a: 'If your SaaS product processes personal information on behalf of a business customer (as opposed to collecting it in your own right), you are likely a "service provider" under CCPA/CPRA — roughly equivalent to a "data processor" under GDPR. This matters because CCPA/CPRA imposes specific contractual requirements on service provider relationships: Required service provider agreement terms: (1) Business purposes for which personal information is disclosed (limited list — service providers cannot use the data for any other purpose); (2) Prohibition on selling or sharing personal information received from the business; (3) Prohibition on collecting, using, retaining, or disclosing personal information outside the specified business purposes; (4) Obligation to assist the business in responding to consumer rights requests (right to know, delete, correct); (5) Obligation to assist the business in meeting its CCPA/CPRA obligations; (6) Obligation to provide same level of privacy protection as required by CCPA; (7) Right for the business to audit the service provider\'s compliance; (8) Obligation to notify the business if service provider can no longer comply; and (9) Obligation to pass-through CCPA requirements to any sub-service providers ("subprocessors" in GDPR terminology). Without a CCPA-compliant service provider agreement, the disclosure of personal information from your SaaS customer to you may constitute a "sale" of personal information — subjecting your customer to CCPA opt-out requirements and exposure. Most SaaS companies need to update their DPA or online service terms to include these elements if they have California-based business customers.',
  },
  {
    q: 'What are the CPRA enforcement powers and fine amounts?',
    a: 'The California Privacy Protection Agency (CPPA), created by CPRA and operational since 2023, has independent enforcement authority separate from the California Attorney General. CPPA enforcement: The CPPA can: conduct investigations and issue subpoenas; hold adjudicatory hearings; impose administrative fines; refer cases to the Attorney General for civil enforcement. CPPA rulemaking: The CPPA has authority to create new regulations implementing CCPA/CPRA — including additional consumer rights, new categories of sensitive data, and cybersecurity audit requirements. The CPPA has been active in issuing regulations on automated decision-making technology (ADMT) and data broker registration. Fine amounts: $2,500 per violation for unintentional violations; $7,500 per violation for intentional violations or violations involving children\'s data. "Per violation" is interpreted as per consumer per violation — a data breach exposing records of 50,000 California consumers, if found to involve a CCPA failure, could theoretically be calculated as up to $375M in fines ($7,500 × 50,000). The Attorney General and CPPA have discretion in how violations are counted, and to date enforcement actions have resulted in consent decrees rather than maximum theoretical penalties. Attorney General enforcement: the California AG can also bring CCPA enforcement actions. AG enforcement focuses on: failure to implement required privacy practices; failure to respond to consumer rights requests; unlawful selling/sharing of personal information without disclosures; and failure to maintain DPAs with service providers. 30-day cure period (eliminated by CPRA for most violations as of January 1, 2023 — businesses no longer have an automatic right to cure before fines are imposed).',
  },
  {
    q: 'How does CCPA / CPRA interact with GDPR for SaaS companies processing California and EU data?',
    a: 'SaaS companies with both California consumers and EU customers face a dual compliance obligation. The regimes overlap in significant ways and diverge in others: Key similarities (making dual compliance more efficient): (1) Both require a detailed privacy notice at collection; (2) Both require a legal basis or disclosed purpose for data processing; (3) Both grant rights to access, delete, and port data; (4) Both require data processing agreements with service providers/processors; (5) Both require security measures proportionate to the risk of the data processed. Key differences (requiring separate compliance measures): (1) Legal bases: GDPR requires one of six legal bases (consent, legitimate interests, contract, legal obligation, vital interests, public task). CCPA/CPRA does not require a legal basis — it focuses on disclosure and opt-out rights rather than pre-authorization requirements; (2) Children\'s data: GDPR requires explicit consent from parents for children under 13 (or 16 in some EU countries). CCPA requires opt-in consent from consumers under 16 for the sale of their data, and parental consent under 13. CPRA creates enhanced protections for minors\' data with higher fines; (3) Retention: GDPR requires a specific retention period or criteria. CPRA added a similar disclosure requirement but does not mandate a specific period; (4) Data transfer mechanisms: GDPR requires SCCs, adequacy decisions, or other transfer mechanisms for EU personal data flows outside the EEA. CCPA/CPRA has no equivalent international transfer restriction; (5) Enforcement model: GDPR enforcement through national Data Protection Authorities (DPAs) with EU-wide coordination. CCPA through California AG + CPPA. Practical dual-compliance approach: a GDPR-compliant privacy program is generally more stringent and will satisfy most CCPA/CPRA obligations as a floor — but CPRA-specific requirements (opt-out of sharing for behavioral advertising, GPC signal compliance, service provider contract terms) must be addressed separately.',
  },
]

export default function CcpaCpraComplianceChecklistPage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'CCPA / CPRA Compliance Checklist for SaaS Startups (2025)',
    description: 'CCPA applicability thresholds, 6 consumer rights, privacy notice requirements, service provider agreement terms, CPPA enforcement powers, and GDPR/CCPA dual-compliance strategy for SaaS companies.',
    url: 'https://bizlegal-ai.com/guides/ccpa-cpra-compliance-checklist',
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
      { '@type': 'ListItem', position: 3, name: 'CCPA / CPRA Checklist', item: 'https://bizlegal-ai.com/guides/ccpa-cpra-compliance-checklist' },
    ],
  }

  const APPLICABILITY = [
    { threshold: 'Revenue threshold', test: 'Annual gross revenues > $25M (preceding calendar year)', triggers: 'Applies once $25M ARR is crossed — regardless of California data volume', notes: 'Most growth-stage SaaS crosses this by Series B' },
    { threshold: 'Data volume threshold', test: 'Buys, sells, or shares personal info of ≥ 100K CA consumers or households annually', triggers: 'Counts individual consumer records — user signups count', notes: 'Popular SaaS products reach 100K California users faster than expected' },
    { threshold: 'Revenue-from-data threshold', test: '≥ 50% of annual revenue from selling California consumers\' personal information', triggers: 'Applies to data broker, ad-supported, and data resale businesses', notes: 'Rarely applies to pure B2B SaaS; applies to consumer ad-tech' },
  ]

  const CONSUMER_RIGHTS = [
    { right: 'Right to Know', deadline: '45 days (+ 45 extension)', scope: 'Categories, specific pieces, sources, purposes, third-party sharing' },
    { right: 'Right to Delete', deadline: '45 days (+ 45 extension)', scope: 'All personal info (with enumerated exceptions); must flow to service providers' },
    { right: 'Right to Correct (CPRA)', deadline: '45 days (+ 45 extension)', scope: 'Inaccurate personal information — commercially reasonable efforts' },
    { right: 'Right to Opt-Out of Sale/Sharing', deadline: '15 business days to implement', scope: 'Sale to 3rd parties; sharing for cross-context behavioral advertising; honor GPC signals' },
    { right: 'Right to Limit SPI Use (CPRA)', deadline: '15 business days', scope: 'Sensitive PI: SSN, financial, geolocation, health, biometric, racial/ethnic, sexual orientation' },
    { right: 'Right to Non-Discrimination', deadline: 'Ongoing obligation', scope: 'Cannot deny service, charge more, or degrade service for exercising rights' },
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
          CCPA / CPRA Checklist
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Privacy Law
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          CCPA / CPRA Compliance Checklist for SaaS Startups (2025)
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          The California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA), is now enforced by an independent agency with $7,500-per-violation fine authority. CPRA removed the 30-day automatic cure period as of January 1, 2023. If your SaaS company has crossed $25M in revenue or 100,000 California users, this checklist covers every compliance obligation you need to address.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>CCPA / CPRA Applicability Thresholds</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
            CCPA/CPRA applies to for-profit businesses that do business in California AND meet ANY ONE of these thresholds:
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Threshold</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Test</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>SaaS Notes</th>
                </tr>
              </thead>
              <tbody>
                {APPLICABILITY.map(({ threshold, test, triggers, notes }) => (
                  <tr key={threshold} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{threshold}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8, fontSize: '0.825rem' }}>{test}<br /><span style={{ color: '#dc2626', marginTop: 4, display: 'block', fontSize: '0.8rem' }}>{triggers}</span></td>
                    <td style={{ padding: '10px 12px', opacity: 0.65, fontSize: '0.8rem', fontStyle: 'italic' }}>{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>6 Consumer Rights You Must Support</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Right</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Response Time</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Scope</th>
                </tr>
              </thead>
              <tbody>
                {CONSUMER_RIGHTS.map(({ right, deadline, scope }) => (
                  <tr key={right} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{right}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8, whiteSpace: 'nowrap' }}>{deadline}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8, fontSize: '0.825rem' }}>{scope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>CCPA / CPRA Compliance Checklist</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              ['Privacy notice at collection', 'Disclose categories collected, purposes, whether sold/shared, link to full policy — at or before collection.'],
              ['Full CCPA/CPRA privacy policy', 'All required disclosures including retention periods, third-party categories, and consumer rights summary. Update annually.'],
              ['Consumer rights intake mechanism', '"Do Not Sell or Share" link on homepage; webform or email address for rights requests; identity verification process.'],
              ['Global Privacy Control (GPC) signals', 'Technical implementation to recognize and honor GPC browser signals as opt-out of sale/sharing. Required since 2023 CPPA enforcement.'],
              ['Service provider agreements (DPAs)', 'CCPA-compliant DPA with all service providers processing California consumer data. Required terms listed in FAQ above.'],
              ['Employee / applicant privacy notice', 'Separate at-collection notice for employees and job applicants effective January 1, 2023 (CPRA removed employment exemption).'],
              ['Sensitive personal information (SPI) controls', 'If you process SPI categories: purpose limitation, "Limit Use of My Sensitive Personal Information" link on homepage.'],
              ['Annual privacy training', 'Employees who handle consumer inquiries and personal information must receive annual privacy training.'],
              ['Data retention schedule', 'Document retention periods for each category of personal information (CPRA-required disclosure in privacy policy).'],
              ['Security measures', 'Reasonable security measures for personal information. CPPA has authority to mandate cybersecurity audits for high-risk businesses.'],
            ].map(([item, desc]) => (
              <div key={item as string} style={{ display: 'flex', gap: '0.75rem', padding: '0.875rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '8px' }}>
                <div style={{ width: '18px', height: '18px', minWidth: '18px', border: '2px solid var(--color-border, #d1d5db)', borderRadius: '3px', marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{item as string}</div>
                  <div style={{ fontSize: '0.825rem', opacity: 0.7, lineHeight: 1.6 }}>{desc as string}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your Privacy Policy or DPA for CCPA / CPRA Compliance Gaps</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your Privacy Policy or Data Processing Agreement and BizLegal AI checks for missing CPRA-required disclosures (retention periods, SPI categories, GPC compliance), service provider agreement gaps, outdated employee data exemption language, and opt-out mechanism compliance — with specific remediation guidance for each finding.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan for CCPA/CPRA Gaps →
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
            <Link href="/regulations/ccpa" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>CCPA Regulation Hub →</Link>
            <Link href="/guides/gdpr-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR Compliance Checklist →</Link>
            <Link href="/guides/privacy-policy-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Privacy Policy Guide →</Link>
            <Link href="/guides/gdpr-data-processing-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR DPA Guide →</Link>
            <Link href="/guides/startup-compliance-program-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Startup Compliance Program →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. CCPA/CPRA applicability, required disclosures, and compliance obligations are fact-specific and have been subject to ongoing CPPA rulemaking since 2022. This guide reflects California law and CPPA regulations as of 2025. Consult qualified privacy counsel for a compliance assessment specific to your business.
          </p>
        </footer>

      </main>
    </>
  )
}
