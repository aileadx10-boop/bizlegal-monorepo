'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'
import { ThemeToggle } from '@/app/components/ui-v2/ThemeToggle'

const PRODUCTS = [
  { label: 'TRACR', sub: 'Wallet & Tx Intelligence', href: 'https://tracr.bizlegal-ai.com', accent: '#7dd3fc' },
  { label: 'BRAI', sub: 'Counterparty Risk Intelligence', href: 'https://brai.bizlegal-ai.com', accent: '#60a5fa' },
  { label: 'LexAudit', sub: 'Compliance Health Score', href: 'https://lexaudit.bizlegal-ai.com', accent: '#d4a853' },
  { label: 'DocAI', sub: 'Contract & SQA Intelligence', href: 'https://docai.bizlegal-ai.com', accent: '#c084fc' },
  { label: 'Forge', sub: 'Compliance Scanner', href: 'https://forge.bizlegal-ai.com', accent: '#4ade80' },
  { label: 'LeadForge', sub: 'Legal Lead Intelligence', href: 'https://leadforge.bizlegal-ai.com', accent: '#fb923c' },
]

const NAV_LINKS = [
  { label: 'Agents', href: '/agents' },
  { label: 'Risk Engine', href: '/risk-engine' },
  { label: 'Free Snapshot', href: 'https://blog.bizlegal-ai.com/snapshot', external: true, badge: 'NEW' },
  { label: 'About', href: '/about' },
  { label: 'Trust', href: '/trust' },
]

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setProductsOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 200,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    borderBottom: `1px solid ${scrolled ? 'var(--outline-var)' : 'transparent'}`,
    background: scrolled ? 'rgba(8,8,15,0.92)' : 'transparent',
    backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
    transition: 'all 0.3s ease',
  }

  const linkStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--on-surface-var)',
    textDecoration: 'none',
    transition: 'color 0.15s',
    letterSpacing: '-0.01em',
  }

  return (
    <>
      <nav style={navStyle} className="no-print">
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 400, color: 'var(--white)', letterSpacing: '-0.02em' }}>
            BizLegal
          </span>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: 'var(--gold)',
            display: 'inline-block',
            margin: '0 1px 3px',
          }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 400, color: 'var(--white)', letterSpacing: '-0.02em' }}>
            AI
          </span>
        </Link>

        {/* Center nav — desktop */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} className="hidden md:flex">
          {/* Products dropdown */}
          <div ref={dropRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setProductsOpen(o => !o)}
              style={{
                ...linkStyle,
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '8px 12px',
                color: productsOpen ? 'var(--white)' : 'var(--on-surface-var)',
                borderRadius: 8,
                background: productsOpen ? 'var(--bg-mid)' : 'transparent',
              } as React.CSSProperties}
            >
              Products
              <ChevronDown size={12} style={{ opacity: 0.6, transform: productsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {productsOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 380,
                background: 'var(--bg-low)',
                border: '1px solid var(--outline-var)',
                borderRadius: 16,
                padding: 8,
                zIndex: 300,
                boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(165,180,252,0.06)',
                backdropFilter: 'blur(20px)',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  {PRODUCTS.map(p => (
                    <a
                      key={p.href}
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setProductsOpen(false)}
                      style={{ padding: '10px 12px', borderRadius: 10, textDecoration: 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-mid)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 400, color: 'var(--white)', marginBottom: 2 }}>{p.label}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em' }}>{p.sub}</div>
                    </a>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--outline-var)', marginTop: 8, paddingTop: 8, paddingLeft: 12, paddingBottom: 4 }}>
                  <Link href="/products" onClick={() => setProductsOpen(false)} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold)', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', display: 'block' }}>
                    View all products →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {NAV_LINKS.map(link => {
            const content = (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {link.label}
                {link.badge && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    background: 'var(--gold)',
                    color: '#08080f',
                    padding: '2px 5px',
                    borderRadius: 3,
                  }}>{link.badge}</span>
                )}
              </span>
            )
            const commonProps = {
              style: { ...linkStyle, padding: '8px 12px', borderRadius: 8 } as React.CSSProperties,
              onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLElement).style.color = 'var(--white)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-mid)' },
              onMouseLeave: (e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLElement).style.color = 'var(--on-surface-var)'; (e.currentTarget as HTMLElement).style.background = 'transparent' },
            }
            return link.external ? (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" {...commonProps}>
                {content}
              </a>
            ) : (
              <Link key={link.href} href={link.href} {...commonProps}>
                {content}
              </Link>
            )
          })}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <ThemeToggle size={32} />
          <Link
            href="/risk-engine"
            className="hidden md:inline-flex"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13, fontWeight: 600,
              color: '#08080f',
              background: 'var(--primary)',
              padding: '8px 18px',
              borderRadius: 8,
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              transition: 'filter 0.2s, transform 0.2s',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ''; (e.currentTarget as HTMLElement).style.transform = '' }}
          >
            Free Risk Scan
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface)', display: 'flex', padding: 4 }}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed',
          top: 60, left: 0, right: 0, bottom: 0,
          background: 'var(--bg)',
          zIndex: 199,
          overflowY: 'auto',
          padding: '32px 24px',
          borderTop: '1px solid var(--outline-var)',
        }}>
          <div style={{ marginBottom: 32 }}>
            <div className="quantum-label" style={{ marginBottom: 16, color: 'var(--gold)' }}>Products</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {PRODUCTS.map(p => (
                <a
                  key={p.href}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  style={{ padding: '12px', borderRadius: 10, border: '1px solid var(--outline-var)', textDecoration: 'none', background: 'var(--bg-low)' }}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--white)', marginBottom: 2 }}>{p.label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.06em' }}>{p.sub}</div>
                </a>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 32 }}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{ padding: '12px 16px', fontSize: 15, fontWeight: 500, color: 'var(--on-surface-var)', textDecoration: 'none', borderRadius: 8, fontFamily: 'var(--font-body)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-low)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link
            href="/risk-engine"
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'flex', justifyContent: 'center',
              padding: '14px', borderRadius: 10,
              background: 'var(--primary)', color: '#08080f',
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Free Risk Scan →
          </Link>
        </div>
      )}
    </>
  )
}
