import Link from 'next/link'
import { t } from '@/lib/i18n'
import { fmtMoney } from '@/lib/i18n/format'

/**
 * Two prices, stated plainly, with what each one actually includes.
 *
 * The amounts come from @bizlegal/payment so the page, the invoice and the
 * order row can never quote three different numbers.
 */
export const metadata = {
  title: 'מחירים — DEAL44',
  description: 'חדר לעסקה בודדת, או מנוי חודשי למתווך שמנהל כמה עסקאות במקביל.',
}

const L = 'he-IL' as const

const TIERS = [
  {
    name: 'חדר לעסקה',
    cents: 250000,
    per: 'לעסקה',
    lines: [
      'הקמת החדר מההסכם החתום',
      'קישור אישי לכל צד — קונה, מוכר, עורכי דין, יועץ משכנתאות',
      'תזכורת לפני כל מועד, למי שאחראי עליו',
      'עדכון הרשימה לאורך כל חיי העסקה',
    ],
  },
  {
    name: 'מנוי מתווך',
    cents: 34900,
    per: 'לחודש',
    lines: [
      'פתיחת חדרים ללא הגבלה',
      'כל מה שכלול בחדר הבודד',
      'ביטול בכל עת, מהמחזור הבא',
    ],
  },
] as const

export default function PricingPage() {
  return (
    <main>
      <h1>מחירים</h1>
      <p className="muted" style={{ marginBottom: '2rem' }}>
        בלי שיחת מכירה. שולחים את הפרטים, מקבלים הצעה כתובה וחשבונית.
      </p>

      {TIERS.map((tier) => (
        <div className="card" key={tier.name}>
          <div className="between" style={{ marginBottom: '0.75rem' }}>
            <h2 style={{ margin: 0 }}>{tier.name}</h2>
            <span style={{ fontSize: '1.15rem' }}>
              {fmtMoney(L, tier.cents, 'ILS')} <span className="muted">{tier.per}</span>
            </span>
          </div>
          <ul style={{ paddingInlineStart: '1.15rem', margin: 0, color: 'var(--body)' }}>
            {tier.lines.map((line) => (
              <li key={line} style={{ marginBottom: '0.3rem' }}>{line}</li>
            ))}
          </ul>
        </div>
      ))}

      <p style={{ marginTop: '1.5rem' }}>
        <Link className="btn" href="/start">{t(L, 'landing.cta')}</Link>
      </p>

      <footer>
        <p className="muted">{t(L, 'landing.disclaimer')}</p>
      </footer>
    </main>
  )
}
