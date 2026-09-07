import type { Metadata } from 'next'
import UploadPanel from './UploadPanel'

export const metadata: Metadata = {
  title: 'Practice Revenue Report — the money hiding in your billing export | BizLegal AI',
  description:
    'Upload the invoice export from whatever you bill with. Get unbilled work, overdue balances, slow payers and dormant clients in numbers, with reminder emails already drafted. Free totals; $99 for the full report. Nothing connects to your inbox; client names never leave your browser.',
  alternates: { canonical: 'https://bizlegal-ai.com/practice-revenue' },
  openGraph: {
    title: 'Practice Revenue Report — free totals, $99 full report',
    description:
      'Arithmetic on your own invoice and time exports: unbilled, overdue, slow-paying, dormant. No inbox connection. Client names are replaced with codes in your browser before upload.',
    url: 'https://bizlegal-ai.com/practice-revenue',
    type: 'website',
  },
}

const FREE_ITEMS: readonly string[] = [
  'Open receivables and the amount past due 60+ days',
  'Unbilled work in hours and money (when you include a time export)',
  'Collection rate, realization rate, days-sales-outstanding',
  'Count of dormant clients and overdue invoices',
  'One client row from the ranking, as a sample',
]

const PAID_ITEMS: readonly string[] = [
  'Every overdue invoice with its aging bucket, and a neutral reminder email drafted for each',
  'Every unbilled entry, oldest first, with an invoice line drafted for each',
  'Every client ranked by collected money per billable hour (needs the time-entry export), with the "reprice or decline new work" arithmetic',
  'Closed-matter rows: worked, invoiced, collected',
  'Timing counterfactuals: how many days earlier cash would have arrived at a 3-day invoicing lag and 14-day collection',
  'Dormant clients with lifetime collected',
  'Printable page ("Save as PDF" in your browser); kept 180 days',
]

const FAQ: ReadonlyArray<readonly [string, string]> = [
  [
    'Does this connect to my email or practice-management system?',
    'No. You upload a CSV export you already have. Nothing is connected, nothing is read from your accounts.',
  ],
  [
    'Where do my client names go?',
    'Nowhere. Before upload, your browser replaces every client, matter and invoice identifier with a code such as "Client 01". The key that maps codes back to names stays in your browser and in a file you can download. The server stores codes only.',
  ],
  [
    'Is there a call or a meeting?',
    'No. The totals appear in your browser within seconds and are emailed to you; the full report unlocks by email after payment.',
  ],
  [
    'Is the report legal, tax or accounting advice?',
    'No. It is arithmetic on the export you uploaded. It is not a financial statement, and decisions about existing client relationships are outside its scope.',
  ],
  [
    'Which exports work?',
    'Any CSV with an invoice number, client, issue date and amount; paid amount or balance unlocks aging. Clio, MyCase, QuickBooks, Wave, FreshBooks and TimeSolv exports all carry these columns, and a one-tab template is provided for spreadsheets.',
  ],
]

const muted = { color: 'var(--on-surface-var)', lineHeight: 1.7 } as const
const h2 = { fontSize: 22, margin: '32px 0 12px' } as const

export default function PracticeRevenuePage() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })),
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <span className="section-label">Upload an export · totals in seconds · no inbox connection</span>
      <h1 style={{ marginBottom: 8, fontSize: 'clamp(28px,5vw,44px)', lineHeight: 1.15 }}>
        The money hiding in your billing export, in numbers
      </h1>
      <p style={{ ...muted, fontSize: 17, maxWidth: 720, marginBottom: 8 }}>
        Upload the invoice export from whatever you bill with, and optionally your time entries. You get what is
        unbilled, what is overdue, who pays slowly and who went quiet — with the reminder emails already drafted for
        you to send yourself. Free totals; $99 for the full report.
      </p>
      <p style={{ ...muted, fontSize: 13, marginBottom: 28 }}>
        Client names never leave your browser: they are replaced with codes before upload, and only your browser
        holds the key. For licensed practitioners and other professionals who bill by the hour or by invoice.
      </p>

      <h2 style={h2}>How it works</h2>
      <ol style={{ ...muted, paddingLeft: 22 }}>
        <li>
          Export invoices as CSV from your billing tool (and time entries, if you track them). Or fill the{' '}
          <a href="/templates/practice-revenue-invoices-template.csv" style={{ color: 'var(--primary, #1a56db)' }}>
            one-tab template
          </a>
          .
        </li>
        <li>Choose the files below. Your browser replaces names with codes and shows you the mapping before anything is sent.</li>
        <li>The totals appear on this page and in your email within seconds. They are kept for 14 days.</li>
        <li>Unlock the full report for $99 by card or crypto. The link arrives by email; the report is kept for 180 days.</li>
      </ol>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', margin: '24px 0' }}>
        <div style={{ border: '1px solid var(--outline, #99a)', borderRadius: 10, padding: 18 }}>
          <strong style={{ fontSize: 17 }}>Free totals</strong>
          <ul style={{ ...muted, paddingLeft: 20, marginTop: 8 }}>
            {FREE_ITEMS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div style={{ border: '1px solid var(--outline, #99a)', borderRadius: 10, padding: 18 }}>
          <strong style={{ fontSize: 17 }}>Full report — $99</strong>
          <ul style={{ ...muted, paddingLeft: 20, marginTop: 8 }}>
            {PAID_ITEMS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      <UploadPanel />

      <h2 style={h2}>What the numbers mean</h2>
      <p style={muted}>
        Every figure is printed with the formula used. Realization is invoiced billable hours divided by billable
        hours; collection is money collected divided by money invoiced; utilization assumes eight available hours per
        weekday and says so. Where a column is missing from your export, the section reads &ldquo;not computable&rdquo;
        rather than zero. Counterfactuals are timing shifts &mdash; cash arriving earlier &mdash; never claims that you
        would have more money.
      </p>

      <h2 style={h2}>Questions people ask</h2>
      {FAQ.map(([q, a]) => (
        <p key={q} style={muted}>
          <strong style={{ color: 'inherit' }}>{q}</strong> {a}
        </p>
      ))}

      <hr style={{ border: 'none', borderTop: '1px solid var(--outline, #99a)', margin: '40px 0 20px' }} />
      <p style={{ ...muted, fontSize: 12 }}>
        The Practice Revenue Report is arithmetic on the export you upload. It is not a financial statement and not
        legal, tax or accounting advice; it does not create an attorney-client relationship. Reminder drafts are
        templates you edit and send yourself; nothing is sent on your behalf. Benchmarks, where shown, are the published
        figures of the source cited next to them. BizLegal AI (DOR INNOVATIONS) is a software company, not a law firm.
        If the full report is not useful, reply to the unlock email within 7 days for a refund.
      </p>
    </div>
  )
}
