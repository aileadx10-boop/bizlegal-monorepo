'use client'

import { useState, useEffect, useRef } from 'react'

/* ─── Design Tokens ──────────────────────────────────────────────────────── */
const C = {
  bg: '#07090e', surface: '#0d1118', card: '#111622',
  border: '#1a2035', borderLight: '#222840',
  text: '#e8ecf4', muted: '#5a6278', dim: '#2e3450',
  amber: '#d4a843', amberDim: '#8c6b24',
  amberBg: 'rgba(212,168,67,0.08)', amberBorder: 'rgba(212,168,67,0.22)',
  red: '#c0392b', redBg: 'rgba(192,57,43,0.09)', redBorder: 'rgba(192,57,43,0.28)',
  redGlow: 'rgba(192,57,43,0.18)',
  green: '#27ae60', greenBg: 'rgba(39,174,96,0.08)',
  orange: '#e67e22',
  mono: '"DM Mono","Fira Code",ui-monospace,monospace',
  serif: '"Playfair Display",Georgia,serif',
  sans: '"DM Sans",system-ui,-apple-system,sans-serif',
}

/* ─── Scroll Fade-In Hook ─────────────────────────────────────────────────── */
function useFadeIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

/* ─── Animated Counter ───────────────────────────────────────────────────── */
function Counter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0)
  const { ref, visible } = useFadeIn(0.5)
  useEffect(() => {
    if (!visible) return
    const dur = 1800
    const step = 16
    const inc = target / (dur / step)
    let cur = 0
    const t = setInterval(() => {
      cur = Math.min(cur + inc, target)
      setVal(Math.floor(cur))
      if (cur >= target) clearInterval(t)
    }, step)
    return () => clearInterval(t)
  }, [visible, target])
  return (
    <span ref={ref} style={{ fontFamily: C.mono }}>
      {prefix}{val.toLocaleString()}{suffix}
    </span>
  )
}

/* ─── Typewriter ─────────────────────────────────────────────────────────── */
function Typewriter({ phrases, speed = 80 }: { phrases: string[]; speed?: number }) {
  const [idx, setIdx] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    const full = phrases[idx % phrases.length]
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(full.slice(0, text.length + 1))
        if (text.length + 1 === full.length) setTimeout(() => setDeleting(true), 1800)
      } else {
        setText(full.slice(0, text.length - 1))
        if (text.length - 1 === 0) { setDeleting(false); setIdx(i => i + 1) }
      }
    }, deleting ? speed / 2 : speed)
    return () => clearTimeout(timeout)
  }, [text, deleting, idx, phrases, speed])
  return (
    <span style={{ color: C.amber }}>
      {text}
      <span style={{ borderRight: `2px solid ${C.amber}`, animation: 'blink 1s step-end infinite', marginLeft: 2 }} />
    </span>
  )
}

/* ─── FAQ Item ───────────────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      borderBottom: `1px solid ${C.border}`,
      transition: 'background 0.2s',
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        textAlign: 'left',
      }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: C.text, fontFamily: C.sans, paddingRight: 16 }}>{q}</span>
        <span style={{
          color: C.amber, fontSize: 18, flexShrink: 0, transition: 'transform 0.3s',
          transform: open ? 'rotate(45deg)' : 'none',
          fontFamily: C.mono,
        }}>+</span>
      </button>
      <div style={{
        overflow: 'hidden', maxHeight: open ? 300 : 0, transition: 'max-height 0.4s ease',
      }}>
        <p style={{ paddingBottom: 20, fontSize: 14, color: C.muted, lineHeight: 1.75, margin: 0 }}>{a}</p>
      </div>
    </div>
  )
}

/* ─── Hover-Tilt Card ────────────────────────────────────────────────────── */
function TiltCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  function onMove(e: React.MouseEvent) {
    const el = ref.current!
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * 12
    const y = ((e.clientY - r.top) / r.height - 0.5) * -12
    el.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${y}deg) scale(1.02)`
  }
  function onLeave() { ref.current!.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)' }
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transition: 'transform 0.2s ease', ...style }}>
      {children}
    </div>
  )
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [faqOpenAll] = useState(false)

  const hero = useFadeIn(0.05)
  const stats = useFadeIn(0.2)
  const how = useFadeIn(0.15)
  const pricing = useFadeIn(0.15)
  const faq = useFadeIn(0.15)
  const testi = useFadeIn(0.15)

  void faqOpenAll

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: C.sans, overflowX: 'hidden' }}>

      {/* ── Global Animations ── */}
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes float2 { 0%,100%{transform:translateY(-8px)} 50%{transform:translateY(12px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.2);opacity:0} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes gradient-shift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes blob-morph {
          0%,100%{border-radius:60% 40% 30% 70% / 60% 30% 70% 40%}
          25%{border-radius:30% 60% 70% 40% / 50% 60% 30% 60%}
          50%{border-radius:50% 60% 30% 60% / 30% 40% 70% 40%}
          75%{border-radius:40% 30% 60% 70% / 60% 70% 30% 50%}
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes stagger-in { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes particle-float {
          0%{transform:translate(0,0) scale(1);opacity:0.4}
          33%{transform:translate(var(--dx1),var(--dy1)) scale(1.3);opacity:0.7}
          66%{transform:translate(var(--dx2),var(--dy2)) scale(0.8);opacity:0.3}
          100%{transform:translate(0,0) scale(1);opacity:0.4}
        }
        .fade-up { opacity:0; }
        .fade-up.visible { animation: fadeUp 0.7s ease forwards; }
        .stagger > * { opacity:0; }
        .stagger.visible > *:nth-child(1) { animation: stagger-in 0.6s ease 0.05s forwards; }
        .stagger > *:nth-child(2) { animation: stagger-in 0.6s ease 0.15s forwards; }
        .stagger > *:nth-child(3) { animation: stagger-in 0.6s ease 0.25s forwards; }
        .stagger > *:nth-child(4) { animation: stagger-in 0.6s ease 0.35s forwards; }
        .stagger > *:nth-child(5) { animation: stagger-in 0.6s ease 0.45s forwards; }
        .stagger > *:nth-child(6) { animation: stagger-in 0.6s ease 0.55s forwards; }
        .mag-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .mag-btn:hover { transform: scale(1.04); box-shadow: 0 0 40px rgba(192,57,43,0.45) !important; }
        .mag-btn:active { transform: scale(0.98); }
        * { -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
          .stack-mobile { flex-direction: column !important; }
          .grid-1-mobile { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════
          NAV — Responsive Navbar
      ══════════════════════════════════════════════════════════════ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: '0 40px', height: 64,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: `${C.bg}e8`, backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <a href="https://bizlegal-ai.com" style={{
            fontFamily: C.mono, fontSize: 10, color: C.dim, textDecoration: 'none',
            letterSpacing: '0.08em', transition: 'color 0.2s', whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = C.muted)}
            onMouseLeave={e => (e.currentTarget.style.color = C.dim)}>
            ← BizLegal AI
          </a>
          <a href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: C.mono, fontSize: 20, fontWeight: 500, letterSpacing: '0.14em', color: C.text }}>
              TRA<span style={{ color: C.amber }}>C</span>R
            </div>
          </a>
        </div>

        <div className="hide-mobile" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {[['Scan', '/scan'], ['Analyze', '/analyze'], ['Methodology', '/methodology']].map(([l, h]) => (
            <a key={l} href={h} style={{ fontFamily: C.mono, fontSize: 12, color: C.muted, textDecoration: 'none', letterSpacing: '0.08em', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>{l}</a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/analyze" className="hide-mobile" style={{
            padding: '8px 18px', border: `1px solid ${C.border}`,
            borderRadius: 6, color: C.muted, fontSize: 13, textDecoration: 'none', fontFamily: C.sans,
            transition: 'border-color 0.2s, color 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.amber; e.currentTarget.style.color = C.text }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}>
            Free Analysis
          </a>
          <a href="/scan" className="mag-btn" style={{
            padding: '8px 20px', background: C.red, color: '#fff',
            borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: C.sans,
            boxShadow: `0 4px 20px ${C.redGlow}`,
          }}>Run Scan →</a>
          <button className="hide-mobile" onClick={() => setMobileMenu(!mobileMenu)} style={{ display: 'none' }}>☰</button>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          HERO — Gradient Orbs + Floating Particles + Typewriter
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>

        {/* Morphing Blob Background */}
        <div style={{
          position: 'absolute', top: '15%', left: '60%', width: 600, height: 600,
          background: `radial-gradient(ellipse, rgba(192,57,43,0.07) 0%, transparent 65%)`,
          animation: 'blob-morph 12s ease-in-out infinite', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          pointerEvents: 'none', transform: 'translate(-50%,-50%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', left: '20%', width: 400, height: 400,
          background: `radial-gradient(ellipse, rgba(212,168,67,0.06) 0%, transparent 65%)`,
          animation: 'blob-morph 16s ease-in-out infinite reverse', borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
          pointerEvents: 'none',
        }} />

        {/* Floating Particles */}
        {[
          { x: '12%', y: '20%', size: 3, dx1: '20px', dy1: '-30px', dx2: '-10px', dy2: '15px', dur: '8s' },
          { x: '85%', y: '15%', size: 2, dx1: '-15px', dy1: '20px', dx2: '25px', dy2: '-10px', dur: '11s' },
          { x: '70%', y: '70%', size: 4, dx1: '10px', dy1: '-25px', dx2: '-20px', dy2: '15px', dur: '9s' },
          { x: '25%', y: '75%', size: 2, dx1: '-20px', dy1: '10px', dx2: '15px', dy2: '-20px', dur: '13s' },
          { x: '55%', y: '30%', size: 3, dx1: '15px', dy1: '20px', dx2: '-25px', dy2: '-10px', dur: '10s' },
          { x: '40%', y: '85%', size: 2, dx1: '-10px', dy1: '-20px', dx2: '20px', dy2: '10px', dur: '14s' },
          { x: '90%', y: '55%', size: 3, dx1: '20px', dy1: '15px', dx2: '-15px', dy2: '-25px', dur: '7s' },
        ].map((p, i) => (
          <div key={i} style={{
            position: 'absolute', left: p.x, top: p.y,
            width: p.size, height: p.size, borderRadius: '50%', background: C.amber,
            ['--dx1' as string]: p.dx1, ['--dy1' as string]: p.dy1,
            ['--dx2' as string]: p.dx2, ['--dy2' as string]: p.dy2,
            animation: `particle-float ${p.dur} ease-in-out infinite`,
            animationDelay: `${i * 1.3}s`,
            opacity: 0.4, pointerEvents: 'none',
          }} />
        ))}

        {/* Pulse ring */}
        <div style={{ position: 'absolute', right: '8%', top: '30%', pointerEvents: 'none' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute', width: 80, height: 80, borderRadius: '50%',
              border: `1px solid ${C.amber}44`,
              animation: `pulse-ring 3s ease-out ${i * 1}s infinite`,
              top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            }} />
          ))}
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: C.amber, boxShadow: `0 0 20px ${C.amber}` }} />
        </div>

        {/* Hero Content */}
        <div ref={hero.ref} className={`fade-up ${hero.visible ? 'visible' : ''}`}
          style={{ maxWidth: 900, margin: '0 auto', padding: '100px 40px 80px', position: 'relative', zIndex: 2 }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32,
            padding: '5px 14px', borderRadius: 100, border: `1px solid ${C.border}`,
            background: C.surface,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, boxShadow: `0 0 10px ${C.red}` }} />
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              AI Blockchain Forensics · Court-Ready
            </span>
          </div>

          {/* Animated Gradient Headline */}
          <h1 style={{
            fontFamily: C.serif, fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 700,
            lineHeight: 1.05, marginBottom: 24, letterSpacing: '-0.02em',
          }}>
            <span style={{
              background: `linear-gradient(135deg, ${C.text} 0%, #c8cdd8 40%, ${C.text} 100%)`,
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 4s ease infinite',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              On-Chain Evidence
            </span>
            <br />
            <span style={{ color: C.text }}>for </span>
            <Typewriter phrases={['Legal Proceedings.', 'AML Compliance.', 'Fraud Recovery.', 'Due Diligence.']} />
          </h1>

          <p style={{ fontSize: 18, color: C.muted, lineHeight: 1.75, maxWidth: 580, marginBottom: 48, fontWeight: 300 }}>
            48-hour blockchain forensic reports — attorney-ready, court-formatted, no blockchain expertise required.
            Trusted by lawyers in{' '}
            <span style={{ color: C.text, fontWeight: 500 }}>12+ jurisdictions</span>.
          </p>

          {/* CTA Group */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 56 }}>
            <a href="/scan" className="mag-btn" style={{
              padding: '18px 48px', background: C.red, color: '#fff', textDecoration: 'none',
              borderRadius: 8, fontSize: 16, fontWeight: 700, fontFamily: C.sans,
              boxShadow: `0 0 48px ${C.redGlow}`,
            }}>
              Run Risk Scan — Free
            </a>
            <a href="/analyze" style={{
              padding: '18px 32px', border: `1px solid ${C.border}`, color: C.muted,
              textDecoration: 'none', borderRadius: 8, fontSize: 15, fontFamily: C.sans,
              transition: 'border-color 0.2s, color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.amber; e.currentTarget.style.color = C.text }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}>
              Analyze a Wallet →
            </a>
          </div>

          {/* Trust Bar */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              ['✓', 'No blockchain expertise needed'],
              ['✓', 'Court-formatted PDF'],
              ['✓', '48hr delivery'],
              ['✓', 'Not legal advice — evidence-grade data'],
            ].map(([icon, text], i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: C.green, fontSize: 13 }}>{icon}</span>
                <span style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.04em' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ATTORNEY CREDENTIALS BANNER
      ══════════════════════════════════════════════════════════════ */}
      <div style={{
        background: `linear-gradient(135deg, rgba(212,168,67,0.06) 0%, rgba(212,168,67,0.03) 100%)`,
        borderTop: `1px solid ${C.amberBorder}`, borderBottom: `1px solid ${C.amberBorder}`,
        padding: '14px 40px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber, boxShadow: `0 0 10px ${C.amber}`, flexShrink: 0 }} />
          <span style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.1em' }}>
            Built by Moses Dor, LLB LLM
          </span>
          <span style={{ fontFamily: C.mono, fontSize: 11, color: C.dim }}>—</span>
          <span style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.06em' }}>
            Licensed Attorney · Israel Bar Association
          </span>
          <span style={{ fontFamily: C.mono, fontSize: 11, color: C.dim }}>·</span>
          <span style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.06em' }}>
            NY Bar · ICC Arbitrator · DIFC Registered
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MARQUEE TEXT BANNER
      ══════════════════════════════════════════════════════════════ */}
      <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '14px 0', overflow: 'hidden', background: C.surface }}>
        <div style={{ display: 'flex', animation: 'marquee 28s linear infinite', width: 'max-content' }}>
          {Array(2).fill([
            'EU MiCA', '·', 'GDPR', '·', 'AML/KYC', '·', 'OFAC SDN', '·', 'VARA Dubai', '·',
            'SEC/FINRA', '·', 'FCA UK', '·', 'FATF', '·', 'Ethereum', '·', 'BNB Chain', '·',
            'Polygon', '·', 'Arbitrum', '·', 'Base', '·', 'Bitcoin', '·',
            'Court-Ready Reports', '·', 'Litigation Support', '·', '48hr Delivery', '·',
          ]).flat().map((item, i) => (
            <span key={i} style={{
              fontFamily: C.mono, fontSize: 11, color: item === '·' ? C.dim : C.muted,
              letterSpacing: '0.12em', marginRight: 24, whiteSpace: 'nowrap',
            }}>{item}</span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          STATS COUNTER SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 40px' }}>
        <div ref={stats.ref} className={`stagger ${stats.visible ? 'visible' : ''}`}
          style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 1, background: C.border }}>
          {[
            { val: 340, suf: '+', label: 'Wallets Analyzed' },
            { val: 12, suf: '+', label: 'Jurisdictions Served' },
            { val: 48, suf: 'hr', label: 'Max Report Delivery' },
            { val: 98, suf: '%', label: 'Client Satisfaction' },
          ].map(({ val, suf, label }) => (
            <div key={label} style={{ background: C.surface, padding: '36px 28px', textAlign: 'center' }}>
              <div style={{ fontFamily: C.mono, fontSize: 48, fontWeight: 500, color: C.amber, lineHeight: 1, marginBottom: 8 }}>
                <Counter target={val} suffix={suf} />
              </div>
              <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          BENTO FEATURES GRID
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '40px 40px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontFamily: C.mono, fontSize: 10, color: C.amber, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>
            Platform Capabilities
          </div>
          <h2 style={{ fontFamily: C.serif, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, color: C.text, lineHeight: 1.15 }}>
            Everything an attorney needs.<br />Nothing they don&apos;t.
          </h2>
        </div>

        {/* Bento Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto auto', gap: 12 }}>

          {/* Large feature card */}
          <TiltCard style={{ gridColumn: 'span 2' }}>
            <div style={{
              height: '100%', padding: '40px', background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 16, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', right: -40, top: -40, width: 200, height: 200,
                background: `radial-gradient(circle, ${C.amberBg} 0%, transparent 70%)`,
                borderRadius: '50%',
              }} />
              <div style={{ fontFamily: C.mono, fontSize: 10, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16 }}>Core Intelligence</div>
              <h3 style={{ fontFamily: C.serif, fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 14, lineHeight: 1.2 }}>
                4-Stage AI Forensic Pipeline
              </h3>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, maxWidth: 420, marginBottom: 24 }}>
                Raw blockchain data → Pattern extraction → Risk classification → Legal framing → Court-ready report. Powered by Claude (Anthropic).
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['Pattern Extraction', 'Risk Classification', 'Legal Framing', 'Report Synthesis'].map((s, i) => (
                  <span key={s} style={{
                    padding: '5px 12px', background: C.card, border: `1px solid ${C.border}`,
                    borderRadius: 4, fontFamily: C.mono, fontSize: 10, color: C.muted, letterSpacing: '0.06em',
                  }}>
                    <span style={{ color: C.amber, marginRight: 6 }}>0{i + 1}</span>{s}
                  </span>
                ))}
              </div>
            </div>
          </TiltCard>

          {/* Tall side card */}
          <TiltCard>
            <div style={{
              padding: '32px 28px', background: C.redBg, border: `1px solid ${C.redBorder}`,
              borderRadius: 16, height: '100%',
            }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>⚖️</div>
              <h3 style={{ fontFamily: C.serif, fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 10 }}>Court-Ready Format</h3>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>
                Every report includes cover page, executive summary, risk matrix, behavioral analysis, legal context, and methodology disclosure — formatted for legal proceedings.
              </p>
            </div>
          </TiltCard>

          {/* Row 2 small cards */}
          {[
            { icon: '🔗', title: 'Multi-Chain', desc: 'ETH, BNB, Polygon, Arbitrum, Base, Bitcoin — one report.', color: C.amberBg, border: C.amberBorder },
            { icon: '🛡️', title: 'OFAC SDN Check', desc: 'Cross-referenced against U.S. Treasury sanctioned entities list.', color: C.greenBg, border: 'rgba(39,174,96,0.22)' },
            { icon: '📊', title: 'Heuristic Scoring', desc: '9-signal risk model. Scores 0–100. Four risk levels.', color: C.surface, border: C.border },
          ].map(({ icon, title, desc, color, border }) => (
            <TiltCard key={title}>
              <div style={{ padding: '28px', background: color, border: `1px solid ${border}`, borderRadius: 16, height: '100%' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8, fontFamily: C.sans }}>{title}</h3>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{desc}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS — Vertical Timeline / Progress Steps
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '60px 40px 80px', background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontFamily: C.mono, fontSize: 10, color: C.amber, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>Process</div>
            <h2 style={{ fontFamily: C.serif, fontSize: 'clamp(26px,4vw,40px)', fontWeight: 700, color: C.text }}>
              From wallet to courtroom in 48 hours
            </h2>
          </div>

          <div ref={how.ref} className={`stagger ${how.visible ? 'visible' : ''}`} style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div style={{ position: 'absolute', left: 20, top: 24, bottom: 24, width: 1, background: `linear-gradient(to bottom, ${C.amber}, ${C.border})` }} />

            {[
              { step: '01', title: 'Submit Wallet', desc: 'Enter any Ethereum, BNB, Polygon, Arbitrum, Base, or Bitcoin address. Add context for your case.' },
              { step: '02', title: 'Data Fetching', desc: 'We pull full transaction history via GoldRush (Covalent) API and cross-reference OFAC SDN list.' },
              { step: '03', title: 'Risk Scoring', desc: '9-signal heuristic engine assigns a risk score 0–100. Behavioral patterns are identified and flagged.' },
              { step: '04', title: 'AI Analysis', desc: '4-stage Claude pipeline generates professional forensic narrative: patterns → classification → legal framing → synthesis.' },
              { step: '05', title: 'Court-Ready Report', desc: 'PDF delivered to your email. Includes cover page, risk matrix, behavioral analysis, and legal context.' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ display: 'flex', gap: 32, marginBottom: 36, paddingLeft: 60, position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 2,
                  width: 40, height: 40, borderRadius: '50%',
                  background: C.bg, border: `2px solid ${C.amber}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: C.mono, fontSize: 10, color: C.amber, fontWeight: 600,
                  flexShrink: 0,
                }}>{step}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 6, fontFamily: C.sans }}>{title}</div>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PRICING CARDS
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontFamily: C.mono, fontSize: 10, color: C.amber, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>Pricing</div>
            <h2 style={{ fontFamily: C.serif, fontSize: 'clamp(26px,4vw,42px)', fontWeight: 700, color: C.text, marginBottom: 14 }}>
              Simple, transparent pricing
            </h2>
            <p style={{ fontSize: 15, color: C.muted, maxWidth: 500, margin: '0 auto' }}>
              No subscriptions. Pay per report. Full report or nothing.
            </p>
          </div>

          <div ref={pricing.ref} className={`stagger ${pricing.visible ? 'visible' : ''}`}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

            {/* Free */}
            <TiltCard>
              <div style={{ padding: '36px 32px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 }}>
                <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Free</div>
                <div style={{ fontFamily: C.mono, fontSize: 40, fontWeight: 500, color: C.text, lineHeight: 1, marginBottom: 6 }}>$0</div>
                <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, marginBottom: 24 }}>No credit card required</div>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24, marginBottom: 28 }}>
                  {['Risk score (0–100)', '3 risk flags', 'Basic wallet metrics', 'AI risk preview', 'Email capture only'].map(f => (
                    <div key={f} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                      <span style={{ color: C.green, fontSize: 13, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 13, color: C.muted }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="/analyze" style={{
                  display: 'block', textAlign: 'center', padding: '13px', border: `1px solid ${C.border}`,
                  borderRadius: 8, color: C.muted, textDecoration: 'none', fontSize: 14, fontFamily: C.sans,
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.amber; e.currentTarget.style.color = C.text }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}>
                  Start Free Analysis →
                </a>
              </div>
            </TiltCard>

            {/* Standard — highlighted */}
            <TiltCard>
              <div style={{
                padding: '36px 32px', background: C.card,
                border: `1px solid ${C.amber}44`, borderRadius: 16,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, ${C.amber}, ${C.red})`,
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ fontFamily: C.mono, fontSize: 10, color: C.amber, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Standard</div>
                  <span style={{ fontFamily: C.mono, fontSize: 9, color: C.bg, background: C.amber, padding: '3px 8px', borderRadius: 100, letterSpacing: '0.1em' }}>POPULAR</span>
                </div>
                <div style={{ fontFamily: C.mono, fontSize: 40, fontWeight: 500, color: C.text, lineHeight: 1, marginBottom: 6 }}>$149</div>
                <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, marginBottom: 24 }}>48-hour delivery · PayPal or crypto</div>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24, marginBottom: 28 }}>
                  {['Full forensic report (8 sections)', 'All risk flags (no limit)', 'Behavioral pattern analysis', 'Legal compliance context', 'Court-formatted PDF', 'Report ID + timestamp', 'Email delivery'].map(f => (
                    <div key={f} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                      <span style={{ color: C.green, fontSize: 13, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 13, color: C.text }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="/scan" className="mag-btn" style={{
                  display: 'block', textAlign: 'center', padding: '13px',
                  background: C.red, color: '#fff', textDecoration: 'none', borderRadius: 8,
                  fontSize: 14, fontWeight: 700, fontFamily: C.sans,
                  boxShadow: `0 4px 20px ${C.redGlow}`,
                }}>
                  Order Report →
                </a>
              </div>
            </TiltCard>

            {/* Priority */}
            <TiltCard>
              <div style={{ padding: '36px 32px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 }}>
                <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Priority / Litigation</div>
                <div style={{ fontFamily: C.mono, fontSize: 40, fontWeight: 500, color: C.text, lineHeight: 1, marginBottom: 6 }}>
                  $249<span style={{ fontSize: 16, color: C.muted }}> – $2,000</span>
                </div>
                <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, marginBottom: 24 }}>24hr rush · Attorney consultation</div>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24, marginBottom: 28 }}>
                  {['Everything in Standard', '24hr priority delivery', 'Narrative legal summary', 'Affidavit-ready language', 'Analyst review call', 'Law firm billing available', 'Multi-wallet analysis'].map(f => (
                    <div key={f} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                      <span style={{ color: C.amber, fontSize: 13, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 13, color: C.text }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="/scan" style={{
                  display: 'block', textAlign: 'center', padding: '13px',
                  border: `1px solid ${C.amber}44`, color: C.amber,
                  textDecoration: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: C.sans,
                  background: C.amberBg,
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,168,67,0.14)')}
                  onMouseLeave={e => (e.currentTarget.style.background = C.amberBg)}>
                  Contact for Litigation →
                </a>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          LOGO CLOUD — Trust Signals
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '48px 40px', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 32 }}>
            Data Sources & Frameworks
          </div>
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              'GoldRush / Covalent', 'Etherscan', 'Blockchain.info',
              'OFAC SDN List', 'Claude AI', 'Supabase',
              'NY Bar', 'ICC Arbitration', 'DIFC',
            ].map(name => (
              <div key={name} style={{
                padding: '8px 18px', border: `1px solid ${C.border}`, borderRadius: 6,
                fontFamily: C.mono, fontSize: 11, color: C.muted,
                transition: 'border-color 0.2s, color 0.2s',
                cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.amber + '55'; e.currentTarget.style.color = C.text }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}>
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TESTIMONIAL WALL
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontFamily: C.mono, fontSize: 10, color: C.amber, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>Social Proof</div>
            <h2 style={{ fontFamily: C.serif, fontSize: 'clamp(26px,4vw,40px)', fontWeight: 700, color: C.text }}>
              Used in active litigation
            </h2>
          </div>

          <div ref={testi.ref} className={`stagger ${testi.visible ? 'visible' : ''}`}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {[
              { quote: 'The TRACR report gave us a clear, court-admissible risk profile that we used to support our client\'s fraud claim. Delivered in under 24 hours.', name: 'Senior Litigation Partner', firm: 'NYC Law Firm', stars: 5 },
              { quote: 'We needed blockchain evidence fast for an emergency injunction. TRACR produced exactly the kind of evidence-grade documentation a judge would understand.', name: 'Compliance Director', firm: 'Crypto Exchange', stars: 5 },
              { quote: 'As an asset recovery specialist, I\'ve tried multiple forensic tools. TRACR\'s legal framing is the differentiator — the AI understands courtroom language.', name: 'Asset Recovery Attorney', firm: 'International Practice', stars: 5 },
            ].map(({ quote, name, firm, stars }, i) => (
              <div key={i} style={{
                padding: '28px 30px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
                position: 'relative',
              }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                  {Array(stars).fill(0).map((_, j) => (
                    <span key={j} style={{ color: C.amber, fontSize: 14 }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                  &ldquo;{quote}&rdquo;
                </p>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.dim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.mono, fontSize: 12, color: C.amber }}>
                    {name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{name}</div>
                    <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>{firm}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FAQ ACCORDION
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '60px 40px 80px', background: C.surface, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div ref={faq.ref} className={`fade-up ${faq.visible ? 'visible' : ''}`}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontFamily: C.mono, fontSize: 10, color: C.amber, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>FAQ</div>
              <h2 style={{ fontFamily: C.serif, fontSize: 'clamp(26px,4vw,38px)', fontWeight: 700, color: C.text }}>Common Questions</h2>
            </div>
            {[
              { q: 'What blockchains do you support?', a: 'We support Ethereum, BNB Chain, Polygon, Arbitrum, Base, and Bitcoin. Multi-chain reports covering multiple addresses are available under the Litigation tier.' },
              { q: 'Is this admissible in court?', a: 'TRACR reports are designed as evidence-grade forensic documents, not legal opinions. They provide risk indicators, behavioral analysis, and source citations from public blockchain data. Whether they are admitted is determined by the presiding court and applicable rules of evidence. We recommend having the report reviewed by qualified legal counsel.' },
              { q: 'How long does a full report take?', a: 'Standard reports are delivered within 48 hours. Priority reports within 24 hours. For litigation packages requiring analyst review, turnaround is agreed upon at order time.' },
              { q: 'What if the wallet has very little activity?', a: 'Reports are generated for any wallet address. Low-activity wallets receive a "Low Risk / Insufficient Data" finding with a clear scope statement. You are not charged more for simple wallets.' },
              { q: 'Do you provide expert witness testimony?', a: 'Expert testimony is available under our Litigation Intelligence package. Contact us via Calendly to discuss your case requirements. Our lead analyst is a licensed attorney (NY Bar, ICC Arbitrator, DIFC Registered).' },
              { q: 'What payment methods do you accept?', a: 'We accept PayPal (credit/debit card) and cryptocurrency via NOWPayments (BTC, ETH, USDT, and 100+ others). Invoicing for law firms is available on request.' },
            ].map(({ q, a }) => (
              <FAQItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          METHODOLOGY — How We Build Your Report
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 40px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontFamily: C.mono, fontSize: 10, color: C.amber, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>
              Transparency
            </div>
            <h2 style={{ fontFamily: C.serif, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, color: C.text, lineHeight: 1.15 }}>
              How We Build Your Report
            </h2>
            <p style={{ fontSize: 15, color: C.muted, maxWidth: 540, margin: '16px auto 0', lineHeight: 1.7 }}>
              Every TRACR report is produced by a verified, multi-source pipeline — no black boxes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[
              {
                num: '01',
                title: 'On-Chain Data',
                body: 'Raw blockchain transactions, wallet clusters, and flow-of-funds are pulled from Covalent GoldRush API across 15+ networks including Ethereum, Polygon, BNB Chain, Arbitrum, Base, and Bitcoin.',
                tag: 'Source: Covalent GoldRush API · 15+ chains',
                color: C.amber,
              },
              {
                num: '02',
                title: 'Risk Heuristics',
                body: 'Wallets are screened against the OFAC SDN sanctions list. Transaction patterns are analyzed for mixer usage, rapid layering, high-risk exchange deposits, and entity clustering heuristics.',
                tag: 'Source: OFAC SDN List · Pattern Analysis · Entity Clustering',
                color: C.red,
              },
              {
                num: '03',
                title: 'AI Analysis',
                body: 'A 4-stage Claude (Anthropic) pipeline processes findings: pattern extraction → risk scoring → legal framing → synthesis. Output is court-formatted with confidence levels and source citations.',
                tag: 'Source: Claude claude-sonnet-4-6 · 4-stage forensic pipeline',
                color: C.green,
              },
            ].map(({ num, title, body, tag, color }) => (
              <div key={num} style={{
                padding: '36px 32px', background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 16, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: -20, right: -20, width: 100, height: 100,
                  background: `radial-gradient(circle, ${color}11 0%, transparent 70%)`,
                  borderRadius: '50%',
                }} />
                <div style={{ fontFamily: C.mono, fontSize: 32, fontWeight: 500, color: `${color}33`, letterSpacing: '0.04em', marginBottom: 12 }}>
                  {num}
                </div>
                <h3 style={{ fontFamily: C.serif, fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 14, lineHeight: 1.2 }}>
                  {title}
                </h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 20 }}>
                  {body}
                </p>
                <div style={{
                  padding: '8px 14px', background: C.card, borderRadius: 6,
                  border: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: color, letterSpacing: '0.06em' }}>{tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA BANNER SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, rgba(192,57,43,0.08) 0%, transparent 60%)`,
          pointerEvents: 'none',
        }} />
        <div style={{
          maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative',
          padding: '56px 48px', background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 24,
        }}>
          <div style={{ fontFamily: C.mono, fontSize: 10, color: C.red, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 20 }}>
            ⚠ Start Now
          </div>
          <h2 style={{ fontFamily: C.serif, fontSize: 'clamp(28px,4vw,48px)', fontWeight: 700, color: C.text, lineHeight: 1.1, marginBottom: 20 }}>
            Your investigation<br />starts with one wallet.
          </h2>
          <p style={{ fontSize: 16, color: C.muted, marginBottom: 40, lineHeight: 1.7 }}>
            Free risk scan in 60 seconds. Full forensic report in 48 hours.<br />
            Court-ready PDF delivered to your inbox.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/scan" className="mag-btn" style={{
              padding: '18px 48px', background: C.red, color: '#fff', textDecoration: 'none',
              borderRadius: 8, fontSize: 16, fontWeight: 700, fontFamily: C.sans,
              boxShadow: `0 0 48px ${C.redGlow}`,
            }}>
              Run Risk Scan — Free
            </a>
            <a href="/analyze" style={{
              padding: '18px 32px', border: `1px solid ${C.border}`, color: C.muted,
              textDecoration: 'none', borderRadius: 8, fontSize: 15, fontFamily: C.sans,
              transition: 'border-color 0.2s, color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.amber; e.currentTarget.style.color = C.text }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}>
              Analyze Wallet →
            </a>
          </div>
          <p style={{ marginTop: 20, fontFamily: C.mono, fontSize: 11, color: C.dim }}>
            No sign-up · No credit card · Instant results
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MODERN FOOTER — Multi-column + newsletter + legal
      ══════════════════════════════════════════════════════════════ */}
      <footer style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: '60px 40px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Footer grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 40, marginBottom: 48 }}>

            {/* Brand */}
            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ fontFamily: C.mono, fontSize: 22, letterSpacing: '0.14em', color: C.text, marginBottom: 14 }}>
                TRA<span style={{ color: C.amber }}>C</span>R
              </div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, marginBottom: 20, maxWidth: 220 }}>
                Blockchain forensic intelligence for legal professionals.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                {['NY Bar', 'ICC', 'DIFC', 'Israel Bar'].map(b => (
                  <span key={b} style={{
                    padding: '3px 10px', border: `1px solid ${C.border}`,
                    borderRadius: 4, fontFamily: C.mono, fontSize: 9, color: C.dim, letterSpacing: '0.12em',
                  }}>{b}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <a href="https://linkedin.com/company/bizlegal-ai" target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, textDecoration: 'none', transition: 'color 0.2s', letterSpacing: '0.06em' }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.muted)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.dim)}>
                  LinkedIn
                </a>
                <span style={{ color: C.border, fontSize: 10 }}>·</span>
                <a href="https://twitter.com/bizlegalai" target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, textDecoration: 'none', transition: 'color 0.2s', letterSpacing: '0.06em' }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.muted)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.dim)}>
                  Twitter / X
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <div style={{ fontFamily: C.mono, fontSize: 10, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 18 }}>Product</div>
              {[['Wallet Analyzer', '/analyze'], ['Regulatory Scanner', '/scan'], ['Full Reports', '/scan'], ['Methodology', '/methodology']].map(([l, h]) => (
                <a key={l} href={h} style={{ display: 'block', fontSize: 13, color: C.muted, textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>{l}</a>
              ))}
            </div>

            <div>
              <div style={{ fontFamily: C.mono, fontSize: 10, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 18 }}>Legal</div>
              {[['Not Legal Advice', '#'], ['Privacy Policy', '#'], ['Terms of Service', '#'], ['Report Disclaimer', '/methodology']].map(([l, h]) => (
                <a key={l} href={h} style={{ display: 'block', fontSize: 13, color: C.muted, textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>{l}</a>
              ))}
            </div>

            <div>
              <div style={{ fontFamily: C.mono, fontSize: 10, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 18 }}>Contact</div>
              <a href="https://calendly.com/ai-leadx10" target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', fontSize: 13, color: C.muted, textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>Book Consultation →</a>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                Advocate Dor<br />NY Bar · ICC Arbitrator<br />DIFC Registered
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, lineHeight: 1.6, maxWidth: 520 }}>
              <strong style={{ color: C.muted }}>DISCLAIMER:</strong> Reports are for informational purposes only and do not constitute legal advice.
              Findings represent risk indicators, not criminal determinations.
              TRACR does not assert criminal activity. Consult qualified legal counsel before acting on any findings.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim }}>
                © {new Date().getFullYear()} TRACR Intelligence
              </span>
              <a href="https://www.bizlegal-ai.com" target="_blank" rel="noopener noreferrer"
                style={{
                  fontFamily: C.mono, fontSize: 10, letterSpacing: '0.08em',
                  color: C.amberDim, textDecoration: 'none', transition: 'color 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = C.amber)}
                onMouseLeave={e => (e.currentTarget.style.color = C.amberDim)}>
                <span style={{ opacity: 0.5 }}>⚡</span>
                Powered by www.bizlegal-ai.com
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
