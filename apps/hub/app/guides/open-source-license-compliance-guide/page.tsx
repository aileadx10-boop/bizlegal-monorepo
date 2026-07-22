import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Open Source License Compliance Guide for SaaS (2025): GPL, AGPL, MIT, Apache 2.0 | BizLegal AI',
  description: 'Does AGPL require you to open-source your SaaS product? GPL copyleft propagation, MIT vs Apache 2.0 patent clauses, LGPL dynamic linking rules, license compatibility matrix, and the open source compliance program every SaaS company needs.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/open-source-license-compliance-guide' },
  openGraph: {
    title: 'Open Source License Compliance Guide for SaaS — BizLegal AI',
    description: 'AGPL SaaS loophole, GPL copyleft propagation, license compatibility matrix, and when your SaaS product must publish its source code.',
    url: 'https://bizlegal-ai.com/guides/open-source-license-compliance-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'Does AGPL require my SaaS product to open-source its backend code?',
    a: 'Yes — if your SaaS product incorporates AGPL-licensed code, the GNU Affero General Public License version 3 (AGPLv3) requires you to make the complete corresponding source code of the software available to users who interact with it over a network. This is the "SaaS loophole closed" provision that distinguishes AGPL from GPL. Under GPL v2 and v3, the copyleft obligation (the requirement to release source under the same license) is triggered by "distribution" — making copies of the software available to others. Because a SaaS product runs on your servers and users access it over the internet without receiving a copy of the software, traditional GPL does not trigger a source release obligation for the SaaS operator. MongoDB, HashiCorp, Redis Labs, and others historically exploited this gap by building on AGPL-licensed code without opening their proprietary cloud services. AGPLv3 Section 13 closes this gap with a "network use" trigger: "If you modify the Program, your modified version must prominently offer all users interacting with it remotely through a computer network (if your version supports such interaction) an opportunity to receive the Corresponding Source of your version by providing access to the Corresponding Source from a network server at no charge." This means: if your SaaS product is built on, modifies, or is statically or dynamically linked against AGPL-licensed code, users who access it via web browser, API, or any network interface are entitled to receive the full source code of your application — including your proprietary modifications and additions — under the AGPL. The scope of disclosure: the "corresponding source" requirement under AGPLv3 is broad. It includes: all source code for the AGPL-licensed module; all source code you added that is combined with or links against the AGPL module; scripts used to control compilation and installation. It does not, under most interpretations, require disclosure of separate, independently operating components that communicate with the AGPL component only through well-defined interfaces. But the boundary is contested — the Free Software Foundation takes a broad view of what "corresponding source" encompasses. Common AGPL-licensed software your SaaS might use: MongoDB (now BSL 1.1, but older versions are AGPL); Elasticsearch (formerly AGPL for older versions); PostHog (AGPL core); Metabase Community Edition (AGPL); Grafana (AGPLv3 since 7.x); Mattermost (AGPL community edition); SuiteCRM; n8n (AGPL with EE license option). Practical advice: if your product incorporates AGPL code, you have three options: (1) comply fully and publish your source; (2) obtain a commercial license from the copyright holder that removes the AGPL obligation (most AGPL projects offer dual licensing for this purpose); (3) replace the AGPL component with a permissive-license alternative.',
  },
  {
    q: 'How does GPL copyleft propagation work and when does it infect proprietary code?',
    a: 'GPL copyleft propagation — often called "viral" effect — is the mechanism by which the GPL license spreads from a GPL-licensed component to the software that incorporates it, requiring the combined work to be distributed under GPL. Understanding when propagation occurs is essential to assessing GPL risk in commercial software. The propagation trigger: GPL Section 5(b) requires that "any work you distribute or convey, that in whole or in part contains or is derived from the Program or any part thereof," be licensed as a whole under the GPL. The critical question is what it means to "contain or be derived from" a GPL component. Static linking: when your code is compiled together with a GPL library into a single binary (static linking), the resulting combined work is almost universally considered a derivative work subject to GPL. If you statically link against a GPL library, your entire program must be distributed under GPL — including the source code. Dynamic linking: whether dynamic linking (where your program loads a GPL library at runtime via .so/.dll files but is compiled separately) triggers GPL is more contested. The FSF takes the position that dynamic linking can trigger GPL if the two works are "closely integrated." The Ninth Circuit and academic literature suggest a functional interoperability test. LGPL was created precisely to allow libraries to be dynamically linked without GPL propagation. Forking and modification: if you take a GPL codebase, modify it, and distribute the modified version, you must distribute the source of your modifications under GPL. This is the classic copyleft scenario — you cannot take GPL code, make proprietary improvements, and distribute a closed-source binary. Separate programs communicating via interfaces: two programs that communicate via inter-process communication (pipes, sockets, APIs) or that run as separate OS processes generally do not create a copyleft combined work, because each program is independent at the source code level. A SaaS application that calls a separately running GPL-licensed service via REST API is generally not required to publish its source under GPL. This is the "processes at arms length" position and the basis for many commercial SaaS architectures that utilize GPL-licensed services as backend dependencies while maintaining proprietary application layers. GPL v2 vs. v3 differences: GPL v3 added explicit clauses addressing digital rights management (Section 3), patent license grants (Section 11), and the tivoization problem (Section 6 — anti-lock prohibition). The patent license grant in GPL v3 is significant: if you distribute GPL v3 software, you grant recipients a license under any patent claims you hold that are necessary to use the distributed program.',
  },
  {
    q: 'What are the key differences between MIT, Apache 2.0, and BSD licenses for commercial use?',
    a: 'Permissive licenses — MIT, Apache 2.0, and BSD variants — allow commercial use, modification, and distribution with minimal restrictions. They do not require you to open-source your modifications. The key differences: MIT License: the most permissive and simplest. Requirements: preserve the copyright notice and license text in all copies or substantial portions of the software. No other restrictions. No patent license grant (explicit or implied). No warranty disclaimer carve-out beyond the basic "AS IS" language. MIT does not explicitly grant or terminate patent rights — this is the key commercial risk for patent-heavy environments. Apache License 2.0: similar permissive baseline but adds two critical provisions for commercial use: (1) Explicit patent license grant: "each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable (except as stated in this section) patent license to make, have made, use, offer to sell, sell, import, and otherwise transfer the Work." This is a meaningful protection — Apache contributors are granting you a license to any patents they hold that are necessary to use the code. (2) Patent termination clause: the patent license is terminated if you initiate patent litigation against any Apache contributor. This deters patent trolling involving Apache-licensed code. Practical impact: Apache 2.0 is generally preferred over MIT for commercial use because the explicit patent grant provides better protection. Note: Apache 2.0 is not compatible with GPL v2 (the patent license grant creates an "additional restriction" incompatible with GPL v2\'s no-further-restrictions clause). Apache 2.0 IS compatible with GPL v3. BSD Licenses: BSD-2-Clause ("Simplified BSD") and BSD-3-Clause are functionally similar to MIT. BSD-3-Clause adds a non-endorsement clause: you cannot use the project name to endorse derived products without permission. No explicit patent grant (same limitation as MIT). BSD-4-Clause ("Original BSD") included an advertising clause requiring acknowledgment in all advertising — this clause is GPL-incompatible and largely deprecated. Practical recommendation: for a SaaS product incorporating open source dependencies, prefer Apache 2.0 over MIT when you have a choice. For dependencies you plan to use in a product area where you may face patent exposure, the Apache 2.0 explicit patent grant provides meaningful protection that MIT lacks.',
  },
  {
    q: 'What is the LGPL and when does it allow dynamic linking without copyleft propagation?',
    a: 'The GNU Lesser General Public License (LGPL) was created specifically to allow libraries to be used by non-GPL (including proprietary) applications, subject to conditions designed to ensure the library itself remains free. LGPL v2.1 Section 6 and LGPL v3 explicitly permit an "Application" that uses an LGPL-licensed "Library" through dynamic linking to be distributed under proprietary terms, provided certain conditions are met. The linking exception mechanism: LGPL v2.1 permits combining a proprietary application with an LGPL library if: (1) the application uses the library through standard dynamic linking (not static linking or source-level inclusion); (2) the user can re-link the application with a modified version of the library (meaning the object files or equivalent must be provided so the user can swap in a different library version); and (3) the complete source of the LGPL library (not the application) is provided or made available. Practical meaning for SaaS: for most web services, LGPL libraries are usable without copyleft propagation to the application layer, because: (a) web services typically use LGPL libraries through dynamic linking; (b) the LGPL library source is available from the upstream project; and (c) SaaS delivery doesn\'t involve distributing application binaries to users at all (no distribution = no copyleft trigger under LGPL\'s distribution-based propagation mechanism). LGPL v2.1 vs. LGPL v3: LGPL v3 is written as a set of exceptions applied on top of GPL v3 (the core is GPL v3 + the LGPL linking exception). LGPL v2.1 is standalone. Both achieve the same basic effect — permitting dynamic linking by proprietary applications — but differ in patent clauses (LGPL v3 inherits GPL v3\'s patent grant) and anti-tivoization provisions. When LGPL is NOT a safe harbor: (1) static linking an LGPL library into a proprietary application still triggers copyleft obligations under LGPL v2.1; (2) modifying the LGPL library itself requires releasing those modifications under LGPL; (3) if the LGPL library is incorporated at the source level (not just linked), the combined work may be subject to LGPL terms beyond the linking exception. Common LGPL-licensed software: GNU C Library (glibc, LGPL v2.1), Qt (LGPL v3 option), GNU LGPL for Java libraries, various GNU utility libraries.',
  },
  {
    q: 'What should an open source compliance program include for a SaaS startup?',
    a: 'An open source compliance program ensures your company\'s use of open source software doesn\'t create undisclosed license obligations, IP chain-of-title problems, or security exposure. For a SaaS startup, a proportionate program has five components: (1) Software Bill of Materials (SBOM): maintain an inventory of all open source dependencies across your stack, including transitive dependencies (dependencies of dependencies). Tooling: FOSSA (automated SBOM generation + license identification + policy enforcement), Black Duck, Snyk Open Source, or OWASP Dependency-Check (free). The SBOM should capture: component name, version, license identifier (SPDX), source location, and whether any modifications were made to the component. Executive Order 14028 (US, 2021) has driven SBOM adoption as an industry standard for software sold to federal agencies; enterprise customers increasingly require SBOMs in vendor security assessments. (2) License policy: define which licenses are permitted, restricted, or prohibited for use in each category: (a) Green list — no review required: MIT, Apache 2.0, BSD-2, BSD-3, ISC, MPL 2.0 (with care), CC-BY 4.0 (for non-software assets). (b) Yellow list — legal review required before use: LGPL (confirm dynamic linking), MPL 2.0 in copyleft context, CDDL. (c) Red list — prohibited without CCO exception approval: GPL v2, GPL v3, AGPL, SSPL, BSL 1.1, EUPL (strong copyleft or source-available with commercial restrictions). Document approved exceptions for red-list components used with valid commercial licenses. (3) Ingestion gate: before merging code that introduces a new open source dependency, require review against the license policy. Automate: configure CI/CD pipeline to run FOSSA or similar tool on every pull request; fail PRs that introduce red-list licenses without an approved exception. (4) Contribution policy: if employees contribute to external open source projects on company time, establish a policy governing when a contribution requires a CLA (Contributor License Agreement) and IP assignment confirmation. Some companies require a waiver before contributing code that incorporates company IP. (5) Attribution and notice files: permissive licenses (MIT, Apache 2.0, BSD) require preserving copyright notices and license texts. For distributed software (mobile apps, desktop applications), include an open source attribution file. For SaaS (no distribution), attribution requirements apply if you include the licenses in your product documentation or if your enterprise customers require notice files in your SaaS contracts.',
  },
  {
    q: 'What are the Business Source License (BSL) and Server Side Public License (SSPL) and how do they affect commercial use?',
    a: 'BSL (Business Source License) and SSPL (Server Side Public License) are source-available licenses that look like open source but are not classified as open source by the Open Source Initiative (OSI). Both have been adopted by companies that previously used AGPL to prevent cloud providers from offering managed services based on their software without paying license fees. Business Source License (BSL / BUSL), now BSL 1.1: adopted by MariaDB, then by HashiCorp (Terraform) and Elastic (part of their stack). Key mechanics: the software is available as source code, but commercial use as a production service is restricted for a specified period (typically 4 years from the release date of each version). After the "Change Date," the software automatically converts to a fully open source license (typically GPL v2 or similar). The "Additional Use Grant" defines what commercial use is permitted during the restriction period — this varies per company. For example, HashiCorp\'s BSL 1.1 permits use unless the product competes with HashiCorp\'s commercial products. Risk for SaaS: if you use BSL-licensed software in a product that competes with the licensor\'s commercial offering, you are in violation during the restriction period. Check the specific Additional Use Grant carefully. Server Side Public License (SSPL), version 1 (MongoDB): stronger than AGPL. SSPL Section 13 requires that if you offer the software as a service to third parties, you must also open-source "all the software that you use to make the functionality of the software available as a service" — including the entirety of your management software, monitoring software, orchestration software, backup software, and operational software. This is materially broader than AGPL (which only requires disclosure of the AGPL module\'s source). MongoDB and Elasticsearch (ES 7.11+) use SSPL. Practical impact: SSPL-licensed software cannot practically be used in a proprietary cloud service without obtaining a commercial license. AWS, Azure, and GCP refused to accept SSPL\'s terms and forked SSPL-licensed projects (Amazon OpenSearch from Elasticsearch). Most SaaS companies treat SSPL as effectively "not open source" for compliance purposes — it belongs on the red list alongside AGPL. SSPL is not OSI-approved as open source.',
  },
]

export default function OpenSourceLicenseGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Open Source License Compliance Guide for SaaS (2025): GPL, AGPL, MIT, Apache 2.0',
    description: 'AGPL SaaS loophole, GPL copyleft propagation, MIT vs Apache 2.0 patent clauses, LGPL dynamic linking rules, SBOM requirements, BSL and SSPL source-available licenses.',
    url: 'https://bizlegal-ai.com/guides/open-source-license-compliance-guide',
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
      { '@type': 'ListItem', position: 3, name: 'Open Source License Compliance Guide', item: 'https://bizlegal-ai.com/guides/open-source-license-compliance-guide' },
    ],
  }

  const LICENSE_MATRIX = [
    { license: 'MIT', type: 'Permissive', saasOk: 'Yes', copyleft: 'None', patentGrant: 'No (implicit)', commercial: '✅ Green', notes: 'Preserve copyright notice only' },
    { license: 'Apache 2.0', type: 'Permissive', saasOk: 'Yes', copyleft: 'None', patentGrant: 'Yes (explicit)', commercial: '✅ Green', notes: 'Patent grant + termination clause; incompatible with GPL v2' },
    { license: 'BSD-2 / BSD-3', type: 'Permissive', saasOk: 'Yes', copyleft: 'None', patentGrant: 'No', commercial: '✅ Green', notes: 'BSD-3 adds non-endorsement clause' },
    { license: 'ISC', type: 'Permissive', saasOk: 'Yes', copyleft: 'None', patentGrant: 'No', commercial: '✅ Green', notes: 'Functionally equivalent to MIT' },
    { license: 'MPL 2.0', type: 'Weak copyleft', saasOk: 'Usually yes', copyleft: 'File-level (MPL files only)', patentGrant: 'Yes', commercial: '🟡 Review', notes: 'Copyleft limited to MPL-licensed files; proprietary app OK if MPL files not modified' },
    { license: 'LGPL v2.1 / v3', type: 'Weak copyleft', saasOk: 'Usually yes (dynamic link)', copyleft: 'Library modifications only', patentGrant: 'v3: Yes; v2.1: No', commercial: '🟡 Review', notes: 'Dynamic linking permitted; static linking triggers copyleft' },
    { license: 'GPL v2', type: 'Strong copyleft', saasOk: 'Not for distributed software', copyleft: 'Entire combined work on distribution', patentGrant: 'No explicit', commercial: '🔴 Prohibited', notes: 'SaaS (no distribution): no propagation trigger; distributed software: full source required' },
    { license: 'GPL v3', type: 'Strong copyleft', saasOk: 'Not for distributed software', copyleft: 'Entire combined work on distribution', patentGrant: 'Yes', commercial: '🔴 Prohibited', notes: 'Adds anti-tivoization, patent grant; no-additional-restrictions clause; compatible with Apache 2.0' },
    { license: 'AGPL v3', type: 'Strong copyleft', saasOk: '❌ Triggers on network use', copyleft: 'Entire combined work on network delivery', patentGrant: 'Yes', commercial: '🔴 Red list', notes: 'SaaS CANNOT use AGPL without source disclosure or commercial license' },
    { license: 'SSPL v1 (MongoDB)', type: 'Source-available', saasOk: '❌ Requires open-sourcing entire service stack', copyleft: 'Entire service infrastructure', patentGrant: 'No', commercial: '🔴 Red list', notes: 'Not OSI-approved; broader than AGPL; obtain commercial license or do not use' },
    { license: 'BSL 1.1', type: 'Source-available', saasOk: 'Conditional — check Additional Use Grant', copyleft: 'N/A during restriction period', patentGrant: 'No', commercial: '🔴 Red list (if competing)', notes: 'Converts to open source after Change Date (typically 4 years); competing use prohibited' },
    { license: 'CC0 / Unlicense', type: 'Public domain dedication', saasOk: 'Yes', copyleft: 'None', patentGrant: 'CC0: Yes (explicit); Unlicense: No', commercial: '✅ Green', notes: 'No restrictions at all; CC0 includes explicit patent waiver' },
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
          Open Source License Compliance Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Intellectual Property
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          Open Source License Compliance Guide for SaaS (2025): GPL, AGPL, MIT, Apache 2.0
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          The AGPL's network-use trigger means a SaaS product using AGPL-licensed code must publish its source — including proprietary modifications — to users who access it over a network. GPL copyleft propagates to the entire combined work on distribution. MIT doesn't grant patent rights. SSPL requires open-sourcing your entire service stack. Getting these distinctions wrong creates IP chain-of-title problems that surface in acquisition due diligence.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>License Compliance Matrix for SaaS Products</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '9px 10px', fontWeight: 600 }}>License</th>
                  <th style={{ textAlign: 'left', padding: '9px 10px', fontWeight: 600 }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '9px 10px', fontWeight: 600 }}>SaaS Use OK?</th>
                  <th style={{ textAlign: 'left', padding: '9px 10px', fontWeight: 600 }}>Copyleft Scope</th>
                  <th style={{ textAlign: 'left', padding: '9px 10px', fontWeight: 600 }}>Patent Grant</th>
                  <th style={{ textAlign: 'left', padding: '9px 10px', fontWeight: 600 }}>Commercial Rating</th>
                </tr>
              </thead>
              <tbody>
                {LICENSE_MATRIX.map(({ license, type, saasOk, copyleft, patentGrant, commercial, notes }) => (
                  <tr key={license} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '9px 10px', fontWeight: 700 }}>{license}</td>
                    <td style={{ padding: '9px 10px', opacity: 0.7 }}>{type}</td>
                    <td style={{ padding: '9px 10px', fontWeight: 600 }}>{saasOk}</td>
                    <td style={{ padding: '9px 10px', opacity: 0.75 }}>{copyleft}</td>
                    <td style={{ padding: '9px 10px', opacity: 0.75 }}>{patentGrant}</td>
                    <td style={{ padding: '9px 10px', fontWeight: 700, color: commercial.includes('🔴') ? '#dc2626' : commercial.includes('🟡') ? '#d97706' : '#16a34a' }}>{commercial}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: '0.5rem 0 0' }}>
            Note: "SaaS use" assumes no distribution of modified software to end users. GPL/LGPL copyleft is triggered by distribution, not deployment. AGPL and SSPL are triggered by network delivery.
          </p>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your Software License Agreement for AGPL, SSPL, and Copyleft Exposure</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your vendor software agreement, open source commercial license, or contributor license agreement. BizLegal AI identifies AGPL / SSPL / BSL clauses that require source disclosure or prohibit SaaS commercial use, missing patent grant language, GPL v2/v3 compatibility conflicts, and SBOM obligations in enterprise agreements — before an acquisition due diligence process surfaces them.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your License Agreement →
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
            <Link href="/guides/saas-vendor-agreement-review-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SaaS Vendor Agreement Review →</Link>
            <Link href="/guides/startup-compliance-program-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Startup Compliance Program →</Link>
            <Link href="/guides/soc2-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SOC 2 Compliance Checklist →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. Open source license compliance analysis, copyleft propagation determination, and AGPL/SSPL commercial use analysis depend on the specific version of each license, the manner of technical integration, and the jurisdiction of enforcement. Engage qualified intellectual property counsel for license-specific analysis before incorporating open source components into commercial software.
          </p>
        </footer>

      </main>
    </>
  )
}
