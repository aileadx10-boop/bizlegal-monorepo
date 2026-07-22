import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SaaS Master Subscription Agreement Guide (2025): MSA Drafting for Vendors | BizLegal AI',
  description: 'How to draft a SaaS Master Subscription Agreement (MSA) that protects your company: limitation of liability sizing, indemnification carve-outs, data processing addendum requirements, SLA credit caps, auto-renewal terms, and the clauses enterprise legal teams redline most.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/saas-master-subscription-agreement-guide' },
  openGraph: {
    title: 'SaaS MSA Drafting Guide (Vendor Side) — BizLegal AI',
    description: 'Limitation of liability caps as % of ARR, mutual vs unilateral indemnification, DPA addendum requirements, SLA credit caps, enterprise redline targets, and how to structure auto-renewal and termination-for-convenience provisions.',
    url: 'https://bizlegal-ai.com/guides/saas-master-subscription-agreement-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What limitation of liability cap should a SaaS vendor use in its MSA?',
    a: 'The limitation of liability (LoL) cap is the ceiling on damages either party can recover from the other under the agreement. For SaaS vendors, this is one of the most commercially negotiated provisions. Standard starting positions for SaaS vendors: (1) Typical SaaS vendor cap: 12 months of fees paid (or committed) under the order form in the 12-month period preceding the claim. This is the most common starting position among commercial SaaS companies. Some vendors use "fees paid in the 3 months prior" — but this creates extreme asymmetry with multi-year enterprise contracts and will be redlined by sophisticated customers. (2) Enterprise vs SMB caps: for enterprise deals ($100K+ ACV), customers commonly push for "greater of 12 months of fees or $X" (often $1M, $2M, or the total contract value). Evaluate these requests against (a) your general liability insurance limits (typically $1-5M for mid-size SaaS companies), (b) the maximum foreseeable loss to the customer from your SaaS failure, and (c) whether the customer is taking on corresponding risk. (3) Mutual cap vs one-sided cap: many SaaS vendor templates cap only the vendor's liability, not the customer's. Enterprise customers will flag this as unfair and request a mutual cap at the same level. Accepting a mutual cap on the customer side is generally low-risk (customers rarely have a damages claim against vendors beyond the fees paid) and removes a significant negotiation friction point. (4) Carve-outs from the cap — what should NEVER be capped: (a) indemnification obligations for third-party IP infringement claims (because you're defending the customer against a patent or copyright lawsuit — the cost isn't correlated with your contract value); (b) death or personal injury caused by negligence (jurisdictions require this; most enterprise legal teams require it as well); (c) fraud or willful misconduct; (d) confidentiality breaches — this is more contested; many vendors exclude "unauthorized disclosure of confidential information" from the liability cap, which can create unlimited liability for a data breach if the customer\'s data is treated as "confidential information." Watch for this carve-out carefully. (5) SaaS-specific issue — uncapped data breach liability: if the MSA treats customer data as "confidential information" AND carves out confidentiality breaches from the liability cap, the vendor faces unlimited liability for a data breach. To close this gap, either (a) negotiate that only "material and intentional" confidentiality breaches are uncapped, or (b) add a specific data breach liability cap (often 2-3× annual fees) in the DPA addendum. This is a critical risk issue for any SaaS company handling regulated data.',
  },
  {
    q: 'How should SaaS vendors structure indemnification clauses in an MSA?',
    a: 'Indemnification provisions allocate third-party claim risk — they determine who defends and who pays when a third party sues one of the contracting parties. Unlike limitation of liability (which governs claims between the parties), indemnification governs third-party lawsuits. Standard SaaS MSA indemnification structure: (1) Vendor\'s indemnification of customer — what you (the vendor) agree to defend and pay for: (a) IP infringement indemnity (almost always required): if a third party sues the customer claiming that using your SaaS product infringes their patent, trademark, or copyright, you agree to defend the claim and pay any resulting damages and settlements. This is the core vendor indemnity. Scope matters: limit to "customer\'s use of the SaaS in accordance with the documentation and this agreement" — you should NOT be responsible for infringement claims arising from the customer\'s content, customer\'s modifications, or the customer combining your SaaS with other software you didn\'t approve. (b) Vendor\'s gross negligence or willful misconduct: you should be responsible for damages arising from your own intentional wrongdoing or gross negligence. Standard and not negotiable. (c) Vendor\'s violation of applicable law: likewise standard. (2) Customer\'s indemnification of vendor — what the customer agrees to defend and pay for: (a) Customer\'s data and content: the customer should indemnify you against third-party claims that the customer\'s data or content (the data they upload or process through your SaaS) violates third-party rights — IP rights, privacy rights, defamation, etc. (b) Customer\'s violation of the agreement: unauthorized use, exceeding permitted scope, violating acceptable use policies. (c) Customer\'s gross negligence or willful misconduct. (3) IP indemnity remedies — what the vendor can do instead of paying a judgment: (a) procure a license for the customer to continue using the infringing component; (b) modify the product to be non-infringing; or (c) terminate the order and refund prepaid fees. Always include these options — they prevent an injunction from shutting down your product while litigation is pending. (4) Conditions on the indemnity: standard conditions: (a) prompt written notice from the indemnified party; (b) sole control of the defense and settlement by the indemnifying party; (c) reasonable cooperation by the indemnified party. Red flag: if a customer insists on the right to approve settlements — this effectively prevents you from settling a patent claim and dramatically increases your exposure. Counter: "indemnified party may not unreasonably withhold approval of any settlement that does not impose obligations on or admit liability of the indemnified party." (5) The "concurrent negligence" problem: some customers request indemnification even for claims "arising from the agreement" broadly — this can include their own negligence or misuse. Reject; indemnification should be limited to the indemnifying party\'s conduct, not the other party\'s.',
  },
  {
    q: 'What SLA provisions do enterprise customers require, and how should vendors structure SLA credits?',
    a: 'A Service Level Agreement (SLA) defines the uptime commitment the vendor makes to the customer and specifies the remedies (typically "SLA credits" — fee reductions on future invoices) if those commitments are not met. Enterprise SaaS customers routinely require SLAs; B2B customers processing revenue-critical workflows will push for strict uptime tiers and meaningful credits. Standard SaaS vendor SLA structure: (1) Uptime measurement and definition: (a) "Monthly Uptime Percentage" = (total minutes in month − minutes of downtime) / total minutes in month × 100. (b) Critical: define what counts as "downtime" — many SaaS vendors define it as "the service is completely unavailable to all users" (not degraded performance, not slowness, not individual user issues). Enterprise customers often push for "degraded performance below [X response time threshold]" to count as downtime. (c) Exclusions from downtime (standard): scheduled maintenance windows (with advance notice, typically 48-72 hours); third-party infrastructure outages (AWS, Cloudflare, etc.) outside vendor\'s control — but sophistiated customers often reject this, arguing vendor chose the infrastructure; force majeure events; customer-caused outages (misconfiguration, exceeding API rate limits). (2) Uptime tiers and credit amounts: typical commercial SaaS tier: 99.9% monthly uptime (MUP) — approximately 43.8 minutes downtime/month maximum. Typical credit: 10% of monthly fee for downtime between 99.9% and 99.0% of MUP; 25% for 99.0% to 95.0%; 50% for <95.0%. Enterprise tier starting position (often demanded): 99.95% (approximately 22 minutes/month). Critical: cap SLA credits. Standard cap = 30-50% of monthly fees for that billing period. Without a cap, a month of substantial downtime could generate credits exceeding the monthly fee, creating theoretical unlimited credit accumulation. Some customers push for "a right to terminate without fee" after consecutive months of missed SLA — negotiate that this right triggers only after 3+ consecutive months of SLA failure, not a single month. (3) Credit as exclusive remedy: always include "SLA credits constitute customer\'s sole and exclusive remedy for service availability failures" — preventing the customer from claiming consequential damages for downtime beyond the credit. Enterprise customers will attempt to remove or limit this exclusion; hold the line on it because a major outage affecting an enterprise customer\'s business could otherwise expose you to unlimited consequential damages. (4) Status page requirement: enterprise customers routinely require that the vendor maintain a public status page (tools: Atlassian Statuspage, Instatus) with real-time service status and historical uptime data. This is operationally reasonable and should be accepted. Some require contractual commitments to post incident reports (RCA — root cause analysis) within 48 hours of major incidents. (5) Notification obligations: for planned maintenance, 48-72 hours advance notice is standard. For unplanned outages >30 minutes, initial notification within 30-60 minutes is commonly required. For major outages affecting availability for >4 hours, a post-incident report within 5 business days.',
  },
  {
    q: 'What auto-renewal and termination provisions should SaaS vendors include in their MSA?',
    a: 'Auto-renewal and termination provisions determine how the commercial relationship continues and ends. For SaaS vendors, these provisions affect predictable recurring revenue; for customers, they affect budget planning and vendor lock-in. (1) Auto-renewal provisions: standard structure: "Subscriptions automatically renew for successive one-year periods unless either party provides written notice of non-renewal at least [30/60/90] days before the then-current term end date." Key decisions: (a) Notice period for non-renewal: 30 days is minimum; 60 days is common for SMB; 90 days is common for enterprise. Longer notice periods give you time to negotiate retention before the customer walks. Some vendors use 90 days for annual contracts and 30 days for monthly. (b) Price increase on renewal: include the right to increase fees on renewal, either (i) at your discretion with advance notice (some customers will push for a cap — "not to exceed 5% above the prior-year fee") or (ii) tied to CPI. Without this, your SaaS pricing is effectively frozen. (c) Auto-renewal enforceability: some US states (California, New York, Illinois, among others) have "automatic renewal laws" that impose specific requirements for B2C agreements and some B2B agreements — including clear disclosure of auto-renewal terms and affirmative consent. For your B2B SaaS, ensure auto-renewal terms are clearly highlighted in the Order Form, not just buried in the MSA body. (2) Termination for cause: standard termination-for-cause provisions: (a) Either party may terminate if the other materially breaches the MSA and fails to cure within 30 days after written notice. "Material breach" is intentionally broad; some vendors enumerate specific trigger events (non-payment, violation of acceptable use policy, insolvency). (b) For non-payment specifically: SaaS vendors should include a right to suspend service (stop providing access without terminating the agreement) upon 10-15 days of non-payment, before escalating to termination. Suspension is often more commercially effective than immediate termination — it creates urgency to pay. (3) Termination for convenience: (a) Vendor-side: SaaS vendors typically do NOT include a vendor right to terminate for convenience on annual contracts — customers would rightfully object to paying for service the vendor can unilaterally cancel. For monthly contracts, 30 days\' notice for termination for convenience by either party is standard. (b) Customer-side: enterprise customers often push for a right to terminate for convenience with 30-90 days\' notice, with a pro-rata refund of prepaid fees for the unused period. Whether to accept depends on your cash flow model. A compromise: allow termination for convenience in Year 2+ of a multi-year agreement, but prohibit it in Year 1 to ensure minimum ARR is recognized. (4) Effect of termination — data portability and retention: critical provision for enterprise customers: how long does the customer have to export their data after termination? Standard: 30 days post-termination access to export data; thereafter, vendor has no obligation to retain customer data. Some enterprise customers require 60-90 days and SFTP export capability. Include: after the export window closes, you will delete or de-identify customer data "in accordance with vendor\'s standard data retention policy" — prevents creating indefinite retention obligations.',
  },
  {
    q: 'What data processing addendum (DPA) provisions must a SaaS vendor include for GDPR and CCPA compliance?',
    a: 'A Data Processing Addendum (DPA) — sometimes called a Data Processing Agreement — is the contract module required by GDPR Article 28 whenever a data controller (your SaaS customer) engages a data processor (you, if you process personal data on their behalf). For SaaS vendors serving EU customers or handling any EU personal data, a DPA is legally mandatory, not optional. Key DPA provisions for SaaS vendors: (1) Processor obligations under GDPR Article 28: your DPA must contractually bind you to: (a) process personal data only on documented instructions from the controller (the customer); (b) ensure personnel with data access are bound by confidentiality; (c) implement appropriate technical and organizational security measures (Article 32) — including encryption in transit and at rest, access controls, and breach detection; (d) engage subprocessors only with customer consent (or general written authorization with individual notice of new subprocessors); (e) assist the controller with data subject rights requests (access, deletion, portability, rectification) to the extent possible given the SaaS architecture; (f) assist with data protection impact assessments (DPIAs); (g) delete or return data upon contract termination; (h) provide audit rights and information to demonstrate compliance. (2) Subprocessor management: nearly all SaaS products engage subprocessors — cloud infrastructure (AWS, Google Cloud, Azure), monitoring tools (Datadog), CRM integrations, etc. Your DPA must: (a) list all subprocessors in an annex or link to a maintained webpage; (b) commit to notifying customers of new subprocessors with 10-30 days\' advance notice; (c) give customers the right to object to new subprocessors (in practice, customers have a right to terminate if they have a legitimate objection — not veto specific subprocessors arbitrarily). (3) Cross-border transfer mechanisms: if your SaaS transfers EU personal data outside the EU (e.g., to US-based infrastructure), your DPA must incorporate an approved transfer mechanism — either: (a) EU Standard Contractual Clauses (SCCs) 2021, Module 2 (Controller-to-Processor, C2P), as an annex to your DPA; (b) reference to EU-US Data Privacy Framework (DPF) if you are DPF-certified; or (c) adequacy decision (if your company is based in a country with an EU adequacy decision). For UK customers: incorporate the UK IDTA or the UK Addendum to the EU SCCs. (4) Security incident notification: GDPR Article 33 requires the processor (you) to notify the controller "without undue delay" after becoming aware of a personal data breach. Your DPA should commit to: notification within 72 hours of confirmed or suspected breach (shorter than the 72-hour controller-to-DPA timeline, because the controller needs time to make its own notification). Specify what the notification must include: nature of breach, approximate number of records, categories of data, likely consequences, and measures taken. (5) CCPA service provider agreement: for California personal information, your DPA (or a separate CCPA addendum) must include the four required "service provider" provisions: (a) you process the PI only for the business purposes specified in the agreement; (b) you will not sell or share the personal information; (c) you will not use the PI for your own commercial purposes; (d) you will comply with CCPA and assist with consumer rights requests.',
  },
  {
    q: 'What are the key enterprise MSA redline targets and how should SaaS vendors respond?',
    a: 'Enterprise legal teams at companies of significant size run standard "redline" processes on SaaS vendor contracts, targeting specific provisions they consider non-market or one-sided. Knowing where redlines typically land lets you pre-negotiate terms or prepare your responses. Most common enterprise MSA redline targets for SaaS vendors: (1) Limitation of liability — customer will push for: a higher cap (total contract value or 2× annual fees instead of 1× annual fees), uncapped liability for data breaches involving their data, uncapped liability for IP indemnification. Vendor response: accept the higher cap if it aligns with your insurance limits; push back on uncapped breach liability by adding a specific data breach liability cap in the DPA (2-3× annual fees is a commonly accepted compromise); resist truly unlimited liability for any scenario. (2) Indemnification scope — customer will push for: IP indemnification covering "any claim arising from use of the SaaS" (not just third-party IP claims), mutual indemnification without carve-outs, uncapped indemnification. Vendor response: limit IP indemnification to "third-party claims alleging that the SaaS, as provided and used in accordance with documentation, directly infringes any patent, copyright, or trademark"; include carve-outs for customer modifications, customer content, customer combinations; accept mutual indemnification but keep the scope limited and symmetric. (3) Termination for convenience — customer will push for: right to terminate at any time with 30 days notice and full pro-rata refund, no multi-year commitment. Vendor response: offer termination for convenience with 60-90 days notice after the first contract year; reject in Year 1 for multi-year commitments; for monthly contracts, accept. (4) Data security requirements — customer will push for: SOC 2 Type II audit rights (they want to receive your report annually), penetration testing reports, specific security controls (MFA, encryption requirements, incident response SLA), right to audit your security program. Vendor response: provide SOC 2 Type II report under NDA; offer to answer security questionnaires; resist on-site audits (offer virtual reviews instead); accept contractual commitments to maintain your existing security practices. (5) SLA enhancement — customer will push for: higher uptime targets (99.95% or 99.99%), larger credit percentages, termination right after consecutive months of SLA failures, exclusion of maintenance windows from uptime calculation. Vendor response: consider a separate Enterprise SLA addendum with enhanced terms at enterprise pricing; accept the termination right after 3+ consecutive months; negotiate maintenance window exclusions firmly (scheduled windows are the vendor\'s right to maintain the system). (6) Governing law and jurisdiction — customer will push for: their home state / country governing law, local courts, no arbitration clauses. Vendor response: for US customers, vendor-side governing law (your home state) is worth defending because it means disputes are governed by law your counsel knows; for enterprise global deals, Delaware law or New York law are frequently acceptable neutral choices; international customers may require mutual agreement on English-law governed by ICC or AAA arbitration as a neutral forum.',
  },
]

export default function SaaSMSAGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'SaaS Master Subscription Agreement Guide (2025): MSA Drafting for Vendors',
    description: 'How to draft a SaaS MSA that protects your company: limitation of liability sizing, indemnification carve-outs, DPA requirements, SLA credit caps, auto-renewal terms, and how to handle enterprise legal team redlines.',
    url: 'https://bizlegal-ai.com/guides/saas-master-subscription-agreement-guide',
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
      { '@type': 'ListItem', position: 3, name: 'SaaS MSA Guide', item: 'https://bizlegal-ai.com/guides/saas-master-subscription-agreement-guide' },
    ],
  }

  const CLAUSE_MATRIX = [
    { clause: 'Limitation of Liability', vendorDefault: '12 months fees paid', enterprisePush: '2× ACV or total contract value', landingZone: '12-18 months; uncap for fraud/willful misconduct', criticalRisk: 'Uncapped breach liability via confidentiality carve-out' },
    { clause: 'IP Indemnification', vendorDefault: 'Third-party IP claims only', enterprisePush: 'Any claim arising from use', landingZone: 'Third-party IP with carve-outs for customer content', criticalRisk: 'Failing to carve out customer modifications' },
    { clause: 'SLA Uptime', vendorDefault: '99.9% monthly', enterprisePush: '99.95% or 99.99%', landingZone: '99.9% standard; 99.95% enterprise addendum', criticalRisk: 'No credit cap → unlimited credit accumulation' },
    { clause: 'Auto-Renewal Notice', vendorDefault: '30 days', enterprisePush: '30 days, or waive auto-renewal entirely', landingZone: '60-90 days for annual; include price increase right', criticalRisk: 'No price escalation right → frozen pricing at renewal' },
    { clause: 'Termination for Convenience', vendorDefault: 'Not permitted on annual contracts', enterprisePush: '30 days notice, full pro-rata refund', landingZone: 'Available Year 2+ with 60 days notice; not Year 1', criticalRisk: 'Year 1 opt-out destroys committed ARR predictability' },
    { clause: 'DPA / Subprocessors', vendorDefault: 'DPA with pre-approved subprocessor list', enterprisePush: '10-day notice on new subprocessors; right to object', landingZone: '15-30 day notice; right to object (not veto)', criticalRisk: 'No DPA → GDPR Article 28 violation; transfer mechanism missing' },
    { clause: 'Audit Rights', vendorDefault: 'Annual SOC 2 report under NDA', enterprisePush: 'On-site security audits; penetration test reports', landingZone: 'SOC 2 + questionnaire; virtual audit; no on-site', criticalRisk: 'Binding on-site audit right creates operational burden' },
    { clause: 'Data Return/Deletion', vendorDefault: '30 days post-termination export window', enterprisePush: '90 days; specific export formats (SFTP, CSV)', landingZone: '60 days; self-serve export in platform is sufficient', criticalRisk: 'No defined window → indefinite retention obligation' },
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
          SaaS MSA Guide (Vendor)
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Contract Law
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          SaaS Master Subscription Agreement (MSA) Guide for Vendors (2025)
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Your SaaS MSA is not a formality — it determines what happens when something goes wrong. The limitation of liability clause decides whether a major outage costs you one month of fees or your entire company. The indemnification scope determines whether you defend a patent lawsuit brought against your customer. The DPA addendum determines whether you are violating GDPR Article 28 every time you process EU personal data. This guide covers the provisions that matter, from the vendor side.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>MSA Clause Negotiation Matrix</h2>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.8, marginBottom: '1.25rem' }}>Vendor default position → enterprise customer pressure → realistic landing zone → what happens if you get this wrong:</p>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Clause</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Vendor Default</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Enterprise Push</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Landing Zone</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#dc2626' }}>Critical Risk</th>
                </tr>
              </thead>
              <tbody>
                {CLAUSE_MATRIX.map(({ clause, vendorDefault, enterprisePush, landingZone, criticalRisk }) => (
                  <tr key={clause} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: '0.8rem' }}>{clause}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8, fontSize: '0.78rem' }}>{vendorDefault}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8, fontSize: '0.78rem' }}>{enterprisePush}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8, color: '#16a34a', fontSize: '0.78rem' }}>{landingZone}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8, color: '#dc2626', fontSize: '0.78rem' }}>{criticalRisk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your Customer MSA or Inbound Enterprise Redline for Risk</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your SaaS MSA template or an enterprise customer redline. BizLegal AI identifies whether your limitation of liability cap is exposed via the confidentiality carve-out, whether your IP indemnification has the required carve-outs for customer content and modifications, whether your DPA complies with GDPR Article 28 and includes EU SCCs for cross-border transfers, and whether your SLA credits are capped or potentially unlimited.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Customer MSA →
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
            <Link href="/guides/saas-vendor-agreement-review-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Vendor Agreement Review (Buyer Side) →</Link>
            <Link href="/guides/gdpr-data-processing-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR DPA Guide →</Link>
            <Link href="/guides/nda-review-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>NDA Review Guide →</Link>
            <Link href="/guides/contract-risk-analysis-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Contract Risk Analysis →</Link>
            <Link href="/guides/terms-of-service-guide-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Terms of Service Guide →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. SaaS Master Subscription Agreement terms depend on the specific commercial relationship, regulatory requirements applicable to customer data, and applicable jurisdiction. Consult a qualified commercial attorney before finalizing your MSA template or accepting enterprise customer redlines.
          </p>
        </footer>

      </main>
    </>
  )
}
