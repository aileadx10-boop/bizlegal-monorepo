import { test } from 'node:test'
import assert from 'node:assert/strict'

import { canToggleTask, canManageRoom } from '../lib/rooms/access'
import { hashToken, mintToken, isExpired, tokenExpiryFor, encryptToken, decryptToken } from '../lib/rooms/tokens'
import { computeDigests, applySendCap, alertKey, crossingPriority } from '../lib/alerts/compute'
import { t, taskLabel, dirFor, langFor } from '../lib/i18n'
import { fmtDate, fmtMoney, fmtDaysLeft } from '../lib/i18n/format'
import { en } from '../lib/i18n/en'
import { TEMPLATES } from '@bizlegal/closing-engine'
import { he } from '../lib/i18n/he'
import { getServiceClient } from '../lib/db'
import type { PartyRow, TaskRow } from '../lib/db'
import { CURRENCIES, ROOM_SETUP, optionFor, railAllowed } from '../lib/checkout/rails'

// ── Access rules ────────────────────────────────────────────────────────────

/** Management is a flag, never a role name — templates own the vocabulary. */
const actor = (role: string, can_manage = false) => ({ role, can_manage })

test('a party may tick their own tasks and nobody else does it for them', () => {
  assert.equal(canToggleTask(actor('buyer'), 'buyer'), true)
  assert.equal(canToggleTask(actor('buyer'), 'seller_lawyer'), false)
  assert.equal(canToggleTask(actor('seller'), 'buyer'), false)
})

test('whoever runs the room may tick anything and manage it', () => {
  const manager = actor('broker', true)
  assert.equal(canToggleTask(manager, 'seller_lawyer'), true)
  assert.equal(canManageRoom(manager), true)
  assert.equal(canManageRoom(actor('buyer')), false)
})

test('management follows the flag, not the word "broker"', () => {
  // The US template calls this person 'agent'. Keying off the role name gave
  // the person who opened and paid for the room a 403 on their own room.
  assert.equal(canManageRoom(actor('agent', true)), true)
  assert.equal(canToggleTask(actor('agent', true), 'title'), true)
  // And a party who merely calls themselves 'broker' manages nothing.
  assert.equal(canManageRoom(actor('broker', false)), false)
})

// ── Tokens ──────────────────────────────────────────────────────────────────

test('the stored hash is not the token', () => {
  const token = mintToken()
  const hash = hashToken(token)
  assert.notEqual(hash, token)
  assert.equal(hash, hashToken(token)) // stable
  assert.equal(hash.length, 64)
  assert.ok(token.length >= 30)
})

test('two tokens never collide', () => {
  const seen = new Set(Array.from({ length: 200 }, () => mintToken()))
  assert.equal(seen.size, 200)
})

test('expiry is 90 days after delivery and null when there is no delivery date', () => {
  const expiry = tokenExpiryFor('2026-09-20')
  assert.ok(expiry?.startsWith('2026-12-19'))
  assert.equal(tokenExpiryFor(null), null)
  assert.equal(isExpired('2026-09-01T00:00:00.000Z', new Date('2026-09-20T00:00:00Z')), true)
  assert.equal(isExpired('2026-10-01T00:00:00.000Z', new Date('2026-09-20T00:00:00Z')), false)
  assert.equal(isExpired(null), false)
})

test('the cipher round-trips under a key and stays silent without one', () => {
  const token = mintToken()
  const key = 'a'.repeat(64)

  process.env.DEAL44_TOKEN_KEY = key
  const cipher = encryptToken(token)
  assert.ok(cipher)
  assert.notEqual(cipher, token)
  assert.equal(decryptToken(cipher), token)

  // A wrong key must read as "no link", never as a usable one.
  process.env.DEAL44_TOKEN_KEY = 'b'.repeat(64)
  assert.equal(decryptToken(cipher), null)

  delete process.env.DEAL44_TOKEN_KEY
  assert.equal(encryptToken(token), null)
  assert.equal(decryptToken(cipher), null)
})

// ── Alert computation ───────────────────────────────────────────────────────

const party = (over: Partial<PartyRow> = {}): PartyRow => ({
  id: 'p1',
  deal_id: 'd1',
  role: 'buyer',
  display_name: 'Buyer',
  email: 'buyer@example.com',
  locale: 'he-IL',
  token_hash: 'x',
  token_cipher: null,
  token_expires_at: null,
  alerts_enabled: true,
  can_manage: false,
  invited_at: null,
  last_seen_at: null,
  ...over,
})

const task = (over: Partial<TaskRow> = {}): TaskRow => ({
  id: 't1',
  deal_id: 'd1',
  key: 'purchase_tax_declaration',
  label_key: 'task.il.purchase_tax_declaration',
  label_text: null,
  phase: 'tax',
  assignee_role: 'buyer',
  anchor: 'signing',
  offset_days: 30,
  day_type: 'calendar',
  due_date: '2026-09-25',
  statutory: true,
  source: 'statutory',
  provenance: null,
  no_date_reason: null,
  legal_review: true,
  origin: 'template',
  status: 'open',
  completed_at: null,
  completed_by: null,
  sort_order: 0,
  ...over,
})

const TODAY = new Date('2026-09-20T06:00:00.000Z')

test('a deadline inside a tier produces one crossing', () => {
  const digests = computeDigests([task()], [party()], new Set(), TODAY)
  assert.equal(digests.length, 1)
  assert.equal(digests[0]?.crossings.length, 1)
  assert.equal(digests[0]?.crossings[0]?.tier, 7) // 5 days out
  assert.equal(digests[0]?.crossings[0]?.isOwn, true)
})

test('a crossing already in the ledger is never announced twice', () => {
  const sent = new Set([alertKey('t1', 'p1', 7)])
  assert.equal(computeDigests([task()], [party()], sent, TODAY).length, 0)
})

test('a party who switched reminders off is not emailed', () => {
  assert.equal(computeDigests([task()], [party({ alerts_enabled: false })], new Set(), TODAY).length, 0)
})

test('a completed task raises nothing', () => {
  assert.equal(computeDigests([task({ status: 'done' })], [party()], new Set(), TODAY).length, 0)
})

test('a far-off deadline is not yet worth an email', () => {
  assert.equal(computeDigests([task({ due_date: '2026-12-01' })], [party()], new Set(), TODAY).length, 0)
})

test('an overdue task is flagged once, as overdue', () => {
  const digests = computeDigests([task({ due_date: '2026-09-01' })], [party()], new Set(), TODAY)
  assert.equal(digests[0]?.crossings[0]?.tier, -1)
  assert.ok((digests[0]?.crossings[0]?.daysUntil ?? 0) < 0)
})

test('the broker sees another party as their own concern, a party does not', () => {
  const t2 = task({ assignee_role: 'seller_lawyer' })
  const asBroker = computeDigests([t2], [party({ role: 'broker', can_manage: true })], new Set(), TODAY)
  const asBuyer = computeDigests([t2], [party({ role: 'buyer' })], new Set(), TODAY)
  assert.equal(asBroker[0]?.crossings[0]?.isOwn, true)
  assert.equal(asBuyer[0]?.crossings[0]?.isOwn, false)
})

test('the send cap keeps the most urgent and drops the rest', () => {
  const urgent = computeDigests([task({ due_date: '2026-09-20' })], [party({ id: 'p1' })], new Set(), TODAY)
  const later = computeDigests(
    [task({ id: 't2', due_date: '2026-10-15' })],
    [party({ id: 'p2', email: 'b@example.com' })],
    new Set(),
    TODAY,
  )
  const capped = applySendCap([...later, ...urgent], 1)
  assert.equal(capped.length, 1)
  assert.equal(capped[0]?.party.id, 'p1')
  assert.equal(applySendCap([...urgent], 0).length, 0)
})

test('overdue is ranked below today when the budget is tight', () => {
  assert.ok(crossingPriority(0) < crossingPriority(-1))
  assert.ok(crossingPriority(1) < crossingPriority(7))
})

// ── i18n ────────────────────────────────────────────────────────────────────

test('every English key has a Hebrew string', () => {
  const missing = Object.keys(en).filter((k) => !(k in he) || !he[k as keyof typeof he])
  assert.deepEqual(missing, [])
})

test('direction and lang follow the locale', () => {
  assert.equal(dirFor('he-IL'), 'rtl')
  assert.equal(dirFor('en-US'), 'ltr')
  assert.equal(langFor('he-IL'), 'he')
})

test('placeholders are interpolated', () => {
  assert.equal(t('en-US', 'room.tasks_done', { done: 3, total: 9 }), '3 of 9 done')
  assert.ok(t('he-IL', 'room.tasks_done', { done: 3, total: 9 }).includes('3'))
})

test('an Israeli party sees shekels and Hebrew dates, not dollars', () => {
  const money = fmtMoney('he-IL', 250000, 'ILS')
  assert.ok(money.includes('₪'), money)
  assert.ok(!money.includes('$'), money)
  assert.ok(fmtMoney('en-US', 250000, 'USD').includes('$'))

  const hebrewDate = fmtDate('he-IL', '2026-09-20')
  assert.ok(hebrewDate.length > 0)
  assert.notEqual(hebrewDate, fmtDate('en-US', '2026-09-20'))
})

test('a blank date renders blank rather than Invalid Date', () => {
  assert.equal(fmtDate('he-IL', null), '')
  assert.equal(fmtDate('he-IL', 'nonsense'), '')
})

test('days left never renders a bare negative number', () => {
  assert.equal(fmtDaysLeft('en-US', 0), 'today')
  assert.equal(fmtDaysLeft('en-US', 1), 'tomorrow')
  assert.equal(fmtDaysLeft('en-US', 5), 'in 5 days')
  assert.equal(fmtDaysLeft('en-US', -3), '3 days overdue')
})

test('a template task renders from its key, a manual task from its text', () => {
  assert.equal(taskLabel('en-US', 'task.il.purchase_tax_payment', null), 'Purchase tax payment')
  assert.equal(taskLabel('he-IL', null, 'משהו ידני'), 'משהו ידני')
})

// ── Next's fetch cache (a real bug, caught end-to-end 2026-09-07) ────────────

test('the Supabase client opts out of Next fetch caching', async () => {
  // Next's App Router patches global fetch and caches GET responses. supabase-js
  // reads through fetch, so without cache:'no-store' the alerts cron serves
  // yesterday's checklist: observed returning 1 open task while the database
  // held 4. `dynamic = 'force-dynamic'` does not cover this — it governs route
  // rendering, not the individual fetch.
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_SERVICE_KEY = 'test-key'

  const seen: Array<RequestInit | undefined> = []
  const realFetch = globalThis.fetch
  globalThis.fetch = (async (_input: unknown, init?: RequestInit) => {
    seen.push(init)
    return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } })
  }) as typeof fetch

  try {
    await getServiceClient().from('deal_tasks').select('id').limit(1)
  } catch {
    // a network-shaped failure is fine; we only care what init was passed
  } finally {
    globalThis.fetch = realFetch
  }

  assert.ok(seen.length > 0, 'the client should have issued a request')
  assert.equal((seen[0] as { cache?: string } | undefined)?.cache, 'no-store')
})

test('every role and phase in every shipped template has a label', () => {
  // The US template speaks a different vocabulary from the Israeli one — roles
  // agent/lender/title, phases diligence/closing/post_closing. Without these a
  // buyer opening a US room reads "role.agent" where a name should be.
  const missing: string[] = []
  for (const template of Object.values(TEMPLATES)) {
    for (const role of template.roles) if (!(`role.${role}` in en)) missing.push(`role.${role}`)
    for (const phase of template.phases) if (!(`phase.${phase}` in en)) missing.push(`phase.${phase}`)
  }
  assert.deepEqual([...new Set(missing)], [])
})

// ── Checkout rails ──────────────────────────────────────────────────────────

test('a shekel room is never offered on the card rail', () => {
  // PayPal cannot RECEIVE shekels. A card button here would open a checkout
  // that takes the money and then cannot settle it, which is precisely the
  // failure the hub's own 503 exists to prevent.
  assert.equal(railAllowed('ILS', 'card'), false)
  assert.equal(railAllowed('ILS', 'crypto'), true)
  assert.equal(railAllowed('USD', 'card'), true)
  assert.equal(railAllowed('USD', 'crypto'), true)
})

test('the rail check fails closed on anything it does not recognise', () => {
  assert.equal(railAllowed('EUR', 'card'), false)
  assert.equal(railAllowed('ILS', 'wire'), false)
  assert.equal(railAllowed(undefined, undefined), false)
})

test('the displayed prices mirror the payment registry', () => {
  // These two numbers are a display mirror of packages/payment/src/products.ts
  // (this app does not depend on that package). The customer is charged from
  // the registry, so a drift here quotes one price and charges another.
  // ₪2,500, and its FX twin at 3.68 ILS/USD recorded 2026-09-15 → $679.
  assert.equal(ROOM_SETUP.ILS.amountMinorUnits, 250_000)
  assert.equal(ROOM_SETUP.USD.amountMinorUnits, 67_900)
  assert.equal(ROOM_SETUP.ILS.productId, 'deal44_room_setup_ils')
  assert.equal(ROOM_SETUP.USD.productId, 'deal44_room_setup_usd')
  for (const code of CURRENCIES) assert.equal(optionFor(code).currency, code)
})
