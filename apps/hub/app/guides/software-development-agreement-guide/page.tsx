import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Software Development Agreement Guide (2025): IP Ownership, Work-for-Hire, Source Code Escrow, Acceptance Testing | BizLegal AI',
  description: 'Who owns custom software — the company that paid for it or the developer who built it? Work-for-hire doctrine (only 9 statutory categories cover software in limited contexts), IP assignment clauses that actually transfer ownership, source code escrow triggers, acceptance testing procedures that define "done," open source license contamination risk in custom builds, warranty and indemnification provisions, and the 5 red flags in developer agreements that expose companies to IP disputes.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/software-development-agreement-guide' },
  openGraph: {
    title: 'Software Development Agreement Guide (2025) — BizLegal AI',
    description: 'Custom software IP ownership: work-for-hire doctrine gaps, IP assignment clause requirements, acceptance testing, source code escrow, open source contamination, and indemnification drafting.',
    url: 'https://bizlegal-ai.com/guides/software-development-agreement-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'Who owns the intellectual property in a custom software development agreement — the company that paid for it or the developer who built it?',
    a: 'The single most dangerous misconception in software procurement is the belief that paying for software development automatically transfers ownership of the resulting IP to the paying company. It does not. Under US copyright law (17 U.S.C. §101 et seq.), the default rule is that the creator of original work owns the copyright. The paying party owns the software only if (a) the developer is an employee of the company and the work falls within the scope of employment, or (b) there is a valid written agreement transferring ownership (IP assignment). Work-for-hire doctrine — when it applies and when it does not: work-for-hire coverage in the US has two categories. Category 1 (employee work): works created by an employee within the scope of their employment are work-for-hire and the employer owns them. An employee for these purposes is someone with a W-2, subject to the company\'s direction and control. Independent contractors and freelancers are NOT employees for work-for-hire purposes unless Category 2 applies. Category 2 (commissioned work, enumerated categories only): works specially ordered or commissioned as work-for-hire are covered ONLY if they fall into one of 9 statutory categories defined in 17 U.S.C. §101, AND there is a written agreement signed by both parties expressly stating the work is work-for-hire. The 9 statutory categories are: (1) contribution to a collective work; (2) part of a motion picture or other audiovisual work; (3) translation; (4) supplementary work (foreword, afterword, illustration, etc.); (5) compilation; (6) instructional text; (7) test; (8) answer material for a test; (9) atlas. Standard custom software — a standalone application, a SaaS platform, a custom API, a mobile app — is NOT on this list. A standalone software development project does not qualify as a work-for-hire unless it falls into "compilation" in limited circumstances. What this means practically: if a company contracts with an independent software developer or development firm to build custom software, and the contract says nothing about IP, the developer retains the copyright. The company has a license to use the software (implied or express), but it does not own it. The developer can resell the same code to a competitor, create derivative works, or assert copyright against the company if the relationship sours. The fix is an IP assignment clause — not work-for-hire language. An IP assignment clause in which the developer expressly assigns (present tense: "hereby assigns") all IP rights in the deliverables to the company transfers ownership. An IP assignment clause that says the developer "will assign" (future tense, or "agrees to assign") is a promise to transfer, not a transfer — if the developer later refuses, the company has a breach of contract claim but not automatic ownership.',
  },
  {
    q: 'What provisions must a software development agreement include to validly transfer IP ownership, and how should each be drafted?',
    a: 'A software development agreement that properly transfers IP requires more than a single IP assignment sentence. The following provisions work together to provide complete protection. Provision 1 — IP Assignment clause (the core): the assignment must be in writing, signed by the developer, use present-tense operative language ("hereby assigns"), and cover all relevant IP categories. Key drafting requirements: (a) scope: the assignment must cover copyright, patent rights (including continuation applications for improvements made during the project), trade secrets, and moral rights (where applicable — moral rights are statutory in EU and some other jurisdictions; the developer must expressly waive them). (b) breadth: cover not only the delivered software but also all work-in-progress, partially completed code, documentation, test cases, design documents, and intermediate works. (c) future work: include assignment of improvements, modifications, and derivative works created by the developer during the engagement. (d) carve-outs: the developer may negotiate to retain certain pre-existing IP ("Background IP") — technology, tools, frameworks, libraries, or methodologies the developer brought to the engagement and would use with other clients. The agreement must clearly define what Background IP is carved out and grant the company an adequate license to use it within the deliverables. A vague Background IP definition ("developer\'s general knowledge and skills") can cause problems — Background IP should be specifically identified in a schedule. Provision 2 — License grant back to developer for Background IP: if the developer retains Background IP embedded in the deliverables, the company needs a sufficient license to actually use the deliverables — typically a perpetual, irrevocable, royalty-free license to use the Background IP solely as incorporated in the deliverables. "Solely as incorporated" is critical — without this limitation, you are granting a broad license to the developer\'s entire IP portfolio. Provision 3 — Work Product schedule: attach a detailed specification of deliverables. Vague deliverable definitions ("a mobile app for our business") create disputes over scope. The specification should include functional requirements, technical architecture, performance benchmarks, and acceptance criteria. The clearer the specification, the clearer the IP assignment. Provision 4 — Obligation to execute further instruments: require the developer to cooperate in executing patent applications, copyright registrations, and other documents needed to perfect the transfer. Many IP transfers require additional formalities (e.g., patent assignment recordal at the USPTO). Provision 5 — Moral rights waiver (for international projects): if the developer is in the EU, UK, or other jurisdictions recognizing moral rights (the right of attribution, the right of integrity), the developer should expressly waive all moral rights to the maximum extent permitted by applicable law. Without this waiver, the developer may later object to modifications, rebranding, or non-attribution of the software. Provision 6 — Third-party IP warranty: require the developer to represent and warrant that the deliverables do not infringe any third-party IP rights, do not incorporate any open source code in violation of applicable license terms, and do not include any IP the developer does not have the right to assign. This shifts the risk of unknown IP encumbrances to the developer who is in the best position to know what code was used.',
  },
  {
    q: 'What are acceptance testing provisions in software development agreements, and how should they be structured to define "done"?',
    a: 'Acceptance testing provisions define the formal process by which the company (the client) evaluates whether the software meets contractual requirements and approves or rejects deliverables. Without structured acceptance testing provisions, disputes over "completion" are common, payment timing becomes ambiguous, and warranty periods are difficult to calculate. Core components of an acceptance testing framework: Component 1 — Acceptance Criteria: the agreement must define objective, measurable acceptance criteria. "Works as specified" is too vague. Specific acceptance criteria examples: (a) functional requirements: specific features and behaviors as defined in the functional specification document (attached as an exhibit); (b) performance requirements: response time ≤ 200ms for 95th percentile API calls under N concurrent users; (c) compatibility requirements: passes on Chrome, Firefox, Safari, iOS 16+, Android 12+; (d) security requirements: passes OWASP Top 10 scan with no Critical or High findings; (e) code quality requirements: passes automated test suite with ≥ 80% code coverage; (f) data integrity requirements: no data loss during import/export operations in documented test scenarios. Component 2 — Acceptance Testing Period: a defined window during which the client tests the deliverables against acceptance criteria. Typical provision: "Client shall have 15 business days (the Acceptance Period) following delivery of each Deliverable to conduct acceptance testing." This creates a deadline — if the client fails to test within the window, the deliverable may be deemed accepted. Component 3 — Acceptance and Rejection Procedures: if testing reveals deficiencies, the client must provide specific written notice of the deficiencies (not a general rejection). The notice should specify which acceptance criteria failed and the evidence of failure. The developer must remedy deficiencies within a defined period (e.g., 10 business days) and resubmit. A limit on rejection-and-resubmission cycles (e.g., 2 rounds maximum, then mediation or termination trigger) prevents indefinite back-and-forth. Component 4 — Deemed Acceptance: if the client does not provide acceptance or a specific rejection notice within the Acceptance Period, the deliverable is deemed accepted. This provision protects developers from clients who stall acceptance indefinitely to avoid payment. Component 5 — Final Acceptance and Payment Trigger: link the final payment milestone to final acceptance of all deliverables (not to "substantial completion" — this is a construction law concept that does not translate cleanly to software). Final payment milestone typically: upon written notice of final acceptance, or upon deemed acceptance at expiration of the final Acceptance Period. Provision 6 — Post-acceptance warranty: once a deliverable is accepted, the warranty period begins. Standard warranty terms: 90 days for a fixed-price project (developer will correct defects discovered after acceptance at no charge); the warranty covers defects, not new feature requests. Common acceptance testing disputes: (a) no defined acceptance criteria → client rejects for subjective reasons; (b) no acceptance period defined → developer cannot invoice until client is ready; (c) partial acceptance not addressed → if some features pass and others fail, what is the payment obligation?; (d) deemed acceptance not included → client delays acceptance indefinitely.',
  },
  {
    q: 'What is source code escrow, when is it required, and what should a source code escrow agreement include?',
    a: 'Source code escrow is an arrangement under which a software vendor (the developer or licensor) deposits the source code for licensed software with a neutral third-party escrow agent (e.g., Iron Mountain, NCC Group, Escrow Associates), and the customer is entitled to receive the source code from the escrow agent upon the occurrence of defined "release conditions." Source code escrow is primarily relevant for licensed commercial software (COTS) and SaaS platforms where the customer depends on vendor-maintained software for business-critical operations but does not receive the source code as part of the license. In a custom development agreement where the customer owns the software via IP assignment, escrow is less critical because the customer already has or should have the source code. When source code escrow is appropriate: (a) commercial software licenses (ERP systems, specialized SaaS): the customer licenses software but receives only compiled executables; (b) critical infrastructure dependencies: the software is business-critical, and vendor failure (bankruptcy, acquisition, discontinuation) would materially harm the customer; (c) SaaS agreements with no code escrow: the customer has no fallback if the vendor\'s service terminates — escrow provides a code-level continuity mechanism if the SaaS vendor fails. When should your contract require escrow: (a) mission-critical software that cannot be replaced within 60-90 days; (b) software where no adequate commercially available substitute exists; (c) software licensed from startups or vendors with financial uncertainty. Release conditions — when the customer gets the source code: (1) vendor insolvency or bankruptcy filing; (2) vendor\'s cessation of business operations; (3) vendor\'s failure to maintain the software for more than N days (default: 30-60 days); (4) vendor\'s failure to provide agreed support services for more than N days; (5) material breach of the license agreement not cured within the notice period; (6) vendor\'s acquisition by a direct competitor of the customer; (7) vendor\'s discontinuation of the licensed product. What the escrow deposit must include: (a) current version of all source code; (b) build instructions (scripts and documentation needed to compile the source code into a deployable executable); (c) test data and test scripts; (d) documentation (technical architecture docs, database schemas, API specs, configuration guides); (e) third-party libraries and dependencies list (with versions); (f) encryption keys and signing certificates (where applicable). Verification of deposits: without verification, the escrow agent holds whatever the vendor submitted — which may be incomplete, outdated, or uncompilable. Verification tests (available at additional cost from most escrow agents) confirm that the deposited source code actually builds into the licensed software. Verification should be required at least annually. Escrow cost: typically $1,500-$5,000/year for the escrow agent (depending on deposit size and verification frequency), plus legal cost to negotiate the triparty escrow agreement.',
  },
  {
    q: 'What open source license risks apply to custom software development agreements, and how should these be managed?',
    a: 'Open source license contamination is one of the most underappreciated risks in custom software development. When a developer builds custom software and incorporates open source code, the license terms of the incorporated open source components may restrict the client\'s ability to use, modify, license, or distribute the resulting software — sometimes dramatically. The risk hierarchy by license type: Strong copyleft licenses (GPL, AGPL): GNU General Public License (GPL) and Affero GPL (AGPL) impose the most restrictive obligations. GPL requires that any "work based on" GPL-licensed code must also be licensed under GPL — the copyleft obligation "infects" the combined work. AGPL extends this: if you run AGPL-licensed code as a network service (SaaS), you must make the source code of the combined work available to users who interact with it over the network. If a developer incorporates GPL or AGPL components into your custom B2B SaaS product and you distribute the software or run it as a service, you may be required to release your proprietary source code under GPL/AGPL. This effectively makes your custom software open source. Weak copyleft licenses (LGPL, MPL, EPL): Lesser GPL (LGPL), Mozilla Public License (MPL), and Eclipse Public License (EPL) have qualified copyleft obligations. LGPL generally allows incorporation of LGPL libraries into proprietary software if the LGPL portion is dynamically linked (not statically embedded). The details of compliance (what constitutes dynamic vs. static linking) are complex and context-dependent. Permissive licenses (MIT, Apache 2.0, BSD): MIT, Apache 2.0, and BSD licenses permit incorporation into proprietary software with minimal restrictions. MIT requires attribution (copyright notice retained). Apache 2.0 additionally includes a patent license grant and requires attribution in the NOTICE file. BSD has similar attribution requirements. Key risk in contracts: developers will often incorporate whatever open source libraries are convenient without tracking licenses. A developer who incorporates three AGPL libraries into your custom SaaS platform may not mention this — and you may have an unintended obligation to open-source your entire platform. Contractual protections: Provision 1 — Open source disclosure: require the developer to provide a complete bill of materials (BOM) listing all open source components (library name, version, license) incorporated in the deliverables before final acceptance. Provision 2 — License restrictions: prohibit the use of strong copyleft licenses (GPL, AGPL, EUPL, SSPL) without prior written consent from the client. Specify permitted license categories (e.g., MIT, Apache 2.0, BSD-2-Clause, BSD-3-Clause, LGPL with dynamic linking). Provision 3 — Open source compliance representation: require the developer to represent and warrant that: (a) the use of all open source components in the deliverables complies with applicable open source license terms; (b) use of the deliverables will not trigger any obligation to license the client\'s proprietary code under an open source license. Provision 4 — Indemnification for open source violations: the developer indemnifies the client against any third-party claims arising from the developer\'s use of open source code in violation of applicable license terms. Post-acceptance risk: even after a project completes, new GPL/AGPL copyleft issues may surface during M&A due diligence or if a developer later asserts open source compliance violations. Conducting a Software Composition Analysis (SCA) scan (tools: FOSSA, Snyk, Black Duck) immediately after delivery creates a documented baseline and can identify issues before they compound.',
  },
  {
    q: 'What are the 5 most dangerous red flags in software development agreements that companies sign without reading?',
    a: 'Developers and development firms often use standard-form agreements weighted heavily in their favor. These five provisions are the most common and most dangerous red flags found in developer-favorable agreements. Red Flag 1 — No IP assignment, or assignment uses future tense ("will assign"): as discussed above, the developer owns the code by default. Any agreement that does not include a present-tense IP assignment ("hereby assigns") leaves ownership with the developer. Watch for: "Developer will transfer ownership upon final payment" (future tense — a promise, not a transfer) or "Developer grants Client a license to use the software" (license ≠ ownership). Why it matters: if the relationship sours before final payment, or if the developer later claims the IP was not fully transferred, you may have a license to use software you thought you owned — or no enforceable rights at all. Red Flag 2 — Vague or missing acceptance criteria: developer agreements frequently describe deliverables as "a mobile application as described in conversations" or "software meeting client requirements." Without specific acceptance criteria, the developer can claim acceptance is unreasonably withheld whenever you reject work. Watch for: acceptance defined as "client satisfaction" (subjective), absence of any performance benchmarks, no timeline for acceptance testing, no deemed-acceptance provision in your favor. Why it matters: you may be contractually obligated to pay upon "delivery" of software that does not actually meet your requirements, with no clear mechanism to withhold payment or require remediation. Red Flag 3 — Unlimited contractor background IP carve-out: some developer agreements carve out not just pre-existing specific tools and libraries, but all "general methods, concepts, algorithms, know-how, and industry experience" the developer brings to the engagement. An unlimited Background IP carve-out can swallow most of the custom code — if the developer later claims that the core architecture of your product is "general methods" they brought to the engagement, they may argue the assignment did not cover it. Watch for: Background IP defined as "any concepts, skills, or expertise of Developer" (overly broad, no specificity). Red Flag 4 — Open source not addressed: developer agreements that are silent on open source use leave the client unprotected against GPL/AGPL contamination (see above). Watch for: no representation about open source license compliance, no prohibition on copyleft licenses, no BOM delivery requirement. Why it matters: an M&A deal can fall apart (or require a significant price reduction) when a buyer's due diligence discovers AGPL code embedded in the target's core product. Red Flag 5 — Limitation of liability cap excludes IP indemnification: most developer agreements include a limitation of liability cap (e.g., cap on damages = total fees paid). Some agreements explicitly exclude IP indemnification from this cap — which protects you. But many agreements cap ALL liability including IP indemnification, which is dangerous: if the developer incorporates stolen code or violates a patent, your remedy is limited to getting your fees back while you face potentially unlimited third-party IP claims. Watch for: a limitation of liability clause that says "all liability hereunder, including for indemnification, shall not exceed the fees paid." The correct position: IP indemnification (third-party IP claims) and fraud/willful misconduct should be excluded from the liability cap.',
  },
]

export default function SoftwareDevelopmentAgreementGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Software Development Agreement Guide (2025): IP Ownership, Work-for-Hire, Source Code Escrow, Acceptance Testing',
    description: 'Custom software IP ownership: work-for-hire doctrine (standalone software is NOT covered), IP assignment clause requirements, acceptance testing frameworks, source code escrow triggers, open source license contamination risk, and 5 red flags in developer agreements.',
    url: 'https://bizlegal-ai.com/guides/software-development-agreement-guide',
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
      { '@type': 'ListItem', position: 3, name: 'Software Development Agreement Guide', item: 'https://bizlegal-ai.com/guides/software-development-agreement-guide' },
    ],
  }

  const IP_PROVISIONS = [
    { provision: 'IP Assignment (present tense)', required: '✅ Mandatory', riskIfMissing: 'Developer retains copyright by default — you own a license, not the software', draftingKey: 'Use "hereby assigns" (present tense), cover all IP categories, include future improvements' },
    { provision: 'Background IP carve-out + license', required: '✅ Mandatory', riskIfMissing: 'Assignment may void if Background IP cannot be separated; deliverables may be unusable', draftingKey: 'Specifically schedule Background IP; grant perpetual royalty-free license "solely as incorporated"' },
    { provision: 'Third-party IP warranty', required: '✅ Mandatory', riskIfMissing: 'No recourse if developer uses stolen code or infringing components', draftingKey: 'Developer warrants no infringement and no unauthorized open source use' },
    { provision: 'Open source BOM delivery', required: '✅ Mandatory', riskIfMissing: 'GPL/AGPL contamination discovered at M&A due diligence; forced open source disclosure', draftingKey: 'Full component list (name/version/license) required before acceptance; prohibit GPL/AGPL' },
    { provision: 'Acceptance testing framework', required: '✅ Mandatory', riskIfMissing: 'Disputed "done," forced payment for unfinished software, indefinite rejection loops', draftingKey: 'Objective criteria, defined Acceptance Period, deemed acceptance provision, rejection specificity requirement' },
    { provision: 'Source code escrow', required: '⚠️ Mission-critical licensed software', riskIfMissing: 'Vendor failure = software inaccessible with no fallback', draftingKey: 'Triparty escrow, verified deposits, specific release conditions, build instructions included' },
    { provision: 'IP indemnification excluded from cap', required: '✅ Strongly recommended', riskIfMissing: 'Developer caps IP liability at fees paid while you face unlimited third-party IP claims', draftingKey: 'Carve IP indemnification (and fraud/willful misconduct) out of the general liability cap' },
    { provision: 'Moral rights waiver', required: '⚠️ International projects', riskIfMissing: 'EU/UK developer may object to modifications, rebranding, non-attribution', draftingKey: 'Express waiver "to the maximum extent permitted by applicable law"' },
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
          Software Development Agreement Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Contract Law
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          Software Development Agreement Guide (2025): IP Ownership, Work-for-Hire, Source Code Escrow, and Acceptance Testing
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Paying for software development does not automatically give you ownership of the resulting code. Under US copyright law, the developer owns the IP unless there is a written assignment — and the work-for-hire doctrine does not cover standalone software created by independent contractors. Getting IP ownership right in a software development agreement requires specific drafting mechanics, not boilerplate.
        </p>

        <div style={{ padding: '1rem 1.25rem', background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '8px', marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
            <strong>IP ownership alert:</strong> Standalone custom software developed by an independent contractor is NOT a work-for-hire under 17 U.S.C. §101. Without a written IP assignment clause using present-tense language ("hereby assigns"), the developer retains copyright regardless of how much you paid. This is one of the most common — and most expensive — gaps discovered during Series A and M&A due diligence.
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>IP and Protection Provisions Checklist</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '580px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Provision</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Required?</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Risk if Missing</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Drafting Key</th>
                </tr>
              </thead>
              <tbody>
                {IP_PROVISIONS.map(({ provision, required, riskIfMissing, draftingKey }) => (
                  <tr key={provision} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, verticalAlign: 'top' }}>{provision}</td>
                    <td style={{ padding: '10px 12px', verticalAlign: 'top', whiteSpace: 'nowrap', fontSize: '0.76rem' }}>{required}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, fontSize: '0.76rem', verticalAlign: 'top' }}>{riskIfMissing}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.75, fontSize: '0.76rem', verticalAlign: 'top' }}>{draftingKey}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your Software Development Agreement</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your software development agreement, contractor agreement, or developer services contract. BizLegal AI identifies whether the IP assignment uses the required present-tense operative language or a weaker future-tense promise, flags Background IP carve-outs that may be overbroad or undefined, checks whether open source license terms are addressed, reviews acceptance testing provisions for enforceability, and surfaces the 5 red-flag clauses commonly found in developer-favorable agreements.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Dev Agreement →
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
            <Link href="/guides/ip-assignment-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>IP Assignment Agreement Guide →</Link>
            <Link href="/guides/open-source-license-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Open Source License Guide →</Link>
            <Link href="/guides/contractor-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Contractor Agreement Guide →</Link>
            <Link href="/guides/saas-vendor-agreement-review-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SaaS Vendor Agreement Guide →</Link>
            <Link href="/guides/nda-review-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>NDA Review Guide →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. IP ownership, work-for-hire analysis, and open source license compliance are highly fact-specific and depend on the specific jurisdiction, the nature of the deliverables, and the language of the agreement at issue. Copyright law, patent law, and open source licensing terms evolve continuously. Consult qualified IP and technology counsel before relying on this content or making decisions about software development agreements.
          </p>
        </footer>

      </main>
    </>
  )
}
