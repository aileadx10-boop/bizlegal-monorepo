import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Startup Employment Agreement Guide (2025): At-Will, PIIA, Non-Compete, Worker Classification | BizLegal AI',
  description: 'Employment agreements for startups: at-will employment and its limits, Proprietary Information and Inventions Agreements (PIIA), non-compete enforceability post-FTC ban, the W-2 vs 1099 misclassification trap, required offer letter provisions, and the equity vesting terms that belong in every employment agreement.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/startup-employment-agreement-guide' },
  openGraph: {
    title: 'Startup Employment Agreement Guide (2025) — BizLegal AI',
    description: 'At-will employment doctrine and its limits, PIIA required provisions, non-compete enforceability by state (post-FTC ban), W-2 vs 1099 misclassification (IRS 20-factor test and ABC test), required offer letter terms, and equity vesting integration with employment agreements.',
    url: 'https://bizlegal-ai.com/guides/startup-employment-agreement-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What is at-will employment and what are its actual limits?',
    a: 'At-will employment is the default rule in 49 US states (Montana is the exception) that allows either the employer or employee to terminate the employment relationship at any time, for any reason or no reason, with or without notice — subject to a significant number of exceptions that often swallow the rule in practice. Major exceptions that limit at-will employment: (1) Anti-discrimination law: Title VII of the Civil Rights Act, the Age Discrimination in Employment Act (ADEA), the Americans with Disabilities Act (ADA), and state equivalents prohibit termination based on protected characteristics (race, color, religion, sex, national origin, age (40+), disability, genetic information). These are federal and apply to employers with 15+ employees (Title VII, ADA) or 20+ employees (ADEA); most state laws apply from the first employee. (2) Retaliation prohibitions: employees cannot be terminated for: (a) reporting workplace discrimination or harassment (protected activity); (b) filing OSHA complaints or raising safety concerns; (c) filing wage claims with the Department of Labor; (d) whistleblowing (Sarbanes-Oxley, Dodd-Frank, and many state statutes protect whistleblowers from retaliation, with penalties and reinstatement as remedies); (e) taking protected leave (FMLA, state family leave laws). (3) Implied contract exception: courts in many states (but not all) recognize that employee handbooks, offer letters, or verbal representations can create an "implied contract" limiting the employer\'s right to terminate. Phrases like "we only terminate for cause" or progressive discipline policies described as mandatory can be interpreted as implied contracts. Solution: include a clear disclaimer in all handbooks and offer letters stating that nothing in the document creates a contract of employment or limits at-will status. (4) Public policy exception: most states prohibit termination that violates a "clear public policy" — such as firing an employee for serving on jury duty, refusing to participate in illegal activity, or exercising a statutory right (voting, filing workers\' compensation claims). (5) Covenant of good faith and fair dealing: a minority of states (notably California and Massachusetts) imply a covenant of good faith and fair dealing in employment relationships, preventing termination designed to deprive employees of earned compensation (e.g., firing someone the day before their bonus vests). For startups specifically: at-will employment is operationally important — it allows workforce adjustments during pivots. But the anti-discrimination and retaliation exceptions mean terminations must be documented, non-discriminatory, and non-retaliatory in timing. A best practice: before any termination, document the non-protected reason (performance, budget reduction, reorganization), ensure similar-situated employees in protected categories have not been treated more favorably, and consult counsel if the employee recently made an internal complaint.',
  },
  {
    q: 'What must a Proprietary Information and Inventions Agreement (PIIA) include and why is it critical for startups?',
    a: 'A Proprietary Information and Inventions Agreement (PIIA) — also called an Employee Invention Assignment Agreement, a Confidentiality and Invention Assignment Agreement (CIIA), or an IP and Confidentiality Agreement — is the document that transfers IP ownership from employees (and contractors) to the company. Without a signed PIIA, employees may own the IP they create at work. Why this matters existentially for startups: (1) Series A diligence invariably checks whether every employee and contractor who has ever contributed to the core product has signed a valid PIIA. A missing PIIA — especially from an early engineer, designer, or product manager — can derail a financing round or require expensive retroactive remediation (hunting down former employees to sign confirmatory assignments). (2) Acquirers conduct the same diligence. A missing PIIA on any material IP creator is a deal-killer or a price-reduction event. Required PIIA provisions: (a) Assignment of inventions: a present-tense assignment of all inventions, improvements, discoveries, works of authorship, and developments made by the employee during employment that relate to the company\'s business, are made during working hours, or use company resources. The assignment should be "hereby assigned" (present tense) — not "agrees to assign" (which requires a future performance that courts treat differently). Critical: a bare "agrees to assign" has been held by some courts to not automatically transfer title to IP — it creates an obligation to assign, not an actual transfer. (b) Prior inventions schedule: employees must disclose (but not assign) inventions they created before starting employment. This carve-out protects employees\' pre-existing IP. The schedule must be attached and signed — if left blank, the company\'s assignment may inadvertently cover the employee\'s pre-existing work. (c) Works for hire: to the extent any created works qualify as "works made for hire" under copyright law (which depends on whether they fall within the 9 statutory categories — see IP Assignment Guide), the agreement should confirm this characterization. (d) Confidentiality obligations: broad definition of "Proprietary Information" (source code, product specs, customer lists, business plans, financial projections, third-party information shared under NDA); obligation to maintain confidentiality during and after employment; return of all proprietary materials upon termination. (e) Disclosure obligation: requirement to promptly disclose all inventions to the company, so the company can evaluate whether they fall within the assignment scope. (f) No conflicting obligations: representation that the employee is not bound by agreements with prior employers that would restrict their ability to perform their duties or assign their work product. State-law carve-outs mandatory in California, Washington, Minnesota, Delaware, North Carolina, Illinois: these states have statutes (CA Labor Code § 2870; WA RCW 49.44.140; MN Stat. § 181.78; similar in others) that prohibit assignment of inventions developed on the employee\'s own time, without company resources, and not related to the company\'s business or resulting from the company\'s work. California\'s carve-out is the most litigated — if you employ people in California, your PIIA must include the Section 2870 carve-out or risk having the entire assignment clause declared void.',
  },
  {
    q: 'Are non-compete agreements enforceable and what changed after the FTC\'s 2024 non-compete ban?',
    a: 'Non-compete agreements prohibit employees (and sometimes contractors) from working for competitors or starting competing businesses for a defined period after leaving employment. Their enforceability has varied widely by state and became even more contested after federal intervention. The FTC Non-Compete Ban (August 2024): in August 2024, the Federal Trade Commission\'s final rule banning most non-compete agreements for employees (other than senior executives with existing agreements) was blocked by a federal district court in Texas (Ryan LLC v. FTC). As of 2025, the FTC non-compete ban is NOT in effect nationally — it was enjoined by the Fifth Circuit before it took effect. State of enforceability by jurisdiction (post-FTC injunction): (a) California: non-competes are VOID and unenforceable by statute (Business & Professions Code § 16600) for virtually all employees. California courts apply this even if the employment agreement specifies another state\'s law. Any employee working in California, or hired to work in California, cannot be subject to an enforceable non-compete. (b) Minnesota (2023): non-competes void and unenforceable as of January 1, 2023, for agreements signed after that date. (c) North Dakota, Oklahoma: non-competes generally void under state statute. (d) Most other states: enforce non-competes that are "reasonable" in scope, geographic area, and duration. "Reasonable" varies by state. Typical enforceable ranges: up to 12 months duration; limited geographic area (city, metro area, or defined market area); limited to activities the employee actually performed (not the entire industry). (e) Trend: many states have enacted or are considering income thresholds below which non-competes are void (Colorado requires $123K+ salary; Illinois $75K+; Washington $100K+). Alternatives to non-competes that remain enforceable: (a) Non-solicitation of employees: prohibits former employees from recruiting or soliciting current employees for 12-24 months. Generally more enforceable than non-competes and permissible in California for agreements signed before 2022 (though California also limits these post-2022 for many employees). (b) Non-solicitation of customers: prohibits soliciting specific identified current customers for 12-18 months. Generally more enforceable than non-competes; California courts assess on a case-by-case basis. (c) Non-disclosure/confidentiality: prohibits use of specific confidential information (source code, customer lists, pricing data). Enforceable everywhere when properly scoped — this is your primary IP protection tool. (d) Garden leave clauses: paying departing employees their salary during a non-compete period dramatically increases enforceability in all jurisdictions because the employee receives consideration for the restriction. For startups: the realistic protection you get is from your PIIA (IP assignment + confidentiality) and targeted customer/employee non-solicitation provisions. Building your business to depend on non-competes as a hiring or retention tool is a structural mistake — employees leave, non-competes often fail in litigation, and California\'s rule applies to anyone who works in California.',
  },
  {
    q: 'What is the W-2 vs 1099 worker misclassification trap and how does the IRS 20-factor test work?',
    a: 'Worker misclassification — treating employees (who should receive W-2 tax treatment) as independent contractors (who receive 1099s) — is one of the most common and costly compliance errors startups make, particularly during periods of rapid growth when founders want flexibility. Why misclassification is costly: when you misclassify an employee as a contractor, you fail to: (a) withhold federal and state income taxes; (b) withhold and pay the employer\'s share of FICA (Social Security: 6.2% up to the wage base; Medicare: 1.45% + 0.9% additional Medicare tax above certain thresholds); (c) pay federal and state unemployment taxes (FUTA/SUTA); (d) provide required employee benefits (if you provide them to other employees): workers\' compensation, unemployment insurance eligibility, FMLA leave rights, health insurance (ACA employer mandate if 50+ employees). IRS enforcement: the IRS can assess back taxes for all periods of misclassification plus penalties and interest — and can hold individual founders personally liable for the employer portion of FICA under the Trust Fund Recovery Penalty. State labor departments independently audit and assess back taxes and penalties. The IRS 20-factor test (Common Law Test): the IRS uses a common law test that looks at the degree of control the hiring company has over the worker. Key factors: (a) Behavioral control: does the company control HOW the work is done (not just the result)? (i) Instructions: does the company provide detailed instructions on how to complete work? (ii) Training: does the company provide training on how to do the work? (iii) Tools and equipment: does the company provide the tools, equipment, or materials? If yes to these → employee indicators. (b) Financial control: does the company control the economic aspects of the worker\'s activities? (i) Significant investment: does the worker invest in equipment or tools used in the work? (ii) Multiple clients: can the worker work for multiple unrelated companies? (iii) Profit/loss risk: can the worker realize a profit or loss from their work? Independent contractor indicators. (c) Type of relationship: (i) Written contracts: is there a written independent contractor agreement? (not determinative but relevant); (ii) Employee benefits: does the company provide vacation, pension, insurance, or paid leave? (iii) Permanency: is the relationship indefinite in duration? (iv) Integral to business: is the work integral to the company\'s regular business? Integral services performed indefinitely = employee. The ABC test (California AB5 and other states): California, Massachusetts, New Jersey, and other states use an even stricter test that presumes workers are employees unless the hiring company can show all three: (A) the worker is free from the company\'s control and direction in performing the work; (B) the work performed is outside the usual course of the company\'s business; AND (C) the worker is customarily engaged in an independently established trade, occupation, or business. Under the ABC test, most workers who perform your company\'s core services — software engineers building your software, customer support reps supporting your customers — cannot legally be contractors. Practical guidance: if a worker has: (a) a dedicated workspace at your office; (b) works exclusively or primarily for you; (c) follows your schedule and procedures; (d) uses your equipment; or (e) performs the same role as your employees — they are very likely an employee. The 1099 contractor label means nothing if the economic reality is employment.',
  },
  {
    q: 'What provisions must be included in a startup offer letter to be legally binding?',
    a: 'An offer letter is the primary employment contract for most startup employees (especially for non-executive roles without a full employment agreement). It must include enough specificity to be binding while avoiding accidentally creating more protections than intended. Required provisions in a startup offer letter: (1) Position and duties: job title, reporting structure, and a general description of duties. The description should be broad enough to allow evolution of the role without triggering "material change to job duties" arguments for termination-for-good-reason or constructive dismissal claims. (2) Start date: critical for vesting cliff and IP assignment timing purposes. (3) Compensation: (a) base salary (annualized amount, pay period — bi-weekly or semi-monthly); (b) whether eligible for bonuses (and critically: that any bonus is discretionary and subject to board approval, not earned compensation); (c) equity grant: number of options or shares; type (ISO or NSO for options); exercise price (cannot be specified until a 409A is completed — state "subject to board approval at a per-share exercise price equal to fair market value on the date of grant"); vesting schedule (standard 4-year/1-year cliff); whether single or double trigger acceleration applies. (4) Benefits: health insurance eligibility, 401(k) eligibility, vacation policy. If unlimited PTO — state that explicitly; do not imply accrual if none occurs. (5) At-will statement: CRITICALLY important — include a clear at-will disclaimer: "Your employment with [Company] is at-will, meaning either you or [Company] may terminate the employment relationship at any time and for any reason, with or without cause and with or without notice. Nothing in this letter creates a contract of employment for any specific period of time." (6) Conditions of employment: state that the offer is conditioned on: (a) signing the PIIA; (b) completing I-9 employment eligibility verification; (c) successful completion of a background check (if applicable); (d) satisfactory reference checks (if applicable). (7) PIIA acknowledgment: reference the PIIA as a condition of employment: "This offer is contingent upon your signing the Company\'s standard Proprietary Information and Inventions Agreement." (8) Integration clause: "This letter constitutes the complete agreement between you and [Company] with respect to the terms and conditions of your employment and supersedes all prior representations and agreements, written or oral." (9) Governing law: state where the company operates — but note California employees retain California law protections regardless of choice of law. What NOT to include: (a) Progressive discipline policies (creates implied contract risk); (b) "Cause" requirements for termination (creates fixed-term employment contract implication); (c) Promises of job security or specific duration of employment; (d) Specific bonus amounts without conditioning language; (e) Implied perpetuity of any benefit.',
  },
  {
    q: 'What state-law requirements vary most significantly for startup employment agreements and what are the highest-risk jurisdictions?',
    a: 'Employment law is largely state-law governed, and the variation is significant enough that a "standard" employment agreement template that works in Delaware or New York can create serious liability if applied without modification to employees in California, Massachusetts, or Illinois. Highest-risk jurisdictions for startup employment agreements: (1) California — most restrictive employment state: (a) Non-competes: void and unenforceable (BPC § 16600). Even if the employee signs one and is located in California, the non-compete cannot be enforced — and California enacted SB 699 (effective Jan 1, 2024) making it unlawful to even ATTEMPT to enforce a void non-compete, with civil penalties. (b) Non-solicitation of employees: void for agreements signed after January 1, 2022 (AB 2188 extension of trade secret act). (c) PIIA carve-outs: Labor Code § 2870 carve-out is mandatory. (d) Salary basis: California requires that highly compensated employees must meet a higher salary threshold for overtime exemption (currently $66,560/year in addition to federal $35,568). (e) Meal and rest breaks: California has strict meal break (30 min after 5 hours) and rest break (10 min for every 4 hours) requirements with one hour of pay as a penalty for each violation. (f) Final paycheck: all earned wages (including accrued vacation, regardless of "unlimited PTO" policy if accrual occurred) must be paid on the last day of employment for terminations; within 72 hours for resignations with notice; immediately for resignations without notice. (g) Commission clawbacks: California limits employer ability to claw back already-earned commissions. (2) Massachusetts: (a) Non-competes: enforceable under the Massachusetts Noncompetition Agreement Act (MNAA) but with significant requirements: must be supported by independent consideration (signing bonus or other payment); not apply to "exempt" employees; garden leave or other mutually-agreed compensation required; maximum 1 year duration; must be provided 10 business days before start date or promotion. (b) Wage Act: Massachusetts Wage Act creates individual liability for officers responsible for paying wages; treble damages for violations; attorneys\' fees. Unpaid wages (including commissions) are strict liability. (3) New York: (a) Non-competes: enforceable under a "reasonableness" test but 2023 legislation proposed banning them — watch for developments. (b) Wage Theft Prevention Act: specific written notice requirements at hire and upon any change in pay rate. (4) Colorado, Illinois, Washington: each has income-threshold non-compete restrictions (see FAQ above); Illinois has specific AI disclosure requirements in employment (AI Act, 2024); Colorado has a special rules for AI in employment contexts. (5) Remote employees: if you hire a remote employee who lives in California, California law applies to their employment — your Delaware choice of law does not override California\'s protective statutes for California-based workers. This has surprised many startups who assumed they could use a single template nationally. Each remote hire in a new state triggers potential state income tax withholding registration, unemployment insurance registration, workers\' compensation requirements, and state-specific employment law obligations.',
  },
]

export default function StartupEmploymentAgreementGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Startup Employment Agreement Guide (2025): At-Will, PIIA, Non-Compete, Worker Classification',
    description: 'Employment agreements for startups: at-will employment limits, PIIA required provisions, non-compete enforceability by state, W-2 vs 1099 misclassification, required offer letter provisions, and state-law variation.',
    url: 'https://bizlegal-ai.com/guides/startup-employment-agreement-guide',
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
      { '@type': 'ListItem', position: 3, name: 'Startup Employment Agreement Guide', item: 'https://bizlegal-ai.com/guides/startup-employment-agreement-guide' },
    ],
  }

  const NON_COMPETE_MAP = [
    { state: 'California', status: '🚫 Void', note: 'BPC § 16600 — unenforceable regardless of employer choice of law; SB 699 (2024) makes even attempting to enforce a violation' },
    { state: 'Minnesota', status: '🚫 Void', note: 'Banned for agreements signed after Jan 1, 2023' },
    { state: 'North Dakota', status: '🚫 Void', note: 'Statute bars non-competes (limited exceptions for sale of business)' },
    { state: 'Oklahoma', status: '🚫 Void', note: 'Generally unenforceable (narrow exceptions for sale of business)' },
    { state: 'Colorado', status: '⚠ Restricted', note: 'Income threshold: $123,750/year; must be reasonable in scope; no longer enforceable against workers below threshold' },
    { state: 'Illinois', status: '⚠ Restricted', note: 'Income threshold: $75,000/year; garden leave or other compensation required; 14-day review period' },
    { state: 'Washington', status: '⚠ Restricted', note: 'Income threshold: $100,000 (employees); $250,000 (independent contractors); max 18 months; garden leave pay required if enforced' },
    { state: 'Massachusetts', status: '⚠ Enforceable with requirements', note: 'MNAA: independent consideration, no exempt employees, garden leave or mutually-agreed payment, max 1 year, 10-day advance notice' },
    { state: 'New York', status: '⚠ Reasonableness test', note: 'Courts apply 4-factor reasonableness test; proposed 2023 ban not yet enacted; executive agreements generally upheld' },
    { state: 'Texas', status: '✅ Enforceable (with limits)', note: 'Must be ancillary to enforceable agreement; consideration must be given; reasonable in scope and duration' },
    { state: 'Florida', status: '✅ Enforceable (favorable to employers)', note: 'Statutory basis (§ 542.335); court must presume the restriction is valid; burden on employee to prove unreasonableness' },
    { state: 'Delaware', status: '✅ Enforceable', note: 'Reasonableness standard; courts generally enforce if reasonable in scope and time' },
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
          Startup Employment Agreement Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Employment Law
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          Startup Employment Agreement Guide (2025): At-Will, PIIA, Non-Competes, and Worker Classification
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          A startup that misclassifies employees as contractors owes back payroll taxes, FICA, and penalties going back to the first payment — and founders can be personally liable. An employment agreement without a PIIA means your engineers may own the IP they build. Non-competes are void in California and four other states regardless of what the agreement says. These are not hypothetical risks — they are the employment law failures that surface in every serious M&A diligence process.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Non-Compete Enforceability by State (2025)</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>State</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Key Requirements / Notes</th>
                </tr>
              </thead>
              <tbody>
                {NON_COMPETE_MAP.map(({ state, status, note }) => (
                  <tr key={state} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{state}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.82rem' }}>{status}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8, fontSize: '0.78rem' }}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your Employment Agreement or Offer Letter for Compliance Gaps</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your employment agreement, PIIA, or offer letter template. BizLegal AI identifies whether your PIIA uses present-tense assignment language or the weaker &ldquo;agrees to assign&rdquo; formulation, whether the required Section 2870 carve-out is present for California employees, whether any implied contract language undermines your at-will status, whether a non-compete is enforceable in the employee&rsquo;s state, and whether your offer letter includes the required at-will disclaimer.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Employment Agreement →
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
            <Link href="/guides/ip-assignment-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>IP Assignment Agreement →</Link>
            <Link href="/guides/contractor-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Contractor Agreement Guide →</Link>
            <Link href="/guides/equity-compensation-guide-startups" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Equity Compensation Guide →</Link>
            <Link href="/guides/startup-compliance-program-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Startup Compliance Program →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. Employment law varies significantly by state, and the enforceability of specific provisions depends on the applicable jurisdiction, the specific language used, and the factual circumstances. Consult a qualified employment attorney before finalizing any employment agreement, offer letter, or PIIA template, particularly for employees located in California, Massachusetts, or other states with restrictive employment laws.
          </p>
        </footer>

      </main>
    </>
  )
}
