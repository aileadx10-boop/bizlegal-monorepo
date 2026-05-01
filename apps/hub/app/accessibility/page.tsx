import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accessibility Statement — BizLegal AI',
  description: 'BizLegal AI accessibility commitment, WCAG 2.1 conformance, and contact for accessibility support.',
}

export default function AccessibilityPage() {
  const h = { fontFamily: 'Gloock, serif', fontSize: '22px', color: 'var(--white)', marginBottom: '14px', marginTop: '40px' } as const
  const p = { fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' } as const
  const li = { fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '8px', paddingLeft: '8px' } as const

  const features = [
    { icon: '🎨', title: 'High Contrast', desc: 'Dark theme with WCAG AA contrast ratios throughout. Text on background exceeds 4.5:1 ratio.' },
    { icon: '⌨️', title: 'Keyboard Navigation', desc: 'All interactive elements are accessible via keyboard. Focus states are clearly visible.' },
    { icon: '📱', title: 'Responsive Design', desc: 'Works on all screen sizes from 320px mobile to 4K desktop.' },
    { icon: '🔍', title: 'Semantic HTML', desc: 'Proper heading hierarchy, landmark regions, and ARIA labels throughout.' },
    { icon: '🗣️', title: 'Screen Reader Support', desc: 'Tested with NVDA and VoiceOver. All images include descriptive alt text.' },
    { icon: '🌐', title: 'Multi-language', desc: 'Available in English, Portuguese (PT), and Spanish (ES) to serve global users.' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingTop: '36px' }}>
      <div style={{ background: 'rgba(7,9,26,0.95)', borderBottom: '1px solid rgba(125,211,252,0.08)' }}>
        <div className="container" style={{ paddingTop: '20px', paddingBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ color: 'var(--muted)', fontSize: '13px', fontFamily: 'Geist Mono, monospace' }}>← Home</Link>
        </div>
      </div>

      <div className="section" style={{ paddingTop: '60px' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: '20px' }}>
            <span className="bdot" />&nbsp;Accessibility
          </div>
          <h1 style={{ fontFamily: 'Gloock, serif', fontSize: 'clamp(32px,5vw,56px)', color: 'var(--white)', marginBottom: '10px', lineHeight: 1.1 }}>
            Accessibility Statement
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--dim)', marginBottom: '48px', fontFamily: 'Geist Mono, monospace' }}>Last updated: 18 March 2025</p>

          <p style={p}>BizLegal AI is committed to ensuring digital accessibility for people with disabilities. We continually work to improve the user experience for all visitors and apply relevant accessibility standards.</p>

          <h2 style={h}>Conformance Status</h2>
          <div style={{ padding: '20px 24px', borderRadius: '12px', border: '1px solid rgba(94,234,212,0.2)', background: 'rgba(94,234,212,0.04)', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: 'var(--teal)', marginBottom: '8px', fontWeight: 700 }}>Target Standard: WCAG 2.1 Level AA</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>We are partially conformant with WCAG 2.1 Level AA. We are working toward full conformance and welcome feedback on any barriers you encounter.</p>
          </div>

          <h2 style={h}>Accessibility Features</h2>
          <div className="ind-grid" style={{ marginBottom: '32px' }}>
            {features.map(f => (
              <div key={f.title} className="icard" style={{ cursor: 'default' }}>
                <div className="iicon">{f.icon}</div>
                <div className="iname">{f.title}</div>
                <div className="idesc">{f.desc}</div>
              </div>
            ))}
          </div>

          <h2 style={h}>Known Limitations</h2>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={li}>The WebGL shader background animation may cause issues for users with vestibular disorders. It can be disabled by enabling &quot;Reduce Motion&quot; in your operating system accessibility settings — we respect the <code style={{ color: 'var(--sky)', background: 'rgba(125,211,252,0.06)', padding: '1px 5px', borderRadius: '3px' }}>prefers-reduced-motion</code> media query.</li>
            <li style={li}>Live market ticker scrolling animation is paused when reduced motion is preferred.</li>
            <li style={li}>Some complex data tables in comparison views may not be fully optimized for all screen readers. We are actively addressing this.</li>
          </ul>

          <h2 style={h}>Technical Specifications</h2>
          <p style={p}>BizLegal AI relies on the following technologies for conformance:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={li}>HTML5 with semantic markup</li>
            <li style={li}>CSS3 with logical properties for RTL support</li>
            <li style={li}>WAI-ARIA roles, states, and properties</li>
            <li style={li}>JavaScript (Next.js 14 React framework)</li>
          </ul>
          <p style={p}>The site was tested using: Chrome + NVDA, Safari + VoiceOver (macOS), Firefox keyboard-only navigation, and Lighthouse accessibility audits.</p>

          <h2 style={h}>Formal Complaints Procedure</h2>
          <p style={p}>We aim to respond to accessibility feedback within 5 business days and resolve identified issues within 30 days. If you are not satisfied with our response, you may contact the relevant national enforcement body:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={li}><strong style={{ color: 'var(--text)' }}>UK:</strong> Equality and Human Rights Commission (EHRC)</li>
            <li style={li}><strong style={{ color: 'var(--text)' }}>EU:</strong> Your national equality body</li>
            <li style={li}><strong style={{ color: 'var(--text)' }}>US:</strong> Department of Justice Civil Rights Division</li>
          </ul>

          <h2 style={h}>Feedback & Contact</h2>
          <p style={p}>We welcome your feedback on the accessibility of BizLegal AI. If you experience any barriers, please tell us:</p>
          <div style={{ padding: '20px 24px', borderRadius: '12px', border: '1px solid rgba(125,211,252,0.15)', background: 'rgba(7,9,26,0.6)', marginTop: '8px' }}>
            <p style={{ ...p, marginBottom: '6px' }}><strong style={{ color: 'var(--sky)' }}>Email:</strong> accessibility@bizlegal-ai.com</p>
            <p style={{ ...p, marginBottom: '6px' }}><strong style={{ color: 'var(--sky)' }}>Response time:</strong> Within 5 business days</p>
            <p style={{ ...p, marginBottom: '0' }}>When reporting an issue, please include the URL of the affected page, the nature of the barrier, and the assistive technology you are using.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
