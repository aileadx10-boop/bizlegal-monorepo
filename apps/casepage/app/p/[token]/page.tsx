import { notFound } from 'next/navigation'
import { verifyPublicPageToken } from '@/lib/auth'
import { readPublicPage } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function PublicMatterPage({ params }: { params: { token: string } }) {
  const id = verifyPublicPageToken(params.token)
  if (!id) notFound()
  const page = await readPublicPage(id)
  if (!page) notFound()

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 680, margin: '3rem auto', padding: '0 1rem' }}>
      <p style={{ color: '#666' }}>Matter status</p>
      <h1>{page.title}</h1>
      <p>{page.jurisdiction} · Updated milestones</p>
      <ol>
        {page.milestones.map((milestone, index) => (
          <li key={`${milestone.title}-${index}`} style={{ marginBottom: '0.75rem' }}>
            <strong>{milestone.title}</strong>
            <div>{milestone.doneAt ? `Completed ${new Date(milestone.doneAt).toLocaleDateString()}` : 'Pending'}</div>
          </li>
        ))}
      </ol>
      <p style={{ fontSize: '0.8rem', color: '#777' }}>
        Status information only. Contact the responsible professional for advice or deadlines.
      </p>
    </main>
  )
}
