import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'DORA Compliance Guide for ICT Vendors and EU Financial Entities (2025) | BizLegal AI',
  description: 'Practical DORA compliance guide for ICT third-party providers and EU financial entities. Covers the five DORA pillars, incident reporting timelines, third-party ICT register requirements, CTPP designation, and TLPT obligations — live since January 2025.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/dora-ict-compliance-guide' },
  openGraph: {
    title: 'DORA Compliance Guide for ICT Vendors — BizLegal AI',
    description: 'EU Digital Operational Resilience Act: ICT risk management, 4h/72h/1-month incident reporting, DORA third-party register, CTPP oversight, and what SaaS vendors serving EU financial institutions must do right now.',
    url: 'https://bizlegal-ai.com/guides/dora-ict-compliance-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'Does DORA apply to my SaaS company if we\'re not an EU financial institution?',
    a: 'Yes — if your SaaS product is used by EU financial entities (banks, investment firms, payment institutions, e-money institutions, insurance companies, crypto-asset service providers, or others listed in Article 2(1) DORA), and your services are material to their operations, you are an ICT third-party provider subject to DORA obligations. The threshold for "materiality" is set at the financial entity level in their ICT third-party risk assessment, not at yours. In practice, any SaaS infrastructure, cloud, data, or analytics provider serving EU financial clients is already appearing on DORA ICT Third-Party Registers and receiving DORA-mandated contractual change requests from clients. Critical Third-Party Providers (CTPPs) — those designated by the European Supervisory Authorities as systemically important — face direct ESA oversight regardless of where they are incorporated. Being headquartered outside the EU does not exempt a CTPP from ESA lead oversight authority.',
  },
  {
    q: 'What are the five DORA pillars and which applies to ICT vendors?',
    a: 'DORA organizes digital resilience requirements into five interlocking chapters: (1) ICT Risk Management — financial entities must implement a comprehensive ICT risk management framework including policies, procedures, governance structures, and a digital operational resilience strategy. ICT vendors are affected because they must cooperate with these frameworks and demonstrate their own controls. (2) ICT-Related Incident Management — financial entities must classify, manage, and report ICT incidents using EBA/ESMA/EIOPA classification criteria. Major incidents must be reported to NCA within 4 hours of classification, with full reports within 72 hours and a final report within 1 month. ICT vendors must build operational capabilities to support their clients\'s notification obligations, particularly around detecting incidents that would qualify as "major" under DORA thresholds. (3) Digital Operational Resilience Testing — financial entities must annually test ICT systems and run Threat-Led Penetration Tests (TLPT) every 3 years for significant entities. ICT vendors supporting critical functions must often participate in client TLPT exercises directly. (4) ICT Third-Party Risk — financial entities must maintain an ICT third-party register, ensure all ICT contracts meet DORA\'s Article 30 minimum content requirements, and assess concentration risk. CTPPs are subject to ESA lead oversight. (5) Information Sharing — voluntary, secure intelligence sharing about cybersecurity threats and vulnerabilities between financial entities and with regulators. ICT vendors may participate in information sharing arrangements.',
  },
  {
    q: 'What does DORA require in ICT third-party contracts? (Article 30)',
    a: 'Article 30 DORA specifies minimum contractual content that every ICT contract between a financial entity and a significant ICT third-party provider must include. Required terms: (a) clear and complete description of all ICT services to be provided; (b) locations where services are provided and where data will be processed, including notification requirement for changes; (c) provisions on availability, authenticity, integrity, and confidentiality of personal and non-personal data; (d) description of full service level descriptions including updates; (e) relevant provisions regarding accessibility, availability, continuity, and quality of ICT services; (f) right to audit and inspect the ICT third-party provider — financial entities must contractually secure audit rights; (g) exit strategies including minimum notice periods and transition obligations; (h) incident notification obligations — the third-party provider must notify the financial entity of incidents that may have impact on services; and (i) obligations for ICT third-party providers to cooperate with NCAs and ESAs on request. Contracts lacking these provisions require renegotiation or termination — financial entities cannot continue service relationships with non-compliant contracts. CTPPs are subject to additional contractual requirements through ESA oversight frameworks.',
  },
  {
    q: 'What is a Critical Third-Party Provider (CTPP) designation and what does it mean in practice?',
    a: 'Article 31 DORA empowers the Joint Committee of ESAs (EBA, ESMA, EIOPA) to designate ICT third-party providers as Critical Third-Party Providers (CTPPs) based on systemic importance to EU financial stability. Designation criteria include: systemic impact of failure on financial institutions using the service; the number of global systemically important institutions (G-SIIs) that are clients; substitutability of the ICT services (concentration risk); and the degree of interconnection between the ICT provider and multiple financial sectors. Once designated, a CTPP is assigned a Lead Overseer from one of the ESAs based on the nature of services provided. The Lead Overseer has authority to: request information and conduct investigations; conduct onsite inspections at CTPP premises; issue recommendations on ICT risk, contractual terms, and business continuity; and cooperate with third-country supervisory authorities. Critically, CTPPs must register with the ESAs within 2 months of designation. Failure to cooperate with Lead Overseer investigations can result in periodic penalty payments of up to 1% of worldwide daily average turnover for up to 6 months. The first CTPP designations were expected in mid-2025; cloud providers and core banking platform vendors are the primary targets.',
  },
  {
    q: 'What are DORA\'s major incident classification thresholds and reporting timelines?',
    a: 'DORA Article 18 and the EBA/ESMA/EIOPA Delegated Regulations on incident classification establish multi-criteria thresholds for classifying ICT incidents as "major." Materiality thresholds (any one triggers major classification): clients, counterparties, or financial transactions affected > 10%; transactions affected over 2-hour period > 25% of daily average; data loss affecting more than 0.1% of the financial entity\'s clients; duration > 24 hours; critical services affected; reputational impact above set thresholds; geographic spread (multiple EU Member States affected). Reporting timeline for major ICT incidents: (1) Initial notification to NCA: within 4 hours of the financial entity becoming aware the incident may be major, or within 4 hours of classification if classification is immediate. Content: incident details, timing, nature, geographic scope, initial severity. (2) Intermediate report: within 72 hours of initial notification. Updated assessment, scope of impact, cause analysis if available, mitigation measures taken. (3) Final report: within 1 month of intermediate report. Root cause analysis, lessons learned, forward-looking remediation plan. Financial entities must coordinate their reporting obligations with ICT third-party providers — vendors who delay incident notification to their clients risk causing their clients to miss regulatory deadlines, which creates contractual liability under the Article 30 mandatory incident notification clause.',
  },
  {
    q: 'What is Threat-Led Penetration Testing (TLPT) under DORA and does it affect ICT vendors?',
    a: 'DORA Article 26 requires significant financial entities (those meeting the criteria defined by NCAs) to conduct Threat-Led Penetration Tests (TLPT) at least every 3 years. TLPT is a structured, intelligence-led penetration test based on the TIBER-EU framework — different from ordinary penetration tests in that it uses real threat intelligence to target the specific threats a financial entity faces. TLPT scope typically covers critical or important functions (CIFs) and the ICT systems that support them. ICT third-party providers supporting critical functions must often be included in TLPT scope. The financial entity must obtain the ICT provider\'s permission to include their systems in TLPT scope, and providers can contractually limit or control TLPT access. In practice, major SaaS vendors serving multiple EU financial institutions are frequently asked to include their shared infrastructure in scope. Results of TLPT cannot be shared beyond the conducting entity and its regulators without the ICT provider\'s consent. TLPT completion validates resilience and can reduce regulatory scrutiny — financial entities with current TLPT completion receive favorable treatment in NCA supervisory reviews.',
  },
]

export default function DORAGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'DORA Compliance Guide for ICT Vendors and EU Financial Entities (2025)',
    description: 'EU Digital Operational Resilience Act compliance — ICT risk management, incident reporting, third-party register, CTPP designation, and TLPT obligations for financial entities and their SaaS vendors.',
    url: 'https://bizlegal-ai.com/guides/dora-ict-compliance-guide',
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
      { '@type': 'ListItem', position: 3, name: 'DORA ICT Compliance Guide', item: 'https://bizlegal-ai.com/guides/dora-ict-compliance-guide' },
    ],
  }

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
          DORA Compliance
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          EU Digital Operational Resilience
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          DORA Compliance Guide for ICT Vendors and EU Financial Entities (2025)
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          EU Regulation 2022/2554 — the Digital Operational Resilience Act — became fully applicable on 17 January 2025 across all 27 EU Member States. If your SaaS product serves EU banks, payment institutions, investment firms, or crypto-asset service providers, DORA already applies to your contracts and your clients are reviewing your compliance posture now.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Who DORA Applies To: Financial Entities and ICT Third-Party Providers</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            DORA Article 2(1) lists 21 categories of EU financial entity subject to DORA's full requirements: credit institutions, payment institutions, account information service providers, electronic money institutions, investment firms, crypto-asset service providers (CASPs under MiCA), central securities depositories, central counterparties, trading venues, trade repositories, managers of alternative investment funds and UCITS, insurance and reinsurance undertakings, insurance intermediaries, occupational pension funds, credit rating agencies, statutory auditors, crowdfunding service providers, securitisation repositories, and data reporting service providers.
          </p>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            ICT third-party providers — every software vendor, cloud provider, data analytics service, and technology company whose services are used by any of these entities — are subject to DORA's Article 30 contractual requirements and, if designated Critical Third-Party Providers (CTPPs), to direct ESA oversight. There is no general exemption for small ICT providers, though the proportionality principle in Article 4 allows financial entities to apply simplified frameworks for non-material third parties.
          </p>
          <p style={{ lineHeight: 1.75 }}>
            Financial entities must maintain an ICT Third-Party Register of all their ICT service provider relationships, classified by whether each relationship supports a critical or important function (CIF). ICT vendors supporting CIFs receive the full weight of DORA's Article 30 contractual requirements and are often listed in supervisory reports submitted to NCAs. If you serve EU financial clients and have not yet been asked to complete a DORA vendor questionnaire or sign a DORA contract addendum, expect that request shortly.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>The Five DORA Pillars: What Each Requires</h2>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', marginTop: '1.5rem' }}>1. ICT Risk Management (Articles 5–16)</h3>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Financial entities must establish, implement, and maintain a robust ICT risk management framework with four mandatory layers: a governance and organization layer (ISMS-equivalent policies and designated responsibility at management body level); an identification and protection layer (comprehensive asset inventory, network architecture maps, and technical controls); a detection layer (monitoring and logging systems capable of identifying anomalous ICT activity); and a response and recovery layer (tested business continuity and disaster recovery plans with defined RPO/RTO targets). For ICT vendors: your financial entity clients will require evidence of your own ICT risk management controls as part of their third-party risk due diligence. DORA allows financial entities to rely on third-party certifications (ISO 27001, SOC 2 Type II) as evidence of controls.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', marginTop: '1.5rem' }}>2. ICT Incident Management and Reporting (Articles 17–23)</h3>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Financial entities must classify, manage, and report ICT incidents using ESA-prescribed classification criteria. The three-phase notification regime for major incidents is binding: initial notification to NCA within 4 hours of classification; intermediate report within 72 hours; final report within 1 month. Financial entities also face annual reporting of ICT threat data to ESAs. For ICT vendors: your contracts with financial clients must include incident notification obligations requiring you to alert clients to incidents affecting their services within a timeframe that allows the client to meet their own NCA reporting deadline. A vendor incident notification gap creating a missed NCA deadline is a contractual liability.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', marginTop: '1.5rem' }}>3. Digital Operational Resilience Testing (Articles 24–27)</h3>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            All financial entities must run basic annual resilience tests (vulnerability assessments, penetration tests, end-to-end tests). Significant financial entities — those meeting NCA-defined thresholds based on size and systemic importance — must additionally conduct Threat-Led Penetration Tests (TLPT) every 3 years using the TIBER-EU methodology. TLPT is supervised by the relevant NCA and uses actual threat intelligence to target the entity's real attack surface. For ICT vendors: financial entities frequently must include their critical ICT providers in TLPT scope. Participating in a client TLPT exercise requires cooperation, pre-test scoping agreements, and often confidentiality arrangements with the testing team.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', marginTop: '1.5rem' }}>4. ICT Third-Party Risk Management (Articles 28–44)</h3>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            This is the pillar most directly affecting ICT vendors. Financial entities must: (a) maintain a Register of ICT Third-Party Service Providers covering all providers, their services, and CIF designation; (b) ensure all ICT contracts meet DORA Article 30 minimum content requirements; (c) assess ICT concentration risk and document exposure to single providers; (d) implement exit strategies for all critical or important ICT relationships; and (e) conduct pre-contractual due diligence and ongoing monitoring. CTPPs designated by ESAs are subject to Lead Overseer authority, including the power to conduct onsite inspections and issue binding recommendations.
          </p>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', marginTop: '1.5rem' }}>5. Information Sharing (Article 45)</h3>
          <p style={{ lineHeight: 1.75 }}>
            DORA creates a voluntary framework for financial entities to share cybersecurity threat intelligence and vulnerability information with each other and with regulators through trusted information sharing arrangements. Participation is voluntary, and information shared is protected from liability under Article 45(3). ICT vendors may participate in these arrangements under contractual terms with their financial entity clients.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>DORA Article 30 Contractual Checklist for ICT Vendors</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Every ICT contract with an EU financial entity relating to a critical or important function must include the following provisions. If your current MSA lacks any of these, expect a contract amendment request from your financial clients:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li>Complete description of all ICT services to be provided, including technical specifications</li>
            <li>Locations where ICT services are provided and where data is processed — with a change notification requirement</li>
            <li>Provisions ensuring availability, authenticity, integrity, and confidentiality of data (both personal and non-personal)</li>
            <li>Full service level descriptions including updates and performance thresholds</li>
            <li>Provisions for accessibility, continuity, and quality of ICT services across all conditions including crisis scenarios</li>
            <li><strong>Audit rights:</strong> financial entity right to audit or have a third party audit the ICT vendor — including onsite inspections — with reasonable notice</li>
            <li>Termination rights and exit assistance obligations (minimum notice periods; transition support)</li>
            <li><strong>ICT incident notification obligation:</strong> vendor must notify the financial entity without undue delay of incidents that may affect or are affecting the services — including preliminary assessments and updates</li>
            <li>Cooperation obligation with the financial entity's NCA and ESAs on request</li>
            <li>Subcontracting provisions — limitations on subcontracting; approval requirements for material subcontractors</li>
            <li>Data return and deletion obligations on contract termination</li>
          </ul>
          <p style={{ lineHeight: 1.75, marginTop: '1rem', padding: '1rem', background: 'var(--color-bg-secondary, #f9fafb)', borderRadius: '8px', borderLeft: '3px solid #2563eb' }}>
            <strong>Practical note:</strong> EU financial entities received regulatory guidance in Q4 2024 to remediate non-compliant ICT contracts by January 2025. Many financial entities sent blanket contract amendment addendums to all ICT vendors. Failing to counter-sign or negotiate these addendums in good faith signals non-compliance with DORA obligations — which the financial entity must report to its NCA in its ICT Third-Party Register.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>DORA and NIS2: How They Interact</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            NIS2 Directive (EU 2022/2555) and DORA create overlapping but distinct obligations. A bank affected by a major ICT incident may simultaneously need to: notify its NCA under DORA within 4 hours; notify its NIS2 competent authority within 24 hours (if it is also an essential entity under NIS2); and notify the relevant DPA under GDPR within 72 hours if personal data is involved. DORA Article 1(2) establishes lex specialis — for entities in scope of both DORA and NIS2, DORA's specific financial sector rules take precedence over NIS2 general requirements on identical subject matter.
          </p>
          <p style={{ lineHeight: 1.75 }}>
            ICT vendors to financial entities may also be subject to NIS2 in their own right — if they are classified as essential or important entities in sectors such as digital infrastructure, cloud computing services, or managed security service providers. CISOs at vendors serving EU financial entities should map both DORA contractual obligations (as ICT third-party providers) and NIS2 direct obligations (as potentially in-scope entities) simultaneously, since the control frameworks substantially overlap.
          </p>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #2563eb08, #2563eb14)', border: '1px solid #2563eb30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Review Your ICT Contracts for DORA Article 30 Gaps in 60 Seconds</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            DORA Article 30 mandates specific contract terms for all ICT agreements covering critical or important functions. BizLegal AI scans your MSA, DPA, and SLA against the full Article 30 checklist — audit rights, incident notification obligations, exit strategy provisions, subcontracting restrictions — and flags every missing clause before your financial client's NCA review.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#2563eb', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your ICT Contracts for DORA Gaps →
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
            <Link href="/regulations/dora" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>DORA Compliance Hub →</Link>
            <Link href="/guides/mica-regulation-crypto-compliance" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>MiCA Compliance Guide →</Link>
            <Link href="/guides/iso-27001-vs-soc2-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>ISO 27001 vs SOC 2 →</Link>
            <Link href="/guides/aml-kyc-compliance-crypto" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>AML & KYC for Crypto →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Compliance Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. DORA requirements are subject to regulatory technical standards and implementing technical standards published by EBA, ESMA, and EIOPA, which continue to be finalized. Engage qualified EU financial regulatory counsel for entity-specific DORA compliance determinations.
          </p>
        </footer>

      </main>
    </>
  )
}
