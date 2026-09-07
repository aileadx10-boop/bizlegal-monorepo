import Link from 'next/link'
import { t } from '@/lib/i18n'
import LtrShell from './LtrShell'

/**
 * The English twin, for markets outside Israel and for non-resident buyers.
 *
 * Same copy keys, opposite direction. The document is Hebrew/RTL by default, so
 * this route re-stamps `lang`/`dir` client-side — the alternative, a locale path
 * segment and a middleware rewrite, is routing weight for two pages.
 */

const L = 'en-US' as const

export const metadata = {
  title: 'DEAL44 — one room for the whole property transaction',
  description:
    'A shared checklist for a property transaction: every party, every deadline, one room. Reminders arrive before the date, not after.',
}

export default function EnglishLandingPage() {
  return (
    <LtrShell>
      <main>
        <h1>{t(L, 'landing.h1')}</h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--body)', maxWidth: '40rem' }}>
          {t(L, 'landing.sub')}
        </p>

        <p style={{ margin: '1.5rem 0' }}>
          <Link className="btn" href="/en/start">
            {t(L, 'landing.cta')}
          </Link>
        </p>

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
            <Link href="/pricing">Pricing</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/disclaimer">Disclaimer</Link>
            <Link href="/">עברית</Link>
          </p>
        </footer>
      </main>
    </LtrShell>
  )
}
