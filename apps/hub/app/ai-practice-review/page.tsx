import type { Metadata } from 'next'
import Link from 'next/link'
import CheckoutPanel from './CheckoutPanel'

export const metadata: Metadata = {
  title: 'AI Practice Review — a written memo on your AI-agent setup | Moses Dor, Adv.',
  description:
    'Five questions by email, one written memo back: a practising attorney checks your intended AI-agent setup against his published checklist. $200, no meeting. Plus the $49 AI Teammate Kit for law practices.',
  alternates: { canonical: 'https://bizlegal-ai.com/ai-practice-review' },
  openGraph: {
    title: 'AI Practice Review — written, async, $200',
    description:
      'A practising attorney reviews your intended AI-agent setup against his published checklist. Five questions by email, one memo back, no meeting.',
    url: 'https://bizlegal-ai.com/ai-practice-review',
    type: 'website',
  },
}

const QUESTIONS: ReadonlyArray<readonly [string, string]> = [
  ['Context', 'What tasks do you want an agent to do, and for which kinds of work (practice areas, not client names)?'],
  [
    'Connections',
    'Which accounts or systems would it connect to (email, calendar, document store, practice-management), and whose data do those hold?',
  ],
  [
    'Capabilities',
    'For each task, what does "done" look like: a draft for you to review, or something sent or filed without you?',
  ],
  ['Cadence', 'How often would it run, who would read its output, and how would you stop it?'],
  [
    'Consent and vendor',
    'What do your engagement terms currently say about third-party tools processing client communications, and which product(s) are you considering?',
  ],
]

const KIT_PARTS: readonly string[] = [
  'Pre-flight confidentiality checklist (12 questions; any "no" stops the setup)',
  'Engagement-letter clause and client-consent clause, in plain language, for a licensed practitioner to adapt',
  'Agent role card: the Four Cs on one page',
  'Three draft-only recipes (intake triage, deadline digest, client-update draft), each ending in verify-before-send',
  'Activity-log template',
  'Ten questions to ask any vendor before connecting',
  'Five things never to automate',
  '30-day rollout table',
]

const FAQ: ReadonlyArray<readonly [string, string]> = [
  [
    'Is the AI practice review legal advice?',
    'No. It reviews the way you intend to set up AI agents against a published checklist. It does not address any client matter and does not create an attorney-client relationship.',
  ],
  [
    'Is there a call or meeting?',
    'No. You answer five questions by email and receive a written memo by email within five working days of your answers.',
  ],
  [
    'Does the review recommend a vendor?',
    'No. It checks whatever product you are considering against the same questions, and says what could not be assessed from your answers.',
  ],
]

const muted = { color: 'var(--on-surface-var)', lineHeight: 1.7 } as const
const h2 = { fontSize: 22, margin: '32px 0 12px' } as const

export default function AiPracticeReviewPage() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(([name, text]) => ({
      '@type': 'Question',
      name,
      acceptedAnswer: { '@type': 'Answer', text },
    })),
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <span className="section-label">Written · async · no meeting</span>
      <h1 style={{ marginBottom: 8, fontSize: 'clamp(28px,5vw,44px)', lineHeight: 1.15 }}>
        A written review of your AI-agent setup, by a practising attorney
      </h1>
      <p style={{ ...muted, fontSize: 17, maxWidth: 720, marginBottom: 8 }}>
        I run AI agents in my own practice. Before any of them was allowed near a client&rsquo;s name I wrote four things
        down: what it knows, what it can touch, how each task ends, and where its log lives. The review checks your
        intended setup against that same checklist. It is delivered in writing. There is no call.
      </p>
      <p style={{ ...muted, fontSize: 13, marginBottom: 28 }}>
        By Moses Dor, Adv., practising commercial and real-estate attorney, in his personal capacity. Read the checklist
        first:{' '}
        <Link href="/blog/checks-before-an-ai-agent-touches-your-inbox" style={{ color: 'var(--primary, #1a56db)' }}>
          The checks I run before an AI agent touches my inbox
        </Link>
        .
      </p>

      <h2 style={h2}>How the review works</h2>
      <ol style={{ ...muted, paddingLeft: 22 }}>
        <li>You pay $200 below and enter the email the memo should go to.</li>
        <li>
          Within minutes you receive an email with the five questions. Reply when convenient; a sentence or two each is
          enough. Please do not include client names or matter details.
        </li>
        <li>
          Within five working days of your answers you receive a written memo: what is well-scoped, what is too broad,
          the consent and vendor gaps, the three changes to make first, and an explicit list of what could not be
          assessed.
        </li>
        <li>If you want a second pass after making the changes, reply to the memo. Same format.</li>
      </ol>

      <h2 style={h2}>The five questions</h2>
      <ol style={{ ...muted, paddingLeft: 22 }}>
        {QUESTIONS.map(([label, q]) => (
          <li key={label}>
            <strong style={{ color: 'inherit' }}>{label}.</strong> {q}
          </li>
        ))}
      </ol>

      <h2 style={h2}>What it is not</h2>
      <ul style={{ ...muted, paddingLeft: 22 }}>
        <li>Not legal advice, and not advice on any client matter. It reviews a setup, not a case.</li>
        <li>Not a vendor recommendation. Whatever product you name is checked against the same questions.</li>
        <li>
          Not a certification. The memo never says &ldquo;compliant&rdquo; or &ldquo;safe&rdquo;; it says what was
          checked and what was not.
        </li>
        <li>Not a meeting. Everything is in writing, in both directions.</li>
      </ul>

      <h2 style={h2}>The AI Teammate Kit ($49)</h2>
      <p style={muted}>
        The paperwork I keep next to the agents I run, in eight short parts. Delivered as a private link within minutes
        of payment, readable on any device, printable to PDF, downloadable as Markdown. For licensed practitioners;
        adapt every clause with counsel in your own jurisdiction.
      </p>
      <ol style={{ ...muted, paddingLeft: 22 }}>
        {KIT_PARTS.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ol>

      <CheckoutPanel />

      <h2 id="after-payment" style={h2}>
        After payment
      </h2>
      <p style={muted}>
        Review: the five questions arrive by email within minutes; the memo follows within five working days of your
        answers. Kit: the private link arrives by email within minutes. If nothing arrives within an hour, check spam,
        then reply to your order confirmation and it will be resent.
      </p>

      <h2 style={h2}>Questions people ask</h2>
      {FAQ.map(([q, a]) => (
        <p key={q} style={muted}>
          <strong style={{ color: 'inherit' }}>{q}</strong> {a}
        </p>
      ))}

      <hr style={{ border: 'none', borderTop: '1px solid var(--outline, #99a)', margin: '40px 0 20px' }} />
      <p style={{ ...muted, fontSize: 12 }}>
        The review and the kit are written by Moses Dor, Adv., in his personal capacity as a practising attorney and are
        for general information only. They are not legal advice, do not create an attorney-client relationship, and do
        not recommend any vendor or product. Consult a licensed attorney in your jurisdiction before acting on them.
        Payment and delivery are processed by BizLegal AI (DOR INNOVATIONS), a software company, not a law firm.
      </p>
    </div>
  )
}
