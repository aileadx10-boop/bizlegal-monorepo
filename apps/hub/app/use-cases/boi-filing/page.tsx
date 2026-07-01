import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'BOI Filing Software — FinCEN CTA Compliance | BizLegal AI',
  description:
    'BOI filing compliance for US LLCs, corps, and crypto companies. FinCEN CTA beneficial ownership reporting requirements, deadlines, penalties, and automated monitoring. $149 BOI Kit.',
  alternates: { canonical: 'https://bizlegal-ai.com/use-cases/boi-filing' },
  openGraph: {
    title: 'BOI Filing Software — FinCEN CTA Beneficial Ownership Compliance',
    description:
      'BizLegal Forge BOI Kit: FinCEN CTA filing requirements, deadlines, and monitoring for US LLCs and crypto companies. Avoid $500/day penalties.',
    url: 'https://bizlegal-ai.com/use-cases/boi-filing',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is BOI filing and who is required to file?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BOI (Beneficial Ownership Information) filing is required under FinCEN\'s Corporate Transparency Act (CTA) rule, 31 C.F.R. § 1010.380. Reporting Companies must file: (1) all US LLCs created before January 1, 2024 (initial deadline was January 1, 2025), (2) all US LLCs, corporations, and similar entities created in 2024 (file within 90 days of creation), (3) all US entities created in 2025 or later (file within 30 days of creation). Exempt entities include large operating companies (>20 employees, >$5M revenue, US office), SEC-registered entities, banks, credit unions, and 23 other categories.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the penalties for not filing BOI with FinCEN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Penalties for willful failure to file or update BOI include: civil penalties of $500 per day (uncapped), criminal penalties up to $10,000, and imprisonment up to 2 years. Both the company and individual senior officers can be held personally liable for willful non-compliance. "Willful" has been interpreted broadly — if you knew about the requirement and didn\'t file, that may constitute willfulness.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do crypto companies and DAOs need to file BOI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Crypto companies organized as US LLCs or corporations are reporting companies under the CTA. This includes: crypto exchanges, Web3 protocol companies, NFT platforms, and crypto funds organized as US entities. DAOs organized as Wyoming DAO LLCs, Marshall Islands DAO entities, or similar structures with US registration are also reporting companies. Foreign companies that register to do business in the US may also be reporting companies. The DAO structure does not provide an exemption from BOI reporting.',
      },
    },
    {
      '@type': 'Question',
      name: 'What information must be reported in a BOI filing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Each BOI filing must include: (1) Company information — legal name, trade names, EIN, jurisdiction of formation, and principal US business address. (2) Beneficial Owner information for each individual who owns or controls 25%+ of the company, or has substantial control — their full legal name, date of birth, current residential address, and a unique identifying number from a government-issued ID (passport or driver\'s license number). For entities formed after Jan 1, 2024: also Company Applicant information.',
      },
    },
    {
      '@type': 'Question',
      name: 'When do I need to update my BOI filing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You must file an updated BOI report within 30 days of any change to previously reported information, including: change in beneficial ownership (new investor crosses 25% threshold, existing owner sells), change in a beneficial owner\'s name, address, or ID document, change in the company\'s legal name, address, or EIN. There is no annual filing — only event-triggered updates. BizLegal\'s BOI Tracker monitors your company structure and alerts you when a reportable change occurs.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the BizLegal Forge BOI Kit include?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Forge BOI Kit ($149) includes: (1) Pre-filing readiness checklist — all information you need before you go to FinCEN BOSS (the free filing portal), (2) Beneficial owner identification guide with the 25%/substantial control analysis worksheet, (3) Exemption analysis — detailed review of all 23 exemptions and whether your company qualifies, (4) 12-month update monitoring — email alerts when FinCEN guidance changes or you need to re-file, (5) Templates for LLC operating agreement amendments to clarify ownership structure for BOI purposes. Add the BOI Tracker Agent ($29/mo) for continuous monitoring and 30-day deadline reminders.',
      },
    },
  ],
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
    { '@type': 'ListItem', position: 2, name: 'Use Cases', item: 'https://bizlegal-ai.com/use-cases' },
    { '@type': 'ListItem', position: 3, name: 'BOI Filing', item: 'https://bizlegal-ai.com/use-cases/boi-filing' },
  ],
}

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'BizLegal Forge BOI Kit — FinCEN CTA Compliance',
  applicationCategory: 'LegalApplication',
  operatingSystem: 'Web',
  url: 'https://forge.bizlegal-ai.com',
  description:
    'FinCEN BOI filing compliance kit for US LLCs and crypto companies. Includes pre-filing checklist, exemption analysis, ownership identification worksheet, and 12-month monitoring.',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '29',
    highPrice: '149',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
}

const DEADLINE_CHECKLIST = [
  { deadline: 'Entities formed before Jan 1, 2024', requirement: 'Initial BOI filing required', date: 'Past due — file immediately' },
  { deadline: 'Entities formed in 2024', requirement: 'File within 90 days of formation', date: 'Check your formation date' },
  { deadline: 'Entities formed Jan 1, 2025+', requirement: 'File within 30 days of formation', date: 'Ongoing' },
  { deadline: 'Beneficial ownership changes', requirement: 'Update within 30 days of change', date: 'Event-triggered' },
  { deadline: 'Name, address, or ID changes', requirement: 'Update within 30 days', date: 'Event-triggered' },
]

export default function BoiFilingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingTop: '36px' }}>
        {/* Nav */}
        <div style={{ background: 'rgba(7,9,26,0.95)', borderBottom: '1px solid rgba(125,211,252,0.08)' }}>
          <div className="container" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" className="nav-logo" style={{ marginRight: 'auto' }}>BizLegal<em>AI</em></Link>
            <a href="https://forge.bizlegal-ai.com" className="btn-ghost" style={{ fontSize: '12px' }}>BOI Kit $149</a>
            <a href="/agents/boi-tracker" className="btn-primary" style={{ fontSize: '12px' }}>BOI Tracker $29/mo →</a>
          </div>
        </div>

        {/* Penalty banner */}
        <div style={{ background: 'rgba(239,68,68,0.06)', borderBottom: '1px solid rgba(239,68,68,0.2)', padding: '16px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '16px' }}>🚨</span>
            <span style={{ fontSize: '13px', color: '#fca5a5' }}>
              <strong>FinCEN penalties: $500/day + up to $10,000 + 2 years imprisonment</strong> for willful non-compliance with CTA BOI reporting. If you haven&apos;t filed yet, file today.
            </span>
          </div>
        </div>

        {/* Hero */}
        <div style={{ padding: '80px 24px 60px', maxWidth: '900px', margin: '0 auto' }}>
          <nav style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '24px' }}>
            <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Home</Link>
            {' / '}
            <Link href="/use-cases" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Use Cases</Link>
            {' / '}
            <span style={{ color: 'var(--text)' }}>BOI Filing</span>
          </nav>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(125,211,252,0.2)', background: 'rgba(125,211,252,0.05)', fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: 'var(--sky)', marginBottom: '28px' }}>
            FinCEN CTA — 31 C.F.R. § 1010.380
          </div>
          <h1 style={{ fontFamily: 'Gloock, serif', fontSize: 'clamp(32px, 5vw, 56px)', color: 'var(--white)', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
            BOI Filing Compliance:<br />
            <em style={{ fontStyle: 'italic', color: 'var(--sky)' }}>Know Exactly What You Need to File</em>
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--muted)', lineHeight: 1.8, maxWidth: '680px', marginBottom: '36px' }}>
            The Corporate Transparency Act requires nearly every US LLC and corporation to file Beneficial Ownership Information with FinCEN. Most founders don&apos;t know if they&apos;re exempt, what information they need, or when to refile after ownership changes. The BizLegal Forge BOI Kit walks you through all of it — including crypto company specifics that most guides miss.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="https://forge.bizlegal-ai.com" className="lx-btn-p">BOI Kit $149 →</a>
            <Link href="/agents/boi-tracker" className="lx-btn-g">BOI Tracker $29/mo</Link>
          </div>
        </div>

        {/* Deadline table */}
        <div style={{ background: 'rgba(7,9,26,0.6)', padding: '60px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '32px' }}>
              BOI Filing Deadlines — Where Do You Stand?
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(125,211,252,0.2)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--muted)', fontWeight: 500 }}>Entity Type</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--muted)', fontWeight: 500 }}>Filing Requirement</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--muted)', fontWeight: 500 }}>Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {DEADLINE_CHECKLIST.map((d) => (
                    <tr key={d.deadline} style={{ borderBottom: '1px solid rgba(125,211,252,0.06)' }}>
                      <td style={{ padding: '14px 16px', color: 'var(--white)', fontWeight: 500 }}>{d.deadline}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>{d.requirement}</td>
                      <td style={{ padding: '14px 16px', color: d.date.includes('past') || d.date.includes('immediately') ? '#fca5a5' : 'var(--sky)', fontWeight: 500 }}>{d.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Kit contents */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '40px' }}>
            What the Forge BOI Kit Includes
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {[
              { icon: '📋', title: 'Pre-filing readiness checklist', desc: 'Everything you need to gather before going to FinCEN\'s BOSS portal' },
              { icon: '🔍', title: 'Exemption analysis', desc: 'Detailed review of all 23 exemptions — know if you truly need to file' },
              { icon: '👥', title: 'Beneficial owner ID worksheet', desc: '25% ownership and substantial control analysis for complex cap tables' },
              { icon: '🔔', title: '12-month update monitoring', desc: 'Email alerts when FinCEN guidance changes and when you may need to refile' },
              { icon: '📄', title: 'Operating agreement templates', desc: 'LLC amendment language to clarify ownership structure for BOI purposes' },
              { icon: '₿', title: 'Crypto company guidance', desc: 'Specific analysis for token holders, multisig wallets, and DAO structures' },
            ].map((item) => (
              <div key={item.title} style={{ padding: '24px', border: '1px solid rgba(125,211,252,0.1)', borderRadius: '12px', background: 'rgba(125,211,252,0.02)' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '15px', color: 'var(--white)', marginBottom: '8px', fontWeight: 600 }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ background: 'rgba(7,9,26,0.4)', padding: '60px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '40px' }}>
              BOI Filing — Frequently Asked Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {faqSchema.mainEntity.map((faq) => (
                <div key={faq.name} style={{ padding: '24px', border: '1px solid rgba(125,211,252,0.1)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '16px', color: 'var(--white)', marginBottom: '10px', fontWeight: 600 }}>{faq.name}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'rgba(125,211,252,0.04)', borderTop: '1px solid rgba(125,211,252,0.12)', padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '36px', color: 'var(--white)', marginBottom: '16px' }}>
            File correctly. Monitor ongoing changes.
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--muted)', marginBottom: '36px', maxWidth: '520px', margin: '0 auto 36px' }}>
            The BOI Kit gives you everything to file correctly the first time. The BOI Tracker Agent monitors FinCEN guidance changes and alerts you when updates are required.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://forge.bizlegal-ai.com" className="lx-btn-p" style={{ fontSize: '15px', padding: '14px 32px' }}>
              BOI Kit $149 →
            </a>
            <Link href="/agents/boi-tracker" className="lx-btn-g" style={{ fontSize: '15px', padding: '14px 32px' }}>
              BOI Tracker $29/mo
            </Link>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '16px' }}>Not legal advice · Information and compliance tools · Filing is done directly on FinCEN&apos;s free BOSS portal</p>
        </div>
      </div>
    </>
  )
}
