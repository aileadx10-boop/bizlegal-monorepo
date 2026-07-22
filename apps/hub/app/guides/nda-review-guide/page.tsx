import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'NDA Review Guide: Red Flags and What to Negotiate Before Signing (2025) | BizLegal AI',
  description: 'The 8 most dangerous NDA clauses — overbroad confidentiality scope, perpetual duration, no residuals carve-out, unlimited liquidated damages, prohibited work clauses, and unilateral amendment rights — and how to negotiate each before you sign.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/nda-review-guide' },
  openGraph: {
    title: 'NDA Review Guide — BizLegal AI',
    description: 'One-way vs mutual NDAs, overbroad confidentiality scope, perpetual duration, residuals clauses, liquidated damages, and prohibited work — what to check before signing any NDA.',
    url: 'https://bizlegal-ai.com/guides/nda-review-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What is the difference between a one-way and a mutual NDA?',
    a: 'A one-way (unilateral) NDA obligates only one party — the recipient — to keep information confidential. The disclosing party has no confidentiality obligation. A mutual (bilateral) NDA obligates both parties to keep each other\'s information confidential. When to insist on mutual: if both parties are sharing proprietary information during the engagement — for example, in an M&A due diligence process, a joint venture negotiation, or a product integration discussion — a mutual NDA is appropriate and protects both sides. When a one-way NDA is fine: when only one party is disclosing sensitive information. If you\'re a vendor sharing your technology with a prospective client, a one-way NDA protecting only your disclosure is appropriate. The risk of a one-way NDA where mutual is warranted: if you inadvertently disclose your proprietary information during an exchange where you are the "recipient" under a one-way NDA, you have no contractual protection for that disclosure — the other party can use it freely. One-way NDAs are also often drafted more aggressively by the disclosing party (since they\'re only binding the other side), so the scope of "confidential information," the permitted use restrictions, and the remedies are frequently broader than what a mutual NDA would contain. Watch for: one-way NDAs from large companies that include "residuals" clauses on their side only (letting their employees use retained knowledge from your disclosures) while prohibiting you from doing the same. A residuals clause only running in one direction is a significant asymmetry.',
  },
  {
    q: 'What should the confidentiality scope in an NDA cover — and what makes it overbroad?',
    a: 'The "Confidential Information" definition determines everything the NDA protects. A well-drafted definition should: (1) Require marking or identification: Written information should be marked "CONFIDENTIAL" (or equivalent) at disclosure. Oral information should be reduced to writing and designated within a reasonable period (30 days is standard). Without a marking requirement, parties often have no practical way to know what is and isn\'t covered. (2) Include a reasonable carve-out for information that doesn\'t deserve protection: Standard carve-outs that should always appear: (a) information already in the receiving party\'s possession before disclosure; (b) information that becomes publicly available through no fault of the receiving party; (c) information independently developed by the receiving party without use of the confidential information; and (d) information received from a third party with no confidentiality obligation. What makes a definition overbroad: (1) "All information disclosed by Disclosing Party" — no marking requirement, no carve-outs. This is unworkable and can cover casual business conversations, public information, and information the recipient already knew. (2) Expansive categories that effectively cover an entire industry: "All information relating to Disclosing Party\'s business, operations, products, customers, suppliers, technology, and financial condition, whether or not marked confidential." This formulation sweeps in publicly available information and creates perpetual uncertainty about what the recipient can and cannot use. (3) Including information "learned" or "derived from" disclosed information without any nexus requirement — effectively sweeping in anything the receiving party develops while the NDA is in effect, even if it has no relationship to the disclosed information.',
  },
  {
    q: 'How long should an NDA last, and what makes a perpetual NDA problematic?',
    a: 'NDAs should have two time-related components: (1) The term during which parties exchange confidential information (typically 1-2 years for a sales process or product evaluation; longer for ongoing relationships); and (2) The confidentiality obligation period — how long received information must be kept confidential after disclosure or after the agreement terminates. Industry standards: For general commercial NDAs: 2-5 years of confidentiality obligation after termination is reasonable for most business information. For genuinely valuable trade secrets: a longer period (or trade-secret-specific carve-out) can be justified. For merger/acquisition discussions: 3-5 years post-termination is common. What makes perpetual NDAs problematic: A perpetual confidentiality obligation (no end date on the duty to keep information secret) creates indefinite legal exposure for the receiving party. Years later, the receiving party may have no reliable way to distinguish which information was received under the NDA and what they learned through other means — making any use of the information risky. Perpetual obligations also create compliance problems: employees leave, records are lost, business units are sold, and the institutional knowledge of what was covered by the NDA dissipates. Best practice: trade-secret carve-out approach. Instead of a perpetual NDA, include a standard confidentiality obligation period for most information (3-5 years) plus a separate provision that extends protection for information that qualifies as a trade secret under the Defend Trade Secrets Act (18 U.S.C. § 1836) or applicable state law — for as long as it retains trade secret status. This provides robust protection for genuinely valuable secrets without the compliance burden of a truly perpetual obligation over all information.',
  },
  {
    q: 'What is a residuals clause in an NDA and when should I reject it?',
    a: 'A residuals clause (sometimes called a "retained knowledge" clause) permits the receiving party to use, in future work, any information retained in the unaided memory of personnel who had access to the confidential information — without any restriction related to the NDA. The clause typically reads: "Notwithstanding anything to the contrary, [Receiving Party] shall have the right to use for any purpose the Residuals resulting from access to or work with the Confidential Information. \'Residuals\' means information in intangible form retained in the unaided memories of persons who have had access to the Confidential Information and who have not intentionally memorized the information for the purpose of retaining and subsequently using or disclosing it." Why large companies demand residuals clauses: Companies like Google, Microsoft, Amazon, and other tech giants routinely include residuals clauses in their NDAs. The practical argument: it\'s impossible to require employees who attended a demonstration or meeting to "forget" product concepts they were exposed to — and a residuals clause clarifies that using general skills and knowledge retained in memory is not an NDA violation. Why you should be concerned about residuals clauses: (1) Knowledge workers don\'t naturally compartmentalize what they remember vs. what they learned under NDA; (2) For genuinely novel technology, a residuals clause can effectively allow the counterparty to replicate your core innovation — especially with AI assistance in reconstructing concepts; (3) If the clause only runs in one direction (company gets a residuals carve-out; you don\'t), you\'re accepting asymmetric protection. When to accept a residuals clause: when you\'re dealing with a large, established company that includes it in their standard NDA, and the information you\'re disclosing is the kind of product pitch / feature demonstration that employees inevitably remember. When to reject it: when you\'re disclosing genuinely proprietary algorithms, source code details, or novel mechanisms that the counterparty could replicate using the "retained knowledge" — especially in AI/ML, biotech, and highly technical domains.',
  },
  {
    q: 'What do liquidated damages and injunctive relief clauses in NDAs mean?',
    a: 'NDAs routinely include two different remedy provisions for breach, and understanding both is essential before signing. Injunctive relief: An injunctive relief clause states that breach of the NDA will cause irreparable harm that cannot be adequately compensated by money damages, and therefore the non-breaching party is entitled to seek an injunction (a court order to stop the breach) without posting a bond. What this means in practice: the disclosing party can go to court for an emergency restraining order or preliminary injunction immediately upon discovering a breach — before any breach is proven at trial. Courts generally defer to NDA injunctive relief clauses and routinely grant TROs in clear cases. Why this matters: if you breach an NDA (even inadvertently), you can face a court order requiring you to stop using the information, preserve evidence, and appear in court within days — before you can finish reading the complaint. This is one of the most commercially significant NDA provisions. Liquidated damages: Some NDAs include a fixed damages amount per breach (e.g., "$100,000 per unauthorized disclosure"). Liquidated damages clauses are enforceable when the actual damages are genuinely difficult to calculate and the amount is a reasonable estimate (not a penalty). What to watch for: (1) Uncapped per-disclosure amounts that could result in existential exposure from a single email accidentally sent to the wrong person; (2) Liquidated damages combined with injunctive relief (you can\'t have both for the same breach — courts typically choose one remedy); (3) Liquidated damages provisions that effectively criminalize good-faith mistakes. Negotiate: (1) Cap total liquidated damages at a reasonable maximum (e.g., total fees paid under the main agreement); (2) Require actual notice of breach before liquidated damages accrue; (3) Include a cure period for inadvertent disclosures.',
  },
  {
    q: 'What is a permitted disclosure clause and why does it matter?',
    a: 'Permitted disclosure clauses specify who the receiving party is allowed to share confidential information with, and under what conditions. Most well-drafted NDAs allow disclosure to: (1) Employees with a "need to know" — restricted to those who need the information to evaluate the opportunity or perform the contract; (2) Professional advisors — attorneys, accountants, and other professional advisors bound by independent confidentiality obligations (professional ethics rules); and (3) Affiliates — subsidiary or parent companies, sometimes with a requirement that the affiliate is similarly bound. Red flags in permitted disclosure clauses: (1) No "need to know" restriction — disclosure is permitted to "any of Receiving Party\'s employees and contractors." Without a need-to-know restriction, any employee of a 50,000-person company can access your confidential information without any additional controls. (2) Sub-contractor pass-through without express written agreement requirement — if a company can share your confidential information with any third-party contractor without requiring that contractor to sign a written confidentiality agreement, your information flows outside of any contractual protection. (3) Broad affiliate chains — "affiliate" is often defined to include any entity under common control, which for large holding companies or private equity portfolio companies could mean dozens of unrelated businesses. (4) No notification requirement on compelled disclosure — if a court, regulator, or government authority orders disclosure, the receiving party should be required to: give prompt written notice before disclosure (if legally permitted); cooperate in seeking a protective order; and disclose only the minimum required. Without this provision, the receiving party can comply with a government subpoena and voluntarily disclose your confidential information without telling you first.',
  },
]

export default function NdaReviewGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'NDA Review Guide: Red Flags and What to Negotiate Before Signing (2025)',
    description: 'One-way vs mutual NDAs, overbroad confidentiality scope, perpetual duration, residuals clauses, liquidated damages, permitted disclosures, and the 8 provisions every legal team should review before signing a non-disclosure agreement.',
    url: 'https://bizlegal-ai.com/guides/nda-review-guide',
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
      { '@type': 'ListItem', position: 3, name: 'NDA Review Guide', item: 'https://bizlegal-ai.com/guides/nda-review-guide' },
    ],
  }

  const NDA_TYPES = [
    { type: 'One-Way (Unilateral)', protects: 'Disclosing party only', when: 'One party sharing product/tech demo with prospect', risk: 'Recipient has no protection if they disclose anything' },
    { type: 'Mutual (Bilateral)', protects: 'Both parties equally', when: 'M&A due diligence, JV negotiation, product integration', risk: 'Lower risk — symmetric protection' },
    { type: 'Employee NDA', protects: 'Employer\'s confidential information', when: 'Onboarding, promotion to sensitive role', risk: 'May include overly broad non-compete language' },
    { type: 'Vendor NDA', protects: 'Client\'s information disclosed to vendor', when: 'Professional services, SaaS, consulting engagement', risk: 'Often one-way; may not protect vendor\'s IP' },
  ]

  const HIGH_RISK_CLAUSES = [
    { clause: 'No marking requirement', risk: 'All disclosed information covered — impossible to track', action: 'Add marking requirement for written; 30-day reduction for oral' },
    { clause: 'Perpetual duration', risk: 'Indefinite compliance exposure; impossible to manage', action: 'Cap at 3-5 years + trade-secret carve-out' },
    { clause: 'One-sided residuals clause', risk: 'Counterparty retains and reuses your core IP via "memory"', action: 'Reject or require mutual residuals' },
    { clause: 'Uncapped liquidated damages', risk: 'Single accidental email = existential financial exposure', action: 'Cap at total contract value; require notice + cure' },
    { clause: 'No need-to-know restriction', risk: 'All employees + contractors access confidential data freely', action: 'Add "need to know" + sub-processor agreement requirement' },
    { clause: 'Broad work-product ownership', risk: 'IP you develop during engagement is assigned to counterparty', action: 'Remove or limit to specifically commissioned work' },
    { clause: 'No compelled-disclosure notice', risk: 'Counterparty complies with government subpoena silently', action: 'Add prompt notice + protective order cooperation' },
    { clause: 'Unilateral scope amendment', risk: 'Disclosing party expands what\'s covered after signing', action: 'Remove or require written consent for amendments' },
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
          NDA Review Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Contract Risk
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          NDA Review Guide: Red Flags and What to Negotiate Before Signing (2025)
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Most founders sign NDAs quickly — under time pressure, without legal review, because the counterparty says "it's our standard form." Standard forms are standard because they're standard for the drafter. This guide covers the 8 highest-risk NDA clauses and what to negotiate in each, before you're bound.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>NDA Types at a Glance</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Protects</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Typical Use</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Key Risk</th>
                </tr>
              </thead>
              <tbody>
                {NDA_TYPES.map(({ type, protects, when, risk }) => (
                  <tr key={type} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{type}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8 }}>{protects}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8 }}>{when}</td>
                    <td style={{ padding: '10px 12px', color: '#dc2626', fontSize: '0.825rem' }}>{risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>8 High-Risk NDA Clauses and What to Do About Each</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Clause</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Risk</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Fix</th>
                </tr>
              </thead>
              <tbody>
                {HIGH_RISK_CLAUSES.map(({ clause, risk, action }) => (
                  <tr key={clause} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{clause}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8 }}>{risk}</td>
                    <td style={{ padding: '10px 12px', color: '#1a56db', fontWeight: 500 }}>{action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Standard NDA Structure: What to Expect and What to Check</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            A properly structured NDA contains the following sections in roughly this order. Sections that are often missing or defective in standard-form NDAs are noted:
          </p>
          <ol style={{ paddingLeft: '1.5rem', lineHeight: 1.95 }}>
            <li><strong>Definition of Confidential Information</strong> — Should include marking requirements and express carve-outs for public information, prior knowledge, and independent development. Often defective: no carve-outs; no marking requirement.</li>
            <li><strong>Permitted Uses</strong> — Limits use to the specific Purpose (e.g., evaluating a potential partnership). Often defective: purpose defined so broadly ("business development") that disclosure for unrelated uses is arguably permitted.</li>
            <li><strong>Permitted Disclosures</strong> — Specifies who can receive the information (need-to-know employees, professional advisors). Often defective: no need-to-know restriction; sub-contractors included without written agreement requirement.</li>
            <li><strong>Standard of Care</strong> — Obligation to protect the information using "at least the same degree of care as used for own information, but no less than reasonable care." Should specify minimum standard even if receiving party has no internal confidential information practices.</li>
            <li><strong>Term and Termination</strong> — Agreement term (when exchange period ends) and confidentiality period (how long the obligation survives termination). Often defective: perpetual with no sunset; no distinction between agreement term and obligation period.</li>
            <li><strong>Return or Destruction</strong> — Upon termination, receiving party must return or destroy confidential information and certify in writing. Often defective: silent on backup copies ("to the extent practicable"); no certification requirement.</li>
            <li><strong>Remedies</strong> — Injunctive relief provision; sometimes liquidated damages. Check for: adequate notice and cure periods; mutual vs. one-sided injunction rights; capped liquidated damages.</li>
            <li><strong>No License Granted</strong> — Explicit statement that the NDA does not grant any IP license or right to use the disclosing party's information beyond the Purpose. Critical for technology disclosures.</li>
            <li><strong>Residuals</strong> — (If present) — Check whether mutual or one-sided. If one-sided, evaluate whether the counterparty's retained knowledge advantage is acceptable given the nature of the disclosed information.</li>
            <li><strong>Governing Law and Dispute Resolution</strong> — Jurisdiction and applicable law. Check whether arbitration is mandatory (may limit your ability to seek emergency injunctive relief) or litigation is available (preferred for NDA enforcement given injunctive remedy importance).</li>
          </ol>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your NDA for High-Risk Clauses Before You Sign</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload the NDA you received and BizLegal AI identifies perpetual duration, overbroad confidentiality scope, one-sided residuals clauses, uncapped liquidated damages, absent carve-outs, and permitted disclosure gaps — with plain-language explanations and redline-ready negotiation positions.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your NDA →
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
          <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1rem' }}>Related contract and compliance resources</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link href="/guides/saas-vendor-agreement-review-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SaaS Vendor Agreement Review →</Link>
            <Link href="/guides/contract-risk-analysis-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Contract Risk Analysis →</Link>
            <Link href="/guides/gdpr-data-processing-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR DPA Guide →</Link>
            <Link href="/guides/startup-compliance-program-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Startup Compliance Program →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Compliance Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. NDA enforceability, appropriate scope, and negotiation strategy depend on the specific agreement, the jurisdiction, the nature of the information being disclosed, and the relationship between the parties. Engage qualified commercial contract counsel before signing any NDA covering genuinely sensitive or proprietary information.
          </p>
        </footer>

      </main>
    </>
  )
}
