import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Payment Processing Compliance Guide (2025): Visa/Mastercard Rules, Chargebacks, High-Risk Merchants | BizLegal AI',
  description: 'Payment processing compliance for fintech and SaaS companies: Visa and Mastercard network rules, chargeback threshold enforcement (1% Visa, 1.5% Mastercard), high-risk merchant categories, payment facilitator vs merchant of record, PCI DSS scope, FinCEN MSB registration triggers, and acceptable use policy enforcement.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/payment-processing-compliance-guide' },
  openGraph: {
    title: 'Payment Processing Compliance Guide (2025) — BizLegal AI',
    description: 'Visa and Mastercard chargeback thresholds, high-risk merchant category codes (MCCs), why Stripe and PayPal deplatform businesses, payment facilitator vs merchant of record legal liability, PCI DSS SAQ scope, FinCEN MSB registration for payment companies, and cross-border payment regulatory requirements.',
    url: 'https://bizlegal-ai.com/guides/payment-processing-compliance-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What are Visa and Mastercard chargeback thresholds and what happens when you exceed them?',
    a: 'Chargebacks are transaction reversals initiated by cardholders through their issuing bank, typically alleging unauthorized transactions, non-delivery, or misrepresentation. Card networks set maximum chargeback ratios; merchants that exceed them enter formal remediation programs. Visa chargeback thresholds: (1) Visa Dispute Monitoring Program (VDMP): triggers at 100+ chargebacks/month AND 0.9% chargeback-to-transaction ratio. At this level, Visa notifies the acquiring bank. (2) Visa High Chargeback Monitoring Program (VHCMP): triggers at 100+ chargebacks/month AND 1.8%+ ratio — or a chargeback count that Visa deems excessive. Mastercard chargeback thresholds: (1) Excessive Chargeback Merchant (ECM): 1.5% monthly chargeback ratio AND 100+ chargebacks. (2) High Excessive Chargeback Merchant (HECM): 3.0%+ monthly ratio AND 300+ chargebacks. Consequences for merchants who exceed thresholds: (a) Month 1-2 (VDMP/ECM threshold): network notifies acquirer; acquirer contacts merchant with a remediation plan requirement. No fines yet. (b) Month 4+ (continued non-compliance): networks impose monthly fines on the acquirer, which are passed to the merchant: Visa: $25,000/month (VDMP); $75,000/month (VHCMP); Mastercard: $500/month for first month exceeding ECM threshold, escalating to $25,000/month by month 6+. (c) Long-term non-compliance: placement on the MATCH list (formerly Terminated Merchant File, TMF) — a Mastercard blacklist shared with acquirers. A MATCH listing follows a business for 5 years and makes it nearly impossible to obtain merchant account processing. Visa maintains a separate "Global Merchant Chargeback Monitoring Program" (GMCP) with similar blacklisting consequences. How the chargeback ratio is calculated: Chargeback ratio (%) = (number of chargebacks in month / number of transactions in prior month) × 100. This calculation means high-volume months followed by a slow month with high chargebacks are particularly dangerous — the denominator drops while chargebacks from the prior active period arrive. Common causes of high chargebacks in SaaS/fintech: friendly fraud (customer received service, disputes anyway), auto-renewal chargebacks (customer forgot they subscribed), confusing billing descriptors (customer doesn\'t recognize the company name), unclear refund policies, and subscription-model consumer confusion.',
  },
  {
    q: 'What is the difference between a payment facilitator (PayFac) and a merchant of record (MoR), and what does each imply for legal liability?',
    a: 'Payment facilitator and merchant of record are distinct models for structuring payment processing, and the choice has major implications for regulatory liability, tax obligations, and chargebacks. Payment Facilitator (PayFac): a payment facilitator is a company that aggregates payment processing for sub-merchants under a master merchant account. Instead of each sub-merchant getting their own direct relationship with an acquiring bank, the PayFac holds the acquiring agreement and processes on behalf of sub-merchants. Examples: Stripe, Square, Braintree. How it works: (1) The PayFac holds the acquiring bank relationship. (2) Sub-merchants onboard through the PayFac (subject to the PayFac\'s underwriting and KYC). (3) Transactions flow through the PayFac\'s master merchant account and are settled to sub-merchants (with a cut to the PayFac). Legal liability implications: (a) The PayFac is liable to the card networks for all chargeback and fraud losses from its sub-merchants — it cannot pass this liability fully to sub-merchants contractually. (b) The PayFac must maintain its own risk management and sub-merchant monitoring programs. (c) The PayFac may be regulated as a money services business (MSB) in states where it holds funds during settlement. (d) Card network registration: a company acting as a PayFac must register with both Visa and Mastercard as a payment facilitator and agree to network compliance requirements. Becoming a registered PayFac requires significant capital, compliance infrastructure, and ongoing network oversight. Merchant of Record (MoR): a merchant of record is a company that assumes full legal responsibility for a transaction — it appears as the merchant on the cardholder\'s statement, assumes all liability for chargebacks and refunds, and handles sales tax collection and remittance. Examples: Paddle, LemonSqueezy (software MoR), FastSpring (digital goods). How it works: (1) The MoR sells the product directly to the end customer (legally). (2) The software company sells to the MoR at a wholesale price. (3) The MoR handles all customer billing, tax collection, chargebacks, and customer service for payments. Legal liability implications: (a) The MoR bears all chargeback liability; the underlying software company sees no chargebacks. (b) The MoR is responsible for sales tax collection and remittance in all applicable jurisdictions (economic nexus rules). (c) The underlying company\'s revenue recognition is based on the net amount received from the MoR (not gross revenue), which has ASC 606 accounting implications. (d) The MoR relationship means the software company is not operating as a payment processor or MSB for regulatory purposes. Trade-offs: PayFac gives more control over the payment experience, lower per-transaction costs at scale, and direct relationship with customers — but requires significant compliance investment. MoR eliminates compliance overhead (chargebacks, tax, card network rules) but costs more per transaction (typically 5-15% of GMV) and removes the direct customer billing relationship.',
  },
  {
    q: 'What are high-risk merchant categories and why do payment processors terminate accounts?',
    a: 'Payment networks and processors classify merchants by Merchant Category Codes (MCCs) — 4-digit codes that describe the type of business. Certain MCCs are designated as "high-risk" by the card networks, and many processors either refuse to work with high-risk merchants or charge significantly higher processing rates. Common high-risk MCCs: (1) MCC 5912/5122 — Drug stores, pharmacies, drug sales (even legal online pharmacies face extreme scrutiny); (2) MCC 7801/7802 — Online gambling (most major processors decline); (3) MCC 7995 — Betting establishments, online casinos, sports wagering; (4) MCC 6211 — Securities brokers, stock brokers; (5) MCC 6012 — Financial institutions (some categories); (6) MCC 5999 — Miscellaneous retail stores (a catch-all sometimes misused); (7) Adult content (VISA/MC have specific prohibited content rules); (8) Nutraceuticals, supplements, weight loss (high chargeback history industry-wide); (9) Travel services (high chargebacks, COVID effects); (10) Credit repair, debt consolidation services; (11) Multi-level marketing; (12) Firearms and ammunition sales (controversial but not per se prohibited — many state-regulated legal). Why processors terminate merchant accounts: (a) Chargeback ratios: the #1 cause of termination. Exceeding thresholds (1.5%+ for Mastercard, 1%+ for Visa) triggers acquirer action. (b) Acceptable use policy violations: every processor (Stripe, PayPal, Braintree, etc.) has an Acceptable Use Policy (AUP) that prohibits specific industries and business models. Common AUP prohibitions: adult content, firearms, pharmaceuticals without appropriate licensing, cryptocurrency (variable by processor), certain financial products, tobacco, gambling. Operating in a prohibited category and getting caught leads to immediate account termination. (c) Fraud rates: high decline rates (cards declined at checkout) or velocity fraud patterns (multiple cards tried rapidly) trigger risk algorithms. (d) Suspicious activity: unusual spikes in volume, unusual geographic distribution, or patterns that match money laundering typologies trigger manual review and potential termination. (e) Regulatory action: if a regulatory body issues an action against the merchant (cease and desist, license suspension), processors typically terminate. Legal protection for terminated merchants: processors have broad contractual discretion to terminate accounts "for cause" or sometimes even "without cause" under their terms of service. The contracts are largely non-negotiable for SMB merchants. Options for terminated merchants: (a) Dispute the termination through the processor\'s appeals process; (b) apply to processors that specialize in high-risk merchants (high-risk acquirers who charge 3-8% per transaction instead of the standard 2.9%); (c) use a payment facilitator that explicitly supports the relevant category; (d) structure the business differently (e.g., use a merchant of record service). If terminated and placed on MATCH, engaging a payments attorney to challenge the MATCH listing (grounds: merchant was listed in error; chargeback ratios were below threshold at termination) is an option — successful challenges are possible but difficult.',
  },
  {
    q: 'When does a payment company trigger FinCEN MSB registration and what does it require?',
    a: 'The Bank Secrecy Act (BSA), administered by FinCEN, requires businesses engaged in money transmission — receiving money for transmission — to register as Money Services Businesses (MSBs) and comply with federal AML/KYC requirements. When payment processing triggers MSB status: a company is a "money transmitter" (and therefore an MSB) when it accepts money from one person and transmits it to another — regardless of whether the company holds funds for any period of time. Key FinCEN guidance on common scenarios: (1) PayFacs: a company that aggregates payments from sub-merchants and receives funds on their behalf before remitting net proceeds is generally a money transmitter if it does not fall within an exemption. (2) Payment processors: a company that provides "clearance and settlement services" only (without ever holding funds in its own name) may qualify for the "payment processor" exemption from MSB registration, IF: (a) the company facilitates the purchase of goods or services (not money-to-money transfers); (b) operates through a clearing and settlement system that admits only BSA-regulated financial institutions; (c) the entity is not in the business of transmitting money. The Stripe/PayPal model fits this exemption in most interpretations (they act through regulated banks and are themselves registered MSBs at the federal level). (3) Cryptocurrency: businesses that exchange cryptocurrency for fiat, transmit cryptocurrency, or facilitate peer-to-peer crypto transactions are almost universally money transmitters — both at the federal level (FinCEN) and under state money transmission laws. (4) Buy now pay later (BNPL): most BNPL providers are licensed as lenders, not money transmitters, but the regulatory treatment depends on the specific model and jurisdiction. Federal MSB registration requirements: any entity that IS an MSB must: (a) register with FinCEN (electronically, at fincen.gov — free, no fee) within 180 days of establishment; (b) develop and maintain a written AML program: internal controls, a designated compliance officer, ongoing training, and independent testing; (c) implement a Customer Identification Program (CIP) — collecting name, address, date of birth, and SSN/TIN for individuals; (d) file Suspicious Activity Reports (SARs) for suspicious transactions >$5,000 (or $2,000 for specific MSB types); (e) file Currency Transaction Reports (CTRs) for cash transactions >$10,000; (f) retain all records for 5 years. State money transmission licenses: separately from the federal MSB registration, 49 states (plus DC, Puerto Rico, US Virgin Islands) require a money transmitter license to transmit money to or from consumers in that state. This is the "50-state problem" for payment startups — you may need 50+ separate state licenses. Costs and timeline: state license applications require: application fees ($500-$5,000 per state); net worth requirements ($50,000-$1M+ per state); surety bonds ($50,000-$500,000 per state); compliance program documentation; state criminal background checks for principals. Total cost for all states: $500,000-$2M+ and 18-24 months to fully license. Most startups either (a) use a white-label licensed money transmitter as an infrastructure layer; (b) partner with a bank; or (c) operate through a regulated financial institution until they have the scale to license themselves.',
  },
  {
    q: 'What PCI DSS obligations apply to SaaS companies that process or handle payment card data?',
    a: 'PCI DSS (Payment Card Industry Data Security Standard) is a contractual standard (not a law) imposed by card networks (Visa, Mastercard, Amex, Discover) on any entity that stores, processes, or transmits cardholder data. Non-compliance creates contractual liability to acquirers (not criminal liability) — but fines and mandatory security improvements can be substantial. PCI DSS scope — what triggers compliance obligations: You are in scope for PCI DSS if you: (a) directly collect or process payment card numbers (PANs), CVVs, or magnetic stripe data; (b) store card data in any form (even encrypted); (c) handle or transmit any cardholder data as part of your payment flow; OR (d) your systems could impact the security of another entity\'s cardholder data (e.g., if you provide software that accesses cardholder data environments). Out-of-scope scenarios: if you use a payment processor (Stripe, Braintree) with an iFrame or hosted payment page, and you NEVER have server-side access to card data, you may qualify for limited PCI scope. PCI DSS levels and compliance requirements: (1) Level 1 merchants: >6 million transactions/year (Visa) or >6 million (Mastercard). Required: annual on-site assessment by a Qualified Security Assessor (QSA); quarterly network scans by an Approved Scanning Vendor (ASV); Report on Compliance (ROC). (2) Level 2 merchants: 1-6 million transactions/year. Required: annual Self-Assessment Questionnaire (SAQ) — completed internally; quarterly ASV scans; penetration testing annually. (3) Level 3 merchants: 20,000-1 million e-commerce transactions/year. Required: SAQ; quarterly ASV scans. (4) Level 4 merchants: <20,000 e-commerce transactions or up to 1 million total transactions/year. Required: SAQ; quarterly ASV scans (if required by acquirer). SAQ types for SaaS companies: the applicable SAQ depends on how you handle card data: (a) SAQ A (most limited scope): if you use a fully outsourced payment page (hosted by your processor) and never electronically store, process, or transmit cardholder data. 22 requirements. Lowest burden. (b) SAQ A-EP: if you have a partially outsourced payment page that makes direct connections to payment processors, but card data doesn\'t touch your servers. (c) SAQ C: if you use a payment application that connects directly to the internet, but don\'t store card data. (d) SAQ D: all other merchants — full 400-control compliance required. Most SaaS companies using Stripe Elements or Braintree\'s drop-in UI qualify for SAQ A, which has minimal compliance requirements. Key prohibited practices regardless of SAQ level: (a) Never store CVV2/CVC2/CID after transaction authorization (prohibited absolutely by all networks); (b) Never store full magnetic stripe data; (c) Never store unencrypted PANs. Violations of these prohibitions trigger immediate network audits and can result in fines of $5,000-$100,000/month imposed by networks on acquirers (passed to merchants).',
  },
  {
    q: 'What are the key cross-border payment regulatory requirements for SaaS companies selling internationally?',
    a: 'Cross-border payment compliance is one of the most underappreciated regulatory burdens for SaaS companies with international customers. The issues span currency control, sanctions screening, VAT/GST collection, local payment method requirements, and money transmission licensing in foreign jurisdictions. Key cross-border payment compliance obligations: (1) OFAC sanctions screening: US persons (including US companies and their subsidiaries) cannot transact with individuals or entities on OFAC\'s Specially Designated Nationals (SDN) list, Sectoral Sanctions Identifications list, or in comprehensively sanctioned countries (currently: Cuba, Iran, North Korea, Russia (some sectors), Syria, Venezuela (government), certain parts of Ukraine). Obligations: screen all customers against SDN lists before payment processing; block transactions to sanctioned countries; have a written OFAC compliance policy. Most major payment processors (Stripe, PayPal) perform automated screening, but companies with direct payment integrations bear independent screening obligations. Civil penalties for OFAC violations: up to $1,182,000 per transaction or twice the amount of the transaction, whichever is greater. Criminal penalties: up to $1M and 20 years in prison. Strict liability — knowledge is not required for civil penalties. (2) VAT/GST collection and remittance: the EU VAT rules (2021 One-Stop Shop OSS regime) require non-EU digital service providers selling to EU consumers to collect and remit VAT on digital services. Similar regimes exist in: UK (since Brexit, separate VAT registration or OSS equivalent); Australia (GST on low-value imports, 10%); Canada (GST/HST registration required for non-residents selling digital services above CAD $30,000/year); India (Equalization Levy/digital tax on certain digital services); many ASEAN countries with digital service tax regimes. (3) Foreign exchange control: some countries restrict conversion or repatriation of local currency. Key restrictions: India (FEMA — payments must flow through RBI-approved channels); China (SAFE regulations restrict cross-border currency flows); Brazil (tax on financial transactions when paying abroad — IOF tax); Nigeria, Egypt, Pakistan (Central bank restrictions on USD outflows). SaaS companies selling into these markets often cannot collect directly in local currency and must use approved payment partners. (4) Local payment method requirements: many markets require supporting local payment methods that are not credit/debit cards: Brazil: Boleto Bancário and PIX (instant payment) dominate. India: UPI (Unified Payments Interface) and Net Banking are dominant. China: Alipay and WeChat Pay (extremely difficult for foreign companies to integrate directly — typically requires a licensed Chinese payment intermediary). Mexico, Colombia: local bank transfers (SPEI, PSE). The Netherlands, Germany, Austria: iDEAL, Sofort/Klarna. (5) Data localization for payment data: India\'s RBI requires that all payment data of Indian users be stored exclusively in India (though cross-border transfers are permitted for processing, the data must return to India for storage). Russia had similar requirements. China\'s data localization requirements under PIPL and Cybersecurity Law affect payment data. Non-compliance with local payment data localization can result in regulatory action and suspension of payment processing licenses in those jurisdictions.',
  },
]

export default function PaymentProcessingComplianceGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Payment Processing Compliance Guide (2025): Visa/Mastercard Rules, Chargebacks, High-Risk Merchants',
    description: 'Payment processing compliance: chargeback thresholds (Visa VDMP/VHCMP, Mastercard ECM/HECM), payment facilitator vs merchant of record, high-risk MCCs, FinCEN MSB registration triggers, PCI DSS SAQ scope, and cross-border payment regulations.',
    url: 'https://bizlegal-ai.com/guides/payment-processing-compliance-guide',
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
      { '@type': 'ListItem', position: 3, name: 'Payment Processing Compliance', item: 'https://bizlegal-ai.com/guides/payment-processing-compliance-guide' },
    ],
  }

  const CHARGEBACK_TABLE = [
    { program: 'Visa VDMP', trigger: '0.9%+ ratio AND 100+ CBs/month', fineMonth4: '$25,000/month', fineMax: '$75,000/month (VHCMP)', consequence: 'MATCH listing, account termination' },
    { program: 'Visa VHCMP', trigger: '1.8%+ ratio AND 100+ CBs/month', fineMonth4: '$75,000/month', fineMax: '$75,000/month', consequence: 'MATCH listing, mandatory audit' },
    { program: 'Mastercard ECM', trigger: '1.5%+ ratio AND 100+ CBs/month', fineMonth4: '$500/month (month 1) → $25,000 (month 6+)', fineMax: '$25,000+/month', consequence: 'MATCH listing, account termination' },
    { program: 'Mastercard HECM', trigger: '3.0%+ ratio AND 300+ CBs/month', fineMonth4: '$25,000+/month immediately', fineMax: 'Escalating; termination', consequence: 'Immediate acquirer action' },
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
          Payment Processing Compliance Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Fintech Compliance
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          Payment Processing Compliance Guide (2025): Chargebacks, High-Risk Merchants, FinCEN MSB, and PCI DSS
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Exceeding Visa&rsquo;s 0.9% chargeback threshold for three months puts you in the Dispute Monitoring Program with $25,000 monthly fines. Operating as a payment aggregator without FinCEN MSB registration is a federal crime. Being placed on the MATCH list follows your business for 5 years and makes acquiring merchant accounts nearly impossible. These are not edge cases — they are the regulatory events that end payment businesses.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Card Network Chargeback Monitoring Programs</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Program</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Trigger</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Fine (Month 4+)</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Maximum Fine</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#dc2626' }}>Consequence</th>
                </tr>
              </thead>
              <tbody>
                {CHARGEBACK_TABLE.map(({ program, trigger, fineMonth4, fineMax, consequence }) => (
                  <tr key={program} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: '0.82rem' }}>{program}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, fontSize: '0.78rem' }}>{trigger}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, fontSize: '0.78rem' }}>{fineMonth4}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, fontSize: '0.78rem' }}>{fineMax}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, fontSize: '0.78rem', color: '#dc2626' }}>{consequence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your Payment Processing Agreement or Merchant Agreement for Compliance Gaps</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your payment processor agreement, payment facilitator agreement, or merchant services contract. BizLegal AI identifies whether your chargeback liability caps are clearly defined, whether your acceptable use policy carve-outs match your actual business model, whether FinCEN MSB registration requirements apply to your payment flows, whether OFAC screening obligations are correctly allocated, and whether your cross-border payment terms address local regulatory requirements.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Payment Agreement →
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
            <Link href="/guides/fincen-msb-registration-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>FinCEN MSB Registration Guide →</Link>
            <Link href="/guides/aml-kyc-compliance-crypto" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>AML / KYC Compliance →</Link>
            <Link href="/guides/pci-dss-compliance-guide-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>PCI DSS Compliance →</Link>
            <Link href="/guides/marketplace-tax-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Marketplace Tax Compliance →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. Payment processing regulations, card network rules, and money transmission licensing requirements change frequently. FinCEN interpretations, OFAC sanctions lists, and state money transmitter license requirements require ongoing monitoring. Consult a qualified payments compliance attorney before determining your regulatory obligations.
          </p>
        </footer>

      </main>
    </>
  )
}
