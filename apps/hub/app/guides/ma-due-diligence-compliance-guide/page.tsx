import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'M&A Legal Due Diligence Guide (2025): Compliance Checklist, IP Audit, Employment, Regulatory Red Flags | BizLegal AI',
  description: 'M&A legal due diligence checklist for technology acquisitions: IP ownership verification (PIIA gaps, work-for-hire, assignment completeness), data privacy compliance review (GDPR, CCPA, HIPAA), employment law diligence (classification, equity, non-competes), regulatory licensing gaps, material contract review and change-of-control triggers, litigation reserve analysis, and the 8 deal-killing findings that most often arise in tech M&A diligence.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/ma-due-diligence-compliance-guide' },
  openGraph: {
    title: 'M&A Due Diligence Compliance Guide (2025) — BizLegal AI',
    description: 'M&A due diligence for tech acquisitions: IP audit, data privacy compliance, employment classification, regulatory licensing, material contract change-of-control clauses, and the 8 most common deal-killing diligence findings.',
    url: 'https://bizlegal-ai.com/guides/ma-due-diligence-compliance-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What are the most common deal-killing findings in technology M&A due diligence, and when does each arise?',
    a: 'Technology M&A due diligence surfaces a predictable set of issues that either kill deals outright or result in significant purchase price adjustments, escrow holdbacks, or specific indemnification obligations. Understanding these patterns helps sellers prepare and helps buyers calibrate diligence depth. Deal-killer 1 — IP chain-of-title breaks (PIIA gaps): the most common IP diligence finding in startup acquisitions. PIIA (Proprietary Information and Invention Assignment) agreements with employees and contractors establish that IP created during the employment or contractor relationship belongs to the company. Missing PIIAs (employees who never signed), PIIAs with carve-outs for personal projects that are too broad, or contractors who built core product features without signing an IP assignment create chain-of-title gaps. Chain-of-title breaks mean the company cannot confirm it owns all of its own product IP. In severe cases (a founding engineer or contractor who wrote core product code without signing an IP assignment), the deal cannot close until the deficiency is remediated — either by obtaining the missing assignment (often requiring compensation to the departing person) or, if the person cannot be located or refuses, structuring an indemnification that covers the acquirer. Deal-killer 2 — Unauthorized or undisclosed open source license contamination: GPL/AGPL components embedded in proprietary code (discussed above in the software development agreement context) discovered during technical diligence. Buyers\' counsel will conduct or commission an SCA (Software Composition Analysis) scan as part of IP diligence. AGPL contamination in a proprietary SaaS product is a significant finding: either the target must remediate before closing (rewrite the contaminated portions), the deal is restructured, or the price is reduced to reflect the remediation cost. SSPL (Server-Side Public License, used by MongoDB and Elastic in certain versions) and BSL (Business Source License) add complexity. Deal-killer 3 — Undisclosed regulatory compliance gaps: technology companies serving regulated industries (fintech, health tech, HR tech) are expected by acquirers to hold required licenses, registrations, and authorizations. Missing FinCEN MSB registration for a payments platform, missing state money transmitter licenses, unresolved HIPAA violations, or undisclosed regulatory investigations can be deal-killers or require significant price adjustment. Buyers in regulated industries must conduct fresh regulatory diligence, not simply rely on the target\'s representations. Deal-killer 4 — Data privacy landmines: undisclosed data practices (collecting more data than disclosed in the privacy policy), CCPA/GDPR violations that create enforcement risk post-closing, absence of DPAs with data processors, or pending regulatory investigations (CCPA CPPA investigations, FTC investigations) are increasingly significant in tech M&A. Buyers assume all data privacy liabilities at closing. Deal-killer 5 — PIIA not executed before IP creation: even when employees signed PIIAs, if the PIIA was executed after the employee began work, there may be a question about whether IP created before the PIIA signature date is covered. California pre-invention disclosure law (Cal. Lab. Code § 2870) requires that PIIAs carved out IP developed entirely on the employee\'s own time without using company resources — but PIIAs executed after IP creation may have other enforceability issues. Deal-killer 6 — Change-of-control triggers in material contracts: key customer contracts, enterprise software licenses, partnership agreements, and financing agreements that contain change-of-control provisions requiring consent before an M&A transaction can close. If 30% of the target\'s revenue comes from a single customer whose contract has a change-of-control clause, that customer\'s consent is a material deal condition. Deal-killer 7 — Undisclosed litigation or regulatory enforcement: active litigation (even if management believes it is frivolous), government investigations, demand letters, or tolling agreements not disclosed in the data room create significant acquirer risk. Deal-killer 8 — Stock option plan deficiencies: NSO (non-qualified stock option) vs ISO (incentive stock option) misclassification, failure to obtain board authorization for stock option grants, option exercises below fair market value (Section 409A violation), and option grants above the authorized plan pool are common findings in startup diligence.',
  },
  {
    q: 'What does IP due diligence in a technology acquisition cover, and what documents must be in the data room?',
    a: 'IP due diligence is typically the most extensive and most critical component of technology M&A diligence. Buyers acquire a technology company primarily for its IP — the core product, the proprietary algorithms, the customer data relationships, the brand. If the IP ownership is defective, the deal consideration is not supported. IP diligence covers four main areas. Area 1 — Chain of title for all created IP: the buyer must establish that the target company owns (or has adequate licenses to) all IP incorporated in its products and services. Documents required: (a) all PIIA / CIIAA (Confidential Information and Invention Assignment Agreement) agreements for all current and former employees, contractors, and consultants who contributed to product development; (b) for non-signatories or contractors who signed the company\'s agreement late: remediation plan or IP assignment agreement; (c) co-founder IP assignment agreements (separate from PIIA — at founding, co-founders typically must transfer to the company any IP they created before incorporating that is being used in the company\'s business); (d) software development agreements with third-party developers covering scope of IP assignment, Background IP carve-outs, and open source obligations; (e) joint development agreements and research collaboration agreements (university partnerships, DOE SBIR grants — these may have retained license rights or march-in rights that are incompatible with the acquisition). Area 2 — Registered IP portfolio: copyright registrations (if any — most software companies do not register copyrights but registered copyrights provide significant litigation advantages); trademark registrations and pending applications; patent applications, granted patents, and continuation applications; domain names (registered in the target entity\'s name, not a founder\'s personal name). Area 3 — Third-party IP licenses: all inbound licenses for software, data, APIs, or content incorporated in the product; open source license compliance (SCA scan report); key API licenses (if the product depends on third-party APIs that could be revoked or terminated post-closing, this is a dependency risk); data licensing agreements (market data, financial data, mapping data, etc.). Area 4 — IP agreements with customers and third parties: outbound licenses in customer agreements (NDAs, source code licenses, OEM arrangements); any cross-licensing agreements with competitors; IP indemnification obligations in customer contracts; any side letters or informal IP arrangements not reflected in standard agreements. What the data room must contain: (1) complete PIIA files for all employees and contractors (segregated by person, with hiring date and PIIA execution date for comparison — diligence counsel will flag any date mismatches); (2) IP assignment agreements for contractors who built core product features; (3) co-founder IP assignments (typically executed at or near incorporation); (4) registered IP documentation (USPTO/WIPO/national office filings, prosecution histories, maintenance fee payment records); (5) open source policy and SCA scan report; (6) third-party license agreements; (7) software development agreements; (8) technology-related customer agreements showing outbound IP positions.',
  },
  {
    q: 'How does data privacy and cybersecurity due diligence work in M&A, and what compliance gaps create post-closing liability?',
    a: 'Data privacy and cybersecurity diligence has become a major component of technology M&A since the Verizon/Yahoo acquisition (2017: $350M price reduction post-breach disclosure) and the proliferation of GDPR, CCPA, HIPAA enforcement. Buyers assume all data privacy and cybersecurity liabilities at closing — they become the successor controller or covered entity and inherit all regulatory exposure from the target\'s historical practices. Data privacy diligence scope: (1) Privacy notices and consent mechanisms: do the target\'s privacy policies and app disclosures accurately describe the data actually collected, used, and shared? Are consent mechanisms CCPA and GDPR compliant? Is there a cookie banner with appropriate consent options? (2) Data processing agreement coverage: does the target have signed DPAs with all data processors (cloud infrastructure providers, analytics vendors, email marketing platforms, payment processors, customer support tools)? Missing DPAs with processors handling EU personal data create GDPR exposure that transfers to the acquirer. (3) GDPR and CCPA compliance program: are data subject rights requests (DSARs) operationalized? Is there a data retention and deletion policy? Are data subject rights (access, deletion, portability, correction) being honored? Is there a Records of Processing Activities (RoPA)? (4) Data breach history: disclosure of all past data security incidents, breach notifications sent (to regulators and individuals), and government agency communications relating to data practices. Undisclosed data breaches discovered post-closing create significant liability. (5) Cross-border data transfers: does the target transfer EU personal data outside the EEA? Are transfer mechanisms in place (SCCs, DPF, BCRs)? Are Transfer Impact Assessments documented? (6) Third-party data sources: is any of the target\'s product data sourced from third parties? Does the target have adequate license rights to use that data in the combined business? (7) Sensitive data categories: does the target process special category data under GDPR (health, biometric, race/ethnic origin, financial data under GLBA, children\'s data under COPPA)? Special category processing carries heightened compliance requirements. (8) Data governance: does the target have a data governance program, a DPO (required for many GDPR controllers), and documented privacy-by-design practices? Cybersecurity diligence: (1) Security assessment or pen test results (last 12 months); (2) SOC 2 Type II report or equivalent; (3) Incident response plan and evidence of tabletop exercises; (4) Patch management program (patch lag statistics); (5) Third-party security questionnaire responses and vendor security risk program; (6) Cyber insurance policy (limits, BEC sublimits, exclusions relevant to the target\'s risk profile); (7) Known vulnerabilities, CVEs, or open security findings. Common post-closing data privacy liabilities: (a) CCPA/CPPA investigation triggered by pre-closing practices surfaces post-closing; (b) GDPR DPA fine based on historical data practices; (c) FTC enforcement action for deceptive privacy practices; (d) state AG investigation triggered by data breach notification; (e) class action arising from historical data practices disclosed in breach notification. Acquirer protections: (a) representation and warranty insurance (RWI) covering data privacy reps; (b) specific indemnification for pre-closing data privacy violations with a holdback or escrow; (c) pre-closing remediation conditions (target must complete GDPR DPA agreements with key processors before closing).',
  },
  {
    q: 'What employment law issues are most commonly found in startup M&A diligence, and what do acquirers look for?',
    a: 'Employment law diligence in startup M&A is often underweighted by sellers who are focused on IP and commercial agreements — but employment issues can create substantial post-closing liability, particularly around worker misclassification, equity plan administration, and wage and hour compliance. Employment diligence Issue 1 — Worker misclassification (independent contractor vs employee): startups frequently use independent contractors for roles that state and federal law would classify as employees (Dynamex ABC test in California, IRS 20-factor common law test, FLSA economic realities test). Acquirers look for: contractors who have worked continuously for more than 6-12 months; contractors who are subject to the company\'s direction and control of how work is performed (not just the result); contractors who do their work exclusively or primarily for the target; contractors who work alongside employees in the same functions. The financial exposure from misclassification: back payroll taxes (FICA employer share), back benefits (health insurance, retirement plan, paid leave), state unemployment tax, back overtime pay (for roles that would be non-exempt under FLSA), and potential penalties. In California, misclassification of employees as independent contractors can trigger PAGA (Private Attorneys General Act) claims with per-violation penalties that accumulate rapidly. Employment diligence Issue 2 — Equity plan deficiencies: (a) option grants not authorized by the board — most SaaS startup acquisitions discover at least a few informal equity promises or grant approvals that were not properly documented by board resolution; (b) 409A valuation deficiencies — stock options granted at or above fair market value require a Section 409A independent valuation; options granted without a defensible 409A valuation create income recognition and excise tax risk for the option holders; (c) ISO vs NSO classification errors — ISOs can only be issued to employees, and have specific coverage limitations ($100K/year maximum for options that vest in any calendar year qualifies as ISO); options granted to non-employees (consultants, advisors) must be NSOs; (d) option pool overallocation — options granted that exceed the authorized plan pool require shareholder authorization to retroactively ratify; (e) acceleration provisions — acquirers look carefully at single-trigger vs. double-trigger acceleration; single-trigger acceleration (vesting immediately on change of control regardless of termination) is expensive for acquirers because it creates immediate vesting cost at closing. Employment diligence Issue 3 — Wage and hour compliance: California-based startups in particular are scrutinized for: (a) overtime exemption misclassification (classifying employees as exempt from overtime when they do not meet the California duties test for executive, administrative, or professional exemption); (b) meal and rest break violations; (c) off-the-clock work claims; (d) final paycheck timing violations. Employment diligence Issue 4 — Non-compete agreements with key employees: the enforceability of non-competes with key technical employees depends heavily on the jurisdiction. In California, non-competes with employees are void regardless of where they were signed (SB 699, effective January 1, 2024). If the acquirer plans to relocate the key employees to California or compete in California, existing non-competes may be unenforceable. Employment diligence Issue 5 — Unpaid wages, stock option exercises, and deferred compensation: any arrangement that deferred cash compensation (founder salary deferrals, unpaid bonuses accrued but not paid) must be identified and accounted for as a current liability in the purchase price calculation.',
  },
  {
    q: 'What are change-of-control provisions in material contracts, and how do acquirers identify and manage them in M&A?',
    a: 'Change-of-control (COC) provisions in material contracts are among the most operationally significant diligence findings because they determine whether the acquirer can operate the business on the same terms post-closing — or whether significant consent-seeking, renegotiation, or deal restructuring is required before or after closing. What is a change-of-control provision: a contractual clause that grants a counterparty the right to terminate the contract, withhold consent to assignment, adjust pricing, or take other material action upon a "change of control" of one of the parties. A change of control is typically defined as: (a) a merger or consolidation where existing shareholders no longer hold a majority of the surviving entity; (b) an acquisition of a controlling interest in the target (commonly >50%, sometimes >20% depending on drafting); (c) a sale of all or substantially all assets; (d) a change in a majority of the board of directors over a 12-24 month period. Where COC provisions are most commonly found: Customer enterprise agreements (SaaS): many enterprise contracts (especially government contracts, financial institution contracts, healthcare system contracts) require consent to assignment in connection with a change of control. A SaaS target with $5M ARR from 3 enterprise contracts that all require consent creates a significant risk that revenue does not survive the transaction. Key software licenses: enterprise software licenses (Salesforce, ServiceNow, SAP, Oracle, Databricks) frequently restrict assignment without licensor consent. If the target uses these licenses in its product or operations, the acquirer must either negotiate consent from the licensors or address the license gap before go-live. Partnership and channel agreements: exclusive distribution agreements, reseller agreements, co-development agreements, and strategic alliance agreements commonly include change-of-control provisions that allow the partner to terminate the exclusivity or the agreement itself. Debt instruments: convertible notes, term loans, and revolving credit facilities typically include change-of-control as an event of default or an early repayment trigger. Real estate leases: commercial leases commonly restrict assignment. Data licenses: data providers (market data, financial data, insurance data) often restrict transfer of data licenses. How acquirers identify COC provisions: (1) diligence counsel reviews all material contracts for (a) anti-assignment clauses; (b) explicit COC definitions; (c) consent requirements on M&A events. (2) the target provides a COC contract schedule identifying all contracts with material COC provisions. (3) counsel prioritizes consent-seeking for contracts above a revenue or strategic importance threshold (e.g., any customer contract with >$500K ARR). Strategies for managing COC provisions: (a) Pre-signing consent: solicit critical consents before the deal is publicly announced (requires NDA with the counterparty and care to protect deal confidentiality). (b) Post-closing consent: obtain consents between signing and closing as a condition to closing. (c) Notification without consent: if the COC provision only requires notice (not consent), provide timely notice post-closing. (d) Deal structure optimization: an asset purchase may not trigger all COC provisions that a stock purchase would (assignment occurs in asset deals; stock transfers may not constitute an "assignment"). (e) Indemnification: if consent cannot be obtained, the seller may provide specific indemnification for revenue lost from counterparties that terminate upon the change of control.',
  },
  {
    q: 'What is the structure of a technology M&A representation and warranty insurance (RWI) policy, and what coverage gaps exist?',
    a: 'Representation and warranty insurance (RWI) has become nearly universal in technology M&A transactions above $20M and increasingly common in smaller transactions. RWI shifts the risk of breaches of the seller\'s representations and warranties from the seller (and the seller\'s escrow) to an insurance carrier. Understanding RWI structure helps sellers and buyers alike prepare for diligence and negotiate appropriate terms. Basic RWI structure: the insured party is typically the buyer (buyer-side RWI is standard in US M&A — it protects the buyer against losses resulting from seller\'s rep and warranty breaches). The insurer pays claims directly to the buyer without requiring the buyer to pursue the seller first (except for fraud — see below). The policy period is typically 3 years for general reps and warranties, 6 years for fundamental reps (due organization, authority, capitalization, IP ownership) and tax reps. Retention (deductible): the buyer typically bears the first portion of losses (commonly 0.5%-1% of transaction value). The retained amount functions as a deductible. Coverage limit: typically 10%-20% of transaction value, with some policies at up to 30% for core IP reps. What RWI covers: breaches of the seller\'s representations and warranties in the purchase agreement (IP ownership, financial statements, material contracts, litigation disclosures, employment compliance, data privacy, environmental, and others). What RWI does NOT cover: (1) Known issues — any matter disclosed in the data room or disclosed in writing to the buyer during diligence is a "known" matter that is excluded from coverage. This is the most significant coverage gap: all items in the diligence report that remain unresolved at closing are known to the buyer and excluded. (2) Forward-looking representations — RWI covers breaches of historical facts (what was true at closing), not projections. (3) Fraud by the seller — RWI policies universally exclude seller fraud, though the buyer can sometimes obtain coverage for non-seller-party (seller employee) fraud. (4) Environmental (typically excluded unless specific environmental reps coverage is added). (5) Pension liabilities and post-closing benefits. (6) Secondary tax positions — uncertain tax positions are often excluded. (7) Data privacy — this is the most evolving exclusion. Many RWI carriers exclude data privacy violations entirely or add specific sublimits and enhanced retention for data privacy representations. If data privacy is a significant risk category (the target processes significant personal data), the buyer may need a specific cyber liability tail policy in addition to RWI. Underwriting process: RWI underwriters conduct their own abbreviated diligence review (1-2 days of diligence calls) before binding. Underwriters routinely add specific exclusions for issues identified in diligence (e.g., the target\'s open source compliance program gaps → open source reps excluded from coverage). This exclusion process is why pre-closing remediation of diligence findings is valuable — an unresolved issue becomes a known exclusion, increasing the buyer\'s uninsured exposure. Premium: typically 2.5%-4.5% of coverage limit, or approximately 0.25%-0.9% of deal value.',
  },
]

export default function MaDueDiligenceGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'M&A Legal Due Diligence Guide (2025): IP Audit, Data Privacy, Employment, Change-of-Control, RWI',
    description: 'M&A due diligence for technology acquisitions: IP chain-of-title, open source contamination, data privacy compliance gaps, employment misclassification, change-of-control triggers, and representation and warranty insurance structure.',
    url: 'https://bizlegal-ai.com/guides/ma-due-diligence-compliance-guide',
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
      { '@type': 'ListItem', position: 3, name: 'M&A Due Diligence Compliance Guide', item: 'https://bizlegal-ai.com/guides/ma-due-diligence-compliance-guide' },
    ],
  }

  const DILIGENCE_CATEGORIES = [
    { category: 'IP Chain of Title', keyItems: 'PIIAs for all employees/contractors, co-founder IP assignments, third-party dev agreements, SCA open source scan', dealKiller: '⚠️ PIIA gaps, AGPL contamination, unassigned founder IP', dataRoom: 'PIIA files, IP assignment agreements, SCA report' },
    { category: 'Registered IP', keyItems: 'Patent portfolio, trademark registrations, copyright registrations, domain name ownership', dealKiller: '⚠️ IP registered in personal names, pending patent litigation', dataRoom: 'USPTO/WIPO filings, prosecution histories, fee payment records' },
    { category: 'Data Privacy', keyItems: 'DPAs with processors, GDPR RoPA, CCPA compliance, consent mechanisms, breach history', dealKiller: '⚠️ Missing DPAs, undisclosed breaches, regulatory investigations', dataRoom: 'Privacy policy, DPAs, breach notifications, DSAR log' },
    { category: 'Material Contracts', keyItems: 'Customer agreements (COC clauses), key vendor licenses, partnership agreements, debt instruments', dealKiller: '⚠️ COC provisions in major contracts requiring consent before close', dataRoom: 'All material contracts, COC schedule prepared by target' },
    { category: 'Employment', keyItems: 'PIIA execution dates vs hire dates, misclassification analysis, option plan administration, 409A valuations', dealKiller: '⚠️ Contractor misclassification, 409A violations, unauthorized grants', dataRoom: 'Employee list + start dates + PIIA dates, contractor agreements, option grant board minutes' },
    { category: 'Regulatory', keyItems: 'Industry-specific licenses, FinCEN MSB registration, state MTL, HIPAA BAAs, SEC/CFTC filings', dealKiller: '⚠️ Missing required licenses, unresolved enforcement actions', dataRoom: 'All licenses, registrations, regulatory correspondence, government filings' },
    { category: 'Litigation', keyItems: 'Active litigation, threatened claims, regulatory investigations, demand letters, tolling agreements', dealKiller: '⚠️ IP infringement claims, class actions, regulatory enforcement', dataRoom: 'Litigation schedule, counsel opinions, settlement agreements' },
    { category: 'Financial / Tax', keyItems: 'Audited financials (3 years), R&D tax credit documentation, transfer pricing, deferred revenue', dealKiller: '⚠️ Restatement risk, uncertain tax positions, undisclosed liabilities', dataRoom: 'Audited financial statements, tax returns, tax opinions' },
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
          M&amp;A Due Diligence Compliance Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          M&amp;A &amp; Corporate
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          M&amp;A Legal Due Diligence Guide (2025): IP Audit, Data Privacy, Employment, Change-of-Control, and Representation &amp; Warranty Insurance
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Technology M&A due diligence is primarily a compliance audit disguised as a legal review. The 8 most common deal-killing findings — IP chain-of-title gaps, open source contamination, worker misclassification, PIIA deficiencies, undisclosed regulatory exposure, data privacy violations, change-of-control triggers in material contracts, and option plan administration errors — are all compliance failures that surfaced during the transaction because the target never had them systematically reviewed beforehand.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>M&amp;A Due Diligence Categories and Data Room Requirements</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '580px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Key Diligence Items</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Deal-Killer Risk</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Data Room Documents</th>
                </tr>
              </thead>
              <tbody>
                {DILIGENCE_CATEGORIES.map(({ category, keyItems, dealKiller, dataRoom }) => (
                  <tr key={category} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, verticalAlign: 'top' }}>{category}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top', opacity: 0.85 }}>{keyItems}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top' }}>{dealKiller}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top', opacity: 0.75 }}>{dataRoom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your M&amp;A Contracts and Transaction Documents</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your purchase agreement, asset purchase agreement, PIIA template, enterprise customer agreement, or software license agreement. BizLegal AI identifies change-of-control provisions and assignment restrictions that require consent before closing, reviews IP assignment language for present-tense operative language vs future-tense promises, flags indemnification provisions where the liability cap includes IP indemnification (a common seller-favorable gap), surfaces data privacy reps that may not survive RWI underwriting, and identifies employment-related provisions that create post-closing misclassification or equity exposure.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Transaction Document →
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
            <Link href="/guides/ip-assignment-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>IP Assignment Guide →</Link>
            <Link href="/guides/software-development-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Software Dev Agreement Guide →</Link>
            <Link href="/guides/venture-capital-term-sheet-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>VC Term Sheet Guide →</Link>
            <Link href="/guides/equity-compensation-guide-startups" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Equity Compensation Guide →</Link>
            <Link href="/guides/gdpr-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR Compliance Checklist →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. M&A due diligence is a complex, jurisdiction-specific, and transaction-specific process. IP ownership analysis, employment law classification, data privacy compliance assessment, regulatory licensing requirements, and representation and warranty insurance terms vary significantly based on the specific transaction, industry, jurisdiction, and applicable law. Consult qualified M&A counsel, IP counsel, employment counsel, and data privacy counsel before making decisions relating to any merger, acquisition, or disposition transaction.
          </p>
        </footer>

      </main>
    </>
  )
}
