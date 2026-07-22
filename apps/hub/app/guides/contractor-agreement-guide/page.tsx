import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Independent Contractor Agreement Guide: Avoiding Misclassification (2025) | BizLegal AI',
  description: 'The ABC test vs. 20-factor test vs. economic reality test. 5 contractor agreement clauses that trigger misclassification findings. California AB5, UK IR35, EU Platform Work Directive, and how to structure contractor agreements that survive audit.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/contractor-agreement-guide' },
  openGraph: {
    title: 'Independent Contractor Agreement Guide — BizLegal AI',
    description: 'ABC test, California AB5, UK IR35, EU Platform Work Directive — misclassification penalties and the contractor agreement provisions that get companies audited.',
    url: 'https://bizlegal-ai.com/guides/contractor-agreement-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What is the ABC test and how does it determine employee vs. independent contractor status?',
    a: 'The ABC test is the worker classification standard used in California (under AB5), Massachusetts, New Jersey, and several other states. It presumes that all workers are employees unless the hiring company can satisfy all three prongs: Prong A — The worker is free from the control and direction of the hiring entity in connection with the performance of the work, both under the contract for the performance of the work and in fact. Prong B — The worker performs work that is outside the usual course of the hiring entity\'s business. Prong C — The worker is customarily engaged in an independently established trade, occupation, or business of the same nature as the work performed. The key insight about the ABC test is that all three prongs must be satisfied — and any single failure classifies the worker as an employee. The most difficult prong for tech companies is Prong B. If you hire a software developer to write code for your software company, that developer is performing work within the usual course of your business — meaning AB5 classifies them as an employee, regardless of what your contract says. In contrast, hiring a plumber to repair your office building\'s pipes is work outside the usual course of a software business — the ABC test would not classify that plumber as your employee. AB5 impact on tech and creative industries: when AB5 passed in 2019, it classified most gig workers, freelance journalists, musicians, translators, and many tech contractors as employees. The law includes numerous industry-specific exemptions (doctors, dentists, lawyers, architects, engineers, licensed manicurists, certain financial advisors) and a "business-to-business" exemption for truly independent contractor businesses. Critically: if your state uses the ABC test and you cannot satisfy Prong B, it does not matter how carefully your contractor agreement is drafted — the worker is legally an employee.',
  },
  {
    q: 'What is the IRS 20-factor test for independent contractor classification?',
    a: 'The IRS uses a common-law "behavioral control, financial control, and type of relationship" framework (sometimes called the 20-factor test based on earlier Revenue Rulings) to determine whether a worker is an employee or independent contractor for federal employment tax purposes. Modern IRS guidance groups the factors into three categories: (1) Behavioral Control — does the company control or have the right to control what the worker does and how the worker does their job? Key factors: instructions the worker must follow (when/where/how to work); training provided by the company; integration of services into business operations. (2) Financial Control — does the company control the financial aspects of the worker\'s work? Key factors: significant investment by the worker in tools/facilities; ability of worker to work for other companies; availability of worker\'s services to the general market; how the worker is paid (hour vs. project vs. flat fee); ability of worker to realize a profit or loss. (3) Type of Relationship — what is the nature of the parties\' relationship? Key factors: written contracts (but these are not determinative); employee benefits provided; permanency of the relationship; whether services are a key aspect of the business. No single factor is determinative under the IRS test — it is a totality-of-circumstances approach. This means that a carefully drafted contractor agreement, while helpful, does not by itself establish independent contractor status if the actual working relationship resembles employment. The IRS can recharacterize workers as employees even when the company and worker both agree on contractor status, if the working relationship facts point toward employment.',
  },
  {
    q: 'What is UK IR35 and how does it affect off-payroll contractors?',
    a: 'IR35 (Chapter 8/10 of ITEPA 2003, as reformed in 2017/2021) is the UK\'s off-payroll working rules, designed to ensure that workers who would be employees if they contracted directly with a client cannot use a personal service company (PSC) intermediary to avoid employment taxes. How IR35 works: a contractor operates through their own PSC (e.g., "John Smith Ltd"). The contractor\'s PSC contracts with a client. If the contractor\'s working arrangements would constitute employment if the PSC didn\'t exist, the contract is "inside IR35" and subject to PAYE and National Insurance. Reform history (critical for compliance): Pre-April 2017: Contractor\'s PSC was responsible for determining IR35 status and deducting taxes if inside IR35. April 2017 reform (public sector): Public sector clients became responsible for determining IR35 status. April 2021 reform (private sector): Medium and large private sector clients became responsible for determining IR35 status. Small companies (annual turnover ≤ £10.2M) remain exempt — the contractor\'s PSC retains responsibility for status determination. Key tests for UK IR35 status: (1) Substitution — does the contractor have a right to send a substitute worker? If yes, this strongly indicates outside-IR35 status; (2) Control — does the client control where, when, and how the work is done? More control = more likely inside; (3) Mutuality of obligation — is the client obligated to offer work, and is the contractor obligated to accept it? Yes = inside IR35 indicator; (4) Integration — is the contractor integrated into the client\'s team like an employee (team meetings, corporate email, badge access)? Penalties for incorrect IR35 determination: the client (medium/large) bears PAYE liability, plus penalties (up to 100% of unpaid tax for deliberate errors), plus interest.',
  },
  {
    q: 'What 5 provisions in a contractor agreement trigger misclassification findings?',
    a: 'Worker classification is determined by the actual working relationship, not just the contract — but a poorly drafted contractor agreement can be used as evidence of employment intent. These 5 provisions are the most commonly cited by regulators and courts as misclassification indicators: (1) No substitution right: "Services must be performed personally by Contractor." An employee must show up and do the work personally; a true independent contractor retains the right to send a qualified substitute. Include: "Contractor may use substitute personnel at Contractor\'s sole expense, provided that substitute personnel are qualified to perform the Services." (2) Fixed hours / location requirements: "Contractor shall work Monday-Friday from 9am-5pm at Company\'s offices." Employment-style scheduling and location requirements indicate behavioral control. Include instead: deliverable-based obligations with flexible performance requirements, no minimum hours mandated, and work-from-anywhere provisions. (3) Prohibition on other clients: "Contractor shall dedicate 100% of working time to Company and shall not provide services to any other entity during the Term." Single-client exclusivity is the hallmark of employment — a genuine independent contractor business serves multiple clients. Include instead: a narrowly tailored non-solicitation of Company\'s specific customers clause, not a broad work prohibition. (4) Equipment and tools provided by client: "Company shall provide Contractor with a laptop, corporate email address, and building access badge." Employer-provided tools and resources indicate employment. Include instead: "Contractor shall provide all equipment and tools necessary for performance of Services at Contractor\'s expense. Company may provide access to specific Company systems necessary for Services, but does not provide equipment." (5) Indefinite rolling term: "This Agreement shall continue indefinitely until terminated by either party." Permanent, indefinitely-renewable engagements resemble employment. Include instead: a defined project scope, a fixed term, or a clear deliverable-based end point with optional renewal by mutual agreement.',
  },
  {
    q: 'What are the penalties for misclassifying employees as independent contractors?',
    a: 'Misclassification exposes companies to liability across multiple overlapping regulatory regimes simultaneously: Federal IRS exposure: Back payroll taxes (employer share of Social Security 6.2%, Medicare 1.45%, plus FUTA) for all misclassified periods. Interest on unpaid taxes. Trust fund recovery penalties — IRS can hold officers personally liable for the employee share of taxes that should have been withheld. Failure-to-deposit penalties up to 15% of unpaid amount. California (AB5) penalties: $5,000-$25,000 penalty per misclassified worker per violation. Back wages for minimum wage, overtime, and all wage statement violations (PAGA Private Attorneys General Act claims — any current/former employee can sue and collect 75% of penalties for the state). Class action exposure when multiple workers share similar arrangements. California Labor Commissioner investigations and audits. Department of Labor (federal): Back wages under FLSA (Fair Labor Standards Act) for minimum wage and overtime. Liquidated damages (an additional equal amount of back wages). Potential criminal referral for willful violations. Benefits liability: Misclassified workers may assert retroactive rights to participate in 401(k) plans, health insurance, stock option programs, and other benefits they were denied during the misclassification period. Benefits providers may also deny employer deductions for plans that improperly excluded misclassified employees. State unemployment insurance: Unpaid state unemployment insurance taxes on all compensation paid to misclassified workers, plus interest and penalties. Safe harbors and defenses: Section 530 relief (IRS): Companies that had a reasonable basis for contractor classification and treated all similar workers consistently may avoid employment tax liability under Section 530 of the Revenue Act of 1978 — but this requires consistent treatment and good-faith compliance, not just a signed contract.',
  },
  {
    q: 'What should a properly structured contractor agreement include to reduce misclassification risk?',
    a: 'A contractor agreement designed to withstand IRS, state labor board, and DOL scrutiny should include the following provisions: (1) Independent contractor relationship recital: explicit language stating the parties intend an independent contractor (not employment) relationship, that Contractor is not entitled to any employee benefits, and that Contractor is solely responsible for all taxes, workers\' compensation, and insurance. Recitals alone don\'t determine classification, but they establish intent. (2) Right to substitute: Contractor may use qualified substitute personnel to perform the Services, at Contractor\'s expense, with reasonable prior written notice to Company. (3) Deliverables-based obligations: Work is defined by specific deliverables, outcomes, or milestones — not hours. "Contractor shall deliver X by Date Y" not "Contractor shall work 40 hours per week." (4) Contractor\'s own tools and resources: Contractor provides own equipment, facilities, and software. Company provides access credentials to Company systems only as necessary to complete specific deliverables. (5) Multiple client acknowledgment: Company acknowledges that Contractor provides similar services to other clients, and this Agreement does not restrict Contractor from doing so, except as to Company\'s specific confidential information and non-solicited customers. (6) No benefits language: Contractor is not entitled to and shall not participate in any Company employee benefit plans, including health insurance, 401(k), stock options, vacation, sick leave, or workers\' compensation. (7) Tax responsibility allocation: Contractor is responsible for all federal, state, and local taxes on compensation paid under this Agreement. Company will report compensation on IRS Form 1099 (not W-2) and will not withhold any taxes. (8) Right to control method: Company may specify the results to be achieved but not the method, manner, or means by which Contractor achieves those results. (9) Fixed term or project scope: Agreement covers [specific project] / [specific period] with clearly defined deliverables and completion criteria. (10) Workers\' compensation and liability insurance: Contractor maintains adequate general liability insurance and, if applicable, workers\' compensation insurance, evidenced by certificate of insurance.',
  },
]

export default function ContractorAgreementGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Independent Contractor Agreement Guide: Avoiding Misclassification (2025)',
    description: 'The ABC test vs. 20-factor test vs. economic reality test. California AB5, UK IR35, EU Platform Work Directive, misclassification penalties, and the 5 contractor agreement clauses that trigger reclassification findings.',
    url: 'https://bizlegal-ai.com/guides/contractor-agreement-guide',
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
      { '@type': 'ListItem', position: 3, name: 'Contractor Agreement Guide', item: 'https://bizlegal-ai.com/guides/contractor-agreement-guide' },
    ],
  }

  const TESTS = [
    { test: 'ABC Test', jurisdictions: 'California (AB5), Massachusetts, New Jersey, Vermont, Connecticut', standard: 'All 3 prongs must be satisfied. Worker is employee unless: (A) free from control, (B) outside usual course of business, (C) independently established business', risk: 'Prong B fails most tech contractors at software companies' },
    { test: 'IRS Common Law / 20-Factor', jurisdictions: 'Federal (all states) — IRS, for employment tax purposes', standard: 'Behavioral control, financial control, type of relationship (totality of circumstances)', risk: 'No single factor determinative — cumulative analysis. Misclassification = personal liability for officers' },
    { test: 'Economic Reality Test', jurisdictions: 'FLSA (federal) — DOL, for minimum wage / overtime purposes', standard: 'Is the worker economically dependent on the hiring entity, or running an independent business? Permanency, investment, integration, opportunity for profit/loss', risk: 'DOL can assert even if IRS agrees on contractor status — dual exposure' },
    { test: 'UK IR35 / Off-Payroll', jurisdictions: 'United Kingdom', standard: 'Substitution, control, mutuality of obligation. Medium/large clients determine status via Status Determination Statement (SDS)', risk: 'Client (medium/large) bears PAYE liability for incorrect determination' },
    { test: 'EU Platform Work Directive', jurisdictions: 'EU Member States (implementing 2026–2027)', standard: 'Rebuttable presumption of employment for platform workers. Platform must prove absence of 2 of 5 employment indicia', risk: 'Presumption shifts burden to platform to disprove employment' },
  ]

  const MISCLASSIFICATION_TRIGGERS = [
    { clause: 'Personal performance only', why: 'Real contractors can substitute — employees must show up personally', fix: 'Add explicit substitution right with qualifications requirement' },
    { clause: 'Fixed hours/location', why: 'Employer behavioral control over when/where work is done', fix: 'Deliverables-based scope; no hours or location mandate' },
    { clause: 'Exclusivity / single-client mandate', why: 'Genuine independent businesses serve multiple clients', fix: 'Remove exclusivity; use narrow non-solicitation instead' },
    { clause: 'Company-provided equipment', why: 'Employee indicator — contractor provides own tools', fix: 'Contractor provides own tools; company provides access credentials only' },
    { clause: 'Indefinite rolling term', why: 'Resembles permanent employment rather than discrete project engagement', fix: 'Fixed project scope or term; optional renewal by written agreement' },
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
          Contractor Agreement Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Employment Law
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          Independent Contractor Agreement Guide: Avoiding Misclassification (2025)
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Worker misclassification is one of the most expensive compliance mistakes a startup can make. It triggers simultaneous liability across IRS, DOL, state labor boards, and class action plaintiffs. The contractor agreement you sign (or draft) is not dispositive — but it is evidence. This guide covers the five tests regulators use, the five contract clauses that create the most misclassification risk, and how to structure agreements that can survive audit.
        </p>

        <div style={{ padding: '1rem 1.25rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', marginBottom: '2.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.7 }}>
            <strong>Critical:</strong> Worker classification is determined by the actual working relationship, not just the written contract. A contract that says "independent contractor" while the working relationship exhibits employment characteristics will not protect you. Contract drafting reduces risk — it does not override reality.
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>5 Classification Tests: Which Applies to You</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Test</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Applies Where</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Standard</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Key Risk</th>
                </tr>
              </thead>
              <tbody>
                {TESTS.map(({ test, jurisdictions, standard, risk }) => (
                  <tr key={test} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{test}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8, fontSize: '0.8rem' }}>{jurisdictions}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8, fontSize: '0.8rem' }}>{standard}</td>
                    <td style={{ padding: '10px 12px', color: '#dc2626', fontSize: '0.8rem' }}>{risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.85rem', opacity: 0.6, fontStyle: 'italic' }}>
            Multiple tests can apply simultaneously — the IRS test and California ABC test can both apply to the same contractor engagement. Satisfying one does not satisfy the other.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>5 Contract Clauses That Most Often Trigger Misclassification</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Clause</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Why It Triggers</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>What to Do</th>
                </tr>
              </thead>
              <tbody>
                {MISCLASSIFICATION_TRIGGERS.map(({ clause, why, fix }) => (
                  <tr key={clause} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{clause}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8 }}>{why}</td>
                    <td style={{ padding: '10px 12px', color: '#1a56db', fontWeight: 500 }}>{fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your Contractor Agreement for Misclassification Risk Indicators</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your contractor agreement and BizLegal AI flags clauses that undermine independent contractor status — personal performance requirements, fixed hours mandates, single-client exclusivity, equipment-provided provisions, indefinite rolling terms, and missing substitution rights — with plain-language explanations and redline suggestions for each finding.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Contractor Agreement →
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
            <Link href="/guides/nda-review-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>NDA Review Guide →</Link>
            <Link href="/guides/saas-vendor-agreement-review-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SaaS Vendor Agreement Review →</Link>
            <Link href="/guides/gdpr-data-processing-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR DPA Guide →</Link>
            <Link href="/guides/startup-compliance-program-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Startup Compliance Program →</Link>
            <Link href="/guides/fincen-msb-registration-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>FinCEN MSB Guide →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. Worker classification is a highly fact-specific analysis that depends on the actual working relationship, the applicable jurisdiction's test, and the specific industry. The guidance here reflects general principles under U.S. federal and California law as of 2025 and UK IR35 as reformed in 2021. Classification requirements change frequently — engage qualified employment counsel before structuring contractor arrangements, especially in California or the UK.
          </p>
        </footer>

      </main>
    </>
  )
}
