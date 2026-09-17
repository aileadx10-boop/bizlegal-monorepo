import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { readPages } from '@/lib/store'
import { issuePublicPageToken, verifyToken } from '@/lib/auth'
import PagesClient from '@/components/pages-client'

export default async function DashboardPage() {
  const session = verifyToken(cookies().get('cp_session')?.value ?? '')
  if (!session) redirect('/login')
  const pages = await readPages(session.email)
  const siteUrl = process.env.NODE_ENV === 'production' ? 'https://casepage.bizlegal-ai.com' : ''
  const rows = pages.map((page) => ({
    ...page,
    publicUrl: `${siteUrl}/p/${issuePublicPageToken(page.id)}`,
  }))
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '3rem auto', padding: '0 1rem' }}>
      <h1>CasePage — Dashboard</h1>
      <p>Status pages for law firms. Decision support — not legal advice. No outcome guarantees.</p>
      <PagesClient pages={rows} />
    </main>
  )
}
