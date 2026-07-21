import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GDPR Compliance Checklist for SaaS Startups (2025)',
  description: 'Step-by-step GDPR compliance checklist for SaaS companies. Legal bases, privacy notices, data processor agreements, breach notification, and transfers outside the EEA.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/gdpr-compliance-checklist-saas' },
  openGraph: {
    title: 'GDPR Compliance Checklist for SaaS Startups (2025)',
    description: 'Practical GDPR checklist covering legal bases, DPAs, privacy notices, breach notification, and data transfer mechanisms for software companies with EU users.',
    url: 'https://bizlegal-ai.com/guides/gdpr-compliance-checklist-saas',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'Does GDPR apply to my SaaS company if we are not based in the EU?',
    a: 'Yes. GDPR applies to any organization that processes personal data of individuals in the EU, regardless of where the company is established. If you have EU users, you are subject to GDPR. This extraterritorial scope (Article 3) is one of the most important features of the regulation.',
  },
  {
    q: 'What is a legal basis for processing under GDPR?',
    a: 'Before processing any personal data, you need a valid legal basis under Article 6. The most common bases for SaaS: (1) Contract — processing necessary to perform a contract with the user; (2) Legitimate interests — your interests in operating the service outweigh user rights (must document the balancing test); (3) Consent — explicit, freely given, specific, informed consent that can be withdrawn.',
  },
  {
    q: 'Do I need a Data Processing Agreement (DPA) with my customers?',
    a: 'Yes, if your customers are businesses (B2B) and you process their users\' personal data on their behalf. Under Article 28, a DPA is mandatory whenever a data controller engages a data processor. As a SaaS company, you are typically a processor relative to your business customers, who are controllers. A DPA must be in place before you start processing.',
  },
  {
    q: 'What must I do if there is a data breach?',
    a: 'Under Article 33, if a personal data breach is likely to result in a risk to the rights and freedoms of individuals, you must notify the relevant supervisory authority within 72 hours of becoming aware of the breach. Under Article 34, if the breach is likely to result in a high risk to individuals, you must also notify those individuals without undue delay.',
  },
  {
    q: 'What are the GDPR fines?',
    a: 'There are two tiers: up to €10 million or 2% of total worldwide annual turnover (whichever is higher) for violations of administrative provisions such as processor requirements; and up to €20 million or 4% of total worldwide annual turnover for violations of core principles including lawfulness, data subjects\' rights, and international transfers. The 4% tier applies to the most serious violations.',
  },
  {
    q: 'Do I need a Data Protection Officer (DPO)?',
    a: 'A DPO is mandatory if you are a public authority, if your core activities involve large-scale systematic monitoring of individuals, or if you process special categories of data (health, biometric, etc.) on a large scale. Most B2B SaaS companies do not process special categories and are not public authorities, so a DPO is typically not required — but appointing one voluntarily or engaging a fractional DPO can help demonstrate accountability.',
  },
]

export default function GDPRSaaSGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'GDPR Compliance Checklist for SaaS Startups (2025)',
    description: 'Step-by-step GDPR compliance checklist for SaaS companies — legal bases, DPAs, privacy notices, breach notification, and cross-border data transfers.',
    url: 'https://bizlegal-ai.com/guides/gdpr-compliance-checklist-saas',
    publisher: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    author: { '@type': 'Organization', name: 'BizLegal AI' },
    inLanguage: 'en-US',
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
      { '@type': 'ListItem', position: 3, name: 'GDPR Compliance for SaaS', item: 'https://bizlegal-ai.com/guides/gdpr-compliance-checklist-saas' },
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
          GDPR for SaaS
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Compliance Guide
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          GDPR Compliance Checklist for SaaS Startups
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          If your software processes personal data of EU residents, GDPR applies — regardless of where your company is incorporated. This checklist covers what B2B and B2C SaaS companies need to have in place, from legal bases and privacy notices to processor agreements and breach notification.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Phase 1 — Establish Legal Bases for Processing</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Before processing any personal data, identify your legal basis under Article 6. You need a different basis for each processing activity, and you cannot switch bases freely after the fact.
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li>Map every processing activity to a legal basis: contract, legitimate interests, or consent</li>
            <li>For <strong>contract</strong>: processing must be strictly necessary to perform the contract — not merely convenient</li>
            <li>For <strong>legitimate interests</strong>: complete a Legitimate Interests Assessment (LIA) documenting your interests, the necessity of processing, and that your interests override user rights</li>
            <li>For <strong>consent</strong>: collect separately, unbundled from terms; record when/how consent was given; provide a mechanism to withdraw</li>
            <li>For processing special categories of data (health, biometric, political views): a second legal basis under Article 9 is also required</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Phase 2 — Privacy Notice and Transparency</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Articles 13 and 14 require clear, accessible privacy information provided at or before the time of collection.
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li>Identity and contact details of the controller (and DPO if applicable)</li>
            <li>Purposes and legal basis for each processing activity</li>
            <li>Legitimate interests pursued (if that is the basis)</li>
            <li>Recipients or categories of recipients (including subprocessors)</li>
            <li>Retention periods for each category of data</li>
            <li>All data subject rights, including the right to withdraw consent and to lodge a complaint with a supervisory authority</li>
            <li>Whether automated decision-making or profiling is used, and its logic and consequences</li>
            <li>For data not collected directly from the subject: the source</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Phase 3 — Data Processor Agreements</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Article 28 requires a binding Data Processing Agreement between every controller and every processor they engage. For B2B SaaS, this means:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9, marginBottom: '1rem' }}>
            <li><strong>Upstream:</strong> your customer is the controller; you (as SaaS provider) are the processor. You need a DPA with every business customer before processing their users' data.</li>
            <li><strong>Downstream:</strong> for every third-party tool you use that processes customer data on your behalf (AWS, Stripe, Intercom, Mixpanel) — you need to verify those vendors have GDPR-compliant DPAs available. Most major providers do; check their compliance documentation.</li>
          </ul>
          <p style={{ lineHeight: 1.75 }}>
            A DPA must specify: subject matter and duration of processing, nature and purpose, type of personal data, categories of data subjects, obligations and rights of the controller. It must prohibit subprocessing without prior authorization and require the processor to assist with data subject requests and breach notification.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Phase 4 — Data Subject Rights</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            GDPR grants individuals a set of rights you must be able to fulfill, typically within one month of receiving a request:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li><strong>Right of access (Art. 15):</strong> provide a copy of all personal data held about the individual, plus supplementary information</li>
            <li><strong>Right to rectification (Art. 16):</strong> correct inaccurate data without undue delay</li>
            <li><strong>Right to erasure (Art. 17):</strong> delete personal data in specified circumstances (consent withdrawn, data no longer necessary for the original purpose, etc.)</li>
            <li><strong>Right to data portability (Art. 20):</strong> provide data in a structured, machine-readable format where processing is based on consent or contract</li>
            <li><strong>Right to object (Art. 21):</strong> where processing is based on legitimate interests, individuals can object; you must stop unless you can demonstrate compelling legitimate grounds</li>
            <li><strong>Rights related to automated decision-making (Art. 22):</strong> if you make automated decisions with significant effects on individuals, specific rights and safeguards apply</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Phase 5 — Data Breach Response</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Every SaaS company needs a documented breach response procedure before a breach occurs:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li>Maintain an internal breach register documenting all breaches, even those not requiring notification</li>
            <li>Within 72 hours of becoming aware of a notifiable breach: notify the lead supervisory authority (typically in the country where you have your main EU establishment, or where affected individuals are located if you have no EU establishment)</li>
            <li>Notification must include: nature of the breach, categories/approximate number of individuals and records affected, contact details of DPO or other contact point, likely consequences, and measures taken or proposed to address the breach</li>
            <li>If the breach is likely to result in high risk to individuals: notify those individuals directly without undue delay</li>
            <li>Processors must notify controllers without undue delay upon becoming aware of a breach, enabling controllers to meet their own 72-hour window</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Phase 6 — International Data Transfers</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Transferring personal data outside the EEA is only permitted where an appropriate safeguard is in place:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li><strong>Adequacy decision:</strong> the EU Commission has recognized certain countries as providing adequate protection (UK under a bridging mechanism, Japan, Canada for commercial transfers, among others). The US has the EU-US Data Privacy Framework (DPF) — US companies can self-certify to receive adequacy treatment.</li>
            <li><strong>Standard Contractual Clauses (SCCs):</strong> the standard transfer mechanism for transfers to countries without an adequacy decision. You must use the 2021 EU SCCs and complete a Transfer Impact Assessment (TIA) for high-risk destinations.</li>
            <li><strong>Binding Corporate Rules:</strong> approved internal policies for international transfers within a corporate group; requires supervisory authority approval — typically impractical for startups.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Phase 7 — Records of Processing Activities (ROPA)</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Article 30 requires organizations with 250+ employees to maintain written records of processing activities. For smaller organizations, records are required if processing is likely to result in a risk to data subjects, if processing is not occasional, or if processing includes special categories of data.
          </p>
          <p style={{ lineHeight: 1.75 }}>
            In practice, most SaaS companies should maintain a ROPA regardless of size — it is the foundational accountability document, required in any regulatory investigation, and useful for managing data subject requests. A ROPA entry for each processing activity should include: purpose, legal basis, categories of data, categories of data subjects, recipients, retention periods, and any international transfers.
          </p>
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
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Review your vendor and customer agreements for GDPR gaps</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '1.25rem', opacity: 0.85 }}>
            DocAI scans DPAs, SaaS agreements, and privacy terms for missing GDPR provisions, incomplete processor clauses, and unlawful transfer mechanisms. $97 per contract, results in minutes.
          </p>
          <a
            href="https://docai.bizlegal-ai.com"
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
            Scan a Contract — $97
          </a>
        </section>

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

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p>This guide is for informational purposes only and does not constitute legal advice. GDPR is enforced differently across EU member states. Consult a licensed attorney or qualified DPO for advice specific to your situation.</p>
        </footer>
      </main>
    </>
  )
}
