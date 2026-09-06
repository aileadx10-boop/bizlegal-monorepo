import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { GUIDES } from '@/lib/guides'
import BlogPostView from '../BlogPostView'

interface BlogSlugPageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogSlugPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (post) {
    return {
      title: `${post.title} | BizLegal AI`,
      description: post.description,
      alternates: { canonical: `https://bizlegal-ai.com/blog/${post.slug}` },
      openGraph: {
        title: post.title,
        description: post.description,
        url: `https://bizlegal-ai.com/blog/${post.slug}`,
        type: 'article',
      },
    }
  }

  // Guide slugs keep their canonical /guides/[slug] URL — this route only
  // exists so legacy /blog/[slug] links land somewhere instead of 404ing.
  const guide = GUIDES.find((g) => g.href === `/guides/${params.slug}`)
  if (guide) {
    return {
      title: guide.title,
      description: guide.description,
    }
  }

  return {}
}

export default function BlogSlugPage({ params }: BlogSlugPageProps) {
  const post = getPostBySlug(params.slug)
  if (post) {
    return <BlogPostView post={post} />
  }

  const guide = GUIDES.find((g) => g.href === `/guides/${params.slug}`)
  if (guide) {
    permanentRedirect(`/guides/${params.slug}`)
  }

  notFound()
}
