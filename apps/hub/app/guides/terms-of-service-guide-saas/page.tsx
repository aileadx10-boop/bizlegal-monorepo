import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service Compliance Guide for SaaS Startups (2025) | BizLegal AI',
  description: 'FTC Click-to-Cancel rule (2024), limitation of liability clauses, class action waivers, DMCA safe harbor, EU Digital Services Act obligations, and the 8 provisions every SaaS Terms of Service must address to be enforceable.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/terms-of-service-guide-saas' },
  openGraph: {
    title: 'Terms of Service Compliance Guide for SaaS — BizLegal AI',
    description: 'FTC auto-renewal disclosures, limitation of liability caps, class action waivers, DMCA safe harbor, EU DSA — the essential SaaS Terms of Service provisions for 2025.',
    url: 'https://bizlegal-ai.com/guides/terms-of-service-guide-saas',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What is the FTC Click-to-Cancel rule and how does it affect SaaS auto-renewal terms?',
    a: 'The FTC\'s "Negative Option Rule" amendment, finalized in October 2024 and titled the "Click-to-Cancel" rule, significantly expands the FTC\'s requirements for subscriptions and auto-renewal disclosures. It applies to virtually all negative option programs — including SaaS monthly and annual subscriptions. Key requirements that took effect in 2025: (1) Simple cancellation mechanism: Cancellation must be "at least as easy" as enrollment. If a customer signed up online with two clicks, they must be able to cancel online with two clicks (or fewer). You cannot require customers to call a phone number, send a letter, or navigate to a physical location to cancel a subscription they signed up for online. If you require chatting with a support agent to cancel ("save attempts"), the agent must immediately honor the cancellation request — they may attempt one save but must immediately cancel if the customer declines or doesn\'t respond. (2) Pre-enrollment disclosure: Before billing, you must clearly and conspicuously disclose: the subscription will automatically renew; the specific frequency and amount of charges; how to cancel; and the deadline to cancel without incurring the next charge. "Clear and conspicuous" means in a location where consumers will actually see it — not buried in ToS or presented in fine print below the "Subscribe" button. (3) Annual reminder notice: For subscriptions where the billing period is annual or longer, the rule requires an annual notice reminding users of their subscription and how to cancel before the next billing date. (4) Express informed consent: Affirmative opt-in is required before charging — pre-checked boxes, default enrollment, and ambiguous consent flows do not satisfy this requirement. FTC enforcement: The FTC has brought significant enforcement actions against companies with dark pattern cancellation flows. Civil penalties can reach $51,744 per violation under the FTC Act. Multiple violations per customer (each billing cycle) can result in substantial aggregate exposure.',
  },
  {
    q: 'What should a limitation of liability clause in a SaaS ToS cover?',
    a: 'A limitation of liability clause caps the maximum amount a customer can recover from you for claims arising under the Terms of Service. It is one of the most commercially critical provisions in any SaaS agreement and is routinely contested in enterprise negotiations. Standard SaaS limitation of liability provisions: (1) Cap amount: Customer\'s recovery is limited to the greater of: (a) fees paid in the 12 months preceding the claim; or (b) $[X] (some SaaS companies set a floor of $1,000-$10,000 to ensure the cap has meaning for low-cost products). This cap covers all claims regardless of the theory of liability (contract, tort, negligence). (2) Consequential damages waiver: In addition to the cap, SaaS ToS standardly disclaim liability for: lost profits; lost revenue; lost data; loss of goodwill; business interruption; indirect, special, incidental, punitive, or exemplary damages — "even if advised of the possibility of such damages." The consequential damages waiver is as important as the cap: a $10,000 cap on direct damages may seem small, but without the consequential damages waiver, a customer can still argue that your downtime caused $5M in lost contracts. (3) Carve-outs from the cap (what the cap does NOT protect): Standard carve-outs include: customer\'s payment obligations (the customer cannot argue the $12K cap means they only owe $12K on a $50K contract); IP indemnification; data breach obligations; death/bodily injury; and intentional misconduct or fraud. (4) Mutual vs. one-sided: B2B SaaS ToS should include mutual limitations — both your liability to customers and the customer\'s liability to you are capped. This makes the clause more defensible and fair. Enforceability: limitation of liability clauses are enforced in most U.S. states, but: (a) they must be conspicuous (all caps or bold, or prominently positioned); (b) some states (New Jersey, Massachusetts) scrutinize consumer limitation clauses more carefully; and (c) courts can void clauses that are "unconscionable" — disproportionately one-sided or hidden. Enterprise customers: enterprise contracts typically negotiate out the consequential damages waiver for data breaches and service outages, and negotiate a higher cap (6-24 months of fees rather than 12). Build negotiation flexibility into your enterprise Terms or Order Form.',
  },
  {
    q: 'When does a SaaS company qualify for DMCA safe harbor protection?',
    a: 'The DMCA Safe Harbor (Section 512 of the Copyright Act) protects online service providers from liability for copyright infringement by users — but only if the provider meets specific eligibility requirements and follows the required notice-and-takedown procedure. Who qualifies: To be eligible for DMCA safe harbor, a SaaS company must: (1) Be a "service provider" that provides online services or network access. Most SaaS platforms qualify if users can post, upload, or transmit user-generated content — even if that\'s not the core use case. (2) Have no actual knowledge of specific infringing content, and no financial benefit from infringement if the provider has the ability to control it. (3) Expeditiously remove or disable access to content upon receiving proper notice of infringement. (4) Have designated a DMCA agent: Register a Designated Copyright Agent with the U.S. Copyright Office (via copyright.gov, $6 one-time registration) and include the agent\'s contact information in your Terms of Service. An unregistered or out-of-date agent registration is one of the most common DMCA safe harbor failures — the safe harbor is not available if your agent is not registered with the Copyright Office. (5) Implement and reasonably apply a repeat infringer termination policy. Required ToS provisions for DMCA safe harbor: (a) DMCA notice address — how rightsholders submit copyright complaints; (b) Counter-notice procedure — how users can dispute takedowns; (c) Repeat infringer policy — statement that accounts of repeat infringers will be terminated. What DMCA safe harbor does not protect: purely streaming services (no user content storage); red-flag infringement (where infringement is obvious); financial benefit from infringement where control exists; claims that do not arise from user-uploaded content.',
  },
  {
    q: 'Are class action waivers and mandatory arbitration clauses in SaaS ToS enforceable?',
    a: 'Class action waivers and mandatory arbitration clauses are common in consumer-facing SaaS Terms of Service. Their enforceability varies significantly by state and context. Federal law (FAA): The Federal Arbitration Act generally preempts state laws that single out arbitration clauses for disfavored treatment. The U.S. Supreme Court has consistently upheld class action waivers in arbitration agreements, including in AT&T v. Concepcion (2011) and Epic Systems v. Lewis (2018). Under federal law, class action waivers in ToS — even on a take-it-or-leave-it basis — are generally enforceable in consumer contracts if: (a) the ToS was clearly disclosed and assented to; and (b) the arbitration clause itself is not substantively unconscionable. State-level restrictions: (1) California: California courts apply "unconscionability" analysis and have voided arbitration clauses where: there is significant procedural unconscionability (hidden in fine print, no ability to opt out) combined with substantive unconscionability (prohibitively expensive arbitration, one-sided discovery, provisions favoring the company). The California Private Attorneys General Act (PAGA) also cannot be waived in arbitration agreements covering California employees. (2) New York: Courts have enforced class action waivers but scrutinize clauses where arbitration costs make individual claims effectively non-viable. (3) EU/UK: Mandatory arbitration clauses and class action waivers in B2C contracts are generally not enforceable in the EU under the Unfair Contract Terms Directive (UCTD) and various national consumer protection laws. EU consumers retain the right to sue in their local courts. Best practices: (a) Opt-out window: Allow 30 days to opt out of arbitration by written notice. Courts are more likely to enforce clauses that provide a genuine opt-out. (b) Cost-shifting for meritless arbitrations: Include provisions that the company pays arbitration fees for consumer claims, to avoid arguments that arbitration is prohibitively expensive. (c) Small claims court carve-out: Permit either party to bring individual claims in small claims court as an alternative to arbitration. (d) Conspicuous disclosure: Present the arbitration/class action waiver prominently, not buried in paragraph 47 of a 60-page ToS.',
  },
  {
    q: 'What EU Digital Services Act obligations apply to SaaS companies?',
    a: 'The EU Digital Services Act (DSA), which applied from February 2024 for most platforms, imposes new obligations on "online platforms" and "online intermediaries" operating in the EU. SaaS companies need to understand whether they qualify and what applies. DSA thresholds and obligations by size: (1) All "intermediary services" (including most SaaS with user-to-user content): Must include in their Terms of Service clear information on restrictions on use of the service and on the content moderation policies. Terms must be written in plain, clear, understandable language. (2) Online platforms (SaaS where users can post/share content visible to others): Additional obligations including complaint-handling mechanisms; transparent content moderation; single point of contact for EU authorities; annual transparency reports; and cooperation with trusted flaggers. (3) Large online platforms (VLOPs — over 45 million active EU monthly users): Subject to the heaviest obligations including annual risk assessments, external audits, recommendation system transparency, crisis response protocols, and supervision by the European Commission. DSA ToS requirements for EU-facing SaaS: (1) Terms must be available in all EU official languages of the countries where you offer the service (or a reasonable translation); (2) Terms must include contact details for authorities to communicate with the service; (3) Grounds for restricting user accounts or content must be stated clearly in the Terms; (4) If the service is not intended for minors, the Terms must include a clear statement and appropriate measures; (5) Content moderation decisions must reference the ToS provision they were made under — meaning your Terms must be specific enough to actually support enforcement. DSA fines: Up to 6% of global annual turnover for violations; up to 1% for providing incorrect or misleading information to authorities.',
  },
  {
    q: 'What is browsewrap vs. clickwrap assent and why does it matter for ToS enforceability?',
    a: 'A Terms of Service that no one agreed to cannot be enforced. The method by which a user "agrees" to your ToS determines whether the agreement is binding and courts will enforce it in your favor. Browsewrap (weakest assent): Browsewrap refers to an arrangement where the Terms of Service are posted on a website, and the user is deemed to "agree" simply by using the service — without being required to take any affirmative action acknowledging the Terms. Example: "By using this service, you agree to our Terms of Service." Enforceability: Courts have grown increasingly reluctant to enforce browsewrap agreements, especially against individual consumers who were not provided direct notice of the Terms. The Ninth Circuit (California) and Second Circuit (New York) have repeatedly refused to enforce browsewrap agreements where users could not reasonably have been expected to know the Terms existed. Clickwrap (stronger assent): Clickwrap requires users to actively check a box, click an "I Agree" button, or take some affirmative action acknowledging the Terms. The most robust clickwrap designs: (a) require an unchecked checkbox labeled "I agree to the Terms of Service [link]"; (b) place the checkbox adjacent to (not beneath) the primary action button; and (c) display a summary of key terms (especially auto-renewal and arbitration). Courts consistently enforce properly implemented clickwrap agreements. Enhanced clickwrap for high-stakes provisions: For auto-renewal disclosures (FTC Click-to-Cancel) and arbitration/class action waivers, courts and regulators look for additional consent signals beyond a standard checkbox: (1) Separate explicit acknowledgment of the arbitration/class action waiver; (2) Clear disclosure of auto-renewal amounts and cancel mechanism before the subscription button; (3) Pre-purchase email confirmation with material ToS terms. What to avoid: (1) Pre-checked boxes; (2) Ambiguous consent language ("By clicking below, you confirm you are over 18 and agree to receive marketing emails from us" with no mention of ToS); (3) ToS link that is barely visible or requires scrolling to find; and (4) Failing to provide the ToS in full before obtaining consent.',
  },
]

export default function TermsOfServiceGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Terms of Service Compliance Guide for SaaS Startups (2025)',
    description: 'FTC Click-to-Cancel rule, limitation of liability clauses, DMCA safe harbor, class action waivers, EU DSA obligations, and clickwrap vs. browsewrap assent — the 8 ToS provisions every SaaS company must get right in 2025.',
    url: 'https://bizlegal-ai.com/guides/terms-of-service-guide-saas',
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
      { '@type': 'ListItem', position: 3, name: 'Terms of Service Guide', item: 'https://bizlegal-ai.com/guides/terms-of-service-guide-saas' },
    ],
  }

  const TOS_SECTIONS = [
    { section: 'Acceptance of Terms / Assent', required: true, notes: 'Clickwrap (not browsewrap) for enforceability. Separate acknowledgment for arbitration and auto-renewal.' },
    { section: 'Service Description + Permitted Use', required: true, notes: 'What users can and cannot do. Acceptable Use Policy (AUP) — either embedded or linked as exhibit.' },
    { section: 'User Accounts + Security', required: true, notes: 'Account creation eligibility, responsibility for credentials, prohibition on sharing accounts.' },
    { section: 'Payment + Auto-Renewal (FTC Click-to-Cancel)', required: true, notes: 'FTC compliance: conspicuous auto-renewal disclosure, cancel mechanism must match enrollment ease, annual reminder for yearly subscriptions.' },
    { section: 'Intellectual Property + License Grant', required: true, notes: 'You retain your IP; user grants you a license to process their content. DMCA agent designation.' },
    { section: 'User Content', required: true, notes: 'Content ownership stays with user; your license to display/process/deliver. Content restrictions and moderation rights.' },
    { section: 'Privacy (or link to Privacy Policy)', required: true, notes: 'Reference Privacy Policy as an incorporated exhibit. Requires separate Privacy Policy document.' },
    { section: 'Disclaimer of Warranties', required: true, notes: '"As is" and "as available" — all caps or bold for enforceability. Cannot disclaim implied warranties in all jurisdictions.' },
    { section: 'Limitation of Liability', required: true, notes: 'Mutual cap (12 months fees). Consequential damages waiver. Carve-outs for fraud, data breach, IP indemnification.' },
    { section: 'Indemnification', required: true, notes: 'User indemnifies you for their ToS violations and content. Mutual indemnification for enterprise.' },
    { section: 'Termination', required: true, notes: 'Grounds for account suspension/termination. Effect on user data (deletion timeline). Survival of key provisions.' },
    { section: 'Dispute Resolution + Arbitration', required: false, notes: 'Arbitration + class action waiver. Opt-out window. Small claims carve-out. Consumer vs. B2B considerations.' },
    { section: 'Governing Law + Jurisdiction', required: true, notes: 'Your state of incorporation. EU users — local courts often apply regardless of clause.' },
    { section: 'Updates to Terms', required: true, notes: 'Right to modify + notice method (email or in-app). Continued use = acceptance. 30-day notice for material changes.' },
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
          Terms of Service Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Contract Risk
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          Terms of Service Compliance Guide for SaaS Startups (2025)
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          A Terms of Service that cannot be enforced is worse than no ToS at all — it creates a false sense of legal protection while leaving you exposed on auto-renewal disclosure, DMCA copyright claims, consumer protection violations, and EU Digital Services Act obligations. This guide covers the essential SaaS ToS provisions for 2025 and the compliance requirements that have changed most significantly in the past 18 months.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>SaaS ToS Section Checklist (14 Required Provisions)</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Section</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Required</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Key Compliance Notes</th>
                </tr>
              </thead>
              <tbody>
                {TOS_SECTIONS.map(({ section, required, notes }) => (
                  <tr key={section} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{section}</td>
                    <td style={{ padding: '10px 12px', color: required ? '#16a34a' : '#6b7280', fontSize: '0.8rem', fontWeight: 600 }}>{required ? 'Required' : 'Optional'}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8, fontSize: '0.825rem' }}>{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>2024–2025 Compliance Changes That Require ToS Updates</h2>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 2.0 }}>
            <li><strong>FTC Click-to-Cancel Rule (2024)</strong> — Auto-renewal disclosures must be clear and conspicuous pre-purchase; cancellation must be as easy as enrollment; annual renewal reminders now required for annual subscriptions. Most SaaS ToS written before 2024 do not comply.</li>
            <li><strong>EU Digital Services Act (February 2024)</strong> — Platforms with EU users must describe content moderation policies in ToS; provide contact information for EU authorities; publish annual transparency reports (if over 1M EU users). Consumer-facing ToS must be plain-language and available in local EU languages.</li>
            <li><strong>California CPRA (2023) / CCPA updates</strong> — Privacy Rights Act expanded data subject rights (data portability, correction rights, opt-out of sensitive data sharing) — your Privacy Policy (and any ToS reference to it) must be updated to reflect expanded rights and new categories of sensitive personal information.</li>
            <li><strong>EU AI Act (August 2024, obligations phased through 2027)</strong> — If your SaaS product includes AI features, ToS must identify AI-generated outputs, disclose emotional recognition or biometric categorization uses, and for high-risk AI systems include required information for users to exercise oversight.</li>
            <li><strong>Colorado AI Act (SB 205, 2024)</strong> — Colorado requires algorithmic transparency disclosures and high-risk AI disclosures in consumer-facing ToS and privacy notices.</li>
            <li><strong>UDAAP / FTC Act enforcement expansion</strong> — FTC has aggressively pursued "dark patterns" including: pre-checked boxes for subscriptions; auto-upgrade flows; cancellation barriers. Courts have found that ToS provisions themselves can constitute "unfair or deceptive acts or practices" when they create unreasonable barriers to cancellation or obscure material terms.</li>
          </ul>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your Terms of Service for Compliance Gaps</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your Terms of Service and BizLegal AI checks for FTC Click-to-Cancel compliance gaps, missing DMCA safe harbor provisions, unenforceable browsewrap assent, missing EU DSA disclosures, consequential damages waiver gaps, and arbitration clause enforceability issues — with plain-language findings and specific language recommendations.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Terms of Service →
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
            <Link href="/guides/privacy-policy-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Privacy Policy Guide →</Link>
            <Link href="/guides/gdpr-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR Compliance Checklist →</Link>
            <Link href="/guides/saas-vendor-agreement-review-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SaaS Vendor Agreement Review →</Link>
            <Link href="/guides/eu-ai-act-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>EU AI Act Guide →</Link>
            <Link href="/guides/startup-compliance-program-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Startup Compliance Program →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. ToS enforceability, DMCA safe harbor qualification, and regulatory compliance depend on the specific facts of each situation and the applicable jurisdiction. The guidance here reflects U.S. federal and California requirements and EU DSA obligations as of 2025. Consult qualified commercial contract and regulatory counsel to review and update your Terms of Service.
          </p>
        </footer>

      </main>
    </>
  )
}
