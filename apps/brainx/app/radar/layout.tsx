import type { Metadata } from 'next'
import { requireSubscriber } from '@/lib/access'
import RadarNav from '@/app/components/shell/RadarNav'

export const dynamic = 'force-dynamic'

// The subscriber dashboard is the deliverable a paying customer bought —
// never indexed, never in the sitemap. This is the fix for the 2026-09-16
// bug where /overview and five siblings were public and crawlable.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function RadarLayout({ children }: { children: React.ReactNode }) {
  // Next.js layouts do not receive searchParams (only page.tsx does), so the
  // magic-link token is exchanged at the standalone /enter route — outside
  // this gated segment — before anything here ever redirects.
  const subscriber = await requireSubscriber()

  return (
    <div className="bx-app">
      <RadarNav subscriber={{ email: subscriber.email, tier: subscriber.tier }} />
      <main className="bx-app-main">{children}</main>
    </div>
  )
}
