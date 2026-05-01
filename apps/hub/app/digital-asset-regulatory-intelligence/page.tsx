import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Digital Asset Regulatory Intelligence — AI-Powered Compliance Analysis | BizLegal AI',
  description: 'BizLegal AI: AI-powered digital asset regulatory intelligence for founders, funds, and attorneys. VARA, MiCA, SEC, MAS analysis. Boutique regulatory risk intelligence from a commercial attorney.',
  keywords: 'digital asset regulatory intelligence, crypto compliance AI, blockchain regulatory analysis, BizLegal AI, VARA MiCA SEC compliance, AI regulatory risk intelligence',
  alternates: { canonical: 'https://bizlegal-ai.com/digital-asset-regulatory-intelligence' },
  openGraph: {
    title: 'Digital Asset Regulatory Intelligence | BizLegal AI',
    description: 'Boutique AI-powered regulatory risk intelligence for digital asset ventures. UAE/DIFC focus. Free scan available.',
    url: 'https://bizlegal-ai.com/digital-asset-regulatory-intelligence',
  },
}

export default function DigitalAssetIntelligencePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingTop: '36px' }}>
      <div style={{ background: 'rgba(7,9,26,0.95)', borderBottom: '1px solid rgba(125,211,252,0.08)' }}>
        <div className="container" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" className="nav-logo" style={{ marginRight: 'auto' }}>DOR<em>INNOVATIONS</em></Link>
          <a href="https://brai.bizlegal-ai.com" className="btn-ghost" style={{ fontSize: '12px' }}>Free Scan</a>
          <a href="https://docstack.bizlegal-ai.com" className="btn-primary" style={{ fontSize: '12px' }}>Templates →</a>
        </div>
      </div>

      <div style={{ padding: '90px 24px 70px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(125,211,252,0.2)', background: 'rgba(125,211,252,0.05)', fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: 'var(--sky)', marginBottom: '28px' }}>
          ⚖️ Commercial Attorney · AI-Assisted
        </div>
        <h1 style={{ fontFamily: 'Gloock, serif', fontSize: 'clamp(40px, 6vw, 68px)', color: 'var(--white)', lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-0.02em' }}>
          Digital Asset Regulatory Intelligence —<br /><em style={{ fontStyle: 'italic', color: 'var(--sky)' }}>Engineered for Precision</em>
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--muted)', lineHeight: 1.8, maxWidth: '680px', margin: '0 auto 40px' }}>
          BizLegal AI provides structured AI-driven regulatory risk intelligence for digital asset ventures. Operating at the intersection of commercial legal strategy, cross-border regulatory analysis, and AI-assisted risk assessment. UAE / DIFC primary focus.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://brai.bizlegal-ai.com" className="lx-btn-p" style={{ fontSize: '15px', padding: '16px 36px' }}>Free Regulatory Scan →</a>
          <Link href="/about" className="lx-btn-g">About BizLegal AI</Link>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* What is Regulatory Intelligence */}
        <div style={{ padding: '40px', borderRadius: '20px', border: '1px solid rgba(125,211,252,0.1)', background: 'rgba(7,9,26,0.7)', marginBottom: '48px' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '26px', color: 'var(--white)', marginBottom: '20px' }}>What is Digital Asset Regulatory Intelligence?</h2>
          <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '16px' }}>
            Regulatory intelligence is a proactive risk management approach: mapping your venture's specific structure against applicable regulatory frameworks <em>before</em> problems emerge. It's distinct from traditional legal compliance, which is reactive — addressing issues after regulators identify them.
          </p>
          <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.8 }}>
            For digital asset ventures, regulatory intelligence means: knowing exactly which licenses you need (and don't need), which jurisdictions you're exposed to, what your token classification means for investors, and how to structure your operations to minimise regulatory friction across all relevant jurisdictions.
          </p>
        </div>

        {/* DOR Intelligence Products */}
        <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '28px' }}>Three Intelligence Instruments</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '48px' }}>
          {[
            { icon: '⚡', name: 'BRAI', color: 'var(--indigo)', desc: 'AI regulatory risk scanning across 6 jurisdictions. VARA, MiCA, SEC, MAS simultaneously. Free in under 60 seconds.', href: 'https://brai.bizlegal-ai.com', cta: 'Learn More →' },
            { icon: '📄', name: 'DocAI', color: 'var(--sky)', desc: 'Commercial attorney-drafted contract templates. Jurisdiction-ready documentation for digital asset ventures. From $49.', href: 'https://docai.bizlegal-ai.com', cta: 'Browse Templates →' },
            { icon: '🔬', name: 'TRACR', color: 'var(--teal)', desc: 'AI forensic investigation for digital asset disputes. Forensic blockchain intelligence reports for litigation. From $99.', href: 'https://tracr.bizlegal-ai.com', cta: 'Learn More →' },
          ].map(p => (
            <div key={p.name} style={{ padding: '28px', borderRadius: '16px', border: `1px solid ${p.color}25`, background: 'rgba(7,9,26,0.7)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{p.icon}</div>
              <h3 style={{ fontFamily: 'Gloock, serif', fontSize: '20px', color: 'var(--white)', marginBottom: '10px' }}>{p.name}</h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65, flex: 1, marginBottom: '16px' }}>{p.desc}</p>
              <a href={p.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: p.color, fontFamily: 'Geist Mono, monospace', fontWeight: 700, textDecoration: 'none' }}>{p.cta}</a>
            </div>
          ))}
        </div>

        {/* Who it's for */}
        <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '24px' }}>Who Uses BizLegal AI</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '48px' }}>
          {[
            { icon: '🏗️', title: 'Digital Asset Founders', desc: 'Pre-launch regulatory analysis. Token classification, licensing requirements, cross-border structuring before you build.' },
            { icon: '🇦🇪', title: 'UAE / DIFC Ventures', desc: 'VARA and DFSA regulatory intelligence. MVL, MPI, MSC licensing pathways. UAE primary focus.' },
            { icon: '🏦', title: 'Investment Funds', desc: 'Fund structuring, capital call agreements, cross-border regulatory compliance for digital asset funds.' },
            { icon: '⚖️', title: 'Commercial Attorneys', desc: 'TRACR forensic reports for litigation support. AI-assisted regulatory analysis for client screening.' },
            { icon: '🌐', title: 'Cross-Border Operators', desc: 'Multi-jurisdiction regulatory strategy. UAE → EU → US parallel compliance analysis.' },
            { icon: '🚀', title: 'Token Issuers', desc: 'Token classification, investor protection compliance, white paper requirements across VARA, MiCA, and SEC.' },
          ].map(w => (
            <div key={w.title} style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(125,211,252,0.08)', background: 'rgba(7,9,26,0.5)', display: 'flex', gap: '14px' }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{w.icon}</span>
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--white)', display: 'block', marginBottom: '4px' }}>{w.title}</strong>
                <span style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65 }}>{w.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Key Pages */}
        <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '24px' }}>Regulatory Intelligence by Jurisdiction</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '48px' }}>
          {[
            { flag: '🇦🇪', name: 'UAE / VARA', href: '/vara-compliance' },
            { flag: '🇪🇺', name: 'EU / MiCA', href: '/mica-regulation-2025' },
            { flag: '🌍', name: 'Cross-Border', href: '/cross-border-compliance' },
            { flag: '🔍', name: 'Risk Analysis', href: '/digital-asset-risk-analysis' },
            { flag: '🏙️', name: 'UAE / DIFC Overview', href: '/uae-difc-crypto-regulation' },
            { flag: '📋', name: 'VARA MVL License', href: '/vara-mvl-license' },
          ].map(l => (
            <Link key={l.name} href={l.href} style={{ padding: '16px', borderRadius: '10px', border: '1px solid rgba(125,211,252,0.08)', background: 'rgba(7,9,26,0.5)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '18px' }}>{l.flag}</span>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{l.name}</span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: '60px', borderRadius: '20px', background: 'radial-gradient(ellipse at 50% 0%, rgba(125,211,252,0.07) 0%, rgba(7,9,26,0.9) 60%)', border: '1px solid rgba(125,211,252,0.12)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '32px', color: 'var(--white)', marginBottom: '12px' }}>
            Start with a free intelligence scan
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '28px', lineHeight: 1.75 }}>
            BRAI — AI-powered regulatory risk analysis across 6 jurisdictions. No signup. Under 60 seconds.
          </p>
          <a href="https://brai.bizlegal-ai.com" className="lx-btn-p" style={{ fontSize: '15px', padding: '16px 40px' }}>
            Free Regulatory Scan →
          </a>
        </div>
      </div>
    </div>
  )
}
