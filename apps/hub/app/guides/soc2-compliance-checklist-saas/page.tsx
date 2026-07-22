import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SOC 2 Compliance Checklist for SaaS Startups (2025)',
  description: 'What SOC 2 actually requires for SaaS companies. Trust Service Criteria, Type I vs Type II, evidence collection, audit timeline, and how to improve your compliance posture before an auditor arrives.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/soc2-compliance-checklist-saas' },
  openGraph: {
    title: 'SOC 2 Compliance Checklist for SaaS Startups (2025)',
    description: 'SOC 2 Type I and Type II requirements, the five Trust Service Criteria, what auditors actually look for, and how to prepare your SaaS product for the audit process.',
    url: 'https://bizlegal-ai.com/guides/soc2-compliance-checklist-saas',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What is SOC 2 and why do enterprise customers require it?',
    a: 'SOC 2 (Service Organization Control 2) is a voluntary audit standard developed by the American Institute of CPAs (AICPA) that evaluates how a SaaS company manages customer data. Enterprise buyers, particularly in financial services, healthcare, and regulated industries, require SOC 2 Type II reports before signing contracts because it provides independent evidence that your security and availability controls actually operate as described — not just that you have policies on paper. Without SOC 2, many enterprise deals stall or fail at the vendor security review stage.',
  },
  {
    q: 'What is the difference between SOC 2 Type I and Type II?',
    a: 'SOC 2 Type I evaluates whether your controls are designed appropriately at a single point in time. Type II evaluates whether those controls operated effectively over an observation period — typically 6 to 12 months. Enterprise customers almost universally require Type II because it demonstrates operational effectiveness, not just design intent. The path is typically: implement controls → get a Type I report (which can take 2–4 months) → run your controls for 6–12 months → complete a Type II audit.',
  },
  {
    q: 'Which of the five Trust Service Criteria are required for SOC 2?',
    a: 'Only Security (the "common criteria") is required for all SOC 2 reports. The other four criteria — Availability, Processing Integrity, Confidentiality, and Privacy — are optional and included based on what your customers need and what services you provide. Most SaaS companies include Security + Availability (because SLAs matter to customers) and often Confidentiality. Privacy is increasingly included for SaaS products that process personal data in regulated contexts. Processing Integrity is more relevant for transactional systems like payment processors.',
  },
  {
    q: 'How long does a SOC 2 audit take and what does it cost?',
    a: 'For most early-stage SaaS companies: 3–6 months to implement controls from scratch, 2–3 months observation for a compressed Type II (some auditors accept 3-month observation periods), plus 4–8 weeks for the auditor to issue the report. Total from zero to Type II report: 9–18 months. Cost varies significantly: readiness assessments $5–15K, Type I audit $15–30K, Type II audit $30–80K for a mid-size auditor. Automation platforms (Vanta, Drata, Thoropass, Secureframe) reduce cost by automating evidence collection and typically run $10–25K per year.',
  },
  {
    q: 'What evidence do SOC 2 auditors actually collect?',
    a: 'Auditors test your stated controls by reviewing evidence — policy documents, screenshots, system logs, vendor agreements, access reviews, and configuration exports. Common evidence types: access control reviews showing who has access to production systems and when access was provisioned/deprovisioned; change management logs showing code was reviewed and approved before deployment; vulnerability scan results and remediation tickets; incident response records; vendor security assessments; penetration test reports; encryption configuration screenshots; and background check records for employees with production access.',
  },
  {
    q: 'Can you share a SOC 2 report under NDA — or is it public?',
    a: 'SOC 2 reports are confidential and intended for distribution to specific parties — typically prospective enterprise customers under NDA, existing customers at annual review, and occasionally investors during due diligence. They are not public documents. Sharing a report with a prospective customer is standard practice and is not a security risk — the report describes control design and operating effectiveness, not your actual security vulnerabilities. A well-written SOC 2 report is a sales asset.',
  },
]

export default function SOC2GuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'SOC 2 Compliance Checklist for SaaS Startups (2025)',
    description: 'SOC 2 requirements, Trust Service Criteria, Type I vs Type II, evidence collection, and how to prepare your SaaS product for the audit process.',
    url: 'https://bizlegal-ai.com/guides/soc2-compliance-checklist-saas',
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
      { '@type': 'ListItem', position: 3, name: 'SOC 2 Compliance Checklist', item: 'https://bizlegal-ai.com/guides/soc2-compliance-checklist-saas' },
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
          SOC 2 Compliance
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Security & Compliance
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          SOC 2 Compliance Checklist for SaaS Startups (2025)
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          SOC 2 has become the de facto enterprise security standard for B2B SaaS. Enterprise security reviews increasingly require a Type II report before contracts are signed. This guide explains what SOC 2 actually requires, what auditors test, how long the process takes, and what to have in place before starting.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>What SOC 2 Is — and What It Is Not</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            SOC 2 is an attestation, not a certification. A certified public accountant (CPA) who is licensed by the AICPA reviews your controls and issues an opinion — a "report" — rather than issuing a certificate or badge. This distinction matters: there is no "SOC 2 certified" status. There are companies that have received an unqualified opinion (no significant exceptions) in a SOC 2 audit.
          </p>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            SOC 2 is not a legal requirement. Unlike HIPAA (US healthcare) or GDPR (EU data), no law requires SOC 2. The pressure comes from enterprise customers, not regulators. But that makes it practically mandatory for B2B SaaS companies selling to security-conscious buyers — financial services, healthcare tech, legal tech, HR tech, and government contractors.
          </p>
          <p style={{ lineHeight: 1.75 }}>
            SOC 2 is not ISO 27001. ISO 27001 is a certification of an information security management system (ISMS) issued by an accredited certification body. SOC 2 is an attestation by a CPA firm. Many companies pursue both — SOC 2 for US enterprise sales, ISO 27001 for EU and international enterprise sales.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>The Five Trust Service Criteria</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            SOC 2 is organized around five categories of control. Only Security is required for every report.
          </p>

          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Criterion</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Required?</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>What It Covers</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Who Needs It</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Security', 'Always required', 'Access controls, encryption, vulnerability management, incident response, change management', 'All SaaS companies'],
                  ['Availability', 'Optional', 'System uptime, performance monitoring, disaster recovery, business continuity', 'SaaS with SLA commitments'],
                  ['Processing Integrity', 'Optional', 'Complete, accurate, timely processing — inputs match outputs', 'Payment processors, financial systems'],
                  ['Confidentiality', 'Optional', 'Protection of designated confidential information throughout its lifecycle', 'SaaS handling trade secrets, legal data'],
                  ['Privacy', 'Optional', 'Collection, use, retention, disclosure of personal information per privacy notice', 'SaaS processing personal data under regulations'],
                ].map(([criterion, required, covers, who]) => (
                  <tr key={criterion} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{criterion}</td>
                    <td style={{ padding: '10px 12px', opacity: required === 'Always required' ? 1 : 0.7 }}>{required}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8 }}>{covers}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.75 }}>{who}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ lineHeight: 1.75, fontSize: '0.9rem', opacity: 0.7 }}>
            Most B2B SaaS companies start with Security + Availability. Adding Confidentiality is recommended for companies handling sensitive business data (legal documents, financial data, HR data).
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>SOC 2 Type I vs Type II: What You Actually Need</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Type I: A point-in-time assessment. The auditor reviews your control design and confirms that controls are suitably designed to meet the relevant Trust Service Criteria as of a specific date. Type I does not test whether controls operated effectively.
          </p>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Type II: An assessment over a period — typically 6 to 12 months. The auditor tests whether controls actually operated effectively throughout the observation period. This is the standard required for enterprise procurement.
          </p>
          <p style={{ lineHeight: 1.75 }}>
            Practical path for most SaaS companies: implement controls → get a Type I report (useful for early enterprise deals while the observation period runs) → complete Type II after 6–12 months of operating controls.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Core Controls: The SOC 2 Security Checklist</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            The Security criterion is organized under the COSO framework into categories called Common Criteria (CC). The following areas are where most SaaS companies have gaps:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li><strong>Access control:</strong> Role-based access to production systems; periodic access reviews (quarterly is the standard); immediate deprovisioning when employees leave; MFA enforced on all systems with customer data access</li>
            <li><strong>Change management:</strong> All code changes reviewed before merging; separate environments (dev/staging/prod); change approval workflow documented; no direct commits to production by individuals</li>
            <li><strong>Vulnerability management:</strong> Regular vulnerability scans of infrastructure; penetration test (annual minimum); documented remediation process with SLA tiers by severity; patch management policy</li>
            <li><strong>Incident response:</strong> Documented incident response plan; incident logging and classification; post-incident reviews; customer notification procedures and SLAs</li>
            <li><strong>Encryption:</strong> Data at rest encrypted (AES-256 or equivalent); data in transit encrypted (TLS 1.2+ minimum); key management policy; encryption of backups</li>
            <li><strong>Vendor management:</strong> Third-party vendor security assessments before contracting; vendor inventory with risk classification; BAA/DPA agreements in place for relevant vendors</li>
            <li><strong>Background checks:</strong> Employment background verification for employees with production access (required for SOC 2, not optional)</li>
            <li><strong>Security training:</strong> Annual security awareness training with completion tracking; phishing simulations for employees with privileged access</li>
            <li><strong>Monitoring and logging:</strong> Centralized log collection; alerts on anomalous access patterns; log retention policy (minimum 1 year is typical)</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Evidence Collection: What Auditors Actually Ask For</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            SOC 2 auditors do not take your word for it — they review evidence. Common evidence requests include:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li>Access control lists showing who has access to each production system, with provisioning/deprovisioning dates</li>
            <li>Pull request logs for the observation period showing code review approvals</li>
            <li>Vulnerability scan results and remediation tracking tickets</li>
            <li>Incident log for the observation period</li>
            <li>Employee onboarding records showing background check completion and security training completion</li>
            <li>Third-party vendor list with signed DPAs/security questionnaire responses</li>
            <li>Penetration test report with remediation evidence</li>
            <li>System configuration screenshots showing encryption settings, MFA enforcement, and logging configuration</li>
            <li>Backup and recovery test results</li>
          </ul>
          <p style={{ lineHeight: 1.75, marginTop: '1rem' }}>
            Compliance automation platforms (Vanta, Drata, Thoropass, Secureframe) connect to your cloud provider, code repository, HR system, and identity provider to collect this evidence automatically, which significantly reduces the manual effort during the audit.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>SOC 2 Audit Timeline</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { phase: 'Month 1–3', title: 'Readiness and implementation', detail: 'Gap assessment, policy writing, control implementation, evidence collection tool setup. Budget 3 months if starting from zero.' },
              { phase: 'Month 3–4', title: 'Type I audit (optional but recommended)', detail: 'Auditor reviews control design at a point in time. Report issued in 4–8 weeks. Can be shared with prospects while Type II runs.' },
              { phase: 'Month 4–15', title: 'Observation period for Type II', detail: 'Controls operate and evidence is collected. Minimum observation period: 3 months (some auditors); 6–12 months is more common and more defensible.' },
              { phase: 'Month 15–18', title: 'Type II audit and report', detail: 'Auditor conducts fieldwork (4–8 weeks), issues draft for management response, issues final report.' },
            ].map(({ phase, title, detail }) => (
              <div key={phase} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.45, minWidth: '80px', paddingTop: '2px' }}>{phase}</div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{title}</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.75, lineHeight: 1.6 }}>{detail}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            background: 'var(--surface, #f9fafb)',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: '12px',
            padding: '1.75rem',
            marginBottom: '3rem',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Know your compliance posture before the auditor arrives</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '1.25rem', opacity: 0.85 }}>
            LexAudit generates a Compliance Health Score across SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS, and CCPA — 60 signals evaluated monthly. Identify control gaps before your auditor does. $99/month, cancel anytime.
          </p>
          <a
            href="https://lexaudit.bizlegal-ai.com"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.75rem',
              background: 'var(--primary, #1a56db)',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.95rem',
            }}
          >
            Get Your Compliance Health Score — $99/mo
          </a>
        </section>

        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Review Your Vendor Agreements Before Your SOC 2 Audit</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            SOC 2 auditors test whether your vendor contracts require breach notification, data handling standards, and subprocessor controls under CC9.2. BizLegal AI scans your vendor MSAs and DPAs for the exact contractual gaps auditors flag — before the audit clock starts.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Vendor Agreements →
          </a>
        </div>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {FAQS.map(({ q, a }) => (
              <div key={q}>
                <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>{q}</p>
                <p style={{ lineHeight: 1.75, opacity: 0.85, margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--surface, #f9fafb)', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
            Related: <a href="/guides/compliance-health-score-saas" style={{ color: 'var(--primary, #1a56db)' }}>Compliance Health Score for SaaS →</a> what the score measures and how to improve it before your auditor arrives
          </p>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '2rem', marginTop: '2rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1rem' }}>Related compliance resources</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <a href="/regulations/soc2" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SOC 2 Compliance Hub →</a>
            <a href="/guides/iso-27001-vs-soc2-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>ISO 27001 vs SOC 2 →</a>
            <a href="/guides/compliance-health-score-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Compliance Health Score →</a>
            <a href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Compliance Guides →</a>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p>This guide is for informational purposes only and does not constitute legal or audit advice. SOC 2 requirements, auditor interpretations, and industry expectations evolve. Engage a licensed CPA firm and legal counsel for advice specific to your situation.</p>
        </footer>
      </main>
    </>
  )
}
