import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SaaS Vendor Agreement Review Guide: What to Check Before Signing (2025) | BizLegal AI',
  description: 'The 15 most dangerous clauses in SaaS vendor agreements: uncapped liability, unlimited data use rights, auto-renewal traps, IP assignment clauses, and unilateral price change rights — and how to negotiate each one.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/saas-vendor-agreement-review-guide' },
  openGraph: {
    title: 'SaaS Vendor Agreement Review Guide — BizLegal AI',
    description: 'Liability caps, data processing terms, auto-renewal clauses, IP ownership, and the 15 provisions every legal team should check before signing a SaaS contract.',
    url: 'https://bizlegal-ai.com/guides/saas-vendor-agreement-review-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What liability cap should a SaaS vendor agreement contain?',
    a: 'A liability cap limits the maximum amount one party can recover from the other for contract breaches, regardless of actual damages. Standard SaaS vendor positions and what you should push for: Vendor default (what they want): Liability capped at fees paid in the prior 12 months (or sometimes just 3 months). For low-cost SaaS tools ($500/month), this means your maximum recovery is $1,500-$6,000 even if the vendor causes a breach that costs you $500K in customer notifications, regulatory fines, and lost business. What you should negotiate: (1) Raise the multiplier: 6 months or 12 months of fees paid is more defensible than 3 months. Enterprise customers often negotiate 24 months or a fixed dollar floor (e.g., $500K minimum cap). (2) Carve-outs from the cap: Standard carve-outs that should not be subject to the cap include: indemnification obligations (IP infringement claims, third-party claims); willful misconduct and gross negligence; confidentiality breaches; data breach/security incident losses; and death/bodily injury claims. (3) Data breach-specific liability: If the vendor processes sensitive data (PII, financial data, health data), negotiate a separate, higher data breach liability cap — at minimum covering your regulatory fine exposure (GDPR max is 4% of global turnover), notification costs, and credit monitoring obligations. (4) Mutual caps: Ensure the liability cap runs both ways — you don\'t want unlimited liability for your payment obligations while the vendor\'s obligations are capped. Exceptions to mutual caps (vendor cannot limit): Vendors should not be permitted to limit liability for: privacy and data protection law violations; payment obligations; and indemnification for IP infringement of third-party intellectual property embedded in their product.',
  },
  {
    q: 'What data rights does a SaaS vendor typically claim over my data?',
    a: 'Data rights provisions in SaaS agreements are among the most consequential and most often overlooked clauses. The key terms to review: (1) Data ownership: The agreement should explicitly state that you (the customer) own your data and that the vendor acquires no ownership rights to your data by virtue of the agreement. "Customer Data" should be defined to include all data you upload, input, or generate through the service. (2) Permitted data uses: Many SaaS vendors include broad licenses to use customer data for product improvement, machine learning training, benchmarking, and analytics. These are often written as sweeping rights that allow the vendor to use your proprietary business data to improve services they sell to your competitors. Negotiate: restrict permitted uses to (a) providing the contracted service; (b) security and fraud prevention; and (c) anonymized/aggregated data for service improvement, with explicit prohibition on use of identifiable customer data for training AI models or creating derivative data products. (3) Data portability: Before signing, understand how you will export your data at contract termination — in what format, with what completeness, within what timeline, and at what cost. Many agreements are silent on portability or provide data only in proprietary formats that require significant work to migrate. (4) Data retention and deletion after termination: Specify a deletion timeline (30-60 days post-termination) and require written certification of deletion including backup copies. (5) Data location and cross-border transfers: If you process personal data of EU individuals, you need SCCs or another transfer mechanism for any data processing that occurs outside the EEA. Verify where the vendor\'s data centers are located and what sub-processors handle your data in which jurisdictions.',
  },
  {
    q: 'How do auto-renewal and price escalation clauses in SaaS contracts work?',
    a: 'Auto-renewal and price escalation are among the most commercially dangerous provisions for customers, and the most straightforward revenue-protection mechanisms for vendors. Auto-renewal mechanics: Standard SaaS agreements auto-renew for the same term (often 12 months) unless the customer provides written notice of non-renewal within a "cancellation window" — typically 30-90 days before the renewal date. In practice, customers miss cancellation windows routinely because (a) the contract anniversary passes unnoticed, (b) the primary contact who signed the agreement has left the company, or (c) the cancellation notice requirement is buried in a terms-of-service update. What to negotiate: (1) Shorter cancellation windows: Push for 30 days or less, not 60-90 days. (2) Advance renewal reminder obligation: Negotiate a requirement that the vendor provide written notice of the upcoming auto-renewal date at least 45-60 days before the cancellation window closes. (3) Mutual cancellation right: If the vendor increases price by more than X% (e.g., 5%), you should have the right to cancel without penalty on 30 days\' notice. Price escalation clauses: Many SaaS agreements permit vendors to increase pricing at renewal by a percentage tied to CPI, a flat escalator (e.g., 5-10% annually), or entirely at the vendor\'s discretion. Uncapped price escalation lets a vendor effectively renegotiate pricing annually with leverage created by switching costs. Negotiate: (1) Cap annual price increases at CPI or a fixed percentage (3-5%); (2) Require advance written notice of price increases before the cancellation window; (3) Grant customer a right to terminate without penalty if a price increase exceeds the cap.',
  },
  {
    q: 'What intellectual property clauses should I check in a SaaS vendor agreement?',
    a: 'Intellectual property provisions in SaaS agreements cover two distinct issues: (1) ownership of your work product created using the vendor\'s platform, and (2) the vendor\'s indemnification obligations for IP infringement claims. Work product ownership: If your team creates content, models, configurations, or other work product within the vendor\'s platform, the agreement should make clear that you own this work product. Many SaaS agreements include clauses where the customer grants the vendor a broad license to use work product created within the platform — sometimes including feedback, suggestions, and improvements. Negotiate: (a) You own all work product created using the vendor\'s service; (b) The vendor receives only a limited license to use that work product to provide the contracted service; (c) Feedback and suggestions you provide about the product do not give the vendor any additional IP rights. IP indemnification: If a third party claims that the vendor\'s software infringes their patent, trademark, or copyright, and you are using that software commercially, you have exposure as a downstream infringer. The vendor should indemnify you for third-party IP infringement claims arising from your permitted use of the service. Standard IP indemnification exclusions (which are reasonable): (a) modifications you made to the vendor\'s software; (b) combinations of vendor software with other software the vendor didn\'t specify; (c) use outside the permitted scope of the agreement. AI and machine learning provisions: If the SaaS product uses AI/ML, check whether: (a) the vendor trains its models on your data (data rights issue); (b) the vendor represents that AI-generated outputs are free of third-party IP infringement (most vendors explicitly disclaim liability for AI-generated content that turns out to infringe); and (c) the vendor\'s AI features comply with the EU AI Act if you\'re in the EU.',
  },
  {
    q: 'What uptime SLAs and service credits should a SaaS vendor agreement contain?',
    a: 'Service Level Agreements (SLAs) specify the vendor\'s commitment to availability, performance, and support responsiveness — and what remedies you receive when they fail to meet those commitments. Key SLA components: (1) Uptime commitment: Standard enterprise SaaS: 99.9% uptime (allows ~8.7 hours of downtime per year). For mission-critical or financial services: 99.99% (allows ~52 minutes per year). For most business applications: 99.9% is the industry standard. Verify how "uptime" is calculated: some vendors exclude planned maintenance windows, partial outages (where some features work but others don\'t), and degraded performance. Full transparency requires "uptime" to mean "all contracted features available and performing at contracted performance levels." (2) Measurement methodology: Understand how downtime is measured — vendor self-reported vs. third-party monitoring. Vendors sometimes measure availability at the infrastructure level (server is running) rather than the application level (user features are working). (3) Service credits: When the vendor fails to meet SLA commitments, service credits are the standard remedy. Typical vendor service credits: 10% of monthly fees for 99% uptime (10+ hours downtime/month); 20-25% for 95% uptime (36+ hours/month). These are intentionally low — they rarely cover actual business impact. Negotiate: (a) Higher credit percentages (25-50% for significant outages); (b) Remedies that escalate with severity of failure; (c) Termination right without penalty after a defined number of SLA failures within a rolling period (e.g., 2 SLA breaches in 6 months). (4) Exclusions: Standard SLA exclusions include force majeure, customer-caused outages, and scheduled maintenance. Verify maintenance windows are reasonable and communicated in advance. (5) Support response times: SLA should include response time commitments for different severity levels: P0/Critical (system down): 1-hour response, 4-hour resolution target; P1/High (major feature broken): 4-hour response; P2/Medium: 24-hour response.',
  },
  {
    q: 'What termination rights should a SaaS customer insist on?',
    a: 'Termination provisions in SaaS agreements govern when and how each party can end the contract. Customer-favorable termination rights to negotiate: (1) Termination for cause (standard): Either party should be able to terminate for material breach with a 30-day cure period. "Material breach" should be defined broadly enough to include: persistent SLA failures; security incidents caused by the vendor\'s negligence; unauthorized data use; change-in-control affecting service continuity; and price increases beyond the agreed cap. (2) Termination for convenience: Many SaaS agreements (especially annual or multi-year contracts) do not include a right to terminate for convenience — once you sign, you\'re locked in. Negotiate a right to terminate for any reason with 30-60 days\' notice and payment of fees through the termination date (not the remainder of the term). Avoid penalties for exercising this right. (3) Termination for change in control: If the vendor is acquired, you should have the right to terminate within a defined period (60-90 days) after the acquisition closes if the acquirer is a competitor or if the acquisition materially changes the service terms. (4) Effect of termination — data portability window: After termination, you need time to migrate your data. Negotiate at least 30-60 days of read-only access to export data after the contract end date, before the vendor deletes your data. Data export in standard formats (CSV, JSON, SQL) with no additional fee. (5) Survival provisions: Clauses that survive termination (confidentiality, IP ownership, data deletion obligations, dispute resolution) should be explicitly listed. A "survives termination" clause that sweeps in all vendor rights but excludes customer protections is a red flag. (6) Refund obligations: If you prepaid annual fees and terminate early for vendor breach, negotiate a prorated refund for unused prepaid fees.',
  },
]

export default function SaaSVendorAgreementGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'SaaS Vendor Agreement Review Guide: What to Check Before Signing (2025)',
    description: 'Liability caps, data rights, auto-renewal traps, IP ownership, uptime SLAs, and termination rights — the 15 provisions every legal team should negotiate in a SaaS vendor agreement.',
    url: 'https://bizlegal-ai.com/guides/saas-vendor-agreement-review-guide',
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
      { '@type': 'ListItem', position: 3, name: 'SaaS Vendor Agreement Review', item: 'https://bizlegal-ai.com/guides/saas-vendor-agreement-review-guide' },
    ],
  }

  const HIGH_RISK_CLAUSES = [
    { clause: 'Uncapped vendor liability', risk: 'Vendor can cause unlimited damage, limited recovery', action: 'Negotiate mutual cap + carve-outs' },
    { clause: 'Broad AI training data rights', risk: 'Vendor trains models on your proprietary data', action: 'Restrict to service delivery only' },
    { clause: 'Auto-renew with long cancellation window', risk: 'Locked into another year if you miss 90-day window', action: 'Require 30-day window + advance reminder' },
    { clause: 'Unilateral price escalation', risk: 'Vendor raises price 20%+ at renewal with leverage of switching costs', action: 'Cap at CPI or 5% + termination right' },
    { clause: 'No data portability on exit', risk: 'Data locked in proprietary format post-termination', action: 'Negotiate 60-day export window in standard formats' },
    { clause: 'IP ownership of work product', risk: 'Vendor claims rights to content/models created in their platform', action: 'Explicit customer ownership clause' },
    { clause: 'No vendor IP indemnification', risk: 'You face patent/copyright claims for vendor software you use', action: 'Mutual IP indemnification with standard carve-outs' },
    { clause: 'Venue = vendor\'s jurisdiction', risk: 'Disputes litigated in foreign state/country', action: 'Negotiate your jurisdiction or neutral venue' },
    { clause: 'No SLA service credits', risk: 'Vendor can miss 99.9% uptime with no financial consequence', action: 'Service credits + escalating remedies' },
    { clause: 'No termination for cause mechanism', risk: 'Stuck with a failing vendor for full contract term', action: 'Add cause termination + refund right' },
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
          SaaS Vendor Agreement Review
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Contract Risk
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          SaaS Vendor Agreement Review Guide: What to Check Before Signing (2025)
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Most SaaS contracts are drafted by the vendor's legal team to protect the vendor. Buyers sign them quickly, miss the auto-renewal window a year later, and discover uncapped liability exposure during a data breach. This guide covers the 10 highest-risk clauses in SaaS vendor agreements and what to negotiate in each one — before you're locked in.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>10 High-Risk SaaS Contract Provisions at a Glance</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
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
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Before You Negotiate: Know What You're Looking At</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            SaaS vendor agreements typically arrive as a bundle of documents. Understanding what controls what is the first step:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li><strong>Master Service Agreement (MSA) or Enterprise Agreement:</strong> The governing document controlling all commercial terms, liability, IP, and dispute resolution. This is the most negotiable document and where the highest-risk clauses live.</li>
            <li><strong>Terms of Service (ToS) / Terms and Conditions:</strong> For smaller vendors, often the entire agreement. May be clickwrap (you click "agree") rather than a signed document — still legally binding.</li>
            <li><strong>Data Processing Agreement (DPA):</strong> Required for EU personal data processing; specifies processor obligations, sub-processors, SCCs. Often a separate document attached as a schedule or addendum.</li>
            <li><strong>Order Form / Statement of Work (SOW):</strong> The commercial document specifying products, pricing, term, and volume. Terms in the Order Form often supersede the MSA — so favorable MSA terms can be undone by unfavorable Order Form language.</li>
            <li><strong>Service Level Agreement (SLA):</strong> Often attached as an exhibit; specifies uptime commitments, service credits, and support response times. The MSA usually limits remedies for SLA breach to service credits only — make sure the SLA is actually attached.</li>
            <li><strong>Acceptable Use Policy (AUP) and Privacy Policy:</strong> May be incorporated by reference from a URL that can change unilaterally. Ensure the version in effect at signing is attached as a static exhibit, not a live link.</li>
          </ul>
          <p style={{ lineHeight: 1.75, marginTop: '1rem', padding: '1rem', background: 'var(--color-bg-secondary, #f9fafb)', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
            <strong>Document hierarchy matters:</strong> Most SaaS MSAs include an "order of precedence" clause specifying which document controls in case of conflict. Ensure that negotiated Order Form terms take precedence over the standard MSA, and that the MSA takes precedence over any incorporated-by-reference policies the vendor can update unilaterally.
          </p>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your SaaS Vendor Agreement for High-Risk Clauses in 60 Seconds</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your SaaS vendor agreement and BizLegal AI identifies uncapped liability exposure, missing data portability provisions, auto-renewal traps, unfavorable IP clauses, and DPA compliance gaps — with plain-language explanations and negotiation guidance specific to each finding.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Vendor Contract →
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
            <Link href="/guides/gdpr-data-processing-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR DPA Guide →</Link>
            <Link href="/guides/soc2-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SOC 2 Compliance →</Link>
            <Link href="/guides/iso-27001-vs-soc2-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>ISO 27001 vs SOC 2 →</Link>
            <Link href="/guides/startup-compliance-program-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Startup Compliance Program →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Compliance Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. SaaS contract negotiation outcomes depend on the specific agreement, the vendor's flexibility, and your bargaining leverage. The provisions discussed in this guide are common patterns — not universal standards. Engage qualified commercial contract counsel for significant SaaS agreements and all enterprise software contracts.
          </p>
        </footer>

      </main>
    </>
  )
}
