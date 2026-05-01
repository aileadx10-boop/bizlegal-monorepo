import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Social Content Hub — BizLegal AI | Follow Us for Weekly Regulatory Intelligence',
  description: 'Follow BizLegal AI across LinkedIn, X, Instagram, YouTube, Substack, Facebook, and Pinterest. 5 posts per week — VARA updates, MiCA news, SEC enforcement, digital asset regulatory intelligence.',
  keywords: 'BizLegal AI social media, digital asset regulatory news, VARA LinkedIn, crypto compliance Instagram, blockchain regulation YouTube',
  alternates: { canonical: 'https://bizlegal-ai.com/social-hub' },
}

const PLATFORMS = [
  {
    name: 'LinkedIn',
    handle: '@DorInnovations',
    url: 'https://www.linkedin.com/company/DorInnovations',
    icon: '💼',
    color: '#0A66C2',
    bg: 'rgba(10,102,194,0.08)',
    border: 'rgba(10,102,194,0.25)',
    freq: '5× / week',
    audience: 'Founders, Attorneys, Investors',
    contentType: 'Deep-dive regulatory analysis, case studies, compliance frameworks',
  },
  {
    name: 'X / Twitter',
    handle: '@DorInnovations',
    url: 'https://x.com/DorInnovations',
    icon: '𝕏',
    color: '#ffffff',
    bg: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.15)',
    freq: '5× / week',
    audience: 'Crypto founders, Traders, Regulators',
    contentType: 'Breaking regulatory news, quick insights, enforcement alerts',
  },
  {
    name: 'Instagram',
    handle: '@dorinnovations',
    url: 'https://www.instagram.com/dorinnovations/',
    icon: '📸',
    color: '#E1306C',
    bg: 'rgba(225,48,108,0.08)',
    border: 'rgba(225,48,108,0.25)',
    freq: '5× / week',
    audience: 'Digital asset founders, Tech entrepreneurs',
    contentType: 'Infographics, regulatory flowcharts, jurisdiction comparison visuals',
  },
  {
    name: 'YouTube',
    handle: '@DorInnovations',
    url: 'https://www.youtube.com/@DorInnovations',
    icon: '▶',
    color: '#FF0000',
    bg: 'rgba(255,0,0,0.06)',
    border: 'rgba(255,0,0,0.2)',
    freq: '2× / week',
    audience: 'Founders, Legal professionals',
    contentType: 'VARA/MiCA explainers, compliance walkthroughs, regulatory updates',
  },
  {
    name: 'Substack',
    handle: '@dorinnovations',
    url: 'https://substack.com/@dorinnovations',
    icon: '📨',
    color: '#FF6719',
    bg: 'rgba(255,103,25,0.08)',
    border: 'rgba(255,103,25,0.25)',
    freq: '1× / week',
    audience: 'Digital asset founders, Attorneys, Investors',
    contentType: 'In-depth weekly regulatory intelligence newsletter',
  },
  {
    name: 'Facebook',
    handle: 'DorInnovations',
    url: 'https://www.facebook.com/DorInnovations/',
    icon: 'f',
    color: '#1877F2',
    bg: 'rgba(24,119,242,0.08)',
    border: 'rgba(24,119,242,0.25)',
    freq: '3× / week',
    audience: 'Business owners, Legal professionals',
    contentType: 'Regulatory news, product updates, educational content',
  },
  {
    name: 'Pinterest',
    handle: 'DorInnovations',
    url: 'https://www.pinterest.com/DorInnovations/',
    icon: '𝐏',
    color: '#E60023',
    bg: 'rgba(230,0,35,0.06)',
    border: 'rgba(230,0,35,0.2)',
    freq: '3× / week',
    audience: 'Researchers, Visual learners',
    contentType: 'Regulatory infographics, jurisdiction maps, compliance checklists',
  },
]

// 5-day weekly content calendar
const CALENDAR = [
  {
    day: 'Monday',
    theme: 'VARA & UAE Focus',
    color: '#fbbf24',
    posts: [
      { platform: 'LinkedIn', content: 'Deep-dive: VARA regulatory update or MVL/MPI/MSC license analysis with step-by-step framework' },
      { platform: 'X / Twitter', content: 'Breaking: Latest VARA enforcement action or rule update — key takeaways in 3 points' },
      { platform: 'Instagram', content: 'Infographic: VARA license types comparison chart — MVL vs MPI vs MSC visual breakdown' },
      { platform: 'Facebook', content: 'Share LinkedIn article + UAE digital asset regulatory overview' },
      { platform: 'Pinterest', content: 'Pin: UAE/DIFC regulatory framework diagram' },
    ],
  },
  {
    day: 'Tuesday',
    theme: 'MiCA & EU Regulation',
    color: 'var(--sky)',
    posts: [
      { platform: 'LinkedIn', content: 'MiCA analysis: Token classification, CASP requirements, or EU passporting strategy guide' },
      { platform: 'X / Twitter', content: 'MiCA enforcement alert or ESMA technical standard update with action required' },
      { platform: 'Instagram', content: 'Infographic: MiCA token classification flowchart — ART vs EMT vs Utility visual guide' },
      { platform: 'YouTube', content: 'Short: "MiCA in 5 minutes" — what digital asset founders need to know this week' },
      { platform: 'Pinterest', content: 'Pin: MiCA compliance checklist infographic' },
    ],
  },
  {
    day: 'Wednesday',
    theme: 'Product Spotlight & Tools',
    color: 'var(--indigo)',
    posts: [
      { platform: 'LinkedIn', content: 'BRAI or DocStack feature spotlight — how our AI tools solve a specific regulatory problem' },
      { platform: 'X / Twitter', content: 'Free tool highlight: "Run your VARA/MiCA/SEC compliance scan free in 60 seconds →"' },
      { platform: 'Instagram', content: 'Product demo visual: BRAI scan results screenshot or DocStack template generation workflow' },
      { platform: 'Facebook', content: 'Product post: BRAI free scan CTA with jurisdiction coverage graphic' },
      { platform: 'Substack', content: 'Weekly newsletter: Deep regulatory intelligence issue covering week\'s top stories' },
    ],
  },
  {
    day: 'Thursday',
    theme: 'SEC / US & Cross-Border',
    color: 'var(--teal)',
    posts: [
      { platform: 'LinkedIn', content: 'SEC digital asset enforcement action analysis or Howey Test framework applied to current token structure' },
      { platform: 'X / Twitter', content: 'SEC alert: Latest enforcement action or Gensler statement — what it means for your token' },
      { platform: 'Instagram', content: 'Infographic: Cross-border comparison — UAE vs EU vs US regulatory approach side by side' },
      { platform: 'YouTube', content: 'Deep-dive video: Cross-border digital asset structuring — UAE to EU to US strategy walkthrough' },
      { platform: 'Pinterest', content: 'Pin: 6-jurisdiction comparison matrix visual' },
    ],
  },
  {
    day: 'Friday',
    theme: 'Education & Community',
    color: '#a78bfa',
    posts: [
      { platform: 'LinkedIn', content: 'Free guide or resource post: "Download our UAE Digital Asset Regulatory Checklist — link in bio"' },
      { platform: 'X / Twitter', content: 'Week in review: Top 3 digital asset regulatory developments you need to know' },
      { platform: 'Instagram', content: 'Visual quote card: Key insight from the week\'s regulatory intelligence + BizLegal AI branding' },
      { platform: 'Facebook', content: 'Community post: Ask a compliance question or share a regulatory challenge' },
      { platform: 'Pinterest', content: 'Pin: Weekly regulatory intelligence roundup graphic' },
    ],
  },
]

const CONTENT_PILLARS = [
  { icon: '🇦🇪', title: 'UAE / VARA Intelligence', desc: 'MVL, MPI, MSC licenses. VARA enforcement updates. DIFC/DFSA analysis. Primary focus.', color: '#fbbf24' },
  { icon: '🇪🇺', title: 'MiCA & EU Regulation', desc: 'Token classification. CASP licensing. EU passporting. White paper requirements.', color: 'var(--sky)' },
  { icon: '🇺🇸', title: 'SEC & US Framework', desc: 'Howey Test analysis. Reg D strategy. CFTC jurisdiction. Enforcement actions.', color: 'var(--teal)' },
  { icon: '⚡', title: 'Product Intelligence', desc: 'BRAI updates. DocStack new templates. TRACR forensic case studies.', color: 'var(--indigo)' },
  { icon: '🌍', title: 'Cross-Border Strategy', desc: 'Multi-jurisdiction structuring. Singapore MAS. UK FCA. Canada CSA.', color: '#a78bfa' },
  { icon: '📊', title: 'Infographics & Visuals', desc: 'Regulatory flowcharts. Jurisdiction comparison maps. Compliance checklists.', color: '#fb7185' },
]

export default function SocialHubPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Nav */}
      <div style={{ background: 'rgba(7,9,26,0.95)', borderBottom: '1px solid rgba(125,211,252,0.08)', position: 'sticky', top: 0, zIndex: 200 }}>
        <div className="container" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" className="nav-logo" style={{ marginRight: 'auto' }}>DOR<em>INNOVATIONS</em></Link>
          <Link href="/blog" style={{ fontSize: '12px', color: 'var(--muted)', textDecoration: 'none', fontFamily: 'Geist Mono, monospace' }}>Blog</Link>
          <a href="https://brai.bizlegal-ai.com" className="btn-ghost" style={{ fontSize: '12px' }}>Free Scan</a>
          <a href="https://docstack.bizlegal-ai.com" className="btn-primary" style={{ fontSize: '12px' }}>Templates →</a>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: '80px 24px 60px', maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(125,211,252,0.2)', background: 'rgba(125,211,252,0.05)', fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: 'var(--sky)', marginBottom: '24px' }}>
          📲 7 Platforms · 5× Per Week · Regulatory Intelligence
        </div>
        <h1 style={{ fontFamily: 'Gloock, serif', fontSize: 'clamp(36px, 5vw, 60px)', color: 'var(--white)', lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-0.02em' }}>
          Follow BizLegal AI —<br /><em style={{ fontStyle: 'italic', color: 'var(--sky)' }}>Regulatory Intelligence, Daily</em>
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto 36px' }}>
          VARA updates, MiCA enforcement news, SEC actions, cross-border insights — published 5 times per week across all platforms. Free to follow.
        </p>

        {/* Platform grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {PLATFORMS.slice(0, 4).map(p => (
            <a key={p.name} href={p.url} target="_blank" rel="noreferrer" style={{ padding: '20px 16px', borderRadius: '14px', border: `1px solid ${p.border}`, background: p.bg, textDecoration: 'none', textAlign: 'center', transition: 'transform 0.2s' }} className="social-platform-card">
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{p.icon}</div>
              <div style={{ fontSize: '13px', fontFamily: 'Gloock, serif', color: 'var(--white)', marginBottom: '4px' }}>{p.name}</div>
              <div style={{ fontSize: '10px', color: p.color, fontFamily: 'Geist Mono, monospace' }}>{p.freq}</div>
            </a>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {PLATFORMS.slice(4).map(p => (
            <a key={p.name} href={p.url} target="_blank" rel="noreferrer" style={{ padding: '20px 16px', borderRadius: '14px', border: `1px solid ${p.border}`, background: p.bg, textDecoration: 'none', textAlign: 'center', transition: 'transform 0.2s' }} className="social-platform-card">
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{p.icon}</div>
              <div style={{ fontSize: '13px', fontFamily: 'Gloock, serif', color: 'var(--white)', marginBottom: '4px' }}>{p.name}</div>
              <div style={{ fontSize: '10px', color: p.color, fontFamily: 'Geist Mono, monospace' }}>{p.freq}</div>
            </a>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Content Pillars */}
        <div style={{ marginBottom: '60px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--teal)', fontFamily: 'Geist Mono, monospace', marginBottom: '16px' }}>Content Strategy</div>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '32px', color: 'var(--white)', marginBottom: '32px' }}>6 Content Pillars</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {CONTENT_PILLARS.map(p => (
              <div key={p.title} style={{ padding: '24px', borderRadius: '14px', border: `1px solid ${p.color}20`, background: 'rgba(7,9,26,0.6)' }}>
                <span style={{ fontSize: '24px' }}>{p.icon}</span>
                <h3 style={{ fontFamily: 'Gloock, serif', fontSize: '16px', color: 'var(--white)', margin: '10px 0 8px' }}>{p.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Calendar */}
        <div style={{ marginBottom: '60px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--teal)', fontFamily: 'Geist Mono, monospace', marginBottom: '16px' }}>Publishing Schedule</div>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '32px', color: 'var(--white)', marginBottom: '32px' }}>5× Weekly Content Calendar</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {CALENDAR.map(day => (
              <div key={day.day} style={{ borderRadius: '16px', border: '1px solid rgba(125,211,252,0.08)', background: 'rgba(7,9,26,0.6)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(125,211,252,0.06)', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(7,9,26,0.4)' }}>
                  <span style={{ fontFamily: 'Gloock, serif', fontSize: '18px', color: 'var(--white)', minWidth: '100px' }}>{day.day}</span>
                  <span style={{ fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: day.color, background: `${day.color}15`, padding: '3px 10px', borderRadius: '6px', border: `1px solid ${day.color}25` }}>{day.theme}</span>
                </div>
                <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {day.posts.map((post, i) => (
                    <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: 'var(--sky)', background: 'rgba(125,211,252,0.07)', padding: '3px 10px', borderRadius: '4px', border: '1px solid rgba(125,211,252,0.12)', flexShrink: 0, minWidth: '90px', textAlign: 'center' }}>{post.platform}</span>
                      <span style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>{post.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Detail */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '28px' }}>Platform Strategy</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {PLATFORMS.map(p => (
              <a key={p.name} href={p.url} target="_blank" rel="noreferrer" style={{ padding: '24px', borderRadius: '14px', border: `1px solid ${p.border}`, background: p.bg, textDecoration: 'none', display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: '20px', alignItems: 'center' }}>
                <span style={{ fontSize: '28px' }}>{p.icon}</span>
                <div>
                  <div style={{ fontFamily: 'Gloock, serif', fontSize: '16px', color: 'var(--white)', marginBottom: '4px' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'Geist Mono, monospace' }}>{p.handle}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{p.contentType}</div>
                  <div style={{ fontSize: '11px', color: 'var(--dim)' }}>Audience: {p.audience}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', color: p.color, fontFamily: 'Geist Mono, monospace', fontWeight: 700 }}>{p.freq}</div>
                  <div style={{ fontSize: '11px', color: 'var(--sky)', fontFamily: 'Geist Mono, monospace', marginTop: '4px' }}>Follow →</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '48px', borderRadius: '20px', background: 'radial-gradient(ellipse at 50% 0%, rgba(125,211,252,0.07) 0%, rgba(7,9,26,0.9) 60%)', border: '1px solid rgba(125,211,252,0.12)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '12px' }}>
            Never miss regulatory intelligence
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '28px', lineHeight: 1.75 }}>
            Subscribe to the Substack for weekly deep-dives, or follow on LinkedIn for daily regulatory updates.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://substack.com/@dorinnovations" target="_blank" rel="noreferrer" className="lx-btn-p" style={{ background: 'rgba(255,103,25,0.1)', borderColor: 'rgba(255,103,25,0.3)', color: '#FF6719' }}>Subscribe on Substack →</a>
            <a href="https://www.linkedin.com/company/DorInnovations" target="_blank" rel="noreferrer" className="lx-btn-g">Follow on LinkedIn</a>
          </div>
        </div>
      </div>
    </div>
  )
}
