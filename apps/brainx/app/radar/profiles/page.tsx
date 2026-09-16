import { getSubscriber } from '@/lib/access'
import { sql } from '@/lib/neon'
import ProfilesClient from './ProfilesClient'

export const dynamic = 'force-dynamic'

interface ProfileRow {
  id: string
  market_slug: string
  market_name: string
  label: string
  keywords: string[]
}

interface MarketRow {
  slug: string
  name: string
}

export default async function ProfilesPage() {
  const subscriber = await getSubscriber()
  if (!subscriber) return null

  const [profiles, markets] = await Promise.all([
    sql()`
      select p.id, m.slug as market_slug, m.name as market_name, p.label, p.keywords
      from radar_profiles p join markets m on m.id = p.market_id
      where p.subscriber_id = ${subscriber.id}::uuid
      order by p.created_at asc
    ` as unknown as Promise<ProfileRow[]>,
    sql()`select slug, name from markets order by name asc` as unknown as Promise<MarketRow[]>,
  ])

  return (
    <div className="bx-container" style={{ maxWidth: 640 }}>
      <h1 className="bx-h2" style={{ fontSize: 26, marginBottom: 8 }}>Radar profiles</h1>
      <p className="bx-muted" style={{ fontSize: 14, marginBottom: 24 }}>
        Up to 5 profiles across the three covered verticals. Each profile narrows your radar with a label and optional keywords.
      </p>
      <ProfilesClient initialProfiles={profiles} markets={markets} />
    </div>
  )
}
