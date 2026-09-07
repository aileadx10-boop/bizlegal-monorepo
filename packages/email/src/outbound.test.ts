/**
 * Every invariant has a refusing test. Run from the repo root:
 *   apps/hub/node_modules/.bin/tsx --test packages/email/src/outbound.test.ts
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  assembleFooter,
  checkOutboundInvariants,
  isBlockedDomain,
  isRoleInbox,
  sendOutbound,
  shouldAutoPause,
  type OutboundCampaignState,
  type OutboundRecipient,
  type OutboundSendInput,
} from './outbound'
import { instantlySender, normaliseInstantlyEvent } from './senders/instantly'
import type { OutboundSender } from './senders/types'

const recipient: OutboundRecipient = {
  email: 'jane.doe@example-law.com',
  jurisdiction: 'US',
  lawfulBasis: 'us_can_spam',
  sourceUrl: 'https://example-law.com/contact',
  verifiedAt: '2026-09-07T00:00:00Z',
  verificationStatus: 'valid',
  firstName: 'Jane',
  companyName: 'Example Law',
}

const campaign: OutboundCampaignState = {
  id: 'c1',
  status: 'running',
  approvedBy: 'moses',
  providerCampaignRef: 'inst-123',
  dailyCapPerMailbox: 20,
  mailboxes: 2,
  sentToday: 0,
  touchesLast30d: 0,
  daysSinceLastTouch: null,
  cooldownDays: 5,
  maxTouchesPer30d: 3,
  trailing: { sends: 0, bounces: 0, complaints: 0 },
}

const good: OutboundSendInput = {
  recipient,
  campaign,
  subject: 'Two numbers from your invoice export',
  body: 'Hello Jane, one true specific about your firm.',
  postalAddress: 'DOR INNOVATIONS, 12 Example Street, Tel Aviv 6100000, Israel',
  unsubscribeUrl: 'https://u.example.com/x',
  senderDomain: 'bizlegal-notes.com',
  autosendEnabled: true,
}

test('every invariant holds → null', () => {
  assert.equal(checkOutboundInvariants(good), null)
})

const cases: ReadonlyArray<readonly [string, Partial<OutboundSendInput> | { recipient: Partial<OutboundRecipient> } | { campaign: Partial<OutboundCampaignState> }, string]> = [
  ['autosend switch off', { autosendEnabled: false }, 'autosend_off'],
  ['campaign not approved', { campaign: { approvedBy: null } }, 'campaign_unapproved'],
  ['campaign drafted', { campaign: { status: 'draft' } }, 'campaign_not_running'],
  ['campaign paused', { campaign: { status: 'paused' } }, 'campaign_not_running'],
  ['no provider campaign', { campaign: { providerCampaignRef: null } }, 'no_provider_campaign'],
  ['bounce 3% over trailing 200', { campaign: { trailing: { sends: 200, bounces: 6, complaints: 0 } } }, 'auto_paused'],
  ['complaint 0.5% over trailing 200', { campaign: { trailing: { sends: 200, bounces: 0, complaints: 1 } } }, 'auto_paused'],
  ['unverified address', { recipient: { verifiedAt: null } }, 'unverified'],
  ['catch-all address', { recipient: { verificationStatus: 'catch-all' } }, 'not_valid'],
  ['role inbox', { recipient: { email: 'info@example-law.com' } }, 'role_inbox'],
  ['government domain', { recipient: { email: 'jane@courts.state.gov' } }, 'blocked_domain'],
  ['competitor domain', { recipient: { email: 'jane@clio.com' } }, 'blocked_domain'],
  ['no lawful basis', { recipient: { lawfulBasis: null } }, 'no_lawful_basis'],
  ['phase-2 basis not enabled', { recipient: { lawfulBasis: 'ca_casl_published' } }, 'unsupported_basis'],
  ['no source url', { recipient: { sourceUrl: null } }, 'no_source_url'],
  ['daily cap reached', { campaign: { sentToday: 40 } }, 'daily_cap'],
  ['table cap above hard max still stops at 50/mailbox', { campaign: { dailyCapPerMailbox: 500, mailboxes: 1, sentToday: 50 } }, 'daily_cap'],
  ['touched 2 days ago', { campaign: { daysSinceLastTouch: 2 } }, 'cooldown'],
  ['three touches in 30 days', { campaign: { touchesLast30d: 3, daysSinceLastTouch: 10 } }, 'touch_cap'],
  ['no postal address', { postalAddress: null }, 'no_postal_address'],
  ['placeholder postal address', { postalAddress: '[postal address]' }, 'placeholder_address'],
  ['no unsubscribe', { unsubscribeUrl: null }, 'no_unsubscribe'],
  ['no sender domain', { senderDomain: null }, 'no_sender_domain'],
  ['malformed recipient', { recipient: { email: 'not-an-email' } }, 'invalid_recipient'],
]

for (const [name, patch, expected] of cases) {
  test(`refuses: ${name}`, () => {
    const p = patch as { recipient?: Partial<OutboundRecipient>; campaign?: Partial<OutboundCampaignState> } & Partial<OutboundSendInput>
    const input: OutboundSendInput = {
      ...good,
      ...p,
      recipient: { ...recipient, ...(p.recipient ?? {}) },
      campaign: { ...campaign, ...(p.campaign ?? {}) },
    }
    assert.equal(checkOutboundInvariants(input), expected)
  })
}

test('auto-pause needs a minimum sample before rates count', () => {
  assert.equal(shouldAutoPause({ sends: 10, bounces: 5, complaints: 0 }), false)
  assert.equal(shouldAutoPause({ sends: 200, bounces: 5, complaints: 0 }), true)
  assert.equal(shouldAutoPause({ sends: 200, bounces: 3, complaints: 0 }), false)
})

test('role inbox and blocked domain helpers', () => {
  assert.equal(isRoleInbox('office@firm.com'), true)
  assert.equal(isRoleInbox('jane@firm.com'), false)
  assert.equal(isBlockedDomain('a@b.gov.uk'), true)
  assert.equal(isBlockedDomain('a@sub.mycase.com'), true)
  assert.equal(isBlockedDomain('a@firm.com'), false)
})

test('footer carries the postal address, the not-advice line and STOP', () => {
  const f = assembleFooter('DOR INNOVATIONS, 12 Example Street', 'https://u/x')
  assert.match(f, /12 Example Street/)
  assert.match(f, /not legal advice/)
  assert.match(f, /STOP/)
  assert.match(f, /not a law firm/)
})

test('sendOutbound refuses without a sender and without a suppression store', async () => {
  const r1 = await sendOutbound(good, null, {})
  assert.equal(r1.ok, false)
  if (!r1.ok) assert.equal(r1.refusal, 'not_configured')
  const fake: OutboundSender = { name: 'fake', send: async () => ({ ok: true, id: 'm1' }) }
  const r2 = await sendOutbound(good, fake, { supabaseUrl: undefined, supabaseKey: undefined })
  assert.equal(r2.ok, false)
  if (!r2.ok) assert.equal(r2.refusal, 'not_configured')
})

test('sendOutbound refuses when the suppression store is unreachable (fail closed)', async () => {
  const fake: OutboundSender = { name: 'fake', send: async () => ({ ok: true, id: 'm1' }) }
  const originalFetch = globalThis.fetch
  globalThis.fetch = (async () => {
    throw new Error('down')
  }) as unknown as typeof fetch
  try {
    const r = await sendOutbound(good, fake, { supabaseUrl: 'https://supabase.invalid', supabaseKey: 'k' })
    assert.equal(r.ok, false)
    if (!r.ok) assert.equal(r.refusal, 'suppressed')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('sendOutbound appends the footer and hands the message to the sender', async () => {
  const seen: { value: { email: string; body: string; campaignRef: string } | null } = { value: null }
  const fake: OutboundSender = {
    name: 'fake',
    send: async (req) => {
      seen.value = { email: req.email, body: req.body, campaignRef: req.campaignRef }
      return { ok: true, id: 'm1' }
    },
  }
  const originalFetch = globalThis.fetch
  globalThis.fetch = (async () => new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } })) as unknown as typeof fetch
  try {
    const r = await sendOutbound(good, fake, { supabaseUrl: 'https://supabase.invalid', supabaseKey: 'k' })
    assert.equal(r.ok, true)
    assert.ok(seen.value)
    assert.equal(seen.value?.email, 'jane.doe@example-law.com')
    assert.equal(seen.value?.campaignRef, 'inst-123')
    assert.match(seen.value?.body ?? '', /STOP/)
    assert.match(seen.value?.body ?? '', /12 Example Street/)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('instantly adapter posts one lead with subject/body as custom variables', async () => {
  const captured: { value: { url: string; body: Record<string, unknown> } | null } = { value: null }
  const fetchImpl = (async (url: string | URL | Request, init?: RequestInit) => {
    captured.value = { url: String(url), body: JSON.parse(String(init?.body)) as Record<string, unknown> }
    return new Response(JSON.stringify({ id: 'lead_1' }), { status: 200, headers: { 'content-type': 'application/json' } })
  }) as unknown as typeof fetch
  const s = instantlySender({ apiKey: 'k', fetchImpl })
  const r = await s.send({ campaignRef: 'camp_1', email: 'a@b.com', subject: 'S', body: 'B' })
  assert.equal(r.ok, true)
  assert.match(captured.value?.url ?? '', /\/api\/v2\/leads$/)
  assert.equal(captured.value?.body.campaign, 'camp_1')
  assert.equal((captured.value?.body.custom_variables as Record<string, string>).subject, 'S')
})

test('instantly webhook normalisation', () => {
  const e = normaliseInstantlyEvent({ event_type: 'reply_received', lead_email: 'A@B.com', campaign_id: 'camp_1', reply_text: 'sure, send it' })
  assert.equal(e?.type, 'reply_received')
  assert.equal(e?.email, 'a@b.com')
  assert.equal(normaliseInstantlyEvent({ event_type: 'email_bounced', email: 'x@y.com' })?.type, 'email_bounced')
  assert.equal(normaliseInstantlyEvent({ event: 'lead_unsubscribed', email: 'x@y.com' })?.type, 'lead_unsubscribed')
  assert.equal(normaliseInstantlyEvent({}), null)
})
