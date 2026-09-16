import { test } from 'node:test'
import assert from 'node:assert/strict'
import { GUIDES } from './index'

/**
 * The fleet's page-quality-gate thresholds (services/seo-agents/page_quality_gate.py),
 * re-implemented as a structural check for BrainX's own guide content: ≥600
 * words, ≥3 citations, ≥3 unique FAQs, ≥5 internal links, a YMYL disclaimer
 * marker, and no outcome-guarantee language.
 */

const MIN_WORDS = 600
const MIN_CITATIONS = 3
const MIN_FAQS = 3
const MIN_INTERNAL_LINKS = 5

const GUARANTEE_PATTERNS = [
  /guarantee[sd]?\s+(compliance|approval|results|outcome)/i,
  /will\s+(pass|be compliant|ensure compliance)/i,
  /100%\s+compliant/i,
  /fully compliant/i,
  /never be fined/i,
  /we are your (lawyer|law firm|attorney)/i,
]

const DISCLAIMER_MARKERS = ['not legal advice', 'is not a law firm', 'consult qualified counsel']

function wordCount(paragraphs: readonly string[]): number {
  return paragraphs.join(' ').trim().split(/\s+/).filter(Boolean).length
}

for (const guide of GUIDES) {
  test(`${guide.slug}: at least ${MIN_WORDS} words`, () => {
    assert.ok(wordCount(guide.paragraphs) >= MIN_WORDS, `${guide.slug} has ${wordCount(guide.paragraphs)} words`)
  })

  test(`${guide.slug}: at least ${MIN_CITATIONS} citations with valid https URLs`, () => {
    assert.ok(guide.citations.length >= MIN_CITATIONS)
    for (const c of guide.citations) {
      assert.ok(c.url.startsWith('https://'), `${guide.slug}: ${c.url} is not https`)
      assert.ok(!/google\.[a-z.]+\/search/.test(c.url), `${guide.slug}: ${c.url} is a search results page`)
    }
  })

  test(`${guide.slug}: citation URLs are unique`, () => {
    const seen = new Set(guide.citations.map((c) => c.url))
    assert.equal(seen.size, guide.citations.length)
  })

  test(`${guide.slug}: at least ${MIN_FAQS} unique FAQs, distinct from the title`, () => {
    assert.ok(guide.faqs.length >= MIN_FAQS)
    const questions = new Set(guide.faqs.map((f) => f.q.toLowerCase()))
    assert.equal(questions.size, guide.faqs.length)
    for (const f of guide.faqs) assert.notEqual(f.q.toLowerCase(), guide.title.toLowerCase())
  })

  test(`${guide.slug}: at least ${MIN_INTERNAL_LINKS} internal links`, () => {
    assert.ok(guide.internalLinks.length >= MIN_INTERNAL_LINKS)
    for (const l of guide.internalLinks) assert.ok(l.href.startsWith('/'), `${guide.slug}: ${l.href} is not an internal path`)
  })

  test(`${guide.slug}: contains a YMYL disclaimer marker`, () => {
    const text = guide.paragraphs.join(' ').toLowerCase() + ' ' + guide.faqs.map((f) => f.a).join(' ').toLowerCase()
    const hasMarker = DISCLAIMER_MARKERS.some((m) => text.includes(m))
    assert.ok(hasMarker, `${guide.slug}: no disclaimer marker found`)
  })

  test(`${guide.slug}: no outcome-guarantee language`, () => {
    const text = guide.paragraphs.join(' ') + ' ' + guide.faqs.map((f) => f.a).join(' ')
    for (const pattern of GUARANTEE_PATTERNS) {
      assert.ok(!pattern.test(text), `${guide.slug}: matched banned pattern ${pattern}`)
    }
  })
}

test('guide slugs are unique', () => {
  const slugs = new Set(GUIDES.map((g) => g.slug))
  assert.equal(slugs.size, GUIDES.length)
})
