/**
 * The paid gate.
 *
 * LeaseParse sells one thing — a $59 lease abstract — and until 2026-09-15 both
 * /api/leases/upload-url and /api/leases/ingest produced it for anyone who
 * asked. This module is the entitlement check those routes now run *before* any
 * work happens: no storage write, no PDF download, no LLM call, no email.
 *
 * Where a credit comes from: the hub's payment webhooks call
 * apps/hub/lib/payments/leaseparse-grant.ts on payment.confirmed, which inserts
 * one `leaseparse_credits` row per paid order (unique on order_id, so a
 * replayed IPN cannot grant two abstracts).
 *
 * Credit lifecycle:
 *   unclaimed → claimed (bound to a lease row when the upload URL is issued)
 *             → consumed (the abstract was delivered; never usable again)
 *
 * A 'claimed' credit still passes the gate so a failed upload can be retried
 * against the same lease row. Only a *delivered* abstract consumes it, which is
 * what makes one purchase equal exactly one abstract.
 *
 * Two independent switches guard this surface:
 *   LEASEPARSE_CHECKOUT_LIVE off → 503 checkout_dark (fail-closed; the default)
 *   no credit for the caller     → 402 payment_required
 * Neither ever returns the deliverable.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { isCheckoutLive, CHECKOUT_GATE_ENV } from './checkout'

export const PRODUCT_ID = 'leaseparse_abstract_59'

/** Where a caller without a credit is sent to buy one. */
export const CHECKOUT_URL = 'https://leaseparse.bizlegal-ai.com/#pricing'
/** The machine hint: POST here to open a hub-hosted checkout for this SKU. */
export const CHECKOUT_START_PATH = '/api/parse/start'

export type CreditStatus = 'unclaimed' | 'claimed' | 'consumed'

/** The gate only ever selects the columns it needs to decide. */
export interface LeaseCredit {
  readonly id: string
  readonly email: string
  readonly order_id: string
  readonly status: CreditStatus
  readonly lease_id: string | null
}

export interface GateDenied {
  readonly ok: false
  readonly status: number
  readonly body: Record<string, unknown>
}

export interface GateAllowed {
  readonly ok: true
  readonly credit: LeaseCredit
}

export type CreditGate = GateAllowed | GateDenied

const CREDIT_COLUMNS = 'id, email, order_id, status, lease_id'
/** 'unclaimed' first, then 'claimed' (a retry) — never 'consumed'. */
const ACTIVE_STATUSES: readonly CreditStatus[] = ['unclaimed', 'claimed']

export function normaliseEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

/** `?order=` / body `order_id`, trimmed. Empty string means "not supplied". */
export function normaliseOrderId(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, 128) : ''
}

export function checkoutDark(): GateDenied {
  return {
    ok: false,
    status: 503,
    body: {
      ok: false,
      error: 'checkout_dark',
      gate: CHECKOUT_GATE_ENV,
      detail:
        'LeaseParse checkout is not live yet, so no order can exist and no abstract is produced. Nothing is free here — the gate is off, not open.',
      checkout: CHECKOUT_URL,
    },
  }
}

export function paymentRequired(detail: string): GateDenied {
  return {
    ok: false,
    status: 402,
    body: {
      ok: false,
      error: 'payment_required',
      product_id: PRODUCT_ID,
      checkout: CHECKOUT_URL,
      checkout_start: CHECKOUT_START_PATH,
      detail,
    },
  }
}

function pickActive(rows: readonly LeaseCredit[]): LeaseCredit | null {
  return rows.find((row) => row.status === 'unclaimed') ?? rows.find((row) => row.status === 'claimed') ?? null
}

export interface FindCreditInput {
  /** Buyer email. Required when no order id is supplied. */
  readonly email?: string
  /** Hub payment_orders id, from `?order=` or the lease row's paid_order_id. */
  readonly orderId?: string
}

/**
 * Resolve the credit a caller is entitled to use, or null.
 *
 * An order id alone is enough (it is an unguessable uuid and behaves as a
 * bearer token), but when an email is *also* supplied the two must agree —
 * otherwise a mismatched pair is treated as no credit at all.
 */
export async function findActiveCredit(
  db: SupabaseClient,
  input: FindCreditInput,
): Promise<LeaseCredit | null> {
  const email = normaliseEmail(input.email)
  const orderId = normaliseOrderId(input.orderId)
  if (!email && !orderId) return null

  let query = db
    .from('leaseparse_credits')
    .select(CREDIT_COLUMNS)
    .in('status', ACTIVE_STATUSES as string[])

  query = orderId ? query.eq('order_id', orderId) : query.eq('email', email)

  const { data, error } = await query.order('created_at', { ascending: true }).limit(10)

  if (error) {
    // Fail closed: an unreadable entitlement table is not an entitlement.
    console.warn('[leaseparse/credits] lookup failed', error.message)
    return null
  }

  const rows = (data ?? []) as LeaseCredit[]
  const scoped = orderId && email ? rows.filter((row) => normaliseEmail(row.email) === email) : rows
  return pickActive(scoped)
}

/**
 * The gate itself: the flag, then the credit. Callers return `gate.body` with
 * `gate.status` unchanged — the denial shapes are part of the public contract.
 */
export async function requireLeaseCredit(
  db: SupabaseClient,
  input: FindCreditInput,
): Promise<CreditGate> {
  if (!isCheckoutLive()) return checkoutDark()

  const credit = await findActiveCredit(db, input)
  if (!credit) {
    return paymentRequired(
      normaliseOrderId(input.orderId)
        ? 'No unused LeaseParse abstract is attached to that order. Each purchase covers exactly one lease.'
        : 'No paid LeaseParse abstract is attached to this email. Buy one, then return with the link in your receipt.',
    )
  }
  return { ok: true, credit }
}

/** Bind a credit to the lease row it paid for. Safe to re-run on a retry. */
export async function claimLeaseCredit(
  db: SupabaseClient,
  creditId: string,
  leaseId: string,
): Promise<void> {
  const { error } = await db
    .from('leaseparse_credits')
    .update({ status: 'claimed', lease_id: leaseId, claimed_at: new Date().toISOString() })
    .eq('id', creditId)
    .neq('status', 'consumed')
  if (error) console.warn('[leaseparse/credits] claim failed', error.message)
}

/**
 * Spend the credit — called once the abstract has actually been produced.
 * `.neq('status', 'consumed')` keeps a double-delivery from resetting claimed_at.
 */
export async function consumeLeaseCredit(
  db: SupabaseClient,
  creditId: string,
  leaseId: string,
): Promise<void> {
  const { error } = await db
    .from('leaseparse_credits')
    .update({ status: 'consumed', lease_id: leaseId, claimed_at: new Date().toISOString() })
    .eq('id', creditId)
    .neq('status', 'consumed')
  if (error) console.warn('[leaseparse/credits] consume failed', error.message)
}
