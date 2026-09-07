/**
 * Hub-side outbound tests: the jurisdiction matrix, the cap math and the ICP
 * schema. The package-level invariants live in packages/email/src/outbound.test.ts.
 * Run from apps/hub: ./node_modules/.bin/tsx --test lib/outbound/outbound.test.ts
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkOutboundInvariants } from '@bizlegal/email'
import { CAP_DEFAULTS, capsFromRows, trailingStats } from './campaign'
import { PARTNER_BOOKKEEPERS_ICP, US_SOLO_REVENUE_ICP, parseIcp } from './icp'
import { basisFor, enabledJurisdictions } from './lawful-basis'

test('only the US is enabled in v1; every other jurisdiction yields no basis', () => {
  assert.deepEqual(enabledJurisdictions(), ['US'])
  assert.equal(basisFor('US'), 'us_can_spam')
  assert.equal(basisFor('CA'), null)
  assert.equal(basisFor('GB'), null)
  assert.equal(basisFor('IL'), null)
  assert.equal(basisFor(null), null)
})

test('caps: table values are read, the hard ceiling cannot be raised by a row', () => {
  const caps = capsFromRows([
    { name: 'outbound_daily_cap_per_mailbox', value_int: 500, value_text: null },
    { name: 'cooldown_days_between_touches', value_int: 7, value_text: null },
    { name: 'outbound_auto_pause_bounce_pct_x100', value_int: 300, value_text: null },
  ])
  assert.equal(caps.dailyCapPerMailbox, CAP_DEFAULTS.hardMaxPerMailbox)
  assert.equal(caps.cooldownDays, 7)
  assert.equal(caps.thresholds.bouncePct, 3)
  assert.equal(caps.maxTouchesPer30d, CAP_DEFAULTS.maxTouchesPer30d)
})

test('trailing stats count bounces and complaints from statuses', () => {
  assert.deepEqual(trailingStats([{ status: 'sent' }, { status: 'bounced' }, { status: 'complained' }, { status: 'replied' }]), { sends: 4, bounces: 1, complaints: 1 })
})

test('ICP schema validates the two seed campaigns and rejects nonsense', () => {
  assert.equal(US_SOLO_REVENUE_ICP.jurisdictions[0], 'US')
  assert.ok(US_SOLO_REVENUE_ICP.excludePracticeAreas.includes('personal injury'))
  assert.equal(PARTNER_BOOKKEEPERS_ICP.billingModel, 'mixed')
  const bad = parseIcp({ name: 'x', practiceAreas: [] })
  assert.equal(bad.ok, false)
})

test('a recipient outside the enabled matrix is refused end to end', () => {
  const refusal = checkOutboundInvariants({
    recipient: { email: 'jane@firm.ca', jurisdiction: 'CA', lawfulBasis: basisFor('CA'), sourceUrl: 'https://firm.ca/contact', verifiedAt: 'x', verificationStatus: 'valid' },
    campaign: {
      id: 'c',
      status: 'running',
      approvedBy: 'moses',
      providerCampaignRef: 'p',
      dailyCapPerMailbox: 20,
      mailboxes: 1,
      sentToday: 0,
      touchesLast30d: 0,
      daysSinceLastTouch: null,
      cooldownDays: 5,
      maxTouchesPer30d: 3,
      trailing: { sends: 0, bounces: 0, complaints: 0 },
    },
    subject: 's',
    body: 'b',
    postalAddress: 'DOR INNOVATIONS, 12 Example Street, Tel Aviv',
    unsubscribeUrl: 'https://u/x',
    senderDomain: 'd.com',
    autosendEnabled: true,
  })
  assert.equal(refusal, 'no_lawful_basis')
})
