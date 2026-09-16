import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { findByToken, setAccessCookie } from '@/lib/access'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { robots: { index: false, follow: false } }

/**
 * /enter?k=<token> — the magic-link landing spot. Deliberately outside the
 * `/radar` segment: `app/radar/layout.tsx` gates every child page on an
 * existing subscriber cookie, so the token exchange has to happen somewhere
 * that gate doesn't run first, or a fresh link would bounce to /access
 * before it ever got the chance to set the cookie.
 *
 * Sets the cookie, then redirects — the token never sits in the visible URL
 * on the page the subscriber lands on.
 */
export default async function EnterPage({ searchParams }: { searchParams: { k?: string } }) {
  const token = searchParams?.k
  if (token) {
    const sub = await findByToken(token)
    if (sub) {
      setAccessCookie(sub.access_token)
      redirect('/radar')
    }
  }
  redirect('/access?reason=invalid')
}
