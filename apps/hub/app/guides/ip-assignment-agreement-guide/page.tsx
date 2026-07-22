import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'IP Assignment Agreement Guide: Who Owns Code, Inventions, and Work Product (2025) | BizLegal AI',
  description: 'Work-for-hire doctrine, employee IP assignment vs. contractor IP assignment, co-founder IP issues, IP assignment gaps that kill due diligence, and the 5 clauses every founder assignment agreement must have before taking investor money.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/ip-assignment-agreement-guide' },
  openGraph: {
    title: 'IP Assignment Agreement Guide — BizLegal AI',
    description: 'Work-for-hire, employee and contractor IP assignment, co-founder IP risks, and the 5 clauses every startup founder assignment agreement must have before investors conduct diligence.',
    url: 'https://bizlegal-ai.com/guides/ip-assignment-agreement-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What is the work-for-hire doctrine and when does it automatically assign IP to the company?',
    a: 'Work-for-hire is a doctrine under U.S. copyright law (17 U.S.C. § 101) that automatically vests copyright ownership in the employer rather than the creator. There are two categories: (1) Works created by employees within the scope of employment: under the first category, any copyrightable work created by an employee in the course of their employment is automatically owned by the employer — no separate assignment is required. This covers code written during working hours on company equipment for company purposes. The employee retains no rights. (2) Works commissioned under a written agreement for certain specific categories: for independent contractors, work-for-hire applies only if the work falls into one of nine specific statutory categories AND there is a written agreement expressly designating the work as work-for-hire. The nine categories are: contributions to collective works, motion pictures and audiovisual works, translations, supplementary works, compilations, instructional texts, tests, answer material for tests, and atlases. Notice what\'s missing: standalone software code, standalone written reports, and most other deliverables commonly commissioned from contractors. A custom software application built by a contractor is NOT work-for-hire, even with a written agreement calling it "work for hire," because standalone software is not in any of the nine statutory categories. This is one of the most dangerous misconceptions in startup law. Implication for startups: you cannot rely on work-for-hire to establish ownership of code or other creative work from a contractor — you must have a separate, explicit assignment clause. Even for employees, IP assignment agreements are recommended because: (a) the "scope of employment" line can be disputed; (b) work-for-hire covers only copyright, not patents or trade secrets; and (c) the agreement can cover inventions conceived outside work hours that relate to company business. Patents and trade secrets are NEVER automatically assigned — they require an express written assignment in every case, whether the creator is an employee or contractor.',
  },
  {
    q: 'What should an employee IP assignment agreement include?',
    a: 'A well-drafted employee IP assignment agreement (often called an Employee Proprietary Information and Inventions Assignment Agreement, or PIIA/CIIAA) should cover: (1) Assignment of inventions: employee assigns to the company all inventions, discoveries, developments, improvements, and trade secrets conceived, reduced to practice, or made solely or jointly with others during employment that relate to the company\'s current or reasonably anticipated business, research, or development. This should cover inventions made inside AND outside working hours to the extent they relate to company business. (2) Work-for-hire designation: reinforces that copyrightable works created within the scope of employment are work-for-hire, and assigns any remaining copyright to the company to the extent work-for-hire doesn\'t automatically apply. (3) Prior inventions schedule: critically, the agreement should include a schedule (Exhibit A) for the employee to list any prior inventions they are retaining ownership of — inventions conceived before employment that they are NOT assigning to the company. Without this schedule, employees can later claim an invention predates their employment. The schedule can say "None" — the important thing is that it exists and the employee executed it. (4) Disclosure obligation: employee must promptly disclose to the company any invention conceived during employment that may be subject to assignment. This enables the company to decide whether to pursue patent protection. (5) Cooperation: employee agrees to cooperate with patent applications, copyright registration, and other IP protection efforts — including after employment ends. Post-employment cooperation should include a reasonable time limit and the company pays costs. (6) Moral rights waiver: for works that may be subject to moral rights (particularly important for EU jurisdictions), employee waives moral rights to the extent permitted by law. (7) State law exemptions: several states — California, Delaware, Illinois, Minnesota, North Carolina, Washington — have statutes limiting the enforceability of invention assignment clauses. California Labor Code § 2870 exempts inventions developed entirely on the employee\'s own time without using company equipment, supplies, facilities, or trade secret information, unless the invention relates to company business or results from the employee\'s work. The agreement must include the statutory carve-out language. Delaware, Illinois, and Washington have similar provisions.',
  },
  {
    q: 'What are the IP assignment risks specific to co-founders and early contractors?',
    a: 'Co-founder and early contractor IP assignment issues are the single most common red flag in Series A due diligence that delays or kills deals. The core risks: (1) Co-founder who contributed foundational code but never signed an IP assignment: if a co-founder writes the first version of the core product and then leaves before signing a PIIA or founder IP assignment agreement, they may personally own the copyright to that code. The company has a license to use it (implied from their contribution as co-founder), but no clean chain of title. Investors conducting diligence will demand a clean IP chain. The departing co-founder may or may not cooperate with a retroactive assignment. Solution: execute IP assignments as the very first corporate formation document, before anyone writes a single line of code. (2) Early contractor who built core IP without an assignment clause: a contractor who built the MVP in 2022 under a simple Statement of Work with no assignment clause may still own the copyright to that code. Even years later, they can assert ownership. Due diligence will surface this gap. Retroactive assignment requires finding and negotiating with the original contractor — often impossible. (3) Prior employer claims: an engineer who developed foundational ideas while employed at their previous employer may have been subject to that employer\'s IP assignment agreement. If those ideas were related to the prior employer\'s business, that employer may have a claim. This risk is managed by: (a) including a representation in the PIIA that the employee is not in breach of any third-party obligations; (b) ensuring there are no "related to any business the prior employer was engaged in or considering" carve-outs in the engineer\'s prior agreement; (c) scrubbing the relevant code to avoid direct derivation from prior employer\'s codebase. (4) IP created before incorporation: work created before the company was incorporated is owned by whoever created it individually. It must be formally assigned to the corporation after formation, even if the creators later become employees or founders. (5) Open source contamination (see also Open Source License Compliance Guide): if a contractor incorporated AGPL or GPL code without disclosure, the company\'s proprietary code may be encumbered. (6) International founders and contractors: IP assignment agreements must be valid in the jurisdiction where the assignor is located. German employees have mandatory moral rights under UrhG that cannot be fully waived; French employees have similar protections; UK employees have limited automatic assignment under CDPA 1988. Cross-border IP chains need jurisdiction-specific language.',
  },
  {
    q: 'What does a strong contractor IP assignment clause look like?',
    a: 'Since work-for-hire does not cover most contractor deliverables (see FAQ 1), a contractor IP assignment clause is mandatory — not optional. A strong clause includes: (1) Express present-tense assignment: "Contractor hereby assigns, and agrees to assign, to Company all right, title, and interest in and to all Work Product..." Use "hereby assigns" (present tense) rather than "agrees to assign" (future tense) — the former is a present assignment that takes effect immediately; the latter is a promise to assign that may require further action. (2) Definition of Work Product: must be defined broadly to include all code, software, inventions, discoveries, improvements, designs, formulas, processes, know-how, trade secrets, and other work product conceived, made, developed, or first reduced to practice by Contractor in the course of providing services under this Agreement. (3) Assignment of related IP: the assignment should expressly cover not just copyrights but also patents, trade secrets, and any other intellectual property rights in or to the Work Product. (4) Moral rights waiver: "To the extent any moral rights, droit moral, or similar rights exist in any Work Product in any jurisdiction, Contractor hereby irrevocably waives and agrees never to assert such rights against Company..." (5) Cooperation clause: contractor must cooperate with patent applications, copyright registrations, and IP protection efforts — including signing additional documents as reasonably requested. Include: "If Company is unable to obtain Contractor\'s signature on any document after reasonable effort, Contractor hereby irrevocably appoints Company as Contractor\'s attorney-in-fact solely for the purpose of executing and filing such document." (6) Carve-out for pre-existing contractor IP: if the contractor will use or incorporate pre-existing tools, code, frameworks, or materials they independently own, they must list them in a Pre-Existing IP schedule and grant Company a license to use them in connection with the Work Product. This is often missed — if a contractor incorporates their pre-existing reusable library, without a license you have a gap. (7) Survival: the IP assignment provisions survive termination of the agreement for as long as the underlying IP rights exist.',
  },
  {
    q: 'What IP assignment gaps kill due diligence and how are they fixed?',
    a: 'Series A and M&A due diligence invariably includes an IP chain-of-title review. The most common gaps that cause deal delays or price reductions, and the practical fixes: (1) Missing PIIAs for early employees or founders: if any person who contributed to the core product lacks a signed PIIA, investors will require one before closing. Fix: locate original contributors; obtain retroactive IP assignment and PIIA. Most former employees and contractors will cooperate if asked professionally. If one refuses, legal options include quiet title action (expensive) or negotiated settlement. If contribution is immaterial to current product, an opinion letter from IP counsel may suffice. (2) "Agrees to assign" vs. "hereby assigns" in old contractor agreements: future-tense assignment may be treated as an unexercised obligation. Fix: obtain a supplemental "confirmatory assignment" document that confirms the present assignment of all relevant IP. One-paragraph document. (3) No IP assignment in co-founder separation agreements: when a co-founder leaves, their separation agreement typically addresses vesting and equity. IP assignment is often omitted. Fix: any time a co-founder leaves, the separation agreement should include an affirmative IP assignment covering all contributions made during their tenure. (4) Open source contamination disclosure gap: no contractor disclosed their use of AGPL or GPL code in a proprietary product. Fix: commission an open source license audit (automated tools: FOSSA, Black Duck, or Licensee). Identify encumbered code. Rewrite or replace with permissive-license alternatives. Obtain warranty from contractor confirming no unlicensed IP was incorporated. (5) Offshore contractor work without valid written agreement: code written by an offshore contractor under a verbal or email arrangement has no valid IP assignment. Fix: retroactively formalize with a written IP assignment agreement executed under law of contractor\'s jurisdiction. Get legal advice on validity in the relevant jurisdiction (India, Eastern Europe, Latin America each have different requirements). (6) Employee who developed core algorithm in prior PhD research: if core IP relates to academic research, the university may assert an ownership claim. Fix: obtain documentation from the university confirming they make no claim (universities often have policies that exempt research done after graduation or outside university resources); or obtain a license or assignment from the university directly.',
  },
  {
    q: 'Do IP assignment agreements need to be signed before or after code is written?',
    a: 'Before. This is one of the most important practical points in startup IP law. The timing of execution relative to when work product is created affects both the legal effectiveness of the assignment and the likelihood of disputes. Why before matters for employees: once an employee writes code, any written PIIA signed afterward is a retroactive assignment. While retroactive assignments are generally enforceable, they are more legally complex (potential consideration questions, timing of corporate formation, scope disputes about what was created before vs. after signing). More practically: employees who write code first and then negotiate their PIIA may carve out what they believe they already own. Why before matters for contractors: a contractor agreement signed after the work is complete may face the argument that there was no binding agreement at the time the work was performed, or that the assignment was made without adequate consideration. Courts have found retroactive IP assignments unenforceable in certain circumstances, particularly when the contractor can show they were already owed payment regardless of the assignment. The practical playbook for a startup: (1) Before incorporation: do not write any product code until the company entity exists. (2) At incorporation: immediately execute IP assignment agreements with all founders and co-founders covering any prior work product. (3) Before the first day: new employees must sign PIIA before starting work. HR onboarding must not permit system access until PIIA is signed. (4) Before the first deliverable: contractor agreements must be fully executed, including the IP assignment clause, before work begins. Statements of Work should not commence until the master services agreement with IP assignment is countersigned. (5) At employee termination: exit checklist must include confirmation of prior IP assignment scope and absence of outstanding IP disputes. (6) At co-founder departure: separation agreement must include express IP assignment for all work contributed.',
  },
]

export default function IPAssignmentGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'IP Assignment Agreement Guide: Who Owns Code, Inventions, and Work Product (2025)',
    description: 'Work-for-hire doctrine, employee IP assignment vs. contractor IP assignment, co-founder IP issues, and the 5 clauses every startup IP assignment agreement must have before investors conduct diligence.',
    url: 'https://bizlegal-ai.com/guides/ip-assignment-agreement-guide',
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
      { '@type': 'ListItem', position: 3, name: 'IP Assignment Agreement Guide', item: 'https://bizlegal-ai.com/guides/ip-assignment-agreement-guide' },
    ],
  }

  const COMPARISON = [
    { category: 'Employees (copyright)', automatic: 'Yes — work-for-hire applies to works created within scope of employment', assignment: 'Recommended anyway to cover edge cases, patents, and trade secrets', risk: 'Low with proper PIIA signed before start date' },
    { category: 'Employees (patents)', automatic: 'No — patents require express written assignment in all cases', assignment: 'Required — PIIA must cover patent rights explicitly', risk: 'HIGH if PIIA not signed before work begins' },
    { category: 'Contractors (copyright)', automatic: 'No — work-for-hire only covers 9 statutory categories; standalone software not included', assignment: 'Required — must be express written assignment (present tense)', risk: 'CRITICAL if no assignment clause in contractor agreement' },
    { category: 'Contractors (patents)', automatic: 'No — patents require express written assignment in all cases', assignment: 'Required — must be in contractor agreement before work starts', risk: 'CRITICAL — contractor may personally own patent rights to your core product' },
    { category: 'Co-founders', automatic: 'No — co-founders own what they create individually until assigned', assignment: 'Required — founder IP assignment at company formation', risk: 'CRITICAL — departure before assignment leaves gap that kills due diligence' },
    { category: 'Pre-incorporation work', automatic: 'No — company did not exist; individuals own it', assignment: 'Required — must be formally assigned to corporation after formation', risk: 'HIGH — often missed because founders assume formation transfers it automatically' },
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
          IP Assignment Agreement Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Intellectual Property
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          IP Assignment Agreement Guide: Who Owns Code, Inventions, and Work Product (2025)
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          "Work-for-hire" does not cover contractor-written software. Co-founders own what they build until they sign an assignment. Pre-incorporation work belongs to individuals, not the company. These are the IP ownership gaps that surface in Series A due diligence — and they are almost entirely preventable with the right agreements executed in the right order.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Who Owns What: The Assignment Requirement Matrix</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', minWidth: '560px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Creator / IP Type</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Automatic Ownership?</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Assignment Required?</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#dc2626' }}>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(({ category, automatic, assignment, risk }) => (
                  <tr key={category} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{category}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8, fontSize: '0.8rem' }}>{automatic}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8, fontSize: '0.8rem' }}>{assignment}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: risk.startsWith('CRITICAL') ? '#dc2626' : risk.startsWith('HIGH') ? '#d97706' : '#16a34a', fontSize: '0.8rem' }}>{risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem', padding: '1.25rem', background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 600, color: '#dc2626' }}>
            ⚠ The work-for-hire misconception: "We have a contractor agreement that says it's work-for-hire, so we own it." This is legally incorrect for standalone software. Under 17 U.S.C. § 101, work-for-hire for contractors applies only to nine specific statutory categories — standalone software code is not one of them. Without an express assignment clause, the contractor owns the copyright regardless of what the agreement says.
          </p>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your IP Assignment Agreement for Gaps Before Investors Find Them</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your PIIA, contractor agreement, or founder IP assignment and BizLegal AI identifies missing present-tense assignment language, absent patent assignment provisions, carve-outs that may exclude your core product, missing prior-invention schedules, and post-employment cooperation gaps — before your Series A counsel runs the same check.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your IP Assignment Agreement →
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
            <Link href="/guides/contractor-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Contractor Agreement Guide →</Link>
            <Link href="/guides/nda-review-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>NDA Review Guide →</Link>
            <Link href="/guides/saas-vendor-agreement-review-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SaaS Vendor Agreement Review →</Link>
            <Link href="/guides/startup-compliance-program-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Startup Compliance Program →</Link>
            <Link href="/guides/contract-risk-analysis-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Contract Risk Analysis →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. IP ownership, work-for-hire analysis, and assignment agreement enforceability depend on jurisdiction, the nature of the work product, and the specific facts of each relationship. State-specific IP assignment statutes (California, Delaware, Illinois, Minnesota, North Carolina, Washington) create additional requirements. Engage qualified intellectual property counsel before finalizing any IP assignment agreements.
          </p>
        </footer>

      </main>
    </>
  )
}
