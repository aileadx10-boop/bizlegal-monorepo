import Link from 'next/link'

interface Props {
  readonly subscriber: { readonly email: string; readonly tier: 'radar' | 'radar_build' }
}

const LINKS = [
  { href: '/radar', label: 'Radar' },
  { href: '/radar/briefs', label: 'Briefs' },
  { href: '/radar/profiles', label: 'Profiles' },
] as const

export default function RadarNav({ subscriber }: Props): JSX.Element {
  return (
    <header className="bx-glass" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '16px 24px' }}>
      <div className="bx-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/radar" className="bx-mono" style={{ fontWeight: 700, fontSize: 16, textDecoration: 'none', color: 'var(--bl-text)' }}>
            Brain<span style={{ color: 'var(--bl-accent)' }}>X</span>
          </Link>
          <nav style={{ display: 'flex', gap: 18 }} aria-label="Radar">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} style={{ fontSize: 13.5, color: 'var(--bl-text-muted)', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="bx-chip">{subscriber.tier === 'radar_build' ? 'Radar + Build' : 'Radar'}</span>
          <span className="bx-muted" style={{ fontSize: 12.5 }}>{subscriber.email}</span>
        </div>
      </div>
    </header>
  )
}
