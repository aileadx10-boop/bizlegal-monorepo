import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SOC 2 Questionnaire Automation — DocAI SQA | BizLegal AI',
  description:
    'Answer 300-question SOC 2 security questionnaires in under 2 hours instead of 3 days. DocAI SQA maps your existing policies to enterprise buyer questions automatically.',
  alternates: { canonical: 'https://bizlegal-ai.com/use-cases/soc2-questionnaire' },
  openGraph: {
    title: 'SOC 2 Questionnaire Automation — Stop Losing Enterprise Deals',
    description:
      'DocAI SQA automates security questionnaire responses for SaaS companies. Stop losing $200K ARR deals to 3-day security review cycles.',
    url: 'https://bizlegal-ai.com/use-cases/soc2-questionnaire',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is SOC 2 questionnaire automation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SOC 2 questionnaire automation uses AI to read your existing security policies, controls documentation, and compliance posture, then automatically draft responses to enterprise security questionnaires. Instead of a compliance consultant spending 3 days manually answering 300 questions, the AI maps each question to your documented controls in minutes.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to answer a 300-question security questionnaire with DocAI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DocAI SQA typically reduces a 300-question enterprise security questionnaire from 3-4 days to under 2 hours. The system ingests your existing policies, maps questions to controls, and drafts answers. Your security team reviews and approves — instead of drafting from scratch.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to have SOC 2 certification to use DocAI SQA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. DocAI SQA works whether you are SOC 2 certified, in-process, or planning. If you have existing security policies and controls documentation, DocAI can map them to questionnaire responses. If you are pre-SOC 2, it identifies which controls you need to document first.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of security questionnaires does DocAI support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DocAI SQA supports SOC 2 Type I and Type II questionnaires, CAIQ (Consensus Assessment Initiative Questionnaire), SIG (Standardized Information Gathering), VSAQ (Vendor Security Assessment Questionnaire), HECVAT, and custom enterprise questionnaires from any buyer.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does DocAI SQA cost compared to a compliance consultant?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DocAI SQA costs $69/month or $97 for a one-time scan. A compliance consultant answering a 300-question questionnaire typically bills 20-30 hours at $150-350/hour, costing $3,000-10,500 per engagement. DocAI pays for itself on the first questionnaire.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my data safe when uploading policies to DocAI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DocAI processes documents in-session and does not retain your security policies after the scan completes. All processing uses TLS 1.3 in transit and AES-256 at rest. You can review the Trust Center at bizlegal-ai.com/trust for full sub-processor and data handling details.',
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
    { '@type': 'ListItem', position: 3, name: 'SOC 2 Questionnaire Automation', item: 'https://bizlegal-ai.com/use-cases/soc2-questionnaire' },
  ],
}

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'DocAI SQA — Security Questionnaire Automation',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://docai.bizlegal-ai.com',
  description:
    'AI-powered security questionnaire automation for SaaS companies. Answers SOC 2, CAIQ, SIG, and custom enterprise questionnaires in hours instead of days.',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '69',
    highPrice: '97',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    offerCount: 2,
  },
  featureList: [
    'SOC 2 questionnaire auto-response',
    'CAIQ and SIG support',
    'Policy-to-control mapping',
    'Custom questionnaire upload',
    'Export-ready responses',
  ],
}

const STEPS = [
  {
    n: '01',
    title: 'Upload your policies',
    body: 'Upload your existing security policies, SOC 2 report (if any), and controls documentation. DocAI accepts PDF, DOCX, or plain text.',
  },
  {
    n: '02',
    title: 'Upload the questionnaire',
    body: 'Upload the security questionnaire you received from your enterprise buyer — any format, any number of questions.',
  },
  {
    n: '03',
    title: 'AI maps and drafts answers',
    body: 'DocAI reads each question, finds the matching control in your documentation, and drafts a specific, evidence-backed answer.',
  },
  {
    n: '04',
    title: 'Review, edit, and export',
    body: 'Your team reviews the 20-30% of questions that need human judgment. Export the completed questionnaire as PDF or XLSX.',
  },
]

const PAIN_STATS = [
  { stat: '3-4 days', label: 'average time to answer a 300-question SQ manually' },
  { stat: '$5,000+', label: 'consultant cost per security questionnaire engagement' },
  { stat: '23%', label: 'of B2B deals stall or die on security review' },
  { stat: '2 hours', label: 'average completion time with DocAI SQA' },
]

export default function Soc2QuestionnairePage() {
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
            <a href="https://docai.bizlegal-ai.com" className="btn-ghost" style={{ fontSize: '12px' }}>Free SQA Preview</a>
            <a href="https://docai.bizlegal-ai.com" className="btn-primary" style={{ fontSize: '12px' }}>Start $69/mo →</a>
          </div>
        </div>

        {/* Hero */}
        <div style={{ padding: '80px 24px 60px', maxWidth: '900px', margin: '0 auto' }}>
          <nav style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '24px' }}>
            <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Home</Link>
            {' / '}
            <Link href="/use-cases" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Use Cases</Link>
            {' / '}
            <span style={{ color: 'var(--text)' }}>SOC 2 Questionnaire</span>
          </nav>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(125,211,252,0.2)', background: 'rgba(125,211,252,0.05)', fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: 'var(--sky)', marginBottom: '28px' }}>
            DocAI — Security Questionnaire Automation
          </div>
          <h1 style={{ fontFamily: 'Gloock, serif', fontSize: 'clamp(32px, 5vw, 56px)', color: 'var(--white)', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
            SOC 2 Questionnaire Automation:<br />
            <em style={{ fontStyle: 'italic', color: 'var(--sky)' }}>300 Questions in 2 Hours</em>
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--muted)', lineHeight: 1.8, maxWidth: '680px', marginBottom: '36px' }}>
            Your enterprise buyer sent a 300-question security questionnaire. Your options: spend 3 days and $5,000 with a compliance consultant, or use DocAI SQA to map your existing policies to each answer automatically. DocAI reads your controls documentation and drafts responses — your team only reviews the edge cases.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="https://docai.bizlegal-ai.com" className="lx-btn-p">Start Free SQA Preview →</a>
            <a href="/pricing" className="lx-btn-g">See Pricing</a>
          </div>
        </div>

        {/* Stats */}
        <div style={{ background: 'rgba(7,9,26,0.6)', borderTop: '1px solid rgba(125,211,252,0.08)', borderBottom: '1px solid rgba(125,211,252,0.08)', padding: '40px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px' }}>
            {PAIN_STATS.map((s) => (
              <div key={s.stat} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Gloock, serif', fontSize: '36px', color: 'var(--sky)', marginBottom: '8px' }}>{s.stat}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '32px', color: 'var(--white)', marginBottom: '48px' }}>
            How DocAI SQA Works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {STEPS.map((s) => (
              <div key={s.n} style={{ padding: '28px', border: '1px solid rgba(125,211,252,0.1)', borderRadius: '12px', background: 'rgba(125,211,252,0.02)' }}>
                <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '11px', color: 'var(--sky)', marginBottom: '12px' }}>{s.n}</div>
                <h3 style={{ fontSize: '16px', color: 'var(--white)', marginBottom: '8px', fontWeight: 600 }}>{s.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What it covers */}
        <div style={{ background: 'rgba(7,9,26,0.6)', padding: '60px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '32px' }}>
              Questionnaire Types Supported
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {['SOC 2 Type I & Type II', 'CAIQ (Consensus Assessment Initiative)', 'SIG (Standardized Information Gathering)', 'VSAQ (Vendor Security Assessment)', 'HECVAT (Healthcare)', 'Custom enterprise questionnaires', 'ISO 27001 supplier assessments', 'GDPR Article 28 processor questionnaires'].map((q) => (
                <div key={q} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid rgba(125,211,252,0.08)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--sky)', fontSize: '16px' }}>✓</span>
                  <span style={{ fontSize: '14px', color: 'var(--muted)' }}>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '40px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {faqSchema.mainEntity.map((faq) => (
              <div key={faq.name} style={{ padding: '24px', border: '1px solid rgba(125,211,252,0.1)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '16px', color: 'var(--white)', marginBottom: '12px', fontWeight: 600 }}>{faq.name}</h3>
                <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'rgba(125,211,252,0.04)', borderTop: '1px solid rgba(125,211,252,0.12)', borderBottom: '1px solid rgba(125,211,252,0.12)', padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '36px', color: 'var(--white)', marginBottom: '16px' }}>
            Stop losing deals to slow security reviews.
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--muted)', marginBottom: '36px', maxWidth: '500px', margin: '0 auto 36px' }}>
            Upload your policies. Upload the questionnaire. Get a complete draft in under 2 hours. Free preview — no credit card.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://docai.bizlegal-ai.com" className="lx-btn-p" style={{ fontSize: '15px', padding: '14px 32px' }}>
              Start Free SQA Preview →
            </a>
            <Link href="/pricing" className="lx-btn-g" style={{ fontSize: '15px', padding: '14px 32px' }}>
              See All Pricing
            </Link>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '16px' }}>$69/mo · $97 one-time scan · No credit card for preview</p>
        </div>
      </div>
    </>
  )
}
