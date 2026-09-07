import Link from 'next/link'
import { t } from '@/lib/i18n'

/**
 * The Hebrew landing page. One page, one thing to do: ask for a room.
 *
 * No pricing table, no feature grid, no call booking — the founder does not take
 * calls, and the only conversion that matters here is a written intake he can
 * answer with a written proposal.
 */

const L = 'he-IL' as const

export default function LandingPage() {
  return (
    <main>
      <h1>{t(L, 'landing.h1')}</h1>
      <p style={{ fontSize: '1.05rem', color: 'var(--body)', maxWidth: '40rem' }}>
        {t(L, 'landing.sub')}
      </p>

      <p style={{ margin: '1.5rem 0' }}>
        <Link className="btn" href="/start">
          {t(L, 'landing.cta')}
        </Link>
      </p>
      <p className="muted">{t(L, 'landing.price')}</p>

      <div className="card" style={{ marginTop: '2rem' }}>
        <p className="label" style={{ marginBottom: '0.75rem' }}>
          {t(L, 'landing.how')}
        </p>
        <ol style={{ paddingInlineStart: '1.25rem', margin: 0, color: 'var(--body)' }}>
          <li style={{ marginBottom: '0.5rem' }}>{t(L, 'landing.how1')}</li>
          <li style={{ marginBottom: '0.5rem' }}>{t(L, 'landing.how2')}</li>
          <li>{t(L, 'landing.how3')}</li>
        </ol>
      </div>

      <footer>
        <p className="muted">{t(L, 'landing.disclaimer')}</p>
        <p className="muted" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/pricing">מחירים</Link>
          <Link href="/privacy">פרטיות</Link>
          <Link href="/terms">תנאי שימוש</Link>
          <Link href="/disclaimer">הבהרה</Link>
          <Link href="/en">English</Link>
        </p>
      </footer>
    </main>
  )
}
