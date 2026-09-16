import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runFile, staticViolations, splitViolations, urlProblems, normalizeUrl, wordCount, MAX_EXCERPT_WORDS, BANNED_PROSE, type EvidenceIn } from './ingest-schema'

const BASE_EVIDENCE: EvidenceIn[] = [
  { key: 'ev-01', kind: 'regulatory', title: 'A real regulatory filing about something', url: 'https://www.example-gov.test/filing/123', publisher: 'Example Regulator', published_at: '2026-01-01', excerpt: null, source_type: 'regulator' },
  { key: 'ev-02', kind: 'demand', title: 'A trade association resource on the same topic', url: 'https://www.example-assoc.test/resource', publisher: 'Example Association', published_at: null, excerpt: null, source_type: 'association' },
  { key: 'ev-03', kind: 'voice', title: 'A real customer question about the same topic', url: 'https://www.example-advice.test/question-1', publisher: 'Example Advice Site', published_at: null, excerpt: 'Do I really have to do this thing?', source_type: 'forum' },
]

const BASE_OPPORTUNITY = {
  slug: 'example-opportunity',
  name: 'A real, specific opportunity name here',
  problem: 'A problem statement long enough to pass the minimum length check comfortably, describing something concrete and real.',
  target_customer: 'Compliance officers at mid-size firms',
  proposed_product: 'Example Readiness Brief',
  proposed_pricing: { initial: 500, recurring: 200, recurring_period: 'month' as const },
  gtm_channels: ['Trade association outreach'],
  why_now: ['A real, dated reason this matters right now.'],
  factor_scores: { demand: 70, pain: 70, wtp: 70, competition: 60, legal: 80, automation: 60, acquisition: 55 },
  status_reason: 'A reasoned explanation for why this status was assigned, long enough to pass validation.',
  confidence: 0.6,
  evidence: [
    { key: 'ev-01', weight: 1, note: 'primary regulatory source' as string | null },
    { key: 'ev-02', weight: 0.7, note: 'demand signal' as string | null },
    { key: 'ev-03', weight: 0.6, note: 'voice signal' as string | null },
  ],
}

function baseFile(overrides: Partial<typeof BASE_OPPORTUNITY> = {}, evidenceOverride = BASE_EVIDENCE) {
  return {
    run_date: '2026-09-16',
    market_slug: 'us-re-compliance',
    evidence: evidenceOverride,
    opportunities: [{ ...BASE_OPPORTUNITY, ...overrides }],
  }
}

test('a clean file parses and has zero static violations', () => {
  const file = baseFile()
  const parsed = runFile.parse(file)
  const { errors } = splitViolations(staticViolations(parsed))
  assert.deepEqual(errors, [])
})

test('the schema itself rejects fewer than 3 evidence refs on an opportunity', () => {
  const file = baseFile({ evidence: [{ key: 'ev-01', weight: 1, note: null }, { key: 'ev-02', weight: 1, note: null }] })
  const result = runFile.safeParse(file)
  assert.equal(result.success, false)
})

test('rejects fewer than 3 DISTINCT evidence keys even when the array has 3 entries', () => {
  // 3 refs, but 'ev-01' repeated — only 2 distinct sources actually back this opportunity.
  const file = baseFile({ evidence: [{ key: 'ev-01', weight: 1, note: null }, { key: 'ev-01', weight: 1, note: null }, { key: 'ev-02', weight: 1, note: null }] })
  const parsed = runFile.parse(file)
  const { errors } = splitViolations(staticViolations(parsed))
  assert.ok(errors.some((e) => e.rule === 'opportunity.evidence.distinct'))
  assert.ok(errors.some((e) => e.rule === 'opportunity.evidence.min'))
})

test('warns (does not error) when an opportunity draws on only 1 evidence kind', () => {
  const singleKindEvidence = BASE_EVIDENCE.map((e) => ({ ...e, kind: 'regulatory' as const }))
  const file = baseFile({}, singleKindEvidence)
  const parsed = runFile.parse(file)
  const { errors, warnings } = splitViolations(staticViolations(parsed))
  assert.ok(warnings.some((w) => w.rule === 'opportunity.evidence.kinds'))
  assert.ok(!errors.some((e) => e.rule === 'opportunity.evidence.kinds'))
})

test('rejects a bare-origin evidence URL', () => {
  assert.equal(urlProblems('https://example.com'), 'bare origin — link the document, not the homepage')
  assert.equal(urlProblems('https://example.com/some/real/path'), null)
})

test('rejects a URL shortener', () => {
  assert.equal(urlProblems('https://bit.ly/abc123'), 'URL shortener')
})

test('rejects a non-https URL', () => {
  assert.equal(urlProblems('http://example.com/path'), 'must be https')
})

test('rejects a Google search results page', () => {
  assert.equal(urlProblems('https://www.google.com/search?q=x'), 'search results page')
})

test('rejects duplicate evidence URLs (normalized)', () => {
  const evidence = [
    BASE_EVIDENCE[0]!,
    { ...BASE_EVIDENCE[1]!, key: 'ev-02', url: BASE_EVIDENCE[0]!.url + '?utm_source=x' },
    BASE_EVIDENCE[2]!,
  ]
  const file = baseFile({}, evidence)
  const parsed = runFile.parse(file)
  const { errors } = splitViolations(staticViolations(parsed))
  assert.ok(errors.some((e) => e.rule === 'evidence.url.unique'))
})

test('normalizeUrl strips utm params and trailing slash', () => {
  assert.equal(normalizeUrl('https://Example.com/path/?utm_source=x&b=1'), 'https://example.com/path?b=1')
})

test('rejects excerpts over 40 words', () => {
  const longExcerpt = Array.from({ length: MAX_EXCERPT_WORDS + 5 }, () => 'word').join(' ')
  const evidence = [{ ...BASE_EVIDENCE[0]!, excerpt: longExcerpt }, BASE_EVIDENCE[1]!, BASE_EVIDENCE[2]!]
  const file = baseFile({}, evidence)
  const parsed = runFile.parse(file)
  const { errors } = splitViolations(staticViolations(parsed))
  assert.ok(errors.some((e) => e.rule === 'evidence.excerpt.length'))
})

test('rejects a fabricated URL in prose that is not attached evidence', () => {
  const file = baseFile({ problem: BASE_OPPORTUNITY.problem + ' See https://not-a-real-evidence-source.test for more.' })
  const parsed = runFile.parse(file)
  const { errors } = splitViolations(staticViolations(parsed))
  assert.ok(errors.some((e) => e.rule === 'opportunity.prose.url'))
})

test('rejects banned "continuous/24-7/guarantee/real-time" prose', () => {
  const file = baseFile({ status_reason: BASE_OPPORTUNITY.status_reason + ' This guarantees results.' })
  const parsed = runFile.parse(file)
  const { errors } = splitViolations(staticViolations(parsed))
  assert.ok(errors.some((e) => e.rule === 'opportunity.prose.banned'))
  assert.ok(BANNED_PROSE.test('this guarantees results'))
})

test('rejects a schema violation (missing required field)', () => {
  const { problem: _drop, ...rest } = BASE_OPPORTUNITY
  const bad = { run_date: '2026-09-16', market_slug: 'us-re-compliance', evidence: BASE_EVIDENCE, opportunities: [rest] }
  const result = runFile.safeParse(bad)
  assert.equal(result.success, false)
})

test('wordCount counts whitespace-separated words', () => {
  assert.equal(wordCount('one two three'), 3)
  assert.equal(wordCount('  one   two  '), 2)
})
