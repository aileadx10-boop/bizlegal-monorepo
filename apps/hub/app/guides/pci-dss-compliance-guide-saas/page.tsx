import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'PCI DSS Compliance Guide for SaaS Startups (2025) | BizLegal AI',
  description: 'PCI DSS v4.0 scope reduction, SAQ eligibility, merchant level tiers, tokenization vs encryption, and what SaaS companies that use Stripe or Braintree actually need to do for payment card compliance.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/pci-dss-compliance-guide-saas' },
  openGraph: {
    title: 'PCI DSS Compliance Guide for SaaS — BizLegal AI',
    description: 'PCI DSS v4.0 merchant levels, SAQ self-assessment, scope reduction through tokenization, and the contracts every SaaS company needs with its payment processor.',
    url: 'https://bizlegal-ai.com/guides/pci-dss-compliance-guide-saas',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'Do I need PCI DSS compliance if I use Stripe, Braintree, or Adyen?',
    a: 'Yes, but your compliance burden is dramatically reduced. Using a PCI-certified payment processor (Stripe, Braintree, Adyen, Square) that handles all cardholder data means you are a Merchant, not a service provider storing raw card data. Your compliance scope shrinks to the SAQ A or SAQ A-EP pathway depending on how payment forms are integrated. SAQ A applies if you use an iFrame or redirect that takes the customer to the processor\'s page entirely — your environment never touches card data. SAQ A-EP applies if you use JavaScript that runs on your page to collect card data even if that data goes directly to the processor. Both are self-assessment questionnaires, not full audits. The critical question is whether your code, your servers, or your domain ever touches, stores, or transmits PAN (Primary Account Number) data. If not, the compliance obligation is real but manageable. If yes — even briefly, even in memory — you are in full PCI DSS scope and require a Qualified Security Assessor (QSA) for merchant levels 1-3, or full SAQ D for level 4.',
  },
  {
    q: 'What are the PCI DSS merchant levels and which one applies to my startup?',
    a: 'PCI DSS compliance requirements are tiered by transaction volume. Level 1: Over 6 million card transactions per year, OR any merchant that has suffered a data breach. Requires annual on-site audit by a Qualified Security Assessor (QSA) and quarterly network scans by an Approved Scanning Vendor (ASV). Level 2: 1-6 million transactions per year. Requires annual SAQ completion and quarterly ASV scans; some card brands also require QSA for Level 2. Level 3: 20,000–1 million e-commerce transactions per year. Requires annual SAQ and quarterly ASV scans. Level 4: Fewer than 20,000 e-commerce transactions per year, or up to 1 million total transactions. Requires annual SAQ and quarterly ASV scans; specific SAQ type depends on integration method. Most early-stage SaaS startups fall into Level 4. The SAQ type depends on your payment integration: SAQ A (iFrame/redirect, no card data ever touches your environment) is the lightest-touch and requires no penetration testing or vulnerability scanning. SAQ A-EP adds requirements around the scripts running on checkout pages. SAQ D is the most comprehensive and applies to merchants that store, process, or transmit cardholder data — effectively requires implementation of all 12 PCI DSS requirement domains.',
  },
  {
    q: 'What is PCI DSS v4.0 and when does it apply?',
    a: 'PCI DSS version 4.0 was published by the PCI Security Standards Council in March 2022, replacing PCI DSS v3.2.1. All organizations were required to transition to v4.0 by March 31, 2024 — v3.2.1 was officially retired on that date. PCI DSS v4.0 introduces several significant changes: (1) Customized implementation approach: Organizations can now demonstrate the intent of a requirement is met through alternative controls rather than following the defined approach prescriptively. This allows more flexibility for cloud-native and SaaS architectures. (2) New authentication requirements: Multi-factor authentication (MFA) is now required for all access to the cardholder data environment (CDE), not just remote access. (3) Targeted risk analysis: Periodic requirements now require a formal targeted risk analysis to determine how often that control should run. (4) New e-commerce requirements: Requirements 6.4.3 and 11.6.1 specifically address script management and tamper-detection for payment pages — these apply from March 31, 2025 and are particularly relevant for SaaS companies using JavaScript-based checkout integrations. (5) Updated cryptography requirements: Stronger cipher suite requirements, with explicit ban on TLS below 1.2 (TLS 1.3 recommended for new implementations). For SaaS startups, the most impactful changes are the JavaScript/script integrity requirements (which require inventory, justification, and integrity verification of all scripts on payment pages) and the expanded MFA requirement.',
  },
  {
    q: 'What is a PCI Merchant Service Agreement and what terms matter?',
    a: 'When you sign up with a payment processor (Stripe, Square, Braintree, PayPal, Adyen, etc.) or a merchant acquirer (your bank\'s payment processing arm), you sign a Merchant Service Agreement (MSA). This contract contains several PCI-specific provisions that warrant careful review: (1) PCI compliance attestation: You typically represent and warrant that you maintain PCI DSS compliance. If you suffer a breach while non-compliant, this triggers both a contract breach and significant financial exposure. (2) Chargeback liability: PCI non-compliance at time of breach shifts chargeback liability to you rather than to the card brand or issuing bank. (3) PCI non-compliance fees: Many processors charge monthly PCI non-compliance fees ($20-40/month) for merchants who don\'t complete their annual SAQ or provide an Attestation of Compliance (AoC). These fees are often buried in fee schedules. (4) Data breach liability: MSAs typically include indemnification clauses covering the card brands\' forensic investigation costs, card reissuance costs ($3-15 per card), and fines assessed by Visa/Mastercard. These can reach $5,000-$500,000+ per breach. (5) Scope of permitted activities: MSAs restrict the categories of transactions you can process — accepting cards for new business categories without notifying your processor is a violation. (6) Dispute resolution and venue: MSAs typically require binding arbitration. Review the governing law and arbitration venue clauses, particularly for international SaaS companies. BizLegal AI can scan your merchant service agreement for hidden PCI liability clauses, unfavorable indemnification terms, and missing compliance attestation requirements before you sign.',
  },
  {
    q: 'What is tokenization and how does it reduce PCI scope?',
    a: 'Tokenization is the replacement of sensitive cardholder data (primarily the Primary Account Number, PAN) with a non-sensitive surrogate value (a "token") that has no exploitable value outside the specific payment system that generated it. Proper tokenization is the single most effective way to reduce PCI DSS compliance scope for SaaS companies. How it works: The payment processor receives the card number, stores it in their secure vault, and returns a token (e.g., a UUID or random string) to your system. Your system stores the token, not the card number. For future charges (subscriptions, saved payment methods), you send the token to the processor and they retrieve the PAN from their vault to process the transaction. Your servers, databases, and logs never contain a PAN. PCI scope impact: If you use processor-issued tokens and never store, process, or transmit the actual PAN, your cardholder data environment (CDE) is dramatically reduced or eliminated. This can reduce your applicable SAQ from SAQ D (12 domains, 300+ controls) to SAQ A or SAQ A-EP (as few as 22 controls). Tokenization vs. encryption: Tokenization removes card data from your environment entirely. Encryption keeps the data in your environment but renders it unreadable without the key. Tokenization is preferable from a PCI scope perspective because it eliminates the data entirely — encryption still requires you to protect the encrypted data and the keys, keeping you in CDE scope. Important caveat: Not all "tokens" eliminate PCI scope. If you use a token format that contains embedded cardholder data, or if your system handles the card number before handing it to the processor, tokenization does not reduce scope.',
  },
  {
    q: 'What contracts does a SaaS company need with its sub-processors for PCI compliance?',
    a: 'If your SaaS product processes payments on behalf of other businesses (marketplace, billing platform, SaaS-for-payments model), you are classified as a Third-Party Service Provider (TPSP) under PCI DSS, not just a merchant. TPSPs have significantly more onerous compliance obligations: (1) Service Provider Level 1 or Level 2 designation: Service providers processing over 300,000 card transactions per year are Level 1 and require annual QSA audits and quarterly ASV scans. Below that threshold, Level 2 requires an annual SAQ D and quarterly scans. (2) Written agreements with all sub-processors: PCI DSS Requirement 12.8 requires you to maintain a documented list of all third-party service providers with access to cardholder data, and a written agreement with each that includes an acknowledgment of the service provider\'s PCI DSS responsibilities. (3) Annual confirmation of sub-processor compliance: Requirement 12.8.4 requires annual monitoring of each TPSP\'s PCI DSS compliance status — typically satisfied by obtaining their current Attestation of Compliance (AoC) or validated listing on the Visa/Mastercard TPSP registries. (4) Responsibility matrix: PCI DSS v4.0 Requirement 12.9.2 requires service providers to provide a documented responsibility matrix (sometimes called a Shared Responsibility Matrix) to their customers — detailing which PCI requirements the provider owns, which the customer owns, and which are shared. If you build on AWS, Azure, or GCP: Each cloud provider publishes their PCI Shared Responsibility Matrix specifying what they cover (physical security, hypervisor, network) and what you must cover in your deployment (OS hardening, application-level controls, encryption in transit and at rest).',
  },
]

export default function PCIDSSGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'PCI DSS Compliance Guide for SaaS Startups (2025)',
    description: 'PCI DSS v4.0 merchant levels, SAQ types, scope reduction through tokenization, and the payment processor contracts every SaaS startup needs to review.',
    url: 'https://bizlegal-ai.com/guides/pci-dss-compliance-guide-saas',
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
      { '@type': 'ListItem', position: 3, name: 'PCI DSS Compliance Guide', item: 'https://bizlegal-ai.com/guides/pci-dss-compliance-guide-saas' },
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
          PCI DSS Compliance
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Payment Security
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          PCI DSS Compliance Guide for SaaS Startups (2025)
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Every company that accepts card payments is subject to PCI DSS — the Payment Card Industry Data Security Standard. The version that matters now is PCI DSS v4.0. This guide covers what SaaS companies using Stripe, Braintree, or Adyen actually need to do, how tokenization eliminates most of your compliance burden, what your merchant service agreement says about breach liability, and when you need a formal QSA audit versus a self-assessment questionnaire.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>What PCI DSS Actually Is (and Who Enforces It)</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            PCI DSS is a contractual security standard, not a law. It was created and is maintained by the PCI Security Standards Council (PCI SSC), a body founded by American Express, Discover, JCB, Mastercard, and Visa. Compliance is required by your contracts with payment processors and card brands — not by a government regulator.
          </p>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            The enforcement mechanism is financial: card brands (Visa, Mastercard) assess fines against acquiring banks (your payment processor's bank) for PCI non-compliance among their merchants. Those fines flow downstream to you through your merchant service agreement. In the event of a card data breach while you were non-compliant, you bear liability for forensic investigation costs, card reissuance costs, and potential fines reaching $500,000 per incident.
          </p>
          <p style={{ lineHeight: 1.75 }}>
            State and federal law intersects in specific ways: a PCI non-compliant breach can constitute negligence under state data breach laws, trigger FTC enforcement under Section 5 (unfair or deceptive acts), and violate state consumer protection statutes in California (CCPA), New York (SHIELD Act), and others. The legal exposure layers on top of the contractual exposure.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>The 12 PCI DSS Requirement Domains (v4.0)</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '0.75rem' }}>
            PCI DSS v4.0 organizes requirements into 12 domains. The SAQ type you qualify for determines which domains apply to you in full, in part, or not at all:
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Req.</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Domain</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>SAQ A?</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1', 'Network security controls (firewalls, segmentation)', 'N/A'],
                  ['2', 'Secure configurations for all system components', 'N/A'],
                  ['3', 'Protect stored account data (encryption, retention)', 'N/A'],
                  ['4', 'Protect cardholder data in transit (TLS)', 'Partial'],
                  ['5', 'Protect systems with anti-malware', 'N/A'],
                  ['6', 'Develop and maintain secure systems and software', 'Partial (6.4.3, 11.6.1 for payment page scripts)'],
                  ['7', 'Restrict access by business need-to-know', 'N/A'],
                  ['8', 'Identify users and authenticate access', 'Partial'],
                  ['9', 'Restrict physical access to cardholder data', 'N/A'],
                  ['10', 'Log and monitor access to system components', 'N/A'],
                  ['11', 'Test security of systems regularly', 'Partial (11.6.1 tamper detection)'],
                  ['12', 'Policies and programs for information security', 'Partial'],
                ].map(([req, domain, saqA]) => (
                  <tr key={req} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{req}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8 }}>{domain}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8, color: saqA === 'N/A' ? '#6b7280' : '#1a56db' }}>{saqA}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ lineHeight: 1.75, fontSize: '0.9rem', opacity: 0.75 }}>
            SAQ A merchants using an iFrame or hosted payment page that touches no cardholder data are largely exempt from Requirements 1-5, 7-10. The new v4.0 Requirements 6.4.3 and 11.6.1 (script inventory and payment-page tamper detection) apply from March 31, 2025 — even for SAQ A merchants.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Scope Reduction: How to Minimize Your Compliance Burden</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '0.75rem' }}>
            The cardinal rule of PCI DSS compliance strategy: minimize cardholder data environment (CDE) scope. Every system that stores, processes, or transmits cardholder data (or is connected to systems that do) is in scope. The fewer systems in scope, the cheaper and simpler your compliance program.
          </p>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>Scope reduction tactics, in order of effectiveness:</p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li><strong>Use hosted payment pages or iFrames:</strong> If the card number is never transmitted through your domain or servers (customer goes directly to Stripe Checkout, PayPal, etc.), you achieve SAQ A scope. This is the highest-value architecture change available to most SaaS startups.</li>
            <li><strong>Implement processor-native tokenization:</strong> Replace all PAN references in your database with processor-issued tokens (Stripe Customer ID, Braintree payment method nonce). No PAN stored anywhere in your environment.</li>
            <li><strong>Network segmentation:</strong> Isolate the CDE from the rest of your network using firewalls and access controls. Systems outside the segmented zone are out of scope, reducing the attack surface subject to PCI requirements.</li>
            <li><strong>End-to-point encryption (P2PE):</strong> PCI-validated P2PE solutions encrypt card data from the point of interaction (terminal or browser) through to the processor, preventing any intermediate system from accessing PAN. P2PE validation by PCI SSC can reduce scope further than tokenization alone.</li>
            <li><strong>Delete what you don't need:</strong> Many merchants retain cardholder data far longer than needed. PCI DSS Requirement 3.2 requires implementing a data retention and deletion policy — deleting unnecessary historical card data is the fastest compliance win for merchants who have been operating for years.</li>
          </ul>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Review Your Merchant Service Agreement for Hidden PCI Liability in 60 Seconds</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Merchant service agreements, payment processor terms, and sub-processor contracts contain PCI indemnification clauses, breach liability caps, and non-compliance fee provisions that are easy to miss at signing but expensive after a breach. BizLegal AI scans your payment contracts for uncapped breach liability, unfavorable PCI attestation warranties, and missing responsibility matrices.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Payment Contracts →
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
            <Link href="/guides/soc2-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SOC 2 Compliance Checklist →</Link>
            <Link href="/guides/iso-27001-vs-soc2-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>ISO 27001 vs SOC 2 →</Link>
            <Link href="/guides/gdpr-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR Checklist for SaaS →</Link>
            <Link href="/guides/startup-compliance-program-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Startup Compliance Program →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Compliance Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. PCI DSS compliance requirements depend on your specific integration architecture, transaction volume, and contractual terms with payment processors. Consult a Qualified Security Assessor (QSA) for Level 1-3 merchant compliance programs, and review your merchant service agreement with qualified legal counsel before signing.
          </p>
        </footer>

      </main>
    </>
  )
}
