import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'EU-US Data Transfer Guide (2025): SCCs, DPF, UK IDTA, and Schrems II Compliance | BizLegal AI',
  description: 'EU-US Data Privacy Framework (DPF) 2023, Standard Contractual Clauses (SCCs 2021), UK IDTA, Binding Corporate Rules, Schrems II impact on US data transfers, and how SaaS companies should structure cross-border data transfers to avoid GDPR enforcement.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/eu-us-data-transfer-guide' },
  openGraph: {
    title: 'EU-US Data Transfer Guide — BizLegal AI',
    description: 'SCCs 2021, EU-US DPF, UK IDTA, Binding Corporate Rules, and Schrems II — the complete guide to lawful cross-border personal data transfers from the EU to the US and other third countries.',
    url: 'https://bizlegal-ai.com/guides/eu-us-data-transfer-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What happened with Schrems II and why does it matter for SaaS companies transferring EU data to the US?',
    a: 'Schrems II refers to the July 2020 Court of Justice of the European Union (CJEU) judgment in Data Protection Commissioner v. Facebook Ireland and Maximillian Schrems (Case C-311/18). The judgment had two major consequences: (1) Invalidation of Privacy Shield: the EU-US Privacy Shield framework — which approximately 5,300 US companies had relied on to legitimize EU-US data transfers — was invalidated immediately. Companies relying solely on Privacy Shield for EU-US transfers were instantly non-compliant. (2) Conditional validity of Standard Contractual Clauses: the CJEU upheld the validity of SCCs as a transfer mechanism but added a crucial requirement: before using SCCs, the data exporter must verify that the level of protection in the destination country is "essentially equivalent" to EU standards. If it is not — and the court strongly implied that US surveillance law (particularly FISA Section 702 and EO 12333) may prevent this equivalence — additional safeguards must be implemented or the transfer must stop. This created the "Transfer Impact Assessment" (TIA) requirement: a documented legal analysis, conducted for each transfer, assessing whether the destination country\'s laws allow for effective protection of the exported data. For EU-US transfers, TIAs must specifically assess: US FISA Section 702 orders (which compel US tech companies to provide the NSA with access to foreign intelligence data); NSA mass surveillance programs under EO 12333; the availability of judicial redress for EU data subjects against US government access. Why this matters for SaaS: virtually every SaaS company that processes EU personal data transfers some data to the US — whether directly (US-based servers, US employees accessing EU customer data) or indirectly (US-based subprocessors like AWS, Google Cloud, Salesforce, Stripe). After Schrems II, none of these transfers are automatically lawful — they require a documented legal basis and, if using SCCs, a completed TIA.',
  },
  {
    q: 'What is the EU-US Data Privacy Framework (DPF) and does it solve the Schrems II problem?',
    a: 'The EU-US Data Privacy Framework (DPF) was adopted by the European Commission on 10 July 2023 as an adequacy decision under GDPR Article 45, replacing the invalidated Privacy Shield. US companies can self-certify to the DPF through the US Department of Commerce. Certified companies can then receive EU personal data without SCCs or TIAs for transfers covered by their DPF certification. What DPF-certification covers: the transfer of personal data from EU/EEA entities to DPF-certified US companies. The DPF also has sub-frameworks: the UK Extension to the EU-US DPF (for UK-US transfers) and the Swiss-US DPF Extension. How DPF addresses Schrems II concerns: the US enacted Executive Order 14086 (October 2022) and implemented Presidential Policy Directive (PPD-28 successor protections) that: (a) limit US intelligence collection to "necessary and proportionate" purposes; (b) establish a Data Protection Review Court (DPRC) — a new judicial redress mechanism that allows EU individuals to challenge US intelligence collection. The European Commission considered these safeguards sufficient for an adequacy finding. Why DPF is at legal risk: in January 2023 — before the adequacy decision was even adopted — Max Schrems announced plans to challenge DPF (as Schrems III). The French data protection authority (CNIL) and the European Parliament had already expressed concerns. The core legal argument: the DPRC is not an "independent court" in the EU sense; FISA Section 702 still allows bulk collection; the US has not comprehensively changed its surveillance law. A preliminary reference to the CJEU could result in invalidation of DPF — potentially as quickly as 2025-2026. Practical advice: DPF certification is worthwhile if your company can qualify (US-based, FTC-jurisdiction) because it simplifies compliance materially. BUT: simultaneously implement SCCs as a backup mechanism so that if DPF is invalidated again (as Privacy Shield was), your transfers remain lawful without operational disruption. This redundancy approach is what most sophisticated US companies took after Schrems II.',
  },
  {
    q: 'How do Standard Contractual Clauses (SCCs) work and what do the 2021 SCCs require?',
    a: 'Standard Contractual Clauses (SCCs) are pre-approved contract templates issued by the European Commission that, when properly executed between a data exporter (in the EU/EEA) and a data importer (in a third country), provide a legal basis for cross-border personal data transfers under GDPR Article 46(2)(c). The European Commission replaced the old SCCs (approved in 2001 and 2004) with new SCCs in June 2021 (Commission Implementing Decision 2021/914). Key changes in the 2021 SCCs: (1) Modular structure: the new SCCs cover four transfer scenarios in a modular format. Companies must select the module(s) applicable to their transfer: Module 1 (Controller-to-Controller), Module 2 (Controller-to-Processor), Module 3 (Processor-to-Processor), Module 4 (Processor-to-Controller). Most SaaS B2B data transfers use Module 2 (EU customer = controller, US SaaS vendor = processor). (2) Transfer Impact Assessment requirement: Clause 14 of the 2021 SCCs requires the parties to represent that they "have no reason to believe that the laws and practices in the destination country prevent the data importer from fulfilling its obligations under these Clauses." This embeds the Schrems II TIA requirement into the contractual obligation. (3) Docking clause: new SCCs allow additional parties to accede to the agreement (useful for multi-party transfers and subprocessor chains). (4) Expanded data subject rights: SCCs require the data importer to inform data subjects of their rights and to facilitate data subject requests. (5) Government access clause: Clause 15 requires the data importer to notify the data exporter of government access requests for personal data and to challenge overbroad access requests. Migration deadline: the old SCCs were deprecated — all new contracts must use the 2021 SCCs, and existing contracts should have migrated by 27 December 2022. How to execute SCCs for SaaS: the EU customer (controller, data exporter) and the US SaaS vendor (processor, data importer) enter into a Data Processing Agreement (DPA) that incorporates the 2021 SCCs (Module 2) by reference. The DPA should also complete Annex I (description of transfers), Annex II (technical and organisational measures), and Annex III (subprocessors list). The DPA must be signed by a person authorized to bind each party. SaaS vendors with many EU customers typically publish a standard DPA incorporating 2021 SCCs that customers countersign during onboarding.',
  },
  {
    q: 'What is a Transfer Impact Assessment (TIA) and how should SaaS companies conduct one?',
    a: 'A Transfer Impact Assessment (TIA) is a documented legal analysis required by Schrems II (and embedded in Clause 14 of the 2021 SCCs) to determine whether personal data transferred to a third country receives protection "essentially equivalent" to EU law. The TIA must be conducted for each transfer destination (country + data importer), before executing SCCs. A TIA is not a one-time exercise — it should be reviewed when: the destination country\'s surveillance laws change; the data importer\'s activities or US government requests change materially; enforcement actions affect the transfer. TIA structure (EDPB-recommended): Step 1 — Know your transfer: map the transfer (what data, to whom, in what country, for what purpose, retention period). Step 2 — Identify the transfer tool: SCCs, BCRs, adequacy decision, or DPF. Step 3 — Assess the destination country\'s law: (a) Does the law in the destination country impinge on the effectiveness of the transfer tool? (b) For the US: assess FISA Section 702 (compelled access to electronic communications from US-based service providers for foreign intelligence purposes), Executive Order 12333 (upstream surveillance), CLOUD Act (US government ability to compel access to data stored by US companies regardless of storage location). Step 4 — Identify and adopt supplementary measures if needed: if Step 3 finds impingement, supplementary measures must be adopted. Examples: encryption at rest and in transit using keys that the US data importer does not hold (end-to-end encryption); pseudonymization before transfer; contractual commitments by the importer to notify and challenge government access requests. The EDPB has stated that if no effective supplementary measures can be identified, the transfer must not take place. Step 5 — Formal procedural steps: document the TIA analysis; have it reviewed by legal counsel; obtain management sign-off; retain for demonstration to supervisory authorities. Practical reality: for most SaaS companies transferring data to major US cloud providers (AWS, Azure, GCP), the TIA analysis is largely standardized — these providers publish detailed government access reports and maintain contractual commitments against government disclosure (Clause 15 compliance). The encryption supplementary measure is the most commonly applicable. Document it, don\'t just implement it.',
  },
  {
    q: 'What is the UK International Data Transfer Agreement (IDTA) and how does it differ from EU SCCs?',
    a: 'Following Brexit, the UK is no longer subject to EU GDPR and has its own data protection framework (UK GDPR + Data Protection Act 2018). Transfers of personal data from the UK to third countries (including the US) are governed by UK GDPR Article 46 and require a valid transfer mechanism. The UK equivalent of EU SCCs is the International Data Transfer Agreement (IDTA), approved by the UK Information Commissioner\'s Office (ICO) in March 2022. The IDTA replaces the old EU SCCs for UK transfers (which remained operative via transitional provisions until 21 March 2024). Key differences from EU 2021 SCCs: (1) Structure: the IDTA is a standalone agreement document (not a set of standard clauses to incorporate into a DPA). It can be used alone or alongside a DPA. It is available as a standalone IDTA or as an International Data Transfer Addendum to the EU SCCs (allowing a company to use a combined EU SCC + UK IDTA addendum to cover both EU and UK transfers in one document). (2) Tables format: the IDTA uses a "Tables" approach with Table 1 (parties and transfers), Table 2 (selected clauses), Table 3 (security requirements), and Table 4 (change handling). The modular structure differs from the EU SCCs. (3) TIA equivalent: the IDTA requires a Transfer Risk Assessment (TRA) — the UK equivalent of the EU TIA. The ICO\'s TRA guidance is less prescriptive than the EDPB\'s but requires assessment of whether the third country\'s laws impinge on the effectiveness of the IDTA protections. (4) UK Addendum to EU SCCs: most companies handling both EU and UK personal data use the EU 2021 SCCs as the base with the UK Addendum attached. The Addendum converts the EU SCCs into a UK IDTA-compliant transfer mechanism. This is the most efficient approach for companies serving both EU and UK customers. UK-US DPF Extension: the UK Information Commissioner has recognized the UK Extension to the EU-US DPF (under a UK-US adequacy bridge framework called the "UK-US Data Bridge," in effect since 12 October 2023). US companies certified to the EU-US DPF can extend their certification to the UK Data Bridge for UK transfers. Transfers covered by the UK Data Bridge do not require an IDTA or TRA.',
  },
  {
    q: 'What are Binding Corporate Rules (BCRs) and when are they appropriate for multinational companies?',
    a: 'Binding Corporate Rules (BCRs) are internal codes of conduct for transferring personal data within a multinational corporate group. They are approved by EU/EEA data protection authorities under GDPR Article 47 and provide a lawful basis for intragroup data transfers without needing SCCs between group entities. How BCRs work: a multinational company (parent + subsidiaries in multiple countries) drafts an internal policy document specifying: (a) the categories of personal data transferred; (b) the types of transfers and purposes; (c) the data protection standards applied across all group entities (mirroring GDPR requirements for accuracy, purpose limitation, data minimization, security, retention, data subject rights); (d) enforcement mechanisms within the group (data protection officer, internal audits, training, complaint resolution); (e) how BCRs interact with local law requirements. The BCRs must be legally binding on all group entities and enforceable by data subjects (third-party beneficiary provisions). DPA review and approval: the lead DPA (the supervisory authority with primary jurisdiction over the group, typically in the country of the EU headquarters) reviews and approves the BCRs. The approval process involves a "Cooperation Procedure" where multiple DPAs participate in the review. The process typically takes 18 months to 3 years and costs significant legal fees. BCRs for controllers vs. processors: there are separate BCRs for controllers (BCR-C) and processors (BCR-P). BCR-P covers intragroup transfers where the corporate group provides data processing services to external clients. Several major IT services companies and cloud providers hold BCR-P approval. When BCRs are appropriate: BCRs make sense for large multinationals with: (a) regular intragroup data transfers across multiple countries; (b) US parent companies with EU subsidiaries sharing employee and customer data across the group; (c) willingness to invest in the approval process (typically $500K+ in legal and operational costs). BCRs are NOT appropriate for: startups, SMEs, or companies without significant intragroup transfer complexity — the cost and time investment is disproportionate. These companies should use SCCs + DPF instead.',
  },
]

export default function EUUSDataTransferGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'EU-US Data Transfer Guide (2025): SCCs, DPF, UK IDTA, and Schrems II Compliance',
    description: 'EU-US Data Privacy Framework 2023, Standard Contractual Clauses 2021, UK IDTA, BCRs, Schrems II Transfer Impact Assessments, and practical compliance strategies for SaaS companies transferring EU personal data to the US.',
    url: 'https://bizlegal-ai.com/guides/eu-us-data-transfer-guide',
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
      { '@type': 'ListItem', position: 3, name: 'EU-US Data Transfer Guide', item: 'https://bizlegal-ai.com/guides/eu-us-data-transfer-guide' },
    ],
  }

  const MECHANISM_COMPARISON = [
    { mechanism: 'EU-US Data Privacy Framework (DPF)', scope: 'EU → US (US companies only)', requirement: 'Self-certify at dataprivacyframework.gov; update privacy notice; commit to DPF principles', risk: 'LEGAL RISK: Schrems III challenge pending; could be invalidated like Privacy Shield was', when: 'First-choice for US FTC-jurisdiction companies; implement SCCs as backup' },
    { mechanism: 'UK Data Bridge (UK Extension to DPF)', scope: 'UK → US', requirement: 'Extend DPF certification to UK via dataprivacyframework.gov', risk: 'Same challenge risk as EU-US DPF', when: 'First-choice for UK→US if DPF certified; supplement with UK IDTA' },
    { mechanism: 'EU SCCs 2021 (Module 2, C2P)', scope: 'EU → Any third country', requirement: 'Execute 2021 SCCs in DPA; complete Annexes I-III; conduct TIA; implement supplementary measures as needed', risk: 'Valid as of 2024 but requires documented TIA; operationally more complex than DPF', when: 'Mandatory fallback if DPF unavailable or invalidated; standard for non-US country transfers' },
    { mechanism: 'UK IDTA / UK Addendum to EU SCCs', scope: 'UK → Any third country', requirement: 'Execute IDTA or add UK Addendum to EU SCCs; conduct Transfer Risk Assessment (TRA)', risk: 'Valid as of March 2024 (IDTA); Addendum is more efficient for dual EU+UK transfers', when: 'Required for UK personal data transfers outside UK where UK Data Bridge unavailable' },
    { mechanism: 'Binding Corporate Rules (BCRs)', scope: 'Intragroup transfers within approved multinational group', requirement: 'DPA approval process (18 months - 3 years); legally binding internal policy; €500K+ implementation cost', risk: 'Slow to obtain; must be updated when group structure changes; not available to small companies', when: 'Only for large multinationals with significant ongoing intragroup transfer complexity' },
    { mechanism: 'Adequacy Decision (other countries)', scope: 'EU → Adequate countries (UK, Japan, Canada, South Korea, etc.)', requirement: 'No additional mechanism required — Commission has deemed the country adequate', risk: 'Adequacy can be withdrawn (UK adequacy expires and must be renewed)', when: 'Simplest mechanism when available; transfers to adequate countries need no SCCs or DPF' },
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
          EU-US Data Transfer Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Privacy & Data
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          EU-US Data Transfer Guide (2025): SCCs, Data Privacy Framework, UK IDTA, and Schrems II
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Every US SaaS company with EU customers transfers personal data across the Atlantic. Since Schrems II invalidated Privacy Shield in July 2020, every such transfer requires a lawful transfer mechanism — either the EU-US Data Privacy Framework (DPF, adopted July 2023, legally challenged), Standard Contractual Clauses (2021 version), or Binding Corporate Rules. None of these mechanisms make the transfer automatic. All require documentation.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Data Transfer Mechanism Comparison</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', minWidth: '620px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '9px 10px', fontWeight: 600 }}>Mechanism</th>
                  <th style={{ textAlign: 'left', padding: '9px 10px', fontWeight: 600 }}>Scope</th>
                  <th style={{ textAlign: 'left', padding: '9px 10px', fontWeight: 600 }}>Requirement</th>
                  <th style={{ textAlign: 'left', padding: '9px 10px', fontWeight: 600, color: '#dc2626' }}>Risk</th>
                  <th style={{ textAlign: 'left', padding: '9px 10px', fontWeight: 600 }}>When to Use</th>
                </tr>
              </thead>
              <tbody>
                {MECHANISM_COMPARISON.map(({ mechanism, scope, requirement, risk, when: whenUse }) => (
                  <tr key={mechanism} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '9px 10px', fontWeight: 600, minWidth: '160px' }}>{mechanism}</td>
                    <td style={{ padding: '9px 10px', opacity: 0.75, fontSize: '0.78rem' }}>{scope}</td>
                    <td style={{ padding: '9px 10px', opacity: 0.75, fontSize: '0.78rem' }}>{requirement}</td>
                    <td style={{ padding: '9px 10px', opacity: 0.85, fontSize: '0.78rem', color: risk.startsWith('LEGAL RISK') ? '#dc2626' : 'inherit' }}>{risk}</td>
                    <td style={{ padding: '9px 10px', opacity: 0.8, fontSize: '0.78rem', fontStyle: 'italic' }}>{whenUse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your DPA and Data Transfer Clauses for SCCs Compliance Gaps</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your Data Processing Agreement, customer DPA, or vendor agreement containing international transfer provisions. BizLegal AI identifies whether your SCCs are the correct 2021 version (not the deprecated 2001/2004 version), whether the correct module is selected for your controller/processor role, missing TIA documentation obligations, gaps in Annex I-III completeness, and whether your subprocessor chain is properly covered.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Data Transfer Agreement →
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
            <Link href="/regulations/gdpr" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR Regulation Hub →</Link>
            <Link href="/guides/gdpr-data-processing-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR DPA Guide →</Link>
            <Link href="/guides/gdpr-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR Compliance Checklist →</Link>
            <Link href="/guides/privacy-policy-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Privacy Policy Compliance →</Link>
            <Link href="/guides/data-breach-response-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Data Breach Response →</Link>
            <Link href="/guides/india-dpdpa-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>India DPDPA Compliance →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. EU-US data transfer law is actively evolving — the EU-US Data Privacy Framework is subject to pending legal challenge (Schrems III), and adequacy decisions can be withdrawn by the European Commission. The UK IDTA framework and UK Data Bridge are subject to ongoing ICO guidance. Engage qualified privacy counsel to assess your specific transfer circumstances, conduct Transfer Impact Assessments, and structure DPA international transfer provisions.
          </p>
        </footer>

      </main>
    </>
  )
}
