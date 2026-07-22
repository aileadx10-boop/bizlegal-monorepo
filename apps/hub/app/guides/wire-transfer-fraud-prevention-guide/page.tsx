import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Wire Transfer Fraud Prevention Guide (2025): Business Email Compromise (BEC), Vendor Impersonation, Legal Liability | BizLegal AI',
  description: 'Business Email Compromise (BEC) caused $2.9 billion in reported US losses in 2023 (FBI IC3 report). This guide covers the 5 BEC attack vectors used against finance teams, legal liability when wire transfers are fraudulently redirected, who bears the loss between banks and business customers under UCC Article 4A, vendor contract clauses that create impersonation risk, internal controls required to qualify for cyber insurance coverage, and how to notify law enforcement and initiate a Financial Fraud Kill Chain.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/wire-transfer-fraud-prevention-guide' },
  openGraph: {
    title: 'Wire Transfer Fraud Prevention Guide (2025) — BizLegal AI',
    description: 'BEC and wire fraud guide: 5 attack vectors, UCC Article 4A bank vs customer liability, vendor payment change protocols, cyber insurance BEC requirements, and the Financial Fraud Kill Chain.',
    url: 'https://bizlegal-ai.com/guides/wire-transfer-fraud-prevention-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What is Business Email Compromise (BEC), how does it work, and what are the 5 main attack vectors targeting finance teams?',
    a: 'Business Email Compromise (BEC) is a social engineering fraud scheme in which attackers impersonate a trusted party — a CEO, CFO, vendor, supplier, real estate attorney, or other party to a financial transaction — to deceive a company\'s finance, accounting, or legal team into initiating an unauthorized wire transfer. BEC is not primarily a malware or ransomware attack; it is a fraud scheme that exploits human psychology and business process gaps. The FBI\'s Internet Crime Complaint Center (IC3) 2023 Internet Crime Report identified BEC as the highest-loss crime type for US businesses: $2.9 billion in reported losses from over 21,489 complaints. The actual losses are substantially higher — many organizations do not report BEC fraud due to reputational concerns. BEC Attack Vector 1 — CEO/CFO Impersonation (Executive Fraud): an attacker spoofs or compromises the email account of a senior executive (CEO, CFO, president) and sends an urgent wire request to the finance team, often framing it as a confidential transaction (acquisition, settlement, regulatory payment) that must be processed immediately and without normal procedures. Common elements: "This is urgent and confidential — do not discuss with anyone else"; weekend or end-of-day timing when verification is harder; request to bypass normal approval processes. BEC Attack Vector 2 — Vendor/Supplier Payment Change: attackers impersonate a known vendor, supplier, or law firm. They send an email appearing to come from the vendor informing the company that the vendor\'s banking details have changed and that all future payments should be directed to a new account. The new account is a fraudster-controlled account. This is the highest-volume BEC variant. Common elements: reference to a real, existing vendor relationship; plausible business reason for the "change" (bank merger, restructuring, compliance requirement); urgency to update records before the next payment cycle. BEC Attack Vector 3 — Real Estate Transaction Hijacking: attackers monitor (through compromised email accounts at law firms, title companies, or real estate agents) an impending real estate closing. Shortly before closing, the attacker sends wiring instructions that replace the legitimate closing agent\'s account details with a fraudster-controlled account. The victim wires closing proceeds (often $500K-$5M for commercial transactions) to the fraudster. BEC Attack Vector 4 — Attorney/Legal Counsel Impersonation: attackers impersonate a company\'s outside counsel or a counterparty\'s attorney in connection with a pending legal matter, acquisition, or settlement. They request an urgent wire of settlement proceeds or deal funds, citing confidentiality and attorney-client privilege to discourage verification. BEC Attack Vector 5 — Payroll Diversion: attackers compromise an employee\'s email account and submit a request to the HR or payroll team to change the employee\'s direct deposit information to a new account (the attacker\'s account). This is a lower-value but high-volume BEC variant targeting individual payroll disbursements. Key characteristics across all variants: urgency, pressure to bypass normal procedures, requests for confidentiality, and last-minute timing to exploit closing deadlines or payment cycles.',
  },
  {
    q: 'Who bears the loss when a wire transfer is fraudulently redirected — the bank or the business customer — under UCC Article 4A?',
    a: 'The legal framework governing who bears the loss in a fraudulent wire transfer is primarily Uniform Commercial Code (UCC) Article 4A, which governs "funds transfers" — the movement of money by payment order through the banking system. Understanding UCC Article 4A is critical because the answer is often counterintuitive: the business customer (not the bank) typically bears the loss for authorized but fraudulently induced wire transfers. Core UCC 4A principle — the authenticated payment order: under UCC 4A § 202, a bank accepts liability for an erroneous payment order (e.g., a payment order sent to the wrong beneficiary due to a bank error). However, if the bank receives an authenticated payment order — one that passes the bank\'s agreed security procedures — the bank is not liable for losses resulting from that payment order even if it was fraudulently induced. This means: if a fraudster sends a payment order from your company\'s own authenticated channel (using compromised credentials), or if your company sends the payment order based on fraudulent instructions (BEC), the bank has no liability under UCC 4A because it correctly processed the authenticated order you sent. The loss falls on the party that initiated the fraudulent-but-authenticated payment order — your business. Exception 1 — Commercially Unreasonable Security Procedures (UCC 4A § 203): if the bank\'s security procedures are commercially unreasonable (i.e., inadequate relative to industry standards and the risk involved), and the fraudster exploited the inadequacy of the bank\'s procedures rather than the customer\'s own failure, the bank may bear the loss. This is a narrow exception; courts have found that banks that offer multi-factor authentication and call-back verification procedures satisfy the "commercially reasonable" standard. Exception 2 — Bank Processing Error: if the bank processes a payment to the wrong beneficiary or in the wrong amount due to the bank\'s own error (not the customer\'s instructions), UCC 4A allocates the loss to the bank. Exception 3 — Customer timely error discovery (UCC 4A § 505): customers have a limited right to recover erroneous payment orders if they detect and report the error promptly. However, this exception does not typically apply to BEC-induced fraud where the payment order was correctly executed as instructed. Practical implication for businesses: in most BEC cases, the bank correctly processed the authorized payment order your company sent based on fraudulent instructions. Your company bears the loss. Federal courts in multiple circuits have confirmed this allocation. Cyberinsurance (see below) and contractual rights against the fraudster (often uncollectable) are the primary recovery mechanisms. The only reliable protection is prevention — process controls that prevent fraudulent payment orders from being initiated in the first place.',
  },
  {
    q: 'What internal controls are required to prevent BEC wire fraud, and which of these do cyber insurance carriers require for coverage?',
    a: 'BEC prevention requires layered process controls targeting the specific moments in a payment process where fraudulent payment instructions can be introduced. These controls are not just best practices — many are now underwriting requirements for cyber insurance coverage of BEC losses. Prevention Control 1 — Dual control for all wire transfers: no single person can initiate AND approve a wire transfer. The person who enters the wire must be different from the person who approves it. This is the single most effective BEC prevention control and the most universally required by cyber insurers. Implementing dual control for exceptions ("CEO told me to bypass normal approvals") is critical — the CEO impersonation attack specifically targets the exception path. Prevention Control 2 — Callback verification for payment instructions and banking changes: all requests to change vendor banking details, payroll direct deposit information, or wire transfer destinations must be verified through an out-of-band phone call to a previously known number (not a number provided in the suspicious email). "Out-of-band" means a different communication channel — call the vendor's accounts receivable team at the number in your existing contracts or the company's public website, never at a number provided in the email requesting the change. This control defeats vendor impersonation attacks. Cyber insurers requiring this control: most major carriers (Coalition, Corvus, Chubb, Hiscox, Travelers, CNA) now require callback verification as a condition of BEC coverage. Some carriers will not cover BEC losses at all without evidence that callback verification was in place and bypassed. Prevention Control 3 — DMARC/DKIM/SPF email authentication: configure DMARC (Domain-based Message Authentication, Reporting & Conformance), DKIM (DomainKeys Identified Mail), and SPF (Sender Policy Framework) on your email domain with a policy of reject (p=reject) for DMARC. This prevents spoofed emails that appear to come from your own domain (CEO impersonation). It does not prevent vendor impersonation from compromised vendor email accounts. Prevention Control 4 — Multi-factor authentication on all email accounts: compromised email accounts (used in real estate hijacking and payroll diversion) require the attacker to have access to the email account. MFA prevents attackers from logging in with stolen credentials alone. Cyber insurance carriers universally require MFA on email as a baseline. Prevention Control 5 — Payment instruction verification policy (written policy): a written, enforced policy specifying: (a) wire transfers above $X require dual approval; (b) all banking detail changes require callback verification before implementation; (c) no exceptions to verification requirements regardless of seniority of requestor; (d) any pressure to skip verification procedures should be escalated to security/legal immediately. Prevention Control 6 — Training and phishing simulation: employees in finance, accounting, HR, and legal must receive regular BEC awareness training. Phishing simulation exercises (simulated BEC emails sent to employees) measure and build awareness. Cyber insurance discounts and coverage requirements: cyber insurers have materially tightened BEC underwriting since 2021. Common requirements for BEC coverage: (a) MFA on all email (Coalition requires this for any cyber coverage); (b) dual control on wire transfers; (c) callback verification policy (confirmed in underwriting questionnaire); (d) DMARC/DKIM/SPF implemented. BEC sublimits: even with these controls, many cyber policies impose a BEC sublimit (e.g., total policy limit $5M but BEC losses capped at $250K or $500K). Review your policy for BEC-specific sublimits.',
  },
  {
    q: 'What are the first 72 hours of response to a discovered BEC wire transfer fraud, and how does the Financial Fraud Kill Chain work?',
    a: 'When a BEC wire transfer fraud is discovered, speed is critical. The Financial Fraud Kill Chain (FFKC) is a program operated by the FBI and FinCEN (Financial Crimes Enforcement Network) that enables victim financial institutions to freeze and recover fraudulently transferred funds. Funds transferred internationally or converted to cryptocurrency are typically unrecoverable within days. Hour 0-4 — Immediate internal response: (1) Do not notify the fraudster. Do not respond to the fraudulent email or take any action that might alert the attacker. (2) Preserve all evidence: screenshot or download all related emails, attachments, and communications immediately. Do not delete anything. (3) Contact your bank immediately (same day, same hour). Call your bank\'s fraud/wire transfer department directly — use the number on your bank\'s website or your established bank contact, not any number in correspondence. Request: (a) a recall of the wire transfer; (b) a hold on the receiving account pending investigation. The sooner you call, the higher the recovery probability. Banks can contact the receiving bank and request a freeze. (4) Escalate internally to your CFO, general counsel, and CEO. Document the chain of events. Hour 4-24 — Law enforcement report (FBI/FinCEN FFKC): (1) File a complaint with the FBI IC3 (ic3.gov). Select the BEC/EAC category. (2) Contact your local FBI field office directly — do not rely solely on the online IC3 complaint. Call and state you are reporting an active BEC loss with a request for FFKC assistance. FFKC allows the FBI to contact the receiving bank directly and coordinate a freeze and return of funds. Recovery via FFKC is significantly more likely if initiated within 72 hours of the transfer, and especially within 24 hours. (3) FinCEN Financial Institution Helpline: if FFKC is warranted (the bank may initiate this), FinCEN coordinates across US financial institutions to identify and freeze accounts in the payment chain. Hour 24-72 — Legal and cyber insurance response: (1) Notify your cyber insurance carrier. Most policies require prompt notice of a cyber event. BEC is typically covered under a crime, social engineering, or funds transfer fraud module of a cyber policy. (2) Preserve the email thread and headers. Forward the original email to your IT team for header analysis — email headers reveal the true originating IP address and may reveal the spoofed/compromised account used. (3) If any funds have not yet cleared through the receiving bank: your attorney may be able to obtain an emergency TRO (temporary restraining order) in the jurisdiction of the receiving bank to freeze funds before they are withdrawn. This is time-sensitive and requires a court filing within hours. (4) Notify outside counsel for potential litigation and to advise on regulatory notification obligations. (5) If wire went outside the US: contact the Financial Crimes Enforcement Network and the international FFKC equivalent. Interpol\'s Stop-Payment Mechanism (I-GRIP) may be available for international transfers. Recovery statistics: FBI IC3 2023 data shows the FFKC has recovered over $433M since its inception. Recovery rate drops dramatically after 24-48 hours as funds are withdrawn or moved.',
  },
  {
    q: 'What vendor contract provisions create BEC impersonation risk, and how should payment clauses be drafted to reduce fraud exposure?',
    a: 'Vendor contracts and service agreements often contain provisions that unknowingly increase BEC risk — provisions that fraudsters actively exploit to make fraudulent payment instruction changes appear legitimate. Understanding these provisions and how to draft them more safely is an underappreciated component of BEC prevention. Risk provision 1 — Open-ended payment instruction change clauses: many vendor agreements allow either party to update banking details by written notice (email). A clause reading "either party may update its banking details by providing written notice via email" is exactly what BEC attackers exploit. A fraudster who has compromised or spoofed the vendor\'s email can send a "written notice" changing the account — and per the contract, this change is authorized. Safer drafting: payment instruction changes must be (a) provided in writing via email AND confirmed by verbal call to a pre-registered officer using a pre-registered phone number; (b) effective only after X business days\' notice (no same-day changes); (c) countersigned by an officer of the vendor entity. Risk provision 2 — Wire transfer as the only or default payment method: contracts that designate wire transfer as the exclusive or default payment method expose the full payment to BEC risk. ACH (Automated Clearing House) payments, checks, and virtual card payments are generally more resilient to BEC because they involve different process flows and verification steps. Safer drafting: specify multiple acceptable payment methods; require ACH as the default for recurring vendor payments (ACH has a multi-day clearing window during which unauthorized ACH debit reversals are available). Risk provision 3 — Indemnification clauses that do not address fraud: many vendor agreements have mutual indemnification clauses but do not address liability if a party\'s banking instructions are fraudulently compromised or impersonated. This leaves a gap: if a vendor\'s email is compromised and used to redirect your payment to a fraudster, who bears the contractual responsibility? Safer drafting: include a clause specifying that each party is responsible for safeguarding its own payment instruction communications, and that neither party bears liability to the other for a payment made in good faith reliance on authenticated instructions from the other party\'s compromised communication channel. Risk provision 4 — No payment instruction freeze period: contracts that allow immediate payment instruction changes create a specific BEC window. The payroll diversion attack exploits this: an HR team processes a "banking change" request and updates direct deposit immediately, then the next payroll cycle pays to the fraudster. Safer drafting: all banking detail changes require a freeze period of at least 2 business days before taking effect, during which the change is confirmed via a pre-registered phone number. Risk provision 5 — Closing and settlement wire instruction clauses in real estate and M&A agreements: purchase and sale agreements often specify that wiring instructions will be provided by the closing agent at or near closing. These clauses are exploited in real estate BEC. Safer drafting: the agreement should name the specific closing agent and require that all wiring instructions be confirmed verbally before funds transfer, regardless of any written instructions received. Include language: "Buyer is advised that fraudulent wire transfer attempts are common; Buyer shall independently verify all wiring instructions via telephone to the title company at the number provided in this Agreement (not any number in any electronic communication) before initiating any wire transfer."',
  },
  {
    q: 'What are the regulatory notification obligations after a BEC wire fraud, and does a BEC incident trigger GDPR, HIPAA, or state data breach notification requirements?',
    a: 'A BEC wire fraud incident may trigger regulatory notification obligations beyond the law enforcement report, depending on whether personal data was accessed or exfiltrated as part of or in connection with the fraud. Analyzing whether notification is required requires separating the two components of a BEC incident: (1) the financial fraud (wire transfer) and (2) any associated data access (email compromise, personal data exfiltration). Financial fraud notification — no mandatory federal reporting for most businesses: there is no general US federal requirement for businesses to notify customers or regulators about wire transfer fraud losses from BEC. However: (a) financial institutions (banks, broker-dealers, money services businesses): SEC Rule 17a-4 (recordkeeping), FinCEN SAR (Suspicious Activity Report) obligations apply to banks; financial institutions must file SARs for BEC incidents meeting the reporting thresholds. (b) public companies: if the BEC loss is material, SEC disclosure obligations may apply (including 8-K disclosure within 4 business days of discovery of a material cybersecurity incident under new SEC rules effective December 2023). (c) government contractors: federal contractors may have incident reporting obligations under FAR 52.239-1 or agency-specific requirements. Data breach notification — when the email compromise involves personal data: if the email account compromise in a BEC attack involved access to or exfiltration of personal data, the incident may trigger state data breach notification laws and GDPR/HIPAA notification: GDPR Article 33: if personal data of EU data subjects was accessed, controllers must notify the supervisory authority within 72 hours of becoming aware of the breach. GDPR Article 34: if the breach is likely to result in high risk to data subjects, affected individuals must also be notified without undue delay. If a vendor\'s email account was compromised and the compromised account contained personal data (customer names, payment details, health information), GDPR notification obligations may be triggered. HIPAA Breach Notification Rule (45 C.F.R. §§ 164.400-414): if a covered entity or business associate email account was compromised in a BEC attack and the account contained protected health information (PHI), the HIPAA Breach Notification Rule applies. Covered entities must notify affected individuals within 60 days and HHS, with larger breaches (>500 individuals in a state) requiring media notice. State data breach laws (50 states + DC): all US states have data breach notification laws triggered when personal information is accessed by an unauthorized party. If the compromised email account contained personal information (names, SSNs, financial account numbers, health information), state notification requirements apply. Timelines: 30-90 days depending on state. California (CCPA/CPRA) requires notice in the most expedient time possible and without unreasonable delay. New York SHIELD Act requires in the most expedient time possible. Practical approach after a BEC incident: (1) preserve the compromised email accounts and forensically analyze what data the attacker accessed; (2) involve legal counsel and a forensic firm to scope the data involved; (3) engage the cyber insurance carrier\'s breach response services (typically provided as part of the policy); (4) make the regulatory notification decision based on what personal data was actually compromised.',
  },
]

export default function WireTransferFraudGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Wire Transfer Fraud Prevention Guide (2025): Business Email Compromise (BEC), Financial Fraud Kill Chain, Legal Liability',
    description: 'BEC caused $2.9B in 2023 US losses. This guide covers the 5 BEC attack vectors, UCC Article 4A bank vs customer loss allocation, required internal controls, the 72-hour FFKC response, vendor contract BEC risk provisions, and regulatory notification obligations.',
    url: 'https://bizlegal-ai.com/guides/wire-transfer-fraud-prevention-guide',
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
      { '@type': 'ListItem', position: 3, name: 'Wire Transfer Fraud Prevention Guide', item: 'https://bizlegal-ai.com/guides/wire-transfer-fraud-prevention-guide' },
    ],
  }

  const BEC_MATRIX = [
    { attack: 'CEO/CFO Impersonation', target: 'Finance team', vector: 'Spoofed or compromised exec email', prevention: 'Dual control, out-of-band CEO verification, policy no-exception rule', redFlag: 'Urgency, confidentiality request, bypass of normal approval' },
    { attack: 'Vendor Payment Change', target: 'AP / Finance team', vector: 'Spoofed or compromised vendor email', prevention: 'Callback to pre-registered number, 2-day freeze period before change effective', redFlag: 'New account details in email, no verbal confirmation requested' },
    { attack: 'Real Estate Hijacking', target: 'Buyer / closing team', vector: 'Compromised attorney or title company email', prevention: 'Call title company at number in purchase agreement (not email)', redFlag: 'Last-minute wire instruction change before closing' },
    { attack: 'Attorney Impersonation', target: 'Finance / legal', vector: 'Spoofed or compromised law firm email', prevention: 'Verify via firm\'s main phone number, not email reply', redFlag: 'Urgency + privilege claim to skip verification' },
    { attack: 'Payroll Diversion', target: 'HR / Payroll team', vector: 'Compromised employee email', prevention: 'Callback to employee at known number, 2-day change hold', redFlag: 'Direct deposit change request, especially near payroll cycle' },
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
          Wire Transfer Fraud Prevention Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Financial Crime Prevention
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          Wire Transfer Fraud Prevention Guide (2025): Business Email Compromise (BEC), Bank vs Customer Liability, and the Financial Fraud Kill Chain
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Business Email Compromise caused $2.9 billion in reported US losses in 2023 — making it the highest-loss cybercrime category for businesses, surpassing ransomware. Unlike ransomware, BEC requires no malware: it exploits business processes and human trust. Under UCC Article 4A, the business that sends the fraudulently-induced wire bears the loss, not the bank. Prevention and a 72-hour kill-chain response are the only effective defenses.
        </p>

        <div style={{ padding: '1rem 1.25rem', background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '8px', marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
            <strong>Recovery window:</strong> Wire transfer fraud recoveries via the FBI Financial Fraud Kill Chain drop dramatically after 24 hours and are nearly impossible after 72 hours. If you discover a fraudulent wire, call your bank fraud line immediately — not after reading this guide. File an IC3 complaint and contact your local FBI field office the same day.
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>BEC Attack Types — Target, Vector, and Prevention</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '580px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Attack Type</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Primary Target</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Attack Vector</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Primary Prevention</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Red Flags</th>
                </tr>
              </thead>
              <tbody>
                {BEC_MATRIX.map(({ attack, target, vector, prevention, redFlag }) => (
                  <tr key={attack} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, verticalAlign: 'top' }}>{attack}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top' }}>{target}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top', opacity: 0.85 }}>{vector}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top', opacity: 0.85 }}>{prevention}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top', opacity: 0.75 }}>{redFlag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your Vendor Contracts for BEC-Risk Payment Clauses</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your vendor agreements, service contracts, real estate purchase agreements, or payment terms documents. BizLegal AI identifies payment instruction change clauses that can be exploited in vendor impersonation BEC attacks, flags wire transfer provisions that lack callback verification requirements, reviews whether the payment clause structure creates liability exposure if funds are fraudulently redirected, and surfaces provisions that should be strengthened to support cyber insurance coverage.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Vendor Agreement →
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
            <Link href="/guides/data-breach-response-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Data Breach Response Guide →</Link>
            <Link href="/guides/saas-vendor-agreement-review-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SaaS Vendor Agreement Guide →</Link>
            <Link href="/guides/payment-processing-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Payment Processing Compliance →</Link>
            <Link href="/guides/aml-kyc-compliance-crypto" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>AML/KYC Compliance Guide →</Link>
            <Link href="/guides/gdpr-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR Compliance Checklist →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. Wire fraud incidents require immediate legal counsel. UCC Article 4A analysis, cyber insurance coverage determinations, and regulatory notification obligations are highly fact-specific. BEC attack methods and recovery mechanisms change frequently. Consult qualified legal counsel and cyber incident response professionals immediately upon discovering a suspected BEC wire transfer fraud.
          </p>
        </footer>

      </main>
    </>
  )
}
