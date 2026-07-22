import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Non-Compete Agreement Guide (2025): State Enforcement, FTC Rule, California Ban, Non-Solicitation Alternatives | BizLegal AI',
  description: 'Is your non-compete enforceable? State-by-state non-compete enforcement map (California void, Texas requires reasonableness, Florida employer-favorable), the FTC non-compete rule and federal court challenges, California AB 1076 and SB 699 void-as-applied rules (2024), alternatives to non-competes (NDAs, non-solicitation agreements, garden leave), and the 5 common drafting errors that make non-competes unenforceable.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/non-compete-agreement-guide' },
  openGraph: {
    title: 'Non-Compete Agreement Guide (2025) — BizLegal AI',
    description: 'Non-compete enforceability by state, FTC rule status, California 2024 void rule, garden leave vs non-compete, non-solicitation agreement requirements, and how to draft an enforceable post-employment restriction.',
    url: 'https://bizlegal-ai.com/guides/non-compete-agreement-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What happened to the FTC non-compete rule, and what is the current federal law status?',
    a: 'In April 2024, the Federal Trade Commission issued a final rule that would have banned nearly all non-compete agreements nationwide as an unfair method of competition under Section 5 of the FTC Act. The rule was set to take effect September 4, 2024. On August 20, 2024, the U.S. District Court for the Northern District of Texas (Ryan LLC v. FTC) issued a nationwide injunction blocking the rule from taking effect, finding that the FTC lacked statutory authority to promulgate the rule and that the rule was arbitrary and capricious. The court vacated the rule as to all parties, not just the plaintiffs. The FTC appealed to the Fifth Circuit Court of Appeals, but as of the knowledge cutoff in this guide, the nationwide injunction remains in place and the rule is not in effect. What this means for non-compete law now: (1) There is no federal statutory ban on non-compete agreements. Federal antitrust principles (Sherman Act) theoretically apply to non-competes that unreasonably restrain trade, but there is no per se federal prohibition. (2) State law governs non-compete enforceability. State law varies dramatically — from California\'s near-complete prohibition to Florida\'s employer-favorable framework. (3) The FTC rule\'s existence may influence how courts and legislators think about non-competes. Several states passed non-compete restrictions in 2023-2024 partially anticipating federal preemption. (4) The Biden administration\'s position (including the FTC rule) has influenced state legislation. Even with the FTC rule blocked, states including Minnesota, Oklahoma, and North Dakota have enacted or strengthened non-compete prohibitions since 2023. (5) The Trump administration\'s FTC may drop or not pursue the appeal, which would moot the federal rule and return the issue definitively to the states. Employers should not rely on the FTC rule either as authority to use non-competes (the rule never took effect) or as a reason to abandon them (the rule is blocked). State law remains controlling and varies sharply by jurisdiction.',
  },
  {
    q: 'In which states are non-compete agreements void or unenforceable, and what are the most important state rules?',
    a: 'Non-compete enforceability varies more by state than almost any other area of employment law. Understanding the framework in your operating states is essential before signing or attempting to enforce any non-compete. States where non-competes are generally void or unenforceable: (1) California: under California Business and Professions Code Section 16600, "every contract by which anyone is restrained from engaging in a lawful profession, trade, or business of any kind is to that extent void." California courts interpret Section 16600 broadly. AB 1076 (effective January 1, 2024) requires California employers to notify current and former employees that non-compete agreements they were asked to sign are void — the statute provides a specific notice deadline that already passed. SB 699 (effective January 1, 2024) provides that non-compete agreements are void regardless of where they were signed and even if the employment was in another state. An employer who entered a non-compete with an employee while both were in Texas, and the employee later moved to California, cannot enforce the non-compete in California under SB 699. Exceptions in California are very narrow: (a) sale of a business (non-compete by seller/owner is enforceable); (b) dissolution of a partnership; (c) dissolution of an LLC (for substantial owners). (2) Minnesota: Minnesota Statutes Section 181.988 (effective July 1, 2023) makes non-compete agreements void and unenforceable. Does not apply to non-solicitation of customers or employees, or to confidentiality agreements. Applies to agreements signed on or after July 1, 2023. (3) North Dakota: North Dakota Century Code Section 9-08-06 voids non-competes with very limited exceptions. (4) Oklahoma: Oklahoma Statutes Section 15-219A voids non-competes with very limited exceptions. (5) Washington, D.C.: D.C. Non-Compete Clarification Amendment Act of 2022 (effective October 1, 2022) bans non-competes for most employees earning less than $150,000/year. Employer-favorable states where non-competes are routinely enforced: (1) Florida: Florida Statutes Section 542.335 is explicitly employer-favorable. Courts cannot consider the hardship on the employee in evaluating reasonableness. The statute creates presumptions of reasonableness for certain time periods. If a court finds the non-compete is too broad, Florida requires courts to "blue pencil" (modify) the agreement to make it enforceable rather than void it. (2) Texas: Texas Business and Commerce Code Section 15.50 requires non-competes to be ancillary to or part of an enforceable agreement at the time it is made (e.g., tied to a confidentiality agreement, training investment, or stock option). Geographic and time restrictions must be reasonable. Courts have authority to reform overbroad restrictions. (3) Delaware: non-competes are enforceable if reasonable in scope, geography, and duration. Often used for choice-of-law to avoid more restrictive states. Middle-ground states with additional requirements: (1) Massachusetts: non-competes are valid for 12 months maximum (18 months for breach of fiduciary duty); must be reasonable in duration, geographic reach, and scope; must contain "garden leave" provision (at least 50% of salary for the restricted period) or other mutually-agreed consideration; cannot be enforced against non-exempt employees, undergraduates, or graduate students. (2) Illinois (2022): Non-Compete Covenant restrictions — must provide at least 14 days to review, minimum income thresholds ($75,000 for non-competes, $45,000 for non-solicitation), and reasonable time, geography, and scope. (3) Colorado (2022): non-competes only enforceable if the employee earns above $123,750/year (2024 threshold, adjusted annually) and the restriction protects trade secrets. Non-solicitation requires earnings above $74,250/year.',
  },
  {
    q: 'What are the 5 most common drafting errors that make non-compete agreements unenforceable?',
    a: 'Even in employer-favorable states that enforce non-compete agreements, courts routinely void or refuse to enforce agreements with specific drafting defects. Understanding these errors is essential whether you are drafting an agreement for your company or evaluating a non-compete you were asked to sign. Error 1 — Overbroad geographic scope: a non-compete that restricts competition "worldwide" or "in any state where the employer does business" when the employee\'s actual role was regional is commonly voided as overbroad. Courts in most states apply a reasonableness test that ties the geographic restriction to the employee\'s actual territory. If a sales employee covered the Southwest, a non-compete preventing competition in the Northeast is likely unenforceable. Fix: define geographic scope by reference to the employee\'s actual territory or customer accounts at the time of the restriction. Error 2 — Excessive duration: a 3-5 year restriction for a non-senior employee without access to long-lived trade secrets is often found unreasonable. State benchmarks: California (void regardless), Massachusetts (12 months maximum), Texas courts favor 2-year maximum, Florida presumes unreasonable if over 2 years for general employee (shorter standards apply for some positions). Fix: tie duration to the actual shelf life of the confidential information being protected. For most SaaS roles, 12 months is defensible; 24 months is the outer limit in most employer-favorable states. Error 3 — Overbroad activity scope: a non-compete that prohibits any employment at a "competitor" without defining competitor, or prohibits "any activities in the technology industry," is likely unenforceable. Courts require the restriction to match the actual scope of harm the employer is trying to prevent. Fix: define the restricted activities specifically — "providing the same or substantially similar services to a company in X product category" rather than "working for any company in the technology sector." Error 4 — Lack of adequate consideration at signing: in many states, a non-compete signed after the start of employment (not at hiring) requires independent consideration beyond continued employment. A new hire signing at the start of employment generally needs no additional consideration (the job offer itself is the consideration). But asking a current employee to sign a non-compete mid-employment in a state that requires additional consideration (e.g., Illinois requires at least 2 weeks\' advance notice) may be unenforceable if no new benefit is provided. Fix: tie non-compete signature to a promotion, bonus, stock grant, or other tangible new benefit when the agreement is signed after the original hire date. Error 5 — No legitimate protectable interest: non-competes are supposed to protect trade secrets, confidential information, customer relationships, or substantial investment in specialized training — not simply prevent competition. A non-compete imposed on a low-level employee with no access to confidential information or customer relationships is unlikely to have a protectable interest supporting enforcement. Fix: document the specific legitimate interest the non-compete is protecting. Tie the restriction to actual access to confidential information or specific customer relationships, not to job title alone.',
  },
  {
    q: 'What are the key differences between a non-compete, a non-solicitation agreement, and a garden leave clause — and which is enforceable in the most states?',
    a: 'Non-compete agreements, non-solicitation agreements, and garden leave clauses all serve to protect employer interests after an employee\'s departure, but they do so in different ways with significantly different enforceability profiles. Non-compete agreements: prohibit former employees from working for competitors or starting competing businesses within a defined geographic area and time period. Most restrictive — prohibits all competitive work, not just work derived from the employer\'s confidential information or relationships. Enforceability: varies enormously. Void in California, Minnesota, North Dakota, Oklahoma, DC (low earners). Florida enforces routinely. Texas enforces with proper drafting. Approximately 45 states allow non-competes with varying requirements. Non-solicitation of customers: prohibit former employees from soliciting the employer\'s customers — typically, customers the employee actually worked with or had contact with during employment. Significantly more broadly enforceable than non-competes because the scope is tied to actual relationships. California: traditionally enforced customer non-solicitation tied to trade secrets (use of customer lists constitutes misappropriation of trade secrets), though recent California Court of Appeal decisions (Ixchel Pharma v. Biogen, 2020) and the application of Section 16600 have complicated this. Edwards v. Arthur Andersen narrowed customer non-solicitation in California significantly. Minnesota: non-solicitation agreements are specifically carved out from the 2023 ban on non-competes — they remain enforceable. Massachusetts: customer non-solicitation does not require the garden leave provision and income threshold required for non-competes. Non-solicitation of employees: prohibit former employees from recruiting or soliciting the employer\'s current employees to join a new employer. Generally enforced more broadly than customer non-solicits because there is less free speech and free labor concerns — the employee is not being prevented from working, just from recruiting others. California: employee non-solicitation agreements may be void under recent interpretations of Section 16600, though this area is actively litigated. Most states: enforceable if reasonable in scope and duration. Garden leave clauses: require the employer to continue paying the employee (at full or partial salary) during the post-termination restriction period. The employee is "on leave" — they receive salary but cannot work for competitors. Enforceability: increasingly favored by courts because the employee is compensated for the restriction, which addresses concerns about hardship and economic harm. Massachusetts (post-2018): non-competes require garden leave of at least 50% of base salary for the restricted period. UK and Europe: standard practice — employees on notice periods are routinely placed on garden leave. The enforceable alternative recommendation: if your operation includes California employees, or if you want maximum enforceability across multiple states, a combination strategy often works best: (1) confidentiality and trade secret agreement (enforceable in all states under state trade secret laws and the federal Defend Trade Secrets Act); (2) customer non-solicitation tied to customers the employee actually worked with (enforceable in most states); (3) employee non-solicitation (enforceable in most states); (4) IP assignment agreement (enforceable everywhere). This combination protects the core interests non-competes are meant to protect without the enforceability risk of blanket activity restrictions.',
  },
  {
    q: 'What should an employer do when a key employee subject to a non-compete joins a competitor — can the non-compete be enforced?',
    a: 'When a key employee departs and joins a competitor, the employer must quickly assess whether and how to enforce the non-compete. Enforcement timelines are tight — preliminary injunctions (the typical enforcement mechanism) require rapid action, and courts evaluate whether the moving party delayed in seeking relief. Immediate steps in the first 48-72 hours: (1) preserve evidence: immediately preserve all the former employee\'s communications, work product, system access logs, and download activity. A forensic analysis of what the employee accessed in the weeks before departure is often the most critical evidence in a non-compete enforcement action. Many successful enforcement actions are built on evidence that the employee downloaded confidential data. (2) Send a cease-and-desist letter: draft and send a letter to the former employee (and potentially to the new employer) that: (a) identifies the non-compete agreement and its specific restrictions; (b) identifies the specific conduct that is believed to violate the agreement; (c) demands cessation of the violating conduct; (d) demands return of all confidential information; (e) puts the new employer on notice (which is important — a new employer that knowingly aids a non-compete violation may be liable for tortious interference). (3) Issue a litigation hold: if you are considering litigation, issue a litigation hold to preserve all evidence related to the former employee. (4) File for a temporary restraining order (TRO) and preliminary injunction: if the matter is urgent and you have strong evidence of violation, file in court immediately. TROs can be obtained without the defendant present (ex parte) in true emergency situations — but courts scrutinize ex parte applications carefully. Preliminary injunctions require showing: (a) likelihood of success on the merits; (b) irreparable harm if the injunction is not granted; (c) balance of harms favors the moving party; (d) injunction is in the public interest. The "irreparable harm" element is critical: courts often require evidence that money damages are inadequate — customer relationship harm and disclosure of trade secrets are the most compelling irreparable harm arguments. Before filing litigation: (a) verify which state\'s law governs the agreement (the governing law clause matters, though it may not be honored if the employee is in California or another state that refuses to apply foreign law against its residents); (b) confirm that the restriction has not expired; (c) confirm the employee is actually engaged in restricted activities (working for a competitor in a non-competitive role may not violate the agreement); (d) assess whether the former employee can assert invalidity defenses (no consideration, overbreadth, prior employer breach). Employer conduct that weakens enforcement: (a) if the employer breached the employment agreement (didn\'t pay commissions, terminated without cause when cause was required), courts may hold that the employer\'s breach excused the employee\'s non-compete obligation; (b) if the employer routinely failed to enforce non-competes against similarly situated departing employees (selective enforcement can be raised as an equitable defense); (c) if the employer allowed the non-compete to lapse without action and the employee acted in reliance on non-enforcement.',
  },
  {
    q: 'How should non-compete and non-solicitation provisions in founder and investor agreements be drafted differently from employee agreements?',
    a: 'Non-compete provisions in founder agreements, buy-sell agreements, venture capital investment documents, and acquisition agreements are treated very differently by courts than employee non-competes — and the drafting requirements differ accordingly. Founder non-competes: when co-founders form a company, they sometimes include non-compete provisions in their co-founder agreements (or in the company\'s bylaws or stockholder agreements) to prevent a departing founder from immediately competing with the company they founded. Enforceability differences from employment: (a) California: the California exception to Section 16600 applies to the "sale of a business" — non-competes by a seller-owner in connection with a business sale are enforceable. Courts look at whether the co-founder agreement is sufficiently analogous to a business sale (transferring an ownership stake for value) to qualify for this exception. This is genuinely contested in California courts and should not be assumed enforceable. (b) Most other states: founder non-competes tied to equity vesting or equity sales are more favorably viewed because the founder receives substantial consideration for the restriction (equity value). Venture capital investment documents: VCs frequently insist on non-compete covenants from founding executives as a condition of investment. These are often found in: (a) the term sheet (as a required covenant); (b) the voting agreement (as an obligation of all major stockholders); (c) the management rights letter (as an operational covenant). Enforceability: non-competes in VC investment documents are often treated like seller-owner restrictions rather than employment restrictions, especially where the founder is also a significant stockholder. Courts in most states will enforce a reasonable non-compete in a VC financing context because the founder received substantial value (capital, liquidity, continued equity ownership). Key drafting points for founder/investor non-competes: (a) tie the restriction period to the vesting period (so the non-compete does not extend beyond the period the founder is building value for the company); (b) define the competitive activity by reference to the company\'s actual business at the time the restriction is triggered, not a hypothetical future business; (c) include the activity in a role that is actually competitive — many courts void restrictions that prohibit passive investment or advisory roles that don\'t compete with the company\'s business; (d) include a "good leaver" exception (if a founder is involuntarily terminated without cause, the non-compete is typically released or shortened). Acquisition non-competes: in M&A transactions, the seller and key employees (founders, executives) are typically required to sign non-compete agreements as a condition of the acquisition. In acquisitions, the non-compete is directly connected to the sale of goodwill — courts in most states will enforce acquisition non-competes more readily than employment non-competes because the seller received substantial consideration. California exception for business sale non-competes: under Business and Professions Code Section 16601, a non-compete is enforceable where a person sells the goodwill of a business, or all of an owner\'s interest in a business entity, and the restrictions are reasonably necessary to protect the goodwill acquired. The non-compete must be for a "reasonable period" — courts have upheld 3-5 year restrictions in the M&A context in California.',
  },
]

export default function NonCompeteGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Non-Compete Agreement Guide (2025): State Enforcement, FTC Rule, California Ban, Non-Solicitation Alternatives',
    description: 'Non-compete enforceability by state, FTC rule status after federal court injunction, California AB 1076/SB 699 void rules, non-solicitation vs non-compete, garden leave clauses, enforcement strategies, and founder/VC non-compete drafting.',
    url: 'https://bizlegal-ai.com/guides/non-compete-agreement-guide',
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
      { '@type': 'ListItem', position: 3, name: 'Non-Compete Agreement Guide', item: 'https://bizlegal-ai.com/guides/non-compete-agreement-guide' },
    ],
  }

  const STATE_MAP = [
    { state: 'California', status: '🔴 VOID', notes: 'Section 16600; SB 699 applies even if signed in another state', incomeThreshold: 'N/A', maxDuration: 'N/A (void)' },
    { state: 'Minnesota', status: '🔴 VOID', notes: 'Minnesota Statutes §181.988 (July 2023). Non-solicitation still allowed', incomeThreshold: 'N/A', maxDuration: 'N/A (void)' },
    { state: 'North Dakota', status: '🔴 VOID', notes: 'NDCC §9-08-06, very limited exceptions', incomeThreshold: 'N/A', maxDuration: 'N/A (void)' },
    { state: 'Oklahoma', status: '🔴 VOID', notes: 'OS §15-219A, very limited exceptions', incomeThreshold: 'N/A', maxDuration: 'N/A (void)' },
    { state: 'Washington D.C.', status: '🔴 VOID (low earners)', notes: 'Banned for employees earning <$150K (2024)', incomeThreshold: '$150,000', maxDuration: 'N/A if under threshold' },
    { state: 'Florida', status: '🟢 Employer-favorable', notes: 'F.S. §542.335; courts must blue-pencil, not void; hardship irrelevant', incomeThreshold: 'None required', maxDuration: 'Presumed reasonable ≤2 yrs' },
    { state: 'Texas', status: '🟡 Enforceable (with limits)', notes: 'Must be ancillary to enforceable agreement; courts reform overbroad clauses', incomeThreshold: 'None specified', maxDuration: '2 years typically enforced' },
    { state: 'Massachusetts', status: '🟡 Enforceable (post-2018 law)', notes: 'Garden leave required (50% salary); 12-month max; no non-exempt employees', incomeThreshold: 'None for non-compete', maxDuration: '12 months (18 for fiduciary breach)' },
    { state: 'Illinois', status: '🟡 Enforceable (income thresholds)', notes: '$75K+ for non-competes; $45K+ for non-solicitation; 14-day review required', incomeThreshold: '$75,000 non-compete / $45,000 non-solicit', maxDuration: 'Reasonableness standard' },
    { state: 'Colorado', status: '🟡 Enforceable (income thresholds)', notes: '$123,750+ for non-compete (2024); must protect trade secrets', incomeThreshold: '$123,750 (adjusted annually)', maxDuration: 'Reasonableness standard' },
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
          Non-Compete Agreement Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Employment Law
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          Non-Compete Agreement Guide (2025): State Enforceability, FTC Rule Update, California's Void Rule, and Non-Solicitation Alternatives
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Non-compete agreements are legally void in California, Minnesota, North Dakota, and Oklahoma — and recently void-ified for low earners in Washington D.C. The FTC rule banning non-competes nationwide was blocked by a federal court injunction. The law is in flux, state courts are increasingly skeptical of overbroad restrictions, and employees who sign non-competes with California employers may have legal rights they don't know about. This guide covers what every employer and employee needs to know before signing or enforcing a non-compete.
        </p>

        <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '2.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.7 }}>
            <strong>California alert (2024):</strong> SB 699 (effective January 1, 2024) makes California non-competes void even if signed in another state — an employee who signed a non-compete in New York and then moved to California cannot be held to the restriction under California law. AB 1076 required employers to notify current and former California employees that their non-compete agreements are void.
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Non-Compete Enforceability by State</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '560px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>State</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Key Rule</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Income Threshold</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Max Duration</th>
                </tr>
              </thead>
              <tbody>
                {STATE_MAP.map(({ state, status, notes, incomeThreshold, maxDuration }) => (
                  <tr key={state} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: '0.8rem', verticalAlign: 'top' }}>{state}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{status}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, fontSize: '0.76rem', verticalAlign: 'top' }}>{notes}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.75, fontSize: '0.76rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{incomeThreshold}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.75, fontSize: '0.76rem', verticalAlign: 'top' }}>{maxDuration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.8rem', opacity: 0.55, margin: '0.5rem 0 0' }}>Delaware, New York, Pennsylvania, Virginia, and most other states enforce non-competes under a reasonableness standard. Table is representative, not exhaustive.</p>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your Non-Compete or Employment Agreement</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your non-compete agreement or employment contract. BizLegal AI identifies whether the geographic scope, duration, and activity restrictions are likely to be enforceable under the governing law, whether the agreement contains the 5 drafting errors most likely to void non-compete enforcement, whether your jurisdiction has recently enacted restrictions that may have voided your agreement retroactively, and whether a non-solicitation agreement would achieve the same protection with less enforceability risk.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Non-Compete →
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
            <Link href="/guides/startup-employment-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Startup Employment Agreement Guide →</Link>
            <Link href="/guides/ip-assignment-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>IP Assignment Agreement Guide →</Link>
            <Link href="/guides/nda-review-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>NDA Review Guide →</Link>
            <Link href="/guides/equity-compensation-guide-startups" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Equity Compensation Guide →</Link>
            <Link href="/guides/contractor-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Contractor Agreement Guide →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. Non-compete enforceability is highly state-specific and fact-dependent. The FTC non-compete rule, California SB 699, and state non-compete legislation are active areas of law with ongoing litigation and legislation. Income thresholds and duration presumptions change with annual adjustments. Consult qualified employment counsel in the relevant jurisdiction before drafting, signing, or attempting to enforce a non-compete or non-solicitation agreement.
          </p>
        </footer>

      </main>
    </>
  )
}
