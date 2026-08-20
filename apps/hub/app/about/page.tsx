import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About | BizLegal AI',
  description: 'BizLegal AI was built by an LLB, LLM-qualified international commercial lawyer, notary, and arbitrator with 20 years of practice. Not a startup. An authority.',
  alternates: { canonical: 'https://bizlegal-ai.com/about' },
}

const CREDENTIALS = [
  { title: 'LLB', sub: 'Bachelor of Laws' },
  { title: 'LLM', sub: 'Master of Laws — International Commercial Law' },
  { title: '20 Years', sub: 'Active Legal Practice' },
  { title: 'Notary', sub: 'Commissioned Notary Public' },
  { title: 'Arbitrator', sub: 'International Commercial Arbitration' },
  { title: 'Multi-Jurisdiction', sub: 'UAE, EU, US, UK, Singapore' },
]

const WHY = [
  {
    title: 'Built from Practice, Not Theory',
    desc: 'Every product in the BizLegal AI system solves a real problem from legal practice. Not a feature request from a product roadmap — a daily frustration from 20 years of commercial law work.',
  },
  {
    title: 'No Hallucination Without Accountability',
    desc: 'Every AI output carries a confidence score, source citations, and an audit trail. Litigation-tier outputs require expert attorney review. We do not release outputs we cannot stand behind.',
  },
  {
    title: 'Six Products. One Standard.',
    desc: 'BRAI, TRACR, LexAudit, DocAI, Forge, and LeadForge all share the same accuracy standard. Jurisdiction-aware. Regulation-cited. Expert-reviewable.',
  },
  {
    title: 'Clear Language. Real Answers.',
    desc: 'Legal output should be readable, not impressive. Every product page, certificate, and report is written in plain English with specific regulatory references. No jargon without explanation.',
  },
]

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <section style={{ padding: '80px 32px 64px', maxWidth: 900, margin: '0 auto' }}>
        <span className="section-label">Who Built This</span>
        <h1 style={{ marginBottom: 20 }}>Built by a Practitioner,<br />Not a Product Team</h1>
        <p style={{ fontSize: 16, lineHeight: 1.8, maxWidth: 640 }}>
          BizLegal AI is a legal technology system built by an international commercial lawyer
          with 20 years of active practice. Every tool addresses a real compliance gap
          that legal professionals encounter daily.
        </p>
      </section>

      {/* Credentials */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px 64px' }}>
        <h2 style={{ marginBottom: 28 }}>Credentials</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {CREDENTIALS.map(c => (
            <div key={c.title} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--secondary)', marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '0.5px solid var(--outline-var)', maxWidth: 900, margin: '0 auto 64px' }} />

      {/* Why */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px 80px' }}>
        <h2 style={{ marginBottom: 40 }}>Why This Exists</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {WHY.map(w => (
            <div key={w.title} className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 10, fontSize: 16 }}>{w.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.7 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section style={{ background: 'var(--bg-low)', borderTop: '0.5px solid var(--outline-var)', padding: '64px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ marginBottom: 12 }}>The Six Products</h2>
          <p style={{ marginBottom: 32, fontSize: 15 }}>
            Each product solves one compliance problem. No bloat. No feature creep. Focused tools that work.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['BRAI', 'TRACR', 'LexAudit', 'DocAI', 'Forge', 'LeadForge'].map(name => (
              <Link key={name} href={`/${name.toLowerCase()}`} className="btn-ghost" style={{ fontSize: 12 }}>
                {name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ padding: '64px 32px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ marginBottom: 16 }}>Contact</h2>
        <p style={{ marginBottom: 24, fontSize: 15 }}>
          For partnership inquiries, expert review requests, or legal questions, reach us directly.
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <a href="mailto:team@bizlegal-ai.com" className="btn-primary">team@bizlegal-ai.com</a>
          <Link href="/contact" className="btn-ghost">Send a message</Link>
        </div>
      </section>
    </div>
  )
}
