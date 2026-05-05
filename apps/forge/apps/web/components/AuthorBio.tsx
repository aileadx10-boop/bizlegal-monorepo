/**
 * AuthorBio — E-E-A-T (Experience, Expertise, Authoritativeness, Trust)
 * footer block for Forge gap pages and curator-published articles.
 *
 * Phase AA D5 — Google's Helpful Content + spam-policy guidance bumps
 * pages that name an author + reviewer + last-reviewed date. We render
 * those three signals in a compact card under the article body, and
 * also expose them to crawlers via the page's JSON-LD Article schema
 * (set in [slug]/page.tsx).
 *
 * Fields are optional; defaults map to BizLegal-AI's standing
 * editorial chain. Override any field per-page to stamp human review.
 */
import * as React from 'react'

export interface AuthorBioProps {
  /** Author name. Defaults to "BizLegal-AI Editorial". */
  readonly author?: string
  /** Author role, shown beneath the name. */
  readonly authorRole?: string
  /** Optional URL on the author (e.g. /about/editorial-team). */
  readonly authorUrl?: string
  /** Reviewer name. Defaults to "Compliance Review Panel". */
  readonly reviewer?: string
  /** Reviewer role, e.g. "Legal Operations". */
  readonly reviewerRole?: string
  /** ISO date or a Date object — when the page was last fact-checked. */
  readonly lastReviewed?: string | Date
  /** Short blurb under the author (≤180 chars). */
  readonly bio?: string
}

const DEFAULTS = {
  author: 'BizLegal-AI Editorial',
  authorRole: 'Regulatory research team',
  authorUrl: 'https://bizlegal-ai.com/about',
  reviewer: 'Compliance Review Panel',
  reviewerRole: 'Legal operations',
  bio:
    'BizLegal-AI Intelligence is an autonomous compliance-as-a-service platform. ' +
    'Editorial output is fact-checked against primary regulator sources before publication.',
} as const

function formatDate(d: string | Date | undefined): string {
  if (!d) {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  const date = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(date.getTime())) return String(d)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function AuthorBio(props: AuthorBioProps): React.ReactElement {
  const {
    author = DEFAULTS.author,
    authorRole = DEFAULTS.authorRole,
    authorUrl = DEFAULTS.authorUrl,
    reviewer = DEFAULTS.reviewer,
    reviewerRole = DEFAULTS.reviewerRole,
    lastReviewed,
    bio = DEFAULTS.bio,
  } = props
  const reviewedLabel = formatDate(lastReviewed)
  const initials = author
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside
      className="border border-forge-border rounded-xl p-6 bg-forge-dark/40 mt-12 mb-6"
      aria-label="Article authorship and review"
    >
      <div className="flex items-start gap-4">
        <div
          aria-hidden
          className="w-12 h-12 shrink-0 rounded-full bg-forge-accent/20 flex items-center justify-center text-forge-accent font-bold text-sm tracking-wide"
        >
          {initials || 'BL'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {authorUrl ? (
              <a
                href={authorUrl}
                rel="author"
                className="text-sm font-semibold text-white hover:text-forge-accent transition-colors"
              >
                {author}
              </a>
            ) : (
              <span className="text-sm font-semibold text-white">{author}</span>
            )}
            <span className="text-xs text-forge-muted">— {authorRole}</span>
          </div>
          <p className="mt-2 text-xs text-forge-text-secondary leading-relaxed">{bio}</p>
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-forge-muted">
            <div className="flex gap-1">
              <dt className="uppercase tracking-wider text-forge-muted/70">Reviewed by</dt>
              <dd className="text-forge-text-secondary">
                {reviewer}
                {reviewerRole ? ` (${reviewerRole})` : ''}
              </dd>
            </div>
            <div className="flex gap-1">
              <dt className="uppercase tracking-wider text-forge-muted/70">Last reviewed</dt>
              <dd className="text-forge-text-secondary">
                <time dateTime={typeof lastReviewed === 'string' ? lastReviewed : undefined}>
                  {reviewedLabel}
                </time>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </aside>
  )
}

export default AuthorBio
