import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Markdown from '@/app/blog/Markdown'
import {
  HUB_BASE,
  SEO_PAGE_REVALIDATE_SECONDS,
  getPublishedFactoryPage,
  getPublishedFactoryPageUrls,
  isFactoryHub,
  type FactoryHub,
  type FactoryPage,
} from '@/lib/seo-pages'

/**
 * Hub renderer for the programmatic page factory (plan v3 §P).
 *
 * URL shape: /<hub>/<slug>, where <hub> is one of FACTORY_HUBS and the row's
 * stored slug is "<hub>/<slug>". Rows are written by
 * services/seo-agents/page_factory.py and only ever reach status='published'
 * by Moses's hand — anything else 404s here.
 *
 * `[hub]` is a root-level dynamic segment, so it also catches unknown two-
 * segment paths. That is deliberate and cheap: a hub outside FACTORY_HUBS
 * notFound()s before any database call, so /foo/bar costs nothing more than
 * the 404 it already was. Every static route (/regulations/*, /guides/*,
 * /tools/*, /blog/*, …) still wins over this segment by Next's own precedence.
 */

export const revalidate = SEO_PAGE_REVALIDATE_SECONDS
export const dynamicParams = true

interface SeoPageProps {
  params: { hub: string; slug: string }
}

interface HubChrome {
  label: string
  kicker: string
  ctaLabel: string
  ctaHref: string
  ctaBlurb: string
}

const HUB_CHROME: Record<FactoryHub, HubChrome> = {
  compliance: {
    label: 'Compliance',
    kicker: 'Regulatory scope reference',
    ctaLabel: 'Run a free compliance snapshot',
    ctaHref: '/snapshot',
    ctaBlurb:
      'Ten questions, no card. You get a scored posture summary and the obligations that actually apply to your entity.',
  },
  solutions: {
    label: 'Solutions',
    kicker: 'Tool guide by sector',
    ctaLabel: 'Open the tool',
    ctaHref: '/tools',
    ctaBlurb:
      'Deterministic calculators — same inputs, same output, every time. No account needed.',
  },
  glossary: {
    label: 'Glossary',
    kicker: 'Compliance term',
    ctaLabel: 'Check whether this applies to you',
    ctaHref: '/snapshot',
    ctaBlurb: 'The free snapshot tells you whether this obligation is live for your entity today.',
  },
  playbooks: {
    label: 'Playbooks',
    kicker: 'Operational companion',
    ctaLabel: 'Read the full guide',
    ctaHref: '/guides',
    ctaBlurb: 'The long-form guide behind this playbook, with the reasoning and the source citations.',
  },
}

const DISCLAIMER =
  'BizLegal AI is regulatory research software, not a law firm. This page is general information, not legal advice, and does not create a lawyer-client relationship. Verify every deadline, threshold and obligation against the primary source cited before you act on it, and consult qualified counsel in the relevant jurisdiction.'

export async function generateStaticParams(): Promise<Array<{ hub: string; slug: string }>> {
  const urls = await getPublishedFactoryPageUrls()
  return urls.flatMap((entry) => {
    const path = entry.url.replace(`${HUB_BASE}/`, '')
    const [hub, slug] = path.split('/')
    if (!hub || !slug || !isFactoryHub(hub)) return []
    return [{ hub, slug }]
  })
}

export async function generateMetadata({ params }: SeoPageProps): Promise<Metadata> {
  if (!isFactoryHub(params.hub)) return {}
  const page = await getPublishedFactoryPage(params.hub, params.slug)
  if (!page) return { robots: { index: false, follow: false } }
  const url = `${HUB_BASE}/${page.hub}/${page.slug}`
  return {
    title: page.title,
    description: page.meta,
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description: page.meta,
      url,
      type: 'article',
      images: [{ url: `/api/og?title=${encodeURIComponent(page.title)}`, width: 1200, height: 630 }],
    },
  }
}

export default async function SeoFactoryPage({ params }: SeoPageProps) {
  if (!isFactoryHub(params.hub)) notFound()
  const page = await getPublishedFactoryPage(params.hub, params.slug)
  if (!page) notFound()

  const chrome = HUB_CHROME[page.hub]
  const ctaHref = resolveCtaHref(page, chrome)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(page, chrome)) }}
      />
      <article style={{ padding: '64px 24px 96px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <nav aria-label="Breadcrumb" style={{ fontSize: 13, opacity: 0.7, marginBottom: 20 }}>
            <Link href="/">Home</Link>
            <span aria-hidden="true"> / </span>
            <span>{chrome.label}</span>
          </nav>

          <span className="section-label">{chrome.kicker}</span>
          <h1 style={{ fontSize: '2.1rem', lineHeight: 1.2, margin: '10px 0 14px' }}>{page.title}</h1>
          {page.meta ? (
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, opacity: 0.8, marginBottom: 32 }}>
              {page.meta}
            </p>
          ) : null}

          <Markdown content={page.body} />

          {page.keyDates.length > 0 ? (
            <section aria-labelledby="key-dates" style={{ marginTop: 40 }}>
              <h2 id="key-dates" style={{ fontSize: '1.35rem', marginBottom: 12 }}>Key dates</h2>
              <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.7, opacity: 0.88 }}>
                {page.keyDates.map((d, i) => (
                  <li key={`${d.label}-${i}`}>
                    <strong>{d.label}</strong>
                    {d.detail ? ` — ${d.detail}` : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {page.faq.length > 0 ? (
            <section aria-labelledby="faq" style={{ marginTop: 48 }}>
              <h2 id="faq" style={{ fontSize: '1.35rem', marginBottom: 16 }}>
                Frequently asked questions
              </h2>
              {page.faq.map((item, i) => (
                <div key={`${item.q}-${i}`} style={{ marginBottom: 22 }}>
                  <h3 style={{ fontSize: '1.02rem', fontWeight: 700, marginBottom: 6 }}>{item.q}</h3>
                  <p style={{ lineHeight: 1.7, opacity: 0.85, margin: 0 }}>{item.a}</p>
                </div>
              ))}
            </section>
          ) : null}

          {page.citations.length > 0 ? (
            <section aria-labelledby="sources" style={{ marginTop: 48 }}>
              <h2 id="sources" style={{ fontSize: '1.35rem', marginBottom: 12 }}>Sources</h2>
              <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {page.citations.map((c, i) => (
                  <li key={`${c.url}-${i}`} style={{ marginBottom: 6 }}>
                    <a href={c.url} rel="nofollow noopener" target="_blank">
                      {c.section || c.url}
                    </a>
                    {c.regulation ? (
                      <span style={{ opacity: 0.6 }}> — {c.regulation.toUpperCase()}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <aside
            style={{
              marginTop: 48,
              padding: '24px 28px',
              border: '1px solid var(--color-border, #e5e7eb)',
              borderRadius: 12,
              background: 'var(--color-surface-alt, #f9fafb)',
            }}
          >
            <p style={{ margin: '0 0 14px', lineHeight: 1.65, opacity: 0.85 }}>{chrome.ctaBlurb}</p>
            <Link
              href={ctaHref}
              style={{
                display: 'inline-block',
                padding: '11px 22px',
                borderRadius: 8,
                fontWeight: 600,
                background: 'var(--primary, #1a56db)',
                color: '#fff',
              }}
            >
              {chrome.ctaLabel}
            </Link>
          </aside>

          <p style={{ marginTop: 40, fontSize: 13, lineHeight: 1.65, opacity: 0.65 }}>{DISCLAIMER}</p>
          <p style={{ marginTop: 10, fontSize: 12, opacity: 0.5 }}>
            Last reviewed {page.updatedAt.toISOString().slice(0, 10)}.
          </p>
        </div>
      </article>
    </>
  )
}

function resolveCtaHref(page: FactoryPage, chrome: HubChrome): string {
  const tool = page.matrixKeys.tool
  if (page.hub === 'solutions' && tool) return `/tools/${tool}`
  const guide = page.matrixKeys.guide
  if (page.hub === 'playbooks' && guide) return `/guides/${guide}`
  return chrome.ctaHref
}

function buildJsonLd(page: FactoryPage, chrome: HubChrome) {
  const url = `${HUB_BASE}/${page.hub}/${page.slug}`
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: HUB_BASE },
        { '@type': 'ListItem', position: 2, name: chrome.label, item: url },
      ],
    },
  ]
  if (page.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: page.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    })
  }
  return { '@context': 'https://schema.org', '@graph': graph }
}
