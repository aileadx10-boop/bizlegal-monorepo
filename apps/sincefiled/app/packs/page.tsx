import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { grantedPacks } from '@/lib/packs'

export const dynamic = 'force-dynamic'

export default async function PacksPage() {
  const session = verifyToken(cookies().get('sf_session')?.value ?? '')
  if (!session) redirect('/login')
  const grants = await grantedPacks(session.email)

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 680, margin: '3rem auto', padding: '0 1rem' }}>
      <h1>Your rhythm packs</h1>
      {grants.length === 0 ? (
        <p>No pack purchase is attached to this email. <Link href="/pricing">View packs</Link>.</p>
      ) : (
        <ul>
          {grants.map((productId) => (
            <li key={productId}>
              <a href={`/api/packs/${productId}`}>
                Download {productId === 'sf_pack_both_29' ? 'US + Dubai pack' : 'US pack'} (PDF)
              </a>
            </li>
          ))}
        </ul>
      )}
      <p style={{ fontSize: '0.8rem', color: '#777' }}>
        Templates only. Verify dates and controlling rules. Not legal advice.
      </p>
    </main>
  )
}
