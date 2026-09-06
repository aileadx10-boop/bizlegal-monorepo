import type { BlogPostMeta } from '@/lib/blog'

/**
 * Server-rendered card grid for MDX blog posts. Mirrors BlogGrid's card
 * styling but links to /blog/[slug] (the MDX route) instead of /guides/[slug].
 */
export default function BlogPostGrid({ posts }: { posts: BlogPostMeta[] }) {
  if (posts.length === 0) return null

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem',
      }}
    >
      {posts.map((post) => (
        <a
          key={post.slug}
          href={`/blog/${post.slug}`}
          style={{
            display: 'block',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: '12px',
            padding: '1.5rem',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'border-color 0.15s',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
              opacity: 0.5,
              marginBottom: '0.6rem',
            }}
          >
            {post.tag}
          </span>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              lineHeight: 1.4,
              marginBottom: '0.6rem',
              marginTop: 0,
            }}
          >
            {post.title}
          </h2>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.65, opacity: 0.7, margin: 0 }}>
            {post.description}
          </p>
        </a>
      ))}
    </div>
  )
}
