import { permanentRedirect, notFound } from 'next/navigation'
import { GUIDES } from '@/lib/guides'

/**
 * /blog and /guides share one content library. The canonical URL for
 * every article is /guides/[slug] — this route exists only so a
 * /blog/[slug] link (from social, email, or an external backlink)
 * lands somewhere instead of 404ing, without creating a second
 * indexable copy of the same content.
 */
export default function BlogSlugRedirect({ params }: { params: { slug: string } }) {
  const exists = GUIDES.some((g) => g.href === `/guides/${params.slug}`)
  if (!exists) notFound()
  permanentRedirect(`/guides/${params.slug}`)
}
