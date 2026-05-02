'use client'
import Link from 'next/link'
import { useState } from 'react'

const TOOLS = ['Harvey', 'Legora', 'ChatGPT', 'CoCounsel', 'Co-Pilot', 'Other']

const FEATURES = [
  { icon: '📊', title: 'Compliance Health Score', desc: 'A 0–100 score plus written rationale across five frameworks. Source-cited, version-stamped, analyst-reviewed.' },
  { icon: '⚡', title: '2–5 minute snapshot', desc: 'Log the AI tool, prompt, edits, reviewer. The score and rationale are produced and held until a named analyst signs off.' },
  { icon: '🔒', title: 'Privilege-preserving by architecture', desc: 'No document content stored. Only metadata. The page text never leaves your firm.' },
  { icon: '📄', title: 'Audit-ready intelligence', desc: 'Tamper-evident SHA-256 hash on every snapshot. Attach to a matter file, an audit, or a regulator response — as intelligence, not as a verdict.' },
]

const STEPS = [
  { n: '01', title: 'Open a Matter', desc: 'Name the document and client ref.' },
  { n: '02', title: 'Log AI Usage', desc: 'Tool used, prompt summary, edits made.' },
  { n: '03', title: 'Partner Reviews', desc: 'Reviewer signs off inside the platform.' },
  { n: '04', title: 'Score Released', desc: 'Hashed Compliance Health Score, stored immutably, ready to attach.' },
]

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: '#050509', color: '#e2e8f0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #0f172a', background: 'rgba(5,5,9,0.95)', backdropFilter: 'blur(20px)', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#c9a84c,#7a5c20)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚖</div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '18px' }}>LexAudit</span>
        </div>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          {[['How it works', '#how'], ['Methodology', '/methodology'], ['Security', '/security'], ['Pricing', '/pricing']].map(([label, href]) => (
            <a key={label} href={href} style={{ color: '#64748b', fontSize: '13px', textDecoration: 'none' }}>{label}</a>
          ))}
          <Link href="/login" style={{ background: 'linear-gradient(135deg,#c9a84c,#a07830)', color: '#0a0a0f', borderRadius: '8px', padding: '9px 20px', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '100px 40px 80px', maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#0f0f0a', border: '1px solid #2a2010', borderRadius: '100px', padding: '6px 16px', marginBottom: '28px' }}>
          <span style={{ color: '#c9a84c', fontSize: '12px', letterSpacing: '2px' }}>✦ REGULATORY INTELLIGENCE — NOT LEGAL ADVICE</span>
        </div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(40px,6vw,68px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
          Score your AI workflow<br /><span style={{ color: '#c9a84c' }}>before someone else does.</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '18px', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 40px' }}>
          Every time you use AI on a client matter, you create a documentation gap. LexAudit closes it — with a versioned, source-cited Compliance Health Score and written rationale, delivered in 2–5 minutes after analyst review.
        </p>

        {/* Email capture */}
        {!submitted ? (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', maxWidth: '460px', margin: '0 auto 16px' }}>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@lawfirm.com"
              style={{ flex: 1, background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', color: '#e2e8f0', padding: '14px 16px', fontSize: '14px', outline: 'none' }}
            />
            <button
              onClick={() => email.includes('@') && setSubmitted(true)}
              style={{ background: 'linear-gradient(135deg,#c9a84c,#a07830)', color: '#0a0a0f', border: 'none', borderRadius: '10px', padding: '14px 24px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Start Free →
            </button>
          </div>
        ) : (
          <div style={{ background: '#0a1a0a', border: '1px solid #166534', borderRadius: '10px', padding: '16px 24px', maxWidth: '460px', margin: '0 auto 16px', color: '#22c55e', fontSize: '14px' }}>
            ✓ You're on the list. Check your inbox within 24 hours.
          </div>
        )}
        <p style={{ color: '#334155', fontSize: '12px' }}>Free beta · No credit card · 3 months free for early users</p>

        {/* Tool logos */}
        <div style={{ marginTop: '48px' }}>
          <p style={{ color: '#334155', fontSize: '11px', letterSpacing: '2px', marginBottom: '16px' }}>WORKS WITH ANY AI TOOL</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {TOOLS.map(t => (
              <span key={t} style={{ background: '#080810', border: '1px solid #1e293b', borderRadius: '100px', padding: '6px 14px', fontSize: '12px', color: '#64748b' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid #0f172a', maxWidth: '1100px', margin: '0 auto' }} />

      {/* FEATURES */}
      <section style={{ padding: '80px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{ color: '#c9a84c', fontSize: '11px', letterSpacing: '4px', marginBottom: '12px', textAlign: 'center' }}>WHY LEXAUDIT</p>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '34px', textAlign: 'center', marginBottom: '48px' }}>Decision-grade analysis. Not a verdict, not a filing.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: '#080810', border: '1px solid #1a1a2e', borderRadius: '14px', padding: '28px 24px' }}>
              <div style={{ fontSize: '28px', marginBottom: '14px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: '#475569', fontSize: '13px', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '80px 40px', maxWidth: '1000px', margin: '0 auto' }}>
        <p style={{ color: '#c9a84c', fontSize: '11px', letterSpacing: '4px', marginBottom: '12px', textAlign: 'center' }}>PROCESS</p>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '34px', textAlign: 'center', marginBottom: '48px' }}>From AI use to a hashed score in four steps</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '24px' }}>
          {STEPS.map(s => (
            <div key={s.n} style={{ background: '#080810', border: '1px solid #1a1a2e', borderRadius: '14px', padding: '28px 22px' }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '42px', color: '#1e293b', fontWeight: 900, marginBottom: '12px' }}>{s.n}</div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>{s.title}</h3>
              <p style={{ color: '#475569', fontSize: '13px', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(135deg,#0f0f05,#0a0a15)', border: '1px solid #2a2010', borderRadius: '20px', padding: '60px 48px' }}>
          <p style={{ color: '#c9a84c', fontSize: '11px', letterSpacing: '3px', marginBottom: '14px' }}>FREE BETA ACCESS</p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '32px', lineHeight: 1.2, marginBottom: '14px' }}>Start logging your AI workflow today.</h2>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.7, marginBottom: '28px' }}>No credit card. 3 months free. Cancel anytime.</p>
          <Link href="/login" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#c9a84c,#a07830)', color: '#0a0a0f', borderRadius: '10px', padding: '16px 36px', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }}>
            Create Free Account →
          </Link>
          <p style={{ color: '#1e293b', fontSize: '11px', marginTop: '14px' }}>Regulatory intelligence — not legal advice. Not a law firm. No attorney-client relationship.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #0f172a', padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', background: 'linear-gradient(135deg,#c9a84c,#7a5c20)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>⚖</div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '14px' }}>LexAudit</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Disclaimer', '/disclaimer'], ['Security', '/security']].map(([label, href]) => (
            <Link key={label} href={href} style={{ color: '#334155', fontSize: '12px', textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
        <p style={{ color: '#1e293b', fontSize: '11px' }}>© 2026 LexAudit · lexaudit.bizlegal-ai.com</p>
      </footer>
    </div>
  )
}
