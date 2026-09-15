import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SIGNAL_TYPES, summarizeLeadforgeDigest } from './digest'

test('returns score 0 and the quiet headline when there are no rows', () => {
  // Arrange
  const rows: ReadonlyArray<{ event_type: string; count: number }> = []

  // Act
  const summary = summarizeLeadforgeDigest(rows)

  // Assert
  assert.equal(summary.score, 0)
  assert.equal(summary.headline, 'Lead intelligence — quiet day.')
  assert.equal(summary.bullets.length, 2)
})

test('scores only signal types and ignores cron noise', () => {
  // Arrange
  const rows = [
    { event_type: 'lead.qualified', count: 3 },
    { event_type: 'cron.fired', count: 9 },
  ]

  // Act
  const summary = summarizeLeadforgeDigest(rows)

  // Assert
  assert.equal(summary.score, 3)
  assert.deepEqual(summary.bullets, ['3× lead.qualified'])
  assert.equal(summary.headline, '3 LeadForge lead events in the last 24h.')
})

test('SIGNAL_TYPES is exactly the two lead event types', () => {
  assert.deepEqual([...SIGNAL_TYPES].sort(), ['lead.inbound', 'lead.qualified'])
})
