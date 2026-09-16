import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SAMPLE_OPPORTUNITIES } from './sample'
import { urlProblems, wordCount, MAX_EXCERPT_WORDS, MIN_EVIDENCE_PER_OPPORTUNITY } from '@/lib/radar/ingest-schema'
import { fromFixture } from '@/lib/radar/map'
import { weightedScore, statusFor } from '@bizlegal/scoring'

/**
 * Static, network-free checks on the sample radar — the same rules
 * tools/ingest-radar.ts enforces on a live weekly run. This is the test that
 * makes it structurally impossible to ship the 2026-09-16 regression (three
 * hand-seeded signals pointing at homepages) again in the sample fixtures.
 */

test('every fixture has at least 3 evidence items', () => {
  for (const o of SAMPLE_OPPORTUNITIES) {
    assert.ok(o.evidence.length >= MIN_EVIDENCE_PER_OPPORTUNITY, `${o.slug} has ${o.evidence.length} evidence items`)
  }
})

test('every fixture draws on at least 2 evidence kinds', () => {
  for (const o of SAMPLE_OPPORTUNITIES) {
    const kinds = new Set(o.evidence.map((e) => e.kind))
    assert.ok(kinds.size >= 2, `${o.slug} evidence kinds: ${[...kinds].join(',')}`)
  }
})

test('every evidence URL passes the static URL rules (https, not a bare origin, not a search page, not a shortener)', () => {
  for (const o of SAMPLE_OPPORTUNITIES) {
    for (const e of o.evidence) {
      const problem = urlProblems(e.url)
      assert.equal(problem, null, `${o.slug} / ${e.id}: ${e.url} — ${problem}`)
    }
  }
})

test('evidence URLs are unique within each opportunity', () => {
  for (const o of SAMPLE_OPPORTUNITIES) {
    const seen = new Set<string>()
    for (const e of o.evidence) {
      assert.ok(!seen.has(e.url), `${o.slug}: duplicate URL ${e.url}`)
      seen.add(e.url)
    }
  }
})

test('excerpts are verbatim-length, at most 40 words', () => {
  for (const o of SAMPLE_OPPORTUNITIES) {
    for (const e of o.evidence) {
      if (!e.excerpt) continue
      assert.ok(wordCount(e.excerpt) <= MAX_EXCERPT_WORDS, `${o.slug} / ${e.id}: excerpt is ${wordCount(e.excerpt)} words`)
    }
  }
})

test('no banned "continuous/24-7/real-time/guarantee" language in prose fields', () => {
  const banned = /\b(guarantee[sd]?|24\/7|continuous(ly)?|real[- ]time)\b/i
  for (const o of SAMPLE_OPPORTUNITIES) {
    const prose = [o.name, o.problem, o.target_customer ?? '', o.proposed_product ?? '', o.status_reason, ...o.why_now].join('\n')
    assert.equal(banned.test(prose), false, `${o.slug} contains banned language`)
  }
})

test('slugs are unique', () => {
  const slugs = new Set(SAMPLE_OPPORTUNITIES.map((o) => o.slug))
  assert.equal(slugs.size, SAMPLE_OPPORTUNITIES.length)
})

test('all three verticals are represented', () => {
  const verticals = new Set(SAMPLE_OPPORTUNITIES.map((o) => o.vertical))
  assert.ok(verticals.has('real_estate'))
  assert.ok(verticals.has('legal_compliance'))
  assert.ok(verticals.has('ai_fintech_regulation'))
})

test('fromFixture recomputes the total from the seven factors (no stored-score drift)', () => {
  for (const o of SAMPLE_OPPORTUNITIES) {
    const vm = fromFixture(o)
    const expected = weightedScore(o.factors)
    assert.equal(vm.score.total, expected)
    assert.equal(vm.score.status, statusFor(expected))
  }
})

test('fromFixture throws if evidence drops below 3 (defensive — should never happen from real data)', () => {
  const broken = { ...SAMPLE_OPPORTUNITIES[0]!, evidence: SAMPLE_OPPORTUNITIES[0]!.evidence.slice(0, 2) }
  assert.throws(() => fromFixture(broken))
})
