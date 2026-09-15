import { test } from 'node:test'
import assert from 'node:assert/strict'
import { collectQueue, scheduleItems, buildDigest, aoeSnippet, scoreUrl } from './worker.ts'

const drafts = [
  {
    id: 1,
    channel: 'linkedin',
    status: 'approved',
    source_url: 'https://blog.bizlegal-ai.com/a',
    source_title: 'A post',
    body: 'Body A',
  },
  {
    id: 2,
    channel: 'x',
    status: 'pending_approval',
    source_url: 'https://blog.bizlegal-ai.com/b',
    source_title: 'B post',
    body: 'Body B',
  },
  {
    id: 3,
    channel: 'reddit',
    status: 'rejected',
    source_url: 'https://blog.bizlegal-ai.com/c',
    source_title: 'C post',
    body: 'Body C',
  },
].map((d) => ({ ...d, channel_meta: {} }))

const posts = [
  { url: 'https://blog.bizlegal-ai.com/a', title: 'A post', tags: ['x'] },
  { url: 'https://blog.bizlegal-ai.com/b', title: 'B post', tags: ['y'] },
]

test('collectQueue filters rejected drafts', () => {
  const items = collectQueue(drafts, null, { maxItems: 100 })
  assert.equal(items.length, 2)
  assert.ok(items.every((i) => i.status === 'queued'))
})

test('scheduleItems is deterministic', () => {
  const items = collectQueue(drafts, null)
  const a = scheduleItems(items, { startDate: '2026-09-15', maxPerDay: 4, minPerDay: 2 })
  const b = scheduleItems(collectQueue(drafts, null), { startDate: '2026-09-15', maxPerDay: 4, minPerDay: 2 })
  assert.deepEqual(a, b)
  assert.ok(a.every((i) => i.scheduled_date))
})

test('schedule respects no-repeat within 30 days', () => {
  const items = collectQueue(drafts, null)
  const scheduled = scheduleItems(items, { startDate: '2026-09-15', maxPerDay: 4, minPerDay: 2 })
  const keys = scheduled.map((i) => i.repeat_key)
  assert.equal(new Set(keys).size, keys.length)
})

test('digest has platform sections and AEO', () => {
  const items = collectQueue(drafts, posts)
  const scheduled = scheduleItems(items, { startDate: '2026-09-15' })
  const digest = buildDigest(scheduled, '2026-09-15')
  assert.ok(digest.includes('## linkedin'))
  assert.ok(digest.includes('AEO snippets'))
})

test('AEO snippet is question-first', () => {
  const s = aoeSnippet({ url: 'u', title: 'MiCA rules', body: 'Here is a direct answer block that is long enough.' })
  assert.ok(s.startsWith('Q:'))
  assert.ok(s.includes('A:'))
})

test('scoreUrl orders blog higher than contact', () => {
  assert.ok(scoreUrl('https://x.com/blog/a') > scoreUrl('https://x.com/contact'))
})
