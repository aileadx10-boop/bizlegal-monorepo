import { z } from 'zod'

/**
 * Schema for one radar run file (`content/runs/<YYYY-MM-DD>.json`), the only
 * way opportunities enter Neon. Written by a Claude Code session following
 * `agents/brainx/radar-run/SOP.md`; validated by `tools/ingest-radar.ts`.
 *
 * The schema is strict on purpose: an unknown key is a schema drift, not a
 * bonus field. Rules that need the network (URL resolution) or the database
 * (market exists, slug unique) live in the tool; everything a pure function
 * can check lives here so `ingest-schema.test.ts` runs without either.
 */

export const MAX_EXCERPT_WORDS = 40
export const MIN_EVIDENCE_PER_OPPORTUNITY = 3

/**
 * Words that describe a machine BrainX does not run. The radar is weekly and
 * operator-run; the site says so with a real `research_runs` timestamp. If a
 * future cron makes any of these true, delete the word here — do not add a
 * `bizlegal-allow`.
 */
export const BANNED_PROSE = /\b(guarantee[sd]?|24\/7|continuous(ly)?|real[- ]time)\b/i

const iso = z.string().regex(/^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/, 'ISO date or datetime')

export const evidenceKind = z.enum(['demand', 'voice', 'competitor', 'regulatory'])

export const evidenceIn = z.strictObject({
  key: z.string().regex(/^ev-\d{2,}$/, 'ev-NN'),
  kind: evidenceKind,
  title: z.string().min(8).max(200),
  url: z.string().url(),
  publisher: z.string().min(2).max(120),
  published_at: iso.nullable().default(null),
  excerpt: z.string().max(600).nullable().default(null),
  /** Free text for the operator — 'regulator', 'forum', 'pricing page'. */
  source_type: z.string().min(2).max(60),
})

export const factorScores = z.strictObject({
  demand: z.number().min(0).max(100),
  pain: z.number().min(0).max(100),
  wtp: z.number().min(0).max(100),
  competition: z.number().min(0).max(100),
  legal: z.number().min(0).max(100),
  automation: z.number().min(0).max(100),
  acquisition: z.number().min(0).max(100),
})

export const evidenceRef = z.strictObject({
  key: z.string(),
  weight: z.number().min(0).max(1).default(1),
  note: z.string().max(400).nullable().default(null),
})

export const opportunityIn = z.strictObject({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'kebab-case'),
  name: z.string().min(8).max(140),
  problem: z.string().min(40).max(1200),
  target_customer: z.string().min(4).max(300).nullable().default(null),
  proposed_product: z.string().min(4).max(300).nullable().default(null),
  proposed_pricing: z
    .strictObject({
      initial: z.number().positive().optional(),
      recurring: z.number().positive().optional(),
      recurring_period: z.enum(['month', 'year']).optional(),
    })
    .nullable()
    .default(null),
  gtm_channels: z.array(z.string().min(2).max(80)).max(8).default([]),
  why_now: z.array(z.string().min(10).max(300)).min(1).max(6),
  factor_scores: factorScores,
  /** When present, the tool refuses a file whose computed status disagrees. */
  expected_status: z.enum(['build', 'validate', 'watch', 'ignore']).optional(),
  status_reason: z.string().min(10).max(600),
  confidence: z.number().min(0).max(1),
  evidence: z.array(evidenceRef).min(MIN_EVIDENCE_PER_OPPORTUNITY).max(20),
})

export const runFile = z.strictObject({
  run_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  market_slug: z.string().min(3).max(60),
  /** Record the session model and anything the next operator must know. */
  analyst_notes: z.string().max(2000).optional(),
  evidence: z.array(evidenceIn).min(MIN_EVIDENCE_PER_OPPORTUNITY).max(200),
  opportunities: z.array(opportunityIn).min(1).max(40),
})

export type EvidenceIn = z.infer<typeof evidenceIn>
export type OpportunityIn = z.infer<typeof opportunityIn>
export type RunFile = z.infer<typeof runFile>

export interface RuleViolation {
  readonly rule: string
  readonly where: string
  readonly message: string
}

export function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length
}

function isBareOrigin(u: URL): boolean {
  return (u.pathname === '/' || u.pathname === '') && !u.search
}

const SHORTENERS = new Set(['bit.ly', 't.co', 'tinyurl.com', 'goo.gl', 'ow.ly', 'buff.ly', 'lnkd.in'])

/** Static checks on an already-parsed URL. Resolution (the network) is the tool's job. */
export function urlProblems(raw: string): string | null {
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return 'not a URL'
  }
  if (u.protocol !== 'https:') return 'must be https'
  if (isBareOrigin(u)) return 'bare origin — link the document, not the homepage'
  if (SHORTENERS.has(u.hostname.replace(/^www\./, ''))) return 'URL shortener'
  if (/google\.[a-z.]+$/.test(u.hostname) && u.pathname.startsWith('/search')) return 'search results page'
  return null
}

export function normalizeUrl(raw: string): string {
  const u = new URL(raw)
  u.hash = ''
  u.hostname = u.hostname.toLowerCase().replace(/^www\./, '')
  for (const p of Array.from(u.searchParams.keys())) if (/^utm_/i.test(p)) u.searchParams.delete(p)
  // Strip a trailing slash from the PATH itself (not the serialized string) —
  // a query string after the path means the trailing slash isn't at the end
  // of u.toString(), so checking the final string misses '/path/?x=1'.
  if (u.pathname.length > 1 && u.pathname.endsWith('/')) u.pathname = u.pathname.slice(0, -1)
  return u.toString()
}

const URL_IN_PROSE = /https?:\/\/[^\s)>\]"']+/gi

/**
 * Every rule a pure function can enforce. Returns an empty array when the
 * file is clean. Duplicated in spirit by the DB trigger `evidence_gate()`,
 * which only fires on UPDATE — so the tool must never rely on it alone.
 */
export function staticViolations(file: RunFile): RuleViolation[] {
  const out: RuleViolation[] = []
  const keys = new Map<string, EvidenceIn>()
  const seenUrls = new Map<string, string>()

  file.evidence.forEach((ev, i) => {
    const where = `evidence[${i}] ${ev.key}`
    if (keys.has(ev.key)) out.push({ rule: 'evidence.key.unique', where, message: 'duplicate key' })
    keys.set(ev.key, ev)
    const problem = urlProblems(ev.url)
    if (problem) out.push({ rule: 'evidence.url', where, message: problem })
    else {
      const n = normalizeUrl(ev.url)
      const prior = seenUrls.get(n)
      if (prior) out.push({ rule: 'evidence.url.unique', where, message: `same document as ${prior}` })
      seenUrls.set(n, ev.key)
    }
    if (ev.excerpt && wordCount(ev.excerpt) > MAX_EXCERPT_WORDS) {
      out.push({ rule: 'evidence.excerpt.length', where, message: `excerpt is ${wordCount(ev.excerpt)} words; max ${MAX_EXCERPT_WORDS}` })
    }
  })

  const evidenceUrls = new Set(Array.from(keys.values()).map((e) => normalizeUrl(e.url)).filter(Boolean))
  const slugs = new Set<string>()

  file.opportunities.forEach((op, i) => {
    const where = `opportunities[${i}] ${op.slug}`
    if (slugs.has(op.slug)) out.push({ rule: 'opportunity.slug.unique', where, message: 'duplicate slug in file' })
    slugs.add(op.slug)

    const refKeys = op.evidence.map((r) => r.key)
    const distinct = new Set(refKeys)
    if (distinct.size !== refKeys.length) out.push({ rule: 'opportunity.evidence.distinct', where, message: 'repeated evidence key' })
    for (const k of distinct) {
      if (!keys.has(k)) out.push({ rule: 'opportunity.evidence.exists', where, message: `unknown evidence key ${k}` })
    }
    if (distinct.size < MIN_EVIDENCE_PER_OPPORTUNITY) {
      out.push({ rule: 'opportunity.evidence.min', where, message: `needs ≥ ${MIN_EVIDENCE_PER_OPPORTUNITY} distinct evidence, has ${distinct.size}` })
    }
    const kinds = new Set(Array.from(distinct).map((k) => keys.get(k)?.kind).filter(Boolean))
    if (kinds.size < 2) out.push({ rule: 'opportunity.evidence.kinds', where, message: 'built on a single evidence kind (flag)' })

    const prose = [op.name, op.problem, op.target_customer ?? '', op.proposed_product ?? '', op.status_reason, ...op.why_now, ...op.gtm_channels].join('\n')
    for (const m of prose.match(URL_IN_PROSE) ?? []) {
      let ok = false
      try {
        ok = evidenceUrls.has(normalizeUrl(m))
      } catch {
        ok = false
      }
      if (!ok) out.push({ rule: 'opportunity.prose.url', where, message: `URL in prose is not evidence: ${m}` })
    }
    const banned = prose.match(BANNED_PROSE)
    if (banned) out.push({ rule: 'opportunity.prose.banned', where, message: `banned word "${banned[0]}"` })
  })

  return out
}

/** Rules whose failure is a warning rather than a rejection. */
export const WARN_ONLY_RULES: ReadonlySet<string> = new Set(['opportunity.evidence.kinds'])

export function splitViolations(v: readonly RuleViolation[]): { errors: RuleViolation[]; warnings: RuleViolation[] } {
  return {
    errors: v.filter((x) => !WARN_ONLY_RULES.has(x.rule)),
    warnings: v.filter((x) => WARN_ONLY_RULES.has(x.rule)),
  }
}
