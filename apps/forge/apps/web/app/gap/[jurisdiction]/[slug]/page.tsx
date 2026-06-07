import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import AuthorBio from '@/components/AuthorBio'
import MermaidDiagram from '@/components/MermaidDiagram'
import { isFaqEntry, type GapPage } from '@/lib/types/gap-page'

export const dynamic = 'force-dynamic'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Forge Vercel is provisioned with SUPABASE_SERVICE_KEY (see forge
  // CLAUDE.md), but this file read SUPABASE_SERVICE_ROLE_KEY — so the
  // client was null and EVERY gap page 404'd (notFound) in prod. Accept
  // both names, matching the hub webhook pattern.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

interface GapPageParams {
  params: { jurisdiction: string; slug: string }
}

const ctaUrls: Record<string, string> = {
  tracr: 'https://tracr.bizlegal-ai.com',
  brai: 'https://brai.bizlegal-ai.com',
  lexaudit: 'https://lexaudit.bizlegal-ai.com',
  docai: 'https://docai.bizlegal-ai.com',
  forge: 'https://forge.bizlegal-ai.com',
  leadforge: 'https://leadforge.bizlegal-ai.com',
}

// W4.2 — append UTM params to cross-domain CTA links so the destination
// subdomain's analytics can attribute the visit back to the originating
// gap-page slug. Same-domain links (relative paths like /decision-tree)
// don't need UTMs since session-level analytics already cover them.
//
// Convention: utm_source=forge_gap (always), utm_medium=cta (always),
// utm_campaign=<gap_slug> (per-page), utm_content=<cta_id> (which
// button on the page — currently 'tree' for the decision-tree
// preliminary check, 'audit' for the main paid-CTA).
function withCtaUtm(href: string, slug: string, cta_id: 'tree' | 'audit'): string {
  if (!href) return href
  // Relative URL → same domain → no UTM rewrite (would create an
  // invalid base when passed to URL()). Forge BOI tree is the case.
  if (!/^https?:\/\//i.test(href)) return href
  try {
    const u = new URL(href)
    // Don't clobber pre-set UTMs (e.g. if a future ctaUrls entry
    // already pre-encodes campaign tracking).
    if (!u.searchParams.has('utm_source')) u.searchParams.set('utm_source', 'forge_gap')
    if (!u.searchParams.has('utm_medium')) u.searchParams.set('utm_medium', 'cta')
    if (!u.searchParams.has('utm_campaign')) u.searchParams.set('utm_campaign', slug)
    u.searchParams.set('utm_content', cta_id)
    return u.toString()
  } catch {
    return href
  }
}

interface DecisionTool {
  readonly href: string
  readonly label: string
  readonly cta: string
}

// Match a gap page to a free preliminary-check tool. BOI tree lives
// on this domain (/decision-tree); the other 4 V1 magnets live on
// their respective subdomains. We deep-link cross-domain to keep each
// surface's onboarding consistent.
//
// As of D9 the available trees are: Forge BOI (this domain), TRACR
// wallet trace, DocAI privacy scan, LexAudit compliance monitor, BRAI
// sanctions screening.
function decisionToolFor(gap: {
  cta_product?: string | null
  regulation?: string | null
  slug?: string | null
}): DecisionTool | null {
  const reg = (gap.regulation ?? '').toLowerCase()
  const slug = (gap.slug ?? '').toLowerCase()

  if (
    /\bboi\b|beneficial[ -]ownership|corporate transparency|cta\b|fincen/i.test(reg) ||
    /\bboi\b|beneficial-ownership/i.test(slug) ||
    gap.cta_product === 'forge'
  ) {
    return {
      href: '/decision-tree',
      label: 'BOI filing decision tree',
      cta: 'Run BOI screen',
    }
  }
  if (
    /\bofac\b|sanctions|sdn\b|ofsi/i.test(reg) ||
    /sanctions|ofac/i.test(slug) ||
    gap.cta_product === 'brai'
  ) {
    return {
      href: 'https://brai.bizlegal-ai.com/decision-tree',
      label: 'sanctions screening decision tree',
      cta: 'Run sanctions screen',
    }
  }
  if (
    /travel rule|fincen msb|aml|crypto|digital asset|wallet/i.test(reg) ||
    /tracr|wallet|crypto/i.test(slug) ||
    gap.cta_product === 'tracr'
  ) {
    return {
      href: 'https://tracr.bizlegal-ai.com/decision-tree',
      label: 'wallet-trace exposure decision tree',
      cta: 'Run wallet-trace screen',
    }
  }
  if (
    /\bgdpr\b|ccpa|cpra|privacy|dsar|pii/i.test(reg) ||
    /privacy|gdpr|ccpa/i.test(slug) ||
    gap.cta_product === 'docai'
  ) {
    return {
      href: 'https://docai.bizlegal-ai.com/decision-tree',
      label: 'privacy exposure decision tree',
      cta: 'Run privacy screen',
    }
  }
  if (
    /multi[ -]?jurisdiction|compliance monitor|regulatory drift|ongoing compliance/i.test(reg) ||
    /lexaudit|compliance/i.test(slug) ||
    gap.cta_product === 'lexaudit'
  ) {
    return {
      href: 'https://lexaudit.bizlegal-ai.com/decision-tree',
      label: 'compliance monitoring decision tree',
      cta: 'Run monitoring screen',
    }
  }
  if (
    /\btcpa\b|can[ -]?spam|telemarketing|do not call|consent|outbound/i.test(reg) ||
    /tcpa|leadgen|lead-gen|outbound/i.test(slug) ||
    gap.cta_product === 'leadforge'
  ) {
    return {
      href: 'https://leadforge.bizlegal-ai.com/decision-tree',
      label: 'TCPA exposure decision tree',
      cta: 'Run TCPA screen',
    }
  }
  return null
}

async function getGapPage(slug: string): Promise<GapPage | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data } = await supabase
    .from('gap_pages')
    .select('*')
    .eq('slug', slug)
    .single()
  return (data as GapPage | null) ?? null
}

export async function generateMetadata({ params }: GapPageParams): Promise<Metadata> {
  const gap = await getGapPage(params.slug)
  if (!gap) return { title: 'Not Found' }
  return {
    title: gap.title,
    description: gap.meta_description || gap.summary?.slice(0, 160),
    openGraph: {
      title: gap.title,
      description: gap.meta_description || gap.summary?.slice(0, 160),
      url: `https://forge.bizlegal-ai.com/gap/${gap.jurisdiction}/${gap.slug}`,
    },
  }
}

function RiskBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#ef4444' : score >= 50 ? '#f59e0b' : '#22c55e'
  const label = score >= 80 ? 'CRITICAL' : score >= 50 ? 'HIGH' : 'MODERATE'
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 9999, border: `1px solid ${color}`, background: `${color}15` }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
      <span style={{ color, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>{label} RISK — {score}/100</span>
    </div>
  )
}

export default async function GapPage({ params }: GapPageParams) {
  const gap = await getGapPage(params.slug)
  if (!gap) notFound()

  const ctaUrl = ctaUrls[gap.cta_product] || 'https://forge.bizlegal-ai.com'
  const valueProps: readonly string[] = gap.value_props ?? []
  const pageUrl = `https://forge.bizlegal-ai.com/gap/${gap.jurisdiction}/${gap.slug}`
  const publishedAt = gap.published_at
    ? new Date(gap.published_at).toISOString()
    : new Date().toISOString()

  // schema.org Article — establishes content type, recency, authorship.
  // Adding this lifts SEO score 5-10 points and unlocks rich-snippet
  // eligibility in Google results (date + author + summary card).
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: gap.title,
    description: gap.meta_description || gap.summary?.slice(0, 160),
    // Prefer the generated editorial hero (visual enrichment, migration
    // 20260607). Falls back to the site OG default for rows without a
    // generated image yet. A real, content-specific image strengthens the
    // Article rich-snippet eligibility.
    image: gap.hero_image_url || 'https://forge.bizlegal-ai.com/og-default.png',
    datePublished: publishedAt,
    dateModified: gap.updated_at
      ? new Date(gap.updated_at).toISOString()
      : publishedAt,
    author: {
      '@type': 'Organization',
      name: 'BizLegal AI',
      url: 'https://bizlegal-ai.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BizLegal AI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://forge.bizlegal-ai.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    about: gap.regulation
      ? { '@type': 'Thing', name: gap.regulation }
      : undefined,
    keywords: Array.isArray(gap.tags)
      ? gap.tags.join(', ')
      : undefined,
  }

  // BreadcrumbList — helps Google show breadcrumbs in result row,
  // small but real CTR lift on long URLs.
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Forge',
        item: 'https://forge.bizlegal-ai.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: gap.jurisdiction?.toUpperCase() || 'Jurisdiction',
        item: `https://forge.bizlegal-ai.com/gap/${gap.jurisdiction}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: gap.title,
        item: pageUrl,
      },
    ],
  }

  // FAQPage — only emit when the row has structured FAQ entries
  // (gap.faqs jsonb column with [{q, a}, ...]). Schema validators
  // reject FAQ blocks with zero entries. The audit (type-design F-9)
  // flagged the implicit narrowing — we now filter through isFaqEntry
  // so a typo on a column or a stray null doesn't render `name: undefined`.
  const faqEntries = Array.isArray(gap.faqs) ? gap.faqs.filter(isFaqEntry) : []
  const faqSchema =
    faqEntries.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqEntries.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }
      : null

  return (
    <main className="min-h-screen bg-forge-dark text-forge-text">
      {/* schema.org JSON-LD — structured-data signals for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Risk Badge */}
        <div className="mb-6">
          <RiskBadge score={gap.risk_score} />
        </div>

        {/* Regulation tag */}
        <div className="mb-4">
          <span className="text-xs uppercase tracking-widest text-forge-muted">
            {gap.jurisdiction?.toUpperCase()} — {gap.regulation}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-8">
          {gap.title}
        </h1>

        {/* Hero image — editorial infographic generated per-page (visual
            enrichment, migration 20260607). Eager + high priority since
            it's above the fold; explicit dimensions reserve layout space
            to avoid CLS. alt = title for accessibility + SEO. Only renders
            once a row has a generated hero. */}
        {gap.hero_image_url && (
          <figure className="mb-12 -mx-2 md:mx-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gap.hero_image_url}
              alt={gap.title}
              width={1536}
              height={1024}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="w-full h-auto rounded-2xl border border-forge-border bg-forge-card/50"
            />
          </figure>
        )}

        {/* Summary */}
        <div className="border-l-2 border-forge-accent pl-6 mb-12">
          <p className="text-lg text-forge-text-secondary leading-relaxed">
            {gap.summary}
          </p>
        </div>

        {/* Compliance-flow diagram — Mermaid source generated per-page,
            rendered client-side over a server-safe <pre> fallback. Only
            renders when a row has a diagram. */}
        {gap.diagram_mermaid && (
          <MermaidDiagram
            source={gap.diagram_mermaid}
            caption={gap.diagram_caption}
          />
        )}

        {/* Value Props */}
        {valueProps.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {valueProps.map((prop, i) => (
              <div key={i} className="border border-forge-border rounded-xl p-6 bg-forge-dark/50">
                <div className="w-8 h-8 rounded-full bg-forge-accent/20 flex items-center justify-center mb-4">
                  <span className="text-forge-accent font-bold text-sm">{i + 1}</span>
                </div>
                <p className="text-sm text-forge-text-secondary leading-relaxed">{prop}</p>
              </div>
            ))}
          </div>
        )}

        {/* Free-tool callout — surfaces a same-domain decision tree
            for visitors not yet ready for the paid CTA. BOI gap pages
            point at /decision-tree (the V1 conversion-machine pattern);
            other regulators point at the matching domain landing for
            now. Phase AA D7 cross-link work. */}
        {decisionToolFor(gap) && (
          <aside
            className="border border-forge-border/60 rounded-xl p-6 mb-10 bg-forge-dark/30 flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
            aria-label="Free preliminary check"
          >
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest text-forge-accent font-semibold mb-1">
                Free · 60 seconds
              </p>
              <h3 className="text-lg font-bold text-white mb-1">
                Not sure if this rule applies to you?
              </h3>
              <p className="text-sm text-forge-text-secondary leading-relaxed">
                Run our preliminary {decisionToolFor(gap)!.label} — real signal, no signup until the result.
              </p>
            </div>
            <a
              href={withCtaUtm(decisionToolFor(gap)!.href, gap.slug, 'tree')}
              className="inline-block border border-forge-accent text-forge-accent hover:bg-forge-accent hover:text-white font-semibold px-5 py-3 rounded-lg transition-colors text-sm whitespace-nowrap"
              data-cta="forge-gap-tree"
              data-cta-slug={gap.slug}
            >
              {decisionToolFor(gap)!.cta} →
            </a>
          </aside>
        )}

        {/* CTA */}
        <div className="border border-forge-border rounded-2xl p-8 md:p-12 text-center bg-gradient-to-b from-forge-dark to-forge-dark/80 mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">
            Don&apos;t wait for enforcement
          </h2>
          <p className="text-forge-text-secondary mb-8 max-w-lg mx-auto">
            Get ahead of this regulation with automated compliance tooling. Audit your exposure in minutes.
          </p>
          <a
            href={withCtaUtm(ctaUrl, gap.slug, 'audit')}
            className="inline-block bg-forge-accent hover:bg-forge-accent-hover text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
            data-cta="forge-gap-audit"
            data-cta-slug={gap.slug}
          >
            Start Compliance Audit →
          </a>
        </div>

        {/* Lead Magnet */}
        {gap.lead_magnet_title && (
          <div className="border border-forge-border rounded-xl p-8 bg-forge-dark/50">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <span className="text-xs uppercase tracking-widest text-forge-accent font-semibold mb-2 block">Free Resource</span>
                <h3 className="text-xl font-bold text-white mb-2">{gap.lead_magnet_title}</h3>
                <p className="text-sm text-forge-muted">Download the checklist to ensure your organization meets every requirement.</p>
              </div>
              <div className="flex-shrink-0">
                <a
                  href={`/api/lead-magnet?slug=${gap.slug}&redirect=${encodeURIComponent(gap.lead_magnet_url || '/thank-you')}`}
                  className="inline-block border border-forge-accent text-forge-accent hover:bg-forge-accent hover:text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
                >
                  Get Free Checklist
                </a>
              </div>
            </div>
          </div>
        )}

        {/* E-E-A-T author + reviewer block. Last-reviewed prefers
            an explicit reviewed_at column on gap_pages, falls back to
            updated_at, then published_at. Authorship metadata also
            ships in the JSON-LD Article schema for crawlers. */}
        <AuthorBio
          author={gap.author_name || undefined}
          authorRole={gap.author_role || undefined}
          reviewer={gap.reviewer_name || undefined}
          reviewerRole={gap.reviewer_role || undefined}
          lastReviewed={gap.reviewed_at || gap.updated_at || gap.published_at || undefined}
          bio={gap.author_bio || undefined}
        />

        {/* Published date */}
        {gap.published_at && (
          <p className="mt-8 text-xs text-forge-muted text-center">
            Published {new Date(gap.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>
    </main>
  )
}
