import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'GDPR Data Processing Agreement (DPA) Guide: Article 28 Requirements (2025) | BizLegal AI',
  description: 'What a GDPR-compliant Data Processing Agreement must contain under Article 28, when you need one, the 12 mandatory terms, sub-processor chains, SCCs for international transfers, and how to negotiate DPAs with enterprise customers.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/gdpr-data-processing-agreement-guide' },
  openGraph: {
    title: 'GDPR Data Processing Agreement Guide — BizLegal AI',
    description: 'Article 28 DPA mandatory terms, sub-processor clauses, SCC integration, and the DPA provisions enterprise customers will push back on.',
    url: 'https://bizlegal-ai.com/guides/gdpr-data-processing-agreement-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'When is a Data Processing Agreement legally required under GDPR?',
    a: 'Article 28 GDPR requires a written contract (a Data Processing Agreement, or DPA) whenever a controller engages a processor to process personal data on its behalf. A "processor" is any entity that processes personal data on behalf of a controller — where the controller determines the purposes and means of processing, and the processor acts only on the controller\'s instructions. In SaaS, the typical structure is: your customer (a business with EU customers or employees) is the controller, and your SaaS product is the processor. Your SaaS product handles personal data (customer records, employee data, user behavior) on behalf of your customer. A DPA is required. If you refuse to sign a DPA with EU enterprise customers, they cannot lawfully use your product under GDPR. This is why enterprise sales cycles in EU markets require DPA negotiation as a precondition to contract signing. The controller-processor distinction also matters for GDPR fines: controllers bear primary liability for GDPR violations, but processors can face direct enforcement for failing to implement appropriate technical and organizational measures, or for acting outside the controller\'s instructions. The GDPR\'s most common SaaS misconception is that a processor is not liable — processors face up to €10M or 2% of global annual turnover per violation under Article 83(4), and up to €20M or 4% for systematic violations.',
  },
  {
    q: 'What are the 12 mandatory terms that every GDPR DPA must include?',
    a: 'Article 28(3) GDPR specifies that a DPA must contain at minimum the following terms, and supervisory authority guidance (including the European Data Protection Board) has further elaborated on their substance: (1) Subject-matter and duration: What personal data is processed, for what purpose, and for how long. Duration must be bounded — indefinite processing is not permitted. (2) Nature and purpose of processing: The specific processing activities (collection, storage, analysis, transmission) and the business purpose they serve. (3) Type of personal data: Categories of data processed (contact details, financial data, health data, behavioral data, etc.). Special categories (health, biometric, racial, etc.) require explicit identification and additional safeguards. (4) Categories of data subjects: Who the personal data relates to (your customer\'s end users, employees, leads, etc.). (5) Obligations and rights of the controller: The DPA must set out the controller\'s right to issue instructions and the processor\'s obligation to act only on those instructions. (6) Confidentiality: Processor must ensure that all personnel with access to personal data are subject to binding confidentiality obligations. (7) Security measures (Article 32): Processor must implement appropriate technical and organizational measures — typically described by reference to encryption, access controls, incident response procedures, and security testing. The DPA should specify or reference an Annex listing these measures. (8) Sub-processors: Processor must obtain prior written authorization from the controller before engaging sub-processors, and must impose GDPR-equivalent obligations on all sub-processors. (9) Data subject rights: Processor must assist the controller in fulfilling data subject requests (access, erasure, rectification, portability). (10) Deletion or return on termination: At the end of the processing relationship, the processor must delete or return all personal data, including copies. (11) Audits: Processor must allow for and contribute to audits and inspections, including by the controller or a third-party auditor. (12) Prior consultation: Processor must assist the controller with prior consultation obligations to supervisory authorities for high-risk processing (Article 36).',
  },
  {
    q: 'How should a SaaS DPA handle sub-processors?',
    a: 'Article 28(2) GDPR requires processors to obtain prior written authorization from the controller before engaging sub-processors — entities to whom the processor delegates some or all of its processing. For SaaS companies, sub-processors include cloud infrastructure providers (AWS, GCP, Azure), databases, analytics platforms, email delivery services, CDNs, monitoring tools, and any other service that processes personal data as part of delivering the SaaS product. There are two authorization models used in practice: (1) Specific authorization: The DPA lists every sub-processor by name and requires the controller to consent to each one before the processor can engage them. This is burdensome for SaaS companies with many sub-processors (common for large enterprise customers to demand this). (2) General authorization: The DPA authorizes a class of sub-processors and requires the processor to notify the controller before engaging new sub-processors, with a right for the controller to object. This is the model used by most SaaS companies (including AWS, Google Workspace, and Salesforce in their standard DPAs). The processor must maintain a current list of sub-processors and make it available to controllers. Under Article 28(4), the processor must impose GDPR-equivalent obligations on all sub-processors via written contracts — the processor remains fully liable to the controller for sub-processor GDPR violations. Standard approach in SaaS DPAs: include a publicly accessible sub-processor page (URL), commit to X days\' notice before adding sub-processors, and grant controllers a right to object within X days. If the controller objects and the processor cannot reasonably avoid using that sub-processor, either party may terminate the portion of the service affected.',
  },
  {
    q: 'How do Standard Contractual Clauses (SCCs) interact with DPAs for international transfers?',
    a: 'When EU personal data is transferred to a third country without an adequacy decision from the European Commission (most transfers to the US, India, and elsewhere outside the EU/EEA/adequacy-listed countries), a transfer mechanism must be in place under Chapter V GDPR. The EU Standard Contractual Clauses (SCCs) are the most widely used mechanism. Critically, SCCs are not a standalone DPA — they are an addendum to the DPA, or the DPA may incorporate SCCs directly. The 2021 EU SCCs (effective since June 2021, mandatory since December 2022) replaced the prior 2001/2004/2010 SCCs. The new SCCs include four modules: Module 1 (Controller-to-Controller), Module 2 (Controller-to-Processor), Module 3 (Processor-to-Controller), Module 4 (Processor-to-Processor). For a standard SaaS arrangement: your customer (EU controller) transferring data to your SaaS (non-EU processor) requires Module 2 SCCs. Your SaaS engaging a non-EU sub-processor (e.g., an AWS region outside the EEA) requires Module 3 SCCs. Practical integration: SaaS DPAs typically include SCCs as Annex III or Schedule C, with the applicable module and optional clauses selected. Annex I specifies the parties, the data transferred, and the processing purposes. Annex II specifies technical and organizational security measures. The SCCs must be executed by the actual legal entities involved — "covering" international transfers at a group level without executed SCCs for each entity is a common compliance error flagged in supervisory authority enforcement.',
  },
  {
    q: 'What DPA terms do enterprise customers typically push back on?',
    a: 'Enterprise legal teams negotiating SaaS DPAs commonly push back on the following standard processor-favorable provisions: (1) Sub-processor notification period: Processors typically offer 10-30 days\' notice before adding sub-processors. Enterprise customers push for 60-90 days and a harder right to object. (2) Security measure specificity: A generic Annex II citing "encryption, access controls, and penetration testing" without specifics is often insufficient for enterprise security reviews. Customers push for specific encryption standards (AES-256 at rest, TLS 1.3 in transit), SOC 2 Type II or ISO 27001 certification requirements, and breach notification timelines shorter than the 72-hour legal minimum. (3) Audit rights: Standard DPAs allow audits "on reasonable notice" with the processor\'s cooperation. Enterprise customers sometimes demand on-site audit rights or the ability to conduct audits without prior notice (significant operational risk for the processor). A reasonable compromise: right to audit with 30 days\' notice, limited to information security controls, and the cost borne by the requesting party for third-party assessments. (4) Data breach notification timeline: Article 33 requires notification to the supervisory authority within 72 hours. Enterprise customers frequently demand processor-to-controller notification timelines shorter than 72 hours (24-48 hours is common), to give themselves time to investigate before the 72-hour clock runs. (5) Deletion scope: Customers push for deletion of all copies, including backup copies, with written certification within 30 days of termination. Ensure your data deletion and backup rotation schedule can actually support this commitment. (6) Jurisdiction and governing law: EU customers prefer EU governing law; US SaaS companies prefer US or UK law. This is often negotiated by carving out the SCCs (which must be governed by EU law) while allowing the rest of the DPA to be governed by another jurisdiction.',
  },
  {
    q: 'What happens if your SaaS company processes personal data without a valid DPA?',
    a: 'Processing personal data without a compliant Article 28 DPA is a violation of GDPR on the part of both the controller (for failing to ensure a DPA is in place) and the processor (for processing without the required written contract). Enforcement consequences: Under Article 83(4) GDPR, violations of Article 28 (processor obligations, including DPA requirements) are subject to administrative fines up to €10 million or 2% of total worldwide annual turnover (whichever is higher). Supervisory authority enforcement of Article 28 DPA violations: the Irish DPC, which supervises most major US tech companies\' EU operations, has cited absent or deficient DPAs in multiple enforcement investigations. Notable examples include Meta\'s various enforcement actions and numerous fines issued to smaller SaaS companies for inadequate or missing DPAs in GDPR investigations following data subject complaints. Beyond direct fines: a data breach without a valid DPA removes one of the key due diligence defenses a processor might otherwise assert. Without a DPA, the processor cannot demonstrate that processing occurred under controller instructions, making it harder to avoid direct liability for the breach. Contractual exposure: most enterprise SaaS agreements include representations and warranties about GDPR compliance. An absent DPA constitutes a breach of those warranties, triggering indemnification and potentially contract termination. From a business perspective: many enterprise customers in the EU now require DPA execution before commercial agreements take effect. Failure to have a readily negotiatable DPA stalls enterprise sales cycles, particularly in Germany, France, the Netherlands, and Nordics where legal teams routinely request DPAs as part of security and privacy due diligence.',
  },
]

export default function GDPRDPAGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'GDPR Data Processing Agreement (DPA) Guide: Article 28 Requirements (2025)',
    description: 'Article 28 GDPR DPA mandatory terms, sub-processor chain management, SCC integration for international transfers, and enterprise DPA negotiation strategy for SaaS companies.',
    url: 'https://bizlegal-ai.com/guides/gdpr-data-processing-agreement-guide',
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
      { '@type': 'ListItem', position: 3, name: 'GDPR DPA Guide', item: 'https://bizlegal-ai.com/guides/gdpr-data-processing-agreement-guide' },
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
          GDPR DPA Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Privacy & Data
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          GDPR Data Processing Agreement (DPA) Guide: Article 28 Requirements (2025)
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Every SaaS company with EU customers must execute a Data Processing Agreement under Article 28 GDPR before processing EU personal data on the customer's behalf. Missing or deficient DPAs are among the most common GDPR violations discovered in supervisory authority investigations — and among the most common blockers in EU enterprise sales cycles. This guide covers the 12 mandatory DPA terms, sub-processor chain management, SCC integration, and what enterprise customers will actually push back on.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Controller vs. Processor: Getting the GDPR Roles Right</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            The most consequential determination in any GDPR compliance analysis is whether your company is a controller or a processor for a given processing activity — because it determines your obligations, your liability exposure, and what agreements you need.
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Definition</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Typical SaaS example</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Max fine</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Controller', 'Determines purposes and means of processing', 'Your customer using your SaaS for their CRM', '€20M / 4% global turnover'],
                  ['Processor', 'Processes data on behalf of and under instruction of a controller', 'Your SaaS product storing/analyzing customer\'s user data', '€10M / 2% global turnover'],
                  ['Joint Controller', 'Two+ entities jointly determine purposes and means', 'API integration where both companies decide how data is used', '€20M / 4% global turnover'],
                  ['Sub-processor', 'Processor engaged by another processor', 'AWS storing data for your SaaS product', '€10M / 2% global turnover'],
                ].map(([role, def, example, fine]) => (
                  <tr key={role} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{role}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8 }}>{def}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.7, fontStyle: 'italic' }}>{example}</td>
                    <td style={{ padding: '10px 12px', color: '#dc2626', fontWeight: 600 }}>{fine}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ lineHeight: 1.75 }}>
            Many SaaS companies are simultaneously controllers (for their own employee and marketing data) and processors (for their customers' data). Each role requires different agreements, different compliance programs, and different responses to data subject requests. A company in the processor role cannot use its customers' data for its own purposes (analytics, product improvement, training AI models) without becoming a joint controller — which requires an additional agreement under Article 26 GDPR.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>The Standard DPA Structure: What Goes in Each Section</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '0.75rem' }}>
            A standard GDPR-compliant DPA typically has the following structure:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li><strong>Definitions:</strong> Align terms with GDPR Article 4 (personal data, processing, controller, processor, data subject, supervisory authority, etc.).</li>
            <li><strong>Scope and instructions:</strong> Processor processes only on documented controller instructions. Instructions can be delivered via the services agreement or subsequent written communications. Emergency deviation protocol for legal obligations.</li>
            <li><strong>Data security (Article 32):</strong> Technical and organizational measures — typically in Annex II. Reference to specific encryption standards, access control frameworks, vulnerability management, and incident response procedures.</li>
            <li><strong>Sub-processors (Article 28(2)):</strong> Authorization model (specific vs. general), sub-processor list URL, notification period, objection rights, and imposition of GDPR-equivalent obligations.</li>
            <li><strong>Data subject rights:</strong> Processor assists controller in responding to Article 15-22 requests (access, erasure, rectification, restriction, portability, objection, no automated decision-making).</li>
            <li><strong>Breach notification:</strong> Processor notifies controller within X hours of becoming aware of a personal data breach, with content of notice specified (nature, categories, approximate numbers of data subjects and records, consequences, mitigation measures).</li>
            <li><strong>DPIAs and prior consultation:</strong> Processor assists controller with data protection impact assessments (Article 35) and prior consultation (Article 36) for high-risk processing.</li>
            <li><strong>Deletion or return:</strong> Timeline, format, scope (including backups), and written certification.</li>
            <li><strong>Audit rights:</strong> Frequency, notice requirements, scope limitations, cost allocation, and alternative compliance certification mechanism (SOC 2, ISO 27001).</li>
            <li><strong>International transfers (Chapter V):</strong> SCCs incorporated as schedule, applicable modules identified, Annex I (parties and processing description) and Annex II (security measures) completed.</li>
          </ul>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Review Your DPA for Missing Article 28 Terms in 60 Seconds</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            DPAs signed with customers and with sub-processors frequently omit mandatory Article 28 terms, contain incomplete SCC modules, or use vague Annex II security descriptions that fail supervisory authority scrutiny. BizLegal AI scans your Data Processing Agreement for missing mandatory terms, incomplete SCC schedules, insufficient sub-processor provisions, and security measure annexes that don't meet EDPB adequacy standards.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Data Processing Agreement →
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
            <Link href="/regulations/gdpr" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR Compliance Hub →</Link>
            <Link href="/guides/gdpr-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR Checklist for SaaS →</Link>
            <Link href="/guides/privacy-policy-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Privacy Policy Compliance →</Link>
            <Link href="/guides/india-dpdpa-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>India DPDPA Guide →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Compliance Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. GDPR compliance requirements are jurisdiction-specific and fact-specific. The appropriate DPA structure, SCC modules, and sub-processor provisions for your situation depend on your processing activities, data flows, and the jurisdictions involved. Consult qualified data protection counsel before finalizing any DPA.
          </p>
        </footer>

      </main>
    </>
  )
}
