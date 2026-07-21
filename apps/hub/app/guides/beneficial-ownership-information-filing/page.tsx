import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BOI Filing Guide: How to File a Beneficial Ownership Information Report (2025)',
  description: 'Complete guide to Corporate Transparency Act BOI reporting. Who must file, what information is required, deadlines, penalties, and the 23 exemption categories explained.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/beneficial-ownership-information-filing' },
  openGraph: {
    title: 'BOI Filing Guide: How to File a Beneficial Ownership Information Report',
    description: 'Who must file, what information is required, deadlines, penalties, and the 23 CTA exemption categories. Practitioner-written guide from BizLegal AI.',
    url: 'https://bizlegal-ai.com/guides/beneficial-ownership-information-filing',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'Who must file a BOI report under the Corporate Transparency Act?',
    a: 'Most US LLCs, corporations, and similar entities formed by filing with a secretary of state must file — plus foreign companies registered to do business in the US. There are 23 statutory exemptions including large operating companies (20+ employees, $5M+ revenue, US office), banks, credit unions, SEC-registered entities, and publicly traded companies. If you\'re a small startup formed in the US with no regulatory exemption, you almost certainly need to file.',
  },
  {
    q: 'What is a beneficial owner under the CTA?',
    a: 'A beneficial owner is any individual who either (1) owns or controls at least 25% of the ownership interests of the company, or (2) exercises "substantial control" over the company — which includes senior officers (CEO, CFO, COO, general counsel), board directors with decision-making authority, and any other person who directs, determines, or has substantial influence over important company decisions.',
  },
  {
    q: 'What information must be included in a BOI report?',
    a: 'For each beneficial owner and company applicant: full legal name, date of birth, current residential address (business address is not acceptable for most owners), and a unique identifying number from a government-issued ID (US passport, state driver\'s license, or foreign passport). You must also upload a copy of that ID document. The reporting company itself must provide its legal name, trade names, principal US address, state/tribal jurisdiction of formation, and its EIN.',
  },
  {
    q: 'What are the BOI filing deadlines in 2025?',
    a: 'Companies formed before January 1, 2024 had a filing deadline of January 1, 2025. Companies formed between January 1, 2024 and December 31, 2024 had 90 days from formation to file. Companies formed on or after January 1, 2025 have 30 days from formation to file. Any change to previously reported information (new owner, change of address, updated ID) requires an updated report within 30 days of the change.',
  },
  {
    q: 'What are the penalties for not filing a BOI report?',
    a: 'Civil penalties of $500 per day for each day a violation continues (adjusted periodically for inflation). Willful violations can result in criminal penalties of up to $10,000 and up to 2 years imprisonment. Both the company and individual responsible for the violation can be held liable.',
  },
  {
    q: 'Can I file the BOI report directly with FinCEN myself?',
    a: 'Yes. FinCEN\'s BOIR e-filing system is free and available at boiefiling.fincen.gov. The challenge is correctly identifying all beneficial owners, understanding the substantial control test, and ensuring the information is accurate. Errors or omissions are the source of most compliance failures. A guided kit like Forge\'s $149 BOI filing service walks you through each determination with practitioner review.',
  },
]

export default function BOIFilingGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'BOI Filing Guide: How to File a Beneficial Ownership Information Report (2025)',
    description: 'Complete guide to Corporate Transparency Act BOI reporting — who must file, what information is required, deadlines, penalties, and the 23 exemption categories.',
    url: 'https://bizlegal-ai.com/guides/beneficial-ownership-information-filing',
    publisher: {
      '@type': 'Organization',
      name: 'BizLegal AI',
      url: 'https://bizlegal-ai.com',
    },
    author: {
      '@type': 'Organization',
      name: 'BizLegal AI',
    },
    inLanguage: 'en-US',
    about: {
      '@type': 'Thing',
      name: 'Beneficial Ownership Information Report',
      description: 'FinCEN BOI report required under the Corporate Transparency Act',
    },
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
      { '@type': 'ListItem', position: 3, name: 'BOI Filing Guide', item: 'https://bizlegal-ai.com/guides/beneficial-ownership-information-filing' },
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
          BOI Filing Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Compliance Guide
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          Beneficial Ownership Information (BOI) Filing Guide
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          The Corporate Transparency Act (CTA) requires most US small businesses to report who owns and controls them to the Financial Crimes Enforcement Network (FinCEN). This guide covers who must file, what information you need, the deadlines, and what happens if you miss them.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>What is a BOI Report?</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            A Beneficial Ownership Information (BOI) report discloses who owns or controls a reporting company to FinCEN, a bureau of the US Treasury Department. The report was created by the Corporate Transparency Act, enacted in 2021 as part of the Anti-Money Laundering Act of 2020, and became effective January 1, 2024.
          </p>
          <p style={{ lineHeight: 1.75 }}>
            The goal is to create a federal registry of beneficial ownership that law enforcement can access to investigate money laundering, tax fraud, and other financial crimes. Before the CTA, the US had no centralized federal database of who actually owned LLCs and corporations — only state-level formation records showing registered agents, not real owners.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Who Must File (Reporting Companies)</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            A "reporting company" is any corporation, LLC, or similar entity that is:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.8, marginBottom: '1rem' }}>
            <li>Created by filing a document with a US state or tribal secretary of state, <em>or</em></li>
            <li>A foreign company registered to do business in the US by filing with a state or tribal jurisdiction</li>
          </ul>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            This captures the vast majority of US businesses — single-member LLCs, multi-member LLCs, S-corps, C-corps, and similar entities. General partnerships, sole proprietorships, and trusts are generally not reporting companies (because they typically do not file formation documents with a secretary of state).
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>The 23 Exemptions</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            FinCEN exempts 23 categories of entities from BOI reporting. The most practically relevant for small businesses and startups:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.8, marginBottom: '1rem' }}>
            <li><strong>Large operating company:</strong> 20+ full-time employees in the US, US physical office, and $5M+ gross receipts on prior-year US federal tax return</li>
            <li><strong>SEC-reporting issuers:</strong> publicly traded companies registered with the SEC</li>
            <li><strong>Banks and credit unions</strong> regulated by federal banking agencies</li>
            <li><strong>Registered investment companies and advisers</strong> registered with the SEC</li>
            <li><strong>Insurance companies</strong> licensed under state law</li>
            <li><strong>Inactive entities:</strong> formed before January 1, 2020, not actively engaging in business, no foreign owners, no transfers in preceding 12 months, and $1,000 or less in assets</li>
          </ul>
          <p style={{ lineHeight: 1.75 }}>
            If you believe an exemption applies, FinCEN's Small Business Compliance Guide provides a full list. A startup with fewer than 20 employees and no regulatory license almost certainly does not qualify for an exemption.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Who Counts as a Beneficial Owner</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            This is where most companies get it wrong. A beneficial owner is any individual who, directly or indirectly:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.8, marginBottom: '1rem' }}>
            <li><strong>Owns or controls 25% or more</strong> of the ownership interests (equity shares, capital or profits interests, convertible instruments), <em>or</em></li>
            <li><strong>Exercises substantial control</strong> over the company</li>
          </ul>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            "Substantial control" is broad. It includes: senior officers (CEO, president, CFO, COO, general counsel), any individual with authority to appoint or remove senior officers, and any individual who directs, determines, or has substantial influence over important company decisions.
          </p>
          <p style={{ lineHeight: 1.75 }}>
            For a typical three-founder startup with 40%/35%/25% equity splits, all three founders are beneficial owners. For a company backed by a VC holding 30% equity, the fund is not listed — beneficial owners must be natural persons, not legal entities. You trace through to the individual.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Required Information</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            For each beneficial owner and company applicant (for companies formed after January 1, 2024, the person who filed the formation documents), you must provide:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.8, marginBottom: '1rem' }}>
            <li>Full legal name</li>
            <li>Date of birth</li>
            <li>Current residential street address (not PO Box, not business address for most owners)</li>
            <li>Unique identifying number from a government-issued ID (US passport, state driver's license, or foreign passport)</li>
            <li>A legible copy of that ID document</li>
          </ul>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            For the reporting company itself:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.8 }}>
            <li>Full legal name and any trade names (DBAs)</li>
            <li>Complete current US street address of principal place of business</li>
            <li>State, tribal, or foreign jurisdiction of formation</li>
            <li>Taxpayer Identification Number (EIN)</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Filing Deadlines</h2>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.8, marginBottom: '1rem' }}>
            <li><strong>Companies formed before January 1, 2024:</strong> deadline was January 1, 2025</li>
            <li><strong>Companies formed January 1, 2024 – December 31, 2024:</strong> 90 calendar days from formation</li>
            <li><strong>Companies formed on or after January 1, 2025:</strong> 30 calendar days from formation</li>
            <li><strong>Updates after initial filing:</strong> 30 calendar days from the date of any change (new beneficial owner, address change, expired or replaced ID)</li>
            <li><strong>Corrections to inaccurate reports:</strong> 30 calendar days after becoming aware of the inaccuracy</li>
          </ul>
          <p style={{ lineHeight: 1.75 }}>
            If your company was formed before 2024 and has not yet filed, you are in violation. FinCEN has not issued a general amnesty. Courts have so far upheld the CTA's constitutionality after early injunctions were lifted, though litigation continues.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Penalties for Non-Compliance</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Civil penalties: $500 per day for each day a violation continues (this amount is adjusted periodically for inflation). Willful violations of the BOI reporting requirements can result in criminal penalties of up to $10,000 and up to 2 years imprisonment. Both the company and the individual responsible for the violation — including officers who authorized the failure to file — can be held personally liable.
          </p>
          <p style={{ lineHeight: 1.75 }}>
            FinCEN has enforcement authority. There is no self-correction grace period beyond the 30-day correction window for known inaccuracies.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>How to File</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            FinCEN provides a free electronic filing system at boiefiling.fincen.gov. You can file directly. The filing is free.
          </p>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            The practical challenge is not the form itself but determining who qualifies as a beneficial owner under the substantial control test, correctly tracing ownership through holding companies, and ensuring all required information is accurate. Errors — including providing a business address instead of residential address, or missing an individual who exercises substantial control — can result in an inaccurate report that requires correction.
          </p>
          <p style={{ lineHeight: 1.75 }}>
            For founders who want guided assistance with determining beneficial owners and preparing an accurate filing package, <a href="https://forge.bizlegal-ai.com/boi" style={{ color: 'var(--primary, #1a56db)', textDecoration: 'underline' }}>Forge's BOI Compliance Kit ($149)</a> walks through each determination step-by-step with practitioner review and includes annual reminders for required updates.
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
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>File your BOI report with guided assistance</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '1.25rem', opacity: 0.85 }}>
            Forge walks you through identifying beneficial owners, provides a completed filing package for FinCEN, and includes annual reminders for required updates. $149 flat fee, practitioner-reviewed.
          </p>
          <a
            href="https://forge.bizlegal-ai.com/boi"
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
            Get the BOI Kit — $149
          </a>
          <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.75rem', marginBottom: 0 }}>
            Not legal advice. For filing guidance specific to your ownership structure, consult a licensed attorney.
          </p>
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
          <p>This guide is for informational purposes only and does not constitute legal advice. BOI filing requirements are governed by FinCEN regulations under 31 CFR Part 1010. Consult a licensed attorney for advice specific to your situation. BizLegal AI is operated by DOR INNOVATIONS.</p>
        </footer>
      </main>
    </>
  )
}
