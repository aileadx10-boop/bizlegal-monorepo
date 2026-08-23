import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Law Firm Fixed-Fee Pricing Playbook (2025): How to Price Flat-Fee Legal Services',
  description:
    'How to price fixed-fee legal services: the hourly-rate conversion formula, scope control, the 5 pricing models, retainer ranges by practice area, and the mistakes that turn flat fees into losses.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/fixed-fee-pricing-playbook' },
  openGraph: {
    title: 'Law Firm Fixed-Fee Pricing Playbook (2025)',
    description:
      'A practical playbook for pricing flat-fee legal services — the conversion formula, scope control, pricing models, and retainer ranges by practice area.',
    url: 'https://bizlegal-ai.com/guides/fixed-fee-pricing-playbook',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'How do I convert an hourly rate into a fixed fee?',
    a: 'Estimate the hours a matter realistically takes, multiply by your effective hourly rate, then add a burden factor (typically 1.2–1.5x) to cover scope creep, research, and communication. Round up to a clean number. The formula is: fixed fee = estimated hours × effective rate × burden factor. The calculator on this page does this for you.',
  },
  {
    q: 'What is a fair burden factor for fixed-fee work?',
    a: 'For routine, well-scoped matters (simple contracts, standard filings, uncontested matters) a 1.2–1.3x burden factor is common. For matters with unpredictable scope, client communication overhead, or regulatory risk, use 1.4–1.5x. The burden factor is your insurance against the fixed fee becoming a loss.',
  },
  {
    q: 'Which practice areas work best with fixed fees?',
    a: 'Fixed fees work best where scope is predictable: estate planning, simple incorporations, trademark filings, uncontested divorces, standard contracts, and flat-fee criminal defense. They work poorly where scope is open-ended: complex litigation, multi-party M&A, or matters with unpredictable regulatory involvement.',
  },
  {
    q: 'How do I protect myself from scope creep on a fixed fee?',
    a: 'Define the scope in writing before you quote: what is included, what is excluded, how many revisions, and what triggers a new fee. Use a change-order clause that converts out-of-scope work to hourly. Track your actual hours on the first few fixed-fee matters so your estimates are grounded in real data, not optimism.',
  },
  {
    q: 'What is the difference between a fixed fee and a flat retainer?',
    a: 'A fixed fee is a one-time price for a defined matter. A flat retainer is a recurring monthly price for ongoing services — a defined scope of work delivered each month. Retainers are better for ongoing relationships (compliance, general counsel, monthly contract review); fixed fees are better for discrete matters.',
  },
  {
    q: 'How does the BizLegal AI pricing calculator help?',
    a: 'The calculator on this page takes your hours, effective rate, and burden factor and returns a recommended fixed-fee range plus a monthly retainer equivalent. It is illustrative — a planning tool, not financial or legal advice. Your actual pricing should reflect your market, your experience, and the specific matter.',
  },
]

export default function FixedFeePricingPlaybookPage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Law Firm Fixed-Fee Pricing Playbook (2025): How to Price Flat-Fee Legal Services',
    description:
      'How to price fixed-fee legal services: the hourly-rate conversion formula, scope control, the 5 pricing models, retainer ranges by practice area, and the mistakes that turn flat fees into losses.',
    url: 'https://bizlegal-ai.com/guides/fixed-fee-pricing-playbook',
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
      { '@type': 'ListItem', position: 3, name: 'Fixed-Fee Pricing Playbook', item: 'https://bizlegal-ai.com/guides/fixed-fee-pricing-playbook' },
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
          Fixed-Fee Pricing Playbook
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Law Firm Business
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          Law Firm Fixed-Fee Pricing Playbook (2025)
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Clients increasingly ask for flat fees — and AI-assisted research is compressing the hours behind legal work. Fixed-fee pricing is a competitive advantage when done right and a margin killer when done blind. This playbook gives you the conversion formula, the scope-control discipline, and the pricing models that keep flat fees profitable.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>The Conversion Formula</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Every fixed fee starts as an hourly estimate. The formula is simple:
          </p>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem', fontWeight: 600 }}>
            Fixed fee = estimated hours × effective hourly rate × burden factor
          </p>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            The <em>burden factor</em> is the part most firms skip — and the part that separates profitable flat fees from losses. It covers the work you cannot bill for directly: client communication, research, revisions, and the inevitable scope drift. A 1.2x factor is the floor for routine matters; 1.4–1.5x is safer for anything with open-ended scope.
          </p>
          <p style={{ lineHeight: 1.75 }}>
            Example: a matter you estimate at 6 hours, at a $350 effective rate, with a 1.3x burden factor, prices at 6 × $350 × 1.3 = <strong>$2,730</strong>. Round to $2,750 or $2,800 for a clean quote.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>The Five Fixed-Fee Models</h2>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li><strong>Flat fee per matter:</strong> one price for a defined matter (incorporation, trademark filing, uncontested divorce). Best for discrete, well-scoped work.</li>
            <li><strong>Flat retainer:</strong> a recurring monthly price for a defined scope of ongoing work (general counsel, compliance, monthly contract review). Best for ongoing relationships.</li>
            <li><strong>Tiered flat fee:</strong> two or three price points for simple / standard / complex versions of the same matter. Lets clients self-select while you stay protected.</li>
            <li><strong>Flat fee + hourly overage:</strong> a base flat fee with a change-order clause converting out-of-scope work to hourly. The most common hybrid.</li>
            <li><strong>Subscription:</strong> a monthly fee for unlimited (or capped) access to a defined service category. Best for high-volume, low-variance work.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Retainer Ranges by Practice Area</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontWeight: 600 }}>Practice Area</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontWeight: 600 }}>Typical Flat Fee</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontWeight: 600 }}>Typical Monthly Retainer</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <td style={{ padding: '0.75rem 0.5rem' }}>Estate planning (simple will + POA)</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>$1,200–$2,500</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>—</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <td style={{ padding: '0.75rem 0.5rem' }}>Business incorporation (LLC)</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>$1,500–$3,500</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>—</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <td style={{ padding: '0.75rem 0.5rem' }}>Trademark filing (USPTO)</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>$1,500–$4,000</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>—</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <td style={{ padding: '0.75rem 0.5rem' }}>Uncontested divorce</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>$2,500–$5,000</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>—</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <td style={{ padding: '0.75rem 0.5rem' }}>General counsel / compliance</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>—</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>$2,000–$5,000</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem 0.5rem' }}>Contract review (monthly volume)</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>—</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>$1,500–$3,500</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ lineHeight: 1.75 }}>
            These are planning ranges, not quotes. Your market, experience, and matter specifics move the numbers — which is exactly why the calculator below lets you plug in your own inputs.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Scope Control: The Discipline That Keeps Flat Fees Profitable</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            The fixed fee is only as safe as the scope definition. Before you quote, write down:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li><strong>What is included</strong> — the specific deliverables, in plain language</li>
            <li><strong>What is excluded</strong> — the work that will trigger a new fee</li>
            <li><strong>Revision limits</strong> — how many rounds of changes are covered</li>
            <li><strong>Change-order clause</strong> — out-of-scope work converts to hourly at your standard rate</li>
            <li><strong>Assumptions</strong> — the facts the price depends on (e.g., "single-member LLC, no employees")</li>
          </ul>
          <p style={{ lineHeight: 1.75 }}>
            Track your actual hours on the first several fixed-fee matters. If a matter consistently runs over your estimate, your burden factor is too low or your scope definition is too loose — fix the pricing, not the client.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>The Mistakes That Turn Flat Fees Into Losses</h2>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li><strong>Pricing from optimism, not data:</strong> estimating hours from what you hope the matter takes instead of what similar matters actually took.</li>
            <li><strong>Skipping the burden factor:</strong> quoting 6 hours of work at 6 hours of price, with no allowance for communication, research, and drift.</li>
            <li><strong>Vague scope:</strong> "incorporation" without defining what is included — every client then expects unlimited revisions and advice.</li>
            <li><strong>No change-order clause:</strong> out-of-scope work becomes free work because there is no mechanism to charge for it.</li>
            <li><strong>Undercutting to win:</strong> pricing below your effective rate to close the deal, then resenting the work. A fixed fee should be a premium, not a discount.</li>
          </ul>
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
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Price It in 30 Seconds — Fixed-Fee Calculator</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '1rem', opacity: 0.85 }}>
            Plug in your hours, effective rate, and burden factor to get a recommended fixed-fee range and monthly retainer equivalent. Illustrative only — not financial or legal advice.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href="/tools/fixed-fee-pricing-calculator"
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
              Open the Calculator →
            </a>
          </div>
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
          <p>This guide is for informational purposes only and does not constitute legal, financial, or pricing advice. Fixed-fee pricing decisions should reflect your market, your experience, and the specific matter. Consult a licensed attorney or pricing professional for advice specific to your situation.</p>
        </footer>
      </main>
    </>
  )
}
