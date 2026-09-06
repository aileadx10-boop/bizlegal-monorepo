import type { BlogPost } from '@/lib/blog'
import Markdown from './Markdown'

function formatDate(date: string): string {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Renders a single MDX blog post. Layout, JSON-LD, and design language mirror
 * the hand-built guide pages (apps/hub/app/guides/<slug>/page.tsx).
 */
export default function BlogPostView({ post }: { post: BlogPost }) {
  const url = `https://bizlegal-ai.com/blog/${post.slug}`

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.date,
    dateModified: post.date,
    publisher: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    author: { '@type': 'Organization', name: 'BizLegal AI' },
    inLanguage: 'en-US',
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://bizlegal-ai.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* Breadcrumb */}
        <nav style={{ fontSize: '0.8rem', opacity: 0.55, marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'inherit' }}>Home</a>
          {' → '}
          <a href="/blog" style={{ color: 'inherit' }}>Blog</a>
          {' → '}
          {post.title}
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          {post.tag}
        </span>

        {/* Hero */}
        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1rem' }}>
          {post.title}
        </h1>

        <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '1.5rem' }}>
          {post.author} · {formatDate(post.date)} · {post.readTime} read
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2rem' }} />

        {/* Body */}
        <Markdown content={post.content} />

        {/* CTA */}
        <section
          style={{
            background: 'var(--color-blue-50, #eff6ff)',
            border: '1px solid var(--color-blue-200, #bfdbfe)',
            borderRadius: '12px',
            padding: '1.75rem',
            margin: '3rem 0',
          }}
        >
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            Need compliance support beyond what a post can provide?
          </h2>
          <p style={{ lineHeight: 1.7, marginBottom: '1.25rem', opacity: 0.85 }}>
            DocAI scans your SaaS agreements, DPAs, and vendor contracts for the clauses that destroy startups — clause location, severity, and suggested negotiation position — in under 10 minutes.
          </p>
          <a
            href="https://docai.bizlegal-ai.com"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.75rem',
              background: 'var(--primary, #1a56db)',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.95rem',
            }}
          >
            Scan a Contract — $97
          </a>
        </section>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p>
            This article is for informational purposes only and does not constitute legal advice. Regulations vary by jurisdiction and change frequently. Consult a licensed attorney for advice specific to your situation.
          </p>
        </footer>
      </main>
    </>
  )
}
