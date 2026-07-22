import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contract Risk Analysis Guide: 7 Red Flags in Every Vendor Agreement (2025) | BizLegal AI',
  description:
    'Unlimited liability, unilateral modification, missing SLA remedies, auto-renewal traps. The 7 contract clauses that destroy startups — and what to do when you find them.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/contract-risk-analysis-guide' },
  openGraph: {
    title: 'Contract Risk Analysis Guide: 7 Red Flags in Every Vendor Agreement (2025)',
    description:
      'The 7 contract clauses that destroy startups — unlimited liability, perpetual data licenses, auto-renewal traps, and more — plus a 12-point pre-signing checklist.',
    url: 'https://bizlegal-ai.com/guides/contract-risk-analysis-guide',
    type: 'article',
  },
}

interface RedFlag {
  id: number
  clause: string
  where_found: string
  risk: 'critical' | 'high' | 'medium'
  what_it_says: string
  why_it_hurts: string
  what_to_ask_for: string
}

interface ContractType {
  name: string
  primary_risks: string[]
}

interface ChecklistGroup {
  category: string
  items: string[]
}

interface Faq {
  q: string
  a: string
}

const RED_FLAGS: RedFlag[] = [
  {
    id: 1,
    clause: 'Unlimited Liability Carve-Out',
    where_found: 'DPAs, SaaS MSAs with GDPR riders, data processing addenda',
    risk: 'critical',
    what_it_says:
      '"In no event shall either party be liable… except that Vendor\'s liability for breaches of its data protection obligations shall be unlimited."',
    why_it_hurts:
      'Your carefully negotiated liability cap (typically 12 months of fees) becomes meaningless for data breach claims. A single GDPR enforcement action or class action arising from a vendor breach can create unlimited exposure on your balance sheet.',
    what_to_ask_for:
      'Cap all liability — including data breach — at the greater of (a) 12 months of fees paid or (b) the amount covered by the vendor\'s applicable cyber insurance policy. Require proof of coverage.',
  },
  {
    id: 2,
    clause: 'Unilateral Contract Modification',
    where_found: 'SaaS click-through agreements, API terms of service, developer platform terms',
    risk: 'high',
    what_it_says:
      '"Provider may update these Terms at any time by posting revised Terms to its website. Continued use of the Service constitutes acceptance of the revised Terms."',
    why_it_hurts:
      'Your agreed-upon commercial terms — pricing, data rights, acceptable use, SLAs — can change mid-contract without renegotiation or notice. You may find yourself bound to materially different terms than what you signed.',
    what_to_ask_for:
      'Require written notice of material changes at least 30 days before they take effect, with a right to terminate without penalty if you do not accept. Enterprise agreements should lock terms for the committed term.',
  },
  {
    id: 3,
    clause: 'Missing SLA Remedy',
    where_found: 'SaaS MSAs, enterprise software agreements, infrastructure contracts',
    risk: 'high',
    what_it_says:
      '"Provider will use commercially reasonable efforts to achieve 99.9% monthly uptime. Customer\'s sole remedy for SLA failure is a service credit equal to 10% of monthly fees."',
    why_it_hurts:
      'A credit against future invoices is not a real remedy. If the service is down for 48 hours and you have contractual obligations to your own customers, a 10% monthly credit does not cover your losses or give you the right to exit.',
    what_to_ask_for:
      'SLA remedies should escalate: first-tier credit, then termination right for repeated failures (e.g., three or more failures in any 12-month period), and a right to financial reimbursement for documented downstream losses when the breach is material.',
  },
  {
    id: 4,
    clause: 'Perpetual Data License Grant-Back',
    where_found: 'AI feature addenda, training data clauses, analytics and platform agreements',
    risk: 'critical',
    what_it_says:
      '"Customer hereby grants Provider a perpetual, irrevocable, worldwide, royalty-free license to use, reproduce, modify, and create derivative works of Customer Data to improve Provider\'s products and services."',
    why_it_hurts:
      'Your proprietary data, customer data, confidential business information, and trade secrets may be permanently licensed to the vendor with no ability to reclaim it — even after you terminate. This has triggered material disputes in fintech and healthcare SaaS and may conflict with your own customer agreements.',
    what_to_ask_for:
      'Delete the grant-back entirely or limit it strictly to anonymized, aggregated, non-identifiable data. Include an explicit statement that no license to Customer Data is granted for model training or product improvement.',
  },
  {
    id: 5,
    clause: 'Intellectual Property Assignment Trap',
    where_found: 'Developer platforms, AI code assistants, low-code/no-code tools, consulting agreements',
    risk: 'critical',
    what_it_says:
      '"All work product, code, configurations, or outputs created using the Platform (\"Output\") are owned by Provider and licensed to Customer on a limited, non-exclusive, non-transferable basis."',
    why_it_hurts:
      'Code you build on their platform — including your product\'s core functionality — may be owned by the vendor, not you. You may be licensing, not owning, your own product. Acquirers and investors will flag this immediately in due diligence.',
    what_to_ask_for:
      'Outputs and work product created by Customer using the Platform must be owned by Customer. Require an explicit IP assignment or work-for-hire provision covering all Customer-created outputs, with Vendor retaining no license.',
  },
  {
    id: 6,
    clause: 'Auto-Renewal with Short Notice Window',
    where_found: 'Enterprise SaaS, annual software licenses, multi-year managed service agreements',
    risk: 'high',
    what_it_says:
      '"This Agreement automatically renews for successive 12-month periods unless Customer provides written notice of non-renewal at least 90 days prior to the end of the then-current term."',
    why_it_hurts:
      'Missing a 90-day cancellation window locks you into another year of spend — often $50,000 to $200,000+ for enterprise software. Finance teams typically flag renewals only 30 days out, long after the window has closed.',
    what_to_ask_for:
      'Negotiate the notice window down to 30 days. Add a calendar alert obligation on Vendor\'s side to notify you 90 days before auto-renewal. Consider negotiating the right to terminate with 30 days notice at any time during the term with a pro-rata refund.',
  },
  {
    id: 7,
    clause: 'Uncapped Indemnification Obligation',
    where_found: 'Data processing agreements, API terms, platform agreements, SaaS MSAs',
    risk: 'critical',
    what_it_says:
      '"Customer shall indemnify, defend, and hold harmless Provider and its affiliates from and against any and all third-party claims, losses, damages, and expenses (including reasonable attorneys\' fees) arising from or related to Customer\'s use of the Service."',
    why_it_hurts:
      'If a regulator, your customer, or a data subject sues because of how you used the vendor\'s service, you may be required to fund the vendor\'s entire legal defense with no cap — even if the underlying problem was the vendor\'s security failure or product defect.',
    what_to_ask_for:
      'Cap Customer\'s indemnification obligation at the same amount as Vendor\'s liability cap (e.g., 12 months of fees). Carve out indemnification for claims arising from Vendor\'s own negligence, product defects, or security failures. Require mutual indemnification.',
  },
]

const CONTRACT_TYPES: ContractType[] = [
  {
    name: 'SaaS Master Service Agreement (MSA)',
    primary_risks: [
      'Liability cap asymmetry (Vendor caps own liability; Customer indemnification is uncapped)',
      'IP ownership ambiguity for Customer-created configurations',
      'Data rights grant-backs buried in AI or analytics feature clauses',
      'Auto-renewal with 60–90 day notice windows',
    ],
  },
  {
    name: 'Data Processing Agreement (DPA)',
    primary_risks: [
      'Unlimited liability carve-outs for data breach indemnification',
      'Sub-processor approval clauses that allow unilateral additions',
      'Audit rights limited to third-party certifications only (no direct audit)',
      'Breach notification windows exceeding 72 hours (GDPR non-compliant)',
    ],
  },
  {
    name: 'Enterprise Software License',
    primary_risks: [
      'True-up provisions that trigger unannounced invoices for usage overages',
      'Export control provisions that restrict where you can deploy or use the software',
      'Audit rights allowing Vendor to inspect your systems on short notice',
      'Seat limits that restrict legitimate concurrent users without clear definition',
    ],
  },
  {
    name: 'API Terms of Service',
    primary_risks: [
      'Rate limit SLA remedies limited to credits (no termination right)',
      'Deprecation notice periods of 30 days or less (insufficient for migration)',
      'No data portability or export right on termination',
      'Unilateral right to modify rate limits, pricing, or access without consent',
    ],
  },
  {
    name: 'Consulting / Professional Services',
    primary_risks: [
      'IP assignment clauses that give Vendor ownership of deliverables',
      'Non-compete provisions that restrict your ability to hire talent',
      'Payment triggers tied to subjective acceptance criteria',
      'Work-for-hire clauses that conflict with your underlying platform license',
    ],
  },
]

const REVIEW_CHECKLIST: ChecklistGroup[] = [
  {
    category: 'Financial Risk',
    items: [
      'Liability cap: Is Vendor\'s liability capped at 12 months of fees? Does the cap exclude data breach claims (making it effectively unlimited)?',
      'Payment triggers: Are payment milestones defined by objective, measurable criteria — or subject to Vendor\'s discretion?',
      'Auto-renewal: What is the required notice period to cancel? Is it 30 days or 90 days? Is there a calendar reminder obligation?',
      'Price change mechanism: Can Vendor increase fees mid-term? By how much, with how much notice, and do you have a termination right if you reject the increase?',
    ],
  },
  {
    category: 'IP Risk',
    items: [
      'Data rights: Does Vendor receive any license to your data, including for training, analytics, or product improvement? Is that license limited to anonymized data?',
      'Output ownership: Who owns content, code, configurations, or outputs you create using the platform? Is there an explicit Customer ownership statement?',
      'Background IP: Is your pre-existing IP explicitly excluded from any assignment, license grant, or work-for-hire clause?',
    ],
  },
  {
    category: 'Compliance Risk',
    items: [
      'Data residency: Where is your data processed and stored? Does the contract specify jurisdictions and restrict transfers to non-adequate countries?',
      'Sub-processors: Do you have prior approval rights when Vendor adds or changes sub-processors? Can you object and terminate if you do?',
      'Audit rights: Can you (or your qualified auditors) directly audit Vendor\'s compliance controls — or are you limited to receiving third-party certifications?',
    ],
  },
  {
    category: 'Operational Risk',
    items: [
      'SLA remedy: Is the remedy for an SLA breach a meaningful financial credit or a termination right — not just a nominal credit against future invoices?',
      'Termination for cause: Can you terminate for material breach with a 30-day cure period? Is the definition of material breach objective or subject to Vendor\'s interpretation?',
    ],
  },
]

const FAQS: Faq[] = [
  {
    q: 'Do I need a lawyer to review every vendor contract?',
    a: 'You should have counsel review any agreement with: annual value over $25,000, data processing of personal information, intellectual property implications, or regulatory compliance obligations. For routine SaaS agreements under $10,000 per year, a systematic in-house review using a checklist can suffice — but GDPR Data Processing Agreements always need legal review regardless of value.',
  },
  {
    q: "What's the most dangerous clause in a SaaS agreement?",
    a: "The perpetual data license grant-back (Red Flag #4). It is often buried in AI feature clauses or training data provisions and can result in your proprietary data, customer data, or confidential business information being permanently licensed to the vendor with no ability to reclaim it — even after termination. This clause has caused material disputes in fintech and healthcare SaaS and may conflict with your own customer confidentiality obligations.",
  },
  {
    q: 'How long does a proper contract risk review take?',
    a: 'A thorough manual review of a standard SaaS MSA (15–30 pages) by experienced counsel takes 3–6 hours. DocAI\'s AI-assisted contract risk scan delivers a structured findings report in under 10 minutes — flagging all 7 red flag categories with clause location, severity rating, and suggested negotiation position for each finding.',
  },
  {
    q: "What is a 'limitation of liability' cap and why does it matter?",
    a: 'A liability cap sets the maximum amount one party can recover from the other in a dispute. Standard SaaS agreements cap Vendor liability at 12 months of fees paid. The danger: vendors often carve out unlimited liability for Customer\'s payment obligations while capping their own liability for service failures and data breaches. This asymmetry — and the specific carve-outs to the cap — is one of the most critical negotiation points in any SaaS agreement.',
  },
  {
    q: 'What should I do when I find a red flag?',
    a: 'Document the specific clause (page number and section reference), assess whether it is a dealbreaker vs. negotiable, and prepare a written counter-position with the specific language you want. Send a redline, not a verbal request. If the vendor refuses to negotiate on any of the 7 critical clauses above, that refusal is itself a risk signal — consider whether this vendor is the right long-term partner for your business.',
  },
]

const RISK_BADGE_STYLES: Record<RedFlag['risk'], React.CSSProperties> = {
  critical: {
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  high: {
    background: '#fff7ed',
    color: '#9a3412',
    border: '1px solid #fed7aa',
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  medium: {
    background: '#fefce8',
    color: '#854d0e',
    border: '1px solid #fde68a',
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
}

export default function ContractRiskAnalysisGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Contract Risk Analysis Guide: 7 Red Flags in Every Vendor Agreement (2025)',
    description:
      'Unlimited liability, unilateral modification, missing SLA remedies, auto-renewal traps. The 7 contract clauses that destroy startups — and what to do when you find them.',
    url: 'https://bizlegal-ai.com/guides/contract-risk-analysis-guide',
    datePublished: '2025-02-01',
    dateModified: '2025-07-22',
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
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Contract Risk Analysis Guide',
        item: 'https://bizlegal-ai.com/guides/contract-risk-analysis-guide',
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Breadcrumb */}
        <nav style={{ fontSize: '0.8rem', opacity: 0.55, marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'inherit' }}>Home</a>
          {' → '}
          <a href="/guides" style={{ color: 'inherit' }}>Guides</a>
          {' → '}
          Contract Risk Analysis Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Legal Operations Guide
        </span>

        {/* Hero */}
        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          Contract Risk Analysis Guide: 7 Red Flags in Every Vendor Agreement
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '1.5rem' }}>
          You signed the contract. Now read it. Most founders and GCs spend more time negotiating pricing than reviewing the clauses that actually determine who owns your data, what happens when the service goes down, and what you owe the vendor if a regulator comes knocking. The standard vendor agreement — whether it is a SaaS MSA, a DPA, or an API terms of service — is written by the vendor&rsquo;s lawyers for the vendor&rsquo;s benefit. Studies consistently show that over 70% of SMB technology contracts are signed without any substantive legal review.
        </p>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          This guide covers the seven clauses that cause the most material harm — unlimited liability, perpetual data licenses, auto-renewal traps, and more — plus a 12-point pre-signing checklist you can use before every vendor agreement.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        {/* Top CTA */}
        <section
          style={{
            background: 'var(--color-blue-50, #eff6ff)',
            border: '1px solid var(--color-blue-200, #bfdbfe)',
            borderRadius: '12px',
            padding: '1.75rem',
            marginBottom: '3rem',
          }}
        >
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', margin: '0 0 0.5rem' }}>
            Stop reviewing vendor contracts manually
          </h2>
          <p style={{ lineHeight: 1.7, marginBottom: '1.25rem', opacity: 0.85 }}>
            DocAI scans your SaaS agreements, DPAs, and vendor contracts for all 7 red flag categories — clause location, severity, and suggested negotiation position — in under 10 minutes.
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

        {/* Red Flags Section */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            7 Contract Clauses That Destroy Startups
          </h2>
          <p style={{ lineHeight: 1.75, opacity: 0.8, marginBottom: '2rem' }}>
            These clauses appear in standard form agreements from well-known vendors. They are not edge cases. If you have signed a SaaS agreement in the last three years, at least one of these is in a contract you are currently operating under.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {RED_FLAGS.map((flag) => (
              <div
                key={flag.id}
                style={{
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                {/* Card Header */}
                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--color-border, #e5e7eb)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '1.75rem',
                      height: '1.75rem',
                      borderRadius: '50%',
                      background: 'var(--color-border, #e5e7eb)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0,
                    }}
                  >
                    {flag.id}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>{flag.clause}</h3>
                      <span style={RISK_BADGE_STYLES[flag.risk]}>{flag.risk}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', opacity: 0.55, margin: 0 }}>Found in: {flag.where_found}</p>
                  </div>
                </div>

                {/* What it says */}
                <div style={{ padding: '1rem 1.5rem', background: 'var(--color-surface-alt, #f9fafb)', borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.55, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                    What it says
                  </p>
                  <p style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.83rem', lineHeight: 1.65, margin: 0, opacity: 0.8 }}>
                    {flag.what_it_says}
                  </p>
                </div>

                {/* Why it hurts + What to ask for */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                  <div
                    style={{
                      padding: '1rem 1.5rem',
                      background: 'var(--color-red-50, #fef2f2)',
                      borderRight: '1px solid var(--color-border, #e5e7eb)',
                    }}
                  >
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                      Why it hurts
                    </p>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{flag.why_it_hurts}</p>
                  </div>
                  <div
                    style={{
                      padding: '1rem 1.5rem',
                      background: 'var(--color-green-50, #f0fdf4)',
                    }}
                  >
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                      What to ask for
                    </p>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{flag.what_to_ask_for}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contract Types Section */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Know What to Look for in Each Contract Type
          </h2>
          <p style={{ lineHeight: 1.75, opacity: 0.8, marginBottom: '1.5rem' }}>
            Risk concentration varies by contract type. A DPA has different landmines than an API terms of service. Use this as a starting point for each category.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1rem',
            }}
          >
            {CONTRACT_TYPES.map((ct) => (
              <div
                key={ct.name}
                style={{
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                }}
              >
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>{ct.name}</h3>
                <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                  {ct.primary_risks.map((risk) => (
                    <li key={risk} style={{ fontSize: '0.83rem', lineHeight: 1.7, marginBottom: '0.25rem', opacity: 0.8 }}>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Checklist Section */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            12-Point Pre-Signing Checklist
          </h2>
          <p style={{ lineHeight: 1.75, opacity: 0.8, marginBottom: '1.5rem' }}>
            Run this checklist on every vendor agreement before you sign. Each item is a question to answer — not a box to tick without reading the contract.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {REVIEW_CHECKLIST.map((group) => (
              <div key={group.category}>
                <h3
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    opacity: 0.55,
                    marginBottom: '0.75rem',
                  }}
                >
                  {group.category}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {group.items.map((item) => (
                    <div
                      key={item}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          width: '1rem',
                          height: '1rem',
                          border: '2px solid var(--color-border, #d1d5db)',
                          borderRadius: '3px',
                          flexShrink: 0,
                          marginTop: '0.15rem',
                        }}
                        aria-hidden="true"
                      />
                      <p style={{ fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mid-page CTA */}
        <section
          style={{
            background: 'var(--surface, #f9fafb)',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: '12px',
            padding: '1.75rem',
            marginBottom: '3rem',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Get a structured contract risk report in 10 minutes
          </h2>
          <p style={{ lineHeight: 1.7, marginBottom: '1.25rem', opacity: 0.85 }}>
            DocAI scans your vendor agreements, DPAs, and SaaS contracts for all 7 red flag categories. You receive a findings report with the specific clause, page reference, severity level, and a suggested counter-position. $97 per contract.
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

        {/* FAQ Section */}
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

        {/* Final CTA */}
        <section
          style={{
            background: 'var(--color-blue-50, #eff6ff)',
            border: '1px solid var(--color-blue-200, #bfdbfe)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '3rem',
            textAlign: 'center' as const,
          }}
        >
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Stop reviewing contracts manually. Scan it in 10 minutes.
          </h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1.5rem', opacity: 0.85, maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            DocAI flags unlimited liability carve-outs, perpetual data licenses, missing SLA remedies, and auto-renewal traps — with page-level references and suggested language to counter each finding.
          </p>
          <a
            href="https://docai.bizlegal-ai.com"
            style={{
              display: 'inline-block',
              padding: '0.875rem 2rem',
              background: 'var(--primary, #1a56db)',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '1rem',
            }}
          >
            Get Your Contract Risk Report — $97
          </a>
        </section>

        {/* Related Guides */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', opacity: 0.7 }}>Related Guides</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <a href="/guides/gdpr-compliance-checklist-saas" style={{ color: 'var(--primary, #1a56db)', fontSize: '0.9rem' }}>
              GDPR Compliance Checklist for SaaS Startups
            </a>
            <a href="/guides/soc2-compliance-checklist-saas" style={{ color: 'var(--primary, #1a56db)', fontSize: '0.9rem' }}>
              SOC 2 Compliance Checklist for SaaS Companies
            </a>
            <a href="/guides/compliance-health-score-saas" style={{ color: 'var(--primary, #1a56db)', fontSize: '0.9rem' }}>
              How to Score Your SaaS Compliance Health
            </a>
            <a href="/guides" style={{ color: 'var(--primary, #1a56db)', fontSize: '0.9rem' }}>
              All Compliance Guides →
            </a>
          </div>
        </section>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p>
            This guide is for informational purposes only and does not constitute legal advice. Contract law varies by jurisdiction and the specific facts of each agreement. Consult a licensed attorney before signing or negotiating any vendor contract that has material financial, IP, or compliance implications for your business.
          </p>
        </footer>
      </main>
    </>
  )
}
