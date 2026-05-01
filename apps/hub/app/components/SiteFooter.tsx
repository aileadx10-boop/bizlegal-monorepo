import Link from 'next/link'

import { companyProfile, featuredGuides, founderProfile, legalLinks, productLinks, socialLinks } from '@/app/lib/site-content'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <span className="brand-mark__eyebrow">{founderProfile.name}</span>
          <h2>{companyProfile.name}</h2>
          <p>
            {companyProfile.title}. Structured regulatory risk intelligence for digital asset ventures
            operating across complex jurisdictions with UAE-focused depth.
          </p>
        </div>
        <div>
          <h3>Products</h3>
          <a href={productLinks.docai}>DocAI</a>
          <a href={productLinks.brai}>BRAI</a>
          <a href={productLinks.tracr}>TRACR</a>
          <Link href="/posts">Intelligence Hub</Link>
        </div>
        <div>
          <h3>Featured posts</h3>
          {featuredGuides.slice(0, 4).map((guide) => (
            <Link key={guide.href} href={guide.href}>
              {guide.title}
            </Link>
          ))}
        </div>
        <div>
          <h3>Trust</h3>
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="container footer-bottom">
        <p>Founder of BizLegal. Commercial attorney and entrepreneur operating at the intersection of law, innovation, and digital asset markets.</p>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', margin: '0.5rem 0' }}>
          {socialLinks.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noreferrer noopener"
              style={{ color: 'var(--muted)', fontSize: '0.82rem', textDecoration: 'none' }}
            >
              {s.label}
            </a>
          ))}
        </div>
        <p>Information and intelligence materials only. Not legal advice.</p>
      </div>
    </footer>
  )
}
